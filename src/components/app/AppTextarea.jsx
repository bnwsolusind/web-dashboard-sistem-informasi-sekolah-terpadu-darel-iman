import * as React from 'react'
import PropTypes from 'prop-types'
import { TextArea as HeroUiTextArea } from '../ui/text-area'
import { cn } from '../../lib/utils'

/**
 * AppTextarea - Canonical enterprise multi-line text field based on HeroUI v3.
 * Mendukung standard radius 12px (rounded-xl), semantic focus ring (#059669),
 * dark mode, dan semantic error state (isError).
 */
export const AppTextarea = React.forwardRef(({ className, isError, rows = 4, ...props }, ref) => {
  return (
    <HeroUiTextArea
      ref={ref}
      rows={rows}
      className={cn(
        isError && 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-emerald-800/60 dark:focus:border-rose-500',
        className
      )}
      {...props}
    />
  )
})

AppTextarea.displayName = 'AppTextarea'

AppTextarea.propTypes = {
  className: PropTypes.string,
  isError: PropTypes.bool,
  rows: PropTypes.number,
  name: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  onChange: PropTypes.func,
}

export default AppTextarea

