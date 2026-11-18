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
    <HeroSelect ref={ref} className={cn('relative w-full', className)} {...props}>
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
        'flex h-10 w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-xs focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-100 dark:focus:border-[#3FBF75] dark:focus:ring-[#3FBF75]/20 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
      <HeroSelect.Indicator>
        <ChevronDown className="size-4 opacity-50 shrink-0" />
      </HeroSelect.Indicator>
    </HeroSelect.Trigger>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

export const SelectValue = HeroSelect.Value

export const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5', className)}
    {...props}
  />
))
SelectLabel.displayName = 'SelectLabel'

export const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <HeroSelect.Popover
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-[#1B2433] animate-in fade-in zoom-in-95',
        className
      )}
      {...props}
    >
      <HeroListBox className="outline-none space-y-0.5">
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
        'relative flex w-full cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 outline-none hover:bg-emerald-50 hover:text-emerald-900 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors',
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
