import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  FileSpreadsheet,
  BarChart2,
  UserCheck,
  Activity,
  Layers,
} from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { isParentRole, isStudentRole } from '../../auth/portalResolver'

export function TahfizhSubNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const userRoles = Array.isArray(roles) ? roles.map((r) => (typeof r === 'string' ? r : r?.name || '')) : []
  const isTeacher = userRoles.some((r) => /guru|musyrif|wali_kelas/i.test(r))
  const isParent = isParentRole(roles)
  const isStudent = isStudentRole(roles)

  const navItems = [
    {
      id: '/dashboard/tahfizh',
      path: '/dashboard/tahfizh',
      label: 'Setoran Tahfizh',
      icon: BookOpen,
      end: true,
      activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
      inactiveColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-md hover:shadow-emerald-600/30',
    },
    {
      id: '/dashboard/tahfizh/rekapan',
      path: '/dashboard/tahfizh/rekapan',
      label: 'Laporan Rekapan',
      icon: FileSpreadsheet,
      activeColor: 'bg-sky-600 text-white shadow-md shadow-sky-600/30',
      inactiveColor: 'bg-sky-100/90 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white hover:shadow-md hover:shadow-sky-600/30',
    },
    ...(!isTeacher ? [
      {
        id: '/dashboard/laporan-tahfizh',
        path: '/dashboard/laporan-tahfizh',
        label: 'Laporan Tahfizh',
        icon: BarChart2,
        activeColor: 'bg-violet-600 text-white shadow-md shadow-violet-600/30',
        inactiveColor: 'bg-violet-100/90 text-violet-700 hover:bg-violet-600 hover:text-white dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white hover:shadow-md hover:shadow-violet-600/30',
      },
    ] : []),
    {
      id: '/dashboard/guru-tahfizh',
      path: '/dashboard/guru-tahfizh',
      label: 'Dashboard Guru',
      icon: UserCheck,
      activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
      inactiveColor: 'bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white hover:shadow-md hover:shadow-indigo-600/30',
    },
    ...(!(isParent || isStudent) ? [
      {
        id: '/dashboard/monitoring-tahfizh-ibadah-non-pesantren',
        path: '/dashboard/monitoring-tahfizh-ibadah-non-pesantren',
        label: 'Monitor Non-Ponpes',
        icon: Activity,
        activeColor: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
        inactiveColor: 'bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white hover:shadow-md hover:shadow-amber-500/30',
      },
    ] : []),
  ]

  return (
    <nav className="mb-5 rounded-[18px] border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433]">
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.end
            ? pathname === item.path
            : pathname === item.path || pathname.startsWith(`${item.path}/`)

          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive ? item.activeColor : item.inactiveColor
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

export default TahfizhSubNav
