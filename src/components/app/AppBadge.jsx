import React from 'react'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

const badgeVariants = {
	primary: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
	secondary: 'bg-emerald-50/60 text-emerald-900 border-emerald-200/80 font-bold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
	gray: 'bg-slate-100 text-slate-700 border-emerald-200/80 font-semibold dark:bg-slate-800/80 dark:text-slate-200 dark:border-emerald-700/80',
	success: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
	warning: 'bg-amber-50 text-amber-800 border-amber-300 font-bold dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
	danger: 'bg-rose-50 text-rose-800 border-rose-300 font-bold dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
	info: 'bg-sky-50 text-sky-800 border-sky-300 font-bold dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
	purple: 'bg-violet-50 text-violet-800 border-violet-300 font-bold dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
	neutral: 'bg-emerald-50/50 text-emerald-800 border-emerald-200/80 font-bold dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50',
	outline: 'bg-transparent text-emerald-800 border-emerald-300 font-bold dark:text-emerald-300 dark:border-emerald-700',
}

const dotColors = {
 primary: 'bg-[#059669] dark:bg-[#10B981]',
 secondary: 'bg-slate-400',
 gray: 'bg-slate-400',
 success: 'bg-emerald-500',
 warning: 'bg-amber-500',
 danger: 'bg-rose-500',
 info: 'bg-sky-500',
 purple: 'bg-violet-500',
 neutral: 'bg-slate-400',
 outline: 'bg-slate-400',
}

export function getStatusVariant(status) {
 const normalized = String(status ?? '').toLowerCase().replace(/[_-]/g, ' ').trim()
 if (['active', 'aktif', 'success', 'paid', 'lunas', 'hadir', 'tepat waktu', 'hadir dalam toleransi', 'approved', 'disetujui'].includes(normalized)) return 'success'
 if (['pending', 'menunggu', 'proses', 'in progress', 'draft', 'terlambat'].includes(normalized)) return 'warning'
 if (['inactive', 'nonaktif', 'failed', 'gagal', 'rejected', 'ditolak', 'absent', 'alpa', 'alpha'].includes(normalized)) return 'danger'
 if (['info', 'informasi', 'izin', 'sakit', 'pulang', 'sudah pulang'].includes(normalized)) return 'info'
 return 'secondary'
}

/**
 * AppBadge - canonical badge.
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' | 'outline'} [props.variant]
 * @param {string} [props.status]
 * @param {boolean} [props.dot]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.children]
 * @param {string} [props.size]
 */
export default function AppBadge({ variant = undefined, status = undefined, dot = false, className = '', children = null, ...props }) {
 const resolvedVariant = variant || (status ? getStatusVariant(status) : 'secondary')
 return (
 <Badge className={cn(badgeVariants[resolvedVariant], className)} {...props}>
 {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[resolvedVariant] || dotColors.secondary)} />}
 {children}
 </Badge>
 )
}
