import React from 'react'
import { Pagination } from '../ui/pagination'

/**
 * AppPagination - canonical pagination.
 * Menerima meta Laravel `{ current_page, last_page, total, per_page, from, to }`
 * atau prop manual.
 */
export default function AppPagination({
 currentPage,
 totalPages,
 onPageChange,
 totalItems = 0,
 itemsPerPage = 10,
 sideLayout = 'full',
 variant = 'default',
 meta,
}) {
 const resolvedCurrent = meta?.current_page ?? currentPage ?? 1
 const resolvedTotal = meta?.last_page ?? totalPages ?? 1
 const resolvedTotalItems = meta?.total ?? totalItems ?? 0
 const resolvedPerPage = meta?.per_page ?? itemsPerPage ?? 10

 if (resolvedTotalItems === 0) return null

 const startItem = (resolvedCurrent - 1) * resolvedPerPage + 1
 const endItem = Math.min(resolvedCurrent * resolvedPerPage, resolvedTotalItems)

 return (
 <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
 Menampilkan{' '}
 <span className="font-extrabold text-slate-800 dark:text-white">{startItem}</span> -{' '}
 <span className="font-extrabold text-slate-800 dark:text-white">{endItem}</span> dari{' '}
 <span className="font-extrabold text-slate-800 dark:text-white">{resolvedTotalItems}</span> data
 </p>

 <Pagination
 currentPage={resolvedCurrent}
 totalPages={resolvedTotal}
 sideLayout={sideLayout}
 variant={variant}
 onPageChange={onPageChange}
 />
 </div>
 )
}

