import * as React from 'react'
import PropTypes from 'prop-types'
import { Input as HeroInput } from '@heroui/react'
import { cn } from '../../lib/utils'

import { DatePicker } from './date-picker'
import { TimePicker } from './time-picker'

export const Input = React.forwardRef(({ className, type = 'text', isError = false, disabled = false, isDisabled = false, useNative = false, ...props }, ref) => {
  const isInputDisabled = Boolean(disabled || isDisabled)

  if (!useNative && type === 'date') {
    return <DatePicker ref={ref} isError={isError} disabled={isInputDisabled} className={className} {...props} />
  }

  if (!useNative && type === 'time') {
    return <TimePicker ref={ref} isError={isError} disabled={isInputDisabled} className={className} {...props} />
  }

  return (
    <HeroInput
      type={type}
      ref={ref}
      disabled={isInputDisabled}
      className={cn(
        'flex h-10 w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500',
        isError
          ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-600 dark:focus:ring-rose-500/20'
          : 'border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:focus:border-emerald-500',
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  isError: PropTypes.bool,
}

export default Input

