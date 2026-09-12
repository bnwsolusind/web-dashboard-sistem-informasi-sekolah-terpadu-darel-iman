import { Suspense, lazy } from 'react'
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'

const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const StudentDataPage = lazy(() => import('../pages/StudentDataPage'))
const StudentsPage = lazy(() => import('../pages/StudentsPage'))
const EducationUnitsPage = lazy(() => import('../pages/EducationUnitsPage'))
const AttendancePage = lazy(() => import('../pages/AttendancePage'))
const TahfizhPage = lazy(() => import('../pages/TahfizhPage'))
const AcademicPage = lazy(() => import('../pages/AcademicPage'))
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const BeritaPublikPage = lazy(() => import('../pages/BeritaPublikPage'))
const PengaturanPage = lazy(() => import('../pages/PengaturanPage'))
const MobileApiConfigPage = lazy(() => import('../pages/MobileApiConfigPage'))
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
const MasterTahunAjaranPage = lazy(() => import('../pages/MasterTahunAjaranPage'))
const MasterModulSemesterPage = lazy(() => import('../pages/MasterModulSemesterPage'))
const MasterKurikulumPage = lazy(() => import('../pages/MasterKurikulumPage'))
const MasterSubjectPage = lazy(() => import('../pages/MasterSubjectPage'))
const MasterSchedulePage = lazy(() => import('../pages/MasterSchedulePage'))
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
import { useAuthStore } from '../stores/authStore'
import { ROLES, hasAnyRole, resolveDefaultPortal } from '../auth/portalResolver'

const portalDestination = (roles) => resolveDefaultPortal({ roles })

function BungkusLazy({ children }) {
  return <Suspense fallback={<section className="panel">Memuat halaman...</section>}>{children}</Suspense>
}

function RouteTerlindungi() {
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isSessionValid = useAuthStore((state) => state.isSessionValid)
  const clearSession = useAuthStore((state) => state.clearSession)

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Memverifikasi Sesi...</p>
      </div>
    )
  }

  const sessionStatus = isSessionValid()
  if (!isAuthenticated || !sessionStatus.valid) {
    clearSession()
    const reasonParam = sessionStatus.reason && sessionStatus.reason !== 'no_token' ? `?reason=${sessionStatus.reason}` : ''
    return <Navigate to={`/masuk${reasonParam}`} replace />
  }

  return <Outlet />
}

function RouteRole({ allow, deny = [], children }) {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const isSuperAdmin = hasAnyRole(roles, ['Super Admin', 'SuperAdmin', 'super_admin'])
  const hasDeniedRole = deny.length > 0 && hasAnyRole(roles, deny)
  if (!isSuperAdmin && (hasDeniedRole || (allow && !hasAnyRole(roles, allow)))) {
    const dest = portalDestination(roles)
    const currentPath = window.location.pathname
    if (dest === currentPath || currentPath.startsWith(dest)) {
      return <Navigate to="/masuk" replace />
    }
    return <Navigate to={dest} replace />
  }
  return children || <Outlet />
}

function RoleElement({ allow, children }) {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const isSuperAdmin = hasAnyRole(roles, ['Super Admin', 'SuperAdmin', 'super_admin'])
  if (!isSuperAdmin && !hasAnyRole(roles, allow)) {
    const dest = portalDestination(roles)
    const currentPath = window.location.pathname
    if (dest === currentPath || currentPath.startsWith(dest)) {
      return <Navigate to="/masuk" replace />
    }
    return <Navigate to={dest} replace />
  }
  return children
}

function PermissionElement({ any = [], roles: allowedRoles = [], deniedRoles = [], children }) {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const permissions = user?.permissions || []
  const isSuperAdmin = hasAnyRole(roles, ['Super Admin', 'SuperAdmin', 'super_admin'])
  const hasDeniedRole = deniedRoles.length > 0 && hasAnyRole(roles, deniedRoles)
  const hasRoleMatch = allowedRoles.length > 0 && hasAnyRole(roles, allowedRoles)
  const hasPermission = any.length === 0 || any.some((permission) => permissions.includes(permission))

  const isAllowed = isSuperAdmin || (!hasDeniedRole && (hasRoleMatch || (allowedRoles.length === 0 && hasPermission)))

  if (!isAllowed) {
    const dest = portalDestination(roles)
    const currentPath = window.location.pathname
    if (dest === currentPath || currentPath.startsWith(dest)) {
      return <Navigate to="/dashboard" replace />
    }
    return <Navigate to={dest} replace />
  }

  return children || <Outlet />
}


