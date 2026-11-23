import React, { Suspense, lazy, Component, useEffect } from 'react'
import { Navigate, Outlet, createBrowserRouter, useSearchParams, useLocation, RouterProvider } from 'react-router-dom'

const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const StudentDataPage = lazy(() => import('../pages/StudentDataPage'))
const StudentsPage = lazy(() => import('../pages/StudentsPage'))
const MasterStatusSiswaPage = lazy(() => import('../pages/MasterStatusSiswaPage'))
const EducationUnitsPage = lazy(() => import('../pages/EducationUnitsPage'))
const AttendancePage = lazy(() => import('../pages/AttendancePage'))
const TahfizhPage = lazy(() => import('../pages/TahfizhPage'))
const TahfizhTargetSettingPage = lazy(() => import('../pages/TahfizhTargetSettingPage'))
const AcademicPage = lazy(() => import('../pages/AcademicPage'))
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const BeritaPublikPage = lazy(() => import('../pages/BeritaPublikPage'))
const PengaturanPage = lazy(() => import('../pages/PengaturanPage'))
const MobileApiConfigPage = lazy(() => import('../pages/MobileApiConfigPage'))
const KelolaNavigasiMenuPage = lazy(() => import('../pages/KelolaNavigasiMenuPage'))
const SystemMaintenanceDataHubPage = lazy(() => import('../pages/SystemMaintenanceDataHubPage'))
const LaporanAbsensiPage = lazy(() => import('../pages/LaporanAbsensiPage'))
const LaporanTahfizhPage = lazy(() => import('../pages/LaporanTahfizhPage'))
const LaporanAkademikPage = lazy(() => import('../pages/LaporanAkademikPage'))
const LaporanSiswaPage = lazy(() => import('../pages/LaporanSiswaPage'))
const LaporanAlumniPage = lazy(() => import('../pages/LaporanAlumniPage'))
const KelolaAlumniPage = lazy(() => import('../pages/KelolaAlumniPage'))
const LaporanPegawaiPage = lazy(() => import('../pages/LaporanPegawaiPage'))
const LaporanLmsPage = lazy(() => import('../pages/LaporanLmsPage'))
const RekapAbsensiGerbangPage = lazy(() => import('../pages/RekapAbsensiGerbangPage'))
const RekapAbsensiIbadahPage = lazy(() => import('../pages/RekapAbsensiIbadahPage'))
const ParentsPage = lazy(() => import('../pages/ParentsPage'))
const UserProfileManagementPage = lazy(() => import('../pages/UserProfileManagementPage'))
const EmployeesPage = lazy(() => import('../pages/EmployeesPage'))
const MasterKelasPage = lazy(() => import('../pages/MasterKelasPage'))
const MasterJabatanPage = lazy(() => import('../pages/MasterJabatanPage'))
const MasterHakAksesPage = lazy(() => import('../pages/MasterHakAksesPage'))
const MasterJenisUnitPendidikanPage = lazy(() => import('../pages/MasterJenisUnitPendidikanPage'))
const MasterDataDinamisPage = lazy(() => import('../pages/MasterDataDinamisPage'))
const MasterTahunAjaranPage = lazy(() => import('../pages/MasterTahunAjaranPage'))
const MasterModulSemesterPage = lazy(() => import('../pages/MasterModulSemesterPage'))
const MasterKurikulumPage = lazy(() => import('../pages/MasterKurikulumPage'))
const MasterSubjectPage = lazy(() => import('../pages/MasterSubjectPage'))
const MasterSchedulePage = lazy(() => import('../pages/MasterSchedulePage'))
const ExamSchedulePage = lazy(() => import('../pages/ExamSchedulePage'))
const AcademicCalendarPage = lazy(() => import('../pages/AcademicCalendarPage'))
const MasterCapaianPembelajaranPage = lazy(() => import('../pages/MasterCapaianPembelajaranPage'))
const MasterTujuanPembelajaranPage = lazy(() => import('../pages/MasterTujuanPembelajaranPage'))
const LmsModulAjarPage = lazy(() => import('../pages/LmsModulAjarPage'))
const LmsMateriPage = lazy(() => import('../pages/LmsMateriPage'))
const LmsMediaPage = lazy(() => import('../pages/LmsMediaPage'))
const LmsReferensiPage = lazy(() => import('../pages/LmsReferensiPage'))
const LmsAktivitasBelajarPage = lazy(() => import('../pages/LmsAktivitasBelajarPage'))
const LmsDiskusiPage = lazy(() => import('../pages/LmsDiskusiPage'))
const LmsPenugasanPage = lazy(() => import('../pages/LmsPenugasanPage'))
const LmsPengumpulanTugasPage = lazy(() => import('../pages/LmsPengumpulanTugasPage'))
const AttendanceWorkspacePage = lazy(() => import('../pages/AttendanceWorkspacePage'))
const TeacherAttendanceDashboardPage = lazy(() => import('../pages/attendance/TeacherAttendanceDashboardPage'))
const TeacherSchedulePage = lazy(() => import('../pages/attendance/TeacherSchedulePage'))
const LessonAttendanceListPage = lazy(() => import('../pages/attendance/LessonAttendanceListPage'))
const TeacherAttendanceHistoryPage = lazy(() => import('../pages/attendance/TeacherAttendanceHistoryPage'))
const HomeroomAttendanceDashboardPage = lazy(() => import('../pages/attendance/HomeroomAttendanceDashboardPage'))
const HomeroomAttendanceRecapPage = lazy(() => import('../pages/attendance/HomeroomAttendanceRecapPage'))
const AttendancePermissionReviewPage = lazy(() => import('../pages/attendance/AttendancePermissionReviewPage'))
const AttendanceCorrectionPage = lazy(() => import('../pages/attendance/AttendanceCorrectionPage'))
const AttendanceFollowUpListPage = lazy(() => import('../pages/attendance/AttendanceFollowUpListPage'))
const AttendanceReportPage = lazy(() => import('../pages/attendance/AttendanceReportPage'))
const LmsKisiKisiPage = lazy(() => import('../pages/LmsKisiKisiPage'))
const LmsBankSoalPage = lazy(() => import('../pages/LmsBankSoalPage'))
const LmsUjianPage = lazy(() => import('../pages/LmsUjianPage'))
const LmsPenilaianPage = lazy(() => import('../pages/LmsPenilaianPage'))
const LmsRaporPage = lazy(() => import('../pages/LmsRaporPage'))
const StudentCrudPage = lazy(() => import('../pages/StudentCrudPage'))
const MultiRoleDashboardPage = lazy(() => import('../pages/MultiRoleDashboardPage'))
const KepalaSekolahDashboardPage = lazy(() => import('../pages/KepalaSekolahDashboardPage'))
const WaliKelasDashboardPage = lazy(() => import('../pages/WaliKelasDashboardPage'))
const DivisiPendidikanDashboardPage = lazy(() => import('../pages/DivisiPendidikanDashboardPage'))
const DivisiPendidikanWorkspacePage = lazy(() => import('../pages/divisi/DivisiPendidikanWorkspacePage'))
const WakaKurikulumDashboardPage = lazy(() => import('../pages/WakaKurikulumDashboardPage'))
const WakaKesiswaanDashboardPage = lazy(() => import('../pages/WakaKesiswaanDashboardPage'))
const TataUsahaDashboardPage = lazy(() => import('../pages/TataUsahaDashboardPage'))
const GuruTahfizhDashboardPage = lazy(() => import('../pages/GuruTahfizhDashboardPage'))
const GuruBkDashboardPage = lazy(() => import('../pages/GuruBkDashboardPage'))
const OperatorDashboardPage = lazy(() => import('../pages/OperatorDashboardPage'))
const MusyrifDashboardPage = lazy(() => import('../pages/MusyrifDashboardPage'))
const AlumniPortalPage = lazy(() => import('../pages/AlumniPortalPage'))
const MonitoringDashboardPage = lazy(() => import('../pages/MonitoringDashboardPage'))
const MonitoringDivisiPage = lazy(() => import('../pages/MonitoringDivisiPage'))
const MutabaahPage = lazy(() => import('../pages/MutabaahPage'))
const MutabaahDashboardPage = lazy(() => import('../pages/mutabaah/MutabaahDashboardPage'))
const MutabaahRecapPage = lazy(() => import('../pages/mutabaah/MutabaahRecapPage'))
const MutabaahTargetEvaluationPage = lazy(() => import('../pages/mutabaah/MutabaahTargetEvaluationPage'))
const MutabaahAgendaDetailPage = lazy(() => import('../pages/mutabaah/MutabaahAgendaDetailPage'))
const MutabaahTemplatePage = lazy(() => import('../pages/mutabaah/MutabaahTemplatePage'))
const MutabaahTemplateAssignmentPage = lazy(() => import('../pages/mutabaah/MutabaahTemplateAssignmentPage'))
const MutabaahSupervisorAssignmentPage = lazy(() => import('../pages/mutabaah/MutabaahSupervisorAssignmentPage'))
const MutabaahParentMonitoringPage = lazy(() => import('../pages/mutabaah/MutabaahParentMonitoringPage'))
const MonitoringTahfizhIbadahNonPesantrenPage = lazy(() => import('../pages/MonitoringTahfizhIbadahNonPesantrenPage'))
const TahfizhReportSummaryPage = lazy(() => import('../pages/tahfizh/TahfizhReportSummaryPage'))
const MasterQuranSurahPage = lazy(() => import('../pages/MasterQuranSurahPage'))
const MasterJadwalSholatPage = lazy(() => import('../pages/MasterJadwalSholatPage'))
const MasterDoaPage = lazy(() => import('../pages/MasterDoaPage'))
const PoinPenilaianDoaPage = lazy(() => import('../pages/PoinPenilaianDoaPage'))
const DisciplinePointManagementPage = lazy(() => import('../pages/DisciplinePointManagementPage'))
const DeleteApprovalPage = lazy(() => import('../pages/DeleteApprovalPage'))
const GateAttendancePage = lazy(() => import('../pages/GateAttendancePage'))
const WorshipAttendancePage = lazy(() => import('../pages/WorshipAttendancePage'))
const StudentWorshipAttendancePage = lazy(() => import('../pages/StudentWorshipAttendancePage'))
const TeacherTeachingWorkspacePage = lazy(() => import('../pages/TeacherTeachingWorkspacePage'))
const ParentPortalPage = lazy(() => import('../pages/ParentPortalPage'))
const StudentPortalPage = lazy(() => import('../pages/StudentPortalPage'))
const TeacherStudentPortalDashboardPage = lazy(() => import('../pages/TeacherStudentPortalDashboardPage'))
const EmployeeChatPage = lazy(() => import('../pages/EmployeeChatPage'))
const StudentAttendancePage = lazy(() => import('../pages/attendance/StudentAttendancePage'))
const StudentAttendanceHistoryPage = lazy(() => import('../pages/attendance/StudentAttendanceHistoryPage'))
const AcademicLmsContainerPage = lazy(() => import('../pages/AcademicLmsContainerPage'))
const NewsManagementPage = lazy(() => import('../pages/NewsManagementPage'))
const BantuanPage = lazy(() => import('../pages/BantuanPage'))
const StudentBillsManagementPage = lazy(() => import('../pages/finance/StudentBillsManagementPage'))

