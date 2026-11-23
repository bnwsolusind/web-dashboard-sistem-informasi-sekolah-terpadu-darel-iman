import * as React from 'react'
import PropTypes from 'prop-types'
import {
  Select as HeroSelect,
  ListBox as HeroListBox,
  ListBoxItem as HeroListBoxItem,
} from '@heroui/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <HeroSelect ref={ref} className={cn('relative w-full min-w-0', className)} {...props}>
      {children}
    </HeroSelect>
  )
})
Select.displayName = 'Select'

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <HeroSelect.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100 dark:focus:border-emerald-500 cursor-pointer min-w-0 overflow-hidden transition-all duration-200',
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0 truncate text-left overflow-hidden">
        {children}
      </div>
      <HeroSelect.Indicator>
        <ChevronDown className="size-4 opacity-80 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
      </HeroSelect.Indicator>
    </HeroSelect.Trigger>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

export const SelectValue = HeroSelect.Value

export const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5', className)}
    {...props}
  />
))
SelectLabel.displayName = 'SelectLabel'

export const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <HeroSelect.Popover
      ref={ref}
      className={cn(
        'z-50 w-[var(--trigger-width)] min-w-[var(--trigger-width)] max-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-emerald-200/90 dark:border-emerald-800/80 bg-white dark:bg-card-dark shadow-xl shadow-emerald-950/10 animate-in fade-in zoom-in-95 !max-h-60',
        className
      )}
      {...props}
    >
      <HeroListBox className="outline-none space-y-0.5 max-h-56 overflow-y-auto p-1.5 focus:outline-none">
        {children}
      </HeroListBox>
    </HeroSelect.Popover>
  )
})
SelectContent.displayName = 'SelectContent'

export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <HeroListBoxItem
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm font-medium text-emerald-950 outline-none hover:bg-emerald-100/70 hover:text-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-950/70 dark:hover:text-emerald-200 transition-colors truncate',
        className
      )}
      {...props}
    >
      {children}
    </HeroListBoxItem>
  )
})
SelectItem.displayName = 'SelectItem'

Select.propTypes = { className: PropTypes.string, children: PropTypes.node }
SelectTrigger.propTypes = { className: PropTypes.string, children: PropTypes.node }
SelectContent.propTypes = { className: PropTypes.string, children: PropTypes.node }
SelectItem.propTypes = { className: PropTypes.string, children: PropTypes.node }

export { default as CustomSelect } from './CustomSelect'
export { default as AppSelect } from './CustomSelect'

export default Select
