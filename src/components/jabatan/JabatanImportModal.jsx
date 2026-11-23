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
 RefreshCcw,
} from 'lucide-react'
import { parseSpreadsheetFile, downloadSpreadsheetTemplate } from '../../utils/spreadsheetParser'

export default function JabatanImportModal({ isOpen, onClose, onImport, isSubmitting = false }) {
 const [file, setFile] = useState(null)
 const [parsedData, setParsedData] = useState([])
 const [parseError, setParseError] = useState('')
 const [isDragging, setIsDragging] = useState(false)
 const [overwriteExisting, setOverwriteExisting] = useState(false)
 const inputRef = useRef(null)


 const parseFile = async (selected) => {
 if (!selected) return
 setFile(selected)
 setParseError('')
 setParsedData([])

 try {
 const headerMap = {
 'kode_jabatan': 'kode_jabatan',
 'kode jabatan': 'kode_jabatan',
 'kode': 'kode_jabatan',
 'nama_jabatan': 'nama_jabatan',
 'nama jabatan': 'nama_jabatan',
 'nama': 'nama_jabatan',
 'name': 'nama_jabatan',
 'satuan_kerja': 'satuan_kerja',
 'satuan kerja': 'satuan_kerja',
 'scope_akses': 'scope_akses',
 'scope akses': 'scope_akses',
 'level_jabatan': 'level_jabatan',
 'level jabatan': 'level_jabatan',
 'level': 'level_jabatan',
 'level_label': 'level_label',
 'level label': 'level_label',
 'unit_sekolah': 'unit_sekolah',
 'unit sekolah': 'unit_sekolah',
 'unit_sekolah_id': 'unit_sekolah_id',
 'unit_id': 'unit_sekolah_id',
 'unit': 'unit_sekolah',
 'atasan_langsung': 'atasan_langsung',
 'atasan langsung': 'atasan_langsung',
 'role_sistem': 'role_sistem',
 'role sistem': 'role_sistem',
 'urutan': 'urutan',
 'warna': 'warna',
 'ikon': 'ikon',
 'deskripsi': 'deskripsi',
 'description': 'deskripsi',
 'status': 'status',
 'tampil_struktur': 'tampil_struktur',
 'tampil struktur': 'tampil_struktur',
 'boleh_login': 'boleh_login',
 'boleh login': 'boleh_login',
 'jumlah_pegawai': 'jumlah_pegawai',
 'jumlah pegawai': 'jumlah_pegawai',
 }

 const parseBool = (val, defaultVal = true) => {
 if (val === undefined || val === null || val === '' || val === '-') return defaultVal
 if (typeof val === 'boolean') return val
 if (typeof val === 'number') return val === 1
 const str = String(val).toLowerCase().trim()
 if (['ya', 'y', 'true', '1', 'aktif', 'active', 'yes'].includes(str)) return true
 if (['tidak', 't', 'false', '0', 'nonaktif', 'inactive', 'no'].includes(str)) return false
 return defaultVal
 }

 const parseLevel = (val, defaultVal = 8) => {
 if (typeof val === 'number' && !isNaN(val)) return val >= 1 && val <= 10 ? val : defaultVal
 const str = String(val || '')
 const match = str.match(/\d+/)
 if (match) {
 const num = parseInt(match[0], 10)
 return num >= 1 && num <= 10 ? num : defaultVal
 }
 return defaultVal
 }

 const rows = await parseSpreadsheetFile(selected, {
 headerMap,
 transformRow: (row) => ({
 ...row,
 kode_jabatan: row.kode_jabatan || '',
 nama_jabatan: row.nama_jabatan || '',
 satuan_kerja: row.satuan_kerja && row.satuan_kerja !== '-' ? row.satuan_kerja : 'Unit Pendidikan',
 scope_akses: row.scope_akses && row.scope_akses !== '-' ? row.scope_akses : 'unit_sendiri',
 level_jabatan: parseLevel(row.level_jabatan, 8),
 unit_sekolah: row.unit_sekolah && row.unit_sekolah !== '-' ? row.unit_sekolah : '',
 unit_sekolah_id: row.unit_sekolah_id || undefined,
 atasan_langsung: row.atasan_langsung && row.atasan_langsung !== '-' ? row.atasan_langsung : '',
 role_sistem: row.role_sistem && row.role_sistem !== '-' ? row.role_sistem : '',
 urutan: Number(row.urutan) || 0,
 warna: row.warna && row.warna !== '-' ? row.warna : '#3B82F6',
 ikon: row.ikon && row.ikon !== '-' ? row.ikon : 'UserCheck',
 deskripsi: row.deskripsi && row.deskripsi !== '-' ? row.deskripsi : '',
 status: parseBool(row.status, true) ? 'Aktif' : 'Nonaktif',
 tampil_struktur: parseBool(row.tampil_struktur, true),
 boleh_login: parseBool(row.boleh_login, false),
 }),
 })

 const validRows = rows.filter((r) => r.kode_jabatan || r.nama_jabatan)
 if (validRows.length === 0) {
 setParseError('Berkas tidak memiliki data jabatan yang valid (minimal kode_jabatan atau nama_jabatan).')
 } else {
 setParsedData(validRows)
 }
 } catch (err) {
 setParseError('Gagal membaca berkas: ' + (err.message || 'Format tidak didukung.'))
 }
 }

 const handleFileChange = (e) => {
 const selected = e.target.files[0]
 if (selected) parseFile(selected)
 }

 const handleDrop = (e) => {
 e.preventDefault()
 setIsDragging(false)
 const selected = e.dataTransfer.files[0]
 if (selected) parseFile(selected)
 }

 const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
 const handleDragLeave = () => setIsDragging(false)

 const handleDownloadTemplate = (type = 'xlsx') => {
 const sampleData = [
 {
 'Kode Jabatan': 'JBT-101',
 'Nama Jabatan': 'Koordinator Ekstrakurikuler',
 'Satuan Kerja': 'Unit Pendidikan',
 'Level': 8,
 'Level Label': 'Level 8 - Guru',
 'Unit Sekolah': 'Unit Pendidikan Contoh',
 'Atasan Langsung': 'Kepala Sekolah',
 'Role Sistem': 'Guru',
 'Scope Akses': 'siswa_binaan',
 'Urutan': 15,
 'Status': 'Aktif',
 'Tampil Struktur': 'Ya',
 'Boleh Login': 'Ya',
 'Deskripsi': 'Mengkoordinasi seluruh kegiatan ekstrakurikuler siswa',
 },
 {
 'Kode Jabatan': 'JBT-102',
 'Nama Jabatan': 'Staf Tata Usaha Unit',
 'Satuan Kerja': 'Unit Pendidikan',
 'Level': 6,
 'Level Label': 'Level 6 - Tata Usaha',
 'Unit Sekolah': 'Unit Pendidikan Contoh',
 'Atasan Langsung': 'Kepala Sekolah',
 'Role Sistem': 'Tata Usaha',
 'Scope Akses': 'unit_sendiri',
 'Urutan': 16,
 'Status': 'Aktif',
 'Tampil Struktur': 'Ya',
 'Boleh Login': 'Ya',
 'Deskripsi': 'Pengelolaan administrasi operasional sekolah',
 },
 ]

 if (type === 'json') {
 const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sampleData, null, 2))
 const a = document.createElement('a')
 a.setAttribute('href', dataStr)
 a.setAttribute('download', 'template_import_master_jabatan.json')
 document.body.appendChild(a)
 a.click()
 a.remove()
 } else {
 downloadSpreadsheetTemplate(sampleData, 'template_import_master_jabatan', type)
 }
 }


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

  if (!isOpen) return null

 return (
 <AnimatePresence>
 {isOpen && (
 <div
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="jabatan-import-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !isSubmitting) handleClose()
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-xl"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sky-950/20 dark:border-emerald-800/60 dark:bg-[#182232]">
 {/* Top accent bar — sky blue for import */}

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232] dark:bg-slate-950">
 <div className="flex items-center gap-3">
 <div className="rounded-lg bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-400 p-2.5 shadow-xs shrink-0">
                  <FileInput className="size-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
 </div>
 <div>
 <h3
 id="jabatan-import-title"
 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 Import Data Jabatan
 <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" /> Batch Import
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Unggah file JSON atau CSV berisi daftar jabatan secara massal.
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={handleClose}
 disabled={isSubmitting}
 aria-label="Tutup modal import"
 className="size-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-sky-950/60 dark:text-sky-300 transition-colors cursor-pointer disabled:opacity-50"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
 <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">

 {/* Template Download Card */}
 <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div>
 <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
 <FileSpreadsheet className="size-3.5" />
 Unduh Template Contoh
 </h4>
 <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
 Gunakan template resmi (Excel/CSV/JSON) agar pemetaan jabatan tepat.
 </p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => handleDownloadTemplate('xlsx')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-3 py-2 text-xs font-extrabold shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer shrink-0"
 >
 <Download className="size-3.5" />
 Excel (.xlsx)
 </button>
 <button
 type="button"
 onClick={() => handleDownloadTemplate('csv')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-2 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer shrink-0"
 >
 <Download className="size-3.5" />
 CSV
 </button>
 <button
 type="button"
 onClick={() => handleDownloadTemplate('json')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 px-2.5 py-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 shadow-2xs hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
 >
 <Download className="size-3.5" />
 JSON
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
 id="file-upload-jabatan"
 />
 {file ? (
 <>
 <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 truncate px-4">{file.name}</p>
 <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
 {parsedData.length > 0 ? `${parsedData.length} baris data siap diimpor` : 'Memproses file...'}
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

 {/* Parse Error Feedback */}
 {parseError && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-200 flex items-start gap-2.5">
 <AlertTriangle className="size-4 shrink-0 text-rose-600 mt-0.5" strokeWidth={2.2} />
 <span className="leading-snug">{parseError}</span>
 </div>
 )}

 {/* Parse Success Feedback */}
 {parsedData.length > 0 && !parseError && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-center gap-2.5">
 <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
 <div>
 <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
 Data Siap Diimpor
 </p>
 <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
 Berhasil membaca <strong>{parsedData.length} baris</strong> data jabatan — siap untuk diproses.
 </p>
 </div>
 </div>

 {/* Mini Preview Table */}
 <div className="mt-3 overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 max-h-36">
 <table className="w-full min-w-[500px] text-left text-[10px]">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">No</th>
 <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Kode</th>
 <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Nama Jabatan</th>
 <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Level</th>
 <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Unit Sekolah</th>
 <th className="px-3 py-2 font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {parsedData.slice(0, 5).map((row, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
 <td className="px-3 py-1.5 font-bold text-slate-400">{idx + 1}</td>
 <td className="px-3 py-1.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
 {row.kode_jabatan || '-'}
 </td>
 <td className="px-3 py-1.5 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
 {row.nama_jabatan || row.name || '-'}
 </td>
 <td className="px-3 py-1.5 text-slate-500">
 {row.level_jabatan ? `Level ${row.level_jabatan}` : '-'}
 </td>
 <td className="px-3 py-1.5 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
 {row.unit_sekolah || (row.unit_sekolah_id ? 'Terkait Unit' : 'Auto / Sesuai Akun')}
 </td>
 <td className="px-3 py-1.5 font-bold text-emerald-600 dark:text-emerald-400">
 {row.status || 'Aktif'}
 </td>
 </tr>
 ))}
 {parsedData.length > 5 && (
 <tr>
 <td colSpan={6} className="px-3 py-1.5 text-center text-[10px] font-semibold text-slate-400 italic">
 ... dan {parsedData.length - 5} baris lainnya
 </td>
 </tr>
 )}
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
 id="overwrite-jabatan-checkbox"
 checked={overwriteExisting}
 onChange={(e) => setOverwriteExisting(e.target.checked)}
 className="size-4.5 rounded-md border-emerald-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
 />
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
 Timpa Data Jika Kode / Nama Jabatan Sudah Ada
 </span>
 {overwriteExisting ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300">
 <RefreshCcw className="size-2.5" />
 Opsi Timpa Aktif
 </span>
 ) : (
 <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
 Lewati Duplikat (Default)
 </span>
 )}
 </div>
 <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
 {overwriteExisting
 ? 'Jika baris data memiliki Kode Jabatan atau Nama Jabatan yang sudah terdaftar, data jabatan lama akan diperbarui otomatis.'
 : 'Jika baris data memiliki Kode Jabatan atau Nama Jabatan yang sudah ada di database, baris tersebut akan dilewati dan data lama tetap utuh.'}
 </p>
 </div>
 </label>
 </div>
 </div>

 {/* Footer */}
 <div className="modal-footer px-6 py-4 border-t border-emerald-100/80 dark:border-emerald-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40">
 <button
 type="button"
 disabled={isSubmitting}
 onClick={handleClose}
 className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs dark:border-emerald-700/80 dark:bg-emerald-600 dark:text-slate-200 transition cursor-pointer disabled:opacity-50 text-sm font-medium"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={isSubmitting || parsedData.length === 0}
 className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2.5 text-xs font-extrabold shadow-md shadow-sky-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 {isSubmitting ? (
 <span className="size-3.5 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : (
 <FileInput className="size-4" strokeWidth={2} />
 )}
 <span>{isSubmitting ? 'Memproses Import...' : `Mulai Import${parsedData.length > 0 ? ` (${parsedData.length})` : ''}`}</span>
 </button>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 )
}
