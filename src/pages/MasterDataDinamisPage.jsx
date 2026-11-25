import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
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
  ChevronDown
} from 'lucide-react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppModal from '../components/app/AppModal'
import AppTabs from '../components/app/AppTabs'
import { StandardSubTabs } from '../components/app/StandardSubTabs'
import HeroUiHeader from '../components/ui/HeroUiHeader'
import KpiStatCard from '../components/app/KpiStatCard'
import {
  businessOptionService
} from '../services/businessOptionService'
import {
  codeGeneratorService
} from '../services/codeGeneratorService'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  hasRoleLevel,
  ROLE_LEVELS,
  isFoundationUser
} from '../auth/portalResolver'
import {
  SmartScrollFab
} from '../components/common'
import Swal from '../components/ui/compat/swal-heroui'
import AppDataTable from '../components/app/AppDataTable'
import MobileDataCard from '../components/app/MobileDataCard'
import { SquircleActionButton } from '../components/master-data'
import AppBadge from '../components/app/AppBadge'

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
 className={`h-9.5 w-full flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
 isOpen
 ? 'border-slate-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white shadow-xs'
 : hasValue
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold'
 : 'border-emerald-300 dark:border-emerald-700/80 bg-white text-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-600/80'
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
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} min-w-[200px] overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40`}
 >
 {searchable && options.length > 5 && (
 <div className="p-1.5 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80/60 mb-1">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari..."
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
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

  // ── Tab 1 Columns (Opsi Bisnis) ──
  const optionColumns = useMemo(() => [
    {
      key: 'no',
      label: 'No',
      width: 'w-12',
      align: 'center',
      render: (_, i) => (
        <span className="font-medium text-slate-400">{i + 1}</span>
      ),
    },
    {
      key: 'group',
      label: 'Grup / Kategori',
      render: (r) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono">
          {r?.group}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Nama Pilihan',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-100">{r?.name}</div>
          {r?.description && (
            <p className="text-xs text-slate-400 font-normal">{r?.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Kode Kanonik',
      render: (r) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{r?.code}</span>
      ),
    },
    {
      key: 'order',
      label: 'Urutan',
      align: 'center',
      width: 'w-20',
      render: (r) => (
        <span className="font-bold text-slate-600 dark:text-slate-300">{r?.order ?? 0}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      align: 'center',
      width: 'w-28',
      render: (r) => canManage ? (
        <button
          type="button"
          onClick={() => handleToggleOptionStatus(r)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            r?.is_active
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-sky-950/60 dark:text-sky-300'
          }`}
        >
          {r?.is_active ? (
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
            r?.is_active
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
          }`}
        >
          {r?.is_active ? (
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
      ),
    },
  ], [canManage])

  // ── Tab 2 Columns (Generator Configs) ──
  const generatorColumns = useMemo(() => [
    {
      key: 'entity_type',
      label: 'Entitas Bisnis',
      render: (cfg) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-100">
            {ENTITY_TYPE_LABELS[cfg?.entity_type] || cfg?.entity_type}
          </span>
          <span className="block font-mono text-xs text-slate-400 font-normal">
            {cfg?.entity_type}
          </span>
        </div>
      ),
    },
    {
      key: 'prefix',
      label: 'Prefix',
      render: (cfg) => (
        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
          {cfg?.prefix || '-'}
        </span>
      ),
    },
    {
      key: 'separator',
      label: 'Pemisah',
      align: 'center',
      render: (cfg) => (
        <span className="font-mono text-slate-600 dark:text-slate-300">
          {cfg?.separator || '-'}
        </span>
      ),
    },
    {
      key: 'padding_length',
      label: 'Digit (Padding)',
      align: 'center',
      render: (cfg) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {cfg?.padding_length}
        </span>
      ),
    },
    {
      key: 'format_pattern',
      label: 'Pola Format',
      render: (cfg) => (
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
          {cfg?.format_pattern}
        </span>
      ),
    },
    {
      key: 'current_sequence',
      label: 'Sequence',
      align: 'center',
      render: (cfg) => (
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {cfg?.current_sequence ?? 0}
        </span>
      ),
    },
  ], [])

 return (
 <div className="space-y-6 pb-12">
 {/* ── Breadcrumb ── */}
 <AppBreadcrumb
 items={[
 { label: 'Pengaturan', to: '/dashboard/pengaturan' },
 { label: 'Data Dinamis & Generator Kode' },
 ]}
 />

  {/* ── Canonical HeroUiHeader ── */}
  <HeroUiHeader
    title="Master Opsi Bisnis & Generator Kode"
    subtitle="Pusat pengelolaan pilihan dropdown dinamis, kategori bisnis terkelola, dan engine penomoran resmi Dareliman Edu."
    icon={Sliders}
    roleTag="Sistem & Master Data"
    badge="Opsi Bisnis"
  />

  {/* KPI Stats Grid Harmonized */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
    <KpiStatCard
      icon={Layers}
      title="Total Opsi Bisnis"
      value={options.length}
      description="Pilihan dropdown terdaftar pada sistem"
      badge="Total"
      tone="emerald"
    />
    <KpiStatCard
      icon={CheckCircle2}
      title="Opsi Aktif"
      value={options.filter((o) => o.is_active).length}
      description="Aktif ditampilkan pada pilihan form"
      badge="Aktif"
      tone="sky"
    />
    <KpiStatCard
      icon={XCircle}
      title="Opsi Nonaktif"
      value={options.filter((o) => !o.is_active).length}
      description="Dinonaktifkan / diarsipkan"
      badge="Nonaktif"
      tone="rose"
    />
  </div>

  {/* ── Tab Selector Buttons ── */}
  <div className="my-6">
    <StandardSubTabs
      tabs={[
        { id: "options", label: "Opsi & Dropdown", icon: Tag },
        { id: "generator", label: "Generator Kode", icon: FileCode },
      ]}
      activeTab={activeTab}
      onChange={setActiveTab}
    />
  </div>

 {/* ── TAB 1: BUSINESS OPTIONS CONTENT ── */}
      {/* ── TAB 1: BUSINESS OPTIONS CONTENT ── */}
      {activeTab === 'options' && (
        <AppDataTable
          id="tabel-opsi-bisnis"
          title="Katalog Opsi Bisnis Terkelola"
          subtitle="Seluruh dropdown dan pilihan form akan mengambil data terbaru langsung dari tabel ini."
          icon={Tag}
          countLabel="opsi"
          actions={
            canManage ? (
              <SquircleActionButton
                variant="emerald"
                icon={Plus}
                label="Tambah Opsi"
                onClick={handleOpenAddOption}
              />
            ) : null
          }
          search={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          searchPlaceholder="Cari nama opsi atau kode kanonik..."
          filters={
            <div className="w-full sm:w-64">
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
          }
          columns={optionColumns}
          data={options}
          isLoading={isLoadingOptions}
          emptyTitle="Belum Ada Opsi Bisnis"
          emptyDescription="Belum ada opsi bisnis yang cocok dengan filter atau kata kunci."
          onEdit={canManage ? (r) => handleOpenEditOption(r) : undefined}
          onDelete={canManage ? (r) => handleDeleteOption(r) : undefined}
          renderMobileCard={(opt) => (
            <MobileDataCard
              key={opt.id}
              title={opt.name}
              subtitle={opt.code}
              badge={opt.is_active ? 'Aktif' : 'Nonaktif'}
              badgeVariant={opt.is_active ? 'success' : 'neutral'}
              fields={[
                { label: 'Kategori / Grup', value: opt.group, icon: Tag },
                { label: 'Urutan', value: String(opt.order ?? 0), icon: Sliders },
                ...(opt.description ? [{ label: 'Deskripsi', value: opt.description, icon: FileCode }] : []),
              ]}
              onEdit={canManage ? () => handleOpenEditOption(opt) : undefined}
              onDelete={canManage ? () => handleDeleteOption(opt) : undefined}
            />
          )}
        />
      )}
 {activeTab === 'generator' && (
 <div className="space-y-6">
 {/* Live Tester Simulator Card */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:bg-[#1B2433]">
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
 />
 </div>

 <div>
 <button
 type="button"
 onClick={handleRunLiveTest}
 disabled={isTestingCode}
 className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 border border-emerald-200/80 dark:border-emerald-800/60 h-9"
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
 <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
 <div>
 <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
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
        {/* Configs Table */}
        <AppDataTable
          id="tabel-konfigurasi-generator"
          title="Aturan & Pola Format Generator Kode"
          subtitle="Pola format mendukung token: {PREFIX}, {SEPARATOR}, {YEAR}, {UNIT_CODE}, {EXTRA}, {SEQUENCE}."
          icon={Settings2}
          countLabel="aturan"
          columns={generatorColumns}
          data={generatorConfigs}
          isLoading={isLoadingConfigs}
          emptyTitle="Belum Ada Konfigurasi Kustom"
          emptyDescription="Belum ada konfigurasi generator kustom (menggunakan default sistem)."
          onEdit={canManage ? (r) => handleOpenEditConfig(r) : undefined}
          renderMobileCard={(cfg) => (
            <MobileDataCard
              key={cfg.id}
              title={ENTITY_TYPE_LABELS[cfg.entity_type] || cfg.entity_type}
              subtitle={`Prefix: ${cfg.prefix || '-'} · Pola: ${cfg.format_pattern}`}
              badge={`Seq: ${cfg.current_sequence ?? 0}`}
              badgeVariant="neutral"
              fields={[
                { label: 'Entitas', value: cfg.entity_type, icon: Tag },
                { label: 'Pemisah', value: cfg.separator || '-', icon: Sliders },
                { label: 'Padding', value: `${cfg.padding_length} digit`, icon: Hash },
              ]}
              onEdit={canManage ? () => handleOpenEditConfig(cfg) : undefined}
            />
          )}
        />
      </div>
      )}
 {/* ── MODAL FORM OPSI BISNIS ── */}
      <AppModal
        isOpen={isOptionModalOpen}
        onClose={() => !isSubmittingOption && setIsOptionModalOpen(false)}
        title={editingOption ? 'Ubah Opsi Bisnis' : 'Tambah Opsi Bisnis Baru'}
        badge={editingOption ? 'Perbarui' : 'Opsi Baru'}
        description="Kelola daftar pilihan dropdown dan parameter bisnis terpusat."
        icon={Sliders}
        maxWidth="max-w-lg"
        disableBackdropClose={isSubmittingOption}
        hideCloseButton={isSubmittingOption}
        footer={
          <>
            <button
              type="button"
              disabled={isSubmittingOption}
              onClick={() => setIsOptionModalOpen(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              form="dinamis-option-form"
              disabled={isSubmittingOption}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSubmittingOption ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSubmittingOption ? 'Menyimpan...' : 'Simpan Opsi'}</span>
            </button>
          </>
        }
      >
        <form id="dinamis-option-form" onSubmit={handleSaveOption} className="space-y-4">
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
 />
 </div>

 <div className="flex items-center gap-2 pt-2">
 <input
 type="checkbox"
 id="opt_active"
 checked={optionForm.is_active}
 onChange={(e) => setOptionForm(prev => ({ ...prev, is_active: e.target.checked }))}
 className="h-4 w-4 rounded border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 focus:ring-emerald-500"
 />
 <label htmlFor="opt_active" className="text-xs font-bold text-slate-700 dark:text-slate-300">
 Opsi Aktif (Dapat dipilih di form dan dropdown)
 </label>
 </div>

        </form>
      </AppModal>

      <AppModal
        isOpen={isConfigModalOpen}
        onClose={() => !isSubmittingConfig && setIsConfigModalOpen(false)}
        title="Ubah Pola Generator Kode"
        badge="Konfigurasi"
        description="Sesuaikan format awalan dan pola penomoran otomatis entitas bisnis."
        icon={Sliders}
        maxWidth="max-w-lg"
        disableBackdropClose={isSubmittingConfig}
        hideCloseButton={isSubmittingConfig}
        footer={
          <>
            <button
              type="button"
              disabled={isSubmittingConfig}
              onClick={() => setIsConfigModalOpen(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              form="dinamis-config-form"
              disabled={isSubmittingConfig}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSubmittingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSubmittingConfig ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
            </button>
          </>
        }
      >
        <form id="dinamis-config-form" onSubmit={handleSaveConfig} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Entitas Bisnis
 </label>
 <input
 type="text"
 value={ENTITY_TYPE_LABELS[configForm.entity_type] || configForm.entity_type}
 disabled
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold"
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
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
 className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
 required
 />
 </div>

        </form>
      </AppModal>

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab
 targetId={activeTab === 'options' ? 'tabel-opsi-bisnis' : 'tabel-konfigurasi-generator'}
 downTooltip={activeTab === 'options' ? 'Langsung ke Tabel Opsi' : 'Langsung ke Tabel Aturan'}
 />
 </div>
 )
}
