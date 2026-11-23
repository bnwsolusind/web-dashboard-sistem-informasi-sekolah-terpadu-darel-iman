import {
  useMemo,
  useState,
  useEffect,
  useRef
} from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  hasAnyRole,
  getUserRoleLevel,
  ROLE_LEVELS,
  ROLES
} from '../auth/portalResolver'
import {
  School,
  Users,
  UserCheck,
  Plus,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Download,
  Search,
  X,
  ArrowRightLeft,
  Check,
  Printer,
  Building2,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  XCircle,
  Info,
  Pencil,
  Trash2,
  Power,
  Layers,
  Hash,
  Calendar,
  Save,
  Upload,
  Eye,
  RefreshCcw,
  Lock
} from 'lucide-react'
import {
  cn
} from '../lib/utils'
import {
  kelasService
} from '../services/kelasService'
import {
  studentService
} from '../services/studentService'
import {
  HeroUiHeader,
  ActionDropdown,
  AppBadge,
  PersonIdentityCell,
  useToast,
  PageToolbarActions,
  KpiStatCard,
  MobileDataCard
} from '../components/app'
import AppDataTable from '../components/app/AppDataTable'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  downloadFileFromApi
} from '../utils/exportUtils'
import {
  MasterStatusBadge
} from '../components/master-data'
import {
  useAuthStore
} from '../stores/authStore'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog'
import {
  Badge
} from '../components/ui/badge'
import {
  Button
} from '../components/ui/button'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'
import PersonAvatar from '../components/ui/PersonAvatar'
import {
  Select as HeroSelect,
  SelectTrigger as HeroSelectTrigger,
  SelectValue as HeroSelectValue,
  SelectContent as HeroSelectContent,
  SelectItem as HeroSelectItem
} from '../components/ui/select'



