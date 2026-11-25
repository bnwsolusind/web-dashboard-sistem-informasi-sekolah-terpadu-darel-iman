import React from 'react'
import { CalendarDays, Pencil, School, Sparkles, UserRound, X } from 'lucide-react'
import { renderJenisUnitIcon } from './JenisUnitTable'
import AppModal from '../app/AppModal'

export default function JenisUnitDetailModal({ isOpen, onClose, data, onEdit }) {
 if (!isOpen || !data) return null

 const badgeColor = data.warna_badge || '#10B981'

  return (
    <AppModal
      isOpen={Boolean(isOpen && data)}
      onClose={onClose}
      title="Detail Jenis Unit Pendidikan"
      badge="Read-Only"
      description="Informasi lengkap jenis unit pendidikan terpadu."
      icon={School}
      maxWidth="max-w-2xl"
      bodyClassName="space-y-4 text-xs text-slate-700 dark:text-slate-200"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Tutup</span>
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
            >
              <Pencil className="size-4" />
              <span>Edit Data</span>
            </button>
          )}
        </>
      }
    >
      {data && (
        <>
 {/* Main Info Card */}
 <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 flex items-center justify-between gap-4">
 <div className="flex items-center gap-3.5">
 <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border-2 border-[#b6f6d9] dark:border-emerald-800/60 text-[#059669] dark:text-[#10B981] shrink-0">
 {renderJenisUnitIcon(data.icon, 'w-7 h-7')}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-[#059669] text-white uppercase tracking-wider">
 {data.kode_jenis}
 </span>
 <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-emerald-200 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200 uppercase tracking-wider">
 {data.jenjang}
 </span>
 </div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">{data.nama_jenis}</h3>
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Singkatan: {data.singkatan || '-'}</p>
 </div>
 </div>

 <div className="text-right shrink-0">
 <span
 className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
 data.status
 ? 'bg-emerald-100 text-emerald-800 border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'bg-slate-100 text-slate-600 border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-700/80'
 }`}
 >
 {data.status ? '• Aktif' : '• Nonaktif'}
 </span>
 </div>
 </div>

 {/* Details Table Grid */}
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/40 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60">
 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Urutan Tampilan</p>
 <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{data.urutan}</p>
 </div>

 <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/40 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60">
 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Warna Badge</p>
 <div className="flex items-center gap-2 mt-1">
 <span
 className="w-4 h-4 rounded-full border-2 border-[#b6f6d9] dark:border-emerald-800/60 shadow-2xs"
 style={{ backgroundColor: badgeColor }}
 ></span>
 <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase">
 {badgeColor}
 </span>
 </div>
 </div>
 </div>

 {/* Keterangan */}
 <div className="p-4 bg-slate-50/80 dark:bg-slate-900/40 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60">
 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Keterangan / Deskripsi</p>
 <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
 {data.keterangan || 'Tidak ada keterangan tambahan.'}
 </p>
 </div>

 {/* Audit Trail Info */}
 <div className="pt-3 border-t border-emerald-100/80 dark:border-emerald-800/60 text-xs text-slate-500 space-y-1.5">
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1.5 font-medium text-slate-400">
 <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
 Tanggal Dibuat:
 </span>
 <span className="font-bold text-slate-700 dark:text-slate-300">{data.created_at || '-'}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1.5 font-medium text-slate-400">
 <UserRound className="h-3.5 w-3.5 text-slate-400" />
 Dibuat Oleh:
 </span>
 <span className="font-bold text-slate-700 dark:text-slate-300">{data.created_by_name || 'Sistem'}</span>
 </div>
 {data.updated_at && (
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1.5 font-medium text-slate-400">
 <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
 Terakhir Diubah:
 </span>
 <span className="font-bold text-slate-700 dark:text-slate-300">{data.updated_at}</span>
 </div>
 )}
 </div>
        </>
      )}
    </AppModal>
  )
}
