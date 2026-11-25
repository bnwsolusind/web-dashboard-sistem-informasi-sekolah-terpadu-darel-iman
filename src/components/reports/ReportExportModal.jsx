import React, { useState, useEffect } from 'react'
import { FileSpreadsheet, FileText, Download } from 'lucide-react'
import AppModal from '../app/AppModal'

export function ReportExportModal({ isOpen, onClose, onConfirmExport, defaultFormat = 'excel' }) {
 const [includeSummary, setIncludeSummary] = useState(true)
 const [includeCharts, setIncludeCharts] = useState(true)
 const [includeRecap, setIncludeRecap] = useState(true)
 const [includeDetails, setIncludeDetails] = useState(true)

 const [format, setFormat] = useState(defaultFormat)
 const [orientation, setOrientation] = useState('landscape')

 useEffect(() => {
 if (isOpen) {
 setFormat(defaultFormat || 'excel')
 }
 }, [isOpen, defaultFormat])

 if (!isOpen) return null

 const handleDownload = () => {
 if (onConfirmExport) {
 onConfirmExport({
 format,
 orientation,
 options: {
 summary: includeSummary,
 charts: includeCharts,
 recap: includeRecap,
 details: includeDetails,
 },
 })
 }
 onClose()
 }

 return (
 <AppModal
 isOpen={isOpen}
 onClose={onClose}
 title="Opsi Export Laporan"
 description="Pilih format dan opsi unduhan dokumen laporan"
 icon={Download}
 maxWidth="max-w-md"
 variant="emerald"
 zIndex={70}
 bodyClassName="space-y-5"
 footer={
 <>
 <button
 type="button"
 onClick={onClose}
 className="h-9.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black transition-all cursor-pointer active:scale-95"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={handleDownload}
 className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2 cursor-pointer border-2 border-emerald-600 active:scale-95"
 >
 <Download className="h-4 w-4" />
 <span>Unduh Sekarang</span>
 </button>
 </>
 }
 >
 {/* Content options */}
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Isi Laporan Ditampilkan</label>
 <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
 <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-slate-50 p-2 dark:bg-slate-900/40">
 <input type="checkbox" checked={includeSummary} onChange={(e) => setIncludeSummary(e.target.checked)} className="rounded text-[#059669] focus:ring-0" />
 <span>Ringkasan KPI</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-slate-50 p-2 dark:bg-slate-900/40">
 <input type="checkbox" checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} className="rounded text-[#059669] focus:ring-0" />
 <span>Grafik Visualisasi</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-slate-50 p-2 dark:bg-slate-900/40">
 <input type="checkbox" checked={includeRecap} onChange={(e) => setIncludeRecap(e.target.checked)} className="rounded text-[#059669] focus:ring-0" />
 <span>Rekap Per Unit</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-slate-50 p-2 dark:bg-slate-900/40">
 <input type="checkbox" checked={includeDetails} onChange={(e) => setIncludeDetails(e.target.checked)} className="rounded text-[#059669] focus:ring-0" />
 <span>Tabel Data Rinci</span>
 </label>
 </div>
 </div>

 {/* Format Selection */}
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Format File</label>
 <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
 <button
 type="button"
 onClick={() => setFormat('excel')}
 className={`flex items-center justify-center gap-2 rounded-xl p-3 border transition ${format === 'excel' ? 'border-slate-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold' : 'border-emerald-200/80 dark:border-emerald-800/60'}`}
 >
 <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
 Excel (.xlsx)
 </button>
 <button
 type="button"
 onClick={() => setFormat('pdf')}
 className={`flex items-center justify-center gap-2 rounded-xl p-3 border transition ${format === 'pdf' ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold' : 'border-emerald-200/80 dark:border-emerald-800/60'}`}
 >
 <FileText className="h-4 w-4 text-rose-600" />
 PDF (.pdf)
 </button>
 </div>
 </div>

 {/* Orientation for PDF */}
 {format === 'pdf' && (
 <div className="space-y-2">
 <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Orientasi Halaman PDF</label>
 <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
 <button
 type="button"
 onClick={() => setOrientation('portrait')}
 className={`rounded-xl p-2.5 border text-center transition ${orientation === 'portrait' ? 'border-slate-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold' : 'border-emerald-200/80 dark:border-emerald-800/60'}`}
 >
 Portrait (Tegak)
 </button>
 <button
 type="button"
 onClick={() => setOrientation('landscape')}
 className={`rounded-xl p-2.5 border text-center transition ${orientation === 'landscape' ? 'border-slate-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold' : 'border-emerald-200/80 dark:border-emerald-800/60'}`}
 >
 Landscape (Mendatar)
 </button>
 </div>
 </div>
 )}
 </AppModal>
 )
}

