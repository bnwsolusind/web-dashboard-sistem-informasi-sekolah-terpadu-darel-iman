import * as React from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

/**
 * Standard HeroUI Separator / Divider component.
 */
export const Separator = React.forwardRef(
 ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => {
 return (
 <div
 ref={ref}
 role={decorative ? 'none' : 'separator'}
 aria-orientation={decorative ? undefined : orientation}
 className={cn(
 'shrink-0 bg-slate-200 dark:bg-slate-800',
 orientation === 'horizontal' ? 'h-px w-full my-3' : 'h-full w-px mx-3',
 className
 )}
 {...props}
 />
 )
 }
)

Separator.displayName = 'Separator'

Separator.propTypes = {
 className: PropTypes.string,
 orientation: PropTypes.oneOf(['horizontal', 'vertical']),
 decorative: PropTypes.bool,
}

export const Divider = Separator
export default Separator

