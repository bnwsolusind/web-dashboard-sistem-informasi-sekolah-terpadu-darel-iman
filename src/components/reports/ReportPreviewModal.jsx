import React from 'react'
import { Printer, Download, ShieldCheck, Building2 } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogClose } from '@/components/ui/dialog'
import { Backdrop, OverlayWrapper } from '@/components/ui/overlay'
import { Button } from '../ui/button'

export function ReportPreviewModal({ isOpen, onClose, reportData, onPrint, onExportPdf }) {
 if (!isOpen || !reportData) return null

 const { report, summary, unit_recaps, details } = reportData
 const title = report?.title || 'Laporan Pengurus Yayasan'
 const periodLabel = report?.period?.label || report?.period_name || report?.period || '-'
 const generatedAt = report?.generated_at ? new Date(report.generated_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')

 return (
 <OverlayWrapper isOpen={isOpen} onOpenChange={(open) => !open && onClose()} className="z-[70]">
 <Backdrop className="print:hidden z-[70] bg-slate-950/70 backdrop-blur-md" isOpen={isOpen} onOpenChange={(open) => !open && onClose()} />
 <Dialog className="z-[70] max-w-4xl max-h-[90vh] p-0 rounded-3xl overflow-hidden bg-white dark:bg-[#1B2433] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 print:max-w-full print:max-h-none print:h-auto print:border-none print:shadow-none print:bg-white print:static print:p-0">
 <div className="p-6">
 <DialogHeader className="print:hidden pb-4 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full pr-6">
 <div className="flex items-center gap-3">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <ShieldCheck className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-black text-slate-900 dark:text-white">Dokumen Preview Laporan</DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pratinjau sebelum cetak atau ekspor PDF</DialogDescription>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <Button variant="ghost" size="sm" onClick={onPrint} prefixIcon={<Printer className="h-3.5 w-3.5" />} className="rounded-xl font-bold">
 Cetak
 </Button>
 <Button variant="success" appearance="fill" size="sm" onClick={onExportPdf} prefixIcon={<Download className="h-3.5 w-3.5" />} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
 Download PDF
 </Button>
 </div>
 </div>
 <DialogClose onClick={onClose} />
 </DialogHeader>

 <DialogBody className="space-y-6 py-4 overflow-y-auto max-h-[72vh] print:max-h-none print:overflow-visible print:p-0 print:text-slate-900 text-slate-800 dark:text-slate-100 font-sans">
 {/* Foundation Letterhead */}
 <div className="border-b-2 border-[#059669] pb-4 text-center">
 {(() => {
 let schoolName = ''
 try {
 const saved = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}') : {}
 schoolName = (saved?.school_name || saved?.institution_name || saved?.application_name || '').trim()
 } catch (_) {}
 return schoolName ? (
 <div className="inline-flex items-center gap-2 text-[#059669] dark:text-emerald-400 font-black text-xl uppercase tracking-wide">
 <Building2 className="h-6 w-6" /> {schoolName}
 </div>
 ) : null
 })()}
 <h2 className="mt-1 font-bold text-lg text-slate-900 dark:text-white uppercase">{title}</h2>
 <p className="text-xs text-slate-500">Periode: {periodLabel} • Dicetak: {generatedAt}</p>
 </div>

 {/* KPI Summary Grid */}
 {summary && (
 <div>
 <h4 className="font-bold text-xs uppercase text-[#059669] dark:text-emerald-400 mb-2 border-l-2 border-[#059669] pl-2">
 Ringkasan KPI Utama
 </h4>
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
 {Object.entries(summary).map(([key, val], idx) => (
 <div key={idx} className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-700/80 dark:bg-slate-800">
 <span className="text-[10px] font-semibold text-slate-400 uppercase block">{key.replace(/_/g, ' ')}</span>
 <span className="text-sm font-black text-slate-800 dark:text-white">
 {typeof val === 'number' ? val.toLocaleString('id-ID') : (val || '-')}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Unit Recap Table */}
 {unit_recaps && unit_recaps.length > 0 && (
 <div>
 <h4 className="font-bold text-xs uppercase text-[#059669] dark:text-emerald-400 mb-2 border-l-2 border-[#059669] pl-2">
 Rekapitulasi Per Unit Pendidikan
 </h4>
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80/80">
 <table className="w-full text-left text-xs border-collapse">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 {Object.keys(unit_recaps[0]).map((col, idx) => (
 <th key={idx} className="p-2.5 border border-[#059669] font-semibold">{col.replace(/_/g, ' ')}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-200/80 dark:divide-emerald-800/60/80">
 {unit_recaps.map((row, rIdx) => (
 <tr key={rIdx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 {Object.values(row).map((val, cIdx) => (
 <td key={cIdx} className="p-2.5">{val}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Details Table Snippet */}
 {details && details.length > 0 && (
 <div>
 <h4 className="font-bold text-xs uppercase text-[#059669] dark:text-emerald-400 mb-2 border-l-2 border-[#059669] pl-2">
 Pratinjau Data Rinci
 </h4>
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80/80">
 <table className="w-full text-left text-xs border-collapse">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 {Object.keys(details[0]).filter(k => k !== 'id').map((col, idx) => (
 <th key={idx} className="p-2.5 font-bold">{col.replace(/_/g, ' ')}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-200/80 dark:divide-emerald-800/60/80">
 {details.slice(0, 10).map((row, rIdx) => (
 <tr key={rIdx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 {Object.entries(row).filter(([k]) => k !== 'id').map(([, val], cIdx) => (
 <td key={cIdx} className="p-2.5">{val}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Footer Notes */}
 <div className="border-t border-emerald-200/80 pt-4 text-[10px] text-slate-400 flex justify-between">
 <span>Dareliman Edu • Dokumentasi Pengurus Yayasan</span>
 <span>Halaman 1 / 1</span>
 </div>
 </DialogBody>
 </div>
 </Dialog>
 </OverlayWrapper>
 )
}

