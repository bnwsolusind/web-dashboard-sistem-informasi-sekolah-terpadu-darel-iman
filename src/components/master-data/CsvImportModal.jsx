import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppModal from '../app/AppModal'
import {
 Download,
 FileSpreadsheet,
 Upload,
 X,
 Sparkles,
 ShieldCheck,
 AlertTriangle,
 CheckCircle2,
 FileCheck,
} from 'lucide-react'

const parseLine = (line, delimiter) => {
 const values = []
 let value = ''
 let quoted = false
 for (let index = 0; index < line.length; index += 1) {
 const char = line[index]
 if (char === '"' && line[index + 1] === '"' && quoted) {
 value += '"'
 index += 1
 } else if (char === '"') {
 quoted = !quoted
 } else if (char === delimiter && !quoted) {
 values.push(value.trim())
 value = ''
 } else {
 value += char
 }
 }
 values.push(value.trim())
 return values
}

const parseCsv = (text) => {
 const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
 if (lines.length < 2) throw new Error('Berkas harus memiliki header dan minimal satu baris data.')
 const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
 const headers = parseLine(lines[0], delimiter).map((item) => item.trim().toLowerCase())
 return lines.slice(1).map((line) =>
 Object.fromEntries(headers.map((header, index) => [header, parseLine(line, delimiter)[index] ?? '']))
 )
}

