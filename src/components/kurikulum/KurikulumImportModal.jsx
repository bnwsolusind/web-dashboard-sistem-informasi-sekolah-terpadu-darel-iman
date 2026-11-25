import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 X,
 FileInput,
 Download,
 UploadCloud,
 CheckCircle2,
 AlertTriangle,
 Sparkles,
 FileSpreadsheet,
} from 'lucide-react'
import { parseSpreadsheetFile, downloadSpreadsheetTemplate } from '../../utils/spreadsheetParser'
import AppModal from '../app/AppModal'

const SAMPLE_ROWS = [
 {
 kode_kurikulum: 'KUR-SD-SIT-2026',
 nama_kurikulum: 'Kurikulum Merdeka SIT SD 2026',
 jenis_kurikulum: 'SIT',
 jenjang: 'SD',
 unit_pendidikan: 'SDIT Dar el-Iman - Padang',
 tahun_ajaran: '2026/2027',
 semester: 'Semester Ganjil',
 tanggal_mulai: '2026-07-15',
 tanggal_selesai: '2027-06-30',
 status: 'Aktif',
 deskripsi: 'Kurikulum SIT untuk jenjang Sekolah Dasar 2026/2027',
 },
 {
 kode_kurikulum: 'KUR-SMP-SIT-2026',
 nama_kurikulum: 'Kurikulum Merdeka SIT SMP 2026',
 jenis_kurikulum: 'SIT',
 jenjang: 'SMP',
 unit_pendidikan: 'SMPIT 1 Dar el-Iman - Padang',
 tahun_ajaran: '2026/2027',
 semester: 'Semester Ganjil',
 tanggal_mulai: '2026-07-15',
 tanggal_selesai: '2027-06-30',
 status: 'Aktif',
 deskripsi: 'Kurikulum SIT untuk jenjang SMPIT 2026/2027',
 },
 {
 kode_kurikulum: 'KUR-SMA-SIT-2026',
 nama_kurikulum: 'Kurikulum Nasional Plus Pesantren SMA',
 jenis_kurikulum: 'Pesantren',
 jenjang: 'SMA',
 unit_pendidikan: 'SMAIT Dar el-Iman - Padang',
 tahun_ajaran: '2026/2027',
 semester: 'Semester Ganjil',
 tanggal_mulai: '2026-07-15',
 tanggal_selesai: '2027-06-30',
 status: 'Aktif',
 deskripsi: 'Kurikulum terpadu pesantren dan nasional',
 },
]

