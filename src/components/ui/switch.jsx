import * as React from 'react'
import PropTypes from 'prop-types'
import { Switch as HeroSwitch } from '@heroui/react'
import { cn } from '../../lib/utils'

export const Switch = React.forwardRef(({ className, children, isSelected, defaultSelected, onChange, onValueChange, size = 'md', ...props }, ref) => {
 return (
 <HeroSwitch
 ref={ref}
 isSelected={isSelected}
 defaultSelected={defaultSelected}
 onChange={onChange}
 onValueChange={onValueChange}
 size={size}
 className={cn('cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 select-none', className)}
 {...props}
 >
 {children}
 </HeroSwitch>
 )
})

Switch.displayName = 'Switch'

Switch.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node,
 isSelected: PropTypes.bool,
 defaultSelected: PropTypes.bool,
 onChange: PropTypes.func,
 onValueChange: PropTypes.func,
 size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

export default Switch
