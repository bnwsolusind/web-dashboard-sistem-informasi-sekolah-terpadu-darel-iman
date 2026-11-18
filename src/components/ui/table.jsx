import * as React from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

/**
 * Canonical Table Component based on HeroUI Design System specifications.
 * Styled with Dareliman Edu Emerald Green palette and responsive container.
 */
export const Table = React.forwardRef(({ className, fullBleed = false, ...props }, ref) => (
  <div className="w-full overflow-x-auto rounded-[20px] border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] shadow-xs">
    <table
      ref={ref}
      data-slot="table"
      className={cn(
        'w-full min-w-full border-collapse text-left text-sm text-slate-800 dark:text-slate-100',
        fullBleed ? 'border-y border-emerald-200/90 dark:border-emerald-800/80' : '',
        className
      )}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'
export const TableRoot = Table

export const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    data-slot="table-header"
    className={cn(
      'bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 text-xs font-bold',
      className
    )}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

export const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    data-slot="table-body"
    className={cn('divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-slate-700 dark:text-slate-200', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

export const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    data-slot="table-footer"
    className={cn(
      'border-t border-emerald-200/80 bg-slate-50/80 font-semibold text-slate-600 dark:border-emerald-800/60 dark:bg-slate-800/50 dark:text-slate-300',
      className
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

export const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    data-slot="table-row"
    className={cn(
      'transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border-b border-emerald-100/70 dark:border-emerald-900/30',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

export const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    data-slot="table-head"
    className={cn(
      'px-4 sm:px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 border-b border-emerald-200/80 dark:border-emerald-800/80',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

export const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    data-slot="table-cell"
    className={cn('px-4 sm:px-5 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-200 border-b border-emerald-100/70 dark:border-emerald-900/30', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

export const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    data-slot="table-caption"
    className={cn('mt-4 text-xs text-slate-400 dark:text-slate-500', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

Table.propTypes = { className: PropTypes.string, fullBleed: PropTypes.bool }
TableHeader.propTypes = { className: PropTypes.string }
TableBody.propTypes = { className: PropTypes.string }
TableFooter.propTypes = { className: PropTypes.string }
TableRow.propTypes = { className: PropTypes.string }
TableHead.propTypes = { className: PropTypes.string }
TableCell.propTypes = { className: PropTypes.string }
TableCaption.propTypes = { className: PropTypes.string }

export default Table
