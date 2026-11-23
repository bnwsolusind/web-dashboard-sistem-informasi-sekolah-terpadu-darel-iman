import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const ToastContext = createContext(null)

const ICONS = {
 success: {
 Icon: CheckCircle2,
 gradient: 'from-emerald-500 via-teal-400 to-emerald-600',
 iconBg: 'bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm',
 border: 'border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:border-emerald-800/60 dark:shadow-black/50',
 badge: 'bg-emerald-50 text-[#059669] border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
 label: 'Sukses',
 },
 error: {
 Icon: XCircle,
 gradient: 'from-rose-500 via-rose-600 to-red-700',
 iconBg: 'bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-sm',
 border: 'border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:border-emerald-800/60 dark:shadow-black/50',
 badge: 'bg-rose-50 text-rose-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-emerald-800/60',
 label: 'Gagal',
 },
 warning: {
 Icon: AlertTriangle,
 gradient: 'from-amber-400 via-amber-500 to-orange-600',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sm',
 border: 'border-emerald-200/80 dark:border-emerald-800/60 shadow-sm dark:border-emerald-800/60 dark:shadow-black/50',
 badge: 'bg-amber-50 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60',
 label: 'Perhatian',
 },
 info: {
 Icon: Info,
 gradient: 'from-sky-400 via-blue-500 to-indigo-600',
 iconBg: 'bg-white dark:bg-[#1B2433] shadow-sky-500/30',
 border: 'border-emerald-200/80 dark:border-emerald-800/60 shadow-sky-950/15 dark:border-emerald-800/60 dark:shadow-black/50',
 badge: 'bg-sky-50 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-800/60',
 label: 'Info',
 },
}

const ToastItem = ({ toast, onClose }) => {
 const meta = ICONS[toast.type] || ICONS.info
 const IconComp = meta.Icon
 return (
 <div
 role={toast.type === 'error' ? 'alert' : 'status'}
 aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
 className={cn(
 'relative pointer-events-auto flex flex-col overflow-hidden rounded-lg border-2 bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-3.5 shadow-2xl transition-all duration-300 animate-[masterDropdownSlide_0.25s_ease-out]',
 meta.border
 )}
 >
 <div className="flex items-start gap-3 mt-0.5">
 <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm', meta.iconBg)}>
 <IconComp className="size-5" strokeWidth={2.3} />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">{toast.title}</h4>
 <span className={cn('inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-bold border', meta.badge)}>
 {meta.label}
 </span>
 </div>
 {Boolean(toast.description) && (
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
 {typeof toast.description === 'string'
 ? toast.description
 : (toast.description?.description || toast.description?.message || '')}
 </p>
 )}
 {Boolean(toast.action) && (
 <button
 type="button"
 onClick={() => {
 if (typeof toast.action.onClick === 'function') toast.action.onClick()
 onClose()
 }}
 className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors cursor-pointer"
 >
 {toast.action.label || 'Coba Lagi'}
 </button>
 )}
 </div>
 <button
 type="button"
 onClick={onClose}
 aria-label="Tutup notifikasi"
 className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:text-slate-200 transition-colors cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.2} />
 </button>
 </div>
 </div>
 )
}

/**
 * ToastProvider - canonical global toast notification.
 *
 * Pakai lewat hook useToast():
 * const toast = useToast()
 * toast.success('Data berhasil ditambahkan.')
 * toast.error('Gagal menyimpan data.')
 * toast.warning('Perhatikan validasi input.')
 * toast.info('Export sedang diproses.')
 *
 * Semua feedback sukses/gagal di aplikasi wajib lewat provider ini
 * (bukan toast per halaman).
 */
