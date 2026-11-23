import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { cn } from '../../lib/utils'

/**
 * AppSkeleton - canonical loading state (skeleton, bukan spinner besar).
 *
 * varian:
 * - 'line' : satu baris teks
 * - 'card' : kartu statistik
 * - 'table' : baris tabel (rows x cols)
 * - 'list' : daftar item (avatar + 2 baris)
 * - 'detail' : detail drawer/modal
 */
export default function AppSkeleton({ variant = 'line', rows = 5, cols = 4, className = '' }) {
 if (variant === 'card') {
 return (
 <div className={cn('rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900', className)}>
 <div className="flex items-start justify-between gap-3">
 <div className="space-y-2">
 <Skeleton className="h-3 w-24" />
 <Skeleton className="h-7 w-16" />
 <Skeleton className="h-3 w-28" />
 </div>
 <Skeleton className="h-11 w-11 rounded-xl" />
 </div>
 <Skeleton className="mt-4 h-px w-full" />
 <div className="mt-3 flex items-center gap-2">
 <Skeleton className="h-3 w-20" />
 <Skeleton className="h-3 w-12" />
 </div>
 </div>
 )
 }

 if (variant === 'table') {
 return (
 <div className="overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="flex items-center justify-between gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 p-4 dark:border-emerald-800/60">
 <Skeleton className="h-4 w-40" />
 <Skeleton className="h-8 w-28 rounded-xl" />
 </div>
 <div className="space-y-3 p-4">
 {Array.from({ length: Math.min(rows, 6) }).map((_, i) => (
 <div key={i} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(cols, 5)}, 1fr)` }}>
 {Array.from({ length: Math.min(cols, 5) }).map((_, j) => (
 <Skeleton key={j} className="h-4" />
 ))}
 </div>
 ))}
 </div>
 </div>
 )
 }

 if (variant === 'list') {
 return (
 <div className="space-y-3">
 {Array.from({ length: Math.min(rows, 5) }).map((_, i) => (
 <div key={i} className="flex items-center gap-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900">
 <Skeleton className="h-10 w-10 rounded-full" />
 <div className="flex-1 space-y-2">
 <Skeleton className="h-3 w-1/3" />
 <Skeleton className="h-3 w-2/3" />
 </div>
 <Skeleton className="h-6 w-16 rounded-full" />
 </div>
 ))}
 </div>
 )
 }

 if (variant === 'detail') {
 return (
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <Skeleton className="h-14 w-14 rounded-xl" />
 <div className="space-y-2">
 <Skeleton className="h-4 w-40" />
 <Skeleton className="h-3 w-28" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 {Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="space-y-2">
 <Skeleton className="h-3 w-20" />
 <Skeleton className="h-4 w-full" />
 </div>
 ))}
 </div>
 <Skeleton className="h-24 w-full rounded-xl" />
 </div>
 )
 }

 // line (default)
 return (
 <div className={cn('space-y-2', className)}>
 {Array.from({ length: Math.min(rows, 4) }).map((_, i) => (
 <Skeleton key={i} className={i === rows - 1 ? 'h-3 w-2/3' : 'h-3 w-full'} />
 ))}
 </div>
 )
}
