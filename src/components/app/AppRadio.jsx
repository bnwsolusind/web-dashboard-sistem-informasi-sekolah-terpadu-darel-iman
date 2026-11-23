import * as React from 'react'
import PropTypes from 'prop-types'
import { Radio as UiRadio, RadioGroup as UiRadioGroup } from '@heroui/react'
import { cn } from '../../lib/utils'

/**
 * AppRadioGroup - Canonical enterprise radio group container based on HeroUI v3.
 * Mengelola grup pilihan radio tunggal (string value contract) dengan dukungan label,
 * controlled (value) & uncontrolled (defaultValue), serta adapter onChange / onValueChange.
 */
export const AppRadioGroup = React.forwardRef((
  {
    className,
    children,
    value,
    defaultValue,
    onChange,
    onValueChange,
    name,
    disabled = false,
    isDisabled,
    label,
    ...props
  },
  ref
) => {
  const effectiveDisabled = isDisabled !== undefined ? isDisabled : disabled

  const handleChange = (newVal) => {
    if (onValueChange) {
      onValueChange(newVal)
    }

    if (onChange) {
      const syntheticEvent = {
        target: { name: name || '', value: newVal },
        currentTarget: { name: name || '', value: newVal },
        stopPropagation: () => {},
        preventDefault: () => {},
      }
      onChange(syntheticEvent)
    }
  }

  return (
    <UiRadioGroup
      ref={ref}
      name={name}
      value={value}
      defaultValue={defaultValue}
      isDisabled={effectiveDisabled}
      onValueChange={handleChange}
      className={cn('flex flex-col gap-2.5', className)}
      {...props}
    >
      {label && <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>}
      {children}
    </UiRadioGroup>
  )
})

AppRadioGroup.displayName = 'AppRadioGroup'

AppRadioGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onValueChange: PropTypes.func,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  isDisabled: PropTypes.bool,
  label: PropTypes.node,
}

/**
 * AppRadio - Canonical enterprise radio option based on HeroUI v3.
 * Otomatis menyertakan Radio.Content, Control, dan Indicator.
 */
export const AppRadio = React.forwardRef(({ className, children, value, disabled, isDisabled, ...props }, ref) => {
  const effectiveDisabled = isDisabled !== undefined ? isDisabled : disabled

  return (
    <UiRadio
      ref={ref}
      value={value}
      isDisabled={effectiveDisabled}
      className={cn(
        'cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 select-none inline-flex items-center',
        effectiveDisabled && 'cursor-not-allowed opacity-50',
        className
      )}
      {...props}
    >
      <UiRadio.Content className="flex items-center gap-2 cursor-pointer">
        <UiRadio.Control className="border border-emerald-200/80 dark:border-emerald-800/60 rounded-full data-[selected=true]:border-[#059669] dark:border-emerald-700/80 flex items-center justify-center">
          <UiRadio.Indicator />
        </UiRadio.Control>
        {children && <span>{children}</span>}
      </UiRadio.Content>
    </UiRadio>
  )
})

AppRadio.displayName = 'AppRadio'

AppRadio.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  isDisabled: PropTypes.bool,
}

export default AppRadio
