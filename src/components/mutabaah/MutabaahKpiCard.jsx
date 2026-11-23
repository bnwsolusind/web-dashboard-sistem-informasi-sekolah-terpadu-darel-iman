import React from 'react'
import { KpiCard } from '../../components/app'

export function MutabaahKpiCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald', onClick }) {
 const colorScheme = color === 'red' ? 'rose' : color === 'purple' ? 'violet' : color
 const trendType = trend?.type === 'down' ? 'down' : trend?.type === 'neutral' ? 'neutral' : 'up'

 return (
 <KpiCard
 title={title}
 value={value}
 subtitle={subtitle}
 icon={Icon}
 trend={trend?.value}
 trendType={trendType}
 onClick={onClick}
 colorScheme={colorScheme}
 />
 )
}

export default MutabaahKpiCard
