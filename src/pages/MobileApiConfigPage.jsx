import { useEffect, useMemo, useState } from 'react'
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
  Wrench,
  AlertTriangle,
  Trash2,
} from 'lucide-react'
import Swal from 'sweetalert2'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { Button } from '../components/tailgrids/core/button'
import { DEFAULT_MOBILE_API_CONFIG, mobileApiConfigService } from '../services/mobileApiConfigService'

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
  teacher: 'Guru / Pengajar',
  parent: 'Orang Tua',
  student: 'Siswa',
  staff: 'Staf / Operator',
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

export default function MobileApiConfigPage() {
  const [config, setConfig] = useState(DEFAULT_MOBILE_API_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('identitas') // 'identitas' | 'tampilan' | 'dashboard' | 'fitur' | 'sistem'
  const [selectedRole, setSelectedRole] = useState('super_admin')
  const [uploadingAsset, setUploadingAsset] = useState(null)

  useEffect(() => {
    mobileApiConfigService
      .getConfig()
      .then(setConfig)
      .catch(() =>
        Swal.fire('Gagal Memuat', 'Konfigurasi Android belum dapat dimuat dari server.', 'error')
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
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Diunggah',
        text: `Asset ${type.replace('_', ' ')} berhasil diunggah dan tersimpan ke database.`,
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (err) {
      Swal.fire('Gagal Mengunggah', err?.response?.data?.message || 'Unggahan asset gagal diproses.', 'error')
    } finally {
      setUploadingAsset(null)
      e.target.value = ''
    }
  }

  const handleDeleteMedia = async (type, label) => {
    const confirm = await Swal.fire({
      title: `Hapus ${label}?`,
      text: 'Asset khusus mobile akan dihapus dari server dan dikembalikan ke status fallback.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, hapus asset',
      cancelButtonText: 'Batal',
    })
    if (!confirm.isConfirmed) return
    setUploadingAsset(type)
    try {
      const updated = await mobileApiConfigService.deleteMedia(type)
      setConfig(updated)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dihapus',
        text: `Asset ${label} telah dihapus dan status fallback dipulihkan.`,
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (err) {
      Swal.fire('Gagal Menghapus', err?.response?.data?.message || 'Gagal menghapus asset.', 'error')
    } finally {
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
    : { backgroundColor: config.theme?.background_color || '#F7F9FC' }

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

  const updateSection = (type, value) =>
    setConfig((current) => ({
      ...current,
      role_home_layouts: {
        ...current.role_home_layouts,
        [selectedRole]: {
          ...current.role_home_layouts[selectedRole],
          sections: current.role_home_layouts[selectedRole].sections.map((item) =>
            item.type === type ? { ...item, ...value } : item
          ),
        },
      },
    }))

  const moveSection = (type, direction) => {
    const index = sortedSections.findIndex((item) => item.type === type)
    const target = index + direction
    if (index < 0 || target < 0 || target >= sortedSections.length) return
    const next = [...sortedSections]
    ;[next[index], next[target]] = [next[target], next[index]]
    setConfig((current) => ({
      ...current,
      role_home_layouts: {
        ...current.role_home_layouts,
        [selectedRole]: {
          ...current.role_home_layouts[selectedRole],
          sections: next.map((item, order) => ({ ...item, order: order + 1 })),
        },
      },
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const saved = await mobileApiConfigService.saveConfig(config)
      setConfig(saved)
      await Swal.fire(
        'Berhasil Dipublikasikan',
        `Konfigurasi Mobile App Android versi ${saved.version} telah disimpan secara terpusat di database.`,
        'success'
      )
    } catch (error) {
      await Swal.fire(
        'Gagal Menyimpan',
        error?.response?.data?.message || 'Konfigurasi gagal disimpan.',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = () => {
    Swal.fire({
      title: 'Kembalikan ke Default?',
      text: 'Nilai formulir akan dikembalikan ke setelan awal pabrik (belum tersimpan sebelum Anda klik Publikasikan).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0E5C44',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Ya, reset formulir',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        setConfig(DEFAULT_MOBILE_API_CONFIG)
      }
    })
  }

  const inputClass =
    'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'

  const tabs = [
    { id: 'identitas', label: '1. Identitas', icon: ImageIcon },
    { id: 'tampilan', label: '2. Tampilan & Gaya', icon: Palette },
    { id: 'dashboard', label: '3. Beranda & Role', icon: LayoutDashboard },
    { id: 'fitur', label: '4. Fitur Mobile', icon: Sparkles },
    { id: 'sistem', label: '5. Sistem & Rilis', icon: Cpu },
  ]

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <AppBreadcrumb pageTitle="Pengaturan Mobile App Android" />

      {/* Main Container */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
              <Smartphone className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  Pengaturan Mobile App Android
                </h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  v{config.version || 1}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pusat kendali identitas, tema visual, susunan menu beranda, fitur dinamis, dan rilis sistem aplikasi mobile.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={save} pending={saving} disabled={loading} variant="primary">
              <Save className="h-4 w-4" /> Publikasikan Perubahan
            </Button>
          </div>
        </header>

        {/* 5-Section Tab Navigation */}
        <nav className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex min-w-full gap-1.5 sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
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
                <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/60">
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
                        placeholder="Contoh: SIMSIT DAREL-IMAN"
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

                <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/60">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                    <Palette className="h-5 w-5 text-emerald-600" />
                    Warna Latar Splash Screen
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Warna dasar saat native launcher membuka aplikasi sebelum React Native aktif.
                  </p>
                  <div className="mt-4 max-w-sm">
                    <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-900">
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

                <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
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
                          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all dark:border-slate-700/80 dark:bg-slate-900/40"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-xs font-black text-slate-900 dark:text-white">
                                {asset.title}
                              </h3>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                                  asset.isDedicated
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : asset.currentUrl
                                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {asset.isDedicated ? 'DEDIKASI KHUSUS' : asset.currentUrl ? 'FALLBACK SITUS' : 'KOSONG'}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              {asset.desc}
                            </p>

                            {/* Image Preview Box */}
                            <div className="mt-3 flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
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
                                <span className="text-[11px] font-medium text-slate-400">
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
                                className="flex h-9 items-center justify-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
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

                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
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
                <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/60">
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
                        <span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-900">
                          <input
                            type="color"
                            value={config.theme?.[key] || '#0E5C44'}
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
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
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
                          <span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-900">
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
                          <span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-900">
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
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Arah Gradient
                          <select
                            className={inputClass}
                            value={config.theme?.background_gradient_direction || 'diagonal'}
                            onChange={(e) => updateTheme('background_gradient_direction', e.target.value)}
                          >
                            <option value="vertical">Atas ke Bawah</option>
                            <option value="horizontal">Kiri ke Kanan</option>
                            <option value="diagonal">Diagonal</option>
                          </select>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/60">
                  <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                    <Layers className="h-5 w-5 text-emerald-600" />
                    Tipografi, Radius, & Teks Khusus
                  </h2>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Jenis Font
                      <select
                        className={inputClass}
                        value={config.theme?.font_family || 'system'}
                        onChange={(e) => updateTheme('font_family', e.target.value)}
                      >
                        <option value="system">Sistem Android</option>
                        <option value="Poppins">Poppins (Google Font)</option>
                        <option value="Nunito">Nunito (Google Font)</option>
                      </select>
                    </label>

                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Skala Teks
                      <select
                        className={inputClass}
                        value={config.theme?.font_scale || 'normal'}
                        onChange={(e) => updateTheme('font_scale', e.target.value)}
                      >
                        <option value="compact">Ringkas (Compact - 92%)</option>
                        <option value="normal">Standar (Normal - 100%)</option>
                        <option value="large">Besar (Large - 110%)</option>
                      </select>
                    </label>

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
                        placeholder="Contoh: Ahlan wa Sahlan di SIMSIT Dar el-Iman"
                      />
                    </label>
                  </div>

                  {/* Banner Login Upload Card */}
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700/80 dark:bg-slate-900/40">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white">
                          Gambar Banner Layar Login Mobile
                        </h3>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Tampil sebagai visual latar belakang / kartu promosi utama di atas formulir login.
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          config.theme?.login_banner_url
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {config.theme?.login_banner_url ? 'BANNER AKTIF' : 'BELUM DIATUR'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 sm:w-56">
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
                          <span className="text-[11px] font-medium text-slate-400">
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
                              className="flex h-9 items-center justify-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Hapus Banner
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
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
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Pilih Peran Pengguna:
                        <select
                          className={inputClass}
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          {Object.entries(roleLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {sortedSections.map((item, index) => (
                      <div
                        key={item.type}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                          item.enabled
                            ? 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                            : 'border-slate-200 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-900/50'
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
                          <span className="block text-[11px] text-slate-500">
                            Urutan tampil #{item.order} · {item.enabled ? 'Aktif' : 'Disembunyikan'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveSection(item.type, -1)}
                            disabled={index === 0}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-white disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
                            title="Naikkan urutan"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(item.type, 1)}
                            disabled={index === sortedSections.length - 1}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-white disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
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
                <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/60">
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
                          className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all ${
                            isEnabled
                              ? 'border-emerald-500/40 bg-emerald-50/50 shadow-xs dark:border-emerald-700/50 dark:bg-emerald-950/20'
                              : 'border-slate-200 bg-white opacity-70 hover:opacity-90 dark:border-slate-800 dark:bg-slate-900/60'
                          }`}
                        >
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition-colors ${
                              isEnabled ? 'bg-emerald-600' : 'bg-slate-400 dark:bg-slate-700'
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
                                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                  isEnabled
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
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
                <div className="rounded-[18px] border border-amber-200 bg-amber-50/50 p-5 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-600 text-white">
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
                          className="mt-1.5 w-full rounded-xl border border-amber-300 bg-white p-3 text-xs text-slate-800 outline-none focus:border-amber-600 dark:border-amber-800 dark:bg-slate-900 dark:text-slate-100"
                          value={config.system?.maintenance_message || ''}
                          onChange={(e) => updateSystem('maintenance_message', e.target.value)}
                          placeholder="Tuliskan alasan pemeliharaan dan perkiraan waktu selesai..."
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* App Version & Force Update Card */}
                <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800/60">
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

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
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
          </div>

          {/* Right Column: Live Mobile Mockup Preview */}
          <aside
            className="sticky top-6 h-fit rounded-[36px] border-[10px] border-slate-900 p-3.5 shadow-2xl transition-all"
            style={previewBackground}
          >
            {/* Top speaker notch */}
            <div className="mx-auto mb-2 h-3.5 w-24 rounded-full bg-slate-900/20" />

            <div
              className="mb-2 text-center text-[10px] font-black uppercase tracking-wider"
              style={{ color: config.theme?.primary_color || '#0E5C44' }}
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
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-xs"
                style={{ backgroundColor: config.theme?.primary_color || '#0E5C44' }}
              >
                SIM
              </div>
              <h3
                className="mt-2 text-sm font-black"
                style={{ color: config.theme?.text_color || '#0F172A' }}
              >
                {config.branding?.app_name || 'SIMSIT Mobile'}
              </h3>
              <p
                className="text-[11px]"
                style={{ color: config.theme?.muted_text_color || '#64748B' }}
              >
                {config.branding?.school_name || 'Yayasan Dar el-Iman'}
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
            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-900/5 px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">
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
                .map((item) => (
                  <div
                    key={item.type}
                    className="p-2.5 shadow-xs"
                    style={{
                      backgroundColor: config.theme?.surface_color || '#FFFFFF',
                      color: config.theme?.text_color || '#0F172A',
                      borderRadius: config.theme?.card_radius ?? 18,
                    }}
                  >
                    <span className="text-[11px] font-bold">
                      {sectionLabels[item.type] || item.type}
                    </span>
                  </div>
                ))}
            </div>

            {/* Simulated Active Features Pill */}
            <div className="mt-3 rounded-2xl bg-white/80 p-2.5 shadow-xs dark:bg-slate-800/80">
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
              className="mt-4 flex justify-around rounded-2xl bg-white p-2 text-[9px] font-bold shadow-md dark:bg-slate-800"
              style={{ color: config.theme?.primary_color || '#0E5C44' }}
            >
              <span>Beranda</span>
              <span>Notif</span>
              <span>QR</span>
              <span>Profil</span>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
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
    </div>
  )
}
