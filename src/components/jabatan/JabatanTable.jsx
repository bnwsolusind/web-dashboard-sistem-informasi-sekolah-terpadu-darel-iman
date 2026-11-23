import React from 'react'
import {
 RotateCcw as FaRedo,
 Network as FaSitemap,
 LockOpen as FaLockOpen,
 Lock as FaLock,
} from 'lucide-react'
import ActionDropdown from '../app/ActionDropdown'
import AppBadge from '../app/AppBadge'

export default function JabatanTable({
  data = [],
  onDetail,
  onEdit,
  onDelete,
  onRestore,
}) {
  return (
    <table className="w-full min-w-190 table-fixed text-left text-sm text-slate-600 dark:text-slate-300" aria-label="Daftar jabatan">
      <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
        <tr className="border-b border-emerald-200/80 dark:border-emerald-800/60 text-xs font-black uppercase tracking-wider">
          <th className="w-[30%] px-3 py-3.5">IDENTITAS JABATAN & KODE</th>
          <th className="w-[24%] px-3 py-3.5">UNIT & LEVEL JABATAN</th>
          <th className="w-[22%] px-3 py-3.5">ATASAN & HAK AKSES</th>
          <th className="w-[12%] px-3 py-3.5 text-center">STATUS</th>
          <th className="w-[12%] px-2 py-3.5 text-right select-none"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
        {data.map((item, index) => {
          const isTrashed = item.terhapus
          return (
            <tr
              key={item.id}
              className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
            >
              {/* Kode & Nama Jabatan */}
              <td className="px-3 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <FaSitemap className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2 font-bold text-slate-800">
                      <span className="truncate text-xs dark:text-white">{item.nama_jabatan || item.name}</span>
                      {isTrashed && <AppBadge variant="danger">Terhapus</AppBadge>}
                    </div>
                    <span className="block truncate font-mono text-[9px] text-slate-500">
                      {item.kode_jabatan || item.code}
                    </span>
                    <span className="mt-0.5 block text-[9px] font-bold text-emerald-700 dark:text-emerald-400">{item.jumlah_pegawai ?? 0} pegawai</span>
                  </div>
                </div>
              </td>

              {/* Level & Unit Sekolah */}
              <td className="px-3 py-3.5">
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80">
                    Level {item.level_jabatan}: {item.level_label}
                  </span>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{item.satuan_kerja || 'Belum ditentukan'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.unit_sekolah ? (
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.unit_sekolah.nama} ({item.unit_sekolah.kode})
                      </span>
                    ) : (
                      <span className="italic text-slate-400">{item.scope_akses_label || 'Cakupan belum ditentukan'}</span>
                    )}
                  </p>
                </div>
              </td>

              {/* Atasan Langsung & Akses */}
              <td className="px-3 py-3.5 text-xs">
                <div className="space-y-1">
                  {item.atasan_langsung ? (
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {item.atasan_langsung.nama_jabatan}
                      <span className="block text-[10px] text-slate-500 font-mono">
                        ({item.atasan_langsung.kode_jabatan})
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Pimpinan Tertinggi</span>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    {item.bisa_login ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <FaLockOpen className="h-3 w-3 text-emerald-600" /> Login Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                        <FaLock className="h-3 w-3 text-slate-300" /> Non-login
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-3 py-3.5 text-center">
                {isTrashed ? (
                  <AppBadge variant="danger" dot>Terhapus</AppBadge>
                ) : (
                  <AppBadge variant={item.status ? 'success' : 'neutral'} dot>
                    {item.status ? 'Aktif' : 'Non-aktif'}
                  </AppBadge>
                )}
              </td>

              {/* Aksi */}
              <td className="px-2 py-3.5 text-right">
                <div className="flex justify-end">
                  {isTrashed ? (
                    <button
                      type="button"
                      onClick={() => onRestore && onRestore(item)}
                      className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors cursor-pointer"
                      title="Pulihkan Data"
                    >
                      <FaRedo className="h-4 w-4" />
                    </button>
                  ) : (
                    <ActionDropdown
                      item={item}
                      onDetail={onDetail}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  )}
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
