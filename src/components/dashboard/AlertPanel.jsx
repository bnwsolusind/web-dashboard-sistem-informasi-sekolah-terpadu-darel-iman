import React from 'react'
import { AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AlertPanel({
 title = 'Perhatian & Peringatan',
 alerts = [],
 loading = false,
 emptyMessage = 'Tidak ada isu atau tugas mendesak yang memerlukan perhatian.'
}) {
 if (loading) {
 return (
 <div className="rounded-xl border border-emerald-200/80 bg-white p-5 dark:border-emerald-800/60 dark:bg-slate-900 animate-pulse h-32" />
 )
 }

 const getAlertIcon = (type) => {
 switch (type) {
 case 'warning':
 return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
 case 'danger':
 case 'error':
 return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
 case 'success':
 return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
 default:
 return <Info className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
 }
 }

 const getAlertBg = (type) => {
 switch (type) {
 case 'warning':
 return 'bg-amber-50/70 border-emerald-200/80 dark:border-emerald-800/60 text-amber-900 dark:bg-amber-950/30 dark:border-emerald-800/60 dark:text-amber-200'
 case 'danger':
 case 'error':
 return 'bg-rose-50/70 border-emerald-200/80 dark:border-emerald-800/60 text-rose-900 dark:bg-rose-950/30 dark:border-emerald-800/60 dark:text-rose-200'
 case 'success':
 return 'bg-emerald-50/70 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-200'
 default:
 return 'bg-sky-50/70 border-emerald-200/80 dark:border-emerald-800/60 text-sky-900 dark:bg-sky-950/30 dark:border-emerald-800/60 dark:text-sky-200'
 }
 }

 return (
 <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
 <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">{title}</h3>

 {alerts.length === 0 ? (
 <p className="text-xs text-slate-500 dark:text-slate-400 py-2">{emptyMessage}</p>
 ) : (
 <div className="space-y-2.5">
 {alerts.map((item, idx) => (
 <div
 key={item.id || idx}
 className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs font-medium ${getAlertBg(item.type)}`}
 >
 {getAlertIcon(item.type)}
 <div className="flex-1">
 <div className="font-bold">{item.title || item.nama_indikator || item.message}</div>
 {item.description && <p className="mt-0.5 opacity-90">{item.description}</p>}
 </div>
 {item.action && <div className="shrink-0">{item.action}</div>}
 </div>
 ))}
 </div>
 )}
 </div>
 )
}
