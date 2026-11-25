import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 X,
 FileInput,
 Download,
 Upload,
 UploadCloud,
 CheckCircle2,
 AlertTriangle,
 Sparkles,
 FileSpreadsheet,
 RefreshCcw,
} from 'lucide-react'
import { parseSpreadsheetFile, downloadSpreadsheetTemplate } from '../../utils/spreadsheetParser'
import AppModal from '../app/AppModal'

export default function JenisUnitImportModal({
 isOpen,
 onClose,
 onImport,
 isSubmitting = false,
 result = null,
}) {
 const [file, setFile] = useState(null)
 const [parsedData, setParsedData] = useState([])
 const [parseError, setParseError] = useState('')
 const [isDragging, setIsDragging] = useState(false)
 const inputRef = useRef(null)

 const processFile = async (selected) => {
 if (!selected) return
 setFile(selected)
 setParseError('')
 setParsedData([])

 try {
 const headerMap = {
 'kode_jenis': 'kode_jenis',
 'kode jenis': 'kode_jenis',
 'nama_jenis': 'nama_jenis',
 'nama jenis unit': 'nama_jenis',
 'singkatan': 'singkatan',
 'jenjang': 'jenjang',
 'warna_badge': 'warna_badge',
 'warna badge': 'warna_badge',
 'icon': 'icon',
 'urutan': 'urutan',
 'status': 'status',
 'keterangan': 'keterangan',
 }

 const rows = await parseSpreadsheetFile(selected, {
 headerMap,
 transformRow: (row) => ({
 kode_jenis: row.kode_jenis || '',
 nama_jenis: row.nama_jenis || '',
 singkatan: row.singkatan || '',
 jenjang: row.jenjang || '',
 warna_badge: row.warna_badge || '#10B981',
 icon: row.icon || 'School',
 urutan: row.urutan || 1,
 status: row.status !== undefined && row.status !== '' ? row.status : 'true',
 keterangan: row.keterangan || '',
 }),
 })

 const validRows = rows.filter((r) => r.kode_jenis || r.nama_jenis)
 if (validRows.length === 0) {
 setParseError('Berkas tidak memiliki data jenis unit yang valid (minimal kode_jenis atau nama_jenis).')
 } else {
 setParsedData(validRows)
 }
 } catch (err) {
 setParseError('Gagal membaca berkas: ' + (err.message || 'Format tidak didukung.'))
 }
 }

 const handleFileChange = (e) => {
 const selected = e.target.files[0]
 if (selected) processFile(selected)
 }

 const handleDragOver = (e) => {
 e.preventDefault()
 setIsDragging(true)
 }

 const handleDragLeave = () => {
 setIsDragging(false)
 }

 const handleDrop = (e) => {
 e.preventDefault()
 setIsDragging(false)
 const selected = e.dataTransfer.files[0]
 if (selected) processFile(selected)
 }

 const handleDownloadTemplate = (type = 'xlsx') => {
 const sampleData = [
 {
 kode_jenis: 'SDIT',
 nama_jenis: 'Sekolah Dasar Islam Terpadu',
 singkatan: 'SDIT',
 jenjang: 'SD',
 urutan: 1,
 warna_badge: '#10B981',
 icon: 'School',
 status: 'true',
 keterangan: 'Unit SDIT Terpadu',
 },
 {
 kode_jenis: 'SMPIT',
 nama_jenis: 'Sekolah Menengah Pertama Islam Terpadu',
 singkatan: 'SMPIT',
 jenjang: 'SMP',
 urutan: 2,
 warna_badge: '#6366F1',
 icon: 'Graduation',
 status: 'true',
 keterangan: 'Unit SMPIT Terpadu',
 },
 {
 kode_jenis: 'SMAIT',
 nama_jenis: 'Sekolah Menengah Atas Islam Terpadu',
 singkatan: 'SMAIT',
 jenjang: 'SMA',
 urutan: 3,
 warna_badge: '#F59E0B',
 icon: 'BookOpen',
 status: 'true',
 keterangan: 'Unit SMAIT Terpadu',
 },
 ]
 downloadSpreadsheetTemplate(sampleData, 'template_import_jenis_unit', type)
 }

 const [overwriteExisting, setOverwriteExisting] = useState(false)

 const handleSubmit = (e) => {
 e.preventDefault()
 if (parsedData.length === 0) {
 setParseError('Pilih file yang berisi data valid terlebih dahulu.')
 return
 }
 onImport({ file, rows: parsedData, overwrite: overwriteExisting })
 }

 const handleClose = () => {
 if (isSubmitting) return
 setFile(null)
 setParsedData([])
 setParseError('')
 setOverwriteExisting(false)
 onClose()
 }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => !isSubmitting && handleClose()}
      title="Import Jenis Unit Pendidikan"
      badge="Batch Import"
      description="Unggah berkas spreadsheet (Excel/CSV) untuk memperbarui data jenjang sekolah massal."
      icon={Upload}
      maxWidth="max-w-2xl"
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      footer={
        <>
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
            type="submit"
            form="jenis-unit-import-form"
            disabled={isSubmitting || parsedData.length === 0}
            className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
          >
            {isSubmitting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Upload className="size-4" strokeWidth={2} />
            )}
            <span>{isSubmitting ? 'Memproses Import...' : `Mulai Import${parsedData.length > 0 ? ` (${parsedData.length})` : ''}`}</span>
          </button>
        </>
      }
    >
      <form id="jenis-unit-import-form" onSubmit={handleSubmit} className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
 {/* Template Download Card */}
 <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div>
 <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
 <FileSpreadsheet className="size-3.5" />
 Unduh Template Contoh
 </h4>
 <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
 Gunakan format Excel atau CSV resmi agar pemetaan kolom berjalan otomatis.
 </p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => handleDownloadTemplate('xlsx')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-3.5 py-2 text-xs font-extrabold shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer shrink-0"
 >
 <Download className="size-3.5" />
 Excel (.xlsx)
 </button>
 <button
 type="button"
 onClick={() => handleDownloadTemplate('csv')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-2 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer shrink-0"
 >
 <Download className="size-3.5" />
 CSV
 </button>
 </div>
 </div>

 {/* Dropzone Upload Area */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
 Unggah Berkas Spreadsheet (.xlsx, .xls, .csv, .json)
 </label>
 <div
 onDrop={handleDrop}
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onClick={() => inputRef.current?.click()}
 className={`min-h-36 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
 isDragging
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/60 dark:border-emerald-800/60 dark:bg-sky-950/30'
 : file
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/20 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-sky-50/40 dark:border-emerald-800/60 dark:bg-slate-800/40 dark:hover:border-emerald-700'
 }`}
 >
 <input
 ref={inputRef}
 type="file"
 accept=".xlsx,.xls,.csv,.json,.txt"
 onChange={handleFileChange}
 className="hidden"
 id="file-upload-jenis-unit"
 />
 {file ? (
 <>
 <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 truncate px-4">{file.name}</p>
 <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
 {parsedData.length > 0 ? `${parsedData.length} baris data siap diimpor` : 'Memproses berkas...'}
 </p>
 </>
 ) : (
 <>
 <UploadCloud className="mx-auto mb-2 h-8 w-8 text-sky-500 dark:text-sky-400" />
 <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
 {isDragging ? 'Lepaskan berkas di sini...' : 'Klik atau seret & lepas berkas ke sini'}
 </p>
 <p className="text-xs text-slate-400 mt-0.5">Format: Excel (.xlsx, .xls), CSV, JSON · Maks. 5 MB</p>
 </>
 )}
 </div>
 </div>

 {/* Error Notification */}
 {parseError && (
 <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-300">
 <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
 <span>{parseError}</span>
 </div>
 )}

 {/* Data Preview */}
 {parsedData.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
 Pratinjau Data ({parsedData.length} baris terdeteksi)
 </span>
 <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
 Menampilkan maks. 5 baris pertama
 </span>
 </div>
 <div className="max-h-48 overflow-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-2xs dark:border-emerald-800/60 dark:bg-slate-900/50">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-3 py-2">Kode</th>
 <th className="px-3 py-2">Nama Jenis Unit</th>
 <th className="px-3 py-2">Jenjang</th>
 <th className="px-3 py-2">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {parsedData.slice(0, 5).map((row, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <td className="px-3 py-2 font-mono font-bold text-sky-700 dark:text-sky-400">
 {row.kode_jenis || row.kode || '-'}
 </td>
 <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
 {row.nama_jenis || row.nama || '-'}
 </td>
 <td className="px-3 py-2 text-slate-500">
 {row.jenjang || '-'}
 </td>
 <td className="px-3 py-2">
 <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
 {String(row.status) === 'true' || row.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
 </span>
 </td>
 </tr>
 ))}
 {parsedData.length > 5 && (
 <tr>
 <td colSpan={4} className="px-3 py-1.5 text-center text-[10px] font-semibold text-slate-400 italic">
 ... dan {parsedData.length - 5} baris lainnya
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Result Success Rows */}
 {result?.rows?.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Data Berhasil Diimpor</h4>
 <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
 {result.rows.length} data
 </span>
 </div>
 <div className="max-h-48 overflow-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-3 py-2">Kode</th>
 <th className="px-3 py-2">Nama Jenis Unit</th>
 <th className="px-3 py-2">Jenjang</th>
 <th className="px-3 py-2">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
 {result.rows.map((row, index) => (
 <tr key={`${row.kode_jenis || index}-${index}`}>
 <td className="px-3 py-2 font-mono font-bold text-emerald-800 dark:text-emerald-300">{row.kode_jenis || '-'}</td>
 <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">{row.nama_jenis || '-'}</td>
 <td className="px-3 py-2 text-slate-500">{row.jenjang || '-'}</td>
 <td className="px-3 py-2">
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
 Berhasil
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Opsi Timpa Data (Overwrite) */}
 <div className={`rounded-xl border p-4 transition-all duration-200 ${
 overwriteExisting
 ? "border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:border-emerald-800/60 dark:bg-amber-950/30"
 : "border-emerald-200/80 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900/40"
 }`}>
 <label className="flex items-start gap-3 cursor-pointer select-none">
 <div className="pt-0.5">
 <input
 type="checkbox"
 id="overwrite-jenis-unit-checkbox"
 checked={overwriteExisting}
 onChange={(e) => setOverwriteExisting(e.target.checked)}
 className="size-4.5 rounded-md border-emerald-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
 />
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
 Timpa Data Jika Kode / Nama Jenis Sudah Ada
 </span>
 {overwriteExisting ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300">
 <RefreshCcw className="size-2.5" />
 Opsi Timpa Aktif
 </span>
 ) : (
 <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
 Lewati Duplikat (Default)
 </span>
 )}
 </div>
 <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
 {overwriteExisting
 ? 'Jika baris data memiliki Kode Jenis atau Nama Jenis yang sudah terdaftar, data jenis unit lama akan diperbarui otomatis.'
 : 'Jika baris data memiliki Kode Jenis atau Nama Jenis yang sudah ada di database, baris tersebut akan dilewati dan data lama tetap utuh.'}
 </p>
 </div>
 </label>
 </div>
      </form>
    </AppModal>
  )
}
