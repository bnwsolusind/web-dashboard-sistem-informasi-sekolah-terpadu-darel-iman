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
import AppModal from '../app/AppModal'

export default function TahunAjaranDetailModal({ isOpen, onClose, data }) {
 const isActive = Boolean(data?.is_active)
 const isDeleted = Boolean(data?.deleted_at)

  return (
    <AppModal
      isOpen={Boolean(isOpen && data)}
      onClose={onClose}
      title="Rincian Tahun Ajaran"
      badge="Detail"
      description="Informasi detail periode kalender dan status operasional sistem."
      icon={CalendarDays}
      maxWidth="max-w-2xl"
      bodyClassName="space-y-4 text-xs"
      footer={
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9.5 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Tutup</span>
          </button>
        </div>
      }
    >
      {data && (
        <>
 {/* Hero Card Identitas Periode */}
 <div className="relative overflow-hidden rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-card-dark p-5">
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
 <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-900/60 px-3.5 py-1.5 text-xs font-black text-rose-700 dark:text-rose-300 border-2 border-[#b6f6d9] dark:border-emerald-800/60">
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
 <div className="rounded-xl border-2 border-[#b6f6d9] bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
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

 <div className="rounded-xl border-2 border-[#b6f6d9] bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
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
 <div className="rounded-xl border-2 border-[#b6f6d9] bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-800/30 space-y-1.5">
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
        </>
      )}
    </AppModal>
  )
}
