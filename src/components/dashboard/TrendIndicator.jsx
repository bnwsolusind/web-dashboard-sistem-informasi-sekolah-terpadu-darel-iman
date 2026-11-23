import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function TrendIndicator({ value, type = 'neutral', text = '' }) {
 if (value === undefined || value === null) return null

 let badgeStyle = 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
 let Icon = Minus

 if (type === 'up') {
 badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60'
 Icon = TrendingUp
 } else if (type === 'down') {
 badgeStyle = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60'
 Icon = TrendingDown
 }

 return (
 <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeStyle}`}>
 <Icon className="w-3 h-3" />
 <span>{value}%</span>
 {text && <span className="text-[10px] font-normal opacity-80">{text}</span>}
 </div>
 )
}