const UNIT_COLORS = {
 TKIT: { bg: 'bg-emerald-800', text: 'text-white', border: 'border-emerald-700/80' },
 TAUD: { bg: 'bg-emerald-700', text: 'text-white', border: 'border-slate-600' },
 SDIT: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
 MIT: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-400' },
 SMPIT: { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-500' },
 SMAIT: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-600' },
 MA: { bg: 'bg-purple-700', text: 'text-white', border: 'border-purple-600' },
 PONPES: { bg: 'bg-emerald-900', text: 'text-white', border: 'border-emerald-800/60' },
 Mahad: { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-700' },
}

const EMPTY_OPTIONS = []
const SISWA_MODAL_PAGE_SIZE = 8

// ── MAPPING JENJANG → DAFTAR TINGKAT YANG VALID ────────────────────────────────
// Menentukan opsi Tingkat Kelas yang relevan berdasarkan Jenjang yang dipilih
const JENJANG_TINGKAT_MAP = {
 TKIT: { labels: ['TK A', 'TK B'], values: ['TK A', 'TK B'] },
 SDIT: { labels: ['Tingkat 1', 'Tingkat 2', 'Tingkat 3', 'Tingkat 4', 'Tingkat 5', 'Tingkat 6'], values: ['1', '2', '3', '4', '5', '6'] },
 MIT: { labels: ['Tingkat 1', 'Tingkat 2', 'Tingkat 3', 'Tingkat 4', 'Tingkat 5', 'Tingkat 6'], values: ['1', '2', '3', '4', '5', '6'] },
 SMPIT: { labels: ['Tingkat 7 (Kelas 1 SMP)', 'Tingkat 8 (Kelas 2 SMP)', 'Tingkat 9 (Kelas 3 SMP)'], values: ['7', '8', '9'] },
 SMAIT: { labels: ['Tingkat 10 (Kelas 1 SMA)', 'Tingkat 11 (Kelas 2 SMA)', 'Tingkat 12 (Kelas 3 SMA)'], values: ['10', '11', '12'] },
 MA: { labels: ['Tingkat 10 (Kelas 1 MA)', 'Tingkat 11 (Kelas 2 MA)', 'Tingkat 12 (Kelas 3 MA)'], values: ['10', '11', '12'] },
}
// Fallback untuk jenjang tidak dikenal: semua tingkat
const TINGKAT_DEFAULT_ALL = {
 labels: ['TK A', 'TK B', 'Tingkat 1', 'Tingkat 2', 'Tingkat 3', 'Tingkat 4', 'Tingkat 5', 'Tingkat 6', 'Tingkat 7', 'Tingkat 8', 'Tingkat 9', 'Tingkat 10', 'Tingkat 11', 'Tingkat 12'],
 values: ['TK A', 'TK B', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
}

function getUnitBadgeStyle(type) {
 return (
 UNIT_COLORS[type] || {
 bg: 'bg-slate-700',
 text: 'text-white',
 border: 'border-slate-600',
 }
 )
}

function initialFormState(defaultJenjang = '') {
 return {
 id: null,
 unit_pendidikan_id: '',
 tahun_ajaran_id: '',
 semester_id: '',
 jenjang: defaultJenjang,
 tingkat: '1',
 kode_kelas: '',
 nama_kelas: '',
 wali_kelas_id: '',
 kapasitas: 30,
 ruangan: '',
 status: 'Aktif',
 }
}

// ── DEFINISI TONE WARNA KARTU KPI MODERN ──────────────────────────────────────
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
    card: 'rounded-container border-2 border-emerald-300 dark:border-emerald-700/80/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-slate-400',
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

function ModernKpiCard({
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

// ── HEROUI FILTER SELECT DROPDOWN COMPONENT ──
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
 className={`h-9 sm:h-10 w-full flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${isOpen
 ? 'border-slate-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white shadow-xs'
 : hasValue
 ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold'
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
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} min-w-[200px] overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40`}
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
 className="w-full rounded-lg border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
 className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
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

export default function MasterKelasPage({ embedded = false, hidePageHeader = false, hideBreadcrumb = false }) {
 const queryClient = useQueryClient()
 const user = useAuthStore((state) => state.user)

 // Global Toast
 const { pushToast } = useToast()

 // Role Access Detection & Resolution (SSOT)
 const userRoles = useMemo(() => {
 if (!user) return []
 if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
 if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
 return []
 }, [user])
 const userLevel = useMemo(() => getUserRoleLevel(user), [user])
 const isSuperAdminOrYayasan = userLevel <= ROLE_LEVELS.YAYASAN // Level 1-2: Admin Sistem & Yayasan

 // Deteksi role Divisi Pendidikan (akses supervisi lintas unit, tidak termasuk Kepala Sekolah/TU/Operator)
 const isUnitScopedRole = useMemo(
 () => userRoles.some((r) => /kepala[\s_]*sekolah|kepsek|tata[\s_]*usaha|operator|guru|wali[\s_]*kelas|musyrif|tahfizh/i.test(r)),
 [userRoles]
 )
 const isDivisiPendidikan = useMemo(() => {
 if (isSuperAdminOrYayasan || isUnitScopedRole) return false
 return (
 userLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
 hasAnyRole(userRoles, ROLES.DIVISI) ||
 userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik/i.test(r))
 )
 }, [userLevel, userRoles, isSuperAdminOrYayasan, isUnitScopedRole])

 // Role Access Check for Unit Pendidikan Filter (Super Admin, Admin, Yayasan, dan Divisi Pendidikan)
 const canSeeUnitFilter = isSuperAdminOrYayasan || isDivisiPendidikan
 const canSelectUnit = canSeeUnitFilter

 // Role Access Check for Managing Students (Pindah Kelas) for Kepala Sekolah, Admin, Superadmin, etc.
 const canManageSiswaKelas = useMemo(() => {
 if (!user) return false
 const userRoles = Array.isArray(user.roles)
 ? user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
 : typeof user.role === 'string'
 ? [user.role]
 : []
 const normalized = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
 const allowed = ['superadmin', 'admin', 'kepalasekolah', 'kepsek', 'yayasan', 'ketuayayasan', 'pengurusyayasan', 'divisipendidikan', 'tatausaha']
 return normalized.some((r) => allowed.includes(r))
 }, [user])

 const canCreate = useMemo(() => {
 if (!user) return false
 const userRoles = Array.isArray(user.roles)
 ? user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
 : typeof user.role === 'string'
 ? [user.role]
 : []
 const normalized = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
 if (normalized.some((r) => ['superadmin', 'admin'].includes(r))) return true
 const permissions = Array.isArray(user.permissions) ? user.permissions : []
 return permissions.some((p) => ['master.create', 'academic.schedule.create', 'sistem.master_data'].includes(p))
 }, [user])

 const canUpdate = useMemo(() => {
 if (!user) return false
 const userRoles = Array.isArray(user.roles)
 ? user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
 : typeof user.role === 'string'
 ? [user.role]
 : []
 const normalized = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
 if (normalized.some((r) => ['superadmin', 'admin'].includes(r))) return true
 const permissions = Array.isArray(user.permissions) ? user.permissions : []
 return permissions.some((p) => ['master.update', 'academic.schedule.update', 'sistem.master_data'].includes(p))
 }, [user])

 const canDelete = useMemo(() => {
 if (!user) return false
 const userRoles = Array.isArray(user.roles)
 ? user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
 : typeof user.role === 'string'
 ? [user.role]
 : []
 const normalized = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
 if (normalized.some((r) => ['superadmin', 'admin'].includes(r))) return true
 const permissions = Array.isArray(user.permissions) ? user.permissions : []
 return permissions.some((p) => ['master.delete', 'academic.schedule.delete', 'sistem.master_data'].includes(p))
 }, [user])

 const canImport = canCreate
 const canExport = useMemo(() => {
 if (canCreate) return true
 const permissions = Array.isArray(user?.permissions) ? user.permissions : []
 return permissions.some((p) => ['master.export', 'academic.class.export', 'sistem.master_data'].includes(p))
 }, [canCreate, user])

 const userUnitId = useMemo(() => {
 return (
 user?.unit_id ||
 user?.education_unit_id ||
 user?.employee?.unit_id ||
 user?.metadata?.education_unit_id ||
 user?.metadata?.unit_id ||
 ''
 )
 }, [user])

 // State Filter & Search (Bila bukan global user, otomatis terkunci ke unit pengguna)
 const [search, setSearch] = useState('')
 const [selectedUnitFilter, setSelectedUnitFilter] = useState(() => (!canSeeUnitFilter && userUnitId ? String(userUnitId) : ''))
 const [selectedTahunFilter, setSelectedTahunFilter] = useState('')
 const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('')
 const [selectedKelasFilter, setSelectedKelasFilter] = useState('')
 const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)

 // Otomatis kunci unit filter jika bukan global user
 useEffect(() => {
 if (!canSeeUnitFilter && userUnitId && selectedUnitFilter !== String(userUnitId)) {
 setSelectedUnitFilter(String(userUnitId))
 }
 }, [canSeeUnitFilter, userUnitId, selectedUnitFilter])

 // Modal Form State Wizard
 const [isFormModalOpen, setIsFormModalOpen] = useState(false)
 const [isEditMode, setIsEditMode] = useState(false)
 const [currentStep, setCurrentStep] = useState(1)
 const [formData, setFormData] = useState(initialFormState())
 const [formErrors, setFormErrors] = useState({})

 // Modal Detail & Delete State
 const [detailKelas, setDetailKelas] = useState(null)
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
 const [deleteTarget, setDeleteTarget] = useState(null)
 const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

 // Modal Student List State
 const [selectedKelasSiswa, setSelectedKelasSiswa] = useState(null)
 const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false)
 const [siswaSearch, setSiswaSearch] = useState('')
 const [siswaModalPage, setSiswaModalPage] = useState(1)

 // State for Class Transfer (Pindah Kelas)
 const [selectedStudentIds, setSelectedStudentIds] = useState([])
 const [singleStudentToMove, setSingleStudentToMove] = useState(null)
 const [targetKelasId, setTargetKelasId] = useState('')
 const [isPindahModalOpen, setIsPindahModalOpen] = useState(false)
 const [movingLoading, setMovingLoading] = useState(false)

 // Options Query
 const { data: optionsData } = useQuery({
 queryKey: ['kelas-options'],
 queryFn: () => kelasService.getOptions(),
 })

 const masterUnits = optionsData?.units || EMPTY_OPTIONS
 const selectedUnitName = useMemo(() => {
 if (!selectedUnitFilter) {
 if (!canSeeUnitFilter) {
 return (
 masterUnits[0]?.name ??
 masterUnits[0]?.nama ??
 masterUnits[0]?.nama_unit ??
 user?.unit_name ??
 user?.metadata?.unit_name ??
 user?.unit?.name ??
 ''
 )
 }
 return ''
 }
 const found = masterUnits.find((u) => String(u.id ?? u.unit_id) === String(selectedUnitFilter))
 return found?.name ?? found?.nama ?? found?.nama_unit ?? user?.unit_name ?? user?.metadata?.unit_name ?? ''
 }, [masterUnits, selectedUnitFilter, user, canSeeUnitFilter])
 const masterTahunAjaran = optionsData?.tahun_ajaran || EMPTY_OPTIONS
 const masterSemesters = optionsData?.semesters || EMPTY_OPTIONS
 const masterEmployees = optionsData?.employees || optionsData?.guru || EMPTY_OPTIONS
 const masterJenjang = optionsData?.jenjang || EMPTY_OPTIONS
 const masterTingkat = optionsData?.tingkat || EMPTY_OPTIONS

 // Fetch Lista Kelas
 const {
 data: classData,
 isLoading,
 isError,
 refetch,
 } = useQuery({
 queryKey: [
 'kelas-list',
 page,
 perPage,
 search,
 selectedUnitFilter,
 selectedTahunFilter,
 selectedSemesterFilter,
 selectedKelasFilter,
 selectedStatusFilter,
 ],
 queryFn: () =>
 kelasService.getDaftar({
 page,
 per_page: perPage,
 search: selectedKelasFilter ? selectedKelasFilter : (search || undefined),
 unit_pendidikan_id: selectedUnitFilter || undefined,
 tahun_ajaran_id: selectedTahunFilter || undefined,
 semester_id: selectedSemesterFilter || undefined,
 status: selectedStatusFilter || undefined,
 }),
 })

 const rawList = classData?.data || []
 const stats = classData?.statistik || {
 total_kelas: 0,
 total_aktif: 0,
 wali_terisi: 0,
 total_kapasitas: 0,
 }

 // Generate Master Kelas Options for Dropdown Filter (Cascading turunan dari unit pendidikan)
 const masterKelasOptions = useMemo(() => {
 const list = []
 const seen = new Set()
 const all = [...(optionsData?.kelas || []), ...(rawList || [])]
 const filterUnit = selectedUnitFilter ? String(selectedUnitFilter).toLowerCase().trim() : ''

 all.forEach((k) => {
 const kUnitId = String(k.unit_pendidikan_id || k.unit_id || k.education_unit_id || '').toLowerCase().trim()
 if (filterUnit && kUnitId && kUnitId !== filterUnit) {
 return
 }
 const name = k.nama_kelas || k.name
 if (name && !seen.has(name)) {
 seen.add(name)
 list.push({
 id: k.id,
 nama_kelas: name,
 kode_kelas: k.kode_kelas || '',
 unit_id: k.unit_pendidikan_id || k.unit_id || '',
 })
 }
 })
 return list.sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas))
 }, [optionsData?.kelas, rawList, selectedUnitFilter])

 // Auto-reset filter kelas jika unit pendidikan berganti dan kelas aktif tidak terdapat di unit baru
 useEffect(() => {
 if (selectedKelasFilter && masterKelasOptions.length > 0) {
 const exists = masterKelasOptions.some(
 (k) => String(k.nama_kelas) === String(selectedKelasFilter) || String(k.id) === String(selectedKelasFilter)
 )
 if (!exists) {
 setSelectedKelasFilter('')
 }
 }
 }, [masterKelasOptions, selectedKelasFilter])

 // Destination Classes for Pindah Kelas (Restricted to the SAME tingkat e.g. Tingkat 1 -> Tingkat 1)
 const destinationClasses = useMemo(() => {
 if (!selectedKelasSiswa) return []
 const all = [...(optionsData?.kelas || []), ...(rawList || [])]
 const list = []
 const seen = new Set()
 const currentTingkat = String(selectedKelasSiswa.tingkat || '')

 all.forEach((k) => {
 const classId = k.id
 const classTingkat = String(k.tingkat || '')
 if (classId && classId !== selectedKelasSiswa.id && !seen.has(classId)) {
 // Enforce same tingkat rule (siswa tingkat 1 hanya bisa ke rombel lain di tingkat 1)
 if (!currentTingkat || !classTingkat || classTingkat === currentTingkat) {
 seen.add(classId)
 list.push({
 id: classId,
 nama_kelas: k.nama_kelas || k.name,
 kode_kelas: k.kode_kelas || '',
 tingkat: k.tingkat || '',
 jenjang: k.jenjang || '',
 unit_id: k.unit_pendidikan_id || k.unit_id,
 })
 }
 }
 })
 return list.sort((a, b) => a.nama_kelas.localeCompare(b.nama_kelas))
 }, [selectedKelasSiswa, optionsData?.kelas, rawList])

 const paginationInfo = {
 total: classData?.meta?.total || rawList.length,
 from: classData?.meta?.from || (rawList.length > 0 ? 1 : 0),
 to: classData?.meta?.to || rawList.length,
 last_page: classData?.meta?.last_page || 1,
 current_page: classData?.meta?.current_page || page,
 per_page: classData?.meta?.per_page || perPage,
 }

 const availableSemestersForm = useMemo(() => {
 if (!formData.tahun_ajaran_id) return masterSemesters
 return masterSemesters.filter((s) => s.academic_year_id === formData.tahun_ajaran_id)
 }, [masterSemesters, formData.tahun_ajaran_id])

 const filteredEmployeesForm = useMemo(() => {
 if (!formData.unit_pendidikan_id) return masterEmployees
 return masterEmployees.filter((e) => !e.unit_id || e.unit_id === formData.unit_pendidikan_id)
 }, [masterEmployees, formData.unit_pendidikan_id])

 // Tingkat yang tersedia berdasarkan jenjang yang dipilih di form
 const filteredTingkat = useMemo(() => {
 return JENJANG_TINGKAT_MAP[formData.jenjang] || TINGKAT_DEFAULT_ALL
 }, [formData.jenjang])

 // Query for Students in Modal
 const siswaQuery = useQuery({
 queryKey: ['kelas-siswa-list', selectedKelasSiswa?.id],
 queryFn: async () => {
 if (!selectedKelasSiswa?.id) return []
 const res = await kelasService.getSiswaRombel(selectedKelasSiswa.id)
 return res?.siswa || res?.data || res || []
 },
 enabled: Boolean(selectedKelasSiswa?.id && isSiswaModalOpen),
 })

 const siswaList = useMemo(() => {
 const data = siswaQuery.data
 return Array.isArray(data) ? data : []
 }, [siswaQuery.data])

 const filteredSiswaList = useMemo(() => {
 if (!siswaSearch.trim()) return siswaList
 const q = siswaSearch.toLowerCase().trim()
 return siswaList.filter((s) => {
 const name = (s.full_name || s.nama || '').toLowerCase()
 const nis = (s.nis || '').toLowerCase()
 const nisn = (s.nisn || '').toLowerCase()
 return name.includes(q) || nis.includes(q) || nisn.includes(q)
 })
 }, [siswaList, siswaSearch])

 const siswaTotalPages = Math.max(1, Math.ceil(filteredSiswaList.length / SISWA_MODAL_PAGE_SIZE))
 const paginatedSiswaList = useMemo(() => {
 return filteredSiswaList.slice((siswaModalPage - 1) * SISWA_MODAL_PAGE_SIZE, siswaModalPage * SISWA_MODAL_PAGE_SIZE)
 }, [filteredSiswaList, siswaModalPage])

 // Open Siswa Modal Handler
 const openSiswaModal = (kelasItem) => {
 setSelectedKelasSiswa(kelasItem)
 setSiswaSearch('')
 setSiswaModalPage(1)
 setSelectedStudentIds([])
 setSingleStudentToMove(null)
 setTargetKelasId('')
 setIsSiswaModalOpen(true)
 }

 // Checkbox Select Handlers
 const toggleSelectAllStudents = () => {
 if (selectedStudentIds.length === filteredSiswaList.length) {
 setSelectedStudentIds([])
 } else {
 setSelectedStudentIds(filteredSiswaList.map((s) => s.id))
 }
 }

 const toggleSelectStudent = (id) => {
 setSelectedStudentIds((prev) =>
 prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
 )
 }

 // Open Single Move Dialog
 const openSingleMoveDialog = (siswaItem) => {
 setSingleStudentToMove(siswaItem)
 setTargetKelasId('')
 setIsPindahModalOpen(true)
 }

 // Open Batch Move Dialog
 const openBatchMoveDialog = () => {
 setSingleStudentToMove(null)
 setTargetKelasId('')
 setIsPindahModalOpen(true)
 }

 // Execute Class Transfer (Pindah Kelas)
 const executePindahKelas = async () => {
 if (!targetKelasId) {
 pushToast('Pilih Kelas', 'Silakan pilih kelas tujuan terlebih dahulu.', 'warning')
 return
 }

 const targets = singleStudentToMove
 ? [singleStudentToMove]
 : siswaList.filter((s) => selectedStudentIds.includes(s.id))

 if (!targets.length) {
 pushToast('Peringatan', 'Tidak ada siswa yang dipilih untuk dipindahkan.', 'warning')
 return
 }

 try {
 setMovingLoading(true)
 for (const studentItem of targets) {
 await studentService.pindahKelas(studentItem.id, targetKelasId, studentItem)
 }

 const targetObj = destinationClasses.find((c) => c.id === targetKelasId)
 pushToast(
 'Berhasil Dipindahkan',
 `${targets.length} siswa berhasil dipindahkan ke kelas ${targetObj?.nama_kelas || 'tujuan'}.`,
 'success'
 )

 setIsPindahModalOpen(false)
 setSelectedStudentIds([])
 setSingleStudentToMove(null)
 setTargetKelasId('')
 siswaQuery.refetch()
 queryClient.invalidateQueries({ queryKey: ['kelas-list'] })
 } catch (err) {
 let rawMsg = err?.response?.data?.message || ''
 let textMsg = 'Terjadi kesalahan saat memindahkan kelas siswa.'
 if (rawMsg.includes('does not have the right permissions') || rawMsg.includes('does not have permission') || rawMsg.includes('Unauthorized')) {
 textMsg = 'Akun Anda tidak memiliki hak akses (izin) untuk mengubah data siswa pada unit pendidikan ini.'
 } else if (rawMsg) {
 textMsg = rawMsg
 }
 pushToast('Gagal Memindahkan Siswa', textMsg, 'error')
 } finally {
 setMovingLoading(false)
 }
 }

 // Mutations
 const createMutation = useMutation({
 mutationFn: (payload) => kelasService.tambah(payload),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['kelas-list'] })
 queryClient.invalidateQueries({ queryKey: ['kelas-options'] })
 pushToast('Berhasil Ditambahkan', 'Data kelas/rombel baru berhasil ditambahkan.', 'success')
 closeFormModal()
 },
 onError: (err) => {
 const respErrors = err?.response?.data?.errors || {}
 setFormErrors(respErrors)
 pushToast('Gagal Menyimpan', err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data kelas.', 'error')
 },
 })

 const updateMutation = useMutation({
 mutationFn: ({ id, payload }) => kelasService.ubah({ id, payload }),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['kelas-list'] })
 pushToast('Berhasil Diperbarui', 'Data kelas/rombel berhasil diperbarui.', 'success')
 closeFormModal()
 },
 onError: (err) => {
 const respErrors = err?.response?.data?.errors || {}
 setFormErrors(respErrors)
 pushToast('Gagal Memperbarui', err?.response?.data?.message || 'Terjadi kesalahan saat memperbarui data.', 'error')
 },
 })

 const deleteMutation = useMutation({
 mutationFn: (id) => kelasService.hapus(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['kelas-list'] })
 setIsDeleteModalOpen(false)
 setDeleteTarget(null)
 pushToast('Berhasil Dihapus', 'Data kelas berhasil dihapus dari sistem.', 'success')
 },
 onError: (err) => {
 pushToast('Gagal Menghapus', err?.response?.data?.message || 'Gagal menghapus data kelas.', 'error')
 },
 })

 // Handlers
 const openCreateModal = () => {
 setIsEditMode(false)
 setCurrentStep(1)
 setFormErrors({})
 const defaultUnit = masterUnits[0]?.id || ''
 const defaultJenjang = masterUnits[0]?.jenjang || masterUnits[0]?.level || masterUnits[0]?.type || masterJenjang[0]?.value || masterJenjang[0] || ''
 const defaultTahun = masterTahunAjaran.find((t) => t.is_active)?.id || masterTahunAjaran[0]?.id || ''
 const defaultSem = masterSemesters.find((s) => s.is_active)?.id || masterSemesters[0]?.id || ''
 setFormData({ ...initialFormState(defaultJenjang), unit_pendidikan_id: defaultUnit, tahun_ajaran_id: defaultTahun, semester_id: defaultSem })
 setIsFormModalOpen(true)
 }

 const openEditModal = (item) => {
 setIsEditMode(true)
 setCurrentStep(1)
 setFormErrors({})
 const unitObj = masterUnits.find((u) => String(u.id ?? u.unit_id) === String(item.unit_pendidikan_id))
 setFormData({
 id: item.id,
 unit_pendidikan_id: item.unit_pendidikan_id || '',
 tahun_ajaran_id: item.tahun_ajaran_id || '',
 semester_id: item.semester_id || '',
 jenjang: item.jenjang || unitObj?.jenjang || unitObj?.level || '',
 tingkat: item.tingkat || '1',
 kode_kelas: item.kode_kelas || '',
 nama_kelas: item.nama_kelas || '',
 wali_kelas_id: item.wali_kelas_id || '',
 kapasitas: item.kapasitas || 30,
 ruangan: item.ruangan || '',
 status: item.status || 'Aktif',
 })
 setIsFormModalOpen(true)
 }

 const closeFormModal = () => {
 setIsFormModalOpen(false)
 setFormData(initialFormState())
 setFormErrors({})
 setCurrentStep(1)
 }

 const handleNextStep = () => {
 setFormErrors({})
 if (currentStep === 1) {
 if (!formData.unit_pendidikan_id) return setFormErrors({ unit_pendidikan_id: ['Pilih Unit Pendidikan terlebih dahulu.'] })
 if (!formData.tahun_ajaran_id) return setFormErrors({ tahun_ajaran_id: ['Pilih Tahun Ajaran terlebih dahulu.'] })
 } else if (currentStep === 2) {
 if (!formData.semester_id) return setFormErrors({ semester_id: ['Pilih Semester terlebih dahulu.'] })
 if (!formData.jenjang || !formData.tingkat) return setFormErrors({ jenjang: ['Lengkapi jenjang dan tingkat kelas.'] })
 } else if (currentStep === 3) {
 if (!formData.nama_kelas.trim()) return setFormErrors({ nama_kelas: ['Nama kelas wajib diisi.'] })
 if (!formData.kode_kelas.trim()) return setFormErrors({ kode_kelas: ['Kode kelas wajib diisi.'] })
 if (Number(formData.kapasitas) < 1) return setFormErrors({ kapasitas: ['Kapasitas minimal 1 siswa.'] })
 }
 setCurrentStep((prev) => Math.min(prev + 1, 4))
 }

 const handleSubmitForm = (e) => {
 e?.preventDefault()
 setShowSaveConfirmModal(true)
 }

 const handleConfirmSaveForm = () => {
 if (isEditMode) {
 updateMutation.mutate({ id: formData.id, payload: formData })
 } else {
 createMutation.mutate(formData)
 }
 setShowSaveConfirmModal(false)
 }

 const handleExportExcel = async () => {
 const params = {}
 if (search) params.search = search
 if (selectedUnitFilter) params.unit_pendidikan_id = selectedUnitFilter
 if (selectedTahunFilter) params.tahun_ajaran_id = selectedTahunFilter
 if (selectedSemesterFilter) params.semester_id = selectedSemesterFilter
 if (selectedKelasFilter) params.tingkat = selectedKelasFilter
 if (selectedStatusFilter) params.status = selectedStatusFilter

 await handleApiExport({
 endpoint: '/kelas/export',
 params,
 title: 'Ekspor Data Kelas',
 defaultFilename: `Data_Master_Kelas_${new Date().toISOString().slice(0, 10)}`,
 })
 }

 const resetFilters = () => {
 setSearch('')
 setSelectedUnitFilter(!canSeeUnitFilter && userUnitId ? String(userUnitId) : '')
 setSelectedTahunFilter('')
 setSelectedSemesterFilter('')
 setSelectedKelasFilter('')
 setSelectedStatusFilter('')
 setPage(1)
 }

 // ── Print / Export / Import Modal State ────────────────────────────────────
 const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
 const [printScopeMode, setPrintScopeMode] = useState('all')
 const [showExportModal, setShowExportModal] = useState(false)
 const [exportFormat, setExportFormat] = useState('xlsx')
 const [showImportModal, setShowImportModal] = useState(false)
 const [importFile, setImportFile] = useState(null)
 const [importPreviewData, setImportPreviewData] = useState([])
 const [isImporting, setIsImporting] = useState(false)
 const [overwriteExisting, setOverwriteExisting] = useState(false)
 const [duplicateModalData, setDuplicateModalData] = useState(null)

 // ── Print Payload Builder ────────────────────────────────────────────────
 const getPrintPayload = (mode = 'all') => {
 const rowsToPrint = Array.isArray(rawList) ? rawList : []
 const title = mode === 'wali'
 ? 'Laporan Wali Kelas & Rombongan Belajar'
 : mode === 'kapasitas'
 ? 'Laporan Kapasitas & Ruangan Kelas'
 : 'Laporan Data Kelas & Rombongan Belajar'
 const filename = mode === 'wali'
 ? 'laporan_wali_kelas.pdf'
 : mode === 'kapasitas'
 ? 'laporan_kapasitas_kelas.pdf'
 : 'laporan_data_kelas.pdf'
 const headers = mode === 'wali'
 ? ['NO', 'KODE KELAS', 'NAMA KELAS', 'JENJANG', 'TINGKAT', 'WALI KELAS', 'STATUS']
 : mode === 'kapasitas'
 ? ['NO', 'KODE KELAS', 'NAMA KELAS', 'JENJANG', 'TINGKAT', 'KAPASITAS', 'RUANGAN', 'STATUS']
 : ['NO', 'KODE KELAS', 'NAMA KELAS', 'UNIT PENDIDIKAN', 'TINGKAT', 'WALI KELAS', 'KAPASITAS', 'RUANGAN', 'STATUS']
 const rows = rowsToPrint.map((row, i) => {
 const status = typeof row.status === 'string' ? row.status : row.status ? 'Aktif' : 'Nonaktif'
 if (mode === 'wali') return [
 i + 1,
 row.kode_kelas || '-',
 row.nama_kelas || '-',
 row.jenjang || '-',
 row.tingkat || '-',
 row.wali_kelas?.nama_lengkap || row.wali_kelas?.name || '-',
 status,
 ]
 if (mode === 'kapasitas') return [
 i + 1,
 row.kode_kelas || '-',
 row.nama_kelas || '-',
 row.jenjang || '-',
 row.tingkat || '-',
 row.kapasitas || '-',
 row.ruangan || '-',
 status,
 ]
 return [
 i + 1,
 row.kode_kelas || '-',
 row.nama_kelas || '-',
 row.unit_pendidikan?.name || row.unit_name || row.jenjang || '-',
 row.tingkat || '-',
 row.wali_kelas?.nama_lengkap || row.wali_kelas?.name || '-',
 row.kapasitas || '-',
 row.ruangan || '-',
 status,
 ]
 })
 return { title, filename, headers, rows }
 }

 const handlePrintClean = (mode = printScopeMode) => {
 const { title, headers, rows } = getPrintPayload(mode)
 printCleanTable({ title, headers, rows })
 }

 const handleDownloadPdfTable = (mode = printScopeMode) => {
 const { title, filename, headers, rows } = getPrintPayload(mode)
 downloadPdfTable({ title, filename, headers, rows })
 }

 // ── Export Handler ───────────────────────────────────────────────────────
 const handleProcessExport = async () => {
 if (exportFormat === 'pdf') {
 setShowExportModal(false)
 handleDownloadPdfTable(printScopeMode)
 pushToast('Export Berhasil', 'Dokumen PDF kelas siap dicetak atau diunduh.', 'success')
 return
 }
 setShowExportModal(false)
 const params = {}
 if (search) params.search = search
 if (selectedUnitFilter) params.unit_pendidikan_id = selectedUnitFilter
 if (selectedTahunFilter) params.tahun_ajaran_id = selectedTahunFilter
 if (selectedSemesterFilter) params.semester_id = selectedSemesterFilter
 if (selectedStatusFilter) params.status = selectedStatusFilter
 await downloadFileFromApi('/kelas/export', params, exportFormat, 'Data_Master_Kelas')
 pushToast('Export Berhasil', `Data kelas berhasil diexport ke format .${exportFormat.toUpperCase()}.`, 'success')
 }

 // ── Import Handlers ──────────────────────────────────────────────────────
 const handleDownloadTemplate = (format = 'csv') => {
 const headers = ['Kode Kelas', 'Nama Kelas', 'Jenjang', 'Tingkat', 'Unit Pendidikan', 'Tahun Ajaran', 'Semester', 'Kapasitas', 'Ruangan', 'Status']
 const sample1 = ['KLS-1A', 'Kelas 1A Abu Bakar', 'SDIT', '1', 'SDIT 1', '2026/2027', 'Ganjil', '30', 'Ruang 101', 'Aktif']
 const sample2 = ['KLS-1B', 'Kelas 1B Umar Bin Khattab', 'SDIT', '1', 'SDIT 1', '2026/2027', 'Ganjil', '30', 'Ruang 102', 'Aktif']
 const csvContent = [headers.join(','), sample1.map(v => `"${v}"`).join(','), sample2.map(v => `"${v}"`).join(',')].join('\n')
 const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = format === 'xlsx' ? 'Template_Import_Kelas.csv' : 'Template_Import_Kelas.csv'
 a.click()
 URL.revokeObjectURL(url)
 }

 const handleFileSelect = (e) => {
 const file = e.target.files?.[0]
 if (!file) return
 setImportFile(file)
 setImportPreviewData([])
 const ext = file.name.split('.').pop()?.toLowerCase()

 const existingCodes = new Set((rawList || []).map(k => String(k.kode_kelas || k.kode || '').trim().toLowerCase()).filter(Boolean))
 const existingNames = new Set((rawList || []).map(k => String(k.nama_kelas || k.nama || '').trim().toLowerCase()).filter(Boolean))

 if (ext === 'xlsx' || ext === 'xls') {
 setImportPreviewData([{
 kode: '(Auto)',
 nama: file.name,
 tingkat: ext.toUpperCase(),
 status: 'Siap Impor',
 isDuplicate: false,
 }])
 return
 }
 const reader = new FileReader()
 reader.onload = () => {
 const content = String(reader.result || '').replace(/^\uFEFF/, '')
 const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0)
 if (lines.length <= 1) return
 const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
 const parseCsvLine = line => {
 const values = []
 let value = ''
 let quoted = false
 for (let i = 0; i < line.length; i++) {
 const char = line[i]
 if (char === '"' && line[i + 1] === '"' && quoted) { value += '"'; i++ }
 else if (char === '"') { quoted = !quoted }
 else if (char === delimiter && !quoted) { values.push(value.trim()); value = '' }
 else { value += char }
 }
 values.push(value.trim())
 return values
 }
 const headerRow = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_\-.:/]/g, ''))
 const findCol = keys => headerRow.findIndex(h => keys.includes(h))
 const idxKode = findCol(['kodekelas', 'kode', 'code'])
 const idxNama = findCol(['namakelas', 'nama', 'name'])
 const idxTingkat = findCol(['tingkat', 'level'])
 const dataLines = lines.slice(1)
 const rowsData = dataLines.map(line => {
 const cols = parseCsvLine(line)
 const kode = idxKode !== -1 ? (cols[idxKode] || '') : (cols[0] || '')
 const nama = idxNama !== -1 ? (cols[idxNama] || '') : (cols[1] || '')
 const tingkat = idxTingkat !== -1 ? (cols[idxTingkat] || '') : (cols[2] || '')
 const isDuplicate = (kode && existingCodes.has(kode.toLowerCase())) || (nama && existingNames.has(nama.toLowerCase()))
 let status = 'Baru'
 if (!nama && !kode) {
 status = 'Tidak valid'
 } else if (isDuplicate) {
 status = 'Sudah Ada'
 }
 return { kode, nama, tingkat, status, isDuplicate }
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
 if (selectedUnitFilter) {
 formData.append('unit_pendidikan_id', selectedUnitFilter)
 }
 const res = await kelasService.prosesImport(formData)
 const resData = res?.data || res || {}
 setIsImporting(false)
 setImportPreviewData([])
 setImportFile(null)
 setShowImportModal(false)
 queryClient.invalidateQueries({ queryKey: ['kelas-list'] })

 const duplicateList = resData.duplicates || []
 const duplicateCount = resData.duplikat || 0
 const updatedCount = resData.diperbarui || 0
 const createdCount = resData.berhasil || 0
 const failedCount = resData.gagal || 0

 // Tampilkan modal hasil jika ada data yang sama (duplikat atau ditimpa) atau ada error
 if (duplicateList.length > 0 || duplicateCount > 0 || updatedCount > 0 || failedCount > 0) {
 setDuplicateModalData({
 total: resData.total || (createdCount + updatedCount + duplicateCount + failedCount),
 berhasil: createdCount,
 diperbarui: updatedCount,
 duplikat: duplicateCount,
 gagal: failedCount,
 overwrite: overwriteExisting,
 duplicates: duplicateList,
 errors: resData.errors || [],
 })
 }

 if (updatedCount > 0) {
 pushToast(
 'Import Selesai (Ditimpa)',
 `${createdCount} kelas baru ditambahkan, ${updatedCount} data kelas yang sama berhasil ditimpa/diperbarui.${duplicateCount > 0 ? ` (${duplicateCount} dilewati)` : ''}${failedCount > 0 ? ` (${failedCount} gagal)` : ''}`,
 failedCount > 0 && createdCount === 0 && updatedCount === 0 ? 'error' : 'success'
 )
 } else if (duplicateCount > 0) {
 pushToast(
 'Pemberitahuan Duplikat',
 `${createdCount} data baru ditambahkan. Ditemukan ${duplicateCount} data kelas yang sudah ada dan dilewati karena opsi timpa tidak diaktifkan.${failedCount > 0 ? ` (${failedCount} gagal)` : ''}`,
 'warning'
 )
 } else {
 pushToast(
 'Import Berhasil',
 `Data kelas berhasil diimpor. Berhasil: ${createdCount}, Gagal: ${failedCount}`,
 failedCount > 0 && createdCount === 0 ? 'error' : 'success'
 )
 }
 } catch (err) {
 setIsImporting(false)
 const msg = err?.response?.data?.message || err.message || 'Gagal memproses impor data kelas.'
 pushToast('Import Gagal', msg, 'error')
 }
 }

 const hasActiveFilters = Boolean(
 search || selectedUnitFilter || selectedTahunFilter || selectedSemesterFilter || selectedKelasFilter || selectedStatusFilter
 )

 const pageActions = (
 <PageToolbarActions
 onPrint={() => setPrintOptionModalOpen(true)}
 onImport={canImport ? () => setShowImportModal(true) : undefined}
 onExport={canExport ? () => setShowExportModal(true) : undefined}
 primaryAction={canCreate ? {
 label: 'Tambah Kelas',
 icon: Plus,
 onClick: openCreateModal,
 } : null}
 />
 )

 // Master Kelas Columns (Canonical Standard Benchmark)
  // Master Kelas Columns (Canonical 5-Column Benchmark: 4 Content + 1 Aksi Tanpa Label)
  const kelasColumns = useMemo(() => [
    {
      key: 'nama_kelas',
      label: 'Kelas & Kode',
      sortable: true,
      className: 'py-3.5 px-4 w-[28%]',
      render: (item) => {
        const styleUnit = getUnitBadgeStyle(item.jenjang || item.unit_pendidikan?.level)
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 shrink-0 rounded-xl ${styleUnit.bg} ${styleUnit.text} font-black text-xs flex items-center justify-center shadow-xs border ${styleUnit.border}`}>
              {(item.jenjang || item.unit_pendidikan?.level || 'SD').slice(0, 3)}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-white text-xs truncate">{item.nama_kelas}</div>
              <div className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{item.kode_kelas}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'unit_pendidikan',
      label: 'Unit & Jenjang',
      sortable: true,
      className: 'py-3.5 px-4 w-[24%]',
      render: (item) => {
        const styleUnit = getUnitBadgeStyle(item.jenjang || item.unit_pendidikan?.level)
        return (
          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block truncate">
              {item.unit_pendidikan?.name || '-'}
            </span>
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${styleUnit.bg} ${styleUnit.text} ${styleUnit.border}`}>
              {item.jenjang || 'Jenjang'} - Tkt {item.tingkat || '-'}
            </span>
          </div>
        )
      },
    },
    {
      key: 'wali_kelas',
      label: 'Wali Kelas',
      className: 'py-3.5 px-4 w-[24%]',
      render: (item) => (
        <PersonIdentityCell
          src={item.wali_kelas?.photo_url || item.wali_kelas?.avatar_url || item.wali_kelas?.foto}
          name={item.wali_kelas?.nama_tampil || item.wali_kelas?.nama_lengkap || item.wali_kelas?.name || 'Belum diatur'}
          subtitle={item.wali_kelas?.niy ? `NIY ${item.wali_kelas.niy}` : 'Wali kelas'}
        />
      ),
    },
    {
      key: 'status',
      label: 'Kapasitas & Status',
      className: 'py-3.5 px-4 text-center w-[16%]',
      render: (item) => (
        <div className="flex flex-col items-center gap-1.5">
          <MasterStatusBadge active={item.status === 'Aktif'} inactiveLabel="Tidak Aktif" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); openSiswaModal(item) }}
            className="group/btn inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/50 px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-slate-200 cursor-pointer shadow-2xs h-auto"
            title="Klik untuk melihat data siswa"
          >
            <span><strong>{item.jumlah_siswa || 0}</strong>/{item.kapasitas || 30}</span>
            <Users className="h-3 w-3 text-emerald-600 dark:text-emerald-400 group-hover/btn:scale-110 transition-transform" />
          </Button>
        </div>
      ),
    },
  ], [])

 const renderMobileCard = ({ row, onView, onEdit, onDelete, extraItems }) => {
 const styleUnit = getUnitBadgeStyle(row.jenjang || row.unit_pendidikan?.level)
 return (
 <MobileDataCard
 title={row.nama_kelas}
 subtitle={`${row.kode_kelas || ''} • ${row.unit_pendidikan?.name || '-'}`}
 badge={row.status === 'Aktif' ? 'Aktif' : 'Tidak Aktif'}
 badgeVariant={row.status === 'Aktif' ? 'success' : 'neutral'}
 fields={[
 {
 label: 'Jenjang / Tingkat',
 value: `${row.jenjang || ''} - Tkt ${row.tingkat || ''}`,
 },
 {
 label: 'Wali Kelas',
 value: row.wali_kelas?.nama_tampil || row.wali_kelas?.nama_lengkap || row.wali_kelas?.name || 'Belum diatur',
 },
 {
 label: 'Kapasitas',
 value: `${row.jumlah_siswa || 0} / ${row.kapasitas || 30} Siswa (Ruang: ${row.ruangan || '-'})`,
 },
 ]}
 onClick={() => { setDetailKelas(row); setIsDetailModalOpen(true) }}
 onView={() => { setDetailKelas(row); setIsDetailModalOpen(true) }}
 onEdit={canUpdate ? () => openEditModal(row) : undefined}
 onDelete={canDelete ? () => { setDeleteTarget(row); setIsDeleteModalOpen(true) } : undefined}
 extraItems={extraItems}
 />
 )
 }

 const shouldHideBreadcrumb = embedded || hideBreadcrumb
 const shouldHideHeader = embedded || hidePageHeader

 return (
 <PageContainer maxW="7xl">
 {/* ══════════════════════════════════════════════════════════════════
 EXPORT DIALOG — Harmonized HeroUI Batch Modal
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {showExportModal && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="kelas-export-title"
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
 <Download className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="kelas-export-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Export Data Kelas</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Unduh
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pilih format berkas untuk mengekspor data master kelas
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setShowExportModal(false)}
 aria-label="Tutup modal export"
 className="size-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-slate-200 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors cursor-pointer"
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
 : "border-emerald-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-emerald-800/60 dark:hover:border-emerald-700/80 dark:hover:bg-emerald-950/30"
 )}
 >
 <input
 type="radio"
 name="kelas-export-fmt"
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
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
 >
 <X className="size-3.5 text-slate-500 dark:text-slate-400" strokeWidth={2.2} />
 <span>Batal</span>
 </button>
 <button
 type="button"
 onClick={handleProcessExport}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-5 py-2.5 text-xs font-extrabold border-2 border-emerald-300 dark:border-emerald-800 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer"
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
 IMPORT DIALOG — Harmonized HeroUI Batch Modal
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {showImportModal && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="kelas-import-title"
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
 <h3 id="kelas-import-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Import Data Kelas</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Batch Import
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Unggah berkas spreadsheet (.xlsx, .xls, atau .csv) untuk impor data kelas massal
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setShowImportModal(false)}
 aria-label="Tutup form import"
 className="size-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-slate-200 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors cursor-pointer"
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
 <Download className="size-4.5 text-slate-600" strokeWidth={2.2} />
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
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 cursor-pointer hover:scale-[1.02] active:scale-95"
 >
 <div className="flex size-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 <Download className="size-3" strokeWidth={2.2} />
 </div>
 <span>CSV</span>
 </button>
 </div>
 </div>

 {/* Dropzone Upload */}
 <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-6 text-center transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/40 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/30 dark:hover:border-emerald-700/80 dark:hover:bg-emerald-950/20">
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
 <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 {importPreviewData.length} baris
 </span>
 </p>
 </div>
 <div className="max-h-44 overflow-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xs dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <TableRoot className="w-full text-left text-xs">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 {['Kode', 'Nama Kelas', 'Tingkat', 'Status'].map(h => (
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
 r.status === 'Valid' || r.status === 'Siap Impor' || r.status === 'Baru'
 ? "bg-emerald-50 text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
 : r.isDuplicate || r.status === 'Sudah Ada'
 ? overwriteExisting
 ? "bg-amber-50 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300"
 : "bg-sky-50 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300"
 : "bg-rose-50 text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-400 dark:border-emerald-800/60"
 )}>
 {r.isDuplicate
 ? (overwriteExisting ? 'Sudah Ada (Akan Ditimpa)' : 'Sudah Ada (Dilewati)')
 : r.status}
 </span>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 </div>
 )}

 {/* Opsi Timpa Data (Overwrite) */}
 <div className={cn(
 "rounded-xl border p-4 transition-all duration-200",
 overwriteExisting
 ? "border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark dark:border-emerald-800/60 dark:bg-amber-950/30"
 : "border-emerald-200/80 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900/40"
 )}>
 <label className="flex items-start gap-3 cursor-pointer select-none">
 <div className="pt-0.5">
 <input
 type="checkbox"
 id="overwrite-kelas-checkbox"
 checked={overwriteExisting}
 onChange={e => setOverwriteExisting(e.target.checked)}
 className="size-4.5 rounded-md border-emerald-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
 />
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
 Timpa Data Jika Kode Kelas Sudah Ada
 </span>
 {overwriteExisting ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300">
 <RefreshCcw className="size-2.5" />
 Opsi Timpa Aktif
 </span>
 ) : (
 <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
 Lewati Duplikat (Default)
 </span>
 )}
 </div>
 <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
 {overwriteExisting
 ? 'Jika baris data pada berkas memiliki Kode Kelas yang sudah terdaftar, data kelas lama akan diperbarui otomatis dengan data berkas terbaru.'
 : 'Jika baris data pada berkas memiliki Kode Kelas yang sudah ada di database, baris tersebut akan dilewati dan data lama tetap utuh.'}
 </p>
 </div>
 </label>
 </div>

 {/* Guidance Banner */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30 flex items-start gap-2.5">
 <ShieldCheck className="size-4.5 text-[#059669] dark:text-emerald-400 shrink-0 mt-0.5" />
 <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
 Sistem akan otomatis memvalidasi keunikan kode kelas dan menyinkronkan data rombongan belajar tanpa merusak integritas relasi yang sudah ada.
 </p>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <button
 type="button"
 onClick={() => setShowImportModal(false)}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
 >
 <X className="size-3.5 text-slate-500 dark:text-slate-400" strokeWidth={2.2} />
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

 {/* ── MODAL HASIL IMPOR & PEMBERITAHUAN DATA DUPLIKAT ── */}
 <AnimatePresence>
 {duplicateModalData && (
 <div
 className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="kelas-duplicate-report-title"
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
 <h3 id="kelas-duplicate-report-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Hasil Impor & Pemberitahuan Data</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 Total {duplicateModalData.total} Data
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Ringkasan sinkronisasi dan status pemrosesan data kelas
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
 <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{duplicateModalData.berhasil}</p>
 </div>
 <div className="p-3 rounded-xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-center">
 <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Ditimpa / Diupdate</p>
 <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{duplicateModalData.diperbarui}</p>
 </div>
 <div className="p-3 rounded-xl border-2 border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 text-center">
 <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">Duplikat Dilewati</p>
 <p className="text-xl font-black text-sky-700 dark:text-sky-400 mt-0.5">{duplicateModalData.duplikat}</p>
 </div>
 <div className="p-3 rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-center">
 <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase">Gagal Diproses</p>
 <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{duplicateModalData.gagal}</p>
 </div>
 </div>

 {/* Duplicate Detail Table if exists */}
 {duplicateModalData.duplicates && duplicateModalData.duplicates.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
 <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
 <span>Daftar Data yang Sama (Kode Kelas Terdaftar)</span>
 <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
 {duplicateModalData.duplicates.length} baris
 </span>
 </p>
 </div>
 <div className="max-h-56 overflow-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xs dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <TableRoot className="w-full text-left text-xs">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="px-3 py-2 w-14">Baris</TableHead>
 <TableHead className="px-3 py-2">Kode</TableHead>
 <TableHead className="px-3 py-2">Nama Kelas</TableHead>
 <TableHead className="px-3 py-2">Status Aksi</TableHead>
 <TableHead className="px-3 py-2">Keterangan</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {duplicateModalData.duplicates.map((item, idx) => (
 <TableRow key={idx} className="hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
 <TableCell className="px-3 py-2 font-mono text-slate-500">{item.baris}</TableCell>
 <TableCell className="px-3 py-2 font-mono font-bold text-slate-800 dark:text-slate-200">{item.kode}</TableCell>
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
 <li key={i}>{err}</li>
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

 {/* ══════════════════════════════════════════════════════════════════
 CETAK & PDF DIALOG — Harmonized HeroUI Scope Selection Modal
 ══════════════════════════════════════════════════════════════════ */}
 <AnimatePresence>
 {printOptionModalOpen && (
 <div
 role="dialog"
 tabIndex={-1}
 aria-modal="true"
 aria-labelledby="kelas-print-option-title"
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
 <h3 id="kelas-print-option-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Opsi & Scope Cetak Laporan</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Cetak & PDF
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pilih jenis laporan kelas yang ingin dicetak atau diunduh
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setPrintOptionModalOpen(false)}
 aria-label="Tutup modal"
 className="rounded-xl p-2 bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
 {/* Selector Cards */}
 <div className="space-y-2.5">
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
 Pilih Kategori Laporan Kelas
 </label>

 {/* Mode 1: Seluruh Data Kelas */}
 <div
 onClick={() => setPrintScopeMode('all')}
 className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${printScopeMode === 'all'
 ? 'border-[#059669] bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 shadow-xs ring-1 ring-[#059669]'
 : 'border-emerald-200/80 bg-white hover:bg-slate-50/80 dark:border-emerald-800/60 dark:bg-slate-900/40'
 }`}
 >
 <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${printScopeMode === 'all' ? 'border-[#059669] bg-[#059669] text-white' : 'border-emerald-300 dark:border-slate-600'
 }`}>
 {printScopeMode === 'all' && <span className="size-2 rounded-full bg-white" />}
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <School className="size-4 text-[#059669] dark:text-emerald-400" />
 <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
 Cetak Seluruh Data Kelas & Rombel
 </h4>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 Laporan lengkap master kelas: Kode, Nama, Unit, Tingkat, Wali Kelas, Kapasitas, Ruangan, dan Status.
 </p>
 </div>
 </div>

 {/* Mode 2: Laporan Wali Kelas */}
 <div
 onClick={() => setPrintScopeMode('wali')}
 className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${printScopeMode === 'wali'
 ? 'border-[#059669] bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 shadow-xs ring-1 ring-[#059669]'
 : 'border-emerald-200/80 bg-white hover:bg-slate-50/80 dark:border-emerald-800/60 dark:bg-slate-900/40'
 }`}
 >
 <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${printScopeMode === 'wali' ? 'border-[#059669] bg-[#059669] text-white' : 'border-emerald-300 dark:border-slate-600'
 }`}>
 {printScopeMode === 'wali' && <span className="size-2 rounded-full bg-white" />}
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
 <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
 Cetak Laporan Wali Kelas
 </h4>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 Daftar penugasan wali kelas per rombel: Nama Kelas, Jenjang, Tingkat, dan Nama Wali Kelas.
 </p>
 </div>
 </div>

 {/* Mode 3: Laporan Kapasitas & Ruangan */}
 <div
 onClick={() => setPrintScopeMode('kapasitas')}
 className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${printScopeMode === 'kapasitas'
 ? 'border-[#059669] bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/40 shadow-xs ring-1 ring-[#059669]'
 : 'border-emerald-200/80 bg-white hover:bg-slate-50/80 dark:border-emerald-800/60 dark:bg-slate-900/40'
 }`}
 >
 <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${printScopeMode === 'kapasitas' ? 'border-[#059669] bg-[#059669] text-white' : 'border-emerald-300 dark:border-slate-600'
 }`}>
 {printScopeMode === 'kapasitas' && <span className="size-2 rounded-full bg-white" />}
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <Layers className="size-4 text-amber-500" />
 <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
 Cetak Laporan Kapasitas & Ruangan
 </h4>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 Rekapitulasi kapasitas tempat duduk, alokasi ruangan, dan tingkat per rombongan belajar.
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
 <p className="text-xs text-slate-500 dark:text-slate-400">Unduh berkas laporan kelas dalam format PDF resmi</p>
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
 className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 Batal
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 <motion.div
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 className="space-y-6 pb-12"
 >
 {/* ── Breadcrumbs Navigation ── */}
 {!shouldHideBreadcrumb && (
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Data Kelas' }]} />
 </motion.div>
 )}

 {/* ── Modern Vivid Hero Header Card ── */}
      {!shouldHideHeader && (
        <HeroUiHeader
          title="Data Kelas & Rombongan Belajar"
          subtitle="Pengelolaan seluruh rombongan belajar, penugasan wali kelas, alokasi ruangan, dan pemindahan kelas siswa."
          icon={School}
          roleTag={isDivisiPendidikan ? 'Supervisi Divisi Pendidikan' : 'Manajemen Rombel'}
          badge="Rombongan Belajar"
        />
      )}

 {/* ── Unit Performance & KPI Scope Bar (Hero UI Component) ── */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-visible z-20 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/20 dark:bg-emerald-950/20 p-4 sm:p-5 shadow-sm"
 >
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm shrink-0 border-2 border-emerald-300 dark:border-emerald-800">
 <Building2 className="size-5" />
 </div>
 <div>
 <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Cakupan Data & KPI Rombongan Belajar
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800">
 {canSeeUnitFilter ? (selectedUnitName ? `Unit: ${selectedUnitName}` : 'Semua Unit') : 'Unit Terkunci'}
 </span>
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {canSeeUnitFilter
 ? `Pilih unit pendidikan untuk melihat total kelas & KPI rombel unit spesifik, atau pilih "Semua Unit" untuk melihat seluruh unit${isDivisiPendidikan ? ' (Supervisi Divisi Pendidikan)' : ''}.`
 : `Menampilkan total rombel, keaktifan kelas, dan KPI khusus untuk unit ${selectedUnitName || user?.unit?.name || user?.unit_name || user?.employee?.unit?.name || 'Unit Terkunci'}.`}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2.5 w-full sm:w-auto">
 {canSeeUnitFilter ? (
 <div className="relative min-w-[260px] sm:w-72">
 <HeroUiFilterSelect
 value={selectedUnitFilter || ''}
 onChange={(val) => {
 setSelectedUnitFilter(String(val || ''))
 setSelectedKelasFilter('')
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Unit Pendidikan' },
 ...masterUnits.map((u, idx) => {
 const val = String(u.id ?? u.unit_id ?? `unit-${idx}`)
 const label = u.name ?? u.nama ?? u.nama_unit ?? val
 return {
 value: val,
 label: label,
 subtext: u.code || u.kode_unit ? `Kode: ${u.code || u.kode_unit}` : undefined,
 }
 }),
 ]}
 placeholder="Semua Unit Pendidikan"
 icon={Building2}
 searchable={masterUnits.length > 5}
 ariaLabel="Filter Unit Scope"
 />
 </div>
 ) : (
 <div className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-2xs dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200">
 <Lock className="size-4 text-emerald-600 dark:text-emerald-400" />
 <span>Unit: {selectedUnitName || user?.unit_name || 'Unit Sekolah Anda'}</span>
 </div>
 )}

 {canSeeUnitFilter && selectedUnitFilter && (
 <button
 type="button"
 onClick={() => {
 setSelectedUnitFilter('')
 setSelectedKelasFilter('')
 setPage(1)
 }}
 title="Reset Filter Unit ke Semua Unit"
 className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/50 dark:text-slate-400 dark:hover:text-emerald-300 rounded-xl transition cursor-pointer"
 >
 Reset
 </button>
 )}
 </div>
 </div>
 </motion.div>

 {/* ── 4-Kartu Ringkasan KPI Multi-Tone ── */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={School}
 label="TOTAL KELAS"
 value={isLoading ? '...' : Number(stats.total_kelas ?? 0).toLocaleString('id-ID')}
 tag={isLoading ? '...' : `${stats.total_kelas ?? 0} Kelas`}
 tone="emerald"
 subtext="Rombongan belajar terdaftar"
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="KELAS AKTIF"
 value={isLoading ? '...' : Number(stats.total_aktif ?? 0).toLocaleString('id-ID')}
 tag={isLoading ? '...' : `${stats.total_aktif ?? 0} Aktif`}
 tone="teal"
 subtext="Status operasional aktif"
 />
 <ModernKpiCard
 icon={UserCheck}
 label="WALI KELAS TERISI"
 value={isLoading ? '...' : Number(stats.wali_terisi ?? 0).toLocaleString('id-ID')}
 tag={isLoading ? '...' : `${stats.wali_terisi ?? 0} Guru`}
 tone="amber"
 subtext="Memiliki wali kelas"
 />
 <ModernKpiCard
 icon={Users}
 label="TOTAL KAPASITAS"
 value={isLoading ? '...' : Number(stats.total_kapasitas ?? 0).toLocaleString('id-ID')}
 tag={isLoading ? '...' : `${stats.total_kapasitas ?? 0} Kuota`}
 tone="indigo"
 subtext="Total kuota tempat duduk"
 />
 </div>
 </motion.div>

 {/* ── Master Datatable Panel (AppDataTable) ── */}
 <motion.div variants={itemVariants}>
 <AppDataTable
 title="Daftar Kelas & Rombel"
 icon={School}
 iconClassName="bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800 shadow-sm"
 countLabel={`${Number(paginationInfo.total).toLocaleString('id-ID')} Kelas`}
 description="Data kelas sesuai periode, unit, kelas, dan status yang dipilih."
 actions={pageActions}
 search={search}
 onSearchChange={(value) => { setSearch(value); setPage(1) }}
 searchPlaceholder="Cari kode kelas, nama kelas, atau nama wali kelas..."
 filters={
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
 {/* Filter Unit Pendidikan - Superadmin, Admin, Pengurus Yayasan, Divisi Pendidikan */}
 {canSeeUnitFilter && (
 <div className="w-full sm:w-56">
 <HeroUiFilterSelect
 ariaLabel="Filter unit pendidikan"
 value={selectedUnitFilter}
 onChange={(val) => {
 setSelectedUnitFilter(String(val || ''))
 setSelectedKelasFilter('')
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Unit Pendidikan' },
 ...masterUnits.map((u, idx) => ({
 value: String(u.id ?? u.unit_id ?? `unit-${idx}`),
 label: u.name ?? u.nama ?? u.nama_unit,
 subtext: u.code ? `Kode: ${u.code}` : undefined,
 })),
 ]}
 placeholder="Semua Unit Pendidikan"
 icon={Building2}
 searchable={masterUnits.length > 5}
 />
 </div>
 )}

 {/* Filter Tahun Ajaran */}
 <div className="w-full sm:w-52">
 <HeroUiFilterSelect
 ariaLabel="Filter tahun ajaran"
 value={selectedTahunFilter}
 onChange={(val) => {
 setSelectedTahunFilter(String(val || ''))
 setSelectedSemesterFilter('')
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Tahun Ajaran' },
 ...masterTahunAjaran.map((tahun) => ({
 value: String(tahun.id),
 label: tahun.name,
 subtext: tahun.is_active ? 'Aktif' : undefined,
 })),
 ]}
 placeholder="Semua Tahun Ajaran"
 icon={Calendar}
 searchable={masterTahunAjaran.length > 5}
 />
 </div>

 {/* Filter Semester */}
 <div className="w-full sm:w-44">
 <HeroUiFilterSelect
 ariaLabel="Filter semester"
 value={selectedSemesterFilter}
 onChange={(val) => {
 setSelectedSemesterFilter(String(val || ''))
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Semester' },
 ...masterSemesters
 .filter((semester) => !selectedTahunFilter || semester.academic_year_id === selectedTahunFilter)
 .map((semester) => ({
 value: String(semester.id),
 label: semester.name,
 })),
 ]}
 placeholder="Semua Semester"
 icon={Calendar}
 />
 </div>

 {/* Filter Kelas Rombel */}
 <div className="w-full sm:w-52">
 <HeroUiFilterSelect
 ariaLabel="Filter kelas"
 value={selectedKelasFilter}
 onChange={(val) => {
 setSelectedKelasFilter(String(val || ''))
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Kelas' },
 ...masterKelasOptions.map((k) => ({
 value: String(k.nama_kelas),
 label: k.nama_kelas,
 subtext: k.kode_kelas ? `Kode: ${k.kode_kelas}` : undefined,
 })),
 ]}
 placeholder="Semua Kelas"
 icon={School}
 searchable={masterKelasOptions.length > 5}
 />
 </div>

 {/* Filter Status */}
 <div className="w-full sm:w-40">
 <HeroUiFilterSelect
 ariaLabel="Filter status"
 value={selectedStatusFilter}
 onChange={(val) => {
 setSelectedStatusFilter(String(val || ''))
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Status' },
 { value: 'Aktif', label: 'Aktif' },
 { value: 'Tidak Aktif', label: 'Tidak Aktif' },
 ]}
 placeholder="Semua Status"
 icon={CheckCircle2}
 />
 </div>

 {/* Filter Per Page */}
 <div className="w-full sm:w-36">
 <HeroUiFilterSelect
 ariaLabel="Tampilkan per halaman"
 value={perPage}
 onChange={(val) => {
 setPerPage(Number(val))
 setPage(1)
 }}
 options={[
 { value: 5, label: '5 per hal' },
 { value: 10, label: '10 per hal' },
 { value: 15, label: '15 per hal' },
 { value: 25, label: '25 per hal' },
 { value: 50, label: '50 per hal' },
 { value: 100, label: '100 per hal' },
 ]}
 placeholder="10 per hal"
 icon={Hash}
 />
 </div>

 {/* Reset Filter Button */}
 {hasActiveFilters && (
 <Button
 variant="ghost"
 appearance="outline"
 size="xs"
 onPress={resetFilters}
 onClick={resetFilters}
 className="w-full sm:w-auto sm:ml-auto justify-center h-9 px-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 hover:bg-rose-50 dark:border-emerald-800/60 dark:text-rose-400 dark:hover:bg-rose-950/30 flex items-center gap-1.5 cursor-pointer"
 >
 <RefreshCcw className="size-3.5" />
 <span>Reset Filter</span>
 </Button>
 )}
 </div>
 }
 isLoading={isLoading}
 isError={isError}
 errorTitle="Data kelas gagal dimuat"
 errorMessage="Periksa koneksi server kemudian coba muat ulang."
 onRetry={refetch}
 isEmpty={!isLoading && !isError && rawList.length === 0}
 emptyTitle="Data Kelas Tidak Ditemukan"
 emptyDescription="Belum ada data rombongan belajar yang sesuai dengan kriteria filter Anda."
 hasActiveFilters={hasActiveFilters}
 onResetFilters={resetFilters}
 serverControlled
 page={page}
 totalPages={paginationInfo.last_page || 1}
 totalItems={paginationInfo.total || rawList.length}
 itemsPerPage={perPage}
 onPageChange={setPage}
 columns={kelasColumns}
          data={rawList}
          renderMobileCard={renderMobileCard}
          onRowClick={(item) => { setDetailKelas(item); setIsDetailModalOpen(true) }}
          onView={(item) => { setDetailKelas(item); setIsDetailModalOpen(true) }}
          onEdit={canUpdate ? ((item) => openEditModal(item)) : undefined}
          onDelete={canDelete ? ((item) => { setDeleteTarget(item); setIsDeleteModalOpen(true) }) : undefined}
          extraItems={(item) => [
            {
              label: 'Kelola & Lihat Data Siswa',
              icon: <Users className="w-4 h-4 text-emerald-600" />,
              onClick: () => openSiswaModal(item),
            },
          ]}
          actionColumnLabel=""
 />
 </motion.div>
 </motion.div>

 {/* FORM MODAL: TAMBAH / EDIT KELAS & ROMBEL */}
 <AnimatePresence>
 {isFormModalOpen && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="class-form-modal-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !createMutation.isPending && !updateMutation.isPending) {
 closeFormModal()
 }
 }}
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
 <div className="rounded-xl p-2.5 shadow-md shrink-0 border bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm border-emerald-300">
 <School className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3
 id="class-form-modal-title"
 className="modal-title text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 <span>{isEditMode ? 'Edit Data Rombongan Belajar' : 'Tambah Rombongan Belajar Baru'}</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 {isEditMode ? 'Update Data' : 'Kelas Baru'}
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Lengkapi unit pendidikan, periode akademik, spesifikasi rombel, serta wali kelas.
 </p>
 </div>
 </div>

 <button
 type="button"
 disabled={createMutation.isPending || updateMutation.isPending}
 onClick={closeFormModal}
 aria-label="Tutup form modal"
 className="size-9 flex items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
 >
 <X className="size-4 text-rose-600" strokeWidth={2.25} />
 </button>
 </div>

 {/* Form Body */}
 <div className="modal-body flex-1 overflow-y-auto p-6 space-y-5">
 <form onSubmit={handleSubmitForm} id="class-form" className="space-y-5">
 {/* GRUP 1: UNIT & PERIODE AKADEMIK */}
 <div className="space-y-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
 <Building2 className="h-4 w-4" />
 <span>1. Unit Pendidikan & Periode Akademik</span>
 </h4>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div className="sm:col-span-2">
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Unit Pendidikan *
 </label>
 <HeroUiFilterSelect
 value={formData.unit_pendidikan_id}
 onChange={(val) => setFormData((prev) => ({ ...prev, unit_pendidikan_id: val }))}
 options={[
 { value: '', label: '-- Pilih Unit Pendidikan --' },
 ...masterUnits.map((u) => ({
 value: String(u.id),
 label: `${u.name} (${u.level})`,
 })),
 ]}
 placeholder="-- Pilih Unit Pendidikan --"
 icon={Building2}
 ariaLabel="Pilih unit pendidikan"
 searchable
 className="w-full"
 />
 {formErrors.unit_pendidikan_id && (
 <p className="mt-1 text-xs font-medium text-rose-500">
 {formErrors.unit_pendidikan_id[0]}
 </p>
 )}
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Tahun Ajaran *
 </label>
 <HeroUiFilterSelect
 value={formData.tahun_ajaran_id}
 onChange={(val) => setFormData((prev) => ({ ...prev, tahun_ajaran_id: val }))}
 options={[
 { value: '', label: '-- Pilih Tahun Ajaran --' },
 ...masterTahunAjaran.map((t) => ({
 value: String(t.id),
 label: `${t.name} ${t.is_active ? '(Aktif)' : ''}`,
 })),
 ]}
 placeholder="-- Pilih Tahun Ajaran --"
 icon={Calendar}
 ariaLabel="Pilih tahun ajaran"
 className="w-full"
 />
 {formErrors.tahun_ajaran_id && (
 <p className="mt-1 text-xs font-medium text-rose-500">
 {formErrors.tahun_ajaran_id[0]}
 </p>
 )}
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Semester *
 </label>
 <HeroUiFilterSelect
 value={formData.semester_id}
 onChange={(val) => setFormData((prev) => ({ ...prev, semester_id: val }))}
 options={[
 { value: '', label: '-- Pilih Semester --' },
 ...availableSemestersForm.map((s) => ({
 value: String(s.id),
 label: `${s.name} (${s.academic_year_name || 'TA'})`,
 })),
 ]}
 placeholder="-- Pilih Semester --"
 icon={Calendar}
 ariaLabel="Pilih semester"
 className="w-full"
 />
 {formErrors.semester_id && (
 <p className="mt-1 text-xs font-medium text-rose-500">
 {formErrors.semester_id[0]}
 </p>
 )}
 </div>
 </div>
 </div>

 {/* GRUP 2: SPESIFIKASI ROMBONGAN BELAJAR */}
 <div className="space-y-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
 <School className="h-4 w-4" />
 <span>2. Informasi Rombongan Belajar</span>
 </h4>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Nama Kelas / Rombel *
 </label>
 <div className="relative">
 <School className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 required
 value={formData.nama_kelas}
 onChange={(e) => setFormData((prev) => ({ ...prev, nama_kelas: e.target.value }))}
 placeholder="Contoh: 7-A Tahfizh, Kelas 1 Binar"
 className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3.5 text-xs font-medium outline-none transition-all focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-white ${formErrors.nama_kelas ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-emerald-200/80'
 }`}
 />
 </div>
 {formErrors.nama_kelas && (
 <p className="mt-1 text-xs font-medium text-rose-500">
 {formErrors.nama_kelas[0]}
 </p>
 )}
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Kode Kelas (Unique) *
 </label>
 <div className="relative">
 <Hash className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 required
 value={formData.kode_kelas}
 onChange={(e) => setFormData((prev) => ({ ...prev, kode_kelas: e.target.value }))}
 placeholder="Contoh: KLS-7A-SMP"
 className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3.5 font-mono text-xs font-medium outline-none transition-all focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-white ${formErrors.kode_kelas ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-emerald-200/80'
 }`}
 />
 </div>
 {formErrors.kode_kelas && (
 <p className="mt-1 text-xs font-medium text-rose-500">
 {formErrors.kode_kelas[0]}
 </p>
 )}
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Jenjang *
 </label>
 <HeroUiFilterSelect
 value={formData.jenjang}
 onChange={(val) => {
 const map = JENJANG_TINGKAT_MAP[val] || TINGKAT_DEFAULT_ALL
 setFormData((prev) => ({
 ...prev,
 jenjang: val,
 tingkat: map.values[0] || '1',
 }))
 }}
 options={masterJenjang.map((j) => ({ value: j, label: j }))}
 placeholder="Pilih Jenjang"
 icon={School}
 ariaLabel="Pilih jenjang"
 className="w-full"
 />
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Tingkat Kelas *
 </label>
 <HeroUiFilterSelect
 value={formData.tingkat}
 onChange={(val) => setFormData((prev) => ({ ...prev, tingkat: val }))}
 options={filteredTingkat.values.map((val, idx) => ({
 value: val,
 label: filteredTingkat.labels[idx],
 }))}
 placeholder="Pilih Tingkat"
 icon={Layers}
 ariaLabel="Pilih tingkat"
 className="w-full"
 />
 </div>

 <div className="sm:col-span-2">
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Kapasitas Maksimal Siswa
 </label>
 <div className="relative">
 <Users className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="number"
 value={formData.kapasitas}
 onChange={(e) => setFormData((prev) => ({ ...prev, kapasitas: e.target.value }))}
 placeholder="30"
 className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-10 pr-3.5 text-xs font-medium outline-none transition-all focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-white"
 />
 </div>
 </div>
 </div>
 </div>

 {/* GRUP 3: PENUGASAN WALI KELAS, RUANGAN & STATUS */}
 <div className="space-y-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
 <Users className="h-4 w-4" />
 <span>3. Wali Kelas, Lokasi & Status Operasional</span>
 </h4>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div className="sm:col-span-2">
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Penugasan Wali Kelas
 </label>
 <HeroUiFilterSelect
 value={formData.wali_kelas_id}
 onChange={(val) => setFormData((prev) => ({ ...prev, wali_kelas_id: val }))}
 options={[
 { value: '', label: '-- Pilih Wali Kelas (Opsional) --' },
 ...filteredEmployeesForm.map((emp) => ({
 value: String(emp.id),
 label: emp.nama_tampil || emp.name,
 })),
 ]}
 placeholder="-- Pilih Wali Kelas (Opsional) --"
 icon={UserCheck}
 ariaLabel="Pilih wali kelas"
 searchable
 className="w-full"
 />
 </div>

 <div className="sm:col-span-2">
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Lokasi Ruangan
 </label>
 <div className="relative">
 <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={formData.ruangan}
 onChange={(e) => setFormData((prev) => ({ ...prev, ruangan: e.target.value }))}
 placeholder="Contoh: Gedung Al-Farabi Lt. 2 (R-204)"
 className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-10 pr-3.5 text-xs font-medium outline-none transition-all focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-white"
 />
 </div>
 </div>

 {/* Interactive Operational Status Toggle Card */}
 <div className="sm:col-span-2">
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Status Operasional Kelas
 </label>
 <div
 onClick={() => setFormData((p) => ({ ...p, status: p.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif' }))}
 className={`group relative flex items-center justify-between gap-3.5 rounded-xl border-2 p-3.5 sm:p-4 transition-all duration-200 cursor-pointer ${formData.status === 'Aktif'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark shadow-xs shadow-sm dark:border-emerald-800/60 dark:bg-card-dark'
 : 'border-emerald-200/80 bg-slate-50/60 hover:bg-slate-100/60 dark:border-emerald-800/60 dark:bg-slate-900/40 dark:hover:bg-slate-800/40'
 }`}
 >
 <div className="flex items-center gap-3.5 min-w-0">
 <div
 className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${formData.status === 'Aktif'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark text-[#059669] shadow-xs dark:border-emerald-800/60 dark:from-emerald-950/80 dark:to-teal-950/60 dark:text-[#10B981]'
 : 'border-emerald-200/80 bg-white text-slate-400 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-500'
 }`}
 >
 {formData.status === 'Aktif' ? (
 <ShieldCheck className="size-5.5 transition-transform group-hover:scale-110" strokeWidth={2.25} />
 ) : (
 <Power className="size-5 transition-transform group-hover:scale-110 opacity-70" strokeWidth={2} />
 )}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-xs font-black text-slate-900 dark:text-white">
 Status Operasional Rombel
 </p>
 {formData.status === 'Aktif' && (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60">
 <Sparkles className="size-2.5 text-emerald-600 dark:text-emerald-400" />
 Aktif
 </span>
 )}
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
 Aktifkan agar rombongan belajar dapat dipilih pada penempatan siswa & jadwal
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
 <span
 className={`text-xs font-black transition-colors ${formData.status === 'Aktif'
 ? 'text-emerald-700 dark:text-emerald-400'
 : 'text-slate-400 dark:text-slate-500'
 }`}
 >
 {formData.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
 </span>
 <button
 type="button"
 role="switch"
 aria-checked={formData.status === 'Aktif'}
 aria-label="Toggle status operasional kelas"
 onClick={() => setFormData((p) => ({ ...p, status: p.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif' }))}
 className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${formData.status === 'Aktif'
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-sm'
 : 'bg-slate-300 dark:bg-slate-700'
 }`}
 >
 <span
 className={`pointer-events-none inline-flex size-5.5 items-center justify-center transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${formData.status === 'Aktif' ? 'translate-x-5' : 'translate-x-0.5'
 }`}
 >
 {formData.status === 'Aktif' ? (
 <Check className="size-3 text-emerald-700" strokeWidth={3} />
 ) : (
 <span className="size-1.5 rounded-full bg-slate-400" />
 )}
 </span>
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </form>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <button
 type="button"
 onClick={closeFormModal}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-5 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <X className="size-3" strokeWidth={2.2} />
 </div>
 <span>Batal</span>
 </button>

 <button
 type="button"
 onClick={handleSubmitForm}
 disabled={createMutation.isPending || updateMutation.isPending}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-6 py-2.5 text-xs font-extrabold border-2 border-emerald-300 dark:border-emerald-800 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
 >
 {(createMutation.isPending || updateMutation.isPending) ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
 ) : (
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <CheckCircle2 className="size-3 text-emerald-600" strokeWidth={2.2} />
 </div>
 )}
 <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan Kelas'}</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL: DETAIL KELAS & ROMBEL */}
 <AnimatePresence>
 {isDetailModalOpen && detailKelas && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="class-detail-modal-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget) setIsDetailModalOpen(false)
 }}
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
 <div className="rounded-xl p-2.5 shadow-md shrink-0 border bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm border-emerald-300">
 <School className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3
 id="class-detail-modal-title"
 className="modal-title text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 <span>Detail Rombongan Belajar</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Informasi Rombel
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Informasi spesifikasi kelas, unit pendidikan, dan wali kelas penanggung jawab.
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={() => setIsDetailModalOpen(false)}
 aria-label="Tutup detail modal"
 className="size-9 flex items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
 >
 <X className="size-4 text-rose-600" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body p-6 space-y-4 text-sm overflow-y-auto">
 <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-4 dark:border-emerald-800/60 dark:bg-slate-800/60">
 <div>
 <h4 className="text-lg font-black text-slate-900 dark:text-white">{detailKelas.nama_kelas}</h4>
 <p className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{detailKelas.kode_kelas}</p>
 </div>
 <button
 type="button"
 onClick={() => {
 setIsDetailModalOpen(false)
 openSiswaModal(detailKelas)
 }}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-card-dark hover:from-sky-700 hover:to-blue-700 shadow-sm transition-all hover:scale-[1.02] active:scale-95 border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <Users className="h-4 w-4" />
 <span>Kelola & Lihat Siswa</span>
 </button>
 </div>

 <div className="grid grid-cols-2 gap-3.5">
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Unit Pendidikan</p>
 <p className="font-bold text-slate-900 dark:text-white mt-1 text-xs">{detailKelas.unit_pendidikan?.name || '-'}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Jenjang & Tingkat</p>
 <p className="font-bold text-slate-900 dark:text-white mt-1 text-xs">{detailKelas.jenjang} - Tingkat {detailKelas.tingkat}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Wali Kelas</p>
 <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-1 text-xs">{detailKelas.wali_kelas?.nama_tampil || detailKelas.wali_kelas?.name || 'Belum ditugaskan'}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Kapasitas / Terisi</p>
 <p className="font-bold text-slate-900 dark:text-white mt-1 text-xs">{detailKelas.jumlah_siswa || 0} / {detailKelas.kapasitas || 30} Siswa</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40 col-span-2">
 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lokasi Ruangan</p>
 <p className="font-bold text-slate-900 dark:text-white mt-1 text-xs">{detailKelas.ruangan || 'Belum diatur'}</p>
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-end border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <button
 type="button"
 onClick={() => setIsDetailModalOpen(false)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-5 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <X className="size-3" strokeWidth={2.2} />
 </div>
 <span>Tutup</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL: LIHAT & KELOLA DATA SISWA ROMBEL */}
 <AnimatePresence>
 {isSiswaModalOpen && selectedKelasSiswa && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="class-siswa-modal-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget) setIsSiswaModalOpen(false)
 }}
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
 <div className="rounded-xl p-2.5 shadow-md shrink-0 border bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm border-emerald-300">
 <Users className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3
 id="class-siswa-modal-title"
 className="modal-title text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 <span>Data Siswa Rombel: {selectedKelasSiswa.nama_kelas}</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 {filteredSiswaList.length} Siswa
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Kode: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{selectedKelasSiswa.kode_kelas}</span> • Unit: {selectedKelasSiswa.unit_pendidikan?.name || '-'} • Ruang: {selectedKelasSiswa.ruangan || '-'}
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={() => setIsSiswaModalOpen(false)}
 aria-label="Tutup modal siswa"
 className="size-9 flex items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
 >
 <X className="size-4 text-rose-600" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4">
 {/* Wali Kelas Card Banner */}
 <div className="bg-white dark:bg-card-dark dark:from-slate-800/80 dark:to-slate-800/40 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <PersonAvatar
 src={selectedKelasSiswa.wali_kelas?.photo_url || selectedKelasSiswa.wali_kelas?.avatar_url || selectedKelasSiswa.wali_kelas?.foto}
 name={selectedKelasSiswa.wali_kelas?.nama_tampil || selectedKelasSiswa.wali_kelas?.name || 'Belum Ditugaskan'}
 size="detail"
 />
 <div>
 <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Wali Kelas Penanggung Jawab</span>
 <h4 className="text-base font-bold text-slate-900 dark:text-white">
 {selectedKelasSiswa.wali_kelas?.nama_tampil || selectedKelasSiswa.wali_kelas?.name || 'Belum Ditugaskan'}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {selectedKelasSiswa.wali_kelas?.niy ? `NIY: ${selectedKelasSiswa.wali_kelas.niy}` : 'Wali kelas rombongan belajar'}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
 <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 text-center shadow-xs">
 <span className="block text-slate-400 text-[10px]">TERISI / KAPASITAS</span>
 <strong className="text-sm text-slate-900 dark:text-white">{selectedKelasSiswa.jumlah_siswa || filteredSiswaList.length} / {selectedKelasSiswa.kapasitas || 30}</strong>
 </div>
 <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 text-center shadow-xs">
 <span className="block text-slate-400 text-[10px]">JENJANG - TINGKAT</span>
 <strong className="text-sm text-emerald-600 dark:text-emerald-400">{selectedKelasSiswa.jenjang || 'SD'} - Tkt {selectedKelasSiswa.tingkat || 1}</strong>
 </div>
 </div>
 </div>

 {/* Modal Toolbar: Search, Batch Pindah Kelas, & Export */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative w-full sm:w-72">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari nama siswa, NIS, atau NISN..."
 value={siswaSearch}
 onChange={(e) => { setSiswaSearch(e.target.value); setSiswaModalPage(1) }}
 className="w-full pl-10 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
 />
 {siswaSearch && (
 <button
 type="button"
 onClick={() => { setSiswaSearch(''); setSiswaModalPage(1) }}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>

 <div className="flex items-center gap-2">
 {/* Batch Pindah Kelas Action Button */}
 {canManageSiswaKelas && selectedStudentIds.length > 0 && (
 <button
 type="button"
 onClick={openBatchMoveDialog}
 className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-card-dark hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-95"
 >
 <ArrowRightLeft className="h-3.5 w-3.5" />
 <span>Pindahkan ({selectedStudentIds.length}) Siswa</span>
 </button>
 )}

 <button
 type="button"
 onClick={() => {
 const headers = ['NO', 'NAMA SISWA', 'NIS', 'NISN', 'JENIS KELAMIN', 'STATUS']
 const csvRows = filteredSiswaList.map((s, idx) => [
 idx + 1,
 `"${s.full_name || s.nama || ''}"`,
 `"${s.nis || ''}"`,
 `"${s.nisn || ''}"`,
 `"${s.gender === 'male' || s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}"`,
 `"${s.is_active !== false ? 'Aktif' : 'Nonaktif'}"`,
 ])
 const csv = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n')
 const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
 const link = document.createElement('a')
 link.href = url
 link.download = `Siswa_${selectedKelasSiswa.kode_kelas}_${new Date().toISOString().slice(0, 10)}.csv`
 link.click()
 URL.revokeObjectURL(url)
 }}
 className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
 >
 <Download className="h-3.5 w-3.5 text-emerald-600" />
 <span>Unduh CSV</span>
 </button>
 </div>
 </div>

 {/* Datatable Siswa */}
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark">
 <TableRoot className="w-full text-left text-xs">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 {canManageSiswaKelas && (
 <TableHead className="py-3.5 px-3 w-10 text-center">
 <input
 type="checkbox"
 checked={filteredSiswaList.length > 0 && selectedStudentIds.length === filteredSiswaList.length}
 onChange={toggleSelectAllStudents}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
 />
 </TableHead>
 )}

 <TableHead className="py-3.5 px-4">SISWA</TableHead>
 <TableHead className="py-3.5 px-4">NIS / NISN</TableHead>
 <TableHead className="py-3.5 px-4 text-center">JENIS KELAMIN</TableHead>
 <TableHead className="py-3.5 px-4 text-center">STATUS</TableHead>
 {canManageSiswaKelas && <TableHead className="py-3.5 px-4 text-center w-28"></TableHead>}
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-medium">
 {siswaQuery.isLoading ? (
 <TableRow>
 <TableCell colSpan={canManageSiswaKelas ? 7 : 6} className="py-8 text-center text-slate-500 font-medium">
 Memuat data siswa rombel...
 </TableCell>
 </TableRow>
 ) : paginatedSiswaList.length > 0 ? (
 paginatedSiswaList.map((siswaItem, idx) => {
 const isChecked = selectedStudentIds.includes(siswaItem.id)

 return (
 <TableRow key={siswaItem.id || idx} className={`transition-colors ${isChecked ? 'bg-purple-50/60 dark:bg-purple-950/20' : 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30'}`}>
 {canManageSiswaKelas && (
 <TableCell className="py-3 px-3 text-center">
 <input
 type="checkbox"
 checked={isChecked}
 onChange={() => toggleSelectStudent(siswaItem.id)}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
 />
 </TableCell>
 )}
 <TableCell className="py-3 px-4 font-bold text-slate-500 text-center">
 {(siswaModalPage - 1) * SISWA_MODAL_PAGE_SIZE + idx + 1}
 </TableCell>
 <TableCell className="py-3 px-4">
 <PersonIdentityCell
 src={siswaItem.photo_url || siswaItem.photo}
 name={siswaItem.full_name || siswaItem.nama || 'Siswa'}
 />
 </TableCell>
 <TableCell className="py-3 px-4">
 <div className="font-mono text-slate-800 dark:text-slate-200 font-bold">{siswaItem.nis || '-'}</div>
 <div className="text-xs text-slate-400 font-mono">NISN: {siswaItem.nisn || '-'}</div>
 </TableCell>
 <TableCell className="py-3 px-4 text-center">
 <Badge color={siswaItem.gender === 'male' || siswaItem.gender === 'L' ? 'blue' : 'pink'} size="sm">
 {siswaItem.gender === 'male' || siswaItem.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
 </Badge>
 </TableCell>
 <TableCell className="py-3 px-4 text-center">
 <AppBadge variant={siswaItem.is_active !== false ? 'success' : 'neutral'} dot>
 {siswaItem.is_active !== false ? 'Aktif' : 'Nonaktif'}
 </AppBadge>
 </TableCell>
 {canManageSiswaKelas && (
 <TableCell className="py-3 px-4 text-center">
 <Button
 type="button"
 size="xs"
 variant="ghost"
 onClick={() => openSingleMoveDialog(siswaItem)}
 className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
 title="Pindahkan siswa ke kelas lain"
 >
 <ArrowRightLeft className="h-3 w-3" /> Pindah
 </Button>
 </TableCell>
 )}
 </TableRow>
 )
 })
 ) : (
 <TableRow>
 <TableCell colSpan={canManageSiswaKelas ? 7 : 6} className="py-8 text-center text-slate-400 font-medium">
 {siswaSearch ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada siswa terdaftar di rombel ini.'}
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </TableRoot>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <span className="text-xs text-slate-500 font-medium">
 Menampilkan {filteredSiswaList.length ? (siswaModalPage - 1) * SISWA_MODAL_PAGE_SIZE + 1 : 0}–{Math.min(siswaModalPage * SISWA_MODAL_PAGE_SIZE, filteredSiswaList.length)} dari {filteredSiswaList.length} siswa
 </span>
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-1 mr-4">
 <button
 type="button"
 disabled={siswaModalPage === 1}
 onClick={() => setSiswaModalPage((prev) => prev - 1)}
 className="p-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
 >
 <ChevronLeft className="h-4 w-4" />
 </button>
 <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">
 {siswaModalPage} / {siswaTotalPages}
 </span>
 <button
 type="button"
 disabled={siswaModalPage === siswaTotalPages}
 onClick={() => setSiswaModalPage((prev) => prev + 1)}
 className="p-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
 >
 <ChevronRight className="h-4 w-4" />
 </button>
 </div>
 <button
 type="button"
 onClick={() => setIsSiswaModalOpen(false)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-5 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <X className="size-3" strokeWidth={2.2} />
 </div>
 <span>Tutup</span>
 </button>
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL: PINDAH KELAS SISWA */}
 <AnimatePresence>
 {isPindahModalOpen && selectedKelasSiswa && (
 <div
 className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="class-transfer-modal-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !movingLoading) setIsPindahModalOpen(false)
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-md"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <div className="flex items-center gap-3">
 <div className="rounded-xl p-2.5 shadow-md shrink-0 border bg-white dark:bg-card-dark shadow-sm border-emerald-200/80 dark:border-emerald-800/60">
 <ArrowRightLeft className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3
 id="class-transfer-modal-title"
 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 <span>Pindahkan Kelas Siswa</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-purple-50 text-purple-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/60 dark:text-purple-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Transfer
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {singleStudentToMove
 ? `Siswa: ${singleStudentToMove.full_name || singleStudentToMove.nama} (${singleStudentToMove.nis || 'NIS'})`
 : `Jumlah: ${selectedStudentIds.length} Siswa Terpilih`}
 </p>
 </div>
 </div>

 <button
 type="button"
 disabled={movingLoading}
 onClick={() => setIsPindahModalOpen(false)}
 aria-label="Tutup modal pindah"
 className="size-9 flex items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
 >
 <X className="size-4 text-rose-600" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
 <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
 <span className="block font-extrabold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider mb-1">Kelas Asal Rombel</span>
 <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">{selectedKelasSiswa.nama_kelas} ({selectedKelasSiswa.kode_kelas})</span>
 </div>

 <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-1 leading-relaxed">
 <span className="font-extrabold block">Ketentuan Pemindahan Kelas:</span>
 <span>Siswa pada Tingkat {selectedKelasSiswa.tingkat || 1} hanya dapat dipindahkan ke rombel lain pada tingkat yang sama (Tingkat {selectedKelasSiswa.tingkat || 1}).</span>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
 Pilih Kelas Tujuan Rombel (Tingkat {selectedKelasSiswa.tingkat || 1}) *
 </label>
 <HeroUiFilterSelect
 value={targetKelasId}
 onChange={(val) => setTargetKelasId(val)}
 options={[
 { value: '', label: `-- Pilih Kelas Tujuan (Tingkat ${selectedKelasSiswa.tingkat || 1}) --` },
 ...destinationClasses.map((c) => ({
 value: String(c.id),
 label: `${c.nama_kelas} (Kode: ${c.kode_kelas}) - Tingkat ${c.tingkat}`,
 })),
 ]}
 placeholder={`-- Pilih Kelas Tujuan (Tingkat ${selectedKelasSiswa.tingkat || 1}) --`}
 icon={School}
 ariaLabel="Pilih kelas tujuan rombel"
 searchable
 className="w-full"
 />
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <button
 type="button"
 disabled={movingLoading}
 onClick={() => setIsPindahModalOpen(false)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <X className="size-3" strokeWidth={2.2} />
 </div>
 <span>Batal</span>
 </button>

 <button
 type="button"
 disabled={movingLoading || !targetKelasId}
 onClick={executePindahKelas}
 className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-card-dark hover:from-purple-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
 >
 {movingLoading ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
 ) : (
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <ArrowRightLeft className="size-3 text-slate-600" strokeWidth={2.2} />
 </div>
 )}
 <span>{movingLoading ? 'Memindahkan...' : 'Proses Pindah Kelas'}</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL: KONFIRMASI SIMPAN / UPDATE DATA KELAS (HARMONIZED HEROUI) */}
 <AnimatePresence>
 {showSaveConfirmModal && (
 <div
 className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="class-save-confirm-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !createMutation.isPending && !updateMutation.isPending) {
 setShowSaveConfirmModal(false)
 }
 }}
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
 <div
 className={cn(
 "h-1.5 w-full shrink-0",
 isEditMode
 ? "bg-white dark:bg-card-dark"
 : "bg-white dark:bg-card-dark"
 )}
 />

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <div className="flex items-center gap-3">
 <div
 className={cn(
 "rounded-xl text-white p-2.5 shadow-md shrink-0 border",
 isEditMode
 ? "bg-white dark:bg-card-dark shadow-sm border-emerald-200/80 dark:border-emerald-800/60"
 : "bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm border-emerald-300"
 )}
 >
 {isEditMode ? (
 <Pencil className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
 ) : (
 <School className="h-5 w-5 text-amber-600" strokeWidth={2.25} />
 )}
 </div>
 <div>
 <h3
 id="class-save-confirm-title"
 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 <span>{isEditMode ? 'Konfirmasi Perubahan Kelas' : 'Konfirmasi Simpan Kelas'}</span>
 <span
 className={cn(
 "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
 isEditMode
 ? "bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-emerald-800/60"
 : "bg-emerald-50 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60"
 )}
 >
 <Sparkles className="size-3" />
 {isEditMode ? 'Update Data' : 'Kelas Baru'}
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {isEditMode
 ? 'Verifikasi data rombel sebelum pembaruan diterapkan ke server.'
 : 'Verifikasi data rombel baru sebelum disimpan ke dalam sistem.'}
 </p>
 </div>
 </div>

 <button
 type="button"
 disabled={createMutation.isPending || updateMutation.isPending}
 onClick={() => setShowSaveConfirmModal(false)}
 aria-label="Tutup dialog konfirmasi"
 className="size-9 flex items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
 >
 <X className="size-4 text-rose-600" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
 {/* Target Info Summary Card */}
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-3.5 dark:border-emerald-800/80 dark:bg-slate-900/50 space-y-2.5">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nama Kelas</span>
 <span className="text-xs font-extrabold text-slate-900 dark:text-white text-right max-w-[220px] truncate">
 {formData.nama_kelas || '-'}
 </span>
 </div>
 {formData.kode_kelas && (
 <div className="flex items-center justify-between border-t border-emerald-200/60 pt-2 dark:border-emerald-800/60">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kode Kelas</span>
 <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
 {formData.kode_kelas}
 </span>
 </div>
 )}
 <div className="flex items-center justify-between border-t border-emerald-200/60 pt-2 dark:border-emerald-800/60">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jenjang & Tingkat</span>
 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {formData.jenjang} - Tingkat {formData.tingkat}
 </span>
 </div>
 <div className="flex items-center justify-between border-t border-emerald-200/60 pt-2 dark:border-emerald-800/60">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kapasitas</span>
 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {formData.kapasitas} Siswa
 </span>
 </div>
 </div>

 {/* Notice Box */}
 <div
 className={cn(
 "rounded-xl border p-3.5 text-xs font-semibold leading-relaxed flex items-start gap-2.5",
 isEditMode
 ? "border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 text-amber-900 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-300"
 : "border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300"
 )}
 >
 <div
 className={cn(
 "flex size-5 shrink-0 items-center justify-center rounded-lg text-white mt-0.5",
 isEditMode
 ? "bg-white dark:bg-card-dark"
 : "bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300"
 )}
 >
 <Sparkles className="size-3 text-emerald-600" />
 </div>
 <div className="flex-1">
 {isEditMode
 ? 'Data rombongan belajar akan segera diperbarui di database server dengan spesifikasi terbaru.'
 : 'Data rombongan belajar baru akan tersimpan dan siap digunakan untuk alokasi siswa dan wali kelas.'}
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <button
 type="button"
 disabled={createMutation.isPending || updateMutation.isPending}
 onClick={() => setShowSaveConfirmModal(false)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <X className="size-3" strokeWidth={2.2} />
 </div>
 <span>Batal</span>
 </button>

 <button
 type="button"
 disabled={createMutation.isPending || updateMutation.isPending}
 onClick={handleConfirmSaveForm}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-5 py-2.5 text-xs font-extrabold border-2 border-emerald-300 dark:border-emerald-800 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
 >
 {(createMutation.isPending || updateMutation.isPending) ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
 ) : (
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <CheckCircle2 className="size-3 text-slate-600" strokeWidth={2.2} />
 </div>
 )}
 <span>
 {(createMutation.isPending || updateMutation.isPending)
 ? isEditMode ? 'Memperbarui...' : 'Menyimpan...'
 : isEditMode ? 'Ya, Perbarui Kelas' : 'Ya, Simpan Kelas'}
 </span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL: KONFIRMASI HAPUS KELAS (HARMONIZED HEROUI) */}
 <AnimatePresence>
 {isDeleteModalOpen && deleteTarget && (
 <div
 className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="class-delete-confirm-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !deleteMutation.isPending) {
 setIsDeleteModalOpen(false)
 setDeleteTarget(null)
 }
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-md"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-surface-dark-inner dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <div className="flex items-center gap-3">
 <div className="rounded-xl  p-2.5 shadow-md shrink-0 border bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-sm border-emerald-200/80 dark:border-emerald-800/60">
 <Trash2 className="h-5 w-5 text-rose-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3
 id="class-delete-confirm-title"
 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 <span>Hapus Data Kelas</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-400 dark:border-emerald-800/60">
 <AlertTriangle className="size-3" />
 Hapus Kelas
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Tindakan ini akan mengarsipkan data kelas ini (soft delete).
 </p>
 </div>
 </div>

 <button
 type="button"
 disabled={deleteMutation.isPending}
 onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null) }}
 aria-label="Tutup dialog konfirmasi"
 className="size-9 flex items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
 >
 <X className="size-4 text-rose-600" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
 {/* Target Info Summary Card */}
 <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/40 p-3.5 dark:border-emerald-800/60 dark:bg-rose-950/20 space-y-2.5">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nama Kelas</span>
 <span className="text-xs font-extrabold text-slate-900 dark:text-white text-right max-w-[220px] truncate">
 {deleteTarget.nama_kelas || deleteTarget.name || '-'}
 </span>
 </div>
 {deleteTarget.kode_kelas && (
 <div className="flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pt-2">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kode Kelas</span>
 <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
 {deleteTarget.kode_kelas}
 </span>
 </div>
 )}
 <div className="flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pt-2">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit Pendidikan</span>
 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {deleteTarget.unit_pendidikan?.name || '-'}
 </span>
 </div>
 </div>

 {/* Danger Notice Box */}
 <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
 <div className="flex size-5 shrink-0 items-center justify-center rounded-lg  bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 mt-0.5">
 <AlertTriangle className="size-3 text-rose-600" />
 </div>
 <div className="flex-1">
 Apakah Anda yakin ingin menghapus data kelas <strong>"{deleteTarget.nama_kelas || deleteTarget.name}"</strong>? Data kelas akan diarsipkan ke sistem soft delete.
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <button
 type="button"
 disabled={deleteMutation.isPending}
 onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null) }}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <div className="flex size-4 items-center justify-center rounded-md bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
 <X className="size-3" strokeWidth={2.2} />
 </div>
 <span>Batal</span>
 </button>

 <button
 type="button"
 disabled={deleteMutation.isPending}
 onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-5 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
 >
 {deleteMutation.isPending ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
 ) : (
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <Trash2 className="size-3 text-rose-600" strokeWidth={2.2} />
 </div>
 )}
 <span>{deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Kelas'}</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </PageContainer>
 )
}
