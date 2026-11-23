import React from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { cn } from '../../lib/utils'
import AppButton from './AppButton'

/**
 * AppFilterBar - Canonical filter bar wrapper for page tables and data filters.
 *
 * Props:
 * - label: string (default 'Filter')
 * - activeCount: number of active filter conditions
 * - onReset: callback function when reset filter button is clicked
 * - children: select inputs, datepickers, radios, etc.
 */
export default function AppFilterBar({
  children,
  label = 'Filter',
  activeCount = 0,
  onReset,
  className = '',
}) {
  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 bg-white p-4 shadow-xs transition-all sm:flex-row sm:items-center dark:border-emerald-800/60 dark:bg-[#1B2433]',
        className
      )}
    >
      {label && (
        <div className="flex shrink-0 items-center justify-between sm:justify-start gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <SlidersHorizontal className="h-[18px] w-[18px] text-[#059669] dark:text-[#18A972]" strokeWidth={2} />
            {label}
            {activeCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#059669] px-1.5 text-[10px] font-extrabold text-white dark:bg-[#18A972] dark:text-slate-900">
                {activeCount}
              </span>
            )}
          </span>

          {activeCount > 0 && onReset && (
            <AppButton
              type="button"
              variant="ghost"
              size="xs"
              icon={RotateCcw}
              onClick={onReset}
              className="sm:hidden text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              Reset
            </AppButton>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        {children}
      </div>

      {activeCount > 0 && onReset && (
        <AppButton
          type="button"
          variant="ghost"
          size="xs"
          icon={RotateCcw}
          onClick={onReset}
          className="hidden sm:inline-flex shrink-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40"
        >
          Reset Filter
        </AppButton>
      )}
    </section>
  )
}
