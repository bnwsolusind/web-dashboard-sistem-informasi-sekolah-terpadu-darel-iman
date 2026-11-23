import CustomSelect from "../components/ui/CustomSelect"
import React, { useState, useMemo } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import {
  Shield,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Lock,
  Key,
  Users,
  CheckCircle,
  Save,
  UserCheck,
  UserX,
  UserCog,
  Building,
  Briefcase,
  ArrowRight,
  Layers,
  ShieldCheck,
  Sparkles,
  ShieldAlert,
  Printer,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react'
import {
  cn
} from '../lib/utils'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  hakAksesService
} from '../services/hakAksesService'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  getModulLabel,
  getPermissionLabel
} from '../utils/permissionTranslations'
import UserAccountManagement from '../components/auth/UserAccountManagement'
import {
  ROLES,
  hasAnyRole,
  getTierForRole,
  canEditRole,
  getEditableTiers,
  getUserRoleLevel,
  ROLE_LEVELS,
  isFoundationUser
} from '../auth/portalResolver'
import {
  SmartScrollFab
} from '../components/common'
import {
  useAuthStore
} from '../stores/authStore'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import {
  ActionDropdown,
  useToast
} from '../components/app'
import {
  printCleanTable,
  downloadPdfTable,
  resolveFoundationName
} from '../utils/printHelper'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import {
  handleApiExport,
  downloadFileFromApi
} from '../utils/exportUtils'
import {
  SquircleActionButton,
  PrintOptionModal,
  MasterFilterSelect
} from '../components/master-data'
import {
  PageToolbarActions,
  StandardSubTabs,
  KpiStatCard,
  AppButton,
  IconButton,
  AppInput,
  AppSelect,
  AppCheckbox
} from '../components/app'
import {
  Button
} from '../components/ui/button'
import {
  Input
} from '../components/ui/input'
import {
  Badge
} from '../components/ui/badge'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import HeroUiHeader from '../components/ui/HeroUiHeader'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'

// ─────────────────────────────────────────────────────────────────────────────
// KONSTANTA & METADATA PERAN & TIER
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_ROLE_NAMES = [
 ...ROLES.SUPER_ADMIN,
 ...ROLES.ADMIN,
 ...ROLES.YAYASAN,
]

const GLOBAL_ACCESS_PERMISSIONS = [
 'sistem.hak_akses',
 'sistem.master_data',
 'sistem.pengaturan',
 'permission.manage',
 'role.manage',
 'employee.view_all',
 'employee.create',
 'employee.delete',
 'employee.import',
 'unit.view_all',
 'unit.create',
 'unit.update',
 'unit.delete',
 'master.create',
 'master.update',
 'master.delete',
]

const TIER_COLOR_MAP = {
 red: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800/60' },
 purple: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-emerald-200/80 dark:border-emerald-800/60' },
 blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-emerald-200/80 dark:border-emerald-800/60' },
 emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200/80 dark:border-emerald-800/60' },
 sky: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-emerald-200/80 dark:border-emerald-800/60' },
 amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-emerald-200/80 dark:border-emerald-800/60' },
 teal: { bg: 'bg-emerald-50 text-emerald-700  dark:bg-emerald-50/70', text: 'text-emerald-700 dark:text-emerald-300  dark:text-emerald-700 dark:text-emerald-300 ', border: 'border-emerald-200/80  dark:border-emerald-200/80 dark:border-emerald-800/60' },
 gray: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', border: 'border-emerald-200/80 dark:border-emerald-700/80' },
}

const SCOPE_LABEL = {
 global: { text: 'Global', bg: 'bg-violet-50 text-violet-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950/40 dark:text-violet-300 dark:border-emerald-800/60' },
 unit: { text: 'Per Unit', bg: 'bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-emerald-800/60' },
 external: { text: 'Eksternal', bg: 'bg-slate-100 text-slate-600 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80' },
}

const applyRoleDefaultPermissions = (targetRoleName, availablePermList = []) => {
 if (!targetRoleName) return []
 if (targetRoleName === 'Super Admin') return availablePermList

 const roleKeywordMap = {
 'Admin': ['hak_akses', 'master', 'pegawai', 'siswa', 'unit', 'laporan', 'user', 'role'],
 'Pengurus Yayasan': ['yayasan', 'divisi', 'laporan', 'berita', 'pegawai', 'siswa', 'unit', 'rekap'],
 'Kepala Sekolah': ['dashboard', 'laporan', 'absensi', 'akademik', 'tahfizh', 'mutabaah', 'pegawai', 'siswa', 'rapor'],
 'Divisi Pendidikan': ['dashboard', 'laporan', 'kurikulum', 'lms', 'akademik', 'siswa', 'pegawai', 'capaian'],
 'Guru': ['dashboard', 'absensi', 'akademik', 'lms', 'tahfizh', 'mutabaah', 'siswa'],
 'Musyrif': ['dashboard', 'absensi', 'asrama', 'mutabaah', 'pelanggaran', 'kedisiplinan'],
 'Musyrif Asrama': ['dashboard', 'absensi', 'asrama', 'mutabaah', 'pelanggaran', 'kedisiplinan'],
 'Wali Kelas': ['dashboard', 'absensi', 'akademik', 'rapor', 'siswa', 'laporan'],
 'Tata Usaha': ['dashboard', 'siswa', 'pegawai', 'surat', 'laporan', 'administrasi'],
 'Guru Tahfizh': ['dashboard', 'tahfizh', 'hafalan', 'setoran', 'mutabaah', 'laporan'],
 'Konselor / BK': ['dashboard', 'bk', 'konseling', 'siswa', 'laporan'],
 'Pustakawan': ['dashboard', 'perpustakaan', 'buku', 'peminjaman'],
 }

 const keywords = roleKeywordMap[targetRoleName] || [targetRoleName.toLowerCase().replace(/\s+/g, '_')]
 return availablePermList.filter((perm) =>
 keywords.some((kw) => perm.toLowerCase().includes(kw.toLowerCase()))
 )
}

const ROLE_GROUPS = {
 pimpinan: {
 label: 'Pimpinan & Yayasan',
 roles: ['Super Admin', 'Admin', 'Pengurus Yayasan'],
 badgeColor: 'bg-purple-100 text-purple-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-emerald-800/60',
 },
 manajemen: {
 label: 'Manajemen Sekolah',
 roles: ['Kepala Sekolah', 'Divisi Pendidikan', 'Waka Kurikulum', 'Waka Kesiswaan', 'Waka Sarpras', 'Waka Humas', 'Waka Al-Quran'],
 badgeColor: 'bg-blue-100 text-blue-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-emerald-800/60',
 },
 pendidik: {
 label: 'Tenaga Pendidik',
 roles: ['Guru', 'Wali Kelas', 'Guru Tahfizh', 'Guru Pendamping', 'Guru BK'],
 badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
 },
 kepengasuhan: {
 label: 'Kepengasuhan & Asrama',
 roles: ['Musyrif', 'Musyrif Asrama', 'Pembina Asrama', 'Koordinator Asrama'],
 badgeColor: 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60',
 },
 pendukung: {
 label: 'Staf Pendukung',
 roles: ['Tata Usaha', 'Konselor / BK', 'Pustakawan', 'Laboran', 'Bendahara Unit', 'Operator Sekolah'],
 badgeColor: 'bg-slate-100 text-slate-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80',
 },
 custom: {
 label: 'Kustom / Tambahan',
 roles: [],
 badgeColor: 'bg-emerald-50 text-emerald-700 dark:text-emerald-300  border-emerald-300 dark:border-emerald-800  dark:bg-emerald-50/70 dark:text-emerald-700 dark:text-emerald-300  dark:border-emerald-800/60 ',
 },
}

const getRoleCategoryGroup = (roleName) => {
 for (const [key, group] of Object.entries(ROLE_GROUPS)) {
 if (group.roles.includes(roleName)) {
 return { id: key, ...group }
 }
 }
 return { id: 'custom', ...ROLE_GROUPS.custom }
}

const getSmartDefaultRole = (emp, roleList = []) => {
 if (emp?.primary_role && emp.primary_role !== 'Belum Ada Role') {
 return emp.primary_role
 }
 const pos = (emp?.position?.nama || '').toLowerCase()
 if (pos.includes('kepala sekolah') || pos.includes('kepsek')) return roleList.find((r) => r === 'Kepala Sekolah') || 'Kepala Sekolah'
 if (pos.includes('divisi')) return roleList.find((r) => r === 'Divisi Pendidikan') || 'Divisi Pendidikan'
 if (pos.includes('tahfizh')) return roleList.find((r) => r === 'Guru Tahfizh') || 'Guru Tahfizh'
 if (pos.includes('musyrif') || pos.includes('asrama')) return roleList.find((r) => r === 'Musyrif Asrama' || r === 'Musyrif') || 'Musyrif Asrama'
 if (pos.includes('wali kelas')) return roleList.find((r) => r === 'Wali Kelas') || 'Wali Kelas'
 if (pos.includes('bk') || pos.includes('konselor')) return roleList.find((r) => r === 'Konselor / BK') || 'Konselor / BK'
 if (pos.includes('pustakawan') || pos.includes('perpustakaan')) return roleList.find((r) => r === 'Pustakawan') || 'Pustakawan'
 if (pos.includes('tu') || pos.includes('tata usaha') || pos.includes('staf')) return roleList.find((r) => r === 'Tata Usaha') || 'Tata Usaha'
 return roleList.find((r) => r === 'Guru') || roleList[0] || 'Guru'
}

