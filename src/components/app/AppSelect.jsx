import React from 'react'
import CustomSelect from '../ui/CustomSelect'

/**
 * AppSelect - Canonical enterprise select component based on HeroUI v3 & CustomSelect.
 * Mengintegrasikan auto-search, clearable, status color, keyboard accessibility, dan forwardRef.
 */
export const AppSelect = React.forwardRef(function AppSelect(props, ref) {
  return <CustomSelect ref={ref} {...props} />
})

AppSelect.displayName = 'AppSelect'

export default AppSelect

