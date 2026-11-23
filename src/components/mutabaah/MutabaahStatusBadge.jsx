import React from 'react'
import { AppBadge } from '../../components/app'

export function MutabaahStatusBadge({ status, label, icon: Icon }) {
 const statusMaps = {
 active: { variant: 'success', text: label || 'Aktif' },
 signed: { variant: 'success', text: label || 'Ditandatangani' },
 tercapai: { variant: 'success', text: label || 'Tercapai' },
 inactive: { variant: 'neutral', text: label || 'Nonaktif' },
 unsigned: { variant: 'warning', text: label || 'Belum Paraf' },
 pending: { variant: 'warning', text: label || 'Menunggu' },
 perlu_bimbingan: { variant: 'warning', text: label || 'Perlu Bimbingan' },
 draft: { variant: 'neutral', text: label || 'Draft' },
 rejected: { variant: 'danger', text: label || 'Bermasalah' },
 }

 const badge = statusMaps[status] || statusMaps.active

 return (
 <AppBadge variant={badge.variant} dot>
 {Icon && <Icon className="h-3 w-3" />}
 {badge.text}
 </AppBadge>
 )
}

export default MutabaahStatusBadge
