import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import AppButton from './AppButton'

/**
 * AppErrorState - canonical error state dengan tombol coba lagi.
 */
export default function AppErrorState({ title = 'Data Gagal Dimuat', description = 'Terjadi kesalahan saat mengambil data.', onRetry, compact = false }) {
 return (
 <div className={`flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 bg-rose-50/50 text-center dark:border-emerald-800/60 dark:bg-rose-950/30 ${compact ? 'p-6' : 'p-10'}`}>
 <div className={`mb-3 flex items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 ${compact ? 'h-10 w-10' : 'h-14 w-14'}`}>
 <AlertTriangle className={`${compact ? 'h-5 w-5' : 'h-7 w-7'}`} />
 </div>
 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h4>
 <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">{description}</p>
 {onRetry && (
 <AppButton variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry} className="mt-4">
 Coba Lagi
 </AppButton>
 )}
 </div>
 )
}
