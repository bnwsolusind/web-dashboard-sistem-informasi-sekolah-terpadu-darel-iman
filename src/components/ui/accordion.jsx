import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FaChevronDown } from 'react-icons/fa'
import { cn } from '../../lib/utils'

export function AccordionItem({ title, subtitle, icon, children, defaultOpen = false }) {
 const [isOpen, setIsOpen] = useState(defaultOpen)

 return (
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white overflow-hidden transition-all duration-200 dark:bg-[#1B2433] dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => setIsOpen((prev) => !prev)}
 className="flex w-full items-center justify-between p-4 text-left hover:bg-emerald-50/40 transition cursor-pointer dark:hover:bg-emerald-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/30"
 >
 <div className="flex items-center gap-3">
 {icon && <div className="text-emerald-700 text-lg dark:text-[#18A972]">{icon}</div>}
 <div>
 <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-white">{title}</h4>
 {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
 </div>
 </div>
 <FaChevronDown
 className={cn(
 'text-xs text-slate-400 transition-transform duration-200',
 isOpen && 'rotate-180 text-emerald-600 dark:text-[#18A972]'
 )}
 />
 </button>

 {isOpen && (
 <div className="border-t border-emerald-100/80 p-4 text-xs text-slate-600 dark:border-emerald-800/60 dark:text-slate-300 animate-in fade-in duration-200">
 {children}
 </div>
 )}
 </div>
 )
}

AccordionItem.propTypes = {
 title: PropTypes.node.isRequired,
 subtitle: PropTypes.node,
 icon: PropTypes.node,
 children: PropTypes.node,
 defaultOpen: PropTypes.bool,
}

export function Accordion({ children, className }) {
 return <div className={cn('space-y-3', className)}>{children}</div>
}

Accordion.propTypes = {
 children: PropTypes.node,
 className: PropTypes.string,
}
