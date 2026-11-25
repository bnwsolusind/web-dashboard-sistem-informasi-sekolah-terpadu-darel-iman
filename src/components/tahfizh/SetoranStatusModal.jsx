import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import AppModal from '../app/AppModal'
import { motion, AnimatePresence } from 'framer-motion'
import {
 X,
 Search,
 CheckCircle2,
 UserCheck,
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
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Status Setoran Halaqah"
      badge={`${totalBinaan} Santri`}
      description="Pantau santri yang sudah dan belum menyetorkan hafalan"
      icon={BookOpen}
      maxWidth="max-w-3xl"
      zIndex={70}
      subHeader={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/60 px-6 py-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('sudah')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'sudah'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700'
              }`}
            >
              <UserCheck className="size-3.5" />
              <span>Sudah Setor</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${activeTab === 'sudah' ? 'bg-white text-emerald-800' : 'bg-emerald-200/80 text-emerald-900'}`}>
                {sudahCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('belum')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'belum'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-700'
              }`}
            >
              <UserX className="size-3.5" />
              <span>Belum Setor</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${activeTab === 'belum' ? 'bg-white text-amber-800' : 'bg-amber-200/80 text-amber-900'}`}>
                {belumCount}
              </span>
            </button>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'sudah' ? 'Cari santri, NIS, kelas, atau surah...' : 'Cari santri atau wali...'}
              className="h-9.5 w-full pl-9 pr-8 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border-2 border-[#b6f6d9] dark:border-emerald-700/80 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400"
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
      }
      footer={
        <div className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{activeTab === 'sudah' ? filteredSudah.length : filteredBelum.length}</span> dari total <span className="font-bold text-slate-800 dark:text-slate-200">{totalBinaan}</span> santri binaan halaqah.
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={onClose}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Tutup</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                if (onInputSetoran) onInputSetoran()
              }}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
            >
              <Plus className="size-4" />
              <span>Input Setoran Baru</span>
            </button>
          </div>
        </div>
      }
    >
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
    </AppModal>
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