export default function CsvImportModal({
 open,
 isOpen,
 onClose,
 title = 'Data',
 columns = [],
 templateColumns = [],
 onImport,
}) {
 const isModalOpen = open ?? isOpen ?? false
 const resolvedColumns = columns.length
 ? columns
 : templateColumns.map((c) => (typeof c === 'string' ? { key: c, label: c, example: '' } : c))

 const inputRef = useRef(null)
 const [file, setFile] = useState(null)
 const [previewRows, setPreviewRows] = useState([])
 const [busy, setBusy] = useState(false)
 const [error, setError] = useState('')

 if (!isModalOpen) return null

 const handleFileChange = async (selectedFile) => {
 if (!selectedFile) {
 setFile(null)
 setPreviewRows([])
 return
 }
 setFile(selectedFile)
 setError('')
 try {
 const text = await selectedFile.text()
 const rows = parseCsv(text)
 setPreviewRows(rows.slice(0, 5))
 } catch (err) {
 setPreviewRows([])
 setError(err.message || 'Format file CSV tidak valid.')
 }
 }

 const downloadTemplate = () => {
 const header = resolvedColumns.map((item) => item.key).join(',')
 const example = resolvedColumns.map((item) => `"${item.example ?? ''}"`).join(',')
 const blob = new Blob([`\uFEFF${header}\n${example}\n`], { type: 'text/csv;charset=utf-8' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = `template-${title.toLowerCase().replaceAll(' ', '-')}.csv`
 link.click()
 URL.revokeObjectURL(url)
 }

 const submit = async (event) => {
 event.preventDefault()
 if (!file) return setError('Pilih berkas CSV terlebih dahulu.')
 try {
 setBusy(true)
 setError('')
 const rows = parseCsv(await file.text())
 const missing = resolvedColumns.filter((item) => item.required && !Object.hasOwn(rows[0], item.key))
 if (missing.length) {
 throw new Error(`Kolom wajib tidak ditemukan: ${missing.map((item) => item.key).join(', ')}`)
 }
 await onImport(rows)
 setFile(null)
 setPreviewRows([])
 onClose()
 } catch (importError) {
 setError(importError?.response?.data?.message || importError.message || 'Impor gagal diproses.')
 } finally {
 setBusy(false)
 }
 }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => !busy && onClose()}
      title={`Import ${title}`}
      badge="Batch Import"
      description="Unggah data berformat CSV atau Excel sesuai susunan kolom standar sistem."
      icon={Upload}
      maxWidth="max-w-lg"
      zIndex={70}
      disableBackdropClose={busy}
      hideCloseButton={busy}
      footer={
        <>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <button
            type="submit"
            form="csv-import-modal-form"
            disabled={busy || !file}
            className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
          >
            {busy ? <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Upload className="size-4" strokeWidth={2} />}
            <span>{busy ? 'Memproses Impor...' : 'Mulai Impor Data'}</span>
          </button>
        </>
      }
    >
      <form id="csv-import-modal-form" onSubmit={submit} className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
 {/* 1. Download Template Card */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
 <div className="space-y-0.5">
 <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
 <FileSpreadsheet className="size-4 text-emerald-600" />
 Template Standar Impor
 </p>
 <p className="text-xs text-slate-600 dark:text-slate-300">
 Gunakan template resmi agar seluruh header dan kolom terbaca sempurna.
 </p>
 </div>
 <button
 type="button"
 onClick={downloadTemplate}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-4 py-2 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shrink-0"
 >
 <div className="flex size-4.5 items-center justify-center rounded-lg bg-white/20">
 <Download className="size-3 text-emerald-600" strokeWidth={2.2} />
 </div>
 <span>Unduh Template CSV</span>
 </button>
 </div>

 {/* 2. Dropzone Putus-putus Emerald */}
 <button
 type="button"
 onClick={() => inputRef.current?.click()}
 className="flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/40 p-6 text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-slate-200 cursor-pointer"
 >
 <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <FileSpreadsheet size={26} strokeWidth={2} />
 </div>
 <strong className="mt-3 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
 {file ? file.name : 'Pilih atau Tarik Berkas CSV ke Sini'}
 </strong>
 <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
 {file
 ? `${(file.size / 1024).toFixed(1)} KB • Siap untuk diproses`
 : 'Mendukung format .csv dengan pemisah koma atau titik koma'}
 </span>
 </button>

 <input
 ref={inputRef}
 hidden
 type="file"
 accept=".csv,text/csv"
 onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
 />

 {/* 3. Daftar Kolom */}
 <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3.5 text-xs text-slate-600 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
 <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
 <FileCheck className="size-3.5 text-emerald-600" />
 Susunan Kolom yang Dikenali ({resolvedColumns.length} Kolom):
 </div>
 <div className="flex flex-wrap gap-1.5 pt-0.5">
 {resolvedColumns.map((item) => (
 <span
 key={item.key}
 className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80"
 >
 <code>{item.key}</code>
 {item.required && <span className="text-rose-500 font-bold">*</span>}
 </span>
 ))}
 </div>
 </div>

 {/* 4. Preview Datatable Mini (Jika file dipilih) */}
 {previewRows.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
 <div className="bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2 border-b border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between">
 <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
 <CheckCircle2 className="size-3.5 text-emerald-600" />
 Pratinjau 5 Baris Pertama
 </span>
 <span className="text-[10px] font-bold text-slate-500">
 {previewRows.length} baris terbaca
 </span>
 </div>
 <div className="overflow-x-auto max-h-36">
 <table className="w-full text-xs text-left">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 {Object.keys(previewRows[0] || {}).map((k) => (
 <th key={k} className="px-3 py-1.5 font-bold whitespace-nowrap">
 {k}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {previewRows.map((row, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 {Object.values(row).map((v, i) => (
 <td key={i} className="px-3 py-1 text-slate-600 dark:text-slate-400 whitespace-nowrap">
 {String(v)}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Error Banner */}
 {error && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 flex items-start gap-2">
 <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
 <span>{error}</span>
 </div>
 )}

 {/* Guidance Banner */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30 flex items-start gap-2.5">
 <ShieldCheck className="size-4.5 text-[#059669] dark:text-emerald-400 shrink-0 mt-0.5" />
 <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
 Sistem akan memvalidasi integritas data master secara otomatis. Baris yang valid akan segera disimpan ke sistem.
 </p>
 </div>
      </form>
    </AppModal>
  )
}