const FoundationDashboardPage = lazy(() => import('../pages/foundation/FoundationDashboardPage').then(m => ({ default: m.FoundationDashboardPage })))
const FoundationUnitsPage = lazy(() => import('../pages/foundation/FoundationUnitsPage').then(m => ({ default: m.FoundationUnitsPage })))
const FoundationUnitDetailPage = lazy(() => import('../pages/foundation/FoundationUnitDetailPage').then(m => ({ default: m.FoundationUnitDetailPage })))
const FoundationOrgStructurePage = lazy(() => import('../pages/foundation/FoundationOrgStructurePage').then(m => ({ default: m.FoundationOrgStructurePage })))
const FoundationEmployeesPage = lazy(() => import('../pages/foundation/FoundationEmployeesPage').then(m => ({ default: m.FoundationEmployeesPage })))
const FoundationStudentsPage = lazy(() => import('../pages/foundation/FoundationStudentsPage').then(m => ({ default: m.FoundationStudentsPage })))
const FoundationNewStudentsPage = lazy(() => import('../pages/foundation/FoundationNewStudentsPage').then(m => ({ default: m.FoundationNewStudentsPage })))
const FoundationMutationsPage = lazy(() => import('../pages/foundation/FoundationMutationsPage').then(m => ({ default: m.FoundationMutationsPage })))
const FoundationGraduationAlumniPage = lazy(() => import('../pages/foundation/FoundationGraduationAlumniPage').then(m => ({ default: m.FoundationGraduationAlumniPage })))
const FoundationInformationPage = lazy(() => import('../pages/foundation/FoundationInformationPage').then(m => ({ default: m.FoundationInformationPage })))
const FoundationReportsPage = lazy(() => import('../pages/foundation/FoundationReportsPage').then(m => ({ default: m.FoundationReportsPage })))
const FoundationLaporanSdmPage = lazy(() => import('../pages/foundation/reports/LaporanSdmPage').then(m => ({ default: m.LaporanSdmPage })))
const FoundationLaporanSiswaPage = lazy(() => import('../pages/foundation/reports/LaporanSiswaPage').then(m => ({ default: m.LaporanSiswaPage })))
const FoundationLaporanMutasiPage = lazy(() => import('../pages/foundation/reports/LaporanMutasiPage').then(m => ({ default: m.LaporanMutasiPage })))
const FoundationLaporanKelulusanPage = lazy(() => import('../pages/foundation/reports/LaporanKelulusanPage').then(m => ({ default: m.LaporanKelulusanPage })))
const FoundationLaporanAlumniPage = lazy(() => import('../pages/foundation/reports/LaporanAlumniPage').then(m => ({ default: m.LaporanAlumniPage })))
const FoundationLaporanLintasUnitPage = lazy(() => import('../pages/foundation/reports/LaporanLintasUnitPage').then(m => ({ default: m.LaporanLintasUnitPage })))
const FoundationLaporanPrestasiPage = lazy(() => import('../pages/foundation/reports/LaporanPrestasiPage').then(m => ({ default: m.LaporanPrestasiPage })))
const FoundationNotificationsPage = lazy(() => import('../pages/foundation/FoundationNotificationsPage').then(m => ({ default: m.FoundationNotificationsPage })))
const FoundationProfilePage = lazy(() => import('../pages/foundation/FoundationProfilePage').then(m => ({ default: m.FoundationProfilePage })))
import RouteErrorElement from '../components/common/RouteErrorElement'
import { HeroUiTopProgressBar, HeroUiPageFallback } from '../components/common'
import { useAuthStore } from '../stores/authStore'
import { ROLES, hasAnyRole, resolveDefaultPortal, getUserRoleLevel, ROLE_LEVELS } from '../auth/portalResolver'

const portalDestination = (userOrRoles) =>
  resolveDefaultPortal(Array.isArray(userOrRoles) ? { roles: userOrRoles } : (userOrRoles || {}))

function PortalRootRedirect() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const dbRoute = user?.access_policy?.default_route || user?.default_redirect
  if (typeof dbRoute === 'string' && dbRoute.startsWith('/portal')) {
    return <Navigate to={dbRoute} replace />
  }
  const isSuperAdminOrStaff =
    ['super_admin', 'admin', 'foundation', 'education', 'principal', 'waka', 'tu', 'operator', 'teacher', 'musyrif', 'staff'].includes(user?.access_policy?.portal_group) ||
    hasAnyRole(roles, [
      ...ROLES.SUPER_ADMIN,
      ...ROLES.ADMIN,
      ...ROLES.YAYASAN,
      ...ROLES.DIVISI,
      ...ROLES.KEPALA_SEKOLAH,
      ...ROLES.WAKA,
      ...ROLES.TATA_USAHA,
      ...ROLES.GURU,
    ])

  if (hasAnyRole(roles, ROLES.SISWA) && !isSuperAdminOrStaff) {
    return <Navigate to="/portal-siswa" replace />
  }
  if (hasAnyRole(roles, ROLES.ALUMNI) && !isSuperAdminOrStaff) {
    return <Navigate to="/portal-alumni" replace />
  }
  return <Navigate to="/portal-orangtua" replace />
}

class PageErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('PageErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-6 mx-auto max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182232] text-slate-800 shadow-xl dark:border-slate-800 dark:text-slate-100 overflow-hidden">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="size-10 rounded-lg bg-rose-50 border border-slate-200 dark:border-slate-800 text-rose-600 flex items-center justify-center font-bold text-base shadow-xs dark:bg-rose-950/60 dark:border-slate-800 dark:text-rose-400">
              !
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Gagal Memuat Konten Halaman</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Terjadi kesalahan pada komponen halaman yang sedang dimuat.</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 mb-5 overflow-x-auto max-h-32">
            {this.state.error?.message || 'Terjadi kesalahan sistem saat memproses tampilan halaman.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm font-medium transition-all active:scale-95 cursor-pointer shadow-xs dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Muat Ulang Halaman
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/dashboard'
              }}
              className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all active:scale-95 cursor-pointer shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function BungkusLazy({ children }) {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<HeroUiPageFallback />}>{children}</Suspense>
    </PageErrorBoundary>
  )
}

function RouteTerlindungi() {
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isSessionValid = useAuthStore((state) => state.isSessionValid)
  const clearSession = useAuthStore((state) => state.clearSession)

  const sessionStatus = isSessionValid()
  const isInvalid = !isAuthenticated || !sessionStatus.valid

  useEffect(() => {
    if (!isInitializing && isInvalid) {
      clearSession()
    }
  }, [isInitializing, isInvalid, clearSession])

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="w-10 h-10 border-4 border-slate-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Memverifikasi Sesi...</p>
      </div>
    )
  }

  if (isInvalid) {
    const reasonParam = sessionStatus.reason && sessionStatus.reason !== 'no_token' ? `?reason=${sessionStatus.reason}` : ''
    return <Navigate to={`/masuk${reasonParam}`} replace />
  }

  return (
    <>
      <HeroUiTopProgressBar />
      <Outlet />
    </>
  )
}

function isDbPathAllowed(user, pathname) {
  const accessiblePaths = Array.isArray(user?.accessible_paths) ? user.accessible_paths : []
  return accessiblePaths.some((p) => {
    if (!p || typeof p !== 'string') return false
    if (pathname === p) return true
    if (p === '/' || p === '/dashboard') return false
    return pathname.startsWith(p + '/')
  })
}

function RouteRole({ allow, deny = [], children }) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const roles = user?.roles || []
  const permissions = user?.permissions || []
  const isSuperAdmin = getUserRoleLevel(user) === ROLE_LEVELS.SUPER_ADMIN || hasAnyRole(roles, ['Super Admin', 'SuperAdmin', 'super_admin']) // Level 1
  const explicitPathAllowed = isDbPathAllowed(user, location.pathname)
  const isNonCanonicalCustom = Boolean(user?.access_policy && user.access_policy.is_canonical_role === false)
  const portalGroup = user?.access_policy?.portal_group || ''
  const isExternalPortal = ['parent', 'student', 'alumni'].includes(portalGroup)
  const bypassDeny = explicitPathAllowed || (isNonCanonicalCustom && !isExternalPortal)
  const hasDeniedRole = !bypassDeny && deny.length > 0 && hasAnyRole(roles, deny)
  const hasAccess = isSuperAdmin || explicitPathAllowed || (!hasDeniedRole && (
    !allow ||
    allow.length === 0 ||
    hasAnyRole(roles, allow) ||
    (isNonCanonicalCustom && !isExternalPortal && permissions.length > 0)
  ))

  if (!hasAccess) {
    const dest = portalDestination(user || roles)
    const currentPath = location.pathname
    if (dest === currentPath || currentPath.startsWith(dest)) {
      return <Navigate to="/masuk" replace />
    }
    return <Navigate to={dest} replace />
  }
  return children || <Outlet />
}

