import React from 'react'
import KpiCard from '../app/KpiCard'

export default function KpiCardAdapter({
 title,
 value,
 icon,
 trend,
 trendType = 'neutral',
 trendText,
 onClick,
 subtitle,
 loading = false,
 colorScheme = 'emerald',
}) {
 return (
 <KpiCard
 title={title}
 value={value}
 icon={icon}
 trend={trend}
 trendType={trendType}
 trendText={trendText}
 onClick={onClick}
 subtitle={subtitle}
 loading={loading}
 colorScheme={colorScheme}
 />
 )
}
