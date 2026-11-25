import ActionDropdown from '../components/app/ActionDropdown'
import { HeroUiHeader } from '../components/ui/HeroUiHeader'
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Target,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Sparkles,
  School,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  X,
  Award,
  ChevronRight,
  ChevronDown,
  Check,
  ShieldCheck
} from 'lucide-react'
import {
  useNavigate
} from 'react-router-dom'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppModal from '../components/app/AppModal'
import PageToolbarActions from '../components/app/PageToolbarActions'
import AppDataTable from '../components/app/AppDataTable'
import { SquircleActionButton } from '../components/master-data'
import {
  Badge
} from '@/components/ui/badge'
import {
  Button
} from '@/components/ui/button'
import {
  Pagination
} from '@/components/ui/pagination'
import {
  tahfizhTargetService
} from '../services/tahfizhTargetService'
import useDebounce from '../hooks/useDebounce'
import {
  useToast
} from '../components/app'
import {
  Input as UiInput
} from '../components/ui/input'
import {
  TextArea as UiTextArea
} from '../components/ui/text-area'

const PROGRAM_LABELS = {
 all: { label: 'Semua Program', color: 'gray' },
 fullday: { label: 'Full Day School', color: 'emerald' },
 boarding: { label: 'Pesantren (Boarding)', color: 'blue' },
 regular: { label: 'Reguler', color: 'purple' },
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
 className={`h-9 w-full flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${disabled
 ? 'border-emerald-200/80 bg-slate-100 text-slate-400 dark:border-emerald-800/60 dark:bg-slate-800/60 cursor-not-allowed'
 : isOpen
 ? 'border-[#059669] bg-white ring-2 ring-[#059669]/15 dark:border-[#10B981] dark:bg-[#111827] dark:ring-[#10B981]/20 text-slate-900 dark:text-white shadow-xs'
 : value !== '' && value !== undefined && value !== null && value !== 'all'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-100 shadow-xs'
 : 'border-emerald-200/80 bg-white text-slate-800 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-emerald-600/80'
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
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95`}
 >
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="pointer-events-none size-3.5 absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <UiInput
 type="text"
 size="sm"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari..."
 className="w-full rounded-lg border-emerald-200/80 bg-slate-50/60 pl-8 pr-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
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
 className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
 ? 'bg-emerald-500/15 text-emerald-900 font-bold dark:bg-emerald-500/20 dark:text-emerald-300'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
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

// ── HEROUI MODAL FORM SELECT DROPDOWN COMPONENT ──
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
 <div className={`relative w-full ${className}`} ref={containerRef}>
 {label && (
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
 ? 'border-[#059669] bg-white ring-4 ring-[#059669]/12 dark:border-[#10B981] dark:bg-slate-900 dark:ring-[#10B981]/20 text-slate-800 dark:text-slate-100 shadow-sm'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-white hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-700/80 dark:bg-slate-800 dark:hover:border-emerald-600/80 text-slate-800 dark:text-slate-100'
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
 className="absolute left-0 right-0 top-full mt-1.5 z-[95] overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95"
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
 className="w-full rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
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
 key={String(opt.value)}
 type="button"
 disabled={opt.disabled}
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
 ? 'bg-[#059669]/10 text-[#059669] font-bold dark:bg-[#10B981]/15 dark:text-[#10B981]'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <div className="truncate pr-2">
 <div className="truncate">{opt.label}</div>
 {opt.subtext && (
 <div className="text-[10px] text-slate-400 truncate font-normal">
 {opt.subtext}
 </div>
 )}
 </div>
 {isSelected && (
 <Check className="size-4 text-[#059669] dark:text-[#10B981] shrink-0" />
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


export default function TahfizhTargetSettingPage() {
 const navigate = useNavigate()
 const toast = useToast()

 // State List & Filter
 const [targets, setTargets] = useState([])
 const [loading, setLoading] = useState(true)
 const [options, setOptions] = useState({ units: [], levels: [], grades: [], program_types: [] })

 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedUnit, setSelectedUnit] = useState('all')
 const [selectedLevel, setSelectedLevel] = useState('all')
 const [selectedGrade, setSelectedGrade] = useState('all')
 const [selectedProgram, setSelectedProgram] = useState('all')

 // Memoized Options for HeroUI Selects
 const filterLevelOptions = useMemo(() => [
 { value: 'all', label: 'Semua Jenjang' },
 ...(options.levels || []).map((lvl) => ({ value: lvl, label: lvl }))
 ], [options.levels])

 const filterGradeOptions = useMemo(() => [
 { value: 'all', label: 'Semua Kelas' },
 ...(options.grades || []).map((gr) => ({
 value: gr,
 label: gr === 'ALL' ? 'Semua Kelas (ALL)' : `Kelas ${gr}`
 }))
 ], [options.grades])

 const filterProgramOptions = useMemo(() => [
 { value: 'all', label: 'Semua Program' },
 { value: 'fullday', label: 'Full Day School' },
 { value: 'boarding', label: 'Pesantren (Boarding)' },
 { value: 'regular', label: 'Reguler' },
 ], [])

 const filterUnitOptions = useMemo(() => [
 { value: 'all', label: 'Semua Unit (Global & Spesifik)' },
 ...(options.units || []).map((u) => ({ value: String(u.id), label: u.name }))
 ], [options.units])

 const formLevelOptions = useMemo(() => [
 { value: '', label: 'Semua Jenjang' },
 ...(options.levels || []).map((lvl) => ({ value: lvl, label: lvl }))
 ], [options.levels])

 const formGradeOptions = useMemo(() => [
 { value: 'ALL', label: 'Semua Kelas (ALL)' },
 ...(options.grades || []).filter((g) => g !== 'ALL').map((gr) => ({
 value: gr,
 label: `Kelas ${gr}`
 }))
 ], [options.grades])

 const formProgramOptions = useMemo(() => [
 { value: 'fullday', label: 'Full Day School' },
 { value: 'boarding', label: 'Pesantren (Boarding)' },
 { value: 'regular', label: 'Reguler' },
 { value: 'all', label: 'Semua Program' },
 ], [])

 const formUnitOptions = useMemo(() => [
 { value: '', label: 'Berlaku Global untuk Jenjang Terkait' },
 ...(options.units || []).map((u) => ({
 value: String(u.id),
 label: `${u.name} (${u.level})`
 }))
 ], [options.units])

 // Pagination
 const [currentPage, setCurrentPage] = useState(1)
 const [totalPages, setTotalPages] = useState(1)
 const [totalRecords, setTotalRecords] = useState(0)

 // Modal Form State
 const [showFormModal, setShowFormModal] = useState(false)
 const [editingTarget, setEditingTarget] = useState(null)
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [formData, setFormData] = useState({
 target_name: '',
 education_unit_id: '',
 unit_level: '',
 grade_level: 'ALL',
 program_type: 'fullday',
 target_juz: 'Juz 30',
 target_surahs: 37,
 target_ayats: 564,
 minimum_kkm_ayats: 350,
 description: '',
 is_active: true,
 })

 // Delete Modal State
 const [showDeleteModal, setShowDeleteModal] = useState(false)
 const [targetToDelete, setTargetToDelete] = useState(null)
 const [isDeleting, setIsDeleting] = useState(false)

 // Load Reference Options
 useEffect(() => {
 async function loadOptions() {
 try {
 const data = await tahfizhTargetService.getOptions()
 if (data) setOptions(data)
 } catch (err) {
 console.error('Gagal memuat opsi target:', err)
 }
 }
 loadOptions()
 }, [])

 // Load Data Targets
 const fetchTargets = useCallback(async () => {
 setLoading(true)
 try {
 const params = {
 page: currentPage,
 per_page: 10,
 search: debouncedSearch || undefined,
 education_unit_id: selectedUnit !== 'all' ? selectedUnit : undefined,
 unit_level: selectedLevel !== 'all' ? selectedLevel : undefined,
 grade_level: selectedGrade !== 'all' ? selectedGrade : undefined,
 program_type: selectedProgram !== 'all' ? selectedProgram : undefined,
 }
 const res = await tahfizhTargetService.getTargets(params)
 if (res?.success) {
 setTargets(res.data || [])
 setTotalPages(res.meta?.last_page || 1)
 setTotalRecords(res.meta?.total || (res.data || []).length)
 }
 } catch (err) {
 console.error('Error fetching targets:', err)
 toast('Gagal memuat daftar target KPI Tahfizh', 'error')
 } finally {
 setLoading(false)
 }
 }, [currentPage, debouncedSearch, selectedUnit, selectedLevel, selectedGrade, selectedProgram, toast])

 useEffect(() => {
 fetchTargets()
 }, [fetchTargets])

 // Open Form Modal (Add / Edit)
 const handleOpenForm = (target = null) => {
 if (target) {
 setEditingTarget(target)
 setFormData({
 target_name: target.target_name || '',
 education_unit_id: target.education_unit_id || '',
 unit_level: target.unit_level || '',
 grade_level: target.grade_level || 'ALL',
 program_type: target.program_type || 'fullday',
 target_juz: target.target_juz || '',
 target_surahs: target.target_surahs || 37,
 target_ayats: target.target_ayats || 564,
 minimum_kkm_ayats: target.minimum_kkm_ayats || 0,
 description: target.description || '',
 is_active: target.is_active ?? true,
 })
 } else {
 setEditingTarget(null)
 setFormData({
 target_name: '',
 education_unit_id: '',
 unit_level: selectedLevel !== 'all' ? selectedLevel : (options?.unit_levels?.[0] || ''),
 grade_level: 'ALL',
 program_type: 'fullday',
 target_juz: 'Juz 30',
 target_surahs: 37,
 target_ayats: 564,
 minimum_kkm_ayats: 350,
 description: '',
 is_active: true,
 })
 }
 setShowFormModal(true)
 }

 // Handle Form Submit
 const handleSubmitForm = async (e) => {
 e.preventDefault()
 if (!formData.target_name.trim()) {
 toast('Nama target wajib diisi', 'warning')
 return
 }
 if (!formData.target_ayats || Number(formData.target_ayats) <= 0) {
 toast('Jumlah target ayat harus lebih besar dari 0', 'warning')
 return
 }

 setIsSubmitting(true)
 try {
 const payload = {
 ...formData,
 target_surahs: Number(formData.target_surahs),
 target_ayats: Number(formData.target_ayats),
 minimum_kkm_ayats: Number(formData.minimum_kkm_ayats || 0),
 education_unit_id: formData.education_unit_id || null,
 }

 if (editingTarget) {
 await tahfizhTargetService.updateTarget(editingTarget.id, payload)
 toast('Target KPI Tahfizh berhasil diperbarui', 'success')
 } else {
 await tahfizhTargetService.createTarget(payload)
 toast('Target KPI Tahfizh baru berhasil ditambahkan', 'success')
 }
 setShowFormModal(false)
 fetchTargets()
 } catch (err) {
 console.error(err)
 toast(err.response?.data?.message || 'Gagal menyimpan target', 'error')
 } finally {
 setIsSubmitting(false)
 }
 }

 // Handle Delete
 const handleDeleteTarget = async () => {
 if (!targetToDelete) return
 setIsDeleting(true)
 try {
 await tahfizhTargetService.deleteTarget(targetToDelete.id)
 toast('Target KPI berhasil dihapus', 'success')
 setShowDeleteModal(false)
 setTargetToDelete(null)
 fetchTargets()
 } catch (err) {
 console.error(err)
 toast('Gagal menghapus target', 'error')
 } finally {
 setIsDeleting(false)
 }
 }

 return (
 <div className="space-y-6 pb-12">
 {/* 1. Breadcrumbs */}
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Setoran Tahfizh', href: '/dashboard/tahfizh' },
 { label: 'Pengaturan Target KPI', href: '/dashboard/tahfizh/pengaturan-target' },
 ]}
 />

 {/* 2. Hero Header Card (HeroUI Standard) */}
      <HeroUiHeader
        title="Pengaturan Target KPI Tahfizh"
        subtitle="Standar target capaian hafalan berdasarkan tingkatan jenjang unit, kelas rombel, dan tipe program santri."
        badge="Konfigurasi Kurikulum"
        icon={Target}
        actions={
          <PageToolbarActions
            className="w-full lg:w-auto shrink-0"
            primaryAction={{
              label: 'Tambah Target Baru',
              onClick: () => handleOpenForm(),
            }}
            secondaryActions={[
              {
                label: 'Kembali ke Tahfizh',
                icon: ArrowLeft,
                variant: 'secondary',
                onClick: () => navigate('/dashboard/tahfizh'),
                className: '!bg-slate-600 hover:!bg-slate-700 !text-white !border-slate-600',
              },
            ]}
          />
        }
      />

      {/* 3. Modern Emerald Datatable Container */}
      <AppDataTable
        title="Daftar Standar Target Hafalan"
        description="Target ini otomatis digunakan untuk kalkulasi sisa ayat dan persentase di halaman Setoran & Portal."
        icon={BookOpen}
        actions={
          <PageToolbarActions
            onRefresh={() => fetchTargets()}
            refreshLabel="Segarkan"
            refreshing={loading}
          />
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari target berdasarkan nama, target juz, atau deskripsi kurikulum..."
        filters={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
            {/* Filter Jenjang Unit */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Jenjang Pendidikan
              </label>
              <HeroUiFilterSelect
                value={selectedLevel}
                onChange={(val) => {
                  setSelectedLevel(val)
                  setCurrentPage(1)
                }}
                options={filterLevelOptions}
                placeholder="Semua Jenjang"
                icon={School}
                searchable={filterLevelOptions.length > 5}
                size="lg"
                className="!w-full !block"
                popoverWidth="min-w-[180px]"
              />
            </div>

            {/* Filter Tingkat Kelas */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Tingkat Kelas
              </label>
              <HeroUiFilterSelect
                value={selectedGrade}
                onChange={(val) => {
                  setSelectedGrade(val)
                  setCurrentPage(1)
                }}
                options={filterGradeOptions}
                placeholder="Semua Kelas"
                icon={Layers}
                searchable={filterGradeOptions.length > 5}
                size="lg"
                className="!w-full !block"
                popoverWidth="min-w-[180px]"
              />
            </div>

            {/* Filter Program */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Program Sekolah
              </label>
              <HeroUiFilterSelect
                value={selectedProgram}
                onChange={(val) => {
                  setSelectedProgram(val)
                  setCurrentPage(1)
                }}
                options={filterProgramOptions}
                placeholder="Semua Program"
                icon={Sparkles}
                size="lg"
                className="!w-full !block"
                popoverWidth="min-w-[200px]"
              />
            </div>

            {/* Filter Unit Spesifik */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Unit Spesifik
              </label>
              <HeroUiFilterSelect
                value={selectedUnit}
                onChange={(val) => {
                  setSelectedUnit(val)
                  setCurrentPage(1)
                }}
                options={filterUnitOptions}
                placeholder="Semua Unit"
                icon={BookOpen}
                searchable={filterUnitOptions.length > 5}
                size="lg"
                className="!w-full !block"
                popoverWidth="min-w-[220px]"
              />
            </div>
          </div>
        }
        showPagination={totalPages > 1}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      >
        <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-3 px-4 font-black">TARGET &amp; LINGKUP</th>
                  <th className="py-3 px-4 font-black">JENJANG, KELAS &amp; PROGRAM</th>
                  <th className="py-3 px-4 font-black">TARGET AYAT &amp; SURAH</th>
                  <th className="py-3 px-4 font-black text-center">STATUS</th>
                </tr>
              </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {loading ? (
 <tr>
 <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">
 <div className="inline-flex items-center gap-2">
 <RefreshCw className="size-4 animate-spin text-emerald-600" />
 <span>Memuat data target KPI Tahfizh...</span>
 </div>
 </td>
 </tr>
 ) : targets.length === 0 ? (
 <tr>
 <td colSpan={4} className="py-12 text-center text-slate-400">
 <div className="flex flex-col items-center justify-center gap-2">
 <Target className="size-8 text-slate-300 dark:text-slate-600" />
 <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
 Tidak ada target KPI yang cocok dengan filter.
 </p>
 </div>
 </td>
 </tr>
 ) : (
 targets.map((tgt) => (
 <tr key={tgt.id} onClick={() => handleOpenForm(tgt)} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition cursor-pointer">
 <td className="py-3.5 px-4 font-medium">
 <div className="flex items-start gap-2.5">
 <div className="size-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-black text-xs dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Target className="size-4" />
 </div>
 <div>
 <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
 {tgt.target_name}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
 <span className="font-semibold text-emerald-700 dark:text-emerald-400">
 {tgt.target_juz || 'Semua Juz'}
 </span>
 {tgt.education_unit && (
 <span>• Unit: {tgt.education_unit.name}</span>
 )}
 </div>
 {tgt.description && (
 <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
 "{tgt.description}"
 </p>
 )}
 </div>
 </div>
 </td>

 <td className="py-3.5 px-4">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {tgt.unit_level || 'Semua Jenjang'}
 </span>
 <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 {tgt.grade_level === 'ALL' || !tgt.grade_level ? 'Semua Kelas' : `Kelas ${tgt.grade_level}`}
 </span>
 <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-50 text-blue-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950/40 dark:text-blue-300">
 {PROGRAM_LABELS[tgt.program_type]?.label || tgt.program_type}
 </span>
 </div>
 </td>

 <td className="py-3.5 px-4">
 <div className="font-black text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm">
 {Number(tgt.target_ayats || 0).toLocaleString('id-ID')}
 <span className="text-[10px] font-bold text-emerald-600 ml-1">Ayat</span>
 </div>
 <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
 <span className="font-bold text-slate-700 dark:text-slate-300">
 {tgt.target_surahs} Surah
 </span>
 {tgt.minimum_kkm_ayats > 0 && (
 <span>• KKM: {tgt.minimum_kkm_ayats} Ayat</span>
 )}
 </div>
 </td>

 <td className="py-3.5 px-4 text-center">
 {tgt.is_active ? (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 <CheckCircle2 className="size-3" />
 Aktif
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
 Non-Aktif
 </span>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
      </AppDataTable>

 {/* 4. MODAL TAMBAH / UBAH TARGET (AppModal - Harmonized HeroUI/HeroUI) */}
 <AppModal
 isOpen={showFormModal}
 onClose={() => !isSubmitting && setShowFormModal(false)}
 title={editingTarget ? 'Ubah Target KPI Tahfizh' : 'Tambah Target KPI Tahfizh Baru'}
 description="Konfigurasikan batas capaian ayat & surah untuk kurikulum jenjang."
 icon={Target}
 maxWidth="max-w-xl"
 footer={
          <div className="flex w-full items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 px-4 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <X className="size-3.5 text-slate-500 dark:text-slate-400" strokeWidth={2.2} />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              form="tahfizh-target-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin text-white" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 text-white" strokeWidth={2.2} />
                  <span>{editingTarget ? 'Perbarui Target KPI' : 'Simpan Pengaturan Target'}</span>
                </>
              )}
            </button>
          </div>
 }
 >
 <div className="space-y-4">
 <form id="tahfizh-target-form" onSubmit={handleSubmitForm} className="space-y-4 text-xs">
 {/* Nama Target */}
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Nama Target / Kurikulum *
 </label>
 <UiInput
 type="text"
 size="sm"
 required
 value={formData.target_name}
 onChange={(e) => setFormData({ ...formData, target_name: e.target.value })}
 placeholder="Contoh: Target Tahfizh Kelas 1 (Juz 30 Penuh)"
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white transition-all"
 />
 </div>

 {/* Jenjang & Kelas & Program (3 Kolom) */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <HeroUiModalSelect
 label="Jenjang Pendidikan"
 value={formData.unit_level}
 onChange={(val) => setFormData({ ...formData, unit_level: val })}
 options={formLevelOptions}
 placeholder="Semua Jenjang"
 icon={School}
 searchable={formLevelOptions.length > 5}
 />
 </div>

 <div>
 <HeroUiModalSelect
 label="Tingkat Kelas"
 value={formData.grade_level}
 onChange={(val) => setFormData({ ...formData, grade_level: val })}
 options={formGradeOptions}
 placeholder="Pilih Kelas..."
 icon={Layers}
 searchable={formGradeOptions.length > 5}
 />
 </div>

 <div>
 <HeroUiModalSelect
 label="Tipe Program"
 required={true}
 value={formData.program_type}
 onChange={(val) => setFormData({ ...formData, program_type: val })}
 options={formProgramOptions}
 placeholder="Pilih Program..."
 icon={Sparkles}
 />
 </div>
 </div>

 {/* Target Juz & Target Ayat & Target Surah */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Target Cakupan Juz
 </label>
 <UiInput
 type="text"
 size="sm"
 value={formData.target_juz}
 onChange={(e) => setFormData({ ...formData, target_juz: e.target.value })}
 placeholder="Contoh: Juz 30, Juz 29-30"
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white transition-all"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Target Jumlah Ayat *
 </label>
 <UiInput
 type="number"
 size="sm"
 required
 min={1}
 max={6236}
 value={formData.target_ayats}
 onChange={(e) => setFormData({ ...formData, target_ayats: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white font-bold transition-all"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Target Jumlah Surah *
 </label>
 <UiInput
 type="number"
 size="sm"
 required
 min={1}
 max={114}
 value={formData.target_surahs}
 onChange={(e) => setFormData({ ...formData, target_surahs: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white font-bold transition-all"
 />
 </div>
 </div>

 {/* Minimum KKM & Unit Spesifik */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Minimal KKM Kelulusan (Ayat)
 </label>
 <UiInput
 type="number"
 size="sm"
 min={0}
 value={formData.minimum_kkm_ayats}
 onChange={(e) => setFormData({ ...formData, minimum_kkm_ayats: e.target.value })}
 placeholder="Opsional, misal 350 ayat"
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white transition-all"
 />
 </div>

 <div>
 <HeroUiModalSelect
 label="Unit Pendidikan Spesifik (Opsional)"
 value={formData.education_unit_id}
 onChange={(val) => setFormData({ ...formData, education_unit_id: val })}
 options={formUnitOptions}
 placeholder="Berlaku Global untuk Jenjang Terkait"
 icon={BookOpen}
 searchable={formUnitOptions.length > 5}
 />
 </div>
 </div>

 {/* Deskripsi */}
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Deskripsi / Keterangan Kurikulum
 </label>
 <UiTextArea
 rows={2}
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 placeholder="Penjelasan standar kompetensi hafalan..."
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white transition-all"
 />
 </div>
 </form>
 </div>
 </AppModal>

 {/* 5. MODAL HAPUS HARMONIS (HeroUI Standard) */}
 <AppModal
 isOpen={Boolean(showDeleteModal && targetToDelete)}
 onClose={() => { if (!isDeleting) { setShowDeleteModal(false); setTargetToDelete(null); } }}
 disableBackdropClose={isDeleting}
 hideCloseButton={isDeleting}
 variant="danger"
 badge="Konfirmasi Hapus Target"
 title="Hapus Target KPI?"
 icon={Trash2}
 maxWidth="max-w-md"
 zIndex="z-[80]"
 footer={
 <div className="flex w-full items-center justify-end gap-2.5">
 <button
 type="button"
 onClick={() => { setShowDeleteModal(false); setTargetToDelete(null); }}
 disabled={isDeleting}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={handleDeleteTarget}
 disabled={isDeleting}
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border-2 border-rose-600 bg-rose-600 px-5 text-xs font-black text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {isDeleting ? (
 <>
 <RefreshCw className="size-3.5 animate-spin" />
 <span>Menghapus...</span>
 </>
 ) : (
 <>
 <Trash2 className="size-3.5" />
 <span>Hapus Target</span>
 </>
 )}
 </button>
 </div>
 }
 >
 {targetToDelete && (
 <div className="space-y-4">
 <div className="rounded-xl bg-rose-50/60 p-4 border border-rose-200/80 text-xs text-rose-950 dark:bg-rose-950/20 dark:border-rose-800/60 dark:text-rose-200">
 <p className="font-bold">{targetToDelete.target_name}</p>
 <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
 Target: {targetToDelete.target_ayats} Ayat ({targetToDelete.target_juz})
 </p>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Tindakan ini akan menghapus target KPI dari sistem. Santri di kelas terkait akan menggunakan target fallback default Al-Qur'an.
 </p>
 </div>
 )}
 </AppModal>
 </div>
 )
}
