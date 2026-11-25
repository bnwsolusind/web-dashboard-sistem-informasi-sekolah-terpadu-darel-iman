import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import AppModal from "../components/app/AppModal"
import AppDataTable from "../components/app/AppDataTable"
import { PageToolbarActions } from "../components/app/PageToolbarActions"
import {
  KpiStatCard
} from '../components/app'
import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  useForm
} from 'react-hook-form'
import {
  zodResolver
} from '@hookform/resolvers/zod/dist/zod.mjs'
import {
  z
} from 'zod'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import {
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  GripVertical,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
  Zap,
  ChevronDown,
  Check,
  Filter
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Download as Download1,
  Upload as Upload1
} from 'lucide-react'
import {
  mutabaahService
} from '../services/mutabaahService'
import MutabaahSubNav from '../components/mutabaah/MutabaahSubNav'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  SquircleActionButton,
  PrintOptionModal
} from '../components/master-data'
import {
  Pagination
} from '@/components/ui/pagination'
import {
  Button
} from '@/components/ui/button'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  downloadPdfTable,
  printCleanTable
} from '../utils/printHelper'
import './MutabaahEnterprisePage.css'
import './MutabaahEnterpriseEnhancements.css'


const configs = {
 categories: {
 title: 'Kategori Agenda', subtitle: 'Kelola kelompok agenda Mutaba’ah Yaumiyyah.',
 columns: [['code', 'Kode'], ['name', 'Nama Kategori'], ['sort_order', 'Urutan'], ['is_active', 'Status']],
 fields: [{ name: 'code', label: 'Kode', type: 'text', required: true }, { name: 'name', label: 'Nama Kategori', type: 'text', required: true }, { name: 'icon', label: 'Ikon Lucide', type: 'text' }, { name: 'color', label: 'Warna', type: 'text' }, { name: 'sort_order', label: 'Urutan', type: 'number' }, { name: 'is_active', label: 'Status Aktif', type: 'boolean' }, { name: 'description', label: 'Deskripsi', type: 'textarea' }],
 },
 agendas: {
 title: 'Rincian Agenda Mutabaah', subtitle: 'Kelola agenda, jenis input, bobot, dan status untuk seluruh template.',
 columns: [['category.name', 'Kategori'], ['code', 'Kode'], ['name', 'Nama Agenda'], ['input_type', 'Jenis Input'], ['weight', 'Bobot'], ['is_active', 'Status']],
 fields: [{ name: 'category_id', label: 'Kategori', type: 'categories', required: true }, { name: 'code', label: 'Kode Agenda', type: 'text', required: true }, { name: 'name', label: 'Nama Agenda', type: 'text', required: true }, { name: 'input_type', label: 'Jenis Input', type: 'input_type', required: true }, { name: 'weight', label: 'Bobot', type: 'number', required: true }, { name: 'icon', label: 'Ikon Lucide', type: 'text' }, { name: 'color', label: 'Warna', type: 'text' }, { name: 'is_active', label: 'Status Aktif', type: 'boolean' }, { name: 'description', label: 'Deskripsi', type: 'textarea' }],
 },
 templates: {
 title: 'Template Agenda', subtitle: 'Susun paket agenda per unit, jenjang, tahun ajaran, semester, dan periode.',
 columns: [['code', 'Kode'], ['name', 'Nama'], ['education_unit.name', 'Unit'], ['education_level', 'Jenjang'], ['academic_year.name', 'Tahun Ajaran'], ['semester.name', 'Semester'], ['period', 'Periode'], ['status', 'Status']],
 fields: [{ name: 'code', label: 'Kode Template', type: 'text', required: true }, { name: 'name', label: 'Nama Template', type: 'text', required: true }, { name: 'education_unit_id', label: 'Unit', type: 'units' }, { name: 'education_level', label: 'Jenjang', type: 'text', required: true }, { name: 'academic_year_id', label: 'Tahun Ajaran', type: 'academic_years', required: true }, { name: 'semester_id', label: 'Semester', type: 'semesters', required: true }, { name: 'start_date', label: 'Mulai', type: 'date', required: true }, { name: 'end_date', label: 'Selesai', type: 'date' }, { name: 'status', label: 'Status', type: 'status', required: true }, { name: 'description', label: 'Deskripsi', type: 'textarea' }],
 },
 'template-assignments': {
 title: 'Assign Template', subtitle: 'Terapkan template berdasarkan unit, kelas, rombel, siswa khusus, dan periode.',
 columns: [['template.name', 'Template'], ['education_unit.name', 'Unit'], ['education_level', 'Jenjang'], ['kelas.name', 'Kelas'], ['rombel.nama_kelas', 'Rombel'], ['student.full_name', 'Siswa Khusus'], ['period', 'Periode'], ['priority', 'Prioritas'], ['status', 'Status']],
 fields: [{ name: 'template_id', label: 'Template', type: 'templates', required: true }, { name: 'education_unit_id', label: 'Unit', type: 'units', required: true }, { name: 'education_level', label: 'Jenjang', type: 'text' }, { name: 'kelas_id', label: 'Kelas', type: 'classes' }, { name: 'rombel_id', label: 'Rombel', type: 'classes' }, { name: 'student_id', label: 'Siswa Khusus', type: 'students' }, { name: 'academic_year_id', label: 'Tahun Ajaran', type: 'academic_years', required: true }, { name: 'semester_id', label: 'Semester', type: 'semesters', required: true }, { name: 'start_date', label: 'Mulai', type: 'date', required: true }, { name: 'end_date', label: 'Selesai', type: 'date' }, { name: 'priority', label: 'Prioritas', type: 'number' }, { name: 'status', label: 'Status', type: 'status', required: true }],
 },
 'supervisor-assignments': {
 title: 'Assign Pembimbing', subtitle: 'Atur Pembimbing, Wali Kelas, Guru PAI/Tahfizh, Musyrif, dan Musyrifah.',
 columns: [['employee.nama_lengkap', 'Nama Pegawai'], ['supervisor_type', 'Jenis Pembimbing'], ['education_unit.name', 'Unit'], ['scope', 'Kelas / Rombel'], ['boarding', 'Asrama / Kamar'], ['template.name', 'Template'], ['period', 'Periode'], ['status', 'Status']],
 fields: [{ name: 'employee_id', label: 'Nama Pegawai', type: 'employees', required: true }, { name: 'supervisor_type', label: 'Jenis Pembimbing', type: 'supervisor_type', required: true }, { name: 'education_unit_id', label: 'Unit', type: 'units', required: true }, { name: 'kelas_id', label: 'Kelas', type: 'classes', conditional: 'school' }, { name: 'rombel_id', label: 'Rombel', type: 'classes', conditional: 'school' }, { name: 'dormitory_id', label: 'Asrama (UUID)', type: 'text', conditional: 'boarding' }, { name: 'room_id', label: 'Kamar (UUID)', type: 'text', conditional: 'boarding' }, { name: 'mentoring_group', label: 'Kelompok Binaan', type: 'text', conditional: 'boarding' }, { name: 'template_id', label: 'Template', type: 'templates' }, { name: 'academic_year_id', label: 'Tahun Ajaran', type: 'academic_years', required: true }, { name: 'semester_id', label: 'Semester', type: 'semesters', required: true }, { name: 'start_date', label: 'Mulai', type: 'date', required: true }, { name: 'end_date', label: 'Selesai', type: 'date' }, { name: 'is_primary', label: 'Pembimbing Utama', type: 'boolean' }, { name: 'can_input', label: 'Dapat Input', type: 'boolean' }, { name: 'can_edit', label: 'Dapat Edit', type: 'boolean' }, { name: 'can_finalize', label: 'Dapat Finalisasi', type: 'boolean' }, { name: 'can_view_report', label: 'Dapat Melihat Laporan', type: 'boolean' }, { name: 'status', label: 'Status', type: 'status', required: true }],
 },
}

