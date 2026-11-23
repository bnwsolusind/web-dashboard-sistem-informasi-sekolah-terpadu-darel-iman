import React from 'react'
import {
 Baby,
 BookOpen,
 Building2,
 GraduationCap,
 House,
 Landmark,
 RotateCcw,
 School,
 University,
} from 'lucide-react'
import ActionDropdown from '../app/ActionDropdown'
import AppBadge from '../app/AppBadge'

const ICON_MAP = {
 Building: Building2,
 School,
 Book: BookOpen,
 Mosque: Landmark,
 Graduation: GraduationCap,
 University,
 Children: Baby,
 Home: House,
}

// eslint-disable-next-line react/only-export-components -- helper ikon dipakai bersama modal terkait.
export function renderJenisUnitIcon(iconName, className = 'w-4 h-4') {
 const IconComp = ICON_MAP[iconName] || School
 return <IconComp className={className} strokeWidth={2.25} />
}

export default function JenisUnitTable({
  data = [],
  page = 1,
  perPage = 15,
  onDetail,
  onEdit,
  onDelete,
  onRestore,
}) {
  return (
    <table className="w-full min-w-180 table-fixed border-collapse text-left text-xs text-slate-600 dark:text-slate-300" aria-label="Daftar jenis unit pendidikan">
      <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
        <tr>
          <th className="w-[32%] px-3 py-3.5">IDENTITAS JENIS UNIT</th>
          <th className="w-[20%] px-3 py-3.5">JENJANG PENDIDIKAN</th>
          <th className="w-[20%] px-3 py-3.5">VISUAL &amp; URUTAN</th>
          <th className="w-[16%] px-2 py-3.5 text-center">STATUS</th>
          <th className="w-[12%] px-2 py-3.5 text-right select-none"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
        {data.map((item, index) => {
          const badgeColor = item.warna_badge || '#10B981'

          return (
            <tr
              key={item.id || item.uuid}
              className={`ui-row transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 ${item.is_deleted ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}`}
              style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
            >
              <td className="px-3 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {renderJenisUnitIcon(item.icon, 'w-4 h-4')}
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-xs font-bold text-slate-900 dark:text-white" title={item.nama_jenis}>{item.nama_jenis}</strong>
                    <span className="mt-0.5 block truncate text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">{item.kode_jenis} · {item.singkatan || '-'}</span>
                  </span>
                </div>
              </td>
              <td className="px-3 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <AppBadge variant="info" className="max-w-fit truncate">{item.jenjang}</AppBadge>
                  <small className="truncate text-[9px] text-slate-400" title={item.keterangan}>{item.keterangan || 'Tanpa keterangan'}</small>
                </div>
              </td>
              <td className="px-3 py-3.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs" style={{ backgroundColor: badgeColor }} />
                  <span className="truncate font-mono text-[10px] uppercase text-slate-500">{badgeColor}</span>
                  <span className="ml-auto text-xs font-bold text-slate-700 dark:text-slate-200">Urutan {item.urutan}</span>
                </div>
              </td>
              <td className="px-2 py-3.5 text-center">
                {item.is_deleted ? (
                  <AppBadge variant="danger" dot>Terhapus</AppBadge>
                ) : (
                  <AppBadge variant={item.status ? 'success' : 'neutral'} dot>
                    {item.status ? 'Aktif' : 'Tidak Aktif'}
                  </AppBadge>
                )}
              </td>
              <td className="px-2 py-3.5 text-right">
                <div className="flex justify-end">
                  <ActionDropdown
                    item={item}
                    onDetail={onDetail}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRestore={onRestore}
                  />
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
