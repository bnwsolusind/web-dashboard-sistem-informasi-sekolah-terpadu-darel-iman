import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Layers,
  Smartphone,
  Globe,
  Plus,
  Pencil,
  Trash2,
  Save,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Link as LinkIcon,
  Shield,
  Palette,
  Eye,
  Check,
  X,
  Sliders,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Menu,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Icon as IconifyIcon, iconLoaded } from '@iconify/react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppTabs from '../components/app/AppTabs'
import { Button } from '../components/ui/button'
import { useToast } from '../components/app'
import { adminNavigationService } from '../services/adminNavigationService'
import { useMobileMaterialIcons } from '../utils/mobileMaterialIcons'

const ICON_PICKER_PAGE_SIZE = 100

const ALL_CLEAN_LUCIDE_ICONS = Object.keys(LucideIcons).filter(
  (k) =>
    /^[A-Z]/.test(k) &&
    !k.endsWith('Icon') &&
    !k.startsWith('Lucide') &&
    LucideIcons[k] &&
    (typeof LucideIcons[k] === 'function' || typeof LucideIcons[k] === 'object')
)

// Mapping bantuan icon Lucide ke icon MaterialCommunityIcons
const LUCIDE_TO_MATERIAL_MAP = {
  LayoutDashboard: 'view-dashboard-outline',
  Database: 'database-outline',
  BookOpen: 'book-open-page-variant',
  FileText: 'file-document-outline',
  Settings: 'cog-outline',
  CalendarCheck: 'calendar-check-outline',
  CalendarClock: 'calendar-clock',
  Calendar: 'calendar-month',
  CalendarDays: 'calendar-month-outline',
  Users: 'account-group-outline',
  User: 'account-outline',
  UserCheck: 'account-check-outline',
  Building2: 'office-building',
  ShieldCheck: 'shield-check-outline',
  CreditCard: 'cash-multiple',
  Award: 'chart-box-outline',
  Sparkles: 'clipboard-check-outline',
  MessageCircle: 'chat-processing-outline',
  Megaphone: 'bullhorn-outline',
  Laptop: 'laptop',
  FileQuestion: 'file-question',
  GraduationCap: 'school',
  HeartHandshake: 'hands-pray',
  ClipboardList: 'clipboard-text-outline',
  DoorOpen: 'door-open',
  Compass: 'google-classroom',
  HelpCircle: 'help-circle-outline',
  Clock: 'clock-time-four',
  CheckSquare: 'checkbox-marked-circle-outline',
  Receipt: 'receipt-outline',
  BookMarked: 'book-marker',
  BookHeart: 'heart-box-outline',
  Activity: 'pulse',
  Target: 'target',
  FileSpreadsheet: 'file-excel-outline',
  FileCheck2: 'check-decagram-outline',
  Home: 'home-account',
}

const MATERIAL_TO_LUCIDE_MAP = Object.fromEntries(
  Object.entries(LUCIDE_TO_MATERIAL_MAP).map(([luc, mat]) => [mat, luc])
)

const POPULAR_LUCIDE_ICONS = [
  'LayoutDashboard', 'BookOpen', 'Calendar', 'CalendarCheck', 'CalendarClock',
  'CalendarDays', 'Users', 'User', 'UserCheck', 'GraduationCap', 'Award',
  'Database', 'FileText', 'Settings', 'ClipboardList', 'MessageCircle',
  'Megaphone', 'Laptop', 'FileQuestion', 'Sparkles', 'ShieldCheck',
  'CreditCard', 'Receipt', 'Building2', 'HeartHandshake', 'DoorOpen',
  'Compass', 'Clock', 'CheckSquare', 'BookMarked', 'BookHeart',
  'Activity', 'Target', 'FileSpreadsheet', 'FileCheck2', 'Home',
  'Bell', 'Search', 'Filter', 'Folder', 'FolderOpen',
  'Layers', 'Mail', 'Phone', 'MapPin', 'BarChart2',
  'PieChart', 'LineChart', 'TrendingUp', 'Printer', 'Download',
  'Upload', 'Share2', 'Edit', 'Trash2', 'Plus',
  'Check', 'AlertTriangle', 'Info', 'HelpCircle', 'Key',
  'Lock', 'Globe', 'Smartphone', 'Monitor', 'Camera',
  'Image', 'Video', 'Music', 'Star', 'Heart',
]

const POPULAR_MATERIAL_ICONS = [
  { id: 'view-dashboard-outline', label: 'Dashboard Utama', lucide: 'LayoutDashboard' },
  { id: 'database-outline', label: 'Database / Data Pokok', lucide: 'Database' },
  { id: 'book-open-page-variant', label: 'Materi / Bahan Ajar', lucide: 'BookOpen' },
  { id: 'book-open-variant', label: 'Al-Qur\'an Digital', lucide: 'BookOpen' },
  { id: 'book-marker', label: 'Tahfizh Al-Qur\'an', lucide: 'BookMarked' },
  { id: 'book-multiple', label: 'Buku & Modul Ajar', lucide: 'BookOpen' },
  { id: 'notebook-edit-outline', label: 'Buku Penghubung', lucide: 'FileText' },
  { id: 'calendar-clock', label: 'Jadwal Pelajaran KBM', lucide: 'CalendarClock' },
  { id: 'clock-time-four', label: 'Waktu / Jam KBM', lucide: 'Clock' },
  { id: 'calendar-check-outline', label: 'Presensi KBM Kelas', lucide: 'CalendarCheck' },
  { id: 'account-check-outline', label: 'Presensi Siswa / Mandiri', lucide: 'UserCheck' },
  { id: 'account-check', label: 'Presensi Terverifikasi', lucide: 'UserCheck' },
  { id: 'calendar-month', label: 'Kalender', lucide: 'Calendar' },
  { id: 'calendar-month-outline', label: 'Kalender Akademik', lucide: 'CalendarDays' },
  { id: 'clipboard-text', label: 'Tugas LMS Santri', lucide: 'ClipboardList' },
  { id: 'clipboard-text-outline', label: 'Penugasan Belajar', lucide: 'ClipboardList' },
  { id: 'clipboard-check', label: 'Mutaba\'ah Yaumiyyah', lucide: 'Sparkles' },
  { id: 'clipboard-check-outline', label: 'Mutaba\'ah Amalan', lucide: 'Sparkles' },
  { id: 'chart-box', label: 'Nilai & Leger Siswa', lucide: 'Award' },
  { id: 'chart-box-outline', label: 'Penilaian & Rapor', lucide: 'Award' },
  { id: 'laptop', label: 'CBT Ujian Online', lucide: 'Laptop' },
  { id: 'file-question', label: 'Kisi-kisi Ujian', lucide: 'FileQuestion' },
  { id: 'cash-multiple', label: 'Tagihan SPP Siswa', lucide: 'CreditCard' },
  { id: 'chat-processing-outline', label: 'Chat Wali Murid / Guru', lucide: 'MessageCircle' },
  { id: 'message-text-outline', label: 'Pesan / Diskusi Guru', lucide: 'MessageCircle' },
  { id: 'bullhorn-outline', label: 'Informasi Sekolah', lucide: 'Megaphone' },
  { id: 'bullhorn', label: 'Pengumuman Resmi', lucide: 'Megaphone' },
  { id: 'door-open', label: 'Absensi Gerbang / Izin Santri', lucide: 'DoorOpen' },
  { id: 'hands-pray', label: 'Doa & Dzikir Harian', lucide: 'HeartHandshake' },
  { id: 'home-account', label: 'Asrama Boarding Ponpes', lucide: 'Home' },
  { id: 'school', label: 'Alumni & Kelulusan', lucide: 'GraduationCap' },
  { id: 'account-school-outline', label: 'Profil Santri / Alumni', lucide: 'GraduationCap' },
  { id: 'account-group', label: 'Rombongan Belajar Santri', lucide: 'Users' },
  { id: 'account-group-outline', label: 'Kelompok Siswa', lucide: 'Users' },
  { id: 'account-circle-outline', label: 'Profil Pengguna', lucide: 'User' },
  { id: 'cog-outline', label: 'Pengaturan Menu / Sistem', lucide: 'Settings' },
  { id: 'cog', label: 'Konfigurasi Aplikasi', lucide: 'Settings' },
  { id: 'file-document-edit-outline', label: 'Surat Izin Santri', lucide: 'FileText' },
  { id: 'google-classroom', label: 'Pantau Guru Mengajar', lucide: 'Compass' },
  { id: 'card-account-details-outline', label: 'Kartu Pelajar / Santri', lucide: 'CreditCard' },
  { id: 'check-decagram-outline', label: 'Mutaba\'ah & Prestasi', lucide: 'Award' },
]

