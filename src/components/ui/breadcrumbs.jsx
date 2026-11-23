import React from 'react'
import PropTypes from 'prop-types'
import {
 Breadcrumbs as HeroBreadcrumbs,
 BreadcrumbsItem as HeroBreadcrumbsItem,
} from '@heroui/react'
import { Home, ChevronRight, Slash, Minus } from 'lucide-react'
import { usePengaturanStore, useLabel } from '../../stores/pengaturanStore'
import { cn } from '../../lib/utils'

/**
 * Canonical Breadcrumb Navigation Component for Dareliman Edu based on HeroUI Breadcrumbs.
 * Integrates global system settings (divider, show home icon, emerald styling).
 */
export function Breadcrumbs({
 items = [],
 dividerType,
 homeTo = '/dashboard',
 className = '',
 pageTitle,
}) {
 const storeDivider = usePengaturanStore((s) => s.pengaturan?.breadcrumb_divider) || 'chevron'
 const storeShowHome = usePengaturanStore((s) => s.pengaturan?.breadcrumb_show_home) ?? true
 const homeLabel = useLabel('navigation.dashboard', 'Beranda')

 const activeDivider = dividerType || storeDivider
 const effectiveHomeTo =
 homeTo === null || homeTo === false || !storeShowHome
 ? null
 : typeof homeTo === 'string'
 ? homeTo
 : '/dashboard'

 let rawItems = []
 if (items && Array.isArray(items) && items.length > 0) {
 rawItems = items.map((item) => {
 if (typeof item === 'string') {
 return { label: item }
 }
 return item || {}
 })
 }

 if (pageTitle && rawItems.length === 0) {
 rawItems.push({ label: pageTitle })
 }

 // Prepend Home if enabled
 const finalItems = []
 if (effectiveHomeTo) {
 finalItems.push({
 label: homeLabel,
 href: effectiveHomeTo,
 to: effectiveHomeTo,
 icon: <Home className="size-3.5 shrink-0" />,
 isHome: true,
 })
 }

 rawItems.forEach((it) => {
 finalItems.push(it)
 })

 if (finalItems.length === 0) {
 return null
 }

 return (
 <nav aria-label="Breadcrumb" className={cn('mb-4 flex items-center print:hidden', className)}>
 <HeroBreadcrumbs
 className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400"
 >
 {finalItems.map((item, index) => {
 const isLast = index === finalItems.length - 1
 const href = item.href || item.to || item.path || item.url
 const label = item.label || item.name || item.title

 return (
 <HeroBreadcrumbsItem
 key={index}
 href={!isLast && href ? href : undefined}
 className={cn(
 'inline-flex items-center gap-1.5 transition-colors',
 isLast
 ? 'font-bold text-slate-800 dark:text-slate-100 pointer-events-none'
 : 'font-medium text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 cursor-pointer'
 )}
 >
 {item.icon && <span className="shrink-0">{item.icon}</span>}
 <span className="truncate max-w-[200px] sm:max-w-xs">{label}</span>
 </HeroBreadcrumbsItem>
 )
 })}
 </HeroBreadcrumbs>
 </nav>
 )
}

Breadcrumbs.propTypes = {
 items: PropTypes.array,
 dividerType: PropTypes.oneOf(['chevron', 'slash', 'dot']),
 homeTo: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
 className: PropTypes.string,
 pageTitle: PropTypes.string,
}

export default Breadcrumbs
