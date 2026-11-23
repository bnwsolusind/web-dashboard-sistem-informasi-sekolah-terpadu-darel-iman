import React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * FormField - Canonical form field wrapper component.
 * Handles label, required indicator, icon, helper text, and validation error state.
 */
export default function FormField({
 label,
 required = false,
 error,
 helperText,
 icon: Icon,
 id,
 className = '',
 children,
}) {
 return (
 <div className={cn('space-y-1.5 min-w-0', className)}>
 {label && (
 <label
 htmlFor={id}
 className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200"
 >
 <span className="flex items-center gap-1.5">
 {Icon && <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />}
 {label}
 {required && <span className="text-rose-500 font-extrabold">*</span>}
 </span>
 </label>
 )}

 <div className="relative">
 {children}
 </div>

 {error ? (
 <p className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in duration-150">
 <AlertCircle className="h-3 w-3 shrink-0" />
 <span>{typeof error === 'object' ? error.message : error}</span>
 </p>
 ) : helperText ? (
 <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{helperText}</p>
 ) : null}
 </div>
 )
}
