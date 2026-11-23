import React from 'react'
import { AppSkeleton } from '../app'

export default function SkeletonDashboard() {
 return (
 <div className="space-y-6">
 {/* Header skeleton */}
 <AppSkeleton variant="line" rows={4} className="h-40 rounded-xl bg-emerald-50 p-6 dark:bg-emerald-950/40" />

 {/* Filter skeleton */}
 <AppSkeleton variant="line" rows={2} className="h-14 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/40" />

 {/* KPI grid skeleton */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <AppSkeleton variant="card" />
 <AppSkeleton variant="card" />
 <AppSkeleton variant="card" />
 <AppSkeleton variant="card" />
 </div>

 {/* Chart grid skeleton */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <AppSkeleton variant="table" rows={4} cols={3} />
 <AppSkeleton variant="table" rows={4} cols={3} />
 </div>

 {/* Table skeleton */}
 <AppSkeleton variant="table" rows={5} cols={5} />
 </div>
 )
}
