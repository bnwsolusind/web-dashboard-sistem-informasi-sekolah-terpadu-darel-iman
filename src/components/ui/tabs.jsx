import React from 'react'
import PropTypes from 'prop-types'
import {
 Tabs as HeroTabs,
 Tab as HeroTab,
 TabList as HeroTabList,
 TabPanel as HeroTabPanel,
} from '@heroui/react'
import { cn } from '../../lib/utils'

export function Tabs({
 tabs = [],
 activeTab,
 value,
 onChange,
 onTabChange,
 onValueChange,
 variant = 'pill', // 'pill' | 'underline'
 size = 'md', // 'sm' | 'md'
 className,
 containerClassName,
 tabClassName,
 activeTabClassName,
 inactiveTabClassName,
 ariaLabel = 'Tab navigation',
 children,
 ...props
}) {
 const currentActive = activeTab !== undefined ? activeTab : value
 const handleChange = (id) => {
 if (onChange) onChange(id)
 if (onTabChange) onTabChange(id)
 if (onValueChange) onValueChange(id)
 }

 const isPill = variant === 'pill'

 if (!tabs || tabs.length === 0) {
 return (
 <HeroTabs
 selectedKey={currentActive !== undefined ? String(currentActive) : undefined}
 onSelectionChange={(key) => handleChange(key)}
 variant={isPill ? 'primary' : 'secondary'}
 className={cn('w-full', className)}
 {...props}
 >
 {children}
 </HeroTabs>
 )
 }

 return (
 <HeroTabs
 selectedKey={currentActive !== undefined ? String(currentActive) : undefined}
 onSelectionChange={(key) => handleChange(key)}
 variant={isPill ? 'primary' : 'secondary'}
 aria-label={ariaLabel}
 className={cn(
 isPill
 ? 'inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80 overflow-x-auto no-scrollbar max-w-full shrink-0 shadow-xs'
 : 'flex items-center gap-1.5 border-b border-emerald-200/80 dark:border-emerald-800/60 overflow-x-auto no-scrollbar w-full',
 containerClassName,
 className
 )}
 {...props}
 >
 <HeroTabList
 aria-label={ariaLabel}
 className={cn(
 isPill
 ? 'flex items-center gap-1.5 w-max'
 : 'flex items-center gap-1.5 w-full'
 )}
 >
 {tabs.map((tab) => {
 const tabId = String(tab.id ?? tab.key ?? tab.value)
 const isActive = String(currentActive) === tabId
 const Icon = tab.icon

 return (
 <HeroTab
 key={tabId}
 id={tabId}
 isDisabled={Boolean(tab.disabled)}
 className={cn(
 'flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
 size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm',
 isPill
 ? cn(
 'rounded-xl font-medium border border-transparent',
 isActive
 ? 'bg-emerald-600 text-white shadow-sm font-bold opacity-100 border-emerald-700 dark:bg-emerald-600 dark:text-white dark:border-emerald-500'
 : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-100/50 font-semibold dark:text-slate-300 dark:hover:text-slate-100 opacity-70 hover:opacity-100',
 isActive ? activeTabClassName : inactiveTabClassName
 )
 : cn(
 'border-b-2 font-bold rounded-t-xl',
 isActive
 ? 'border-emerald-600 text-emerald-700 dark:border-emerald-500 dark:text-emerald-300 font-extrabold bg-emerald-50/60 dark:bg-emerald-950/40'
 : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-emerald-300 dark:text-slate-400 dark:hover:text-slate-200 opacity-70',
 isActive ? activeTabClassName : inactiveTabClassName
 ),
 tab.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
 tabClassName
 )}
 >
 {Icon && (
 <span className={cn('shrink-0', size === 'sm' ? 'size-3.5' : 'size-4')}>
 {React.isValidElement(Icon) ? (
 Icon
 ) : typeof Icon === 'function' ? (
 <Icon className={size === 'sm' ? 'size-3.5' : 'size-4'} />
 ) : null}
 </span>
 )}
 <span>{tab.label}</span>
 {tab.badge !== undefined && tab.badge !== null && (
 <span
 className={cn(
 'rounded-full px-2 py-0.5 text-[10px] font-black transition-colors',
 isPill
 ? isActive
 ? 'bg-white/20'
 : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
 : isActive
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
 : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
 )}
 >
 {tab.badge}
 </span>
 )}
 </HeroTab>
 )
 })}
 </HeroTabList>
 </HeroTabs>
 )
}

export const Tab = HeroTab
export const TabList = HeroTabList
export const TabPanel = HeroTabPanel

Tabs.propTypes = {
 tabs: PropTypes.arrayOf(
 PropTypes.shape({
 id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 label: PropTypes.node.isRequired,
 icon: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
 badge: PropTypes.node,
 disabled: PropTypes.bool,
 })
 ),
 activeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 onChange: PropTypes.func,
 onTabChange: PropTypes.func,
 onValueChange: PropTypes.func,
 variant: PropTypes.oneOf(['pill', 'underline']),
 size: PropTypes.oneOf(['sm', 'md']),
 className: PropTypes.string,
 containerClassName: PropTypes.string,
 tabClassName: PropTypes.string,
 activeTabClassName: PropTypes.string,
 inactiveTabClassName: PropTypes.string,
 ariaLabel: PropTypes.string,
 children: PropTypes.node,
}

export default Tabs


