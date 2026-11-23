import React, { useState } from 'react'
import { Sparkles, Building2, GraduationCap, Scale, ChevronRight, X, Users, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '../ui/card'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/ui/dialog'

export function ReportInsightCard({ insights, unitRecaps = [], summary = null, details = [] }) {
 const [activeModal, setActiveModal] = useState(null) // null | 'unit_terbanyak' | 'guru_terbanyak' | 'rasio_gender'
 const [selectedTeacherUnit, setSelectedTeacherUnit] = useState(null)
 const [teacherSearch, setTeacherSearch] = useState('')
 const [selectedSdmUnit, setSelectedSdmUnit] = useState(null)
 const [sdmSearch, setSdmSearch] = useState('')

 if (!insights) return null

 // Normalize insights into an array of items with title & description
 let insightItems = []

 if (Array.isArray(insights)) {
 insightItems = insights.map((item, idx) => {
 if (typeof item === 'object' && item !== null) {
 return {
 id: idx,
 key: item.title || item.type || `insight_${idx}`,
 title: item.title || item.type || 'Indikator Analisis',
 description: item.description || item.val || '',
 type: item.type || 'info',
 }
 }
 return {
 id: idx,
 key: `insight_${idx}`,
 title: 'Indikator Analisis',
 description: String(item),
 type: 'info',
 }
 })
 } else if (typeof insights === 'object') {
 insightItems = Object.entries(insights).map(([key, val], idx) => {
 let desc = ''
 let title = key.replace(/_/g, ' ')

 if (typeof val === 'object' && val !== null) {
 title = val.title || val.type || title
 desc = val.description || val.val || JSON.stringify(val)
 } else {
 desc = String(val)
 }

 return {
 id: idx,
 key,
 title,
 description: desc,
 type: 'info',
 }
 })
 }

 if (insightItems.length === 0) return null

 const getIcon = (item) => {
 const k = (item.key + ' ' + item.title).toLowerCase()
 if (k.includes('unit') || k.includes('sekolah')) return <Building2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 if (k.includes('guru') || k.includes('sdm')) return <GraduationCap className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
 return <Scale className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400 shrink-0" />
 }

 const getModalType = (item) => {
 const k = (item.key + ' ' + item.title).toLowerCase()
 if (k.includes('unit') || k.includes('sekolah')) return 'unit_terbanyak'
 if (k.includes('guru')) return 'guru_terbanyak'
 if (k.includes('gender') || k.includes('rasio')) return 'rasio_gender'
 return 'unit_terbanyak'
 }

 // Derive top unit data strictly from backend dataset
 const recaps = Array.isArray(unitRecaps) ? unitRecaps : []
 const topUnit = [...recaps].sort((a, b) => (b.total_sdm || 0) - (a.total_sdm || 0))[0] || null
 const topGuruUnit = [...recaps].sort((a, b) => (b.guru || 0) - (a.guru || 0))[0] || null

 const totalLaki = summary?.laki_laki ?? recaps.reduce((acc, u) => acc + (u.laki_laki || 0), 0)
 const totalPerempuan = summary?.perempuan ?? recaps.reduce((acc, u) => acc + (u.perempuan || 0), 0)
 const totalSdmAll = summary?.total_sdm ?? recaps.reduce((acc, u) => acc + (u.total_sdm || 0), 0)

 // Filter teachers list strictly from real backend details
 const getTeachersForUnit = (unitObj) => {
 if (!unitObj) return []
 const allDetails = Array.isArray(details) ? details : []

 let list = allDetails.filter((emp) => {
 const unitMatch =
 (emp.unit && emp.unit.toLowerCase().includes(unitObj.unit_name.toLowerCase())) ||
 (unitObj.unit_code && emp.unit_code && emp.unit_code.toLowerCase() === unitObj.unit_code.toLowerCase()) ||
 (emp.unit && unitObj.unit_name && unitObj.unit_name.toLowerCase().includes(emp.unit.toLowerCase()))

 const isGuru = (emp.jenis_sdm || '').toLowerCase().includes('guru')
 return unitMatch && isGuru
 })

 if (teacherSearch.trim()) {
 const q = teacherSearch.toLowerCase()
 list = list.filter(
 (t) =>
 (t.nama && t.nama.toLowerCase().includes(q)) ||
 (t.niy && t.niy.toLowerCase().includes(q)) ||
 (t.jabatan && t.jabatan.toLowerCase().includes(q)) ||
 (t.divisi_mapel && t.divisi_mapel.toLowerCase().includes(q))
 )
 }

 return list
 }

 // Filter all employees list strictly from real backend details
 const getEmployeesForUnit = (unitObj) => {
 if (!unitObj) return []
 const allDetails = Array.isArray(details) ? details : []

 let list = allDetails.filter((emp) => {
 const unitMatch =
 (emp.unit && emp.unit.toLowerCase().includes(unitObj.unit_name.toLowerCase())) ||
 (unitObj.unit_code && emp.unit_code && emp.unit_code.toLowerCase() === unitObj.unit_code.toLowerCase()) ||
 (emp.unit && unitObj.unit_name && unitObj.unit_name.toLowerCase().includes(emp.unit.toLowerCase()))

 return unitMatch
 })

 if (sdmSearch.trim()) {
 const q = sdmSearch.toLowerCase()
 list = list.filter(
 (e) =>
 (e.nama && e.nama.toLowerCase().includes(q)) ||
 (e.niy && e.niy.toLowerCase().includes(q)) ||
 (e.jabatan && e.jabatan.toLowerCase().includes(q)) ||
 (e.jenis_sdm && e.jenis_sdm.toLowerCase().includes(q)) ||
 (e.divisi_mapel && e.divisi_mapel.toLowerCase().includes(q))
 )
 }

 return list
 }

 return (
 <>
 <Card className="border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 shadow-xs">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 px-5 py-4 dark:border-emerald-800/60 sm:px-6">
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
 <Sparkles className="h-4 w-4" />
 </div>
 <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-300">
 Ringkasan Analisis & Indikator Laporan
 </h3>
 </div>
 <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
 Klik kartu untuk rincian detail
 </span>
 </div>

 {/* Content Grid */}
 <div className="px-5 py-5 sm:px-6 sm:py-6">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
 {insightItems.map((item) => {
 const modalType = getModalType(item)
 return (
 <motion.div
 key={item.id}
 whileHover={{ scale: 1.02, y: -2 }}
 whileTap={{ scale: 0.98 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 onClick={() => setActiveModal(modalType)}
 className="group flex flex-col justify-between gap-3.5 rounded-xl bg-white p-4.5 shadow-xs border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-[#1B2433] transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md dark:hover:border-emerald-700 cursor-pointer"
 >
 <div className="flex items-start gap-3.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/90 shrink-0 mt-0.5 shadow-2xs group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 transition-colors">
 {getIcon(item)}
 </div>
 <div className="min-w-0 flex-1 space-y-1">
 <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
 {item.title}
 </div>
 <div className="text-xs font-bold text-slate-800 dark:text-white leading-relaxed break-words">
 {item.description}
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between border-t border-emerald-100/80 pt-2.5 dark:border-emerald-800/80 text-xs font-bold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
 <span>Lihat Rincian Detail</span>
 <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
 </div>
 </motion.div>
 )
 })}
 </div>
 </div>
 </Card>

 {/* Modal 1: Unit Terbanyak */}
 {activeModal === 'unit_terbanyak' && (
 <Dialog
 isOpen={true}
 onOpenChange={(open) => !open && setActiveModal(null)}
 className="max-w-xl"
 showCloseButton={false}
 >
 <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
 <Building2 className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-emerald-600">Detail Unit Terbanyak</DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">Rincian SDM pada Unit Pendidikan Terbanyak</DialogDescription>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setActiveModal(null)}
 className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
 aria-label="Tutup"
 >
 <X className="h-4 w-4" />
 </button>
 </DialogHeader>

 <DialogBody className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
 {topUnit ? (
 <div className="space-y-4">
 {/* Highlight Card */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
 Unit Pendidikan Utama
 </div>
 <div className="mt-1 text-lg font-black text-emerald-950 dark:text-white">
 {topUnit.unit_name} {topUnit.unit_code ? `(${topUnit.unit_code})` : ''}
 </div>
 <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
 Memiliki alokasi SDM terbanyak sejumlah <span className="font-extrabold text-emerald-900 dark:text-emerald-200">{topUnit.total_sdm} Orang</span> ({totalSdmAll > 0 ? roundPerc((topUnit.total_sdm / totalSdmAll) * 100) : 0}% dari total SDM yayasan).
 </div>
 </div>

 {/* Grid Summary Stats */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-900/50">
 <span className="text-[10px] font-bold uppercase text-slate-400 block">Total SDM</span>
 <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{topUnit.total_sdm}</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-blue-50/60 p-3 dark:border-emerald-800/60 dark:bg-blue-950/30">
 <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block">Tenaga Guru</span>
 <span className="text-base font-black text-blue-900 dark:text-blue-300 mt-0.5 block">{topUnit.guru}</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-indigo-50/60 p-3 dark:border-emerald-800/60 dark:bg-indigo-950/30">
 <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 block">Pegawai Non-Guru</span>
 <span className="text-base font-black text-indigo-900 dark:text-indigo-300 mt-0.5 block">{topUnit.non_guru}</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-teal-50/60 p-3 dark:border-emerald-800/60 dark:bg-teal-950/30">
 <span className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400 block">SDM Aktif</span>
 <span className="text-base font-black text-teal-900 dark:text-teal-300 mt-0.5 block">{topUnit.aktif}</span>
 </div>
 </div>

 {/* Detailed Breakdown */}
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-3">
 <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-emerald-100/80 pb-2 dark:border-emerald-800/60">
 Rincian Komposisi Gender & Status
 </h4>
 <div className="grid grid-cols-2 gap-3 text-xs">
 <div>
 <span className="text-slate-400 block">Laki-Laki</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">{topUnit.laki_laki} SDM</span>
 </div>
 <div>
 <span className="text-slate-400 block">Perempuan</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">{topUnit.perempuan} SDM</span>
 </div>
 <div>
 <span className="text-slate-400 block">Status Aktif</span>
 <span className="font-bold text-emerald-600 dark:text-emerald-400">{topUnit.aktif} Aktif</span>
 </div>
 <div>
 <span className="text-slate-400 block">Status Nonaktif</span>
 <span className="font-bold text-rose-600 dark:text-rose-400">{topUnit.nonaktif} Nonaktif</span>
 </div>
 </div>
 </div>

 {/* Rekap Seluruh Alokasi SDM per Unit Pendidikan */}
 {recaps.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-3">
 <h4 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-emerald-100/80 pb-2 dark:border-emerald-800/60 flex items-center justify-between">
 <span>Rekap Seluruh Alokasi SDM per Unit Pendidikan</span>
 <span className="text-[10px] font-normal text-slate-400">Total {totalSdmAll} SDM</span>
 </h4>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 text-[10px] font-extrabold uppercase text-slate-400 dark:border-emerald-800/60">
 <th className="py-2 px-2">Unit Pendidikan</th>
 <th className="py-2 px-2 text-right">Total SDM</th>
 <th className="py-2 px-2 text-right">Guru</th>
 <th className="py-2 px-2 text-right">Non-Guru</th>
 <th className="py-2 px-2 text-right">Aktif</th>
 <th className="py-2 px-2 text-right">Alokasi</th>
 <th className="py-2 px-2 text-center">Detail Data</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-semibold text-slate-700 dark:text-slate-200">
 {[...recaps]
 .sort((a, b) => (b.total_sdm || 0) - (a.total_sdm || 0))
 .map((u, i) => {
 const perc = totalSdmAll > 0 ? ((u.total_sdm / totalSdmAll) * 100).toFixed(1) : '0.0'
 const isTop = i === 0
 return (
 <tr key={i} className={`hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 ${isTop ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}>
 <td className="py-2 px-2 font-bold text-slate-900 dark:text-white">
 <div className="flex items-center gap-1.5">
 {isTop && (
 <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
 Terbanyak
 </span>
 )}
 <span>{u.unit_name}</span>
 </div>
 </td>
 <td className="py-2 px-2 text-right font-black text-emerald-600 dark:text-emerald-400">{u.total_sdm} SDM</td>
 <td className="py-2 px-2 text-right text-blue-600 dark:text-blue-400">{u.guru}</td>
 <td className="py-2 px-2 text-right text-slate-500 dark:text-slate-400">{u.non_guru}</td>
 <td className="py-2 px-2 text-right font-bold text-teal-600 dark:text-teal-400">{u.aktif}</td>
 <td className="py-2 px-2 text-right font-mono text-purple-600 dark:text-purple-400">{perc}%</td>
 <td className="py-2 px-2 text-center">
 <button
 type="button"
 onClick={() => {
 setSelectedSdmUnit(u)
 setSdmSearch('')
 }}
 className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
 >
 <Users className="h-3.5 w-3.5" />
 <span>Daftar SDM ({u.total_sdm})</span>
 </button>
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 ) : (
 <div className="p-4 text-xs font-semibold text-slate-500">
 Informasi rincian unit terbanyak: {insightItems.find((i) => i.key.includes('unit'))?.description || '-'}
 </div>
 )}
 </DialogBody>

 <DialogFooter className="pt-3 border-t border-emerald-100/80 dark:border-emerald-800/60">
 <motion.button
 type="button"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.96 }}
 onClick={() => setActiveModal(null)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4.5 py-2 text-xs font-bold shadow-sm transition-all hover:bg-slate-900 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95"
 >
 <X className="h-4 w-4" />
 <span>Tutup Modal</span>
 </motion.button>
 </DialogFooter>
 </Dialog>
 )}

 {/* Modal 2: Guru Terbanyak */}
 {activeModal === 'guru_terbanyak' && (
 <Dialog
 isOpen={true}
 onOpenChange={(open) => !open && setActiveModal(null)}
 className="max-w-xl"
 showCloseButton={false}
 >
 <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
 <GraduationCap className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-emerald-600">Detail Unit Guru Terbanyak</DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">Rincian Tenaga Pendidik / Guru pada Unit Terbanyak</DialogDescription>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setActiveModal(null)}
 className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
 aria-label="Tutup"
 >
 <X className="h-4 w-4" />
 </button>
 </DialogHeader>

 <DialogBody className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
 {topGuruUnit ? (
 <div className="space-y-4">
 {/* Highlight Card */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-blue-50/60 p-4 dark:border-emerald-800/60 dark:bg-blue-950/30">
 <div className="text-xs font-bold text-blue-800 dark:text-blue-300">
 Unit Pendidikan dengan Tenaga Pendidik Terbanyak
 </div>
 <div className="mt-1 text-lg font-black text-blue-950 dark:text-white">
 {topGuruUnit.unit_name} {topGuruUnit.unit_code ? `(${topGuruUnit.unit_code})` : ''}
 </div>
 <div className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
 Memiliki jumlah Guru terbesar sebanyak <span className="font-extrabold text-blue-900 dark:text-blue-200">{topGuruUnit.guru} Guru</span> ({topGuruUnit.total_sdm > 0 ? roundPerc((topGuruUnit.guru / topGuruUnit.total_sdm) * 100) : 0}% dari seluruh SDM unit tersebut).
 </div>
 </div>

 {/* Grid Stats */}
 <div className="grid grid-cols-3 gap-3">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-blue-50 p-3 dark:border-emerald-800/60 dark:bg-blue-950/30">
 <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block">Total Guru</span>
 <span className="text-lg font-black text-blue-900 dark:text-blue-300 mt-0.5 block">{topGuruUnit.guru}</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-900/50">
 <span className="text-[10px] font-bold uppercase text-slate-400 block">Non-Guru / Tendik</span>
 <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{topGuruUnit.non_guru}</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Total SDM Unit</span>
 <span className="text-lg font-black text-emerald-900 dark:text-emerald-300 mt-0.5 block">{topGuruUnit.total_sdm}</span>
 </div>
 </div>

 {/* Proporsi Bar */}
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-2">
 <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
 <span>Proporsi Guru vs Tendik</span>
 <span>{topGuruUnit.guru} Guru / {topGuruUnit.total_sdm} SDM</span>
 </div>
 <div className="h-3 w-full rounded-full bg-emerald-50 overflow-hidden dark:bg-emerald-950/40 flex">
 <div
 className="h-full bg-blue-600 dark:bg-blue-500"
 style={{ width: `${topGuruUnit.total_sdm > 0 ? (topGuruUnit.guru / topGuruUnit.total_sdm) * 100 : 0}%` }}
 title="Guru"
 />
 <div
 className="h-full bg-indigo-400 dark:bg-indigo-600"
 style={{ width: `${topGuruUnit.total_sdm > 0 ? (topGuruUnit.non_guru / topGuruUnit.total_sdm) * 100 : 0}%` }}
 title="Non-Guru"
 />
 </div>
 <div className="flex gap-4 text-[10px] font-bold text-slate-500 pt-1">
 <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-600" /> Guru ({topGuruUnit.total_sdm > 0 ? roundPerc((topGuruUnit.guru / topGuruUnit.total_sdm) * 100) : 0}%)</span>
 <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400" /> Non-Guru ({topGuruUnit.total_sdm > 0 ? roundPerc((topGuruUnit.non_guru / topGuruUnit.total_sdm) * 100) : 0}%)</span>
 </div>
 </div>

 {/* Rekap Seluruh Daftar Tenaga Pendidik per Unit Pendidikan */}
 {recaps.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-3">
 <h4 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-emerald-100/80 pb-2 dark:border-emerald-800/60 flex items-center justify-between">
 <span>Rekap Daftar Tenaga Pendidik Menurut Unit</span>
 <span className="text-[10px] font-normal text-slate-400">Total {recaps.reduce((acc, u) => acc + (u.guru || 0), 0)} Guru</span>
 </h4>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 text-[10px] font-extrabold uppercase text-slate-400 dark:border-emerald-800/60">
 <th className="py-2 px-2">Unit Pendidikan</th>
 <th className="py-2 px-2 text-right">Jumlah Guru</th>
 <th className="py-2 px-2 text-right">Non-Guru</th>
 <th className="py-2 px-2 text-right">Total SDM</th>
 <th className="py-2 px-2 text-right">Proporsi</th>
 <th className="py-2 px-2 text-center">Detail Data</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-semibold text-slate-700 dark:text-slate-200">
 {[...recaps]
 .sort((a, b) => (b.guru || 0) - (a.guru || 0))
 .map((u, i) => {
 const perc = u.total_sdm > 0 ? ((u.guru / u.total_sdm) * 100).toFixed(1) : '0.0'
 const isTop = i === 0
 return (
 <tr key={i} className={`hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 ${isTop ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
 <td className="py-2 px-2 font-bold text-slate-900 dark:text-white">
 <div className="flex items-center gap-1.5">
 {isTop && (
 <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold text-blue-800 dark:bg-blue-950 dark:text-blue-300 shrink-0">
 Terbanyak
 </span>
 )}
 <span>{u.unit_name}</span>
 </div>
 </td>
 <td className="py-2 px-2 text-right font-black text-blue-600 dark:text-blue-400">{u.guru} Guru</td>
 <td className="py-2 px-2 text-right text-slate-500 dark:text-slate-400">{u.non_guru}</td>
 <td className="py-2 px-2 text-right font-extrabold">{u.total_sdm}</td>
 <td className="py-2 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400">{perc}%</td>
 <td className="py-2 px-2 text-center">
 <button
 type="button"
 onClick={() => {
 setSelectedTeacherUnit(u)
 setTeacherSearch('')
 }}
 className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900 transition-colors cursor-pointer"
 >
 <Users className="h-3.5 w-3.5" />
 <span>Daftar Guru ({u.guru})</span>
 </button>
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 ) : (
 <div className="p-4 text-xs font-semibold text-slate-500">
 Informasi rincian guru terbanyak: {insightItems.find((i) => i.key.includes('guru'))?.description || '-'}
 </div>
 )}
 </DialogBody>

 <DialogFooter className="pt-3 border-t border-emerald-100/80 dark:border-emerald-800/60">
 <motion.button
 type="button"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.96 }}
 onClick={() => setActiveModal(null)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4.5 py-2 text-xs font-bold shadow-sm transition-all hover:bg-slate-900 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95"
 >
 <X className="h-4 w-4" />
 <span>Tutup Modal</span>
 </motion.button>
 </DialogFooter>
 </Dialog>
 )}

 {/* Modal 3: Rasio Gender */}
 {activeModal === 'rasio_gender' && (
 <Dialog
 isOpen={true}
 onOpenChange={(open) => !open && setActiveModal(null)}
 className="max-w-xl"
 showCloseButton={false}
 >
 <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
 <Scale className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-emerald-600">Detail Analisis Rasio Gender SDM</DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">Perbandingan Komposisi Gender Laki-Laki & Perempuan</DialogDescription>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setActiveModal(null)}
 className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
 aria-label="Tutup"
 >
 <X className="h-4 w-4" />
 </button>
 </DialogHeader>

 <DialogBody className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
 {/* Top Stat Bar */}
 <div className="grid grid-cols-3 gap-3">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/70 p-4 dark:border-emerald-800/60 dark:bg-sky-950/30">
 <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 block">SDM Laki-Laki</span>
 <span className="text-xl font-black text-sky-900 dark:text-sky-200 mt-0.5 block">{totalLaki} SDM</span>
 <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 mt-1 block">
 {totalSdmAll > 0 ? roundPerc((totalLaki / totalSdmAll) * 100) : 0}% dari Total SDM
 </span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-pink-50/70 p-4 dark:border-emerald-800/60 dark:bg-pink-950/30">
 <span className="text-[10px] font-bold uppercase text-pink-600 dark:text-pink-400 block">SDM Perempuan</span>
 <span className="text-xl font-black text-pink-900 dark:text-pink-200 mt-0.5 block">{totalPerempuan} SDM</span>
 <span className="text-[10px] font-semibold text-pink-700 dark:text-pink-300 mt-1 block">
 {totalSdmAll > 0 ? roundPerc((totalPerempuan / totalSdmAll) * 100) : 0}% dari Total SDM
 </span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-purple-50/70 p-4 dark:border-emerald-800/60 dark:bg-purple-950/30">
 <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 block">Rasio Gender (L : P)</span>
 <span className="text-xl font-black text-purple-900 dark:text-purple-200 mt-0.5 block">
 1 : {totalPerempuan > 0 ? roundPerc(totalPerempuan / maxOne(totalLaki)) : 1}
 </span>
 <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 mt-1 block">
 Proporsi Seimbang
 </span>
 </div>
 </div>

 {/* Breakdown Table Per Unit */}
 {recaps.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-3">
 <h4 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-emerald-100/80 pb-2 dark:border-emerald-800/60">
 Rincian Rasio Gender per Unit Pendidikan
 </h4>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 text-[10px] font-extrabold uppercase text-slate-400 dark:border-emerald-800/60">
 <th className="py-2 px-2">Unit Pendidikan</th>
 <th className="py-2 px-2 text-right">Laki-Laki</th>
 <th className="py-2 px-2 text-right">Perempuan</th>
 <th className="py-2 px-2 text-right">Total SDM</th>
 <th className="py-2 px-2 text-right">Rasio L : P</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-semibold text-slate-700 dark:text-slate-200">
 {recaps.map((u, i) => {
 const ratio = u.perempuan > 0 ? (u.perempuan / maxOne(u.laki_laki)).toFixed(2) : '1.00'
 return (
 <tr key={i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="py-2 px-2 font-bold text-slate-900 dark:text-white">{u.unit_name}</td>
 <td className="py-2 px-2 text-right text-sky-600 dark:text-sky-400">{u.laki_laki}</td>
 <td className="py-2 px-2 text-right text-pink-600 dark:text-pink-400">{u.perempuan}</td>
 <td className="py-2 px-2 text-right font-extrabold">{u.total_sdm}</td>
 <td className="py-2 px-2 text-right font-mono text-purple-600 dark:text-purple-400">1 : {ratio}</td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </DialogBody>

 <DialogFooter className="pt-3 border-t border-emerald-100/80 dark:border-emerald-800/60">
 <motion.button
 type="button"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.96 }}
 onClick={() => setActiveModal(null)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4.5 py-2 text-xs font-bold shadow-sm transition-all hover:bg-slate-900 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95"
 >
 <X className="h-4 w-4" />
 <span>Tutup Modal</span>
 </motion.button>
 </DialogFooter>
 </Dialog>
 )}

 {/* Sub-Modal 1: Daftar Data SDM Pegawai per Unit (Modal Unit Terbanyak) */}
 {selectedSdmUnit && (
 <Dialog
 isOpen={true}
 onOpenChange={(open) => !open && setSelectedSdmUnit(null)}
 className="max-w-xl"
 showCloseButton={false}
 >
 <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
 <Building2 className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-emerald-600">
 Daftar SDM Pegawai - {selectedSdmUnit.unit_name}
 </DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
 Rincian seluruh Pegawai & Guru terdaftar (Total {selectedSdmUnit.total_sdm} SDM)
 </DialogDescription>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setSelectedSdmUnit(null)}
 className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
 aria-label="Tutup"
 >
 <X className="h-4 w-4" />
 </button>
 </DialogHeader>

 <DialogBody className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
 {/* Search Filter */}
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={sdmSearch}
 onChange={(e) => setSdmSearch(e.target.value)}
 placeholder="Cari nama pegawai, NIP, jenis SDM, atau jabatan..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
 />
 </div>

 {/* Employee Table */}
 <div className="overflow-hidden rounded-xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <th className="py-2.5 px-3">No</th>
 <th className="py-2.5 px-3">Nama Pegawai</th>
 <th className="py-2.5 px-3">NIP / NIY</th>
 <th className="py-2.5 px-3">Jenis SDM</th>
 <th className="py-2.5 px-3">Jabatan / Divisi</th>
 <th className="py-2.5 px-3 text-center">Status Pegawai</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-semibold text-slate-700 dark:text-slate-200">
 {getEmployeesForUnit(selectedSdmUnit).length > 0 ? (
 getEmployeesForUnit(selectedSdmUnit).map((e, idx) => {
 const isGuru = (e.jenis_sdm || '').toLowerCase().includes('guru')
 return (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
 <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
 <div className="flex items-center gap-2">
 <div className={`flex h-7 w-7 items-center justify-center rounded-full font-bold text-[10px] shrink-0 ${isGuru ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
 {e.nama?.substring(0, 2).toUpperCase() || 'SD'}
 </div>
 <span>{e.nama}</span>
 </div>
 </td>
 <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">{e.niy || '-'}</td>
 <td className="py-2.5 px-3">
 <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isGuru ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
 {e.jenis_sdm || 'Pegawai'}
 </span>
 </td>
 <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{e.jabatan || e.divisi_mapel || '-'}</td>
 <td className="py-2.5 px-3 text-center">
 <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 {e.status_kepegawaian || 'Tetap'}
 </span>
 </td>
 </tr>
 )
 })
 ) : (
 <tr>
 <td colSpan={6} className="py-8 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
 Tidak ditemukan data pegawai terdaftar pada unit ini.
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
 onClick={() => setSelectedSdmUnit(null)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4.5 py-2 text-xs font-bold shadow-sm transition-all hover:bg-slate-900 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95"
 >
 <X className="h-4 w-4" />
 <span>Tutup Daftar SDM</span>
 </motion.button>
 </DialogFooter>
 </Dialog>
 )}

 {/* Sub-Modal 2: Daftar Data Guru per Unit (Modal Guru Terbanyak) */}
 {selectedTeacherUnit && (
 <Dialog
 isOpen={true}
 onOpenChange={(open) => !open && setSelectedTeacherUnit(null)}
 className="max-w-xl"
 showCloseButton={false}
 >
 <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
 <GraduationCap className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-emerald-600">
 Daftar Guru - {selectedTeacherUnit.unit_name}
 </DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
 Rincian Tenaga Pendidik / Guru terdaftar (Total {selectedTeacherUnit.guru} Guru)
 </DialogDescription>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setSelectedTeacherUnit(null)}
 className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
 aria-label="Tutup"
 >
 <X className="h-4 w-4" />
 </button>
 </DialogHeader>

 <DialogBody className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
 {/* Search Filter */}
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={teacherSearch}
 onChange={(e) => setTeacherSearch(e.target.value)}
 placeholder="Cari nama guru, NIP, atau mata pelajaran..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
 />
 </div>

 {/* Teacher Table */}
 <div className="overflow-hidden rounded-xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="border-b border-emerald-200/80 bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <th className="py-2.5 px-3">No</th>
 <th className="py-2.5 px-3">Nama Guru</th>
 <th className="py-2.5 px-3">NIP / NIY</th>
 <th className="py-2.5 px-3">Jabatan</th>
 <th className="py-2.5 px-3">Mapel / Divisi</th>
 <th className="py-2.5 px-3 text-center">Status Pegawai</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-semibold text-slate-700 dark:text-slate-200">
 {getTeachersForUnit(selectedTeacherUnit).length > 0 ? (
 getTeachersForUnit(selectedTeacherUnit).map((t, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
 <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
 <div className="flex items-center gap-2">
 <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] dark:bg-blue-950 dark:text-blue-300 shrink-0">
 {t.nama?.substring(0, 2).toUpperCase() || 'GU'}
 </div>
 <span>{t.nama}</span>
 </div>
 </td>
 <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">{t.niy || '-'}</td>
 <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{t.jabatan || 'Guru'}</td>
 <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400">{t.divisi_mapel || '-'}</td>
 <td className="py-2.5 px-3 text-center">
 <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 {t.status_kepegawaian || 'Tetap'}
 </span>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={6} className="py-8 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
 Tidak ditemukan data guru terdaftar pada unit ini.
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
 onClick={() => setSelectedTeacherUnit(null)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4.5 py-2 text-xs font-bold shadow-sm transition-all hover:bg-slate-900 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95"
 >
 <X className="h-4 w-4" />
 <span>Tutup Daftar Guru</span>
 </motion.button>
 </DialogFooter>
 </Dialog>
 )}
 </>
 )
}

function roundPerc(num) {
 return Math.round(num * 100) / 100
}

function maxOne(num) {
 return num > 0 ? num : 1
}
