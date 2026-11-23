import React from 'react'
import { cn } from '../../lib/utils'
import AppBadge from './AppBadge'
import PersonIdentityCell from '../ui/PersonIdentityCell'
import ActionDropdown from './ActionDropdown'

/**
 * MobileDataCard - Canonical card item component for mobile responsive data lists.
 * Converts complex table row data into clean, modern card layouts on mobile viewports.
 *
 * Props:
 * - title: string | node
 * - subtitle: string | node
 * - avatarSrc: string (optional avatar image)
 * - badge: string | node
 * - badgeVariant: string
 * - fields: Array of { label, value, icon, fullWidth }
 * - onView, onEdit, onDelete, onHistory: action handlers
 * - extraActions: node
 * - onClick: card click handler
 * - selected: boolean
 * - onSelect: checkbox toggle handler
 */
export default function MobileDataCard({
 title,
 subtitle,
 avatarSrc,
 badge,
 badgeVariant = 'primary',
 fields = [],
 onView,
 onEdit,
 onDelete,
 onHistory,
 extraActions,
 extraItems = [],
 onClick,
 selected = false,
 onSelect,
 className = '',
}) {
 const hasActions = Boolean(onView || onEdit || onDelete || onHistory || extraActions || (extraItems && extraItems.length > 0))
 const isClickable = typeof onClick === 'function'

 return (
 <div
 onClick={onClick}
 className={cn(
 'relative flex flex-col gap-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-4 shadow-sm transition-all duration-200 dark:border-emerald-800/60 dark:bg-[#1B2433]',
 selected && 'border-[#059669] bg-emerald-50/20 dark:border-[#10B981] dark:bg-emerald-950/20',
 isClickable && 'cursor-pointer hover:border-[#10B981]/40 hover:shadow-md',
 className
 )}
 >
 {/* Header Row */}
 <div className="flex items-start justify-between gap-3">
 <div className="flex min-w-0 items-center gap-3">
 {onSelect && (
 <input
 type="checkbox"
 checked={selected}
 onChange={(e) => {
 e.stopPropagation()
 onSelect(e.target.checked)
 }}
 className="h-4 w-4 shrink-0 rounded border-emerald-300 accent-[#059669] dark:border-emerald-700/80"
 />
 )}

 {avatarSrc || (typeof title === 'string' && subtitle) ? (
 <PersonIdentityCell src={avatarSrc} name={title} subtitle={subtitle} size="md" />
 ) : (
 <div className="min-w-0">
 <h4 className=" text-sm font-extrabold text-slate-900 dark:text-white">
 {title}
 </h4>
 {subtitle && (
 <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
 {subtitle}
 </p>
 )}
 </div>
 )}
 </div>

 <div className="flex shrink-0 items-center gap-2">
 {badge && <AppBadge variant={badgeVariant}>{badge}</AppBadge>}
 {hasActions && (
 <div onClick={(e) => e.stopPropagation()}>
 <ActionDropdown
 onView={onView}
 onEdit={onEdit}
 onDelete={onDelete}
 onHistory={onHistory}
 extraItems={extraItems?.length > 0 ? extraItems : (extraActions ? [extraActions] : [])}
 />
 </div>
 )}
 </div>
 </div>

 {/* Dynamic Fields Grid */}
 {fields.length > 0 && (
 <div className="grid grid-cols-2 gap-2.5 border-t border-emerald-200/80 pt-3 dark:border-emerald-800/80">
 {fields.map((field, idx) => {
 if (!field || (field.value === undefined && field.value === null)) return null
 const isFull = field.fullWidth || fields.length === 1
 return (
 <div
 key={idx}
 className={cn('space-y-0.5', isFull ? 'col-span-2' : 'col-span-1')}
 >
 <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
 {field.icon && (React.isValidElement(field.icon) ? field.icon : <field.icon className="h-3 w-3 text-slate-400" />)}
 {field.label}
 </span>
 <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
 {field.value ?? '—'}
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 )
}
