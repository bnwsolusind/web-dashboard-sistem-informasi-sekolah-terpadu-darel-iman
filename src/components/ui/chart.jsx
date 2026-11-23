import * as React from 'react'
import PropTypes from 'prop-types'
import * as RechartsPrimitive from 'recharts'
import { cn } from '../../lib/utils'

export function ChartContainer({ className, children, ...props }) {
 return (
 <RechartsPrimitive.ResponsiveContainer
 className={cn('w-full text-xs [&_.recharts-wrapper_*]:focus:outline-none', className)}
 {...props}
 >
 {children}
 </RechartsPrimitive.ResponsiveContainer>
 )
}

export const ChartTooltip = RechartsPrimitive.Tooltip

export function ChartTooltipContent({ active, payload, label, className }) {
 if (!active || !payload?.length) return null

 return (
 <div
 className={cn(
 'rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white/95 p-2.5 shadow-xl backdrop-blur-sm dark:bg-card-dark/95 text-xs space-y-1',
 className
 )}
 >
 {label && <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>}
 {payload.map((item, index) => (
 <div key={index} className="flex items-center gap-2">
 <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
 <span className="text-slate-500 dark:text-slate-400">{item.name}:</span>
 <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
 </div>
 ))}
 </div>
 )
}

ChartContainer.propTypes = {
 className: PropTypes.string,
 children: PropTypes.node,
}

ChartTooltipContent.propTypes = {
 active: PropTypes.bool,
 payload: PropTypes.array,
 label: PropTypes.node,
 className: PropTypes.string,
}

export default ChartContainer
