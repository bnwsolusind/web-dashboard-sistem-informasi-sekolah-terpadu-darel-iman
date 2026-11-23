import * as React from 'react'
import PropTypes from 'prop-types'
import { TextArea as HeroTextArea } from '@heroui/react'
import { cn } from '../../lib/utils'

export const TextArea = React.forwardRef(({ className, rows = 4, ...props }, ref) => {
 return (
 <HeroTextArea
 ref={ref}
 rows={rows}
 className={cn(
 'w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all dark:border-emerald-800/60 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#18A972] dark:focus:ring-[#18A972]/20',
 className
 )}
 {...props}
 />
 )
})

TextArea.displayName = 'TextArea'

TextArea.propTypes = {
 className: PropTypes.string,
 rows: PropTypes.number,
}

export default TextArea