const formSchema = z.record(z.string(), z.any()).superRefine((values, ctx) => {
 if (values.start_date && values.end_date && values.end_date < values.start_date) ctx.addIssue({ code: 'custom', path: ['end_date'], message: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' })
})
const read = (row, path) => path.split('.').reduce((value, key) => value?.[key], row)
const normalizeDateInput = (value) => {
 if (!value) return ''
 const raw = String(value).trim()
 if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
 const parsed = new Date(raw)
 if (Number.isNaN(parsed.getTime())) return raw.slice(0, 10)
 const year = parsed.getFullYear()
 const month = String(parsed.getMonth() + 1).padStart(2, '0')
 const day = String(parsed.getDate()).padStart(2, '0')
 return `${year}-${month}-${day}`
}
const period = (row) => `${dateText(row.start_date)} – ${row.end_date ? dateText(row.end_date) : 'seterusnya'}`
const dateText = (value) => {
 const isoDate = normalizeDateInput(value)
 if (!isoDate) return '-'
 const [y, m, d] = isoDate.split('-').map(Number)
 if (!y || !m || !d) return new Date(value).toLocaleDateString('id-ID')
 return new Date(y, m - 1, d).toLocaleDateString('id-ID')
}
const blank = (config) => Object.fromEntries(config.fields.map((field) => [field.name, field.type === 'boolean' ? true : field.type === 'number' ? 0 : field.type === 'status' ? 'active' : '']))


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
 className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${
 disabled
 ? 'bg-slate-100 dark:bg-slate-800/60 border-emerald-200/80 dark:border-emerald-800/60 text-slate-400 cursor-not-allowed'
 : isOpen
 ? 'border-[#059669] bg-white ring-4 ring-[#059669]/12 dark:border-[#10B981] dark:bg-slate-900 dark:ring-[#10B981]/20 text-slate-800 dark:text-slate-100 shadow-sm'
 : 'border-emerald-200/80 bg-slate-50 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-800 dark:hover:border-emerald-600/80 text-slate-800 dark:text-slate-100'
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
 className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
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

// ── MODERN MUTABA'AH HERO UI KPI CARD COMPONENT ──
const MODERN_KPI_TONES = {
  emerald: {
    card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-400',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: '!bg-emerald-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-emerald-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-emerald-800 dark:text-emerald-300',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-emerald-700 dark:text-emerald-400 font-bold',
    subtext: 'text-emerald-700 dark:text-emerald-400 font-bold',
    cta: 'text-emerald-700 dark:text-emerald-400 font-bold',
    divider: 'border-emerald-100 dark:border-emerald-900/60',
  },
  blue: {
    card: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconGradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    tag: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-sky-800 dark:text-sky-300',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-sky-700 dark:text-sky-400 font-bold',
    subtext: 'text-sky-700 dark:text-sky-400 font-bold',
    cta: 'text-sky-700 dark:text-sky-400 font-bold',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  sky: {
    card: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconGradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    tag: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-sky-800 dark:text-sky-300',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-sky-700 dark:text-sky-400 font-bold',
    subtext: 'text-sky-700 dark:text-sky-400 font-bold',
    cta: 'text-sky-700 dark:text-sky-400 font-bold',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  cyan: {
    card: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: '!bg-teal-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-teal-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-teal-800 dark:text-teal-300',
    title: 'text-teal-800 dark:text-teal-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-teal-700 dark:text-teal-400 font-bold',
    subtext: 'text-teal-700 dark:text-teal-400 font-bold',
    cta: 'text-teal-700 dark:text-teal-400 font-bold',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
  indigo: {
    card: 'rounded-[22px] border-2 border-indigo-300 dark:border-indigo-700/80 bg-gradient-to-b from-[#E0E7FF]/70 via-[#E0E7FF]/20 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-indigo-400',
    glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
    iconBox: '!bg-indigo-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-indigo-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-indigo-800 dark:text-indigo-300',
    title: 'text-indigo-800 dark:text-indigo-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-indigo-700 dark:text-indigo-400 font-bold',
    subtext: 'text-indigo-700 dark:text-indigo-400 font-bold',
    cta: 'text-indigo-700 dark:text-indigo-400 font-bold',
    divider: 'border-indigo-100 dark:border-indigo-900/60',
  },
  rose: {
    card: 'rounded-[22px] border-2 border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-400',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: '!bg-rose-500 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-rose-500 !text-white shadow-xs rounded-full',
    tag: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-rose-800 dark:text-rose-300',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-rose-700 dark:text-rose-400 font-bold',
    subtext: 'text-rose-700 dark:text-rose-400 font-bold',
    cta: 'text-rose-700 dark:text-rose-400 font-bold',
    divider: 'border-rose-100 dark:border-rose-900/60',
  },
  amber: {
    card: 'rounded-[22px] border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-400',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: '!bg-amber-500 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-amber-500 !text-white shadow-xs rounded-full',
    tag: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-amber-800 dark:text-amber-300',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-amber-700 dark:text-amber-400 font-bold',
    subtext: 'text-amber-700 dark:text-amber-400 font-bold',
    cta: 'text-amber-700 dark:text-amber-400 font-bold',
    divider: 'border-amber-100 dark:border-amber-900/60',
  },
  violet: {
    card: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: '!bg-purple-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-purple-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-purple-800 dark:text-purple-300',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-purple-700 dark:text-purple-400 font-bold',
    subtext: 'text-purple-700 dark:text-purple-400 font-bold',
    cta: 'text-purple-700 dark:text-purple-400 font-bold',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  purple: {
    card: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: '!bg-purple-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-purple-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-purple-800 dark:text-purple-300',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-purple-700 dark:text-purple-400 font-bold',
    subtext: 'text-purple-700 dark:text-purple-400 font-bold',
    cta: 'text-purple-700 dark:text-purple-400 font-bold',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  teal: {
    card: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: '!bg-teal-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-teal-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-teal-800 dark:text-teal-300',
    title: 'text-teal-800 dark:text-teal-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-teal-700 dark:text-teal-400 font-bold',
    subtext: 'text-teal-700 dark:text-teal-400 font-bold',
    cta: 'text-teal-700 dark:text-teal-400 font-bold',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
  slate: {
    card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-slate-400',
    glow: 'bg-slate-400/20 group-hover:bg-slate-400/30',
    iconBox: '!bg-slate-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-slate-600 !text-white shadow-xs rounded-full',
    tag: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-slate-800 dark:text-slate-300',
    title: 'text-slate-800 dark:text-slate-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-slate-700 dark:text-slate-400 font-bold',
    subtext: 'text-slate-700 dark:text-slate-400 font-bold',
    cta: 'text-slate-700 dark:text-slate-400 font-bold',
    divider: 'border-emerald-100/80 dark:border-emerald-800/60',
  },
}

function ModernMutabaahKpiCard({
  icon: Icon,
  title,
  label,
  value,
  subtitle,
  subtext,
  description,
  tag,
  badge,
  tone = 'emerald',
  variant,
  ctaText,
  onClick,
  active = false,
  isActive = false,
  className = '',
  trend,
  trendText,
  card,
  ...props
}) {
  return (
    <KpiStatCard
      icon={Icon || card?.icon}
      title={card?.title || title || label}
      value={card?.formattedValue ?? card?.value ?? value}
      description={card?.subtext || subtitle || subtext || description || (trendText ? `${trend ? trend + ' ' : ''}${trendText}` : undefined)}
      badge={card?.badgeText || badge || tag}
      tone={variant || tone || card?.tone || 'emerald'}
      ctaText={ctaText || card?.ctaText || card?.footerLabel}
      onClick={onClick || card?.onClick}
      className={className}
      active={active || isActive}
      trend={trend}
      trendText={trendText}
      card={card}
      {...props}
    />
  )
}

export default function MutabaahEnterprisePage({ resource }) {
 return <MutabaahErrorBoundary><EnterpriseWorkspace resource={resource} /></MutabaahErrorBoundary>
}

function EnterpriseWorkspace({ resource }) {
 const config = configs[resource] || configs.categories
 const queryClient = useQueryClient()
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(15)
 const [searchInput, setSearchInput] = useState('')
 const [search, setSearch] = useState('')
 const [status, setStatus] = useState('')
 const [categoryId, setCategoryId] = useState('')
 const [sort, setSort] = useState('created_at')
 const [direction, setDirection] = useState('desc')
 const [selected, setSelected] = useState([])
 const [drawer, setDrawer] = useState(null)
 const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
 const importRef = useRef(null)

 useEffect(() => { const timer = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400); return () => clearTimeout(timer) }, [searchInput])
 const params = { search, status, category_id: categoryId, sort, direction, page, per_page: perPage, with_trashed: 1 }
 const listQuery = useQuery({ queryKey: ['mutabaah', resource, params], queryFn: () => mutabaahService.enterpriseList(resource, params), placeholderData: keepPreviousData })
 const optionsQuery = useQuery({ queryKey: ['mutabaah-options'], queryFn: mutabaahService.enterpriseOptions, staleTime: 300_000 })
 const categoryOptions = useMemo(() => [
 { value: '', label: 'Semua Kategori' },
 ...(optionsQuery.data?.categories || []).map((x) => ({ value: String(x.id), label: x.name }))
 ], [optionsQuery.data?.categories])

 const statusOptions = [
 { value: '', label: 'Semua Status' },
 { value: 'active', label: 'Aktif' },
 { value: 'inactive', label: 'Nonaktif' },
 ]

 const perPageOptions = [
 { value: 5, label: '5 per hal' },
 { value: 10, label: '10 per hal' },
 { value: 15, label: '15 per hal' },
 { value: 25, label: '25 per hal' },
 { value: 50, label: '50 per hal' },
 { value: 100, label: '100 per hal' },
 ]
 const rows = listQuery.data?.data || []
 const meta = listQuery.data?.meta || { current_page: 1, last_page: 1, total: 0 }
 const refresh = () => queryClient.invalidateQueries({ queryKey: ['mutabaah', resource] })
 const mutate = useMutation({ mutationFn: ({ id, data }) => id ? mutabaahService.enterpriseUpdate(resource, id, data) : mutabaahService.enterpriseCreate(resource, data), onSuccess: (result) => { setDrawer(null); refresh(); toast('success', result.message) }, onError: showError })

 const sortColumn = (key) => {
 const sortable = ['name', 'code', 'start_date', 'created_at']
 if (!sortable.includes(key)) return
 if (sort === key) setDirection((old) => old === 'asc' ? 'desc' : 'asc'); else { setSort(key); setDirection('asc') }
 }
 const columns = [
 { id: 'select', header: () => <input aria-label="Pilih semua" type="checkbox" className="rounded border-emerald-300" checked={rows.length > 0 && rows.every((r) => selected.includes(r.id))} onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])} />, cell: ({ row }) => <input aria-label={`Pilih ${row.original.name || row.original.id}`} type="checkbox" className="rounded border-emerald-300" checked={selected.includes(row.original.id)} onChange={() => setSelected((old) => old.includes(row.original.id) ? old.filter((id) => id !== row.original.id) : [...old, row.original.id])} /> },
 { id: 'number', header: 'No', cell: ({ row }) => (meta.current_page - 1) * perPage + row.index + 1 },
 ...config.columns.map(([key, label]) => ({ id: key, header: () => <button className="me-sort flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200" onClick={() => sortColumn(key)}>{label}{sort === key && (direction === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}</button>, cell: ({ row }) => <Cell row={row.original} path={key} /> })),
 { id: 'actions', header: 'Aksi', cell: ({ row }) => <RowActions row={row.original} resource={resource} onDrawer={setDrawer} onRefresh={refresh} /> },
 ]
 const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), manualPagination: true, manualSorting: true })

 const exportData = async (format) => {
 try { const response = await mutabaahService.enterpriseExport(resource, format, params); const url = URL.createObjectURL(response.data); const a = document.createElement('a'); a.href = url; a.download = `mutabaah-${resource}.${format}`; a.click(); URL.revokeObjectURL(url) } catch (error) { showError(error) }
 }

 const handlePrintClean = () => {
 setPrintOptionModalOpen(false)
 printCleanTable({
 title: `Laporan ${config.title}`,
 subtitle: `Total Data: ${meta.total || rows.length}`,
 headers: config.columns.map((c) => c[1]),
 rows: rows.map((r) => config.columns.map(([key]) => String(read(r, key) || '-'))),
 })
 }

 const handleDownloadPdfTable = () => {
 setPrintOptionModalOpen(false)
 downloadPdfTable({
 title: `Laporan ${config.title}`,
 subtitle: `Total Data: ${meta.total || rows.length}`,
 headers: config.columns.map((c) => c[1]),
 rows: rows.map((r) => config.columns.map(([key]) => String(read(r, key) || '-'))),
 })
 }

 const importData = async (file) => {
 if (!file) return
 try { const result = await mutabaahService.enterpriseImport(resource, file); refresh(); toast(result.data?.errors?.length ? 'warning' : 'success', result.message) } catch (error) { showError(error) }
 finally { if (importRef.current) importRef.current.value = '' }
 }
 const bulkDelete = async () => {
 if (!selected.length || !(await confirmDelete(selected.length)).isConfirmed) return
 try { await mutabaahService.enterpriseBulkDelete(resource, selected); setSelected([]); refresh(); toast('success', 'Data dipindahkan ke sampah.') } catch (error) { showError(error) }
 }

 const resetFilters = () => {
 setSearchInput('')
 setSearch('')
 setStatus('')
 setCategoryId('')
 setPage(1)
 setPerPage(15)
 }

 return (
 <PageContainer maxW="7xl" className="space-y-6 pb-12">
 {/* 🧭 AppBreadcrumb Navigation */}
 <AppBreadcrumb
 className="print:hidden"
 items={[
 { href: '/dashboard', label: 'Dashboard' },
 { href: '/dashboard/mutabaah', label: 'Mutaba’ah Yaumiyyah' },
 { label: config.title },
 ]}
 />

 {/* ── 1. MODERN VIVID EMERALD HERO HEADER CARD ── */}
      <HeroUiHeader
        title={config.title}
        subtitle={config.subtitle}
        badge="Konfigurasi Mutaba’ah Terpadu"
        icon={BookOpen}
        actions={
          <Button
            type="button"
            variant="create"
            size="sm"
            onClick={() => setDrawer({ mode: "create" })}
            prefixIcon={<Plus className="h-4 w-4 text-white" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm cursor-pointer"
          >
            Tambah {config.title}
          </Button>
        }
      />

      {/* ── 2. KPI CARDS GRID (HERO UI SPECIFICATION) ── */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <ModernMutabaahKpiCard
 icon={BookOpen}
 title={`Total ${config.title}`}
 value={meta.total || rows.length}
 subtitle="Data tersimpan di sistem"
 tone="emerald"
 badge="Semua Data"
 active={status === ''}
 onClick={() => setStatus('')}
 />
 <ModernMutabaahKpiCard
 icon={CheckCircle2}
 title="Status Aktif"
 value={rows.filter((r) => r.is_active || r.status === 'active').length}
 subtitle="Siap digunakan santri"
 tone="teal"
 badge="Siap Pakai"
 active={status === 'active'}
 onClick={() => setStatus((prev) => (prev === 'active' ? '' : 'active'))}
 />
 <ModernMutabaahKpiCard
 icon={Layers}
 title="Kategori Master"
 value={optionsQuery.data?.categories?.length || 0}
 subtitle="Kategori agenda mutabaah"
 tone="blue"
 badge="Kategori"
 />
 <ModernMutabaahKpiCard
 icon={Zap}
 title="Template Terintegrasi"
 value={optionsQuery.data?.templates?.length || 0}
 subtitle="Template mutabaah aktif"
 tone="amber"
 badge="Template"
 />
 </div>

 {/* 🧭 CARD MUTABA'AH YAUMIYYAH SUB-NAV */}
 <MutabaahSubNav />

 {/* ── 3. EMERALD DATATABLE CONTAINER ── */}
 <AppDataTable
 title={config.title}
 description={config.subtitle}
 icon={BookOpen}
 countLabel={`${meta.total || rows.length} Data`}
 actions={
 <div className="flex flex-wrap items-center gap-2">
 <input ref={importRef} hidden type="file" accept=".xlsx,.xls,.csv" onChange={(e) => importData(e.target.files?.[0])} />
 <PageToolbarActions
 onImport={() => importRef.current?.click()}
 importLabel="Import Data (Excel/CSV)"
 onExport={() => exportData('xlsx')}
 exportLabel="Export Data (Excel/CSV)"
 onPrint={() => setPrintOptionModalOpen(true)}
 primaryAction={{
 label: `Tambah ${config.title}`,
 onClick: () => setDrawer({ mode: 'create' }),
 }}
 />
 {selected.length > 0 && (
 <SquircleActionButton
 variant="delete"
 label={`Hapus ${selected.length} Terpilih`}
 onClick={bulkDelete}
 />
 )}
 </div>
 }
 search={searchInput}
 onSearchChange={setSearchInput}
 searchPlaceholder={`Cari ${config.title.toLowerCase()}...`}
 filters={
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end w-full">
 {resource === 'agendas' && (
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori Agenda</label>
 <HeroUiFilterSelect
 value={categoryId}
 onChange={(val) => { setCategoryId(val); setPage(1) }}
 options={categoryOptions}
 placeholder="Semua Kategori"
 icon={Layers}
 searchable={categoryOptions.length > 5}
 popoverWidth="min-w-[200px]"
 />
 </div>
 )}

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
 <HeroUiFilterSelect
 value={status}
 onChange={(val) => { setStatus(val); setPage(1) }}
 options={statusOptions}
 placeholder="Semua Status"
 icon={Sparkles}
 popoverWidth="min-w-[160px]"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tampilkan</label>
 <HeroUiFilterSelect
 value={perPage}
 onChange={(val) => { setPerPage(Number(val)); setPage(1) }}
 options={perPageOptions}
 placeholder="Tampilkan..."
 icon={SlidersHorizontal}
 popoverWidth="min-w-[140px]"
 />
 </div>

 <div>
 <button
 type="button"
 onClick={resetFilters}
 className="w-full h-10 flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 text-xs font-extrabold cursor-pointer transition-colors"
 >
 <RotateCcw className="h-3.5 w-3.5" /> Reset Filter
 </button>
 </div>
 </div>
 }
 showPagination={(meta.last_page || 1) > 1}
 page={page}
 totalPages={meta.last_page || 1}
 totalItems={meta.total || rows.length}
 onPageChange={(p) => setPage(p)}
 >
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 text-xs font-extrabold uppercase tracking-wider text-emerald-950 dark:border-emerald-800/60 dark:text-emerald-200">
 {table.getHeaderGroups().map((group) => (
 group.headers.map((header) => (
 <th key={header.id} className="px-3 py-3 font-extrabold whitespace-nowrap">
 {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
 </th>
 ))
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {listQuery.isLoading && (
 Array.from({ length: 7 }).map((_, index) => (
 <tr key={index} className="animate-pulse">
 <td colSpan={columns.length} className="px-4 py-3">
 <div className="h-4 w-full rounded bg-emerald-50 dark:bg-emerald-950/40" />
 </td>
 </tr>
 ))
 )}

 {listQuery.isError && (
 <tr>
 <td colSpan={columns.length} className="px-4 py-8 text-center">
 <ErrorState retry={() => listQuery.refetch()} />
 </td>
 </tr>
 )}

 {!listQuery.isLoading && !listQuery.isError && table.getRowModel().rows.map((row) => (
 <tr key={row.id} className={`hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition ${row.original.trashed ? 'opacity-60 bg-rose-50/30' : ''}`}>
 {row.getVisibleCells().map((cell) => (
 <td key={cell.id} className="px-3 py-3">
 {flexRender(cell.column.columnDef.cell, cell.getContext())}
 </td>
 ))}
 </tr>
 ))}

 {!listQuery.isLoading && !listQuery.isError && !rows.length && (
 <tr>
 <td colSpan={columns.length} className="px-4 py-12 text-center">
 <EmptyState onCreate={() => setDrawer({ mode: 'create' })} />
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </AppDataTable>

 {/* Drawers / Modals */}
 <AnimatePresence>
 {drawer && (
 drawer.mode === 'items' ? (
 <TemplateItemsDrawer template={drawer.row} options={optionsQuery.data || {}} close={() => setDrawer(null)} refresh={refresh} />
 ) : (
 <CrudDrawer config={config} state={drawer} options={optionsQuery.data || {}} close={() => setDrawer(null)} save={(data) => mutate.mutate({ id: drawer.row?.id, data })} saving={mutate.isPending} />
 )
 )}
 </AnimatePresence>

 {/* Modal Cetak Data */}
 <PrintOptionModal
 isOpen={printOptionModalOpen}
 onClose={() => setPrintOptionModalOpen(false)}
 onPrint={handlePrintClean}
 onDownloadPdf={handleDownloadPdfTable}
 title={config.title}
 />
 </PageContainer>
 )
}

class MutabaahErrorBoundary extends Component {
 state = { failed: false }
 static getDerivedStateFromError() { return { failed: true } }
 render() {
 if (this.state.failed) return <div className="p-6"><section className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 dark:border-emerald-800/60 dark:bg-[#1B2433]"><ErrorState retry={() => this.setState({ failed: false })} /></section></div>
 return this.props.children
 }
}

function CrudDrawer({ config, state, options, close, save, saving }) {
 const defaults = state?.row ? Object.fromEntries(config.fields.map((f) => [f.name, f.type === 'date' ? normalizeDateInput(state.row[f.name]) : state.row[f.name] ?? (f.type === 'boolean' ? true : '')])) : blank(config)
 const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ resolver: zodResolver(formSchema), defaultValues: defaults })
 const selectedUnit = options.units?.find((u) => u.id === watch('education_unit_id'))
 const boarding = /pesantren|ma.?had/i.test(selectedUnit?.name || '')
 return (
 <AppModal
 isOpen={Boolean(state)}
 onClose={close}
 badge="Mutaba’ah Yaumiyyah"
 title={`${state?.mode === 'create' ? 'Tambah' : state?.mode === 'detail' ? 'Detail' : 'Edit'} ${config.title}`}
 icon={state?.mode === 'create' ? Plus : state?.mode === 'detail' ? Eye : Pencil}
 maxWidth="max-w-xl"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full items-center justify-end gap-2.5">
 <button
 type="button"
 onClick={close}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 {state?.mode !== 'detail' && (
 <button
 type="submit"
 form="mutabaah-enterprise-form"
 disabled={saving}
 className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {saving && <Loader2 className="size-4 animate-spin" />} Simpan
 </button>
 )}
 </div>
 }
 >
 {state && (
 <form id="mutabaah-enterprise-form" className="space-y-4" onSubmit={handleSubmit(save)}>
 {config.fields.filter((field) => !field.conditional || (field.conditional === 'boarding' ? boarding : !boarding)).map((field) => (
 <FormField key={field.name} field={field} register={register} setValue={setValue} watch={watch} error={errors[field.name]?.message} options={options} disabled={state.mode === 'detail'} />
 ))}
 </form>
 )}
 </AppModal>
 )
}

function FormField({ field, register, setValue, watch, error, options, disabled }) {
 if (field.type === 'boolean') {
 return (
 <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
 <input disabled={disabled} type="checkbox" className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" {...register(field.name)} />
 <span>{field.label}</span>
 </label>
 )
 }

 if (field.type === 'textarea') {
 return (
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
 <textarea disabled={disabled} rows={3} className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white" {...register(field.name)} />
 {error && <em className="text-xs text-rose-500 mt-1 block">{error}</em>}
 </div>
 )
 }

 const maps = {
 categories: options.categories?.map((x) => [x.id, `${x.code} — ${x.name}`]) || [],
 units: options.units?.map((x) => [x.id, x.name]) || [],
 templates: options.templates?.map((x) => [x.id, `${x.code} — ${x.name}`]) || [],
 employees: options.employees?.map((x) => [x.id, x.nama_lengkap]) || [],
 classes: options.classes?.map((x) => [x.id, x.nama_kelas]) || [],
 students: options.students?.map((x) => [x.id, x.full_name]) || [],
 semesters: options.semesters?.map((x) => [x.id, x.name]) || [],
 academic_years: options.academic_years?.map((x) => [x.id, x.name]) || [],
 status: [['active', 'Aktif'], ['inactive', 'Nonaktif']],
 input_type: [['status', 'Status'], ['yes_no', 'Ya / Tidak'], ['checklist', 'Checklist'], ['number', 'Angka'], ['duration', 'Durasi'], ['pages', 'Halaman'], ['verses', 'Ayat'], ['text', 'Teks']],
 supervisor_type: [['pembimbing', 'Pembimbing'], ['wali_kelas', 'Wali Kelas'], ['guru_pai', 'Guru PAI'], ['guru_tahfizh', 'Guru Tahfizh'], ['musyrif', 'Musyrif'], ['musyrifah', 'Musyrifah']],
 }

 if (maps[field.type]) {
 const val = watch ? watch(field.name) : undefined
 const selectOptions = [
 { value: '', label: `Pilih ${field.label}...` },
 ...maps[field.type].map(([id, name]) => ({ value: String(id), label: name }))
 ]
 return (
 <div>
 <HeroUiModalSelect
 label={field.label}
 required={field.required}
 value={val !== undefined && val !== null ? String(val) : ''}
 disabled={disabled}
 options={selectOptions}
 placeholder={`Pilih ${field.label}...`}
 searchable={selectOptions.length > 5}
 onChange={(newVal) => {
 if (setValue) {
 setValue(field.name, newVal, { shouldValidate: true, shouldDirty: true })
 }
 }}
 />
 {error && <em className="text-xs text-rose-500 mt-1 block">{error}</em>}
 </div>
 )
 }

 return (
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{field.label}{field.required && ' *'}</label>
 <input disabled={disabled} type={field.type} step={field.type === 'number' ? '0.01' : undefined} className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white" {...register(field.name, { valueAsNumber: field.type === 'number' })} />
 {error && <em className="text-xs text-rose-500 mt-1 block">{error}</em>}
 </div>
 )
}

function RowActions({ row, resource, onDrawer, onRefresh }) {
 const remove = async () => { if (!(await confirmDelete(1)).isConfirmed) return; try { await mutabaahService.enterpriseDelete(resource, row.id); onRefresh(); toast('success', 'Data dipindahkan ke sampah.') } catch (error) { showError(error) } }
 const restore = async () => { try { await mutabaahService.enterpriseRestore(resource, row.id); onRefresh(); toast('success', 'Data berhasil dipulihkan.') } catch (error) { showError(error) } }
 return (
 <div className="flex items-center justify-center gap-1.5">
 <ActionDropdown
 onView={() => onDrawer({ mode: 'detail', row })}
 onEdit={!row.trashed ? () => onDrawer({ mode: 'edit', row }) : undefined}
 onDelete={!row.trashed ? remove : undefined}
 extraItems={
 resource === 'templates' && !row.trashed
 ? [
 {
 label: 'Susun Agenda',
 icon: <GripVertical className="size-4 text-indigo-500" />,
 onClick: () => onDrawer({ mode: 'items', row }),
 },
 ]
 : row.trashed
 ? [
 {
 label: 'Pulihkan Data',
 icon: <ArchiveRestore className="size-4 text-emerald-500" />,
 onClick: restore,
 },
 ]
 : []
 }
 />
 </div>
 )
}

function TemplateItemsDrawer({ template, options, close, refresh }) {
 const [items, setItems] = useState(template.items || [])
 const [agendaId, setAgendaId] = useState('')
 const update = async (item, changes) => { try { await mutabaahService.templateItemUpdate(item.id, changes); setItems((old) => old.map((x) => x.id === item.id ? { ...x, ...changes } : x)); toast('success', 'Item diperbarui.') } catch (error) { showError(error) } }
 const move = async (index, offset) => { const target = index + offset; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; setItems(next); await mutabaahService.templateReorder(template.id, next.map((item, i) => ({ id: item.id, sort_order: i + 1 }))) }
 const add = async () => { if (!agendaId) return; try { const result = await mutabaahService.templateItemCreate(template.id, { agenda_item_id: agendaId, sort_order: items.length + 1, weight: 1, is_required: true, requires_parent_signature: false, is_active: true }); setItems([...items, result.data]); setAgendaId(''); toast('success', result.message) } catch (error) { showError(error) } }

 const availableAgendaOptions = useMemo(() => [
 { value: '', label: 'Pilih agenda...' },
 ...(options.agendas || [])
 .filter((a) => !items.some((i) => i.agenda_item_id === a.id))
 .map((a) => ({ value: String(a.id), label: `${a.code} — ${a.name}` }))
 ], [options.agendas, items])

 return (
 <AppModal
 isOpen={Boolean(template)}
 onClose={close}
 badge="Detail Template"
 title={template?.name}
 icon={GripVertical}
 maxWidth="max-w-2xl"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full justify-end">
 <button
 type="button"
 onClick={() => { refresh(); close() }}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
 >
 Selesai
 </button>
 </div>
 }
 >
 {template && (
 <div className="space-y-3">
 <div className="flex items-center gap-2 mb-4">
 <div className="flex-1">
 <HeroUiFilterSelect
 value={agendaId}
 onChange={(val) => setAgendaId(val)}
 options={availableAgendaOptions}
 placeholder="Pilih agenda..."
 searchable={true}
 className="w-full"
 popoverWidth="w-full min-w-[280px]"
 />
 </div>
 <Button variant="primary" size="sm" onClick={add} className="cursor-pointer h-10 px-4 rounded-xl shrink-0"><Plus className="size-4 mr-1" /> Tambah</Button>
 </div>

 {items.map((item, index) => (
 <article className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 dark:border-emerald-800/60 dark:bg-slate-800/40 text-xs" key={item.id}>
 <div className="flex items-center gap-1.5 font-bold text-slate-400">
 <GripVertical className="size-4" />
 <span>{index + 1}</span>
 </div>
 <div className="flex-1 min-w-0">
 <b className="block font-bold text-slate-800 dark:text-slate-200 truncate">{item.agenda_item?.name || item.agendaItem?.name || '-'}</b>
 <small className="text-[10px] text-slate-400">{item.agenda_item?.category?.name || 'Agenda template'}</small>
 </div>
 <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Bobot
 <input type="number" defaultValue={item.weight} onBlur={(e) => update(item, { weight: Number(e.target.value) })} className="w-14 ml-1 rounded border-2 border-[#b6f6d9] dark:border-emerald-800/60 p-1 text-center font-bold text-slate-800 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white" />
 </label>
 <div className="flex items-center gap-1">
 <button disabled={!index} onClick={() => move(index, -1)} className="p-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-30 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"><ArrowUp className="size-3" /></button>
 <button disabled={index === items.length - 1} onClick={() => move(index, 1)} className="p-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-30 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"><ArrowDown className="size-3" /></button>
 <button onClick={async () => { await mutabaahService.templateItemDelete(item.id); setItems(items.filter((x) => x.id !== item.id)) }} className="p-1 rounded border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/40 cursor-pointer"><Trash2 className="size-3" /></button>
 </div>
 </article>
 ))}

 {!items.length && <EmptyState onCreate={() => null} compact />}
 </div>
 )}
 </AppModal>
 )
}

function Cell({ row, path }) {
 if (path === 'period') return period(row)
 if (path === 'scope') return row.kelas?.name || row.rombel?.nama_kelas || row.mentoring_group || 'Semua scope'
 if (path === 'boarding') return [row.dormitory_id, row.room_id].filter(Boolean).join(' / ') || '-'
 const value = read(row, path)
 if (path === 'is_active' || path === 'status') {
 const active = path === 'is_active' ? Boolean(value) : value === 'active'
 return (
 <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
 active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
 }`}>
 {active ? 'Aktif' : 'Nonaktif'}
 </span>
 )
 }
 return <span className="font-semibold text-slate-800 dark:text-slate-200">{value?.value || value || '-'}</span>
}

function EmptyState({ onCreate, compact = false }) {
 return (
 <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
 <Search className="size-8 mb-2 text-slate-300 dark:text-slate-600" />
 <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada data</h3>
 <p className="text-xs text-slate-400 mt-0.5">Data belum tersedia atau tidak cocok dengan filter aktif.</p>
 {!compact && (
 <Button variant="primary" size="sm" className="mt-3 cursor-pointer" onClick={onCreate}>
 <Plus className="size-4 mr-1" /> Tambah Data
 </Button>
 )}
 </div>
 )
}

function ErrorState({ retry }) {
 return (
 <div className="flex flex-col items-center justify-center p-8 text-center text-rose-500">
 <X className="size-8 mb-2 text-rose-400" />
 <h3 className="text-xs font-bold">Data gagal dimuat</h3>
 <p className="text-xs text-slate-400 mt-0.5">Periksa koneksi atau permission, kemudian coba kembali.</p>
 <Button variant="primary" size="sm" className="mt-3 cursor-pointer" onClick={retry}>Coba Lagi</Button>
 </div>
 )
}

const confirmDelete = (count) => Swal.fire({ icon: 'warning', title: `Hapus ${count} data?`, text: 'Data akan dipindahkan ke sampah dan dapat dipulihkan.', showCancelButton: true, confirmButtonText: 'Hapus', cancelButtonText: 'Batal', confirmButtonColor: '#dc2626' })
const toast = (icon, text) => Swal.fire({ toast: true, position: 'top-end', icon, title: text, timer: 1800, showConfirmButton: false })
function showError(error) { Swal.fire({ icon: 'error', title: 'Tidak dapat memproses', text: error?.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.', confirmButtonColor: '#059669' }) }
