import React from 'react'
import AppCard from './AppCard'
import PersonIdentityCell from '../ui/PersonIdentityCell'

/**
 * PersonCard - canonical person identity surface for cards and summaries.
 */
export default function PersonCard({ src, name, subtitle, actions, className = '' }) {
 return (
 <AppCard noPadding className={className}>
 <div className="flex items-center justify-between gap-4 p-4 md:p-5">
 <PersonIdentityCell src={src} name={name} subtitle={subtitle} size="card" />
 {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
 </div>
 </AppCard>
 )
}
