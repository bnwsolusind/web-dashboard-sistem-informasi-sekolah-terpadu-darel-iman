import React from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import SuperAdminDashboardPage from './SuperAdminDashboardPage'
import TeacherMonitoringDashboardPage from './TeacherMonitoringDashboardPage'
import ParentDashboardPage from './ParentDashboardPage'
import { ROLES, hasAnyRole, resolveDefaultPortal, isTeacherRole } from '../auth/portalResolver'

export default function MultiRoleDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const permissions = user?.permissions || []

  const isSuperAdminOrAdmin = hasAnyRole(roles, [...ROLES.SUPER_ADMIN, ...ROLES.ADMIN])

  if (isSuperAdminOrAdmin) {
    return <SuperAdminDashboardPage />
  }

  const isFoundationUser =
    hasAnyRole(roles, ['Yayasan', 'Ketua Yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan', 'Pengurus Yayasan']) ||
    permissions.includes('foundation.dashboard.view')

  if (isFoundationUser) {
    return <Navigate to="/dashboard/yayasan" replace />
  }

  if (hasAnyRole(roles, ['Siswa', 'siswa', 'student'])) {
    return <Navigate to="/portal-siswa" replace />
  }

  if (hasAnyRole(roles, ['Orang Tua', 'Orangtua', 'Wali Murid', 'orang_tua', 'parent'])) {
    return <ParentDashboardPage />
  }

  if (isTeacherRole(roles)) {
    return <TeacherMonitoringDashboardPage />
  }

  const resolvedRoute = resolveDefaultPortal(user)
  if (resolvedRoute !== '/dashboard') {
    return <Navigate to={resolvedRoute} replace />
  }

  // Admin dan role tanpa dashboard khusus: halaman Pemantauan (dashboard.pemantauan.lihat).
  // Bila tidak punya akses dashboard apa pun, tampilkan pesan jelas (bukan dashboard rusak).
  if (permissions.includes('dashboard.pemantauan.lihat')) {
    return <Navigate to="/dashboard/pemantauan" replace />
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500" />
      <h1 className="text-lg font-semibold text-slate-800">Akses Dashboard Tidak Tersedia</h1>
      <p className="max-w-md text-sm text-slate-500">
        Akun Anda belum memiliki hak akses ke dashboard mana pun. Hubungi Super Admin untuk
        penetapan role/permission.
      </p>
    </div>
  )
}
