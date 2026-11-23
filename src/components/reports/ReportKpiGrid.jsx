import React, { useState } from 'react'
import { ChevronRight, X, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/ui/dialog'

const REPORT_KPI_TONES = {
  emerald: {
    card: '!bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs hover:border-emerald-500',
    iconBox: '!bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white',
    tag: 'bg-white/90 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-emerald-900/80 dark:text-emerald-200 dark:border-emerald-800/60',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-emerald-800 dark:text-emerald-200',
    sub: 'text-emerald-700/90 dark:text-emerald-300/80',
    cta: 'text-emerald-700 dark:text-emerald-400',
  },
  blue: {
    card: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs hover:border-emerald-500',
    iconBox: '!bg-sky-600 !text-white shadow-sm dark:!bg-sky-600 dark:!text-white',
    tag: 'bg-white/90 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200 dark:border-emerald-800/60',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-sky-800 dark:text-sky-200',
    sub: 'text-sky-700/90 dark:text-sky-300/80',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  indigo: {
    card: '!bg-indigo-100/90 hover:!bg-indigo-200/70 dark:!bg-indigo-950/50 dark:hover:!bg-indigo-950/70 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs hover:border-emerald-500',
    iconBox: '!bg-indigo-600 !text-white shadow-sm dark:!bg-indigo-600 dark:!text-white',
    tag: 'bg-white/90 text-indigo-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-indigo-900/80 dark:text-indigo-200 dark:border-emerald-800/60',
    title: 'text-indigo-800 dark:text-indigo-300',
    val: 'text-indigo-800 dark:text-indigo-200',
    sub: 'text-indigo-700/90 dark:text-indigo-300/80',
    cta: 'text-indigo-700 dark:text-indigo-400',
  },
  teal: {
    card: '!bg-teal-100/90 hover:!bg-teal-200/70 dark:!bg-teal-950/50 dark:hover:!bg-teal-950/70 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs hover:border-emerald-500',
    iconBox: '!bg-teal-600 !text-white shadow-sm dark:!bg-teal-600 dark:text-white',
    tag: 'bg-white/90 text-teal-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-teal-900/80 dark:text-teal-200 dark:border-emerald-800/60',
    title: 'text-teal-800 dark:text-teal-300',
    val: 'text-teal-800 dark:text-teal-200',
    sub: 'text-teal-700/90 dark:text-teal-300/80',
    cta: 'text-teal-700 dark:text-teal-400',
  },
  amber: {
    card: '!bg-amber-100/90 hover:!bg-amber-200/70 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs hover:border-emerald-500',
    iconBox: '!bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white',
    tag: 'bg-white/90 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-amber-900/80 dark:text-amber-200 dark:border-emerald-800/60',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-amber-800 dark:text-amber-200',
    sub: 'text-amber-700/90 dark:text-amber-300/80',
    cta: 'text-amber-700 dark:text-amber-400',
  },
  sky: {
    card: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs hover:border-emerald-500',
    iconBox: '!bg-sky-600 !text-white shadow-sm dark:!bg-sky-600 dark:!text-white',
    tag: 'bg-white/90 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200 dark:border-emerald-800/60',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-sky-800 dark:text-sky-200',
    sub: 'text-sky-700/90 dark:text-sky-300/80',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  rose: {
    card: '!bg-rose-100/90 hover:!bg-rose-200/70 dark:!bg-rose-950/50 dark:hover:!bg-rose-950/70 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs hover:border-emerald-500',
    iconBox: '!bg-rose-600 !text-white shadow-sm dark:!bg-rose-600 dark:!text-white',
    tag: 'bg-white/90 text-rose-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-rose-900/80 dark:text-rose-200 dark:border-emerald-800/60',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-rose-800 dark:text-rose-200',
    sub: 'text-rose-700/90 dark:text-rose-300/80',
    cta: 'text-rose-700 dark:text-rose-400',
  },
  violet: {
    card: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs hover:border-emerald-500',
    iconBox: '!bg-purple-600 !text-white shadow-sm dark:!bg-purple-600 dark:!text-white',
    tag: 'bg-white/90 text-purple-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-purple-900/80 dark:text-purple-200 dark:border-emerald-800/60',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-purple-800 dark:text-purple-200',
    sub: 'text-purple-700/90 dark:text-purple-300/80',
    cta: 'text-purple-700 dark:text-purple-400',
  },
}

function resolveItemTone(item) {
  if (item.tone && REPORT_KPI_TONES[item.tone]) return REPORT_KPI_TONES[item.tone]
  const str = `${item.key || ''} ${item.title || ''} ${item.iconBg || ''}`.toLowerCase()
  if (str.includes('pink') || str.includes('perempuan') || str.includes('rose') || str.includes('danger') || str.includes('keluar') || str.includes('nonaktif') || str.includes('alpa')) return REPORT_KPI_TONES.rose
  if (str.includes('blue') || str.includes('guru') || str.includes('pendidik')) return REPORT_KPI_TONES.blue
  if (str.includes('indigo') || str.includes('non_guru') || str.includes('tendik')) return REPORT_KPI_TONES.indigo
  if (str.includes('sky') || str.includes('laki')) return REPORT_KPI_TONES.sky
  if (str.includes('amber') || str.includes('tetap') || str.includes('warning') || str.includes('alumni')) return REPORT_KPI_TONES.amber
  if (str.includes('purple') || str.includes('violet') || str.includes('pegawai')) return REPORT_KPI_TONES.violet
  if (str.includes('teal') || str.includes('aktif')) return REPORT_KPI_TONES.teal
  return REPORT_KPI_TONES.emerald
}

export function ReportKpiGrid({ items = [], details = [] }) {
 const [activeKpi, setActiveKpi] = useState(null)
 const [modalSearch, setModalSearch] = useState('')

 if (!items || items.length === 0) return null

 const handleOpenKpiModal = (item) => {
 setActiveKpi(item)
 setModalSearch('')
 }

 const getFilteredData = (kpi) => {
 if (!kpi) return []
 const allDetails = Array.isArray(details) ? details : []
 const key = kpi.key || (kpi.title || '').toLowerCase()

 let filtered = []

 if (key === 'total_sdm' || key.includes('total_sdm') || key.includes('total sdm') || key === 'pegawai') {
 filtered = [...allDetails]
 } else if (key === 'guru_tetap' || key.includes('guru_tetap') || key.includes('guru tetap')) {
 filtered = allDetails.filter((e) => {
 const isGuru = e.is_guru === true || (e.jenis_sdm || '').toLowerCase().includes('guru')
 const isTetap = (e.status_kepegawaian || '').toLowerCase().includes('tetap') || (e.status_kepegawaian || '').toLowerCase().includes('pns')
 return isGuru && isTetap
 })
 } else if (key === 'guru' || key.includes('guru') || key.includes('pendidik')) {
 filtered = allDetails.filter(
 (e) => e.is_guru === true || (e.jenis_sdm || '').toLowerCase().includes('guru')
 )
 } else if (key === 'non_guru' || key.includes('non_guru') || key.includes('non-guru') || key.includes('tendik')) {
 filtered = allDetails.filter(
 (e) => e.is_guru === false || (e.jenis_sdm || '').toLowerCase().includes('non-guru') || (e.jenis_sdm || '').toLowerCase().includes('tendik')
 )
 } else if (key === 'aktif' || key.includes('aktif')) {
 filtered = allDetails.filter(
 (e) => (e.status || '').toLowerCase().includes('aktif') || (e.status || '').toLowerCase().includes('active')
 )
 } else if (key === 'laki_laki' || key.includes('laki')) {
 filtered = allDetails.filter((e) => {
 const g = (e.jenis_kelamin || '').toLowerCase()
 return g.startsWith('l') || g.startsWith('m')
 })
 } else if (key === 'perempuan' || key.includes('perempuan')) {
 filtered = allDetails.filter((e) => {
 const g = (e.jenis_kelamin || '').toLowerCase()
 return g.startsWith('p') || g.startsWith('f')
 })
 } else if (key === 'sdm_baru' || key.includes('baru')) {
 filtered = allDetails.filter(
 (e) =>
 e.is_baru === true ||
 (e.status_kepegawaian || '').toLowerCase().includes('baru') ||
 (e.tanggal_masuk || '').includes('2026')
 )
 } else {
 filtered = [...allDetails]
 }

 if (modalSearch.trim()) {
 const q = modalSearch.toLowerCase()
 filtered = filtered.filter(
 (item) =>
 (item.nama && item.nama.toLowerCase().includes(q)) ||
 (item.niy && item.niy.toLowerCase().includes(q)) ||
 (item.unit && item.unit.toLowerCase().includes(q)) ||
 (item.jabatan && item.jabatan.toLowerCase().includes(q)) ||
 (item.jenis_sdm && item.jenis_sdm.toLowerCase().includes(q))
 )
 }

 return filtered
 }

 const modalData = getFilteredData(activeKpi)

 return (
 <>
 {/* 8 KPI Cards Grid */}
 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
 {items.map((item, index) => {
        const Icon = item.icon
        const t = resolveItemTone(item)

        return (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleOpenKpiModal(item)}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-3.5 sm:p-4 md:p-5 shadow-xs transition-all hover:shadow-md cursor-pointer ${t.card}`}
          >
            <div>
              <div className="flex items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
                {Icon ? (
                  <div className={`flex size-9 sm:size-10 items-center justify-center rounded-xl shadow-md shrink-0 ${t.iconBox}`}>
                    <Icon className="size-4 sm:size-5" />
                  </div>
                ) : <div />}
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-black shrink-0 ${t.tag || 'bg-white/90 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-emerald-900/80 dark:text-emerald-200 dark:border-emerald-800/60'}`}>
                  {item.unit || item.tag || 'METRIK'}
                </span>
              </div>

              <span
                title={item.title}
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider block mb-1 line-clamp-2 min-h-[2.4em] leading-snug ${t.title}`}
              >
                {item.title}
              </span>

              <strong className={`text-xl sm:text-2xl md:text-3xl font-black tabular-nums tracking-tight block ${t.val}`}>
                {typeof item.value === 'number' ? item.value.toLocaleString('id-ID') : (item.value || '0')}
              </strong>
            </div>

            <div className={`flex items-center justify-between text-[10px] sm:text-xs font-bold pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 ${t.cta}`}>
              <span className={`font-bold leading-tight line-clamp-2 min-w-0 flex-1 ${t.sub}`}>{item.subtext || 'Lihat Data'}</span>
              <span className="inline-flex items-center gap-0.5 font-extrabold group-hover:translate-x-0.5 transition-transform shrink-0">
                Detail &rarr;
              </span>
            </div>
          </motion.div>
        )
      })}
 </div>

 {/* KPI Detail Modal */}
 {activeKpi && (
 <Dialog
 isOpen={true}
 onOpenChange={(open) => !open && setActiveKpi(null)}
 modalClassName="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
 className="w-full max-w-4xl p-0 rounded-xl overflow-hidden bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xl"
 showCloseButton={false}
 >
 <div className="p-6">
 <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 {activeKpi.icon && (
 <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm`}>
 <activeKpi.icon className="h-5 w-5" />
 </div>
 )}
 <div>
 <DialogTitle className="text-base font-black text-slate-900 dark:text-emerald-600">
 Detail Data {activeKpi.title}
 </DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Menampilkan rincian data pembentuk angka laporan ({typeof activeKpi.value === 'number' ? activeKpi.value.toLocaleString('id-ID') : activeKpi.value} {activeKpi.unit || 'SDM'})
 </DialogDescription>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setActiveKpi(null)}
 className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
 aria-label="Tutup"
 >
 <X className="h-4 w-4" />
 </button>
 </DialogHeader>

 <DialogBody className="space-y-4 py-4 max-h-[72vh] overflow-y-auto">
 {/* Filter Search */}
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={modalSearch}
 onChange={(e) => setModalSearch(e.target.value)}
 placeholder={`Cari nama pegawai, NIP, unit, atau jabatan pada ${activeKpi.title}...`}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
 />
 </div>

 {/* SDM Table */}
 <div className="overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-slate-50/80 border-b border-emerald-200/80 dark:bg-slate-900/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
 <th className="py-2.5 px-3">No</th>
 <th className="py-2.5 px-3">Nama Pegawai & NIY</th>
 <th className="py-2.5 px-3">Unit Pendidikan</th>
 <th className="py-2.5 px-3">Jenis SDM</th>
 <th className="py-2.5 px-3">Jabatan / Divisi</th>
 <th className="py-2.5 px-3 text-center">Status Pegawai</th>
 <th className="py-2.5 px-3 text-center">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-semibold text-slate-700 dark:text-slate-200">
 {modalData.length > 0 ? (
 modalData.map((item, idx) => {
 const isGuru = (item.jenis_sdm || '').toLowerCase().includes('guru')
 return (
 <tr key={idx} className="hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
 <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
 <td className="py-2.5 px-3">
 <div className="flex items-center gap-2.5">
 <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-[10px] shrink-0 ${isGuru ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
 {item.nama?.substring(0, 2).toUpperCase() || 'SD'}
 </div>
 <div>
 <span className="font-bold text-slate-900 dark:text-white block">{item.nama}</span>
 <span className="font-mono text-[10px] text-slate-400 block">{item.niy || '-'}</span>
 </div>
 </div>
 </td>
 <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{item.unit || '-'}</td>
 <td className="py-2.5 px-3">
 <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isGuru ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
 {item.jenis_sdm || 'Pegawai'}
 </span>
 </td>
 <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{item.jabatan || item.divisi_mapel || '-'}</td>
 <td className="py-2.5 px-3 text-center">
 <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 {item.status_kepegawaian || 'Tetap'}
 </span>
 </td>
 <td className="py-2.5 px-3 text-center">
 <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${(item.status || '').toLowerCase() === 'aktif' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>
 {item.status || 'Aktif'}
 </span>
 </td>
 </tr>
 )
 })
 ) : (
 <tr>
 <td colSpan={7} className="py-8 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
 {modalSearch.trim()
 ? `Tidak ada data pegawai yang sesuai dengan kata kunci "${modalSearch}".`
 : 'Belum ada rincian data pegawai terdaftar untuk kategori ini pada dataset laporan.'}
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </DialogBody>

 <DialogFooter className="pt-3 border-t border-emerald-100/80 dark:border-emerald-800/60">
 <motion.button
 type="button"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.96 }}
 onClick={() => setActiveKpi(null)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4.5 py-2 text-xs font-bold shadow-sm transition-all hover:bg-slate-900 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95"
 >
 <X className="h-4 w-4" />
 <span>Tutup Modal</span>
 </motion.button>
 </DialogFooter>
 </div>
 </Dialog>
 )}
 </>
 )
}
