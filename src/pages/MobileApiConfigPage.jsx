import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import AppModal from "../components/app/AppModal"
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  ArrowDown,
  ArrowUp,
  Bell,
  BookOpen,
  CheckCircle2,
  Cpu,
  FileQuestion,
  HelpCircle,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  Layers,
  MessageSquare,
  Palette,
  QrCode,
  RotateCcw,
  Save,
  Shield,
  Smartphone,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UploadCloud,
  AlertTriangle,
  Trash2,
  XCircle,
  Wrench,
  ChevronRight,
  Eye,
  Menu,
  Check,
  ChevronDown,
  Phone,
  Search
} from 'lucide-react'
import {
  useNavigate
} from 'react-router-dom'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppTabs from '../components/app/AppTabs'
import {
  useToast
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
import {
  DEFAULT_MOBILE_API_CONFIG,
  mobileApiConfigService
} from '../services/mobileApiConfigService'
import {
  usePengaturanStore,
  resolveFoundationName
} from '../stores/pengaturanStore'

const colorFields = [
  ['primary_color', 'Warna Utama'],
  ['secondary_color', 'Warna Sekunder'],
  ['accent_color', 'Warna Aksen'],
  ['background_color', 'Latar Aplikasi'],
  ['surface_color', 'Permukaan Kartu'],
  ['text_color', 'Teks Utama'],
  ['muted_text_color', 'Teks Sekunder'],
]

const sectionLabels = {
  announcements: 'Informasi & Pengumuman',
  quick_menu: 'Menu Utama',
  metrics: 'Ringkasan KPI',
  schedule: 'Agenda Hari Ini',
}

const roleLabels = {
  super_admin: 'Super Admin',
  foundation: 'Pengurus Yayasan',
  principal: 'Kepala Sekolah',
  divisi: 'Divisi Pendidikan',
  tu: 'Tata Usaha (TU)',
  teacher: 'Guru / Pengajar',
  musyrif: 'Musyrif Asrama',
  parent: 'Orang Tua',
  student: 'Siswa',
  staff: 'Staf / Operator',
  alumni: 'Alumni',
}

const gradientAngles = {
  vertical: '180deg',
  horizontal: '90deg',
  diagonal: '135deg',
}

const FEATURE_DEFINITIONS = [
  {
    key: 'qr_login',
    title: 'Scan QR Login',
    desc: 'Izinkan autentikasi cepat menggunakan scan QR ID Card pegawai atau siswa.',
    icon: QrCode,
  },
  {
    key: 'qr_attendance',
    title: 'Presensi Mandiri QR',
    desc: 'Aktifkan modul scan presensi kelas dan gerbang berbasis QR Code.',
    icon: CheckCircle2,
  },
  {
    key: 'chat',
    title: 'Percakapan Interaktif (Chat)',
    desc: 'Komunikasi langsung antara guru pembimbing, wali kelas, dan orang tua.',
    icon: MessageSquare,
  },
  {
    key: 'notifications',
    title: 'Notifikasi & Pengumuman',
    desc: 'Notifikasi kehadiran, tugas, jadwal, dan pengumuman resmi yayasan.',
    icon: Bell,
  },
  {
    key: 'tahfizh',
    title: 'Tahfizh Al-Qur’an',
    desc: 'Setoran hafalan, mutaba’ah juz, riwayat ayat, dan penilaian tajwid.',
    icon: BookOpen,
  },
  {
    key: 'mutabaah',
    title: 'Mutaba’ah Yaumiyyah',
    desc: 'Checklist ibadah harian santri/siswa dengan validasi pembimbing & tanda tangan orang tua.',
    icon: Sparkles,
  },
  {
    key: 'cbt',
    title: 'Ujian Online / CBT',
    desc: 'Pelaksanaan ujian asesmen berbasis komputer/gadget dengan anti-kecurangan.',
    icon: FileQuestion,
  },
  {
    key: 'school_info',
    title: 'Informasi & Profil Sekolah',
    desc: 'Katalog profil sekolah, kurikulum, kalender akademik, dan galeri kegiatan.',
    icon: Info,
  },
]



// ── HARMONIZED DELETE MODAL ───────────────────────────────────────────────
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  return (
    <AppModal
      isOpen={Boolean(isOpen && item)}
      onClose={() => { if (!isSubmitting) onClose() }}
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      variant="danger"
      badge="Hapus Permanen"
      title={item ? `Hapus ${item.label}?` : 'Hapus Asset'}
      icon={Trash2}
      maxWidth="max-w-md"
      zIndex="z-[70]"
      footer={
        <div className="flex w-full items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex h-9.5 items-center justify-center gap-2 rounded-xl border-2 border-rose-600 bg-rose-600 px-5 text-xs font-black text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Asset'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Asset khusus mobile akan dihapus dari server dan dikembalikan ke status fallback bawaan.
        </p>
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-3 dark:border-rose-800/60 dark:bg-rose-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-800 dark:text-rose-300">
              Tindakan ini akan langsung menghapus file dari storage backend.
            </p>
          </div>
        </div>
      </div>
    </AppModal>
  )
}

// ── RESET CONFIRM MODAL ───────────────────────────────────────────────────
function ResetConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      variant="warning"
      badge="Kembalikan Nilai"
      title="Kembalikan ke Default?"
      icon={RotateCcw}
      maxWidth="max-w-md"
      zIndex="z-[70]"
      footer={
        <div className="flex w-full items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-9.5 items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
          >
            Ya, Reset Formulir
          </button>
        </div>
      }
    >
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Nilai formulir akan dikembalikan ke setelan awal pabrik (belum tersimpan sebelum Anda klik Publikasikan).
      </p>
    </AppModal>
  )
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
        className={`h-9.5 w-full flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${isOpen
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
                    className="w-full rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

export default function MobileApiConfigPage() {
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const foundationName = resolveFoundationName(pengaturan)
  const navigate = useNavigate()
  const [config, setConfig] = useState(DEFAULT_MOBILE_API_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('identitas') // 'identitas' | 'tampilan' | 'dashboard' | 'fitur' | 'sistem' | 'onboarding'
  const [selectedRole, setSelectedRole] = useState('super_admin')
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0)
  const [uploadingAsset, setUploadingAsset] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)

  const toast = useToast()
  const toastSuccess = (title, message) => toast.success(title, message)
  const toastError = (title, message) => toast.error(title, message)
  const toastWarning = (title, message) => toast.warning(title, message)

  const gradientDirectionOptions = useMemo(() => [
    { value: 'vertical', label: 'Atas ke Bawah' },
    { value: 'horizontal', label: 'Kiri ke Kanan' },
    { value: 'diagonal', label: 'Diagonal' },
  ], [])

  const fontFamilyOptions = useMemo(() => [
    { value: 'system', label: 'Sistem Android' },
    { value: 'Poppins', label: 'Poppins (Google Font)' },
    { value: 'Nunito', label: 'Nunito (Google Font)' },
  ], [])

  const fontScaleOptions = useMemo(() => [
    { value: 'compact', label: 'Ringkas (Compact - 92%)' },
    { value: 'normal', label: 'Standar (Normal - 100%)' },
    { value: 'large', label: 'Besar (Large - 110%)' },
  ], [])

  const roleSelectOptions = useMemo(() => {
    return Object.entries(roleLabels).map(([key, label]) => ({
      value: key,
      label: label,
    }))
  }, [])

  useEffect(() => {
    mobileApiConfigService
      .getConfig()
      .then(setConfig)
      .catch(() =>
        toastError('Gagal Memuat', 'Konfigurasi Android belum dapat dimuat dari server.')
      )
      .finally(() => setLoading(false))
  }, [])

  const handleUploadMedia = async (type, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAsset(type)
    try {
      const updated = await mobileApiConfigService.uploadMedia(type, file)
      setConfig(updated)
      toastSuccess(
        'Berhasil Diunggah',
        `Asset ${type.replace('_', ' ')} berhasil diunggah dan tersimpan ke database.`
      )
    } catch (err) {
      toastError(
        'Gagal Mengunggah',
        err?.response?.data?.message || 'Unggahan asset gagal diproses.'
      )
    } finally {
      setUploadingAsset(null)
      e.target.value = ''
    }
  }

  const handleDeleteMedia = (type, label) => {
    setDeleteTarget({ type, label })
  }

  const handleConfirmDeleteMedia = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setUploadingAsset(deleteTarget.type)
    try {
      const updated = await mobileApiConfigService.deleteMedia(deleteTarget.type)
      setConfig(updated)
      toastSuccess(
        'Berhasil Dihapus',
        `Asset ${deleteTarget.label} telah dihapus dan status fallback dipulihkan.`
      )
      setDeleteTarget(null)
    } catch (err) {
      toastError(
        'Gagal Menghapus',
        err?.response?.data?.message || 'Gagal menghapus asset.'
      )
    } finally {
      setIsDeleting(false)
      setUploadingAsset(null)
    }
  }

  const selectedLayout = config.role_home_layouts?.[selectedRole] || config.home_layout
  const sortedSections = useMemo(
    () => [...(selectedLayout?.sections || [])].sort((a, b) => a.order - b.order),
    [selectedLayout?.sections]
  )

  const previewBackground = config.theme?.background_gradient_enabled
    ? {
      backgroundImage: `linear-gradient(${gradientAngles[config.theme?.background_gradient_direction || 'diagonal']}, ${config.theme?.background_gradient_start || '#F7FCFA'}, ${config.theme?.background_gradient_end || '#EAF8F2'})`,
    }
    : { backgroundColor: config.theme?.background_color || '#F2FBF7' }

  // Updaters
  const updateTheme = (key, value) =>
    setConfig((current) => ({
      ...current,
      theme: { ...current.theme, [key]: value },
    }))

  const updateBranding = (key, value) =>
    setConfig((current) => ({
      ...current,
      branding: { ...current.branding, [key]: value },
    }))

  const updateBrandingContact = (key, value) =>
    setConfig((current) => ({
      ...current,
      branding: {
        ...current.branding,
        contact: {
          ...(current.branding?.contact || {}),
          [key]: value,
        },
      },
    }))

  const updateFeature = (key, value) =>
    setConfig((current) => ({
      ...current,
      features: { ...current.features, [key]: value },
    }))

  const updateSystem = (key, value) =>
    setConfig((current) => ({
      ...current,
      system: { ...current.system, [key]: value },
    }))

  const updateOnboarding = (key, value) =>
    setConfig((current) => ({
      ...current,
      onboarding: { ...(current.onboarding || {}), [key]: value },
    }))

  const updateOnboardingSlide = (index, field, value) =>
    setConfig((current) => {
      const slides = [...(current.onboarding?.slides || [])]
      if (slides[index]) {
        slides[index] = {
          ...slides[index],
          [field]: value,
          ...(field === 'description' ? { desc: value } : {}),
          ...(field === 'desc' ? { description: value } : {}),
        }
      }
      return {
        ...current,
        onboarding: {
          ...(current.onboarding || {}),
          slides,
        },
      }
    })

  const updateSection = (type, value) =>
    setConfig((current) => {
      const baseLayout =
        current.role_home_layouts?.[selectedRole] ||
        DEFAULT_MOBILE_API_CONFIG.role_home_layouts?.[selectedRole] ||
        current.home_layout
      return {
        ...current,
        role_home_layouts: {
          ...current.role_home_layouts,
          [selectedRole]: {
            ...baseLayout,
            customized: true,
            sections: (baseLayout?.sections || []).map((item) =>
              item.type === type ? { ...item, ...value } : item
            ),
          },
        },
      }
    })

  const moveSection = (type, direction) => {
    const index = sortedSections.findIndex((item) => item.type === type)
    const target = index + direction
    if (index < 0 || target < 0 || target >= sortedSections.length) return
    const next = [...sortedSections]
      ;[next[index], next[target]] = [next[target], next[index]]
    setConfig((current) => {
      const baseLayout =
        current.role_home_layouts?.[selectedRole] ||
        DEFAULT_MOBILE_API_CONFIG.role_home_layouts?.[selectedRole] ||
        current.home_layout
      return {
        ...current,
        role_home_layouts: {
          ...current.role_home_layouts,
          [selectedRole]: {
            ...baseLayout,
            customized: true,
            sections: next.map((item, order) => ({ ...item, order: order + 1 })),
          },
        },
      }
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const saved = await mobileApiConfigService.saveConfig(config)
      setConfig(saved)
      toastSuccess(
        'Berhasil Dipublikasikan',
        `Konfigurasi Mobile App Android versi ${saved.version} telah disimpan secara terpusat di database.`
      )
    } catch (error) {
      toastError(
        'Gagal Menyimpan',
        error?.response?.data?.message || 'Konfigurasi gagal disimpan.'
      )
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = () => {
    setResetModalOpen(true)
  }

  const handleConfirmReset = () => {
    setConfig(DEFAULT_MOBILE_API_CONFIG)
    setResetModalOpen(false)
    toastSuccess('Formulir Direset', 'Nilai formulir telah dikembalikan ke setelan awal pabrik.')
  }

  const inputClass =
    'mt-1.5 h-11 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100'

  const tabs = [
    { id: 'identitas', label: '1. Identitas', icon: ImageIcon },
    { id: 'tampilan', label: '2. Tampilan & Gaya', icon: Palette },
    { id: 'dashboard', label: '3. Beranda & Role', icon: LayoutDashboard },
    { id: 'fitur', label: '4. Fitur Mobile', icon: Sparkles },
    { id: 'sistem', label: '5. Sistem & Rilis', icon: Cpu },
    { id: 'onboarding', label: '6. Layar Onboarding', icon: Sparkles },
  ]

  return (
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      <div className="mb-4">
        <AppBreadcrumb pageTitle="Pengaturan Mobile App Android" />
      </div>

      {/* Modern Vivid Emerald Hero Header Card */}
      <HeroUiHeader
        title="Pengaturan Mobile App Android"
        subtitle="Pusat kendali identitas, tema visual, susunan menu beranda, fitur dinamis, dan rilis sistem aplikasi mobile santri, wali santri, guru, dan pegawai."
        badge="Konfigurasi Terpusat"
        icon={Smartphone}
        actions={
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
            <Button
              type="button"
              onClick={() => navigate("/dashboard/pengaturan/menu-navigasi")}
              variant="ghost"
              className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 dark:border-emerald-800/60 dark:bg-slate-800 text-xs font-bold"
            >
              <Menu className="h-4 w-4 mr-1.5 text-emerald-600" /> Kelola Menu Navigasi
            </Button>
            <Button
              onClick={save}
              pending={saving}
              disabled={loading}
              variant="create"
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              <Save className="h-4 w-4 mr-1.5 text-white" /> Publikasikan Perubahan
            </Button>
          </div>
        }
      />

      {/* Main Container */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-200/80 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        {/* 5-Section Tab Navigation */}
        <nav aria-label="Navigasi Pengaturan Mobile API" className="flex overflow-x-auto no-scrollbar border-b border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/30 p-3 dark:border-emerald-800/60 dark:bg-[#13221f]/50">
          <AppTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            ariaLabel="Navigasi Pengaturan Mobile API"
          />
        </nav>

        {/* Workspace Layout */}
        <div className="grid gap-6 p-5 xl:grid-cols-[1fr_360px]">
          {/* Active Tab Panel */}
          <div className="space-y-5">
            {/* ========================================================
 TAB 1: IDENTITAS
 ======================================================== */}
            {activeTab === 'identitas' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/60">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                    <ImageIcon className="h-5 w-5 text-emerald-600" />
                    Identitas & Branding Utama
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Atur nama instansi dan label yang tampil pada layar sambutan, login, dan header aplikasi.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Nama Aplikasi
                      <input
                        className={inputClass}
                        value={config.branding?.app_name || ''}
                        onChange={(e) => updateBranding('app_name', e.target.value)}
                        placeholder="Contoh: Dareliman Edu"
                      />
                    </label>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Nama Yayasan / Sekolah
                      <input
                        className={inputClass}
                        value={config.branding?.school_name || ''}
                        onChange={(e) => updateBranding('school_name', e.target.value)}
                        placeholder="Contoh: Yayasan Dar el-Iman Padang"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/60">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    Kontak Layanan & Pusat Bantuan Mobile
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Ditampilkan pada menu Pusat Bantuan & Customer Care (Orang Tua/Siswa) serta popup layanan TU. Biarkan kosong untuk memakai data otomatis dari Pengaturan Situs.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Nomor WhatsApp / Telepon Call Center
                      <input
                        className={inputClass}
                        value={config.branding?.contact?.phone || ''}
                        onChange={(e) => updateBrandingContact('phone', e.target.value)}
                        placeholder="Contoh: 08116661141 atau 62811..."
                      />
                    </label>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Email Helpdesk Resmi
                      <input
                        type="email"
                        className={inputClass}
                        value={config.branding?.contact?.email || ''}
                        onChange={(e) => updateBrandingContact('email', e.target.value)}
                        placeholder="Contoh: bantuan@sekolah.sch.id"
                      />
                    </label>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Jam Operasional Layanan
                      <input
                        className={inputClass}
                        value={config.branding?.contact?.service_hours || ''}
                        onChange={(e) => updateBrandingContact('service_hours', e.target.value)}
                        placeholder="Contoh: Senin – Jum'at: 07.30 – 16.00 WIB"
                      />
                    </label>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Website Resmi Instansi
                      <input
                        className={inputClass}
                        value={config.branding?.contact?.website || ''}
                        onChange={(e) => updateBrandingContact('website', e.target.value)}
                        placeholder="Contoh: https://dareliman.sch.id"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/60">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                    <Palette className="h-5 w-5 text-emerald-600" />
                    Warna Latar Splash Screen
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Warna dasar saat native launcher membuka aplikasi sebelum React Native aktif.
                  </p>
                  <div className="mt-4 max-w-sm">
                    <span className="flex h-9 items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2 dark:border-emerald-700/80 dark:bg-slate-900">
                      <input
                        type="color"
                        value={config.branding?.splash_background_color || '#004B3A'}
                        onChange={(e) => updateBranding('splash_background_color', e.target.value.toUpperCase())}
                        className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                      />
                      <input
                        value={config.branding?.splash_background_color || '#004B3A'}
                        onChange={(e) => updateBranding('splash_background_color', e.target.value)}
                        className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none"
                      />
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/60">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
                    <div>
                      <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                        <UploadCloud className="h-5 w-5 text-emerald-600" />
                        Pengelolaan Logo Khusus Mobile (Database-Backed)
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Unggah logo khusus per penempatan atau gunakan otomatis logo resmi dari Pengaturan Situs.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-5 md:grid-cols-3">
                    {[
                      {
                        type: 'logo_header',
                        title: 'Logo Header Aplikasi',
                        desc: 'Tampil pada header atas beranda mobile.',
                        currentUrl: config.branding?.logo_header_url,
                        isDedicated: Boolean(config.branding?.has_dedicated_logo_header),
                      },
                      {
                        type: 'logo_login',
                        title: 'Logo Layar Login',
                        desc: 'Tampil pada halaman autentikasi masuk.',
                        currentUrl: config.branding?.logo_login_url,
                        isDedicated: Boolean(config.branding?.has_dedicated_logo_login),
                      },
                      {
                        type: 'logo_footer',
                        title: 'Logo Footer / Splash',
                        desc: 'Tampil di bagian bawah menu & splash screen.',
                        currentUrl: config.branding?.logo_footer_url,
                        isDedicated: Boolean(config.branding?.has_dedicated_logo_footer),
                      },
                    ].map((asset) => {
                      const isUploading = uploadingAsset === asset.type
                      return (
                        <div
                          key={asset.type}
                          className="flex flex-col justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 p-4 transition-all dark:border-emerald-700/80/80 dark:bg-slate-900/40"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-xs font-black text-slate-900 dark:text-white">
                                {asset.title}
                              </h3>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black ${asset.isDedicated
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : asset.currentUrl
                                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                    : 'bg-slate-200 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  }`}
                              >
                                {asset.isDedicated ? 'DEDIKASI KHUSUS' : asset.currentUrl ? 'FALLBACK SITUS' : 'KOSONG'}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {asset.desc}
                            </p>

                            {/* Image Preview Box */}
                            <div className="mt-3 flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-emerald-300 bg-white p-2 dark:border-emerald-700/80 dark:bg-slate-800">
                              {asset.currentUrl ? (
                                <img
                                  src={asset.currentUrl}
                                  alt={asset.title}
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-medium text-slate-400">
                                  Belum ada logo
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 flex items-center gap-2">
                            <label className="flex-1 cursor-pointer">
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                className="hidden"
                                disabled={isUploading || loading}
                                onChange={(e) => handleUploadMedia(asset.type, e)}
                              />
                              <span className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white shadow-xs transition hover:bg-emerald-700">
                                <UploadCloud className="h-3.5 w-3.5" />
                                {isUploading ? 'Mengunggah...' : 'Unggah File'}
                              </span>
                            </label>

                            {asset.isDedicated && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMedia(asset.type, asset.title)}
                                disabled={isUploading || loading}
                                className="flex h-9 items-center justify-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300"
                                title="Hapus asset dan kembalikan ke fallback"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <span className="font-bold">Format Didukung:</span> PNG, JPG, JPEG, WEBP, SVG (maks. 2MB). Jika asset khusus dihapus, sistem otomatis memulihkan logo dari <code>SiteSetting</code> ({config.branding?.fallback_logo_url || 'Logo Situs Terdaftar'}).
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
 TAB 2: TAMPILAN
 ======================================================== */}
            {activeTab === 'tampilan' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/60">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                    <Palette className="h-5 w-5 text-emerald-600" />
                    Palet Warna Aplikasi Mobile
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Tentukan warna tema utama, sekunder, aksen, dan warna kontras teks yang konsisten.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {colorFields.map(([key, label]) => (
                      <label key={key} className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {label}
                        <span className="mt-1.5 flex h-9 items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2 dark:border-emerald-700/80 dark:bg-slate-900">
                          <input
                            type="color"
                            value={config.theme?.[key] || '#059669'}
                            onChange={(e) => updateTheme(key, e.target.value.toUpperCase())}
                            className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                          />
                          <input
                            value={config.theme?.[key] || ''}
                            onChange={(e) => updateTheme(key, e.target.value)}
                            className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none uppercase"
                          />
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Gradient Section */}
                  <div className="mt-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
                    <label className="flex items-center justify-between gap-4 text-sm font-black text-slate-900 dark:text-white">
                      <span>
                        <span className="block">Gradient Background Android</span>
                        <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                          Aktifkan gradasi warna halus untuk latar belakang beranda dan login mobile.
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(config.theme?.background_gradient_enabled)}
                        onChange={(e) => updateTheme('background_gradient_enabled', e.target.checked)}
                        className="h-5 w-5 accent-emerald-600 cursor-pointer"
                      />
                    </label>

                    {config.theme?.background_gradient_enabled && (
                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Warna Awal (Start)
                          <span className="mt-1.5 flex h-9 items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2 dark:border-emerald-700/80 dark:bg-slate-900">
                            <input
                              type="color"
                              value={config.theme?.background_gradient_start || '#F7FCFA'}
                              onChange={(e) => updateTheme('background_gradient_start', e.target.value.toUpperCase())}
                              className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                            />
                            <input
                              value={config.theme?.background_gradient_start || '#F7FCFA'}
                              onChange={(e) => updateTheme('background_gradient_start', e.target.value)}
                              className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none uppercase"
                            />
                          </span>
                        </label>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Warna Akhir (End)
                          <span className="mt-1.5 flex h-9 items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2 dark:border-emerald-700/80 dark:bg-slate-900">
                            <input
                              type="color"
                              value={config.theme?.background_gradient_end || '#EAF8F2'}
                              onChange={(e) => updateTheme('background_gradient_end', e.target.value.toUpperCase())}
                              className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                            />
                            <input
                              value={config.theme?.background_gradient_end || '#EAF8F2'}
                              onChange={(e) => updateTheme('background_gradient_end', e.target.value)}
                              className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none uppercase"
                            />
                          </span>
                        </label>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 space-y-1">
                          <span>Arah Gradient</span>
                          <HeroUiFilterSelect
                            value={config.theme?.background_gradient_direction || 'diagonal'}
                            onChange={(val) => updateTheme('background_gradient_direction', val)}
                            options={gradientDirectionOptions}
                            placeholder="Pilih Arah Gradient"
                            ariaLabel="Pilih Arah Gradient"
                            className="w-full mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gradasi Kontainer Berita & Informasi (Warta) */}
                  <div className="mt-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-teal-50/60 p-4 dark:border-emerald-800/60 dark:bg-teal-950/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="block text-sm font-black text-slate-900 dark:text-white">
                          Warna Gradasi Kontainer Berita & Informasi (Warta)
                        </span>
                        <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                          Atur gradasi warna latar belakang untuk kartu warta di beranda mobile (standar: Putih ke Hijau Muda).
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Warna Awal (Start - Contoh: #FFFFFF)
                        <span className="mt-1.5 flex h-9 items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2 dark:border-emerald-700/80 dark:bg-slate-900">
                          <input
                            type="color"
                            value={config.theme?.news_gradient_start || '#FFFFFF'}
                            onChange={(e) => updateTheme('news_gradient_start', e.target.value.toUpperCase())}
                            className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                          />
                          <input
                            value={config.theme?.news_gradient_start || '#FFFFFF'}
                            onChange={(e) => updateTheme('news_gradient_start', e.target.value)}
                            className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none uppercase"
                          />
                        </span>
                      </label>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Warna Akhir (End - Contoh: #E8F5E9)
                        <span className="mt-1.5 flex h-9 items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2 dark:border-emerald-700/80 dark:bg-slate-900">
                          <input
                            type="color"
                            value={config.theme?.news_gradient_end || '#E8F5E9'}
                            onChange={(e) => updateTheme('news_gradient_end', e.target.value.toUpperCase())}
                            className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                          />
                          <input
                            value={config.theme?.news_gradient_end || '#E8F5E9'}
                            onChange={(e) => updateTheme('news_gradient_end', e.target.value)}
                            className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none uppercase"
                          />
                        </span>
                      </label>
                    </div>

                    {/* Live Preview Bar */}
                    <div
                      className="mt-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-3 shadow-xs"
                      style={{
                        background: `linear-gradient(to right, ${config.theme?.news_gradient_start || '#FFFFFF'}, ${config.theme?.news_gradient_end || '#E8F5E9'})`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">Pratinjau Kontainer Berita & Informasi</span>
                        <span className="text-[10px] font-extrabold text-teal-800 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                          Gradasi Aktif
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Kartu warta di halaman beranda aplikasi mobile akan berlatar gradasi ini.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/60">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                    <Layers className="h-5 w-5 text-emerald-600" />
                    Tipografi, Radius, & Teks Khusus
                  </h2>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 space-y-1">
                      <span>Jenis Font</span>
                      <HeroUiFilterSelect
                        value={config.theme?.font_family || 'system'}
                        onChange={(val) => updateTheme('font_family', val)}
                        options={fontFamilyOptions}
                        placeholder="Pilih Font"
                        ariaLabel="Pilih Jenis Font"
                        className="w-full mt-1"
                      />
                    </div>

                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 space-y-1">
                      <span>Skala Teks</span>
                      <HeroUiFilterSelect
                        value={config.theme?.font_scale || 'normal'}
                        onChange={(val) => updateTheme('font_scale', val)}
                        options={fontScaleOptions}
                        placeholder="Pilih Skala"
                        ariaLabel="Pilih Skala Teks"
                        className="w-full mt-1"
                      />
                    </div>

                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Radius Kartu (px)
                      <input
                        className={inputClass}
                        type="number"
                        min="0"
                        max="32"
                        value={config.theme?.card_radius ?? 18}
                        onChange={(e) => updateTheme('card_radius', Number(e.target.value))}
                      />
                    </label>

                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Radius Tombol (px)
                      <input
                        className={inputClass}
                        type="number"
                        min="0"
                        max="30"
                        value={config.theme?.button_radius ?? 14}
                        onChange={(e) => updateTheme('button_radius', Number(e.target.value))}
                      />
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Teks Sambutan Beranda
                      <input
                        className={inputClass}
                        value={config.theme?.welcome_text || ''}
                        onChange={(e) => updateTheme('welcome_text', e.target.value)}
                        placeholder="Contoh: Ahlan wa Sahlan di Dareliman Edu"
                      />
                    </label>
                  </div>

                  {/* Banner Login Upload Card */}
                  <div className="mt-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 p-4 dark:border-emerald-700/80/80 dark:bg-slate-900/40">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white">
                          Gambar Banner Layar Login Mobile
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Tampil sebagai visual latar belakang / kartu promosi utama di atas formulir login.
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${config.theme?.login_banner_url
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                      >
                        {config.theme?.login_banner_url ? 'BANNER AKTIF' : 'BELUM DIATUR'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-emerald-300 bg-white dark:border-emerald-700/80 dark:bg-slate-800 sm:w-56">
                        {config.theme?.login_banner_url ? (
                          <img
                            src={config.theme.login_banner_url}
                            alt="Banner Login"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Belum ada banner
                          </span>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              disabled={uploadingAsset === 'login_banner' || loading}
                              onChange={(e) => handleUploadMedia('login_banner', e)}
                            />
                            <span className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white shadow-xs transition hover:bg-emerald-700">
                              <UploadCloud className="h-3.5 w-3.5" />
                              {uploadingAsset === 'login_banner' ? 'Mengunggah Banner...' : 'Unggah Banner Baru'}
                            </span>
                          </label>

                          {config.theme?.login_banner_url && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia('login_banner', 'Banner Login')}
                              disabled={uploadingAsset === 'login_banner' || loading}
                              className="flex h-9 items-center justify-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Hapus Banner
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Format: PNG, JPG, JPEG, WEBP (maks. 4MB). Rekomendasi aspek rasio 16:9 landscape.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
 TAB 3: DASHBOARD
 ======================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/60">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
                    <div>
                      <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                        <LayoutDashboard className="h-5 w-5 text-emerald-600" />
                        Tata Letak Beranda Dinamis per Role
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Atur urutan dan visibilitas blok informasi beranda sesuai peran pengguna yang masuk.
                      </p>
                    </div>
                    <div className="w-full sm:w-64">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 space-y-1">
                        <span>Pilih Peran Pengguna:</span>
                        <HeroUiFilterSelect
                          value={selectedRole}
                          onChange={(val) => setSelectedRole(val)}
                          options={roleSelectOptions}
                          placeholder="Pilih Peran"
                          icon={LayoutDashboard}
                          className="w-full mt-1"
                          ariaLabel="Pilih Peran Pengguna"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {sortedSections.map((item, index) => (
                      <div
                        key={item.type}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all ${item.enabled
                          ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20'
                          : 'border-emerald-200/80 bg-slate-50/60 opacity-60 dark:border-emerald-800/60 dark:bg-slate-900/50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => updateSection(item.type, { enabled: e.target.checked })}
                          className="h-5 w-5 accent-emerald-600 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {sectionLabels[item.type] || item.type}
                          </span>
                          <span className="block text-xs text-slate-500">
                            Urutan tampil #{item.order} · {item.enabled ? 'Aktif' : 'Disembunyikan'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveSection(item.type, -1)}
                            disabled={index === 0}
                            className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-2 text-slate-600 hover:bg-white disabled:opacity-30 dark:border-emerald-700/80 dark:text-slate-300"
                            title="Naikkan urutan"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(item.type, 1)}
                            disabled={index === sortedSections.length - 1}
                            className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-2 text-slate-600 hover:bg-white disabled:opacity-30 dark:border-emerald-700/80 dark:text-slate-300"
                            title="Turunkan urutan"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
 TAB 4: FITUR MOBILE
 ======================================================== */}
            {activeTab === 'fitur' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/60">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    Dynamic Feature Flags (Saklar Fitur Mobile)
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Aktifkan atau nonaktifkan modul mobile secara sentral tanpa perlu kompilasi ulang APK.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {FEATURE_DEFINITIONS.map((feat) => {
                      const Icon = feat.icon
                      const isEnabled = Boolean(config.features?.[feat.key])
                      return (
                        <div
                          key={feat.key}
                          onClick={() => updateFeature(feat.key, !isEnabled)}
                          className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${isEnabled
                            ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 shadow-xs dark:border-emerald-800/60 dark:bg-emerald-950/20'
                            : 'border-emerald-200/80 bg-white opacity-70 hover:opacity-90 dark:border-emerald-800/60 dark:bg-slate-900/60'
                            }`}
                        >
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition-colors ${isEnabled ? 'bg-emerald-600' : 'bg-slate-400 dark:bg-slate-700'
                              }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {feat.title}
                              </h3>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${isEnabled
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
                                  }`}
                              >
                                {isEnabled ? 'AKTIF' : 'NONAKTIF'}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {feat.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
 TAB 5: SISTEM & RILIS
 ======================================================== */}
            {activeTab === 'sistem' && (
              <div className="space-y-5">
                {/* Maintenance Mode Card */}
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/50 p-5 shadow-xs dark:border-emerald-800/60 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-11 place-items-center rounded-xl bg-amber-600 text-white">
                        <Wrench className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white">
                          Mode Pemeliharaan (Maintenance Mode)
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Kunci akses mobile app selama proses upgrade server atau perbaikan database.
                        </p>
                      </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(config.system?.maintenance_mode)}
                        onChange={(e) => updateSystem('maintenance_mode', e.target.checked)}
                        className="h-6 w-6 accent-amber-600 cursor-pointer"
                      />
                      <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-300">
                        {config.system?.maintenance_mode ? 'Maintenance ON' : 'Normal OFF'}
                      </span>
                    </label>
                  </div>

                  {config.system?.maintenance_mode && (
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Pesan Pemeliharaan ke Pengguna
                        <textarea
                          rows={3}
                          className="mt-1.5 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white p-3 text-xs text-slate-800 outline-none focus:border-amber-600 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
                          value={config.system?.maintenance_message || ''}
                          onChange={(e) => updateSystem('maintenance_message', e.target.value)}
                          placeholder="Tuliskan alasan pemeliharaan dan perkiraan waktu selesai..."
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* App Version & Force Update Card */}
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/60">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                    <Cpu className="h-5 w-5 text-emerald-600" />
                    Manajemen Versi Aplikasi & Force Update
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Kendalikan kompatibilitas rilis APK yang terinstal di perangkat pengguna Android.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Versi Minimum yang Didukung
                      <input
                        className={inputClass}
                        value={config.system?.min_app_version || '1.0.0'}
                        onChange={(e) => updateSystem('min_app_version', e.target.value)}
                        placeholder="1.0.0"
                      />
                    </label>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Versi Rilis Terbaru (Latest)
                      <input
                        className={inputClass}
                        value={config.system?.latest_app_version || '1.0.0'}
                        onChange={(e) => updateSystem('latest_app_version', e.target.value)}
                        placeholder="1.0.0"
                      />
                    </label>
                  </div>

                  <div className="mt-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-900/60">
                    <label className="flex items-center justify-between gap-4 text-sm font-black text-slate-900 dark:text-white">
                      <span>
                        <span className="block">Wajibkan Pembaruan Aplikasi (Force Update)</span>
                        <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                          Aplikasi menampilkan dialog pembaruan wajib dan mengarahkan ke toko aplikasi jika versi terpasang lebih lama dari versi minimum.
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(config.system?.force_update)}
                        onChange={(e) => updateSystem('force_update', e.target.checked)}
                        className="h-5 w-5 accent-emerald-600 cursor-pointer"
                      />
                    </label>

                    {config.system?.force_update && (
                      <div className="mt-4">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Tautan Toko Aplikasi / URL Unduh Update
                          <input
                            className={inputClass}
                            value={config.system?.update_url || ''}
                            onChange={(e) => updateSystem('update_url', e.target.value)}
                            placeholder="https://play.google.com/store/apps/details?id=..."
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
 TAB 6: LAYAR ONBOARDING (WELCOME WALKTHROUGH)
 ======================================================== */}
            {activeTab === 'onboarding' && (
              <div className="space-y-5">
                {/* Master Switch & Policy Card */}
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#13221f]/60">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-12 place-items-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm border border-emerald-200/80 dark:border-emerald-800/60">
                        <Sparkles className="h-6 w-6" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-black text-slate-900 dark:text-white">
                            Layar Onboarding / Welcome Walkthrough
                          </h2>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Khusus Fresh Install
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                          Halaman pengenalan 3 fitur utama yang hanya tampil 1 kali setelah pengguna menginstal aplikasi baru di Android.
                        </p>
                      </div>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 py-2 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
                      <input
                        type="checkbox"
                        checked={Boolean(config.onboarding?.enabled ?? true)}
                        onChange={(e) => updateOnboarding('enabled', e.target.checked)}
                        className="h-5 w-5 accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                        {Boolean(config.onboarding?.enabled ?? true) ? 'Onboarding Aktif' : 'Onboarding Nonaktif'}
                      </span>
                    </label>
                  </div>

                  {/* Aesthetic Info Callout */}
                  <div className="mt-4 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 p-3.5 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/90">
                    <div className="flex items-start gap-3">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <Info className="h-4 w-4" />
                      </div>
                      <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        <p className="font-bold text-slate-800 dark:text-slate-100">
                          Standar Desain & Warna Layar Onboarding:
                        </p>
                        <p className="mt-0.5">
                          Sesuai permintaan sistem, layar onboarding mobile menggunakan tema warna <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">#18A165</span> dengan tingkat transparansi gradien (opacity) yang memperlihatkan ilustrasi gedung sekolah dan kubah masjid identik dengan halaman beranda orang tua & santri.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Slides Management Cards */}
                <div className="space-y-4">
                  {(config.onboarding?.slides?.length
                    ? config.onboarding.slides
                    : DEFAULT_MOBILE_API_CONFIG.onboarding.slides
                  ).map((slide, idx) => {
                    const mediaType = `onboarding_${idx + 1}`
                    const isUploading = uploadingAsset === mediaType
                    const fallbackImages = [
                      '/assets/images/school_illustration.jpg',
                      '/assets/images/family_illustration.png',
                      '/assets/images/supervisi_guru.jpg',
                    ]
                    const previewSrc = slide.image_url || fallbackImages[idx]

                    return (
                      <div
                        key={slide.id || idx}
                        className="overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-xs dark:border-emerald-700/80 dark:bg-slate-800/70"
                      >
                        {/* Slide Top Banner */}
                        <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 px-5 py-3 dark:border-emerald-700/80/60 dark:bg-slate-900/40">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                              Slide {idx + 1} Onboarding
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {slide.image_url ? (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Gambar Kustom Aktif
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-slate-700 dark:text-emerald-300">
                                Asset Bawaan Standar
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setPreviewSlideIndex(idx)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300"
                            >
                              <Eye className="h-3 w-3" /> Preview Mockup
                            </button>
                          </div>
                        </div>

                        {/* Slide Content */}
                        <div className="p-5">
                          <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                            {/* Left: Image Thumbnail & Upload Actions */}
                            <div className="space-y-3">
                              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-emerald-200/80 bg-emerald-50 shadow-xs dark:bg-emerald-950/40">
                                <img
                                  src={previewSrc}
                                  alt={`Preview Slide ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                                {slide.image_url && (
                                  <span className="absolute bottom-2 left-2 rounded-md bg-emerald-950/80 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-200 backdrop-blur-xs">
                                    Kustom
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-all">
                                  <UploadCloud className="h-4 w-4" />
                                  {isUploading ? 'Mengunggah...' : 'Ubah Gambar'}
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    disabled={!!uploadingAsset}
                                    onChange={(e) => handleUploadMedia(mediaType, e)}
                                  />
                                </label>

                                {slide.image_url && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMedia(mediaType, `Gambar Slide ${idx + 1}`)}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-emerald-800/60 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-all"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Reset ke Bawaan
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Right: Slide Text Fields */}
                            <div className="space-y-4">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                                Judul Fitur (Slide {idx + 1})
                                <input
                                  className={inputClass}
                                  value={slide.title || ''}
                                  onChange={(e) => updateOnboardingSlide(idx, 'title', e.target.value)}
                                  placeholder="Contoh: Sistem Sekolah Terpadu"
                                />
                              </label>

                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                                Deskripsi Ringkas Fitur
                                <textarea
                                  rows={3}
                                  className="mt-1.5 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white p-3 text-xs leading-relaxed text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
                                  value={slide.description || slide.desc || ''}
                                  onChange={(e) => updateOnboardingSlide(idx, 'description', e.target.value)}
                                  placeholder="Jelaskan kemudahan dan manfaat fitur ini bagi pengguna baru..."
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Mobile Mockup Preview */}
          <aside
            className="sticky top-6 h-fit rounded-xl border-[10px] border-slate-900 p-3.5 shadow-2xl transition-all"
            style={activeTab === 'onboarding' ? { backgroundColor: '#0B4D30' } : previewBackground}
          >
            {/* Top speaker notch */}
            <div className="mx-auto mb-2 h-3.5 w-24 rounded-full bg-emerald-600 text-white/20" />

            {activeTab === 'onboarding' ? (
              /* ONBOARDING LIVE PREVIEW MOCKUP */
              <div className="relative overflow-hidden rounded-xl p-3 text-white" style={{ minHeight: 520 }}>
                {/* Background image & #18A165 opacity overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/assets/images/parent_home_bg.jpg')",
                    opacity: 0.95,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(24, 161, 101, 0.40) 0%, rgba(24, 161, 101, 0.82) 45%, rgba(11, 77, 48, 0.96) 100%)',
                  }}
                />

                {/* Simulated Content Layer */}
                <div className="relative z-10 flex flex-col justify-between" style={{ minHeight: 500 }}>
                  {/* Mockup Header */}
                  <div>
                    <div className="flex items-center justify-between pb-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-1 text-[9px] font-bold backdrop-blur-xs border border-emerald-200/30">
                        <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 rounded" />
                        <span>{config.branding?.app_name || 'Dareliman Edu'}</span>
                      </div>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold border border-emerald-200/30">
                        LEWATI »
                      </span>
                    </div>

                    {/* Slide switcher pills in preview */}
                    <div className="mt-2 flex justify-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewSlideIndex(i)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition-all cursor-pointer ${previewSlideIndex === i
                            ? 'bg-white text-emerald-900 shadow-xs'
                            : 'bg-white/20/80 hover:bg-white/30'
                            }`}
                        >
                          Slide {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mockup Carousel Card */}
                  {(() => {
                    const currentSlide = config.onboarding?.slides?.[previewSlideIndex] || {
                      title: 'Sistem Sekolah Terpadu',
                      description: 'Akses seluruh informasi akademik dan kegiatan harian siswa.',
                      image_url: null,
                    }
                    const fallbackMockups = [
                      '/assets/images/school_illustration.jpg',
                      '/assets/images/family_illustration.png',
                      '/assets/images/supervisi_guru.jpg',
                    ]
                    const currentImg = currentSlide.image_url || fallbackMockups[previewSlideIndex]

                    return (
                      <div className="my-auto py-3 text-center">
                        <div className="relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-xl border-2 border-emerald-200/40 bg-white shadow-xl">
                          <img
                            src={currentImg}
                            alt={currentSlide.title}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute top-2 right-2 rounded-lg bg-white/95 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800 shadow-xs">
                            Fitur {previewSlideIndex + 1}
                          </span>
                        </div>

                        <div className="mt-3">
                          <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-extrabold tracking-wider border border-emerald-200/30">
                            LANGKAH {previewSlideIndex + 1} DARI 3
                          </span>
                          <h4 className="mt-1.5 text-xs font-black text-white leading-tight">
                            {currentSlide.title}
                          </h4>
                          <p className="mt-1 text-[10px] text-white/90 leading-relaxed px-1">
                            {currentSlide.description || currentSlide.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Mockup Bottom Controls */}
                  <div>
                    {/* Dots indicator */}
                    <div className="mb-2.5 flex justify-center items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={`h-1.5 rounded-full transition-all ${previewSlideIndex === i ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                            }`}
                        />
                      ))}
                    </div>

                    {/* Bottom Action Button */}
                    {previewSlideIndex < 2 ? (
                      <div className="flex gap-2">
                        {previewSlideIndex > 0 ? (
                          <button
                            type="button"
                            onClick={() => setPreviewSlideIndex((p) => Math.max(0, p - 1))}
                            className="flex-1 rounded-xl bg-white/20 py-2 text-[10px] font-bold border border-emerald-200/30 cursor-pointer"
                          >
                            Kembali
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setPreviewSlideIndex((p) => Math.min(2, p + 1))}
                          className="flex-1 rounded-xl bg-white py-2 text-[10px] font-extrabold text-emerald-900 shadow-md flex items-center justify-center gap-1 cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
                        >
                          Lanjut <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewSlideIndex(0)}
                        className="w-full rounded-xl bg-white py-2.5 text-[10px] font-black text-emerald-900 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
                      >
                        <Sparkles className="h-3 w-3 text-emerald-600" /> Mulai Gunakan Aplikasi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* REGULAR ROLE DASHBOARD MOCKUP */
              <>
                <div
                  className="mb-2 text-center text-[10px] font-black uppercase tracking-wider"
                  style={{ color: config.theme?.primary_color || '#059669' }}
                >
                  Preview Live ({roleLabels[selectedRole] || 'Mobile'})
                </div>

                {/* Simulated Mobile Card Header */}
                <div
                  className="p-4 shadow-sm"
                  style={{
                    backgroundColor: config.theme?.surface_color || '#FFFFFF',
                    borderRadius: config.theme?.card_radius ?? 18,
                  }}
                >
                  <div
                    className="flex h-9 w-10 items-center justify-center rounded-xl text-white font-bold text-xs"
                    style={{ backgroundColor: config.theme?.primary_color || '#059669' }}
                  >
                    SIM
                  </div>
                  <h3
                    className="mt-2 text-sm font-black"
                    style={{ color: config.theme?.text_color || '#0F172A' }}
                  >
                    {config.branding?.app_name || 'Dareliman Edu Mobile'}
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: config.theme?.muted_text_color || '#64748B' }}
                  >
                    {config.branding?.school_name || foundationName || 'Yayasan Pendidikan Islam'}
                  </p>
                  {config.theme?.welcome_text ? (
                    <p
                      className="mt-2 rounded-lg bg-emerald-50/70 p-1.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                    >
                      {config.theme.welcome_text}
                    </p>
                  ) : null}
                </div>

                {/* Status indicators */}
                <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-900/5 px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  <span>Sistem v{config.system?.latest_app_version || '1.0.0'}</span>
                  <span>
                    {config.system?.maintenance_mode ? (
                      <span className="text-amber-600 font-extrabold">MAINTENANCE</span>
                    ) : (
                      <span className="text-emerald-600 font-extrabold">NORMAL</span>
                    )}
                  </span>
                </div>

                {/* Simulated Active Sections */}
                <div className="mt-3 space-y-2">
                  {sortedSections
                    .filter((item) => item.enabled)
                    .map((item) => {
                      const isAnnounce = item.type === 'announcements';
                      return (
                        <div
                          key={item.type}
                          className="p-2.5 shadow-xs"
                          style={{
                            background: isAnnounce
                              ? `linear-gradient(to right, ${config.theme?.news_gradient_start || '#FFFFFF'}, ${config.theme?.news_gradient_end || '#E8F5E9'})`
                              : (config.theme?.surface_color || '#FFFFFF'),
                            color: config.theme?.text_color || '#0F172A',
                            borderRadius: config.theme?.card_radius ?? 18,
                            border: isAnnounce ? '1px solid rgba(16, 185, 129, 0.3)' : undefined,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">
                              {sectionLabels[item.type] || item.type}
                            </span>
                            {isAnnounce && (
                              <span className="text-[8px] font-extrabold text-teal-800 bg-white/80 px-1.5 py-0.5 rounded">
                                Gradasi
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Simulated Active Features Pill */}
                <div className="mt-3 rounded-xl bg-white/80 p-2.5 shadow-xs dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800/60">
                  <span className="text-[9px] font-black uppercase text-slate-500">
                    Fitur Aktif ({Object.values(config.features || {}).filter(Boolean).length}/8)
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {Object.entries(config.features || {}).map(([key, enabled]) =>
                      enabled ? (
                        <span
                          key={key}
                          className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        >
                          {key.replace('_', ' ')}
                        </span>
                      ) : null
                    )}
                  </div>
                </div>

                {/* Simulated Bottom Nav */}
                <div
                  className="mt-4 flex justify-around rounded-xl bg-white p-2 text-[9px] font-bold shadow-md dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60"
                  style={{ color: config.theme?.primary_color || '#059669' }}
                >
                  <span>Beranda</span>
                  <span>Notif</span>
                  <span>QR</span>
                  <span>Profil</span>
                </div>
              </>
            )}
          </aside>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/80 bg-slate-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={resetToDefault}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="h-4 w-4" /> Kembalikan formulir ke default
          </button>
          <Button onClick={save} pending={saving} disabled={loading} variant="primary">
            <Save className="h-4 w-4" /> Publikasikan Perubahan
          </Button>
        </footer>
      </section>

      {/* HeroUI Harmonized Modals */}
      <HarmonizedDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteMedia}
        item={deleteTarget}
        isSubmitting={isDeleting}
      />
      <ResetConfirmModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </PageContainer>
  )
}
