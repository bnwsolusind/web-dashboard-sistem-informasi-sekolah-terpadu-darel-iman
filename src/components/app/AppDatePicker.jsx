import * as React from 'react'
import PropTypes from 'prop-types'
import { DatePicker as UiDatePicker } from '../ui/date-picker'

/**
 * AppDatePicker - Canonical enterprise date picker component based on HeroUI v3 & SIMSIT standards.
 * Menjamin format ISO YYYY-MM-DD, kalender lokalisasi Bahasa Indonesia, dan backward-compatible
 * synthetic event { target: { name, id, value: 'YYYY-MM-DD' } }.
 */
export const AppDatePicker = React.forwardRef((props, ref) => {
  return <UiDatePicker ref={ref} {...props} />
})

AppDatePicker.displayName = 'AppDatePicker'

AppDatePicker.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  isClearable: PropTypes.bool,
  isError: PropTypes.bool,
  showDayName: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  popoverClassName: PropTypes.string,
}

export default AppDatePicker

