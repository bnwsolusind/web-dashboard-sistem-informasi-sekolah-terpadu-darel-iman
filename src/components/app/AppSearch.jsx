import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * AppSearch - Canonical search input component used across pages.
 */
export default function AppSearch({
 value = '',
 onChange,
 placeholder = 'Cari data...',
 className = '',
 shortcut,
 autoFocus,
 size = 'default',
 ...props
}) {
 return (
 <div className={cn('group relative min-w-0 flex-1', className)}>
 <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 transition-colors group-focus-within:text-[#059669] dark:group-focus-within:text-[#10B981]" />
 <input
 type="search"
 value={value}
 onChange={onChange}
 placeholder={placeholder}
 autoFocus={autoFocus}
 className={cn(
 'w-full h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-10 pr-9 text-sm font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500',
 className
 )}
 {...props}
 />
 {value ? (
 <button
 type="button"
 aria-label="Bersihkan pencarian"
 onClick={() => onChange?.({ target: { value: '' } })}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:text-slate-200 focus-visible:outline-none"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 ) : shortcut ? (
 <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-emerald-200/60 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:border-emerald-700/80 dark:bg-emerald-950/40 dark:text-emerald-700">
 {shortcut}
 </span>
 ) : null}
 </div>
 )
}
