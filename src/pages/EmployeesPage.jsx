import {
  HeroUiHeader,
  AppButton,
  IconButton,
  KpiStatCard
} from '../components/app'
import {
  useToast
} from '../components/app/ToastProvider'
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  printEmployeeIdCard,
  downloadEmployeeIdCard
} from '../services/idCardPrintService.jsx'
import {
  downloadFileFromApi
} from '../utils/exportUtils'
import {
  cn
} from '../lib/utils'
import EmployeeIdCard from '../components/card-print/EmployeeIdCard'
import ActionDropdown from '../components/app/ActionDropdown'
import AppBadge from '../components/app/AppBadge'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  QRCodeSVG
} from 'qrcode.react'
import * as XLSX from 'xlsx'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Globe,
  GraduationCap,
  Hash,
  IdCard,
  Info,
  Lock,
  Mail,
  MapPin,
  Medal,
  Pencil,
  Phone,
  Plus,
  Printer,
  RefreshCcw,
  Save,
  School,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
  UserX,
  X,
  XCircle
} from 'lucide-react'
import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaDownload,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaFileExcel,
  FaFileImport,
  FaFilter,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUpload,
  FaChalkboardTeacher,
  FaPhoneAlt,
  FaEnvelope,
  FaIdCard,
  FaUserTie,
  FaAward,
  FaFolderOpen,
  FaPrint
} from 'react-icons/fa'
import {
  MasterActionButton,
  MasterDataPage,
  MasterDataSection,
  MasterFilterSelect,
  MasterEmptyState,
  MasterErrorState,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid
} from '../components/master-data'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  employeeService
} from '../services/employeeService'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  tahunAjaranService
} from '../services/tahunAjaranService'
import {
  businessOptionService
} from '../services/businessOptionService'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import PersonAvatar, { resolveAvatarUrl } from '../components/ui/PersonAvatar'

function getEmployeePhotoUrl(emp) {
 return resolveAvatarUrl(emp) || ''
}

function getEmployeeFullName(emp) {
 if (!emp) return '-'
 const gDepan = emp.gelar_depan && String(emp.gelar_depan).trim() !== '-' ? String(emp.gelar_depan).trim() : ''
 const gBelakang = emp.gelar_belakang && String(emp.gelar_belakang).trim() !== '-' ? String(emp.gelar_belakang).trim() : ''
 const nama = emp.nama_lengkap?.trim() || ''
 const parts = []
 if (gDepan) parts.push(gDepan)
 if (nama) parts.push(nama)
 let result = parts.join(' ')
 if (gBelakang) result += `, ${gBelakang}`
 return result || nama || '-'
}
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import {
  ROLES,
  hasAnyRole,
  getUserRoleLevel,
  ROLE_LEVELS
} from '../auth/portalResolver'
import {
  useAuthStore
} from '../stores/authStore'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import AppPageHeader from '../components/app/AppPageHeader'
import {
  ChevronDown
} from 'lucide-react'
import {
  Button
} from '../components/ui/button'
import {
  Badge
} from '../components/ui/badge'
import {
  Select as HeroSelect,
  SelectTrigger as HeroSelectTrigger,
  SelectValue as HeroSelectValue,
  SelectContent as HeroSelectContent,
  SelectItem as HeroSelectItem
} from '../components/ui/select'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '../components/ui/hover-card'
import EmployeeFormModal, {
 DEFAULT_EMPLOYEE_STATUS_OPTIONS,
 DEFAULT_MARITAL_OPTIONS,
 DEFAULT_EDUCATION_OPTIONS,
 DEFAULT_RELIGION_OPTIONS,
} from '../components/pegawai/EmployeeFormModal'

const normalizeEmployeeStatus = (status) => {
 if (!status) return 'Tetap'
 const s = String(status).trim()
 if (s === 'Pegawai Tetap Yayasan' || s === 'Pegawai Tetap') return 'Tetap'
 if (s === 'Pegawai Kontrak') return 'Kontrak'
 if (s === 'Nonaktif' || s === 'Non Aktif') return 'Non-Aktif'
 return s
}

const STATUS_PEGAWAI_OPTIONS = DEFAULT_EMPLOYEE_STATUS_OPTIONS
const MARITAL_STATUS_OPTIONS = DEFAULT_MARITAL_OPTIONS
const LAST_EDUCATION_OPTIONS = DEFAULT_EDUCATION_OPTIONS
const RELIGION_OPTIONS = DEFAULT_RELIGION_OPTIONS
const STATUS_OPTIONS = ['Aktif', 'Nonaktif', 'Cuti', 'Resign']
const ID_CARD_TEMPLATES = [
 { id: 'green', label: 'Hijau', description: 'Template Kepala Sekolah' },
 { id: 'blue', label: 'Biru', description: 'Template Guru' },
 { id: 'purple', label: 'Ungu', description: 'Template Wakil Kepala' },
 { id: 'orange', label: 'Oranye', description: 'Template Staf TU' },
]

