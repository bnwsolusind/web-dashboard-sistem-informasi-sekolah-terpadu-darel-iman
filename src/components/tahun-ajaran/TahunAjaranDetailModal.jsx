import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 CalendarDays,
 Calendar,
 FileText,
 X,
 Star,
 Clock,
 ShieldCheck,
 CheckCircle2,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export default function TahunAjaranDetailModal({ isOpen, onClose, data }) {
 const isActive = Boolean(data?.is_active)
 const isDeleted = Boolean(data?.deleted_at)

 return (
 <AnimatePresence>
 {isOpen && Boolean(data) && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 aria-labelledby="detail-tahun-ajaran-title"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget) onClose()
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-xl font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-card-dark dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}

 {/* Modal Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner shrink-0">
 <div className="flex items-center gap-3.5">
 <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 p-3 shadow-md shadow-xs shrink-0">
 <CalendarDays className="size-5" strokeWidth={2.25} />
 </div>
 <div>
 <h3
 id="detail-tahun-ajaran-title"
 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white"
 >
 Rincian Tahun Ajaran
 </h3>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
 Informasi detail periode kalender dan status operasional sistem.
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={onClose}
 aria-label="Tutup rincian tahun ajaran"
 className="size-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Modal Body */}
 <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
 {/* Hero Card Identitas Periode */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-card-dark p-5">
 <div className="flex items-center justify-between gap-3">
 <div>
 <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
 Nama Tahun Ajaran
 </span>
 <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
 {data?.name || '—'}
 </h2>
 </div>

 <div>
 {isDeleted ? (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-900/60 px-3.5 py-1.5 text-xs font-black text-rose-700 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Terhapus
 </span>
 ) : isActive ? (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-xs">
 <Star className="size-3.5 text-amber-300 fill-amber-300" />
 Aktif Utama
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
 Tidak Aktif
 </span>
 )}
 </div>
 </div>
 </div>

 {/* 2-Column Calendar Dates */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <div className="flex items-center gap-2 mb-1.5 text-slate-500 dark:text-slate-400">
 <Calendar className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 <span className="text-xs font-bold uppercase tracking-wider">
 Tanggal Mulai
 </span>
 </div>
 <p className="text-base font-black text-slate-900 dark:text-white tabular-nums">
 {data.start_date || '—'}
 </p>
 </div>

 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <div className="flex items-center gap-2 mb-1.5 text-slate-500 dark:text-slate-400">
 <Calendar className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 <span className="text-xs font-bold uppercase tracking-wider">
 Tanggal Selesai
 </span>
 </div>
 <p className="text-base font-black text-slate-900 dark:text-white tabular-nums">
 {data.end_date || '—'}
 </p>
 </div>
 </div>

 {/* Description Card */}
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-800/30 space-y-1.5">
 <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
 <FileText className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 <span className="text-xs font-bold uppercase tracking-wider">
 Catatan & Keterangan
 </span>
 </div>
 <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
 {data.keterangan || data.metadata?.keterangan || 'Tidak ada catatan khusus untuk periode ini.'}
 </p>
 </div>

 {/* Audit Metadata */}
 <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-100/80 dark:border-emerald-800/60 text-xs text-slate-400">
 <div className="flex items-center gap-1.5">
 <Clock className="size-3 text-slate-400" />
 <span>Dibuat: <b className="text-slate-600 dark:text-slate-300 font-semibold">{data.created_at || '—'}</b></span>
 </div>
 <div className="flex items-center gap-1.5">
 <CheckCircle2 className="size-3 text-slate-400" />
 <span>Diperbarui: <b className="text-slate-600 dark:text-slate-300 font-semibold">{data.updated_at || '—'}</b></span>
 </div>
 </div>
 </div>

 {/* Modal Footer */}
 <div className="flex items-center justify-end border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-[#182232] shrink-0">
 <button
 type="button"
 onClick={onClose}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 border border-emerald-200/80 px-5 py-2.5 text-xs font-extrabold text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 active:scale-95 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
 >
 <X className="size-3.5" strokeWidth={2.2} />
 <span>Tutup</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 )
}
