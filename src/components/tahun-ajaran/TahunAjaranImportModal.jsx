import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Upload,
 FileSpreadsheet,
 Download,
 AlertTriangle,
 X,
 CheckCircle2,
 FileText,
 Loader2,
 Table as TableIcon,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import AppModal from '../app/AppModal'
import { parseSpreadsheetFile, downloadSpreadsheetTemplate } from '../../utils/spreadsheetParser'

export default function TahunAjaranImportModal({
 isOpen,
 onClose,
 onImport,
 isSubmitting = false,
}) {
 const [previewRows, setPreviewRows] = useState([])
 const [fileName, setFileName] = useState('')
 const [rawFile, setRawFile] = useState(null)
 const [overwriteExisting, setOverwriteExisting] = useState(false)
 const [errorMsg, setErrorMsg] = useState('')

 if (!isOpen) return null

 const handleFileUpload = async (e) => {
 const file = e.target.files[0]
 if (!file) return

 setRawFile(file)
 setFileName(file.name)
 setErrorMsg('')

 try {
 const headerMap = {
 'name': 'name',
 'nama tahun ajaran': 'name',
 'tahun ajaran': 'name',
 'nama': 'name',
 'start_date': 'start_date',
 'tanggal mulai': 'start_date',
 'tgl mulai': 'start_date',
 'mulai': 'start_date',
 'end_date': 'end_date',
 'tanggal selesai': 'end_date',
 'tgl selesai': 'end_date',
 'selesai': 'end_date',
 'is_active': 'is_active',
 'status aktif': 'is_active',
 'status': 'is_active',
 'keterangan': 'keterangan',
 'deskripsi': 'keterangan',
 }

 const rows = await parseSpreadsheetFile(file, {
 headerMap,
 transformRow: (row) => ({
 name: row.name || '',
 start_date: row.start_date || '',
 end_date: row.end_date || '',
 is_active: String(row.is_active || 'false'),
 keterangan: row.keterangan || '',
 }),
 })

 const validRows = rows.filter((r) => r.name && r.start_date && r.end_date)
 if (validRows.length === 0) {
 setErrorMsg('Format berkas tidak valid atau tidak memiliki baris data lengkap (name, start_date, end_date).')
 } else {
 setPreviewRows(validRows)
 }
 } catch (err) {
 setErrorMsg(err.message || 'Gagal membaca berkas. Pastikan format spreadsheet (.xlsx, .xls, .csv) valid.')
 }
 }

 const handleDownloadTemplate = (type = 'xlsx') => {
 const sampleData = [
 {
 name: '2025/2026',
 start_date: '2025-07-01',
 end_date: '2026-06-30',
 is_active: 'false',
 keterangan: 'Tahun ajaran lampau',
 },
 {
 name: '2026/2027',
 start_date: '2026-07-01',
 end_date: '2027-06-30',
 is_active: 'true',
 keterangan: 'Tahun ajaran aktif utama',
 },
 {
 name: '2027/2028',
 start_date: '2027-07-01',
 end_date: '2028-06-30',
 is_active: 'false',
 keterangan: 'Tahun ajaran mendatang',
 },
 ]
 downloadSpreadsheetTemplate(sampleData, 'template_import_tahun_ajaran', type)
 }

 const handleSubmitImport = () => {
 if (previewRows.length === 0) return
 onImport({
 file: rawFile,
 rows: previewRows,
 overwrite: overwriteExisting,
 })
 }

 const handleClose = () => {
 if (isSubmitting) return
 setPreviewRows([])
 setFileName('')
 setRawFile(null)
 setOverwriteExisting(false)
 setErrorMsg('')
 onClose()
 }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => !isSubmitting && handleClose()}
      title="Impor Data Tahun Ajaran"
      badge="Batch Import"
      description="Unggah berkas CSV/Excel untuk memproses data tahun ajaran secara massal."
      icon={Upload}
      maxWidth="max-w-2xl"
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      bodyClassName="space-y-5 text-xs"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <button
            type="button"
            disabled={previewRows.length === 0 || isSubmitting}
            onClick={handleSubmitImport}
            className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" strokeWidth={2.2} />}
            <span>{isSubmitting ? 'Memproses Impor...' : `Impor ${previewRows.length} Data`}</span>
          </button>
        </div>
      }
    >
 {/* Template Download Card */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
 <FileSpreadsheet className="size-5" />
 </div>
 <div>
 <h4 className="text-xs font-bold text-slate-900 dark:text-white">
 Unduh Template Standar
 </h4>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
 Gunakan format kolom CSV yang telah disesuaikan dengan sistem database.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => handleDownloadTemplate('xlsx')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer shrink-0"
 >
 <Download className="size-3.5" />
 <span>Excel (.xlsx)</span>
 </button>
 <button
 type="button"
 onClick={() => handleDownloadTemplate('csv')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer shrink-0"
 >
 <Download className="size-3.5" />
 <span>CSV</span>
 </button>
 </div>
 </div>

 {/* Upload Dropzone */}
 <div>
 <label className="mb-2 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Pilih Berkas Spreadsheet (.xlsx, .xls, .csv)
 </label>
 <label
 htmlFor="file-upload-academic"
 className={cn(
 'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200',
 fileName
 ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/30 dark:bg-emerald-950/20'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/15 hover:bg-emerald-50/30 hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-slate-800/40'
 )}
 >
 <input
 id="file-upload-academic"
 type="file"
 accept=".xlsx,.xls,.csv"
 className="hidden"
 onChange={handleFileUpload}
 />
 <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm mb-3">
 <Upload className="size-6" />
 </div>
 <p className="text-xs font-bold text-slate-900 dark:text-white">
 {fileName || 'Klik untuk memilih berkas CSV atau seret ke sini'}
 </p>
 <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
 Maksimal 5MB. Hanya format .csv UTF-8
 </p>
 </label>
 </div>

 {/* Error Notice */}
 {errorMsg && (
 <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-300">
 <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
 <span>{errorMsg}</span>
 </div>
 )}

 {/* Opsi Timpa Data Jika Ada yang Sama */}
 <div className={cn(
 "rounded-xl border p-4 transition-all duration-200",
 overwriteExisting
 ? "border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 dark:border-emerald-800/60 dark:bg-amber-950/25"
 : "border-emerald-200/80 bg-slate-50/50 dark:border-emerald-800/60 dark:bg-slate-900/30"
 )}>
 <label className="flex items-start gap-3 cursor-pointer select-none">
 <input
 type="checkbox"
 checked={overwriteExisting}
 onChange={(e) => setOverwriteExisting(e.target.checked)}
 className="mt-0.5 h-4.5 w-4.5 rounded-lg border-emerald-300 text-amber-600 focus:ring-amber-500 dark:border-emerald-700/80 dark:bg-slate-800 cursor-pointer"
 />
 <div className="flex-1 text-xs">
 <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
 <span>Timpa data jika nama tahun ajaran sudah terdaftar</span>
 {overwriteExisting ? (
 <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
 Mode Timpa Aktif
 </span>
 ) : (
 <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
 Lewati Duplikat
 </span>
 )}
 </span>
 <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
 Jika dicentang, tahun ajaran yang sudah ada akan diperbarui dengan tanggal dan status terbaru dari berkas. Jika tidak dicentang, baris duplikat akan dilewati dengan aman.
 </p>
 </div>
 </label>
 </div>

 {/* Data Preview Table */}
 {previewRows.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
 <TableIcon className="size-3.5" />
 <span>Pratinjau Data ({previewRows.length} baris terdeteksi)</span>
 </div>
 </div>

 <div className="overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
 <div className="max-h-48 overflow-y-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-3 py-2">Nama</th>
 <th className="px-3 py-2">Mulai</th>
 <th className="px-3 py-2">Selesai</th>
 <th className="px-3 py-2">Aktif</th>
 <th className="px-3 py-2">Keterangan</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
 {previewRows.map((row, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
 <td className="px-3 py-2 font-bold text-slate-800 dark:text-white">{row.name}</td>
 <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.start_date}</td>
 <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.end_date}</td>
 <td className="px-3 py-2">
 <span className={cn(
 'inline-block px-1.5 py-0.2 rounded font-bold text-[10px]',
 row.is_active === 'true' || row.is_active === true
 ? 'bg-emerald-100 text-emerald-800'
 : 'bg-slate-100 text-slate-600'
 )}>
 {row.is_active === 'true' || row.is_active === true ? 'Aktif' : 'Tidak'}
 </span>
 </td>
 <td className="px-3 py-2 text-slate-500 truncate max-w-[140px]">{row.keterangan || '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}
    </AppModal>
  )
}
