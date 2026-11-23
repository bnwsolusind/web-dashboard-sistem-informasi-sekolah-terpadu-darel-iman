import * as React from 'react'
import PropTypes from 'prop-types'
import { Avatar as HeroAvatar, AvatarGroup as HeroAvatarGroup } from '@heroui/react'
import { cn } from '../../lib/utils'

const sizeMap = {
 xs: 'size-6 text-[10px]',
 sm: 'size-8 text-xs',
 md: 'size-10 text-sm',
 lg: 'size-12 text-base',
 xl: 'size-14 text-lg',
 xxl: 'size-16 text-xl',
}

export function Avatar({ className, size = 'md', src, name, children, ...props }) {
 return (
 <div
 className={cn(
 'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-emerald-50 font-bold select-none text-emerald-700 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/80',
 sizeMap[size] || sizeMap.md,
 className
 )}
 {...props}
 >
 {src ? (
 <img src={src} alt={name || 'Avatar'} className="h-full w-full object-cover rounded-full" />
 ) : (
 children || (name ? name.slice(0, 2).toUpperCase() : 'U')
 )}
 </div>
 )
}

export function AvatarFallback({ className, children, ...props }) {
 return (
 <span className={cn('flex items-center justify-center font-bold uppercase', className)} {...props}>
 {children}
 </span>
 )
}

export function AvatarImage({ className, src, alt = 'Avatar', ...props }) {
 if (!src) return null
 return <img src={src} alt={alt} className={cn('h-full w-full object-cover rounded-full', className)} {...props} />
}

export function AvatarBadge({ className, status = 'online', ...props }) {
 const statusColor = status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
 return (
 <span
 className={cn(
 'absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-white dark:ring-slate-900',
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