export function ToastProvider({ children }) {
 const [toasts, setToasts] = useState([])
 const idRef = useRef(0)

 const dismiss = useCallback((id) => {
 setToasts((prev) => prev.filter((t) => t.id !== id))
 }, [])

 const sanitizeDesc = (val) => {
 if (typeof val === 'string') return val
 if (typeof val === 'number') return String(val)
 if (typeof val === 'object' && val !== null) {
 return typeof val.description === 'string' ? val.description : (typeof val.message === 'string' ? val.message : '')
 }
 return ''
 }

 const toast = useCallback((arg1, arg2, arg3) => {
 let title = ''
 let description = ''
 let type = 'info'
 let duration = 4000
 let action = null

 if (typeof arg1 === 'object' && arg1 !== null) {
 title = arg1.title || arg1.message || 'Notifikasi'
 description = sanitizeDesc(arg1.description || (arg1.title && arg1.message !== arg1.title ? arg1.message : ''))
 type = arg1.type || arg1.tone || 'info'
 duration = arg1.duration ?? (type === 'error' ? 6000 : 4000)
 action = arg1.action || null
 } else if (typeof arg1 === 'string') {
 const knownTypes = ['success', 'error', 'warning', 'info', 'danger']
 if (knownTypes.includes(arg1.toLowerCase()) && typeof arg2 === 'string') {
 type = arg1.toLowerCase() === 'danger' ? 'error' : arg1.toLowerCase()
 title = arg2
 description = sanitizeDesc(arg3)
 } else {
 title = arg1
 if (typeof arg2 === 'string') {
 if (knownTypes.includes(arg2.toLowerCase())) {
 type = arg2.toLowerCase() === 'danger' ? 'error' : arg2.toLowerCase()
 description = sanitizeDesc(arg3)
 } else {
 description = sanitizeDesc(arg2)
 if (typeof arg3 === 'string') {
 type = arg3.toLowerCase() === 'danger' ? 'error' : arg3.toLowerCase()
 }
 }
 } else if (typeof arg2 === 'object' && arg2 !== null) {
 description = sanitizeDesc(arg2)
 if (arg2.type || arg2.tone) type = arg2.type || arg2.tone
 }
 }
 }

 if (type === 'danger') type = 'error'
 if (!['success', 'error', 'warning', 'info'].includes(type)) type = 'info'
 if (type === 'error' && duration === 4000) duration = 6000

 const id = ++idRef.current
 setToasts((prev) => [...prev, { id, title, description, type, action }])
 if (duration > 0) {
 setTimeout(() => dismiss(id), duration)
 }
 return id
 }, [dismiss])

 const push = useCallback((arg1, arg2, arg3) => {
 return toast(arg1, arg2, arg3)
 }, [toast])

 React.useEffect(() => {
 externalToast = toast
 const handler = (e) => {
 if (e?.detail) {
 toast(e.detail.arg1, e.detail.arg2, e.detail.arg3)
 }
 }
 window.addEventListener('app-toast', handler)
 return () => {
 externalToast = null
 window.removeEventListener('app-toast', handler)
 }
 }, [toast])

 const api = useMemo(() => {
 const fn = (arg1, arg2, arg3) => toast(arg1, arg2, arg3)
 fn.toast = toast
 fn.push = push
 fn.pushToast = push
 fn.show = push
 fn.showToast = push
 fn.success = (title, description) => toast({ title, description: sanitizeDesc(description), type: 'success' })
 fn.error = (title, description) => toast({ title, description: sanitizeDesc(description), type: 'error', duration: 6000 })
 fn.warning = (title, description) => toast({ title, description: sanitizeDesc(description), type: 'warning' })
 fn.info = (title, description) => toast({ title, description: sanitizeDesc(description), type: 'info' })
 fn.loading = (title, description) => toast({ title, description: sanitizeDesc(description), type: 'info' })
 fn.dismiss = dismiss
 return fn
 }, [toast, push, dismiss])

 return (
 <ToastContext.Provider value={api}>
 {children}
 <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2.5" aria-live="polite">
 {toasts.map((t) => (
 <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
 ))}
 </div>
 </ToastContext.Provider>
 )
}

let externalToast = null

export function showToast(arg1, arg2, arg3) {
 if (externalToast) {
 return externalToast(arg1, arg2, arg3)
 }
 if (typeof window !== 'undefined') {
 window.dispatchEvent(new CustomEvent('app-toast', { detail: { arg1, arg2, arg3 } }))
 }
}

export const globalToast = Object.assign(
 (arg1, arg2, arg3) => showToast(arg1, arg2, arg3),
 {
 success: (title, description) => showToast({ title, description, type: 'success' }),
 error: (title, description) => showToast({ title, description, type: 'error', duration: 6000 }),
 warning: (title, description) => showToast({ title, description, type: 'warning' }),
 info: (title, description) => showToast({ title, description, type: 'info' }),
 loading: (title, description) => {
 const descStr = typeof description === 'string' ? description : (typeof description === 'object' && description !== null ? (description.description || description.message || '') : '')
 return showToast({ title, description: descStr, type: 'info' })
 },
 dismiss: (id) => {
 if (externalToast?.dismiss) externalToast.dismiss(id)
 },
 }
)

export function useToast() {
 const ctx = useContext(ToastContext)
 if (!ctx) {
 throw new Error('useToast harus dipakai di dalam <ToastProvider>.')
 }
 return ctx
}

export default ToastProvider
