import * as React from 'react'
import PropTypes from 'prop-types'
import { Checkbox as HeroCheckbox, CheckboxGroup as HeroCheckboxGroup } from '@heroui/react'
import { cn } from '../../lib/utils'

export const Checkbox = React.forwardRef(({ className, children, isSelected, defaultSelected, onChange, onValueChange, ...props }, ref) => {
 return (
 <HeroCheckbox
 ref={ref}
 isSelected={isSelected}
 defaultSelected={defaultSelected}
 onChange={onChange}
 onValueChange={onValueChange}
 className={cn('cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 select-none', className)}
 {...props}
 >
 {children}
 </HeroCheckbox>
 )
})

Checkbox.displayName = 'Checkbox'

Checkbox.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node,
 isSelected: PropTypes.bool,
 defaultSelected: PropTypes.bool,
 onChange: PropTypes.func,
 onValueChange: PropTypes.func,
}

export const CheckboxGroup = HeroCheckboxGroup

export default Checkbox
