import React from 'react'
import { Briefcase, Pencil, Sparkles, Tag, UserPen, Users, X } from 'lucide-react'
import { AppButton, IconButton } from "../app"
import AppModal from '../app/AppModal'

export default function JabatanDetailModal({ isOpen, onClose, jabatan = null, onEdit }) {
 if (!isOpen || !jabatan) return null

 const badgeWarna = jabatan.warna || '#3B82F6'

  return (
    <AppModal
      isOpen={Boolean(isOpen && jabatan)}
      onClose={onClose}
      title={jabatan ? `${jabatan.nama_jabatan || jabatan.name} (${jabatan.kode_jabatan || jabatan.code})` : 'Detail Jabatan'}
      badge="Detail"
      description="Detail atribut master jabatan & riwayat audit trail."
      icon={Briefcase}
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
              <span>Edit Jabatan</span>
            </button>
          )}
        </>
      }
    >
      {jabatan && (
        <>
 {/* Status Bar */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/60 p-4 rounded-xl border-2 border-[#b6f6d9] dark:bg-slate-900/40 dark:border-emerald-800/60">
 <div>
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Status</span>
 <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-extrabold ${
 jabatan.status === 'Aktif' || jabatan.is_active
 ? 'bg-emerald-100 text-emerald-800 border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'bg-slate-200 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {jabatan.status || (jabatan.is_active ? 'Aktif' : 'Nonaktif')}
 </span>
 </div>

 <div>
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Level Hirarki</span>
 <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-1">
 Level {jabatan.level_jabatan}: {jabatan.level_label}
 </span>
 </div>

 <div>
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bagan Struktur</span>
 <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
 {jabatan.tampil_struktur ? 'Ditampilkan' : 'Disembunyikan'}
 </span>
 </div>

 <div>
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Login Sistem</span>
 <span className={`text-xs font-extrabold block mt-1 ${
 jabatan.boleh_login ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
 }`}>
 {jabatan.boleh_login ? 'Diizinkan Login' : 'Hanya Struktural'}
 </span>
 </div>
 </div>

 {/* Detailed Info Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
 <Tag className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
 <span>Atribut Jabatan</span>
 </h4>

 <div className="bg-white rounded-xl p-4 border-2 border-[#b6f6d9] space-y-2 text-xs dark:bg-slate-900/40 dark:border-emerald-800/60">
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Satuan Kerja:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">{jabatan.satuan_kerja || '-'}</span>
 </div>
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Cakupan Akses:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">{jabatan.scope_akses_label || '-'}</span>
 </div>
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Unit Sekolah:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {jabatan.unit_sekolah ? `${jabatan.unit_sekolah.nama} (${jabatan.unit_sekolah.kode})` : 'Seluruh Unit / Yayasan'}
 </span>
 </div>
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Atasan Langsung:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {jabatan.atasan_pegawai?.nama_pegawai || (jabatan.atasan_langsung ? jabatan.atasan_langsung.nama_jabatan : 'Pimpinan Tertinggi')}
 </span>
 </div>
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Role Sistem:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {jabatan.role_sistem?.name || 'Default / Manual'}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500 font-medium">Urutan Tampilan:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 Ke-{jabatan.urutan ?? 0}
 </span>
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
 <Users className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
 <span>Statistik Pemakaian</span>
 </h4>

 <div className="bg-white rounded-xl p-4 border-2 border-[#b6f6d9] space-y-2 text-xs dark:bg-slate-900/40 dark:border-emerald-800/60">
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Total Pegawai Menjabat:</span>
 <span className="font-extrabold text-[#059669] dark:text-[#10B981]">
 {jabatan.jumlah_pegawai ?? 0} Orang
 </span>
 </div>
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Pilihan Ikon:</span>
 <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
 {jabatan.ikon || 'UserCheck'}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500 font-medium">Kode Warna Hex:</span>
 <span className="font-bold font-mono text-slate-800 dark:text-slate-200 flex items-center">
 <span className="w-3 h-3 rounded-full mr-1.5 shadow-2xs" style={{ backgroundColor: badgeWarna }} />
 {badgeWarna}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Deskripsi */}
 <div className="space-y-1.5">
 <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
 Deskripsi & Job Description
 </h4>
 <div className="p-4 bg-slate-50/60 rounded-xl border-2 border-[#b6f6d9] text-xs text-slate-700 dark:bg-slate-900/40 dark:border-emerald-800/60 dark:text-slate-300 leading-relaxed font-semibold">
 {jabatan.deskripsi || jabatan.description || 'Tidak ada deskripsi rinci yang dimasukkan.'}
 </div>
 </div>

 {/* Audit Trail Section */}
 <div className="border-t border-emerald-100/80 dark:border-emerald-800/60 pt-3 space-y-2">
 <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
 <UserPen className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
 <span>Audit Trail (Riwayat Pembuatan)</span>
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/60 p-4 rounded-xl border-2 border-[#b6f6d9] dark:bg-slate-900/40 dark:border-emerald-800/60">
 <div>
 <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Dibuat Pada:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {jabatan.created_at ? new Date(jabatan.created_at).toLocaleString('id-ID') : '-'}
 </span>
 {jabatan.created_by?.name && (
 <span className="block text-xs text-slate-500 font-semibold mt-0.5">Oleh: {jabatan.created_by.name}</span>
 )}
 </div>
 <div>
 <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Terakhir Diperbarui:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {jabatan.updated_at ? new Date(jabatan.updated_at).toLocaleString('id-ID') : '-'}
 </span>
 {jabatan.updated_by?.name && (
 <span className="block text-xs text-slate-500 font-semibold mt-0.5">Oleh: {jabatan.updated_by.name}</span>
 )}
 </div>
 </div>
 </div>
        </>
      )}
    </AppModal>
  )
}
