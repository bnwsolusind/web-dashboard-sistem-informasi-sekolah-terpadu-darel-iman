import * as React from 'react'
import PropTypes from 'prop-types'
import { Radio as HeroRadio, RadioGroup as HeroRadioGroup } from '@heroui/react'
import { cn } from '../../lib/utils'

export const Radio = React.forwardRef(({ className, children, value, ...props }, ref) => {
 return (
 <HeroRadio
 ref={ref}
 value={value}
 className={cn('cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 select-none', className)}
 {...props}
 >
 {children}
 </HeroRadio>
 )
})

Radio.displayName = 'Radio'

Radio.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node,
 value: PropTypes.string,
}

export const RadioGroup = React.forwardRef(({ className, children, value, defaultValue, onValueChange, label, ...props }, ref) => {
 return (
 <HeroRadioGroup
 ref={ref}
 value={value}
 defaultValue={defaultValue}
 onValueChange={onValueChange}
 className={cn('flex flex-col gap-2', className)}
 {...props}
 >
 {label && <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>}
 {children}
 </HeroRadioGroup>
 )
})

RadioGroup.displayName = 'RadioGroup'

RadioGroup.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node,
 value: PropTypes.string,
 defaultValue: PropTypes.string,
 onValueChange: PropTypes.func,
 label: PropTypes.node,
}

export default Radio
