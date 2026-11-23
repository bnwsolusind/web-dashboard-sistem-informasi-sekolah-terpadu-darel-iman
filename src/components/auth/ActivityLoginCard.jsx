import { useState, useEffect, useCallback } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { FiDownload, FiCheckCircle, FiXCircle, FiCalendar, FiRefreshCw } from 'react-icons/fi'
import { userSecurityService } from '../../services/userSecurityService'
import { useToast } from '../app/ToastProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default function ActivityLoginCard() {
 const [statusFilter, setStatusFilter] = useState('semua')
 const [deviceFilter, setDeviceFilter] = useState('semua')
 const [currentPage, setCurrentPage] = useState(1)
 const [logs, setLogs] = useState([])
 const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
 const [loading, setLoading] = useState(true)
 const [exporting, setExporting] = useState(false)
 const toast = useToast()

 const loadActivities = useCallback(async () => {
 try {
 setLoading(true)
 const res = await userSecurityService.getActivities({
 status: statusFilter,
 device: deviceFilter,
 page: currentPage,
 per_page: 10,
 })
 setLogs(Array.isArray(res?.data) ? res.data : [])
 if (res?.meta) {
 setMeta(res.meta)
 }
 } catch (_err) {
 toast?.error?.('Gagal memuat log aktivitas login.')
 } finally {
 setLoading(false)
 }
 }, [statusFilter, deviceFilter, currentPage, toast])

 useEffect(() => {
 loadActivities()
 }, [loadActivities])

 const handleExport = async () => {
 try {
 setExporting(true)
 await userSecurityService.exportActivities()
 toast?.success?.('Riwayat aktivitas login berhasil diunduh (CSV).')
 } catch (_err) {
 toast?.error?.('Gagal mengunduh berkas riwayat login.')
 } finally {
 setExporting(false)
 }
 }

 return (
 <Card className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 lg:p-8 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-6">
 {/* Header & Export Button */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
 Riwayat Aktivitas Login
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Pantau aktivitas login ke akun Anda yang tercatat secara otomatis di sistem database.
 </p>
 </div>

 <div className="flex items-center gap-2 self-start sm:self-auto">
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={loadActivities}
 disabled={loading}
 className="inline-flex items-center gap-1.5"
 >
 <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
 <span>Segarkan</span>
 </Button>

 <Button
 type="button"
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={handleExport}
 disabled={exporting || logs.length === 0}
 className="inline-flex items-center gap-2"
 >
 <FiDownload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
 <span>{exporting ? 'Mengunduh...' : 'Export Log (CSV)'}</span>
 </Button>
 </div>
 </div>

 {/* Filters Bar */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 {/* Status Filter */}
 <div className="relative">
 <CustomSelect
 value={statusFilter}
 onChange={(e) => {
 setStatusFilter(e.target.value)
 setCurrentPage(1)
 }}
 className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-medium rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
 >
 <option value="semua">Semua Status (Berhasil & Gagal)</option>
 <option value="berhasil">Status: Berhasil Login</option>
 <option value="gagal">Status: Gagal Login</option>
 </CustomSelect>
 </div>

 {/* Device Filter */}
 <div className="relative">
 <CustomSelect
 value={deviceFilter}
 onChange={(e) => {
 setDeviceFilter(e.target.value)
 setCurrentPage(1)
 }}
 className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-medium rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
 >
 <option value="semua">Semua Tipe Perangkat</option>
 <option value="windows">Komputer Windows</option>
 <option value="mac">Apple / Mac</option>
 <option value="mobile">Smartphone / Mobile</option>
 </CustomSelect>
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <table className="w-full text-left border-collapse min-w-[700px]">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-emerald-200/80 dark:border-emerald-800/60">
 <th className="py-3 px-4">Waktu</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4">Perangkat</th>
 <th className="py-3 px-4">Browser</th>
 <th className="py-3 px-4">Lokasi</th>
 <th className="py-3 px-4">IP Address</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 font-medium">
 {loading ? (
 <tr>
 <td colSpan={6} className="py-8 text-center text-slate-400">
 <div className="flex items-center justify-center gap-2">
 <FiRefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
 <span>Memuat log aktivitas login...</span>
 </div>
 </td>
 </tr>
 ) : logs.length === 0 ? (
 <tr>
 <td colSpan={6} className="py-8 text-center text-slate-400">
 Belum ada catatan aktivitas login untuk filter ini.
 </td>
 </tr>
 ) : (
 logs.map((log) => {
 const isSuccess = log.status === 'Berhasil'
 return (
 <tr key={log.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <td className="py-3.5 px-4 text-slate-800 dark:text-slate-100 font-semibold whitespace-nowrap">
 {log.time}
 </td>

 <td className="py-3.5 px-4">
 {isSuccess ? (
 <Badge color="success" size="sm" prefixIcon={FiCheckCircle}>
 Berhasil
 </Badge>
 ) : (
 <Badge color="error" size="sm" prefixIcon={FiXCircle}>
 Gagal
 </Badge>
 )}
 </td>

 <td className="py-3.5 px-4 text-slate-800 dark:text-slate-100">{log.device}</td>
 <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{log.browser}</td>
 <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{log.location}</td>
 <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{log.ip}</td>
 </tr>
 )
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {meta.last_page > 1 && (
 <div className="flex items-center justify-center gap-1.5 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
 <button
 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
 disabled={currentPage <= 1}
 className="w-8 h-8 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center disabled:opacity-40"
 >
 &lt;
 </button>
 {Array.from({ length: meta.last_page }, (_, i) => i + 1)
 .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - currentPage) <= 1)
 .map((pageNum, idx, arr) => {
 const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1
 return (
 <div key={pageNum} className="flex items-center gap-1.5">
 {showEllipsis && <span className="px-1 text-slate-400">...</span>}
 <button
 onClick={() => setCurrentPage(pageNum)}
 className={`w-8 h-8 rounded-lg flex items-center justify-center ${
 currentPage === pageNum
 ? 'bg-[#059669] text-white shadow-xs dark:bg-[#10B981] dark:text-slate-900 font-bold'
 : 'border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 {pageNum}
 </button>
 </div>
 )
 })}
 <button
 onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.last_page))}
 disabled={currentPage >= meta.last_page}
 className="w-8 h-8 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center disabled:opacity-40"
 >
 &gt;
 </button>
 </div>
 )}
 </Card>
 )
}
