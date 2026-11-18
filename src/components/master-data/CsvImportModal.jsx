import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    <AnimatePresence>
      <div
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="csv-import-modal-title"
        className="fixed inset-0 z-[80] flex items-start sm:items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !busy) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="font-sans w-full max-w-xl my-auto"
        >
          <div className="relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#182232]">
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shrink-0">
                  <Upload className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <h3
                    id="csv-import-modal-title"
                    className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"
                  >
                    <span>Import {title}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                      <Sparkles className="size-3" />
                      Batch Import
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Unggah data berformat CSV atau Excel sesuai susunan kolom standar sistem.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                aria-label="Tutup modal"
                className="size-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 cursor-pointer transition-all active:scale-95 shrink-0 disabled:opacity-50"
              >
                <X className="size-4" strokeWidth={2.2} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700 dark:text-slate-200">
                {/* 1. Download Template Card */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <FileSpreadsheet className="size-4 text-emerald-600" />
                      Template Standar Impor
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Gunakan template resmi agar seluruh header dan kolom terbaca sempurna.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-4 py-2 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/20 shrink-0"
                  >
                    <div className="flex size-4.5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Download className="size-3 text-white" strokeWidth={2.2} />
                    </div>
                    <span>Unduh Template CSV</span>
                  </button>
                </div>

                {/* 2. Dropzone Putus-putus Emerald */}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 p-6 text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-950/20 dark:text-slate-200 cursor-pointer"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                    <FileSpreadsheet size={26} strokeWidth={2} />
                  </div>
                  <strong className="mt-3 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                    {file ? file.name : 'Pilih atau Tarik Berkas CSV ke Sini'}
                  </strong>
                  <span className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-3.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    <FileCheck className="size-3.5 text-emerald-600" />
                    Susunan Kolom yang Dikenali ({resolvedColumns.length} Kolom):
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {resolvedColumns.map((item) => (
                      <span
                        key={item.key}
                        className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        <code>{item.key}</code>
                        {item.required && <span className="text-rose-500 font-bold">*</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Preview Datatable Mini (Jika file dipilih) */}
                {previewRows.length > 0 && (
                  <div className="rounded-2xl border border-emerald-200/80 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-2 border-b border-emerald-200/60 flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        Pratinjau 5 Baris Pertama
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {previewRows.length} baris terbaca
                      </span>
                    </div>
                    <div className="overflow-x-auto max-h-36">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border-b border-emerald-100 dark:border-emerald-900/40">
                          <tr>
                            {Object.keys(previewRows[0] || {}).map((k) => (
                              <th key={k} className="px-3 py-1.5 font-bold whitespace-nowrap">
                                {k}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {previewRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
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
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 flex items-start gap-2">
                    <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Guidance Banner */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-800/50 dark:bg-emerald-950/30 flex items-start gap-2.5">
                  <ShieldCheck className="size-4.5 text-[#0E5C44] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    Sistem akan memvalidasi integritas data master secara otomatis. Baris yang valid akan segera disimpan ke sistem.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                <button
                  type="button"
                  disabled={busy}
                  onClick={onClose}
                  className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium inline-flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <X className="size-4" strokeWidth={2} />
                  <span>Batal</span>
                </button>

                <button
                  type="submit"
                  disabled={busy || !file}
                  className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium inline-flex items-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-xs"
                >
                  {busy ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Upload className="size-4" strokeWidth={2} />
                  )}
                  <span>{busy ? 'Memproses Impor...' : 'Mulai Impor Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
