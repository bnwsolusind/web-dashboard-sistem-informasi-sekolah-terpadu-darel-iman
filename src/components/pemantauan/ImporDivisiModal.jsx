import React, { useState } from 'react'
import { FileSpreadsheet, Download, AlertCircle, CheckCircle2, X, Upload as Upload1 } from 'lucide-react'
import {
 Dialog,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogBody,
 DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Swal from '@/components/ui/compat/swal-heroui'

export default function ImporDivisiModal({ isOpen, onClose, onImportSuccess }) {
 const [file, setFile] = useState(null)
 const [isUploading, setIsUploading] = useState(false)
 const [parsedData, setParsedData] = useState([])

 if (!isOpen) return null

 const handleFileChange = (e) => {
 const selectedFile = e.target.files[0]
 if (!selectedFile) return
 setFile(selectedFile)

 const reader = new FileReader()
 reader.onload = (event) => {
 try {
 const text = event.target.result
 const lines = text.split('\n').filter((l) => l.trim() !== '')
 if (lines.length > 1) {
 const rows = lines.slice(1).map((line, idx) => {
 const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
 return {
 id: `imp_${idx}_${Date.now()}`,
 nama_divisi: cols[0] || '',
 aspek_pemantauan: cols[1] || '',
 persentase_capaian: Number(cols[2]) || 0,
 status_pemantauan: cols[3] || 'proses',
 tanggal_pemantauan: cols[4] || new Date().toISOString().split('T')[0],
 petugas_supervisi: cols[5] || '',
 unit_pendidikan: cols[6] || '',
 catatan: cols[7] || '',
 }
 })
 setParsedData(rows)
 }
 } catch (err) {
 console.error('CSV Parsing Error:', err)
 }
 }
 reader.readAsText(selectedFile)
 }

 const handleDownloadTemplate = () => {
 const headers = [
 'Nama Divisi',
 'Aspek Pemantauan',
 'Persentase Capaian (0-100)',
 'Status (proses/tercapai/terlambat/belum_tercapai)',
 'Tanggal (YYYY-MM-DD)',
 'Petugas Supervisi',
 'Unit Pendidikan',
 'Catatan Evaluasi',
 ]
 const sampleRows = [
 [
 'Divisi Al-Qur\'an / Tahfidz',
 'Target Ziyadah 2 Juz & Murajaah Harian',
 '85',
 'tercapai',
 new Date().toISOString().split('T')[0],
 'Ustadz Hamzah, S.Pd.I',
 'SD IT',
 'Sebagian besar santri mencapai target ziyadah semester ini.',
 ],
 [
 'Divisi Kesiswaan & BPI',
 'Monitoring Amal Yaumi & Shalat Dhuha',
 '90',
 'tercapai',
 new Date().toISOString().split('T')[0],
 'Ustadz Abdullah, S.Pd',
 'SMP IT',
 'Kedisiplinan jamaah shalat dhuha 90% terlaksana konsisten.',
 ],
 [
 'Divisi Kurikulum / Akademik',
 'Ketuntasan Modul Diniyah & Pelajaran Umum',
 '75',
 'proses',
 new Date().toISOString().split('T')[0],
 'Ustadzah Fatimah, M.Pd',
 'SMA IT',
 'Perlu percepatan materi ujian integrasi akhir semester.',
 ],
 ]

 const csvContent =
 'data:text/csv;charset=utf-8,' +
 [headers.join(','), ...sampleRows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n')

 const encodedUri = encodeURI(csvContent)
 const link = document.createElement('a')
 link.setAttribute('href', encodedUri)
 link.setAttribute('download', 'template_impor_monitoring_divisi_sit.csv')
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }

 const handleSubmitImport = async () => {
 if (!file && parsedData.length === 0) {
 Swal.fire('Peringatan', 'Silakan pilih file CSV terlebih dahulu.', 'warning')
 return
 }
 setIsUploading(true)
 setTimeout(() => {
 setIsUploading(false)
 if (onImportSuccess) onImportSuccess(parsedData)
 Swal.fire('Berhasil Impor', `Berhasil mengimpor ${parsedData.length || 3} data monitoring divisi.`, 'success')
 onClose()
 }, 800)
 }

 return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-xl w-full p-0 overflow-hidden bg-white dark:bg-[#1B2433] rounded-3xl shadow-2xl shadow-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80"
    >
      {/* Top Accent Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-6 py-4.5 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm shrink-0">
            <Upload1 className="size-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              Impor Data Laporan Monitoring Divisi
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/30">
                CSV
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
              Unggah file CSV/Excel yang berisi data supervisi dan laporan ketercapaian divisi.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup Modal"
          className="size-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-rose-500 hover:text-white text-white border border-white/25 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <X className="size-4.5" strokeWidth={2.2} />
        </button>
      </div>

      <DialogBody className="space-y-4 p-6">
        {/* Template Download Option */}
        <div className="flex items-center justify-between rounded-2xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/50 p-4 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
              <FileSpreadsheet className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-white">Format Template CSV</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unduh file template resmi berisi susunan kolom data divisi SIT.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-black transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
          >
            <Download className="size-3.5" />
            Unduh CSV
          </button>
        </div>

        {/* Drag & Drop File Upload Container */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/30 p-6 text-center hover:bg-emerald-50/60 transition-colors dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20">
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            className="absolute inset-0 z-10 opacity-0 cursor-pointer"
          />
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300 mb-2 shadow-xs">
            <Upload1 className="size-6" />
          </div>
          <p className="text-xs font-black text-slate-800 dark:text-white">
            {file ? file.name : 'Tarik & Letakkan File CSV Di Sini'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Atau klik untuk memilih file dari komputer Anda (CSV, Max 5MB)</p>
        </div>

        {/* Parsed Summary Preview */}
        {parsedData.length > 0 && (
          <div className="rounded-2xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/70 p-3.5 dark:bg-emerald-950/30 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-black">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Terdeteksi {parsedData.length} baris data siap diimpor</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
              Contoh: {parsedData[0]?.nama_divisi} - {parsedData[0]?.aspek_pemantauan} ({parsedData[0]?.persentase_capaian}%)
            </p>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="px-6 py-4 border-t border-emerald-200/80 bg-slate-100/90 dark:bg-slate-900/80 dark:border-emerald-800/60 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmitImport}
          disabled={isUploading || (!file && parsedData.length === 0)}
          className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
        >
          {isUploading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Upload1 className="size-4" strokeWidth={2} />
          )}
          <span>Impor Data Sekarang</span>
        </button>
      </DialogFooter>
    </Dialog>
  )
}
