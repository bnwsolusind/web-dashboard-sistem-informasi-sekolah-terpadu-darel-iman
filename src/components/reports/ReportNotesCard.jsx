import React from 'react'
import { FileText, Calendar, UserCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function ReportNotesCard({
 periodLabel = 'Periode Aktif',
 generatedAt,
 creator = 'Pengurus Yayasan',
 filtersSummary = 'Semua Unit Pendidikan',
}) {
 const formattedDate = generatedAt ? new Date(generatedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) + ' WIB' : 'Hari ini'

 return (
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 {/* Header */}
 <div className="flex items-center gap-2.5 border-b border-emerald-200/80 px-5 py-4 dark:border-emerald-800/60 sm:px-6">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 <FileText className="h-4 w-4 text-[#059669] dark:text-emerald-400" />
 </div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Catatan & Identitas Laporan
 </h3>
 </div>

 {/* Grid with 3 columns */}
 <div className="px-5 py-5 sm:px-6 sm:py-6">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
 <div className="flex items-start gap-3.5 rounded-xl bg-emerald-50/40 p-4 border-2 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0 mt-0.5 shadow-2xs">
 <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 </div>
 <div className="min-w-0 flex-1 space-y-1">
 <span className="font-extrabold text-slate-400 block text-[10px] uppercase tracking-wider">PERIODE & TANGGAL</span>
 <span className="font-semibold text-slate-700 dark:text-slate-200 leading-relaxed block">{periodLabel} ({formattedDate})</span>
 </div>
 </div>

 <div className="flex items-start gap-3.5 rounded-xl bg-emerald-50/40 p-4 border-2 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0 mt-0.5 shadow-2xs">
 <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 </div>
 <div className="min-w-0 flex-1 space-y-1">
 <span className="font-extrabold text-slate-400 block text-[10px] uppercase tracking-wider">PEMBUAT LAPORAN</span>
 <span className="font-semibold text-slate-700 dark:text-slate-200 leading-relaxed block">{creator}</span>
 </div>
 </div>

 <div className="flex items-start gap-3.5 rounded-xl bg-emerald-50/40 p-4 border-2 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0 mt-0.5 shadow-2xs">
 <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 </div>
 <div className="min-w-0 flex-1 space-y-1">
 <span className="font-extrabold text-slate-400 block text-[10px] uppercase tracking-wider">FILTER AKTIF</span>
 <span className="font-semibold text-slate-700 dark:text-slate-200 leading-relaxed block">{filtersSummary}</span>
 </div>
 </div>
 </div>
 </div>
 </Card>
 )
}
