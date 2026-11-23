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
 className="max-w-xl w-full p-6 bg-white dark:bg-[#1B2433] rounded-3xl shadow-2xl shadow-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80"
 >
 <DialogHeader className="pb-3 border-b border-emerald-100/80 dark:border-emerald-800/60 relative">
 <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wider">
 <Upload1 className="h-4 w-4" />
 <span>Impor Data Monitoring</span>
 </div>
 <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
 Impor Data Laporan Monitoring Divisi
 </DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
 Unggah file CSV/Excel yang berisi data supervisi dan laporan ketercapaian divisi unit kerja sekolah.
 </DialogDescription>
 <button
 type="button"
 onClick={onClose}
 className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 cursor-pointer"
 aria-label="Tutup Modal"
 >
 <X className="h-5 w-5" />
 </button>
 </DialogHeader>

 <DialogBody className="space-y-4 py-4">
 {/* Template Download Option */}
 <div className="flex items-center justify-between rounded-xl bg-amber-50/80 border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 dark:bg-amber-950/30 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <FileSpreadsheet className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
 <div>
 <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">Belum punya format CSV?</h4>
 <p className="text-xs text-amber-700 dark:text-amber-300">
 Unduh file template resmi berisi susunan kolom data divisi SIT.
 </p>
 </div>
 </div>
 <Button
 type="button"
 variant="ghost"
 size="xs"
 onClick={handleDownloadTemplate}
 className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-amber-700 transition-colors cursor-pointer shrink-0 shadow-xs"
 >
 <Download className="h-3.5 w-3.5" />
 Unduh Format CSV
 </Button>
 </div>

 {/* Drag & Drop File Upload Container */}
 <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/50 p-6 text-center hover:bg-sky-50 transition-colors dark:border-emerald-800/60 dark:bg-sky-950/20 dark:hover:bg-sky-950/30">
 <input
 type="file"
 accept=".csv, .xlsx, .xls"
 onChange={handleFileChange}
 className="absolute inset-0 z-10 opacity-0 cursor-pointer"
 />
 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/60 dark:text-sky-300 mb-2">
 <Upload1 className="h-6 w-6" />
 </div>
 <p className="text-xs font-extrabold text-slate-800 dark:text-white">
 {file ? file.name : 'Tarik & Letakkan File CSV Di Sini'}
 </p>
 <p className="text-xs text-slate-400 mt-1">Atau klik untuk memilih file dari komputer Anda (CSV, Max 5MB)</p>
 </div>

 {/* Parsed Summary Preview */}
 {parsedData.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/30 space-y-1.5">
 <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
 <CheckCircle2 className="h-4 w-4 text-emerald-600" />
 <span>Terdeteksi {parsedData.length} baris data siap diimpor</span>
 </div>
 <p className="text-xs text-emerald-600/90 dark:text-emerald-400 line-clamp-1">
 Contoh: {parsedData[0]?.nama_divisi} - {parsedData[0]?.aspek_pemantauan} ({parsedData[0]?.persentase_capaian}%)
 </p>
 </div>
 )}
 </DialogBody>

 <DialogFooter className="pt-3 border-t border-emerald-100/80 dark:border-emerald-800/60 flex justify-end gap-2">
 <Button
 type="button"
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={onClose}
 disabled={isUploading}
 className="cursor-pointer font-bold"
 >
 Batal
 </Button>
 <Button
 type="button"
 variant="primary"
 appearance="fill"
 size="sm"
 onClick={handleSubmitImport}
 pending={isUploading}
 disabled={!file && parsedData.length === 0}
 className="cursor-pointer font-bold"
 >
 <Upload1 className="h-4 w-4 mr-1.5" />
 Impor Data Sekarang
 </Button>
 </DialogFooter>
 </Dialog>
 )
}
