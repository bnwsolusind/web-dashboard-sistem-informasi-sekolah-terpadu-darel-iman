import * as React from 'react'
import PropTypes from 'prop-types'
import { Input as HeroUiInput } from '../ui/input'
import { cn } from '../../lib/utils'

/**
 * AppInput - Canonical enterprise input field based on HeroUI v3.
 * Menjamin standard radius 8px, semantic focus ring (#059669), dan visual consistency.
 */
export const AppInput = React.forwardRef(({ className, isError, disabled, isDisabled, ...props }, ref) => {
  return (
    <HeroUiInput
      ref={ref}
      isError={isError}
      disabled={disabled || isDisabled}
      className={cn(
        'rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200',
        className
      )}
      {...props}
    />
  )
})

AppInput.displayName = 'AppInput'

AppInput.propTypes = {
  className: PropTypes.string,
  isError: PropTypes.bool,
  type: PropTypes.string,
}

export default AppInput

