import React from 'react'
import { Calendar, School } from 'lucide-react'
import { AppHero } from '../app'
import { useAuthStore } from '../../stores/authStore'

export default function DashboardHeader({
 title,
 subtitle,
 roleName,
 unitName,
 academicYear,
 semester,
 action
}) {
 const userName = useAuthStore((state) => state.user?.name)
 const showWelcome = Boolean(userName) && !/^(assalamu|selamat)/i.test(title || '')
 const chips = []
 if (unitName) {
 chips.push(
 <React.Fragment key="unit">
 <School className="h-3 w-3 text-current/80" />
 {unitName}
 </React.Fragment>
 )
 }
 if (academicYear || semester) {
 chips.push(
 <React.Fragment key="periode">
 <Calendar className="h-3 w-3 text-white/80" />
 {academicYear}
 {semester ? ` (${semester})` : ''}
 </React.Fragment>
 )
 }

 return (
 <AppHero
 title={title}
 description={subtitle}
 eyebrow={roleName}
 chips={chips}
 actions={action}
 welcomeName={showWelcome ? userName : null}
 />
 )
}
