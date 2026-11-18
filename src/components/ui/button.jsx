import * as React from 'react'
import PropTypes from 'prop-types'
import { Button as HeroButton } from '@heroui/react'
import { cn } from '../../lib/utils'

const mapVariant = (variant) => {
  switch (variant) {
    case 'primary':
      return { variant: 'primary', extraClass: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/20 shadow-xs' }
    case 'destructive':
    case 'danger':
    case 'error':
      return { variant: 'danger', extraClass: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/20 shadow-xs' }
    case 'warning':
      return { variant: 'warning', extraClass: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/20 shadow-xs' }
    case 'success':
      return { variant: 'primary', extraClass: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/20 shadow-xs' }
    case 'ghost':
    case 'link':
      return { variant: 'ghost', extraClass: 'hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800' }
    case 'outline':
    case 'secondary':
    case 'default':
    default:
      return { variant: 'outline', extraClass: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium shadow-xs' }
  }
}

const mapSize = (size) => {
  switch (size) {
    case 'xs':
      return { size: 'sm', iconOnly: false, extraClass: 'text-xs font-medium h-7 px-2.5 rounded-lg' }
    case 'sm':
      return { size: 'sm', iconOnly: false, extraClass: 'text-xs font-medium h-8 px-3 rounded-lg' }
    case 'lg':
      return { size: 'lg', iconOnly: false, extraClass: 'text-base font-medium h-10 px-5 rounded-lg' }
    case 'icon':
      return { size: 'sm', iconOnly: true, extraClass: 'h-8 w-8 p-0 rounded-lg inline-flex items-center justify-center' }
    case 'default':
    case 'md':
    default:
      return { size: 'md', iconOnly: false, extraClass: 'text-sm font-medium h-9 px-4 rounded-lg' }
  }
}

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'default', disabled, iconOnly, onPress, onClick, ...props }, ref) => {
    const v = mapVariant(variant)
    const s = mapSize(size)
    const isIcon = Boolean(iconOnly || s.iconOnly)
    return (
      <HeroButton
        ref={ref}
        variant={v.variant}
        size={s.size}
        isIconOnly={isIcon}
        isDisabled={Boolean(disabled)}
        onPress={onPress || onClick}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
          v.extraClass,
          s.extraClass,
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'default', 'secondary', 'warning', 'destructive', 'danger', 'error', 'outline', 'ghost', 'icon', 'link', 'success']),
  size: PropTypes.oneOf(['default', 'xs', 'sm', 'lg', 'icon', 'md']),
  disabled: PropTypes.bool,
  children: PropTypes.node,
}

export default Button

