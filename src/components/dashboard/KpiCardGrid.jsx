import React from 'react'

export default function KpiCardGrid({ children, cols = 4 }) {
 const gridColsClass = {
 2: 'grid-cols-2',
 3: 'grid-cols-2 sm:grid-cols-3',
 4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
 5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
 6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
 }[cols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

 return <div className={`grid min-w-0 gap-3 md:gap-4 ${gridColsClass}`}>{children}</div>
}
