import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import {
 X,
 Search,
 CheckCircle2,
 UserX,
 Users,
 BookOpen,
 Clock,
 Sparkles,
 MessageCircle,
 Plus,
 ArrowUpRight,
 Filter,
 Check,
 ChevronRight,
 Layers,
} from 'lucide-react'

export default function SetoranStatusModal({
 isOpen,
 onClose,
 initialTab = 'sudah',
 details = {},
 onInputSetoran,
}) {
 const [activeTab, setActiveTab] = useState(initialTab)
 const [search, setSearch] = useState('')

 // Sync initial tab when modal opens
 React.useEffect(() => {
 if (isOpen) {
 setActiveTab(initialTab)
 setSearch('')
 }
 }, [isOpen, initialTab])

 // Handle ESC key to close
 React.useEffect(() => {
 const handleKeyDown = (e) => {
 if (e.key === 'Escape') onClose()
 }
 if (isOpen) {
 window.addEventListener('keydown', handleKeyDown)
 }
 return () => window.removeEventListener('keydown', handleKeyDown)
 }, [isOpen, onClose])

 const sudahList = details?.sudah_setor || []
 const belumList = details?.belum_setor || []
 const totalBinaan = details?.total_binaan || (sudahList.length + belumList.length)
 const sudahCount = details?.sudah_count ?? sudahList.length
 const belumCount = details?.belum_count ?? belumList.length
 const persentase = details?.persentase_selesai ?? (totalBinaan > 0 ? Math.round((sudahCount / totalBinaan) * 100) : 0)

 // Filtered lists based on search
 const filteredSudah = useMemo(() => {
 if (!search.trim()) return sudahList
 const q = search.toLowerCase()
 return sudahList.filter(
 (item) =>
 item.student_name?.toLowerCase().includes(q) ||
 item.nis?.toLowerCase().includes(q) ||
 item.class_name?.toLowerCase().includes(q) ||
 item.unit_name?.toLowerCase().includes(q) ||
 item.surah_name?.toLowerCase().includes(q)
 )
 }, [sudahList, search])

 const filteredBelum = useMemo(() => {
 if (!search.trim()) return belumList
 const q = search.toLowerCase()
 return belumList.filter(
 (item) =>
 item.student_name?.toLowerCase().includes(q) ||
 item.nis?.toLowerCase().includes(q) ||
 item.class_name?.toLowerCase().includes(q) ||
 item.unit_name?.toLowerCase().includes(q) ||
 item.parent_name?.toLowerCase().includes(q)
 )
 }, [belumList, search])

 const handleSendWa = (phone, text) => {
 if (!phone) return
 const cleanPhone = String(phone).replace(/\D/g, '').replace(/^0/, '62')
 const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
 window.open(url, '_blank')
 }

 const getKelancaranBadge = (label) => {
 const l = (label || '').toLowerCase()
 if (l.includes('lancar') || l.includes('mumtaz')) {
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
 {label || 'Lancar'}
 </span>
 )
 }
 if (l.includes('cukup') || l.includes('jayyid')) {
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {label || 'Cukup'}
 </span>
 )
 }
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {label || 'Perlu Bimbingan'}
 </span>
 )
 }

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
 {/* Backdrop blur */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
 />

 {/* Modal Container */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
 className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#1B2433] shadow-2xl shadow-emerald-950/20 border border-emerald-500/30 dark:border-emerald-700/60 overflow-hidden z-10 my-auto"
 >
 {/* Top Emerald Gradient Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

 {/* Header */}
 <div className="p-4 sm:p-6 pb-4 border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-start gap-3.5">
 <div className="flex size-11 sm:size-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-md shadow-xs shrink-0">
 <BookOpen className="size-5 sm:size-6 text-slate-600" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-xs font-extrabold">
 <Sparkles className="size-3 text-amber-500" />
 Monitoring Halaqah
 </span>
 <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
 {persentase}% Tuntas Hari Ini
 </span>
 </div>
 <h2 className="mt-1 text-lg sm:text-xl font-black text-slate-900 dark:text-white">
 Daftar Status Setoran Santri Hari Ini
 </h2>
 <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
 Rincian santri binaan yang sudah maupun belum menyetor hafalan Al-Qur'an hari ini.
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={onClose}
 className="rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:text-slate-200 transition-colors cursor-pointer"
 title="Tutup (Esc)"
 >
 <X className="size-5" />
 </button>
 </div>

 {/* Progress Summary Mini Strip */}
 <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60">
 <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
 <span className="flex items-center gap-1.5">
 <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 Progres Halaqah Hari Ini
 </span>
 <span className="text-emerald-700 dark:text-emerald-300">
 {sudahCount} / {totalBinaan} Santri ({persentase}%)
 </span>
 </div>
 <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 rounded-full h-2.5 overflow-hidden p-0.5 border border-emerald-200/80 dark:border-emerald-800/60">
 <div
 className="bg-white dark:bg-[#1B2433] h-full rounded-full transition-all duration-500"
 style={{ width: `${Math.min(100, Math.max(0, persentase))}%` }}
 />
 </div>
 </div>

 {/* Tabs & Search Bar */}
 <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 {/* Segmented Control Tabs */}
 <div className="inline-flex p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-700/80/80 shrink-0">
 <button
 type="button"
 onClick={() => setActiveTab('sudah')}
 className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
 activeTab === 'sudah'
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
 }`}
 >
 <CheckCircle2 className="size-3.5" />
 <span>Sudah Setor</span>
 <span
 className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
 activeTab === 'sudah'
 ? 'bg-emerald-700/60 text-white'
 : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
 }`}
 >
 {sudahCount}
 </span>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('belum')}
 className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
 activeTab === 'belum'
 ? 'bg-amber-600 text-white shadow-sm'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
 }`}
 >
 <UserX className="size-3.5" />
 <span>Belum Setor</span>
 <span
 className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
 activeTab === 'belum'
 ? 'bg-amber-700/60 text-white'
 : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
 }`}
 >
 {belumCount}
 </span>
 </button>
 </div>

 {/* Instant Search Bar */}
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder={
 activeTab === 'sudah'
 ? 'Cari santri, NIS, kelas, atau surah...'
 : 'Cari santri atau wali...'
 }
 className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[#151D2A] border border-emerald-200/80 dark:border-emerald-800/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
 />
 {search && (
 <button
 type="button"
 onClick={() => setSearch('')}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
 >
 <X className="size-3.5" />
 </button>
 )}
 </div>
 </div>
 </div>

 {/* Scrollable Content Body */}
 <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
 {activeTab === 'sudah' ? (
 /* TAB SUDAH SETOR */
 filteredSudah.length === 0 ? (
 <div className="py-12 text-center">
 <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mb-3 border border-emerald-200/80 dark:border-emerald-800/60">
 <BookOpen className="size-6" />
 </div>
 <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
 {search ? `Tidak ada santri sesuai kata kunci "${search}"` : 'Belum Ada Santri Menyetor Hari Ini'}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
 {search
 ? 'Coba ganti kata kunci pencarian nama santri, nomor induk, atau nama surah.'
 : 'Setoran hafalan santri binaan yang dicatat hari ini akan otomatis terdata di sini.'}
 </p>
 {search && (
 <button
 type="button"
 onClick={() => setSearch('')}
 className="mt-3 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
 >
 Reset Pencarian
 </button>
 )}
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-2.5">
 {filteredSudah.map((item, idx) => (
 <div
 key={item.id || idx}
 className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-[#1B2433] transition-all shadow-xs"
 >
 {/* Santri Info */}
 <div className="flex items-start gap-3 min-w-0">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 font-black text-xs shadow-sm">
 {item.student_name ? item.student_name.slice(0, 2).toUpperCase() : 'SN'}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white ">
 {item.student_name}
 </h4>
 <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 NIS: {item.nis}
 </span>
 <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {item.class_name} • {item.unit_name}
 </span>
 </div>

 {/* Hafalan Detail */}
 <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
 <span className="font-black text-[#059669] dark:text-[#10B981] flex items-center gap-1">
 <BookOpen className="size-3.5" />
 {item.surah_name} (Ayat {item.ayah_start}-{item.ayah_end})
 </span>
 <span className="text-slate-400">•</span>
 <span className="font-semibold text-slate-700 dark:text-slate-300">
 {item.baris || 0} Baris
 </span>
 {item.murajaah && (
 <>
 <span className="text-slate-400">•</span>
 <span className="text-xs text-sky-700 dark:text-sky-300 font-medium">
 Murajaah: {item.murajaah}
 </span>
 </>
 )}
 </div>

 {/* Catatan Guru */}
 {item.notes_teacher && (
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">
 "{item.notes_teacher}"
 </p>
 )}
 </div>
 </div>

 {/* Status Badges & Actions */}
 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 {getKelancaranBadge(item.kelancaran)}

 {item.time && (
 <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
 <Clock className="size-3 text-emerald-600 dark:text-emerald-400" />
 {item.time} WIB
 </span>
 )}

 {item.parent_phone && (
 <button
 type="button"
 onClick={() =>
 handleSendWa(
 item.parent_phone,
 `Assalamu'alaikum Warahmatullahi Wabarakatuh, Alhamdulillah ananda ${item.student_name} telah menyelesaikan setoran hafalan Al-Qur'an hari ini: Surah ${item.surah_name} (Ayat ${item.ayah_start}-${item.ayah_end}) dengan kelancaran "${item.kelancaran || 'Lancar'}". Jazakumullah khair.`
 )
 }
 className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-2.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 transition-colors cursor-pointer shadow-xs"
 title="Kirim Laporan via WhatsApp ke Orang Tua"
 >
 <MessageCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 <span className="hidden sm:inline">Kabar Ortu</span>
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 )
 ) : (
 /* TAB BELUM SETOR */
 filteredBelum.length === 0 ? (
 <div className="py-12 text-center">
 <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-3 border border-emerald-200/80 dark:border-emerald-800/60">
 <Sparkles className="size-6 text-amber-500" />
 </div>
 <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
 {search ? `Tidak ada santri sesuai kata kunci "${search}"` : 'Masya Allah! Seluruh Santri Telah Setor'}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
 {search
 ? 'Coba ganti kata kunci pencarian nama santri atau kelas.'
 : `Seluruh ${totalBinaan} santri binaan halaqah telah menuntaskan setoran hafalan hari ini. Barakallahu fikum!`}
 </p>
 {search && (
 <button
 type="button"
 onClick={() => setSearch('')}
 className="mt-3 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
 >
 Reset Pencarian
 </button>
 )}
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-2.5">
 {filteredBelum.map((item, idx) => (
 <div
 key={item.id || idx}
 className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-[#1B2433] transition-all shadow-xs"
 >
 {/* Santri Info */}
 <div className="flex items-start gap-3 min-w-0">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] font-black text-xs shadow-sm">
 {item.student_name ? item.student_name.slice(0, 2).toUpperCase() : 'SN'}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white ">
 {item.student_name}
 </h4>
 <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 NIS: {item.nis}
 </span>
 <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {item.class_name} • {item.unit_name}
 </span>
 </div>

 <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
 <UserX className="size-3.5" />
 Belum melakukan setoran hafalan Al-Qur'an hari ini
 </p>

 {item.parent_name && (
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 Wali: <span className="font-semibold">{item.parent_name}</span>
 {item.parent_phone ? ` (${item.parent_phone})` : ' (Nomor kontak belum tersedia)'}
 </p>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 {item.parent_phone && (
 <button
 type="button"
 onClick={() =>
 handleSendWa(
 item.parent_phone,
 `Assalamu'alaikum Warahmatullahi Wabarakatuh Ayah/Bunda dari ananda ${item.student_name} (${item.class_name}), kami mengingatkan bahwa ananda belum melakukan setoran hafalan Al-Qur'an hari ini di halaqah. Mohon kiranya dapat dimotivasi dan dipersiapkan hafalannya. Jazakumullah khair.`
 )
 }
 className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-200 transition-colors cursor-pointer shadow-xs"
 title="Kirim pesan pengingat WA ke orang tua"
 >
 <MessageCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
 <span>Ingatkan Ortu</span>
 </button>
 )}

 <button
 type="button"
 onClick={() => {
 onClose()
 if (onInputSetoran) onInputSetoran(item.id)
 }}
 className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white hover:from-emerald-700 hover:to-teal-700 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs shadow-sm"
 >
 <Plus className="size-3.5 text-emerald-600" />
 <span>Input Setoran</span>
 </button>
 </div>
 </div>
 ))}
 </div>
 )
 )}
 </div>

 {/* Modal Footer */}
 <div className="p-4 sm:p-5 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
 <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Menampilkan{' '}
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {activeTab === 'sudah' ? filteredSudah.length : filteredBelum.length}
 </span>{' '}
 dari total <span className="font-bold text-slate-800 dark:text-slate-200">{totalBinaan}</span> santri binaan halaqah.
 </div>

 <div className="flex items-center gap-2 self-end sm:self-center">
 <button
 type="button"
 onClick={onClose}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800 hover:bg-emerald-50/40 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
 >
 Tutup
 </button>
 <button
 type="button"
 onClick={() => {
 onClose()
 if (onInputSetoran) onInputSetoran()
 }}
 className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] hover:from-emerald-700 hover:to-teal-800 px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm"
 >
 <Plus className="size-3.5 text-slate-600" />
 <span>Input Setoran Baru</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 )
}

SetoranStatusModal.propTypes = {
 isOpen: PropTypes.bool.isRequired,
 onClose: PropTypes.func.isRequired,
 initialTab: PropTypes.oneOf(['sudah', 'belum']),
 details: PropTypes.shape({
 sudah_setor: PropTypes.array,
 belum_setor: PropTypes.array,
 total_binaan: PropTypes.number,
 sudah_count: PropTypes.number,
 belum_count: PropTypes.number,
 persentase_selesai: PropTypes.number,
 }),
 onInputSetoran: PropTypes.func,
}
