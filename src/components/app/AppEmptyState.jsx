import React from 'react'
import { EmptyState } from '../ui/empty-state'

/**
 * AppEmptyState - canonical empty state.
 * Wajib dipakai untuk mencegah halaman blank ketika data kosong.
 * @param {Object} props
 * @param {any} [props.icon]
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {any} [props.action]
 * @param {string} [props.actionLabel]
 * @param {Function} [props.onAction]
 * @param {string} [props.className]
 */
export default function AppEmptyState({
 icon = undefined,
 title = 'Belum Ada Data',
 description = '',
 action = undefined,
 actionLabel = undefined,
 onAction = undefined,
 className = '',
}) {
 return (
 <div className={className}>
 <EmptyState
 icon={icon}
 title={title}
 description={description}
 action={action}
 actionLabel={actionLabel}
 onAction={onAction}
 />
 </div>
 )
}
