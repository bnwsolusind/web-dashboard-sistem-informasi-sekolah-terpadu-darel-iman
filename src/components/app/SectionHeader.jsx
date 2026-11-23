import React from 'react'
import { cn } from '../../lib/utils'

/**
 * SectionHeader - Canonical section header component.
 * Used to group sections in pages, cards, and dashboards.
 */
export default function SectionHeader({
 title,
 subtitle,
 icon: Icon,
 badge,
 actions,
 className = '',
}) {
 return (
 <div className={cn('flex flex-col justify-between gap-3 sm:flex-row sm:items-center', className)}>
 <div className="flex min-w-0 items-center gap-3">
 {Icon && (
 <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <Icon className="size-4.5 text-white" strokeWidth={2.2} />
 </div>
 )}
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
 {title}
 </h3>
 {badge && (
 <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
 {badge}
 </span>
 )}
 </div>
 {subtitle && (
 <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
 )}
 </div>
 </div>
 {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
 </div>
 )
}
