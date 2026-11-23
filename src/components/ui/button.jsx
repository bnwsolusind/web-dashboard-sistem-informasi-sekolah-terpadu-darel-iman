import * as React from 'react'
import PropTypes from 'prop-types'
import { Button as HeroButton } from '@heroui/react'
import { cn } from '../../lib/utils'

const mapVariant = (variant) => {
	switch (variant) {
		case 'create':
		case 'add':
		case 'primary':
			return { variant: 'solid', extraClass: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-2' }
		case 'secondary':
			return { variant: 'flat', extraClass: 'bg-emerald-50 border-2 border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-2' }
		case 'accent':
			return { variant: 'solid', extraClass: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-2' }
		case 'destructive':
		case 'danger':
		case 'error':
		case 'delete':
			return { variant: 'flat', extraClass: 'border-2 border-rose-300 dark:border-rose-700 bg-rose-50 text-rose-700 hover:bg-rose-100/90 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold rounded-xl shadow-2xs inline-flex items-center justify-center gap-2' }
		case 'view':
			return { variant: 'flat', extraClass: 'border-2 border-sky-200 dark:border-sky-800 bg-sky-50 text-sky-700 hover:bg-sky-100/90 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/60 font-semibold rounded-xl shadow-2xs inline-flex items-center justify-center gap-2' }
		case 'edit':
			return { variant: 'flat', extraClass: 'border-2 border-amber-300 dark:border-amber-700 bg-amber-50 text-amber-800 hover:bg-amber-100/90 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60 font-semibold rounded-xl shadow-2xs inline-flex items-center justify-center gap-2' }
		case 'restore':
			return { variant: 'flat', extraClass: 'border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/90 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 font-semibold rounded-xl shadow-2xs inline-flex items-center justify-center gap-2' }
		case 'print':
			return { variant: 'flat', extraClass: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs inline-flex items-center justify-center gap-2' }
		case 'import':
			return { variant: 'flat', extraClass: 'bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-semibold rounded-xl shadow-xs inline-flex items-center justify-center gap-2' }
		case 'export':
			return { variant: 'flat', extraClass: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-xl shadow-xs inline-flex items-center justify-center gap-2' }
		case 'warning':
			return { variant: 'flat', extraClass: 'border-2 border-amber-300 dark:border-amber-700 bg-amber-50 text-amber-800 hover:bg-amber-100/90 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60 font-semibold rounded-xl shadow-2xs inline-flex items-center justify-center gap-2' }
		case 'success':
			return { variant: 'solid', extraClass: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-2' }
		case 'info':
			return { variant: 'flat', extraClass: 'border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/90 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold rounded-xl shadow-2xs inline-flex items-center justify-center gap-2' }
		case 'ghost':
		case 'link':
			return { variant: 'ghost', extraClass: 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl' }
		case 'outline':
		case 'default':
		default:
			return { variant: 'outline', extraClass: 'border border-slate-300/80 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold shadow-xs inline-flex items-center justify-center gap-2 rounded-xl' }
	}
}

const mapSize = (size) => {
	switch (size) {
		case 'xs':
			return { size: 'sm', iconOnly: false, extraClass: 'text-xs font-medium h-7 px-2.5 rounded-xl' }
		case 'sm':
			return { size: 'sm', iconOnly: false, extraClass: 'text-xs font-medium h-8 px-3 rounded-xl' }
		case 'lg':
			return { size: 'lg', iconOnly: false, extraClass: 'text-base font-medium h-10 px-5 rounded-xl' }
		case 'icon':
			return { size: 'sm', iconOnly: true, extraClass: 'h-9 w-9 p-0 rounded-xl inline-flex items-center justify-center shrink-0' }
		case 'default':
		case 'md':
		default:
			return { size: 'md', iconOnly: false, extraClass: 'text-sm font-medium h-9 px-4 rounded-xl' }
	}
}

export const Button = React.forwardRef(
	({ className, variant = 'primary', size = 'default', disabled, isDisabled, loading, isLoading, iconOnly, isIconOnly, onPress, onClick, children, ...props }, ref) => {
		const v = mapVariant(variant)
		const s = mapSize(size)
		const isIcon = Boolean(iconOnly || isIconOnly || s.iconOnly)
		const isButtonDisabled = Boolean(disabled || isDisabled || loading || isLoading)
		const isButtonLoading = Boolean(loading || isLoading)
		return (
			<HeroButton
				ref={ref}
				variant={v.variant}
				size={s.size}
				isIconOnly={isIcon}
				isDisabled={isButtonDisabled}
				onPress={onPress || onClick}
				onClick={onClick}
				className={cn(
					'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
					v.extraClass,
					s.extraClass,
					className
				)}
				{...props}
			>
				{isButtonLoading && (
					<svg className="animate-spin -ml-1 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				)}
				{children}
			</HeroButton>
		)
	}
)

Button.displayName = 'Button'

Button.propTypes = {
	className: PropTypes.string,
	variant: PropTypes.oneOf([
		'primary',
		'secondary',
		'accent',
		'view',
		'edit',
		'restore',
		'print',
		'import',
		'export',
		'warning',
		'success',
		'destructive',
		'danger',
		'error',
		'delete',
		'info',
		'outline',
		'ghost',
		'icon',
		'link',
		'default',
	]),
	size: PropTypes.oneOf(['default', 'xs', 'sm', 'lg', 'icon', 'md']),
	disabled: PropTypes.bool,
	children: PropTypes.node,
}

export default Button
