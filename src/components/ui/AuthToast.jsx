import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, LogOut, AlertTriangle } from 'lucide-react'

/**
 * AuthToast — Komponen toast notification global untuk event autentikasi.
 *
 * Dipicu via custom event:
 * window.dispatchEvent(new CustomEvent('auth-toast', {
 * detail: { type: 'success' | 'error' | 'logout' | 'warning', title: '...', message: '...' }
 * }))
 *
 * Atau via helper:
 * import { showAuthToast } from '@/components/ui/AuthToast'
 * showAuthToast({ type: 'success', title: 'Berhasil Masuk', message: '...' })
 */

let toastQueue = []
let setToastExternal = null

export function showAuthToast({ type = 'success', title = '', message = '' }) {
 if (setToastExternal) {
 setToastExternal({ id: Date.now(), type, title, message })
 } else {
 // fallback: fire via event
 window.dispatchEvent(new CustomEvent('auth-toast', { detail: { type, title, message } }))
 }
}

const ICON_MAP = {
 success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
 error: <XCircle className="h-5 w-5 text-rose-600" />,
 logout: <LogOut className="h-5 w-5 text-slate-600" />,
 warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
}

const STYLE_MAP = {
 success: {
 wrapper: 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:shadow-none',
 bar: 'bg-emerald-500',
 title: 'text-emerald-800 dark:text-emerald-300',
 message: 'text-emerald-700 dark:text-emerald-400',
 },
 error: {
 wrapper: 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:shadow-none',
 bar: 'bg-rose-500',
 title: 'text-rose-800 dark:text-rose-300',
 message: 'text-rose-700 dark:text-rose-400',
 },
 logout: {
 wrapper: 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 shadow-slate-100 dark:shadow-none',
 bar: 'bg-slate-500',
 title: 'text-slate-800 dark:text-slate-200',
 message: 'text-slate-600 dark:text-slate-400',
 },
 warning: {
 wrapper: 'bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:shadow-none',
 bar: 'bg-amber-500',
 title: 'text-amber-800 dark:text-amber-300',
 message: 'text-amber-700 dark:text-amber-400',
 },
}

const AUTO_DISMISS_MS = 4500

export default function AuthToast() {
 const [toasts, setToasts] = useState([])

 const addToast = useCallback((detail) => {
 const toast = { id: Date.now(), ...detail }
 setToasts((prev) => [...prev.slice(-2), toast]) // max 3 toasts
 setTimeout(() => {
 setToasts((prev) => prev.filter((t) => t.id !== toast.id))
 }, AUTO_DISMISS_MS)
 }, [])

 // Register external setter
 useEffect(() => {
 setToastExternal = (detail) => addToast(detail)
 return () => { setToastExternal = null }
 }, [addToast])

 // Listen to custom event
 useEffect(() => {
 const handler = (e) => addToast(e.detail)
 window.addEventListener('auth-toast', handler)
 return () => window.removeEventListener('auth-toast', handler)
 }, [addToast])

 return (
 <div className="fixed bottom-20 right-4 z-[99999] flex flex-col gap-2 sm:bottom-6 sm:right-6 max-w-[calc(100vw-2rem)] sm:max-w-sm pointer-events-none">
 <AnimatePresence initial={false}>
 {toasts.map((toast) => {
 const style = STYLE_MAP[toast.type] || STYLE_MAP.success
 return (
 <motion.div
 key={toast.id}
 initial={{ opacity: 0, x: 80, scale: 0.92 }}
 animate={{ opacity: 1, x: 0, scale: 1 }}
 exit={{ opacity: 0, x: 80, scale: 0.92 }}
 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
 className={`pointer-events-auto relative flex items-start gap-3 rounded-xl border p-4 shadow-lg shadow-slate-900/10 overflow-hidden ${style.wrapper}`}
 >
 {/* Progress bar */}
 <motion.div
 className={`absolute bottom-0 left-0 h-[3px] rounded-b-2xl ${style.bar}`}
 initial={{ width: '100%' }}
 animate={{ width: '0%' }}
 transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
 />

 {/* Icon */}
 <span className="mt-0.5 shrink-0">
 {ICON_MAP[toast.type] || ICON_MAP.success}
 </span>

 {/* Content */}
 <div className="min-w-0 flex-1">
 {toast.title && (
 <p className={`text-sm font-bold leading-tight ${style.title}`}>{toast.title}</p>
 )}
 {toast.message && (
 <p className={`mt-0.5 text-xs leading-relaxed ${style.message}`}>{toast.message}</p>
 )}
 </div>

 {/* Close */}
 <button
 type="button"
 onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
 className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
 aria-label="Tutup notifikasi"
 >
 <XCircle className="h-4 w-4" />
 </button>
 </motion.div>
 )
 })}
 </AnimatePresence>
 </div>
 )
}
