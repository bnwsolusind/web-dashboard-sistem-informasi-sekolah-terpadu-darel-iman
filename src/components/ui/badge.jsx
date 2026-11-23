import * as React from 'react'
import PropTypes from 'prop-types'
import { Chip as HeroChip } from '@heroui/react'
import { cn } from '../../lib/utils'

const mapHeroColor = (variant, colorProp) => {
  const target = colorProp || variant
  switch (target) {
    case 'primary':
    case 'emerald':
    case 'teal':
    case 'green':
    case 'success':
      return 'success'
    case 'warning':
    case 'amber':
    case 'orange':
      return 'warning'
    case 'danger':
    case 'destructive':
    case 'error':
    case 'rose':
    case 'red':
      return 'danger'
    case 'info':
    case 'sky':
    case 'cyan':
    case 'blue':
      return 'accent'
    case 'purple':
    case 'violet':
    case 'indigo':
      return 'secondary'
    case 'default':
    case 'outline':
    case 'gray':
    default:
      return 'default'
  }
}

const colorClassMap = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
  warning: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
  danger: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
  accent: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800',
  secondary: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800',
  default: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
}

const renderIcon = (icon) => {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && icon.$$typeof)) {
    const IconComponent = icon
    return <IconComponent className="size-3.5" />
  }
  return icon
}

export function Badge({ className, variant = 'default', color, size = 'sm', children, prefixIcon, suffixIcon, ...props }) {
  const heroColor = mapHeroColor(variant, color)
  const renderedPrefix = renderIcon(prefixIcon)
  const renderedSuffix = renderIcon(suffixIcon)
  const resolvedColorClass = colorClassMap[heroColor] || colorClassMap.default

  const sizeClass = size === 'xs'
    ? 'text-[10px] px-2 py-0.5'
    : size === 'lg'
      ? 'text-sm px-3.5 py-1'
      : 'text-xs px-2.5 py-0.5'

  return (
    <span
      className={cn(
        'font-bold rounded-full inline-flex items-center gap-1.5 border shadow-2xs transition-colors shrink-0 whitespace-nowrap',
        sizeClass,
        resolvedColorClass,
        className
      )}
      {...props}
    >
      {renderedPrefix && <span className="inline-flex shrink-0">{renderedPrefix}</span>}
      {children}
      {renderedSuffix && <span className="inline-flex shrink-0">{renderedSuffix}</span>}
    </span>
  )
}

export function Chip({ children, ...props }) {
  return <Badge {...props}>{children}</Badge>
}
Chip.Label = ({ children }) => <>{children}</>

Badge.displayName = 'Badge'
Chip.displayName = 'Chip'

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  children: PropTypes.node,
}

export default Badge
