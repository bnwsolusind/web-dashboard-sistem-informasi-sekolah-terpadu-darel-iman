import React, { useState, useEffect, useCallback } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  UserRound,
  Shield,
  KeyRound,
  Settings,
  Activity,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  LogOut,
  AlertCircle,
  RefreshCw,
  Award,
  Layers,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import PageContainer from '../../components/app/PageContainer'
import AppModal from '../../components/app/AppModal'
import {
  useToast
} from '../../components/app'
import {
  authService
} from '../../services/authService'
import {
  useAuthStore
} from '../../stores/authStore'
import {
  usePengaturanStore
} from '../../stores/pengaturanStore'
import {
  resolveFoundationName
} from '../../utils/printHelper'
import {
  Button
} from '../../components/ui/button'
import {
  Badge
} from '../../components/ui/badge'
import {
  Skeleton
} from '../../components/ui/skeleton'
import {
  SmartScrollFab
} from '../../components/common'
import HeroUiFilterSelect from '../../components/ui/HeroUiFilterSelect'

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function FoundationProfilePage() {
  const toast = useToast()
  const authUser = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const foundationName = resolveFoundationName(pengaturan)
  const token = localStorage.getItem('school_erp_token')

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('pribadi')

  // Edit Personal Information Form State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    nama_panggilan: '',
    phone: '',
    email: '',
    alamat: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  // Avatar Upload State
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Preferences State
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('user_preferences')
    return saved
      ? JSON.parse(saved)
      : {
          emailNotifications: true,
          appNotifications: true,
          language: 'id',
          dateFormat: 'DD/MM/YYYY',
        }
  })

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await authService.profile()
      const data = res?.data || res
      setProfile(data)
      if (data) {
        setEditForm({
          nama_panggilan: data.employee?.nama_panggilan || '',
          phone: data.phone || data.employee?.no_hp || '',
          email: data.email || '',
          alamat: data.employee?.alamat || '',
        })
      }
    } catch (err) {
      console.error('Gagal mengambil data profil:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Save Preferences
  const handlePreferenceChange = (key, value) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    localStorage.setItem('user_preferences', JSON.stringify(updated))
    toast.success('Tersimpan', 'Preferensi pengguna berhasil diperbarui.')
  }

  // Handle Edit Submit
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      const res = await authService.updateProfile(editForm)
      const updatedProfile = res?.data || res
      setProfile(updatedProfile)

      // Sync authStore user state
      if (authUser && token) {
        setSession({
          token,
          user: {
            ...authUser,
            name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
          },
        })
      }

      setEditModalOpen(false)
      toast.success('Berhasil!', 'Profil berhasil diperbarui.')
    } catch (err) {
      console.error('Gagal update profil:', err)
      const message = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.'
      toast.error('Gagal Menyimpan', message)
    } finally {
      setSavingEdit(false)
    }
  }

  // Handle Avatar Selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.warning('Ukuran File Terlalu Besar', 'Maksimal ukuran foto adalah 2MB.')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // Handle Avatar Upload Submit
  const handleUploadAvatar = async () => {
    if (!selectedFile) return
    setUploadingAvatar(true)

    const formData = new FormData()
    formData.append('foto', selectedFile)

    try {
      const res = await authService.uploadAvatar(formData)
      const updatedProfile = res?.data || res
      setProfile(updatedProfile)

      // Sync authStore user state
      if (authUser && token) {
        setSession({
          token,
          user: {
            ...authUser,
            avatar: updatedProfile.foto,
          },
        })
      }

      setAvatarModalOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      toast.success('Berhasil!', 'Foto profil berhasil diperbarui.')
    } catch (err) {
      console.error('Gagal upload avatar:', err)
      const message = err.response?.data?.message || 'Gagal mengunggah foto profil.'
      toast.error('Gagal Upload', message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Handle Password Change Submit
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError('Konfirmasi password baru tidak cocok.')
      return
    }

    if (passwordForm.password.length < 8) {
      setPasswordError('Password baru minimal 8 karakter.')
      return
    }

    setChangingPassword(true)
    try {
      await authService.changePassword({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      })

      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      })

      toast.success('Password Diubah!', 'Password Anda berhasil diperbarui. Gunakan password baru untuk login berikutnya.')
    } catch (err) {
      console.error('Gagal ganti password:', err)
      const msg = err.response?.data?.message || 'Gagal mengubah password. Pastikan password saat ini benar.'
      setPasswordError(msg)
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-48 w-full rounded-[22px]" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-[22px]" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="bg-white dark:bg-[#1B2433] p-12 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 text-center space-y-4 shadow-md shadow-emerald-500/10">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Profil Gagal Dimuat</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Data profil pengguna tidak dapat diambil dari server. Silakan pastikan koneksi internet Anda stabil.
        </p>
        <button
          type="button"
          onClick={fetchProfile}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 text-xs shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> Coba Lagi
        </button>
      </div>
    )
  }

  const employee = profile.employee
  const isSuperAdmin = profile.is_superadmin || profile.roles?.some(r => String(r).toLowerCase().includes('super')) || profile.email?.includes('superadmin') || profile.email?.includes('super.admin')
  const namaLengkap = employee?.nama_lengkap || profile.name || (isSuperAdmin ? 'Super Administrator' : 'Pengurus Yayasan')
  const niyNip = employee?.niy || employee?.nik || (isSuperAdmin ? 'SUPERADMIN' : 'YYS-001')
  const roleBadgeLabel = isSuperAdmin ? 'Super Admin' : (profile.roles?.[0] || 'Pengurus Yayasan')
  const jabatanName = isSuperAdmin ? 'Administrator Sistem' : (employee?.position?.name || 'Pengurus Yayasan')
  const unitName = isSuperAdmin ? `Pusat ${foundationName}` : (employee?.unit?.name || foundationName)
  const divisionName = isSuperAdmin ? 'IT & Tata Kelola Sistem' : (employee?.division?.name || 'Sekretariat Yayasan')
  const userRoles = profile.roles || [roleBadgeLabel]

  const avatarDisplayUrl = profile.foto || profile.photo_url || profile.avatar_url || employee?.photo_url || employee?.avatar_url || employee?.foto

  return (
    <PageContainer maxW="7xl">
      <div className="mb-4 print:hidden">
        <AppBreadcrumb items={[{ label: 'Yayasan', href: '/dashboard/yayasan' }, { label: 'Profil Pengurus' }]} />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-16">
        {/* 1. Header Profil Modern Hero Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden"
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
              {/* Avatar Image with Edit Overlay */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#1B2433] p-1.5 shadow-xl border-2 border-emerald-300 dark:border-emerald-700/80 overflow-hidden">
                  {avatarDisplayUrl ? (
                    <img
                      src={avatarDisplayUrl}
                      alt={namaLengkap}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 font-black text-2xl flex items-center justify-center text-emerald-800 dark:text-emerald-200 shadow-inner">
                      {isSuperAdmin ? 'SA' : namaLengkap.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-white dark:bg-[#1B2433] text-emerald-800 dark:text-emerald-300 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-emerald-300 dark:border-emerald-700/80"
                  title="Ubah Foto Profil"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
              </div>

              {/* Name & Identity */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-100 leading-tight">
                    {namaLengkap}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
                    <ShieldCheck className="h-3.5 w-3.5 text-white" />
                    {roleBadgeLabel}
                  </span>
                  <Badge variant="success" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-extrabold text-[10px] rounded-xl px-2.5 py-0.5 border border-emerald-300/80 dark:border-emerald-700/60">
                    Aktif
                  </Badge>
                </div>

                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  NIY/NIP: <span className="text-emerald-900 dark:text-emerald-200 font-bold">{niyNip}</span> • {jabatanName}
                </p>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{unitName} • {divisionName}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button: Edit Profil */}
            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-center justify-end">
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-black shadow-md shadow-emerald-900/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profil</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* 2. Tabs Bar */}
        <motion.div
          variants={itemVariants}
          className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 shadow-sm dark:bg-[#1B2433] flex items-center gap-2 overflow-x-auto scrollbar-none"
        >
          {[
            { id: 'pribadi', label: 'Informasi Pribadi', icon: UserRound },
            { id: 'jabatan', label: 'Informasi Jabatan', icon: Briefcase },
            { id: 'keamanan', label: 'Keamanan Akun', icon: Shield },
            { id: 'preferensi', label: 'Preferensi', icon: Settings },
            { id: 'aktivitas', label: 'Aktivitas Akun', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/10'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 hover:text-emerald-800 dark:hover:text-emerald-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* 3. Tab Content */}
        <motion.div
          variants={itemVariants}
          id="tab-konten-profil"
          className="scroll-mt-6 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-6"
        >
          {/* Tab 1: Informasi Pribadi */}
          {activeTab === 'pribadi' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
                <div>
                  <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">Data Diri & Kontak</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informasi identitas pribadi akun Pengurus Yayasan Anda.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ubah Data Kontak</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Nama Resmi (Sesuai SK)</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">{namaLengkap}</p>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block pt-1">
                    * Dikelola langsung oleh Admin Kepegawaian (Read-only)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Nama Panggilan</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">{employee?.nama_panggilan || '-'}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">NIY / NIP</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">{employee?.niy || '-'}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">NIK (No. KTP)</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">{employee?.nik || '-'}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Jenis Kelamin</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">
                    {employee?.jenis_kelamin === 'L' ? 'Laki-laki' : employee?.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tempat & Tanggal Lahir</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">
                    {employee?.tempat_lahir || '-'}, {employee?.tanggal_lahir || '-'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Nomor HP / Whatsapp</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {profile.phone || employee?.no_hp || '-'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Alamat Email</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    {profile.email}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1 md:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Alamat Tempat Tinggal</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    {employee?.alamat || 'Belum diisi'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Informasi Jabatan */}
          {activeTab === 'jabatan' && (
            <div className="space-y-6">
              <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
                <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">Jabatan & Wewenang Sistem</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Struktur organisasi dan hak akses Pengurus Yayasan.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Unit Kerja / Institusi</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">{unitName}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Jabatan Organisasi</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">{jabatanName}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Divisi / Departemen</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">{divisionName}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Role Hak Akses Sistem</span>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {userRoles.map((r) => (
                      <Badge key={r} variant="success" className="bg-emerald-600 !text-white font-black text-[10px] !rounded-xl px-3 py-1 shadow-xs">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status Kepegawaian</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">{employee?.status_pegawai || 'Tetap'}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mulai Bertugas</span>
                  <p className="font-extrabold text-emerald-950 dark:text-white text-sm">{employee?.tanggal_masuk || '-'}</p>
                </div>
              </div>

              {/* Permission List Ringkas */}
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">Ringkasan Izin Akses Yayasan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    'Monitoring Unit Pendidikan',
                    'Pemantauan SDM & Pegawai',
                    'Monitoring Data Siswa & Mutasi',
                    'Laporan Kelulusan & Alumni',
                    'Laporan Lintas Unit',
                    'Notifikasi & Komunikasi',
                  ].map((perm) => (
                    <div key={perm} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border-2 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Keamanan Akun */}
          {activeTab === 'keamanan' && (
            <div className="space-y-6 max-w-2xl">
              <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
                <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">Keamanan & Ubah Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Perbarui kata sandi secara berkala untuk perlindungan akun.</p>
              </div>

              {passwordError && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Password Saat Ini</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      placeholder="Masukkan password saat ini"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-emerald-50/20 dark:bg-emerald-950/20 border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showCurrentPass ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Password Baru</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Minimal 8 karakter"
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-emerald-50/20 dark:bg-emerald-950/20 border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showNewPass ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      placeholder="Ulangi password baru"
                      value={passwordForm.password_confirmation}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-emerald-50/20 dark:bg-emerald-950/20 border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showConfirmPass ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 text-xs shadow-md shadow-emerald-900/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {changingPassword ? 'Menyimpan...' : 'Perbarui Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: Preferensi */}
          {activeTab === 'preferensi' && (
            <div className="space-y-6 max-w-2xl">
              <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
                <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">Preferensi Pengguna</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pengaturan pemberitahuan dan tampilan antarmuka.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60">
                  <div>
                    <h4 className="font-extrabold text-emerald-950 dark:text-white">Notifikasi Email</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Terima rangkuman laporan bulanan melalui email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60">
                  <div>
                    <h4 className="font-extrabold text-emerald-950 dark:text-white">Notifikasi Aplikasi</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tampilkan notifikasi pop-up saat ada data mutasi/laporan baru.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.appNotifications}
                    onChange={(e) => handlePreferenceChange('appNotifications', e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/60">
                  <div>
                    <h4 className="font-extrabold text-emerald-950 dark:text-white">Bahasa Antarmuka</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pilihan bahasa tampilan Dareliman Edu.</p>
                  </div>
                  <div className="w-48">
                    <HeroUiFilterSelect
                      size="sm"
                      value={preferences.language}
                      onChange={(val) => handlePreferenceChange('language', val)}
                      options={[
                        { value: 'id', label: 'Bahasa Indonesia' },
                        { value: 'en', label: 'English' },
                      ]}
                      placeholder="Pilih Bahasa"
                      aria-label="Bahasa Antarmuka"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Aktivitas Akun */}
          {activeTab === 'aktivitas' && (
            <div className="space-y-6">
              <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
                <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">Log Aktivitas & Sesi Login</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Riwayat login akun Pengurus Yayasan.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-emerald-950 dark:text-white">Sesi Login Saat Ini (Aktif)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Web Dashboard • Browser Chrome / Safari</p>
                    </div>
                  </div>
                  <Badge variant="success" className="bg-emerald-600 text-white font-extrabold text-[10px] rounded-xl px-2.5 py-1">
                    Aktif Sekarang
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* MODAL EDIT PROFIL - HEROUI HARMONIZED STANDARD */}
        <AppModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          disableBackdropClose={savingEdit}
          hideCloseButton={savingEdit}
          icon={UserRound}
          title="Edit Informasi Pribadi"
          description="Perbarui informasi kontak dan data diri akun"
          maxWidth="max-w-lg"
          zIndex={50}
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                disabled={savingEdit}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 h-9.5 px-4 text-xs font-black text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                form="edit-profile-form"
                disabled={savingEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-9.5 px-5 text-xs font-black border-2 border-emerald-600 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </div>
          }
        >
          <form id="edit-profile-form" onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nama Panggilan</label>
              <input
                type="text"
                placeholder="Contoh: Pak H. Ahmad"
                value={editForm.nama_panggilan}
                onChange={(e) => setEditForm({ ...editForm, nama_panggilan: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-emerald-50/20 dark:bg-emerald-950/20 border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nomor HP / Whatsapp</label>
              <input
                type="text"
                required
                placeholder="08xxxxxxxxxx"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-emerald-50/20 dark:bg-emerald-950/20 border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Alamat Email</label>
              <input
                type="email"
                required
                placeholder="email@domain.com"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-emerald-50/20 dark:bg-emerald-950/20 border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Alamat Lengkap</label>
              <textarea
                rows={3}
                placeholder="Alamat domisili..."
                value={editForm.alamat}
                onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-emerald-50/20 dark:bg-emerald-950/20 border-2 border-[#b6f6d9] dark:border-emerald-700/80 rounded-xl font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
              />
            </div>
          </form>
        </AppModal>

        {/* MODAL UBAH FOTO PROFIL - HEROUI HARMONIZED STANDARD */}
        <AppModal
          isOpen={avatarModalOpen}
          onClose={() => {
            setAvatarModalOpen(false)
            setSelectedFile(null)
            setPreviewUrl(null)
          }}
          disableBackdropClose={uploadingAvatar}
          hideCloseButton={uploadingAvatar}
          icon={Camera}
          title="Ubah Foto Profil"
          description="Unggah foto profil formal terbaru"
          maxWidth="max-w-md"
          zIndex={50}
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => {
                  setAvatarModalOpen(false)
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 h-9.5 px-4 text-xs font-black text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!selectedFile || uploadingAvatar}
                onClick={handleUploadAvatar}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-9.5 px-5 text-xs font-black border-2 border-emerald-600 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <span>Unggah & Simpan</span>
                )}
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-center">
            <div className="w-32 h-32 mx-auto rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 overflow-hidden flex items-center justify-center relative shadow-inner">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : profile?.foto ? (
                <img src={profile?.foto} alt="Current" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-input"
            />

            <label
              htmlFor="avatar-input"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-200 font-extrabold text-xs rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-xs"
            >
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Pilih File Foto</span>
            </label>
            <p className="text-[10px] text-slate-400">Format: JPG, JPEG, PNG, WebP. Ukuran maks 2MB.</p>
          </div>
        </AppModal>

        {/* Smart Floating Scroll Navigator */}
        <SmartScrollFab targetId="tab-konten-profil" downTooltip="Langsung ke Konten Profil" />
      </motion.div>
    </PageContainer>
  )
}
