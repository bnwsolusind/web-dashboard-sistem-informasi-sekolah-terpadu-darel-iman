import React from 'react'
import AppDrawer from './AppDrawer'
import AppSkeleton from './AppSkeleton'
import AppErrorState from './AppErrorState'
import AppEmptyState from './AppEmptyState'
import AppButton from './AppButton'
import { cn } from '../../lib/utils'

/**
 * DetailPanel - Canonical detail slide-over drawer component.
 * Standardizes detail views across modules with structured sections, field grids, and footer.
 */
export default function DetailPanel({
 isOpen,
 onClose,
 title = 'Detail Data',
 description,
 icon,
 badge,
 badgeVariant = 'success',
 isLoading = false,
 isError = false,
 errorMessage,
 onRetry,
 isEmpty = false,
 emptyTitle = 'Data Detail Kosong',
 emptyDescription = 'Detail data tidak tersedia saat ini.',
 sections = [],
 children,
 actions,
 className = '',
}) {
 return (
 <AppDrawer
 isOpen={isOpen}
 onClose={onClose}
 title={
 <div className="flex items-center gap-2">
 <span>{title}</span>
 {badge && <span className="text-xs font-normal">{badge}</span>}
 </div>
 }
 description={description}
 icon={icon}
 position="right"
 footer={
 <div className="flex w-full items-center justify-between gap-3">
 <div>{actions}</div>
 <AppButton variant="secondary" size="sm" onClick={onClose}>
 Tutup
 </AppButton>
 </div>
 }
 >
 <div className={cn('space-y-5 text-xs text-slate-700 dark:text-slate-200', className)}>
 {isLoading ? (
 <div className="space-y-4">
 <AppSkeleton variant="card" className="h-20 rounded-xl" />
 <AppSkeleton variant="card" className="h-32 rounded-xl" />
 <AppSkeleton variant="card" className="h-24 rounded-xl" />
 </div>
 ) : isError ? (
 <AppErrorState
 title="Gagal Memuat Detail"
 description={errorMessage || 'Terjadi kesalahan saat memuat data detail.'}
 onRetry={onRetry}
 compact
 />
 ) : isEmpty ? (
 <AppEmptyState title={emptyTitle} description={emptyDescription} />
 ) : children ? (
 children
 ) : (
 sections.map((sec, secIdx) => (
 <div
 key={secIdx}
 className="rounded-xl border border-emerald-200/80 bg-slate-50/50 p-4 space-y-3 dark:border-emerald-800/60 dark:bg-slate-900/40"
 >
 {sec.title && (
 <h5 className="border-b border-emerald-200/80 pb-2 text-xs font-extrabold text-slate-800 dark:border-emerald-800/60 dark:text-white">
 {sec.title}
 </h5>
 )}
 <div className={cn('grid gap-3.5', sec.columns === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
 {sec.fields?.map((field, fIdx) => (
 <div key={fIdx} className={cn('space-y-0.5', field.fullWidth && 'col-span-2')}>
 <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
 {field.icon && <field.icon className="h-3 w-3 text-slate-400" />}
 {field.label}
 </span>
 <div className="font-semibold text-slate-800 dark:text-slate-100">
 {field.value ?? '—'}
 </div>
 </div>
 ))}
 </div>
 </div>
 ))
 )}
 </div>
 </AppDrawer>
 )
}
