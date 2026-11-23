import { useState, useRef, useEffect, useMemo, Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  Download,
  AlertTriangle,
  Award,
  BookOpenCheck,
  ClipboardList,
  FileCheck2,
  HeartHandshake,
  Megaphone,
  MessageCircle,
  Receipt,
  UserRound,
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
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
import { canSwitchEducationUnit, isMusyrifRole, isParentRole, isStudentRole, isTeacherRole, isTuOrKepsek, resolveDefaultPortal, getUserRoleLevel, ROLE_LEVELS } from '../auth/portalResolver'
import AuthToast, { showAuthToast } from '../components/ui/AuthToast'
import AuthPopup from '../components/ui/AuthPopup'
import AcademicCalendarModal from '../components/calendar/AcademicCalendarModal'
import PwaInstallBanner from '../components/app/PwaInstallBanner'
import { useNavigationModules, resolveSidebarIcon } from '../hooks/useNavigation'
import { prefetchRoute } from '../routes/routePrefetch'

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setSession = useAuthStore((state) => state.setSession)
  const touchActivity = useAuthStore((state) => state.touchActivity)
  const isSessionValid = useAuthStore((state) => state.isSessionValid)
  const loginTime = useAuthStore((state) => state.loginTime)
  const { data: navData, isLoading: isNavLoading, isError: isNavError, refetch: refetchNav } = useNavigationModules()
  const activeUnit = useUnitStore((state) => state.activeUnit)
  const setActiveUnit = useUnitStore((state) => state.setActiveUnit)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const muatPengaturan = usePengaturanStore((state) => state.muatPengaturan)
  const namaSekolah = pengaturan?.school_name || 'Yayasan Pendidikan Islam'
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const permissions = Array.isArray(user?.permissions) ? user.permissions : []
  const userLevel = getUserRoleLevel(user)
  const accessPolicy = user?.access_policy || null
  const portalGroup = accessPolicy?.portal_group || null
  const hasRole = (...names) => names.some((name) => roles.some((role) => String(role).toLowerCase().replace(/[\s_-]+/g, '') === String(name).toLowerCase().replace(/[\s_-]+/g, '')))
  const hasFullMenuAccess = portalGroup === 'super_admin' || portalGroup === 'admin' || userLevel === ROLE_LEVELS.ADMIN_SISTEM || hasRole('Super Admin', 'Admin') // Level 1
  const can = (...names) => hasFullMenuAccess || names.some((name) => permissions.includes(name))
  const isTataUsaha = portalGroup ? (portalGroup === 'tu' || portalGroup === 'operator') : (userLevel === ROLE_LEVELS.OPERATOR || hasRole('Tata Usaha', 'TU', 'tu', 'tata_usaha')) // Level 3
  const isKepalaSekolah = portalGroup ? portalGroup === 'principal' : (userLevel === ROLE_LEVELS.KEPALA_SEKOLAH || hasRole('Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek')) // Level 4
  const isDivisiPendidikan = portalGroup ? portalGroup === 'education' : (userLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN || hasRole('Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan', 'Pengawasan Akademik')) // Level 4
  const isPureMusyrif = portalGroup ? portalGroup === 'musyrif' : ((userLevel === ROLE_LEVELS.MUSYRIF || isMusyrifRole(roles)) && userLevel > ROLE_LEVELS.GURU)
  const isMusyrifUser = portalGroup ? portalGroup === 'musyrif' : (userLevel === ROLE_LEVELS.MUSYRIF || isMusyrifRole(roles) || isPureMusyrif || hasRole('Musyrif', 'Musyrifah', 'musyrif', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing')) // Level 6
  const isGuruTahfizhScope = hasRole('Guru Tahfizh', 'guru_tahfizh', 'Musyrif', 'musyrif', 'Musyrifah', 'musyrifah', 'Musyrif / Musyrifah')
  const isStaffOrTeacherUser = portalGroup
    ? !['parent', 'student', 'alumni'].includes(portalGroup)
    : (userLevel <= ROLE_LEVELS.MUSYRIF || hasFullMenuAccess || isTeacherRole(roles) || isTuOrKepsek(roles) || isDivisiPendidikan || isMusyrifUser) // Level 1 s/d 6 (Staf Internal)
  const isTeacherOnly = portalGroup ? portalGroup === 'teacher' : (userLevel === ROLE_LEVELS.GURU || (
    isTeacherRole(roles) &&
    !hasFullMenuAccess &&
    !hasRole(
      'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'pengurus_yayasan',
      'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
      'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan',
      'Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator'
    )
  ))
  const isGuruUser = portalGroup ? portalGroup === 'teacher' : (userLevel === ROLE_LEVELS.GURU || (
    !hasFullMenuAccess &&
    (isTeacherOnly || isTeacherRole(roles) || hasRole('Guru', 'guru', 'Guru Mata Pelajaran', 'Guru Tahfizh', 'Guru BK', 'Wali Kelas')) &&
    !hasRole(
      'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'pengurus_yayasan',
      'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
      'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan',
      'Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator'
    )
  ))
  const isPureStudent = portalGroup ? portalGroup === 'student' : (userLevel === ROLE_LEVELS.SISWA || (isStudentRole(roles) && !isStaffOrTeacherUser)) // Level 8
  const isPureParent = portalGroup ? portalGroup === 'parent' : (userLevel === ROLE_LEVELS.ORANG_TUA || (isParentRole(roles) && !isStaffOrTeacherUser)) // Level 7
  const canViewEducationUnits = can('unit.view', 'unit.view_all', 'foundation.unit.view', 'sistem.master_data')
  const canSwitchUnits = canSwitchEducationUnit(user) && canViewEducationUnits
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

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])
  const [openSection, setOpenSection] = useState('master-data')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [roleAccessOpen, setRoleAccessOpen] = useState(false)
  const [roleAccessLoading, setRoleAccessLoading] = useState('')
  const [impersonating, setImpersonating] = useState(() => Boolean(localStorage.getItem('school_erp_superadmin_session')))

  // Hapus sesi impersonasi yang tertinggal jika pengguna saat ini kembali ke dashboard sebagai Super Admin asli
  useEffect(() => {
    if (hasFullMenuAccess && localStorage.getItem('school_erp_superadmin_session')) {
      try {
        const savedSession = JSON.parse(localStorage.getItem('school_erp_superadmin_session') || '{}')
        if (savedSession?.user?.id && user?.id === savedSession.user.id) {
          localStorage.removeItem('school_erp_superadmin_session')
          setImpersonating(false)
        }
      } catch {
        localStorage.removeItem('school_erp_superadmin_session')
        setImpersonating(false)
      }
    }
  }, [hasFullMenuAccess, user?.id])
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [showPwaModal, setShowPwaModal] = useState(false)
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

  const { data: rawUnitsData } = useQuery({
    queryKey: ['educationUnits'],
    queryFn: () => educationUnitService.getAll(),
    enabled: Boolean(canViewEducationUnits),
    staleTime: 1000 * 60 * 15,
  })

  const dbUnits = useMemo(() => {
    if (!canViewEducationUnits) return []
    const list = rawUnitsData?.data || rawUnitsData || []
    if (Array.isArray(list) && list.length > 0) {
      return list.map((u) => ({ id: u.code || u.level || u.id, name: u.name || u.nama }))
    }
    return []
  }, [rawUnitsData, canViewEducationUnits])

  const [serverNow, setServerNow] = useState(null)
  const [isAcademicCalendarOpen, setIsAcademicCalendarOpen] = useState(false)

  const muatPengaturanRef = muatPengaturan

  useEffect(() => {
    muatPengaturanRef()
  }, [muatPengaturanRef])

  useEffect(() => {
    document.title = (pengaturan.application_name && !pengaturan.application_name.includes('Sistem Manajemen Sekolah')) ? pengaturan.application_name : 'Dareliman Edu - Yayasan Dar El-Iman'
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

  const namaTampil = user?.name || 'Pengguna'
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
    { label: 'Admin Sistem', role: 'Admin' },
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
      const savedSuperAdminSession = JSON.parse(localStorage.getItem('school_erp_superadmin_session') || 'null')
      const superAdminToken = savedSuperAdminSession?.token || localStorage.getItem('school_erp_token')
      const superAdminUser = savedSuperAdminSession?.user || user

      const currentSession = {
        token: superAdminToken,
        user: superAdminUser,
        targetRoleLabel: option.label,
      }
      const result = await authService.impersonate(option.role, superAdminToken)
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
    ...dbUnits,
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

  const isFoundationUser =
    !hasFullMenuAccess &&
    (hasRole('Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan') ||
      can('foundation.dashboard.view'))



  /**
   * Filter presentasional tingkat UI/UX untuk konteks unit sekolah.
   * Hak akses dan otorisasi menu utama sepenuhnya ditentukan oleh backend (NavigationService).
   */
  const shouldHideSubmenu = (mod, sub) => {
    const to = sub?.to || sub?.path || ''

    // 0. Sembunyikan seluruh modul dan menu Pengaturan untuk role Kepala Sekolah
    if (
      isKepalaSekolah &&
      (mod?.id === 'pengaturan' ||
        to === '/dashboard/pengaturan' ||
        to.startsWith('/dashboard/pengaturan') ||
        to === '/dashboard/master-opsi-bisnis' ||
        to === '/dashboard/koneksi-api-mobile' ||
        sub?.id?.startsWith('pengaturan') ||
        sub?.id?.startsWith('set-') ||
        sub?.id === 'master-opsi-bisnis')
    ) {
      return true
    }

    // 1. Kontekstual Asrama vs Non-Pesantren (Presentational Filter)
    // Unit non-pesantren tidak memiliki asrama/ibadah santri, sehingga tautan ibadah santri asrama disembunyikan
    if (!isPesantrenUnit && !hasFullMenuAccess && (to === '/dashboard/absensi-ibadah' || to.startsWith('/dashboard/absensi-ibadah/')) && !to.startsWith('/dashboard/absensi-ibadah-siswa')) {
      return true
    }

    // 2. Sembunyikan Jadwal Pelajaran & Jadwal Ujian Master untuk role Guru
    // Guru hanya mengakses dan mencetak jadwal di Portal Guru (/portal-guru/workspace?tab=jadwal)
    if (
      isGuruUser &&
      (to === '/dashboard/akademik/jadwal' ||
        to.startsWith('/dashboard/akademik/jadwal') ||
        to === '/dashboard/jadwal-pelajaran' ||
        to.startsWith('/dashboard/jadwal-pelajaran') ||
        to === '/dashboard/jadwal-ujian' ||
        to.startsWith('/dashboard/jadwal-ujian') ||
        to === '/dashboard/akademik/jadwal-ujian' ||
        to.startsWith('/dashboard/akademik/jadwal-ujian'))
    ) {
      return true
    }

    // 3. Sembunyikan Presensi Gerbang & Scanner Gerbang untuk role Guru
    if (
      isGuruUser &&
      (to === '/dashboard/rekap-absensi-gerbang' ||
        to.startsWith('/dashboard/rekap-absensi-gerbang') ||
        to === '/dashboard/absensi-gerbang' ||
        to.startsWith('/dashboard/absensi-gerbang') ||
        to === '/absensi-gerbang' ||
        sub?.id === 'presensi-gerbang' ||
        sub?.id === 'presensi-device')
    ) {
      return true
    }

    // 4. Sembunyikan Master Modul Ajar, Materi Belajar, Forum Diskusi, Penugasan & Penilaian untuk role Guru
    // Guru memusatkan operasional KBM di Portal Guru (/portal-guru/workspace)
    // Sedangkan Kisi-kisi Ujian, Bank Soal, dan CBT Ujian tetap dapat diakses guru untuk instrumen ujian semester
    if (
      isGuruUser &&
      (to === '/dashboard/lms/modul-ajar' ||
        to.startsWith('/dashboard/lms/modul-ajar') ||
        to === '/dashboard/master-modul-semester' ||
        to.startsWith('/dashboard/master-modul-semester') ||
        to === '/dashboard/lms/materi' ||
        to.startsWith('/dashboard/lms/materi') ||
        to === '/dashboard/lms/materi-pembelajaran' ||
        to.startsWith('/dashboard/lms/materi-pembelajaran') ||
        to === '/dashboard/materi-pembelajaran' ||
        to.startsWith('/dashboard/materi-pembelajaran') ||
        to === '/dashboard/lms/diskusi' ||
        to.startsWith('/dashboard/lms/diskusi') ||
        to === '/dashboard/lms/diskusi-kelas' ||
        to.startsWith('/dashboard/lms/diskusi-kelas') ||
        to === '/dashboard/diskusi-kelas' ||
        to.startsWith('/dashboard/diskusi-kelas') ||
        to === '/dashboard/lms/penugasan' ||
        to.startsWith('/dashboard/lms/penugasan') ||
        to === '/dashboard/penugasan' ||
        to.startsWith('/dashboard/penugasan') ||
        to === '/dashboard/lms/pengumpulan-tugas' ||
        to.startsWith('/dashboard/lms/pengumpulan-tugas') ||
        to === '/dashboard/pengumpulan-tugas' ||
        to.startsWith('/dashboard/pengumpulan-tugas') ||
        to === '/dashboard/lms/penilaian' ||
        to.startsWith('/dashboard/lms/penilaian') ||
        to === '/dashboard/penilaian' ||
        to.startsWith('/dashboard/penilaian') ||
        to === '/dashboard/lms/penilaian-rapor' ||
        to.startsWith('/dashboard/lms/penilaian-rapor') ||
        to === '/dashboard/lms/rapor' ||
        to.startsWith('/dashboard/lms/rapor') ||
        to === '/dashboard/lms/presensi-pembelajaran' ||
        to.startsWith('/dashboard/lms/presensi-pembelajaran') ||
        to === '/dashboard/presensi-pembelajaran' ||
        to.startsWith('/dashboard/presensi-pembelajaran') ||
        sub?.id === 'lms-modul-ajar' ||
        sub?.id === 'lms-materi' ||
        sub?.id === 'lms-diskusi' ||
        sub?.id === 'lms-penugasan' ||
        sub?.id === 'lms-pengumpulan-tugas' ||
        sub?.id === 'lms-penilaian' ||
        sub?.id === 'lms-rapor' ||
        sub?.id === 'lms-penilaian-rapor')
    ) {
      return true
    }

    // 5. Sembunyikan Mutabaah Master & Rekap Dashboard (/dashboard/mutabaah, /mutabaah) untuk role Orang Tua dan Siswa
    // Orang Tua menggunakan /portal-orangtua (tab mutabaah) dan Siswa menggunakan /portal-siswa
    if (
      (isPureParent || isPureStudent) &&
      (to === '/mutabaah' ||
        to.startsWith('/mutabaah') ||
        to === '/dashboard/mutabaah' ||
        to.startsWith('/dashboard/mutabaah') ||
        sub?.id === 'mutabaah-harian' ||
        sub?.id === 'mutabaah-dashboard' ||
        sub?.id === 'mutabaah-rekap' ||
        sub?.id === 'mutabaah-agenda')
    ) {
      return true
    }

    // 6. Sembunyikan Master LMS institusi (/dashboard/lms/*, kisi-kisi, bank soal, cbt ujian, penugasan, dll) untuk role Orang Tua dan Siswa
    // Orang Tua mengakses kisi-kisi, ujian, tugas, materi via /portal-orangtua, dan Siswa via /portal-siswa
    if (
      (isPureParent || isPureStudent) &&
      (to.startsWith('/dashboard/lms') ||
        to.startsWith('/lms') ||
        to === '/dashboard/kisi-kisi-ujian' ||
        to === '/dashboard/bank-soal' ||
        to === '/dashboard/ujian-online' ||
        to === '/dashboard/master-modul-semester' ||
        to === '/dashboard/materi-pembelajaran' ||
        to === '/dashboard/diskusi-kelas' ||
        to === '/dashboard/penugasan' ||
        to === '/dashboard/pengumpulan-tugas' ||
        to === '/dashboard/penilaian' ||
        to === '/dashboard/jadwal-ujian' ||
        sub?.id?.startsWith('lms-'))
    ) {
      return true
    }

    return false
  }

  const sidebarIconStyles = {
    'dashboard': 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'dashboard-yayasan': 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'dashboard-yayasan-menu': 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'master-data': 'bg-purple-100/90 text-purple-600 dark:bg-purple-950/70 dark:text-purple-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'akademik': 'bg-sky-100/90 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'lms': 'bg-indigo-100/90 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'portal-guru': 'bg-indigo-100/90 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'portal-ortu-siswa': 'bg-rose-100/90 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'portal-utama': 'bg-sky-100/90 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'portal-akademik': 'bg-violet-100/90 text-violet-600 dark:bg-violet-950/70 dark:text-violet-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'portal-ujian': 'bg-lime-100/90 text-lime-700 dark:bg-lime-950/70 dark:text-lime-300 border border-lime-200/70 dark:border-lime-800/60 shadow-2xs',
    'portal-tahfizh': 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'portal-kehadiran': 'bg-orange-100/90 text-orange-600 dark:bg-orange-950/70 dark:text-orange-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs',
    'absensi': 'bg-teal-100/90 text-teal-600 dark:bg-teal-950/70 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'presensi': 'bg-teal-100/90 text-teal-600 dark:bg-teal-950/70 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'musyrif-asrama': 'bg-violet-100/90 text-violet-600 dark:bg-violet-950/70 dark:text-violet-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'mutabaah': 'bg-amber-100/90 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'tahfizh': 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'rekap-data': 'bg-fuchsia-100/90 text-fuchsia-600 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border border-fuchsia-200/70 dark:border-fuchsia-800/60 shadow-2xs',
    'laporan': 'bg-fuchsia-100/90 text-fuchsia-600 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border border-fuchsia-200/70 dark:border-fuchsia-800/60 shadow-2xs',
    'pengaturan': 'bg-slate-100/90 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 shadow-2xs',
    'yayasan-monitoring': 'bg-sky-100/90 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'yayasan-laporan': 'bg-fuchsia-100/90 text-fuchsia-600 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border border-fuchsia-200/70 dark:border-fuchsia-800/60 shadow-2xs',
    'yayasan-pengaturan': 'bg-slate-100/90 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 shadow-2xs',
  }

  const pastelPaletteCycle = [
    'bg-sky-100/90 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'bg-purple-100/90 text-purple-600 dark:bg-purple-950/70 dark:text-purple-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'bg-amber-100/90 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'bg-fuchsia-100/90 text-fuchsia-600 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border border-fuchsia-200/70 dark:border-fuchsia-800/60 shadow-2xs',
    'bg-rose-100/90 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
  ]

  const getSidebarIconBadgeClass = (key, idx) => {
    return sidebarIconStyles[key] || pastelPaletteCycle[idx % pastelPaletteCycle.length]
  }

  const SUBMENU_ICON_STYLES = {
    ringkasan: 'bg-sky-100/90 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    profile: 'bg-blue-100/90 text-blue-600 dark:bg-blue-950/70 dark:text-blue-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    calendar: 'bg-cyan-100/90 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    announcements: 'bg-indigo-100/90 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    schedules: 'bg-violet-100/90 text-violet-600 dark:bg-violet-950/70 dark:text-violet-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    materials: 'bg-purple-100/90 text-purple-600 dark:bg-purple-950/70 dark:text-purple-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    assignments: 'bg-fuchsia-100/90 text-fuchsia-600 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border border-emerald-200/80 dark:border-fuchsia-800/60 shadow-2xs',
    tahfizh: 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    grades: 'bg-teal-100/90 text-teal-600 dark:bg-teal-950/70 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    'student-notes': 'bg-cyan-100/90 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    bills: 'bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    mutabaah: 'bg-amber-100/90 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    attendance: 'bg-orange-100/90 text-orange-600 dark:bg-orange-950/70 dark:text-orange-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    kisi: 'bg-yellow-100/90 text-yellow-700 dark:bg-yellow-950/70 dark:text-yellow-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    ujian: 'bg-lime-100/90 text-lime-700 dark:bg-lime-950/70 dark:text-lime-300 border border-emerald-200/80 dark:border-lime-800/60 shadow-2xs',
    hasil: 'bg-rose-100/90 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    chat: 'bg-pink-100/90 text-pink-600 dark:bg-pink-950/70 dark:text-pink-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    quran: 'bg-teal-100/90 text-teal-600 dark:bg-teal-950/70 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    doa: 'bg-amber-100/90 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
  }

  const getSubmenuIconBadgeClass = (sub, sIdx) => {
    if (sub?.colorClass) return sub.colorClass
    if (sub?.to) {
      const rawTo = sub.to.toLowerCase()
      if (rawTo.includes('tab=ringkasan') || rawTo.endsWith('/portal-siswa')) return SUBMENU_ICON_STYLES.ringkasan
      if (rawTo.includes('tab=profile') || rawTo.includes('/profil')) return SUBMENU_ICON_STYLES.profile
      if (rawTo.includes('tab=calendar') || rawTo.includes('/kalender')) return SUBMENU_ICON_STYLES.calendar
      if (rawTo.includes('tab=announcements') || rawTo.includes('/informasi-sekolah')) return SUBMENU_ICON_STYLES.announcements
      if (rawTo.includes('tab=schedules') || rawTo.includes('/jadwal')) return SUBMENU_ICON_STYLES.schedules
      if (rawTo.includes('tab=materials') || rawTo.includes('/materi')) return SUBMENU_ICON_STYLES.materials
      if (rawTo.includes('tab=assignments') || rawTo.includes('/tugas')) return SUBMENU_ICON_STYLES.assignments
      if (rawTo.includes('tab=tahfizh') || rawTo.includes('/tahfizh')) return SUBMENU_ICON_STYLES.tahfizh
      if (rawTo.includes('tab=grades') || rawTo.includes('/nilai')) return SUBMENU_ICON_STYLES.grades
      if (rawTo.includes('tab=student-notes') || rawTo.includes('/komentar-guru')) return SUBMENU_ICON_STYLES['student-notes']
      if (rawTo.includes('tab=bills')) return SUBMENU_ICON_STYLES.bills
      if (rawTo.includes('tab=mutabaah') || rawTo.includes('/mutabaah')) return SUBMENU_ICON_STYLES.mutabaah
      if (rawTo.includes('tab=attendance') || rawTo.includes('/absensi')) return SUBMENU_ICON_STYLES.attendance
      if (rawTo.includes('tab=kisi') || rawTo.includes('/kisi-kisi')) return SUBMENU_ICON_STYLES.kisi
      if (rawTo.includes('tab=ujian') || rawTo.includes('/ujian-cbt')) return SUBMENU_ICON_STYLES.ujian
      if (rawTo.includes('tab=hasil') || rawTo.includes('/hasil')) return SUBMENU_ICON_STYLES.hasil
      if (rawTo.includes('tab=chat')) return SUBMENU_ICON_STYLES.chat
      if (rawTo.includes('/quran')) return SUBMENU_ICON_STYLES.quran
      if (rawTo.includes('/doa')) return SUBMENU_ICON_STYLES.doa
    }
    return pastelPaletteCycle[sIdx % pastelPaletteCycle.length]
  }

  const normalizePath = (to) => (to || '').split('?')[0].replace(/\/+$/, '') || '/'

  const dynamicSidebarMenu = useMemo(() => {
    const dbModules = Array.isArray(navData?.modules) ? navData.modules : []
    const currentChild = isPureParent
      ? new URLSearchParams(location.search).get('child')
      : null
    const childSuffix = currentChild ? `child=${encodeURIComponent(currentChild)}` : ''
    const hasDbPortalOrtu = dbModules.some(
      (m) =>
        String(m.id || '').startsWith('portal-ortu') ||
        (m.items || []).some((it) => String(it.path || '').startsWith('/portal-orangtua'))
    )
    const hasDbPortalSiswa = dbModules.some(
      (m) =>
        String(m.id || '').startsWith('portal-siswa') ||
        (m.items || []).some((it) => String(it.path || '').startsWith('/portal-siswa'))
    )

    // 1. Fallback Sidebar Role Orang Tua apabila modul portal-ortu belum tersedia di DB
    if (isPureParent && !hasDbPortalOrtu) {
      const fallbackSuffix = currentChild ? `&child=${currentChild}` : ''
      const pUrl = (tab) => `/portal-orangtua?tab=${tab}${fallbackSuffix}`

      return [
        {
          key: 'portal-utama',
          label: 'PORTAL WALI MURID',
          icon: Users,
          submenus: [
            { to: pUrl('ringkasan'), label: 'Dashboard Ringkasan', icon: Sparkles, colorClass: SUBMENU_ICON_STYLES.ringkasan },
            { to: pUrl('profile'), label: 'Profil & Biodata', icon: UserRound, colorClass: SUBMENU_ICON_STYLES.profile },
            { to: pUrl('announcements'), label: 'Informasi Sekolah', icon: Megaphone, colorClass: SUBMENU_ICON_STYLES.announcements },
            { to: pUrl('calendar'), label: 'Kalender Akademik', icon: CalendarDays, colorClass: SUBMENU_ICON_STYLES.calendar },
          ],
        },
        {
          key: 'portal-akademik',
          label: 'AKADEMIK & KBM',
          icon: BookOpen,
          submenus: [
            { to: pUrl('schedules'), label: 'Jadwal Pelajaran', icon: CalendarDays, colorClass: SUBMENU_ICON_STYLES.schedules },
            { to: pUrl('materials'), label: 'Materi Belajar', icon: BookOpen, colorClass: SUBMENU_ICON_STYLES.materials },
            { to: pUrl('assignments'), label: 'Tugas Siswa', icon: ClipboardList, colorClass: SUBMENU_ICON_STYLES.assignments },
            { to: pUrl('grades'), label: 'Nilai Siswa', icon: Award, colorClass: SUBMENU_ICON_STYLES.grades },
            { to: pUrl('student-notes'), label: 'Buku Penghubung', icon: BookOpenCheck, colorClass: SUBMENU_ICON_STYLES['student-notes'] },
          ],
        },
        {
          key: 'portal-ujian',
          label: 'UJIAN ONLINE (CBT)',
          icon: FileCheck2,
          submenus: [
            { to: pUrl('kisi'), label: 'Kisi-kisi Ujian', icon: FileText, colorClass: SUBMENU_ICON_STYLES.kisi },
            { to: pUrl('ujian'), label: 'CBT Ujian Online', icon: FileCheck2, colorClass: SUBMENU_ICON_STYLES.ujian },
            { to: pUrl('hasil'), label: 'Hasil & Rapor', icon: Award, colorClass: SUBMENU_ICON_STYLES.hasil },
          ],
        },
        {
          key: 'portal-tahfizh',
          label: 'TAHFIZH & MUTABAAH',
          icon: BookOpenCheck,
          submenus: [
            { to: pUrl('tahfizh'), label: 'Tahfizh Qur\'an', icon: BookOpenCheck, colorClass: SUBMENU_ICON_STYLES.tahfizh },
            { to: pUrl('mutabaah'), label: 'Mutabaah Yaumiyyah', icon: HeartHandshake, colorClass: SUBMENU_ICON_STYLES.mutabaah },
          ],
        },
        {
          key: 'portal-kehadiran',
          label: 'PRESENSI & LAYANAN',
          icon: CalendarCheck,
          submenus: [
            { to: pUrl('attendance'), label: 'Absensi & Kehadiran', icon: CalendarCheck, colorClass: SUBMENU_ICON_STYLES.attendance },
            { to: pUrl('chat'), label: 'Chat Guru / Musyrif', icon: MessageCircle, colorClass: SUBMENU_ICON_STYLES.chat },
            { to: pUrl('bills'), label: 'Tagihan & SPP', icon: Receipt, colorClass: SUBMENU_ICON_STYLES.bills },
          ],
        },
      ]
    }

    // 2. Fallback Sidebar Role Siswa apabila modul portal-siswa belum tersedia di DB
    if (isPureStudent && !hasDbPortalSiswa) {
      return [
        {
          key: 'portal-utama',
          label: 'PORTAL SISWA',
          icon: UserRound,
          submenus: [
            { to: '/portal-siswa', label: 'Ringkasan Siswa', icon: Sparkles, colorClass: SUBMENU_ICON_STYLES.ringkasan },
            { to: '/portal-siswa/profil', label: 'Profil & Biodata', icon: UserRound, colorClass: SUBMENU_ICON_STYLES.profile },
            { to: '/portal-siswa/informasi-sekolah', label: 'Informasi Sekolah', icon: Megaphone, colorClass: SUBMENU_ICON_STYLES.announcements },
          ],
        },
        {
          key: 'portal-akademik',
          label: 'AKADEMIK & KBM',
          icon: BookOpen,
          submenus: [
            { to: '/portal-siswa/jadwal', label: 'Jadwal Pelajaran', icon: CalendarDays, colorClass: SUBMENU_ICON_STYLES.schedules },
            { to: '/portal-siswa/materi', label: 'Materi Belajar', icon: BookOpen, colorClass: SUBMENU_ICON_STYLES.materials },
            { to: '/portal-siswa/tugas', label: 'Tugas Siswa', icon: ClipboardList, colorClass: SUBMENU_ICON_STYLES.assignments },
            { to: '/portal-siswa/nilai', label: 'Nilai Siswa', icon: Award, colorClass: SUBMENU_ICON_STYLES.grades },
            { to: '/portal-siswa/komentar-guru', label: 'Buku Penghubung', icon: BookOpenCheck, colorClass: SUBMENU_ICON_STYLES['student-notes'] },
          ],
        },
        {
          key: 'portal-ujian',
          label: 'UJIAN ONLINE (CBT)',
          icon: FileCheck2,
          submenus: [
            { to: '/portal-siswa/kisi-kisi', label: 'Kisi-kisi Ujian', icon: FileText, colorClass: SUBMENU_ICON_STYLES.kisi },
            { to: '/portal-siswa/ujian-cbt', label: 'CBT Ujian Online', icon: FileCheck2, colorClass: SUBMENU_ICON_STYLES.ujian },
            { to: '/portal-siswa/hasil', label: 'Hasil & Rapor', icon: Award, colorClass: SUBMENU_ICON_STYLES.hasil },
          ],
        },
        {
          key: 'portal-tahfizh',
          label: 'TAHFIZH & MUTABAAH',
          icon: BookOpenCheck,
          submenus: [
            { to: '/portal-siswa/tahfizh', label: 'Tahfizh Siswa', icon: BookOpenCheck, colorClass: SUBMENU_ICON_STYLES.tahfizh },
            { to: '/portal-siswa/mutabaah', label: 'Mutabaah Siswa', icon: HeartHandshake, colorClass: SUBMENU_ICON_STYLES.mutabaah },
            { to: '/dashboard/tahfizh/quran', label: 'Al-Qur\'an (114 Surah)', icon: BookOpen, colorClass: SUBMENU_ICON_STYLES.quran },
            { to: '/dashboard/tahfizh/doa', label: 'Doa & Dzikir Harian', icon: HeartHandshake, colorClass: SUBMENU_ICON_STYLES.doa },
          ],
        },
        {
          key: 'portal-kehadiran',
          label: 'PRESENSI & KEHADIRAN',
          icon: CalendarCheck,
          submenus: [
            { to: '/portal-siswa/absensi', label: 'Absensi Siswa', icon: CalendarCheck, colorClass: SUBMENU_ICON_STYLES.attendance },
          ],
        },
      ]
    }

    if (dbModules.length === 0) {
      return []
    }

    const seenPaths = new Set()
    const result = []

    const resolveDynamicItemPath = (rawPath) => {
      if (!rawPath) return ''
      if (isPureParent && childSuffix && rawPath.startsWith('/portal-orangtua') && !rawPath.includes('child=')) {
        return `${rawPath}${rawPath.includes('?') ? '&' : '?'}${childSuffix}`
      }
      return rawPath
    }

    for (const mod of dbModules) {
      if (isKepalaSekolah && mod.id === 'pengaturan') {
        continue
      }
      const ModIcon = resolveSidebarIcon(mod.icon) || LayoutDashboard
      const rawItems = mod.items || []

      // 1. Filter items berdasarkan aturan role
      const filteredItems = rawItems.filter((sub) => {
        const itemObj = { to: sub.path, ...sub }
        return !shouldHideSubmenu(mod, itemObj)
      })

      // 2. Deduplikasi rute (mempertahankan query string agar tab ?tab=... tidak bertabrakan)
      const uniqueItems = []
      for (const sub of filteredItems) {
        const resolvedPath = resolveDynamicItemPath(sub.path)
        const dedupKey = resolvedPath.trim().replace(/\/+$/, '') || '/'
        if (dedupKey && !seenPaths.has(dedupKey)) {
          seenPaths.add(dedupKey)
          uniqueItems.push({ ...sub, resolvedPath })
        }
      }

      if (uniqueItems.length === 0) {
        continue
      }

      if (mod.id === 'dashboard' && uniqueItems.length === 1) {
        const first = uniqueItems[0]
        result.push({
          key: mod.id,
          label: first.name || mod.name,
          icon: resolveSidebarIcon(first.icon) || ModIcon,
          to: first.resolvedPath,
        })
      } else {
        result.push({
          key: mod.id,
          label: mod.name.toUpperCase(),
          icon: ModIcon,
          submenus: uniqueItems.map((sub) => ({
            to: sub.resolvedPath,
            label: sub.id === 'mutabaah-tahfizh' ? setoranTahfizhMenuLabel : sub.name,
            icon: resolveSidebarIcon(sub.icon),
            action: sub.resolvedPath?.includes('/kalender') ? 'calendar' : undefined,
          })),
        })
      }
    }

    // Pastikan grup menu Pengaturan selalu berada di urutan paling bawah
    const nonSettings = result.filter((m) => m.key !== 'pengaturan')
    const settings = result.filter((m) => m.key === 'pengaturan')

    return [...nonSettings, ...settings]
  }, [
    isPureParent,
    isPureStudent,
    location.search,
    navData,
    setoranTahfizhMenuLabel,
    hasFullMenuAccess,
    isPesantrenUnit,
    isGuruUser,
    isKepalaSekolah,
  ])

  const sidebarMenu = dynamicSidebarMenu

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

  // Auto-expand grup menu yang berisi route/tab aktif.
  useEffect(() => {
    for (const item of sidebarMenu) {
      if (!item.submenus) continue
      if (item.submenus.some((sub) => isSubActive(sub.to, item.submenus, item.key))) {
        setOpenSection(item.key)
        return
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, sidebarMenu])

  return (
    <div
      className={`site-shell min-h-screen text-slate-800 flex flex-col font-sans antialiased dark:bg-slate-950 dark:text-slate-100 template-${pengaturan.template}`}
      style={{
        '--site-sidebar': pengaturan.sidebar_color || '#059669',
        '--site-accent': pengaturan.sidebar_accent_color || '#10B981',
        '--site-body': isDarkMode ? '#0F172A' : '#F2F8F5',
        '--site-header': isDarkMode ? '#1B2433' : '#FFFFFF',
        backgroundColor: isDarkMode ? '#0F172A' : '#F2F8F5',
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
        {(() => {
          const isEffectiveCollapsed = collapsed && !mobileMenuOpen
          return (
            <aside
              className={`site-sidebar fixed inset-y-0 z-50 flex flex-col justify-between border-emerald-200/90 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen ${pengaturan.sidebar_position === 'right' ? 'right-0 border-l' : 'left-0 border-r'} ${isEffectiveCollapsed ? 'md:w-20' : 'md:w-64'
                } ${mobileMenuOpen ? 'translate-x-0 w-72 shadow-2xl' : pengaturan.sidebar_position === 'right' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'}`}
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
              {/* Desktop Floating Toggle Button (Hijau Zamrud #059669) */}
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex absolute -right-3 top-4 z-30 h-6.5 w-6.5 items-center justify-center rounded-full bg-[#059669] hover:bg-[#047857] text-white shadow-md shadow-emerald-950/20 border border-emerald-400/40 transition-all active:scale-95 cursor-pointer"
                title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
              >
                {collapsed ? <ChevronRight className="h-3.5 w-3.5 text-white" /> : <ChevronLeft className="h-3.5 w-3.5 text-white" />}
              </button>

              {/* Header Sidebar: Logo & Title (Tinggi 64px sejajar persis dengan Navbar Card) */}
              <div className={`relative z-10 h-16 min-h-[4rem] flex items-center ${isEffectiveCollapsed ? 'px-3' : 'px-4'} border-b border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 dark:bg-[#1B2433]/90 backdrop-blur-xs`}>
                <div className={`flex items-center w-full ${isEffectiveCollapsed ? 'justify-center' : 'justify-between'}`}>
                  <div className={`flex items-center gap-3 overflow-hidden ${isEffectiveCollapsed ? 'justify-center w-full' : ''}`}>
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center">
                      <img
                        src={pengaturan.logo_url || '/logo.png'}
                        onError={(e) => {
                          if (e.currentTarget.src !== window.location.origin + '/logo.png') {
                            e.currentTarget.src = '/logo.png'
                          }
                        }}
                        alt={namaSekolah ? `Logo ${namaSekolah}` : 'Logo Sekolah'}
                        className="h-full w-full object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
                      />
                    </div>
                    {!isEffectiveCollapsed && (
                      <div className="min-w-0">
                        <h1 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase font-sans">
                          {namaSekolah}
                        </h1>
                        <p className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400">{(pengaturan.application_name && !pengaturan.application_name.includes('Sistem Manajemen Sekolah')) ? pengaturan.application_name : 'Dareliman Edu'}</p>
                      </div>
                    )}
                  </div>

                  {/* Mobile Close Button */}
                  <button
                    type="button"
                    aria-label="Tutup Menu Navigasi"
                    title="Tutup Menu Navigasi"
                    onClick={() => setMobileMenuOpen(false)}
                    className="md:hidden text-slate-600 hover:text-slate-900 dark:text-slate-400 p-1 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className={`relative z-10 flex-1 space-y-1.5 ${isEffectiveCollapsed ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'} p-3 text-xs`}>
                {/* Loading Skeleton */}
                {isNavLoading && sidebarMenu.length === 0 && (
                  <div className="space-y-3 p-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className={`flex items-center ${isEffectiveCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl animate-pulse`}>
                        <div className="h-7.5 w-7.5 rounded-xl bg-slate-200 dark:bg-slate-700/60 shrink-0" />
                        {!isEffectiveCollapsed && (
                          <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded-md w-3/4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Error State with Retry */}
                {isNavError && sidebarMenu.length === 0 && (
                  <div className="p-3 text-center space-y-2">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60">
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </div>
                    {!isEffectiveCollapsed && (
                      <>
                        <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Gagal memuat navigasi</p>
                        <button
                          type="button"
                          onClick={() => refetchNav()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Coba Lagi</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!isNavLoading && !isNavError && sidebarMenu.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    {!isEffectiveCollapsed && 'Tidak ada menu navigasi yang tersedia.'}
                  </div>
                )}

                {sidebarMenu.map((item, idx) => {
                  const Icon = item.icon
                  const isPengaturan = item.key === 'pengaturan'
                  const content = !item.submenus ? (
                    <div key={item.key} className="relative group">
                      <NavLink
                        to={item.to}
                        onMouseEnter={() => prefetchRoute(item.to)}
                        onFocus={() => prefetchRoute(item.to)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group/link relative flex items-center ${isEffectiveCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-bold transition-all duration-200 ${normalizePath(location.pathname) === normalizePath(item.to)
                          ? 'bg-[#059669] text-white shadow-xs dark:bg-[#18A972] dark:text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50/70 hover:text-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200'
                          }`}
                      >
                        <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${normalizePath(location.pathname) === normalizePath(item.to) ? 'bg-white/20 text-white border border-emerald-200/30' : getSidebarIconBadgeClass(item.key, idx)}`}>
                          <Icon className="h-4 w-4 stroke-[2]" />
                        </div>
                        {!isEffectiveCollapsed && <span>{item.label}</span>}
                      </NavLink>

                      {/* Hover Tooltip when Collapsed */}
                      {isEffectiveCollapsed && (
                        <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-150 z-50">
                          <div className="relative rounded-xl bg-slate-900 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-xl shadow-slate-950/25 border border-emerald-700/80/80 whitespace-nowrap">
                            {item.label}
                            <div className="absolute top-1/2 -left-1 -mt-1 h-2 w-2 rotate-45 bg-slate-900 dark:bg-slate-800 border-l border-b border-emerald-700/80/80" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (() => {
                    const isOpen = openSection === item.key
                    const hasActiveChild = isOpen && item.submenus.some((sub) => isSubActive(sub.to, item.submenus, item.key))

                    return (
                      <div key={item.key} className="relative group space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (isEffectiveCollapsed) setCollapsed(false)
                            toggleSection(item.key)
                          }}
                          className={`flex w-full items-center ${isEffectiveCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isOpen || hasActiveChild
                            ? 'bg-[#059669] text-white shadow-xs dark:bg-[#18A972] dark:text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50/70 hover:text-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200'
                            }`}
                        >
                          <div className={`flex items-center ${isEffectiveCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                            <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${isOpen || hasActiveChild ? 'bg-white/20 text-white border border-emerald-200/30' : getSidebarIconBadgeClass(item.key, idx)}`}>
                              <Icon className={`h-4 w-4 shrink-0 stroke-[2] ${isOpen || hasActiveChild ? 'text-white' : ''}`} />
                            </div>
                            {!isEffectiveCollapsed && <span className="truncate">{item.label}</span>}
                          </div>
                          {!isEffectiveCollapsed && (
                            <span className="text-[10px]">
                              {isOpen ? <ChevronDown className={`h-3.5 w-3.5 ${isOpen || hasActiveChild ? 'text-white' : 'text-slate-500'}`} /> : <ChevronRight className={`h-3.5 w-3.5 ${isOpen || hasActiveChild ? 'text-white' : 'text-slate-500'}`} />}
                            </span>
                          )}
                        </button>

                        {/* Hover Flyout Menu when Collapsed */}
                        {isEffectiveCollapsed && (
                          <div className="absolute left-full -top-1 pl-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-x-0 -translate-x-2 transition-all duration-150 z-50 min-w-[13.5rem]">
                            <div className="relative rounded-xl bg-white dark:bg-[#1B2433] p-2.5 shadow-xl shadow-slate-900/15 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                              <div className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-emerald-100/80 dark:border-emerald-800/60 mb-1.5 flex items-center justify-between">
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
                                      className="flex items-center gap-2.5 w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                                    >
                                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-150 ${SUBMENU_ICON_STYLES.calendar}`}>
                                        <CalendarDays className="h-3.5 w-3.5 stroke-[2.2]" />
                                      </div>
                                      <span className="truncate">{sub.label}</span>
                                    </button>
                                  )
                                }
                                const SubIcon = typeof sub.icon === 'function' || (typeof sub.icon === 'object' && sub.icon !== null)
                                  ? sub.icon
                                  : (resolveSidebarIcon(sub.icon) || null)
                                const active = isSubActive(sub.to, item.submenus, item.key)
                                const badgeClass = getSubmenuIconBadgeClass(sub, sIdx)
                                return (
                                  <NavLink
                                    key={`flyout-${item.key}-${sub.to || sub.label}-${sIdx}`}
                                    to={sub.to}
                                    onMouseEnter={() => prefetchRoute(sub.to)}
                                    onFocus={() => prefetchRoute(sub.to)}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block rounded-lg px-2.5 py-1.5 text-xs transition-colors ${active
                                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                      : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800 font-medium dark:text-slate-400 dark:hover:bg-slate-800'
                                      }`}
                                  >
                                    <span className="flex items-center gap-2.5 min-w-0">
                                      {SubIcon && (
                                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-150 ${active
                                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs ring-1 ring-emerald-500/30'
                                          : badgeClass
                                          }`}>
                                          <SubIcon className={`h-3.5 w-3.5 stroke-[2.2] ${active ? 'text-white' : ''}`} />
                                        </div>
                                      )}
                                      <span className="truncate">{sub.label}</span>
                                    </span>
                                  </NavLink>
                                )
                              })}
                              <div className="absolute top-4 -left-1 -mt-1 h-2 w-2 rotate-45 bg-white dark:bg-[#1B2433] border-l border-b border-emerald-200/90 dark:border-emerald-800/60" />
                            </div>
                          </div>
                        )}

                        {/* Submenu Accordion when Expanded */}
                        {!isEffectiveCollapsed && isOpen && (
                          <div className="ml-5 space-y-1 border-l-2 border-emerald-200/80 dark:border-emerald-800/60 pl-3 pt-1 animate-[masterDropdownSlide_0.2s_ease-out]">
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
                                    className="flex items-center gap-2.5 w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                                  >
                                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-150 ${SUBMENU_ICON_STYLES.calendar}`}>
                                      <CalendarDays className="h-3.5 w-3.5 stroke-[2.2]" />
                                    </div>
                                    <span className="truncate">{sub.label}</span>
                                  </button>
                                )
                              }
                              const SubIcon = typeof sub.icon === 'function' || (typeof sub.icon === 'object' && sub.icon !== null)
                                ? sub.icon
                                : (resolveSidebarIcon(sub.icon) || null)
                              const active = isSubActive(sub.to, item.submenus, item.key)
                              const badgeClass = getSubmenuIconBadgeClass(sub, sIdx)
                              return (
                                <NavLink
                                  key={`${item.key}-${sub.to || sub.label}-${sIdx}`}
                                  to={sub.to}
                                  onMouseEnter={() => prefetchRoute(sub.to)}
                                  onFocus={() => prefetchRoute(sub.to)}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`block rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 ${active
                                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60'
                                    : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-800 font-medium dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                  <span className="flex items-center gap-2.5 min-w-0">
                                    {SubIcon && (
                                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-150 ${active
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs ring-1 ring-emerald-500/30'
                                        : badgeClass
                                        }`}>
                                        <SubIcon className={`h-3.5 w-3.5 stroke-[2.2] ${active ? 'text-white' : ''}`} />
                                      </div>
                                    )}
                                    <span className="truncate">{sub.label}</span>
                                  </span>
                                </NavLink>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })()

                  return (
                    <Fragment key={item.key}>
                      {isPengaturan && idx > 0 && (
                        <div className="my-2 border-t border-emerald-200/80 dark:border-emerald-800/60" />
                      )}
                      {content}
                    </Fragment>
                  )
                })}
              </nav>

              {/* User Status Bar & Help Link at Sidebar Bottom (Sama Persis dengan Staging) */}
              <div className="relative z-10 p-3.5 border-t border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/90 dark:bg-[#131B29]/90 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <PersonAvatar
                      src={user?.photo_url || user?.avatar_url || user?.avatar || user?.photo || user?.profile_photo_url}
                      name={namaTampil}
                      size="sm"
                      className="border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-emerald-200/80 dark:border-emerald-950" />
                  </div>
                  {!isEffectiveCollapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white leading-tight">{namaTampil}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">• Online</span>
                      </div>
                    </div>
                  )}
                </div>

                {!isEffectiveCollapsed && (
                  <p className="truncate px-2 text-[9px] text-slate-400 dark:text-slate-500">{pengaturan.footer_text || `${namaSekolah} © ${new Date().getFullYear()}`}</p>
                )}
                {!isEffectiveCollapsed && (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/bantuan')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#059669] to-teal-700 hover:from-[#047857] hover:to-teal-800 text-white text-[11px] font-bold shadow-md shadow-emerald-950/20 border border-emerald-500/30 transition-all cursor-pointer active:scale-98"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-white shrink-0" />
                    <span>Bantuan & Panduan</span>
                  </button>
                )}
              </div>
            </aside>
          )
        })()}

        {/* Main Workspace Area (SIMSIT Canvas Soft Mint Green bg-[#F2FBF7]) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F2FBF7] dark:bg-[#0F172A]">
          {/* Topbar Header (Clean White bg-white with subtle shadow shadow-sm / Dark Mode Surface #1B2433) */}
          <header
            className={`${pengaturan.header_sticky ? 'sticky top-0' : 'relative'} z-30 flex min-h-[4rem] min-w-0 items-center justify-between overflow-visible border-b border-emerald-200/80 px-3 sm:px-4 lg:px-6 gap-3 bg-white dark:bg-[#1B2433] shadow-sm backdrop-blur-md transition-colors duration-200 dark:border-emerald-800/80`}
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 transition-all shadow-xs"
                  aria-label="Buka Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="pointer-events-none absolute left-0 top-full mt-2.5 hidden group-hover:flex flex-col items-start z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-emerald-700/80 dark:bg-slate-800">
                    Buka Menu Navigasi Samping
                  </div>
                </div>
              </div>

              {/* 1. Active Unit Indicator (Static Badge for Unit-Scoped Staff/Teacher / Dropdown Switcher for Global Admin & Yayasan) */}
              {!canSwitchUnits ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs shrink-0 select-none">
                  <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                  <span className="hidden sm:inline text-emerald-700/80 dark:text-emerald-400/80 font-medium">Unit:</span>
                  <span className="font-extrabold text-emerald-900 dark:text-emerald-200 max-w-[120px] xs:max-w-[160px] sm:max-w-none truncate inline-block">
                    {user?.education_unit_name || user?.unit_name || user?.unit?.name || (typeof user?.unit === 'string' ? user.unit : '') || currentUnitObj?.name || (activeUnit && activeUnit !== 'SEMUA' && activeUnit !== 'semua' ? activeUnit : 'Unit Sekolah')}
                  </span>
                </div>
              ) : (
                <div className="relative shrink-0 group" ref={unitDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
                    className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100/90 transition-all dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs cursor-pointer"
                  >
                    <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                    <span className="hidden sm:inline text-emerald-700/80 dark:text-emerald-400/80 font-medium">Unit:</span>
                    <span className="font-extrabold text-emerald-900 dark:text-emerald-200 max-w-[100px] xs:max-w-[140px] sm:max-w-none truncate inline-block">{activeUnit || 'Semua Unit'}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                  </button>

                  {/* Instant Floating Tooltip */}
                  {!unitDropdownOpen && (
                    <div className="pointer-events-none absolute left-0 top-full mt-2.5 hidden group-hover:flex flex-col items-start z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-emerald-700/80 dark:bg-slate-800">
                        Pilih unit pendidikan aktif untuk memfilter data
                      </div>
                    </div>
                  )}

                  {unitDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 rounded-xl bg-white p-1.5 shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 z-50 animate-[masterDropdownSlide_0.2s_ease-out] dark:bg-[#1B2433] dark:border-emerald-800/60">
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
                          className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeUnit === unit.id
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
              )}

              {/* 2. Field Pencarian (Search Bar - Soft Pastel Emerald Green, Geser ke kiri mendekati unit) */}
              <div className="hidden md:flex min-w-[200px] max-w-xs flex-1 items-center group relative">
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="flex w-full items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 px-3.5 py-2 text-xs font-semibold text-emerald-900 shadow-xs transition-all hover:bg-emerald-100/80 hover:border-emerald-300 dark:hover:border-emerald-700/80 active:scale-[0.99] dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 focus:outline-none cursor-pointer"
                >
                  <Search className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                  <span className="flex-1 text-left text-xs font-semibold truncate text-emerald-800 dark:text-emerald-300">Cari siswa, guru, modul...</span>
                  <kbd className="shrink-0 hidden lg:inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/80 dark:text-emerald-300">
                    Ctrl + K
                  </kbd>
                </button>

                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute left-0 top-full mt-2.5 hidden group-hover:flex flex-col items-start z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-emerald-700/80 dark:bg-slate-800">
                    Pencarian cepat siswa, guru, kelas, modul & fitur (Ctrl + K)
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTROLS: Tanggal (geser dekat notifikasi), Akses Role (Super Admin/Admin only, samping notifikasi), Notification Bell, Cache Reset, Dark Mode, Profile Avatar */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* 3. Tanggal Hari Ini & Button Kalender Akademik (Soft Pastel Cyan/Teal, posisi dekat button notifikasi) */}
              <div className="group relative hidden xl:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAcademicCalendarOpen(true)}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800 bg-emerald-50/80 px-3 py-2 shadow-xs transition hover:scale-[1.02] hover:bg-emerald-100/90 active:scale-[0.98] dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                  <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 whitespace-nowrap">{tanggalTampil}</span>
                  <span className="ml-1 inline-flex items-center rounded-lg bg-emerald-200/70 px-1.5 py-0.5 text-[10px] font-black text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                    Kalender
                  </span>
                </button>
                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-emerald-700/80 dark:bg-slate-800">
                    Klik untuk membuka Kalender Akademik & Pengaturan Libur/Sekolah
                  </div>
                </div>
              </div>

              {/* 4. Dropdown Akses Role (HANYA muncul jika Super Admin / Admin atau sedang dalam sesi impersonasi) */}
              {(hasFullMenuAccess || impersonating) && (
                <div className="relative shrink-0 group hidden sm:flex" ref={roleAccessRef}>
                  <button
                    type="button"
                    onClick={() => setRoleAccessOpen(!roleAccessOpen)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-extrabold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xs focus:outline-none cursor-pointer ${roleAccessOpen
                        ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-purple-100 text-purple-900 dark:border-emerald-800/60 dark:bg-purple-950 dark:text-purple-200'
                        : 'border-emerald-200/80 dark:border-emerald-800 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                    <span className="hidden xl:inline">Akses Role</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform text-emerald-600 ${roleAccessOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Instant Floating Tooltip */}
                  {!roleAccessOpen && (
                    <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-emerald-700/80 dark:bg-slate-800">
                        Beralih akun sebagai role pengguna lain (Super Admin / Admin)
                      </div>
                    </div>
                  )}

                  {roleAccessOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white p-1.5 shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 z-50 animate-[masterDropdownSlide_0.2s_ease-out] dark:bg-[#1B2433] dark:border-emerald-800/60">
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
                            <span className="h-3.5 w-3.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 border-t-transparent animate-spin" />
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
                  bellClassName="border border-emerald-200/80 dark:border-emerald-800 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100/90 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs transition hover:scale-[1.03]"
                />
                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-emerald-700/80 dark:bg-slate-800">
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800 bg-emerald-50/80 text-emerald-800 shadow-xs transition-all hover:bg-emerald-100/90 hover:scale-[1.03] active:scale-[0.97] dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-4.5 w-4.5 stroke-[2] text-emerald-600 dark:text-emerald-400 ${isResettingCache ? 'animate-spin' : ''}`} />
                </button>
                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-emerald-700/80 dark:bg-slate-800">
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/80 bg-emerald-50/80 text-emerald-800 shadow-xs transition-all hover:bg-emerald-100/90 hover:scale-[1.03] active:scale-[0.97] dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 focus:outline-none cursor-pointer"
                >
                  {isDarkMode ? <Sun className="h-4.5 w-4.5 stroke-[2] text-amber-500" /> : <Moon className="h-4.5 w-4.5 stroke-[2] text-fuchsia-600 dark:text-fuchsia-400" />}
                </button>
                {/* Instant Floating Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-emerald-700/80 dark:bg-slate-800">
                    {isDarkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                  </div>
                </div>
              </div>

              {/* 8. User Profile Avatar Squircle Trigger (Soft Pastel Rose/Coral Border) */}
              <div className="relative group" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 shadow-xs hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer dark:border-emerald-800/60 focus:outline-none"
                  aria-label="Menu profil user"
                >
                  <PersonAvatar
                    src={user?.photo_url || user?.avatar_url || user?.avatar || user?.photo || user?.profile_photo_url}
                    name={namaTampil}
                    size="table"
                    shape="square"
                    alt={`Foto profil ${namaTampil}`}
                    className="h-full w-full object-cover border-0 rounded-xl"
                  />
                </button>

                {/* Instant Floating Tooltip */}
                {!profileDropdownOpen && (
                  <div className="pointer-events-none absolute right-0 top-full mt-2.5 hidden group-hover:flex flex-col items-end z-50 animate-[masterDropdownSlide_0.15s_ease-out]">
                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 text-white px-3 py-1.5 text-xs font-extrabold shadow-xl whitespace-nowrap dark:border-emerald-700/80 dark:bg-slate-800">
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
                      className="absolute right-0 top-full mt-3 w-72 sm:w-80 rounded-xl bg-white dark:bg-[#1B2433] p-5 shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 z-50"
                    >
                      {/* Profile Header (Matching Image 3) */}
                      <div className="flex items-center gap-3.5">
                        <PersonAvatar
                          src={user?.photo_url || user?.avatar_url || user?.avatar || user?.photo || user?.profile_photo_url}
                          name={namaTampil}
                          size="card"
                          shape="square"
                          alt={`Foto profil ${namaTampil}`}
                          className="h-14 w-14 rounded-xl object-cover border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 shadow-xs"
                        />
                        <div className="min-w-0">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">{namaTampil}</h4>
                          <p className="text-xs font-medium text-slate-400 dark:text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
                        </div>
                      </div>

                      <hr className="my-3.5 border-emerald-100/80 dark:border-emerald-800/60" />

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
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300 stroke-[1.8]" />
                          <span>Pengaturan Akun</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsDarkMode(!isDarkMode)
                          }}
                          className="w-full sm:hidden flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
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
                          className="w-full sm:hidden flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
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
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                          >
                            <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-300 stroke-[1.8]" />
                            <span>Unit Pendidikan</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            setShowPwaModal(true)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[1.8]" />
                          <span>Pasang Aplikasi (PWA)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            navigate('/dashboard/bantuan')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <HelpCircle className="h-5 w-5 text-slate-600 dark:text-slate-300 stroke-[1.8]" />
                          <span>Bantuan {'&'} Panduan</span>
                        </button>
                      </div>

                      <hr className="my-3.5 border-emerald-100/80 dark:border-emerald-800/60" />

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-rose-600 dark:text-slate-200 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
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

          {/* Main Page Workspace Container (SIMSIT Canvas bg-[#F2FBF7]) */}
          <main className="min-w-0 flex-1 overflow-x-hidden bg-[#F2FBF7] dark:bg-[#0F172A] px-3 py-3.5 sm:px-5 sm:py-5 lg:p-6 space-y-4 sm:space-y-6 max-w-none lg:max-w-7xl w-full mx-auto pb-28 lg:pb-24">
            {impersonating && !hasFullMenuAccess && (
              <div className="auth-impersonating-banner flex flex-col gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-100">
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
              label: 'Buku Induk Siswa',
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
      {!isPureStudent && !isPureParent && canCreateStudent && (location.pathname.startsWith('/dashboard/students') || location.pathname.startsWith('/dashboard/master/siswa') || location.pathname.startsWith('/dashboard/yayasan/siswa')) && (
        <FAB onClick={() => navigate('/dashboard/students?action=add')} label="Tambah Siswa" />
      )}

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
        lockedUnit={
          ['superadmin', 'super_admin', 'admin', 'yayasan', 'pengurus'].some((r) =>
            String(user?.role || user?.role_name || user?.roles?.[0] || '').toLowerCase().includes(r)
          )
            ? null
            : (user?.unit_name || user?.unit?.name || (typeof window !== 'undefined' ? localStorage.getItem('portal_active_child_unit') : null))
        }
      />
      <PwaInstallBanner
        forceShow={showPwaModal}
        onClose={() => setShowPwaModal(false)}
      />
      <AuthPopup />
      <AuthToast />
    </div>
  )
}
