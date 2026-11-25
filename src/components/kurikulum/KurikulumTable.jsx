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
  const getJenisBadgeColor = (jenis, nama = '') => {
    const val = `${jenis || ''} ${nama || ''}`.toLowerCase()
    if (val.includes('pesantren') || val.includes('ponpes') || val.includes('mahad')) {
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/80'
    }
    if (val.includes('merdeka')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
    }
    if (val.includes('nasional') || val.includes('k13')) {
      return 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-700/80'
    }
    if (val.includes('lokal') || val.includes('tahfizh')) {
      return 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-700/80'
    }
    return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700/80'
  }

  const getJenjangBadgeColor = (jenjang, nama = '') => {
    const val = `${jenjang || ''} ${nama || ''}`.toLowerCase()
    if (val.includes('mi')) return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700/80'
    if (val.includes('sd')) return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700/80'
    if (val.includes('smp') || val.includes('mts')) return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700/80'
    if (val.includes('sma') || val.includes('ma') || val.includes('smk')) return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/80'
    if (val.includes('tk') || val.includes('paud') || val.includes('ra')) return 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-700/80'
    if (val.includes('pesantren') || val.includes('ponpes')) return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/80'
    return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
  }

  return (
    <table className="w-full min-w-245 text-left border-collapse" aria-label="Daftar kurikulum">
      <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
        <tr className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-transparent text-emerald-950 dark:text-emerald-200">
          <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider bg-transparent">KURIKULUM &amp; JENJANG</th>
          <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider bg-transparent">JENIS KURIKULUM</th>
          <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider bg-transparent">UNIT &amp; TAHUN AJARAN</th>
          <th className="py-3.5 px-4 text-center font-extrabold text-xs uppercase tracking-wider bg-transparent">STATUS</th>
          <th className="py-3.5 px-4 text-right w-16 sm:w-20 select-none bg-transparent">Aksi</th>
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
                  {item.jenis_kurikulum && String(item.jenis_kurikulum).toUpperCase() !== 'SIT' && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getJenisBadgeColor(
                        item.jenis_kurikulum,
                        item.nama_kurikulum
                      )}`}
                    >
                      <Tag className="w-3 h-3" />
                      {item.jenis_kurikulum}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase border ${getJenjangBadgeColor(item.jenjang, item.nama_kurikulum)}`}>
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
