import {
  useMemo,
  useState
} from 'react'
import {
  cn
} from '../lib/utils'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Crosshair,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Hash,
  Info,
  Mail,
  MapPin,
  Moon,
  Pencil,
  Phone,
  Plus,
  Power,
  Printer,
  RefreshCcw,
  Save,
  School,
  ShieldCheck,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  UsersRound,
  X,
  XCircle
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  employeeService
} from '../services/employeeService'
import {
  studentService
} from '../services/studentService'
import {
  kelasService
} from '../services/kelasService'
import {
  api
} from '../services/api'
import {
  downloadFileFromApi
} from '../utils/exportUtils'
import {
  PersonIdentityCell
} from '../components/ui/PersonIdentityCell'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  isFoundationUser
} from '../auth/portalResolver'
import {
  SmartScrollFab
} from '../components/common'
import {
  useAuthStore
} from '../stores/authStore'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import AppPageHeader from '../components/app/AppPageHeader'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import KpiCard from '../components/app/KpiCard'
import {
  HeroUiHeader,
  PageToolbarActions,
  KpiStatCard,
  EducationUnitWithProgramCell
} from '../components/app'
import AppDataTable from '../components/app/AppDataTable'
import AppBadge from '../components/app/AppBadge'
import AppDrawer from '../components/app/AppDrawer'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'
import PageContainer from '../components/app/PageContainer'
import {
  useToast
} from '../components/app'
import {
  MasterStatusBadge,
  MasterErrorState,
  MasterEmptyState,
  MasterStatsGrid,
  MasterStatCard,
  SquircleActionButton,
  PrintOptionModal
} from '../components/master-data'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}
import {
  useProvinsiList,
  useKotaOptions,
  useKecamatanOptions,
  useKelurahanOptions
} from '../hooks/useWilayah'
import {
  getProvinsiList,
  getKotaOptions,
  getKecamatanOptions,
  getKelurahanOptions
} from '../components/siswa/wilayahData'
import SearchableRegionInput from '../components/common/SearchableRegionInput'
import InteractiveMapPicker from '../components/common/InteractiveMapPicker'
import {
  getPostalCode,
  enrichKelurahanWithPostal
} from '../utils/postalCodeHelper'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  Button as HeroButton,
  Card as HeroCard,
  Modal as HeroModal,
  Spinner as HeroSpinner,
  Tooltip as HeroTooltip
} from '@heroui/react'
import { Chip as HeroChip } from '../components/ui/badge'
import {
  Button
} from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Backdrop
} from '@/components/ui/dialog'
import {
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import {
  Input
} from '@/components/ui/input'
import {
  TextArea
} from '@/components/ui/text-area'
import {
  TextField
} from '@/components/ui/text-field'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'

// ── Color Map per Unit Type ──────────────────────────────────────────────────
const UNIT_COLORS = {
  TKIT: { bg: 'bg-emerald-800', text: 'text-white', border: 'border-emerald-700' },
  TAUD: { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-600' },
  SDIT: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  MIT: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-400' },
  SMPIT: { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-500' },
  SMAIT: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-500' },
  PONPES: { bg: 'bg-emerald-950', text: 'text-white', border: 'border-emerald-900' },
  MAHAD: { bg: 'bg-teal-800', text: 'text-white', border: 'border-teal-700' },
  Mahad: { bg: 'bg-teal-800', text: 'text-white', border: 'border-teal-700' },
}

function getUnitStyle(type) {
  if (!type) return { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-600' }
  const upper = String(type).toUpperCase().trim()
  if (upper.includes('TK')) return UNIT_COLORS.TKIT
  if (upper.includes('TAUD')) return UNIT_COLORS.TAUD
  if (upper.includes('SD')) return UNIT_COLORS.SDIT
  if (upper.includes('MIT') || upper.includes('MI')) return UNIT_COLORS.MIT
  if (upper.includes('SMP')) return UNIT_COLORS.SMPIT
  if (upper.includes('SMA')) return UNIT_COLORS.SMAIT
  if (upper.includes('PONPES') || upper.includes('PESANTREN')) return UNIT_COLORS.PONPES
  if (upper.includes('MAHAD')) return UNIT_COLORS.MAHAD
  return UNIT_COLORS[type] || { bg: 'bg-emerald-800', text: 'text-white', border: 'border-emerald-700' }
}

// ── Form helpers ─────────────────────────────────────────────────────────────
function initialFormState() {
  return {
    id: null, code: '', name: '', unit_type: '', npsn: '', email: '', phone: '',
    program_type: 'fullday', jam_masuk: '07:15', jam_pulang: '16:00', jam_kegiatan: '07:15 - 16:00 WIB',
    latitude: '', longitude: '', radius_meter: 100,
    address: '', city: 'Padang', province: 'Sumatera Barat', district: '', subdistrict: '', postal_code: '',
    principal_name: '', principal_nip: '', established_year: new Date().getFullYear(),
    accreditation: 'A', sk_pendirian: '', tgl_sk: '', logo_url: '', is_active: true, description: '',
  }
}

function parseFromApi(item) {
  const meta = item?.metadata || {}
  const progType = item?.program_type || meta.program_type || (item?.level?.toUpperCase().includes('PONPES') || item?.level?.toUpperCase().includes('MAHAD') ? 'boarding' : 'fullday')
  return {
    id: item?.id || null,
    code: item?.code || '',
    name: item?.name || '',
    unit_type: item?.level || '',
    program_type: progType,
    jam_masuk: item?.jam_masuk || meta.jam_masuk || (progType === 'boarding' ? '04:00' : '07:15'),
    jam_pulang: item?.jam_pulang || meta.jam_pulang || (progType === 'boarding' ? '21:00' : '16:00'),
    jam_kegiatan: item?.jam_kegiatan || meta.jam_kegiatan || (progType === 'boarding' ? '24 Jam (Pengasuhan Asrama & Halaqah)' : '07:15 - 16:00 WIB'),
    latitude: item?.latitude ?? meta.latitude ?? '',
    longitude: item?.longitude ?? meta.longitude ?? '',
    radius_meter: item?.radius_meter ?? meta.radius_meter ?? 100,
    npsn: meta.npsn || '',
    email: meta.email || '',
    phone: meta.phone || '',
    address: meta.address || '',
    city: meta.city || '',
    province: meta.province || '',
    district: meta.district || meta.kecamatan || '',
    subdistrict: meta.subdistrict || meta.kelurahan || '',
    postal_code: meta.postal_code || '',
    principal_name: meta.principal_name || meta.kepala_unit || '',
    principal_nip: meta.principal_nip || '',
    established_year: meta.established_year || '',
    accreditation: meta.accreditation || '',
    sk_pendirian: meta.sk_pendirian || '',
    tgl_sk: meta.tgl_sk || '',
    logo_url: meta.logo_url || '',
    is_active: item?.is_active ?? true,
    description: item?.description || '',
    total_siswa: item?.total_siswa ?? 0,
    total_siswa_laki: item?.total_siswa_laki ?? 0,
    total_siswa_perempuan: item?.total_siswa_perempuan ?? 0,
    total_guru: item?.total_guru ?? 0,
    total_kelas: meta.total_kelas || 0,
    total_rombel: meta.total_rombel || 0,
  }
}

function makePayload(form) {
  const lat = form.latitude !== '' && form.latitude !== null && !isNaN(Number(form.latitude)) ? Number(form.latitude) : null
  const lng = form.longitude !== '' && form.longitude !== null && !isNaN(Number(form.longitude)) ? Number(form.longitude) : null
  const rad = form.radius_meter !== '' && form.radius_meter !== null && !isNaN(Number(form.radius_meter)) ? Number(form.radius_meter) : 100

  return {
    code: form.code, name: form.name, level: form.unit_type,
    program_type: form.program_type || 'fullday',
    jam_masuk: form.jam_masuk || null,
    jam_pulang: form.jam_pulang || null,
    jam_kegiatan: form.jam_kegiatan || null,
    latitude: lat,
    longitude: lng,
    radius_meter: rad,
    description: form.description, is_active: form.is_active,
    metadata: {
      program_type: form.program_type || 'fullday',
      jam_masuk: form.jam_masuk || '',
      jam_pulang: form.jam_pulang || '',
      jam_kegiatan: form.jam_kegiatan || '',
      latitude: lat,
      longitude: lng,
      radius_meter: rad,
      npsn: form.npsn, email: form.email, phone: form.phone,
      address: form.address, city: form.city, province: form.province,
      district: form.district, subdistrict: form.subdistrict,
      postal_code: form.postal_code, principal_name: form.principal_name,
      principal_nip: form.principal_nip, established_year: form.established_year,
      accreditation: form.accreditation, sk_pendirian: form.sk_pendirian,
      tgl_sk: form.tgl_sk, logo_url: form.logo_url,
    },
  }
}




// ── Inline alert (replaces Swal for validation/error messages) ───────────────
function InlineAlert({ type = 'error', message, onClose }) {
  if (!message) return null
  const map = {
    error: { bg: 'bg-rose-50 border-rose-300 dark:border-rose-800 text-rose-700', Icon: XCircle },
    warning: { bg: 'bg-amber-50 border-amber-300 dark:border-amber-800 text-amber-700', Icon: AlertTriangle },
    success: { bg: 'bg-emerald-50 border-emerald-300 dark:border-emerald-800 text-emerald-700', Icon: CheckCircle2 },
  }
  const { bg, Icon } = map[type] || map.error
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold ${bg}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}



// ── DEFINISI TONE WARNA KARTU KPI MODERN (HEROUI SPEC) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-400',
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
    card: 'rounded-container border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
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
    card: 'rounded-container border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
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
    card: 'rounded-container border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
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
    card: 'rounded-container border-2 border-indigo-300 dark:border-indigo-700/80 bg-gradient-to-b from-[#E0E7FF]/70 via-[#E0E7FF]/20 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-indigo-400',
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
    card: 'rounded-container border-2 border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-400',
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
    card: 'rounded-container border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-400',
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
    card: 'rounded-container border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
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
    card: 'rounded-container border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
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
    card: 'rounded-container border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
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
    card: 'rounded-container border-2 border-emerald-300 dark:border-emerald-800/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-200/80',
    glow: 'bg-slate-400/20 group-hover:bg-slate-400/30',
    iconBox: '!bg-slate-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-slate-600 !text-white shadow-xs rounded-full',
    tag: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-slate-800 dark:text-slate-300',
    title: 'text-slate-800 dark:text-slate-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-slate-700 dark:text-slate-400 font-bold',
    subtext: 'text-slate-700 dark:text-slate-400 font-bold',
    cta: 'text-slate-700 dark:text-slate-400 font-bold',
    divider: 'border-emerald-100/80 dark:border-emerald-900/40/60',
  },
}

function HeroStatusBadge({ active, activeLabel = 'Aktif', inactiveLabel = 'Nonaktif' }) {
  return (
    <HeroChip
      size="sm"
      variant="soft"
      color={active ? 'success' : 'default'}
      className={cn(
        "font-bold text-xs inline-flex items-center gap-1.5",
        active
          ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
          : "bg-slate-100 text-slate-600 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-800/60"
      )}
    >
      <span className={cn("inline-block size-1.5 rounded-full shrink-0", active ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
      <HeroChip.Label>{active ? activeLabel : inactiveLabel}</HeroChip.Label>
    </HeroChip>
  )
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, ctaText = 'Rincian Unit', tone = 'emerald', onClick }) {
  const toneMap = { emerald: 'emerald', indigo: 'indigo', violet: 'indigo', teal: 'emerald', amber: 'amber', sky: 'sky' }
  return (
    <KpiStatCard
      title={label}
      value={value ?? '0'}
      description={subtext}
      badge={tag}
      icon={Icon}
      variant={toneMap[tone] || 'emerald'}
      onClick={onClick}
      footerAction={onClick ? { label: ctaText, onClick } : undefined}
    />
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Main Page Component
// ════════════════════════════════════════════════════════════════════════════
export default function EducationUnitsPage() {
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  // ── Auth & Permissions ──────────────────────────────────────────────────
  const user = useAuthStore(state => state.user)
  const sitePengaturan = usePengaturanStore(state => state.pengaturan)
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const permissions = Array.isArray(user?.permissions) ? user.permissions : []
  const isSuperAdmin = Boolean(user) && (Boolean(user?.is_superadmin) || roles.some(r => String(r).toLowerCase().replace(/[\s_-]+/g, '') === 'superadmin'))
  const isFoundationRole = isFoundationUser(user)
  const canCreate = !isFoundationRole && Boolean(user) && (isSuperAdmin || permissions.includes('unit.create'))
  const canUpdate = !isFoundationRole && Boolean(user) && (isSuperAdmin || permissions.includes('unit.update'))
  const canDelete = !isFoundationRole && Boolean(user) && (isSuperAdmin || permissions.includes('unit.delete'))

  // ── Filter & Pagination State ───────────────────────────────────────────
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('')
  const [selectedCityFilter, setSelectedCityFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  // ── UI State ────────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormState())
  const [formAlert, setFormAlert] = useState(null)
  const [formMutationAlert, setFormMutationAlert] = useState(null)
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false)
  const [detailUnit, setDetailUnit] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('Informasi')
  const [activeKpiModal, setActiveKpiModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importPreviewData, setImportPreviewData] = useState([])
  const [importedData, setImportedData] = useState([])
  const [isImporting, setIsImporting] = useState(false)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [duplicateModalData, setDuplicateModalData] = useState(null)
  const [mapSearchTriggerKey, setMapSearchTriggerKey] = useState(null)

  // ── Modal 2 (Quick Add Employee) State & Queries ──────────────────────
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false)
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    nip: '',
    email: '',
    phone: '',
    jabatan_name: 'Kepala Sekolah',
  })
  const [employeeFormAlert, setEmployeeFormAlert] = useState(null)

  const employeesQuery = useQuery({
    queryKey: ['employees-dropdown'],
    queryFn: async () => {
      try {
        const res = await employeeService.getDaftar({ per_page: 500 })
        const list = res?.data?.data || res?.data || []
        return Array.isArray(list) ? list : []
      } catch {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })
  const employeesList = employeesQuery.data || []

  const employeeSelectOptions = useMemo(() => {
    return employeesList.map(emp => {
      const empName = emp.name || emp.nama_lengkap || 'Tanpa Nama'
      const empNip = emp.nip || emp.nipy
      const jabatan = emp.jabatan_name || emp.position?.name
      return {
        value: String(emp.id),
        label: empName,
        subtext: empNip ? `NIP/NIPY: ${empNip}` : undefined,
        badge: jabatan || undefined,
      }
    })
  }, [employeesList])

  const selectedEmployeeId = useMemo(() => {
    if (!formData.principal_name) return ''
    const found = employeesList.find(x => {
      const name = x.name || x.nama_lengkap
      const nip = x.nip || x.nipy
      if (formData.principal_nip && nip) {
        return String(nip) === String(formData.principal_nip)
      }
      return name && String(name).toLowerCase() === String(formData.principal_name).toLowerCase()
    })
    return found ? String(found.id) : ''
  }, [employeesList, formData.principal_name, formData.principal_nip])

  const accreditationSelectOptions = useMemo(() => [
    { value: 'A', label: 'A (Unggul / Sangat Baik)', badge: 'Unggul' },
    { value: 'B', label: 'B (Baik)', badge: 'Baik' },
    { value: 'C', label: 'C (Cukup)', badge: 'Cukup' },
    { value: 'Belum Terakreditasi', label: 'Belum Terakreditasi', badge: 'Proses' },
  ], [])

  const establishedYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let y = currentYear + 1; y >= 1960; y--) {
      years.push({
        value: String(y),
        label: `${y}`,
        badge: y === currentYear ? 'Tahun Ini' : undefined,
      })
    }
    if (formData.established_year && !years.some(y => String(y.value) === String(formData.established_year))) {
      years.unshift({
        value: String(formData.established_year),
        label: `${formData.established_year}`,
      })
    }
    return years
  }, [formData.established_year])


  const createEmployeeMutation = useMutation({
    mutationFn: payload => employeeService.tambah(payload),
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: ['employees-dropdown'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      const newEmp = res?.data || res
      const newName = newEmp?.name || newEmp?.nama_lengkap || employeeFormData.name
      const newNip = newEmp?.nip || newEmp?.nipy || employeeFormData.nip

      setFormData(prev => ({
        ...prev,
        principal_name: newName,
        principal_nip: newNip || prev.principal_nip,
      }))

      pushToast('Berhasil', `Pegawai ${newName} berhasil ditambahkan dan dipilih sebagai Pimpinan.`)
      setIsAddEmployeeModalOpen(false)
      setEmployeeFormData({
        name: '',
        nip: '',
        email: '',
        phone: '',
        jabatan_name: 'Kepala Sekolah',
      })
      setEmployeeFormAlert(null)
    },
    onError: err => {
      const errors = err?.response?.data?.errors
      let msg = err?.response?.data?.message || 'Gagal menyimpan data pegawai.'
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0]
        if (first) msg = first
      }
      setEmployeeFormAlert(msg)
    },
  })
  // ── Wilayah Options Query (DB API with fallback like StudentFormModal) ────
  const { data: apiProvList = [], isLoading: isProvLoading } = useProvinsiList()
  const { data: apiKotaList = [], isLoading: isKotaLoading } = useKotaOptions(formData.province)
  const { data: apiKecList = [], isLoading: isKecLoading } = useKecamatanOptions(formData.city, formData.province)
  const { data: apiKelList = [], isLoading: isKelLoading } = useKelurahanOptions(formData.district, formData.city, formData.province)

  const provList = useMemo(() => {
    return apiProvList && apiProvList.length > 0 ? apiProvList : getProvinsiList()
  }, [apiProvList])

  const kotaList = useMemo(() => {
    return apiKotaList && apiKotaList.length > 0 ? apiKotaList : getKotaOptions(formData.province)
  }, [apiKotaList, formData.province])

  const kecList = useMemo(() => {
    return apiKecList && apiKecList.length > 0 ? apiKecList : getKecamatanOptions(formData.city)
  }, [apiKecList, formData.city])

  const kelList = useMemo(() => {
    return apiKelList && apiKelList.length > 0 ? apiKelList : getKelurahanOptions(formData.district)
  }, [apiKelList, formData.district])

  const kelListWithOptions = useMemo(() => {
    return enrichKelurahanWithPostal(kelList, formData.district, formData.city, formData.province)
  }, [kelList, formData.district, formData.city, formData.province])


  // ── Main List Query ─────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['education-units', page, perPage, debouncedSearch, selectedTypeFilter, selectedCityFilter, selectedStatusFilter],
    queryFn: () => educationUnitService.getDaftar({
      page,
      per_page: perPage,
      search: debouncedSearch || undefined,
      level: selectedTypeFilter || undefined,
      city: selectedCityFilter || undefined,
      status: selectedStatusFilter || undefined,
    }),
  })

  const rawList = data?.data || []
  const statistics = data?.statistics || {}
  const paginationInfo = {
    total: data?.total ?? rawList.length,
    from: data?.from ?? (rawList.length > 0 ? 1 : 0),
    to: data?.to ?? rawList.length,
    last_page: data?.last_page ?? 1,
    current_page: data?.current_page ?? page,
    per_page: data?.per_page ?? 10,
  }
  const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
  const items = useMemo(() => (data?.data || []).map(parseFromApi), [data?.data])
  const typeOptions = data?.filter_options?.levels || []
  const cityOptions = data?.filter_options?.cities || []

  // ── Dynamic Metric Calculations ───────────────────────────────────────
  const totalUnitCount = useMemo(() => statistics.total_unit ?? items.length ?? 0, [statistics, items])
  const totalSiswaCount = useMemo(() => statistics.total_siswa ?? items.reduce((acc, u) => acc + (u.total_siswa || 0), 0), [statistics, items])
  const totalGuruCount = useMemo(() => statistics.total_tenaga_pendidik ?? items.reduce((acc, u) => acc + (u.total_guru || 0), 0), [statistics, items])
  const activeUnitCount = useMemo(() => statistics.total_unit_aktif ?? items.filter(u => u.is_active).length, [statistics, items])

  // ── Chart Data Calculations ────────────────────────────────────────────
  const studentChartData = useMemo(() => {
    return items.map(u => ({
      name: u.code || u.unit_type || (u.name ? u.name.substring(0, 8) : 'Unit'),
      fullName: u.name,
      siswa: u.total_siswa ?? 0,
      santriwan: u.total_siswa_laki ?? 0,
      santriwati: u.total_siswa_perempuan ?? 0,
    }))
  }, [items])

  const teacherChartData = useMemo(() => {
    const COLORS = ['#059669', '#0D9488', '#0D9488', '#10B981', '#14B8A6', '#34D399', '#F59E0B', '#F43F5E']
    return items.map((u, i) => ({
      name: u.code || u.unit_type || (u.name ? u.name.substring(0, 8) : 'Unit'),
      fullName: u.name,
      value: u.total_guru ?? 0,
      color: COLORS[i % COLORS.length],
    }))
  }, [items])

  // ── Print & Export Handlers (Official PROMPT Print Style with Scope Modes) ──
  const [printScopeMode, setPrintScopeMode] = useState('all') // 'all' | 'pegawai' | 'siswa'

  const getPrintPayload = (mode = printScopeMode) => {
    let title = 'REKAPITULASI MASTER DATA UNIT PENDIDIKAN'
    let filename = `rekap-master-unit-${new Date().toISOString().slice(0, 10)}.pdf`
    let headers = ['NO', 'KODE', 'NAMA UNIT PENDIDIKAN', 'JENIS', 'NPSN', 'KOTA / KABUPATEN', 'PROVINSI', 'PIMPINAN / KEPALA', 'SISWA', 'GURU', 'STATUS']
    let rows = []

    if (mode === 'pegawai') {
      title = 'REKAPITULASI JUMLAH PEGAWAI & GURU MENURUT UNIT PENDIDIKAN'
      filename = `rekap-pegawai-guru-unit-${new Date().toISOString().slice(0, 10)}.pdf`
      headers = ['NO', 'KODE UNIT', 'NAMA UNIT PENDIDIKAN', 'JENIS', 'KOTA / KABUPATEN', 'PIMPINAN UNIT', 'GURU PENDIDIK', 'STAF PEGAWAI', 'TOTAL SDM', 'STATUS']
      rows = items.map((u, index) => {
        const totalG = u.total_guru ?? 0
        const totalP = Math.round(totalG * 0.25)
        return [
          index + 1,
          u.code || '-',
          u.name || '-',
          u.unit_type || '-',
          u.city || '-',
          u.principal_name || '-',
          totalG,
          totalP,
          totalG + totalP,
          u.is_active ? 'Aktif' : 'Nonaktif',
        ]
      })
    } else if (mode === 'siswa') {
      title = 'REKAPITULASI JUMLAH SISWA / SANTRI MENURUT UNIT PENDIDIKAN'
      filename = `rekap-siswa-santri-unit-${new Date().toISOString().slice(0, 10)}.pdf`
      headers = ['NO', 'KODE UNIT', 'NAMA UNIT PENDIDIKAN', 'JENIS', 'KOTA / KABUPATEN', 'SANTRIWAN (L)', 'SANTRIWATI (P)', 'TOTAL SISWA', 'ROMBEL / KELAS', 'STATUS']
      rows = items.map((u, index) => {
        const totalS = u.total_siswa ?? 0
        const sL = u.total_siswa_laki ?? 0
        const sP = u.total_siswa_perempuan ?? 0
        return [
          index + 1,
          u.code || '-',
          u.name || '-',
          u.unit_type || '-',
          u.city || '-',
          sL,
          sP,
          totalS,
          `${u.total_rombel ?? u.total_kelas ?? 0} Rombel`,
          u.is_active ? 'Aktif' : 'Nonaktif',
        ]
      })
    } else {
      rows = items.map((u, index) => [
        index + 1,
        u.code || '-',
        u.name || '-',
        u.unit_type || '-',
        u.npsn || '-',
        u.city || '-',
        u.province || '-',
        u.principal_name || '-',
        u.total_siswa ?? 0,
        u.total_guru ?? 0,
        u.is_active ? 'Aktif' : 'Nonaktif',
      ])
    }

    return { title, filename, headers, rows }
  }

  const handlePrintClean = (mode = printScopeMode) => {
    const { title, headers, rows } = getPrintPayload(mode)
    const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
    printCleanTable({
      title,
      subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${items.length} Unit Sekolah · Mode: ${mode === 'pegawai' ? 'Statistik Pegawai & Guru' : mode === 'siswa' ? 'Statistik Siswa & Santri' : 'Data Master Unit Lengkap'}`,
      headers,
      rows,
      foundationName: orgName,
      systemLogo: sitePengaturan?.logo_url,
    })
  }

  const handleDownloadPdfTable = (mode = printScopeMode) => {
    const { title, filename, headers, rows } = getPrintPayload(mode)
    const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
    downloadPdfTable({
      title,
      filename,
      subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${items.length} Unit Sekolah · Mode: ${mode === 'pegawai' ? 'Statistik Pegawai & Guru' : mode === 'siswa' ? 'Statistik Siswa & Santri' : 'Data Master Unit Lengkap'}`,
      headers,
      rows,
      foundationName: orgName,
      systemLogo: sitePengaturan?.logo_url,
    })
  }

  const hasActiveFilters = !!(search || selectedTypeFilter || selectedCityFilter || selectedStatusFilter)

  const resetFilters = () => {
    setSearch('')
    setSelectedTypeFilter('')
    setSelectedCityFilter('')
    setSelectedStatusFilter('')
    setPage(1)
  }

  // ── Detail Tab Queries ──────────────────────────────────────────────────
  const unitStatsQuery = useQuery({
    queryKey: ['education-unit-detail-stats', detailUnit?.id],
    queryFn: async () => {
      if (!detailUnit?.id) return null
      try { const res = await api.get(`/education-units/${detailUnit.id}`); return res.data?.data || res.data || {} }
      catch { return {} }
    },
    enabled: !!detailUnit?.id && (activeDetailTab === 'Informasi' || activeDetailTab === 'Statistik'),
  })
  const unitGuruQuery = useQuery({
    queryKey: ['education-unit-detail-guru', detailUnit?.id],
    queryFn: async () => {
      if (!detailUnit?.id) return []
      const res = await employeeService.getDaftar({ unit_id: detailUnit.id, per_page: 50 })
      const list = res?.data || res?.data?.data || []
      return Array.isArray(list) ? list : []
    },
    enabled: !!detailUnit?.id && activeDetailTab === 'Guru',
  })
  const unitSiswaQuery = useQuery({
    queryKey: ['education-unit-detail-siswa', detailUnit?.id],
    queryFn: async () => {
      if (!detailUnit?.id) return []
      const res = await studentService.getDaftar({ unit_id: detailUnit.id, per_page: 50 })
      const list = res?.data || res?.data?.data || []
      return Array.isArray(list) ? list : []
    },
    enabled: !!detailUnit?.id && activeDetailTab === 'Siswa',
  })
  const unitKelasQuery = useQuery({
    queryKey: ['education-unit-detail-kelas', detailUnit?.id],
    queryFn: async () => {
      if (!detailUnit?.id) return []
      const res = await kelasService.getDaftar({ unit_pendidikan_id: detailUnit.id, per_page: 50 })
      const list = res?.data || res?.data?.data || []
      return Array.isArray(list) ? list : []
    },
    enabled: !!detailUnit?.id && activeDetailTab === 'Kelas',
  })

  // ── Mutations ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: payload => educationUnitService.tambah(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-units'] })
      pushToast('Berhasil Disimpan', 'Unit pendidikan berhasil ditambahkan.')
      closeFormModal()
    },
    onError: err => {
      const errors = err?.response?.data?.errors
      let msg = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan.'
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0]
        if (first) msg = first
      }
      setFormMutationAlert(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => educationUnitService.ubah({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-units'] })
      pushToast('Berhasil Diubah', 'Unit pendidikan berhasil diperbarui.')
      closeFormModal()
    },
    onError: err => {
      const errors = err?.response?.data?.errors
      let msg = err?.response?.data?.message || 'Terjadi kesalahan saat memperbarui.'
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0]
        if (first) msg = first
      }
      setFormMutationAlert(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: id => educationUnitService.hapus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-units'] })
      pushToast('Berhasil Dihapus', 'Unit pendidikan berhasil dihapus dari sistem.', 'success')
      setDeleteTarget(null)
    },
    onError: err => {
      const msg = err?.response?.data?.message || 'Terjadi kesalahan saat menghapus.'
      pushToast('Gagal Menghapus', msg, 'error')
      setDeleteTarget(null)
    },
  })

  // ── Modal Handlers ─────────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEditMode(false)
    setFormData(initialFormState())
    setCurrentStep(1)
    setFormAlert(null)
    setFormMutationAlert(null)
    setIsFormOpen(true)
  }
  const openEditModal = unit => {
    setIsEditMode(true)
    const progType = unit?.program_type || (unit?.unit_type?.toUpperCase().includes('PONPES') || unit?.unit_type?.toUpperCase().includes('MAHAD') ? 'boarding' : 'fullday')
    setFormData({
      ...initialFormState(),
      ...unit,
      program_type: progType,
      jam_masuk: unit?.jam_masuk || (progType === 'boarding' ? '04:00' : '07:15'),
      jam_pulang: unit?.jam_pulang || (progType === 'boarding' ? '21:00' : '16:00'),
      jam_kegiatan: unit?.jam_kegiatan || (progType === 'boarding' ? '24 Jam (Pengasuhan Asrama & Halaqah)' : '07:15 - 16:00 WIB'),
      latitude: unit?.latitude ?? '',
      longitude: unit?.longitude ?? '',
      radius_meter: unit?.radius_meter ?? 100,
    })
    setCurrentStep(1)
    setFormAlert(null)
    setFormMutationAlert(null)
    setIsFormOpen(true)
  }
  const closeFormModal = () => {
    setIsFormOpen(false)
    setIsEditMode(false)
    setCurrentStep(1)
    setFormData(initialFormState())
    setFormAlert(null)
    setFormMutationAlert(null)
    setShowSaveConfirmDialog(false)
  }

  const handleFormSubmit = e => {
    e?.preventDefault()
    if (!formData.name.trim()) { setFormAlert('Nama Unit Pendidikan wajib diisi!'); return }
    if (!formData.unit_type) { setFormAlert('Jenis Unit wajib dipilih!'); return }
    setFormAlert(null)
    setShowSaveConfirmDialog(true)
  }

  const handleConfirmSave = () => {
    if (isMutating) return
    const payload = makePayload(formData)
    if (isEditMode && formData.id) updateMutation.mutate({ id: formData.id, payload })
    else createMutation.mutate(payload)
    setShowSaveConfirmDialog(false)
  }

  const handleLogoUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setFormData(p => ({ ...p, logo_url: reader.result }))
    reader.readAsDataURL(file)
  }

  // ── Import Handlers ────────────────────────────────────────────────────
  const handleDownloadTemplate = (format = 'csv') => {
    const headers = ['Kode Unit', 'Nama Unit Pendidikan', 'Jenjang', 'NPSN', 'Alamat', 'Kota', 'Provinsi', 'Nama Pimpinan', 'Email', 'No Telepon']
    const sample = ['UNIT-001', 'SDIT Dar el-Iman 1', 'SDIT', '10304567', 'Jl. Gunung Juaro No. 1', 'Padang', 'Sumatera Barat', 'Ustadz Ahmad, S.Pd', 'sdit1@dareliman.sch.id', '0751-123456']

    const csvContent = [
      headers.join(','),
      sample.map(val => `"${val}"`).join(','),
    ].join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = format === 'xlsx' ? 'Template_Import_Unit.csv' : 'Template_Import_Unit.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportedData([])
    setImportPreviewData([])

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'xlsx' || ext === 'xls') {
      // Berkas biner Excel: JANGAN dibaca dengan FileReader.readAsText agar biner ZIP (PK!) tidak rusak.
      // Berkas akan dikirim via FormData dan diparsing native oleh PhpOffice\PhpSpreadsheet di backend.
      setImportPreviewData([
        {
          kode: '(Auto)',
          nama: file.name,
          tingkat: ext.toUpperCase(),
          status: 'Siap Impor',
        },
      ])
      return
    }

    // Parsing aman untuk berkas CSV
    const reader = new FileReader()
    reader.onload = () => {
      const content = String(reader.result || '').replace(/^\uFEFF/, '')
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0)
      if (lines.length <= 1) return

      const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
      const parseCsvLine = line => {
        const values = []
        let value = ''
        let quoted = false
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"' && line[i + 1] === '"' && quoted) {
            value += '"'
            i++
          } else if (char === '"') {
            quoted = !quoted
          } else if (char === delimiter && !quoted) {
            values.push(value.trim())
            value = ''
          } else {
            value += char
          }
        }
        values.push(value.trim())
        return values
      }

      const headerRow = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_\-.:/]/g, ''))
      const findCol = keys => headerRow.findIndex(h => keys.includes(h))

      const idxKode = findCol(['kode', 'kodeunit', 'code', 'unitcode'])
      const idxNama = findCol(['nama', 'namaunit', 'namaunitpendidikan', 'name', 'unitname'])
      const idxTingkat = findCol(['jenjang', 'tingkat', 'level', 'jenjangpendidikan'])
      const idxNpsn = findCol(['npsn'])

      const existingCodes = new Set(
        (rawList || []).map(u => String(u.code || u.kode || '').trim().toLowerCase()).filter(Boolean)
      )
      const existingNames = new Set(
        (rawList || []).map(u => String(u.name || u.nama || '').trim().toLowerCase()).filter(Boolean)
      )

      const dataLines = lines.slice(1)
      const rowsData = dataLines.map(line => {
        const cols = parseCsvLine(line)
        const kode = idxKode !== -1 ? (cols[idxKode] || '') : (cols[1] || cols[0] || '')
        const nama = idxNama !== -1 ? (cols[idxNama] || '') : (cols[2] || cols[1] || '')
        const tingkat = idxTingkat !== -1 ? (cols[idxTingkat] || '') : (cols[3] || cols[2] || '')
        const npsn = idxNpsn !== -1 ? (cols[idxNpsn] || '') : (cols[4] || '')
        const isDuplicate = (kode && existingCodes.has(kode.toLowerCase())) || (nama && existingNames.has(nama.toLowerCase()))

        return {
          kode,
          nama,
          tingkat,
          npsn,
          isDuplicate,
          status: !nama ? 'Tidak valid' : (isDuplicate ? 'Kode/Nama Ada' : 'Valid'),
        }
      })

      setImportPreviewData(rowsData.filter(r => r.nama || r.kode))
    }
    reader.readAsText(file)
  }

  const handleProcessImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      formData.append('overwrite', overwriteExisting ? '1' : '0')
      const res = await educationUnitService.prosesImport(formData)
      const resData = res?.data || res || {}
      setIsImporting(false)
      setImportPreviewData([])
      setImportFile(null)
      setShowImportModal(false)
      queryClient.invalidateQueries({ queryKey: ['education-units'] })

      const totalBerhasil = (resData.berhasil || 0) + (resData.diperbarui || 0)
      const msg = `Impor selesai. ${totalBerhasil} berhasil (${resData.berhasil || 0} baru, ${resData.diperbarui || 0} ditimpa), ${resData.duplikat || 0} duplikat dilewati, ${resData.gagal || 0} gagal.`
      pushToast(
        resData.gagal > 0 && totalBerhasil === 0 ? 'Import Gagal' : 'Import Berhasil',
        msg,
        resData.gagal > 0 && totalBerhasil === 0 ? 'error' : 'success'
      )

      if ((resData.duplicates && resData.duplicates.length > 0) || (resData.errors && resData.errors.length > 0) || resData.diperbarui > 0 || resData.duplikat > 0) {
        setDuplicateModalData(resData)
      }
    } catch (err) {
      setIsImporting(false)
      const msg = err?.response?.data?.message || err.message || 'Gagal memproses impor unit pendidikan.'
      pushToast('Import Gagal', msg, 'error')
    }
  }

  // ── Export Handler ─────────────────────────────────────────────────────
  const handleProcessExport = async () => {
    if (exportFormat === 'pdf') {
      setShowExportModal(false)
      handleDownloadPdfTable(printScopeMode)
      pushToast('Export Berhasil', 'Dokumen PDF unit pendidikan siap dicetak atau diunduh.', 'success')
      return
    }
    setShowExportModal(false)

    await downloadFileFromApi(
      '/education-units/export',
      {
        search: search || undefined,
        level: selectedTypeFilter || undefined,
        city: selectedCityFilter || undefined,
        status: selectedStatusFilter || undefined,
      },
      exportFormat,
      'Data_Unit_Pendidikan'
    )
    pushToast('Export Berhasil', `Data unit pendidikan berhasil diexport ke format .${exportFormat.toUpperCase()}.`, 'success')
  }

  // ── AppDataTable Column Definition ────────────────────────────────────
  const columns = [
    {
      key: 'name',
      label: 'Unit Pendidikan',
      render: (row) => {
        const style = getUnitStyle(row.unit_type)
        return (
          <div className="flex min-w-0 items-center gap-3">
            {row.logo_url ? (
              <img src={row.logo_url} alt="" className="h-9 w-10 shrink-0 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 object-cover shadow-sm" />
            ) : (
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black shadow-sm ${style.bg} ${style.text}`}>
                {row.unit_type || 'UP'}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <HoverCard>
                <HoverCardTrigger
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openDetailModal(row)
                  }}
                  className="inline-block max-w-full truncate text-xs font-bold leading-5 text-slate-900 dark:text-white border-b border-dashed border-emerald-200/80 hover:border-[#059669] transition-colors cursor-pointer"
                  title={row.name}
                >
                  {row.name || '—'}
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-0 overflow-hidden border-2 border-emerald-300/80 bg-white dark:border-emerald-700/80 dark:bg-card-dark shadow-xl rounded-xl">
                  <div className={`relative h-24 w-full ${style.bg} ${style.text} flex items-center justify-center font-black text-xl`}>
                    {row.logo_url ? (
                      <img src={row.logo_url} alt={row.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{row.unit_type || 'UP'}</span>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {row.name}
                      </h4>
                      <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${style.bg} ${style.text} ${style.border}`}>
                        {row.unit_type || '—'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      NPSN: {row.npsn || '—'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {[row.city, row.province].filter(Boolean).join(', ') || 'Lokasi belum dilengkapi'}
                    </p>
                    <button
                      type="button"
                      onClick={() => openDetailModal(row)}
                      className="w-full py-1.5 bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#059669] dark:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all hover:from-emerald-700 hover:to-teal-700 mt-2 cursor-pointer"
                    >
                      Lihat Rincian Data
                    </button>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <span className="flex min-w-0 items-center gap-1.5">
                <small className="truncate text-[10px] font-semibold text-slate-400">{row.code || '—'}</small>
                <AppBadge variant="neutral" className="md:hidden" size="xs">{row.unit_type || '—'}</AppBadge>
              </span>
              <small className="mt-0.5 block truncate text-[10px] text-slate-400 xl:hidden">
                {[row.city, row.province].filter(Boolean).join(', ') || 'Lokasi belum dilengkapi'}
              </small>
            </span>
          </div>
        )
      },
    },
    {
      key: 'unit_type',
      label: 'Jenis & Program',
      className: 'hidden md:table-cell',
      render: (row) => (
        <EducationUnitWithProgramCell
          unitType={row.unit_type}
          programType={row.program_type}
          jamPulang={row.jam_pulang}
        />
      ),
    },
    {
      key: 'statistik',
      label: 'Statistik Civitas',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-200">
          <span className="inline-flex items-center gap-1" title="Total Siswa">
            <GraduationCap className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>{Number(row.total_siswa ?? 0).toLocaleString('id-ID')} Siswa</span>
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="inline-flex items-center gap-1" title="Total Pendidik">
            <UsersRound className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{Number(row.total_guru ?? 0).toLocaleString('id-ID')} Guru</span>
          </span>
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      className: 'text-center',
      render: (row) => <HeroStatusBadge active={row.is_active} inactiveLabel="Nonaktif" />,
    },
  ]
  // ── Mobile Card Renderer ───────────────────────────────────────────────
  const renderMobileCard = ({ row, onView, onEdit, onDelete }) => {
    const style = getUnitStyle(row.unit_type)
    return (
      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-card-dark">
        <div className="flex items-start gap-3">
          {row.logo_url ? (
            <img src={row.logo_url} alt="" className="h-9 w-12 shrink-0 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 object-cover" />
          ) : (
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[10px] font-black ${style.bg} ${style.text}`}>
              {row.unit_type || 'UP'}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">{row.name}</p>
                <p className="text-[10px] font-semibold text-slate-400">{row.code}</p>
              </div>
              <HeroStatusBadge active={row.is_active} inactiveLabel="Nonaktif" />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              {(row.city || row.province) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[row.city, row.province].filter(Boolean).join(', ')}
                </span>
              )}
              {!!row.total_siswa && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {row.total_siswa} siswa
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <ActionDropdown
            onView={onView}
            onEdit={canUpdate ? onEdit : undefined}
            onDelete={canDelete ? onDelete : undefined}
          />
        </div>
      </div>
    )
  }

  const isMutating = createMutation.isPending || updateMutation.isPending

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <PageContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 pb-12"
      >
        {/* ── Breadcrumb ── */}
        <motion.div variants={itemVariants}>
          <AppBreadcrumb
            items={[
              { label: 'Master Data', to: '/dashboard/master/unit-pendidikan' },
              { label: 'Unit Pendidikan' },
            ]}
          />
        </motion.div>

        {/* Header Halaman Modern Hero Card HeroUI */}
        <HeroUiHeader
          variants={itemVariants}
          icon={Building2}
          title="Master Data Unit Pendidikan"
          tag={{ text: 'Manajemen Unit', icon: ShieldCheck }}
          description="Pengelolaan terpadu master data unit pendidikan (TK, SD, SMP, SMA, Ponpes, Ma'had), statistik kesiswaan, dan struktur pendidik."
          badge={{ text: 'Master Unit SIT', icon: Sparkles }}
        />

        {/* ── KPI Summary Cards (ModernKpiCard with MODERN_CARD_TONES) ── */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernKpiCard
              icon={Building2}
              label="Total Unit"
              subtext="Rincian seluruh unit sekolah & ponpes"
              value={isLoading ? '...' : Number(totalUnitCount).toLocaleString('id-ID')}
              tag={isLoading ? '...' : `${totalUnitCount} Unit`}
              ctaText="Rincian Unit"
              tone="emerald"
              onClick={() => setActiveKpiModal('total_unit')}
            />
            <ModernKpiCard
              icon={GraduationCap}
              label="Total Siswa"
              subtext="Distribusi santri & murid aktif"
              value={isLoading ? '...' : Number(totalSiswaCount).toLocaleString('id-ID')}
              tag={isLoading ? '...' : `${totalSiswaCount} Siswa`}
              ctaText="Distribusi Siswa"
              tone="amber"
              onClick={() => setActiveKpiModal('total_siswa')}
            />
            <ModernKpiCard
              icon={UsersRound}
              label="Tenaga Pendidik"
              subtext="Komposisi dewan guru & asatidz"
              value={isLoading ? '...' : Number(totalGuruCount).toLocaleString('id-ID')}
              tag={isLoading ? '...' : `${totalGuruCount} Guru`}
              ctaText="Komposisi Guru"
              tone="blue"
              onClick={() => setActiveKpiModal('total_guru')}
            />
            <ModernKpiCard
              icon={CheckCircle2}
              label="Unit Aktif"
              subtext="Status operasional berjalan lancar"
              value={isLoading ? '...' : Number(activeUnitCount).toLocaleString('id-ID')}
              tag={isLoading ? '...' : `${activeUnitCount} Aktif`}
              ctaText="Status Operasional"
              tone="teal"
              onClick={() => setActiveKpiModal('unit_aktif')}
            />
          </div>
        </motion.div>

        {/* ── Visual Analytics Section (Grafik Murid/Santri & Grafik Perbandingan Guru) ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Grafik 1: Jumlah Murid / Santri per Unit */}
          <article className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 min-h-[72px] h-[72px]">
                <div className="flex items-center gap-3">
                  <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <GraduationCap className="size-4.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                      Grafik Jumlah Murid / Santri
                    </h2>
                    <p className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      Perbandingan total peserta didik terdaftar di tiap unit sekolah
                    </p>
                  </div>
                </div>
                <AppBadge variant="warning" size="sm">
                  {Number(statistics.total_siswa ?? 0).toLocaleString('id-ID')} Siswa
                </AppBadge>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-emerald-200/80 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
                              <p className="text-xs font-bold text-amber-400 mb-1">{data.fullName}</p>
                              <p className="text-xs font-extrabold">Total Siswa: {data.siswa} orang</p>
                              <div className="mt-1 pt-1 border-t border-emerald-200/80 text-[10px] text-slate-300 flex gap-3">
                                <span>Santriwan (L): {data.santriwan}</span>
                                <span>Santriwati (P): {data.santriwati}</span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="siswa" name="Jumlah Siswa" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Distribusi berdasarkan jenjang sekolah</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Terupdate Otomatis</span>
            </div>
          </article>

          {/* Grafik 2: Perbandingan Guru per Unit */}
          <article className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 min-h-[72px] h-[72px]">
                <div className="flex items-center gap-3">
                  <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <UsersRound className="size-4.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                      Grafik Perbandingan Guru
                    </h2>
                    <p className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      Komposisi penyebaran tenaga pendidik & pengajar di setiap unit
                    </p>
                  </div>
                </div>
                <AppBadge variant="success" size="sm" className="font-bold shadow-xs">
                  {Number(statistics.total_tenaga_pendidik ?? 0).toLocaleString("id-ID")} Pendidik
                </AppBadge>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center w-full p-4 space-y-4">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={teacherChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {teacherChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderColor: "#334155",
                          borderRadius: "14px",
                          color: "#F8FAFC",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <strong className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {Number(statistics.total_tenaga_pendidik ?? 0).toLocaleString("id-ID")}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                      TOTAL GURU
                    </span>
                  </div>
                </div>

                {/* Legend Pills Standardized */}
                <div className="w-full grid grid-cols-2 gap-2.5 px-1">
                  {teacherChartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className="size-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums shrink-0">
                        {item.value} guru
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Proporsi guru pengajar per unit</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Terverifikasi</span>
            </div>
          </article>
        </motion.div>

        {/* ── AppDataTable with Toolbar ── */}
        <motion.div variants={itemVariants} id="tabel-unit-pendidikan" className="scroll-mt-6">
          <AppDataTable
            title="Daftar Master Data Unit Pendidikan"
            icon={Building2}
            description="Tabel direktori unit pendidikan, jenjang, status akreditasi, dan manajemen operasional sekolah SIT."
            countLabel={`${Number(statistics.total_unit ?? items.length).toLocaleString("id-ID")} unit`}
            actions={
              <PageToolbarActions
                onPrint={() => setPrintOptionModalOpen(true)}
                onImport={canCreate ? () => setShowImportModal(true) : undefined}
                onExport={(canCreate || permissions.includes('unit.export')) ? () => setShowExportModal(true) : undefined}
                primaryAction={canCreate ? {
                  label: 'Tambah Unit',
                  icon: Plus,
                  onClick: openAddModal,
                } : null}
              />
            }
            columns={columns}
            data={items}
            keyField="id"
            isLoading={isLoading}
            isError={isError}
            errorTitle="Data unit gagal dimuat"
            errorMessage="Periksa koneksi kemudian coba muat ulang."
            onRetry={refetch}
            serverControlled
            // Search (controlled externally via toolbar below)
            search={search}
            onSearchChange={val => { setSearch(val); setPage(1) }}
            searchPlaceholder="Cari nama, kode, lokasi, atau pimpinan..."
            // Filter bar
            filters={
              <div className="flex flex-wrap items-center gap-2">
                {/* Jenis Unit filter */}
                <HeroUiFilterSelect
                  value={selectedTypeFilter}
                  onChange={val => { setSelectedTypeFilter(val); setPage(1) }}
                  options={[{ value: '', label: 'Semua Jenis' }, ...typeOptions.map(t => ({ value: t, label: t }))]}
                  placeholder="Semua Jenis"
                  icon={Building2}
                  ariaLabel="Filter jenis unit"
                  size="sm"
                  className="w-full sm:w-auto min-w-[140px]"
                />
                {/* Kota filter */}
                <HeroUiFilterSelect
                  value={selectedCityFilter}
                  onChange={val => { setSelectedCityFilter(val); setPage(1) }}
                  options={[{ value: '', label: 'Semua Kota' }, ...cityOptions.map(c => ({ value: c, label: c }))]}
                  placeholder="Semua Kota"
                  icon={MapPin}
                  ariaLabel="Filter kota"
                  size="sm"
                  className="w-full sm:w-auto min-w-[140px]"
                />
                {/* Status filter */}
                <HeroUiFilterSelect
                  value={selectedStatusFilter}
                  onChange={val => { setSelectedStatusFilter(val); setPage(1) }}
                  options={[
                    { value: '', label: 'Semua Status' },
                    { value: 'aktif', label: 'Aktif' },
                    { value: 'nonaktif', label: 'Nonaktif' },
                  ]}
                  placeholder="Semua Status"
                  icon={CheckCircle2}
                  ariaLabel="Filter status"
                  size="sm"
                  className="w-full sm:w-auto min-w-[130px]"
                />
                {/* Tampilkan Per Halaman filter */}
                <HeroUiFilterSelect
                  value={perPage}
                  onChange={val => { setPerPage(Number(val)); setPage(1) }}
                  options={[
                    { value: '5', label: '5 per hal' },
                    { value: '10', label: '10 per hal' },
                    { value: '15', label: '15 per hal' },
                    { value: '25', label: '25 per hal' },
                    { value: '50', label: '50 per hal' },
                    { value: '100', label: '100 per hal' },
                  ]}
                  placeholder="10 per hal"
                  ariaLabel="Tampilkan per halaman"
                  size="sm"
                  className="w-full sm:w-auto min-w-[110px]"
                />
                {/* Reset */}
                {hasActiveFilters && (
                  <HeroButton
                    variant="outline"
                    size="sm"
                    onPress={resetFilters}
                    className="h-9 cursor-pointer rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-white hover:bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-emerald-300 font-bold text-xs gap-1.5 px-3 transition-colors inline-flex items-center"
                  >
                    <RefreshCcw className="size-3.5" />
                    <span>Reset</span>
                  </HeroButton>
                )}
              </div>
            }
            // Per-row actions
            actionColumnLabel=""
            onRowClick={row => { setActiveDetailTab('Informasi'); setDetailUnit(row) }}
            onView={row => { setActiveDetailTab('Informasi'); setDetailUnit(row) }}
            onEdit={canUpdate ? row => openEditModal(row) : undefined}
            onDelete={canDelete ? row => setDeleteTarget(row) : undefined}
            // Mobile card
            renderMobileCard={renderMobileCard}
            // Pagination
            showPagination
            page={paginationInfo.current_page}
            totalPages={paginationInfo.last_page}
            totalItems={paginationInfo.total}
            itemsPerPage={paginationInfo.per_page}
            onPageChange={p => setPage(p)}
            meta={paginationInfo}
            // Empty
            emptyTitle="Belum ada unit pendidikan"
            emptyDescription="Ubah pencarian atau filter untuk menampilkan data yang tersedia."
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
 DETAIL MODAL POPUP — HeroUI & Motion Structure
 ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {detailUnit && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="edu-unit-detail-title"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            onMouseDown={e => { if (e.target === e.currentTarget) setDetailUnit(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">

                      <Building2 className="size-6 sm:size-7 h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="edu-unit-detail-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{detailUnit.name || 'Detail Unit Pendidikan'}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Detail Unit
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {[detailUnit.unit_type, detailUnit.city, detailUnit.province].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailUnit(null)}
                    aria-label="Tutup detail unit"
                    className="size-9 flex items-center justify-center rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <X className="size-4 text-rose-600" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body min-h-0 flex-1 overflow-y-auto p-5 text-sm space-y-5">
                  {/* Hero Card */}
                  <div className="flex items-center gap-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
                    {detailUnit.logo_url ? (
                      <img src={detailUnit.logo_url} alt={detailUnit.name} className="h-16 w-16 shrink-0 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 object-cover shadow-sm" />
                    ) : (
                      <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-sm ${getUnitStyle(detailUnit.unit_type).bg} ${getUnitStyle(detailUnit.unit_type).text}`}>
                        {detailUnit.unit_type || 'UP'}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-black text-slate-900 dark:text-white">{detailUnit.name}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <AppBadge variant={detailUnit.is_active ? 'success' : 'danger'} dot>
                          {detailUnit.is_active ? 'Aktif' : 'Nonaktif'}
                        </AppBadge>
                        {detailUnit.unit_type && <AppBadge variant="neutral">{detailUnit.unit_type}</AppBadge>}
                      </div>
                      {detailUnit.principal_name && (
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Pimpinan: {detailUnit.principal_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1.5 overflow-x-auto rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-1.5 dark:border-emerald-800/60 dark:bg-slate-900/40">
                    {['Informasi', 'Statistik', 'Guru', 'Siswa', 'Kelas'].map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveDetailTab(tab)}
                        className={`flex-1 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeDetailTab === tab
                          ? 'bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200'
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab: Informasi */}
                  {activeDetailTab === 'Informasi' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['Kode Unit', detailUnit.code || '-'],
                          ['NPSN', detailUnit.npsn || '-'],
                          ['Akreditasi', detailUnit.accreditation || 'Terakreditasi A'],
                          ['Tahun Berdiri', detailUnit.established_year || '-'],
                          ['Email', detailUnit.email || 'info@sekolah.sch.id'],
                          ['Telepon', detailUnit.phone || '-'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                            <p className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Model Program & Jadwal Kegiatan Card */}
                      <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                            <School className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Model Sistem Pembelajaran & Jam Operasional
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${detailUnit.program_type === 'boarding'
                            ? 'bg-emerald-50 text-emerald-700 dark:text-emerald-300  border-emerald-300 dark:border-emerald-800  dark:bg-emerald-50/70 dark:text-emerald-700 dark:text-emerald-300  dark:border-emerald-800/60 '
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60'
                            }`}>
                            {detailUnit.program_type === 'boarding' ? <Moon className="size-3" /> : <Sun className="size-3" />}
                            {detailUnit.program_type === 'boarding' ? 'Boarding / Pesantren (24 Jam)' : 'Fullday School'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                          <div className="rounded-lg bg-white/80 p-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800/80 dark:border-emerald-800/60">
                            <span className="text-[10px] font-semibold text-slate-400 block">Jam Masuk / KBM</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">{detailUnit.jam_masuk || (detailUnit.program_type === 'boarding' ? '04:00' : '07:15')} WIB</span>
                          </div>
                          <div className="rounded-lg bg-white/80 p-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800/80 dark:border-emerald-800/60">
                            <span className="text-[10px] font-semibold text-slate-400 block">Jam Pulang Siswa/Santri</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">{detailUnit.jam_pulang || (detailUnit.program_type === 'boarding' ? '21:00' : '16:00')} WIB</span>
                          </div>
                          <div className="rounded-lg bg-white/80 p-2 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800/80 dark:border-emerald-800/60">
                            <span className="text-[10px] font-semibold text-slate-400 block">Keterangan Kegiatan</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{detailUnit.jam_kegiatan || (detailUnit.program_type === 'boarding' ? '24 Jam Pengasuhan' : '07:15 - 16:00 WIB')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Titik Peta & Geofencing Card */}
                      {(detailUnit.latitude || detailUnit.longitude) && (
                        <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-3.5 dark:border-emerald-300 dark:border-emerald-800 dark:bg-emerald-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                              <MapPin className="size-4 text-emerald-700 dark:text-emerald-300  dark:text-emerald-700 dark:text-emerald-300  shrink-0" />
                              Titik Koordinat Map & Geofencing Presensi
                            </div>
                            <p className="text-xs font-mono text-slate-600 dark:text-slate-300">
                              Lat: <span className="font-bold">{detailUnit.latitude}</span>, Lng: <span className="font-bold">{detailUnit.longitude}</span> (Radius: {detailUnit.radius_meter || 100}m)
                            </p>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${detailUnit.latitude},${detailUnit.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-1.5 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
                          >
                            <ExternalLink className="size-3.5" /> Buka Google Maps
                          </a>
                        </div>
                      )}

                      {/* Alamat Lengkap */}
                      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3.5 dark:border-emerald-800/60 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                          <MapPin className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          Alamat Lengkap Unit
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                          {detailUnit.address || 'Alamat Belum Dilengkapi'}{detailUnit.subdistrict ? `, Kel. ${detailUnit.subdistrict}` : ''}{detailUnit.district ? `, Kec. ${detailUnit.district}` : ''}{detailUnit.city ? `, Kota/Kab. ${detailUnit.city}` : ''}{detailUnit.province ? `, Prov. ${detailUnit.province}` : ''}{detailUnit.postal_code ? ` ${detailUnit.postal_code}` : ''}
                        </p>
                      </div>

                      {/* Gender Breakdown Siswa (Laki-laki & Perempuan) */}
                      {(() => {
                        const totalS = Number(unitStatsQuery.data?.total_siswa ?? detailUnit.total_siswa ?? 0)
                        const sL = Number(unitStatsQuery.data?.total_siswa_laki ?? detailUnit.total_siswa_laki ?? 0)
                        const sP = Number(unitStatsQuery.data?.total_siswa_perempuan ?? detailUnit.total_siswa_perempuan ?? 0)
                        const pctL = totalS > 0 ? Math.round((sL / totalS) * 100) : 0
                        const pctP = totalS > 0 ? Math.round((sP / totalS) * 100) : 0

                        return (
                          <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/80 p-4 dark:border-emerald-800/60 dark:bg-slate-900/40 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <GraduationCap className="size-4 text-amber-500" />
                                Komposisi Gender Peserta Didik
                              </h4>
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                Total: {totalS.toLocaleString('id-ID')} Siswa
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-xl border-2 border-sky-300 dark:border-sky-800 bg-sky-50/70 p-3 dark:border-emerald-800/60 dark:bg-sky-950/30">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">Siswa Laki-laki (Santriwan)</p>
                                <p className="mt-1 text-xl font-black text-sky-900 dark:text-sky-100 tabular-nums">
                                  {sL.toLocaleString('id-ID')}{' '}
                                  <span className="text-xs font-normal text-sky-600 dark:text-sky-400">
                                    Siswa ({pctL}%)
                                  </span>
                                </p>
                              </div>
                              <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/70 p-3 dark:border-emerald-800/60 dark:bg-rose-950/30">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">Siswa Perempuan (Santriwati)</p>
                                <p className="mt-1 text-xl font-black text-rose-900 dark:text-rose-100 tabular-nums">
                                  {sP.toLocaleString('id-ID')}{' '}
                                  <span className="text-xs font-normal text-rose-600 dark:text-rose-400">
                                    Siswa ({pctP}%)
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })()}

                      {/* Ringkasan SDM Pendidik & Pegawai */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tenaga Pendidik (Guru)</p>
                            <p className="text-base font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{Number(detailUnit.total_guru ?? 0).toLocaleString('id-ID')}</p>
                          </div>
                          <UsersRound className="size-5 text-emerald-500 shrink-0 opacity-60" />
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rombongan Belajar</p>
                            <p className="text-base font-black text-purple-700 dark:text-purple-400 tabular-nums">{Number(detailUnit.total_rombel ?? detailUnit.total_kelas ?? 0).toLocaleString('id-ID')} Rombel</p>
                          </div>
                          <School className="size-5 text-purple-500 shrink-0 opacity-60" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Statistik */}
                  {activeDetailTab === 'Statistik' && (
                    <div className="space-y-4">
                      {unitStatsQuery.isLoading && <AppSkeleton variant="card" className="h-32" />}
                      {unitStatsQuery.isError && (
                        <AppErrorState title="Gagal memuat statistik unit" onRetry={() => unitStatsQuery.refetch()} compact />
                      )}
                      {!unitStatsQuery.isLoading && !unitStatsQuery.isError && (
                        <>
                          {/* Grid 2 Kolom untuk Kartu Statistik */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Kartu Siswa */}
                            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-emerald-700/80 dark:bg-card-dark print:hidden">
                              <div className="flex items-center justify-between">
                                <div className="flex h-9 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                  <GraduationCap className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                  Peserta Didik
                                </span>
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">TOTAL SISWA</p>
                                <p className="mt-0.5 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                                  {Number(unitStatsQuery.data?.statistik?.siswa ?? detailUnit.total_siswa ?? 0).toLocaleString('id-ID')}
                                </p>
                              </div>
                              <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                Siswa terdaftar & aktif di unit ini
                              </p>
                            </div>

                            {/* Kartu Guru */}
                            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-emerald-700/80 dark:bg-card-dark print:hidden">
                              <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">

                                  <UsersRound className="size-6 sm:size-7 h-5 w-5 text-white" />
                                </div>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                  Pendidik
                                </span>
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">TOTAL GURU</p>
                                <p className="mt-0.5 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                                  {Number(unitStatsQuery.data?.statistik?.guru ?? detailUnit.total_guru ?? 0).toLocaleString('id-ID')}
                                </p>
                              </div>
                              <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                Tenaga pendidik & pengajar
                              </p>
                            </div>

                            {/* Kartu Pegawai */}
                            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-emerald-700/80 dark:bg-card-dark print:hidden">
                              <div className="flex items-center justify-between">
                                <div className="flex h-9 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                                  <UsersRound className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-extrabold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                                  Staf / Tendik
                                </span>
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">TOTAL PEGAWAI</p>
                                <p className="mt-0.5 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                                  {Number(unitStatsQuery.data?.statistik?.pegawai ?? 0).toLocaleString('id-ID')}
                                </p>
                              </div>
                              <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                Staf administrasi & kependidikan
                              </p>
                            </div>

                            {/* Kartu Kelas & Rombel */}
                            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-emerald-700/80 dark:bg-card-dark print:hidden">
                              <div className="flex items-center justify-between">
                                <div className="flex h-9 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                                  <School className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                  Rombel
                                </span>
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">KELAS / ROMBEL</p>
                                <div className="mt-0.5 flex items-baseline gap-1.5">
                                  <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                                    {unitStatsQuery.data?.statistik?.kelas ?? detailUnit.total_kelas ?? 0}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">Kelas</span>
                                  <span className="text-xs font-bold text-slate-300 dark:text-slate-600">/</span>
                                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                    {unitStatsQuery.data?.statistik?.rombel ?? detailUnit.total_rombel ?? 0} Rombel
                                  </span>
                                </div>
                              </div>
                              <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                Distribusi kelas & rombongan belajar
                              </p>
                            </div>
                          </div>

                          {/* Ringkasan Rasio & Insight Bar */}
                          <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-4 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:to-slate-800/40">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300">Rasio Pendidik : Peserta Didik</p>
                                <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-400/80">
                                  Perbandingan jumlah guru terhadap siswa terdaftar
                                </p>
                              </div>
                              <div className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-[#059669] shadow-xs dark:bg-slate-800 dark:text-[#10B981] border border-emerald-200/80 dark:border-emerald-800/60">
                                1 : {
                                  (unitStatsQuery.data?.statistik?.guru ?? detailUnit.total_guru ?? 0) > 0
                                    ? Math.round((unitStatsQuery.data?.statistik?.siswa ?? detailUnit.total_siswa ?? 0) / (unitStatsQuery.data?.statistik?.guru ?? detailUnit.total_guru ?? 1))
                                    : 0
                                } Siswa
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Tab: Guru */}
                  {activeDetailTab === 'Guru' && (
                    <div>
                      {unitGuruQuery.isLoading ? <AppSkeleton variant="table" rows={3} cols={3} /> :
                        unitGuruQuery.isError ? <AppErrorState title="Gagal memuat data guru" onRetry={() => unitGuruQuery.refetch()} compact /> :
                          unitGuruQuery.data?.length === 0 ? <AppEmptyState title="Belum ada data guru" description="Tidak ada tenaga pendidik terdaftar pada unit ini." /> :
                            <div className="space-y-2">
                              {unitGuruQuery.data.map(guru => (
                                <div key={guru.id || guru.niy} className="flex items-center gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
                                  <PersonIdentityCell
                                    src={guru.foto || guru.avatar}
                                    name={guru.nama_lengkap || guru.nama || guru.name}
                                    subtitle={guru.position?.name || guru.jabatan || 'Guru / Pendidik'}
                                  />
                                  <HeroStatusBadge active={guru.is_active !== false} />
                                </div>
                              ))}
                            </div>
                      }
                    </div>
                  )}

                  {/* Tab: Siswa */}
                  {activeDetailTab === 'Siswa' && (
                    <div>
                      {unitSiswaQuery.isLoading ? <AppSkeleton variant="table" rows={3} cols={3} /> :
                        unitSiswaQuery.isError ? <AppErrorState title="Gagal memuat data siswa" onRetry={() => unitSiswaQuery.refetch()} compact /> :
                          unitSiswaQuery.data?.length === 0 ? <AppEmptyState title="Belum ada data siswa" description="Tidak ada peserta didik terdaftar aktif pada unit ini." /> :
                            <div className="space-y-2">
                              {unitSiswaQuery.data.map(siswa => (
                                <div key={siswa.id || siswa.nis} className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
                                  <PersonIdentityCell
                                    src={siswa.foto}
                                    name={siswa.nama || siswa.full_name}
                                    subtitle={`NIS: ${siswa.nis || '-'}`}
                                  />
                                  <HeroStatusBadge active={siswa.is_active !== false} />
                                </div>
                              ))}
                            </div>
                      }
                    </div>
                  )}

                  {/* Tab: Kelas */}
                  {activeDetailTab === 'Kelas' && (
                    <div>
                      {unitKelasQuery.isLoading ? <AppSkeleton variant="table" rows={3} cols={3} /> :
                        unitKelasQuery.isError ? <AppErrorState title="Gagal memuat data kelas" onRetry={() => unitKelasQuery.refetch()} compact /> :
                          unitKelasQuery.data?.length === 0 ? <AppEmptyState title="Belum ada data kelas" description="Tidak ada rombel/kelas terdaftar pada unit ini." /> :
                            <div className="space-y-2">
                              {unitKelasQuery.data.map(kelas => {
                                const namaKelas = typeof kelas.nama_kelas === 'object' ? (kelas.nama_kelas?.name || '-') : (kelas.nama_kelas || kelas.name || '-')
                                return (
                                  <div key={kelas.id || namaKelas} className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:border-emerald-800/60 dark:bg-slate-800/50">
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 dark:text-white">{namaKelas}</p>
                                      <p className="text-[10px] text-slate-500">{kelas.tingkat || kelas.level || ''}</p>
                                    </div>
                                    <HeroStatusBadge active={kelas.is_active !== false} />
                                  </div>
                                )
                              })}
                            </div>
                      }
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
                  <button
                    type="button"
                    onClick={() => setDetailUnit(null)}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                      <X className="size-3.5 text-rose-600" strokeWidth={2.2} />
                    </div>
                    <span>Tutup</span>
                  </button>
                  {canUpdate && (
                    <button
                      type="button"
                      onClick={() => { const t = detailUnit; setDetailUnit(null); openEditModal(t) }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 text-xs font-extrabold shadow-sm hover:scale-[1.02] transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                        <Pencil className="size-3.5 text-emerald-600" strokeWidth={2.25} />
                      </div>
                      <span>Ubah Data Unit</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
 KPI CARDS DRILL-DOWN MODAL — Interactive Analytics Breakdown
 ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeKpiModal && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            onMouseDown={e => { if (e.target === e.currentTarget) setActiveKpiModal(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-4xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                      {activeKpiModal === 'total_unit' && <Building2 className="h-5 w-5 text-slate-600" strokeWidth={2.25} />}
                      {activeKpiModal === 'total_siswa' && <GraduationCap className="h-5 w-5 text-amber-600" strokeWidth={2.25} />}
                      {activeKpiModal === 'total_guru' && <UsersRound className="h-5 w-5 text-current" strokeWidth={2.25} />}
                      {activeKpiModal === 'unit_aktif' && <CheckCircle2 className="h-5 w-5 text-current" strokeWidth={2.25} />}
                    </div>
                    <div>
                      <h3 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>
                          {activeKpiModal === 'total_unit' && 'Analisis Total Unit Pendidikan Terdaftar'}
                          {activeKpiModal === 'total_siswa' && 'Distribusi Siswa (Santriwan & Santriwati)'}
                          {activeKpiModal === 'total_guru' && 'Distribusi Tenaga Pendidik & Guru Aktif'}
                          {activeKpiModal === 'unit_aktif' && 'Status Operasional Unit Pendidikan Aktif'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Metrik KPI
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Rincian data agregat berdasarkan unit pendidikan di seluruh jaringan yayasan
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    aria-label="Tutup modal"
                    className="size-9 flex items-center justify-center rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <X className="size-4 text-rose-600" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Unit Terdaftar</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{Number(statistics.total_unit ?? items.length ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Siswa Active</p>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{Number(statistics.total_siswa ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Guru Aktif</p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{Number(statistics.total_tenaga_pendidik ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* List / Table of Items */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-500">
                      Daftar Breakdown Per Unit Sekolah
                    </h4>

                    {items.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">Tidak ada data unit tersedia.</div>
                    ) : (
                      <div className="divide-y divide-emerald-100/80 rounded-xl border border-emerald-200/80 bg-white dark:divide-slate-800 dark:border-emerald-800/60 dark:bg-slate-800/40">
                        {items
                          .filter(u => activeKpiModal !== 'unit_aktif' || u.is_active)
                          .map((u, idx) => {
                            const uStyle = getUnitStyle(u.unit_type)
                            const totalS = u.total_siswa ?? 0
                            const sLaki = u.total_siswa_laki ?? 0
                            const sPerempuan = u.total_siswa_perempuan ?? 0
                            return (
                              <div key={u.id || idx} className="flex flex-wrap items-center justify-between gap-3 p-3.5 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black ${uStyle.bg} ${uStyle.text}`}>
                                    {u.unit_type || 'UP'}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                                      {u.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      NPSN: {u.npsn || '—'} · {[u.city, u.province].filter(Boolean).join(', ') || 'Lokasi belum disetel'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs">
                                  {activeKpiModal === 'total_siswa' && (
                                    <div className="text-right">
                                      <p className="font-extrabold text-slate-800 dark:text-slate-200">
                                        {Number(totalS).toLocaleString('id-ID')} Siswa
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        L: {sLaki} · P: {sPerempuan}
                                      </p>
                                    </div>
                                  )}
                                  {activeKpiModal === 'total_guru' && (
                                    <div className="text-right">
                                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {Number(u.total_guru ?? 0).toLocaleString('id-ID')} Guru
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        Rasio 1:{u.total_guru > 0 ? Math.round(totalS / u.total_guru) : 0}
                                      </p>
                                    </div>
                                  )}
                                  {(activeKpiModal === 'total_unit' || activeKpiModal === 'unit_aktif') && (
                                    <div className="text-right">
                                      <p className="font-bold text-slate-700 dark:text-slate-300">
                                        {totalS} Siswa / {u.total_guru ?? 0} Guru
                                      </p>
                                      <HeroStatusBadge active={u.is_active} />
                                    </div>
                                  )}

                                  <HeroButton
                                    variant="outline"
                                    size="sm"
                                    onPress={() => { setActiveKpiModal(null); setActiveDetailTab('Informasi'); setDetailUnit(u) }}
                                    className="text-xs font-bold"
                                  >
                                    Lihat Detail &rarr;
                                  </HeroButton>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    Menampilkan rincian agregat unit pendidikan Dareliman Edu
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveKpiModal(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs px-4 py-2 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <X className="size-4 text-rose-600" />
                    <span>Tutup Rincian</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
 FORM MODAL (Add / Edit) — Step Wizard
 ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isFormOpen && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="edu-unit-form-title"
            onMouseDown={e => { if (e.target === e.currentTarget) closeFormModal() }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-white shadow-md shrink-0 border",
                      isEditMode
                        ? "bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm"
                        : "bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm"
                    )}>
                      {isEditMode ? (
                        <Pencil className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
                      ) : (
                        <School className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
                      )}
                    </div>
                    <div>
                      <h3 id="edu-unit-form-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{isEditMode ? 'Edit Unit Pendidikan' : 'Tambah Unit Pendidikan'}</span>
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                          isEditMode
                            ? "bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-emerald-800/60"
                            : "bg-emerald-50 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
                        )}>
                          <Sparkles className="size-3" />
                          {isEditMode ? 'Update Data' : 'Unit Baru'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Langkah {currentStep} dari 4 · {
                          currentStep === 1 ? 'Informasi Utama Unit' :
                            currentStep === 2 ? 'Alamat & Lokasi Fisik' :
                              currentStep === 3 ? 'Kepala Sekolah & SK' :
                                'Ringkasan Data & Konfirmasi'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeFormModal}
                    aria-label="Tutup form"
                    className="size-9 flex items-center justify-center rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <X className="size-4 text-rose-600" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Step Wizard Indicator */}
                <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-2.5 dark:border-emerald-800/60 dark:bg-slate-900/50">
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    {[
                      { step: 1, label: 'Info Unit', icon: Building2 },
                      { step: 2, label: 'Alamat', icon: MapPin },
                      { step: 3, label: 'Pimpinan', icon: UsersRound },
                      { step: 4, label: 'Konfirmasi', icon: CheckCircle2 },
                    ].map(s => {
                      const isActive = currentStep === s.step
                      const isDone = currentStep > s.step
                      return (
                        <button
                          key={s.step}
                          type="button"
                          onClick={() => setCurrentStep(s.step)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer ${isActive
                            ? 'bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50'
                            : isDone
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100/80 border-2 border-emerald-300 dark:border-emerald-800'
                              : 'bg-white text-slate-400 border border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/60 dark:border-emerald-800/60 dark:text-slate-500'
                            }`}
                        >
                          <s.icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                          <span className="truncate">{s.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Body */}
                <div className="min-h-0 flex-1 overflow-y-auto p-6 pb-8 space-y-4">
                  {(formAlert || formMutationAlert) && (
                    <InlineAlert
                      type={formMutationAlert ? 'error' : 'warning'}
                      message={formMutationAlert || formAlert}
                      onClose={() => { setFormAlert(null); setFormMutationAlert(null) }}
                    />
                  )}

                  {/* Step 1: Informasi */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2">
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Building2 className="size-4 text-[#059669] dark:text-[#10B981]" />
                          Informasi Utama Unit Pendidikan
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">* Wajib diisi</span>
                      </div>

                      {/* Logo upload */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Foto / Logo Unit</label>
                        {formData.logo_url ? (
                          <div className="flex items-center gap-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30">
                            <img src={formData.logo_url} alt="Logo" className="h-14 w-14 shrink-0 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 object-cover shadow-xs" />
                            <div>
                              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Logo unit terpasang</p>
                              <button type="button" onClick={() => setFormData(p => ({ ...p, logo_url: '' }))} className="mt-1 text-xs font-bold text-rose-600 hover:underline cursor-pointer">Hapus & Upload Ulang</button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 p-6 text-center transition-all hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:hover:border-emerald-200/80">
                            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-xs">
                              <Upload className="size-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Klik untuk Unggah Logo Unit</span>
                            <span className="mt-0.5 text-[10px] text-slate-400">Format PNG, JPG maks 2MB</span>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* Nama Unit */}
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Nama Unit Pendidikan <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            <Building2 className="size-4" />
                          </div>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Contoh: Nama Unit Sekolah"
                            value={formData.name}
                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                            className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                          />
                        </div>
                        <p className="text-xs font-medium text-slate-400">Nama resmi unit pendidikan yang terdaftar</p>
                      </div>

                      {/* Kode Unit & NPSN */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label htmlFor="code" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            Kode Unit
                          </label>
                          <div className="relative flex items-center">
                            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                              <Tag className="size-4" />
                            </div>
                            <input
                              id="code"
                              name="code"
                              type="text"
                              placeholder="Contoh: SDIT-002"
                              value={formData.code}
                              onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
                              className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="npsn" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            NPSN
                          </label>
                          <div className="relative flex items-center">
                            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                              <Hash className="size-4" />
                            </div>
                            <input
                              id="npsn"
                              name="npsn"
                              type="text"
                              placeholder="Nomor Pokok Sekolah Nasional"
                              value={formData.npsn}
                              onChange={e => setFormData(p => ({ ...p, npsn: e.target.value }))}
                              className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email & Telepon */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            Email Resmi
                          </label>
                          <div className="relative flex items-center">
                            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                              <Mail className="size-4" />
                            </div>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="info@sekolah.sch.id"
                              value={formData.email}
                              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                              className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            No. Telepon / Layanan
                          </label>
                          <div className="relative flex items-center">
                            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                              <Phone className="size-4" />
                            </div>
                            <input
                              id="phone"
                              name="phone"
                              type="text"
                              placeholder="0751-xxxxxx / 08xxxxxxxxxx"
                              value={formData.phone}
                              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                              className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Jenis Unit */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Jenis Unit <span className="text-rose-500">*</span>
                        </label>
                        <HeroUiFilterSelect
                          value={formData.unit_type}
                          onChange={val => setFormData(p => ({ ...p, unit_type: val }))}
                          options={[
                            { value: '', label: '-- Pilih Jenis Unit --' },
                            ...(typeOptions.length > 0
                              ? typeOptions
                              : ['TKIT', 'TAUD', 'SDIT', 'MIT', 'SMPIT', 'SMAIT', 'PONPES', 'Mahad']
                            ).map(t => ({ value: t, label: t }))
                          ]}
                          placeholder="-- Pilih Jenis Unit --"
                          icon={School}
                          ariaLabel="Pilih jenis unit pendidikan"
                          size="md"
                          className="w-full"
                        />
                      </div>

                      {/* Model Program & Jam Kegiatan Unit */}
                      <div className="space-y-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <School className="size-4 text-emerald-600 dark:text-emerald-400" />
                            Model Sistem Pembelajaran <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border-2 border-emerald-300 dark:border-emerald-800">
                            Fullday vs Boarding
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Card Fullday */}
                          <div
                            onClick={() => {
                              setFormData(p => ({
                                ...p,
                                program_type: 'fullday',
                                jam_masuk: p.jam_masuk || '07:15',
                                jam_pulang: p.jam_pulang && p.jam_pulang !== '21:00' ? p.jam_pulang : '16:00',
                                jam_kegiatan: p.jam_kegiatan && !p.jam_kegiatan.includes('24 Jam') ? p.jam_kegiatan : '07:15 - 16:00 WIB',
                              }))
                            }}
                            className={`relative flex items-start gap-3 rounded-xl border-2 p-3 transition-all cursor-pointer ${formData.program_type === 'fullday'
                              ? 'border-emerald-200/80 bg-white shadow-sm ring-2 ring-emerald-500/20 dark:bg-slate-800 dark:border-emerald-800/60'
                              : 'border-emerald-200/80 bg-white/70 hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-800/60'
                              }`}
                          >
                            <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${formData.program_type === 'fullday'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                              }`}>
                              <Sun className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-slate-900 dark:text-white">Fullday School</p>
                                {formData.program_type === 'fullday' && (
                                  <span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900/50" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                Siswa pulang harian sore hari. Kemitraan KBM sekolah & pengasuhan rumah.
                              </p>
                            </div>
                          </div>

                          {/* Card Boarding */}
                          <div
                            onClick={() => {
                              setFormData(p => ({
                                ...p,
                                program_type: 'boarding',
                                jam_masuk: p.jam_masuk || '04:00',
                                jam_pulang: p.jam_pulang && p.jam_pulang !== '16:00' ? p.jam_pulang : '21:00',
                                jam_kegiatan: p.jam_kegiatan && !p.jam_kegiatan.includes('16:00') ? p.jam_kegiatan : '24 Jam (Pengasuhan Asrama & Halaqah)',
                              }))
                            }}
                            className={`relative flex items-start gap-3 rounded-xl border-2 p-3 transition-all cursor-pointer ${formData.program_type === 'boarding'
                              ? 'border-emerald-200/80  bg-white shadow-sm ring-2 ring-emerald-500/20 dark:bg-slate-800 dark:border-emerald-800/60 '
                              : 'border-emerald-200/80 bg-white/70 hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-800/60'
                              }`}
                          >
                            <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${formData.program_type === 'boarding'
                              ? 'bg-emerald-50 text-emerald-700  text-white'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                              }`}>
                              <Moon className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-slate-900 dark:text-white">Boarding / Pesantren</p>
                                {formData.program_type === 'boarding' && (
                                  <span className="size-2 rounded-full bg-emerald-50 text-emerald-700  ring-4 ring-emerald-100 dark:ring-emerald-900/50" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                Santri mukim asrama 24 jam. Pengasuhan intensif, halaqah quran & musyrif.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Jam Masuk, Jam Pulang, Jam Kegiatan */}
                        <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label htmlFor="jam_masuk" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Jam Masuk / Mulai
                            </label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
                                <Clock className="size-3.5" />
                              </div>
                              <input
                                id="jam_masuk"
                                type="time"
                                value={formData.jam_masuk}
                                onChange={e => setFormData(p => ({ ...p, jam_masuk: e.target.value }))}
                                className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor="jam_pulang" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Jam Pulang Siswa/Santri
                            </label>
                            <div className="relative flex items-center">
                              <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
                                <Clock className="size-3.5" />
                              </div>
                              <input
                                id="jam_pulang"
                                type="time"
                                value={formData.jam_pulang}
                                onChange={e => setFormData(p => ({ ...p, jam_pulang: e.target.value }))}
                                className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor="jam_kegiatan" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Keterangan Jam Kegiatan
                            </label>
                            <div className="relative flex items-center">
                              <input
                                id="jam_kegiatan"
                                type="text"
                                placeholder="07:15 - 16:00 WIB"
                                value={formData.jam_kegiatan}
                                onChange={e => setFormData(p => ({ ...p, jam_kegiatan: e.target.value }))}
                                className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status switch card */}
                      <div
                        onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                        className={`group relative flex items-center justify-between gap-3.5 rounded-xl border-2 p-3.5 sm:p-4 transition-all duration-200 cursor-pointer ${formData.is_active
                          ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark shadow-xs shadow-sm dark:border-emerald-800/60 dark:bg-card-dark'
                          : 'border-emerald-200/80 bg-slate-50/60 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/60 dark:bg-slate-900/40 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
                          }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Squircle Status Icon */}
                          <div
                            className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${formData.is_active
                              ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark text-[#059669] shadow-xs dark:border-emerald-800/60 dark:from-emerald-950/80 dark:to-teal-950/60 dark:text-[#10B981]'
                              : 'border-emerald-200/80 bg-white text-slate-400 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-500'
                              }`}
                          >
                            {formData.is_active ? (
                              <ShieldCheck className="size-5.5 transition-transform group-hover:scale-110" strokeWidth={2.25} />
                            ) : (
                              <Power className="size-5 transition-transform group-hover:scale-110 opacity-70" strokeWidth={2} />
                            )}
                          </div>

                          {/* Text labels */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-slate-900 dark:text-white">
                                Status Operasional Unit
                              </p>
                              {formData.is_active && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60">
                                  <Sparkles className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                                  Aktif
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              Aktifkan agar unit dapat dipilih pada transaksi & data siswa
                            </p>
                          </div>
                        </div>

                        {/* Switch Control & Status Text */}
                        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                          <span
                            className={`text-xs font-black transition-colors ${formData.is_active
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-slate-500'
                              }`}
                          >
                            {formData.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={formData.is_active}
                            aria-label="Toggle status operasional unit"
                            onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${formData.is_active
                              ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#059669] dark:text-white shadow-sm'
                              : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                          >
                            <span
                              className={`pointer-events-none inline-flex size-5.5 items-center justify-center transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${formData.is_active ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                            >
                              {formData.is_active ? (
                                <Check className="size-3 text-emerald-700" strokeWidth={3} />
                              ) : (
                                <span className="size-1.5 rounded-full bg-slate-400" />
                              )}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Alamat */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2">
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="size-4 text-[#059669] dark:text-[#10B981]" />
                          Alamat & Wilayah Operasional
                        </h3>
                      </div>

                      {/* Alamat Lengkap */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="address" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            Alamat Lengkap Unit
                          </label>
                          <button
                            type="button"
                            onClick={() => setMapSearchTriggerKey(Date.now())}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 px-2.5 py-1 text-xs font-bold border-2 border-emerald-300 dark:border-emerald-800 transition-all cursor-pointer shadow-2xs"
                            title="Langsung arahkan pin peta ke alamat yang Anda ketik ini"
                          >
                            <Compass className="size-3 text-emerald-600 dark:text-emerald-400" />
                            Arahkan Pin ke Alamat
                          </button>
                        </div>
                        <div className="relative flex items-start">
                          <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
                            <MapPin className="size-4" />
                          </div>
                          <textarea
                            id="address"
                            name="address"
                            rows={3}
                            placeholder="Jl. Khatib Sulaiman No. 10..."
                            value={formData.address}
                            onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                            className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                          />
                        </div>
                        <p className="text-xs font-medium text-slate-400">
                          Alamat fisik unit pendidikan. Mengetik alamat akan otomatis mengarahkan titik pada peta (atau geser pin pada peta untuk mengisi otomatis alamat).
                        </p>
                      </div>

                      {/* Provinsi & Kota */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SearchableRegionInput
                          label="Provinsi"
                          value={formData.province}
                          onChange={(newProv) => {
                            setFormData((p) => ({
                              ...p,
                              province: newProv,
                              city: p.province !== newProv ? '' : p.city,
                              district: p.province !== newProv ? '' : p.district,
                              subdistrict: p.province !== newProv ? '' : p.subdistrict,
                            }))
                          }}
                          options={provList}
                          placeholder="Cari / pilih provinsi..."
                          isLoading={isProvLoading}
                        />
                        <SearchableRegionInput
                          label="Kota / Kabupaten"
                          value={formData.city}
                          onChange={(newCity) => {
                            const basePostal = getPostalCode('', '', newCity, formData.province)
                            setFormData((p) => ({
                              ...p,
                              city: newCity,
                              district: p.city !== newCity ? '' : p.district,
                              subdistrict: p.city !== newCity ? '' : p.subdistrict,
                              ...(basePostal && !p.postal_code ? { postal_code: basePostal } : {}),
                            }))
                          }}
                          onSelectOption={(opt) => {
                            const val = typeof opt === 'object' && opt !== null ? opt.value : opt
                            const basePostal = getPostalCode('', '', val, formData.province)
                            setFormData((p) => ({
                              ...p,
                              city: val,
                              district: p.city !== val ? '' : p.district,
                              subdistrict: p.city !== val ? '' : p.subdistrict,
                              ...(basePostal && !p.postal_code ? { postal_code: basePostal } : {}),
                            }))
                          }}
                          options={kotaList}
                          placeholder={formData.province ? "Cari / pilih kota/kabupaten..." : "Pilih provinsi atau ketik kota..."}
                          isLoading={isKotaLoading}
                        />
                      </div>

                      {/* Kecamatan & Kelurahan / Desa */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SearchableRegionInput
                          label="Kecamatan"
                          value={formData.district}
                          onChange={(newKec) => {
                            const kecPostal = getPostalCode('', newKec, formData.city, formData.province)
                            setFormData((p) => ({
                              ...p,
                              district: newKec,
                              subdistrict: p.district !== newKec ? '' : p.subdistrict,
                              ...(kecPostal ? { postal_code: kecPostal } : {}),
                            }))
                          }}
                          onSelectOption={(opt) => {
                            const val = typeof opt === 'object' && opt !== null ? opt.value : opt
                            const kecPostal = getPostalCode('', val, formData.city, formData.province)
                            setFormData((p) => ({
                              ...p,
                              district: val,
                              subdistrict: p.district !== val ? '' : p.subdistrict,
                              ...(kecPostal ? { postal_code: kecPostal } : {}),
                            }))
                          }}
                          options={kecList}
                          placeholder={formData.city ? "Cari / pilih kecamatan..." : "Pilih kota/kabupaten dulu..."}
                          isLoading={isKecLoading}
                        />
                        <SearchableRegionInput
                          label="Kelurahan / Desa"
                          value={formData.subdistrict}
                          onChange={(newKel) => {
                            const kelPostal = getPostalCode(newKel, formData.district, formData.city, formData.province)
                            setFormData((p) => ({
                              ...p,
                              subdistrict: newKel,
                              ...(kelPostal ? { postal_code: kelPostal } : {}),
                            }))
                          }}
                          onSelectOption={(opt) => {
                            const val = typeof opt === 'object' && opt !== null ? opt.value : opt
                            const kelPostal = typeof opt === 'object' && opt !== null && opt.postalCode ? opt.postalCode : getPostalCode(val, formData.district, formData.city, formData.province)
                            setFormData((p) => ({
                              ...p,
                              subdistrict: val,
                              ...(kelPostal ? { postal_code: kelPostal } : {}),
                            }))
                          }}
                          options={kelListWithOptions}
                          placeholder={formData.district ? "Cari / pilih kelurahan/desa..." : "Pilih kecamatan dulu..."}
                          isLoading={isKelLoading}
                        />
                      </div>

                      {/* Kode Pos */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="postal_code" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            Kode Pos
                          </label>
                          {formData.postal_code && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border-2 border-emerald-300 dark:border-emerald-800/80">
                              Terisi Otomatis
                            </span>
                          )}
                        </div>
                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            <Compass className="size-4" />
                          </div>
                          <input
                            id="postal_code"
                            name="postal_code"
                            type="text"
                            placeholder="25136"
                            value={formData.postal_code}
                            onChange={e => setFormData(p => ({ ...p, postal_code: e.target.value }))}
                            className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                          />
                        </div>
                        <p className="text-xs font-medium text-slate-400">Kode pos terisi otomatis saat memilih kelurahan / kecamatan (dapat disunting manual)</p>
                      </div>

                      {/* Peta Interaktif & Penentuan Titik Koordinat Lokasi */}
                      <div className="space-y-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/60">
                        <InteractiveMapPicker
                          latitude={formData.latitude}
                          longitude={formData.longitude}
                          radiusMeter={formData.radius_meter}
                          addressText={formData.address}
                          cityName={formData.city}
                          provinceName={formData.province}
                          triggerSearchKey={mapSearchTriggerKey}
                          onLocationChange={({ lat, lng }) => {
                            setFormData(p => ({
                              ...p,
                              latitude: lat,
                              longitude: lng,
                            }))
                          }}
                          onAddressDetected={(detected) => {
                            setFormData(p => {
                              const newProv = detected.province || p.province
                              const newCity = detected.city || p.city
                              const newDistrict = detected.district || p.district
                              const newSubdistrict = detected.subdistrict || p.subdistrict
                              const autoPostal = detected.postalCode || getPostalCode(newSubdistrict, newDistrict, newCity, newProv) || p.postal_code

                              return {
                                ...p,
                                address: detected.road || detected.displayName || p.address,
                                province: newProv,
                                city: newCity,
                                district: newDistrict,
                                subdistrict: newSubdistrict,
                                postal_code: autoPostal,
                              }
                            })
                          }}
                        />

                      </div>
                    </div>
                  )}

                  {/* Step 3: Pimpinan */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2">
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <UsersRound className="size-4 text-[#059669] dark:text-[#10B981]" />
                          Kepala Sekolah & SK Pendirian
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsAddEmployeeModalOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-[#059669] dark:text-[#10B981] hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition border-2 border-emerald-300 dark:border-emerald-800/80 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Tambah Pegawai Baru
                        </button>
                      </div>

                      {/* Select Pegawai */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            Pilih dari Data Pegawai
                          </label>
                          {selectedEmployeeId && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border-2 border-emerald-300 dark:border-emerald-800/80">
                              <Sparkles className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                              Terisi Otomatis
                            </span>
                          )}
                        </div>
                        <HeroUiFilterSelect
                          value={selectedEmployeeId}
                          onChange={val => {
                            if (!val) return
                            const emp = employeesList.find(x => String(x.id) === String(val))
                            if (emp) {
                              setFormData(p => ({
                                ...p,
                                principal_name: emp.name || emp.nama_lengkap || p.principal_name,
                                principal_nip: emp.nip || emp.nipy || p.principal_nip,
                              }))
                            }
                          }}
                          options={employeeSelectOptions}
                          placeholder="-- Cari & Pilih Pegawai Terdaftar --"
                          icon={UsersRound}
                          searchable={true}
                          allowClear={true}
                          className="w-full"
                          popoverWidth="w-full"
                          size="md"
                          ariaLabel="Pilih dari Data Pegawai"
                        />
                        <p className="text-xs font-medium text-slate-400">
                          Pilih pegawai terdaftar untuk mengisi nama & NIP pimpinan unit secara instan (atau ketik manual di bawah).
                        </p>
                      </div>

                      {/* Nama Pimpinan */}
                      <div className="space-y-1.5">
                        <label htmlFor="principal_name" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Nama Pimpinan / Kepala Sekolah
                        </label>
                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            <UserCheck className="size-4" />
                          </div>
                          <input
                            id="principal_name"
                            name="principal_name"
                            type="text"
                            placeholder="Ust. Fadli Rahman, S.Pd"
                            value={formData.principal_name}
                            onChange={e => setFormData(p => ({ ...p, principal_name: e.target.value }))}
                            className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* NIP / NIPY */}
                      <div className="space-y-1.5">
                        <label htmlFor="principal_nip" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          NIP / NIPY
                        </label>
                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            <FileCheck className="size-4" />
                          </div>
                          <input
                            id="principal_nip"
                            name="principal_nip"
                            type="text"
                            placeholder="1985xxxxxx"
                            value={formData.principal_nip}
                            onChange={e => setFormData(p => ({ ...p, principal_nip: e.target.value }))}
                            className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* No. SK Pendirian */}
                      <div className="space-y-1.5">
                        <label htmlFor="sk_pendirian" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          No. SK Pendirian Unit
                        </label>
                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            <FileText className="size-4" />
                          </div>
                          <input
                            id="sk_pendirian"
                            name="sk_pendirian"
                            type="text"
                            placeholder="Contoh: SK-YDI/2021/005"
                            value={formData.sk_pendirian}
                            onChange={e => setFormData(p => ({ ...p, sk_pendirian: e.target.value }))}
                            className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Tahun Berdiri & Akreditasi */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            Tahun Berdiri
                          </label>
                          <HeroUiFilterSelect
                            value={String(formData.established_year || '')}
                            onChange={val => setFormData(p => ({ ...p, established_year: val }))}
                            options={establishedYearOptions}
                            placeholder="Pilih Tahun Berdiri"
                            icon={Calendar}
                            searchable={true}
                            placement="top"
                            className="w-full"
                            popoverWidth="w-full"
                            size="md"
                            ariaLabel="Tahun Berdiri Unit"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            Akreditasi Unit
                          </label>
                          <HeroUiFilterSelect
                            value={formData.accreditation || 'A'}
                            onChange={val => setFormData(p => ({ ...p, accreditation: val }))}
                            options={accreditationSelectOptions}
                            placeholder="Pilih Akreditasi"
                            icon={Award}
                            placement="top"
                            className="w-full"
                            popoverWidth="w-full"
                            size="md"
                            ariaLabel="Akreditasi Unit"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Konfirmasi */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                          Ringkasan Data Unit
                        </h3>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Siap Disimpan</span>
                      </div>

                      <div className="divide-y divide-emerald-100/80 rounded-xl border border-emerald-200/80 bg-slate-50/80 text-xs dark:divide-slate-700/70 dark:border-emerald-800/80 dark:bg-slate-800/30 overflow-hidden">
                        {[
                          ['Nama Unit', formData.name || '-'],
                          ['Jenis Unit', formData.unit_type || '-'],
                          ['Kode Unit', formData.code || '-'],
                          ['NPSN', formData.npsn || '-'],
                          ['Kecamatan / Kelurahan', [formData.district ? `Kec. ${formData.district}` : '', formData.subdistrict ? `Kel. ${formData.subdistrict}` : ''].filter(Boolean).join(', ') || '-'],
                          ['Kota, Provinsi', [formData.city, formData.province].filter(Boolean).join(', ') || '-'],
                          ['Kepala Sekolah', formData.principal_name || '-'],
                          ['Akreditasi', formData.accreditation || 'A'],
                          ['Status Operasional', formData.is_active ? 'Aktif' : 'Nonaktif'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between px-4 py-3">
                            <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                            <span className="font-extrabold text-slate-900 dark:text-white">{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30 flex items-start gap-3">
                        <ShieldCheck className="size-5 text-[#059669] dark:text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                          Pastikan seluruh data unit yang dimasukkan telah sesuai dengan dokumen resmi yayasan sebelum menekan tombol simpan.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                      <X className="size-3.5 text-rose-600" strokeWidth={2.2} />
                    </div>
                    <span>Batal</span>
                  </button>
                  <div className="flex items-center gap-2.5">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(s => s - 1)}
                        className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-card-dark px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                      >
                        <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                          <ArrowLeft className="size-3.5" strokeWidth={2.2} />
                        </div>
                        <span>Kembali</span>
                      </button>
                    )}
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(s => Math.min(4, s + 1))}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 text-xs font-extrabold shadow-sm hover:scale-[1.02] transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        <span>Selanjutnya</span>
                        <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                          <ArrowRight className="size-3.5 text-emerald-600" strokeWidth={2.2} />
                        </div>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFormSubmit}
                        disabled={isMutating}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xl text-white px-5 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 cursor-pointer",
                          isEditMode
                            ? "bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800 "
                            : "bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800 "
                        )}
                      >
                        {isMutating ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                        ) : (
                          <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                            <Save className="size-3.5 text-slate-600" strokeWidth={2.2} />
                          </div>
                        )}
                        <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan Unit'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
 SAVE / UPDATE CONFIRMATION DIALOG — Harmonized with HeroUI & Full Responsive
 ══════════════════════════════════════════════════════════════════ */}
      <HeroModal
        isOpen={showSaveConfirmDialog}
        onOpenChange={(open) => {
          if (!open && !isMutating) setShowSaveConfirmDialog(false)
        }}
      >
        <HeroModal.Backdrop isDismissable={!isMutating} className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <HeroModal.Container placement="center" className="w-full max-w-md my-auto">
            <HeroModal.Dialog className="modal-dialog font-sans my-auto w-full max-w-md flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60 outline-hidden">
              {/* Top Accent Gradient Bar */}
              <div
                className={cn(
                  "h-1.5 w-full shrink-0",
                  isEditMode
                    ? "bg-white dark:bg-card-dark"
                    : "bg-white dark:bg-card-dark"
                )}
              />

              {/* Header */}
              <HeroModal.Header className="modal-header flex flex-row items-start sm:items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 bg-white px-4.5 sm:px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950 gap-3">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "size-10 sm:size-11 flex items-center justify-center rounded-xl text-white shadow-md shrink-0 border",
                      isEditMode
                        ? "bg-white dark:bg-card-dark shadow-sm border-emerald-200/80 dark:border-emerald-800/60"
                        : "bg-white dark:bg-card-dark shadow-sm border-emerald-300/30"
                    )}
                  >
                    {isEditMode ? (
                      <Pencil className="size-5 text-amber-600" strokeWidth={2.25} />
                    ) : (
                      <School className="size-5 text-current" strokeWidth={2.25} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3
                        id="edu-unit-save-confirm-title"
                        className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight"
                      >
                        {isEditMode ? "Konfirmasi Perubahan Data" : "Konfirmasi Penyimpanan Data"}
                      </h3>
                      <HeroChip
                        size="sm"
                        variant="soft"
                        color={isEditMode ? "warning" : "success"}
                        className={cn(
                          "font-bold text-[10px] shrink-0 border inline-flex items-center gap-1 px-2 py-0.5",
                          isEditMode
                            ? "bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-emerald-800/60"
                            : "bg-emerald-50 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
                        )}
                      >
                        <Sparkles className="size-3" />
                        <HeroChip.Label>{isEditMode ? "Update Data" : "Unit Baru"}</HeroChip.Label>
                      </HeroChip>
                    </div>
                    <p className="text-xs sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {isEditMode
                        ? "Verifikasi data unit sebelum pembaruan diterapkan ke sistem."
                        : "Verifikasi data unit baru sebelum disimpan ke sistem."}
                    </p>
                  </div>
                </div>

                <HeroButton
                  isIconOnly
                  size="sm"
                  isDisabled={isMutating}
                  disabled={isMutating}
                  onPress={() => setShowSaveConfirmDialog(false)}
                  aria-label="Tutup dialog konfirmasi"
                  className="size-8 sm:size-9 shrink-0 flex items-center justify-center rounded-xl sm:rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <X className="size-4 text-rose-600" strokeWidth={2.25} />
                </HeroButton>
              </HeroModal.Header>

              {/* Body */}
              <HeroModal.Body className="modal-body p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-slate-700 dark:text-slate-200 overflow-y-auto">
                {/* Target Info Summary Card using HeroCard */}
                <HeroCard className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-3.5 sm:p-4 dark:border-emerald-800/80 dark:bg-slate-900/50 space-y-2.5 shadow-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Unit Pendidikan</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white sm:text-right break-words min-w-0">
                      {formData.name || "-"}
                    </span>
                  </div>
                  {formData.code && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-t border-emerald-200/60 pt-2 dark:border-emerald-800/60">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Kode Unit</span>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 sm:text-right">
                        {formData.code}
                      </span>
                    </div>
                  )}
                  {formData.unit_type && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-t border-emerald-200/60 pt-2 dark:border-emerald-800/60">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Jenjang / Jenis</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 sm:text-right">
                        {formData.unit_type}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-t border-emerald-200/60 pt-2 dark:border-emerald-800/60">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Model Program</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 capitalize sm:text-right">
                      {formData.program_type === "boarding" ? "Boarding / Pesantren (24 Jam)" : "Fullday School"}
                    </span>
                  </div>
                  {formData.jam_pulang && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-t border-emerald-200/60 pt-2 dark:border-emerald-800/60">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Jam Operasional</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 sm:text-right">
                        {formData.jam_masuk ? `${formData.jam_masuk} - ` : ""}{formData.jam_pulang} WIB
                      </span>
                    </div>
                  )}
                  {formData.latitude && formData.longitude && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-t border-emerald-200/60 pt-2 dark:border-emerald-800/60">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Titik Koordinat & Radius</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300  dark:text-emerald-700 dark:text-emerald-300  sm:text-right break-all">
                        {formData.latitude}, {formData.longitude} (R: {formData.radius_meter || 100}m)
                      </span>
                    </div>
                  )}
                </HeroCard>

                {/* Callout Notice Box */}
                <div
                  className={cn(
                    "rounded-xl border p-3.5 text-xs font-medium leading-relaxed flex items-start gap-2.5 sm:gap-3",
                    isEditMode
                      ? "border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 text-amber-950 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-200"
                      : "border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-xl text-white mt-0.5 shadow-xs",
                      isEditMode
                        ? "bg-white dark:bg-card-dark shadow-sm"
                        : "bg-white dark:bg-card-dark shadow-sm"
                    )}
                  >
                    <Sparkles className="size-3.5 text-emerald-600" />
                  </div>
                  <div className="flex-1 leading-relaxed">
                    {isEditMode
                      ? "Data unit pendidikan yang sudah ada akan segera diperbarui di database server dengan informasi terbaru yang Anda masukkan."
                      : "Data unit pendidikan baru akan tersimpan dan langsung aktif sesuai konfigurasi sistem."}
                  </div>
                </div>
              </HeroModal.Body>

              {/* Footer */}
              <HeroModal.Footer className="modal-footer flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 border-t border-emerald-200/80 bg-white px-4.5 sm:px-6 py-3.5 sm:py-4 dark:border-emerald-800/60 dark:bg-slate-950">
                <HeroButton
                  variant="outline"
                  size="sm"
                  isDisabled={isMutating}
                  disabled={isMutating}
                  onPress={() => setShowSaveConfirmDialog(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-md bg-white/20">
                    <X className="size-3" strokeWidth={2.2} />
                  </div>
                  <span>Batal</span>
                </HeroButton>

                <HeroButton
                  variant="solid"
                  size="sm"
                  isDisabled={isMutating}
                  disabled={isMutating}
                  onPress={handleConfirmSave}
                  className={cn(
                    "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-white px-5 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer shadow-md",
                    isEditMode
                      ? "bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm"
                      : "bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm"
                  )}
                >
                  {isMutating ? (
                    <HeroSpinner size="sm" className="size-3.5 text-amber-600" />
                  ) : (
                    <div className="flex size-4 shrink-0 items-center justify-center rounded-md bg-white/20">
                      <Save className="size-3 text-current" strokeWidth={2.2} />
                    </div>
                  )}
                  <span>
                    {isMutating
                      ? isEditMode ? "Memperbarui..." : "Menyimpan..."
                      : isEditMode ? "Ya, Perbarui Data" : "Ya, Simpan Unit"}
                  </span>
                </HeroButton>
              </HeroModal.Footer>
            </HeroModal.Dialog>
          </HeroModal.Container>
        </HeroModal.Backdrop>
      </HeroModal>

      {/* ══════════════════════════════════════════════════════════════════
 DELETE CONFIRM DIALOG — Harmonized with HeroUI & Full Responsive
 ══════════════════════════════════════════════════════════════════ */}
      <HeroModal
        isOpen={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null)
        }}
      >
        <HeroModal.Backdrop isDismissable={!deleteMutation.isPending} className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <HeroModal.Container placement="center" className="w-full max-w-md my-auto">
            {deleteTarget && (
              <HeroModal.Dialog className="modal-dialog font-sans my-auto w-full max-w-md flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60 outline-hidden">
                {/* Top Accent Gradient Bar */}

                {/* Header */}
                <HeroModal.Header className="modal-header flex flex-row items-start sm:items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 bg-white px-4.5 sm:px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950 gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="size-10 sm:size-11 flex items-center justify-center rounded-xl  shadow-md shrink-0 border border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs shadow-sm border-emerald-200/80 dark:border-emerald-800/60">
                      <Trash2 className="size-5 text-rose-600" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3
                          id="edu-unit-delete-confirm-title"
                          className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight"
                        >
                          Hapus Unit Pendidikan
                        </h3>
                        <HeroChip
                          size="sm"
                          variant="soft"
                          color="danger"
                          className="font-bold text-[10px] shrink-0 border inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-400 dark:border-emerald-800/60"
                        >
                          <AlertTriangle className="size-3" />
                          <HeroChip.Label>Hapus Permanen</HeroChip.Label>
                        </HeroChip>
                      </div>
                      <p className="text-xs sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        Tindakan ini permanen dan tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>

                  <HeroButton
                    isIconOnly
                    size="sm"
                    isDisabled={deleteMutation.isPending}
                    disabled={deleteMutation.isPending}
                    onPress={() => setDeleteTarget(null)}
                    aria-label="Tutup dialog konfirmasi"
                    className="size-8 sm:size-9 shrink-0 flex items-center justify-center rounded-xl sm:rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-4 text-rose-600" strokeWidth={2.25} />
                  </HeroButton>
                </HeroModal.Header>

                {/* Body */}
                <HeroModal.Body className="modal-body p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-slate-700 dark:text-slate-200 overflow-y-auto">
                  {/* Target Info Summary Card */}
                  <HeroCard className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/40 p-3.5 sm:p-4 dark:border-emerald-800/60 dark:bg-rose-950/20 space-y-2.5 shadow-none">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Unit Pendidikan</span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white sm:text-right break-words min-w-0">
                        {deleteTarget.name || "-"}
                      </span>
                    </div>
                    {deleteTarget.code && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pt-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Kode Unit</span>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 sm:text-right">
                          {deleteTarget.code}
                        </span>
                      </div>
                    )}
                    {deleteTarget.unit_type && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pt-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Jenjang / Jenis</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 sm:text-right">
                          {deleteTarget.unit_type}
                        </span>
                      </div>
                    )}
                  </HeroCard>

                  {/* Danger Notice Box */}
                  <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/70 p-3.5 text-xs font-medium text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5 sm:gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-xl  border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs mt-0.5 shadow-xs">
                      <AlertTriangle className="size-3.5 text-rose-600" />
                    </div>
                    <div className="flex-1 leading-relaxed">
                      Data unit <strong>"{deleteTarget.name}"</strong> akan dihapus secara permanen dari server. Semua data kelas, siswa, dan relasi terkait akan terpengaruh.
                    </div>
                  </div>
                </HeroModal.Body>

                {/* Footer */}
                <HeroModal.Footer className="modal-footer flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 border-t border-emerald-200/80 bg-white px-4.5 sm:px-6 py-3.5 sm:py-4 dark:border-emerald-800/60 dark:bg-slate-950">
                  <HeroButton
                    variant="outline"
                    size="sm"
                    isDisabled={deleteMutation.isPending}
                    disabled={deleteMutation.isPending}
                    onPress={() => setDeleteTarget(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex size-4 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <X className="size-3" strokeWidth={2.2} />
                    </div>
                    <span>Batal</span>
                  </HeroButton>

                  <HeroButton
                    variant="solid"
                    size="sm"
                    isDisabled={deleteMutation.isPending}
                    disabled={deleteMutation.isPending}
                    onPress={() => {
                      if (deleteMutation.isPending) return
                      deleteMutation.mutate(deleteTarget.id)
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs px-5 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.02] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {deleteMutation.isPending ? (
                      <HeroSpinner size="sm" className="size-3.5 text-slate-600" />
                    ) : (
                      <div className="flex size-4 shrink-0 items-center justify-center rounded-md bg-white/20">
                        <Trash2 className="size-3 text-white" strokeWidth={2.2} />
                      </div>
                    )}
                    <span>{deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus Unit"}</span>
                  </HeroButton>
                </HeroModal.Footer>
              </HeroModal.Dialog>
            )}
          </HeroModal.Container>
        </HeroModal.Backdrop>
      </HeroModal>

      {/* ══════════════════════════════════════════════════════════════════
 EXPORT DIALOG
 ══════════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════════
 EXPORT DIALOG — Harmonized with Modal Tambah UI/UX
 ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showExportModal && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edu-unit-export-title"
            tabIndex={-1}
            onMouseDown={e => { if (e.target === e.currentTarget) setShowExportModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-md"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white dark:bg-card-dark p-2.5 shadow-md shadow-xs shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
                      <Download className="h-5 w-5 text-current" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="edu-unit-export-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Export Data Unit</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Unduh
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih format berkas untuk mengekspor data master unit
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    aria-label="Tutup modal export"
                    className="rounded-xl p-2 border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body space-y-2.5 p-6 text-sm text-slate-700 dark:text-slate-200">
                  {[
                    { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Format Microsoft Excel Modern (Disarankan)' },
                    { value: 'xls', label: 'Excel Legacy (.xls)', desc: 'Format Microsoft Excel Standard 97-2003' },
                    { value: 'csv', label: 'CSV (.csv)', desc: 'Format Comma-Separated Values universal' },
                    { value: 'pdf', label: 'PDF (.pdf)', desc: 'Format Cetak Dokumen Resmi' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all",
                        exportFormat === opt.value
                          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 shadow-2xs dark:border-emerald-800/60 dark:bg-emerald-950/40"
                          : "border-emerald-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-emerald-800/60 dark:hover:border-emerald-200/80 dark:hover:bg-emerald-950/30"
                      )}
                    >
                      <input
                        type="radio"
                        name="export-fmt"
                        value={opt.value}
                        checked={exportFormat === opt.value}
                        onChange={() => setExportFormat(opt.value)}
                        className="accent-emerald-600 size-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{opt.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                      <X className="size-3.5 text-rose-600" strokeWidth={2.2} />
                    </div>
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessExport}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 text-xs font-extrabold shadow-sm hover:scale-[1.02] transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                      <Download className="size-3.5 text-emerald-600" strokeWidth={2.25} />
                    </div>
                    <span>Unduh Berkas</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
 IMPORT DIALOG — Harmonized with Modal Tambah UI/UX
 ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showImportModal && (
          <div
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edu-unit-import-title"
            tabIndex={-1}
            onMouseDown={e => { if (e.target === e.currentTarget) setShowImportModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white dark:bg-card-dark p-2.5 shadow-md shadow-sky-500/30 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                      <Upload className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="edu-unit-import-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Import Data Unit Pendidikan</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Batch Import
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Unggah berkas spreadsheet (.xlsx, .xls, atau .csv) untuk impor data massal
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    aria-label="Tutup form import"
                    className="rounded-xl p-2 border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body min-h-0 flex-1 space-y-4.5 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
                  {/* Unduh Template Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-4 dark:border-emerald-800/60 dark:bg-slate-900/40">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                        <Download className="size-4.5 text-current" strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Format Berkas</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Gunakan berkas template resmi agar kolom terpetakan otomatis</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('xlsx')}
                        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70 text-[#059669] px-3 py-1.5 text-xs font-bold transition-all dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer hover:scale-[1.02] active:scale-95"
                      >
                        <div className="flex size-5 items-center justify-center rounded-md bg-emerald-600 text-white">
                          <Download className="size-3 text-emerald-600" strokeWidth={2.2} />
                        </div>
                        <span>Excel (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('csv')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                      >
                        <div className="flex size-5 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Download className="size-3" strokeWidth={2.2} />
                        </div>
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Dropzone Upload */}
                  <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-6 text-center transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:bg-emerald-50/40 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/30 dark:hover:border-emerald-200/80 dark:hover:bg-emerald-950/20">
                    <div className="mb-2.5 flex size-12 items-center justify-center rounded-xl bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 text-[#059669] transition-transform duration-200 group-hover:scale-110 dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#10B981]">
                      <FileSpreadsheet className="size-6" strokeWidth={2.2} />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                      {importFile ? importFile.name : 'Pilih atau Tarik Berkas Spreadsheet ke Sini'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                      Mendukung format Microsoft Excel (.xlsx, .xls) & CSV
                    </p>
                    {importFile && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60">
                        <CheckCircle2 className="size-3.5" />
                        <span>{(importFile.size / 1024).toFixed(1)} KB · Berkas Siap Diunggah</span>
                      </div>
                    )}
                    <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileSelect} className="hidden" />
                  </label>

                  {/* Table Preview */}
                  {importPreviewData.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>Preview Data Berkas</span>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {importPreviewData.length} baris
                          </span>
                        </p>
                      </div>
                      <div className="max-h-44 overflow-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xs dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                        <TableRoot className="w-full text-left text-xs">
                          <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-slate-800 border-b-2 border-emerald-200/90 text-xs font-black uppercase tracking-wider dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-300">
                            <TableRow>
                              {['Kode', 'Nama Unit', 'Jenis / Jenjang', 'Status'].map(h => (
                                <TableHead key={h} className="px-3 py-2.5">{h}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                            {importPreviewData.map((r, i) => (
                              <TableRow key={i} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-colors">
                                <TableCell className="px-3 py-2 font-mono font-semibold text-slate-700 dark:text-slate-300">{r.kode}</TableCell>
                                <TableCell className="px-3 py-2 font-medium text-slate-900 dark:text-emerald-600">{r.nama}</TableCell>
                                <TableCell className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.tingkat}</TableCell>
                                <TableCell className="px-3 py-2">
                                  <span className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                    r.status === 'Valid' || r.status === 'Siap Impor'
                                      ? "bg-emerald-50 text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
                                      : "bg-rose-50 text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-400 dark:border-emerald-800/60"
                                  )}>
                                    {r.status}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </TableRoot>
                      </div>
                    </div>
                  )}

                  {/* Opsi Timpa Data Jika Ada yang Sama */}
                  <div className={cn(
                    "rounded-xl border p-4 transition-all duration-200",
                    overwriteExisting
                      ? "border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 dark:border-emerald-800/60 dark:bg-amber-950/25"
                      : "border-emerald-200/80 bg-slate-50/50 dark:border-emerald-800/60 dark:bg-slate-900/30"
                  )}>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={overwriteExisting}
                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                        className="mt-0.5 h-4.5 w-4.5 rounded-lg border-emerald-300 text-amber-600 focus:ring-amber-500 dark:border-emerald-800/60 dark:bg-slate-800 cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>Timpa data jika kode atau nama unit sudah terdaftar</span>
                          {overwriteExisting ? (
                            <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
                              Mode Timpa Aktif
                            </span>
                          ) : (
                            <span className="rounded-full bg-sky-50 border border-sky-200/80 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                              Lewati Duplikat
                            </span>
                          )}
                        </span>
                        <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                          Jika dicentang, unit dengan kode atau nama yang cocok akan diperbarui (ditimpa) dengan isi data terbaru dari berkas. Jika tidak dicentang, baris duplikat akan dilewati dengan aman.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Imported Data Summary */}
                  {importedData.length > 0 && (
                    <InlineAlert
                      type="success"
                      message={`${importedData.filter(r => r.status === 'Berhasil').length} data berhasil diimpor, ${importedData.filter(r => r.status === 'Gagal').length} gagal.`}
                    />
                  )}

                  {/* Guidance Banner */}
                  <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30 flex items-start gap-2.5">
                    <ShieldCheck className="size-4.5 text-[#059669] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      Sistem akan otomatis memvalidasi keunikan kode unit dan menyinkronkan data master unit tanpa merusak integritas relasi yang sudah ada.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                      <X className="size-3.5 text-rose-600" strokeWidth={2.2} />
                    </div>
                    <span>Batal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessImport}
                    disabled={!importFile || isImporting}
                    className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-card-dark px-5 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isImporting ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    ) : (
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                        <Upload className="size-3.5 text-white" strokeWidth={2.25} />
                      </div>
                    )}
                    <span>{isImporting ? 'Memproses Impor...' : 'Mulai Impor Data'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL HASIL IMPOR & PEMBERITAHUAN DATA DUPLIKAT UNIT ── */}
      <AnimatePresence>
        {duplicateModalData && (
          <div
            className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="unit-duplicate-report-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="modal-dialog font-sans my-auto w-full max-w-xl"
            >
              <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}
                <div className={cn(
                  "h-1.5 w-full shrink-0",
                  duplicateModalData.diperbarui > 0
                    ? "bg-white dark:bg-card-dark"
                    : duplicateModalData.duplikat > 0
                      ? "bg-white dark:bg-card-dark"
                      : "bg-white dark:bg-card-dark"
                )} />

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "rounded-xl p-2.5 text-white shadow-md shrink-0 border",
                      duplicateModalData.diperbarui > 0
                        ? "bg-white dark:bg-card-dark border-emerald-200/80 dark:border-emerald-800/60 shadow-sm"
                        : "bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm"
                    )}>
                      {duplicateModalData.diperbarui > 0 ? (
                        <RefreshCcw className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-amber-600" strokeWidth={2.25} />
                      )}
                    </div>
                    <div>
                      <h3 id="unit-duplicate-report-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Hasil Impor & Pemberitahuan Data Unit</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Total {duplicateModalData.total || 0} Data
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Ringkasan sinkronisasi dan status pemrosesan data unit pendidikan
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDuplicateModalData(null)}
                    aria-label="Tutup ringkasan impor"
                    className="size-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-sky-950/60 dark:text-sky-300 transition cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-center">
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Baru Ditambah</p>
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{duplicateModalData.berhasil || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-center">
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Ditimpa / Diupdate</p>
                      <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{duplicateModalData.diperbarui || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl border-2 border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 text-center">
                      <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">Duplikat Dilewati</p>
                      <p className="text-xl font-black text-sky-700 dark:text-sky-400 mt-0.5">{duplicateModalData.duplikat || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-center">
                      <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase">Gagal Diproses</p>
                      <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{duplicateModalData.gagal || 0}</p>
                    </div>
                  </div>

                  {/* Duplicate Detail Table if exists */}
                  {duplicateModalData.duplicates && duplicateModalData.duplicates.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Daftar Data yang Sama (Kode / Nama Unit Terdaftar)</span>
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {duplicateModalData.duplicates.length} baris
                          </span>
                        </p>
                      </div>
                      <div className="max-h-56 overflow-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xs dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                        <TableRoot className="w-full text-left text-xs">
                          <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-slate-800 border-b-2 border-emerald-200/90 text-xs font-black uppercase tracking-wider dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-300">
                            <TableRow>
                              <TableHead className="px-3 py-2 w-14">Baris</TableHead>
                              <TableHead className="px-3 py-2">Kode</TableHead>
                              <TableHead className="px-3 py-2">Nama Unit</TableHead>
                              <TableHead className="px-3 py-2">Status Aksi</TableHead>
                              <TableHead className="px-3 py-2">Keterangan</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-emerald-100/80 dark:divide-slate-800">
                            {duplicateModalData.duplicates.map((item, idx) => (
                              <TableRow key={idx} className="hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
                                <TableCell className="px-3 py-2 font-mono text-slate-500">{item.baris}</TableCell>
                                <TableCell className="px-3 py-2 font-mono font-bold text-slate-800 dark:text-slate-200">{item.kode || '-'}</TableCell>
                                <TableCell className="px-3 py-2 font-semibold text-slate-900 dark:text-emerald-600">{item.nama}</TableCell>
                                <TableCell className="px-3 py-2">
                                  <span className={cn(
                                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                                    item.status === 'Ditimpa'
                                      ? "bg-amber-100 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300"
                                      : "bg-sky-100 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300"
                                  )}>
                                    {item.status}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2 text-slate-600 dark:text-slate-400 text-[10px]">{item.keterangan}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </TableRoot>
                      </div>
                    </div>
                  )}

                  {/* Error List if exists */}
                  {duplicateModalData.errors && duplicateModalData.errors.length > 0 && (
                    <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-rose-950/30 text-xs">
                      <p className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1.5">
                        <XCircle className="size-3.5" />
                        <span>Catatan Kesalahan Baris Data:</span>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-rose-700 dark:text-rose-400 text-xs">
                        {duplicateModalData.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>{typeof err === 'string' ? err : JSON.stringify(err)}</li>
                        ))}
                        {duplicateModalData.errors.length > 5 && (
                          <li className="font-semibold italic">...dan {duplicateModalData.errors.length - 5} kesalahan lainnya.</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-end border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 px-6 py-3.5 dark:border-emerald-800/60 dark:bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setDuplicateModalData(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Check className="size-3.5" strokeWidth={2.2} />
                    <span>Tutup & Mengerti</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Quick Add Pegawai (Overlay Modal on top of Modal 1) */}
      <AnimatePresence>
        {isAddEmployeeModalOpen && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="quick-add-emp-title"
            className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            onMouseDown={e => {
              if (e.target === e.currentTarget) setIsAddEmployeeModalOpen(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="modal-dialog font-sans w-full max-w-xl"
            >
              <div className="modal-content relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">

                      <UserPlus className="size-6 sm:size-7 h-5 w-5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="quick-add-emp-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Tambah Pegawai Cepat</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Pimpinan Baru
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Daftarkan calon kepala sekolah / pimpinan unit secara langsung
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddEmployeeModalOpen(false)}
                    aria-label="Tutup modal"
                    className="size-9 flex items-center justify-center rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <X className="size-4 text-rose-600" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Form */}
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    if (!employeeFormData.name?.trim()) {
                      setEmployeeFormAlert('Nama lengkap pegawai wajib diisi.')
                      return
                    }
                    createEmployeeMutation.mutate({
                      nama_lengkap: employeeFormData.name,
                      name: employeeFormData.name,
                      nip: employeeFormData.nip,
                      nipy: employeeFormData.nip,
                      jabatan: employeeFormData.jabatan_name || 'Kepala Sekolah',
                      jabatan_name: employeeFormData.jabatan_name || 'Kepala Sekolah',
                      email: employeeFormData.email,
                      phone: employeeFormData.phone,
                      no_telepon: employeeFormData.phone,
                      is_active: 1,
                    })
                  }}
                  className="flex flex-col min-h-0 flex-1"
                >
                  <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
                    {employeeFormAlert && (
                      <InlineAlert
                        type="error"
                        message={employeeFormAlert}
                        onClose={() => setEmployeeFormAlert(null)}
                      />
                    )}

                    {/* Nama Pegawai */}
                    <div className="space-y-1.5">
                      <label htmlFor="emp_name" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Nama Lengkap Pegawai <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <UserCheck className="size-4" />
                        </div>
                        <input
                          id="emp_name"
                          type="text"
                          required
                          placeholder="Contoh: Dr. H. Ahmad Dahlan, M.Pd."
                          value={employeeFormData.name}
                          onChange={e => setEmployeeFormData(p => ({ ...p, name: e.target.value }))}
                          className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* NIP / NIY */}
                    <div className="space-y-1.5">
                      <label htmlFor="emp_nip" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        NIP / NIY / NIPY
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Hash className="size-4" />
                        </div>
                        <input
                          id="emp_nip"
                          type="text"
                          placeholder="Contoh: 198001012005011001 atau NIY-2024001"
                          value={employeeFormData.nip}
                          onChange={e => setEmployeeFormData(p => ({ ...p, nip: e.target.value }))}
                          className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Jabatan */}
                    <div className="space-y-1.5">
                      <label htmlFor="emp_jabatan" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Jabatan Pegawai
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                          <Briefcase className="size-4" />
                        </div>
                        <input
                          id="emp_jabatan"
                          type="text"
                          placeholder="Contoh: Kepala Sekolah / Pimpinan Pondok"
                          value={employeeFormData.jabatan_name}
                          onChange={e => setEmployeeFormData(p => ({ ...p, jabatan_name: e.target.value }))}
                          className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label htmlFor="emp_email" className="block text-xs font-bold text-slate-700 dark:text-slate-200">Email Pegawai</label>
                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            <Mail className="size-4" />
                          </div>
                          <input
                            id="emp_email"
                            type="email"
                            placeholder="pegawai@sekolah.sch.id"
                            value={employeeFormData.email}
                            onChange={e => setEmployeeFormData(p => ({ ...p, email: e.target.value }))}
                            className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="emp_phone" className="block text-xs font-bold text-slate-700 dark:text-slate-200">No. Telepon / WA</label>
                        <div className="relative flex items-center">
                          <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            <Phone className="size-4" />
                          </div>
                          <input
                            id="emp_phone"
                            type="text"
                            placeholder="08123456789"
                            value={employeeFormData.phone}
                            onChange={e => setEmployeeFormData(p => ({ ...p, phone: e.target.value }))}
                            className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white pl-10 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer flex items-center justify-end gap-2.5 border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 px-6 py-4 dark:border-emerald-800/60 dark:bg-[#131B27]">
                    <button
                      type="button"
                      onClick={() => setIsAddEmployeeModalOpen(false)}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                    >
                      <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                        <X className="size-3.5 text-rose-600" strokeWidth={2.2} />
                      </div>
                      <span>Batal</span>
                    </button>
                    <button
                      type="submit"
                      disabled={createEmployeeMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-5 py-2.5 text-xs font-extrabold border-2 border-emerald-300 dark:border-emerald-800 transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {createEmployeeMutation.isPending ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      ) : (
                        <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                          <Save className="size-3.5 text-emerald-600" strokeWidth={2.2} />
                        </div>
                      )}
                      <span>{createEmployeeMutation.isPending ? 'Menyimpan...' : 'Simpan Pegawai'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HeroUI Print & PDF Download Scope Selection Modal */}
      <AnimatePresence>
        {printOptionModalOpen && (
          <div
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="print-option-modal-title"
            className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
            onMouseDown={e => { if (e.target === e.currentTarget) setPrintOptionModalOpen(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="modal-dialog font-sans w-full max-w-xl"
            >
              <div className="modal-content relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
                {/* Top Accent Gradient Bar */}

                {/* Header */}
                <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-[#059669] shadow-xs dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#10B981]">
                      <Printer className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h3 id="print-option-modal-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Opsi & Scope Cetak Laporan</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          Cetak & PDF
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih jenis laporan yang ingin dicetak atau diunduh
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrintOptionModalOpen(false)}
                    aria-label="Tutup modal"
                    className="rounded-xl p-2 border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <X className="size-4" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Selector Cards */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Pilih Kategori Laporan Unit
                    </label>

                    {/* Mode 1: Seluruh Data Unit */}
                    <div
                      onClick={() => setPrintScopeMode('all')}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${printScopeMode === 'all'
                        ? 'border-[#059669] bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 shadow-xs ring-1 ring-[#059669]'
                        : 'border-emerald-200/80 bg-white hover:bg-slate-50/80 dark:border-emerald-800/60 dark:bg-slate-900/40'
                        }`}
                    >
                      <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${printScopeMode === 'all' ? 'border-[#059669] bg-[#059669] text-white' : 'border-emerald-300 dark:border-emerald-800/60'
                        }`}>
                        {printScopeMode === 'all' && <span className="size-2 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-[#059669] dark:text-emerald-400" />
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Cetak Seluruh Data Unit Pendidikan
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Laporan lengkap master data unit: Kode, NPSN, Kota, Provinsi, Pimpinan, Total Siswa, Total Guru, dan Status.
                        </p>
                      </div>
                    </div>

                    {/* Mode 2: Jumlah Pegawai Menurut Unit */}
                    <div
                      onClick={() => setPrintScopeMode('pegawai')}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${printScopeMode === 'pegawai'
                        ? 'border-[#059669] bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 shadow-xs ring-1 ring-[#059669]'
                        : 'border-emerald-200/80 bg-white hover:bg-slate-50/80 dark:border-emerald-800/60 dark:bg-slate-900/40'
                        }`}
                    >
                      <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${printScopeMode === 'pegawai' ? 'border-[#059669] bg-[#059669] text-white' : 'border-emerald-300 dark:border-emerald-800/60'
                        }`}>
                        {printScopeMode === 'pegawai' && <span className="size-2 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <UsersRound className="size-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Cetak Jumlah Pegawai & Guru Menurut Unit
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Rekapitulasi SDM: Guru Pendidik, Staf Kependidikan, Total SDM, Pimpinan, dan Rasio Guru.
                        </p>
                      </div>
                    </div>

                    {/* Mode 3: Jumlah Siswa/Santri Menurut Unit */}
                    <div
                      onClick={() => setPrintScopeMode('siswa')}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${printScopeMode === 'siswa'
                        ? 'border-[#059669] bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 shadow-xs ring-1 ring-[#059669]'
                        : 'border-emerald-200/80 bg-white hover:bg-slate-50/80 dark:border-emerald-800/60 dark:bg-slate-900/40'
                        }`}
                    >
                      <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${printScopeMode === 'siswa' ? 'border-[#059669] bg-[#059669] text-white' : 'border-emerald-300 dark:border-emerald-800/60'
                        }`}>
                        {printScopeMode === 'siswa' && <span className="size-2 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="size-4 text-amber-500" />
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Cetak Jumlah Siswa / Santri Menurut Unit
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Rekapitulasi peserta didik: Breakdown Santriwan (Laki-laki), Santriwati (Perempuan), Total Siswa, & Jumlah Rombel.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPrintOptionModalOpen(false)
                        handlePrintClean(printScopeMode)
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-white dark:bg-card-dark flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-emerald-200/80 dark:border-emerald-800/60">
                          <Printer className="size-4.5" strokeWidth={2.25} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">Cetak Langsung (Print Clean)</h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Buka tampilan cetak bersih tanpa artefak UI</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrintOptionModalOpen(false)
                        handleDownloadPdfTable(printScopeMode)
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/70 hover:bg-rose-100/70 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-white dark:bg-card-dark flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-emerald-200/80 dark:border-emerald-800/60">
                          <Download className="size-4.5" strokeWidth={2.25} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">Unduh Berkas PDF (.pdf)</h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Unduh berkas laporan dalam format PDF resmi</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex items-center justify-end border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 px-6 py-4 dark:border-emerald-800/60 dark:bg-[#131B27]">
                  <button
                    type="button"
                    onClick={() => setPrintOptionModalOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Floating Scroll Navigator (Option A) */}
      <SmartScrollFab targetId="tabel-unit-pendidikan" downTooltip="Langsung ke Tabel Unit" />

    </PageContainer>
  )
  be
}
