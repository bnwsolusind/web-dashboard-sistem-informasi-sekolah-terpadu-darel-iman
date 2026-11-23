import { useState, useEffect, useCallback } from 'react'
import { FiMonitor, FiSmartphone, FiGlobe, FiLogOut, FiShield, FiCheckCircle, FiClock, FiRefreshCw } from 'react-icons/fi'
import { useAuthStore } from '../../stores/authStore'
import { userSecurityService } from '../../services/userSecurityService'
import { useToast } from '../app/ToastProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'

export default function SessionLoginCard() {
 const [sessions, setSessions] = useState([])
 const [loading, setLoading] = useState(true)
 const [revoking, setRevoking] = useState(false)
 const toast = useToast()

 const loadSessions = useCallback(async () => {
 try {
 setLoading(true)
 const data = await userSecurityService.getSessions()
 setSessions(Array.isArray(data) ? data : [])
 } catch (_err) {
 toast?.error?.('Gagal memuat daftar sesi login.')
 } finally {
 setLoading(false)
 }
 }, [toast])

 useEffect(() => {
 loadSessions()
 }, [loadSessions])

 const handleLogoutSession = async (id) => {
 try {
 await userSecurityService.deleteSession(id)
 setSessions((prev) => prev.filter((s) => s.id !== id))
 toast?.success?.('Sesi perangkat berhasil diakhiri.')
 } catch (_err) {
 toast?.error?.('Gagal mengakhiri sesi perangkat.')
 }
 }

 const handleRevokeOthers = async () => {
 try {
 setRevoking(true)
 await userSecurityService.revokeOtherSessions()
 await loadSessions()
 toast?.success?.('Semua sesi perangkat lain berhasil diakhiri.')
 } catch (_err) {
 toast?.error?.('Gagal mengakhiri sesi lainnya.')
 } finally {
 setRevoking(false)
 }
 }

 return (
 <Card className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 lg:p-8 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <FiShield className="text-emerald-700 dark:text-emerald-400" />
 <span>Perangkat yang Sedang Login</span>
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
 Kelola perangkat dan sesi browser yang saat ini terhubung dengan akun Anda secara real-time.
 </p>
 </div>
 <div className="flex items-center gap-2">
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={loadSessions}
 disabled={loading}
 className="inline-flex items-center gap-1.5"
 >
 <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
 <span>Segarkan</span>
 </Button>
 {sessions.filter((s) => !s.is_current).length > 0 && (
 <Button
 type="button"
 variant="danger"
 appearance="outline"
 size="sm"
 onClick={handleRevokeOthers}
 disabled={revoking}
 className="inline-flex items-center gap-1.5"
 >
 <FiLogOut className="w-3.5 h-3.5" />
 <span>{revoking ? 'Memproses...' : 'Logout Semua Sesi Lain'}</span>
 </Button>
 )}
 </div>
 </div>

 {/* Session Rules Banner */}
 <Alert status="info" className="rounded-xl">
 <AlertIndicator>
 <FiClock className="w-5 h-5" />
 </AlertIndicator>
 <AlertContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <AlertTitle>Keamanan Sesi Browser & Batas Waktu Inaktivitas</AlertTitle>
 <AlertDescription>
 • <strong>Batas Waktu Inaktif:</strong> Sesi otomatis logout jika tidak ada aktivitas selama 15 menit.<br />
 • <strong>Isolasi Browser:</strong> Membuka URL di browser lain atau jendela pribadi mengharuskan login kembali.
 </AlertDescription>
 </div>
 <Badge color="emerald" size="sm" className="whitespace-nowrap shrink-0 self-start sm:self-auto">
 Sesi Browser Terisolasi
 </Badge>
 </AlertContent>
 </Alert>

 {/* Table */}
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <table className="w-full text-left border-collapse min-w-[700px]">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-emerald-200/80 dark:border-emerald-800/60">
 <th className="py-3 px-4">Perangkat</th>
 <th className="py-3 px-4">Browser</th>
 <th className="py-3 px-4">Lokasi</th>
 <th className="py-3 px-4">IP Address</th>
 <th className="py-3 px-4">Waktu Login</th>
 <th className="py-3 px-4 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 font-medium">
 {loading ? (
 <tr>
 <td colSpan={6} className="py-8 text-center text-slate-400">
 <div className="flex items-center justify-center gap-2">
 <FiRefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
 <span>Memuat sesi aktif...</span>
 </div>
 </td>
 </tr>
 ) : sessions.length === 0 ? (
 <tr>
 <td colSpan={6} className="py-8 text-center text-slate-400">
 Tidak ada sesi aktif ditemukan.
 </td>
 </tr>
 ) : (
 sessions.map((session) => {
 const isMobile = session.device_type === 'mobile' || /phone|android|ios/i.test(session.device || '')
 const IconComp = isMobile ? FiSmartphone : FiMonitor
 return (
 <tr key={session.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <td className="py-3.5 px-4">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
 <IconComp className="w-4 h-4" />
 </div>
 <div>
 <span className="font-bold text-slate-800 dark:text-slate-100 block">
 {session.device}
 </span>
 {session.is_current && (
 <Badge color="emerald" size="sm" className="text-[10px] py-0">
 (Perangkat Ini)
 </Badge>
 )}
 </div>
 </div>
 </td>

 <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{session.browser || 'Web Browser'}</td>

 <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
 <span className="flex items-center gap-1">
 <FiGlobe className="text-slate-400 w-3 h-3" />
 {session.location || 'Indonesia'}
 </span>
 </td>

 <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{session.ip}</td>

 <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
 {session.login_time}
 </td>

 <td className="py-3.5 px-4 text-center">
 {session.is_current ? (
 <Badge color="success" size="sm" prefixIcon={FiCheckCircle}>
 Aktif
 </Badge>
 ) : (
 <Button
 type="button"
 variant="danger"
 appearance="outline"
 size="xs"
 onClick={() => handleLogoutSession(session.id)}
 className="inline-flex items-center gap-1"
 >
 <FiLogOut className="w-3 h-3" />
 <span>Logout</span>
 </Button>
 )}
 </td>
 </tr>
 )
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Warning Footer */}
 <Alert status="warning" className="rounded-xl">
 <AlertIndicator>
 <FiShield className="w-4 h-4" />
 </AlertIndicator>
 <AlertContent>
 <AlertDescription>
 Jika Anda melihat aktivitas yang tidak dikenal, segera logout dari perangkat tersebut dan ubah password akun Anda.
 </AlertDescription>
 </AlertContent>
 </Alert>
 </Card>
 )
}
