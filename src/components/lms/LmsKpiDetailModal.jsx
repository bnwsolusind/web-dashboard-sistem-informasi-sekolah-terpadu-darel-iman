import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import AppModal from '../app/AppModal'
import { Pagination } from '../ui/pagination'

const PAGE_SIZE = 10

/**
 * Reusable KPI Detail Pop-up Modal with search, async full-list loading,
 * and 10-row client-side pagination for LMS pages.
 */
export default function LmsKpiDetailModal({
  isOpen,
  onClose,
  icon,
  title,
  subtitle = 'Rincian data lengkap sesuai kategori KPI yang dipilih.',
  badge,
  rows = [],
  fetchRows = null,
  columns = [],
  searchPlaceholder = 'Cari data di rincian ini...',
  searchFilter = null,
  emptyText = 'Belum ada data pada kategori ini.',
  maxWidth = 'max-w-4xl',
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadedRows, setLoadedRows] = useState(null)

  useEffect(() => {
    if (!isOpen) {
      setLoadedRows(null)
      setSearchQuery('')
      setPage(1)
      return
    }
    setSearchQuery('')
    setPage(1)
    if (typeof fetchRows === 'function') {
      let active = true
      setLoading(true)
      Promise.resolve(fetchRows())
        .then((res) => {
          if (active) setLoadedRows(Array.isArray(res) ? res : [])
        })
        .catch(() => {
          if (active) setLoadedRows(null)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
      return () => {
        active = false
      }
    }
    setLoadedRows(null)
  }, [isOpen, title])

  const sourceRows = useMemo(() => {
    if (Array.isArray(loadedRows)) return loadedRows
    return Array.isArray(rows) ? rows : []
  }, [loadedRows, rows])

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return sourceRows
    return sourceRows.filter((row) => {
      if (typeof searchFilter === 'function') return searchFilter(row, q)
      return JSON.stringify(row).toLowerCase().includes(q)
    })
  }, [sourceRows, searchQuery, searchFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredRows.slice(start, start + PAGE_SIZE)
  }, [filteredRows, safePage])

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      icon={icon}
      title={title}
      subtitle={subtitle}
      badge={badge || `${filteredRows.length} Data`}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
        >
          <X className="size-4" />
          <span>Tutup</span>
        </button>
      }
    >
      <div className="space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full h-10 pl-10 pr-9 text-xs font-bold rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setPage(1)
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 overflow-hidden bg-white dark:bg-[#1B2433]">
          <div className="max-h-[46vh] overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-100/95 via-teal-50/90 to-emerald-100/95 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-950 dark:border-emerald-800/80 dark:text-emerald-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className={`p-3 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-8 text-center">
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Memuat rincian data...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-8 text-center text-xs font-semibold text-slate-500">
                      {emptyText}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition">
                      <td className="p-3 text-center font-bold text-slate-400 tabular-nums">
                        {(safePage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      {columns.map((col, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-3 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                        >
                          {col.render(row, (safePage - 1) * PAGE_SIZE + idx)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar (10 data per halaman) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Menampilkan{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {filteredRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
            </span>
            –
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {Math.min(safePage * PAGE_SIZE, filteredRows.length)}
            </span>{' '}
            dari <span className="font-bold text-slate-900 dark:text-white">{filteredRows.length}</span> data (maks. 10/halaman)
          </span>
          {totalPages > 1 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              sideLayout="icon"
              variant="compact"
            />
          )}
        </div>
      </div>
    </AppModal>
  )
}