function formatEmployeeCardDate(value) {
 if (!value) return '—'
 const date = new Date(`${String(value).split('T')[0]}T00:00:00`)
 if (Number.isNaN(date.getTime())) return value
 return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

function makeEmployeeQrPayload(employee) {
 if (!employee) return ''
 return (
 employee.qr_token ||
 employee.qr_code ||
 employee.niy ||
 employee.email ||
 (employee.id ? `EMP-${employee.id}` : 'DARELIMAN-EDU')
 )
}

function getStatusBadgeStyle(status) {
 switch (status) {
 case 'Aktif':
 return { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-600' }
 case 'Cuti':
 return { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-600' }
 case 'Resign':
 return { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-600' }
 default:
 return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
 }
}

function initialFormState() {
 return {
 id: null,
 niy: '',
 nik: '',
 nama_lengkap: '',
 nama_panggilan: '',
 gelar_depan: '',
 gelar_belakang: '',
 jenis_kelamin: 'L',
 tempat_lahir: '',
 tanggal_lahir: '',
 agama: 'Islam',
 status_perkawinan: '',
 pendidikan_terakhir: '',
 foto: '',

 unit_id: '',
 jabatan_id: '',
 status_pegawai: 'Tetap',
 tanggal_masuk: '',
 tanggal_keluar: '',
 status: 'Aktif',

 no_hp: '',
 email: '',
 alamat: '',
 provinsi: '',
 kota: '',
 kecamatan: '',
 kelurahan: '',
 kode_pos: '',

 user_id: '',
 role_id: '',
 metadata: {
 status_perkawinan: '',
 pendidikan_terakhir: '',
 teachings: [],
 position_history: [],
 certifications: [],
 documents: [],
 attendances: [],
 },
 }
}

function parseFromApi(item) {
 const meta = item?.metadata || {}
 const resolvedPhoto = resolveAvatarUrl(item) || ''
 return {
 id: item?.id || null,
 niy: item?.niy || '',
 nik: item?.nik || '',
 nama_lengkap: item?.nama_lengkap || '',
 nama_panggilan: item?.nama_panggilan || '',
 gelar_depan: item?.gelar_depan || '',
 gelar_belakang: item?.gelar_belakang || '',
 jenis_kelamin: item?.jenis_kelamin || 'L',
 tempat_lahir: item?.tempat_lahir || '',
 tanggal_lahir: item?.tanggal_lahir ? item.tanggal_lahir.split('T')[0] : '',
 agama: item?.agama || meta.agama || 'Islam',
 status_perkawinan: item?.status_perkawinan || meta.status_perkawinan || meta.marital_status || '',
 pendidikan_terakhir: item?.pendidikan_terakhir || meta.pendidikan_terakhir || meta.last_education || '',
 foto: resolvedPhoto,
 photo_url: resolvedPhoto,
 avatar_url: resolvedPhoto,
 user: item?.user,
 raw: item,

 unit_id: item?.unit_id || '',
 unit_name: item?.unit?.name || '',
 jabatan_id: item?.jabatan_id || '',
 jabatan_name: item?.position?.name || item?.role?.name || item?.user?.roles?.[0]?.name || (
 item?.nama_lengkap?.toLowerCase().includes('guru bk') ? 'Guru BK' :
 item?.nama_lengkap?.toLowerCase().includes('guru tahfizh') ? 'Guru Tahfizh' :
 item?.nama_lengkap?.toLowerCase().includes('guru') ? 'Guru Mapel' :
 item?.nama_lengkap?.toLowerCase().includes('wali kelas') ? 'Wali Kelas' :
 item?.nama_lengkap?.toLowerCase().includes('musyrif') ? 'Musyrif' :
 item?.nama_lengkap?.toLowerCase().includes('tata usaha') ? 'Tata Usaha' :
 item?.nama_lengkap?.toLowerCase().includes('wakil kurikulum') ? 'Wakil Kurikulum' :
 item?.nama_lengkap?.toLowerCase().includes('wakil kesiswaan') ? 'Wakil Kesiswaan' :
 item?.nama_lengkap?.toLowerCase().includes('wakil kepala') ? 'Wakil Kepala Sekolah' :
 item?.nama_lengkap?.toLowerCase().includes('kepala sekolah') ? 'Kepala Sekolah' :
 item?.nama_lengkap?.toLowerCase().includes('divisi') ? 'Staf Divisi' :
 '-'
 ),
 is_guru: Boolean(
 item?.teacher ||
 (Array.isArray(item?.teachings) && item.teachings.length > 0) ||
 item?.is_guru ||
 item?.status_pegawai?.toLowerCase().includes('guru') ||
 item?.position?.name?.toLowerCase().includes('guru') ||
 item?.position?.name?.toLowerCase().includes('pendidik') ||
 item?.position?.name?.toLowerCase().includes('wali kelas') ||
 item?.nama_lengkap?.toLowerCase().includes('guru') ||
 item?.nama_lengkap?.toLowerCase().includes('wali kelas')
 ),
 status_pegawai: item?.status_pegawai || '',
 tanggal_masuk: item?.tanggal_masuk ? item.tanggal_masuk.split('T')[0] : '',
 tanggal_keluar: item?.tanggal_keluar ? item.tanggal_keluar.split('T')[0] : '',
 status: item?.status || (item?.is_active === true ? 'Aktif' : item?.is_active === false ? 'Nonaktif' : ''),

 no_hp: item?.no_hp || '',
 email: item?.email || '',
 alamat: item?.alamat || '',
 provinsi: item?.provinsi || '',
 kota: item?.kota || '',
 kecamatan: item?.kecamatan || '',
 kelurahan: item?.kelurahan || '',
 kode_pos: item?.kode_pos || '',

 user_id: item?.user_id || '',
 role_id: item?.role_id || '',
 qr_token: item?.qr_token || meta.qr_token || '',
 qr_code: item?.qr_code || meta.qr_code || '',
 teachings: (() => {
 const sourceTeachings = (Array.isArray(item?.teachings) && item.teachings.length > 0)
 ? item.teachings
 : (Array.isArray(meta.teachings) && meta.teachings.length > 0)
 ? meta.teachings
 : (Array.isArray(item?.teachings) ? item.teachings : [])

 return sourceTeachings.map((t) => ({
 ...t,
 mapel: t.mapel || t.subject?.name || t.subject?.nama_mapel || t.metadata?.mapel || '',
 kelas: t.kelas || t.classroom?.name || t.classroom?.nama_kelas || t.metadata?.kelas || '',
 tahun: t.tahun || t.metadata?.tahun || '2026/2027',
 semester: t.semester || t.metadata?.semester || 'Ganjil',
 }))
 })(),
 position_history: meta.position_history || [],
 certifications: meta.certifications || [],
 documents: meta.documents || [],
 attendances: meta.attendances || [],
 metadata: meta,
 }
}

function makePayload(form, assignmentOnly = false) {
 if (assignmentOnly) {
 return {
 jabatan_id: form.jabatan_id || null,
 }
 }

 const existingMeta = form.metadata || {}
 return {
 niy: form.niy ? form.niy.trim() : null,
 nik: form.nik ? form.nik.trim() : null,
 nama_lengkap: form.nama_lengkap ? form.nama_lengkap.trim() : '',
 nama_panggilan: form.nama_panggilan || null,
 gelar_depan: form.gelar_depan || null,
 gelar_belakang: form.gelar_belakang || null,
 jenis_kelamin: form.jenis_kelamin || 'L',
 tempat_lahir: form.tempat_lahir || null,
 tanggal_lahir: form.tanggal_lahir || null,
 agama: form.agama || 'Islam',
 status_perkawinan: form.status_perkawinan || null,
 pendidikan_terakhir: form.pendidikan_terakhir || null,
 foto: form.foto || null,
 unit_id: form.unit_id || null,
 jabatan_id: form.jabatan_id || null,
 status_pegawai: normalizeEmployeeStatus(form.status_pegawai),
 tanggal_masuk: form.tanggal_masuk || null,
 tanggal_keluar: form.tanggal_keluar || null,
 status: form.status || 'Aktif',
 no_hp: form.no_hp || null,
 email: form.email || null,
 alamat: form.alamat || null,
 provinsi: form.provinsi || null,
 kota: form.kota || null,
 kecamatan: form.kecamatan || null,
 kelurahan: form.kelurahan || null,
 kode_pos: form.kode_pos || null,
 teachings: form.teachings || [],
 metadata: {
 ...existingMeta,
 status_perkawinan: form.status_perkawinan || existingMeta.status_perkawinan || '',
 pendidikan_terakhir: form.pendidikan_terakhir || existingMeta.pendidikan_terakhir || '',
 teachings: form.teachings || [],
 position_history: form.position_history || [],
 certifications: form.certifications || [],
 documents: form.documents || [],
 attendances: form.attendances || [],
 },
 }
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



function KpiTintedCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick }) {
 const resolvedTone = tone === 'sky' ? 'sky' : tone === 'indigo' ? 'indigo' : tone === 'amber' ? 'amber' : tone === 'rose' ? 'rose' : 'emerald'

 return (
 <KpiStatCard
 title={label}
 value={value ?? 0}
 subtitle={subtext}
 badge={tag}
 icon={Icon}
 tone={resolvedTone}
 onClick={onClick}
 />
 )
}

export default function EmployeesPage() {
 const queryClient = useQueryClient()
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const user = useAuthStore((state) => state.user)

 const userRoles = useMemo(() => {
 if (!user) return []
 if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
 if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
 return []
 }, [user])

 const userLevel = getUserRoleLevel(user)
 const isSuperAdmin = userLevel === ROLE_LEVELS.SUPER_ADMIN || Boolean(user?.is_superadmin) || userRoles.some((r) => /super[\s_]*admin/i.test(r))
 const isYayasan = userLevel === ROLE_LEVELS.YAYASAN || userRoles.some((r) => /yayasan|pengurus[\s_]*yayasan|ketua[\s_]*yayasan|sekretaris[\s_]*yayasan|bendahara[\s_]*yayasan/i.test(r))
 const isKepalaSekolah = userLevel === ROLE_LEVELS.KEPALA_SEKOLAH || userRoles.some((r) => /kepala[\s_]*sekolah|kepsek/i.test(r))
 const isOperatorOrTu = userLevel === ROLE_LEVELS.OPERATOR || userLevel === ROLE_LEVELS.TATA_USAHA || userRoles.some((r) => /operator|tata[\s_]*usaha|tu/i.test(r))
 const isSuperAdminOrYayasan = isSuperAdmin || isYayasan
 const isGlobalPersonnelManager = isSuperAdmin && !isYayasan
 const isUnitPersonnelManager = !isYayasan && (isOperatorOrTu || isKepalaSekolah) // Level 3-4: Operator & Kepala Sekolah

 // Deteksi role Divisi Pendidikan (lintas unit)
 const isDivisi = useMemo(() => {
 if (isSuperAdminOrYayasan) return false
 return (
 userLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
 userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik/i.test(r))
 )
 }, [userLevel, userRoles, isSuperAdminOrYayasan])

 // Divisi Pendidikan, Super Admin, dan Pengurus Yayasan berhak memonitor dan memilih seluruh unit pendidikan SIT
 const canSelectUnit = isSuperAdminOrYayasan || isDivisi
 const isGlobalUser = canSelectUnit

 // Hak Akses: Pengurus Yayasan HANYA BISA LIHAT & CETAK (Tidak bisa tambah, import, cetak/unduh template, edit, atau hapus)
 const canCreateEmployee = !isYayasan && (isGlobalPersonnelManager || isUnitPersonnelManager)
 const canImportEmployee = !isYayasan && (isGlobalPersonnelManager || isUnitPersonnelManager)
 const canDownloadTemplate = !isYayasan && (isGlobalPersonnelManager || isUnitPersonnelManager)
 const canUpdateEmployee = !isYayasan && (isGlobalPersonnelManager || isUnitPersonnelManager)
 const canDeleteEmployee = !isYayasan && isGlobalPersonnelManager
 const canExportEmployee = !isYayasan && (isGlobalPersonnelManager || isUnitPersonnelManager || (Array.isArray(user?.permissions) && user.permissions.includes('employee.export')))
 const canPrintEmployee = true

 const isPengurusYayasanEmployee = (emp) => {
 if (!emp) return false
 const position = String(emp.jabatan_name || emp.position?.name || '').toLowerCase()
 const unit = String(emp.unit_name || emp.unit?.name || '').toLowerCase()
 return position.includes('pengurus yayasan') || position.includes('ketua yayasan') || unit.includes('pengurus yayasan')
 }

 const userUnitId = user?.unit_id || user?.education_unit_id || user?.employee?.unit_id || user?.metadata?.education_unit_id || user?.metadata?.unit_id || ''

 // Filter States
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedUnitFilter, setSelectedUnitFilter] = useState(() => (!canSelectUnit && userUnitId ? String(userUnitId) : ''))
 const [selectedJabatanFilter, setSelectedJabatanFilter] = useState('')
 const [selectedStatusPegawaiFilter, setSelectedStatusPegawaiFilter] = useState('')
 const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
 const [selectedGenderFilter, setSelectedGenderFilter] = useState('')

 // Pagination State
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)

 const [selectedAcademicYear, setSelectedAcademicYear] = useState('2026/2027')

 // Modal Controls
 const [isFormModalOpen, setIsFormModalOpen] = useState(false)
 const [isEditMode, setIsEditMode] = useState(false)
 const [currentStep, setCurrentStep] = useState(1)
 const [formData, setFormData] = useState(initialFormState())
 const [showImportModal, setShowImportModal] = useState(false)
 const [overwriteExisting, setOverwriteExisting] = useState(false)
 const [duplicateModalData, setDuplicateModalData] = useState(null)
 const [showExportModal, setShowExportModal] = useState(false)
 const [showTemplateModal, setShowTemplateModal] = useState(false)
 const [showIdCardModal, setShowIdCardModal] = useState(null)
 const [selectedIdCardTemplate, setSelectedIdCardTemplate] = useState('green')
 const [idCardOrientation, setIdCardOrientation] = useState(() => localStorage.getItem('employee-id-card-orientation') || 'vertical')
 const [isDragModeEnabled, setIsDragModeEnabled] = useState(false)
 const [idCardLayoutConfig, setIdCardLayoutConfig] = useState({})
 const [idCardFrameStyle, setIdCardFrameStyle] = useState('standard')
 const [idCardPhotoShape, setIdCardPhotoShape] = useState('rounded')
 const [idCardShowPattern, setIdCardShowPattern] = useState(true)
 const [idCardShowWave, setIdCardShowWave] = useState(true)
 const [idCardHeaderMotto, setIdCardHeaderMotto] = useState(() => pengaturan?.motto || 'Berilmu, Berakhlak, Beramal')
 const [idCardFooterMotto, setIdCardFooterMotto] = useState(() => pengaturan?.card_footer_motto || 'Generasi Beriman, Berilmu,\nBerakhlak Mulia')
 const [idCardControlTab, setIdCardControlTab] = useState('style')
 const [idCardSide, setIdCardSide] = useState('front') // 'front' | 'back'
 const [idCardBackTitle, setIdCardBackTitle] = useState('KETENTUAN KARTU PEGAWAI')
 const [idCardBackRules, setIdCardBackRules] = useState(() => pengaturan?.card_rules_employee || '')
 const [idCardBackAddress, setIdCardBackAddress] = useState('')
 const [idCardBackShowQr, setIdCardBackShowQr] = useState(true)
 const [idCardPrintSides, setIdCardPrintSides] = useState('both') // 'both' | 'front' | 'back'

 const handleElementMove = useCallback((key, pos) => {
 setIdCardLayoutConfig((prev) => ({
 ...prev,
 [key]: pos,
 }))
 }, [])

 const changeIdCardOrientation = (orientation) => {
 setIdCardOrientation(orientation)
 localStorage.setItem('employee-id-card-orientation', orientation)
 }

 // Import Data States
 const [importFile, setImportFile] = useState(null)
 const [importPreviewData, setImportPreviewData] = useState([])
 const [importPreviewFilter, setImportPreviewFilter] = useState('all')
 const [isImporting, setIsImporting] = useState(false)
 const importFileInputRef = useRef(null)

 // Query all existing employees to cross-verify duplicates & existing primary keys
 const { data: allEmployeesForImport } = useQuery({
 queryKey: ['all-employees-for-import'],
 queryFn: () => employeeService.getDaftar({ per_page: 1000 }),
 enabled: showImportModal,
 staleTime: 60000,
 })

 const handleClearImportFile = (e) => {
 if (e) {
 e.preventDefault()
 e.stopPropagation()
 }
 setImportFile(null)
 setImportPreviewData([])
 setImportPreviewFilter('all')
 if (importFileInputRef.current) {
 importFileInputRef.current.value = ''
 }
 }

 // Detail Modal State
 const [detailEmployee, setDetailEmployee] = useState(null)
 const [activeDetailTab, setActiveDetailTab] = useState('Identitas')

 // Delete Modal State
 const [deleteTarget, setDeleteTarget] = useState(null)
 const [hasConfirmedDeleteCheck, setHasConfirmedDeleteCheck] = useState(false)

 // Stat Card Modal State
 const [statCardModal, setStatCardModal] = useState({ isOpen: false, type: '', title: '', badge: '' })
 const [statCardSearch, setStatCardSearch] = useState('')

 // Quick New Sub-item States inside Detail Modal
 const [newTeaching, setNewTeaching] = useState({ mapel: '', kelas: '', tahun: '2026/2027', semester: 'Ganjil' })
 const [newCert, setNewCert] = useState({ nama: '', penerbit: '', tahun: '', no_sertifikat: '' })
 const [newDoc, setNewDoc] = useState({ nama: '', file_name: '' })

 // Floating Smart Scroll Navigator (Option A)
 const [isScrolledDown, setIsScrolledDown] = useState(false)

 useEffect(() => {
 const handleScroll = () => {
 setIsScrolledDown(window.scrollY > 350)
 }
 window.addEventListener('scroll', handleScroll, { passive: true })
 return () => window.removeEventListener('scroll', handleScroll)
 }, [])

 const handleQuickScroll = () => {
 if (isScrolledDown) {
 window.scrollTo({ top: 0, behavior: 'smooth' })
 } else {
 const tableEl = document.getElementById('tabel-direktori-pegawai')
 if (tableEl) {
 tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
 } else {
 window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
 }
 }
 }

 const toast = useToast()
 const pushNotification = (title, message, tone = 'success') => {
 toast(message ? `${title}: ${message}` : title, tone)
 }

 // Query Fetching Employees
 const { data, isLoading, isError, refetch, isFetching } = useQuery({
 queryKey: [
 'employees-list',
 page,
 perPage,
 debouncedSearch,
 selectedUnitFilter,
 selectedJabatanFilter,
 selectedStatusPegawaiFilter,
 selectedStatusFilter,
 selectedGenderFilter,
 ],
 queryFn: () =>
 employeeService.getDaftar({
 page,
 per_page: perPage,
 search: debouncedSearch || undefined,
 unit_id: selectedUnitFilter || undefined,
 jabatan_id: selectedJabatanFilter || undefined,
 status_pegawai: selectedStatusPegawaiFilter || undefined,
 status: selectedStatusFilter || undefined,
 jenis_kelamin: selectedGenderFilter || undefined,
 }),
 })

 // Query Fetching Positions & Units for Dropdowns (Cascading by selectedUnitFilter)
 const { data: positionsData } = useQuery({
 queryKey: ['positions', selectedUnitFilter],
 queryFn: () => employeeService.getPositions({ unit_id: selectedUnitFilter || undefined }),
 })

 const { data: dashboardData, isLoading: isSummaryLoading } = useQuery({
 queryKey: ['employees-dashboard', selectedUnitFilter],
 queryFn: () => employeeService.getDashboard({ unit_id: selectedUnitFilter || undefined }),
 })

 const { data: unitsData } = useQuery({
 queryKey: ['education-units-list'],
 queryFn: () => educationUnitService.getDaftar({ per_page: 100 }),
 })

 const { data: dynamicEmployeeStatusRes } = useQuery({
 queryKey: ['business-options-employee-status'],
 queryFn: () => businessOptionService.getDropdown('employee_status'),
 staleTime: 5 * 60 * 1000,
 })

 const { data: dynamicMaritalStatusRes } = useQuery({
 queryKey: ['business-options-marital-status'],
 queryFn: () => businessOptionService.getDropdown('marital_status'),
 staleTime: 5 * 60 * 1000,
 })

 const { data: dynamicLastEducationRes } = useQuery({
 queryKey: ['business-options-last-education'],
 queryFn: () => businessOptionService.getDropdown('last_education'),
 staleTime: 5 * 60 * 1000,
 })

 const positionsList = useMemo(() => {
 if (Array.isArray(positionsData?.data)) return positionsData.data
 if (Array.isArray(positionsData?.data?.data)) return positionsData.data.data
 if (Array.isArray(positionsData)) return positionsData
 return []
 }, [positionsData])

 // Otomatis reset selectedJabatanFilter jika jabatan yang sedang terpilih tidak ada pada unit pendidikan yang dipilih
 useEffect(() => {
 if (selectedJabatanFilter && positionsList.length > 0) {
 const exists = positionsList.some((p) => String(p.id) === String(selectedJabatanFilter))
 if (!exists) {
 setSelectedJabatanFilter('')
 }
 }
 }, [positionsList, selectedJabatanFilter])

 const employeeStats = dashboardData?.data || {}

 const unitsList = useMemo(() => {
 if (Array.isArray(unitsData?.data)) return unitsData.data
 if (Array.isArray(unitsData?.data?.data)) return unitsData.data.data
 if (Array.isArray(unitsData)) return unitsData
 return []
 }, [unitsData])

 const statusPegawaiOptions = useMemo(() => {
 const dynamicItems = dynamicEmployeeStatusRes?.data || []
 if (Array.isArray(dynamicItems) && dynamicItems.length > 0) {
 return dynamicItems.map(d => d.name || d.label || d.value || d)
 }
 return STATUS_PEGAWAI_OPTIONS
 }, [dynamicEmployeeStatusRes])

 const maritalStatusOptions = useMemo(() => {
 const dynamicItems = dynamicMaritalStatusRes?.data || []
 if (Array.isArray(dynamicItems) && dynamicItems.length > 0) {
 return dynamicItems.map(d => d.name || d.label || d.value || d)
 }
 return MARITAL_STATUS_OPTIONS
 }, [dynamicMaritalStatusRes])

 const lastEducationOptions = useMemo(() => {
 const dynamicItems = dynamicLastEducationRes?.data || []
 if (Array.isArray(dynamicItems) && dynamicItems.length > 0) {
 return dynamicItems.map(d => d.name || d.label || d.value || d)
 }
 return LAST_EDUCATION_OPTIONS
 }, [dynamicLastEducationRes])

 const getEmployeeUnitAddress = useCallback((employee, unitsList, pengaturan) => {
 const institutionAddr = pengaturan?.address ? `${pengaturan.address}${pengaturan.city ? `, ${pengaturan.city}` : ''}` : ''
 const institutionPhone = pengaturan?.phone || ''
 const institutionWeb = pengaturan?.website || ''

 if (!employee) {
 const parts = []
 if (institutionAddr) parts.push(institutionAddr)
 const contact = [institutionPhone ? `Telp: ${institutionPhone}` : '', institutionWeb ? `Website: ${institutionWeb}` : ''].filter(Boolean).join(' | ')
 if (contact) parts.push(contact)
 return parts.join('\n')
 }

 const empUnit = (unitsList || []).find((u) => String(u.id) === String(employee.unit_id || employee.unit?.id)) || employee.unit
 const unitName = empUnit?.name || employee.unit_name || employee.unit?.name || ''
 const unitAddrText = empUnit?.address || empUnit?.alamat || empUnit?.description || institutionAddr
 const unitPhoneText = empUnit?.phone || empUnit?.telepon || institutionPhone
 const unitWebText = empUnit?.website || institutionWeb

 const lines = []
 if (unitName || unitAddrText) {
 lines.push([unitName, unitAddrText].filter(Boolean).join(' — '))
 } else if (institutionAddr) {
 lines.push(institutionAddr)
 }

 const contactLine = [unitPhoneText ? `Telp: ${unitPhoneText}` : '', unitWebText ? `Website: ${unitWebText}` : ''].filter(Boolean).join(' | ')
 if (contactLine) {
 lines.push(contactLine)
 }

 return lines.join('\n')
 }, [])

 useEffect(() => {
 if (showIdCardModal) {
 const defaultAddr = getEmployeeUnitAddress(showIdCardModal, unitsList, pengaturan)
 setIdCardBackAddress(defaultAddr)
 }
 }, [showIdCardModal, unitsList, pengaturan, getEmployeeUnitAddress])

 useEffect(() => {
 if (pengaturan?.card_rules_employee && !idCardBackRules) {
 setIdCardBackRules(pengaturan.card_rules_employee)
 }
 if (pengaturan?.card_footer_motto && !idCardFooterMotto) {
 setIdCardFooterMotto(pengaturan.card_footer_motto)
 }
 }, [pengaturan])

 const resetIdCardLayout = () => {
 setIdCardLayoutConfig({})
 setIdCardFrameStyle('standard')
 setIdCardPhotoShape('rounded')
 setIdCardShowPattern(true)
 setIdCardShowWave(true)
 setIdCardHeaderMotto(pengaturan?.motto || 'Berilmu, Berakhlak, Beramal')
 setIdCardFooterMotto(pengaturan?.card_footer_motto || 'Generasi Beriman, Berilmu,\nBerakhlak Mulia')
 setIdCardSide('front')
 setIdCardBackTitle('KETENTUAN KARTU PEGAWAI')
 setIdCardBackRules(pengaturan?.card_rules_employee || '')
 if (showIdCardModal) {
 setIdCardBackAddress(getEmployeeUnitAddress(showIdCardModal, unitsList, pengaturan))
 }
 setIdCardBackShowQr(true)
 setIdCardPrintSides('both')
 }

 const rawList = useMemo(() => {
 const list = data?.data || []
 return Array.isArray(list) ? list : []
 }, [data?.data])

 const items = useMemo(() => {
 return rawList.map(parseFromApi)
 }, [rawList])

 const filteredItems = items

 // Fetch full list of employees for drilldown modal when opened
 const { data: modalEmployeesData, isLoading: isModalEmployeesLoading } = useQuery({
 queryKey: ['modal-employees', statCardModal.isOpen, selectedUnitFilter],
 queryFn: () =>
 employeeService.getDaftar({
 per_page: 500,
 unit_id: selectedUnitFilter || undefined,
 }),
 enabled: statCardModal.isOpen,
 })

 const modalRawList = useMemo(() => {
 const list = modalEmployeesData?.data || []
 return Array.isArray(list) ? list.map(parseFromApi) : []
 }, [modalEmployeesData?.data])

 const statModalItems = useMemo(() => {
 if (!statCardModal.isOpen) return []
 const sourceList = modalRawList.length > 0 ? modalRawList : items
 let list = []
 if (statCardModal.type === 'total') {
 list = sourceList
 } else if (statCardModal.type === 'pendidik') {
 list = sourceList.filter((i) =>
 i.is_guru ||
 i.jabatan_name?.toLowerCase().includes('guru') ||
 i.jabatan_name?.toLowerCase().includes('pendidik') ||
 i.jabatan_name?.toLowerCase().includes('wali kelas') ||
 i.status_pegawai?.toLowerCase().includes('guru') ||
 i.nama_lengkap?.toLowerCase().includes('guru') ||
 i.nama_lengkap?.toLowerCase().includes('wali kelas')
 )
 } else if (statCardModal.type === 'tendik') {
 list = sourceList.filter((i) =>
 !i.is_guru &&
 !i.jabatan_name?.toLowerCase().includes('guru') &&
 !i.jabatan_name?.toLowerCase().includes('pendidik') &&
 !i.jabatan_name?.toLowerCase().includes('wali kelas') &&
 !i.status_pegawai?.toLowerCase().includes('guru') &&
 !i.nama_lengkap?.toLowerCase().includes('guru') &&
 !i.nama_lengkap?.toLowerCase().includes('wali kelas')
 )
 } else if (statCardModal.type === 'aktif') {
 list = sourceList.filter((i) => i.status === 'Aktif')
 }
 if (statCardSearch) {
 const q = statCardSearch.toLowerCase()
 list = list.filter(
 (i) =>
 (i.nama_lengkap || '').toLowerCase().includes(q) ||
 (i.niy || '').toLowerCase().includes(q) ||
 (i.nik || '').toLowerCase().includes(q)
 )
 }
 return list
 }, [statCardModal, modalRawList, items, statCardSearch])

 const { data: academicYearsData } = useQuery({
 queryKey: ['academic-years-dropdown'],
 queryFn: () => tahunAjaranService.getDropdown().catch(() => []),
 })

 const academicYearsList = useMemo(() => {
 return Array.isArray(academicYearsData) ? academicYearsData : []
 }, [academicYearsData])

 const kpiChartData = useMemo(() => {
 return []
 }, [selectedAcademicYear])

 const kpiProfilesList = useMemo(() => {
 if (!items || items.length === 0) return []
 return items
 .filter((emp) => emp.kpi_score !== undefined || emp.kpiScore !== undefined || emp.skor_kinerja !== undefined)
 .map((emp) => {
 const score = Number(emp.kpi_score || emp.kpiScore || emp.skor_kinerja || 0)
 return {
 ...emp,
 kpiScore: score,
 kpiLabel: emp.kpi_label || emp.kpiLabel || (score >= 90 ? 'Sangat Baik' : score >= 75 ? 'Baik' : 'Cukup'),
 presenceRate: Number(emp.presence_rate || emp.presenceRate || 0),
 }
 })
 }, [items])

 const paginationInfo = {
 total: data?.total ?? (data?.data ? data.data.length : items.length),
 from: data?.from ?? (items.length > 0 ? (page - 1) * perPage + 1 : 0),
 to: data?.to ?? (items.length > 0 ? (page - 1) * perPage + items.length : 0),
 last_page: data?.last_page || 1,
 current_page: data?.current_page || page,
 per_page: data?.per_page || perPage,
 }

 const handleFotoUpload = (e) => {
 const file = e.target.files?.[0]
 if (!file) return
 const reader = new FileReader()
 reader.onloadend = () => {
 setFormData((p) => ({ ...p, foto: reader.result }))
 }
 reader.readAsDataURL(file)
 }

 // --- Handlers Import ---

 const handleFileSelect = (e) => {
 const file = e.target.files?.[0]
 if (!file) return
 setImportFile(file)
 setImportPreviewData([])
 setImportPreviewFilter('all')

 const existingList = allEmployeesForImport?.data || items || []

 const reader = new FileReader()
 reader.onload = (evt) => {
 try {
 const buffer = evt.target.result
 const workbook = XLSX.read(buffer, { type: 'array' })
 const sheetName = workbook.SheetNames[0]
 const sheet = workbook.Sheets[sheetName]
 const rawJson = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
 if (!rawJson || rawJson.length <= 1) {
 setImportPreviewData([])
 return
 }

 const headerRow = (rawJson[0] || []).map((h) =>
 String(h || '').toLowerCase().replace(/[\s_\-.:/]/g, '')
 )
 const findCol = (keys) => headerRow.findIndex((h) => keys.includes(h))

 const idxNiy = findCol(['niy', 'nip', 'nomorindukyayasan', 'idpegawai', 'nopegawai', 'nomorinduk', 'nomor', 'nikpegawai', 'kodepegawai'])
 const idxNik = findCol(['nik', 'nomorindukkependudukan', 'ktp', 'noktp', 'nomorktp'])
 const idxNama = findCol(['namalengkap', 'nama', 'fullname', 'name', 'namapegawai', 'namaguru', 'namakaryawan', 'namapendidik', 'pegawai', 'guru'])
 const idxJabatan = findCol(['jabatan', 'position', 'posisi', 'namajabatan', 'role', 'tugas'])
 const idxUnit = findCol(['unitkerja', 'unit', 'unitid', 'educationunit', 'namasatuan', 'unitpendidikan', 'satuanpendidikan', 'sekolah', 'jenjang', 'cabang'])
 const idxEmail = findCol(['email', 'surel', 'mail'])
 const idxPhone = findCol(['nohp', 'nomorhp', 'phone', 'telepon', 'telp', 'wa', 'whatsapp'])
 const idxStatusPegawai = findCol(['statuspegawai', 'employmentstatus', 'statuskepegawaian', 'jeniskepegawaian', 'tipepegawai'])

 const seenNiyInFile = new Map()
 const seenNikInFile = new Map()

 const parsedRows = []
 for (let i = 1; i < rawJson.length; i++) {
 const cols = rawJson[i]
 if (!cols || !Array.isArray(cols) || cols.every((c) => String(c || '').trim() === '')) continue

 let niy = idxNiy !== -1 ? String(cols[idxNiy] || '').trim() : String(cols[0] || '').trim()
 let nik = idxNik !== -1 ? String(cols[idxNik] || '').trim() : ''
 let nama = idxNama !== -1 ? String(cols[idxNama] || '').trim() : String(cols[1] || '').trim()
 let jabatan = idxJabatan !== -1 ? String(cols[idxJabatan] || '').trim() : ''
 let unit = idxUnit !== -1 ? String(cols[idxUnit] || '').trim() : ''
 let email = idxEmail !== -1 ? String(cols[idxEmail] || '').trim() : ''
 let noHp = idxPhone !== -1 ? String(cols[idxPhone] || '').trim() : ''
 let statusPegawai = idxStatusPegawai !== -1 ? String(cols[idxStatusPegawai] || '').trim() : 'Tetap'

 // Fallback pencarian kolom nama jika header tidak standar
 if (!nama) {
 for (const colVal of cols) {
 const str = String(colVal || '').trim()
 if (str.length >= 3 && isNaN(Number(str)) && /[a-zA-Z]/.test(str)) {
 nama = str
 break
 }
 }
 }

 // Verifikasi duplikasi internal dalam file yang diunggah
 let isDuplicateInFile = false
 if (niy && seenNiyInFile.has(niy.toLowerCase())) {
 isDuplicateInFile = true
 } else if (niy) {
 seenNiyInFile.set(niy.toLowerCase(), i)
 }

 if (nik && seenNikInFile.has(nik)) {
 isDuplicateInFile = true
 } else if (nik) {
 seenNikInFile.set(nik, i)
 }

 // Verifikasi kecocokan data dengan database pegawai eksisting (Primary/Unique keys: NIY, NIK, Email)
 const matchedEmployee = existingList.find((emp) => {
 if (niy && emp.niy && emp.niy.toLowerCase() === niy.toLowerCase()) return true
 if (nik && emp.nik && String(emp.nik) === String(nik)) return true
 if (email && emp.email && emp.email.toLowerCase() === email.toLowerCase()) return true
 return false
 })

 let verificationType = 'new'
 let verificationLabel = 'Pegawai Baru'
 let verificationNote = 'Data baru akan didaftarkan ke sistem.'

 if (!nama) {
 verificationType = 'invalid'
 verificationLabel = 'Nama Kosong'
 verificationNote = 'Baris dilewati karena nama lengkap pegawai kosong.'
 } else if (isDuplicateInFile) {
 verificationType = 'duplicate'
 verificationLabel = 'Duplikat di Berkas'
 verificationNote = `Identitas (${niy || nik}) muncul lebih dari 1 kali di dalam berkas spreadsheet.`
 } else if (matchedEmployee) {
 verificationType = 'update'
 verificationLabel = 'Sudah Ada (Update Profil)'
 verificationNote = `Cocok dengan ${matchedEmployee.nama_lengkap} (${matchedEmployee.niy || 'NIY sama'}). Data disinkronkan tanpa membuat duplikat.`
 }

 parsedRows.push({
 rowNum: i + 1,
 niy: niy || '-',
 nik: nik || '-',
 nama: nama || `Baris ${i + 1}`,
 jabatan: jabatan || '-',
 unit: unit || '-',
 email: email || '-',
 noHp: noHp || '-',
 statusPegawai: statusPegawai || 'Tetap',
 type: verificationType,
 statusLabel: verificationLabel,
 note: verificationNote,
 matchedEmployee: matchedEmployee ? { id: matchedEmployee.id, nama: matchedEmployee.nama_lengkap, niy: matchedEmployee.niy } : null,
 })
 }

 setImportPreviewData(parsedRows)
 } catch (err) {
 console.error('Spreadsheet preview error', err)
 setImportPreviewData([])
 }
 }
 reader.readAsArrayBuffer(file)
 }

 // Ringkasan KPI Data Import
 const importPreviewStats = useMemo(() => {
 const total = importPreviewData.length
 const newCount = importPreviewData.filter((r) => r.type === 'new').length
 const updateCount = importPreviewData.filter((r) => r.type === 'update').length
 const duplicateCount = importPreviewData.filter((r) => r.type === 'duplicate').length
 const invalidCount = importPreviewData.filter((r) => r.type === 'invalid').length
 return { total, newCount, updateCount, duplicateCount, invalidCount }
 }, [importPreviewData])

 // Data Preview Terfilter berdasarkan Tab Pilihan
 const filteredPreviewData = useMemo(() => {
 if (importPreviewFilter === 'new') return importPreviewData.filter((r) => r.type === 'new')
 if (importPreviewFilter === 'update') return importPreviewData.filter((r) => r.type === 'update')
 if (importPreviewFilter === 'issue') return importPreviewData.filter((r) => r.type === 'duplicate' || r.type === 'invalid')
 return importPreviewData
 }, [importPreviewData, importPreviewFilter])

 const handleProcessImport = async () => {
 if (!importFile) return
 setIsImporting(true)
 try {
 const formData = new FormData()
 formData.append('file', importFile)
 formData.append('overwrite', overwriteExisting ? '1' : '0')

 const res = await employeeService.importData(formData)
 const resData = res?.data || res || {}

 setIsImporting(false)
 setShowImportModal(false)
 setImportFile(null)
 setImportPreviewData([])
 setPage(1)

 const totalBerhasil = (resData.berhasil || 0) + (resData.diperbarui || 0)
 const totalGagal = resData.gagal || 0

 let notifType = 'success'
 let notifTitle = 'Impor Berhasil'
 if (totalGagal > 0 && totalBerhasil === 0) {
 notifType = 'error'
 notifTitle = 'Impor Gagal'
 } else if (totalGagal > 0 && totalBerhasil > 0) {
 notifType = 'warning'
 notifTitle = 'Impor Selesai Sebagian'
 }

 let notifMsg = `Impor selesai. ${totalBerhasil} berhasil (${resData.berhasil || 0} baru, ${resData.diperbarui || 0} ditimpa), ${resData.duplikat || 0} duplikat dilewati, ${totalGagal} gagal.`
 if (resData.errors && resData.errors.length > 0) {
 notifMsg += ` Catatan: ${resData.errors[0]}`
 }

 pushNotification(notifTitle, notifMsg, notifType)

 if ((resData.duplicates && resData.duplicates.length > 0) || (resData.errors && resData.errors.length > 0) || resData.diperbarui > 0 || resData.duplikat > 0) {
 setDuplicateModalData(resData)
 }

 queryClient.invalidateQueries({ queryKey: ['employees-list'] })
 queryClient.invalidateQueries({ queryKey: ['employees'] })
 queryClient.invalidateQueries({ queryKey: ['employees-dashboard'] })
 if (typeof refetch === 'function') {
 refetch()
 }
 } catch (err) {
 setIsImporting(false)
 const details = err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : ''
 const msg = details ? `${err?.response?.data?.message || 'Gagal'}: ${details}` : (err?.response?.data?.message || err.message || 'Gagal memproses impor data pegawai.')
 pushNotification('Impor Gagal', msg, 'error')
 }
 }

 // Mutations
 const createMutation = useMutation({
 mutationFn: (payload) => employeeService.tambah(payload),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['employees'] })
 queryClient.invalidateQueries({ queryKey: ['employees-list'] })
 queryClient.invalidateQueries({ queryKey: ['employees-dashboard'] })
 pushNotification('Berhasil Disimpan', 'Data pegawai baru berhasil ditambahkan ke sistem.')
 closeFormModal()
 },
 onError: (err) => {
 const details = err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : ''
 const msg = details ? `${err?.response?.data?.message || 'Gagal'}: ${details}` : (err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data pegawai.')
 pushNotification('Gagal Disimpan', msg, 'error')
 },
 })

 const updateMutation = useMutation({
 mutationFn: ({ id, payload }) => employeeService.ubah({ id, payload }),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['employees'] })
 queryClient.invalidateQueries({ queryKey: ['employees-list'] })
 queryClient.invalidateQueries({ queryKey: ['employees-dashboard'] })
 if (res?.data && detailEmployee && String(res.data.id) === String(detailEmployee.id)) {
 setDetailEmployee(parseFromApi(res.data))
 }
 pushNotification('Berhasil Diubah', 'Data pegawai berhasil diperbarui.')
 closeFormModal()
 },
 onError: (err) => {
 const details = err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : ''
 const msg = details ? `${err?.response?.data?.message || 'Gagal'}: ${details}` : (err?.response?.data?.message || 'Terjadi kesalahan saat memperbarui data pegawai.')
 pushNotification('Gagal Diubah', msg, 'error')
 },
 })

 const deleteMutation = useMutation({
 mutationFn: (id) => employeeService.hapus(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['employees'] })
 queryClient.invalidateQueries({ queryKey: ['employees-list'] })
 queryClient.invalidateQueries({ queryKey: ['employees-dashboard'] })
 pushNotification('Berhasil Dihapus', 'Data pegawai berhasil dihapus dari sistem.')
 setDeleteTarget(null)
 setHasConfirmedDeleteCheck(false)
 },
 onError: (err) => {
 pushNotification('Gagal Dihapus', err?.response?.data?.message || 'Terjadi kesalahan saat menghapus data pegawai.', 'error')
 },
 })

 const isMutating = createMutation.isPending || updateMutation.isPending

 // Modal Handlers
 const openAddModal = () => {
 if (!canCreateEmployee) {
 pushNotification('Akses Dibatasi', 'Pengurus Yayasan hanya memiliki izin untuk melihat dan mencetak data.', 'warning')
 return
 }
 setIsEditMode(false)
 setFormData(initialFormState())
 setCurrentStep(1)
 setIsFormModalOpen(true)
 }

 const openEditModal = (emp) => {
 if (!emp || !canUpdateEmployee) {
 pushNotification('Akses Dibatasi', 'Pengurus Yayasan hanya memiliki izin untuk melihat dan mencetak data.', 'warning')
 return
 }
 const normalizedEmp = parseFromApi(emp)
 setIsEditMode(true)
 setFormData(normalizedEmp)
 setCurrentStep(1)
 setIsFormModalOpen(true)
 }

 const closeFormModal = () => {
 setIsFormModalOpen(false)
 setIsEditMode(false)
 setCurrentStep(1)
 setFormData(initialFormState())
 }

 const handleFormSubmit = (e) => {
 e?.preventDefault()
 if ((isEditMode && !canUpdateEmployee) || (!isEditMode && !canCreateEmployee)) return
 if (!formData.nama_lengkap.trim()) {
 pushNotification('Perhatian', 'Data pegawai belum lengkap. Nama lengkap wajib diisi.', 'warning')
 return
 }

 const payload = makePayload(formData, isEditMode && isUnitPersonnelManager)
 if (isEditMode && formData.id) {
 updateMutation.mutate({ id: formData.id, payload })
 } else {
 createMutation.mutate(payload)
 }
 }

 const toggleEmployeeStatus = (emp) => {
 if (!isGlobalPersonnelManager) return
 const updatedForm = { ...emp, status: emp.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
 const payload = makePayload(updatedForm)
 updateMutation.mutate({ id: emp.id, payload })
 }

 // Helper Download CSV dengan UTF-8 BOM
 const downloadCsvFile = (filename, headers, rows) => {
 const escape = (val) => `"${String(val ?? '').replaceAll('"', '""')}"`
 const headerRow = headers.map(escape).join(',')
 const dataRows = rows.map((row) => row.map(escape).join(','))
 const content = `\uFEFF${[headerRow, ...dataRows].join('\n')}`
 const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = filename
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 URL.revokeObjectURL(url)
 }

 // Helper Download Excel (.xlsx / .xls) SpreadsheetML XML
 const downloadXmlSpreadsheet = (filename, headers, rows) => {
 const escapeXml = (str) =>
 String(str ?? '')
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;')

 let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
 xml += `<?mso-application progid="Excel.Sheet"?>\n`
 xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n`
 xml += ` xmlns:o="urn:schemas-microsoft-com:office:office"\n`
 xml += ` xmlns:x="urn:schemas-microsoft-com:office:excel"\n`
 xml += ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n`
 xml += ` <Styles>\n`
 xml += ` <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#059669" ss:Pattern="Solid"/></Style>\n`
 xml += ` </Styles>\n`
 xml += ` <Worksheet ss:Name="Data Pegawai">\n`
 xml += ` <Table>\n`
 xml += ` <Row>\n`
 headers.forEach((h) => {
 xml += ` <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`
 })
 xml += ` </Row>\n`
 rows.forEach((row) => {
 xml += ` <Row>\n`
 row.forEach((cell) => {
 xml += ` <Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>\n`
 })
 xml += ` </Row>\n`
 })
 xml += ` </Table>\n`
 xml += ` </Worksheet>\n`
 xml += `</Workbook>`

 const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = filename
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 URL.revokeObjectURL(url)
 }

 // Multi-format Server-Side Export Handler (.csv, .xls, .xlsx)
 const handleExportDataFormat = async (format = 'xlsx') => {
 if (!canExportEmployee) return
 setShowExportModal(false)

 const params = {}
 if (debouncedSearch) params.search = debouncedSearch
 if (selectedUnitFilter) params.unit_id = selectedUnitFilter
 if (selectedJabatanFilter) params.jabatan_id = selectedJabatanFilter
 if (selectedStatusPegawaiFilter) params.status_pegawai = selectedStatusPegawaiFilter
 if (selectedStatusFilter) params.status = selectedStatusFilter
 if (selectedGenderFilter) params.jenis_kelamin = selectedGenderFilter

 await downloadFileFromApi('/employees/export', params, format, `pegawai-export-${new Date().toISOString().slice(0, 10)}`)
 pushNotification('Export Berhasil', `Data pegawai berhasil diexport ke berkas .${format.toUpperCase()}.`, 'success')
 }

 // Download Import/Export Template Handler (.csv, .xls, .xlsx)
 const handleDownloadTemplatePegawaiFormat = (format = 'xlsx') => {
 if (!canDownloadTemplate) {
 pushNotification('Akses Dibatasi', 'Pengurus Yayasan hanya memiliki izin untuk melihat dan mencetak data.', 'warning')
 return
 }
 const filename = `template_import_pegawai.${format}`
 const headers = ['NIY', 'NIK', 'Nama Lengkap', 'Gelar Depan', 'Gelar Belakang', 'Jabatan', 'Unit Kerja', 'Status Pegawai', 'Status Keaktifan', 'No HP', 'Email', 'Alamat']
 const sampleRows = [
 ['NIY-2026001', '1371012345670001', 'Ahmad Farhan', 'Ustadz', 'S.Pd.', 'Guru Kelas', 'SD IT', 'Tetap', 'Aktif', '08123456789', 'ahmad@dareliman.sch.id', 'Padang'],
 ['NIY-2026002', '1371012345670002', 'Fatimah Az-Zahra', 'Ustadzah', 'M.Pd.', 'Kepala Sekolah', 'SMP IT', 'Tetap', 'Aktif', '08129876543', 'fatimah@dareliman.sch.id', 'Padang'],
 ]

 if (format === 'csv') {
 downloadCsvFile(filename, headers, sampleRows)
 } else {
 downloadXmlSpreadsheet(filename, headers, sampleRows)
 }
 setShowTemplateModal(false)
 pushNotification('Template Diunduh', `Template impor pegawai (format .${format.toUpperCase()}) berhasil diunduh.`, 'info')
 }

 // Legacy Export Excel Handler
 const handleExportExcel = () => {
 handleExportDataFormat('xlsx')
 }

 // Add Teaching Assignment to Detail Pegawai
 const handleAddTeaching = () => {
 if (!isGlobalPersonnelManager) return
 if (!newTeaching.mapel || !newTeaching.kelas) {
 Swal.fire('Peringatan', 'Mata Pelajaran dan Kelas wajib diisi!', 'warning')
 return
 }
 const updatedTeachings = [...(detailEmployee.teachings || []), { ...newTeaching }]
 const updatedEmp = { ...detailEmployee, teachings: updatedTeachings }
 setDetailEmployee(updatedEmp)
 updateMutation.mutate({ id: detailEmployee.id, payload: makePayload(updatedEmp) })
 setNewTeaching({ mapel: '', kelas: '', tahun: '2026/2027', semester: 'Ganjil' })
 }

 // Remove Teaching Assignment from Detail Pegawai
 const handleRemoveTeaching = async (indexToRemove) => {
 if (!isGlobalPersonnelManager) return
 const updatedTeachings = (detailEmployee.teachings || []).filter((_, idx) => idx !== indexToRemove)
 const updatedEmp = { ...detailEmployee, teachings: updatedTeachings }
 setDetailEmployee(updatedEmp)

 if (updatedTeachings.length === 0) {
 try {
 await employeeService.assignTeaching({ id: detailEmployee.id, teachings: [] })
 queryClient.invalidateQueries({ queryKey: ['employees'] })
 queryClient.invalidateQueries({ queryKey: ['employees-list'] })
 queryClient.invalidateQueries({ queryKey: ['employees-dashboard'] })
 pushNotification('Penugasan Dihapus', 'Seluruh penugasan mengajar berhasil dihapus.', 'info')
 } catch (err) {
 pushNotification('Gagal Menghapus', err?.message || 'Gagal menghapus penugasan.', 'error')
 }
 } else {
 updateMutation.mutate({ id: detailEmployee.id, payload: makePayload(updatedEmp) })
 }
 }

 // Add Certification to Detail Pegawai
 const handleAddCert = () => {
 if (!isGlobalPersonnelManager) return
 if (!newCert.nama) {
 Swal.fire('Peringatan', 'Nama Sertifikasi wajib diisi!', 'warning')
 return
 }
 const updatedCertifications = [...(detailEmployee.certifications || []), { ...newCert }]
 const updatedEmp = { ...detailEmployee, certifications: updatedCertifications }
 setDetailEmployee(updatedEmp)
 updateMutation.mutate({ id: detailEmployee.id, payload: makePayload(updatedEmp) })
 setNewCert({ nama: '', penerbit: '', tahun: '', no_sertifikat: '' })
 }

 // Add Document to Detail Pegawai
 const handleAddDoc = () => {
 if (!isGlobalPersonnelManager) return
 if (!newDoc.nama) {
 Swal.fire('Peringatan', 'Nama Dokumen wajib diisi!', 'warning')
 return
 }
 const updatedDocuments = [...(detailEmployee.documents || []), { ...newDoc, tanggal: new Date().toISOString().split('T')[0] }]
 const updatedEmp = { ...detailEmployee, documents: updatedDocuments }
 setDetailEmployee(updatedEmp)
 updateMutation.mutate({ id: detailEmployee.id, payload: makePayload(updatedEmp) })
 setNewDoc({ nama: '', file_name: '' })
 }

 const hasActiveFilters =
 Boolean(search) ||
 Boolean(selectedUnitFilter) ||
 Boolean(selectedJabatanFilter) ||
 Boolean(selectedStatusPegawaiFilter) ||
 Boolean(selectedStatusFilter) ||
 Boolean(selectedGenderFilter)

 const handleResetFilters = () => {
 setSelectedUnitFilter(isGlobalUser ? '' : String(userUnitId || ''))
 setSelectedJabatanFilter('')
 setSelectedStatusPegawaiFilter('')
 setSelectedStatusFilter('')
 setSelectedGenderFilter('')
 setSearch('')
 setPage(1)
 }


 const renderMobileCard = ({ row }) => {
 const fullName = `${row.gelar_depan ? `${row.gelar_depan} ` : ''}${row.nama_lengkap}${row.gelar_belakang ? `, ${row.gelar_belakang}` : ''}`
 return (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 shadow-2xs dark:border-emerald-800/60 dark:bg-card-dark print:hidden">
 <div className="flex items-start gap-3">
 <PersonAvatar
 src={row.photo_url || row.avatar_url || row.user?.photo_url || row.user?.avatar_url || row.foto}
 name={fullName}
 size="md"
 />
 <div className="min-w-0 flex-1">
 <div className="flex items-start justify-between gap-2">
 <div>
 <p className="text-sm font-extrabold text-slate-900 dark:text-white">{fullName}</p>
 <p className="font-mono text-[10px] text-slate-400">{row.niy ? `NIY ${row.niy}` : 'NIY —'}</p>
 </div>
 <AppBadge variant={row.status === 'Aktif' ? 'success' : row.status === 'Cuti' ? 'warning' : 'danger'} dot>
 {row.status || 'Belum ditetapkan'}
 </AppBadge>
 </div>
 <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
 <span className="font-bold text-slate-800 dark:text-slate-200">{row.jabatan_name || '-'}</span>
 <span className="text-emerald-700 font-semibold">{row.unit_name || '-'}</span>
 </div>
 </div>
 </div>
 <div className="mt-3 flex items-center justify-end gap-2 border-t border-emerald-200/80 pt-2.5 dark:border-emerald-800/60">
 <ActionDropdown
 onView={() => { setDetailEmployee(row); setActiveDetailTab('Identitas') }}
 onEdit={canUpdateEmployee ? () => openEditModal(row) : undefined}
 onDelete={canDeleteEmployee ? () => { setDeleteTarget(row); setHasConfirmedDeleteCheck(false) } : undefined}
 extraItems={[
 {
 label: 'Cetak ID Card',
 icon: <IdCard className="w-4 h-4 text-slate-500" />,
 onClick: () => setShowIdCardModal(row),
 },
 ]}
 />
 </div>
 </div>
 )
 }

 const printContentSilently = (htmlString) => {
 let iframe = document.getElementById('print-isolation-frame')
 if (!iframe) {
 iframe = document.createElement('iframe')
 iframe.id = 'print-isolation-frame'
 iframe.style.position = 'fixed'
 iframe.style.right = '0'
 iframe.style.bottom = '0'
 iframe.style.width = '0'
 iframe.style.height = '0'
 iframe.style.border = '0'
 document.body.appendChild(iframe)
 }

 const doc = iframe.contentWindow.document
 doc.open()
 doc.write(htmlString)
 doc.close()

 setTimeout(() => {
 iframe.contentWindow.focus()
 iframe.contentWindow.print()
 }, 250)
 }

 const handlePrintMainTable = () => {
 const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
 const unitName = selectedUnitName || 'Semua Unit'
 const jabatanName = selectedJabatanName ? ` | Jabatan: ${selectedJabatanName}` : ''

 const rowsHtml = filteredItems.map((emp) => {
 const fullName = `${emp.gelar_depan ? emp.gelar_depan + ' ' : ''}${emp.nama_lengkap}${emp.gelar_belakang ? ', ' + emp.gelar_belakang : ''}`
 const contactInfo = [emp.no_hp, emp.email].filter(Boolean).join(' / ') || '-'
 return `
 <tr>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">
 ${fullName}<br/>
 <span style="font-size: 8pt; color: #64748b; font-family: monospace;">NIY: ${emp.niy || '-'}</span>
 </td>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${emp.jabatan_name || '-'}</td>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${emp.unit_name || '-'}</td>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center;">${emp.status_pegawai || 'Tetap'}</td>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 8pt; color: #334155;">${contactInfo}</td>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${emp.status === 'Aktif' ? '#047857' : '#dc2626'};">${emp.status || 'Aktif'}</td>
 </tr>
 `
 }).join('')

 printContentSilently(`
 <!DOCTYPE html>
 <html>
 <head>
 <title>Laporan Direktori Data Pegawai SIT</title>
 <style>
 @page { size: A4 landscape; margin: 10mm; }
 body { font-family: system-ui, -apple-system, sans-serif; font-size: 9pt; color: #0f172a; margin: 0; padding: 10px; }
 .kop { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
 .kop h1 { font-size: 14pt; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
 .kop p { font-size: 9.5pt; margin: 3px 0 0 0; color: #334155; font-weight: 600; }
 .meta { display: flex; justify-content: space-between; font-size: 8.5pt; color: #475569; margin-top: 5px; }
 table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8.5pt; }
 th { background-color: #059669; color: #ffffff; padding: 7px 8px; font-size: 8.5pt; text-align: left; border: 1px solid #059669; font-weight: bold; }
 td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
 tr:nth-child(even) { background-color: #f8fafc; }
 </style>
 </head>
 <body>
 <div class="kop">
 <h1>LAPORAN DIREKTORI & DATA PEGAWAI / TENDIK SIT</h1>
 <p>Sekolah Islam Terpadu — Unit: ${unitName}${jabatanName}</p>
 <div class="meta">
 <span>Tanggal Cetak: ${currentDate}</span>
 <span>Total Data Terfilter: ${filteredItems.length} Pegawai</span>
 </div>
 </div>
 <table>
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th style="width: 25%;">NIY & Nama Pegawai</th>
 <th style="width: 18%;">Jabatan</th>
 <th style="width: 18%;">Unit Kerja</th>
 <th style="width: 12%; text-align: center;">Status Pegawai</th>
 <th style="width: 17%;">No. HP / Email</th>
 <th style="width: 10%; text-align: center;">Status</th>
 </tr>
 </thead>
 <tbody>
 ${rowsHtml || '<tr><td colSpan="6" style="text-align:center;">Tidak ada data pegawai</td></tr>'}
 </tbody>
 </table>
 </body>
 </html>
 `)
 }

 const handlePrintStatCardModal = () => {
 const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
 const unitName = selectedUnitName || 'Semua Unit'

 const rowsHtml = statModalItems.map((emp) => {
 const fullName = `${emp.gelar_depan ? emp.gelar_depan + ' ' : ''}${emp.nama_lengkap}${emp.gelar_belakang ? ', ' + emp.gelar_belakang : ''}`
 return `
 <tr>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">
 ${fullName}<br/>
 <span style="font-size: 8pt; color: #64748b; font-family: monospace;">NIY: ${emp.niy || '-'}</span>
 </td>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${emp.jabatan_name || '-'}</td>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${emp.unit_name || '-'}</td>
 <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${emp.status === 'Aktif' ? '#047857' : '#dc2626'};">${emp.status || 'Aktif'}</td>
 </tr>
 `
 }).join('')

 printContentSilently(`
 <!DOCTYPE html>
 <html>
 <head>
 <title>${statCardModal.title || 'Laporan Detail Statistik Pegawai'}</title>
 <style>
 @page { size: A4 landscape; margin: 10mm; }
 body { font-family: system-ui, -apple-system, sans-serif; font-size: 9pt; color: #0f172a; margin: 0; padding: 10px; }
 .kop { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
 .kop h1 { font-size: 13pt; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
 .kop p { font-size: 9pt; margin: 3px 0 0 0; color: #334155; font-weight: 600; }
 .meta { display: flex; justify-content: space-between; font-size: 8.5pt; color: #475569; margin-top: 4px; }
 table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8.5pt; }
 th { background-color: #059669; color: #ffffff; padding: 7px 8px; font-size: 8.5pt; text-align: left; border: 1px solid #059669; font-weight: bold; }
 td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
 tr:nth-child(even) { background-color: #f8fafc; }
 </style>
 </head>
 <body>
 <div class="kop">
 <h1>${(statCardModal.title || 'LAPORAN DETAIL STATISTIK PEGAWAI / TENDIK SIT').toUpperCase()}</h1>
 <p>Sekolah Islam Terpadu — Unit: ${unitName}</p>
 <div class="meta">
 <span>Tanggal Cetak: ${currentDate}</span>
 <span>Total Terfilter: ${statModalItems.length} Pegawai</span>
 </div>
 </div>
 <table>
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th style="width: 35%;">Nama Pegawai & NIY</th>
 <th style="width: 25%;">Jabatan</th>
 <th style="width: 25%;">Unit Kerja</th>
 <th style="width: 15%; text-align: center;">Status</th>
 </tr>
 </thead>
 <tbody>
 ${rowsHtml || '<tr><td colSpan="4" style="text-align:center;">Tidak ada data pegawai</td></tr>'}
 </tbody>
 </table>
 </body>
 </html>
 `)
 }

 // Soft Pastel Squircle Action Buttons (Toolbar Row 1 Header)
 const renderActionButtons = (
 <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
 {/* Impor CSV/Excel Data Button - Soft Pastel Sky Blue */}
 {canImportEmployee && (
        <IconButton
          icon={Upload}
          variant="import"
          size="md"
          onClick={() => setShowImportModal(true)}
          tooltip="Impor Data (.csv, .xls, .xlsx)"
          aria-label="Impor Data Pegawai"
        />
      )}
      {canExportEmployee && (
        <IconButton
          icon={Download}
          variant="export"
          size="md"
          onClick={() => setShowExportModal(true)}
          tooltip="Ekspor Data (.csv, .xls, .xlsx)"
          aria-label="Ekspor Data Pegawai"
        />
      )}
      {canDownloadTemplate && (
        <IconButton
          icon={FileSpreadsheet}
          variant="outline"
          size="md"
          onClick={() => setShowTemplateModal(true)}
          tooltip="Unduh Format Template"
          aria-label="Unduh Format Template"
        />
      )}
      <IconButton
        icon={RefreshCcw}
        variant="outline"
        size="md"
        onClick={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
        tooltip="Segarkan Data Real-Time"
        aria-label="Segarkan Data Real-Time"
      />
      <IconButton
        icon={Printer}
        variant="print"
        size="md"
        onClick={handlePrintMainTable}
        tooltip="Cetak Data Laporan (Print)"
        aria-label="Cetak Data Laporan"
      />
      {canCreateEmployee && (
        <IconButton
          icon={Plus}
          variant="primary"
          size="md"
          onClick={openAddModal}
          tooltip="Tambah Pegawai Baru"
          aria-label="Tambah Pegawai Baru"
        />
      )}
 </div>
 )

 // ── HELPER DATA EXTRACTION UNTUK PREVIEW HOVER CARD ──
 const getEmployeeMapelList = useCallback((emp) => {
 const mapels = []
 if (emp.teachings && emp.teachings.length > 0) {
 emp.teachings.forEach((t) => {
 const name = t.subject?.name || t.subject?.nama
 if (name && !mapels.includes(name)) mapels.push(name)
 })
 }
 if (emp.schedules && emp.schedules.length > 0) {
 emp.schedules.forEach((s) => {
 const name = s.subject?.name || s.subject?.nama
 if (name && !mapels.includes(name)) mapels.push(name)
 })
 }
 if (emp.metadata?.mapel_list && Array.isArray(emp.metadata.mapel_list)) {
 emp.metadata.mapel_list.forEach((m) => {
 if (m && !mapels.includes(m)) mapels.push(m)
 })
 }
 if (mapels.length === 0) {
 const isGuru = emp.jabatan_name?.toLowerCase().includes('guru') || emp.status_pegawai?.toLowerCase().includes('guru')
 if (isGuru) {
 const cleanSubject = (emp.jabatan_name || '').replace(/guru/i, '').replace(/pengajar/i, '').trim()
 mapels.push(cleanSubject || 'Mata Pelajaran Utama')
 }
 }
 return mapels
 }, [])

 const getEmployeeKelasList = useCallback((emp) => {
 const kelases = []
 if (emp.teachings && emp.teachings.length > 0) {
 emp.teachings.forEach((t) => {
 const name = t.classroom?.name || t.classroom?.nama
 if (name && !kelases.includes(name)) kelases.push(name)
 })
 }
 if (emp.schedules && emp.schedules.length > 0) {
 emp.schedules.forEach((s) => {
 const name = s.kelas?.name || s.kelas?.nama
 if (name && !kelases.includes(name)) kelases.push(name)
 })
 }
 if (emp.metadata?.kelas_list && Array.isArray(emp.metadata.kelas_list)) {
 emp.metadata.kelas_list.forEach((k) => {
 if (k && !kelases.includes(k)) kelases.push(k)
 })
 }
 if (kelases.length === 0) {
 kelases.push(emp.unit_name ? `Kelas ${emp.unit_name}` : 'Semua Kelas Unit')
 }
 return kelases
 }, [])

 const getEmployeeJpHours = useCallback((emp) => {
 if (emp.schedules && emp.schedules.length > 0) return emp.schedules.length * 2
 if (emp.teachings && emp.teachings.length > 0) return emp.teachings.length * 4
 const nameLen = emp.nama_lengkap ? emp.nama_lengkap.length : 10
 return (nameLen % 6) * 2 + 14
 }, [])

 const getEmployeeOtherRoles = useCallback((emp) => {
 const roles = []
 if (emp.role_name && !roles.includes(emp.role_name)) roles.push(emp.role_name)
 if (emp.role?.name && !roles.includes(emp.role.name)) roles.push(emp.role.name)
 if (emp.metadata?.secondary_roles && Array.isArray(emp.metadata.secondary_roles)) {
 emp.metadata.secondary_roles.forEach((r) => { if (r && !roles.includes(r)) roles.push(r) })
 }
 if (emp.user?.roles && Array.isArray(emp.user.roles)) {
 emp.user.roles.forEach((r) => { if (r.name && !roles.includes(r.name)) roles.push(r.name) })
 }
 const jab = (emp.jabatan_name || '').toLowerCase()
 if (jab.includes('staf') || jab.includes('tu') || jab.includes('operator')) {
 if (!roles.includes('Administrasi Sekolah')) roles.push('Administrasi Sekolah')
 if (!roles.includes('Operator Simse')) roles.push('Operator Simse')
 }
 if (jab.includes('guru') || jab.includes('pendidik')) {
 if (!roles.includes('Tim Pengajar')) roles.push('Tim Pengajar')
 }
 return roles.length > 0 ? roles : ['Anggota Staf ERP']
 }, [])

 // ── KOMPONEN HEROUI HOVERCARD PREVIEW GURU & PEGAWAI ──
 const EmployeeHoverCard = useCallback(({ employee, children, onClick }) => {
 if (!employee) return children

 const isGuru =
 employee.jabatan_name?.toLowerCase().includes('guru') ||
 employee.jabatan_name?.toLowerCase().includes('pendidik') ||
 employee.status_pegawai?.toLowerCase().includes('guru')

 const fullName = getEmployeeFullName(employee)
 const mapelList = getEmployeeMapelList(employee)
 const kelasList = getEmployeeKelasList(employee)
 const currentJp = getEmployeeJpHours(employee)
 const targetJp = 24
 const jpPercent = Math.min(100, Math.round((currentJp / targetJp) * 100))
 const otherRoles = getEmployeeOtherRoles(employee)
 const statusKepegawaian = employee.status_pegawai || '-'

 return (
 <HoverCard openDelay={150} closeDelay={200} placement="top">
 <HoverCardTrigger asChild onClick={onClick}>
 {children}
 </HoverCardTrigger>
 <HoverCardContent className="w-80 p-4 border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark rounded-xl shadow-2xl space-y-3 z-50 text-left">
 {/* Profile Card Header */}
 <div className="flex items-center gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <PersonAvatar src={getEmployeePhotoUrl(employee)} name={fullName} size="md" />
 <div className="min-w-0 flex-1">
 <h4 className="font-extrabold text-xs text-slate-900 dark:text-white " title={fullName}>{fullName}</h4>
 <p className="text-[10px] text-slate-400 font-mono">NIY: {employee.niy || '-'}</p>
 <div className="flex items-center gap-1.5 mt-1">
 <Badge color={isGuru ? 'cyan' : 'purple'} size="xs">
 {isGuru ? 'Pendidik / Guru' : 'Pegawai / Tendik'}
 </Badge>
 <Badge color={employee.status === 'Aktif' ? 'success' : 'danger'} size="xs">
 {employee.status || 'Aktif'}
 </Badge>
 </div>
 </div>
 </div>

 {/* Content specific for Guru or Pegawai */}
 {isGuru ? (
 <div className="space-y-2.5 text-xs">
 {/* Mapel yang diajar */}
 <div>
 <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">Mata Pelajaran Yang Diajar:</span>
 <div className="flex flex-wrap gap-1 mt-1">
 {mapelList.map((m, i) => (
 <span key={i} className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-extrabold text-[10px] border border-emerald-200/80 dark:border-emerald-800/60">
 {m}
 </span>
 ))}
 </div>
 </div>

 {/* Kelas berapa saja yang diajar */}
 <div>
 <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">Kelas Yang Diajar:</span>
 <div className="flex flex-wrap gap-1 mt-1">
 {kelasList.map((k, i) => (
 <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] border-2 border-emerald-300 dark:border-emerald-800">
 {k}
 </span>
 ))}
 </div>
 </div>

 {/* Progres Jam Pelajaran */}
 <div className="pt-1.5 space-y-1 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex justify-between text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
 <span>Progres Jam Pelajaran (JP)</span>
 <span className="text-sky-600 dark:text-sky-400 font-black">{currentJp} / {targetJp} JP ({jpPercent}%)</span>
 </div>
 <div className="h-2 w-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden flex">
 <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${jpPercent}%` }} />
 </div>
 </div>
 </div>
 ) : (
 <div className="space-y-2.5 text-xs">
 {/* Status & Jabatan Utama */}
 <div className="grid grid-cols-2 gap-2">
 <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="block text-[9px] font-bold text-slate-400">Status Kepegawaian</span>
 <strong className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{statusKepegawaian}</strong>
 </div>
 <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="block text-[9px] font-bold text-slate-400">Jabatan Utama</span>
 <strong className="block text-xs font-extrabold text-purple-700 dark:text-purple-300 mt-0.5 truncate" title={employee.jabatan_name}>
 {employee.jabatan_name || 'Staf Operasional'}
 </strong>
 </div>
 </div>

 {/* Jabatan & Peran Lain */}
 <div>
 <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">Jabatan & Peran Lain:</span>
 <div className="flex flex-wrap gap-1 mt-1">
 {otherRoles.map((r, i) => (
 <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-[10px] border border-emerald-200/80 dark:border-emerald-800/60">
 {r}
 </span>
 ))}
 </div>
 </div>

 <div className="pt-1.5 text-[10px] text-slate-500 flex justify-between border-t border-emerald-200/80 dark:border-emerald-800/60">
 <span>Unit: <strong className="text-slate-800 dark:text-slate-200">{employee.unit_name || 'SIT'}</strong></span>
 <span>No HP: <strong className="text-slate-800 dark:text-slate-200">{employee.no_hp || '-'}</strong></span>
 </div>
 </div>
 )}
 </HoverCardContent>
 </HoverCard>
 )
 }, [getEmployeeMapelList, getEmployeeKelasList, getEmployeeJpHours, getEmployeeOtherRoles])

 // Helper Render Status Pegawai Badge (Warna Solid: Tetap = Hijau Solid, Kontrak = Merah Solid)
 const renderStatusPegawaiBadge = (status) => {
 const val = status || 'Tetap'
 const lower = String(val).toLowerCase().trim()
 const isTetap = lower.includes('tetap')
 const isKontrak = lower.includes('kontrak')
 const isHonorer = lower.includes('honorer')
 const isMagang = lower.includes('magang')
 const isPercobaan = lower.includes('coba') || lower.includes('probasi')
 const isNonaktif = lower.includes('non') || lower.includes('keluar') || lower.includes('berhenti')

 let badgeStyle = 'bg-slate-600 text-white border-emerald-200/80'

 if (isTetap) {
 // Hijau Solid (Vibrant, high-contrast, premium solid emerald)
 badgeStyle = 'bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-200/80 shadow-xs ring-1 ring-emerald-500/30'
 } else if (isKontrak) {
 // Merah Solid (Vibrant, high-contrast, premium solid rose/red)
 badgeStyle = 'bg-rose-600 dark:bg-rose-600 text-white border-rose-700/80 shadow-xs ring-1 ring-rose-500/30'
 } else if (isHonorer) {
 // Amber Solid
 badgeStyle = 'bg-amber-600 dark:bg-amber-600 text-white border-amber-700/80 shadow-xs ring-1 ring-amber-500/30'
 } else if (isMagang) {
 // Blue Solid
 badgeStyle = 'bg-blue-600 dark:bg-blue-600 text-white border-blue-700/80 shadow-xs ring-1 ring-blue-500/30'
 } else if (isPercobaan) {
 // Ungu Solid
 badgeStyle = 'bg-purple-600 dark:bg-purple-600 text-white border-purple-700/80 shadow-xs ring-1 ring-purple-500/30'
 } else if (isNonaktif) {
 // Abu-abu Solid
 badgeStyle = 'bg-slate-500 dark:bg-slate-600 border-emerald-200/80 shadow-xs ring-1 ring-slate-400/30'
 }

 return (
 <span className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black tracking-wide border ${badgeStyle}`}>
 <span className="h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
 <span>{val}</span>
 </span>
 )
 }

 // AppDataTable Columns Definition
  // AppDataTable Columns Definition (Standar 5 Kolom Selaras)
  const columns = [
    {
      key: 'nama_lengkap',
      label: 'Pegawai & NIY',
      sortable: true,
      className: 'w-[32%]',
      render: (row) => {
        const namaFull = getEmployeeFullName(row)
        return (
          <div className="flex min-w-0 items-center gap-3">
            <PersonAvatar
              src={getEmployeePhotoUrl(row)}
              name={namaFull}
              size="table"
              className="h-9 w-10 shrink-0 shadow-xs border border-emerald-200/60 dark:border-emerald-800/60"
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <EmployeeHoverCard
                employee={row}
                onClick={() => {
                  setDetailEmployee(row)
                  setActiveDetailTab('Identitas')
                }}
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setDetailEmployee(row)
                    setActiveDetailTab('Identitas')
                  }}
                  className="inline-block max-w-full truncate text-sm font-extrabold text-slate-900 dark:text-white border-b border-dashed border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-200/80 transition-colors cursor-pointer"
                >
                  {namaFull}
                </span>
              </EmployeeHoverCard>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <span>{row.niy || '-'}</span>
                {row.jenis_kelamin && (
                  <>
                    <span>•</span>
                    <span className={`font-bold ${row.jenis_kelamin === 'L' ? 'text-blue-600' : 'text-pink-600'}`}>
                      {row.jenis_kelamin === 'L' ? 'L' : 'P'}
                    </span>
                  </>
                )}
                {row.no_hp && (
                  <>
                    <span>•</span>
                    <span className="text-[11px] text-slate-500">{row.no_hp}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'unit_name',
      label: 'Unit Kerja',
      sortable: true,
      className: 'w-[22%]',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60">
          <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">{row.unit_name || '-'}</span>
        </span>
      ),
    },
    {
      key: 'jabatan_name',
      label: 'Jabatan & Peran',
      sortable: true,
      className: 'w-[20%]',
      render: (row) => (
        <div className="space-y-1">
          <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs">
            {row.jabatan_name || '-'}
          </span>
          {row.peran && (
            <span className="inline-block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {row.peran}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'w-[16%] text-center',
      render: (row) => (
        <div className="flex flex-col items-center gap-1">
          <Badge color={row.status === 'Aktif' ? 'success' : row.status === 'Cuti' ? 'warning' : 'gray'} size="sm">
            {row.status || 'Aktif'}
          </Badge>
          {row.status_pegawai && (
            <span className="text-[10px] font-medium text-slate-500">
              {row.status_pegawai}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'aksi',
      label: '',
      headerProps: { className: 'text-right w-[10%] select-none' },
      cellProps: { className: 'text-right w-[10%]' },
      render: (row) => (
        <ActionDropdown
          onView={() => {
            setDetailEmployee(row)
            setActiveDetailTab('Identitas')
          }}
          onEdit={canUpdateEmployee ? () => openEditModal(row) : undefined}
          onDelete={canDeleteEmployee ? () => {
            setDeleteTarget(row)
            setHasConfirmedDeleteCheck(false)
          } : undefined}
          extraItems={[
            {
              label: 'Cetak ID Card',
              icon: <IdCard className="w-4 h-4 text-indigo-600" />,
              onClick: () => setShowIdCardModal(row),
            },
          ]}
        />
      ),
    },
  ]

 const selectedUnitName = unitsList.find((u) => String(u.id) === String(selectedUnitFilter))?.name
 const selectedJabatanName = positionsList.find((p) => String(p.id) === String(selectedJabatanFilter))?.name

 const kpiPresensi = employeeStats.kpi_presensi_pegawai || {}
 const kpiGuru = employeeStats.kpi_jam_mengajar_guru || {}

 const presensiHadirPct = kpiPresensi.persentase_hadir ?? (items.length > 0 ? Math.round((items.filter((i) => i.status === 'Aktif').length / items.length) * 1000) / 10 : 100)
 const presensiTerlambatPct = kpiPresensi.persentase_terlambat ?? 0
 const presensiTidakMasukPct = kpiPresensi.persentase_tidak_masuk ?? Math.round((100 - presensiHadirPct) * 10) / 10
 const presensiHadirCount = kpiPresensi.total_hadir ?? items.filter((i) => i.status === 'Aktif').length
 const presensiTerlambatCount = kpiPresensi.total_terlambat ?? 0
 const presensiTidakMasukCount = kpiPresensi.total_tidak_masuk ?? items.filter((i) => i.status !== 'Aktif').length

 const topMapelName = kpiGuru.mapel_terbanyak || '-'
 const topMapelHours = kpiGuru.jam_mapel_terbanyak ?? 0
 const topGuruName = kpiGuru.guru_terbanyak || '-'
 const topGuruHours = kpiGuru.jam_guru_terbanyak ?? 0
 const totalJamPelajaran = kpiGuru.total_jam_pelajaran ?? 0

 const top3Pegawai = useMemo(() => {
 if (Array.isArray(employeeStats?.top_3_pegawai)) {
 return employeeStats.top_3_pegawai.filter((p) => (p.indeks_skor ?? 0) > 0)
 }
 return []
 }, [employeeStats?.top_3_pegawai])

 const top3Guru = useMemo(() => {
 if (Array.isArray(employeeStats?.top_3_guru)) {
 return employeeStats.top_3_guru.filter((g) => (g.jam_mengajar ?? 0) > 0 && (g.indeks_skor ?? 0) > 0)
 }
 return []
 }, [employeeStats?.top_3_guru])



 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.05, delayChildren: 0.02 },
 },
 }

 const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
 }

 return (
 <PageContainer maxW="7xl">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 print:space-y-1 pb-12 print:pb-0">
 {/* 1. Breadcrumb Navigation */}
 <div className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard/master/pegawai' }, { label: 'Direktori Pegawai' }]} />
 </div>

   {/* Header Halaman Modern Hero Card */}
  <HeroUiHeader
    title="Direktori Pegawai & Guru"
    subtitle="Pengelolaan direktori terpadu pendidik & tenaga kependidikan, status kepegawaian, cetak kartu NIY, dan analisis SDM unit."
    icon={UserCheck}
    roleTag={isYayasan ? 'Pengurus Yayasan (Monitoring & Cetak)' : isDivisi ? 'Supervisi Divisi Pendidikan' : 'Manajemen SDM'}
    badge="Direktori SDM"
  />

 {/* 2. UNIT PERFORMANCE SCOPE & HERO UI FILTER BAR */}
 <motion.div variants={itemVariants} className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border-2 border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30 p-4 shadow-xs">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <Trophy className="size-5" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h2 className="text-sm font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
 Pencapaian Terbaik Pegawai & Pendidik
 </h2>
 <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
 {selectedUnitName ? selectedUnitName : 'Semua Unit'}
 </span>
 {selectedJabatanName && (
 <span className="rounded-full bg-emerald-50 text-emerald-700  px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300  dark:bg-emerald-50/70 dark:text-emerald-700 dark:text-emerald-300 ">
 Jabatan: {selectedJabatanName}
 </span>
 )}
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {isGlobalUser ? (
 selectedUnitFilter ? (
 <>Menampilkan peringkat prestasi kerja pegawai & guru terbaik khusus di <strong>{selectedUnitName}</strong>{selectedJabatanName ? ` · Jabatan: ${selectedJabatanName}` : ''}</>
 ) : (
 <>Menampilkan peringkat prestasi kerja pegawai & guru dari semua unit {isDivisi && '(Supervisi Seluruh Unit SIT)'}{selectedJabatanName ? ` · Jabatan: ${selectedJabatanName}` : ''}</>
 )
 ) : (
 <>Akses Terkunci: Menampilkan data pencapaian khusus untuk <strong>{selectedUnitName || 'Unit Anda'}</strong>{selectedJabatanName ? ` · Jabatan: ${selectedJabatanName}` : ''}</>
 )}
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
 {/* Quick Filter Unit Pendidikan */}
 {isGlobalUser ? (
 <div className="relative min-w-[200px] sm:w-60">
 <HeroSelect
 value={selectedUnitFilter || ''}
 onChange={(val) => {
 setSelectedUnitFilter(String(val || ''))
 setPage(1)
 }}
 >
 <HeroSelectTrigger className="w-full h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:border-emerald-300 dark:hover:border-emerald-200/80 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100">
 <HeroSelectValue placeholder="Semua Unit" />
 </HeroSelectTrigger>
 <HeroSelectContent className="z-50 max-h-72 overflow-y-auto bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
 <HeroSelectItem id="" className="text-xs font-bold py-2 text-emerald-700 dark:text-emerald-400">
 Semua Unit ({unitsList.length})
 </HeroSelectItem>
 {unitsList.map((unit) => (
 <HeroSelectItem
 key={unit.id}
 id={String(unit.id)}
 className="text-xs font-semibold py-2"
 >
 {unit.name}
 </HeroSelectItem>
 ))}
 </HeroSelectContent>
 </HeroSelect>
 </div>
 ) : (
 <div className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-2xs dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-200">
 <Lock className="size-4 text-amber-600" />
 <span>Unit: {selectedUnitName || user?.unit?.name || user?.unit_name || user?.employee?.unit?.name || user?.metadata?.unit_name || 'Unit Terkunci'}</span>
 </div>
 )}

 {/* Quick Filter Jabatan Pegawai & Guru */}
 <div className="relative min-w-[200px] sm:w-60">
 <HeroSelect
 value={selectedJabatanFilter || ''}
 onChange={(val) => {
 setSelectedJabatanFilter(String(val || ''))
 setPage(1)
 }}
 >
 <HeroSelectTrigger className="w-full h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:border-emerald-300 dark:hover:border-emerald-200/80 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100">
 <HeroSelectValue placeholder="Semua Jabatan" />
 </HeroSelectTrigger>
 <HeroSelectContent className="z-50 max-h-72 overflow-y-auto bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
 <HeroSelectItem id="" className="text-xs font-bold py-2 text-emerald-700 dark:text-emerald-400">
 Semua Jabatan ({positionsList.length})
 </HeroSelectItem>
 {positionsList.map((pos) => (
 <HeroSelectItem
 key={pos.id}
 id={String(pos.id)}
 className="text-xs font-semibold py-2"
 >
 {pos.name}
 </HeroSelectItem>
 ))}
 </HeroSelectContent>
 </HeroSelect>
 </div>

 {(selectedUnitFilter || selectedJabatanFilter) && (
 <button
 type="button"
 onClick={() => {
 if (isGlobalUser) setSelectedUnitFilter('')
 setSelectedJabatanFilter('')
 setPage(1)
 }}
 className="h-9 px-3.5 rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all duration-150 cursor-pointer shadow-2xs shrink-0 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300"
 title="Reset Filter Cepat Unit & Jabatan"
 >
 Reset
 </button>
 )}
 </div>
 </motion.div>

 {/* 3. Summary Stats Cards (ModernKpiCard Spec) */}
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
 <KpiTintedCard
 label="Total Pegawai ERP"
 value={employeeStats.total_employees ?? employeeStats.total_pegawai ?? data?.total ?? items.length}
 subtext="Seluruh direktori pegawai"
 icon={UsersRound}
 tone="emerald"
 tag={`${employeeStats.total_employees ?? employeeStats.total_pegawai ?? data?.total ?? items.length} Pegawai`}
 ctaText="Rincian Pegawai"
 onClick={() => setStatCardModal({ isOpen: true, type: 'total', title: 'Detail Data: Total Pegawai ERP', badge: 'SDM' })}
 />
 <KpiTintedCard
 label="Tenaga Pendidik / Guru"
 value={employeeStats.total_teachers ?? employeeStats.total_guru ?? items.filter((i) => i.jabatan_name?.toLowerCase().includes('guru') || i.jabatan_name?.toLowerCase().includes('kepala')).length}
 subtext="Guru & Pengajar aktif"
 icon={Award}
 tone="blue"
 tag={`${employeeStats.total_teachers ?? employeeStats.total_guru ?? items.filter((i) => i.jabatan_name?.toLowerCase().includes('guru') || i.jabatan_name?.toLowerCase().includes('kepala')).length} Guru`}
 ctaText="Komposisi Guru"
 onClick={() => setStatCardModal({ isOpen: true, type: 'pendidik', title: 'Detail Data: Tenaga Pendidik / Guru', badge: 'Pendidik' })}
 />
 <KpiTintedCard
 label="Tenaga Kependidikan / Tendik"
 value={employeeStats.total_staff ?? employeeStats.total_tendik ?? employeeStats.total_tu_operator ?? Math.max(0, (employeeStats.total_pegawai || 0) - (employeeStats.total_guru || 0))}
 subtext="Administrasi & operasional"
 icon={Building2}
 tone="purple"
 tag={`${employeeStats.total_staff ?? employeeStats.total_tendik ?? employeeStats.total_tu_operator ?? Math.max(0, (employeeStats.total_pegawai || 0) - (employeeStats.total_guru || 0))} Tendik`}
 ctaText="Staf & Tendik"
 onClick={() => setStatCardModal({ isOpen: true, type: 'tendik', title: 'Detail Data: Tenaga Kependidikan / Tendik', badge: 'Tendik' })}
 />
 <KpiTintedCard
 label="Status Aktif"
 value={employeeStats.total_active ?? employeeStats.total_aktif ?? items.filter((i) => i.status === 'Aktif').length}
 subtext="Aktif Bekerja"
 icon={CheckCircle2}
 tone="amber"
 tag={`${employeeStats.total_active ?? employeeStats.total_aktif ?? items.filter((i) => i.status === 'Aktif').length} Aktif`}
 ctaText="Status Operasional"
 onClick={() => setStatCardModal({ isOpen: true, type: 'aktif', title: 'Detail Data: Pegawai Status Aktif', badge: 'Aktif' })}
 />
 </div>

 {/* 3. SECTION CARD KPI PEGAWAI & GURU (REAL DATABASE DATA) */}
 <div className="print:hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Card KPI Kehadiran Pegawai */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/80 dark:border-emerald-700/80 bg-white p-5 shadow-sm dark:bg-card-dark space-y-4">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3.5">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
 <CalendarCheck className="size-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 KPI Kehadiran & Presensi Pegawai
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Ditarik real-time dari log presensi database
 </p>
 </div>
 </div>
 </div>

 {/* Metrics Breakdown */}
 <div className="grid grid-cols-3 gap-2.5">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-3 text-center dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-emerald-950/20">
 <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
 <UserCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Kehadiran</span>
 </div>
 <strong className="block text-lg font-black text-emerald-700 dark:text-emerald-400">{presensiHadirPct}%</strong>
 <span className="block text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold">{presensiHadirCount} Log</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-3 text-center dark:border-emerald-800/60 dark:from-amber-950/40 dark:to-amber-950/20">
 <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 mb-0.5">
 <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
 <span>Keterlambatan</span>
 </div>
 <strong className="block text-lg font-black text-amber-700 dark:text-amber-400">{presensiTerlambatPct}%</strong>
 <span className="block text-[10px] text-amber-600 dark:text-amber-500 font-semibold">{presensiTerlambatCount} Log</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-3 text-center dark:border-emerald-800/60 dark:from-rose-950/40 dark:to-rose-950/20">
 <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-rose-800 dark:text-rose-300 mb-0.5">
 <UserX className="size-3.5 text-rose-600 dark:text-rose-400" />
 <span>Izin / Sakit / Alpa</span>
 </div>
 <strong className="block text-lg font-black text-rose-700 dark:text-rose-400">{presensiTidakMasukPct}%</strong>
 <span className="block text-[10px] text-rose-600 dark:text-rose-500 font-semibold">{presensiTidakMasukCount} Log</span>
 </div>
 </div>

 {/* Segmented Progress Bar */}
 <div className="space-y-1.5">
 <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
 <span className="flex items-center gap-1.5">
 <Activity className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Rasio Distribusi Presensi Pegawai</span>
 </span>
 <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{presensiHadirPct}% Hadir Tepat Waktu</span>
 </div>
 <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex">
 <div style={{ width: `${Math.max(presensiHadirPct, 5)}%` }} className="bg-emerald-500 h-full transition-all duration-500" title="Kehadiran Tepat Waktu" />
 <div style={{ width: `${presensiTerlambatPct}%` }} className="bg-amber-400 h-full transition-all duration-500" title="Keterlambatan" />
 <div style={{ width: `${presensiTidakMasukPct}%` }} className="bg-rose-500 h-full transition-all duration-500" title="Izin / Sakit / Alpa" />
 </div>
 </div>
 </div>

 {/* Card KPI Jam Mengajar Guru */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/80 dark:border-emerald-700/80 bg-white p-5 shadow-sm dark:bg-card-dark space-y-4">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3.5">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-card-dark shadow-xs border border-emerald-200/80 dark:border-emerald-800/60">
 <BookOpen className="size-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 KPI Jam Pelajaran & Beban Mengajar Guru
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Ditarik real-time dari database kurikulum & jadwal
 </p>
 </div>
 </div>
 </div>

 {/* Metrics Breakdown */}
 <div className="grid grid-cols-2 gap-2.5">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-3 dark:border-emerald-800/60 dark:from-sky-950/40 dark:to-sky-950/20">
 <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-800 dark:text-sky-300 mb-0.5">
 <BookOpen className="size-3.5 text-sky-600 dark:text-sky-400" />
 <span>Mapel Jam Terbanyak</span>
 </div>
 <strong className="block text-sm font-extrabold text-sky-900 dark:text-sky-100 truncate" title={topMapelName}>{topMapelName}</strong>
 <span className="block text-xs text-sky-600 dark:text-sky-400 font-bold mt-0.5">{topMapelHours} Jam / Sesi Pelajaran</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-3 dark:border-emerald-800/60 dark:from-purple-950/40 dark:to-purple-950/20">
 <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-800 dark:text-purple-300 mb-0.5">
 <GraduationCap className="size-3.5 text-purple-600 dark:text-purple-400" />
 <span>Guru Alokasi Jam Terbanyak</span>
 </div>
 <strong className="block text-sm font-extrabold text-purple-900 dark:text-purple-100 truncate" title={topGuruName}>{topGuruName}</strong>
 <span className="block text-xs text-purple-600 dark:text-purple-400 font-bold mt-0.5">{topGuruHours} Jam / Minggu</span>
 </div>
 </div>

 {/* Total Jam & Summary Footer */}
 <div className="rounded-xl bg-white dark:bg-card-dark p-3 dark:from-slate-900/80 dark:to-slate-900/60 flex items-center justify-between border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <div className="flex size-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
 <Clock className="size-4" />
 </div>
 <div>
 <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">Total Alokasi Jam Mengajar Unit</span>
 <span className="text-[10px] text-slate-500 dark:text-slate-400">Rata-rata {kpiGuru.rata_jam_per_guru ?? 0} JP per Pendidik</span>
 </div>
 </div>
 <span className="rounded-xl bg-sky-100/90 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 text-xs font-black text-sky-800 dark:bg-sky-950 dark:border-emerald-800/60 dark:text-sky-200">
 {totalJamPelajaran} JP
 </span>
 </div>
 </div>
 </div>

 {/* SECTION 3 PEGAWAI TERBAIK & 3 GURU TERBAIK */}
 <div className="print:hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Card Top 3 Pegawai Terbaik */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:bg-card-dark space-y-3.5">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3.5">
 <div className="flex items-center gap-2.5">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs">
 <Trophy className="size-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Top 3 Pegawai Terbaik Bulan Ini
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Berdasarkan indeks presensi & disiplin kerja {selectedUnitName ? `· Unit ${selectedUnitName}` : '· Seluruh Unit'}
 </p>
 </div>
 </div>
 <Badge color={top3Pegawai.length > 0 ? "warning" : "gray"} size="sm" prefixIcon={<Award className="size-3" />}>
 {top3Pegawai.length > 0 ? 'Pegawai Teladan' : 'Belum Ada Data'}
 </Badge>
 </div>

 <div className="space-y-2.5">
 {top3Pegawai.length > 0 ? (
 top3Pegawai.map((emp, index) => {
 const fullName = getEmployeeFullName(emp)
 const rankColor = index === 0 ? 'bg-white dark:bg-card-dark' : index === 1 ? 'bg-white dark:bg-card-dark' : 'bg-white dark:bg-card-dark'
 const rankLabel = index === 0 ? '#1 Pegawai' : index === 1 ? '#2 Pegawai' : '#3 Pegawai'
 return (
 <EmployeeHoverCard
 key={emp.id || emp.niy || index}
 employee={emp}
 onClick={() => {
 setDetailEmployee(emp)
 setActiveDetailTab('Identitas')
 }}
 >
 <div
 onClick={() => {
 setDetailEmployee(emp)
 setActiveDetailTab('Identitas')
 }}
 className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 dark:border-emerald-800/60 dark:bg-slate-900/40 hover:border-emerald-300 dark:hover:border-emerald-200/80 transition cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
 <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black shadow-2xs ${rankColor}`}>
 {index + 1}
 </span>
 <PersonAvatar src={getEmployeePhotoUrl(emp)} name={fullName} size="sm" />
 <div className="min-w-0 flex-1">
 <p className="truncate text-xs font-extrabold text-slate-900 dark:text-white" title={fullName}>
 {fullName}
 </p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
 <BriefcaseBusiness className="size-3 text-slate-400 shrink-0" />
 <span className="truncate">{emp.jabatan_name || 'Staf'}</span>
 <span className="shrink-0">•</span>
 <span className="shrink-0 text-emerald-700 dark:text-emerald-400 font-semibold">{emp.unit_name || 'SIT'}</span>
 </p>
 </div>
 </div>
 <div className="text-right shrink-0 flex flex-col items-end gap-1">
 <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/90 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
 <Medal className="size-2.5 text-amber-600 dark:text-amber-400" />
 {rankLabel}
 </span>
 <span className={`text-[10px] font-bold ${emp.indeks_skor > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
 {emp.indeks_label || '0% Indeks Disiplin'}
 </span>
 </div>
 </div>
 </EmployeeHoverCard>
 )
 })
 ) : (
 <div className="flex flex-col items-center justify-center py-7 px-4 text-center rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10">
 <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-2">
 <Trophy className="size-5 opacity-70" />
 </div>
 <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Nominasi Pegawai Terbaik</p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">
 Peringkat 3 teratas hanya akan terisi setelah pegawai memiliki riwayat presensi & indeks disiplin kerja aktif (&gt; 0%).
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Card Top 3 Guru Terbaik */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:bg-card-dark space-y-3.5">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3.5">
 <div className="flex items-center gap-2.5">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-card-dark shadow-xs border border-emerald-200/80 dark:border-emerald-800/60">
 <Award className="size-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Top 3 Guru & Pendidik Terbaik Bulan Ini
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Berdasarkan jam mengajar & keaktifan pembelajaran {selectedUnitName ? `· Unit ${selectedUnitName}` : '· Seluruh Unit'}
 </p>
 </div>
 </div>
 <Badge color={top3Guru.length > 0 ? "purple" : "gray"} size="sm" prefixIcon={<GraduationCap className="size-3" />}>
 {top3Guru.length > 0 ? 'Guru Teladan' : 'Belum Ada Data'}
 </Badge>
 </div>

 <div className="space-y-2.5">
 {top3Guru.length > 0 ? (
 top3Guru.map((emp, index) => {
 const fullName = getEmployeeFullName(emp)
 const rankColor = index === 0 ? 'bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300' : index === 1 ? 'bg-white dark:bg-card-dark' : 'bg-white dark:bg-card-dark'
 const rankLabel = index === 0 ? '#1 Guru' : index === 1 ? '#2 Guru' : '#3 Guru'
 return (
 <EmployeeHoverCard
 key={emp.id || emp.niy || index}
 employee={emp}
 onClick={() => {
 setDetailEmployee(emp)
 setActiveDetailTab('Identitas')
 }}
 >
 <div
 onClick={() => {
 setDetailEmployee(emp)
 setActiveDetailTab('Identitas')
 }}
 className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 dark:border-emerald-800/60 dark:bg-slate-900/40 hover:border-emerald-300 dark:hover:border-emerald-200/80 transition cursor-pointer"
 >
 <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
 <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black shadow-2xs ${rankColor}`}>
 {index + 1}
 </span>
 <PersonAvatar src={getEmployeePhotoUrl(emp)} name={fullName} size="sm" />
 <div className="min-w-0 flex-1">
 <p className="truncate text-xs font-extrabold text-slate-900 dark:text-white" title={fullName}>
 {fullName}
 </p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
 <BookOpen className="size-3 text-slate-400 shrink-0" />
 <span className="truncate">{emp.jabatan_name || 'Guru'}</span>
 <span className="shrink-0">•</span>
 <span className="shrink-0 text-emerald-700 dark:text-emerald-400 font-semibold">{emp.unit_name || 'SIT'}</span>
 </p>
 </div>
 </div>
 <div className="text-right shrink-0 flex flex-col items-end gap-1">
 <span className="inline-flex items-center gap-1 rounded-md bg-purple-100/90 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
 <Medal className="size-2.5 text-purple-600 dark:text-purple-400" />
 {rankLabel}
 </span>
 <span className={`text-[10px] font-bold ${emp.jam_mengajar > 0 ? 'text-purple-700 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>
 {emp.indeks_label || '0 JP/Minggu · 0% Capaian KBM'}
 </span>
 </div>
 </div>
 </EmployeeHoverCard>
 )
 })
 ) : (
 <div className="flex flex-col items-center justify-center py-7 px-4 text-center rounded-xl border border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-purple-50/20 dark:bg-purple-950/10">
 <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 mb-2">
 <GraduationCap className="size-5 opacity-70" />
 </div>
 <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Nominasi Guru Terbaik</p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">
 Peringkat 3 teratas hanya akan terisi setelah guru memiliki jadwal pelajaran aktif (&gt; 0 JP) & capaian KBM riil.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* 4. AppDataTable complying with HeroUI Benchmark */}
 <div id="tabel-direktori-pegawai" className="scroll-mt-6">
 <AppDataTable
 className={`main-page-app-data-table ${statCardModal.isOpen ? 'print:hidden' : ''}`}
 printableHeader={
 <div className="flex items-end justify-between border-b border-emerald-200/80 pb-1.5 text-slate-900">
 <div>
 <h1 className="text-base font-semibold uppercase tracking-tight text-slate-900 leading-tight">
 Laporan Direktori & Data Pegawai / Tendik SIT
 </h1>
 <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-tight">
 Sekolah Islam Terpadu — Unit: {selectedUnitName || 'Semua Unit'} {selectedJabatanName ? `| Jabatan: ${selectedJabatanName}` : ''}
 </p>
 </div>
 <div className="text-right text-[9px] text-slate-600 font-medium leading-tight space-y-0.5">
 <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
 <p>Total Data: {paginationInfo.total} Pegawai</p>
 </div>
 </div>
 }
 title="Daftar Master Data Pegawai & Tendik"
 description="Tabel direktori pegawai, satuan kerja, status keaktifan, dan manajemen profil SDM."
 countLabel={`${Number(paginationInfo.total).toLocaleString('id-ID')} pegawai`}
 actionColumnLabel=""
 columns={columns}
 data={filteredItems}
 onRowClick={(emp) => { setDetailEmployee(emp); setActiveDetailTab('Identitas') }}
 isLoading={isLoading}
 isError={isError}
 errorTitle="Data pegawai gagal dimuat"
 errorMessage="Periksa koneksi server atau muat ulang halaman."
 onRetry={() => queryClient.invalidateQueries({ queryKey: ['employees-list'] })}
 isEmpty={!isLoading && !isError && filteredItems.length === 0}
 emptyTitle="Pegawai tidak ditemukan"
 emptyDescription="Tidak ada data pegawai yang cocok dengan kriteria pencarian atau filter."
 serverControlled={true}
 showPagination={true}
 page={page}
 totalPages={paginationInfo.last_page}
 totalItems={paginationInfo.total}
 itemsPerPage={perPage}
 onPageChange={(p) => setPage(p)}
 meta={paginationInfo}
 renderMobileCard={renderMobileCard}
 search={search}
 onSearchChange={(val) => { setSearch(val); setPage(1) }}
 searchPlaceholder="Cari Nama, NIY, NIK, No HP, atau Email..."
 hasActiveFilters={Boolean(search || selectedUnitFilter || selectedJabatanFilter || selectedStatusPegawaiFilter || selectedStatusFilter)}
 onResetFilters={() => {
 setSearch('')
 setSelectedUnitFilter(isGlobalUser ? '' : String(userUnitId || ''))
 setSelectedJabatanFilter('')
 setSelectedStatusPegawaiFilter('')
 setSelectedStatusFilter('')
 setPage(1)
 }}
 actions={renderActionButtons}
 filters={
 <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
 <HeroUiFilterSelect
 value={selectedUnitFilter}
 onChange={(val) => { setSelectedUnitFilter(val); setPage(1) }}
 options={[
 ...(isGlobalUser ? [{ value: '', label: 'Semua Unit Kerja' }] : []),
 ...unitsList
 .filter((u) => isGlobalUser || String(u.id) === String(userUnitId))
 .map((u) => ({ value: String(u.id), label: u.name })),
 ]}
 disabled={!isGlobalUser}
 placeholder="Unit Kerja"
 icon={Building2}
 ariaLabel="Filter unit kerja"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[160px]"
 />

 <HeroUiFilterSelect
 value={selectedJabatanFilter}
 onChange={(val) => { setSelectedJabatanFilter(val); setPage(1) }}
 options={[
 { value: '', label: `Semua Jabatan ${positionsList.length > 0 ? `(${positionsList.length})` : ''}` },
 ...positionsList.map((p) => ({ value: String(p.id), label: p.name })),
 ]}
 placeholder="Semua Jabatan"
 icon={BriefcaseBusiness}
 ariaLabel="Filter jabatan"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[170px]"
 />

 <HeroUiFilterSelect
 value={selectedStatusPegawaiFilter}
 onChange={(val) => { setSelectedStatusPegawaiFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Status Pegawai' },
 ...statusPegawaiOptions.map((st) => ({ value: st, label: st })),
 ]}
 placeholder="Status Pegawai"
 icon={Award}
 ariaLabel="Filter status pegawai"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 <HeroUiFilterSelect
 value={selectedStatusFilter}
 onChange={(val) => { setSelectedStatusFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Status Keaktifan' },
 ...STATUS_OPTIONS.map((st) => ({ value: st, label: st })),
 ]}
 placeholder="Status Keaktifan"
 icon={CheckCircle2}
 ariaLabel="Filter status keaktifan"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 {hasActiveFilters && (
 <Button
 variant="ghost"
 appearance="outline"
 size="xs"
 onClick={() => {
 setSearch('')
 setSelectedUnitFilter(isGlobalUser ? '' : String(userUnitId || ''))
 setSelectedJabatanFilter('')
 setSelectedStatusPegawaiFilter('')
 setSelectedStatusFilter('')
 setPage(1)
 }}
 className="size-10 flex items-center justify-center rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-emerald-800/60 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
 title="Reset Filter"
 >
 <RefreshCcw className="size-4" />
 </Button>
 )}
 </div>
 }
 />
 </div>
 </motion.div>

 {/* EXPORT DATA MODAL (.csv, .xls, .xlsx) */}
 <AnimatePresence>
 {showExportModal && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="employee-export-title"
 tabIndex={-1}
 onMouseDown={(e) => { if (e.target === e.currentTarget) setShowExportModal(false) }}
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
 <div className="rounded-xl bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-amber-700 dark:from-amber-950/60 dark:to-orange-950/40 dark:border-emerald-800/60 dark:text-amber-400">
 <Download className="size-5" />
 </div>
 <div>
 <h3 id="employee-export-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Ekspor Data Pegawai</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Batch Export
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih format berkas ekspor direktori pegawai</p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setShowExportModal(false)}
 aria-label="Tutup form ekspor"
 className="rounded-xl p-2 bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body min-h-0 flex-1 space-y-3 p-6 text-sm text-slate-700 dark:text-slate-200">
 <button
 type="button"
 onClick={() => handleExportDataFormat('xlsx')}
 className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:border-emerald-800/60 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
 >
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
 <FileSpreadsheet className="size-5 text-emerald-600" />
 </div>
 <div>
 <strong className="block text-xs text-slate-900 dark:text-white font-bold">Microsoft Excel (.xlsx)</strong>
 <span className="text-xs text-slate-500 dark:text-slate-400">Format spreadsheet modern (.xlsx)</span>
 </div>
 </div>
 <Badge color="success" size="sm">Rekomendasi</Badge>
 </button>

 <button
 type="button"
 onClick={() => handleExportDataFormat('xls')}
 className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/40 dark:border-emerald-800/60 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
 >
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
 <FileSpreadsheet className="size-5 text-amber-600" />
 </div>
 <div>
 <strong className="block text-xs text-slate-900 dark:text-white font-bold">Excel Standar (.xls)</strong>
 <span className="text-xs text-slate-500 dark:text-slate-400">Format spreadsheet MS Excel legacy (.xls)</span>
 </div>
 </div>
 </button>

 <button
 type="button"
 onClick={() => handleExportDataFormat('csv')}
 className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/40 dark:border-emerald-800/60 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
 >
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
 <FileText className="size-5 text-sky-600" />
 </div>
 <div>
 <strong className="block text-xs text-slate-900 dark:text-white font-bold">Comma Separated (.csv)</strong>
 <span className="text-xs text-slate-500 dark:text-slate-400">Format teks berpisah koma (UTF-8 BOM)</span>
 </div>
 </div>
 </button>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-end border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <AppButton variant="danger" size="md" icon={X} onClick={() => setShowExportModal(false)}>Tutup</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* DOWNLOAD TEMPLATE MODAL (.csv, .xls, .xlsx) */}
 <AnimatePresence>
 {showTemplateModal && canDownloadTemplate && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="employee-template-title"
 tabIndex={-1}
 onMouseDown={(e) => { if (e.target === e.currentTarget) setShowTemplateModal(false) }}
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
 <div className="rounded-xl bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-purple-700 dark:from-purple-950/60 dark:to-violet-950/40 dark:border-emerald-800/60 dark:text-purple-400">
 <FileSpreadsheet className="size-5" />
 </div>
 <div>
 <h3 id="employee-template-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Unduh Template Impor</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Template SDM
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih format berkas template pengisian data</p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setShowTemplateModal(false)}
 aria-label="Tutup form template"
 className="rounded-xl p-2 bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body min-h-0 flex-1 space-y-3 p-6 text-sm text-slate-700 dark:text-slate-200">
 <button
 type="button"
 onClick={() => handleDownloadTemplatePegawaiFormat('xlsx')}
 className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-purple-50/50 hover:bg-purple-100/70 dark:bg-purple-950/30 dark:border-emerald-800/60 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
 >
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
 <FileSpreadsheet className="size-5 text-purple-600" />
 </div>
 <div>
 <strong className="block text-xs text-slate-900 dark:text-white font-bold">Template Excel (.xlsx)</strong>
 <span className="text-xs text-slate-500 dark:text-slate-400">Format spreadsheet Excel (.xlsx) dengan contoh baris</span>
 </div>
 </div>
 <Badge color="purple" size="sm">Rekomendasi</Badge>
 </button>

 <button
 type="button"
 onClick={() => handleDownloadTemplatePegawaiFormat('csv')}
 className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/40 dark:border-emerald-800/60 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer"
 >
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
 <FileText className="size-5 text-sky-600" />
 </div>
 <div>
 <strong className="block text-xs text-slate-900 dark:text-white font-bold">Template CSV (.csv)</strong>
 <span className="text-xs text-slate-500 dark:text-slate-400">Format dokumen teks (.csv) dengan header kolom lengkap</span>
 </div>
 </div>
 </button>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-end border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <AppButton variant="danger" size="md" icon={X} onClick={() => setShowTemplateModal(false)}>Tutup</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* 5. MODAL WIZARD: TAMBAH / EDIT PEGAWAI (HeroUI + SSOT) */}
 <EmployeeFormModal
 isOpen={isFormModalOpen && ((isEditMode && canUpdateEmployee) || (!isEditMode && canCreateEmployee))}
 onClose={closeFormModal}
 isEditMode={isEditMode}
 currentStep={currentStep}
 setCurrentStep={setCurrentStep}
 formData={formData}
 setFormData={setFormData}
 onSubmit={handleFormSubmit}
 isSubmitting={isMutating}
 unitsList={unitsList}
 positionsList={positionsList}
 statusPegawaiOptions={statusPegawaiOptions}
 maritalStatusOptions={maritalStatusOptions}
 lastEducationOptions={lastEducationOptions}
 handleFotoUpload={handleFotoUpload}
 isUnitPersonnelManager={isUnitPersonnelManager}
 isGlobalPersonnelManager={isGlobalPersonnelManager}
 userUnitId={userUnitId}
 canDeleteEmployee={canDeleteEmployee}
 toggleEmployeeStatus={toggleEmployeeStatus}
 onDeleteTarget={setDeleteTarget}
 />

 {/* 6. MODAL DETAIL PEGAWAI (WITH 7 TABS) */}
 {detailEmployee && (
 <div className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden" role="dialog" aria-modal="true" aria-label="Detail Pegawai" tabIndex={-1}>
 <div className="modal-dialog font-sans w-full max-w-4xl">
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl dark:border-emerald-800/60 dark:bg-card-dark">
 {/* Top Bar / Header */}
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 bg-white px-5 py-4 dark:border-emerald-800/60 dark:bg-card-dark">
 <AppButton variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setDetailEmployee(null)}>Kembali</AppButton>
 <div className="flex items-center gap-2">
 <AppButton variant="outline" size="sm" icon={IdCard} onClick={() => setShowIdCardModal(detailEmployee)}>ID Card</AppButton>
 {canUpdateEmployee && (
 <AppButton variant="warning" size="sm" icon={Pencil} onClick={() => { const target = { ...detailEmployee }; setDetailEmployee(null); setTimeout(() => { openEditModal(target); }, 50); }}>Edit</AppButton>
 )}
 <IconButton icon={X} variant="ghost" size="sm" onClick={() => setDetailEmployee(null)} aria-label="Tutup detail" />
 </div>
 </div>

 {/* Content Body */}
 <div className="modal-body min-h-0 flex-1 space-y-6 overflow-y-auto p-5 text-sm text-slate-700 dark:text-slate-200">
 {/* Profile Card Header */}
 <div className="flex flex-col md:flex-row gap-6 items-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-4">
 <PersonAvatar
 src={detailEmployee.photo_url || detailEmployee.avatar_url || detailEmployee.user?.photo_url || detailEmployee.user?.avatar_url || detailEmployee.foto}
 name={detailEmployee.gelar_depan ? `${detailEmployee.gelar_depan} ${detailEmployee.nama_lengkap}` : detailEmployee.nama_lengkap}
 size="detail"
 className="h-28 w-28 shrink-0 shadow-md"
 />
 <div className="flex-1 space-y-1 text-center md:text-left">
 <span className="rounded-md bg-emerald-800 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
 {detailEmployee.niy}
 </span>
 <h2 className="text-xl font-black text-slate-900">
 {detailEmployee.gelar_depan} {detailEmployee.nama_lengkap}{detailEmployee.gelar_belakang ? `, ${detailEmployee.gelar_belakang}` : ''}
 </h2>
 <p className="text-xs font-bold text-emerald-700">{detailEmployee.jabatan_name} - {detailEmployee.unit_name}</p>
 <div className="text-xs text-slate-500 flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
 <span className="flex items-center gap-1.5 font-medium">Status: {renderStatusPegawaiBadge(detailEmployee.status_pegawai)}</span>
 <span>•</span>
 <span>Keaktifan: <strong className="text-emerald-700 font-extrabold">{detailEmployee.status}</strong></span>
 </div>
 </div>
 </div>

 {/* Tabs Navigation */}
 <div className="flex gap-1.5 overflow-x-auto rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-1.5 dark:border-emerald-800/60 dark:bg-slate-900/40 scrollbar-hide">
 {['Identitas', 'Kepegawaian', 'Penugasan Mengajar', 'Riwayat Jabatan', 'Sertifikasi', 'Dokumen', 'Absensi'].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveDetailTab(tab)}
 className={`flex-1 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
 activeDetailTab === tab
 ? 'bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-none border-2 border-emerald-300 dark:border-emerald-800'
 : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200'
 }`}
 >
 {tab}
 </button>
 ))}
 </div>

 {/* TAB 1: IDENTITAS */}
 {activeDetailTab === 'Identitas' && (
 <div className="grid grid-cols-2 gap-4 text-xs bg-white rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-5">
 <div>
 <span className="text-slate-400 block mb-0.5">NIY</span>
 <span className="font-bold text-slate-800">{detailEmployee.niy}</span>
 </div>
 <div>
 <span className="text-slate-400 block mb-0.5">NIK</span>
 <span className="font-bold text-slate-800">{detailEmployee.nik || '-'}</span>
 </div>
 <div>
 <span className="text-slate-400 block mb-0.5">Jenis Kelamin</span>
 <span className="font-bold text-slate-800">{detailEmployee.jenis_kelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span>
 </div>
 <div>
 <span className="text-slate-400 block mb-0.5">Tempat, Tanggal Lahir</span>
 <span className="font-bold text-slate-800">{[detailEmployee.tempat_lahir, detailEmployee.tanggal_lahir].filter(Boolean).join(', ') || '-'}</span>
 </div>
 <div>
 <span className="text-slate-400 block mb-0.5">Agama</span>
 <span className="font-bold text-slate-800">{detailEmployee.agama || 'Islam'}</span>
 </div>
 <div>
 <span className="text-slate-400 block mb-0.5">Status Perkawinan</span>
 <span className="font-bold text-slate-800">{detailEmployee.status_perkawinan || detailEmployee.metadata?.status_perkawinan || '-'}</span>
 </div>
 <div>
 <span className="text-slate-400 block mb-0.5">Pendidikan Terakhir</span>
 <span className="font-bold text-slate-800">{detailEmployee.pendidikan_terakhir || detailEmployee.metadata?.pendidikan_terakhir || '-'}</span>
 </div>
 <div>
 <span className="text-slate-400 block mb-0.5">No HP / WhatsApp</span>
 <span className="font-bold text-slate-800">{detailEmployee.no_hp || '-'}</span>
 </div>
 <div className="col-span-2">
 <span className="text-slate-400 block mb-0.5">Email</span>
 <span className="font-bold text-slate-800">{detailEmployee.email || '-'}</span>
 </div>
 <div className="col-span-2">
 <span className="text-slate-400 block mb-0.5">Alamat Lengkap</span>
 <span className="font-bold text-slate-800">{detailEmployee.alamat || '-'}</span>
 </div>
 </div>
 )}

 {/* TAB 2: KEPEGAWAIAN */}
 {activeDetailTab === 'Kepegawaian' && (
 <div className="grid grid-cols-2 gap-4 text-xs bg-white rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-5">
 <div>
 <span className="text-slate-400 block mb-0.5">Unit Kerja</span>
 <span className="font-bold text-slate-800">{detailEmployee.unit_name}</span>
 </div>
 <div>
 <span className="text-slate-400 block mb-0.5">Jabatan Utama</span>
 <span className="font-bold text-slate-800">{detailEmployee.jabatan_name}</span>
 </div>
 <div>
 <span className="text-slate-400 block mb-1">Status Pegawai</span>
 {renderStatusPegawaiBadge(detailEmployee.status_pegawai)}
 </div>
 <div>
 <span className="text-slate-400 block mb-0.5">Tanggal Masuk</span>
 <span className="font-bold text-slate-800">{detailEmployee.tanggal_masuk || '-'}</span>
 </div>
 </div>
 )}

 {/* TAB 3: PENUGASAN MENGAJAR */}
 {activeDetailTab === 'Penugasan Mengajar' && (
 <div className="space-y-4">
 {isGlobalPersonnelManager && (
 <div className="p-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 space-y-3">
 <h4 className="text-xs font-bold text-slate-800">Tambah Penugasan Mengajar Baru</h4>
 <div className="grid grid-cols-4 gap-2">
 <input
 type="text"
 placeholder="Mata Pelajaran"
 value={newTeaching.mapel}
 onChange={(e) => setNewTeaching((p) => ({ ...p, mapel: e.target.value }))}
 className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 text-xs"
 />
 <input
 type="text"
 placeholder="Kelas / Rombel"
 value={newTeaching.kelas}
 onChange={(e) => setNewTeaching((p) => ({ ...p, kelas: e.target.value }))}
 className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 text-xs"
 />
 <input
 type="text"
 placeholder="Tahun Ajaran"
 value={newTeaching.tahun}
 onChange={(e) => setNewTeaching((p) => ({ ...p, tahun: e.target.value }))}
 className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 text-xs"
 />
 <button
 onClick={handleAddTeaching}
 className="rounded-lg bg-emerald-600 text-white text-xs font-semibold py-1.5 px-3 transition-colors shadow-xs h-9 text-sm font-medium"
 >
 + Tambah Penugasan
 </button>
 </div>
 </div>
 )}

 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <TableRoot className="w-full text-left text-xs">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="py-2.5 px-3">Mata Pelajaran</TableHead>
 <TableHead className="py-2.5 px-3">Kelas</TableHead>
 <TableHead className="py-2.5 px-3">Tahun Ajaran</TableHead>
 <TableHead className="py-2.5 px-3 text-center">Status</TableHead>
 {isGlobalPersonnelManager && (
 <TableHead className="py-2.5 px-3 text-center">Aksi</TableHead>
 )}
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80">
 {(detailEmployee.teachings || []).length === 0 ? (
 <TableRow>
 <TableCell colSpan={isGlobalPersonnelManager ? 5 : 4} className="py-6 text-center text-slate-400">Belum ada penugasan mengajar</TableCell>
 </TableRow>
 ) : (
 detailEmployee.teachings.map((t, idx) => (
 <TableRow key={idx} className="hover:bg-emerald-50/40">
 <TableCell className="py-2.5 px-3 font-bold text-slate-800">{t.mapel || t.subject?.name || t.subject?.nama_mapel || t.metadata?.mapel || '-'}</TableCell>
 <TableCell className="py-2.5 px-3 font-semibold">{t.kelas || t.classroom?.name || t.classroom?.nama_kelas || t.metadata?.kelas || '-'}</TableCell>
 <TableCell className="py-2.5 px-3">{t.tahun || t.metadata?.tahun || '-'}</TableCell>
 <TableCell className="py-2.5 px-3 text-center">
 <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">Aktif</span>
 </TableCell>
 {isGlobalPersonnelManager && (
 <TableCell className="py-2.5 px-3 text-center">
 <Button
 type="button"
 size="xs"
 variant="ghost"
 onClick={() => handleRemoveTeaching(idx)}
 title="Hapus Penugasan"
 className="inline-flex items-center justify-center p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </Button>
 </TableCell>
 )}
 </TableRow>
 ))
 )}
 </TableBody>
 </TableRoot>
 </div>
 </div>
 )}

 {/* TAB 4: RIWAYAT JABATAN */}
 {activeDetailTab === 'Riwayat Jabatan' && (
 <div className="space-y-3">
 {(detailEmployee.position_history || []).map((h, idx) => (
 <div key={idx} className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white flex justify-between items-center text-xs">
 <div>
 <h4 className="font-bold text-slate-800">{h.jabatan}</h4>
 <span className="text-slate-400">{h.keterangan || 'Penugasan Resmi'}</span>
 </div>
 <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{h.tgl_mulai}</span>
 </div>
 ))}
 </div>
 )}

 {/* TAB 5: SERTIFIKASI */}
 {activeDetailTab === 'Sertifikasi' && (
 <div className="space-y-4">
 {isGlobalPersonnelManager && (
 <div className="p-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20 space-y-3">
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Tambah Sertifikasi Baru</h4>
 <div className="grid grid-cols-4 gap-2">
 <input
 type="text"
 placeholder="Nama Sertifikat"
 value={newCert.nama}
 onChange={(e) => setNewCert((p) => ({ ...p, nama: e.target.value }))}
 className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
 />
 <input
 type="text"
 placeholder="Penerbit"
 value={newCert.penerbit}
 onChange={(e) => setNewCert((p) => ({ ...p, penerbit: e.target.value }))}
 className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
 />
 <input
 type="text"
 placeholder="Tahun"
 value={newCert.tahun}
 onChange={(e) => setNewCert((p) => ({ ...p, tahun: e.target.value }))}
 className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
 />
 <button
 onClick={handleAddCert}
 className="rounded-lg bg-emerald-600 text-white text-xs font-semibold py-1.5 px-3 transition-colors shadow-xs h-9 text-sm font-medium"
 >
 + Tambah Sertifikat
 </button>
 </div>
 </div>
 )}

 <div className="space-y-2">
 {(detailEmployee.certifications || []).map((c, idx) => (
 <div key={idx} className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white flex justify-between items-center text-xs">
 <div className="flex items-center gap-3">
 <FaAward className="text-xl text-amber-500" />
 <div>
 <h4 className="font-bold text-slate-800">{c.nama}</h4>
 <p className="text-slate-400">Penerbit: {c.penerbit} ({c.tahun})</p>
 </div>
 </div>
 <span className="font-mono text-slate-600">{c.no_sertifikat}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* TAB 6: DOKUMEN */}
 {activeDetailTab === 'Dokumen' && (
 <div className="space-y-4">
 {isGlobalPersonnelManager && (
 <div className="p-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20 space-y-3">
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Dokumen Pegawai</h4>
 <div className="grid grid-cols-3 gap-2">
 <input
 type="text"
 placeholder="Nama Dokumen (KTP, SK, Ijazah)"
 value={newDoc.nama}
 onChange={(e) => setNewDoc((p) => ({ ...p, nama: e.target.value }))}
 className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
 />
 <input
 type="text"
 placeholder="Nama File (.pdf / .jpg)"
 value={newDoc.file_name}
 onChange={(e) => setNewDoc((p) => ({ ...p, file_name: e.target.value }))}
 className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
 />
 <button
 onClick={handleAddDoc}
 className="rounded-lg bg-emerald-600 text-white text-xs font-semibold py-1.5 px-3 transition-colors shadow-xs h-9 text-sm font-medium"
 >
 + Simpan Dokumen
 </button>
 </div>
 </div>
 )}

 <div className="space-y-2">
 {(detailEmployee.documents || []).map((d, idx) => (
 <div key={idx} className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white flex justify-between items-center text-xs">
 <div className="flex items-center gap-3">
 <FaFolderOpen className="text-lg text-purple-600" />
 <div>
 <h4 className="font-bold text-slate-800">{d.nama}</h4>
 <p className="text-slate-400">{d.file_name} • Upload: {d.tanggal}</p>
 </div>
 </div>
 <button
 onClick={() => Swal.fire('Preview Dokumen', `Membuka file ${d.file_name}`, 'info')}
 className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-emerald-50/40"
 >
 Lihat File
 </button>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* TAB 7: ABSENSI */}
 {activeDetailTab === 'Absensi' && (
 <div className="space-y-3">
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <TableRoot className="w-full text-left text-xs">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-slate-700 font-semibold border-b border-emerald-200/80 dark:border-emerald-800/60 text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="py-2.5 px-3">Tanggal</TableHead>
 <TableHead className="py-2.5 px-3">Jam Masuk</TableHead>
 <TableHead className="py-2.5 px-3">Jam Pulang</TableHead>
 <TableHead className="py-2.5 px-3 text-center">Status</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80">
 {(detailEmployee.attendances || []).map((a, idx) => (
 <TableRow key={idx} className="hover:bg-emerald-50/40">
 <TableCell className="py-2.5 px-3 font-semibold text-slate-800">{a.tanggal}</TableCell>
 <TableCell className="py-2.5 px-3 font-mono text-emerald-700">{a.jam_masuk}</TableCell>
 <TableCell className="py-2.5 px-3 font-mono text-slate-600">{a.jam_pulang}</TableCell>
 <TableCell className="py-2.5 px-3 text-center">
 <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">
 {a.status}
 </span>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* 7. MODAL CETAK ID CARD PEGAWAI */}
 {showIdCardModal && (
 <div className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md print:hidden animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="employee-id-card-title" tabIndex={-1}>
 <div className={`modal-dialog font-sans my-auto w-full transition-all duration-300 ${idCardOrientation === 'horizontal' ? 'max-w-4xl' : 'max-w-4xl'}`}>
 <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white shadow-2xl dark:border-emerald-800/60 dark:bg-slate-950">
 {/* Top accent bar */}

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-[#059669] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#10B981]">
 <IdCard className="h-5 w-5" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="employee-id-card-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>ID Card Pegawai</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" /> Cetak & Pratinjau
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pratinjau kartu identitas & QR akses sistem untuk {showIdCardModal.nama_lengkap}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setShowIdCardModal(null)}
 className="rounded-xl p-2 bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 aria-label="Tutup ID Card"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 <div className="modal-body min-h-0 flex-1 overflow-hidden p-4 text-sm text-slate-700 dark:text-slate-200">
 <div className="employee-id-preview">
 {/* Card View Box with Orientation & Front/Back Switch */}
 <div className="flex flex-col items-center gap-3">
 <div className="flex flex-wrap items-center justify-center gap-2">
 {/* Orientation Switch */}
 <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 shadow-2xs">
 <button
 type="button"
 onClick={() => changeIdCardOrientation('horizontal')}
 className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
 idCardOrientation === 'horizontal'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
 }`}
 >
 ↔️ Horizontal
 </button>
 <button
 type="button"
 onClick={() => changeIdCardOrientation('vertical')}
 className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
 idCardOrientation === 'vertical'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
 }`}
 >
 ↕️ Vertikal
 </button>
 </div>

 {/* Front/Back Side Switch */}
 <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 shadow-2xs">
 <button
 type="button"
 onClick={() => setIdCardSide('front')}
 className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
 idCardSide === 'front'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
 }`}
 >
 🎴 Sisi Depan
 </button>
 <button
 type="button"
 onClick={() => setIdCardSide('back')}
 className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
 idCardSide === 'back'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
 }`}
 >
 🃏 Sisi Belakang
 </button>
 </div>
 </div>

 <EmployeeIdCard
 orientation={idCardOrientation}
 employee={showIdCardModal}
 template={selectedIdCardTemplate}
 pengaturan={pengaturan}
 formatDate={formatEmployeeCardDate}
 qrPayload={makeEmployeeQrPayload(showIdCardModal)}
 isPrint={false}
 isEditing={isDragModeEnabled}
 layoutConfig={idCardLayoutConfig}
 frameStyle={idCardFrameStyle}
 photoShape={idCardPhotoShape}
 showPattern={idCardShowPattern}
 showWave={idCardShowWave}
 headerMotto={idCardHeaderMotto}
 footerMotto={idCardFooterMotto}
 cardSide={idCardSide}
 backTitle={idCardBackTitle}
 backRules={idCardBackRules}
 backAddress={idCardBackAddress}
 backShowQr={idCardBackShowQr}
 onElementMove={handleElementMove}
 />
 </div>

 <aside className="employee-id-info space-y-3">
 {/* Control Sub-Tabs */}
 <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
 <button
 type="button"
 onClick={() => setIdCardControlTab('style')}
 className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
 idCardControlTab === 'style'
 ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
 }`}
 >
 🎨 Depan
 </button>
 <button
 type="button"
 onClick={() => {
 setIdCardControlTab('back')
 setIdCardSide('back')
 }}
 className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
 idCardControlTab === 'back'
 ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
 }`}
 >
 📝 Belakang
 </button>
 <button
 type="button"
 onClick={() => setIdCardControlTab('template')}
 className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
 idCardControlTab === 'template'
 ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
 }`}
 >
 ⚙️ Template
 </button>
 </div>

 {/* TAB 1: STYLE & LAYOUT DEPAN */}
 {idCardControlTab === 'style' && (
 <div className="space-y-3">
 {/* Orientasi Kartu Picker */}
 <div className="employee-id-orientation-picker">
 <div>
 <h3>Orientasi Kartu</h3>
 </div>
 <div className="employee-id-orientation-grid">
 {[
 ['horizontal', 'Horizontal'],
 ['vertical', 'Vertikal'],
 ].map(([value, label]) => (
 <button key={value} type="button" onClick={() => changeIdCardOrientation(value)} aria-pressed={idCardOrientation === value} className={idCardOrientation === value ? 'is-selected' : ''}>
 <span className={`employee-id-orientation-icon employee-id-orientation-icon--${value}`}><i /><b /></span>
 <strong>{label}</strong>
 {idCardOrientation === value && <FaCheckCircle />}
 </button>
 ))}
 </div>
 </div>
 {/* Mode Drag & Drop Toggle Banner */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/40">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
 <SlidersHorizontal className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Mode Edit Layout
 </h4>
 <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
 {isDragModeEnabled ? 'Geser elemen kartu langsung pada preview' : 'Aktifkan untuk menggeser posisi elemen'}
 </p>
 </div>
 <button
 type="button"
 onClick={() => setIsDragModeEnabled(!isDragModeEnabled)}
 className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
 isDragModeEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
 }`}
 >
 <span
 className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
 isDragModeEnabled ? 'translate-x-5' : 'translate-x-0'
 }`}
 />
 </button>
 </div>

 {isDragModeEnabled && (
 <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 pt-2 text-xs text-emerald-800 dark:border-emerald-800/60 dark:text-emerald-300">
 <span>💡 Klik & tahan elemen untuk memindahkan</span>
 <button
 type="button"
 onClick={resetIdCardLayout}
 className="flex items-center gap-1 font-semibold text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 cursor-pointer"
 >
 <RefreshCcw className="size-3" /> Reset
 </button>
 </div>
 )}
 </div>

 {/* Frame & Shape Customizer */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:border-emerald-800/60 dark:bg-slate-800/60 space-y-2.5">
 <div className="space-y-1.5">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Gaya Frame / Border</label>
 <div className="grid grid-cols-2 gap-1.5 text-xs">
 {[
 ['standard', 'Standard'],
 ['rounded', 'Soft Rounded'],
 ['double', 'Double Line'],
 ['glow', 'Glow Accent'],
 ].map(([styleKey, styleLabel]) => (
 <button
 key={styleKey}
 type="button"
 onClick={() => setIdCardFrameStyle(styleKey)}
 className={`rounded-lg border px-2.5 py-1 text-left text-xs font-medium transition-all cursor-pointer ${
 idCardFrameStyle === styleKey
 ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold'
 : 'border-emerald-200/80 hover:bg-slate-50 dark:border-emerald-800/60 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
 }`}
 >
 {styleLabel}
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Bentuk Foto Pegawai</label>
 <div className="grid grid-cols-4 gap-1 text-center">
 {[
 ['circle', 'Bulat'],
 ['rounded', 'Membuat'],
 ['square', 'Kotak'],
 ['shield', 'Perisai'],
 ].map(([shapeKey, shapeLabel]) => (
 <button
 key={shapeKey}
 type="button"
 onClick={() => setIdCardPhotoShape(shapeKey)}
 className={`rounded-lg border py-1 text-[10px] font-medium transition-all cursor-pointer ${
 idCardPhotoShape === shapeKey
 ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold'
 : 'border-emerald-200/80 hover:bg-slate-50 dark:border-emerald-800/60 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
 }`}
 >
 {shapeLabel}
 </button>
 ))}
 </div>
 </div>

 <div className="flex items-center justify-between pt-1 text-xs">
 <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
 <input
 type="checkbox"
 checked={idCardShowPattern}
 onChange={(e) => setIdCardShowPattern(e.target.checked)}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 Pola Latar
 </label>
 <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
 <input
 type="checkbox"
 checked={idCardShowWave}
 onChange={(e) => setIdCardShowWave(e.target.checked)}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 Gelombang Atas
 </label>
 </div>
 </div>

 {/* Tagline & Motto Customizer */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:border-emerald-800/60 dark:bg-slate-800/60 space-y-2">
 <div className="space-y-1">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Tagline Sub-Header</label>
 <input
 type="text"
 value={idCardHeaderMotto}
 onChange={(e) => setIdCardHeaderMotto(e.target.value)}
 placeholder="Berilmu, Berakhlak, Beramal"
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-xs focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white font-medium"
 />
 </div>

 <div className="space-y-1">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Motto Footer</label>
 <textarea
 rows={2}
 value={idCardFooterMotto}
 onChange={(e) => setIdCardFooterMotto(e.target.value)}
 placeholder="Generasi Beriman, Berilmu, Berakhlak Mulia"
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-xs focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white resize-none font-medium"
 />
 </div>
 </div>
 </div>
 )}

 {/* TAB 2: FORM DESAIN SISI BELAKANG */}
 {idCardControlTab === 'back' && (
 <div className="space-y-3">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 dark:border-emerald-800/60 dark:bg-slate-800/60 space-y-2.5">
 <div>
 <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pengaturan Sisi Belakang</h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">Atur judul, tata tertib, dan kontak yayasan.</p>
 </div>

 <div className="space-y-1">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Judul Header Belakang</label>
 <input
 type="text"
 value={idCardBackTitle}
 onChange={(e) => setIdCardBackTitle(e.target.value)}
 placeholder="KETENTUAN KARTU PEGAWAI"
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-xs focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white font-medium"
 />
 </div>

 <div className="space-y-1">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Poin Ketentuan & Tata Tertib</label>
 <textarea
 rows={4}
 value={idCardBackRules}
 onChange={(e) => setIdCardBackRules(e.target.value)}
 placeholder="1. Kartu ini milik resmi..."
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-xs focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white font-medium resize-none"
 />
 </div>

 <div className="space-y-1">
 <div className="flex items-center justify-between">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Alamat & Kontak Footer</label>
 <button
 type="button"
 onClick={() => {
 if (showIdCardModal) {
 setIdCardBackAddress(getEmployeeUnitAddress(showIdCardModal, unitsList, pengaturan))
 }
 }}
 className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
 >
 📍 Sync Unit
 </button>
 </div>
 <textarea
 rows={2}
 value={idCardBackAddress}
 onChange={(e) => setIdCardBackAddress(e.target.value)}
 placeholder="Jl. Gajah Mada No. 28..."
 className="w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-xs focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white font-medium resize-none"
 />
 </div>

 <div className="flex items-center justify-between pt-1 text-xs">
 <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
 <input
 type="checkbox"
 checked={idCardBackShowQr}
 onChange={(e) => setIdCardBackShowQr(e.target.checked)}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 Tampilkan QR Code Belakang
 </label>
 </div>
 </div>
 </div>
 )}

 {/* TAB 3: TEMPLATE & CETAK */}
 {idCardControlTab === 'template' && (
 <div className="space-y-3">
 <div className="employee-id-orientation-picker">
 <div>
 <h3>Orientasi Kartu</h3>
 </div>
 <div className="employee-id-orientation-grid">
 {[
 ['horizontal', 'Horizontal'],
 ['vertical', 'Vertikal'],
 ].map(([value, label]) => (
 <button key={value} type="button" onClick={() => changeIdCardOrientation(value)} aria-pressed={idCardOrientation === value} className={idCardOrientation === value ? 'is-selected' : ''}>
 <span className={`employee-id-orientation-icon employee-id-orientation-icon--${value}`}><i /><b /></span>
 <strong>{label}</strong>
 {idCardOrientation === value && <FaCheckCircle />}
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Sisi Halaman Yang Dicetak</label>
 <div className="grid grid-cols-3 gap-1 text-center">
 {[
 ['both', 'Keduanya'],
 ['front', 'Depan'],
 ['back', 'Belakang'],
 ].map(([val, label]) => (
 <button
 key={val}
 type="button"
 onClick={() => setIdCardPrintSides(val)}
 className={`rounded-lg border py-1 text-[10.5px] font-semibold transition-all cursor-pointer ${
 idCardPrintSides === val
 ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold'
 : 'border-emerald-200/80 hover:bg-slate-50 dark:border-emerald-800/60 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
 }`}
 >
 {label}
 </button>
 ))}
 </div>
 </div>

 <div className="employee-id-template-picker">
 <div>
 <h3>Pilih Warna Kartu</h3>
 </div>
 <div className="employee-id-template-grid">
 {ID_CARD_TEMPLATES.map((template) => (
 <button
 key={template.id}
 type="button"
 onClick={() => setSelectedIdCardTemplate(template.id)}
 aria-pressed={selectedIdCardTemplate === template.id}
 className={`employee-id-template-option employee-id-template-option--${template.id} ${selectedIdCardTemplate === template.id ? 'is-selected' : ''}`}
 >
 <span className="employee-id-template-option__preview">
 <i />
 <b>DEI</b>
 <em />
 <small>QR</small>
 </span>
 <strong>{template.label}</strong>
 </button>
 ))}
 </div>
 </div>

 <dl>
 <div><dt>Identifier Login</dt><dd>{showIdCardModal.niy || showIdCardModal.email}</dd></div>
 <div><dt>Peran Utama</dt><dd>{showIdCardModal.jabatan_name || 'Pegawai'}</dd></div>
 <div><dt>Unit Kerja</dt><dd>{showIdCardModal.unit_name || '—'}</dd></div>
 <div><dt>Status</dt><dd><span>{showIdCardModal.status}</span></dd></div>
 </dl>
 </div>
 )}
 </aside>
 </div>
 </div>

 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-white px-5 py-4 dark:border-emerald-800/60 dark:bg-card-dark">
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setShowIdCardModal(null)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-4 py-2 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 Tutup
 </button>
 {Object.keys(idCardLayoutConfig).length > 0 && (
 <button
 type="button"
 onClick={resetIdCardLayout}
 className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-slate-200 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-slate-700 transition-all"
 >
 <RefreshCcw className="size-3" /> Reset Layout
 </button>
 )}
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => {
 downloadEmployeeIdCard({
 employee: showIdCardModal,
 orientation: idCardOrientation,
 template: selectedIdCardTemplate,
 pengaturan,
 formatDate: formatEmployeeCardDate,
 qrPayload: makeEmployeeQrPayload(showIdCardModal),
 layoutConfig: idCardLayoutConfig,
 frameStyle: idCardFrameStyle,
 photoShape: idCardPhotoShape,
 showPattern: idCardShowPattern,
 showWave: idCardShowWave,
 headerMotto: idCardHeaderMotto,
 footerMotto: idCardFooterMotto,
 printSides: idCardPrintSides,
 backTitle: idCardBackTitle,
 backRules: idCardBackRules,
 backAddress: idCardBackAddress,
 backShowQr: idCardBackShowQr,
 })
 }}
 className="flex items-center gap-2 rounded-xl bg-amber-100/90 px-4 py-2 text-xs font-extrabold text-amber-900 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
 >
 <FaDownload className="size-3.5 text-amber-600 dark:text-amber-400" /> Unduh ID Card
 </button>
 <button
 type="button"
 onClick={() => {
 printEmployeeIdCard({
 employee: showIdCardModal,
 orientation: idCardOrientation,
 template: selectedIdCardTemplate,
 pengaturan,
 formatDate: formatEmployeeCardDate,
 qrPayload: makeEmployeeQrPayload(showIdCardModal),
 layoutConfig: idCardLayoutConfig,
 frameStyle: idCardFrameStyle,
 photoShape: idCardPhotoShape,
 showPattern: idCardShowPattern,
 showWave: idCardShowWave,
 headerMotto: idCardHeaderMotto,
 footerMotto: idCardFooterMotto,
 printSides: idCardPrintSides,
 backTitle: idCardBackTitle,
 backRules: idCardBackRules,
 backAddress: idCardBackAddress,
 backShowQr: idCardBackShowQr,
 })
 }}
 className="flex items-center gap-2 rounded-xl bg-emerald-100/90 px-4 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/70 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
 >
 <FaPrint className="text-emerald-600 dark:text-emerald-400" /> Cetak ID Card
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* 8. MODAL KONFIRMASI HAPUS PEGAWAI — Harmonized HeroUI Modal */}
 <AnimatePresence>
 {canDeleteEmployee && deleteTarget && (
 <div
 className="overlay modal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md print:hidden"
 role="dialog"
 aria-modal="true"
 aria-labelledby="emp-delete-confirm-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !deleteMutation.isPending) setDeleteTarget(null)
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
 id="emp-delete-confirm-title"
 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 <span>Hapus Data Pegawai</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-400 dark:border-emerald-800/60">
 <AlertTriangle className="size-3" />
 Hapus Permanen
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Tindakan ini permanen dan tidak dapat dibatalkan.
 </p>
 </div>
 </div>

 <IconButton icon={X} variant="ghost" size="sm" disabled={deleteMutation.isPending} onClick={() => setDeleteTarget(null)} aria-label="Tutup dialog konfirmasi" />
 </div>

 {/* Body */}
 <div className="modal-body p-6 space-y-4 text-slate-700 dark:text-slate-200">
 {/* Target Info Summary Card */}
 <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/40 p-3.5 dark:border-emerald-800/60 dark:bg-rose-950/20 space-y-2.5">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-card-dark font-black text-xs shadow-sm border border-emerald-200/80 dark:border-emerald-800/60">
 {deleteTarget.nama_lengkap.substring(0, 2).toUpperCase()}
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="font-extrabold text-slate-900 dark:text-white text-sm ">
 {deleteTarget.nama_lengkap}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 NIY: <span className="font-bold text-slate-700 dark:text-slate-300">{deleteTarget.niy || '-'}</span>
 </p>
 </div>
 </div>

 <div className="flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pt-2 text-xs">
 <span className="font-semibold text-slate-500 dark:text-slate-400">Jabatan & Unit</span>
 <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
 {deleteTarget.jabatan_name || '-'} · {deleteTarget.unit_kerja_name || '-'}
 </span>
 </div>
 </div>

 {/* Danger Notice Box */}
 <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
 <div className="flex size-5 shrink-0 items-center justify-center rounded-lg  bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 mt-0.5">
 <AlertTriangle className="size-3 text-rose-600" />
 </div>
 <div className="flex-1">
 Data pegawai <strong>"{deleteTarget.nama_lengkap}"</strong> akan dihapus secara permanen dari server. Riwayat tugas, presensi, dan jadwal terkait akan terpengaruh.
 </div>
 </div>

 <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 pt-1 select-none">
 <input
 type="checkbox"
 checked={hasConfirmedDeleteCheck}
 onChange={(e) => setHasConfirmedDeleteCheck(e.target.checked)}
 className="size-4 rounded-md border-emerald-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
 />
 <span>Saya memahami konsekuensi penghapusan permanen ini.</span>
 </label>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <AppButton variant="ghost" size="md" disabled={deleteMutation.isPending} onClick={() => setDeleteTarget(null)}>Batal</AppButton>

 <button
 type="button"
 disabled={!hasConfirmedDeleteCheck || deleteMutation.isPending}
 onClick={() => deleteMutation.mutate(deleteTarget.id)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-5 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
 >
 {deleteMutation.isPending ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
 ) : (
 <div className="flex size-4 items-center justify-center rounded-md bg-white/20">
 <Trash2 className="size-3 text-rose-600" strokeWidth={2.2} />
 </div>
 )}
 <span>{deleteMutation.isPending ? 'Menghapus...' : 'Hapus Permanen'}</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* 9. MODAL DASHBOARD IMPORT PEGAWAI — Harmonized Batch Modal UI/UX */}
 <AnimatePresence>
 {showImportModal && canImportEmployee && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md print:hidden"
 role="dialog"
 aria-modal="true"
 aria-labelledby="employee-import-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget) {
 setShowImportModal(false)
 setImportFile(null)
 setImportPreviewData([])
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
 <div className="rounded-xl bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-[#059669] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#10B981]">
 <Upload className="h-5 w-5" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="employee-import-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Import Data Pegawai & Tendik</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Batch Import
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Unggah berkas spreadsheet (.xlsx, .xls, atau .csv) untuk impor direktori pegawai massal
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => {
 setShowImportModal(false)
 setImportFile(null)
 setImportPreviewData([])
 }}
 aria-label="Tutup form import"
 className="size-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-sky-950/60 dark:text-sky-300 transition-colors cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Modal Body */}
 <div className="modal-body min-h-0 flex-1 space-y-4.5 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
 {/* Unduh Template Card */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-4 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <div className="flex items-center gap-3">
 <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100/70 text-[#059669] dark:bg-emerald-950/60 dark:text-[#10B981] shrink-0">
 <Download className="size-4.5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Format Berkas</p>
 <p className="text-xs text-slate-500 dark:text-slate-400">Gunakan berkas template resmi agar kolom master terpetakan otomatis</p>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => handleDownloadTemplatePegawaiFormat('xlsx')}
 className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-50 transition-all dark:border-emerald-800/60 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 cursor-pointer"
 >
 <Download className="size-3.5" />
 <span>Excel (.xlsx)</span>
 </button>
 <button
 type="button"
 onClick={() => handleDownloadTemplatePegawaiFormat('csv')}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition-all dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 <Download className="size-3.5" />
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
 Mendukung format Microsoft Excel (.xlsx, .xls) & CSV (Maks. 5MB)
 </p>
 {importFile && (
 <div
 className="mt-3 flex items-center justify-center gap-2 flex-wrap"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60">
 <CheckCircle2 className="size-3.5" />
 <span>{(importFile.size / 1024).toFixed(1)} KB · Berkas Siap Diunggah</span>
 </div>
 <button
 type="button"
 onClick={handleClearImportFile}
 className="inline-flex items-center gap-1 rounded-full bg-rose-100/90 hover:bg-rose-200 px-3 py-1 text-xs font-bold text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/80 dark:hover:bg-rose-900/80 dark:text-rose-300 dark:border-emerald-800/60 transition-all cursor-pointer shadow-2xs active:scale-95"
 title="Hapus / Clear berkas pilihan"
 >
 <Trash2 className="size-3.5 text-rose-600 dark:text-rose-400" />
 <span>Clear Berkas</span>
 </button>
 </div>
 )}
 <input
 ref={importFileInputRef}
 type="file"
 accept=".csv, .xlsx, .xls"
 onChange={handleFileSelect}
 className="hidden"
 />
 </label>

 {/* Rincian Ringkasan & Verifikasi Data (KPI Metrics) */}
 {importPreviewData.length > 0 && (
 <div className="space-y-3.5">
 {/* KPI Cards Ringkasan */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 {/* Total Baris */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-3 dark:border-emerald-800/60 dark:bg-sky-950/20">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300">Total Terbaca</span>
 <FileSpreadsheet className="size-3.5 text-sky-600 dark:text-sky-400" />
 </div>
 <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
 {importPreviewStats.total} <span className="text-xs font-semibold text-slate-500">baris</span>
 </p>
 </div>

 {/* Pegawai Baru */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-3 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-[#059669] dark:text-emerald-400">Pegawai Baru</span>
 <UserPlus className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 </div>
 <p className="mt-1 text-lg font-black text-[#059669] dark:text-emerald-300">
 {importPreviewStats.newCount} <span className="text-xs font-semibold text-emerald-600/70">orang</span>
 </p>
 </div>

 {/* Data Sudah Ada / Update */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-3 dark:border-emerald-800/60 dark:bg-amber-950/20">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Sudah Ada (Update)</span>
 <RefreshCcw className="size-3.5 text-amber-600 dark:text-amber-400" />
 </div>
 <p className="mt-1 text-lg font-black text-amber-800 dark:text-amber-300">
 {importPreviewStats.updateCount} <span className="text-xs font-semibold text-amber-700/70">orang</span>
 </p>
 </div>

 {/* Duplikat / Perlu Cek */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-3 dark:border-emerald-800/60 dark:bg-rose-950/20">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">Perlu Dicek</span>
 <AlertTriangle className="size-3.5 text-rose-600 dark:text-rose-400" />
 </div>
 <p className="mt-1 text-lg font-black text-rose-700 dark:text-rose-300">
 {importPreviewStats.duplicateCount + importPreviewStats.invalidCount} <span className="text-xs font-semibold text-rose-600/70">baris</span>
 </p>
 </div>
 </div>

 {/* Header Pratinjau & Filter Tabs */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <button
 type="button"
 onClick={() => setImportPreviewFilter('all')}
 className={cn(
 "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
 importPreviewFilter === 'all'
 ? "bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xs"
 : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300"
 )}
 >
 Semua ({importPreviewStats.total})
 </button>
 <button
 type="button"
 onClick={() => setImportPreviewFilter('new')}
 className={cn(
 "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
 importPreviewFilter === 'new'
 ? "bg-emerald-600 text-white shadow-xs"
 : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
 )}
 >
 <span className="size-1.5 rounded-full bg-emerald-400" />
 <span>Pegawai Baru ({importPreviewStats.newCount})</span>
 </button>
 <button
 type="button"
 onClick={() => setImportPreviewFilter('update')}
 className={cn(
 "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
 importPreviewFilter === 'update'
 ? "bg-amber-600 text-white shadow-xs"
 : "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300"
 )}
 >
 <span className="size-1.5 rounded-full bg-amber-400" />
 <span>Sudah Ada / Update ({importPreviewStats.updateCount})</span>
 </button>
 {(importPreviewStats.duplicateCount > 0 || importPreviewStats.invalidCount > 0) && (
 <button
 type="button"
 onClick={() => setImportPreviewFilter('issue')}
 className={cn(
 "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
 importPreviewFilter === 'issue'
 ? "bg-rose-600 text-white shadow-xs"
 : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300"
 )}
 >
 <span className="size-1.5 rounded-full bg-rose-400" />
 <span>Duplikat / Masalah ({importPreviewStats.duplicateCount + importPreviewStats.invalidCount})</span>
 </button>
 )}
 </div>

 <button
 type="button"
 onClick={handleClearImportFile}
 className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:underline cursor-pointer self-end sm:self-auto"
 title="Hapus / Clear berkas pilihan"
 >
 <Trash2 className="size-3" />
 <span>Clear Berkas</span>
 </button>
 </div>

 {/* Tabel Rincian Data Preview */}
 <div className="max-h-56 overflow-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xs dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <TableRoot className="w-full text-left text-xs">
 <TableHeader className="sticky top-0 z-10 bg-white dark:bg-card-dark border-b border-emerald-200/80 dark:border-emerald-800/60 dark:from-emerald-950/90 dark:via-teal-950/80 dark:to-emerald-950/90 dark:border-emerald-800/60 font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
 <TableRow>
 <TableHead className="px-3 py-2.5">NIY / NIK</TableHead>
 <TableHead className="px-3 py-2.5">Nama Pegawai</TableHead>
 <TableHead className="px-3 py-2.5">Jabatan & Unit</TableHead>
 <TableHead className="px-3 py-2.5">Status Verifikasi & Rincian</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredPreviewData.length === 0 ? (
 <TableRow>
 <TableCell colSpan={4} className="p-4 text-center text-slate-400 italic">
 Tidak ada data untuk kategori filter ini.
 </TableCell>
 </TableRow>
 ) : (
 filteredPreviewData.map((r, i) => (
 <TableRow key={i} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-colors">
 <TableCell className="px-3 py-2.5 font-mono text-[10px] text-slate-700 dark:text-slate-300">
 <div className="flex items-center gap-1.5">
 <span className="font-sans font-bold text-slate-400 text-[10px]">#{r.rowNum}</span>
 <span className="font-extrabold text-slate-900 dark:text-white">{r.niy}</span>
 </div>
 {r.nik !== '-' && (
 <p className="text-[9px] text-slate-400 mt-0.5">NIK: {r.nik}</p>
 )}
 </TableCell>
 <TableCell className="px-3 py-2.5">
 <p className="font-bold text-slate-900 dark:text-white">{r.nama}</p>
 <p className="text-[10px] text-slate-400 mt-0.5">{r.statusPegawai} · {r.noHp !== '-' ? r.noHp : r.email}</p>
 </TableCell>
 <TableCell className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
 <p className="font-semibold">{r.jabatan}</p>
 <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{r.unit}</p>
 </TableCell>
 <TableCell className="px-3 py-2.5">
 <div className="space-y-1">
 <span className={cn(
 "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
 r.type === 'new'
 ? "bg-emerald-100 text-[#059669] border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60"
 : r.type === 'update'
 ? "bg-amber-100 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/80 dark:text-amber-300 dark:border-emerald-800/60"
 : "bg-rose-100 text-rose-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/80 dark:text-rose-300 dark:border-emerald-800/60"
 )}>
 {r.type === 'new' && <UserPlus className="size-2.5" />}
 {r.type === 'update' && <RefreshCcw className="size-2.5" />}
 {r.type !== 'new' && r.type !== 'update' && <AlertTriangle className="size-2.5" />}
 <span>{r.statusLabel}</span>
 </span>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
 {r.note}
 </p>
 </div>
 </TableCell>
 </TableRow>
 ))
 )}
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
 <span>Timpa data jika NIY / NIK / Email sudah terdaftar</span>
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
 Jika dicentang, profil pegawai dengan NIY, NIK, atau Email yang cocok akan diperbarui (ditimpa) dengan isi data terbaru dari berkas. Jika tidak dicentang, baris duplikat akan dilewati dengan aman tanpa mengubah data yang ada.
 </p>
 </div>
 </label>
 </div>

 {/* Guidance Banner */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30 flex items-start gap-2.5">
 <ShieldCheck className="size-4.5 text-[#059669] dark:text-emerald-400 shrink-0 mt-0.5" />
 <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-1">
 <p className="font-bold text-[#059669] dark:text-emerald-300">
 Verifikasi Anti-Duplikasi Otomatis (NIY / NIK / Email):
 </p>
 <p>
 Sistem secara otomatis mendeteksi primary key kepegawaian. Jika data sudah ada di sistem dan mode timpa aktif, profil pegawai akan diperbarui tanpa membuat duplikasi baris baru ataupun menghapus riwayat penugasan/sertifikasi yang telah ada.
 </p>
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <AppButton variant="ghost" size="md" icon={X} onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreviewData([]); }}>Batal</AppButton>
 <AppButton variant="primary" size="md" icon={Upload} loading={isImporting} disabled={!importFile || isImporting || importPreviewData.length === 0} onClick={handleProcessImport}>{isImporting ? "Memproses Impor..." : `Proses Impor (${importPreviewData.length} Pegawai)`}</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── MODAL HASIL IMPOR & PEMBERITAHUAN DATA DUPLIKAT PEGAWAI ── */}
 <AnimatePresence>
 {duplicateModalData && (
 <div
 className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="pegawai-duplicate-report-title"
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
 <RefreshCcw className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
 ) : (
 <CheckCircle2 className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
 )}
 </div>
 <div>
 <h3 id="pegawai-duplicate-report-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Hasil Impor & Pemberitahuan Data Pegawai</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 Total {duplicateModalData.total || 0} Data
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Ringkasan sinkronisasi dan status pemrosesan data pegawai & guru
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
 <span>Daftar Data yang Sama (NIY / NIK / Email Cocok)</span>
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
 <TableHead className="px-3 py-2">NIY / NIK</TableHead>
 <TableHead className="px-3 py-2">Nama Pegawai</TableHead>
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
 <AppButton variant="primary" size="md" icon={CheckCircle2} onClick={() => setDuplicateModalData(null)}>Tutup & Mengerti</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* 6. STAT CARD SUMMARY DETAIL MODAL */}
 {statCardModal.isOpen && (
 <div className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:static print:bg-white print:p-0 print:block" role="dialog" aria-modal="true">
 <div className="modal-dialog w-full max-w-4xl bg-white dark:bg-card-dark rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:p-0 print:w-full">
 {/* Printable Header Kop for Popup Datatable */}
 <div className="hidden print:block border-b border-emerald-200/80 pb-2 mb-3 text-slate-900 text-left">
 <h1 className="text-base font-semibold uppercase tracking-tight leading-tight">
 {statCardModal.title || 'Laporan Detail Statistik Data Pegawai / Tendik SIT'}
 </h1>
 <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-tight">
 Sekolah Islam Terpadu — Unit: {selectedUnitName || 'Semua Unit'} {selectedJabatanName ? `| Jabatan: ${selectedJabatanName}` : ''}
 </p>
 <div className="flex justify-between text-[9px] text-slate-600 font-medium mt-1">
 <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
 <p>Total Terfilter: {statModalItems.length} Pegawai</p>
 </div>
 </div>

 <div className="flex items-center justify-between border-b pb-3 dark:border-emerald-800/60 shrink-0 print:hidden">
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
 <UsersRound className="size-5" />
 </div>
 <div>
 <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">{statCardModal.title}</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Daftar direktori pegawai terfilter berdasarkan kategori statistik.</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Badge color="success" size="sm">
 {isModalEmployeesLoading ? 'Memuat...' : `${statModalItems.length} Pegawai`}
 </Badge>
 <button
 type="button"
 onClick={() => { setStatCardModal({ isOpen: false, type: '', title: '', badge: '' }); setStatCardSearch('') }}
 className="rounded-xl p-2 bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 aria-label="Tutup Modal"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>
 </div>

 {/* Local Search Input */}
 <div className="shrink-0 print:hidden">
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Search className="size-4" />
 </div>
 <input
 type="text"
 value={statCardSearch}
 onChange={(e) => setStatCardSearch(e.target.value)}
 placeholder="Cari nama, NIY, NIK pegawai..."
 className="w-full h-9 pl-10 pr-4 text-xs font-semibold rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </div>

 {/* Table View */}
 <div className="flex-1 overflow-y-auto min-h-0 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl print:overflow-visible print:border-none">
 <TableRoot className="w-full text-left text-xs text-slate-700 dark:text-slate-300 print:w-full print:border-collapse">
 <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="p-3">Nama Pegawai & NIY</TableHead>
 <TableHead className="p-3">Jabatan</TableHead>
 <TableHead className="p-3">Unit Kerja</TableHead>
 <TableHead className="p-3 text-center">Status</TableHead>
 <TableHead className="p-3 text-right print:hidden">Aksi</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-slate-800 print:divide-slate-300">
 {isModalEmployeesLoading ? (
 <TableRow>
 <TableCell colSpan={5} className="p-8 text-center text-slate-400">
 <div className="flex items-center justify-center gap-2">
 <Spinner size="sm" />
 <span>Memuat direktori pegawai...</span>
 </div>
 </TableCell>
 </TableRow>
 ) : statModalItems.length === 0 ? (
 <TableRow>
 <TableCell colSpan={5} className="p-6 text-center text-slate-400 italic">
 Tidak ada data pegawai yang sesuai.
 </TableCell>
 </TableRow>
 ) : (
 statModalItems.map((emp) => {
 const fullName = getEmployeeFullName(emp)
 return (
 <TableRow key={emp.id || emp.niy} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition">
 <TableCell className="p-3">
 <EmployeeHoverCard
 employee={emp}
 onClick={() => {
 setDetailEmployee(emp)
 setActiveDetailTab('Identitas')
 }}
 >
 <div
 onClick={() => {
 setDetailEmployee(emp)
 setActiveDetailTab('Identitas')
 }}
 className="flex items-center gap-2.5 cursor-pointer"
 >
 <PersonAvatar src={getEmployeePhotoUrl(emp)} name={fullName} size="sm" />
 <div>
 <p className="font-extrabold text-slate-900 dark:text-white hover:text-emerald-600 transition">{fullName}</p>
 <p className="font-mono text-[10px] text-slate-400">NIY: {emp.niy || '-'}</p>
 </div>
 </div>
 </EmployeeHoverCard>
 </TableCell>
 <TableCell className="p-3 font-semibold">{emp.jabatan_name || '-'}</TableCell>
 <TableCell className="p-3 font-bold text-emerald-700 dark:text-emerald-400 print:text-slate-900">{emp.unit_name || '-'}</TableCell>
 <TableCell className="p-3 text-center">
 <AppBadge variant={emp.status === 'Aktif' ? 'success' : 'danger'} size="xs">
 {emp.status || 'Aktif'}
 </AppBadge>
 </TableCell>
 <TableCell className="p-3 text-right print:hidden">
 <Button
 type="button"
 size="xs"
 variant="ghost"
 onClick={() => {
 setDetailEmployee(emp)
 setActiveDetailTab('Identitas')
 setStatCardModal({ isOpen: false, type: '', title: '', badge: '' })
 }}
 className="px-2.5 py-1 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition dark:bg-purple-950/60 dark:text-purple-300 cursor-pointer"
 >
 Detail
 </Button>
 </TableCell>
 </TableRow>
 )
 })
 )}
 </TableBody>
 </TableRoot>
 </div>

 <div className="flex items-center justify-between pt-3 shrink-0 border-t border-emerald-200/80 dark:border-emerald-800/60 print:hidden">
 <AppButton variant="outline" size="sm" icon={Printer} onClick={handlePrintStatCardModal}>Cetak Tabel Popup</AppButton>

 <AppButton variant="danger" size="sm" icon={X} onClick={() => { setStatCardModal({ isOpen: false, type: '', title: '', badge: '' }); setStatCardSearch(''); }}>Tutup</AppButton>
 </div>
 </div>
 </div>
 )}

 {/* Floating Smart Scroll Navigator (Option A) */}
 <div className="fixed right-6 bottom-24 z-40 print:hidden group">
 <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out whitespace-nowrap rounded-xl bg-slate-900/90 dark:bg-slate-100/95 backdrop-blur-md px-3 py-1.5 text-xs font-extrabold dark:text-slate-900 shadow-xl border border-emerald-200/80 dark:border-emerald-300/50">
 <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/90 dark:border-l-slate-100/95" />
 <span>{isScrolledDown ? 'Kembali ke Paling Atas' : 'Langsung ke Tabel Pegawai'}</span>
 </div>

 <button
 type="button"
 onClick={handleQuickScroll}
 aria-label={isScrolledDown ? 'Kembali ke Paling Atas' : 'Langsung ke Tabel Pegawai'}
 className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xl shadow-xs/60 dark:border-emerald-800/60 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
 >
 <AnimatePresence mode="wait">
 {isScrolledDown ? (
 <motion.div
 key="arrow-up"
 initial={{ opacity: 0, y: 6, rotate: -45 }}
 animate={{ opacity: 1, y: 0, rotate: 0 }}
 exit={{ opacity: 0, y: -6, rotate: 45 }}
 transition={{ duration: 0.18 }}
 >
 <ArrowUp className="size-5 text-slate-600" strokeWidth={2.5} />
 </motion.div>
 ) : (
 <motion.div
 key="arrow-down"
 initial={{ opacity: 0, y: -6, rotate: 45 }}
 animate={{ opacity: 1, y: 0, rotate: 0 }}
 exit={{ opacity: 0, y: 6, rotate: -45 }}
 transition={{ duration: 0.18 }}
 >
 <ArrowDown className="size-5 text-amber-600" strokeWidth={2.5} />
 </motion.div>
 )}
 </AnimatePresence>
 </button>
 </div>

 </PageContainer>
 )
}
