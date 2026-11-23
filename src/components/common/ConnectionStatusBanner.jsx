import React, { useState, useEffect, useCallback } from 'react'
import { WifiOff, RefreshCw, CheckCircle2, Database, AlertCircle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { resolveApiBaseUrl } from '../../services/api'

/**
 * ConnectionStatusBanner - Banner global HeroUI untuk mendeteksi:
 * 1. Internet klien terputus (Offline / window 'offline' event)
 * 2. Layanan database tidak terjangkau (Database Connection Error)
 * 3. Server backend mati / tidak terjangkau (Network Error)
 */
export default function ConnectionStatusBanner() {
 const [isOffline, setIsOffline] = useState(
 typeof navigator !== 'undefined' ? !navigator.onLine : false
 )
 const [serverIssue, setServerIssue] = useState(null) // null | { type: 'db_error' | 'server_error', message: string }
 const [showRestored, setShowRestored] = useState(false)
 const [isChecking, setIsChecking] = useState(false)
 const [isDismissed, setIsDismissed] = useState(false)

 // Listen event offline & online bawaan browser
 useEffect(() => {
 const handleOnline = () => {
 setIsOffline(false)
 setIsDismissed(false)
 setShowRestored(true)
 setTimeout(() => setShowRestored(false), 3500)
 }

 const handleOffline = () => {
 setIsOffline(true)
 setIsDismissed(false)
 setShowRestored(false)
 }

 window.addEventListener('online', handleOnline)
 window.addEventListener('offline', handleOffline)

 return () => {
 window.removeEventListener('online', handleOnline)
 window.removeEventListener('offline', handleOffline)
 }
 }, [])

 // Listen event server issue yang dipancarkan dari api.js interceptor
 useEffect(() => {
 const handleServerStatus = (e) => {
 const detail = e?.detail
 if (!detail) return

 if (detail.status === 'healthy') {
 if (serverIssue) {
 setServerIssue(null)
 setIsDismissed(false)
 setShowRestored(true)
 setTimeout(() => setShowRestored(false), 3500)
 }
 } else if (detail.status === 'db_error' || detail.status === 'server_error') {
 setServerIssue({
 type: detail.status,
 message: detail.message || 'Terjadi gangguan koneksi pada layanan server.',
 })
 setIsDismissed(false)
 }
 }

 window.addEventListener('app-server-status', handleServerStatus)
 return () => window.removeEventListener('app-server-status', handleServerStatus)
 }, [serverIssue])

 // Coba hubungkan ulang secara manual
 const handleCheckConnection = useCallback(async () => {
 setIsChecking(true)
 try {
 const baseUrl = resolveApiBaseUrl()
 // Coba fetch ringan ke endpoint kesehatan /up atau root API
 const controller = new AbortController()
 const timeoutId = setTimeout(() => controller.abort(), 4000)

 const response = await fetch(`${baseUrl.replace(/\/api\/?$/, '')}/up`, {
 method: 'GET',
 signal: controller.signal,
 }).catch(() => null)

 clearTimeout(timeoutId)

 if (response && (response.ok || response.status === 200)) {
 setIsOffline(false)
 setServerIssue(null)
 setIsDismissed(false)
 setShowRestored(true)
 setTimeout(() => setShowRestored(false), 3500)
 } else if (typeof navigator !== 'undefined' && navigator.onLine) {
 // Jika internet online tapi response gagal, tandai server issue
 setServerIssue({
 type: 'server_error',
 message: 'Server backend belum merespons. Pastikan service Laravel sedang aktif.',
 })
 }
 } catch {
 // Masih gagal
 } finally {
 setIsChecking(false)
 }
 }, [])

 const activeIssue = isOffline
 ? {
 type: 'offline',
 title: 'Koneksi Internet Terputus',
 message: 'Perangkat Anda sedang offline. Mohon periksa sambungan Wi-Fi atau paket data internet Anda.',
 icon: WifiOff,
 gradient: 'from-rose-600 via-rose-700 to-red-800',
 badge: 'Offline',
 }
 : serverIssue?.type === 'db_error'
 ? {
 type: 'db_error',
 title: 'Layanan Basis Data Terganggu',
 message: serverIssue.message || 'Layanan database tidak dapat terhubung. Hubungi administrator sistem.',
 icon: Database,
 gradient: 'from-amber-600 via-orange-600 to-amber-700',
 badge: 'Database Down',
 }
 : serverIssue?.type === 'server_error'
 ? {
 type: 'server_error',
 title: 'Server Backend Tidak Terjangkau',
 message: serverIssue.message || 'Tidak dapat terhubung ke server backend aplikasi.',
 icon: AlertCircle,
 gradient: 'from-rose-700 via-red-700 to-rose-800',
 badge: 'Server Unreachable',
 }
 : null

 return (
 <div className="pointer-events-none fixed top-0 inset-x-0 z-[9999] flex flex-col items-center px-3 pt-2">
 <AnimatePresence>
 {activeIssue && !isDismissed && (
 <motion.div
 key="connection-issue-banner"
 initial={{ opacity: 0, y: -24, scale: 0.96 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -20, scale: 0.96 }}
 transition={{ duration: 0.25, ease: 'easeOut' }}
 role="alert"
 aria-live="assertive"
 className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-xl border-2 border-emerald-200/20 bg-slate-950/90 text-white shadow-2xl backdrop-blur-md"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5">
 <div className="flex items-start sm:items-center gap-3 min-w-0">
 <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] ${activeIssue.gradient} shadow-md`}>
 <activeIssue.icon className="size-5 animate-pulse" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2 flex-wrap">
 <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
 {activeIssue.title}
 </h4>
 <span className="inline-flex items-center rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
 {activeIssue.badge}
 </span>
 </div>
 <p className="mt-0.5 text-xs sm:text-xs text-slate-200/90 font-medium leading-relaxed">
 {activeIssue.message}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
 <button
 type="button"
 onClick={handleCheckConnection}
 disabled={isChecking}
 className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold shadow-xs backdrop-blur-sm transition-all hover:bg-white/25 active:scale-95 disabled:opacity-60 cursor-pointer"
 >
 <RefreshCw className={`size-3.5 ${isChecking ? 'animate-spin' : ''}`} />
 <span>{isChecking ? 'Memeriksa...' : 'Coba Hubungkan Ulang'}</span>
 </button>
 <button
 type="button"
 onClick={() => setIsDismissed(true)}
 aria-label="Tutup sementara"
 className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
 >
 <X className="size-4" />
 </button>
 </div>
 </div>
 </motion.div>
 )}

 {showRestored && (
 <motion.div
 key="connection-restored-banner"
 initial={{ opacity: 0, y: -20, scale: 0.96 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -16, scale: 0.96 }}
 transition={{ duration: 0.25, ease: 'easeOut' }}
 role="status"
 className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-emerald-200/40 bg-emerald-950/95 px-4 py-2 text-xs font-bold text-emerald-100 shadow-2xl backdrop-blur-md"
 >
 <div className="flex size-6 items-center justify-center rounded-lg bg-emerald-500 shadow-xs">
 <CheckCircle2 className="size-4" />
 </div>
 <span>Koneksi kembali terhubung normal.</span>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}

