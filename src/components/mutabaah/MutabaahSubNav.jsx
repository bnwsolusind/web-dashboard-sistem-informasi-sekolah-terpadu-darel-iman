import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
	LayoutDashboard,
	FileSpreadsheet,
	Target,
	CalendarDays,
	FileCode2,
	BookmarkPlus,
	UserCheck,
	ShieldCheck,
} from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { StandardSubTabs } from '../app/StandardSubTabs'

export function MutabaahSubNav() {
	const { pathname } = useLocation()
	const navigate = useNavigate()
	const user = useAuthStore((state) => state.user)
	const roles = user?.roles || []
	const isTU = roles.some((r) => typeof r === 'string' && /tata usaha|\btu\b/i.test(r))

	const navItems = [
		{
			id: '/dashboard/mutabaah',
			label: 'Dashboard',
			icon: LayoutDashboard,
			end: true,
		},
		...(!isTU
			? [
					{
						id: '/dashboard/mutabaah/rekap',
						label: 'Rekap',
						icon: FileSpreadsheet,
					},
			  ]
			: []),
		{
			id: '/dashboard/mutabaah/target-evaluasi',
			label: 'Target & Evaluasi',
			icon: Target,
		},
		{
			id: '/dashboard/mutabaah/rincian-agenda',
			label: 'Agenda TU',
			icon: CalendarDays,
		},
		{
			id: '/dashboard/mutabaah/template-agenda',
			label: 'Template Agenda',
			icon: FileCode2,
		},
		{
			id: '/dashboard/mutabaah/assign-template',
			label: 'Assign Template',
			icon: BookmarkPlus,
		},
		{
			id: '/dashboard/mutabaah/assign-pembimbing',
			label: 'Assign Pembimbing',
			icon: UserCheck,
		},
		{
			id: '/dashboard/mutabaah/monitoring-orang-tua',
			label: 'Monitoring Ortu',
			icon: ShieldCheck,
		},
	]

	const activeItem = navItems.find((item) =>
		item.end ? pathname === item.id : pathname === item.id || pathname.startsWith(`${item.id}/`)
	) || navItems[0]

	return (
		<nav className="mb-5" aria-label="Navigasi Kontekstual Mutaba'ah">
			<StandardSubTabs
				tabs={navItems}
				activeTab={activeItem.id}
				onChange={(path) => navigate(path)}
				className="w-full sm:w-auto"
			/>
		</nav>
	)
}

export default MutabaahSubNav
