import React from 'react'
import {
 RotateCcw,
 Calendar,
 Building2,
 Tag,
} from 'lucide-react'
import ActionDropdown from '../app/ActionDropdown'
import AppBadge from '../app/AppBadge'

export default function KurikulumTable({
  data = [],
  page = 1,
  perPage = 15,
  onDetail,
  onEdit,
  onDelete,
  onRestore,
}) {
  const getJenisBadgeColor = (jenis) => {
    switch (jenis) {
      case 'SIT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      case 'Merdeka':
        return 'bg-blue-50 text-blue-700 border-emerald-200/80'
      case 'Nasional':
        return 'bg-indigo-50 text-indigo-700 border-emerald-200/80'
      case 'Pesantren':
        return 'bg-amber-50 text-amber-700 border-emerald-200/80'
      case 'Lokal':
        return 'bg-purple-50 text-purple-700 border-emerald-200/80'
      default:
        return 'bg-slate-50 text-slate-700 border-emerald-200/80'
    }
  }

  return (
    <table className="w-full min-w-245 text-left border-collapse" aria-label="Daftar kurikulum">
      <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
        <tr className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-transparent text-emerald-950 dark:text-emerald-200">
          <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider bg-transparent">KURIKULUM &amp; JENJANG</th>
          <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider bg-transparent">JENIS KURIKULUM</th>
          <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider bg-transparent">UNIT &amp; TAHUN AJARAN</th>
          <th className="py-3.5 px-4 text-center font-extrabold text-xs uppercase tracking-wider bg-transparent">STATUS</th>
          <th className="py-3.5 px-4 text-right w-16 sm:w-20 select-none bg-transparent"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs font-medium">
        {data.map((item) => {
          const isTerhapus = !!item.deleted_at

          return (
            <tr
              key={item.id}
              onClick={onDetail ? () => onDetail(item) : undefined}
              title={onDetail ? 'Klik baris untuk melihat detail kurikulum' : undefined}
              className={`hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors ${
                onDetail ? 'cursor-pointer' : ''
              } ${isTerhapus ? 'bg-rose-50/30 dark:bg-rose-950/20 opacity-75' : ''}`}
            >
              {/* Kurikulum & Jenjang */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-white dark:bg-[#1B2433] font-black text-xs flex items-center justify-center shadow-sm shrink-0 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                    {(item.jenjang || 'SD').slice(0, 3)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                      {item.nama_kurikulum}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {item.kode_kurikulum}
                    </span>
                  </div>
                </div>
              </td>

              {/* Jenis Kurikulum */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getJenisBadgeColor(
                      item.jenis_kurikulum
                    )}`}
                  >
                    <Tag className="w-3 h-3" />
                    {item.jenis_kurikulum}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 uppercase border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80">
                    {item.jenjang}
                  </span>
                </div>
              </td>

              {/* Unit & Tahun Ajaran */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item.unit_pendidikan_nama || '-'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{item.tahun_ajaran_nama || '-'}</span>
                  {item.semester_nama && <span>• {item.semester_nama}</span>}
                </div>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4 text-center">
                <AppBadge variant={isTerhapus ? 'danger' : item.status ? 'success' : 'warning'} dot>
                  {isTerhapus ? 'Terhapus' : item.status ? 'Aktif' : 'Non-Aktif'}
                </AppBadge>
              </td>

              {/* Aksi */}
              <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                {isTerhapus ? (
                  <button
                    type="button"
                    onClick={() => onRestore && onRestore(item)}
                    className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors cursor-pointer"
                    title="Pulihkan Data"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                ) : (
                  <ActionDropdown
                    onView={onDetail ? () => onDetail(item) : undefined}
                    onEdit={onEdit ? () => onEdit(item) : undefined}
                    onDelete={onDelete ? () => onDelete(item) : undefined}
                  />
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
