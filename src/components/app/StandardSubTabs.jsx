import * as React from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

/**
 * StandardSubTabs - Canonical Sub-Navigation / Tab component.
 * Rule 6: Opacity unselected, changes to green when clicked/active, soft green container border.
 */
export function StandardSubTabs({
	tabs = [],
	activeTab,
	onChange,
	className,
	...props
}) {
	return (
		<div
			role="tablist"
			aria-label="Navigasi Sub-Tab"
			className={cn(
				'bg-emerald-50/40 dark:bg-emerald-950/20 p-1.5 rounded-2xl inline-flex items-center gap-1.5 border-2 border-emerald-300 dark:border-emerald-700/80 overflow-x-auto no-scrollbar max-w-full shrink-0',
				className
			)}
			{...props}
		>
			{tabs.map((tab) => {
				const tabId = tab.id !== undefined ? tab.id : (tab.key !== undefined ? tab.key : tab.value)
				const isActive = String(activeTab) === String(tabId)
				const Icon = tab.icon

				return (
					<button
						key={tabId}
						role="tab"
						type="button"
						aria-selected={isActive}
						disabled={tab.disabled}
						onClick={() => {
							if (!tab.disabled && onChange) onChange(tabId)
						}}
						className={cn(
							'inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40 disabled:pointer-events-none shrink-0 whitespace-nowrap',
							isActive
								? 'bg-emerald-600 text-white shadow-sm font-bold opacity-100'
								: 'text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
						)}
					>
						{Icon && (
							<Icon
								className={cn(
									'w-4 h-4 shrink-0 transition-colors',
									isActive
										? 'text-white'
										: 'text-emerald-700/80 dark:text-emerald-400/80'
								)}
							/>
						)}
						<span>{tab.label || tab.title || tab.name}</span>

						{/* Optional Count / Badge */}
						{tab.count !== undefined && tab.count !== null && (
							<span
								className={cn(
									'ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full',
									isActive
										? 'bg-white/25 text-white'
										: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
								)}
							>
								{tab.count}
							</span>
						)}
					</button>
				)
			})}
		</div>
	)
}

StandardSubTabs.propTypes = {
	tabs: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			label: PropTypes.node,
			title: PropTypes.node,
			name: PropTypes.node,
			icon: PropTypes.elementType,
			count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			disabled: PropTypes.bool,
		})
	).isRequired,
	activeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	onChange: PropTypes.func.isRequired,
	className: PropTypes.string,
}

export default StandardSubTabs
