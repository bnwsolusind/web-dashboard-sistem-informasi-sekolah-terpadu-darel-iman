import * as React from 'react'
import PropTypes from 'prop-types'
import { Checkbox as HeroCheckbox } from '@heroui/react'
import { cn } from '../../lib/utils'

/**
 * AppCheckbox - Canonical enterprise checkbox component based on HeroUI v3.
 * Mengintegrasikan CheckboxRoot, Content, Control, dan Indicator secara otomatis
 * dengan adapter event ganda: e.target.checked (native) & onValueChange(boolean) (HeroUI).
 */
export const AppCheckbox = React.forwardRef((
  {
    className,
    children,
    checked,
    defaultChecked,
    isSelected,
    defaultSelected,
    disabled = false,
    isDisabled,
    name,
    value,
    id,
    onChange,
    onValueChange,
    ...props
  },
  ref
) => {
  const controlledSelected = isSelected !== undefined ? isSelected : checked
  const initialDefaultSelected = defaultSelected !== undefined ? defaultSelected : defaultChecked
  const effectiveDisabled = isDisabled !== undefined ? isDisabled : disabled

  const handleSelectionChange = (newSelected) => {
    if (onValueChange) {
      onValueChange(newSelected)
    }

    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || '',
          id: id || '',
          value: value !== undefined ? value : 'on',
          type: 'checkbox',
          checked: Boolean(newSelected),
        },
        currentTarget: {
          name: name || '',
          id: id || '',
          value: value !== undefined ? value : 'on',
          type: 'checkbox',
          checked: Boolean(newSelected),
        },
        stopPropagation: () => {},
        preventDefault: () => {},
        defaultPrevented: false,
        isPropagationStopped: () => false,
      }
      onChange(syntheticEvent)
    }
  }

  return (
    <HeroCheckbox
      ref={ref}
      id={id}
      name={name}
      value={value}
      isSelected={controlledSelected}
      defaultSelected={initialDefaultSelected}
      isDisabled={effectiveDisabled}
      onChange={handleSelectionChange}
      className={cn(
        'cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 select-none inline-flex items-center',
        effectiveDisabled && 'cursor-not-allowed opacity-50',
        className
      )}
      {...props}
    >
      <HeroCheckbox.Content className="flex items-center gap-2 cursor-pointer">
        <HeroCheckbox.Control className="border border-emerald-200/80 dark:border-emerald-800/60 rounded-md data-[selected=true]:bg-[#059669] data-[selected=true]:border-[#059669] dark:border-emerald-700/80 flex items-center justify-center">
          <HeroCheckbox.Indicator />
        </HeroCheckbox.Control>
        {children && <span>{children}</span>}
      </HeroCheckbox.Content>
    </HeroCheckbox>
  )
})

AppCheckbox.displayName = 'AppCheckbox'

AppCheckbox.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  isSelected: PropTypes.bool,
  defaultSelected: PropTypes.bool,
  disabled: PropTypes.bool,
  isDisabled: PropTypes.bool,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string,
  onChange: PropTypes.func,
  onValueChange: PropTypes.func,
}

export default AppCheckbox