const PROJECT_DEFAULT_ROLES = [
 'Super Admin',
 'Admin',
 'Pengurus Yayasan',
 'Kepala Sekolah',
 'Divisi Pendidikan',
 'Guru',
 'Musyrif',
 'Wali Kelas',
 'Tata Usaha',
 'Guru Tahfizh',
 'Musyrif Asrama',
 'Konselor / BK',
 'Pustakawan',
 'Waka Kurikulum',
 'Waka Kesiswaan',
 'Waka Sarpras',
 'Waka Humas',
 'Waka Al-Quran',
 'Pembina Asrama',
 'Koordinator Asrama',
 'Laboran',
 'Bendahara Unit',
 'Operator Sekolah',
]

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONEN KPI METRIC CARD (HEROUI GOLD STANDARD)
// ─────────────────────────────────────────────────────────────────────────────
const KPI_THEMES = {
  emerald: {
    border: 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    bg: '!bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70',
    glow: 'from-emerald-500/20 via-teal-400/15 to-transparent',
    iconBox: '!bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white',
    tag: 'bg-white/90 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-emerald-900/80 dark:text-emerald-200',
    val: 'text-emerald-800 dark:text-emerald-200',
    sub: 'text-emerald-700/90 dark:text-emerald-300/80',
    title: 'text-emerald-800 dark:text-emerald-300',
  },
  teal: {
    border: 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    bg: '!bg-teal-100/90 hover:!bg-teal-200/70 dark:!bg-teal-950/50 dark:hover:!bg-teal-950/70',
    glow: 'from-teal-500/20 via-cyan-400/15 to-transparent',
    iconBox: '!bg-teal-600 !text-white shadow-sm dark:!bg-teal-600 dark:!text-white',
    tag: 'bg-white/90 text-teal-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-teal-900/80 dark:text-teal-200',
    val: 'text-teal-800 dark:text-teal-200',
    sub: 'text-teal-700/90 dark:text-teal-300/80',
    title: 'text-teal-800 dark:text-teal-300',
  },
  blue: {
    border: 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    bg: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70',
    glow: 'from-blue-500/20 via-indigo-400/15 to-transparent',
    iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    tag: 'bg-white/90 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200',
    val: 'text-sky-800 dark:text-sky-200',
    sub: 'text-sky-700/90 dark:text-sky-300/80',
    title: 'text-sky-800 dark:text-sky-300',
  },
  amber: {
    border: 'border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    bg: '!bg-amber-100/90 hover:!bg-amber-200/70 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70',
    glow: 'from-amber-500/20 via-orange-400/15 to-transparent',
    iconBox: '!bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white',
    tag: 'bg-white/90 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-amber-900/80 dark:text-amber-200',
    val: 'text-amber-800 dark:text-amber-200',
    sub: 'text-amber-700/90 dark:text-amber-300/80',
    title: 'text-amber-800 dark:text-amber-300',
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



// ─────────────────────────────────────────────────────────────────────────────
// HALAMAN UTAMA MASTER HAK AKSES & ROLE
// ─────────────────────────────────────────────────────────────────────────────
export default function MasterHakAksesPage() {
 const queryClient = useQueryClient()
 const { user } = useAuthStore()
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)
 const userRoles = useMemo(() => user?.roles || (user?.role ? [user.role] : []), [user])

 const userLevel = getUserRoleLevel(user)
 const userPermissions = useMemo(() => (Array.isArray(user?.permissions) ? user.permissions : []), [user])
 const isFoundation = isFoundationUser(user)
 const isSuperAdmin = userLevel === ROLE_LEVELS.SUPER_ADMIN // Level 1
 const hasGlobalAccessPerm = userPermissions.some((p) => ['sistem.hak_akses', 'permission.manage', 'role.manage'].includes(p))
 const hasUnitAccessPerm = userPermissions.includes('employee.role_access.manage')
 const canViewGlobalAccess = isFoundation || userLevel <= ROLE_LEVELS.YAYASAN || hasGlobalAccessPerm // Yayasan & Admin boleh lihat tab roles & permissions
 const canManageGlobalAccess = !isFoundation && (isSuperAdmin || hasGlobalAccessPerm)
 const canManageUnitAccess = !isFoundation && !canManageGlobalAccess && hasUnitAccessPerm
 const canManageAccess = canManageGlobalAccess || canManageUnitAccess

 const [activeTab, setActiveTab] = useState(canViewGlobalAccess ? 'roles' : 'pegawai')
 const [roleCategoryFilter, setRoleCategoryFilter] = useState('semua')
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [page, setPage] = useState(1)
 const [selectedUnitId, setSelectedUnitId] = useState('')
 const [statusFilter, setStatusFilter] = useState('')
 const [selectedMatrixGroup, setSelectedMatrixGroup] = useState('semua')
 const [selectedRoleFilter, setSelectedRoleFilter] = useState('')

 // Toast Notifications
 const toast = useToast()
 const notify = (title, message = '', type = 'success') => {
 toast(title, message, type)
 }

 // Modals state
 const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
 const [selectedRole, setSelectedRole] = useState(null)
 const [isPermModalOpen, setIsPermModalOpen] = useState(false)
 const [isPegawaiModalOpen, setIsPegawaiModalOpen] = useState(false)
 const [selectedEmployee, setSelectedEmployee] = useState(null)
 const [deleteTargetRole, setDeleteTargetRole] = useState(null)
 const [deleteTargetPerm, setDeleteTargetPerm] = useState(null)
 const [pendingRoleData, setPendingRoleData] = useState(null)
 const [showSaveRoleConfirmModal, setShowSaveRoleConfirmModal] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

 // Query Units
 const { data: unitsData = {} } = useQuery({
 queryKey: ['education-units-filter'],
 queryFn: () => educationUnitService.getUnits({ per_page: 100 }),
 staleTime: 60000,
 })
 const educationUnits = unitsData?.data || []

 // Query Stats
 const { data: stats = {} } = useQuery({
 queryKey: ['hak-akses-stats'],
 queryFn: hakAksesService.getStats,
 staleTime: 30000,
 })

 // Query Roles
 const { data: rolesData = {}, isLoading: isLoadingRoles } = useQuery({
 queryKey: ['hak-akses-roles', debouncedSearch, roleCategoryFilter],
 queryFn: () => hakAksesService.getDaftarRole({ search: debouncedSearch }),
 enabled: activeTab === 'roles' && canViewGlobalAccess,
 staleTime: 30000,
 })

 // Query Permissions
 const { data: permData = {}, isLoading: isLoadingPerms } = useQuery({
 queryKey: ['hak-akses-permissions', debouncedSearch],
 queryFn: () => hakAksesService.getDaftarPermission({ search: debouncedSearch }),
 enabled: activeTab === 'permissions' && canViewGlobalAccess,
 staleTime: 60000,
 })

 const { data: allPermData = {} } = useQuery({
 queryKey: ['hak-akses-permissions-all'],
 queryFn: () => hakAksesService.getDaftarPermission({ per_page: 1000 }),
 enabled: canViewGlobalAccess,
 staleTime: 60000,
 })

 const { data: allRolesData = {} } = useQuery({
 queryKey: ['hak-akses-roles-all'],
 queryFn: () => hakAksesService.getDaftarRole({ per_page: 100 }),
 enabled: canViewGlobalAccess,
 staleTime: 60000,
 })

 const { data: navOptionsData = {} } = useQuery({
 queryKey: ['hak-akses-nav-options'],
 queryFn: hakAksesService.getNavigationOptions,
 enabled: canViewGlobalAccess,
 staleTime: 60000,
 })

 // Query Pegawai
 const { data: pegawaiData = {}, isLoading: isLoadingPegawai, refetch: refetchPegawai } = useQuery({
 queryKey: [
 'hak-akses-pegawai',
 debouncedSearch,
 page,
 selectedUnitId,
 statusFilter,
 selectedMatrixGroup,
 selectedRoleFilter,
 ],
 queryFn: () => {
 const activeRoles = selectedRoleFilter
 ? undefined
 : selectedMatrixGroup !== 'semua'
 ? ROLE_GROUPS[selectedMatrixGroup]?.roles?.join(',')
 : undefined

 return hakAksesService.getPegawaiHakAkses({
 search: debouncedSearch,
 page,
 unit_id: selectedUnitId || undefined,
 status: statusFilter || undefined,
 role: selectedRoleFilter || undefined,
 roles: activeRoles,
 })
 },
 enabled: activeTab === 'pegawai',
 staleTime: 15000,
 })

 const backendRoles = rolesData?.data || []
 const allRoleRecords = allRolesData?.data || backendRoles
 const backendRoleNames = allRoleRecords.map((r) => (typeof r === 'string' ? r : r?.name || '')).filter(Boolean)
 const availableRoleNames = Array.from(new Set([...PROJECT_DEFAULT_ROLES, ...backendRoleNames]))
 const assignableRoleNames = canManageGlobalAccess
 ? availableRoleNames
 : availableRoleNames.filter((name) => {
 const dbRec = allRoleRecords.find((r) => (typeof r === 'string' ? r : r?.name) === name)
 if (dbRec && typeof dbRec === 'object') {
 if (dbRec.scope_type === 'global' || dbRec.can_manage_global_access || Number(dbRec.level ?? 99) <= 2) {
 return false
 }
 }
 return !hasAnyRole([name], GLOBAL_ROLE_NAMES)
 })

 const permissionsGrouped = permData?.data || []
 const allPerms = permData?.flat_list || allPermData?.flat_list || []
 const allPermsForAssignment = allPermData?.flat_list || allPerms
 const assignablePerms = canManageGlobalAccess
 ? allPermsForAssignment
 : allPermsForAssignment.filter((p) => !GLOBAL_ACCESS_PERMISSIONS.includes(p))

 // Construct complete roles list combining backend DB roles & default roles
 const dbRoleNamesSet = new Set(backendRoles.map((r) => r.name))
 const defaultSeededRoles = PROJECT_DEFAULT_ROLES.filter((name) => !dbRoleNamesSet.has(name)).map((name) => {
 const group = getRoleCategoryGroup(name)
 const tier = getTierForRole(name)
 return {
 id: `default-${name.toLowerCase().replace(/\s+/g, '-')}`,
 name,
 description: `Peran standar terintegrasi: ${group.label}`,
 permissions: applyRoleDefaultPermissions(name, allPermsForAssignment),
 jumlah_izin: applyRoleDefaultPermissions(name, allPermsForAssignment).length,
 jumlah_pengguna: 0,
 is_default_preset: true,
 tier,
 }
 })

 const mergedAllRoles = [...backendRoles, ...defaultSeededRoles]

 const filteredRoles = mergedAllRoles.filter((r) => {
 if (debouncedSearch && !r.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
 if (roleCategoryFilter !== 'semua') {
 const cat = getRoleCategoryGroup(r.name)
 if (cat.id !== roleCategoryFilter) return false
 }
 return true
 })

 const listPegawai = pegawaiData?.data || []
 const metaPegawai = pegawaiData?.meta || {}

 // ─────────────────────────────────────────────────────────────────────────────
 // MUTATIONS DENGAN TOASTFEEDBACK (ZERO SWEETALERT2)
 // ─────────────────────────────────────────────────────────────────────────────
 const tambahRoleMutation = useMutation({
 mutationFn: (payload) => hakAksesService.tambahRole(payload),
 onSuccess: (res) => {
 queryClient.invalidateQueries(['hak-akses-roles'])
 queryClient.invalidateQueries(['hak-akses-roles-all'])
 queryClient.invalidateQueries(['hak-akses-stats'])
 queryClient.invalidateQueries(['navigation-modules'])
 setIsRoleModalOpen(false)
 notify('Berhasil!', res?.message || 'Role baru berhasil ditambahkan.', 'success')
 },
 onError: (err) => {
 notify('Gagal!', err.response?.data?.message || 'Gagal menyimpan role baru.', 'danger')
 },
 })

 const ubahRoleMutation = useMutation({
 mutationFn: ({ id, payload }) => hakAksesService.ubahRole({ id, payload }),
 onSuccess: (res) => {
 queryClient.invalidateQueries(['hak-akses-roles'])
 queryClient.invalidateQueries(['hak-akses-roles-all'])
 queryClient.invalidateQueries(['navigation-modules'])
 setIsRoleModalOpen(false)
 setSelectedRole(null)
 notify('Berhasil!', res?.message || 'Perubahan matriks role berhasil disimpan.', 'success')
 },
 onError: (err) => {
 notify('Gagal!', err.response?.data?.message || 'Gagal memperbarui role.', 'danger')
 },
 })

 const hapusRoleMutation = useMutation({
 mutationFn: (id) => hakAksesService.hapusRole(id),
 onSuccess: (res) => {
 queryClient.invalidateQueries(['hak-akses-roles'])
 queryClient.invalidateQueries(['hak-akses-roles-all'])
 queryClient.invalidateQueries(['hak-akses-stats'])
 queryClient.invalidateQueries(['navigation-modules'])
 setDeleteTargetRole(null)
 notify('Terhapus!', res?.message || 'Role berhasil dihapus.', 'success')
 },
 onError: (err) => {
 notify('Gagal!', err.response?.data?.message || 'Gagal menghapus role.', 'danger')
 },
 })

 const tambahPermMutation = useMutation({
 mutationFn: (payload) => hakAksesService.tambahPermission(payload),
 onSuccess: (res) => {
 queryClient.invalidateQueries(['hak-akses-permissions'])
 queryClient.invalidateQueries(['hak-akses-permissions-all'])
 queryClient.invalidateQueries(['hak-akses-stats'])
 queryClient.invalidateQueries(['navigation-modules'])
 setIsPermModalOpen(false)
 notify('Berhasil!', res?.message || 'Izin akses baru berhasil ditambahkan.', 'success')
 },
 onError: (err) => {
 notify('Gagal!', err.response?.data?.message || 'Gagal menyimpan izin akses.', 'danger')
 },
 })

 const hapusPermMutation = useMutation({
 mutationFn: (id) => hakAksesService.hapusPermission(id),
 onSuccess: () => {
 queryClient.invalidateQueries(['hak-akses-permissions'])
 queryClient.invalidateQueries(['hak-akses-permissions-all'])
 queryClient.invalidateQueries(['hak-akses-stats'])
 queryClient.invalidateQueries(['navigation-modules'])
 setDeleteTargetPerm(null)
 notify('Terhapus!', 'Izin akses berhasil dihapus.', 'success')
 },
 onError: (err) => {
 notify('Gagal!', err.response?.data?.message || 'Gagal menghapus izin akses.', 'danger')
 },
 })

 const assignPegawaiRoleMutation = useMutation({
 mutationFn: ({ employeeId, payload }) => hakAksesService.assignPegawaiRole({ employeeId, payload }),
 onSuccess: (res) => {
 queryClient.invalidateQueries(['hak-akses-pegawai'])
 queryClient.invalidateQueries(['hak-akses-roles'])
 queryClient.invalidateQueries(['hak-akses-roles-all'])
 queryClient.invalidateQueries(['hak-akses-stats'])
 queryClient.invalidateQueries(['navigation-modules'])
 setIsPegawaiModalOpen(false)
 setSelectedEmployee(null)
 notify('Berhasil!', res?.message || 'Hak akses pegawai berhasil diperbarui.', 'success')
 },
 onError: (err) => {
 notify('Gagal!', err.response?.data?.message || 'Gagal memperbarui hak akses pegawai.', 'danger')
 },
 })

 // Handlers
 const handleOpenCreateRole = () => {
 if (!canManageGlobalAccess) return
 setSelectedRole(null)
 setIsRoleModalOpen(true)
 }

 const handleRoleSubmit = (formData) => {
 if (!canManageGlobalAccess) return
 setPendingRoleData(formData)
 setShowSaveRoleConfirmModal(true)
 }

 const handleConfirmSaveRole = () => {
 if (!pendingRoleData) return
 if (selectedRole?.id && !String(selectedRole.id).startsWith('default-')) {
 ubahRoleMutation.mutate({ id: selectedRole.id, payload: pendingRoleData })
 } else {
 tambahRoleMutation.mutate(pendingRoleData)
 }
 setShowSaveRoleConfirmModal(false)
 }

 const handleOpenEditRole = async (role) => {
 const { allowed } = canEditRole(userRoles, role.name)
 if (!allowed) return
 if (role?.id && !String(role.id).startsWith('default-')) {
 try {
 const detail = await hakAksesService.getDetailRole(role.id)
 setSelectedRole(detail)
 } catch {
 setSelectedRole(role)
 }
 } else {
 setSelectedRole(role)
 }
 setIsRoleModalOpen(true)
 }

 const handleDeleteRole = (role) => {
 const tier = getTierForRole(role.name)
 if (role.is_system_protected || tier?.isProtected || role.is_default_preset) {
 notify('Role Dilindungi', 'Role bawaan sistem tidak dapat dihapus.', 'warning')
 return
 }
 setDeleteTargetRole(role)
 }

 const handleConfirmDeleteRole = () => {
 if (!deleteTargetRole) return
 hapusRoleMutation.mutate(deleteTargetRole.id)
 }

 const handleDeletePerm = (perm) => {
 setDeleteTargetPerm(perm)
 }

 const handleConfirmDeletePerm = () => {
 if (!deleteTargetPerm) return
 hapusPermMutation.mutate(deleteTargetPerm.id)
 }

 const handleOpenPegawaiModal = (emp) => {
 setSelectedEmployee(emp)
 setIsPegawaiModalOpen(true)
 }

 const resetFilters = () => {
 setSearch('')
 setSelectedUnitId('')
 setRoleCategoryFilter('semua')
 setStatusFilter('')
 setSelectedMatrixGroup('semua')
 setSelectedRoleFilter('')
 setPage(1)
 }

 const hasActiveFilters = Boolean(
 search ||
 selectedUnitId ||
 roleCategoryFilter !== 'semua' ||
 statusFilter ||
 selectedMatrixGroup !== 'semua' ||
 selectedRoleFilter
 )

 // Tab definitions
 const tabs = [
 {
 key: 'pegawai',
 label: 'Akses Pegawai',
 count: metaPegawai.total !== undefined ? metaPegawai.total : (stats.total_pegawai_unit ?? 0),
 icon: Users,
 description: 'Penugasan role dan otoritas akun staf yayasan',
 },
 {
 key: 'akun',
 label: 'Manajemen Akun',
 count: 'Akun Login',
 icon: UserCog,
 description: 'Pembuatan akun, aktivasi, dan reset password kredensial',
 },
 ...(canViewGlobalAccess
 ? [
 {
 key: 'roles',
 label: 'Matriks Peran & Role',
 count: `${stats.total_role || 0} Role`,
 icon: Shield,
 description: 'Struktur kelompok peran (RBAC) dan pemetaan izin sistem',
 },
 {
 key: 'permissions',
 label: 'Katalog Hak Akses',
 count: `${stats.total_permission || 0} Izin`,
 icon: Key,
 description: 'Katalog aksi dan modul yang terproteksi dalam sistem',
 },
 ]
 : []),
 ]

 // Print Data Builder
 const handlePrintClick = () => {
 setIsPrintModalOpen(true)
 }

 const handleDoPrint = (isPdf = false) => {
 const activeTabLabel = tabs.find((t) => t.key === activeTab)?.label || 'Hak Akses'
 const printTitle = `Laporan Hak Akses & Matriks Role - ${activeTabLabel}`

 let columns = []
 let rows = []

 if (activeTab === 'pegawai') {
 columns = ['No', 'Nama Pegawai', 'NIY', 'Email', 'Jabatan', 'Unit', 'Status Akun', 'Role Saat Ini']
 rows = listPegawai.map((emp, i) => [
 i + 1,
 emp.nama_lengkap,
 emp.niy || '-',
 emp.email || '-',
 emp.position?.nama || '-',
 emp.unit?.nama || '-',
 emp.has_user ? 'Terhubung' : 'Belum Punya Akun',
 emp.primary_role || 'Guru',
 ])
 } else if (activeTab === 'roles') {
 columns = ['No', 'Nama Role', 'Kelompok', 'Tier', 'Scope', 'Jumlah Izin', 'Pengguna']
 rows = filteredRoles.map((r, i) => {
 const cat = getRoleCategoryGroup(r.name)
 const tier = getTierForRole(r.name)
 return [
 i + 1,
 r.name,
 cat.label,
 tier?.label || '-',
 tier?.scope ? SCOPE_LABEL[tier.scope]?.text : 'Global',
 r.permissions?.length || r.jumlah_izin || 0,
 r.jumlah_pengguna || 0,
 ]
 })
 } else {
 columns = ['No', 'Modul', 'Nama Permission', 'Deskripsi']
 rows = allPerms.map((p, i) => [
 i + 1,
 p.split('.')[0] || 'Umum',
 p,
 getPermissionLabel(p),
 ])
 }

 if (isPdf) {
 downloadPdfTable({
 title: printTitle,
 subtitle: `Dareliman Edu - ${foundationName}`,
 columns,
 rows,
 filename: `rekap_hak_akses_${activeTab}.pdf`,
 })
 } else {
 printCleanTable({
 title: printTitle,
 subtitle: `Dareliman Edu - ${foundationName}`,
 columns,
 rows,
 })
 }
 }

 return (
 <PageContainer maxW="7xl">

 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Laporan Hak Akses & Matriks Role"
 onConfirmPrint={() => handleDoPrint(false)}
 onConfirmDownloadPdf={() => handleDoPrint(true)}
 />

 <div className="space-y-6">
 {/* Breadcrumb Kanonikal */}
 <AppBreadcrumb
 items={[
 { href: '/dashboard', label: 'Dashboard' },
 { href: '/dashboard/master-data', label: 'Master Data' },
 { label: 'Hak Akses & Role' },
 ]}
 />

 {/* ── HERO HEADER CARD (HEROUI BENCHMARK STYLE) ── */}
      <HeroUiHeader
        title="Manajemen Hak Akses & Matriks Role"
        subtitle="Kelola penugasan peran (role), izin modul (permissions), matriks otoritas sistem, serta akun login civitas sekolah secara terpusat."
        icon={ShieldCheck}
        roleTag="RBAC Keamanan"
        badge="Matriks Akses"
      />

 

 {/* ── MASTER STATS KPI GRID (4 KARTU MODERN) ── */}
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
 <ModernKpiCard
 label="Total Role Sistem"
 value={stats.total_role ?? 0}
 subtext="Kelompok peran terdaftar"
 tag="RBAC"
 variant="emerald"
 icon={Shield}
 />
 <ModernKpiCard
 label="Izin Akses (Permissions)"
 value={stats.total_permission ?? 0}
 subtext="Modul & aksi terproteksi"
 tag="Aksi"
 variant="teal"
 icon={Key}
 />
 <ModernKpiCard
 label="Pegawai Tercover"
 value={metaPegawai.total !== undefined ? metaPegawai.total : (stats.total_pegawai_unit ?? 0)}
 subtext="Civitas staf & guru yayasan"
 tag="Civitas"
 variant="blue"
 icon={Users}
 />
 <ModernKpiCard
 label="Role Belum Digunakan"
 value={stats.role_tanpa_user ?? 0}
 subtext="Peran tanpa penugasan aktif"
 tag="Arsip"
 variant="amber"
 icon={ShieldAlert}
 />
 </div>

 {/* ── FILTER JENIS DATA: CANONICAL SEGMENTED TAB BAR ── */}
 <div id="tabel-master-hak-akses" className="scroll-mt-6 print:hidden">
 <StandardSubTabs
 tabs={tabs}
 activeTab={activeTab}
 onChange={(key) => {
 setActiveTab(key)
 setSearch('')
 setPage(1)
 }}
 />
 </div>

 {/* ── TAB 1: AKSES PEGAWAI ── */}
 {activeTab === 'pegawai' && (
 <AppDataTable
 title="Akses Pegawai"
 description="Penetapan peran, otoritas akun, dan hak akses staf civitas sekolah."
 badge={`${metaPegawai.total !== undefined ? metaPegawai.total : listPegawai.length} pegawai`}
 icon={Users}
 actions={
 <PageToolbarActions
 onPrint={handlePrintClick}
 onRefresh={() => refetchPegawai()}
 />
 }
 searchValue={search}
 onSearchChange={(v) => {
 setSearch(v)
 setPage(1)
 }}
 searchPlaceholder="Cari nama pegawai, NIY, atau email..."
 filterOptions={
 <>
 <MasterFilterSelect
 aria-label="Filter Unit Pendidikan"
 value={selectedUnitId}
 onChange={(e) => {
 setSelectedUnitId(e.target.value)
 setPage(1)
 }}
 >
 <option value="">Semua Unit Pendidikan</option>
 {educationUnits.map((u) => (
 <option key={u.id} value={u.id}>
 {u.name || u.nama_unit || u.code}
 </option>
 ))}
 </MasterFilterSelect>

 <MasterFilterSelect
 aria-label="Filter Matriks Kelompok Peran"
 value={selectedMatrixGroup}
 onChange={(e) => {
 setSelectedMatrixGroup(e.target.value)
 setSelectedRoleFilter('')
 setPage(1)
 }}
 >
 <option value="semua">Semua Matriks Peran</option>
 <option value="pimpinan">Pimpinan & Yayasan</option>
 <option value="manajemen">Manajemen Sekolah</option>
 <option value="pendidik">Tenaga Pendidik</option>
 <option value="kepengasuhan">Kepengasuhan & Asrama</option>
 <option value="pendukung">Staf Pendukung</option>
 </MasterFilterSelect>

 <MasterFilterSelect
 aria-label="Filter Role / Status Peran"
 value={selectedRoleFilter}
 onChange={(e) => {
 setSelectedRoleFilter(e.target.value)
 setPage(1)
 }}
 >
 <option value="">Semua Role / Status Peran</option>
 {(selectedMatrixGroup !== 'semua'
 ? ROLE_GROUPS[selectedMatrixGroup]?.roles || []
 : availableRoleNames
 ).map((r) => (
 <option key={r} value={r}>
 {r}
 </option>
 ))}
 </MasterFilterSelect>

 <MasterFilterSelect
 aria-label="Filter Status Akun"
 value={statusFilter}
 onChange={(e) => {
 setStatusFilter(e.target.value)
 setPage(1)
 }}
 >
 <option value="">Semua Status Akun</option>
 <option value="has_user">Sudah Punya Akun (Terhubung)</option>
 <option value="no_user">Belum Punya Akun</option>
 </MasterFilterSelect>
 </>
 }
 onResetFilters={resetFilters}
 hasActiveFilters={hasActiveFilters}
 isLoading={isLoadingPegawai}
 isEmpty={!isLoadingPegawai && listPegawai.length === 0}
 emptyTitle={hasActiveFilters ? "Data Pegawai Tidak Ditemukan" : "Belum Ada Data Pegawai"}
 emptyDescription={hasActiveFilters ? "Coba sesuaikan kata kunci pencarian atau opsi filter aktif." : "Belum ada data pegawai yang terdaftar dalam sistem. Kelola data pegawai di menu Master Pegawai."}
 page={page}
 totalPages={metaPegawai.last_page || 1}
 totalItems={metaPegawai.total !== undefined ? metaPegawai.total : listPegawai.length}
 itemsPerPage={metaPegawai.per_page || 15}
 onPageChange={setPage}
 serverControlled
 renderTable={() => (
 <div className="w-full overflow-x-auto">
 <TableRoot className="w-full min-w-[950px] border-collapse text-left text-xs" aria-label="Tabel Akses Pegawai">
                      <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
                        <TableRow>
                          <TableHead className="px-4 py-3.5 font-black text-xs uppercase tracking-wider">Data Pegawai & Civitas</TableHead>
                          <TableHead className="px-4 py-3.5 font-black text-xs uppercase tracking-wider">Jabatan & Unit Sekolah</TableHead>
                          <TableHead className="w-40 px-4 py-3.5 text-center font-black text-xs uppercase tracking-wider">Status Akun Login</TableHead>
                          <TableHead className="px-4 py-3.5 font-black text-xs uppercase tracking-wider">Role & Otoritas Sistem</TableHead>
                          <TableHead className="w-28 px-4 py-3.5 text-right select-none" />
                        </TableRow>
                      </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
 {listPegawai.map((emp, idx) => {
 const displayRole = getSmartDefaultRole(emp, availableRoleNames)
 const isDefault = !emp.primary_role || emp.primary_role === 'Belum Ada Role'
 const isProtected = displayRole === 'Super Admin' || displayRole === 'Admin'
 const initials = (emp.nama_lengkap || 'P')
 .split(' ')
 .map((n) => n[0])
 .slice(0, 2)
 .join('')
 .toUpperCase()

 return (
 <TableRow key={emp.id} className="hover:bg-emerald-50/35 dark:hover:bg-emerald-950/20 transition-colors">

 {/* Data Pegawai */}
 <TableCell className="px-4 py-3.5">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 font-black text-xs shadow-xs">
 {initials}
 </div>
 <div className="min-w-0">
 <p className="font-black text-slate-900 dark:text-white text-sm truncate">
 {emp.nama_lengkap}
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 NIY: <span className="font-bold text-slate-700 dark:text-slate-300">{emp.niy || '-'}</span> • {emp.email || '-'}
 </p>
 </div>
 </div>
 </TableCell>

 {/* Jabatan & Unit */}
 <TableCell className="px-4 py-3.5">
 <div className="space-y-1">
 <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
 <Briefcase className="size-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
 <span>{emp.position?.nama || '-'}</span>
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
 <Building className="size-3.5 text-slate-400 shrink-0" />
 <span>{emp.unit?.nama || 'Seluruh Unit / Pusat'}</span>
 </p>
 </div>
 </TableCell>

 {/* Status Akun */}
 <TableCell className="px-4 py-3.5 text-center">
 {emp.has_user ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800/80 shadow-2xs">
 <UserCheck className="size-3" />
 Terhubung
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-extrabold text-amber-800 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
 <UserX className="size-3" />
 Belum Punya Akun
 </span>
 )}
 </TableCell>

 {/* Role Otoritas */}
 <TableCell className="px-4 py-3.5">
 <span
 className={cn(
 'inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-black border shadow-2xs',
 isProtected
 ? 'bg-amber-50 border-emerald-200/80 dark:border-emerald-800/60 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 dark:border-emerald-800/60'
 : isDefault
 ? 'bg-sky-50 border-emerald-200/80 dark:border-emerald-800/60 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200 dark:border-emerald-800/60'
 : 'bg-emerald-50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800/60'
 )}
 >
 {isProtected ? (
 <Lock className="size-3.5 text-amber-700 dark:text-amber-400" />
 ) : (
 <Shield className="size-3.5 text-emerald-700 dark:text-emerald-400" />
 )}
 <span>{displayRole}</span>
 {isDefault && <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">(Default)</span>}
 </span>
 </TableCell>

 {/* Aksi */}
 <TableCell className="px-4 py-3.5 text-center">
 {canManageAccess ? (
 <AppButton variant="outline" size="xs" icon={UserCog} onClick={() => handleOpenPegawaiModal(emp)}>Atur Akses</AppButton>
 ) : (
 <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
 <Lock className="size-3" /> Hanya Lihat
 </span>
 )}
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </TableRoot>
 </div>
 )}
 />
 )}

 {/* ── TAB 2: MATRIKS PERAN & ROLE ── */}
 {activeTab === 'roles' && canViewGlobalAccess && (
 <AppDataTable
 title="Matriks Peran & Role"
 description="Definisi kelompok peran (RBAC), tier otoritas, dan pemetaan izin akses sistem."
 badge={`${mergedAllRoles.length} role`}
 icon={Shield}
 actions={
 <PageToolbarActions
 onPrint={handlePrintClick}
 primaryAction={
 canManageGlobalAccess
 ? {
 label: 'Tambah Role',
 icon: Plus,
 onClick: handleOpenCreateRole,
 }
 : null
 }
 />
 }
 searchValue={search}
 onSearchChange={(v) => setSearch(v)}
 searchPlaceholder="Cari nama role sistem..."
 filterOptions={
 <MasterFilterSelect
 aria-label="Filter Kelompok Role"
 value={roleCategoryFilter}
 onChange={(e) => setRoleCategoryFilter(e.target.value)}
 >
 <option value="semua">Semua Kelompok Role</option>
 {Object.entries(ROLE_GROUPS).map(([key, g]) => (
 <option key={key} value={key}>
 {g.label}
 </option>
 ))}
 </MasterFilterSelect>
 }
 onResetFilters={resetFilters}
 hasActiveFilters={hasActiveFilters}
 isLoading={isLoadingRoles}
 isEmpty={!isLoadingRoles && filteredRoles.length === 0}
 emptyTitle="Role Tidak Ditemukan"
 emptyDescription="Sesuaikan kata kunci pencarian atau kategori kelompok role."
 page={1}
 totalPages={1}
 totalItems={filteredRoles.length}
 itemsPerPage={filteredRoles.length || 1}
 renderTable={() => (
 <div className="w-full overflow-x-auto">
 <TableRoot className="w-full min-w-[950px] border-collapse text-left text-xs" aria-label="Tabel Matriks Role">
                      <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
                        <TableRow>
                          <TableHead className="px-4 py-3.5 font-black text-xs uppercase tracking-wider">Nama Role & Kelompok</TableHead>
                          <TableHead className="w-36 px-4 py-3.5 text-center font-black text-xs uppercase tracking-wider">Tier & Cakupan</TableHead>
                          <TableHead className="w-32 px-4 py-3.5 text-center font-black text-xs uppercase tracking-wider">Pengguna & Izin</TableHead>
                          <TableHead className="px-4 py-3.5 font-black text-xs uppercase tracking-wider">Izin Akses Terdaftar</TableHead>
                          <TableHead className="w-24 px-4 py-3.5 text-right select-none" />
                        </TableRow>
                      </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
 {filteredRoles.map((role, idx) => {
 const categoryGroup = getRoleCategoryGroup(role.name)
 const tier = getTierForRole(role.name)
 const colors = tier ? TIER_COLOR_MAP[tier.color] || TIER_COLOR_MAP.gray : TIER_COLOR_MAP.emerald
 const dbScopeMap = {
 global: { text: 'Lintas Semua Unit', bg: 'bg-indigo-50 text-indigo-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-emerald-800/60' },
 cross_unit: { text: 'Lintas Unit Binaan', bg: 'bg-sky-50 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-800/60' },
 education_unit: { text: 'Per Unit Sekolah', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60' },
 own_assignments: { text: 'Penugasan / Kelas', bg: 'bg-emerald-50 text-emerald-700 dark:text-emerald-300  border-emerald-300 dark:border-emerald-800  dark:bg-emerald-50/70 dark:text-emerald-700 dark:text-emerald-300  dark:border-emerald-800/60 ' },
 linked_children: { text: 'Data Anak Wali', bg: 'bg-amber-50 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60' },
 self: { text: 'Data Pribadi', bg: 'bg-slate-100 text-slate-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80' },
 }
 const scopeInfo = (role.scope_type && dbScopeMap[role.scope_type]) || (tier ? SCOPE_LABEL[tier.scope] || SCOPE_LABEL.global : SCOPE_LABEL.unit)
 const { allowed } = canEditRole(userRoles, role.name)
 const isProtected = Boolean(role.is_system_protected || tier?.isProtected)

 return (
 <TableRow key={role.id || role.name} className="hover:bg-emerald-50/35 dark:hover:bg-emerald-950/20 transition-colors">

 {/* Nama Role & Kelompok */}
 <TableCell className="px-4 py-3.5">
 <div className="flex items-center gap-3">
 <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs', colors.bg, colors.border)}>
 <Shield className={cn('size-5', colors.text)} />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <strong className="text-sm font-black text-slate-900 dark:text-white">
 {role.name}
 </strong>
 {role.is_default_preset && (
 <span className="rounded-md bg-emerald-50 text-emerald-700  px-1.5 py-0.5 text-[9px] font-black text-emerald-700 dark:text-emerald-300  border-2 border-emerald-300 dark:border-emerald-800  dark:bg-emerald-50/70 dark:text-emerald-700 dark:text-emerald-300  dark:border-emerald-800/60 ">
 Bawaan Sistem
 </span>
 )}
 {!tier && !role.is_default_preset && (
 <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
 Role Dinamis
 </span>
 )}
 </div>
 <div className="mt-1 flex items-center gap-1.5 flex-wrap">
 <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold border', categoryGroup.badgeColor)}>
 {tier ? categoryGroup.label : (role.portal_group || 'Staf Dinamis')}
 </span>
 {role.default_route && (
 <code className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
 {role.default_route}
 </code>
 )}
 </div>
 {role.description && (
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
 {role.description}
 </p>
 )}
 </div>
 </div>
 </TableCell>

 {/* Tier & Cakupan */}
 <TableCell className="px-4 py-3.5 text-center">
 <div className="flex flex-col items-center gap-1">
 {role.level ? (
 <span className="rounded-full px-2 py-0.5 text-[9px] font-black border bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60">
 Tingkat {role.level}
 </span>
 ) : null}
 {tier ? (
 <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-black border', colors.bg, colors.text, colors.border)}>
 {tier.label}
 </span>
 ) : null}
 <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold border', scopeInfo.bg)}>
 {scopeInfo.text}
 </span>
 {role.is_read_only && (
 <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 border border-emerald-200/80 dark:border-emerald-800/60 px-1.5 py-0.2 text-[9px] font-black text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60">
 Mode Baca
 </span>
 )}
 {role.use_custom_menu_access && (
 <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 text-emerald-700  border-2 border-emerald-300 dark:border-emerald-800  px-1.5 py-0.2 text-[9px] font-black text-emerald-700 dark:text-emerald-300  dark:bg-emerald-50/70 dark:text-emerald-700 dark:text-emerald-300  dark:border-emerald-800/60 ">
 {(role.allowed_menu_ids || []).length} Menu Kustom
 </span>
 )}
 {isProtected && (
 <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 px-1.5 py-0.2 text-[9px] font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border-emerald-800/60">
 <Lock className="size-2.5" /> Terproteksi
 </span>
 )}
 </div>
 </TableCell>

                          {/* Pengguna & Izin */}
                          <TableCell className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-700/80 px-2 py-0.5 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                                <Users className="size-3 text-slate-400" />
                                {role.jumlah_pengguna ?? 0} user
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 text-[11px] font-black text-blue-800 dark:text-blue-300">
                                <Key className="size-2.5" />
                                {role.permissions?.length ?? role.jumlah_izin ?? 0} izin
                              </span>
                            </div>
                          </TableCell>

 {/* Izin Akses Chips */}
 <TableCell className="px-4 py-3.5">
 <div className="flex flex-wrap gap-1">
 {(role.permissions || []).slice(0, 3).map((p) => (
 <span
 key={p}
 className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300"
 title={p}
 >
 {getPermissionLabel(p)}
 </span>
 ))}
 {(role.permissions || []).length > 3 && (
 <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
 +{(role.permissions || []).length - 3} lainnya
 </span>
 )}
 {(role.permissions || []).length === 0 && (
 <span className="text-xs italic text-slate-400">Belum ada izin</span>
 )}
 </div>
 </TableCell>

 {/* Aksi */}
 <TableCell className="px-4 py-3.5 text-center">
 {!allowed ? (
 <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
 <Lock className="size-3" /> Hanya Lihat
 </span>
 ) : (
 <div className="flex items-center justify-center gap-1.5">
 <IconButton icon={Pencil} tooltip="Edit Matriks Izin Role" variant="edit" onClick={() => handleOpenEditRole(role)} />
 {!isProtected && !role.is_default_preset && (
 <IconButton icon={Trash2} tooltip="Hapus Role" variant="danger" onClick={() => handleDeleteRole(role)} />
 )}
 </div>
 )}
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </TableRoot>
 </div>
 )}
 />
 )}

 {/* ── TAB 3: KATALOG HAK AKSES (PERMISSIONS) ── */}
 {activeTab === 'permissions' && canViewGlobalAccess && (
 <AppDataTable
 title="Katalog Hak Akses (Permissions)"
 description="Katalog seluruh hak akses granular dan kontrol otoritas per modul pada aplikasi."
 badge={`${allPerms.length} izin`}
 icon={Key}
 actions={
 <PageToolbarActions
 onPrint={handlePrintClick}
 primaryAction={
 canManageGlobalAccess
 ? {
 label: 'Tambah Izin',
 icon: Plus,
 onClick: () => setIsPermModalOpen(true),
 }
 : null
 }
 />
 }
 searchValue={search}
 onSearchChange={(v) => setSearch(v)}
 searchPlaceholder="Cari nama izin akses (misal: siswa.view, rapor.cetak)..."
 onResetFilters={resetFilters}
 hasActiveFilters={Boolean(search)}
 isLoading={isLoadingPerms}
 isEmpty={!isLoadingPerms && permissionsGrouped.length === 0}
 emptyTitle="Izin Akses Tidak Ditemukan"
 emptyDescription="Sesuaikan kata kunci pencarian modul atau nama permission."
 page={1}
 totalPages={1}
 totalItems={allPerms.length}
 itemsPerPage={allPerms.length || 1}
 renderTable={() => (
 <div className="p-4 sm:p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {permissionsGrouped.map((group) => {
 const modulName = group.modul || 'Lainnya'
 const perms = group.permissions || []

 return (
 <div
 key={modulName}
 className="flex flex-col overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] shadow-xs"
 >
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <Key className="size-4 text-emerald-700 dark:text-emerald-400" />
 <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
 {getModulLabel(modulName)}
 </h2>
 </div>
 <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300">
 {perms.length}
 </span>
 </div>

 <div className="flex-1 divide-y divide-emerald-100/80 dark:divide-emerald-900/40 p-3 space-y-1.5 overflow-y-auto max-h-72">
 {perms.map((p) => {
 const pName = typeof p === 'string' ? p : p.name
 const pId = typeof p === 'object' ? p.id : p
 return (
 <div key={pName} className="flex items-center justify-between py-1.5 group">
 <div className="min-w-0 pr-2">
 <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate">
 {getPermissionLabel(pName)}
 </p>
 <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate block">
 {pName}
 </code>
 </div>
 {typeof p === 'object' && pId && (
 <button
 type="button"
 onClick={() => handleDeletePerm(p)}
 className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-all"
 title="Hapus Izin"
 >
 <Trash2 className="size-3.5" />
 </button>
 )}
 </div>
 )
 })}
 </div>
 </div>
 )
 })}
 </div>
 )}
 />
 )}

 {/* ── TAB 4: MANAJEMEN AKUN LOGIN ── */}
 {activeTab === 'akun' && (
 <div className="space-y-4">
 {educationUnits.length > 0 && (
 <div className="flex flex-col gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-[#1B2433]">
 <div className="flex items-center gap-2">
 <Building className="size-4 text-emerald-700 dark:text-emerald-400" />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
 Filter Unit Pendidikan Akun:
 </span>
 </div>
 <HeroUiFilterSelect
 value={selectedUnitId}
 onChange={(val) => {
 setSelectedUnitId(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Unit Akses Anda' },
 ...educationUnits.map((u) => ({
 value: String(u.id),
 label: u.name || u.nama_unit || u.code,
 })),
 ]}
 placeholder="Semua Unit Akses Anda"
 icon={Building}
 ariaLabel="Filter unit pendidikan akun"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[220px]"
 />
 </div>
 )}
 <UserAccountManagement
 roles={assignableRoleNames}
 unitId={selectedUnitId}
 canManageGlobalAccess={canManageGlobalAccess}
 canManageUnitAccess={canManageUnitAccess}
 />
 </div>
 )}
 </div>

 {/* ── MODAL: ROLE FORM MODAL (HARMONIZED) ── */}
 <RoleFormModal
 isOpen={isRoleModalOpen}
 onClose={() => {
 setIsRoleModalOpen(false)
 setSelectedRole(null)
 }}
 onSubmit={handleRoleSubmit}
 initialData={selectedRole}
 allPermissions={allPerms}
 navOptions={navOptionsData}
 canAssignGlobalRole={isSuperAdmin}
 isSubmitting={tambahRoleMutation.isPending || ubahRoleMutation.isPending}
 />

 {/* ── MODAL: PERMISSION FORM MODAL (HARMONIZED) ── */}
 <PermissionFormModal
 isOpen={isPermModalOpen}
 onClose={() => setIsPermModalOpen(false)}
 onSubmit={(payload) => tambahPermMutation.mutate(payload)}
 isSubmitting={tambahPermMutation.isPending}
 />

 {/* ── MODAL: PEGAWAI ROLE MODAL (HARMONIZED) ── */}
 <PegawaiRoleModal
 isOpen={isPegawaiModalOpen}
 onClose={() => {
 setIsPegawaiModalOpen(false)
 setSelectedEmployee(null)
 }}
 onSubmit={(data) => assignPegawaiRoleMutation.mutate(data)}
 employee={selectedEmployee}
 availableRoles={assignableRoleNames}
 allPermissions={assignablePerms}
 isSubmitting={assignPegawaiRoleMutation.isPending}
 />

 {/* ── MODAL: SAVE CONFIRMATION (z-[70]) ── */}
 <AnimatePresence>
 {showSaveRoleConfirmModal && (
 <div
 className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-md font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 p-2.5 shadow-md shadow-xs shrink-0">
 <ShieldCheck className="size-5" />
 </div>
 <div>
 <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 {selectedRole?.id ? 'Konfirmasi Perubahan Role' : 'Konfirmasi Simpan Role Baru'}
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Verifikasi izin sebelum disimpan ke sistem
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={() => setShowSaveRoleConfirmModal(false)} />
 </div>

 <div className="p-6 space-y-4">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40 text-xs">
 <p className="text-slate-500 font-bold">Nama Role Target:</p>
 <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{pendingRoleData?.name}</p>
 <p className="text-slate-500 font-bold mt-2">Jumlah Izin Terpilih:</p>
 <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
 {pendingRoleData?.permissions?.length || 0} Izin Akses
 </p>
 </div>

 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/40 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
 <Info className="size-4 text-emerald-700 shrink-0 mt-0.5" />
 <p className="leading-relaxed">
 Perubahan izin pada role ini akan langsung berlaku pada seluruh akun pengguna yang memegang role tersebut saat sesi login berikutnya.
 </p>
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <AppButton variant="ghost" size="md" onClick={() => setShowSaveRoleConfirmModal(false)}>Batal</AppButton>
 <button
 type="button"
 disabled={tambahRoleMutation.isPending || ubahRoleMutation.isPending}
 onClick={handleConfirmSaveRole}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-5 py-2.5 text-xs font-black shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
 >
 {tambahRoleMutation.isPending || ubahRoleMutation.isPending ? (
 <Loader2 className="size-4 animate-spin" />
 ) : (
 <CheckCircle2 className="size-4" strokeWidth={2.2} />
 )}
 <span>Ya, Simpan Matriks Role</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── MODAL: DELETE CONFIRMATION ROLE (z-[70]) ── */}
 <AnimatePresence>
 {deleteTargetRole && (
 <div
 className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-md font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 p-2.5 shadow-md shadow-xs shrink-0">
 <Trash2 className="size-5" />
 </div>
 <div>
 <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Hapus Role Permanen
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Tindakan ini tidak dapat dibatalkan
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={() => setDeleteTargetRole(null)} />
 </div>

 <div className="p-6 space-y-4">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-rose-950/30 text-xs">
 <p className="text-rose-600 font-bold">Role yang Akan Dihapus:</p>
 <p className="text-sm font-black text-rose-950 dark:text-rose-100 mt-0.5">{deleteTargetRole?.name}</p>
 <p className="text-slate-500 mt-1">Peran kustom ini akan dihapus dari sistem dan dicabut dari seluruh penugasan.</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-amber-950/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
 <AlertTriangle className="size-4 text-amber-700 shrink-0 mt-0.5" />
 <p className="leading-relaxed">
 Pastikan tidak ada pengguna aktif yang masih menggunakan role ini sebelum melakukan penghapusan.
 </p>
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <AppButton variant="ghost" size="md" onClick={() => setDeleteTargetRole(null)}>Batal</AppButton>
 <AppButton variant="danger" size="md" icon={Trash2} loading={hapusRoleMutation.isPending} onClick={handleConfirmDeleteRole}>Hapus Role Sekarang</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── MODAL: DELETE CONFIRMATION PERMISSION (z-[70]) ── */}
 <AnimatePresence>
 {deleteTargetPerm && (
 <div
 className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-md font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 p-2.5 shadow-md shadow-xs shrink-0">
 <Trash2 className="size-5" />
 </div>
 <div>
 <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Hapus Izin Akses
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Tindakan ini permanen
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={() => setDeleteTargetPerm(null)} />
 </div>

 <div className="p-6 space-y-4">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-rose-950/30 text-xs">
 <p className="text-rose-600 font-bold">Izin yang Akan Dihapus:</p>
 <p className="text-sm font-black text-rose-950 dark:text-rose-100 mt-0.5">
 {deleteTargetPerm?.name || deleteTargetPerm}
 </p>
 <p className="text-slate-500 mt-1">Izin akan dicabut dari seluruh role dan penugasan langsung.</p>
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <AppButton variant="ghost" size="md" onClick={() => setDeleteTargetPerm(null)}>Batal</AppButton>
 <AppButton variant="danger" size="md" icon={Trash2} loading={hapusPermMutation.isPending} onClick={handleConfirmDeletePerm}>Hapus Izin</AppButton>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Smart Floating Scroll Navigator (Opsi A) */}
 <SmartScrollFab targetId="tabel-master-hak-akses" downTooltip="Langsung ke Navigasi Tab Akses" />
 </PageContainer>
 )
}

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONEN MODAL FORM ROLE (HARMONIZED)
// ─────────────────────────────────────────────────────────────────────────────
function RoleFormModal({
 isOpen,
 onClose,
 onSubmit,
 initialData = null,
 allPermissions = [],
 navOptions = {},
 canAssignGlobalRole = false,
 isSubmitting = false,
}) {
 const isEdit = Boolean(initialData?.id && !String(initialData.id).startsWith('default-'))
 const [modalTab, setModalTab] = useState('policy') // 'policy' | 'permissions' | 'menus'
 const [name, setName] = useState('')
 const [description, setDescription] = useState('')
 const [level, setLevel] = useState(5)
 const [scopeType, setScopeType] = useState('education_unit')
 const [portalGroup, setPortalGroup] = useState('staff')
 const [defaultRoute, setDefaultRoute] = useState('/dashboard')
 const [isReadOnly, setIsReadOnly] = useState(false)
 const [canSwitchUnit, setCanSwitchUnit] = useState(false)
 const [isAboveTu, setIsAboveTu] = useState(false)
 const [canManageGlobalAccess, setCanManageGlobalAccess] = useState(false)
 const [useCustomMenuAccess, setUseCustomMenuAccess] = useState(false)
 const [selectedPerms, setSelectedPerms] = useState([])
 const [allowedMenuIds, setAllowedMenuIds] = useState([])
 const [searchPerm, setSearchPerm] = useState('')
 const [searchMenu, setSearchMenu] = useState('')
 const [expandedModuls, setExpandedModuls] = useState({})
 const [expandedNavModules, setExpandedNavModules] = useState({})

 const navModules = Array.isArray(navOptions?.modules) ? navOptions.modules : []
 const scopeOptions = Array.isArray(navOptions?.scope_options) && navOptions.scope_options.length > 0
 ? navOptions.scope_options
 : [
 { value: 'global', label: 'Global (Semua Unit Pendidikan)' },
 { value: 'cross_unit', label: 'Lintas Unit Terpilih (Divisi)' },
 { value: 'education_unit', label: 'Unit Pendidikan Sendiri' },
 { value: 'own_assignments', label: 'Penugasan / Kelas Sendiri' },
 { value: 'linked_children', label: 'Data Anak Terhubung (Wali)' },
 { value: 'self', label: 'Data Pribadi Sendiri' },
 ]
 const portalGroupOptions = Array.isArray(navOptions?.portal_group_options) && navOptions.portal_group_options.length > 0
 ? navOptions.portal_group_options
 : [
 { value: 'staff', label: 'Staf / Peran Kustom Internal' },
 { value: 'foundation', label: 'Yayasan (Eksekutif / Monitoring)' },
 { value: 'education', label: 'Divisi Pendidikan' },
 { value: 'principal', label: 'Kepala Sekolah' },
 { value: 'waka', label: 'Wakil Kepala Sekolah (Waka)' },
 { value: 'tu', label: 'Tata Usaha (TU)' },
 { value: 'operator', label: 'Operator Unit' },
 { value: 'teacher', label: 'Guru / Tenaga Pendidik' },
 { value: 'musyrif', label: 'Musyrif / Kepengasuhan Asrama' },
 { value: 'parent', label: 'Orang Tua / Wali Murid' },
 { value: 'student', label: 'Siswa / Santri' },
 { value: 'alumni', label: 'Alumni' },
 ]
 const routeOptions = Array.isArray(navOptions?.route_options) && navOptions.route_options.length > 0
 ? navOptions.route_options
 : [
 { value: '/dashboard', label: 'Dashboard Utama (/dashboard)' },
 { value: '/dashboard/pemantauan', label: 'Dashboard Pemantauan (/dashboard/pemantauan)' },
 { value: '/dashboard/yayasan', label: 'Dashboard Yayasan (/dashboard/yayasan)' },
 { value: '/dashboard/divisi-pendidikan', label: 'Dashboard Divisi Pendidikan (/dashboard/divisi-pendidikan)' },
 { value: '/dashboard/kepala-sekolah', label: 'Dashboard Kepala Sekolah (/dashboard/kepala-sekolah)' },
 { value: '/dashboard/waka-kurikulum', label: 'Dashboard Waka Kurikulum (/dashboard/waka-kurikulum)' },
 { value: '/dashboard/waka-kesiswaan', label: 'Dashboard Waka Kesiswaan (/dashboard/waka-kesiswaan)' },
 { value: '/dashboard/tata-usaha', label: 'Dashboard Tata Usaha (/dashboard/tata-usaha)' },
 { value: '/dashboard/operator', label: 'Dashboard Operator (/dashboard/operator)' },
 { value: '/portal-guru', label: 'Portal Guru (/portal-guru)' },
 { value: '/dashboard/musyrif', label: 'Dashboard Musyrif (/dashboard/musyrif)' },
 { value: '/portal-orangtua', label: 'Portal Orang Tua (/portal-orangtua)' },
 { value: '/portal-siswa', label: 'Portal Siswa (/portal-siswa)' },
 { value: '/portal/alumni', label: 'Portal Alumni (/portal/alumni)' },
 ]

 React.useEffect(() => {
 if (isOpen) {
 setModalTab('policy')
 if (initialData) {
 setName(initialData.name || '')
 setDescription(initialData.description || '')
 setLevel(initialData.level ?? 5)
 setScopeType(initialData.scope_type || 'education_unit')
 setPortalGroup(initialData.portal_group || 'staff')
 setDefaultRoute(initialData.default_route || '/dashboard')
 setIsReadOnly(Boolean(initialData.is_read_only))
 setCanSwitchUnit(Boolean(initialData.can_switch_unit))
 setIsAboveTu(Boolean(initialData.is_above_tu))
 setCanManageGlobalAccess(Boolean(initialData.can_manage_global_access))
 setUseCustomMenuAccess(Boolean(initialData.use_custom_menu_access))
 const currentPerms = (initialData.permissions || []).map((p) =>
 typeof p === 'string' ? p : p.name
 )
 setSelectedPerms(currentPerms)
 setAllowedMenuIds(Array.isArray(initialData.allowed_menu_ids) ? initialData.allowed_menu_ids : [])
 } else {
 setName('')
 setDescription('')
 setLevel(5)
 setScopeType('education_unit')
 setPortalGroup('staff')
 setDefaultRoute('/dashboard')
 setIsReadOnly(false)
 setCanSwitchUnit(false)
 setIsAboveTu(false)
 setCanManageGlobalAccess(false)
 setUseCustomMenuAccess(false)
 setSelectedPerms([])
 setAllowedMenuIds([])
 }
 setSearchPerm('')
 setSearchMenu('')
 }
 }, [isOpen, initialData])

 if (!isOpen) return null

 const grouped = allPermissions.reduce((acc, p) => {
 const pName = typeof p === 'string' ? p : p.name
 const modul = pName.split('.')[0] || 'umum'
 if (!acc[modul]) acc[modul] = []
 acc[modul].push(pName)
 return acc
 }, {})

 const allMenuIdsFlat = navModules.flatMap((m) => (m.menus || []).map((item) => item.id))

 const togglePerm = (perm) => {
 setSelectedPerms((prev) =>
 prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
 )
 }

 const toggleModulAll = (modulPerms, select) => {
 if (select) {
 setSelectedPerms((prev) => Array.from(new Set([...prev, ...modulPerms])))
 } else {
 setSelectedPerms((prev) => prev.filter((p) => !modulPerms.includes(p)))
 }
 }

 const toggleModulExpand = (modul) => {
 setExpandedModuls((prev) => ({ ...prev, [modul]: !prev[modul] }))
 }

 const toggleMenu = (menuId) => {
 setAllowedMenuIds((prev) =>
 prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
 )
 }

 const toggleNavModulAll = (menus, select) => {
 const ids = menus.map((m) => m.id)
 if (select) {
 setAllowedMenuIds((prev) => Array.from(new Set([...prev, ...ids])))
 } else {
 setAllowedMenuIds((prev) => prev.filter((id) => !ids.includes(id)))
 }
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 if (!name.trim()) return
 onSubmit({
 name: name.trim(),
 description: description.trim() || null,
 level: Number(level) || 5,
 scope_type: scopeType,
 portal_group: portalGroup,
 default_route: defaultRoute || '/dashboard',
 is_read_only: Boolean(isReadOnly),
 can_switch_unit: Boolean(canSwitchUnit),
 is_above_tu: Boolean(isAboveTu),
 can_manage_global_access: Boolean(canManageGlobalAccess),
 use_custom_menu_access: Boolean(useCustomMenuAccess),
 permissions: selectedPerms,
 allowed_menu_ids: allowedMenuIds,
 })
 }

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !isSubmitting) onClose()
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-4xl font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">
 {/* Top Accent Gradient Bar */}
 <div
 className={cn(
 'h-1.5 w-full shrink-0',
 isEdit
 ? 'bg-white dark:bg-[#1B2433]'
 : 'bg-white dark:bg-[#1B2433]'
 )}
 />

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232] shrink-0">
 <div className="flex items-center gap-3.5">
 <div
 className={cn(
 'rounded-xl text-white p-3 shadow-md shrink-0 border',
 isEdit
 ? 'bg-white dark:bg-[#1B2433] shadow-sm border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm border-emerald-300'
 )}
 >
 <Shield className="size-5" strokeWidth={2.25} />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
 {isEdit ? 'Ubah Matriks & Kebijakan Role' : 'Tambah Role Akses Dinamis'}
 </h2>
 <span
 className={cn(
 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black border',
 isEdit
 ? 'bg-amber-50 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60'
 : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
 )}
 >
 <Sparkles className="size-3" />
 {isEdit ? 'Edit Dinamis' : 'Role Dinamis'}
 </span>
 </div>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 Atur cakupan data, halaman awal, izin modul, serta daftar menu sidebar langsung dari database.
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting} />
 </div>

 {/* Sub-Tab Selector inside Modal */}
 <div className="flex items-center gap-2 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 px-6 py-2.5 dark:border-emerald-800/60 dark:bg-slate-900/50 shrink-0 overflow-x-auto">
 {[
 { id: 'policy', label: '1. Kebijakan & Scope' },
 { id: 'permissions', label: `2. Izin Modul (${selectedPerms.length})` },
 { id: 'menus', label: `3. Menu Sidebar (${useCustomMenuAccess ? allowedMenuIds.length : 'Otomatis'})` },
 ].map((t) => (
 <button
 key={t.id}
 type="button"
 onClick={() => setModalTab(t.id)}
 className={cn(
 'rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer',
 modalTab === t.id
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'bg-white text-slate-600 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-slate-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
 )}
 >
 {t.label}
 </button>
 ))}
 </div>

 {/* Form Content */}
 <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
 <div className="flex-1 space-y-4 overflow-y-auto p-6 text-slate-800 dark:text-slate-100">
 {modalTab === 'policy' && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Nama Role <span className="text-rose-500">*</span>
 </label>
 <div className="relative">
 <Shield className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-700 dark:text-emerald-400 z-10" />
 <AppInput
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Contoh: Koordinator Ekskul, Audit Mutu"
 className="w-full pl-10 pr-4"
 />
 </div>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Tingkat Tata Kelola (Level 1–9) <span className="text-rose-500">*</span>
 </label>
 <AppSelect
 value={level}
 onChange={(e) => setLevel(Number(e.target.value))}
 disabled={initialData?.name === 'Super Admin'}
 className="w-full"
 >
 <option value={1}>Tingkat 1 — Super Admin & Admin (IT & System Admin)</option>
 <option value={2}>Tingkat 2 — Pimpinan & Badan Hukum Yayasan</option>
 <option value={3}>Tingkat 3 — Operator & Tata Usaha (Pelaksana Administrasi)</option>
 <option value={4}>Tingkat 4 — Kepala Sekolah & Divisi Pendidikan (Pimpinan Satuan)</option>
 <option value={5}>Tingkat 5 — Tenaga Pendidik / Staf Khusus / Koordinator</option>
 <option value={6}>Tingkat 6 — Musyrif Asrama / Kepengasuhan</option>
 <option value={7}>Tingkat 7 — Orang Tua / Wali Murid</option>
 <option value={8}>Tingkat 8 — Siswa / Peserta Didik</option>
 <option value={9}>Tingkat 9 — Alumni Lembaga</option>
 </AppSelect>
 </div>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Deskripsi Peran (Opsional)
 </label>
 <AppInput
 type="text"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Ringkasan tugas dan wewenang peran ini..."
 className="w-full"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Cakupan Data (Scope)
 </label>
 <AppSelect
 value={scopeType}
 onChange={(e) => setScopeType(e.target.value)}
 disabled={!canAssignGlobalRole && scopeType === 'global'}
 className="w-full"
 >
 {scopeOptions.map((opt) => (
 <option key={opt.value} value={opt.value} disabled={opt.value === 'global' && !canAssignGlobalRole}>
 {opt.label}
 </option>
 ))}
 </AppSelect>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Grup Portal
 </label>
 <AppSelect
 value={portalGroup}
 onChange={(e) => setPortalGroup(e.target.value)}
 className="w-full"
 >
 {portalGroupOptions.map((opt) => (
 <option key={opt.value} value={opt.value} disabled={opt.value === 'super_admin' && !canAssignGlobalRole}>
 {opt.label}
 </option>
 ))}
 </AppSelect>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Halaman Awal (Default Route)
 </label>
 <AppSelect
 value={defaultRoute}
 onChange={(e) => setDefaultRoute(e.target.value)}
 className="w-full"
 >
 {routeOptions.map((opt) => (
 <option key={opt.value} value={opt.value}>
 {opt.label}
 </option>
 ))}
 </AppSelect>
 </div>
 </div>

 {/* Policy Switches */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
 <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-700/80 dark:bg-slate-900/50">
 <AppCheckbox
 id="role-is-read-only"
 checked={isReadOnly}
 disabled={initialData?.name === 'Super Admin'}
 onChange={(e) => setIsReadOnly(e.target.checked)}
 className="mt-0.5"
 />
 <label htmlFor="role-is-read-only" className="cursor-pointer select-none">
 <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Mode Baca Saja (Read-Only)</span>
 <span className="block text-xs text-slate-500 dark:text-slate-400">Blokir seluruh aksi tambah/ubah/hapus data operasional melalui API.</span>
 </label>
 </div>

 <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-700/80 dark:bg-slate-900/50">
 <AppCheckbox
 id="role-can-switch-unit"
 checked={canSwitchUnit}
 onChange={(e) => setCanSwitchUnit(e.target.checked)}
 className="mt-0.5"
 />
 <label htmlFor="role-can-switch-unit" className="cursor-pointer select-none">
 <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Bisa Ganti Unit di Topbar</span>
 <span className="block text-xs text-slate-500 dark:text-slate-400">Tampilkan pemilih unit pendidikan pada topbar (untuk peran lintas unit).</span>
 </label>
 </div>

 <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-700/80 dark:bg-slate-900/50">
 <AppCheckbox
 id="role-is-above-tu"
 checked={isAboveTu}
 onChange={(e) => setIsAboveTu(e.target.checked)}
 className="mt-0.5"
 />
 <label htmlFor="role-is-above-tu" className="cursor-pointer select-none">
 <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Kewenangan Supervisi (Di Atas TU)</span>
 <span className="block text-xs text-slate-500 dark:text-slate-400">Aktifkan akses supervisi laporan, persetujuan, dan pemantauan unit.</span>
 </label>
 </div>

 {canAssignGlobalRole && (
 <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-700/80 dark:bg-slate-900/50">
 <AppCheckbox
 id="role-can-manage-global-access"
 checked={canManageGlobalAccess}
 disabled={initialData?.name === 'Super Admin'}
 onChange={(e) => setCanManageGlobalAccess(e.target.checked)}
 className="mt-0.5"
 />
 <label htmlFor="role-can-manage-global-access" className="cursor-pointer select-none">
 <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Pengelola Hak Akses Global</span>
 <span className="block text-xs text-slate-500 dark:text-slate-400">Izinkan peran ini mengelola role & permission seluruh sistem.</span>
 </label>
 </div>
 )}
 </div>
 </div>
 )}

 {modalTab === 'permissions' && (
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <Key className="size-3.5 text-emerald-700 dark:text-emerald-400" />
 <span>Daftar Izin Modul Terpilih:</span>
 <span className="rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.2 text-[10px] font-black">
 {selectedPerms.length} dari {allPermissions.length}
 </span>
 </label>
 <div className="flex gap-2">
 <button
 type="button"
 onClick={() =>
 setSelectedPerms(allPermissions.map((p) => (typeof p === 'string' ? p : p.name)))
 }
 className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
 >
 Pilih Semua
 </button>
 <span className="text-slate-300">|</span>
 <button
 type="button"
 onClick={() => setSelectedPerms([])}
 className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
 >
 Batal Pilih
 </button>
 </div>
 </div>

 {/* Filter Cari Permission */}
 <div className="relative mb-3">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-600 dark:text-emerald-400 z-10" />
 <AppInput
 type="text"
 value={searchPerm}
 onChange={(e) => setSearchPerm(e.target.value)}
 placeholder="Filter nama izin akses..."
 className="w-full pl-9 pr-3 py-1.5"
 />
 </div>

 {/* Accordion List Modul Permissions */}
 <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
 {Object.entries(grouped).map(([modul, perms]) => {
 const filteredModulPerms = perms.filter(
 (p) =>
 !searchPerm ||
 p.toLowerCase().includes(searchPerm.toLowerCase()) ||
 getPermissionLabel(p).toLowerCase().includes(searchPerm.toLowerCase())
 )

 if (filteredModulPerms.length === 0) return null

 const allSelectedInModul = filteredModulPerms.every((p) => selectedPerms.includes(p))
 const selectedCountInModul = filteredModulPerms.filter((p) => selectedPerms.includes(p)).length
 const isExpanded = expandedModuls[modul] ?? (searchPerm.length > 0 || selectedCountInModul > 0)

 return (
 <div
 key={modul}
 className="rounded-xl border border-emerald-200/80 bg-slate-50/50 dark:border-emerald-800/60 dark:bg-slate-900/40 overflow-hidden"
 >
 <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 dark:bg-slate-800/70">
 <button
 type="button"
 onClick={() => toggleModulExpand(modul)}
 className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-100 cursor-pointer"
 >
 {isExpanded ? <ChevronDown className="size-3.5 text-slate-500" /> : <ChevronRight className="size-3.5 text-slate-500" />}
 <span>{getModulLabel(modul)}</span>
 <span className="rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[10px] font-extrabold">
 {selectedCountInModul} / {filteredModulPerms.length}
 </span>
 </button>

 <button
 type="button"
 onClick={() => toggleModulAll(filteredModulPerms, !allSelectedInModul)}
 className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 cursor-pointer"
 >
 {allSelectedInModul ? 'Batal Semua' : 'Centang Semua'}
 </button>
 </div>

 {isExpanded && (
 <div className="p-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
 {filteredModulPerms.map((p) => {
 const checked = selectedPerms.includes(p)
 return (
 <label
 key={p}
 className={cn(
 'flex items-start gap-2 rounded-xl p-2 border transition-all cursor-pointer text-xs',
 checked
 ? 'bg-emerald-50/70 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-100'
 : 'bg-white border-emerald-200/80 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300'
 )}
 >
 <input
 type="checkbox"
 checked={checked}
 onChange={() => togglePerm(p)}
 className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 <div className="min-w-0 flex-1">
 <span className="font-bold block leading-tight truncate">
 {getPermissionLabel(p)}
 </span>
 <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate block">
 {p}
 </code>
 </div>
 </label>
 )
 })}
 </div>
 )}
 </div>
 )
 })}
 </div>
 </div>
 )}

 {modalTab === 'menus' && (
 <div className="space-y-3">
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-start gap-2.5">
 <AppCheckbox
 id="role-use-custom-menu-access"
 checked={useCustomMenuAccess}
 onChange={(e) => setUseCustomMenuAccess(e.target.checked)}
 className="mt-0.5"
 />
 <label htmlFor="role-use-custom-menu-access" className="cursor-pointer select-none">
 <span className="block text-xs font-black text-emerald-950 dark:text-emerald-100">
 Aktifkan Kontrol Menu Sidebar Kustom (Tentukan Menu Persis per Role)
 </span>
 <span className="block text-xs text-emerald-800/80 dark:text-emerald-300/80">
 Jika dicentang, HANYA menu sidebar yang dipilih di bawah ini yang muncul untuk role ini (menimpa aturan bawaan). Jika tidak dicentang, menu otomatis mengikuti Izin Modul (Permissions).
 </span>
 </label>
 </div>
 </div>

 <div className="flex items-center justify-between gap-2">
 <div className="relative flex-1">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-600 dark:text-emerald-400 z-10" />
 <AppInput
 type="text"
 value={searchMenu}
 onChange={(e) => setSearchMenu(e.target.value)}
 placeholder="Cari nama menu atau path..."
 className="w-full pl-9 pr-3 py-1.5"
 />
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => {
 setUseCustomMenuAccess(true)
 setAllowedMenuIds(allMenuIdsFlat)
 }}
 className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
 >
 Pilih Semua
 </button>
 <span className="text-slate-300">|</span>
 <button
 type="button"
 onClick={() => setAllowedMenuIds([])}
 className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
 >
 Bersihkan
 </button>
 </div>
 </div>

 <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
 {navModules.map((mod) => {
 const menus = (mod.menus || []).filter(
 (item) =>
 !searchMenu ||
 item.name.toLowerCase().includes(searchMenu.toLowerCase()) ||
 item.path.toLowerCase().includes(searchMenu.toLowerCase())
 )
 if (menus.length === 0) return null

 const allSelected = menus.every((m) => allowedMenuIds.includes(m.id))
 const selectedCount = menus.filter((m) => allowedMenuIds.includes(m.id)).length
 const isExpanded = expandedNavModules[mod.id] ?? (searchMenu.length > 0 || selectedCount > 0)

 return (
 <div
 key={mod.id}
 className="rounded-xl border border-emerald-200/80 bg-slate-50/50 dark:border-emerald-800/60 dark:bg-slate-900/40 overflow-hidden"
 >
 <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 dark:bg-slate-800/70">
 <button
 type="button"
 onClick={() => setExpandedNavModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))}
 className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-100 cursor-pointer"
 >
 {isExpanded ? <ChevronDown className="size-3.5 text-slate-500" /> : <ChevronRight className="size-3.5 text-slate-500" />}
 <span>{mod.name}</span>
 <span className="rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[10px] font-extrabold">
 {selectedCount} / {menus.length}
 </span>
 </button>

 <button
 type="button"
 onClick={() => {
 setUseCustomMenuAccess(true)
 toggleNavModulAll(menus, !allSelected)
 }}
 className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 cursor-pointer"
 >
 {allSelected ? 'Batal Semua' : 'Centang Semua'}
 </button>
 </div>

 {isExpanded && (
 <div className="p-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
 {menus.map((item) => {
 const checked = allowedMenuIds.includes(item.id)
 return (
 <label
 key={item.id}
 className={cn(
 'flex items-start gap-2 rounded-xl p-2 border transition-all cursor-pointer text-xs',
 checked
 ? 'bg-emerald-50/70 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-100'
 : 'bg-white border-emerald-200/80 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300'
 )}
 >
 <input
 type="checkbox"
 checked={checked}
 onChange={() => {
 if (!checked && !useCustomMenuAccess) {
 setUseCustomMenuAccess(true)
 }
 toggleMenu(item.id)
 }}
 className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 <div className="min-w-0 flex-1">
 <span className="font-bold block leading-tight truncate">{item.name}</span>
 <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate block">
 {item.path}
 </code>
 </div>
 </label>
 )
 })}
 </div>
 )}
 </div>
 )
 })}
 </div>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="flex items-center justify-end gap-3 border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 shrink-0">
 <Button
 type="button"
 variant="outline"
 onClick={onClose}
 disabled={isSubmitting}
 className="rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-4 py-2.5 text-xs font-black text-rose-700 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/50 dark:text-rose-300"
 >
 Batal
 </Button>
 <Button
 type="submit"
 variant="primary"
 disabled={isSubmitting || !name.trim()}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-5 py-2.5 text-xs font-black shadow-sm hover:scale-[1.02] active:scale-95"
 >
 {isSubmitting ? (
 <Loader2 className="size-4 animate-spin" />
 ) : (
 <Save className="size-4" strokeWidth={2.2} />
 )}
 <span>{isEdit ? 'Simpan Matriks Role' : 'Tambah Role Baru'}</span>
 </Button>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 )
}

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONEN MODAL PERMISSION (HARMONIZED)
// ─────────────────────────────────────────────────────────────────────────────
function PermissionFormModal({ isOpen, onClose, onSubmit, isSubmitting = false }) {
 const [name, setName] = useState('')
 const [error, setError] = useState('')

 React.useEffect(() => {
 if (isOpen) {
 setName('')
 setError('')
 }
 }, [isOpen])

 if (!isOpen) return null

 const handleSubmit = (e) => {
 e.preventDefault()
 if (!name.trim()) {
 setError('Nama izin akses tidak boleh kosong.')
 return
 }
 if (!name.includes('.')) {
 setError('Format nama harus "modul.aksi", contoh: kehadiran.monitoring')
 return
 }
 onSubmit({ name: name.trim() })
 }

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !isSubmitting) onClose()
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-md font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-white dark:bg-[#1B2433] p-2.5 shadow-md shadow-sky-600/30 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
 <Key className="size-5" />
 </div>
 <div>
 <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Tambah Izin Akses Granular
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Daftarkan permission baru ke sistem
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={onClose} />
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Nama Izin Akses <span className="text-rose-500">*</span>
 </label>
 <div className="relative">
 <Key className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-sky-600 z-10" />
                <AppInput
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  placeholder="Contoh: tahfizh.monitoring_target, kesiswaan.kelulusan"
                  isError={Boolean(error)}
                  className="w-full pl-10 pr-4"
                />
 </div>
 {error && <p className="mt-1.5 text-xs font-bold text-rose-500">{error}</p>}
 <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
 Format standar: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-bold">modul.aksi</code>
 </p>
 </div>

 <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <AppButton variant="ghost" size="md" onClick={onClose}>Batal</AppButton>
 <AppButton type="submit" variant="primary" size="md" icon={Save} loading={isSubmitting} disabled={isSubmitting || !name.trim()}>Simpan Izin Akses</AppButton>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 )
}

// ─────────────────────────────────────────────────────────────────────────────
// KOMPONEN MODAL PEGAWAI ROLE (HARMONIZED)
// ─────────────────────────────────────────────────────────────────────────────
function PegawaiRoleModal({
 isOpen,
 onClose,
 onSubmit,
 employee = null,
 availableRoles = [],
 allPermissions = [],
 isSubmitting = false,
}) {
 const [roleName, setRoleName] = useState('')
 const [additionalRoles, setAdditionalRoles] = useState([])
 const [selectedPerms, setSelectedPerms] = useState([])
 const [isCustomPermsOpen, setIsCustomPermsOpen] = useState(false)
 const [searchPerm, setSearchPerm] = useState('')
 const [expandedModuls, setExpandedModuls] = useState({})
 const [password, setPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)

 const empLevel = getUserRoleLevel(employee?.user || employee?.roles || employee?.primary_role)
 const isProtectedEmployee =
 empLevel <= ROLE_LEVELS.ADMIN || // Level 1 & 2
 employee?.is_super_admin

 React.useEffect(() => {
 if (isOpen && employee) {
 const initialRole = getSmartDefaultRole(employee, availableRoles)
 setRoleName(initialRole)

 const existingRoles = Array.isArray(employee.roles)
 ? employee.roles
 : typeof employee.roles?.toArray === 'function'
 ? employee.roles.toArray()
 : []
 const extraRoles = existingRoles.filter(
 (r) => r !== initialRole && availableRoles.includes(r)
 )
 setAdditionalRoles(extraRoles)

 const hasDirectPerms = (employee.direct_permissions || []).length > 0
 if (hasDirectPerms) {
 setSelectedPerms(
 (employee.direct_permissions || []).filter((permission) => allPermissions.includes(permission))
 )
 setIsCustomPermsOpen(true)
 } else {
 const defaultRolePerms = applyRoleDefaultPermissions(initialRole, allPermissions)
 setSelectedPerms(defaultRolePerms)
 setIsCustomPermsOpen(false)
 }
 setPassword('')
 setShowPassword(false)
 setSearchPerm('')
 setExpandedModuls({})
 }
 }, [isOpen, employee, availableRoles, allPermissions])

 if (!isOpen || !employee) return null

 const handleRoleChange = (newRole) => {
 setRoleName(newRole)
 setAdditionalRoles((prev) => prev.filter((r) => r !== newRole))
 if (!isCustomPermsOpen) {
 setSelectedPerms(applyRoleDefaultPermissions(newRole, allPermissions))
 }
 }

 const handleResetToRoleDefault = () => {
 setSelectedPerms(applyRoleDefaultPermissions(roleName, allPermissions))
 }

 const groupedPerms = allPermissions.reduce((acc, p) => {
 const pName = typeof p === 'string' ? p : p.name
 const modul = pName.split('.')[0] || 'umum'
 if (!acc[modul]) acc[modul] = []
 acc[modul].push(pName)
 return acc
 }, {})

 const togglePerm = (perm) => {
 setSelectedPerms((prev) =>
 prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
 )
 }

 const toggleModulAll = (modulPerms, select) => {
 if (select) {
 setSelectedPerms((prev) => Array.from(new Set([...prev, ...modulPerms])))
 } else {
 setSelectedPerms((prev) => prev.filter((p) => !modulPerms.includes(p)))
 }
 }

 const toggleModulExpand = (modul) => {
 setExpandedModuls((prev) => ({ ...prev, [modul]: !prev[modul] }))
 }

 const handleToggleAdditionalRole = (r) => {
 setAdditionalRoles((prev) =>
 prev.includes(r) ? prev.filter((item) => item !== r) : [...prev, r]
 )
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 onSubmit({
 employeeId: employee.id,
 payload: {
 role_name: roleName,
 additional_roles: additionalRoles.filter((r) => r !== roleName),
 permissions: selectedPerms,
 ...(password.trim() ? { password: password.trim() } : {}),
 },
 })
 }

 const initials = (employee.nama_lengkap || 'P')
 .split(' ')
 .map((n) => n[0])
 .slice(0, 2)
 .join('')
 .toUpperCase()

 const optionalRoles = availableRoles.filter(
 (r) => r !== roleName && !['Super Admin', 'Admin'].includes(r)
 )

 const activeRoleGroup = getRoleCategoryGroup(roleName)
 const defaultRolePermCount = applyRoleDefaultPermissions(roleName, allPermissions).length

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !isSubmitting) onClose()
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-xl font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 p-2.5 shadow-md shadow-xs shrink-0">
 <UserCog className="size-5" />
 </div>
 <div>
 <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Penetapan Hak Akses Pegawai
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Atur status role, izin spesifik satu per satu, dan akun login pengguna
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={onClose} />
 </div>

 <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
 <div className="flex-1 space-y-4 overflow-y-auto p-6 text-slate-800 dark:text-slate-100">
 {/* Employee Summary Card */}
 <div className="flex items-center gap-3.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 font-black text-sm shadow-xs">
 {initials}
 </div>
 <div className="min-w-0">
 <h3 className="text-sm font-black text-slate-900 dark:text-white ">
 {employee.nama_lengkap}
 </h3>
 <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
 NIY: <span className="font-bold">{employee.niy || '-'}</span> • {employee.position?.nama || 'Staf Yayasan'}
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Unit: {employee.unit?.nama || 'Seluruh Unit / Pusat'}
 </p>
 </div>
 </div>

 {/* Status Akun Callout */}
 <div
 className={cn(
 'flex items-center gap-3 rounded-xl border p-3.5',
 employee.has_user
 ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 text-amber-950 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-200'
 )}
 >
 <div
 className={cn(
 'flex size-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs',
 employee.has_user ? 'bg-emerald-600' : 'bg-amber-600'
 )}
 >
 {employee.has_user ? <UserCheck className="size-4" /> : <UserX className="size-4" />}
 </div>
 <div className="min-w-0 text-xs">
 <p className="font-bold">
 {employee.has_user
 ? `Akun Login Terhubung: ${employee.user_email || employee.email || 'Aktif'}`
 : 'Belum Memiliki Akun Login'}
 </p>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
 {employee.has_user
 ? 'Role dan otoritas akan otomatis sinkron saat pegawai login ke portal.'
 : 'Sistem akan otomatis membuat akun pengguna baru untuk pegawai ini.'}
 </p>
 </div>
 </div>

 {!employee.has_user ? (
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Password Awal Akun <span className="text-slate-400 font-normal">(Opsional, default: 12345678)</span>
 </label>
 <div className="relative">
 <AppInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password awal atau biarkan kosong untuk default..."
                  className="w-full pl-3.5 pr-10"
                />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 transition-colors"
 title={showPassword ? 'Sembunyikan password' : 'Lihat ketikan password'}
 >
 {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
 </button>
 </div>
 </div>
 ) : (
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Ubah Password Akun <span className="text-slate-400 font-normal">(Opsional, kosongkan jika tidak ingin mengubah password)</span>
 </label>
 <div className="relative">
 <AppInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik password baru (min. 8 karakter) jika ingin mengubah password akun..."
                  className="w-full pl-3.5 pr-10"
                />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 transition-colors"
 title={showPassword ? 'Sembunyikan password' : 'Lihat ketikan password'}
 >
 {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
 </button>
 </div>
 </div>
 )}

 {/* ── 1. PILIHAN STATUS ROLE UTAMA PEGAWAI ── */}
 <div className="space-y-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
 <span>
 Status Role Utama Pegawai <span className="text-rose-500">*</span>
 </span>
 {isProtectedEmployee && (
 <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
 <Lock className="size-3" /> Terkunci (Role Sistem)
 </span>
 )}
 </label>
 <AppSelect
                disabled={isProtectedEmployee}
                value={roleName}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full"
              >
 {Object.entries(ROLE_GROUPS).map(([key, group]) => {
 const groupRoles = group.roles.filter((r) => availableRoles.includes(r))
 if (groupRoles.length === 0) return null
 return (
 <optgroup key={key} label={group.label}>
 {groupRoles.map((r) => (
 <option key={r} value={r}>
 {r}
 </option>
 ))}
 </optgroup>
 )
 })}
 {availableRoles.some((r) => !Object.values(ROLE_GROUPS).some((g) => g.roles.includes(r))) && (
 <optgroup label="Peran Lainnya">
 {availableRoles
 .filter((r) => !Object.values(ROLE_GROUPS).some((g) => g.roles.includes(r)))
 .map((r) => (
 <option key={r} value={r}>
 {r}
 </option>
 ))}
 </optgroup>
 )}
 </AppSelect>

 {/* Status Role Information Pill */}
 <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200/80 bg-slate-50/80 px-3 py-2 text-xs dark:border-emerald-800/60 dark:bg-slate-900/50">
 <div className="flex items-center gap-2">
 <Shield className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span className="font-bold text-slate-800 dark:text-slate-200">
 Status Role: <span className="text-emerald-700 dark:text-emerald-300">{roleName}</span>
 </span>
 </div>
 <span className={cn('rounded-lg px-2 py-0.5 text-[10px] font-extrabold border', activeRoleGroup.badgeColor)}>
 {activeRoleGroup.label} • {defaultRolePermCount} Wewenang Standar
 </span>
 </div>
 </div>

 {/* ── 2. KUSTOMISASI HAK AKSES TAMBAHAN (PILIH SATU PER SATU) ── */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden">
 <div className="flex items-center justify-between p-3.5 border-b border-emerald-300 dark:border-emerald-800/80 dark:border-emerald-800/60 bg-emerald-100/50 dark:bg-emerald-900/40">
 <div className="flex items-center gap-2.5">
 <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-2xs">
 <SlidersHorizontal className="size-4" />
 </div>
 <div>
 <p className="text-xs font-black text-emerald-950 dark:text-emerald-100">
 Kustomisasi Hak Akses Spesifik (Pilih Satu per Satu)
 </p>
 <p className="text-xs text-slate-600 dark:text-slate-300">
 Sesuaikan izin individual secara granular di luar status role default
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-black shadow-2xs">
 {selectedPerms.length} Izin Aktif
 </span>
 <button
 type="button"
 onClick={() => setIsCustomPermsOpen(!isCustomPermsOpen)}
 className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-800 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
 >
 {isCustomPermsOpen ? (
 <>
 <ChevronDown className="size-3.5" />
 <span>Tutup</span>
 </>
 ) : (
 <>
 <ChevronRight className="size-3.5" />
 <span>Atur Satu per Satu</span>
 </>
 )}
 </button>
 </div>
 </div>

 {isCustomPermsOpen && (
 <div className="p-4 space-y-3 bg-white/70 dark:bg-slate-900/50">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div className="relative flex-1 min-w-[200px]">
 <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-emerald-600 dark:text-emerald-400 z-10" />
                <AppInput
                  type="text"
                  value={searchPerm}
                  onChange={(e) => setSearchPerm(e.target.value)}
                  placeholder="Cari izin spesifik (misal: siswa, rapor, nilai)..."
                  className="w-full pl-8.5 pr-3 py-1.5"
                />
 </div>
 <div className="flex items-center gap-1.5 flex-wrap">
 <AppButton variant="outline" size="xs" icon={RotateCcw} onClick={handleResetToRoleDefault}>Reset ke Status Role</AppButton>
 <AppButton variant="outline" size="xs" icon={CheckSquare} onClick={() => setSelectedPerms([...allPermissions])}>Pilih Semua</AppButton>
 <AppButton variant="ghost" size="xs" icon={Square} onClick={() => setSelectedPerms([])}>Kosongkan</AppButton>
 </div>
 </div>

 {/* Accordion Modul & Checkbox Satu per Satu */}
 <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
 {Object.entries(groupedPerms).map(([modul, perms]) => {
 const filteredPerms = perms.filter(
 (p) =>
 !searchPerm ||
 p.toLowerCase().includes(searchPerm.toLowerCase()) ||
 getPermissionLabel(p).toLowerCase().includes(searchPerm.toLowerCase())
 )

 if (filteredPerms.length === 0) return null

 const allSelectedInModul = filteredPerms.every((p) => selectedPerms.includes(p))
 const selectedCount = filteredPerms.filter((p) => selectedPerms.includes(p)).length
 const isExpanded = expandedModuls[modul] ?? (searchPerm.length > 0 || selectedCount > 0)

 return (
 <div
 key={modul}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 dark:bg-slate-900/40 overflow-hidden"
 >
 <div className="flex items-center justify-between px-3 py-2 bg-slate-100/80 dark:bg-slate-800/80">
 <button
 type="button"
 onClick={() => toggleModulExpand(modul)}
 className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-100 cursor-pointer"
 >
 {isExpanded ? <ChevronDown className="size-3.5 text-slate-500" /> : <ChevronRight className="size-3.5 text-slate-500" />}
 <span>{getModulLabel(modul)}</span>
 <span className="rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[10px] font-extrabold">
 {selectedCount} / {filteredPerms.length}
 </span>
 </button>
 <button
 type="button"
 onClick={() => toggleModulAll(filteredPerms, !allSelectedInModul)}
 className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 cursor-pointer"
 >
 {allSelectedInModul ? 'Batal Semua' : 'Centang Semua'}
 </button>
 </div>

 {isExpanded && (
 <div className="p-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
 {filteredPerms.map((p) => {
 const checked = selectedPerms.includes(p)
 return (
 <label
 key={p}
 className={cn(
 'flex items-start gap-2 rounded-xl p-2 border transition-all cursor-pointer text-xs select-none',
 checked
 ? 'bg-emerald-50/80 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-100 font-bold'
 : 'bg-white border-emerald-200/80 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 font-medium'
 )}
 >
 <input
 type="checkbox"
 checked={checked}
 onChange={() => togglePerm(p)}
 className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
 />
 <div className="min-w-0 flex-1">
 <span className="block leading-tight truncate">
 {getPermissionLabel(p)}
 </span>
 <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate block">
 {p}
 </code>
 </div>
 </label>
 )
 })}
 </div>
 )}
 </div>
 )
 })}
 </div>
 </div>
 )}
 </div>

 {/* ── 3. PILIHAN TUGAS / PERAN TAMBAHAN (MODULAR MULTI-ROLE) ── */}
 {!isProtectedEmployee && optionalRoles.length > 0 && (
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center justify-between mb-2">
 <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
 Tugas / Peran Tambahan (Bisa Dipilih Satu-Satu)
 </label>
 <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
 Modular RBAC
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
 Centang peran di bawah jika pegawai merangkap tugas (misal: Guru Mapel yang juga Guru Tahfizh, Pembimbing Mutaba'ah, atau Musyrif Asrama).
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {optionalRoles.map((r) => {
 const isChecked = additionalRoles.includes(r)
 return (
 <label
 key={r}
 onClick={() => handleToggleAdditionalRole(r)}
 className={cn(
 'flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none',
 isChecked
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white text-emerald-900 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900 dark:text-emerald-200'
 : 'border-emerald-200/80 bg-slate-50/60 text-slate-700 hover:bg-white dark:border-emerald-800/60 dark:bg-slate-900/40 dark:text-slate-300'
 )}
 >
 <input
 type="checkbox"
 checked={isChecked}
 onChange={() => { }} // handled by parent label click
 className="size-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer pointer-events-none"
 />
 <span className="truncate">{r}</span>
 </label>
 )
 })}
 </div>
 </div>
 )}
 </div>

 <div className="flex items-center justify-end gap-3 border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 shrink-0">
 <AppButton variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>Batal</AppButton>
 <AppButton type="submit" variant="primary" size="md" icon={Save} loading={isSubmitting}>Simpan Akses Pegawai</AppButton>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 )
}