export default function KurikulumImportModal({
 isOpen,
 onClose,
 onImport,
 isSubmitting = false,
 result = null,
 defaultUnitId = '',
 defaultTahunAjaranId = '',
}) {
 const [file, setFile] = useState(null)
 const [parsedData, setParsedData] = useState([])
 const [parseError, setParseError] = useState('')
 const [isDragging, setIsDragging] = useState(false)
 const [useManualJson, setUseManualJson] = useState(false)
 const [manualJsonText, setManualJsonText] = useState('')
 const inputRef = useRef(null)

 const processFile = async (selected) => {
 if (!selected) return
 setFile(selected)
 setParseError('')
 setParsedData([])

 try {
 const headerMap = {
 'kode_kurikulum': 'kode_kurikulum',
 'kode kurikulum': 'kode_kurikulum',
 'kode': 'kode_kurikulum',
 'nama_kurikulum': 'nama_kurikulum',
 'nama kurikulum': 'nama_kurikulum',
 'nama': 'nama_kurikulum',
 'jenis_kurikulum': 'jenis_kurikulum',
 'jenis kurikulum': 'jenis_kurikulum',
 'jenis': 'jenis_kurikulum',
 'jenjang': 'jenjang',
 'unit_pendidikan': 'unit_pendidikan',
 'unit pendidikan': 'unit_pendidikan',
 'unit_pendidikan_id': 'unit_pendidikan_id',
 'unit': 'unit_pendidikan',
 'tahun_ajaran': 'tahun_ajaran',
 'tahun ajaran': 'tahun_ajaran',
 'tahun_ajaran_id': 'tahun_ajaran_id',
 'tahun': 'tahun_ajaran',
 'semester': 'semester',
 'semester_id': 'semester_id',
 'tanggal_mulai': 'tanggal_mulai',
 'tanggal mulai': 'tanggal_mulai',
 'tanggal_selesai': 'tanggal_selesai',
 'tanggal selesai': 'tanggal_selesai',
 'status': 'status',
 'deskripsi': 'deskripsi',
 }

 const rows = await parseSpreadsheetFile(selected, {
 headerMap,
 transformRow: (row) => ({
 kode_kurikulum: row.kode_kurikulum || '',
 nama_kurikulum: row.nama_kurikulum || '',
 jenis_kurikulum: row.jenis_kurikulum || 'SIT',
 jenjang: row.jenjang || '',
 unit_pendidikan: row.unit_pendidikan || '',
 unit_pendidikan_id: row.unit_pendidikan_id || defaultUnitId || '',
 tahun_ajaran: row.tahun_ajaran || '',
 tahun_ajaran_id: row.tahun_ajaran_id || defaultTahunAjaranId || '',
 semester: row.semester || '',
 semester_id: row.semester_id || '',
 tanggal_mulai: row.tanggal_mulai || '',
 tanggal_selesai: row.tanggal_selesai || '',
 status: row.status !== undefined && row.status !== '' ? row.status : 'aktif',
 deskripsi: row.deskripsi || '',
 }),
 })

 const validRows = rows.filter((r) => r.kode_kurikulum || r.nama_kurikulum)
 if (validRows.length === 0) {
 setParseError('Berkas tidak memiliki data kurikulum yang valid (minimal kode_kurikulum atau nama_kurikulum).')
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

 const handleDownloadTemplateExcel = () => {
 downloadSpreadsheetTemplate(SAMPLE_ROWS, 'template_import_master_kurikulum', 'xlsx')
 }

 const handleDownloadTemplateCsv = () => {
 downloadSpreadsheetTemplate(SAMPLE_ROWS, 'template_import_master_kurikulum', 'csv')
 }

 const handleDownloadTemplateJson = () => {
 const jsonStr = JSON.stringify(SAMPLE_ROWS, null, 2)
 const blob = new Blob([jsonStr], { type: 'application/json' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.setAttribute('download', 'template_import_master_kurikulum.json')
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }

 const handleManualJsonParse = () => {
 setParseError('')
 if (!manualJsonText.trim()) {
 setParseError('Payload data JSON tidak boleh kosong.')
 return
 }
 try {
 const parsed = JSON.parse(manualJsonText)
 if (Array.isArray(parsed)) {
 setParsedData(parsed)
 } else if (typeof parsed === 'object') {
 setParsedData([parsed])
 } else {
 setParseError('Format harus berupa array objek data kurikulum.')
 }
 } catch (err) {
 setParseError('Format JSON tidak valid: ' + err.message)
 }
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 if (useManualJson && parsedData.length === 0 && manualJsonText.trim()) {
 try {
 const parsed = JSON.parse(manualJsonText)
 const rows = Array.isArray(parsed) ? parsed : [parsed]
 onImport(rows)
 return
 } catch (err) {
 setParseError('Format JSON tidak valid: ' + err.message)
 return
 }
 }

 if (parsedData.length === 0) {
 setParseError('Pilih file CSV/JSON yang valid atau masukkan teks JSON terlebih dahulu.')
 return
 }
 onImport(parsedData)
 }

 const resetModal = () => {
 setFile(null)
 setParsedData([])
 setParseError('')
 setManualJsonText('')
 onClose()
 }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => !isSubmitting && resetModal()}
      title="Import Data Kurikulum"
      badge="Batch Import"
      description="Unggah berkas spreadsheet (Excel/CSV) untuk memperbarui data kurikulum massal."
      icon={FileInput}
      maxWidth="max-w-xl"
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      bodyClassName="space-y-5"
      footer={
        <>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={resetModal}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSubmitting || (parsedData.length === 0 && !manualJsonText.trim())}
            onClick={handleSubmit}
            className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
          >
            {isSubmitting ? <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FileInput className="size-4" />}
            <span>{isSubmitting ? 'Mengimpor...' : 'Mulai Import'}</span>
          </button>
        </>
      }
    >
 {/* Result Callout */}
 {result && (
 <div
 className={`rounded-xl p-4 text-xs flex items-start gap-3 border ${
 result.success
 ? 'bg-emerald-50 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300'
 : 'bg-rose-50 border-emerald-200/80 dark:border-emerald-800/60 text-rose-900 dark:bg-rose-950/40 dark:border-emerald-800/60 dark:text-rose-300'
 }`}
 >
 {result.success ? (
 <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
 ) : (
 <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
 )}
 <div>
 <p className="font-bold">{result.message || (result.success ? 'Import Sukses' : 'Gagal Import')}</p>
 {result.count !== undefined && (
 <p className="mt-1 text-xs font-semibold">Total diproses: {result.count} data kurikulum</p>
 )}
 </div>
 </div>
 )}

 {/* Download Template Card */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 dark:border-emerald-800/60 dark:bg-sky-950/20">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/30">
 <FileSpreadsheet className="size-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-900 dark:text-white">
 Unduh Template Contoh
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Format Excel, CSV, atau JSON standar dengan atribut kurikulum lengkap.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={handleDownloadTemplateExcel}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 text-xs font-bold text-sky-800 dark:text-sky-300 shadow-2xs hover:bg-sky-100 transition cursor-pointer"
 >
 <Download className="size-3.5" />
 Excel (.xlsx)
 </button>
 <button
 type="button"
 onClick={handleDownloadTemplateCsv}
 className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-sky-700 shadow-2xs dark:border-emerald-800/60 dark:bg-emerald-600 dark:text-sky-300 transition cursor-pointer text-sm font-medium"
 >
 <Download className="size-3.5" />
 CSV
 </button>
 <button
 type="button"
 onClick={handleDownloadTemplateJson}
 className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-sky-700 shadow-2xs dark:border-emerald-800/60 dark:bg-emerald-600 dark:text-sky-300 transition cursor-pointer text-sm font-medium"
 >
 <Download className="size-3.5" />
 JSON
 </button>
 </div>
 </div>
 </div>

 {/* Tab Pilihan Metode Input */}
 <div className="flex items-center gap-2 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2">
 <button
 type="button"
 onClick={() => setUseManualJson(false)}
 className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
 !useManualJson
 ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
 : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
 }`}
 >
 Unggah Berkas File (.xlsx / .xls / .csv / .json)
 </button>
 <button
 type="button"
 onClick={() => setUseManualJson(true)}
 className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
 useManualJson
 ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
 : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
 }`}
 >
 Tempel Payload JSON
 </button>
 </div>

 {!useManualJson ? (
 /* Dropzone Area */
 <div>
 <input
 ref={inputRef}
 type="file"
 accept=".xlsx,.xls,.csv,.json,.txt"
 className="hidden"
 onChange={handleFileChange}
 />

 <div
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 onClick={() => inputRef.current?.click()}
 className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center transition-all duration-200 cursor-pointer ${
 isDragging
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/60 dark:border-emerald-800/60 dark:bg-sky-950/30'
 : file
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/30 dark:border-emerald-800/60 dark:bg-sky-950/10'
 : 'border-emerald-200/80 bg-slate-50/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-sky-50/20 dark:border-emerald-700/80 dark:bg-slate-900/40 dark:hover:border-emerald-700'
 }`}
 >
 <div className="flex size-12 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-sky-500/25 mb-3 group-hover:scale-105 transition-transform">
 <UploadCloud className="size-6" />
 </div>

 {file ? (
 <div>
 <p className="text-xs font-black text-slate-900 dark:text-white">{file.name}</p>
 <p className="text-xs font-semibold text-slate-400 mt-0.5">
 {(file.size / 1024).toFixed(1)} KB · Klik untuk mengganti berkas
 </p>
 </div>
 ) : (
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 Tarik dan letakkan berkas Excel (.xlsx, .xls), CSV, atau JSON di sini
 </p>
 <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
 atau klik untuk memilih file dari komputer Anda
 </p>
 </div>
 )}
 </div>
 </div>
 ) : (
 /* Manual JSON Textarea */
 <div className="space-y-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 Payload Teks JSON:
 </label>
 <textarea
 rows={6}
 value={manualJsonText}
 onChange={(e) => {
 setManualJsonText(e.target.value)
 setParseError('')
 }}
 onBlur={handleManualJsonParse}
 placeholder="Tempel array data JSON di sini... Contoh: [ { &quot;kode_kurikulum&quot;: &quot;KUR-01&quot;, ... } ]"
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 p-3 font-mono text-xs text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 />
 </div>
 )}

 {/* Error Box */}
 {parseError && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
 <AlertTriangle className="size-4 shrink-0 text-rose-600" />
 <span>{parseError}</span>
 </div>
 )}

 {/* Preview Parsed Data */}
 {parsedData.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
 <CheckCircle2 className="size-3.5 text-sky-600" />
 <span>Pratinjau Data ({parsedData.length} baris terdeteksi)</span>
 </p>
 <span className="text-xs font-bold text-sky-600">Siap diimpor</span>
 </div>

 <div className="max-h-40 overflow-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
 <table className="w-full text-left">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="p-2">#</th>
 <th className="p-2">Kode</th>
 <th className="p-2">Nama Kurikulum</th>
 <th className="p-2">Jenis</th>
 <th className="p-2">Jenjang</th>
 <th className="p-2">Unit</th>
 <th className="p-2">Tahun Ajaran</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {parsedData.slice(0, 5).map((row, i) => (
 <tr key={i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="p-2 text-slate-400 font-mono">{i + 1}</td>
 <td className="p-2 font-mono font-bold text-sky-700 dark:text-sky-400">
 {row.kode_kurikulum || row.kode || '(Auto)'}
 </td>
 <td className="p-2 font-semibold text-slate-800 dark:text-slate-200">
 {row.nama_kurikulum || row.nama || '-'}
 </td>
 <td className="p-2 text-slate-600 dark:text-slate-400">
 {row.jenis_kurikulum || row.jenis || '-'}
 </td>
 <td className="p-2 text-slate-600 dark:text-slate-400">
 {row.jenjang || '-'}
 </td>
 <td className="p-2 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
 {row.unit_pendidikan || (row.unit_pendidikan_id ? 'Terkait ID' : '(Default)')}
 </td>
 <td className="p-2 text-slate-600 dark:text-slate-400">
 {row.tahun_ajaran || (row.tahun_ajaran_id ? 'Terkait ID' : '(Aktif)')}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {parsedData.length > 5 && (
 <p className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900/50">
 ... dan {parsedData.length - 5} baris data lainnya
 </p>
 )}
 </div>
 </div>
 )}
    </AppModal>
  )
}
