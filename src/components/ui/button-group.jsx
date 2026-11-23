import * as React from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

/**
 * Standard HeroUI ButtonGroup component for grouping related actions.
 */
export const ButtonGroup = React.forwardRef(
 ({ className, children, orientation = 'horizontal', ...props }, ref) => {
 return (
 <div
 ref={ref}
 role="group"
 className={cn(
 'inline-flex rounded-lg shadow-xs overflow-hidden',
 orientation === 'vertical'
 ? 'flex-col [&>button]:rounded-none [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg [&>button:not(:last-child)]:border-b'
 : 'flex-row [&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:last-child)]:border-r',
 className
 )}
 {...props}
 >
 {children}
 </div>
 )
 }
)

ButtonGroup.displayName = 'ButtonGroup'

ButtonGroup.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node,
 orientation: PropTypes.oneOf(['horizontal', 'vertical']),
}

export default ButtonGroup

