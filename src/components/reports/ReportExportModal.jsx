import React, { useState, useEffect } from 'react'
import { FileSpreadsheet, FileText, Download } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Backdrop, OverlayWrapper } from '@/components/ui/overlay'
import { Button } from '@/components/ui/button'

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
 <OverlayWrapper isOpen={isOpen} onOpenChange={(open) => !open && onClose()} className="z-[70]">
 <Backdrop className="z-[70] bg-slate-950/70 backdrop-blur-md" isOpen={isOpen} onOpenChange={(open) => !open && onClose()} />
 <Dialog className="z-[70] max-w-md w-full p-0 rounded-3xl overflow-hidden bg-white dark:bg-[#1B2433] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20">
 <div className="p-6">
 <DialogHeader className="pb-4 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <Download className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-black text-slate-900 dark:text-white">Opsi Export Laporan</DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih format dan opsi unduhan dokumen laporan</DialogDescription>
 </div>
 </div>
 <DialogClose onClick={onClose} />
 </DialogHeader>

 <DialogBody className="space-y-5 py-4">
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
 </DialogBody>

 <DialogFooter className="gap-2 border-t border-emerald-100/80 dark:border-emerald-800/60 pt-4">
 <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">
 Batal
 </Button>
 <Button variant="success" appearance="fill" onClick={handleDownload} prefixIcon={<Download className="h-4 w-4" />} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
 Unduh Sekarang
 </Button>
 </DialogFooter>
 </div>
 </Dialog>
 </OverlayWrapper>
 )
}