function RoleElement({ allow, children }) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const roles = user?.roles || []
  const permissions = user?.permissions || []
  const isSuperAdmin = getUserRoleLevel(user) === ROLE_LEVELS.SUPER_ADMIN || hasAnyRole(roles, ['Super Admin', 'SuperAdmin', 'super_admin'])
  const explicitPathAllowed = isDbPathAllowed(user, location.pathname)
  const hasAccess = isSuperAdmin || explicitPathAllowed || hasAnyRole(roles, allow) || permissions.length > 0
  if (!hasAccess) {
    const dest = portalDestination(user || roles)
    const currentPath = location.pathname
    if (dest === currentPath || currentPath.startsWith(dest)) {
      return <Navigate to="/masuk" replace />
    }
    return <Navigate to={dest} replace />
  }
  return children
}

function PermissionElement({ any = [], roles: allowedRoles = [], deniedRoles = [], children }) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const roles = user?.roles || []
  const permissions = user?.permissions || []
  const isSuperAdmin = getUserRoleLevel(user) === ROLE_LEVELS.SUPER_ADMIN || hasAnyRole(roles, ['Super Admin', 'SuperAdmin', 'super_admin']) // Level 1
  const explicitPathAllowed = isDbPathAllowed(user, location.pathname)
  const hasPermission = any.length === 0 || any.some((permission) => permissions.includes(permission))
  const hasRoleMatch = allowedRoles.length > 0 && hasAnyRole(roles, allowedRoles)

  const policy = user?.access_policy || null
  const isCustomMenuMode = Boolean(policy?.has_custom_menu_access)
  const isNonCanonicalCustom = Boolean(policy && policy.is_canonical_role === false)
  const portalGroup = policy?.portal_group || ''
  const isExternalPortal = ['parent', 'student', 'alumni'].includes(portalGroup)

  const canBypassDeniedRoles =
    explicitPathAllowed ||
    (!isExternalPortal && any.length > 0 && hasPermission && (isCustomMenuMode || isNonCanonicalCustom))

  const hasDeniedRole = !canBypassDeniedRoles && deniedRoles.length > 0 && hasAnyRole(roles, deniedRoles)

  // DB-Driven: Explicit role_menu_access & database permissions take precedence over hardcoded fallback lists
  const isAllowed =
    isSuperAdmin ||
    explicitPathAllowed ||
    (any.length > 0 && isCustomMenuMode && !isExternalPortal ? hasPermission : (hasPermission && !hasDeniedRole) || hasRoleMatch)

  if (!isAllowed) {
    const dest = portalDestination(user || roles)
    const currentPath = location.pathname
    if (dest === currentPath || currentPath.startsWith(dest)) {
      return <Navigate to="/dashboard" replace />
    }
    return <Navigate to={dest} replace />
  }

  return children || <Outlet />
}


function AbsensiIndex() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const userLevel = getUserRoleLevel(user)
  const portalGroup = user?.access_policy?.portal_group

  if (portalGroup === 'student' || userLevel === ROLE_LEVELS.SISWA || hasAnyRole(roles, ['Siswa'])) return <Navigate to="/absensi/kehadiran-saya" replace /> // Level 8
  if (portalGroup === 'teacher' || userLevel === ROLE_LEVELS.GURU || hasAnyRole(roles, ['Guru', 'Wali Kelas'])) { // Level 5
    if (hasAnyRole(roles, ['Wali Kelas'])) return <Navigate to="/absensi/dashboard-wali-kelas" replace />
    return <Navigate to="/portal-guru" replace />
  }
  if (['super_admin', 'admin', 'foundation', 'education', 'principal', 'waka', 'tu', 'operator'].includes(portalGroup) || userLevel <= ROLE_LEVELS.KEPALA_SEKOLAH || hasAnyRole(roles, [ // Level <= 4 (Admin, Yayasan, Operator, Kepsek)
    'Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator', 'Admin', 'Super Admin',
    'Kepala Sekolah', 'kepala_sekolah', 'kepsek', 'KepalaSekolah',
    'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan'
  ])) {
    return <Navigate to="/dashboard/absensi-pembelajaran" replace />
  }
  return <Navigate to="/dashboard" replace />
}

