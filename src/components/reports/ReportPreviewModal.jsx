import React from 'react'
import { Printer, Download, ShieldCheck, Building2 } from 'lucide-react'
import AppModal from '../app/AppModal'

export function ReportPreviewModal({ isOpen, onClose, reportData, onPrint, onExportPdf }) {
 if (!isOpen || !reportData) return null

 const { report, summary, unit_recaps, details } = reportData
 const title = report?.title || 'Laporan Pengurus Yayasan'
 const periodLabel = report?.period?.label || report?.period_name || report?.period || '-'
 const generatedAt = report?.generated_at ? new Date(report.generated_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')

 return (
 <AppModal
 isOpen={Boolean(isOpen && reportData)}
 onClose={onClose}
 title="Dokumen Preview Laporan"
 description="Pratinjau sebelum cetak atau ekspor PDF"
 icon={ShieldCheck}
 maxWidth="max-w-4xl"
 variant="emerald"
 zIndex={70}
 className="print:max-w-full print:max-h-none print:h-auto print:border-none print:shadow-none print:bg-white print:static print:p-0"
 bodyClassName="space-y-6 print:max-h-none print:overflow-visible print:p-0 print:text-slate-900 text-slate-800 dark:text-slate-100 font-sans"
 headerActions={
 <div className="flex items-center gap-2 print:hidden">
 <button
 type="button"
 onClick={onPrint}
 className="h-9 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/25 text-xs font-black transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
 >
 <Printer className="h-3.5 w-3.5" />
 <span>Cetak</span>
 </button>
 <button
 type="button"
 onClick={onExportPdf}
 className="h-9 px-3.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-black shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
 >
 <Download className="h-3.5 w-3.5" />
 <span>Download PDF</span>
 </button>
 </div>
 }
 footer={
 <button
 type="button"
 onClick={onClose}
 className="print:hidden h-9.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black transition-all cursor-pointer active:scale-95"
 >
 Tutup
 </button>
 }
 >
 {reportData && (
 <>
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
 </>
 )}
 </AppModal>
 )
}

