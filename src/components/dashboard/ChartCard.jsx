import React from 'react'
import { AppEmptyState, AppErrorState, AppSkeleton, SectionCard } from '../app'

export default function ChartCard({
 title,
 subtitle,
 children,
 action,
 loading = false,
 empty = false,
 emptyMessage = 'Belum ada data grafik untuk periode ini.',
 error = null,
 onRetry,
 className = ''
}) {
 return (
 <SectionCard
 title={title}
 description={subtitle}
 actions={action}
 className={className}
 contentClassName="dashboard-chart-content flex min-h-[220px] items-center justify-center"
 >
 {loading ? (
 <AppSkeleton variant="line" rows={6} className="w-full" />
 ) : error ? (
 <AppErrorState description={error} onRetry={onRetry} />
 ) : empty ? (
 <AppEmptyState title="Data Kosong" description={emptyMessage} />
 ) : (
 <div className="w-full">{children}</div>
 )}
 </SectionCard>
 )
}
