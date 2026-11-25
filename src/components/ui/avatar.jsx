import * as React from 'react'
import PropTypes from 'prop-types'
import { Avatar as HeroAvatar, AvatarGroup as HeroAvatarGroup } from '@heroui/react'
import { User } from 'lucide-react'
import { cn } from '../../lib/utils'

const sizeMap = {
	xs: 'size-6 text-[10px]',
	sm: 'size-8 text-xs',
	md: 'size-10 text-sm',
	lg: 'size-12 text-base',
	xl: 'size-14 text-lg',
	xxl: 'size-16 text-xl',
}

const badgeSizeMap = {
	xs: 'size-2 -bottom-0.5 -right-0.5',
	sm: 'size-2.5 bottom-0 right-0',
	md: 'size-3 bottom-0 right-0',
	lg: 'size-3.5 bottom-0.5 right-0.5',
	xl: 'size-4 bottom-0.5 right-0.5',
	xxl: 'size-4.5 bottom-1 right-1',
}

export function Avatar({ className, size = 'md', src, name, children, ...props }) {
	return (
		<div
			className={cn(
				'relative inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-50 font-bold select-none text-emerald-700 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/80',
				sizeMap[size] || sizeMap.md,
				className
			)}
			{...props}
		>
			{src ? (
				<img src={src} alt={name || 'Avatar'} className="h-full w-full object-cover rounded-full overflow-hidden" />
			) : (
				children || (name ? name.slice(0, 2).toUpperCase() : <User className="size-1/2 opacity-80" />)
			)}
		</div>
	)
}

export function AvatarFallback({ className, children, ...props }) {
	return (
		<span className={cn('flex h-full w-full items-center justify-center font-bold uppercase rounded-full overflow-hidden', className)} {...props}>
			{children}
		</span>
	)
}

export function AvatarImage({ className, src, alt = 'Avatar', ...props }) {
	if (!src) return null
	return <img src={src} alt={alt} className={cn('h-full w-full object-cover rounded-full overflow-hidden', className)} {...props} />
}

export function AvatarBadge({ className, status = 'online', size = 'md', ...props }) {
	const isOnline = status === 'online' || status === 'login' || status === true
	const isBusy = status === 'busy'
	const statusColor = isOnline
		? 'bg-emerald-500 animate-pulse'
		: isBusy
		? 'bg-amber-500'
		: 'bg-rose-500'
	const sizeClass = badgeSizeMap[size] || 'size-3 bottom-0 right-0'

	return (
		<span
			className={cn(
				'absolute z-20 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs pointer-events-none',
				sizeClass,
				statusColor,
				className
			)}
			{...props}
		/>
	)
}

export function AvatarGroup({ className, children, ...props }) {
	return (
		<div className={cn('flex -space-x-2 overflow-hidden items-center', className)} {...props}>
			{children}
		</div>
	)
}

export function AvatarGroupCount({ count, className, ...props }) {
	return (
		<span
			className={cn(
				'relative flex size-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-800 ring-2 ring-white dark:bg-emerald-950/40 dark:text-slate-200 dark:ring-slate-900',
				className
			)}
			{...props}
		>
			+{count}
		</span>
	)
}

Avatar.propTypes = {
	className: PropTypes.string,
	size: PropTypes.string,
	src: PropTypes.string,
	name: PropTypes.string,
	children: PropTypes.node,
}

export default Avatar