function AbsensiIndex() {
  const roles = useAuthStore((state) => state.user?.roles || [])
  if (hasAnyRole(roles, ['Wali Kelas'])) return <Navigate to="/absensi/dashboard-wali-kelas" replace />
  if (hasAnyRole(roles, ['Guru'])) return <Navigate to="/portal-guru" replace />
  if (hasAnyRole(roles, ['Siswa'])) return <Navigate to="/absensi/kehadiran-saya" replace />
  if (hasAnyRole(roles, [
    'Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator', 'Admin', 'Super Admin',
    'Kepala Sekolah', 'kepala_sekolah', 'kepsek', 'KepalaSekolah',
    'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan'
  ])) {
    return <Navigate to="/dashboard/absensi-pembelajaran" replace />
  }
  return <Navigate to="/dashboard" replace />
}

export const router = createBrowserRouter([
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
    path: '/auth',
    element: (
      <BungkusLazy>
        <LoginPage />
      </BungkusLazy>
    ),
  },
  {
    path: '/authentication',
    element: (
      <BungkusLazy>
        <LoginPage />
      </BungkusLazy>
    ),
  },
  {
    element: <RouteTerlindungi />,
    errorElement: <RouteErrorElement />,
    children: [
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
          { path: 'mutabaah', element: <BungkusLazy><StudentPortalPage section="mutabaah" /></BungkusLazy> },
          { path: 'absensi', element: <BungkusLazy><StudentPortalPage section="attendance" /></BungkusLazy> },
          { path: 'kisi-kisi', element: <BungkusLazy><StudentPortalPage section="kisi" /></BungkusLazy> },
          { path: 'ujian-cbt', element: <BungkusLazy><StudentPortalPage section="ujian" /></BungkusLazy> },
          { path: 'hasil', element: <BungkusLazy><StudentPortalPage section="hasil" /></BungkusLazy> },
        ] }],
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
          { path: 'jadwal-mengajar', element: <Navigate to="/portal-guru/workspace?tab=jadwal" replace /> },
          { path: 'presensi', element: <Navigate to="/portal-guru/workspace?tab=presensi" replace /> },
          { path: 'presensi/tambah', element: <Navigate to="/portal-guru/workspace?tab=presensi" replace /> },
          { path: 'presensi/:id', element: <Navigate to="/portal-guru/workspace?tab=presensi" replace /> },
          { path: 'presensi/:id/edit', element: <Navigate to="/portal-guru/workspace?tab=presensi" replace /> },
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
          { path: 'rekap-data', element: <BungkusLazy><AttendanceReportPage /></BungkusLazy> },
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
           { path: 'kepala-sekolah', element: <PermissionElement any={['dashboard.kepala-sekolah.view']}><BungkusLazy><KepalaSekolahDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'wali-kelas', element: <PermissionElement any={['dashboard.guru.view']}><BungkusLazy><WaliKelasDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'divisi-pendidikan', element: <PermissionElement any={['dashboard.divisi-pendidikan.view']}><BungkusLazy><DivisiPendidikanDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'waka-kurikulum', element: <PermissionElement any={['dashboard.waka-kurikulum.view']}><BungkusLazy><WakaKurikulumDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'waka-kesiswaan', element: <PermissionElement any={['dashboard.waka-kesiswaan.view']}><BungkusLazy><WakaKesiswaanDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'tata-usaha', element: <PermissionElement any={['dashboard.tata-usaha.view']}><BungkusLazy><TataUsahaDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'guru-tahfizh', element: <PermissionElement any={['dashboard.guru-tahfizh.view']}><BungkusLazy><GuruTahfizhDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'guru-bk', element: <PermissionElement any={['dashboard.guru-bk.view']}><BungkusLazy><GuruBkDashboardPage /></BungkusLazy></PermissionElement> },
           { path: 'operator', element: <PermissionElement any={['dashboard.operator.view']}><BungkusLazy><OperatorDashboardPage /></BungkusLazy></PermissionElement> },
            { path: 'musyrif', element: <PermissionElement any={['dashboard.guru-tahfizh.view']} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Pengurus', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek']}><BungkusLazy><MusyrifDashboardPage /></BungkusLazy></PermissionElement> },
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
            element: (
              <PermissionElement any={['student.create', 'student.update', 'student.delete']}>
                <BungkusLazy><StudentCrudPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
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
            path: 'master-tahun-ajaran',
            element: (
              <PermissionElement any={['master.view', 'sistem.master_data']}>
                <BungkusLazy><MasterTahunAjaranPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master/tahun-ajaran',
            element: <Navigate to="/dashboard/master-tahun-ajaran" replace />,
          },
          {
            path: 'master/kurikulum',
            element: <Navigate to="/dashboard/master-kurikulum" replace />,
          },
          {
            path: 'master-quran-surah',
            element: (
              <PermissionElement any={['sistem.master_data']}>
                <BungkusLazy>
                  <MasterQuranSurahPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'master-jadwal-sholat',
            element: (
              <PermissionElement any={['sistem.master_data']}>
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
              <PermissionElement any={['sistem.master_data']}>
                <BungkusLazy>
                  <MasterDoaPage />
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
            path: 'academic',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage']}>
                <BungkusLazy><AcademicPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'modul-ajar',
            element: (
              <BungkusLazy>
                <LmsModulAjarPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/modul-ajar',
            element: (
              <BungkusLazy>
                <LmsModulAjarPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'master-modul-semester',
            element: (
              <BungkusLazy>
                <MasterModulSemesterPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'master-kurikulum',
            element: (
              <BungkusLazy>
                <MasterKurikulumPage />
              </BungkusLazy>
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
              <BungkusLazy>
                <MasterSchedulePage />
              </BungkusLazy>
            ),
          },
          {
            path: 'master-capaian-pembelajaran',
            element: (
              <BungkusLazy>
                <MasterCapaianPembelajaranPage />
              </BungkusLazy>
            ),
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
            element: (
              <BungkusLazy>
                <MasterTujuanPembelajaranPage />
              </BungkusLazy>
            ),
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
            element: (
              <BungkusLazy>
                <LmsMateriPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/materi-pembelajaran',
            element: (
              <BungkusLazy>
                <LmsMateriPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/materi',
            element: (
              <BungkusLazy>
                <LmsMateriPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'media-pembelajaran',
            element: (
              <BungkusLazy>
                <LmsMediaPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/media-pembelajaran',
            element: (
              <BungkusLazy>
                <LmsMediaPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/media',
            element: (
              <BungkusLazy>
                <LmsMediaPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'referensi-pembelajaran',
            element: (
              <BungkusLazy>
                <LmsReferensiPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/referensi-pembelajaran',
            element: (
              <BungkusLazy>
                <LmsReferensiPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/referensi',
            element: (
              <BungkusLazy>
                <LmsReferensiPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'aktivitas-belajar',
            element: (
              <BungkusLazy>
                <LmsAktivitasBelajarPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/aktivitas-belajar',
            element: (
              <BungkusLazy>
                <LmsAktivitasBelajarPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/aktivitas',
            element: (
              <BungkusLazy>
                <LmsAktivitasBelajarPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'diskusi-kelas',
            element: (
              <BungkusLazy>
                <LmsDiskusiPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/diskusi-kelas',
            element: (
              <BungkusLazy>
                <LmsDiskusiPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/diskusi',
            element: (
              <BungkusLazy>
                <LmsDiskusiPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'penugasan',
            element: (
              <BungkusLazy>
                <LmsPenugasanPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/penugasan',
            element: (
              <BungkusLazy>
                <LmsPenugasanPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'pengumpulan-tugas',
            element: (
              <BungkusLazy>
                <LmsPengumpulanTugasPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/pengumpulan-tugas',
            element: (
              <BungkusLazy>
                <LmsPengumpulanTugasPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'absensi-pembelajaran',
            element: (
              <BungkusLazy>
                <AttendanceWorkspacePage />
              </BungkusLazy>
            ),
          },
          {
            path: 'presensi-pembelajaran',
            element: (
              <BungkusLazy>
                <AttendanceWorkspacePage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/presensi-pembelajaran',
            element: (
              <BungkusLazy>
                <AttendanceWorkspacePage />
              </BungkusLazy>
            ),
          },
          {
            path: 'absensi/*',
            element: (
              <BungkusLazy>
                <AttendanceWorkspacePage />
              </BungkusLazy>
            ),
          },
          {
            path: 'kisi-kisi-ujian',
            element: (
              <BungkusLazy>
                <LmsKisiKisiPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/kisi-kisi',
            element: (
              <BungkusLazy>
                <LmsKisiKisiPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'bank-soal',
            element: (
              <BungkusLazy>
                <LmsBankSoalPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/bank-soal',
            element: (
              <BungkusLazy>
                <LmsBankSoalPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'ujian-online',
            element: (
              <BungkusLazy>
                <LmsUjianPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/ujian-online',
            element: (
              <BungkusLazy>
                <LmsUjianPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'lms/ujian',
            element: (
              <BungkusLazy>
                <LmsUjianPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'penilaian',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage']} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan']}>
                <BungkusLazy>
                  <LmsPenilaianPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'lms/penilaian',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage']} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan']}>
                <BungkusLazy>
                  <LmsPenilaianPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'lms/penilaian-rapor',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage']} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan']}>
                <BungkusLazy>
                  <LmsRaporPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'lms/rapor',
            element: (
              <PermissionElement any={['academic.view', 'academic.manage']} deniedRoles={['Yayasan', 'Ketua Yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan']}>
                <BungkusLazy>
                  <LmsRaporPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah',
            element: (
              <BungkusLazy>
                <MutabaahDashboardPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'mutabaah/rekap',
            element: (
              <PermissionElement deniedRoles={['Tata Usaha', 'TU', 'tu', 'tata_usaha']}>
                <BungkusLazy>
                  <MutabaahRecapPage />
                </BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'mutabaah/target-evaluasi',
            element: (
              <BungkusLazy>
                <MutabaahTargetEvaluationPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'mutabaah/rincian-agenda',
            element: (
              <BungkusLazy>
                <MutabaahAgendaDetailPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'mutabaah/template-agenda',
            element: (
              <BungkusLazy>
                <MutabaahTemplatePage />
              </BungkusLazy>
            ),
          },
          {
            path: 'mutabaah/assign-template',
            element: (
              <BungkusLazy>
                <MutabaahTemplateAssignmentPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'mutabaah/assign-pembimbing',
            element: (
              <BungkusLazy>
                <MutabaahSupervisorAssignmentPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'mutabaah/monitoring-orang-tua',
            element: (
              <BungkusLazy>
                <MutabaahParentMonitoringPage />
              </BungkusLazy>
            ),
          },
          {
            path: 'monitoring-tahfizh-ibadah-non-pesantren',
            element: (
              <PermissionElement any={['divisi.monitoring', 'dashboard.pemantauan.lihat', 'tahfizh.view', 'mutabaah.view', 'dashboard.kepala-sekolah.view', 'dashboard.divisi-pendidikan.view', 'dashboard.guru.view']}>
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
              <PermissionElement roles={['Super Admin', 'SuperAdmin', 'super_admin', 'superadmin', 'Admin', 'admin']}>
                <BungkusLazy><PengaturanPage /></BungkusLazy>
              </PermissionElement>
            ),
          },
          {
            path: 'koneksi-api-mobile',
            element: (
              <PermissionElement roles={['Super Admin', 'SuperAdmin', 'super_admin', 'superadmin', 'Admin', 'admin']}>
                <BungkusLazy><MobileApiConfigPage /></BungkusLazy>
              </PermissionElement>
            ),
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
              <PermissionElement roles={['Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Admin', 'Super Admin', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan']} any={['report.attendance.view', 'report.view', 'attendance.view', 'kehadiran.siswa.monitoring']}>
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
          { path: 'rekap-absensi-gerbang', element: <PermissionElement roles={['Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Admin', 'Super Admin', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan']} any={['report.attendance.view', 'attendance.view', 'attendance.manage', 'kehadiran.siswa.monitoring']}><BungkusLazy><RekapAbsensiGerbangPage /></BungkusLazy></PermissionElement> },
          { path: 'rekap-absensi-ibadah', element: <PermissionElement roles={['Tata Usaha', 'TU', 'tata_usaha', 'Operator', 'operator', 'Admin', 'Super Admin', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek', 'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan']} any={['report.attendance.view', 'attendance.view', 'attendance.manage', 'kehadiran.siswa.monitoring']}><BungkusLazy><RekapAbsensiIbadahPage /></BungkusLazy></PermissionElement> },
          {
            path: 'profil-akun',
            element: (
              <BungkusLazy>
                <UserProfileManagementPage />
              </BungkusLazy>
            ),
          },
        ],
      },
    ],
  },
])

export default router