function renderLucideIcon(iconName, className = 'h-5 w-5', fallback = Layers) {
  if (!iconName) return React.createElement(fallback, { className })
  const Component = LucideIcons[iconName] || LucideIcons[iconName.replace(/-/g, '')] || fallback
  return React.createElement(Component, { className })
}

function renderMaterialIconPreview(materialIconName, className = 'h-5 w-5') {
  if (materialIconName && iconLoaded(`mdi:${materialIconName}`)) {
    return React.createElement(IconifyIcon, { icon: `mdi:${materialIconName}`, className })
  }
  const mappedLucide = MATERIAL_TO_LUCIDE_MAP[materialIconName] || 'HelpCircle'
  return renderLucideIcon(mappedLucide, className, Smartphone)
}

const COLOR_PRESETS = [
  { color: '#059669', bg: '#ECFDF5', label: 'Emerald' },
  { color: '#0D9488', bg: '#F0FDFA', label: 'Teal' },
  { color: '#0284C7', bg: '#F0F9FF', label: 'Sky' },
  { color: '#2563EB', bg: '#EFF6FF', label: 'Royal Blue' },
  { color: '#7C3AED', bg: '#F5F3FF', label: 'Violet' },
  { color: '#D97706', bg: '#FFFBEB', label: 'Amber' },
  { color: '#F97316', bg: '#FFF7ED', label: 'Orange' },
  { color: '#EF4444', bg: '#FEF2F2', label: 'Rose' },
  { color: '#E11D48', bg: '#FFF1F2', label: 'Crimson' },
  { color: '#64748B', bg: '#F1F5F9', label: 'Slate' },
]

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

export default function KelolaNavigasiMenuPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [activePlatformTab, setActivePlatformTab] = useState('web')
  const [selectedMobileRole, setSelectedMobileRole] = useState('student')
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [permissionSearchQuery, setPermissionSearchQuery] = useState('')

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null) // null = create, object = edit
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null)
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [deleteModuleTarget, setDeleteModuleTarget] = useState(null)
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [iconPickerModal, setIconPickerModal] = useState(null) // 'web' | 'mobile' | 'module' | null
  const [iconSearchQuery, setIconSearchQuery] = useState('')
  const [visibleIconLimit, setVisibleIconLimit] = useState(ICON_PICKER_PAGE_SIZE)

  const { mdiReady, androidMaterialIconNames } = useMobileMaterialIcons()

  useEffect(() => {
    setVisibleIconLimit(ICON_PICKER_PAGE_SIZE)
  }, [iconPickerModal, iconSearchQuery])

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    module_id: 'dashboard',
    name: '',
    name_mobile: '',
    sync_names: true,
    path: '',
    icon: 'LayoutDashboard',
    icon_mobile: 'view-dashboard-outline',
    platform: 'web',
    target_roles: ['student', 'parent', 'teacher'],
    required_permissions: [],
    metadata: {
      color: '#059669',
      bg: '#ECFDF5',
      badge: '',
      tab: '',
    },
    is_active: true,
  })

  const [moduleFormData, setModuleFormData] = useState({
    id: '',
    name: '',
    icon: 'Layers',
    platform: 'both',
    is_active: true,
  })

  // Fetch Navigation Data
  const { data: navData, isLoading } = useQuery({
    queryKey: ['admin-navigation-data'],
    queryFn: () => adminNavigationService.getNavigationData(),
  })

  const modules = useMemo(() => navData?.modules || [], [navData?.modules])
  const moduleOptions = useMemo(() => {
    return modules.map((m) => ({
      value: String(m.id),
      label: m.name,
      subtext: `Platform: ${m.platform}`,
    }))
  }, [modules])
  const moduleFilterOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Modul Induk' },
      ...modules.map((m) => ({
        value: String(m.id),
        label: m.name,
        subtext: `${(m.menus || []).length} menu (${m.platform})`,
      })),
    ]
  }, [modules])
  const canonicalRoles = navData?.registries?.canonical_roles || [
    { id: 'super_admin', label: 'Super Admin' },
    { id: 'student', label: 'Siswa / Santri' },
    { id: 'parent', label: 'Orang Tua / Wali Murid' },
    { id: 'teacher', label: 'Guru / Pengajar' },
    { id: 'principal', label: 'Kepala Sekolah' },
    { id: 'tu', label: 'Tata Usaha / Operator' },
    { id: 'foundation', label: 'Pengurus Yayasan / Pimpinan' },
    { id: 'divisi', label: 'Kepala Divisi / Unit Kerja' },
    { id: 'musyrif', label: 'Musyrif / Pembimbing Asrama' },
    { id: 'alumni', label: 'Alumni' },
  ]
  const availablePermissions = useMemo(() => navData?.permissions || [], [navData?.permissions])
  const mobileScreens = useMemo(
    () => navData?.registries?.mobile_screens || [],
    [navData?.registries?.mobile_screens]
  )
  const webRoutes = useMemo(
    () => navData?.registries?.web_routes || [],
    [navData?.registries?.web_routes]
  )
  const allLucideIcons = useMemo(() => {
    const fromApi = navData?.registries?.lucide_icons || []
    return Array.from(new Set([...POPULAR_LUCIDE_ICONS, ...fromApi, ...ALL_CLEAN_LUCIDE_ICONS]))
  }, [navData?.registries?.lucide_icons])

  const allMaterialIcons = useMemo(() => {
    const formatMaterialLabel = (id) =>
      id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const fromApi = navData?.registries?.material_icons || []
    const byId = new Map()

    // 1. Ikon populer berlabel Bahasa Indonesia di urutan paling atas
    POPULAR_MATERIAL_ICONS.forEach((item) => {
      byId.set(item.id, item)
    })

    // 2. Ikon dari registry backend
    fromApi.forEach((id) => {
      if (!byId.has(id)) {
        byId.set(id, {
          id,
          label: formatMaterialLabel(id),
          lucide: MATERIAL_TO_LUCIDE_MAP[id] || 'Circle',
        })
      }
    })

    // 3. Seluruh ~7.400+ ikon MaterialCommunityIcons yang valid di mobile-app
    androidMaterialIconNames.forEach((id) => {
      if (!byId.has(id)) {
        byId.set(id, {
          id,
          label: formatMaterialLabel(id),
          lucide: MATERIAL_TO_LUCIDE_MAP[id] || 'Circle',
        })
      }
    })

    return Array.from(byId.values())
  }, [navData?.registries?.material_icons, androidMaterialIconNames])

  const filteredLucideIcons = useMemo(() => {
    if (!iconSearchQuery.trim()) return allLucideIcons
    const q = iconSearchQuery.toLowerCase()
    return allLucideIcons.filter((ic) => ic.toLowerCase().includes(q))
  }, [allLucideIcons, iconSearchQuery])

  const filteredMaterialIcons = useMemo(() => {
    if (!iconSearchQuery.trim()) return allMaterialIcons
    const q = iconSearchQuery.toLowerCase()
    return allMaterialIcons.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.lucide && item.lucide.toLowerCase().includes(q))
    )
  }, [allMaterialIcons, iconSearchQuery])

  const filteredPermissions = useMemo(() => {
    if (!permissionSearchQuery.trim()) return availablePermissions
    const q = permissionSearchQuery.toLowerCase()
    return availablePermissions.filter((p) => String(p).toLowerCase().includes(q))
  }, [availablePermissions, permissionSearchQuery])

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules
    const q = searchQuery.toLowerCase()
    return modules.filter(
      (mod) =>
        mod.name?.toLowerCase().includes(q) ||
        String(mod.id || '').toLowerCase().includes(q) ||
        mod.platform?.toLowerCase().includes(q)
    )
  }, [modules, searchQuery])

  // Flattened Menus for Current Platform
  const currentMenus = useMemo(() => {
    const list = []
    modules.forEach((mod) => {
      if (selectedModuleFilter !== 'all' && String(mod.id) !== String(selectedModuleFilter)) {
        return
      }
      ;(mod.menus || []).forEach((menu) => {
        if (activePlatformTab === 'web') {
          if (menu.platform === 'web' || menu.platform === 'both') {
            list.push({ ...menu, module_name: mod.name, module_is_active: mod.is_active !== false })
          }
        } else if (activePlatformTab === 'mobile') {
          if (menu.platform === 'mobile' || menu.platform === 'both') {
            const roles = menu.target_roles || []
            const matchesRole = roles.length === 0 || roles.includes(selectedMobileRole)
            if (matchesRole) {
              list.push({ ...menu, module_name: mod.name, module_is_active: mod.is_active !== false })
            }
          }
        }
      })
    })

    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.name_mobile?.toLowerCase().includes(q) ||
        m.path?.toLowerCase().includes(q) ||
        m.id?.toLowerCase().includes(q) ||
        m.module_name?.toLowerCase().includes(q)
    )
  }, [modules, activePlatformTab, selectedMobileRole, selectedModuleFilter, searchQuery])

  // Helper Map: whether a menu can move up/down within its parent module
  const siblingMoveMap = useMemo(() => {
    const byModule = new Map()
    currentMenus.forEach((menu) => {
      const modKey = String(menu.module_id)
      if (!byModule.has(modKey)) byModule.set(modKey, [])
      byModule.get(modKey).push(menu.id)
    })
    const result = new Map()
    byModule.forEach((ids) => {
      ids.forEach((id, i) => {
        result.set(id, { canUp: i > 0, canDown: i < ids.length - 1 })
      })
    })
    return result
  }, [currentMenus])

  // Open Form Modal
  const handleOpenCreate = () => {
    const defaultModule =
      selectedModuleFilter !== 'all'
        ? selectedModuleFilter
        : modules[0]?.id || 'dashboard'
    setEditingItem(null)
    setPermissionSearchQuery('')
    setFormData({
      id: `menu-${Date.now().toString().slice(-6)}`,
      module_id: defaultModule,
      name: '',
      name_mobile: '',
      sync_names: true,
      path: activePlatformTab === 'web' ? '/dashboard' : 'Jadwal',
      icon: 'LayoutDashboard',
      icon_mobile: 'view-dashboard-outline',
      platform: activePlatformTab === 'mobile' ? 'mobile' : 'web',
      target_roles: activePlatformTab === 'mobile' ? [selectedMobileRole] : [],
      required_permissions: [],
      metadata: {
        color: '#059669',
        bg: '#ECFDF5',
        badge: '',
        tab: '',
      },
      is_active: true,
    })
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (menu) => {
    setEditingItem(menu)
    setPermissionSearchQuery('')
    const isSameName = (menu.name_mobile || menu.name) === menu.name
    setFormData({
      id: menu.id,
      module_id: menu.module_id,
      name: menu.name || '',
      name_mobile: menu.name_mobile || menu.name || '',
      sync_names: isSameName,
      path: menu.path || '',
      icon: menu.icon || 'LayoutDashboard',
      icon_mobile: menu.icon_mobile || LUCIDE_TO_MATERIAL_MAP[menu.icon] || 'circle-outline',
      platform: menu.platform || 'both',
      target_roles: Array.isArray(menu.target_roles) ? menu.target_roles : [],
      required_permissions: Array.isArray(menu.required_permissions) ? menu.required_permissions : [],
      metadata: {
        color: menu.metadata?.color || '#059669',
        bg: menu.metadata?.bg || '#ECFDF5',
        badge: menu.metadata?.badge || '',
        tab: menu.metadata?.tab || '',
      },
      is_active: menu.is_active !== false,
    })
    setIsFormModalOpen(true)
  }

  const handleOpenCreateModule = () => {
    setEditingModule(null)
    setModuleFormData({
      id: `mod-${Date.now().toString().slice(-6)}`,
      name: '',
      icon: 'Layers',
      platform: 'both',
      is_active: true,
    })
    setIsModuleModalOpen(true)
  }

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod)
    setModuleFormData({
      id: mod.id,
      name: mod.name || '',
      icon: mod.icon || 'Layers',
      platform: mod.platform || 'both',
      is_active: mod.is_active !== false,
    })
    setIsModuleModalOpen(true)
  }

  // Auto-Match Icon Handler
  const handleAutoMatchIcon = () => {
    const matched = LUCIDE_TO_MATERIAL_MAP[formData.icon]
    if (matched) {
      setFormData((prev) => ({ ...prev, icon_mobile: matched }))
      addToast({
        title: 'Ikon Disesuaikan',
        message: `Ikon mobile otomatis diselaraskan ke "${matched}".`,
        type: 'success',
      })
    } else {
      addToast({
        title: 'Ikon Khusus',
        message: 'Tidak ditemukan padanan langsung, silakan pilih ikon mobile secara manual.',
        type: 'info',
      })
    }
  }

  const invalidateNavigation = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-navigation-data'] })
    queryClient.invalidateQueries({ queryKey: ['navigation-modules'] })
  }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingItem) {
        return await adminNavigationService.updateMenu(editingItem.id, payload)
      }
      return await adminNavigationService.createMenu(payload)
    },
    onSuccess: () => {
      invalidateNavigation()
      setIsFormModalOpen(false)
      addToast({
        title: 'Berhasil Disimpan',
        message: `Menu navigasi berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}.`,
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Menyimpan',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await adminNavigationService.deleteMenu(id)
    },
    onSuccess: () => {
      invalidateNavigation()
      setDeleteConfirmTarget(null)
      addToast({
        title: 'Menu Dihapus',
        message: 'Menu navigasi berhasil dihapus dari sistem.',
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Menghapus',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const saveModuleMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingModule) {
        return await adminNavigationService.updateModule(editingModule.id, payload)
      }
      return await adminNavigationService.createModule(payload)
    },
    onSuccess: () => {
      invalidateNavigation()
      setIsModuleModalOpen(false)
      addToast({
        title: 'Modul Disimpan',
        message: `Modul navigasi berhasil ${editingModule ? 'diperbarui' : 'ditambahkan'}.`,
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Menyimpan Modul',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const deleteModuleMutation = useMutation({
    mutationFn: async (id) => {
      return await adminNavigationService.deleteModule(id)
    },
    onSuccess: () => {
      invalidateNavigation()
      setDeleteModuleTarget(null)
      if (selectedModuleFilter === String(deleteModuleTarget?.id)) {
        setSelectedModuleFilter('all')
      }
      addToast({
        title: 'Modul Dihapus',
        message: 'Modul navigasi beserta menu di dalamnya berhasil dihapus.',
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Menghapus Modul',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      return await adminNavigationService.syncMobileConfig()
    },
    onSuccess: () => {
      invalidateNavigation()
      setSyncConfirmOpen(false)
      addToast({
        title: 'Sinkronisasi Berhasil',
        message: 'Seluruh susunan menu mobile berhasil dipublikasikan ke perangkat Android.',
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Sinkronisasi',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const resetMutation = useMutation({
    mutationFn: async () => {
      return await adminNavigationService.resetDefaults()
    },
    onSuccess: () => {
      invalidateNavigation()
      setResetConfirmOpen(false)
      addToast({
        title: 'Menu Default Dipulihkan',
        message: 'Menu bawaan Web dan Mobile berhasil dikembalikan ke standar awal.',
        type: 'success',
      })
    },
    onError: (err) => {
      addToast({
        title: 'Gagal Mereset',
        message: err.response?.data?.message || err.message,
        type: 'error',
      })
    },
  })

  const handleToggleActive = async (menu) => {
    try {
      await adminNavigationService.updateMenu(menu.id, { is_active: !menu.is_active })
      invalidateNavigation()
      addToast({
        title: menu.is_active ? 'Menu Dinonaktifkan' : 'Menu Diaktifkan',
        message: `Status menu "${menu.name}" berhasil diubah.`,
        type: 'success',
      })
    } catch (e) {
      addToast({ title: 'Gagal Mengubah Status', message: e.message, type: 'error' })
    }
  }

  const handleToggleModuleActive = async (mod) => {
    try {
      await adminNavigationService.updateModule(mod.id, { is_active: !mod.is_active })
      invalidateNavigation()
      addToast({
        title: mod.is_active ? 'Modul Dinonaktifkan' : 'Modul Diaktifkan',
        message: `Status modul "${mod.name}" berhasil diubah.`,
        type: 'success',
      })
    } catch (e) {
      addToast({ title: 'Gagal Mengubah Status Modul', message: e.response?.data?.message || e.message, type: 'error' })
    }
  }

  const handleMoveOrder = async (menu, direction) => {
    const modKey = String(menu.module_id)
    const visibleSiblings = currentMenus.filter((m) => String(m.module_id) === modKey)
    const visibleIdx = visibleSiblings.findIndex((m) => m.id === menu.id)
    if (visibleIdx < 0) return

    const targetVisibleIdx = visibleIdx + direction
    if (targetVisibleIdx < 0 || targetVisibleIdx >= visibleSiblings.length) return

    const targetItem = visibleSiblings[targetVisibleIdx]
    const parentModule = modules.find((m) => String(m.id) === modKey)
    const allModuleMenus = [...(parentModule?.menus || [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )

    const idxA = allModuleMenus.findIndex((m) => m.id === menu.id)
    const idxB = allModuleMenus.findIndex((m) => m.id === targetItem.id)
    if (idxA < 0 || idxB < 0) return

    const swapped = [...allModuleMenus]
    const [moved] = swapped.splice(idxA, 1)
    swapped.splice(idxB, 0, moved)

    const reorderPayload = swapped.map((item, i) => ({
      id: item.id,
      sort_order: i + 1,
    }))

    try {
      await adminNavigationService.reorder('menus', reorderPayload)
      invalidateNavigation()
    } catch (e) {
      addToast({ title: 'Gagal Mengubah Urutan', message: e.response?.data?.message || e.message, type: 'error' })
    }
  }

  const handleMoveModuleOrder = async (mod, direction) => {
    const list = [...filteredModules]
    const idx = list.findIndex((m) => m.id === mod.id)
    if (idx < 0) return
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= list.length) return

    const fullList = [...modules].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    const idxA = fullList.findIndex((m) => m.id === mod.id)
    const idxB = fullList.findIndex((m) => m.id === list[targetIdx].id)
    if (idxA < 0 || idxB < 0) return

    const [moved] = fullList.splice(idxA, 1)
    fullList.splice(idxB, 0, moved)

    const reorderPayload = fullList.map((item, i) => ({
      id: item.id,
      sort_order: i + 1,
    }))

    try {
      await adminNavigationService.reorder('modules', reorderPayload)
      invalidateNavigation()
    } catch (e) {
      addToast({ title: 'Gagal Mengubah Urutan Modul', message: e.response?.data?.message || e.message, type: 'error' })
    }
  }

  const handleSubmitModuleForm = (e) => {
    e.preventDefault()
    saveModuleMutation.mutate(moduleFormData)
  }

  const handleSubmitForm = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      name_mobile: formData.sync_names ? formData.name : formData.name_mobile,
    }
    saveMutation.mutate(payload)
  }

  const platformTabs = [
    { id: 'web', label: '1. Menu Web Dashboard', icon: Globe },
    { id: 'mobile', label: '2. Menu Mobile App (Android)', icon: Smartphone },
    { id: 'modules', label: '3. Kelola Modul Induk', icon: Layers },
  ]

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <AppBreadcrumb pageTitle="Manajemen Menu & Navigasi" />

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
              <Menu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Pusat Manajemen Navigasi & Menu Terpadu
                </h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Web & Mobile
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                Atur label, ikon Lucide/Material, urutan tampil, dan pembatasan role akses untuk Web-Dashboard dan Mobile-App secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => setResetConfirmOpen(true)}
              className="rounded-xl border border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4 text-slate-600 dark:text-slate-300 mr-1.5" /> Pulihkan Default
            </Button>
            {activePlatformTab === 'mobile' && (
              <Button
                variant="primary"
                onClick={() => setSyncConfirmOpen(true)}
                className="rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-1.5" /> Publikasikan ke Mobile
              </Button>
            )}
            {activePlatformTab === 'modules' ? (
              <Button variant="primary" onClick={handleOpenCreateModule} className="rounded-xl">
                <Plus className="h-4 w-4 mr-1.5" /> Tambah Modul Baru
              </Button>
            ) : (
              <Button variant="primary" onClick={handleOpenCreate} className="rounded-xl">
                <Plus className="h-4 w-4 mr-1.5" /> Tambah Menu Baru
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Navigation Tabs (Web vs Mobile vs Modules) */}
        <nav className="flex overflow-x-auto no-scrollbar border-b border-emerald-200/80 bg-emerald-50/40 p-3 dark:border-emerald-800/60 dark:bg-[#13221f]/50">
          <AppTabs
            tabs={platformTabs}
            activeTab={activePlatformTab}
            onChange={setActivePlatformTab}
            ariaLabel="Navigasi Platform Menu"
          />
        </nav>

        {/* Filter & Toolbar Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-[#15212d]">
          {activePlatformTab === 'mobile' ? (
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full">
                <span className="text-xs font-bold text-slate-500 mr-1 whitespace-nowrap">Target Peran:</span>
                {canonicalRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedMobileRole(role.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                      selectedMobileRole === role.id
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          ) : activePlatformTab === 'web' ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Total {currentMenus.length} Menu Sidebar Web
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Total {filteredModules.length} Modul Induk
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Urutan dan status aktif modul langsung memengaruhi sidebar Web & sinkronisasi Mobile.
              </span>
            </div>
          )}

          {/* Module Filter & Search Box */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {activePlatformTab !== 'modules' && (
              <div className="w-full sm:w-52">
                <HeroUiFilterSelect
                  value={selectedModuleFilter}
                  onChange={(val) => setSelectedModuleFilter(val || 'all')}
                  options={moduleFilterOptions}
                  placeholder="Semua Modul"
                  icon={Layers}
                  searchable={true}
                  className="w-full"
                  ariaLabel="Filter Modul Induk"
                />
              </div>
            )}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={activePlatformTab === 'modules' ? 'Cari nama / id modul...' : 'Cari nama menu / rute...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Datatable / Grid of Modules or Menus */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs font-bold">Memuat daftar menu navigasi...</p>
            </div>
          ) : activePlatformTab === 'modules' ? (
            filteredModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
                <Layers className="h-10 w-10 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tidak ada modul yang sesuai</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Silakan ubah kata kunci pencarian atau klik tombol "Tambah Modul Baru" di atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-emerald-100 dark:border-slate-800">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-200 border-b-2 border-emerald-200/90">
                      <th className="py-3 px-4 font-black">Urutan</th>
                      <th className="py-3 px-4 font-black">Ikon & Nama Modul</th>
                      <th className="py-3 px-4 font-black">ID Modul</th>
                      <th className="py-3 px-4 font-black">Platform</th>
                      <th className="py-3 px-4 font-black text-center">Jumlah Menu</th>
                      <th className="py-3 px-4 font-black text-center">Status</th>
                      <th className="py-3 px-4 font-black text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/80 dark:divide-slate-800 bg-white dark:bg-[#1B2433]">
                    {filteredModules.map((mod, index) => (
                      <tr
                        key={mod.id}
                        className={`transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 ${
                          mod.is_active === false ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-slate-500 w-5 text-center">
                              #{mod.sort_order}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleMoveModuleOrder(mod, -1)}
                                disabled={index === 0}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                                title="Naikkan urutan modul"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveModuleOrder(mod, 1)}
                                disabled={index === filteredModules.length - 1}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                                title="Turunkan urutan modul"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                              {renderLucideIcon(mod.icon || 'Layers', 'h-4 w-4 text-emerald-600 dark:text-emerald-400')}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {mod.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                icon: {mod.icon || 'Layers'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {mod.id}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 px-2 py-0.5 text-[10px] font-bold uppercase">
                            {mod.platform || 'both'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedModuleFilter(String(mod.id))
                              setActivePlatformTab(mod.platform === 'mobile' ? 'mobile' : 'web')
                            }}
                            className="rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 text-[11px] font-bold transition"
                            title="Lihat daftar menu dalam modul ini"
                          >
                            {(mod.menus || []).length} menu
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleModuleActive(mod)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition ${
                              mod.is_active !== false
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {mod.is_active !== false ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModule(mod)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              title="Ubah Modul"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteModuleTarget(mod)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-rose-950/40"
                              title="Hapus Modul"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : currentMenus.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
              <Menu className="h-10 w-10 text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tidak ada menu yang sesuai</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Silakan ubah kata kunci pencarian atau klik tombol "Tambah Menu Baru" di atas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-emerald-100 dark:border-slate-800">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-200 border-b-2 border-emerald-200/90">
                    <th className="py-3 px-4 font-black">Urutan</th>
                    <th className="py-3 px-4 font-black">Ikon & Label Web</th>
                    <th className="py-3 px-4 font-black">Ikon & Label Mobile</th>
                    <th className="py-3 px-4 font-black">Tujuan Rute / Screen</th>
                    <th className="py-3 px-4 font-black">Hak Akses / Role</th>
                    <th className="py-3 px-4 font-black text-center">Status</th>
                    <th className="py-3 px-4 font-black text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-slate-800 bg-white dark:bg-[#1B2433]">
                  {currentMenus.map((menu) => {
                    const moveInfo = siblingMoveMap.get(menu.id) || { canUp: false, canDown: false }
                    return (
                      <tr
                        key={menu.id}
                        className={`transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 ${
                          !menu.is_active ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
                        }`}
                      >
                        {/* Sort Controls (within parent module) */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-slate-500 w-5 text-center">
                              #{menu.sort_order}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleMoveOrder(menu, -1)}
                                disabled={!moveInfo.canUp}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                                title="Naikkan urutan dalam modul"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveOrder(menu, 1)}
                                disabled={!moveInfo.canDown}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                                title="Turunkan urutan dalam modul"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Web Label & Icon */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                              {renderLucideIcon(menu.icon, 'h-4 w-4 text-emerald-600 dark:text-emerald-400')}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {menu.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                  {menu.module_name}
                                </span>
                                <span>•</span>
                                <span className="font-mono">{menu.icon}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Mobile Label & Icon */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="grid h-8 w-8 place-items-center rounded-xl text-white font-bold text-xs shadow-xs"
                              style={{
                                backgroundColor: menu.metadata?.color || '#059669',
                              }}
                            >
                              {renderMaterialIconPreview(menu.icon_mobile, 'h-4 w-4 text-white')}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {menu.name_mobile || menu.name}
                                </span>
                                {(menu.name_mobile || menu.name) === menu.name && (
                                  <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-500 dark:bg-slate-800">
                                    Sama
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                                {menu.icon_mobile || 'auto'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Path / Route */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {menu.path}
                          </span>
                        </td>

                        {/* Permissions & Roles */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {menu.target_roles && menu.target_roles.length > 0 ? (
                              menu.target_roles.slice(0, 3).map((r) => (
                                <span
                                  key={r}
                                  className="rounded bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 px-1.5 py-0.5 text-[10px] font-semibold"
                                >
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400">Semua Role</span>
                            )}
                            {menu.target_roles && menu.target_roles.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{menu.target_roles.length - 3}
                              </span>
                            )}
                            {Array.isArray(menu.required_permissions) && menu.required_permissions.length > 0 && (
                              <span
                                className="rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-mono"
                                title={menu.required_permissions.join(', ')}
                              >
                                {menu.required_permissions.length === 1
                                  ? menu.required_permissions[0]
                                  : `${menu.required_permissions.length} perm`}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Active Toggle */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(menu)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition ${
                              menu.is_active
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {menu.is_active ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(menu)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              title="Ubah Menu"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmTarget(menu)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-rose-950/40"
                              title="Hapus Menu"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          MODAL FORM TAMBAH / UBAH MENU (Terpadu Web & Mobile)
      ======================================================== */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433] max-h-[90vh] flex flex-col"
            >
              {/* Header Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

              <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-700/20">
                      <Menu className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {editingItem ? 'Ubah Menu Navigasi' : 'Tambah Menu Navigasi Baru'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sesuaikan label, ikon web/mobile, dan batasan hak akses role.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFormModalOpen(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4 pt-1">
                  {/* Platform Picker */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                      Platform Target Menu:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'web', label: 'Web Saja', icon: Globe },
                        { id: 'mobile', label: 'Mobile Saja', icon: Smartphone },
                        { id: 'both', label: 'Keduanya (Both)', icon: Layers },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, platform: p.id })}
                          className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                            formData.platform === p.id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                          }`}
                        >
                          <p.icon className="h-4 w-4" /> {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Module Parent */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                      Modul Induk (Parent Module):
                    </label>
                    <HeroUiFilterSelect
                      value={String(formData.module_id || '')}
                      onChange={(val) => setFormData({ ...formData, module_id: val })}
                      options={moduleOptions}
                      placeholder="Pilih Modul Induk"
                      icon={Layers}
                      searchable={true}
                      className="w-full"
                      ariaLabel="Pilih Modul Induk"
                    />
                  </div>

                  {/* Name Sync Box */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sliders className="h-4 w-4 text-emerald-600" />
                        Label / Nama Menu
                      </span>
                      <label className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sync_names}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setFormData((prev) => ({
                              ...prev,
                              sync_names: checked,
                              name_mobile: checked ? prev.name : prev.name_mobile,
                            }))
                          }}
                          className="h-4 w-4 accent-emerald-600 cursor-pointer"
                        />
                        Samakan Nama untuk Web & Mobile
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          Nama di Web Dashboard:
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => {
                            const val = e.target.value
                            setFormData((prev) => ({
                              ...prev,
                              name: val,
                              name_mobile: prev.sync_names ? val : prev.name_mobile,
                            }))
                          }}
                          placeholder="Contoh: Jadwal Pelajaran"
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          Nama di Mobile App:
                        </label>
                        <input
                          type="text"
                          required
                          disabled={formData.sync_names}
                          value={formData.sync_names ? formData.name : formData.name_mobile}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name_mobile: e.target.value }))
                          }
                          placeholder="Contoh: Jadwal KBM"
                          className={`h-10 w-full rounded-xl border px-3 text-xs text-slate-800 outline-none transition ${
                            formData.sync_names
                              ? 'bg-slate-100 opacity-70 border-slate-200 dark:bg-slate-800'
                              : 'bg-white border-slate-200 focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Icon Selection Box */}
                  <div className="rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Palette className="h-4 w-4 text-emerald-600" />
                        Pilihan Gambar Ikon (Web Lucide & Mobile Material)
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoMatchIcon}
                        className="inline-flex items-center gap-1 rounded-xl bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-800 hover:bg-teal-200 dark:bg-teal-950/80 dark:text-teal-300 transition shadow-xs cursor-pointer"
                        title="Cocokkan Ikon Mobile otomatis dari Ikon Web"
                      >
                        <Sparkles className="h-3 w-3" /> Cocokkan Otomatis
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Web Icon Visual Card */}
                      <div
                        onClick={() => {
                          setIconSearchQuery('')
                          setIconPickerModal('web')
                        }}
                        className="group relative flex items-center gap-3.5 rounded-2xl border-2 border-emerald-200 bg-white p-3 transition-all hover:border-emerald-500 hover:shadow-md cursor-pointer dark:border-emerald-800/80 dark:bg-[#1B2433]"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                          {renderLucideIcon(formData.icon, 'h-6 w-6 text-white')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Ikon Web (Lucide)
                          </span>
                          <div className="truncate text-xs font-black text-slate-900 dark:text-white">
                            {formData.icon || 'Belum dipilih'}
                          </div>
                          <span className="inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 underline underline-offset-2">
                            Pilih / Ganti Gambar Ikon ➜
                          </span>
                        </div>
                      </div>

                      {/* Mobile Icon Visual Card */}
                      <div
                        onClick={() => {
                          setIconSearchQuery('')
                          setIconPickerModal('mobile')
                        }}
                        className="group relative flex items-center gap-3.5 rounded-2xl border-2 border-violet-200 bg-white p-3 transition-all hover:border-violet-500 hover:shadow-md cursor-pointer dark:border-violet-800/80 dark:bg-[#1B2433]"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition">
                          {renderMaterialIconPreview(formData.icon_mobile, 'h-6 w-6 text-white')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                            Ikon Mobile (Material)
                          </span>
                          <div className="truncate text-xs font-black text-slate-900 dark:text-white font-mono">
                            {formData.icon_mobile || 'Belum dipilih'}
                          </div>
                          <span className="inline-block text-[10px] font-semibold text-violet-700 dark:text-violet-300 underline underline-offset-2">
                            Pilih / Ganti Gambar Ikon ➜
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route / Screen Target */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                        Rute Web / Layar Mobile:
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.path}
                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                        placeholder="Contoh: /dashboard/master/siswa atau Jadwal"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 font-mono"
                      />
                      {(webRoutes.length > 0 || mobileScreens.length > 0) && (
                        <div className="mt-1.5 space-y-1">
                          <HeroUiFilterSelect
                            value={String(formData.path || '')}
                            onChange={(val) => {
                              if (!val) return
                              const matchedMobile = mobileScreens.find(
                                (s) => String(s.route || s.path || s.value || s) === String(val)
                              )
                              setFormData((prev) => ({
                                ...prev,
                                path: val,
                                metadata: matchedMobile?.tab
                                  ? { ...prev.metadata, tab: matchedMobile.tab }
                                  : prev.metadata,
                              }))
                            }}
                            options={[
                              ...(formData.platform !== 'mobile'
                                ? webRoutes.map((r) => {
                                    const pathVal = String(r.path || r.value || r)
                                    return {
                                      value: pathVal,
                                      label: `[Web] ${r.label || pathVal}`,
                                      subtext: pathVal,
                                    }
                                  })
                                : []),
                              ...(formData.platform !== 'web'
                                ? mobileScreens.map((s) => {
                                    const routeVal = String(s.route || s.path || s.value || s)
                                    return {
                                      value: routeVal,
                                      label: `[Mobile] ${s.label || routeVal}`,
                                      subtext: s.tab ? `${routeVal} (tab: ${s.tab})` : routeVal,
                                    }
                                  })
                                : []),
                            ]}
                            placeholder="Pilih cepat dari daftar rute/screen..."
                            icon={LinkIcon}
                            searchable={true}
                            className="w-full"
                            ariaLabel="Pilih Cepat Rute atau Layar"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                          Preset Warna Mobile:
                        </label>
                        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                          {COLOR_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  metadata: { ...formData.metadata, color: p.color, bg: p.bg },
                                })
                              }
                              style={{ backgroundColor: p.color }}
                              className={`h-7 w-7 rounded-full shrink-0 transition ${
                                formData.metadata?.color === p.color
                                  ? 'ring-2 ring-emerald-600 ring-offset-2'
                                  : ''
                              }`}
                              title={p.label}
                            />
                          ))}
                        </div>
                      </div>
                      {formData.platform !== 'web' && (
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                            Parameter Tab Mobile (Opsional):
                          </label>
                          <input
                            type="text"
                            value={formData.metadata?.tab || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                metadata: { ...formData.metadata, tab: e.target.value },
                              })
                            }
                            placeholder="Contoh: jadwal / pengumuman"
                            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target Roles (Multi-select Checkboxes) */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                      Target Role Pengguna (Akses Mobile & Web):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {canonicalRoles.map((r) => {
                        const checked = formData.target_roles.includes(r.id)
                        return (
                          <label
                            key={r.id}
                            className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition ${
                              checked
                                ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    target_roles: [...formData.target_roles, r.id],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    target_roles: formData.target_roles.filter((x) => x !== r.id),
                                  })
                                }
                              }}
                              className="h-3.5 w-3.5 accent-emerald-600 rounded"
                            />
                            <span className="truncate">{r.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Required Permissions (Web RBAC) */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/40 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-amber-600" />
                        Hak Akses / Permission Dibutuhkan (Opsional)
                      </span>
                      {formData.required_permissions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, required_permissions: [] })}
                          className="text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          Kosongkan ({formData.required_permissions.length} dipilih)
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Jika dipilih, pengguna non-Super Admin wajib memiliki minimal satu permission berikut untuk melihat menu ini.
                    </p>
                    {formData.required_permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {formData.required_permissions.map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 px-2 py-0.5 text-[10px] font-mono font-bold"
                          >
                            {perm}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  required_permissions: formData.required_permissions.filter(
                                    (p) => p !== perm
                                  ),
                                })
                              }
                              className="hover:text-rose-600"
                              aria-label={`Hapus permission ${perm}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={permissionSearchQuery}
                        onChange={(e) => setPermissionSearchQuery(e.target.value)}
                        placeholder="Cari permission (contoh: view_students, manage_attendance)..."
                        className="h-8 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-[11px] text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="max-h-32 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1">
                      {filteredPermissions.length === 0 ? (
                        <span className="col-span-full text-[11px] text-slate-400 py-2 text-center">
                          Tidak ada permission yang cocok.
                        </span>
                      ) : (
                        filteredPermissions.slice(0, 60).map((perm) => {
                          const permName = String(perm)
                          const isChecked = formData.required_permissions.includes(permName)
                          return (
                            <label
                              key={permName}
                              className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[11px] font-mono cursor-pointer transition ${
                                isChecked
                                  ? 'border-amber-300 bg-amber-50/70 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      required_permissions: [...formData.required_permissions, permName],
                                    })
                                  } else {
                                    setFormData({
                                      ...formData,
                                      required_permissions: formData.required_permissions.filter(
                                        (p) => p !== permName
                                      ),
                                    })
                                  }
                                }}
                                className="h-3.5 w-3.5 accent-amber-600 rounded"
                              />
                              <span className="truncate">{permName}</span>
                            </label>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Footer Submit Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsFormModalOpen(false)}
                      className="rounded-xl"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      pending={saveMutation.isPending}
                      className="rounded-xl"
                    >
                      <Save className="h-4 w-4 mr-1.5" /> Simpan Menu
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          HARMONIZED DELETE CONFIRMATION MODAL
      ======================================================== */}
      <AnimatePresence>
        {deleteConfirmTarget && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-rose-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-500/30">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      Hapus Menu
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Hapus "{deleteConfirmTarget.name}"?
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Menu ini akan dihapus dari navigasi sistem ({deleteConfirmTarget.platform}). Tindakan ini dapat dipulihkan dengan mereset ke menu default.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setDeleteConfirmTarget(null)}
                    className="rounded-xl"
                  >
                    Batal
                  </Button>
                  <Button
                    variant="danger"
                    pending={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(deleteConfirmTarget.id)}
                    className="rounded-xl"
                  >
                    Ya, Hapus Menu
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          HARMONIZED SYNC TO MOBILE CONFIRMATION MODAL
      ======================================================== */}
      <AnimatePresence>
        {syncConfirmOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Sinkronisasi Mobile
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Publikasikan ke Aplikasi Mobile?
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Seluruh perubahan susunan menu mobile akan langsung disinkronkan ke server konfigurasi Android tanpa perlu rilis APK baru di Play Store.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={() => setSyncConfirmOpen(false)} className="rounded-xl">
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    pending={syncMutation.isPending}
                    onClick={() => syncMutation.mutate()}
                    className="rounded-xl"
                  >
                    Ya, Publikasikan Sekarang
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          HARMONIZED RESET DEFAULTS CONFIRMATION MODAL
      ======================================================== */}
      <AnimatePresence>
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-amber-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600" />
              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white shadow-md shadow-amber-500/30">
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Reset Default
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Pulihkan Susunan Menu Bawaan?
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Tindakan ini akan mengembalikan seluruh susunan menu Web Dashboard dan Mobile App (Siswa, Orang Tua, Guru, TU, dll) ke konfigurasi standar awal sistem.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={() => setResetConfirmOpen(false)} className="rounded-xl">
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    pending={resetMutation.isPending}
                    onClick={() => resetMutation.mutate()}
                    className="rounded-xl bg-amber-600 hover:bg-amber-700"
                  >
                    Ya, Pulihkan Default
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Modal Visual Icon Gallery Picker */}
      <AnimatePresence>
        {iconPickerModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIconPickerModal(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#1B2433] dark:border dark:border-slate-800 flex flex-col"
            >
              {/* Top Accent Gradient */}
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${
                  iconPickerModal === 'mobile'
                    ? 'from-violet-500 via-purple-400 to-violet-600'
                    : 'from-emerald-500 via-teal-400 to-emerald-600'
                }`}
              />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-md ${
                      iconPickerModal === 'mobile'
                        ? 'bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-violet-500/20'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-500/20'
                    }`}
                  >
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {iconPickerModal === 'mobile'
                        ? 'Pilih Gambar Ikon Mobile (Material)'
                        : 'Pilih Gambar Ikon Web / Modul (Lucide)'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Klik langsung pada gambar ikon di bawah ini untuk memilihnya.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIconPickerModal(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Bar & Stats */}
              <div className="border-b border-slate-100 p-3 sm:p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={
                      iconPickerModal === 'mobile'
                        ? 'Cari nama ikon Mobile (misal: dashboard, account, clock, cbt)...'
                        : 'Cari nama ikon Lucide (misal: book, calendar, user, settings)...'
                    }
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    autoFocus
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  {iconSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setIconSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <span className="shrink-0 rounded-xl bg-slate-200/70 px-2.5 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {iconPickerModal === 'mobile'
                    ? `${filteredMaterialIcons.length.toLocaleString('id-ID')} Ikon${!mdiReady ? ' (Memuat SVG...)' : ''}`
                    : `${filteredLucideIcons.length.toLocaleString('id-ID')} Ikon`}
                </span>
              </div>

              {/* Scrollable Grid of Visual Icons */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 max-h-[50vh]">
                {(iconPickerModal === 'mobile' ? filteredMaterialIcons : filteredLucideIcons).length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                    <Search className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold">Tidak ada ikon yang sesuai pencarian</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coba cari dengan kata kunci bahasa Inggris umum seperti: user, book, star, card.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {iconPickerModal !== 'mobile'
                        ? filteredLucideIcons.slice(0, visibleIconLimit).map((ic) => {
                          const activeVal =
                            iconPickerModal === 'module' ? moduleFormData.icon : formData.icon
                          const isSelected = activeVal === ic
                          return (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => {
                                if (iconPickerModal === 'module') {
                                  setModuleFormData((prev) => ({ ...prev, icon: ic }))
                                } else {
                                  setFormData((prev) => ({ ...prev, icon: ic }))
                                }
                                setIconPickerModal(null)
                              }}
                              className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition-all text-center cursor-pointer ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30 dark:border-emerald-500 dark:bg-emerald-950/50'
                                  : 'border-slate-200/90 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:scale-[1.02] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-emerald-700/60'
                              }`}
                            >
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-700 group-hover:scale-110 group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-300'
                                }`}
                              >
                                {renderLucideIcon(ic, 'h-6 w-6')}
                              </div>
                              <span
                                className="w-full truncate text-[11px] font-bold text-slate-800 dark:text-slate-200"
                                title={ic}
                              >
                                {ic}
                              </span>
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
                                  <Check className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </button>
                          )
                        })
                        : filteredMaterialIcons.slice(0, visibleIconLimit).map((item) => {
                          const isSelected = formData.icon_mobile === item.id
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, icon_mobile: item.id }))
                                setIconPickerModal(null)
                              }}
                              className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition-all text-center cursor-pointer ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30 dark:border-emerald-500 dark:bg-emerald-950/50'
                                  : 'border-slate-200/90 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:scale-[1.02] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-emerald-700/60'
                              }`}
                            >
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                                  isSelected
                                    ? 'bg-violet-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-700 group-hover:scale-110 group-hover:bg-violet-100 group-hover:text-violet-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-violet-950 dark:group-hover:text-violet-300'
                                }`}
                              >
                                {renderMaterialIconPreview(item.id, 'h-6 w-6')}
                              </div>
                              <span
                                className="w-full truncate text-[11px] font-bold text-slate-800 dark:text-slate-200"
                                title={item.label}
                              >
                                {item.label}
                              </span>
                              <span
                                className="w-full truncate text-[9px] font-mono text-slate-400 dark:text-slate-500"
                                title={item.id}
                              >
                                {item.id}
                              </span>
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
                                  <Check className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </button>
                          )
                        })}
                    </div>

                    {((iconPickerModal === 'mobile' ? filteredMaterialIcons.length : filteredLucideIcons.length) > visibleIconLimit) && (
                      <div className="mt-4 flex flex-col items-center gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setVisibleIconLimit((prev) => prev + ICON_PICKER_PAGE_SIZE)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          Muat Lebih Banyak (+{ICON_PICKER_PAGE_SIZE} dari{' '}
                          {(
                            (iconPickerModal === 'mobile'
                              ? filteredMaterialIcons.length
                              : filteredLucideIcons.length) - visibleIconLimit
                          ).toLocaleString('id-ID')}{' '}
                          ikon tersisa)
                        </Button>
                        <span className="text-[11px] text-slate-400">
                          Menampilkan {visibleIconLimit.toLocaleString('id-ID')} dari{' '}
                          {(iconPickerModal === 'mobile'
                            ? filteredMaterialIcons.length
                            : filteredLucideIcons.length
                          ).toLocaleString('id-ID')}{' '}
                          ikon (gunakan kolom pencarian untuk hasil instan)
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-xs text-slate-500">
                  Ikon aktif:{' '}
                  <strong className="text-slate-800 dark:text-white font-mono">
                    {iconPickerModal === 'mobile'
                      ? formData.icon_mobile
                      : iconPickerModal === 'module'
                      ? moduleFormData.icon
                      : formData.icon}
                  </strong>
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setIconPickerModal(null)}
                  className="rounded-xl"
                >
                  Tutup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Modal Tambah / Ubah Modul Induk */}
      <AnimatePresence>
        {isModuleModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {editingModule ? 'Ubah Modul Induk' : 'Tambah Modul Induk Baru'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Modul digunakan untuk mengelompokkan item menu sidebar dan mobile.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModuleModalOpen(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitModuleForm} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                      Nama Modul:
                    </label>
                    <input
                      type="text"
                      required
                      value={moduleFormData.name}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, name: e.target.value })}
                      placeholder="Contoh: Akademik & Kurikulum"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {!editingModule && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                        ID Modul (Slug Unik):
                      </label>
                      <input
                        type="text"
                        required
                        value={moduleFormData.id}
                        onChange={(e) =>
                          setModuleFormData({
                            ...moduleFormData,
                            id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
                          })
                        }
                        placeholder="contoh: akademik-kurikulum"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono text-slate-800 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                      Platform Modul:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'both', label: 'Keduanya' },
                        { id: 'web', label: 'Web Saja' },
                        { id: 'mobile', label: 'Mobile Saja' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setModuleFormData({ ...moduleFormData, platform: p.id })}
                          className={`rounded-xl border p-2 text-xs font-bold transition ${
                            moduleFormData.platform === p.id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setIconSearchQuery('')
                      setIconPickerModal('module')
                    }}
                    className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-white p-2.5 cursor-pointer hover:border-emerald-500 transition dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400">
                      {renderLucideIcon(moduleFormData.icon || 'Layers', 'h-5 w-5')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-bold uppercase text-emerald-600">
                        Ikon Modul (Lucide)
                      </span>
                      <div className="truncate text-xs font-black text-slate-900 dark:text-white font-mono">
                        {moduleFormData.icon || 'Layers'}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 underline">
                      Pilih Ikon
                    </span>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moduleFormData.is_active}
                      onChange={(e) =>
                        setModuleFormData({ ...moduleFormData, is_active: e.target.checked })
                      }
                      className="h-4 w-4 accent-emerald-600 rounded"
                    />
                    Modul Aktif (Tampilkan menu di dalamnya)
                  </label>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsModuleModalOpen(false)}
                      className="rounded-xl"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      pending={saveModuleMutation.isPending}
                      className="rounded-xl"
                    >
                      <Save className="h-4 w-4 mr-1.5" /> Simpan Modul
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Modal Konfirmasi Hapus Modul */}
      <AnimatePresence>
        {deleteModuleTarget && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-rose-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-500/30">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      Hapus Modul Induk
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Hapus "{deleteModuleTarget.name}"?
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Modul ini memiliki {(deleteModuleTarget.menus || []).length} menu di dalamnya. Menghapus modul juga akan menghapus seluruh menu di dalam modul tersebut.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setDeleteModuleTarget(null)}
                    className="rounded-xl"
                  >
                    Batal
                  </Button>
                  <Button
                    variant="danger"
                    pending={deleteModuleMutation.isPending}
                    onClick={() => deleteModuleMutation.mutate(deleteModuleTarget.id)}
                    className="rounded-xl"
                  >
                    Ya, Hapus Modul
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
