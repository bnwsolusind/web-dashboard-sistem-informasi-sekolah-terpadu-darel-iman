import * as React from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Standard HeroUI CloseButton for Modals, Drawers, Alerts, and Popovers.
 */
export const CloseButton = React.forwardRef(
 ({ className, onClick, ariaLabel = 'Tutup', size = 'md', ...props }, ref) => {
 const sizeClasses = {
 sm: 'h-7 w-7 rounded-md p-1',
 md: 'h-8 w-8 rounded-lg p-1.5',
 lg: 'h-9 w-9 rounded-lg p-2',
 }[size] || 'h-8 w-8 rounded-lg p-1.5'

 return (
 <button
 ref={ref}
 type="button"
 aria-label={ariaLabel}
 onClick={onClick}
 className={cn(
 'inline-flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] dark:focus-visible:ring-[#18A972] cursor-pointer shrink-0',
 sizeClasses,
 className
 )}
 {...props}
 >
 <X className="h-4 w-4" />
 </button>
 )
 }
)

CloseButton.displayName = 'CloseButton'

CloseButton.propTypes = {
 className: PropTypes.string,
 onClick: PropTypes.func,
 ariaLabel: PropTypes.string,
 size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

export default CloseButton

