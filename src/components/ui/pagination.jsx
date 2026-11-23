import React from 'react'
import PropTypes from 'prop-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

/**
 * Canonical Pagination Component based on HeroUI Design System foundation.
 * Uses emerald accents and supports both standalone navigation controls and full summary layouts.
 */
export function Pagination({
 currentPage = 1,
 totalPages = 1,
 onPageChange,
 totalItems = 0,
 itemsPerPage = 10,
 showSummary = false,
 sideLayout = 'icon',
 variant = 'default',
 className = '',
}) {
 if (totalPages <= 0) return null

 const startItem = (currentPage - 1) * itemsPerPage + 1
 const endItem = Math.min(currentPage * itemsPerPage, totalItems)
 const pages = []
 for (let page = 1; page <= totalPages; page += 1) {
 if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) pages.push(page)
 }
 const pageItems = pages.reduce((items, page, index) => {
 if (index > 0 && page - pages[index - 1] > 1) items.push(`ellipsis-${page}`)
 items.push(page)
 return items
 }, [])

 const navControls = (
 <nav
 role="navigation"
 aria-label="Pagination"
 className={cn('flex items-center gap-1 sm:gap-1.5', className)}
 >
 <Button
 variant="primary"
 size="sm"
 disabled={currentPage <= 1}
 aria-label="Halaman sebelumnya"
 title="Halaman sebelumnya"
 onPress={() => onPageChange && onPageChange(currentPage - 1)}
 onClick={() => onPageChange && onPageChange(currentPage - 1)}
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:disabled:bg-emerald-950/40 dark:disabled:/30 cursor-pointer p-0"
 >
 <ChevronLeft className="size-5 shrink-0 text-white" />
 </Button>

 <div className="flex items-center gap-1">
 {pageItems.map((page) =>
 typeof page === 'string' ? (
 <span
 key={page}
 aria-hidden="true"
 className="flex size-9 shrink-0 items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500"
 >
 …
 </span>
 ) : (
 <button
 key={page}
 type="button"
 onClick={() => onPageChange && onPageChange(page)}
 aria-label={`Buka halaman ${page}`}
 aria-current={page === currentPage ? 'page' : undefined}
 className={cn(
 'flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30',
 page === currentPage
 ? 'bg-emerald-600 text-white rounded-xl font-bold shadow-xs dark:bg-emerald-600 dark:text-white'
 : 'rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 )}
 >
 {page}
 </button>
 )
 )}
 </div>

 <Button
 variant="primary"
 size="sm"
 disabled={currentPage >= totalPages}
 aria-label="Halaman berikutnya"
 title="Halaman berikutnya"
 onPress={() => onPageChange && onPageChange(currentPage + 1)}
 onClick={() => onPageChange && onPageChange(currentPage + 1)}
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:disabled:bg-emerald-950/40 dark:disabled:/30 cursor-pointer p-0"
 >
 <ChevronRight className="size-5 shrink-0 text-white" />
 </Button>
 </nav>
 )

 if (!showSummary) {
 return navControls
 }

 return (
 <div className="flex flex-col items-center justify-between gap-3 pt-3 sm:flex-row sm:pt-4">
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
 Menampilkan{' '}
 <span className="font-extrabold text-slate-800 dark:text-white">{totalItems > 0 ? startItem : 0}</span> -{' '}
 <span className="font-extrabold text-slate-800 dark:text-white">{endItem}</span> dari{' '}
 <span className="font-extrabold text-slate-800 dark:text-white">{totalItems}</span> data
 </p>
 {navControls}
 </div>
 )
}

Pagination.propTypes = {
 currentPage: PropTypes.number,
 totalPages: PropTypes.number,
 onPageChange: PropTypes.func,
 totalItems: PropTypes.number,
 itemsPerPage: PropTypes.number,
 showSummary: PropTypes.bool,
 sideLayout: PropTypes.oneOf(['full', 'label', 'icon']),
 variant: PropTypes.string,
 className: PropTypes.string,
}

export default Pagination