function PresensiRedirect() {
  const [searchParams] = useSearchParams()
  const q = new URLSearchParams(searchParams)
  if (!q.has('tab')) q.set('tab', 'presensi')
  return <Navigate to={`/portal-guru/workspace?${q.toString()}`} replace />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/masuk" replace />,
  },
  {
    path: '/masuk',
    element: (
      <BungkusLazy>
        <LoginPage />
      </BungkusLazy>
    ),
  },
  {
    path: '/masuk-keluarga',
    element: <Navigate to="/masuk" replace />,
  },
  {
    path: '/login',
    element: <Navigate to="/masuk" replace />,
  },
  {
    path: '/auth',
    element: <Navigate to="/masuk" replace />,
  },
  {
    path: '/authentication',
    element: <Navigate to="/masuk" replace />,
  },
  {
    element: <RouteTerlindungi />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        path: '/mutabaah',
        element: <Navigate to="/dashboard/mutabaah" replace />,
      },
      {
        path: '/mutabaah/agenda',
        element: <Navigate to="/dashboard/mutabaah/agenda" replace />,
      },
      {
        path: '/mutabaah/rekap',
        element: <Navigate to="/dashboard/mutabaah/rekap" replace />,
      },
      {
        path: '/mutabaah/target-evaluasi',
        element: <Navigate to="/dashboard/mutabaah/target-evaluasi" replace />,
      },
      {
        path: '/mutabaah/rincian-agenda',
        element: <Navigate to="/dashboard/mutabaah/rincian-agenda" replace />,
      },
      {
        path: '/mutabaah/template-agenda',
        element: <Navigate to="/dashboard/mutabaah/template-agenda" replace />,
      },
      {
        path: '/mutabaah/assign-template',
        element: <Navigate to="/dashboard/mutabaah/assign-template" replace />,
      },
      {
        path: '/mutabaah/assign-pembimbing',
        element: <Navigate to="/dashboard/mutabaah/assign-pembimbing" replace />,
      },
      {
        path: '/mutabaah/monitoring-orang-tua',
        element: <Navigate to="/dashboard/mutabaah/monitoring-orang-tua" replace />,
      },
      {
        path: '/mutabaah/*',
        element: <Navigate to="/dashboard/mutabaah" replace />,
      },
      {
        path: '/tahfizh',
        element: <Navigate to="/dashboard/tahfizh" replace />,
      },
      {
        path: '/tahfizh/rekapan',
        element: <Navigate to="/dashboard/tahfizh/rekapan" replace />,
      },
      {
        path: '/tahfizh/laporan',
        element: <Navigate to="/dashboard/laporan-tahfizh" replace />,
      },
      {
        path: '/tahfizh/pengaturan-target',
        element: <Navigate to="/dashboard/tahfizh/pengaturan-target" replace />,
      },
      {
        path: '/tahfizh/*',
        element: <Navigate to="/dashboard/tahfizh" replace />,
      },
      {
        path: '/absensi-gerbang',
        element: <Navigate to="/dashboard/rekap-absensi-gerbang" replace />,
      },
      {
        path: '/absensi-pembelajaran',
        element: <Navigate to="/dashboard/absensi-pembelajaran" replace />,
      },
      {
        path: '/absensi-ibadah',
        element: <Navigate to="/dashboard/absensi-ibadah" replace />,
      },
      {
        path: '/absensi-ibadah-siswa',
        element: <Navigate to="/dashboard/absensi-ibadah-siswa" replace />,
      },
      {
        path: '/portal-guru',
        element: (
          <RouteRole
            allow={['Guru', 'Guru Mata Pelajaran', 'Guru PAI', 'Pembimbing', 'Wali Kelas', 'Guru Tahfizh', 'Guru BK', 'Musyrif', 'Musyrifah', 'Musyrif / Musyrifah', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'Kepala Bidang Pendidikan', 'Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Pengurus', 'Super Admin', 'SuperAdmin', 'Admin']}
            deny={[]}
          >
            <BungkusLazy>
              <DashboardLayout />
            </BungkusLazy>
          </RouteRole>
        ),
        children: [
          { index: true, element: <Navigate to="/portal-guru/workspace" replace /> },
          { path: 'workspace', element: <BungkusLazy><TeacherTeachingWorkspacePage /></BungkusLazy> },
        ],
      },
      {
        path: '/portal-orangtua',
        element: (
          <BungkusLazy>
            <DashboardLayout />
          </BungkusLazy>
        ),
        children: [{ element: <RouteRole allow={['Orang Tua', 'Orangtua', 'Wali Murid', 'orang_tua', 'parent']} />, children: [
          { index: true, element: <BungkusLazy><ParentPortalPage /></BungkusLazy> },
        ] }],
      },
      {
        path: '/portal-siswa',
        element: (
          <BungkusLazy>
            <DashboardLayout />
          </BungkusLazy>
        ),
        children: [{ element: <RouteRole allow={['Siswa', 'siswa', 'student', 'Orang Tua', 'Orangtua', 'Wali Murid', 'orang_tua', 'parent']} />, children: [
          { index: true, element: <BungkusLazy><StudentPortalPage section="ringkasan" /></BungkusLazy> },
          { path: 'profil', element: <BungkusLazy><StudentPortalPage section="profile" /></BungkusLazy> },
          { path: 'informasi-sekolah', element: <BungkusLazy><StudentPortalPage section="announcements" /></BungkusLazy> },
          { path: 'jadwal', element: <BungkusLazy><StudentPortalPage section="schedules" /></BungkusLazy> },
          { path: 'materi', element: <BungkusLazy><StudentPortalPage section="materials" /></BungkusLazy> },
          { path: 'tugas', element: <BungkusLazy><StudentPortalPage section="assignments" /></BungkusLazy> },
          { path: 'tahfizh', element: <BungkusLazy><StudentPortalPage section="tahfizh" /></BungkusLazy> },
          { path: 'nilai', element: <BungkusLazy><StudentPortalPage section="grades" /></BungkusLazy> },
          { path: 'komentar-guru', element: <BungkusLazy><StudentPortalPage section="student-notes" /></BungkusLazy> },
          { path: 'tata-tertib', element: <BungkusLazy><StudentPortalPage section="discipline" /></BungkusLazy> },
          { path: 'mutabaah', element: <BungkusLazy><StudentPortalPage section="mutabaah" /></BungkusLazy> },
          { path: 'absensi', element: <BungkusLazy><StudentPortalPage section="attendance" /></BungkusLazy> },
          { path: 'kisi-kisi', element: <BungkusLazy><StudentPortalPage section="kisi" /></BungkusLazy> },
          { path: 'ujian-cbt', element: <BungkusLazy><StudentPortalPage section="ujian" /></BungkusLazy> },
          { path: 'hasil', element: <BungkusLazy><StudentPortalPage section="hasil" /></BungkusLazy> },
          { path: 'tagihan', element: <BungkusLazy><StudentPortalPage section="bills" /></BungkusLazy> },
        ] }],
      },
      {
        path: '/portal',
        element: <PortalRootRedirect />,
      },
      {
        path: '/portal/orang-tua',
        element: (
          <BungkusLazy>
            <DashboardLayout />
          </BungkusLazy>
        ),
        children: [{ element: <RouteRole allow={['Orang Tua', 'Orangtua', 'Wali Murid', 'orang_tua', 'parent']} />, children: [
          { index: true, element: <BungkusLazy><ParentPortalPage /></BungkusLazy> },
        ] }],
      },
      {
        path: '/portal/siswa',
        element: (
          <BungkusLazy>
            <DashboardLayout />
          </BungkusLazy>
        ),
        children: [{ element: <RouteRole allow={['Siswa', 'siswa', 'student']} />, children: [
          { index: true, element: <BungkusLazy><StudentPortalPage section="ringkasan" /></BungkusLazy> },
        ] }],
      },
      {
        path: '/portal/alumni',
        element: (
          <BungkusLazy>
            <DashboardLayout />
          </BungkusLazy>
        ),
        children: [{ element: <RouteRole allow={['Alumni', 'Super Admin', 'SuperAdmin']} />, children: [
          { index: true, element: <BungkusLazy><AlumniPortalPage /></BungkusLazy> },
        ] }],
      },
      {
        path: '/portal-alumni',
        element: (
          <BungkusLazy>
            <DashboardLayout />
          </BungkusLazy>
        ),
        children: [{ element: <RouteRole allow={['Alumni', 'Super Admin', 'SuperAdmin']} />, children: [
          { index: true, element: <BungkusLazy><AlumniPortalPage /></BungkusLazy> },
        ] }],
      },
      {
        path: '/musyrif',
        element: (
          <BungkusLazy>
            <DashboardLayout />
          </BungkusLazy>
        ),
        children: [
          { index: true, element: <Navigate to="/musyrif/workspace" replace /> },
          {
            path: 'workspace',
            element: (
              <PermissionElement any={['dashboard.musyrif.view', 'worship.dashboard.view', 'asrama.activity.view', 'dormitory.view']}>
                <BungkusLazy><MusyrifDashboardPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
        ],
      },
      {
        path: '/absensi',
        element: (
          <RouteRole allow={[
            ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN,
            ...ROLES.DIVISI, ...ROLES.KEPALA_SEKOLAH, ...ROLES.WAKA,
            ...ROLES.TATA_USAHA, ...ROLES.GURU, ...ROLES.SISWA,
          ]}>
            <BungkusLazy>
              <DashboardLayout />
            </BungkusLazy>
          </RouteRole>
        ),
        children: [
          { index: true, element: <AbsensiIndex /> },
          { path: 'dashboard-guru', element: <Navigate to="/portal-guru" replace /> },
          { path: 'kbm', element: <Navigate to="/dashboard/absensi-pembelajaran" replace /> },
          { path: 'gerbang', element: <Navigate to="/dashboard/absensi-gerbang" replace /> },
          { path: 'ibadah', element: <Navigate to="/dashboard/absensi-ibadah" replace /> },
          { path: 'ibadah-siswa', element: <Navigate to="/dashboard/absensi-ibadah-siswa" replace /> },
          { path: 'jadwal-mengajar', element: <Navigate to="/portal-guru/workspace?tab=jadwal" replace /> },
          { path: 'presensi', element: <PresensiRedirect /> },
          { path: 'presensi/tambah', element: <PresensiRedirect /> },
          { path: 'presensi/:id', element: <PresensiRedirect /> },
          { path: 'presensi/:id/edit', element: <PresensiRedirect /> },
          { path: 'riwayat-guru', element: <Navigate to="/portal-guru/workspace?tab=rekap" replace /> },
          {
            path: 'dashboard-wali-kelas',
            element: (
              <PermissionElement
                roles={['Wali Kelas', 'walas', 'wali_kelas', 'Kepala Sekolah', 'kepala_sekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'Kepala Bidang Pendidikan', 'Admin']}
                any={['attendance.homeroom.dashboard', 'homeroom_attendance.dashboard']}
              >
                <BungkusLazy>
                  <HomeroomAttendanceDashboardPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          { path: 'rekap-kehadiran', element: <BungkusLazy><HomeroomAttendanceRecapPage /></BungkusLazy> },
          { path: 'verifikasi-izin', element: <BungkusLazy><AttendancePermissionReviewPage /></BungkusLazy> },
          { path: 'koreksi', element: <BungkusLazy><AttendanceCorrectionPage /></BungkusLazy> },
          { path: 'tindak-lanjut', element: <BungkusLazy><AttendanceFollowUpListPage /></BungkusLazy> },
          { path: 'tindak-lanjut/tambah', element: <BungkusLazy><AttendanceFollowUpListPage /></BungkusLazy> },
          { element: <RouteRole allow={['Siswa', 'siswa', 'student']} />, children: [
            { element: <PermissionElement any={['student_attendance.view_own']} />, children: [
              { path: 'kehadiran-saya', element: <BungkusLazy><StudentAttendancePage /></BungkusLazy> },
              { path: 'riwayat-saya', element: <BungkusLazy><StudentAttendanceHistoryPage /></BungkusLazy> },
            ] },
            { path: 'pengajuan-izin', element: <Navigate to="/portal-siswa" replace /> },
            { path: 'pengajuan-izin/tambah', element: <Navigate to="/portal-siswa" replace /> },
            { path: 'pengajuan-izin/:id', element: <Navigate to="/portal-siswa" replace /> },
            { path: 'pengajuan-izin/:id/edit', element: <Navigate to="/portal-siswa" replace /> },
          ] },
          { path: 'laporan', element: <BungkusLazy><AttendanceReportPage /></BungkusLazy> },
          { path: 'rekap-data', element: <Navigate to="/absensi/laporan" replace /> },
          // Fail closed for unknown attendance URLs. Rendering the generic
          // workspace here made a direct typo/forged child path appear valid.
          {
            path: '*',
            element: <Navigate to="/absensi" replace />,
          },
        ],
      },
      {
        path: '/dashboard',
        element: (
          <RouteRole allow={[
            ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN,
            ...ROLES.YAYASAN,
            ...ROLES.DIVISI,
            ...ROLES.KEPALA_SEKOLAH,
            ...ROLES.WAKA,
            'Waka Kesantrian', 'waka_kesantrian', 'Wakil Kesantrian', 'Kepala Asrama',
            ...ROLES.TATA_USAHA,
            ...ROLES.GURU,
            ...ROLES.SISWA,
            ...ROLES.ORANG_TUA,
          ]}>
            <BungkusLazy>
              <DashboardLayout />
            </BungkusLazy>
          </RouteRole>
        ),
        children: [
          {
            index: true,
            element: (
              <BungkusLazy>
                <MultiRoleDashboardPage />
              </BungkusLazy>
            ),
          },
           {
             path: 'yayasan/laporan/prestasi',
             element: (
               <PermissionElement
                 roles={[...ROLES.KEPALA_SEKOLAH, ...ROLES.YAYASAN, ...ROLES.DIVISI, ...ROLES.WAKA_KESISWAAN, ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN]}
                 any={['kesiswaan.rekap_prestasi', 'kesiswaan.prestasi_rekapitulasi', 'report.prestasi.view', 'report.view', 'foundation.report.view', 'dashboard.pemantauan.lihat']}
               >
                 <BungkusLazy>
                   <FoundationLaporanPrestasiPage />
                 </BungkusLazy>
               </PermissionElement>
             ),
           },
           {
             path: 'yayasan',
             element: (
               <PermissionElement
                 any={[
                   'foundation.dashboard.view',
                   'foundation.unit.view',
                   'foundation.employee.view',
                   'foundation.student.view',
                   'foundation.report.view',
                 ]}
                 roles={[
                   'Yayasan',
                   'Ketua Yayasan',
                   'Pengurus Yayasan',
                   'Sekretaris Yayasan',
                   'Bendahara Yayasan',
                   'ketua_yayasan',
                   'pengurus_yayasan',
                   'sekretaris_yayasan',
                   'bendahara_yayasan',
                 ]}
               />
             ),
             children: [
               { index: true, element: <BungkusLazy><FoundationDashboardPage /></BungkusLazy> },
               { path: 'unit-pendidikan', element: (
                  <PermissionElement any={['unit.view', 'unit.view_all', 'foundation.unit.view']} deniedRoles={['Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan']}>
                    <BungkusLazy><FoundationUnitsPage /></BungkusLazy>
                  </PermissionElement>
                ) },
               { path: 'unit-pendidikan/:id', element: <BungkusLazy><FoundationUnitDetailPage /></BungkusLazy> },
               { path: 'struktur-organisasi', element: <BungkusLazy><FoundationOrgStructurePage /></BungkusLazy> },
               { path: 'pegawai-guru', element: <BungkusLazy><FoundationEmployeesPage /></BungkusLazy> },
               { path: 'pegawai-guru/:id', element: <BungkusLazy><FoundationEmployeesPage /></BungkusLazy> },
               { path: 'siswa', element: <BungkusLazy><FoundationStudentsPage /></BungkusLazy> },
               { path: 'siswa/:id', element: <BungkusLazy><FoundationStudentsPage /></BungkusLazy> },
               { path: 'siswa-baru', element: <BungkusLazy><FoundationNewStudentsPage /></BungkusLazy> },
               { path: 'mutasi-siswa', element: <BungkusLazy><FoundationMutationsPage /></BungkusLazy> },
               { path: 'kelulusan-alumni', element: <BungkusLazy><FoundationGraduationAlumniPage /></BungkusLazy> },
               { path: 'informasi-sekolah', element: <BungkusLazy><FoundationInformationPage /></BungkusLazy> },
               { path: 'berita-informasi', element: <PermissionElement roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN, ...ROLES.DIVISI, ...ROLES.KEPALA_SEKOLAH, ...ROLES.WAKA, ...ROLES.TATA_USAHA]} deniedRoles={ROLES.GURU} any={['foundation.information.view', 'sekolah.informasi_sekolah', 'sistem.master_data']}><BungkusLazy><NewsManagementPage /></BungkusLazy></PermissionElement> },
               { path: 'laporan', element: <BungkusLazy><FoundationReportsPage /></BungkusLazy> },
               { path: 'laporan/sdm', element: <BungkusLazy><FoundationLaporanSdmPage /></BungkusLazy> },
               { path: 'laporan/siswa', element: <BungkusLazy><FoundationLaporanSiswaPage /></BungkusLazy> },
               { path: 'laporan/tahfizh', element: <BungkusLazy><LaporanTahfizhPage /></BungkusLazy> },
               { path: 'laporan/mutasi', element: <BungkusLazy><FoundationLaporanMutasiPage /></BungkusLazy> },
               { path: 'laporan/kelulusan', element: <BungkusLazy><FoundationLaporanKelulusanPage /></BungkusLazy> },
               { path: 'laporan/alumni', element: <BungkusLazy><FoundationLaporanAlumniPage /></BungkusLazy> },
               { path: 'laporan/lintas-unit', element: <BungkusLazy><FoundationLaporanLintasUnitPage /></BungkusLazy> },
               { path: 'laporan/prestasi', element: <BungkusLazy><FoundationLaporanPrestasiPage /></BungkusLazy> },
               { path: 'notifikasi', element: <BungkusLazy><FoundationNotificationsPage /></BungkusLazy> },
               { path: 'profil', element: <BungkusLazy><FoundationProfilePage /></BungkusLazy> },
             ],
           },
            { path: 'guru', element: <Navigate to="/portal-guru/workspace" replace /> },
            { path: 'kepala-sekolah', element: <PermissionElement roles={[...ROLES.KEPALA_SEKOLAH, ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN]} any={['dashboard.kepala-sekolah.view', 'dashboard.kepala_sekolah.view', 'kepala_sekolah.dashboard']}><BungkusLazy><KepalaSekolahDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'wali-kelas', element: <PermissionElement any={['dashboard.guru.view']}><BungkusLazy><WaliKelasDashboardPage /></BungkusLazy></PermissionElement> },
           {
             path: 'divisi-pendidikan',
             element: (
               <PermissionElement
                 roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN, ...ROLES.DIVISI, ...ROLES.KEPALA_SEKOLAH]}
                 any={['dashboard.divisi-pendidikan.view', 'foundation.dashboard.view', 'dashboard.kepala-sekolah.view', 'divisi.monitoring']}
               >
                 <BungkusLazy>
                   <DivisiPendidikanDashboardPage />
                 </BungkusLazy>
               </PermissionElement>
             ),
           },
           {
             path: 'divisi-pendidikan/workspace',
             element: (
               <PermissionElement
                 roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN, ...ROLES.DIVISI, ...ROLES.KEPALA_SEKOLAH]}
                 any={['dashboard.divisi-pendidikan.view', 'foundation.dashboard.view', 'dashboard.kepala-sekolah.view', 'divisi.monitoring']}
               >
                 <BungkusLazy>
                   <DivisiPendidikanWorkspacePage />
                 </BungkusLazy>
               </PermissionElement>
             ),
           },
           { path: 'waka-kurikulum', element: <PermissionElement any={['dashboard.waka-kurikulum.view']}><BungkusLazy><WakaKurikulumDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'waka-kesiswaan', element: <PermissionElement any={['dashboard.waka-kesiswaan.view']}><BungkusLazy><WakaKesiswaanDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'tata-usaha', element: <PermissionElement any={['dashboard.tata-usaha.view']}><BungkusLazy><TataUsahaDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'guru-tahfizh', element: <PermissionElement roles={['Guru Tahfizh', 'guru_tahfizh', 'Musyrif', 'musyrif', 'Musyrifah', 'musyrifah', 'Musyrif / Musyrifah', ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.KEPALA_SEKOLAH]} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Pengurus', 'Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator', 'Orang Tua', 'orang_tua', 'Siswa', 'siswa']} any={['dashboard.guru-tahfizh.view', 'dashboard.kepala-sekolah.view']}><BungkusLazy><GuruTahfizhDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'guru-bk', element: <PermissionElement any={['dashboard.guru-bk.view']}><BungkusLazy><GuruBkDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'operator', element: <PermissionElement any={['dashboard.operator.view']}><BungkusLazy><OperatorDashboardPage /></BungkusLazy></PermissionElement> },
            { path: 'musyrif', element: <PermissionElement any={['dashboard.musyrif.view', 'dashboard.guru-tahfizh.view', 'dormitory.view']} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Pengurus', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator']}><BungkusLazy><MusyrifDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'asrama/izin', element: <PermissionElement any={['dashboard.guru-tahfizh.view', 'dashboard.musyrif.view', 'dormitory.view', 'asrama.activity.view', 'dormitory.permission.approve', 'dormitory.manage']} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Pengurus', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator']}><BungkusLazy><MusyrifDashboardPage defaultTab="perizinan" /></BungkusLazy></PermissionElement> },
          { path: 'chat-pegawai', element: <PermissionElement any={['chat.conversation.view', 'chat.manage']}><BungkusLazy><EmployeeChatPage /></BungkusLazy></PermissionElement> },
          { path: 'berita-informasi', element: <PermissionElement roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN, ...ROLES.DIVISI, ...ROLES.KEPALA_SEKOLAH, ...ROLES.WAKA, ...ROLES.TATA_USAHA]} deniedRoles={ROLES.GURU} any={['foundation.information.view', 'sekolah.informasi_sekolah', 'sistem.master_data']}><BungkusLazy><NewsManagementPage /></BungkusLazy></PermissionElement> },
          { path: 'akademik', element: <PermissionElement deniedRoles={ROLES.GURU} any={['academic.view', 'academic.manage']}><Navigate to="/dashboard/akademik/dashboard" replace /></PermissionElement> },
          { path: 'akademik/dashboard', element: <PermissionElement deniedRoles={ROLES.GURU} any={['academic.view', 'academic.manage']}><BungkusLazy><AcademicPage /></BungkusLazy></PermissionElement> },
          { path: 'akademik/pengaturan', element: <PermissionElement any={['academic.view', 'academic.manage']} deniedRoles={ROLES.GURU}><BungkusLazy><AcademicLmsContainerPage section="pengaturan" /></BungkusLazy></PermissionElement> },
          { path: 'akademik/perencanaan', element: <PermissionElement deniedRoles={ROLES.GURU} any={['academic.view', 'academic.manage']}><BungkusLazy><AcademicLmsContainerPage section="perencanaan" /></BungkusLazy></PermissionElement> },
          { path: 'akademik/pembelajaran', element: <PermissionElement deniedRoles={ROLES.GURU} any={['academic.view', 'academic.manage']}><BungkusLazy><AcademicLmsContainerPage section="pembelajaran" /></BungkusLazy></PermissionElement> },
          { path: 'akademik/evaluasi', element: <PermissionElement deniedRoles={ROLES.GURU} any={['academic.view', 'academic.manage']}><BungkusLazy><AcademicLmsContainerPage section="evaluasi" /></BungkusLazy></PermissionElement> },
          { path: 'akademik/nilai-rapor', element: <PermissionElement deniedRoles={ROLES.GURU} any={['academic.view', 'academic.manage']}><BungkusLazy><AcademicLmsContainerPage section="nilai-rapor" /></BungkusLazy></PermissionElement> },
          {
            path: 'pemantauan',
            element: (
              <PermissionElement roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN, ...ROLES.DIVISI, ...ROLES.KEPALA_SEKOLAH, ...ROLES.WAKA, ...ROLES.TATA_USAHA]} any={['dashboard.pemantauan.lihat', 'teacher_monitoring.view']}>
                <BungkusLazy>
                  <MonitoringDashboardPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            // § 1 Dashboard Monitoring Kepala Sekolah
            // Hak Akses: Kepsek & Divisi (+ Super Admin & Yayasan sebagai observer)
            path: 'monitoring-divisi',
            element: (
              <PermissionElement
                any={['divisi.monitoring', 'dashboard.pemantauan.kelola', 'dashboard.pemantauan.lihat']}
                roles={[
                  ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN,
                  ...ROLES.YAYASAN,
                  ...ROLES.DIVISI,
                  ...ROLES.KEPALA_SEKOLAH,
                ]}
              >
                <BungkusLazy>
                  <MonitoringDivisiPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'crud-demo',
            element: <Navigate to="/dashboard/master/siswa" replace />,
          },
          { path: 'siswa', element: <Navigate to="/dashboard/master/siswa" replace /> },
          { path: 'pegawai', element: <Navigate to="/dashboard/master/pegawai" replace /> },
          { path: 'kurikulum', element: <Navigate to="/dashboard/master/kurikulum" replace /> },
          { path: 'kelas', element: <Navigate to="/dashboard/master/kelas" replace /> },
          { path: 'tahun-ajaran', element: <Navigate to="/dashboard/master/tahun-ajaran" replace /> },
          { path: 'mata-pelajaran', element: <Navigate to="/dashboard/master/mata-pelajaran" replace /> },
          { path: 'unit-pendidikan', element: <Navigate to="/dashboard/master/unit-pendidikan" replace /> },
          { path: 'units', element: <Navigate to="/dashboard/master/unit-pendidikan" replace /> },
          { path: 'alumni', element: <Navigate to="/dashboard/kelola-alumni" replace /> },
          { path: 'super-admin', element: <Navigate to="/dashboard" replace /> },
          {
            path: 'laporan-prestasi',
            element: <Navigate to="/dashboard/yayasan/laporan/prestasi" replace />,
          },
          {
            path: 'mutasi-siswa',
            element: (
              <PermissionElement
                roles={[...ROLES.KEPALA_SEKOLAH, ...ROLES.YAYASAN, ...ROLES.TATA_USAHA, ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN]}
                any={['kesiswaan.laporan_mutasi', 'student.mutation.view', 'report.view', 'foundation.student.view']}
              >
                <BungkusLazy>
                  <FoundationMutationsPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          { path: 'laporan-lintas-unit', element: <Navigate to="/dashboard/yayasan/laporan/lintas-unit" replace /> },
          { path: 'rekap', element: <Navigate to="/dashboard/rekap-absensi-gerbang" replace /> },
          { path: 'laporan', element: <Navigate to="/dashboard/laporan-absensi" replace /> },
          {
            path: 'students',
            element: (
              <BungkusLazy>
                <StudentDataPage />
              </BungkusLazy>
            ),
            children: [
              {
                index: true,
                element: (
                  <PermissionElement any={['student.view', 'student.view_all', 'kesiswaan.data_lengkap_siswa']}>
                    <BungkusLazy><StudentsPage /></BungkusLazy>
                  </PermissionElement>
                ),
              },
              {
                path: 'input',
                element: (
                  <PermissionElement any={['student.create']}>
                    <BungkusLazy><StudentsPage /></BungkusLazy>
                  </PermissionElement>
                ),
              },
              {
                path: 'kelas',
                element: (
                  <PermissionElement any={['kesiswaan.kelas_rombel']}>
                    <BungkusLazy><MasterKelasPage /></BungkusLazy>
                  </PermissionElement>
                ),
              },
              {
                path: 'unit-pendidikan',
                element: (
                  <PermissionElement any={['unit.view', 'unit.view_all', 'foundation.unit.view']} deniedRoles={['Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan']}>
                    <BungkusLazy><EducationUnitsPage /></BungkusLazy>
                  </PermissionElement>
                ),
              },
              {
                path: 'pegawai',
                element: (
                  <PermissionElement any={['employee.view', 'employee.view_all', 'foundation.employee.view']}>
                    <BungkusLazy><EmployeesPage /></BungkusLazy>
                  </PermissionElement>
                ),
              },
              {
                path: 'jabatan',
                element: (
                  <PermissionElement any={['master.view', 'sistem.master_data']}>
                    <BungkusLazy><MasterJabatanPage /></BungkusLazy>
                  </PermissionElement>
                ),
              },
              {
                path: 'rombel',
                element: (
                  <PermissionElement any={['kesiswaan.kelas_rombel']}>
                    <BungkusLazy><MasterKelasPage /></BungkusLazy>
                  </PermissionElement>
                ),
              },
              {
                path: 'laporan',
                element: (
                  <PermissionElement any={['report.student.view', 'student.view', 'student.view_all', 'kesiswaan.data_lengkap_siswa']}>
                    <BungkusLazy><StudentsPage /></BungkusLazy>
                  </PermissionElement>
                ),
              },
            ],
          },
          {
            path: 'employees',
            element: (
              <PermissionElement any={['employee.view', 'employee.view_all', 'foundation.employee.view']}>
                <BungkusLazy><EmployeesPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-jabatan',
            element: (
              <PermissionElement any={['master.view', 'sistem.master_data']} deniedRoles={['Guru', 'guru', 'Wali Kelas', 'wali_kelas', 'Guru Mapel', 'Guru Tahfizh', 'Guru BK', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan']}>
                <BungkusLazy><MasterJabatanPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-jenis-unit',
            element: (
              <PermissionElement any={['unit.view', 'unit.view_all', 'sistem.master_data']} deniedRoles={['Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan']}>
                <BungkusLazy><MasterJenisUnitPendidikanPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-opsi-bisnis',
            element: (
              <PermissionElement any={['master.view', 'sistem.master_data', 'sistem.pengaturan']} deniedRoles={['Kepala Sekolah', 'kepala_sekolah']}>
                <BungkusLazy><MasterDataDinamisPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/opsi-bisnis',
            element: <Navigate to="/dashboard/master-opsi-bisnis" replace />,
          },
          {
            path: 'master-tahun-ajaran',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.KEPALA_SEKOLAH, ...ROLES.WAKA, ...ROLES.TATA_USAHA]}
                any={['master.view', 'sistem.master_data', 'academic.view', 'academic.manage', 'academic.tahun_ajaran']}
              >
                <BungkusLazy><MasterTahunAjaranPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/tahun-ajaran',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.KEPALA_SEKOLAH, ...ROLES.WAKA, ...ROLES.TATA_USAHA]}
                any={['master.view', 'sistem.master_data', 'academic.view', 'academic.manage', 'academic.tahun_ajaran']}
              >
                <BungkusLazy><MasterTahunAjaranPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/kurikulum',
            element: <Navigate to="/dashboard/master-kurikulum" replace />,
          },
          {
            path: 'master/modul-semester',
            element: <Navigate to="/dashboard/master-modul-semester" replace />,
          },
          {
            path: 'master/kelas',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage', 'kesiswaan.kelas_rombel']}>
                <BungkusLazy><MasterKelasPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/mata-pelajaran',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage', 'sistem.master_data']}>
                <BungkusLazy><MasterSubjectPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-hak-akses',
            element: (
              <PermissionElement any={['sistem.hak_akses', 'employee.role_access.manage', 'permission.manage', 'role.manage']}>
                <BungkusLazy><MasterHakAksesPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'akademik/jadwal',
            element: (
              <PermissionElement
                any={['academic.schedule.manage', 'academic.manage', 'sistem.master_data', 'pembelajaran.jadwal_pelajaran', 'academic.schedule.view']}
                roles={ROLES.DIVISI}
              >
                <BungkusLazy><MasterSchedulePage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-jadwal',
            element: <Navigate to="/dashboard/akademik/jadwal" replace />,
          },
          {
            path: 'akademik/jadwal-ujian',
            element: (
              <PermissionElement
                any={['academic.schedule.manage', 'academic.manage', 'sistem.master_data', 'pembelajaran.jadwal_pelajaran', 'academic.schedule.view']}
                roles={ROLES.DIVISI}
              >
                <BungkusLazy><ExamSchedulePage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'akademik/kalender',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage', 'sistem.master_data']}>
                <BungkusLazy><AcademicCalendarPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'informasi-sekolah',
            element: (
              <PermissionElement any={['foundation.info.view', 'school.view', 'sistem.master_data']}>
                <BungkusLazy><FoundationInformationPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah/agenda',
            element: <Navigate to="/dashboard/mutabaah/template-agenda" replace />,
          },
          {
            path: 'master-quran-surah',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.GURU, ...ROLES.MUSYRIF, ...ROLES.SISWA]}
                any={['sistem.master_data', 'equran.view', 'tahfizh.view', 'teacher.tahfizh.view', 'student.portal.view', 'teacher.dashboard.view', 'dashboard.view']}
              >
                <BungkusLazy>
                  <MasterQuranSurahPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-jadwal-sholat',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.GURU, ...ROLES.MUSYRIF, ...ROLES.SISWA]}
                any={['sistem.master_data', 'prayer.schedule.view', 'equran.view', 'tahfizh.view', 'teacher.tahfizh.view', 'teacher.dashboard.view']}
              >
                <BungkusLazy>
                  <MasterJadwalSholatPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/unit-pendidikan',
            element: (
              <PermissionElement any={['unit.view', 'unit.view_all', 'foundation.unit.view']} deniedRoles={['Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan']}>
                <BungkusLazy><EducationUnitsPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/guru',
            element: (
              <PermissionElement any={['employee.view', 'employee.view_all', 'foundation.employee.view']}>
                <BungkusLazy><EmployeesPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/pegawai',
            element: (
              <PermissionElement any={['employee.view', 'employee.view_all', 'foundation.employee.view']}>
                <BungkusLazy><EmployeesPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/siswa',
            element: (
              <PermissionElement any={['student.view', 'student.view_all', 'kesiswaan.data_lengkap_siswa']}>
                <BungkusLazy><StudentsPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/status-siswa',
            element: (
              <PermissionElement any={['student.view', 'student.manage', 'student.view_all', 'kesiswaan.data_lengkap_siswa', 'sistem.master_data', 'operator.manage']}>
                <BungkusLazy><MasterStatusSiswaPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/orang-tua',
            element: (
              <PermissionElement any={['student.view', 'student.view_all', 'kesiswaan.data_lengkap_siswa']}>
                <BungkusLazy><ParentsPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/alumni',
            element: (
              <PermissionElement any={['alumni.view', 'foundation.alumni.view']}>
                <BungkusLazy><FoundationGraduationAlumniPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'akademik/kelas',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage', 'kesiswaan.kelas_rombel']}>
                <BungkusLazy><MasterKelasPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'akademik/rombel',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage', 'kesiswaan.kelas_rombel']}>
                <BungkusLazy><MasterKelasPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'persetujuan-hapus',
            element: (
              <PermissionElement any={['approval.manage']}>
                <BungkusLazy><DeleteApprovalPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-doa',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.GURU, ...ROLES.MUSYRIF, ...ROLES.SISWA]}
                any={['sistem.master_data', 'equran.view', 'tahfizh.view', 'teacher.tahfizh.view', 'student.portal.view', 'teacher.dashboard.view', 'dashboard.view']}
              >
                <BungkusLazy>
                  <MasterDoaPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'poin-penilaian-doa',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.GURU, ...ROLES.MUSYRIF]}
                any={['sistem.master_data', 'tahfizh.view', 'tahfizh.manage', 'prayer.assessment.view', 'teacher.tahfizh.view']}
              >
                <BungkusLazy>
                  <PoinPenilaianDoaPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'tata-tertib',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.TATA_USAHA, ...ROLES.GURU, ...ROLES.MUSYRIF, ...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI, ...ROLES.WAKA]}
                any={['discipline.point.view', 'discipline.point.manage', 'sistem.master_data', 'dormitory.view', 'asrama.activity.view', 'dashboard.guru.view', 'dashboard.musyrif.view', 'dashboard.kepala-sekolah.view', 'dashboard.divisi-pendidikan.view']}
              >
                <BungkusLazy>
                  <DisciplinePointManagementPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/tata-tertib',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.TATA_USAHA, ...ROLES.GURU, ...ROLES.MUSYRIF, ...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI, ...ROLES.WAKA]}
                any={['discipline.point.view', 'discipline.point.manage', 'sistem.master_data', 'dormitory.view', 'asrama.activity.view', 'dashboard.guru.view', 'dashboard.musyrif.view', 'dashboard.kepala-sekolah.view', 'dashboard.divisi-pendidikan.view']}
              >
                <BungkusLazy>
                  <DisciplinePointManagementPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'kesantrian/tata-tertib',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.TATA_USAHA, ...ROLES.GURU, ...ROLES.MUSYRIF, ...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI, ...ROLES.WAKA]}
                any={['discipline.point.view', 'discipline.point.manage', 'sistem.master_data', 'dormitory.view', 'asrama.activity.view', 'dashboard.guru.view', 'dashboard.musyrif.view', 'dashboard.kepala-sekolah.view', 'dashboard.divisi-pendidikan.view']}
              >
                <BungkusLazy>
                  <DisciplinePointManagementPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'kedisiplinan',
            element: (
              <PermissionElement
                roles={[...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.TATA_USAHA, ...ROLES.GURU, ...ROLES.MUSYRIF, ...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI, ...ROLES.WAKA]}
                any={['discipline.point.view', 'discipline.point.manage', 'sistem.master_data', 'dormitory.view', 'asrama.activity.view', 'dashboard.guru.view', 'dashboard.musyrif.view', 'dashboard.kepala-sekolah.view', 'dashboard.divisi-pendidikan.view']}
              >
                <BungkusLazy>
                  <DisciplinePointManagementPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'hak-akses',
            element: (
              <PermissionElement any={['sistem.hak_akses', 'employee.role_access.manage', 'permission.manage', 'role.manage']}>
                <BungkusLazy><MasterHakAksesPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            // § 2 Sistem Absensi Digital — TU & Kepsek (+ Guru untuk monitoring kelas)
            path: 'attendance',
            element: (
              <PermissionElement
                roles={[
                  ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN,
                  ...ROLES.KEPALA_SEKOLAH, ...ROLES.WAKA,
                  ...ROLES.TATA_USAHA,
                  ...ROLES.GURU,
                ]}
                any={['attendance.view', 'attendance.manage', 'kehadiran.siswa.monitoring']}
              >
                <BungkusLazy><AttendancePage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            // § 2 Absensi Digital — TU & Kepsek
            path: 'absensi-gerbang',
            element: (
              <PermissionElement
                deniedRoles={ROLES.GURU}
                roles={[
                  ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN,
                  ...ROLES.KEPALA_SEKOLAH,
                  ...ROLES.TATA_USAHA,
                ]}
                any={['gate_attendance.view', 'kehadiran.siswa.absensi_digital']}
              >
                <BungkusLazy><GateAttendancePage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            // Absensi Ibadah — TU + Musyrif/Musyrifah + Kepsek
            path: 'absensi-ibadah',
            element: (
              <PermissionElement
                roles={[
                  ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN,
                  ...ROLES.KEPALA_SEKOLAH,
                  ...ROLES.TATA_USAHA,
                  'Musyrif', 'musyrif', 'Musyrifah', 'Musyrif / Musyrifah',
                ]}
                any={['attendance.view', 'attendance.manage', 'worship_attendance.view']}
              >
                <BungkusLazy><WorshipAttendancePage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            // Absensi Ibadah Siswa — TU + Guru + Kepsek
            path: 'absensi-ibadah-siswa',
            element: (
              <PermissionElement
                roles={[
                  ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN,
                  ...ROLES.KEPALA_SEKOLAH,
                  ...ROLES.TATA_USAHA,
                  ...ROLES.GURU,
                ]}
                any={['attendance.view', 'attendance.manage', 'student_worship_attendance.view']}
              >
                <BungkusLazy><StudentWorshipAttendancePage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            // § 3 Sistem Tahfizh & Mutabaah
            // Hak Akses: Kepsek, Div. Pendidikan, Guru
            // (Orang Tua & Siswa akses laporan via portal masing-masing)
            path: 'tahfizh',
            element: (
              <PermissionElement
                any={[
                  'tahfizh.view',
                  'tahfizh.deposit.view',
                  'tahfizh.deposit.create',
                  'tahfizh.input_setoran_harian',
                  'tahfizh.monitoring_target',
                  'tahfizh.laporan_target',
                  'dashboard.guru-tahfizh.view',
                  'dashboard.kepala-sekolah.view',
                  'dashboard.divisi-pendidikan.view',
                ]}
                roles={[
                  ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN,
                  ...ROLES.YAYASAN,
                  ...ROLES.DIVISI,
                  ...ROLES.KEPALA_SEKOLAH,
                  ...ROLES.WAKA,
                  ...ROLES.GURU,
                ]}
              >
                <BungkusLazy>
                  <TahfizhPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'tahfizh/pengaturan-target',
            element: (
              <PermissionElement
                any={[
                  'tahfizh.view',
                  'tahfizh.monitoring_target',
                  'tahfizh.laporan_target',
                  'dashboard.guru-tahfizh.view',
                  'dashboard.kepala-sekolah.view',
                  'dashboard.divisi-pendidikan.view',
                ]}
                roles={[
                  ...ROLES.SUPER_ADMIN, ...ROLES.ADMIN,
                  ...ROLES.YAYASAN,
                  ...ROLES.DIVISI,
                  ...ROLES.KEPALA_SEKOLAH,
                  ...ROLES.WAKA,
                  ...ROLES.GURU,
                ]}
              >
                <BungkusLazy>
                  <TahfizhTargetSettingPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'academic',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage']}>
                <BungkusLazy><AcademicPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'modul-ajar',
            element: <Navigate to="/dashboard/lms/modul-ajar" replace />,
          },
          {
            path: 'lms/modul-ajar',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsModulAjarPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-modul-semester',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <MasterModulSemesterPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-kurikulum',
            element: (
              <PermissionElement any={['academic.curriculum.view', 'master.view', 'sistem.master_data']}>
                <BungkusLazy>
                  <MasterKurikulumPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-subjects',
            element: (
              <BungkusLazy>
                <MasterSubjectPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'jadwal-pelajaran',
            element: (
              <PermissionElement
                any={['academic.schedule.manage', 'academic.manage', 'sistem.master_data', 'pembelajaran.jadwal_pelajaran', 'academic.schedule.view']}
                roles={ROLES.DIVISI}
              >
                <BungkusLazy>
                  <MasterSchedulePage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'jadwal-ujian',
            element: (
              <PermissionElement
                any={['academic.schedule.manage', 'academic.manage', 'sistem.master_data', 'pembelajaran.jadwal_pelajaran', 'academic.schedule.view']}
                roles={ROLES.DIVISI}
              >
                <BungkusLazy>
                  <ExamSchedulePage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-capaian-pembelajaran',
            element: <Navigate to="/dashboard/lms/capaian-pembelajaran" replace />,
          },
          {
            path: 'lms/capaian-pembelajaran',
            element: (
              <BungkusLazy>
                <MasterCapaianPembelajaranPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'master-tujuan-pembelajaran',
            element: <Navigate to="/dashboard/lms/tujuan-pembelajaran" replace />,
          },
          {
            path: 'lms/tujuan-pembelajaran',
            element: (
              <BungkusLazy>
                <MasterTujuanPembelajaranPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'materi-pembelajaran',
            element: <Navigate to="/dashboard/lms/materi" replace />,
          },
          {
            path: 'lms/materi-pembelajaran',
            element: <Navigate to="/dashboard/lms/materi" replace />,
          },
          {
            path: 'lms/materi',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsMateriPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'media-pembelajaran',
            element: <Navigate to="/dashboard/lms/media" replace />,
          },
          {
            path: 'lms/media-pembelajaran',
            element: <Navigate to="/dashboard/lms/media" replace />,
          },
          {
            path: 'lms/media',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsMediaPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'referensi-pembelajaran',
            element: <Navigate to="/dashboard/lms/referensi" replace />,
          },
          {
            path: 'lms/referensi-pembelajaran',
            element: <Navigate to="/dashboard/lms/referensi" replace />,
          },
          {
            path: 'lms/referensi',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsReferensiPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'aktivitas-belajar',
            element: <Navigate to="/dashboard/lms/aktivitas" replace />,
          },
          {
            path: 'lms/aktivitas-belajar',
            element: <Navigate to="/dashboard/lms/aktivitas" replace />,
          },
          {
            path: 'lms/aktivitas',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsAktivitasBelajarPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'diskusi-kelas',
            element: <Navigate to="/dashboard/lms/diskusi" replace />,
          },
          {
            path: 'lms/diskusi-kelas',
            element: <Navigate to="/dashboard/lms/diskusi" replace />,
          },
          {
            path: 'lms/diskusi',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsDiskusiPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'penugasan',
            element: <Navigate to="/dashboard/lms/penugasan" replace />,
          },
          {
            path: 'lms/penugasan',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsPenugasanPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'pengumpulan-tugas',
            element: <Navigate to="/dashboard/lms/pengumpulan-tugas" replace />,
          },
          {
            path: 'lms/pengumpulan-tugas',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsPengumpulanTugasPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'absensi-pembelajaran',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <AttendanceWorkspacePage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'presensi-pembelajaran',
            element: <Navigate to="/dashboard/absensi-pembelajaran" replace />,
          },
          {
            path: 'lms/presensi-pembelajaran',
            element: <Navigate to="/dashboard/absensi-pembelajaran" replace />,
          },
          {
            path: 'absensi/*',
            element: <Navigate to="/dashboard/absensi-pembelajaran" replace />,
          },
          {
            path: 'kisi-kisi-ujian',
            element: <Navigate to="/dashboard/lms/kisi-kisi" replace />,
          },
          {
            path: 'lms/kisi-kisi',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsKisiKisiPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'bank-soal',
            element: <Navigate to="/dashboard/lms/bank-soal" replace />,
          },
          {
            path: 'lms/bank-soal',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsBankSoalPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'ujian-online',
            element: <Navigate to="/dashboard/lms/ujian" replace />,
          },
          {
            path: 'lms/ujian-online',
            element: <Navigate to="/dashboard/lms/ujian" replace />,
          },
          {
            path: 'lms/cbt',
            element: <Navigate to="/dashboard/lms/ujian" replace />,
          },
          {
            path: 'lms/ujian',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsUjianPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'penilaian',
            element: <Navigate to="/dashboard/lms/penilaian" replace />,
          },
          {
            path: 'lms/penilaian',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage']} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', ...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsPenilaianPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'lms/penilaian-rapor',
            element: <Navigate to="/dashboard/lms/rapor" replace />,
          },
          {
            path: 'lms/rapor',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage']} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', ...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <LmsRaporPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <MutabaahDashboardPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah/rekap',
            element: (
              <PermissionElement deniedRoles={['Tata Usaha', 'TU', 'tu', 'tata_usaha', ...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <MutabaahRecapPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah/target-evaluasi',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <MutabaahTargetEvaluationPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah/rincian-agenda',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <MutabaahAgendaDetailPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah/template-agenda',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <MutabaahTemplatePage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah/assign-template',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <MutabaahTemplateAssignmentPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah/assign-pembimbing',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <MutabaahSupervisorAssignmentPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah/monitoring-orang-tua',
            element: (
              <PermissionElement deniedRoles={[...ROLES.ORANG_TUA, ...ROLES.SISWA]}>
                <BungkusLazy>
                  <MutabaahParentMonitoringPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'monitoring-tahfizh-ibadah-non-pesantren',
            element: (
              <PermissionElement deniedRoles={ROLES.GURU} any={['divisi.monitoring', 'dashboard.pemantauan.lihat', 'tahfizh.view', 'mutabaah.view', 'dashboard.kepala-sekolah.view', 'dashboard.divisi-pendidikan.view']}>
                <BungkusLazy>
                  <MonitoringTahfizhIbadahNonPesantrenPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'keuangan/tagihan-siswa',
            element: (
              <PermissionElement
                roles={[
                  ...ROLES.SUPER_ADMIN,
                  ...ROLES.ADMIN,
                  ...ROLES.KEPALA_SEKOLAH,
                  ...ROLES.TATA_USAHA,
                  'Divisi Pendidikan',
                  'divisi_pendidikan',
                  'Operator',
                  'operator',
                ]}
              >
                <BungkusLazy>
                  <StudentBillsManagementPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'finance/bills',
            element: <Navigate to="/dashboard/keuangan/tagihan-siswa" replace />,
          },
          {
            path: 'parents',
            element: (
              <BungkusLazy>
                <ParentsPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'notifications',
            element: (
              <BungkusLazy>
                <NotificationsPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'pengaturan',
            element: (
              <PermissionElement any={['sistem.pengaturan']} roles={['Super Admin', 'SuperAdmin', 'super_admin', 'superadmin', 'Admin', 'admin']} deniedRoles={['Kepala Sekolah', 'kepala_sekolah']}>
                <BungkusLazy><PengaturanPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'pengaturan/opsi-bisnis',
            element: <Navigate to="/dashboard/master-opsi-bisnis" replace />,
          },
          {
            path: 'pengaturan/data-dinamis',
            element: <Navigate to="/dashboard/master-opsi-bisnis" replace />,
          },
          {
            path: 'koneksi-api-mobile',
            element: (
              <PermissionElement roles={['Super Admin', 'SuperAdmin', 'super_admin', 'superadmin', 'Admin', 'admin']} deniedRoles={['Kepala Sekolah', 'kepala_sekolah']}>
                <BungkusLazy><MobileApiConfigPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'pengaturan/menu-navigasi',
            element: (
              <PermissionElement any={['sistem.pengaturan']} roles={['Super Admin', 'SuperAdmin', 'super_admin', 'superadmin', 'Admin', 'admin']} deniedRoles={['Kepala Sekolah', 'kepala_sekolah']}>
                <BungkusLazy><KelolaNavigasiMenuPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'pengaturan/pusat-data-sistem',
            element: (
              <PermissionElement any={['sistem.pengaturan', 'sistem.master_data']} roles={['Super Admin', 'SuperAdmin', 'super_admin', 'superadmin', 'Admin', 'admin']} deniedRoles={['Kepala Sekolah', 'kepala_sekolah']}>
                <BungkusLazy><SystemMaintenanceDataHubPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'pusat-data-sistem',
            element: <Navigate to="/dashboard/pengaturan/pusat-data-sistem" replace />,
          },
          {
            path: 'manajemen-menu',
            element: <Navigate to="/dashboard/pengaturan/menu-navigasi" replace />,
          },
          {
            path: 'bantuan',
            element: (
              <BungkusLazy>
                <BantuanPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'laporan-absensi',
            element: (
              <PermissionElement roles={['Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Admin', 'Super Admin', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan', ...ROLES.WAKA]} any={['report.attendance.view', 'report.view', 'attendance.view', 'kehadiran.siswa.monitoring']}>
                <BungkusLazy><LaporanAbsensiPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'laporan-tahfizh',
            element: (
              <PermissionElement deniedRoles={ROLES.GURU} any={['report.tahfizh.view', 'report.view']}>
                <BungkusLazy><LaporanTahfizhPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'tahfizh/rekapan',
            element: (
              <PermissionElement
                roles={[
                  ...ROLES.SUPER_ADMIN,
                  ...ROLES.ADMIN,
                  ...ROLES.YAYASAN,
                  ...ROLES.DIVISI,
                  ...ROLES.KEPALA_SEKOLAH,
                  ...ROLES.WAKA,
                  ...ROLES.GURU,
                ]}
                any={[
                  'report.tahfizh.view',
                  'report.view',
                  'tahfizh.view',
                  'tahfizh.laporan_target',
                  'dashboard.guru.view',
                  'dashboard.guru-tahfizh.view',
                ]}
              >
                <BungkusLazy><TahfizhReportSummaryPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'laporan-rekapan-tahfizh',
            element: (
              <PermissionElement
                roles={[
                  ...ROLES.SUPER_ADMIN,
                  ...ROLES.ADMIN,
                  ...ROLES.YAYASAN,
                  ...ROLES.DIVISI,
                  ...ROLES.KEPALA_SEKOLAH,
                  ...ROLES.WAKA,
                  ...ROLES.GURU,
                ]}
                any={[
                  'report.tahfizh.view',
                  'report.view',
                  'tahfizh.view',
                  'tahfizh.laporan_target',
                  'dashboard.guru.view',
                  'dashboard.guru-tahfizh.view',
                ]}
              >
                <BungkusLazy><TahfizhReportSummaryPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'laporan-akademik',
            element: (
              <PermissionElement any={['report.academic.view', 'report.view']}>
                <BungkusLazy><LaporanAkademikPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'laporan-siswa',
            element: (
              <PermissionElement any={['report.student.view', 'report.view']}>
                <BungkusLazy><LaporanSiswaPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'laporan-pegawai',
            element: (
              <PermissionElement any={['employee.view', 'employee.view_all', 'report.view']}>
                <BungkusLazy><LaporanPegawaiPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'laporan-lms',
            element: (
              <PermissionElement any={['lms.view', 'lms.manage', 'report.view']}>
                <BungkusLazy><LaporanLmsPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'laporan-alumni',
            element: (
              <PermissionElement deniedRoles={ROLES.GURU} any={['alumni.view', 'foundation.alumni.view', 'report.view', 'kesiswaan.alumni_tujuan_lanjut', 'kesiswaan.kelulusan_per_tahun']}>
                <BungkusLazy><LaporanAlumniPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'kelola-alumni',
            element: (
              <PermissionElement deniedRoles={ROLES.GURU} any={['alumni.view', 'foundation.alumni.view', 'kesiswaan.alumni_tujuan_lanjut', 'kesiswaan.kelulusan_per_tahun']}>
                <BungkusLazy><KelolaAlumniPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          { path: 'rekap-absensi-gerbang', element: <PermissionElement deniedRoles={ROLES.GURU} roles={['Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Admin', 'Super Admin', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan', ...ROLES.WAKA]} any={['report.attendance.view', 'attendance.view', 'attendance.manage', 'kehadiran.siswa.monitoring']}><BungkusLazy><RekapAbsensiGerbangPage /></BungkusLazy></PermissionElement> },
          { path: 'rekap-absensi-ibadah', element: <PermissionElement roles={['Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Admin', 'Super Admin', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan', ...ROLES.WAKA]} any={['report.attendance.view', 'attendance.view', 'attendance.manage', 'kehadiran.siswa.monitoring']}><BungkusLazy><RekapAbsensiIbadahPage /></BungkusLazy></PermissionElement> },
          {
            path: 'profil-akun',
            element: (
              <BungkusLazy>
                <UserProfileManagementPage />
              </BungkusLazy>
            ),
          },
          {
            path: '*',
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter

