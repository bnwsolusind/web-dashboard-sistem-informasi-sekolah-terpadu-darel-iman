import { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Database,
  BookOpen,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Search,
  Bell,
  User,
  Layers,
  Plus,
  LogOut,
  Calendar,
  Sparkles,
  Sun,
  Moon,
  CalendarCheck,
  HelpCircle,
  BookHeart,
  BookMarked,
  Users,
  Building2,
  CalendarDays,
  ShieldCheck,
  CreditCard,
  RefreshCw,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { authService } from '../services/authService'
import { api } from '../services/api'
import { educationUnitService } from '../services/educationUnitService'
import { useAuthStore } from '../stores/authStore'
import { usePengaturanStore } from '../stores/pengaturanStore'
import { useUnitStore } from '../stores/unitStore'
import { FAB } from '../components/ui/fab'
import ActiveScheduleNotice from '../components/attendance/ActiveScheduleNotice'
import FloatingChatWidget from '../components/portal/FloatingChatWidget'
import PersonAvatar from '../components/ui/PersonAvatar'
import GlobalSearchModal from '../components/GlobalSearchModal'
import NotificationCenter from '../components/app/NotificationCenter'
import AppBottomNavigation from '../components/app/AppBottomNavigation'
import { isMusyrifRole, isParentRole, isStudentRole, isTeacherRole, isTuOrKepsek, resolveDefaultPortal } from '../auth/portalResolver'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/tailgrids/core/dropdown'
import { UserCircle1, Gear1, Exit, Bell1 } from '@tailgrids/icons'
import AuthToast, { showAuthToast } from '../components/ui/AuthToast'
import AuthPopup from '../components/ui/AuthPopup'
import AcademicCalendarModal from '../components/calendar/AcademicCalendarModal'
import PwaInstallBanner from '../components/app/PwaInstallBanner'

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setSession = useAuthStore((state) => state.setSession)
  const touchActivity = useAuthStore((state) => state.touchActivity)
  const isSessionValid = useAuthStore((state) => state.isSessionValid)
  const loginTime = useAuthStore((state) => state.loginTime)
  const activeUnit = useUnitStore((state) => state.activeUnit)
  const setActiveUnit = useUnitStore((state) => state.setActiveUnit)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const muatPengaturan = usePengaturanStore((state) => state.muatPengaturan)
  const namaSekolah = pengaturan?.school_name || 'YAYASAN DAR EL - IMAN'
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const permissions = Array.isArray(user?.permissions) ? user.permissions : []
  const hasRole = (...names) => names.some((name) => roles.some((role) => String(role).toLowerCase().replace(/[\s_-]+/g, '') === String(name).toLowerCase().replace(/[\s_-]+/g, '')))
  const hasFullMenuAccess = hasRole('Super Admin', 'Admin')
  const can = (...names) => hasFullMenuAccess || names.some((name) => permissions.includes(name))
  const isTataUsaha = hasRole('Tata Usaha', 'TU', 'tu', 'tata_usaha')
  const isKepalaSekolah = hasRole('Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek')
  const isDivisiPendidikan = hasRole('Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan', 'Pengawasan Akademik')
  const isPureMusyrif = isMusyrifRole(roles) && !hasRole('Guru', 'guru', 'Guru Mata Pelajaran', 'guru_mata_pelajaran', 'Guru PAI', 'Guru Tahfizh', 'Wali Kelas', 'walas', 'wali_kelas', 'Super Admin', 'Admin')
  const isMusyrifUser = isMusyrifRole(roles) || isPureMusyrif || hasRole('Musyrif', 'Musyrifah', 'musyrif', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing')
  const isStaffOrTeacherUser = hasFullMenuAccess || isTeacherRole(roles) || isTuOrKepsek(roles) || isDivisiPendidikan || isMusyrifUser || hasRole('Operator', 'Wali Kelas', 'Guru', 'Kepala Sekolah', 'TU', 'Tata Usaha')
  const isTeacherOnly =
    isTeacherRole(roles) &&
    !hasFullMenuAccess &&
    !hasRole(
      'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'pengurus_yayasan',
      'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
      'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan',
      'Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator'
    )
  const isGuruUser =
    !hasFullMenuAccess &&
    (isTeacherOnly || isTeacherRole(roles) || hasRole('Guru', 'guru', 'Guru Mata Pelajaran', 'Guru Tahfizh', 'Guru BK', 'Wali Kelas')) &&
    !hasRole(
      'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'pengurus_yayasan',
      'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
      'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan',
      'Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator'
    )
  const isPureStudent = isStudentRole(roles) && !isStaffOrTeacherUser
  const isPureParent = isParentRole(roles) && !isStaffOrTeacherUser
  const canViewEducationUnits = can('unit.view', 'unit.view_all', 'foundation.unit.view', 'sistem.master_data')
  const canViewStudents = can('student.view', 'student.view_all', 'kesiswaan.data_lengkap_siswa')
  const canCreateStudent = can('student.create')
  const isPortalUser = isPureStudent || isPureParent
  const defaultPortal = resolveDefaultPortal(user || {})

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return true
    }
    return Boolean(pengaturan?.sidebar_collapsed)
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      } else if (pengaturan?.sidebar_collapsed !== undefined) {
        setCollapsed(Boolean(pengaturan.sidebar_collapsed))
      }
    }
  }, [pengaturan?.sidebar_collapsed])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState('master-data')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [roleAccessOpen, setRoleAccessOpen] = useState(false)
  const [roleAccessLoading, setRoleAccessLoading] = useState('')
  const [impersonating, setImpersonating] = useState(() => Boolean(localStorage.getItem('school_erp_superadmin_session')))

  // Hapus sesi impersonasi yang tertinggal jika pengguna saat ini kembali ke dashboard sebagai Super Admin / Admin
  useEffect(() => {
    if (hasFullMenuAccess && localStorage.getItem('school_erp_superadmin_session')) {
      localStorage.removeItem('school_erp_superadmin_session')
      setImpersonating(false)
    }
  }, [hasFullMenuAccess])
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') return false
    if (saved === 'dark') return true
    return false // Default to Light Mode
  })

  const [isResettingCache, setIsResettingCache] = useState(false)

  const handleResetCache = () => {
    setIsResettingCache(true)
    try {
      const keysToKeep = ['token', 'user', 'school_erp_user_session', 'theme']
      Object.keys(localStorage).forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })
      sessionStorage.clear()
      showAuthToast('Cache aplikasi & data berhasil diatur ulang!', 'success')

      setTimeout(() => {
        setIsResettingCache(false)
        window.location.reload()
      }, 600)
    } catch {
      setIsResettingCache(false)
      showAuthToast('Gagal mengatur ulang cache', 'error')
    }
  }

  const [dbUnits, setDbUnits] = useState([])
  const [serverNow, setServerNow] = useState(null)
  const [isAcademicCalendarOpen, setIsAcademicCalendarOpen] = useState(false)

  const muatPengaturanRef = muatPengaturan

  useEffect(() => {
    muatPengaturanRef()
    if (!canViewEducationUnits) {
      setDbUnits([])
      return undefined
    }

    educationUnitService.getAll().then((res) => {
      const list = res?.data || res || []
      if (Array.isArray(list) && list.length > 0) {
        setDbUnits(list.map((u) => ({ id: u.code || u.level || u.id, name: u.name || u.nama })))
      }
    }).catch(() => { })
    return undefined
  }, [muatPengaturanRef, canViewEducationUnits])

  useEffect(() => {
    document.title = pengaturan.application_name || 'Sistem Manajemen Sekolah'
    let favicon = document.querySelector("link[rel~='icon']")
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }
    favicon.href = pengaturan.favicon_url || '/favicon.ico'
  }, [pengaturan.application_name, pengaturan.favicon_url])

  useEffect(() => {
    setCollapsed(Boolean(pengaturan.sidebar_collapsed))
  }, [pengaturan.sidebar_collapsed])

  const serverTimeEndpoint = location.pathname.startsWith('/portal-guru')
    ? '/teacher/step04/schedules'
    : location.pathname === '/dashboard/pemantauan' && permissions.includes('teacher_monitoring.view')
      ? '/teacher-monitoring'
      : null

  useEffect(() => {
    let cancelled = false

    if (!serverTimeEndpoint) {
      setServerNow(null)
      return () => {
        cancelled = true
      }
    }

    api.get(serverTimeEndpoint)
      .then((response) => {
        if (!cancelled) setServerNow(response.data?.data?.server_time || null)
      })
      .catch(() => {
        if (!cancelled) setServerNow(null)
      })

    return () => {
      cancelled = true
    }
  }, [serverTimeEndpoint])

  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const unitDropdownRef = useRef(null)
  const themeDropdownRef = useRef(null)
  const roleAccessRef = useRef(null)
  const quickCreateRef = useRef(null)

  // Sync dark mode class on html & body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  // Listener Aktivitas & Timer Inaktivitas (15 Menit) Sesi
  useEffect(() => {
    let lastCall = 0
    const handleUserActivity = () => {
      const now = Date.now()
      if (now - lastCall > 4000) {
        lastCall = now
        touchActivity()
      }
    }

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart', 'visibilitychange']
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }))

    const checkInterval = setInterval(() => {
      const sessionStatus = isSessionValid()
      if (!sessionStatus.valid) {
        clearSession()
        const isMismatch = sessionStatus.reason === 'browser_mismatch'
        const title = isMismatch ? 'Sesi Browser Berbeda' : 'Sesi Berakhir'
        const message = isMismatch
          ? 'Status login memerlukan autentikasi baru saat berpindah browser/link. Silakan login kembali.'
          : 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan login kembali.'

        Swal.fire({
          icon: 'warning',
          title,
          text: message,
          confirmButtonColor: '#047857',
        }).then(() => {
          window.location.href = `/masuk?reason=${sessionStatus.reason}`
        })
      }
    }, 10000)

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity))
      clearInterval(checkInterval)
    }
  }, [touchActivity, isSessionValid, clearSession])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleGlobalSearch = () => setIsSearchModalOpen(true)
    window.addEventListener('open-global-search', handleGlobalSearch)
    return () => window.removeEventListener('open-global-search', handleGlobalSearch)
  }, [])
  useEffect(() => {
    const handler = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(e.target)) {
        setUnitDropdownOpen(false)
      }
      if (roleAccessRef.current && !roleAccessRef.current.contains(e.target)) {
        setRoleAccessOpen(false)
      }
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target)) {
        setQuickCreateOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const namaTampil = user?.name || 'Ketua Yayasan'
  const impersonatedSession = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('school_erp_superadmin_session') || 'null')
    } catch {
      return null
    }
  }, [impersonating])

  const roleTampil = useMemo(() => {
    if (impersonatedSession?.targetRoleLabel) {
      return impersonatedSession.targetRoleLabel
    }
    if (!roles || roles.length === 0) return 'Pengguna'
    const cleanList = roles
      .map((r) => (typeof r === 'string' ? r : r?.name || ''))
      .filter((r) => r && !r.includes('_') && r.toLowerCase() !== 'tu' && r.toLowerCase() !== 'walas' && r.toLowerCase() !== 'kepsek')
    const uniqueRoles = Array.from(new Set(cleanList.length > 0 ? cleanList : roles))
    return uniqueRoles.slice(0, 2).join(', ') || 'Pengguna'
  }, [roles, impersonatedSession])

  const tanggalTampil = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(serverNow ? new Date(serverNow) : new Date())

  const toggleSection = (sectionKey) => {
    setOpenSection((prev) => (prev === sectionKey ? '' : sectionKey))
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Abaikan error API jika token sudah expired
    } finally {
      clearSession()
      localStorage.removeItem('school_erp_superadmin_session')
      setImpersonating(false)
      // Kirim sinyal toast ke halaman login via sessionStorage
      sessionStorage.setItem('auth_toast', JSON.stringify({
        type: 'logout',
        title: 'Berhasil Keluar',
        message: `Anda telah keluar dari sistem. Sampai jumpa, ${user?.name || 'Pengguna'}!`,
      }))
      window.location.href = '/masuk'
    }
  }

  const roleAccessOptions = [
    { label: 'Pengurus Yayasan', role: 'Yayasan' },
    { label: 'Divisi Pendidikan', role: 'Divisi Pendidikan' },
    { label: 'Kepala Sekolah', role: 'Kepala Sekolah' },
    { label: 'Tata Usaha', role: 'Tata Usaha' },
    { label: 'Guru', role: 'Guru' },
    { label: 'Guru Tahfizh', role: 'Guru Tahfizh' },
    { label: 'Musyrif', role: 'Musyrif' },
    { label: 'Orang Tua', role: 'Orang Tua' },
    { label: 'Siswa', role: 'Siswa' },
  ]

  const routeForRole = (role) => {
    return resolveDefaultPortal({ roles: [role] })
  }

  const accessAsRole = async (option) => {
    setRoleAccessLoading(option.role)
    try {
      const currentSession = {
        token: localStorage.getItem('school_erp_token'),
        user,
        targetRoleLabel: option.label,
      }
      const result = await authService.impersonate(option.role)
      const targetUser = result.user?.data || result.user
      if (!result.token || !Array.isArray(targetUser?.roles)) {
        throw new Error('Respons sesi role tidak valid')
      }
      localStorage.setItem('school_erp_superadmin_session', JSON.stringify(currentSession))
      setImpersonating(true)
      setSession({ token: result.token, user: targetUser })
      // Reload penuh diperlukan agar cache query, permission, dan seluruh outlet
      // dibangun ulang menggunakan token pengguna target.
      window.location.replace(routeForRole(option.role))
    } catch (error) {
      Swal.fire('Akses belum tersedia', error.response?.data?.message || 'Gagal masuk sebagai role tersebut.', 'error')
    } finally {
      setRoleAccessLoading('')
    }
  }

  const returnToSuperAdmin = () => {
    try {
      const original = JSON.parse(localStorage.getItem('school_erp_superadmin_session') || 'null')
      if (!original?.token || !original?.user) throw new Error('Sesi tidak ditemukan')
      setSession(original)
      localStorage.removeItem('school_erp_superadmin_session')
      setImpersonating(false)
      window.location.replace('/dashboard')
    } catch {
      clearSession()
      localStorage.removeItem('school_erp_superadmin_session')
      setImpersonating(false)
      window.location.href = '/masuk'
    }
  }

  const daftarUnitOptions = [
    { id: 'SEMUA', name: 'Semua Unit Pendidikan' },
    ...(dbUnits.length > 0 ? dbUnits : [
      { id: 'TK', name: 'TK Islam Terpadu' },
      { id: 'SD', name: 'SD Islam Terpadu' },
      { id: 'SMP', name: 'SMP Islam Terpadu' },
      { id: 'SMA', name: 'SMA Islam Terpadu' },
      { id: 'PONPES', name: 'Pondok Pesantren' },
    ]),
  ]

  const currentUnitObj = dbUnits.find((u) => u.id === activeUnit || u.name === activeUnit || u.code === activeUnit)
  const unitNameToCheck = String(activeUnit || currentUnitObj?.name || currentUnitObj?.unit_name || user?.education_unit_name || user?.education_unit || user?.unit_name || user?.unit || '').toLowerCase()
  const unitCodeToCheck = String(currentUnitObj?.code || currentUnitObj?.unit_code || user?.unit_code || '').toLowerCase()
  const isPesantrenUnit = Boolean(
    user?.is_pesantren ||
    currentUnitObj?.is_pesantren ||
    currentUnitObj?.has_pesantren ||
    currentUnitObj?.is_boarding ||
    unitCodeToCheck.includes('ponpes') ||
    unitCodeToCheck.includes('pesantren') ||
    unitNameToCheck.includes('pesantren') ||
    unitNameToCheck.includes('ponpes') ||
    unitNameToCheck.includes('pondok') ||
    unitNameToCheck.includes('mahad') ||
    unitNameToCheck.includes('asrama')
  )
  const setoranTahfizhMenuLabel = isPesantrenUnit ? 'Setoran Tahfizh Santri' : 'Setoran Tahfizh Siswa'

  const attendanceSubmenus = [
    ...((!isTataUsaha || hasRole('Wali Kelas')) && (hasFullMenuAccess || hasRole('Wali Kelas', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan') || can('attendance.homeroom.dashboard', 'homeroom_attendance.dashboard')) ? [
      { to: '/absensi/dashboard-wali-kelas', label: 'Dashboard Wali Kelas' },
    ] : []),
    ...((hasFullMenuAccess || isTataUsaha || hasRole('Wali Kelas', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan')) && (isTataUsaha || hasRole('Wali Kelas', 'Tata Usaha', 'TU', 'tata_usaha', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan') || can('attendance.homeroom.dashboard', 'homeroom_attendance.dashboard', 'homeroom_attendance.view', 'attendance.view', 'kehadiran.siswa.monitoring')) ? [
      { to: '/absensi/rekap-kehadiran', label: 'Manajemen Kehadiran Siswa' },
    ] : []),
    // Submenu presensi guru telah dikonsolidasikan ke dalam Portal Guru -> Workspace Pembelajaran Guru
    ...((hasFullMenuAccess || isStudentRole(roles)) && can('attendance.student.view_own', 'student_attendance.view_own') ? [
      { to: '/absensi/kehadiran-saya', label: 'Kehadiran Saya' },
      { to: '/absensi/riwayat-saya', label: 'Riwayat Kehadiran' },
    ] : []),
    ...(hasFullMenuAccess || can('teacher_monitoring.view') ? [
      { to: '/dashboard/pemantauan', label: 'Monitoring Guru Mengajar' },
    ] : []),
    ...(!isTeacherOnly && !isGuruUser && !hasRole('Guru', 'Guru Mapel') ? [
      { to: '/dashboard/absensi-gerbang', label: 'Absensi Gerbang' },
      { to: '/dashboard/absensi-pembelajaran', label: 'Absensi Kelas & MaPel' },
      ...(isPesantrenUnit ? [{ to: '/dashboard/absensi-ibadah', label: 'Absensi Ibadah Santri' }] : []),
      { to: '/dashboard/absensi-ibadah-siswa', label: 'Absensi Ibadah Siswa' },
      { to: '/dashboard/laporan-absensi', label: 'Rekap Presensi & Laporan' },
    ] : [
      ...(isPesantrenUnit ? [{ to: '/dashboard/absensi-ibadah', label: 'Absensi Ibadah Santri' }] : []),
    ]),
  ].filter((item, index, list) => list.findIndex((entry) => entry.to === item.to) === index)

  const isRestrictedFoundationOrPrincipal =
    !hasFullMenuAccess &&
    hasRole(
      'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Pengurus',
      'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek'
    )

  const bolehBukaMenu = (to) => {
    if (!to || typeof to !== 'string') return false
    if (hasFullMenuAccess) return true
    if (isMusyrifUser && (to === '/absensi/laporan' || to === '/dashboard/mutabaah/rekap' || to.startsWith('/dashboard/laporan'))) return false

    if (isStudentRole(roles) && !hasFullMenuAccess) {
      if (
        to === '/absensi/laporan' ||
        to === '/dashboard/mutabaah/rekap' ||
        to.startsWith('/dashboard/mutabaah') ||
        to.startsWith('/dashboard/laporan') ||
        to.startsWith('/dashboard/rekap') ||
        to === '/dashboard/kelola-alumni' ||
        to === '/dashboard/tahfizh' ||
        to.startsWith('/dashboard/tahfizh') ||
        to.includes('/monitoring-tahfizh-ibadah')
      ) {
        return false
      }
    }

    if (to.startsWith('/portal-siswa')) return isStudentRole(roles) || isParentRole(roles)
    if (to.startsWith('/portal-orangtua')) return isParentRole(roles) || isStudentRole(roles)
    if (to.startsWith('/portal-guru')) {
      if (isRestrictedFoundationOrPrincipal) return false
      if (isPureMusyrif && !hasFullMenuAccess) return false
      return isTeacherRole(roles)
    }
    if (to.startsWith('/dashboard/musyrif')) {
      if (isRestrictedFoundationOrPrincipal) return false
      return can('dashboard.musyrif.view', 'dashboard.guru-tahfizh.view') || isMusyrifRole(roles)
    }
    if (to === '/dashboard') return can('dashboard.view')
    if (to.startsWith('/dashboard/pemantauan')) return can('dashboard.pemantauan.lihat', 'teacher_monitoring.view')
    if (to.startsWith('/dashboard/monitoring-divisi')) {
      return can('divisi.monitoring', 'dashboard.pemantauan.kelola', 'dashboard.pemantauan.lihat') ||
             hasRole('Super Admin', 'SuperAdmin', 'Admin', 'admin', 'Yayasan', 'Pengurus Yayasan', 'Ketua Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'Divisi Pendidikan', 'divisi_pendidikan', 'Kepala Divisi')
    }
    // Data pribadi hanya memberi akses ke profil siswa sendiri di portal,
    // bukan ke master data seluruh siswa.
    if (to === '/dashboard/students') return canViewStudents
    if (to.includes('/students/rombel') || to.includes('/students/kelas')) return can('kesiswaan.kelas_rombel')
    if (to.includes('/students/input')) return canCreateStudent
    if (to.includes('/students/laporan')) return can('report.student.view', 'kesiswaan.laporan_masuk_keluar')
    if (to.includes('/employees') || to.includes('/students/pegawai') || to.includes('/master/pegawai') || to.includes('/master/guru')) {
      return can('employee.view', 'employee.view_all', 'foundation.employee.view')
    }
    if (to.includes('/unit-pendidikan') || to.includes('/master-jenis-unit')) {
      if (!hasFullMenuAccess && isDivisiPendidikan && (to.includes('/unit-pendidikan') || to.includes('/master-jenis-unit'))) return false
      return canViewEducationUnits
    }
    if (to.includes('/master-jabatan') || to.includes('/students/jabatan')) {
      if (!hasFullMenuAccess && isDivisiPendidikan) return false
      if (
        (hasRole('Guru', 'guru', 'Wali Kelas', 'wali_kelas', 'Guru Mapel', 'Guru Tahfizh', 'Guru BK', 'Musyrif', 'musyrif', 'Musyrifah', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing') || isPureMusyrif) &&
        !hasRole('Super Admin', 'SuperAdmin', 'superadmin', 'super_admin', 'Admin', 'admin', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Yayasan')
      ) {
        return false
      }
      return can('master.view', 'sistem.master_data')
    }
    if (to.includes('/master-tahun-ajaran')) {
      return can('master.view', 'sistem.master_data')
    }
    if (to.includes('/chat-pegawai')) {
      if ((isParentRole(roles) || isStudentRole(roles)) && !hasFullMenuAccess) return false
      if (hasFullMenuAccess || isKepalaSekolah || isDivisiPendidikan || hasRole('Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan')) return true
      return can('chat.conversation.view', 'chat.manage')
    }
    if (to.includes('/akademik/nilai-rapor') || to.includes('/lms/penilaian') || to.includes('/lms/rapor')) {
      if (isTeacherOnly) return false
      if (hasRole(
        'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan',
        'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah',
        'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan'
      )) {
        return false
      }
      if (hasRole(
        'Super Admin', 'SuperAdmin', 'superadmin', 'super_admin',
        'Admin', 'admin',
        'TU', 'Tata Usaha', 'tata_usaha', 'Operator', 'operator',
        'Guru', 'guru', 'Wali Kelas', 'wali_kelas', 'Guru Mapel', 'Guru Tahfizh', 'Guru BK'
      )) {
        return true
      }
      return false
    }
    if (to.includes('/akademik/pengaturan')) {
      if (
        hasRole(
          'Guru', 'guru', 'Wali Kelas', 'wali_kelas', 'Guru Mapel', 'Guru Tahfizh', 'Guru BK',
          'Musyrif', 'Musyrifah', 'musyrif', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing'
        ) &&
        !hasRole(
          'Super Admin', 'SuperAdmin', 'superadmin', 'super_admin',
          'Admin', 'admin',
          'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah',
          'Divisi Pendidikan', 'divisi_pendidikan'
        )
      ) {
        return false
      }
    }
    if (to.includes('/akademik') || to === '/dashboard/academic') {
      if (isTeacherOnly) return false
      return can('academic.view', 'academic.manage')
    }
    if (to.includes('/lms/penugasan')) return can('kesiswaan.penugasan_siswa')
    if (to.includes('/lms/materi-pembelajaran')) return can('pembelajaran.materi')
    if (to.includes('/lms/kisi-kisi')) return can('pembelajaran.kisi_kisi_ujian')
    if (to.includes('/lms/bank-soal')) return can('pembelajaran.bank_soal')
    if (to.includes('/jadwal-pelajaran')) return can('pembelajaran.jadwal_pelajaran')
    if (to.includes('/laporan-tahfizh')) {
      if ((isTeacherOnly || isGuruUser) && !hasFullMenuAccess) return false
      return (
        hasRole(
          'Super Admin', 'Admin', 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan',
          'Sekretaris Yayasan', 'Bendahara Yayasan', 'Divisi Pendidikan', 'Kepala Bidang Pendidikan',
          'Divisi Kurikulum', 'Divisi Kesiswaan', 'Divisi Bahasa', 'Divisi Program Khusus',
          'Kepala Sekolah', 'Wakil Kepala Sekolah', 'Waka Kurikulum', 'Wakil Kurikulum',
          'Waka Kesiswaan', 'Wakil Kesiswaan', 'Tata Usaha', 'TU', 'Operator'
        ) ||
        can('report.tahfizh.view', 'report.view')
      )
    }
    if (to.includes('/tahfizh/rekapan') || to.includes('/laporan-rekapan-tahfizh')) {
      return (
        hasRole(
          'Super Admin', 'Admin', 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan',
          'Sekretaris Yayasan', 'Bendahara Yayasan', 'Divisi Pendidikan', 'Kepala Bidang Pendidikan',
          'Divisi Kurikulum', 'Divisi Kesiswaan', 'Divisi Bahasa', 'Divisi Program Khusus',
          'Kepala Sekolah', 'Wakil Kepala Sekolah', 'Waka Kurikulum', 'Wakil Kurikulum',
          'Waka Kesiswaan', 'Wakil Kesiswaan', 'Tata Usaha', 'TU', 'Operator',
          'Guru', 'guru', 'Guru Mapel', 'Guru Tahfizh', 'Guru BK', 'Wali Kelas', 'wali_kelas', 'Musyrif', 'musyrif', 'Musyrifah'
        ) ||
        can('report.tahfizh.view', 'tahfizh.view', 'report.view', 'dashboard.guru-tahfizh.view', 'dashboard.guru.view')
      )
    }
    if (to === '/dashboard/tahfizh' || to.startsWith('/dashboard/tahfizh')) {
      if (isParentRole(roles) && !hasRole('Super Admin', 'SuperAdmin', 'super_admin')) {
        return false
      }
      return (
        hasRole(
          'Super Admin', 'Admin', 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan',
          'Sekretaris Yayasan', 'Bendahara Yayasan', 'Divisi Pendidikan', 'Kepala Bidang Pendidikan',
          'Divisi Kurikulum', 'Divisi Kesiswaan', 'Divisi Bahasa', 'Divisi Program Khusus',
          'Kepala Sekolah', 'Wakil Kepala Sekolah', 'Waka Kurikulum', 'Wakil Kurikulum',
          'Waka Kesiswaan', 'Wakil Kesiswaan', 'Tata Usaha', 'TU', 'Operator',
          'Guru', 'Wali Kelas', 'Guru Tahfizh', 'Guru BK', 'Musyrif', 'Musyrifah', 'Siswa'
        ) ||
        can(
          'kesiswaan.kelas_rombel', 'academic.schedule.view', 'sistem.master_data',
          'tahfizh.monitoring_target', 'tahfizh.laporan_target', 'tahfizh.view',
          'tahfizh.deposit.view', 'tahfizh.deposit.create', 'tahfizh.input_setoran_harian',
          'dashboard.guru-tahfizh.view', 'dashboard.guru.view'
        )
      )
    }
    if (to === '/dashboard/absensi-pembelajaran' || to.startsWith('/dashboard/absensi-pembelajaran') || to.includes('/absensi-pembelajaran')) {
      if ((isTeacherOnly || isGuruUser) && !hasFullMenuAccess) return false
      if (isPureMusyrif && !hasFullMenuAccess) return false
      return (
        hasRole('Super Admin', 'Admin', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan', 'Waka Kurikulum', 'Waka Kesiswaan') ||
        can('lesson_attendance.view', 'attendance.view', 'kehadiran.siswa.monitoring')
      )
    }
    if (to === '/dashboard/absensi-gerbang' || to.startsWith('/dashboard/absensi-gerbang') || to.includes('/absensi-gerbang')) {
      if (isTeacherOnly) return false
      return (
        hasRole('Super Admin', 'Admin', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan', 'Waka Kesiswaan') ||
        can('gate_attendance.view', 'kehadiran.siswa.absensi_digital')
      )
    }
    if (to === '/dashboard/absensi-ibadah-siswa' || to.startsWith('/dashboard/absensi-ibadah-siswa')) {
      if ((isTeacherOnly || isGuruUser) && !hasFullMenuAccess) return false
      return (
        hasRole(
          'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
          'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan',
          'Super Admin', 'Admin', 'Tata Usaha', 'TU', 'Operator',
          'Yayasan'
        ) ||
        can('student_worship_attendance.view', 'student_worship_attendance.manage', 'worship_attendance.view', 'kehadiran.siswa.monitoring')
      )
    }
    if ((to === '/dashboard/absensi-ibadah' || to.startsWith('/dashboard/absensi-ibadah/')) && !to.startsWith('/dashboard/absensi-ibadah-siswa')) {
      if (!isPesantrenUnit && !hasFullMenuAccess) return false
      return (
        hasRole(
          'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
          'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan',
          'Musyrif', 'Musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing',
          'Super Admin', 'Admin', 'Yayasan', 'Tata Usaha', 'TU', 'tata_usaha'
        ) ||
        can('worship_attendance.view', 'worship_attendance.verify', 'kehadiran.siswa.monitoring')
      )
    }
    if (to.includes('/monitoring-tahfizh-ibadah') || to.includes('/mutabaah')) {
      if (isParentRole(roles) && !hasRole('Super Admin', 'SuperAdmin', 'super_admin')) {
        return false
      }
      return (
        hasRole('Super Admin', 'Admin', 'Yayasan', 'Kepala Sekolah', 'Divisi Pendidikan', 'Waka Kesiswaan', 'Waka Kurikulum', 'Tata Usaha', 'TU', 'Operator', 'Wali Kelas', 'Guru', 'Musyrif', 'Musyrifah', 'Pembimbing', 'Pengurus Yayasan') ||
        can('mutabaah.view', 'mutabaah.input', 'mutabaah.agenda.manage', 'sistem.master_data', 'mutabaah.dashboard.view', 'mutabaah.recap.view', 'mutabaah.daily.view', 'mutabaah.agenda.view', 'mutabaah.template.view', 'mutabaah.supervisor.view', 'mutabaah.parent.monitor', 'divisi.monitoring')
      )
    }
    if (to.includes('/laporan-absensi')) {
      return (
        hasRole('Super Admin', 'Admin', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan') ||
        can('kehadiran.siswa.monitoring', 'kehadiran.siswa.rekap_keterlambatan', 'kehadiran.siswa.rekap_ketidakhadiran', 'report.attendance.view', 'report.view')
      )
    }
    if (to.includes('/rekap-absensi-gerbang')) {
      return (
        hasRole('Super Admin', 'Admin', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan') ||
        can('kehadiran.siswa.monitoring', 'gate_attendance.view', 'report.attendance.view')
      )
    }
    if (to.includes('/rekap-absensi-ibadah')) {
      return (
        hasRole('Super Admin', 'Admin', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan') ||
        can('worship_attendance.view', 'worship_attendance.verify', 'report.attendance.view', 'kehadiran.siswa.monitoring')
      )
    }
    if (to.includes('/laporan-siswa')) return can('kesiswaan.rekap_prestasi', 'kesiswaan.kelulusan_per_unit', 'kesiswaan.kelulusan_per_tahun')
    if (to.includes('/kelola-alumni')) {
      if (isTeacherOnly) return false
      return (
        hasFullMenuAccess ||
        hasRole('Super Admin', 'SuperAdmin', 'super_admin', 'Admin', 'admin', 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Waka Kesiswaan') ||
        can('kesiswaan.alumni_tujuan_lanjut', 'alumni.view', 'foundation.alumni.view', 'kesiswaan.kelulusan_per_tahun', 'sistem.master_data')
      )
    }
    if (to.includes('/laporan-alumni')) {
      if ((isTeacherOnly || isGuruUser) && !hasFullMenuAccess) return false
      return (
        hasFullMenuAccess ||
        hasRole('Super Admin', 'SuperAdmin', 'super_admin', 'Admin', 'admin', 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Waka Kesiswaan') ||
        can('kesiswaan.alumni_tujuan_lanjut', 'alumni.view', 'foundation.alumni.view', 'report.view', 'kesiswaan.kelulusan_per_tahun', 'sistem.master_data')
      )
    }
    if (to.startsWith('/absensi') || to.includes('/attendance') || to.includes('/lms/presensi')) {
      if (to === '/absensi/laporan' || to.startsWith('/absensi/laporan')) {
        if (isParentRole(roles) && !hasRole('Super Admin', 'SuperAdmin', 'super_admin')) return false
      }
      if (to === '/absensi/dashboard-wali-kelas' || to.startsWith('/absensi/dashboard-wali-kelas')) {
        if (isTataUsaha && !hasRole('Wali Kelas') && !hasFullMenuAccess) return false
        return (
          hasRole('Wali Kelas', 'walas', 'wali_kelas', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan') ||
          can('attendance.homeroom.dashboard', 'homeroom_attendance.dashboard')
        )
      }
      return (
        hasRole('Super Admin', 'Admin', 'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan', 'Wali Kelas', 'Guru') ||
        can(
          'kehadiran.siswa.absensi_digital',
          'kehadiran.siswa.barcode_kartu',
          'kehadiran.siswa.monitoring',
          'lesson_attendance.view',
          'lesson_attendance.view_own',
          'student_attendance.view_own',
        )
      )
    }
    if (to.startsWith('/dashboard/yayasan')) {
      if (!hasFullMenuAccess && (isKepalaSekolah || isDivisiPendidikan) && (to.includes('/yayasan/unit-pendidikan') || to.includes('/unit-pendidikan'))) return false
      return (
        isKepalaSekolah ||
        isDivisiPendidikan ||
        hasRole('Super Admin', 'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan') ||
        can(
          'foundation.dashboard.view',
          'foundation.unit.view',
          'foundation.employee.view',
          'foundation.teacher.view',
          'foundation.student.view',
          'foundation.student_new.view',
          'foundation.student_mutation.view',
          'foundation.graduation.view',
          'foundation.alumni.view',
          'foundation.information.view',
          'foundation.report.view',
          'foundation.report.export'
        )
      )
    }
    if (to === '/dashboard/berita-informasi' || to.includes('/berita-informasi')) {
      if (isTeacherOnly) return false
      return (
        isParentRole(roles) || isStudentRole(roles) ||
        hasRole(
          'Super Admin', 'Admin', 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan', 'pengurus_yayasan',
          'Kepala Sekolah', 'kepala_sekolah', 'Divisi Pendidikan', 'divisi_pendidikan',
          'Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'Siswa', 'Orang Tua'
        ) ||
        can('foundation.information.view', 'sekolah.informasi_sekolah', 'sistem.master_data')
      )
    }
    if (to.includes('/profil-akun') || to.includes('/profil-saya') || to === '/dashboard/profil-akun') return true
    if (to.includes('/hak-akses')) return can('sistem.hak_akses', 'permission.manage', 'role.manage')
    if (to.includes('/koneksi-api-mobile')) {
      return hasRole('Super Admin', 'SuperAdmin', 'super_admin', 'superadmin', 'Admin', 'admin') || hasFullMenuAccess
    }
    if (to.includes('/pengaturan')) {
      return hasRole('Super Admin', 'SuperAdmin', 'super_admin', 'superadmin', 'Admin', 'admin')
    }

    return can('sistem.master_data')
  }

  const isDivisiPendidikanOnly =
    hasRole('Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Pengawasan Akademik') &&
    !hasRole('Super Admin', 'SuperAdmin', 'super_admin', 'Admin', 'admin', 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan')

  const isFoundationUser =
    !hasFullMenuAccess &&
    (hasRole('Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan') ||
      can('foundation.dashboard.view'))

  const shouldHideFromGuru = (item, submenu = null) => {
    const to = submenu?.to || item?.to || ''
    if (hasFullMenuAccess) return false
    if (
      (isTeacherOnly || isGuruUser) &&
      (
        item?.key === 'mutabaah' ||
        to === '/dashboard/mutabaah' ||
        to.startsWith('/dashboard/mutabaah') ||
        to === '/dashboard/tahfizh' ||
        to.startsWith('/dashboard/tahfizh') ||
        to === '/dashboard/laporan-tahfizh' ||
        to.includes('/laporan-tahfizh') ||
        to === '/dashboard/monitoring-tahfizh-ibadah-non-pesantren' ||
        to.includes('/monitoring-tahfizh-ibadah') ||
        item?.key === 'dashboard-yayasan-menu' ||
        to === '/dashboard/yayasan' ||
        to.startsWith('/dashboard/yayasan') ||
        to.startsWith('/dashboard/monitoring-divisi') ||
        item?.key === 'akademik' ||
        to.includes('/akademik') ||
        to === '/dashboard/kelola-alumni' ||
        to.includes('/kelola-alumni') ||
        to === '/dashboard/laporan-alumni' ||
        to.includes('/laporan-alumni') ||
        to === '/dashboard/berita-informasi' ||
        to.includes('/berita-informasi') ||
        to === '/dashboard/absensi-gerbang' ||
        to.includes('/absensi-gerbang')
      )
    ) {
      return true
    }
    return false
  }

  const shouldHideFromTataUsaha = (item, submenu = null) => {
    if (hasFullMenuAccess || !isTataUsaha) return false
    if (item.key === 'portal-guru' || item.key === 'mutabaah') return true
    if (submenu?.to === '/dashboard/mutabaah/rekap' || submenu?.to === '/dashboard/pengaturan') return true
    return item.key === 'master-data' && ['/dashboard/master-jabatan', '/dashboard/employees'].includes(submenu?.to)
  }

  const shouldHideFromKepalaSekolah = (item, submenu = null) => {
    const to = submenu?.to || item?.to || ''
    if (!isPesantrenUnit && !hasFullMenuAccess && (to === '/dashboard/absensi-ibadah' || to.startsWith('/dashboard/absensi-ibadah/')) && !to.startsWith('/dashboard/absensi-ibadah-siswa')) {
      return true
    }
    if (hasFullMenuAccess || (!isKepalaSekolah && !isDivisiPendidikan)) return false
    if (submenu?.to === '/dashboard/kelola-alumni' || submenu?.to === '/dashboard/students' || submenu?.to === '/dashboard/employees') return false
    if (item.key === 'master-data' && !submenu) return false
    if (item.key === 'master-data') return true
    if (
      to === '/dashboard/students/unit-pendidikan' ||
      to === '/dashboard/yayasan/unit-pendidikan' ||
      to === '/dashboard/master/unit-pendidikan' ||
      to === '/dashboard/master-jenis-unit' ||
      to === '/dashboard/master-jabatan' ||
      to.includes('/unit-pendidikan') ||
      to.includes('/master-jenis-unit') ||
      to.includes('/master-jabatan')
    ) {
      return true
    }
    return false
  }

  const shouldHideFromDivisiPendidikan = (item, submenu = null) => {
    return shouldHideFromKepalaSekolah(item, submenu)
  }

  const shouldHideFromMusyrif = (item, submenu = null) => {
    if (hasFullMenuAccess) return false
    if (isMusyrifUser || isPureMusyrif) {
      const to = submenu?.to || item?.to || ''
      if (item?.key === 'laporan') return true
      if (to === '/absensi/laporan' || to === '/dashboard/mutabaah/rekap') return true
    }
    return false
  }

const sidebarIconStyles = {
  'dashboard': 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs',
  'dashboard-yayasan': 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs',
  'dashboard-yayasan-menu': 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs',
  'master-data': 'bg-purple-100/90 text-purple-600 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60 shadow-2xs',
  'akademik': 'bg-sky-100/90 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60 shadow-2xs',
  'portal-guru': 'bg-indigo-100/90 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 shadow-2xs',
  'portal-ortu-siswa': 'bg-rose-100/90 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/60 shadow-2xs',
  'absensi': 'bg-teal-100/90 text-teal-600 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/60 shadow-2xs',
  'musyrif-asrama': 'bg-violet-100/90 text-violet-600 dark:bg-violet-950/70 dark:text-violet-300 border border-violet-200/70 dark:border-violet-800/60 shadow-2xs',
  'mutabaah': 'bg-amber-100/90 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 shadow-2xs',
  'tahfizh': 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs',
  'rekap-data': 'bg-fuchsia-100/90 text-fuchsia-600 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border border-fuchsia-200/70 dark:border-fuchsia-800/60 shadow-2xs',
  'pengaturan': 'bg-slate-100/90 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 shadow-2xs',
  'yayasan-monitoring': 'bg-sky-100/90 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60 shadow-2xs',
  'yayasan-laporan': 'bg-fuchsia-100/90 text-fuchsia-600 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border border-fuchsia-200/70 dark:border-fuchsia-800/60 shadow-2xs',
  'yayasan-pengaturan': 'bg-slate-100/90 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 shadow-2xs',
}

const pastelPaletteCycle = [
  'bg-sky-100/90 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60 shadow-2xs',
  'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs',
  'bg-purple-100/90 text-purple-600 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60 shadow-2xs',
  'bg-amber-100/90 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 shadow-2xs',
  'bg-fuchsia-100/90 text-fuchsia-600 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border border-fuchsia-200/70 dark:border-fuchsia-800/60 shadow-2xs',
  'bg-rose-100/90 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/60 shadow-2xs',
]

const getSidebarIconBadgeClass = (key, idx) => {
  return sidebarIconStyles[key] || pastelPaletteCycle[idx % pastelPaletteCycle.length]
}

  const sidebarMenu = (isFoundationUser ? [
    {
      key: 'dashboard-yayasan',
      label: isKepalaSekolah ? 'Dashboard Kepala Sekolah' : 'Dashboard Yayasan',
      icon: LayoutDashboard,
      to: '/dashboard/yayasan',
    },
    {
      key: 'yayasan-monitoring',
      label: 'Monitoring',
      icon: Building2,
      submenus: isKepalaSekolah ? [
        { to: '/dashboard/berita-informasi', label: 'Berita & Pengumuman' },
        ...(can('teacher_monitoring.view') ? [{ to: '/dashboard/pemantauan', label: 'Monitoring Guru Mengajar' }] : []),
        ...(hasFullMenuAccess || can('divisi.monitoring', 'dashboard.pemantauan.kelola', 'dashboard.pemantauan.lihat') || hasRole('Super Admin', 'SuperAdmin', 'Admin', 'admin', 'Yayasan', 'Pengurus Yayasan', 'Ketua Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'Divisi Pendidikan', 'divisi_pendidikan', 'Kepala Divisi') ? [
          { to: '/dashboard/monitoring-divisi', label: 'Monitoring Divisi' },
        ] : []),
      ] : [
        { to: '/dashboard/yayasan/unit-pendidikan', label: 'Unit Pendidikan' },
        { to: '/dashboard/yayasan/pegawai-guru', label: 'Pegawai & Guru' },
        { to: '/dashboard/yayasan/siswa', label: 'Data Siswa' },
        { to: '/dashboard/yayasan/informasi-sekolah', label: 'Informasi Sekolah' },
      ],
    },
    {
      key: 'yayasan-laporan',
      label: 'Laporan',
      icon: FileText,
      submenus: [
        { to: '/dashboard/yayasan/laporan/tahfizh', label: 'Laporan Tahfizh' },
        { to: '/dashboard/yayasan/laporan/mutasi', label: 'Laporan Mutasi Siswa' },
        { to: '/dashboard/yayasan/laporan/alumni', label: 'Laporan Alumni' },
      ],
    },
    {
      key: 'yayasan-pengaturan',
      label: 'Pengaturan Yayasan',
      icon: Settings,
      submenus: [
        { to: '/dashboard/yayasan/profil', label: 'Profil' },
      ],
    },
  ] : [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/dashboard',
    },
    ...(!isTeacherOnly && !isGuruUser ? [
      {
        key: 'dashboard-yayasan-menu',
      label: isKepalaSekolah ? 'DASHBOARD KEPALA SEKOLAH' : isDivisiPendidikan ? 'DASHBOARD DIVISI PENDIDIKAN' : 'DASHBOARD YAYASAN',
      icon: Building2,
      submenus: (isKepalaSekolah || isDivisiPendidikan) ? [
        { to: '/dashboard/yayasan', label: 'Ringkasan Utama' },
        ...(!isDivisiPendidikan && (hasFullMenuAccess || can('divisi.monitoring', 'dashboard.pemantauan.kelola', 'dashboard.pemantauan.lihat') || hasRole('Super Admin', 'SuperAdmin', 'Admin', 'admin', 'Yayasan', 'Pengurus Yayasan', 'Ketua Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'Kepala Divisi')) ? [
          { to: '/dashboard/monitoring-divisi', label: 'Monitoring Divisi' },
        ] : []),
        { to: '/dashboard/berita-informasi', label: 'Berita & Pengumuman' },
      ] : [
        { to: '/dashboard/yayasan', label: 'Ringkasan Utama' },
        ...(hasFullMenuAccess || can('divisi.monitoring', 'dashboard.pemantauan.kelola', 'dashboard.pemantauan.lihat') || hasRole('Super Admin', 'SuperAdmin', 'Admin', 'admin', 'Yayasan', 'Pengurus Yayasan', 'Ketua Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'Divisi Pendidikan', 'divisi_pendidikan', 'Kepala Divisi') ? [
          { to: '/dashboard/monitoring-divisi', label: 'Monitoring Divisi' },
        ] : []),
        { to: '/dashboard/yayasan/unit-pendidikan', label: 'Unit Pendidikan' },
        { to: '/dashboard/yayasan/pegawai-guru', label: 'Pegawai & Guru' },
        { to: '/dashboard/yayasan/siswa', label: 'Data Siswa' },
        { to: '/dashboard/yayasan/informasi-sekolah', label: 'Informasi Sekolah' },
        { to: '/dashboard/chat-pegawai', label: 'Chat Pengurus & Pegawai' },
      ],
    },
    ] : []),
    ...(!((isParentRole(roles) || isStudentRole(roles)) && !hasFullMenuAccess) ? [
      {
        key: 'master-data',
        label: hasFullMenuAccess || isKepalaSekolah || isDivisiPendidikan ? 'MANAJEMEN DATA' : 'MASTER DATA',
        icon: Database,
        submenus: [
          { to: '/dashboard/students/unit-pendidikan', label: 'Unit Pendidikan' },
          { to: '/dashboard/master-jenis-unit', label: 'Jenis Unit' },
          { to: '/dashboard/master-jabatan', label: 'Jabatan' },
          { to: '/dashboard/employees', label: 'Pegawai' },
          { to: '/dashboard/students', label: 'Siswa' },
          { to: '/dashboard/kelola-alumni', label: 'Pengolahan Data Alumni' },
          { to: '/dashboard/berita-informasi', label: 'Berita & Pengumuman' },
          { label: 'Kalender Akademik', action: 'calendar' },
          { to: '/dashboard/master-quran-surah', label: 'Al-Qur’an' },
          { to: '/dashboard/master-jadwal-sholat', label: 'Sholat' },
          { to: '/dashboard/master-doa', label: 'Do’a & Dzikir' },
          { to: '/dashboard/poin-penilaian-doa', label: 'Poin Penilaian Doa' },
        ],
      },
    ] : []),
    ...((hasFullMenuAccess || isKepalaSekolah || isDivisiPendidikan || hasRole('Super Admin', 'super_admin', 'Admin', 'admin', 'Operator', 'operator', 'Tata Usaha', 'tu', 'tata_usaha')) ? [
      {
        key: 'keuangan-sekolah',
        label: 'KEUANGAN SISWA',
        icon: CreditCard,
        submenus: [
          { to: '/dashboard/keuangan/tagihan-siswa', label: 'Tagihan & Pembayaran SPP' },
        ],
      },
    ] : []),
    {
      key: 'akademik',
      label: 'AKADEMIK & LMS',
      icon: BookOpen,
      submenus: [
        { to: '/dashboard/akademik/pengaturan?tab=tahun-ajaran', label: 'Pengaturan Akademik' },
        { label: 'Kalender Akademik', action: 'calendar' },
        { to: '/dashboard/akademik/perencanaan?tab=cp', label: 'Perencanaan Pembelajaran' },
        { to: '/dashboard/akademik/pembelajaran?tab=materi', label: 'Pembelajaran' },
        { to: '/dashboard/akademik/evaluasi?tab=penugasan', label: 'Tugas & Evaluasi' },
        { to: '/dashboard/akademik/nilai-rapor?tab=buku-nilai', label: 'Nilai & Rapor' },
      ],
    },
    ...(!isPureMusyrif && (isTeacherRole(roles) || hasFullMenuAccess) ? [
      {
        key: 'portal-guru',
        label: 'PORTAL GURU',
        icon: BookOpen,
        submenus: [
          { to: '/portal-guru/workspace', label: 'Workspace Pembelajaran Guru' },
          { to: '/dashboard/chat-pegawai', label: 'Chat Pegawai & Orang Tua' },
        ],
      },
    ] : []),
    {
      key: 'portal-ortu-siswa',
      label: hasRole('Orang Tua') ? 'PORTAL ORANG TUA' : hasRole('Siswa') ? 'PORTAL SISWA' : 'PORTAL ORANG TUA & SISWA',
      icon: Users,
      submenus: [
         ...(isParentRole(roles) || (hasFullMenuAccess && !isStudentRole(roles)) ? [
          { to: '/portal-orangtua', label: 'Portal Orang Tua' },
        ] : []),
         ...(isStudentRole(roles) || (hasFullMenuAccess && !isParentRole(roles)) ? [
          { to: '/portal-siswa', label: 'Portal Siswa' },
        ] : []),
      ],
    },
    {
      key: 'absensi',
      label: 'ABSENSI',
      icon: CalendarCheck,
      submenus: attendanceSubmenus,
    },
    ...((isMusyrifRole(roles) || hasFullMenuAccess || hasRole('Musyrif', 'Musyrifah', 'musyrif', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing')) ? [
      {
        key: 'musyrif-asrama',
        label: 'PORTAL MUSYRIF',
        icon: Moon,
        submenus: [
          { to: '/dashboard/musyrif', label: 'Workspace Musyrif Asrama' },
          { to: '/dashboard/chat-pegawai', label: 'Chat Pegawai & Orang Tua' },
          { to: '/dashboard/absensi-ibadah', label: 'Presensi Ibadah Santri' },
          { to: '/dashboard/mutabaah', label: 'Mutaba’ah Harian Santri' },
          ...(can('kesiswaan.kelas_rombel', 'academic.schedule.view', 'sistem.master_data')
            ? [{ to: '/dashboard/tahfizh', label: setoranTahfizhMenuLabel }]
            : []),
        ],
      },
    ] : []),
    ...(!isPureMusyrif && !isTeacherOnly && !isGuruUser ? [
      {
        key: 'mutabaah',
        label: 'MUTABA’AH',
        icon: BookHeart,
        submenus: [
          { to: '/dashboard/mutabaah', label: 'Mutaba’ah Yaumiyah' },
          { to: '/dashboard/tahfizh', label: setoranTahfizhMenuLabel },
          { to: '/dashboard/monitoring-tahfizh-ibadah-non-pesantren', label: 'Monitor Siswa Non Ponpes' },
        ],
      },
    ] : []),
    {
      key: 'tahfizh-main',
      label: 'TAHFIZH AL-QUR’AN',
      icon: BookMarked,
      submenus: [
        { to: '/dashboard/tahfizh/rekapan', label: 'Laporan Rekapan Tahfizh' },
        ...(!isTeacherOnly && !isGuruUser && !hasRole('Guru', 'guru', 'Guru Mapel') ? [
          { to: '/dashboard/laporan-tahfizh', label: 'Laporan Tahfizh' },
        ] : []),
        ...(hasRole('Super Admin', 'Admin', 'Guru Tahfizh', 'Kepala Sekolah', 'Divisi Pendidikan') || can('dashboard.guru-tahfizh.view')
          ? [{ to: '/dashboard/guru-tahfizh', label: 'Dashboard Guru Tahfizh' }]
          : []),
      ],
    },
    {
      key: 'laporan',
      label: 'REKAP DATA',
      icon: FileText,
      submenus: [
        { to: '/dashboard/laporan-siswa', label: 'Laporan Siswa' },
        { to: '/dashboard/laporan-absensi', label: 'Laporan Absensi Pembelajaran' },
        { to: '/dashboard/rekap-absensi-gerbang', label: 'Laporan Absensi Gerbang' },
        { to: '/dashboard/rekap-absensi-ibadah', label: 'Laporan Absensi Ibadah' },
        { to: '/dashboard/mutabaah/rekap', label: 'Laporan Mutaba’ah' },
        { to: '/dashboard/tahfizh/rekapan', label: 'Laporan Rekapan Tahfizh' },
        ...(!isTeacherOnly && !isGuruUser && !hasRole('Guru', 'guru', 'Guru Mapel') ? [
          { to: '/dashboard/laporan-tahfizh', label: 'Laporan Tahfizh' },
        ] : []),
        { to: '/dashboard/laporan-akademik', label: 'Laporan Akademik & Nilai' },
        { to: '/dashboard/laporan-pegawai', label: 'Laporan Pegawai & Guru' },
        { to: '/dashboard/laporan-lms', label: 'Laporan LMS' },
        ...(!isTeacherOnly && !isGuruUser && !hasRole('Guru', 'guru', 'Guru Mapel') ? [
          { to: '/dashboard/laporan-alumni', label: 'Laporan Alumni & Prestasi' },
          { to: '/dashboard/kelola-alumni', label: 'Pengolahan Data Alumni' },
        ] : []),
      ],
    },
    {
      key: 'pengaturan',
      label: 'PENGATURAN',
      icon: Settings,
      submenus: [
        { to: '/dashboard/profil-akun', label: 'Profil Saya & Akun' },
        ...(!(isParentRole(roles) || isStudentRole(roles) || isTataUsaha) || hasFullMenuAccess || hasRole('Super Admin', 'Admin', 'Kepala Sekolah') ? [
          { to: '/dashboard/pengaturan', label: 'Profil Sekolah' },
        ] : []),
        ...(hasRole('Super Admin', 'Admin', 'superadmin', 'admin', 'SuperAdmin') || hasFullMenuAccess ? [
          { to: '/dashboard/koneksi-api-mobile', label: 'Koneksi API Mobile Android' },
        ] : []),
        { to: '/dashboard/hak-akses', label: 'Hak Akses' },
      ],
    },
  ]).map((item) => (
    item.submenus
      ? { ...item, submenus: item.submenus.filter((submenu) => !shouldHideFromGuru(item, submenu) && !shouldHideFromTataUsaha(item, submenu) && !shouldHideFromKepalaSekolah(item, submenu) && !shouldHideFromDivisiPendidikan(item, submenu) && !shouldHideFromMusyrif(item, submenu) && bolehBukaMenu(submenu.to)) }
      : item
  )).filter((item) => {
    if (shouldHideFromGuru(item) || shouldHideFromTataUsaha(item) || shouldHideFromKepalaSekolah(item) || shouldHideFromDivisiPendidikan(item) || shouldHideFromMusyrif(item)) return false
    if (
      (isRestrictedFoundationOrPrincipal || ((isParentRole(roles) || isStudentRole(roles)) && !hasFullMenuAccess)) &&
      (item.key === 'portal-guru' || item.key === 'musyrif-asrama')
    ) {
      return false
    }
    return item.submenus ? item.submenus.length > 0 : bolehBukaMenu(item.to)
  })

  const normalizePath = (to) => (to || '').split('?')[0].replace(/\/+$/, '') || '/'

  // Aktif jika path sama persis, ATAU target adalah "leaf" dalam grupnya
  // sehingga tidak ada dua submenu yang menyala bersamaan.
  const isSubActive = (to, siblings = [], sectionKey = null) => {
    const target = normalizePath(to)
    const current = normalizePath(location.pathname)

    if (to && to.includes('?')) {
      const [toPath, toQuery] = to.split('?')
      if (current === normalizePath(toPath)) {
        const currentParams = new URLSearchParams(location.search)
        const targetParams = new URLSearchParams(toQuery)
        const currentTab = currentParams.get('tab') || 'ringkasan'
        const targetTab = targetParams.get('tab')
        if (targetTab) {
          return currentTab === targetTab
        }
      }
      return false
    }

    // Jika route beda dan bukan nested path
    if (current !== target && !current.startsWith(target + '/')) return false

    // Jika sectionKey dipassing dan openSection diset, pastikan leaf hanya aktif di section yang terbuka
    if (sectionKey && openSection && sectionKey !== openSection) {
      // Kecuali jika tidak ada section lain yang match
      const matchingSection = sidebarMenu.find(m => m.key === openSection)
      const matchingSub = matchingSection?.submenus?.some(s => normalizePath(s.to) === current)
      if (matchingSub) return false
    }

    const hasDeeperSibling = siblings.some((sibling) => {
      const sTarget = normalizePath(sibling.to)
      return sTarget !== target && sTarget.startsWith(target + '/')
    })
    if (!hasDeeperSibling && target !== '/dashboard' && (current === target || current.startsWith(target + '/'))) return true
    return current === target
  }

  // Auto-expand grup menu yang berisi route aktif.
  useEffect(() => {
    const current = normalizePath(location.pathname)
    for (const item of sidebarMenu) {
      if (!item.submenus) continue
      if (item.submenus.some((sub) => normalizePath(sub.to) === current || (normalizePath(sub.to) !== '/dashboard' && current.startsWith(normalizePath(sub.to) + '/')))) {
        setOpenSection((prev) => {
          // Jika section sebelumnya sudah memuat route ini, pertahankan
          const prevItem = sidebarMenu.find((m) => m.key === prev)
          if (prevItem && prevItem.submenus && prevItem.submenus.some((sub) => normalizePath(sub.to) === current)) {
            return prev
          }
          return item.key
        })
        return
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isFoundationUser])

  return (
    <div
      className={`site-shell min-h-screen text-slate-800 flex flex-col font-sans antialiased dark:bg-slate-950 dark:text-slate-100 template-${pengaturan.template}`}
      style={{
        '--site-sidebar': pengaturan.sidebar_color || '#0E5C44',
        '--site-accent': pengaturan.sidebar_accent_color || '#3FBF75',
        '--site-body': isDarkMode ? '#0F172A' : '#F7F9FC',
        '--site-header': isDarkMode ? '#0F172A' : '#FFFFFF',
        backgroundColor: isDarkMode ? '#0F172A' : '#F7F9FC',
      }}
    >
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={`flex flex-1 min-h-screen ${pengaturan.sidebar_position === 'right' ? 'md:flex-row-reverse' : ''}`}>
        {/* Left Sidebar (Sticky & Collapsible - Clean White Theme) */}
        <aside
          className={`site-sidebar relative overflow-visible fixed inset-y-0 z-50 flex flex-col justify-between border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1B2433] transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen ${pengaturan.sidebar_position === 'right' ? 'right-0 border-l' : 'left-0 border-r'} ${collapsed ? 'w-20' : 'w-64'
            } ${mobileMenuOpen ? 'translate-x-0 w-64' : pengaturan.sidebar_position === 'right' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{
            background: isDarkMode
              ? (pengaturan.sidebar_style === 'gradient'
                ? 'linear-gradient(180deg, #1B2433 0%, #131B29 50%, #0F172A 100%)'
                : undefined)
              : (pengaturan.sidebar_style === 'light'
                ? '#FFFFFF'
                : (pengaturan.sidebar_style === 'solid'
                  ? (pengaturan.sidebar_color || '#FFFFFF')
                  : `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)`)),
          }}
        >
          {/* Desktop Floating Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex absolute -right-3 top-4 z-30 h-6.5 w-6.5 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 transition-all active:scale-95 cursor-pointer"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          {/* Header Sidebar: Logo & Title */}
          <div className={`relative z-10 ${collapsed ? 'p-3' : 'p-4'} border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#1B2433]/90 backdrop-blur-xs`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-md shadow-emerald-600/20 bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-500/30" style={{ backgroundColor: pengaturan.sidebar_accent_color || '#064E3B' }}>
                  <img src={pengaturan.logo_url || '/logo.png'} alt="Logo Yayasan Darel Iman" className="h-full w-full bg-white object-contain p-0.5" />
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <h1 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase truncate font-sans">
                      {namaSekolah}
                    </h1>
                    <p className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400">{pengaturan.application_name || 'Sistem Manajemen Sekolah'}</p>
                  </div>
                )}
              </div>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden text-slate-600 hover:text-slate-900 dark:text-slate-400 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className={`relative z-10 flex-1 space-y-1.5 ${collapsed ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'} p-3 text-xs`}>
            {sidebarMenu.map((item, idx) => {
              const Icon = item.icon
              if (!item.submenus) {
                const isActive = normalizePath(location.pathname) === normalizePath(item.to)
                return (
                  <div key={item.key} className="relative group">
                    <NavLink
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group/link relative flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl font-bold transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500/40'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 hover:text-emerald-700 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-200/60 dark:hover:border-slate-700'
                        }`}
                    >
                      <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${isActive ? 'bg-white/20 text-white border border-white/30' : getSidebarIconBadgeClass(item.key, idx)}`}>
                        <Icon className="h-4 w-4 stroke-[2]" />
                      </div>
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>

                    {/* Hover Tooltip when Collapsed */}
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-150 z-50">
                        <div className="relative rounded-xl bg-slate-900 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-xl shadow-slate-950/25 border border-slate-700/80 whitespace-nowrap">
                          {item.label}
                          <div className="absolute top-1/2 -left-1 -mt-1 h-2 w-2 rotate-45 bg-slate-900 dark:bg-slate-800 border-l border-b border-slate-700/80" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              const isOpen = openSection === item.key
              const hasActiveChild = isOpen && item.submenus.some((sub) => isSubActive(sub.to, item.submenus, item.key))

              return (
                <div key={item.key} className="relative group space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      toggleSection(item.key)
                    }}
                    className={`flex w-full items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${isOpen || hasActiveChild
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500/40'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 hover:text-emerald-700 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-200/60 dark:hover:border-slate-700'
                      }`}
                  >
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                      <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${isOpen || hasActiveChild ? 'bg-white/20 text-white border border-white/30' : getSidebarIconBadgeClass(item.key, idx)}`}>
                        <Icon className={`h-4 w-4 shrink-0 stroke-[2] ${isOpen || hasActiveChild ? 'text-white' : ''}`} />
                      </div>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-[10px]">
                        {isOpen ? <ChevronDown className={`h-3.5 w-3.5 ${isOpen || hasActiveChild ? 'text-white' : 'text-slate-500'}`} /> : <ChevronRight className={`h-3.5 w-3.5 ${isOpen || hasActiveChild ? 'text-white' : 'text-slate-500'}`} />}
                      </span>
                    )}
                  </button>

                  {/* Hover Flyout Menu when Collapsed */}
                  {collapsed && (
                    <div className="absolute left-full -top-1 pl-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-x-0 -translate-x-2 transition-all duration-150 z-50 min-w-[13.5rem]">
                      <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-2.5 shadow-xl shadow-slate-900/15 border border-slate-200/90 dark:border-slate-800 space-y-1">
                        <div className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 mb-1.5 flex items-center justify-between">
                          <span>{item.label}</span>
                          <span className="text-[9px] text-slate-400 font-normal">Submenu</span>
                        </div>
                        {item.submenus.map((sub, sIdx) => {
                          if (sub.action === 'calendar') {
                            return (
                              <button
                                key={`flyout-${item.key}-cal-${sIdx}`}
                                type="button"
                                onClick={() => {
                                  setMobileMenuOpen(false)
                                  setIsAcademicCalendarOpen(true)
                                }}
                                className="block w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                {sub.label}
                              </button>
                            )
                          }
                          const active = isSubActive(sub.to, item.submenus, item.key)
                          return (
                            <NavLink
                              key={`flyout-${item.key}-${sub.to || sub.label}-${sIdx}`}
                              to={sub.to}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`block rounded-lg px-2.5 py-1.5 text-xs transition-colors ${active
                                ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                              {sub.label}
                            </NavLink>
                          )
                        })}
                        <div className="absolute top-4 -left-1 -mt-1 h-2 w-2 rotate-45 bg-white dark:bg-slate-900 border-l border-b border-slate-200/90 dark:border-slate-800" />
                      </div>
                    </div>
                  )}

                  {/* Submenu Accordion when Expanded */}
                  {!collapsed && isOpen && (
                    <div className="ml-5 space-y-1 border-l-2 border-emerald-500/50 dark:border-emerald-600/50 pl-3 pt-1 animate-[masterDropdownSlide_0.2s_ease-out]">
                      {item.submenus.map((sub, sIdx) => {
                        if (sub.action === 'calendar') {
                          return (
                            <button
                              key={`${item.key}-cal-${sIdx}`}
                              type="button"
                              onClick={() => {
                                setMobileMenuOpen(false)
                                setIsAcademicCalendarOpen(true)
                              }}
                              className="block w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {sub.label}
                            </button>
                          )
                        }
                        const active = isSubActive(sub.to, item.submenus, item.key)
                        return (
                          <NavLink
                            key={`${item.key}-${sub.to || sub.label}-${sIdx}`}
                            to={sub.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 ${active
                              ? 'bg-emerald-50/90 text-emerald-800 font-bold shadow-2xs border border-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/50'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                              }`}
                          >
                            {sub.label}
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User Status Bar & Help Link at Sidebar Bottom */}
          <div className="relative z-10 p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#131B29]/90 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <PersonAvatar
                  src={user?.photo_url || user?.avatar_url || user?.avatar || user?.photo || user?.profile_photo_url}
                  name={namaTampil}
                  size="sm"
                  className="border border-slate-200 dark:border-slate-700 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white leading-tight">{namaTampil}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">• Online</span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <p className="truncate px-2 text-[9px] text-slate-400 dark:text-slate-500">{pengaturan.footer_text || 'Yayasan Darel Iman © 2026'}</p>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/bantuan')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[11px] font-semibold transition border border-slate-200/90 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Bantuan & Panduan</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Workspace Area (Light Gray Background bg-slate-50) */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0F172A]">
          {/* Topbar Header (Clean White bg-white with subtle shadow shadow-sm) */}
          <header
            className={`${pengaturan.header_sticky ? 'sticky top-0' : 'relative'} z-30 flex min-h-[4rem] min-w-0 items-center justify-between overflow-visible border-b border-slate-200/80 px-3 sm:px-4 lg:px-6 gap-3 bg-white dark:bg-slate-900 shadow-sm backdrop-blur-md transition-colors duration-200 dark:border-slate-800/80`}
            style={{
              backgroundColor: isDarkMode
                ? undefined
                : (pengaturan.header_style === 'solid' || (pengaturan.header_color && pengaturan.header_color !== '#FFFFFF')
                  ? pengaturan.header_color
                  : undefined)
            }}
          >
            {/* LEFT CONTROLS: Mobile Menu Toggle, Active Unit Switcher & Field Pencarian (Search Field moved to left near unit) */}
            <div className="flex flex-1 min-w-0 items-center gap-2 sm:gap-3">
              {/* Mobile Menu Toggle */}
              <div className="group relative flex items-center justify-center md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 transition-all shadow-xs"
                  aria-label="Buka Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="pointer-events-none absolute left-0 top-full mt-2.5 hidden group-hover:flex flex-col items-start z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-slate-200 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">
                    Buka Menu Navigasi Samping
                  </div>
                </div>
              </div>

              {/* 1. Active Unit Dropdown Switcher (Soft Pastel Sky Blue) */}
              <div className="relative shrink-0 group" ref={unitDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-sky-200/90 bg-sky-50/80 px-3.5 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100/80 transition-all dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-300 shadow-xs cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400 stroke-[2.2]" />
                  <span className="hidden sm:inline text-sky-600/80 dark:text-sky-400/80 font-medium">Unit:</span>
                  <span className="font-extrabold text-sky-900 dark:text-sky-200 max-w-[100px] xs:max-w-[140px] sm:max-w-none truncate inline-block">{activeUnit || 'Semua Unit'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-sky-500" />
                </button>

                {/* Instant Floating Tooltip */}
                {!unitDropdownOpen && (
                  <div className="pointer-events-none absolute left-0 top-full mt-2.5 hidden group-hover:flex flex-col items-start z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                    <div className="rounded-xl border border-slate-200 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">
                      Pilih unit pendidikan aktif untuk memfilter data
                    </div>
                  </div>
                )}

                {unitDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-[18px] bg-white p-1.5 shadow-2xl border border-slate-200/80 z-50 animate-[masterDropdownSlide_0.2s_ease-out] dark:bg-[#1B2433] dark:border-slate-800">
                    <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Pilih Unit Pendidikan
                    </p>
                    {daftarUnitOptions.map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => {
                          setActiveUnit(unit.id)
                          setUnitDropdownOpen(false)
                        }}
                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          activeUnit === unit.id
                            ? 'bg-sky-100 text-sky-900 font-bold dark:bg-sky-950/80 dark:text-sky-300'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span>{unit.name}</span>
                        {activeUnit === unit.id && <span className="h-2 w-2 rounded-full bg-sky-600 dark:bg-sky-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Field Pencarian (Search Bar - Soft Pastel Emerald Green, Geser ke kiri mendekati unit) */}
              <div className="hidden sm:flex flex-1 min-w-0 max-w-xs items-center group relative">
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="flex w-full items-center gap-2 rounded-2xl border border-emerald-200/90 bg-emerald-50/70 px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-xs transition-all hover:bg-emerald-100/80 hover:border-emerald-300 active:scale-[0.99] dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 focus:outline-none cursor-pointer"
                >
                  <Search className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                  <span className="flex-1 text-left text-xs font-semibold truncate text-emerald-800 dark:text-emerald-300">Cari siswa, guru, modul...</span>
                  <kbd className="shrink-0 hidden lg:inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white/90 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300">
                    Ctrl + K
                  </kbd>
                </button>

                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute left-0 top-full mt-2.5 hidden group-hover:flex flex-col items-start z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-slate-200 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">
                    Pencarian cepat siswa, guru, kelas, modul & fitur (Ctrl + K)
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTROLS: Tanggal (geser dekat notifikasi), Akses Role (Super Admin/Admin only, samping notifikasi), Notification Bell, Cache Reset, Dark Mode, Profile Avatar */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* 3. Tanggal Hari Ini & Button Kalender Akademik (Soft Pastel Cyan/Teal, posisi dekat button notifikasi) */}
              <div className="group relative hidden lg:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAcademicCalendarOpen(true)}
                  className="shrink-0 flex items-center gap-1.5 rounded-2xl border border-cyan-200/90 bg-cyan-50/80 px-3 py-2 shadow-xs transition hover:scale-[1.02] hover:bg-cyan-100/90 active:scale-[0.98] dark:border-cyan-800/80 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4 text-cyan-600 dark:text-cyan-400 stroke-[2.2]" />
                  <span className="text-xs font-extrabold text-cyan-900 dark:text-cyan-200 whitespace-nowrap">{tanggalTampil}</span>
                  <span className="ml-1 inline-flex items-center rounded-lg bg-cyan-200/70 px-1.5 py-0.5 text-[10px] font-black text-cyan-900 dark:bg-cyan-900 dark:text-cyan-200">
                    Kalender
                  </span>
                </button>
                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-slate-200 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">
                    Klik untuk membuka Kalender Akademik & Pengaturan Libur/Sekolah
                  </div>
                </div>
              </div>

              {/* 4. Dropdown Akses Role (HANYA muncul jika Super Admin / Admin, terletak tepat di samping button notifikasi) */}
              {hasFullMenuAccess && (
                <div className="relative shrink-0 group hidden sm:flex" ref={roleAccessRef}>
                  <button
                    type="button"
                    onClick={() => setRoleAccessOpen(!roleAccessOpen)}
                    className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-extrabold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xs focus:outline-none cursor-pointer ${
                      roleAccessOpen
                        ? 'border-purple-300 bg-purple-100 text-purple-900 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-200'
                        : 'border-purple-200/90 bg-purple-50/80 text-purple-900 hover:bg-purple-100/80 dark:border-purple-800/80 dark:bg-purple-950/60 dark:text-purple-300'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400 stroke-[2.2]" />
                    <span className="hidden xl:inline">Akses Role</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform text-purple-500 ${roleAccessOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Instant Floating Tooltip */}
                  {!roleAccessOpen && (
                    <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                      <div className="rounded-xl border border-slate-200 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">
                        Beralih akun sebagai role pengguna lain (Super Admin / Admin)
                      </div>
                    </div>
                  )}

                  {roleAccessOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-[18px] bg-white p-1.5 shadow-2xl border border-slate-200/80 z-50 animate-[masterDropdownSlide_0.2s_ease-out] dark:bg-[#1B2433] dark:border-slate-800">
                      <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Akses Sebagai Role
                      </p>
                      {roleAccessOptions.map((option) => (
                        <button
                          key={option.role}
                          type="button"
                          disabled={!!roleAccessLoading}
                          onClick={() => accessAsRole(option)}
                          className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 dark:text-slate-200 dark:hover:bg-purple-950/50 transition-colors disabled:opacity-50"
                        >
                          <span>{option.label}</span>
                          {roleAccessLoading === option.role && (
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Notification Center Bell Icon (Soft Pastel Light Indigo/Blue) */}
              <div className="group relative">
                <NotificationCenter
                  bellClassName="border border-indigo-200/90 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/90 dark:border-indigo-800/80 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs transition hover:scale-[1.03]"
                />
                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-slate-200 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">
                    Pusat notifikasi & pemberitahuan sistem
                  </div>
                </div>
              </div>

              {/* 6. Cache Reset Button (Soft Pastel Amber/Orange) */}
              <div className="group relative hidden sm:flex">
                <button
                  type="button"
                  onClick={handleResetCache}
                  disabled={isResettingCache}
                  aria-label="Atur ulang cache aplikasi"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200/90 bg-amber-50/80 text-amber-800 shadow-xs transition-all hover:bg-amber-100/90 hover:scale-[1.03] active:scale-[0.97] dark:border-amber-800/80 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-4.5 w-4.5 stroke-[2] text-amber-600 dark:text-amber-400 ${isResettingCache ? 'animate-spin' : ''}`} />
                </button>
                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-slate-200 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">
                    Atur ulang cache sistem & bersihkan data sementara
                  </div>
                </div>
              </div>

              {/* 7. Light / Dark Mode Button (Soft Pastel Fuchsia/Pink) */}
              <div className="group relative hidden sm:flex">
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  aria-label="Toggle mode tampilan"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-200/90 bg-fuchsia-50/80 text-fuchsia-800 shadow-xs transition-all hover:bg-fuchsia-100/90 hover:scale-[1.03] active:scale-[0.97] dark:border-fuchsia-800/80 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:hover:bg-fuchsia-900/60 focus:outline-none cursor-pointer"
                >
                  {isDarkMode ? <Sun className="h-4.5 w-4.5 stroke-[2] text-amber-500" /> : <Moon className="h-4.5 w-4.5 stroke-[2] text-fuchsia-600 dark:text-fuchsia-400" />}
                </button>
                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-slate-200 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">
                    {isDarkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                  </div>
                </div>
              </div>

              {/* 8. User Profile Avatar Squircle Trigger (Soft Pastel Rose/Coral Border) */}
              <div className="relative group" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl overflow-hidden border border-rose-200/90 bg-rose-50/80 shadow-xs hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer dark:border-rose-800/80 focus:outline-none"
                  aria-label="Menu profil user"
                >
                  <PersonAvatar
                    src={user?.photo_url || user?.avatar_url || user?.avatar || user?.photo || user?.profile_photo_url}
                    name={namaTampil}
                    size="table"
                    shape="square"
                    alt={`Foto profil ${namaTampil}`}
                    className="h-full w-full object-cover border-0 rounded-2xl"
                  />
                </button>

                {/* Instant Floating Tooltip */}
                {!profileDropdownOpen && (
                  <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                    <div className="rounded-xl border border-slate-200 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-slate-700 dark:bg-slate-800">
                      Menu profil & akun pengguna ({namaTampil})
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                      className="absolute right-0 top-full mt-3 w-72 sm:w-80 rounded-3xl bg-white dark:bg-[#1B2433] p-5 shadow-2xl border border-slate-100 dark:border-slate-800 z-50"
                    >
                      {/* Profile Header (Matching Image 3) */}
                      <div className="flex items-center gap-3.5">
                        <PersonAvatar
                          src={user?.photo_url || user?.avatar_url || user?.avatar || user?.photo || user?.profile_photo_url}
                          name={namaTampil}
                          size="card"
                          shape="square"
                          alt={`Foto profil ${namaTampil}`}
                          className="h-14 w-14 rounded-2xl object-cover border border-slate-100 dark:border-slate-700 shadow-xs"
                        />
                        <div className="min-w-0">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">{namaTampil}</h4>
                          <p className="text-xs font-medium text-slate-400 dark:text-slate-400 truncate mt-0.5">{user?.email || 'murphy.mitc@example.com'}</p>
                        </div>
                      </div>

                      <hr className="my-3.5 border-slate-100 dark:border-slate-800" />

                      {/* Menu Items (Matching Image 3) */}
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            if (isPureStudent) navigate('/portal-siswa/profil')
                            else if (isPureParent) navigate('/portal-orangtua?tab=profile')
                            else if (isFoundationUser) navigate('/dashboard/yayasan/profil')
                            else navigate('/dashboard/profil-akun')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300 stroke-[1.8]" />
                          <span>Pengaturan Akun</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsDarkMode(!isDarkMode)
                          }}
                          className="w-full sm:hidden flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          {isDarkMode ? <Sun className="h-5 w-5 text-amber-500 stroke-[1.8]" /> : <Moon className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400 stroke-[1.8]" />}
                          <span>Mode {isDarkMode ? 'Terang' : 'Gelap'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            handleResetCache()
                          }}
                          className="w-full sm:hidden flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400 stroke-[1.8]" />
                          <span>Atur Ulang Cache</span>
                        </button>

                        {!isDivisiPendidikan && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false)
                              navigate('/dashboard/students/unit-pendidikan')
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                          >
                            <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-300 stroke-[1.8]" />
                            <span>Unit Pendidikan</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            navigate('/dashboard/bantuan')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <HelpCircle className="h-5 w-5 text-slate-600 dark:text-slate-300 stroke-[1.8]" />
                          <span>Bantuan {'&'} Panduan</span>
                        </button>
                      </div>

                      <hr className="my-3.5 border-slate-100 dark:border-slate-800" />

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold text-slate-700 hover:text-rose-600 dark:text-slate-200 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-5 w-5 text-slate-600 dark:text-slate-300 stroke-[1.8]" />
                        <span>Keluar</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Main Page Workspace Container (Light Gray bg-slate-50) */}
          <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-3.5 sm:px-5 sm:py-5 lg:p-6 space-y-4 sm:space-y-6 max-w-none lg:max-w-7xl w-full mx-auto pb-24 lg:pb-10">
            {impersonating && !hasFullMenuAccess && (
              <div className="auth-impersonating-banner flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100">
                <div>
                  <p className="text-xs font-extrabold">Mode akses role aktif: {roleTampil}</p>
                  <p className="mt-0.5 text-[11px] opacity-75">Anda sedang melihat sistem sebagai {namaTampil}.</p>
                </div>
                <button
                  type="button"
                  onClick={returnToSuperAdmin}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-800 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Kembali ke Dashboard Utama
                </button>
              </div>
            )}
            {!location.pathname.includes('/portal-guru') && <ActiveScheduleNotice />}
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Responsive Mobile View <= 768px / md:hidden) */}
      <AppBottomNavigation
        items={[
          { to: defaultPortal, label: 'Beranda', icon: LayoutDashboard, end: true },
          ...(canViewStudents && !isPureStudent && !isPureParent
            ? [{
              to: '/dashboard/students',
              label: 'Data Siswa',
              icon: Database,
            }]
            : []),
          {
            to: isPureStudent
              ? '/portal-siswa/profil'
              : isPureParent
                ? '/portal-orangtua?tab=profile'
                : isFoundationUser
                  ? '/dashboard/yayasan/profil'
                  : '/dashboard/profil-akun',
            label: 'Profil',
            icon: User,
          },
        ]}
        actionCenter={(isPureStudent && can('student.assignment.view')) || (isPureParent && can('parent.attendance.view')) || canCreateStudent ? {
          icon: Plus,
          ariaLabel: 'Aksi Cepat',
          onClick: () => navigate(isPureStudent ? '/portal-siswa/tugas' : isPureParent ? '/portal-orangtua?tab=attendance' : '/dashboard/students?action=add'),
        } : null}
        onOpenNotifications={() => {
          if (isPureStudent) navigate('/portal-siswa/informasi-sekolah')
          else if (isPureParent) navigate('/portal-orangtua?tab=announcements')
          else window.dispatchEvent(new Event('open-notification-center'))
        }}
      />

      {/* Floating Action Button (FAB) for Mobile Quick Add */}
      {!isPureStudent && !isPureParent && canCreateStudent && <FAB onClick={() => navigate('/dashboard/students?action=add')} label="Tambah Siswa" />}

      {/* Floating Chat Pop-Up & Melayang Button */}
      <FloatingChatWidget />
      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
      <AcademicCalendarModal
        isOpen={isAcademicCalendarOpen}
        onClose={() => setIsAcademicCalendarOpen(false)}
      />
      <PwaInstallBanner />
      <AuthPopup />
      <AuthToast />
    </div>
  )
}
