import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip as HeroTooltip } from '@heroui/react'
import { cn } from '../../lib/utils'

export function Tooltip({ text, content, label, children, position = 'top', className = '' }) {
 const displayText = content || text || label
 if (!displayText) return children

 const placementMap = {
 top: 'top',
 bottom: 'bottom',
 left: 'left',
 right: 'right',
 }

 return (
 <HeroTooltip placement={placementMap[position] || 'top'}>
 <HeroTooltip.Trigger>
 {children}
 </HeroTooltip.Trigger>
 <HeroTooltip.Content
 className={cn(
 'z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-md dark:bg-emerald-950 dark:text-emerald-100 dark:border dark:border-emerald-800/60',
 className
 )}
 >
 {displayText}
 </HeroTooltip.Content>
 </HeroTooltip>
 )
}

Tooltip.propTypes = {
 text: PropTypes.node,
 children: PropTypes.node.isRequired,
 position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
 className: PropTypes.string,
}

