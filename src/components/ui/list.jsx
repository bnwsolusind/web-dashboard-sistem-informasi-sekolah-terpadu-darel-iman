import * as React from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

export function List({ children, hideDividers = false, direction = 'vertical', className, ...props }) {
 return (
 <ul
 className={cn(
 'flex w-full overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white text-sm text-slate-800 dark:border-emerald-800/60 dark:bg-[#1B2433] dark:text-slate-100',
 direction === 'vertical' ? 'flex-col' : 'flex-row',
 !hideDividers && (direction === 'vertical' ? 'divide-y divide-emerald-100/80 dark:divide-emerald-900/40' : 'divide-x divide-emerald-100/80 dark:divide-emerald-900/40'),
 className
 )}
 {...props}
 >
 {children}
 </ul>
 )
}

List.propTypes = {
 children: PropTypes.node,
 hideDividers: PropTypes.bool,
 direction: PropTypes.oneOf(['vertical', 'horizontal']),
 className: PropTypes.string,
}

export default List
