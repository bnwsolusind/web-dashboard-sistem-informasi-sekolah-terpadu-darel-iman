import CustomSelect from "../ui/CustomSelect"
import * as React from 'react'
import PropTypes from 'prop-types'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * StandardSearchInput - Canonical search input field for table toolbars and filters.
 * Uniform styling: h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-sm text-slate-700
 */
export const StandardSearchInput = React.forwardRef(
 ({ value, onChange, onClear, placeholder = 'Cari data...', className, containerClassName, ...props }, ref) => {
 return (
 <div className={cn('relative min-w-[200px] sm:w-64', containerClassName)}>
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600 dark:text-emerald-400 pointer-events-none shrink-0" />
 <input
 ref={ref}
 type="text"
 value={value}
 onChange={onChange}
 placeholder={placeholder}
 className={cn(
 'h-9 w-full rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-9 pr-8 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500',
 className
 )}
 {...props}
 />
 {value && onClear && (
 <button
 type="button"
 onClick={onClear}
 aria-label="Hapus kata kunci pencarian"
 className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <X className="h-4 w-4" />
 </button>
 )}
 </div>
 )
 }
)

StandardSearchInput.displayName = 'StandardSearchInput'

StandardSearchInput.propTypes = {
 value: PropTypes.string,
 onChange: PropTypes.func,
 onClear: PropTypes.func,
 placeholder: PropTypes.string,
 className: PropTypes.string,
 containerClassName: PropTypes.string,
}

/**
 * StandardFilterSelect - Canonical filter dropdown selector.
 * Uniform styling: h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-sm text-slate-700
 */
export const StandardFilterSelect = React.forwardRef(
 ({ value, onChange, options = [], children, className, disabled = false, ...props }, ref) => {
 return (
 <div className="relative">
 <CustomSelect
 ref={ref}
 value={value}
 onChange={onChange}
 disabled={disabled}
 className={cn(
 'h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
 className
 )}
 {...props}
 >
 {children ? (
 children
 ) : (
 options.map((opt) => (
 <option key={opt.value} value={opt.value} disabled={opt.disabled}>
 {opt.label}
 </option>
 ))
 )}
 </CustomSelect>
 <div className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400">
 <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
 <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
 </svg>
 </div>
 </div>
 )
 }
)

StandardFilterSelect.displayName = 'StandardFilterSelect'

StandardFilterSelect.propTypes = {
 value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 onChange: PropTypes.func,
 options: PropTypes.arrayOf(
 PropTypes.shape({
 value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 label: PropTypes.node,
 disabled: PropTypes.bool,
 })
 ),
 children: PropTypes.node,
 className: PropTypes.string,
 disabled: PropTypes.bool,
}

/**
 * StandardFilterBar - Canonical container wrapper for search and filter controls.
 */
export function StandardFilterBar({
 search,
 onSearchChange,
 onSearchClear,
 searchPlaceholder = 'Cari data...',
 children,
 className,
 ...props
}) {
 return (
 <div
 className={cn('flex flex-wrap items-center gap-2.5', className)}
 role="search"
 aria-label="Filter dan Pencarian"
 {...props}
 >
 {onSearchChange !== undefined && (
 <StandardSearchInput
 value={search}
 onChange={onSearchChange}
 onClear={onSearchClear}
 placeholder={searchPlaceholder}
 />
 )}
 {children}
 </div>
 )
}

StandardFilterBar.propTypes = {
 search: PropTypes.string,
 onSearchChange: PropTypes.func,
 onSearchClear: PropTypes.func,
 searchPlaceholder: PropTypes.string,
 children: PropTypes.node,
 className: PropTypes.string,
}

export default StandardFilterBar

