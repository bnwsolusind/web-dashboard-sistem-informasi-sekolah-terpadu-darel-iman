import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
 BookOpen,
 FileSpreadsheet,
 BarChart2,
 UserCheck,
 Activity,
 Target,
} from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { isParentRole, isStudentRole } from '../../auth/portalResolver'
import { StandardSubTabs } from '../app/StandardSubTabs'

export function TahfizhSubNav() {
 const { pathname } = useLocation()
 const navigate = useNavigate()
 const user = useAuthStore((state) => state.user)
 const roles = user?.roles || []
 const userRoles = Array.isArray(roles) ? roles.map((r) => (typeof r === 'string' ? r : r?.name || '')) : []
 const isTeacher = userRoles.some((r) => /guru|musyrif|wali_kelas/i.test(r))
 const isGuruTahfizhScope = userRoles.some((r) => /guru[_\s-]?tahfizh|musyrif|kepala[_\s-]?sekolah|kepsek/i.test(r))
 const isParent = isParentRole(roles)
 const isStudent = isStudentRole(roles)

 const navItems = [
 {
 id: '/dashboard/tahfizh',
 label: 'Setoran Tahfizh',
 icon: BookOpen,
 end: true,
 },
 {
 id: '/dashboard/tahfizh/rekapan',
 label: 'Laporan Rekapan',
 icon: FileSpreadsheet,
 },
 ...(!isTeacher ? [
 {
 id: '/dashboard/laporan-tahfizh',
 label: 'Laporan Tahfizh',
 icon: BarChart2,
 },
 ] : []),
 ...(isGuruTahfizhScope ? [
 {
 id: '/dashboard/guru-tahfizh',
 label: 'Dashboard Guru Tahfizh',
 icon: UserCheck,
 },
 ] : []),
 ...(!(isParent || isStudent) ? [
 {
 id: '/dashboard/monitoring-tahfizh-ibadah-non-pesantren',
 label: 'Monitor Non-Ponpes',
 icon: Activity,
 },
 {
 id: '/dashboard/tahfizh/pengaturan-target',
 label: 'Pengaturan Target KPI',
 icon: Target,
 },
 ] : []),
 ]

 const activeItem = navItems.find((item) =>
 item.end ? pathname === item.id : pathname === item.id || pathname.startsWith(`${item.id}/`)
 ) || navItems[0]

 return (
 <nav className="mb-5" aria-label="Navigasi Kontekstual Tahfizh">
 <StandardSubTabs
 tabs={navItems}
 activeTab={activeItem.id}
 onChange={(path) => navigate(path)}
 className="w-full sm:w-auto"
 />
 </nav>
 )
}

export default TahfizhSubNav
