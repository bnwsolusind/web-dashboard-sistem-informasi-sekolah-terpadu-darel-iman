import React from 'react'
import PropTypes from 'prop-types'
import { Skeleton as HeroSkeleton } from '@heroui/react'
import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }) {
 return (
 <HeroSkeleton
 className={cn('rounded-xl bg-emerald-50 dark:bg-emerald-950/40', className)}
 {...props}
 />
 )
}

Skeleton.propTypes = {
 className: PropTypes.string,
}

export function SkeletonCard() {
 return (
 <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 space-y-3 dark:bg-slate-900 dark:border-emerald-800/60">
 <Skeleton className="h-5 w-1/3" />
 <Skeleton className="h-10 w-full" />
 <Skeleton className="h-4 w-2/3" />
 </div>
 )
}
