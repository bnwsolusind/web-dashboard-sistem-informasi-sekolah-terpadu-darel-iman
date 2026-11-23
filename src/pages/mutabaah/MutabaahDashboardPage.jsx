import React from 'react'
import {
  Navigate
} from 'react-router-dom'
import {
  useAuthStore
} from '../../stores/authStore'
import {
  isParentRole,
  isStudentRole,
  getUserRoleLevel,
  ROLE_LEVELS
} from '../../auth/portalResolver'
import MutabaahAnalyticsPage from '../MutabaahAnalyticsPage'

export default function MutabaahDashboardPage() {
 const user = useAuthStore((state) => state.user)
 const roles = user?.roles || (user?.role ? [user.role] : [])
 const userLevel = getUserRoleLevel(user || roles)

 if (isParentRole(roles) || userLevel === ROLE_LEVELS.ORANG_TUA) {
 return <Navigate to="/portal-orangtua?tab=mutabaah" replace />
 }
 if (isStudentRole(roles) || userLevel === ROLE_LEVELS.SISWA) {
 return <Navigate to="/portal-siswa" replace />
 }

 return (
 <div data-testid="mutabaah-dashboard-page" className="mutabaah-dashboard-wrapper">
 <MutabaahAnalyticsPage view="dashboard" />
 </div>
 )
}
