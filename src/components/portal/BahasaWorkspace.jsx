import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Languages,
 Sparkles,
 BookOpen,
 Award,
 CheckCircle2,
 Clock,
 User,
 School,
 AlertCircle,
 HelpCircle,
 Volume2,
 MessageCircle,
 Filter,
 Search,
 CheckCircle,
 FileText,
 Star,
 Flame,
 HeartHandshake,
 ArrowRight,
 TrendingUp,
 RefreshCw,
} from 'lucide-react'
import {
 Card as HeroCard,
 Chip as HeroChip,
 Button as HeroButton,
} from '@heroui/react'
import { KpiStatCard } from '../app'
import api from '../../services/api'
import { cn } from '../../lib/utils'

const formatDate = (val) => {
 if (!val) return '-'
 try {
 return new Intl.DateTimeFormat('id-ID', {
 dateStyle: 'medium',
 }).format(new Date(val))
 } catch {
 return String(val)
 }
}

export default function BahasaWorkspace({ student, loading: parentLoading }) {
 const [activeSubTab, setActiveSubTab] = useState('setoran') // 'setoran' | 'target' | 'panduan'
 const [submissions, setSubmissions] = useState([])
 const [vocabularies, setVocabularies] = useState([])
 const [loading, setLoading] = useState(false)
 const [selectedLanguage, setSelectedLanguage] = useState('all') // 'all' | 'arabic' | 'english'
 const [searchWord, setSearchWord] = useState('')

 const studentId = student?.id || student?.student_id
 const unitId = student?.unit_id || student?.education_unit_id || student?.unit?.id

 const loadData = useCallback(async () => {
 if (!studentId) return
 setLoading(true)
 try {
 const [subRes, vocRes] = await Promise.allSettled([
 api.get('/vocabulary/submissions', { params: { student_id: studentId, per_page: 50 } }),
 api.get('/vocabulary/banks', { params: { status: 'approved', unit_id: unitId || undefined, per_page: 50 } }),
 ])

 if (subRes.status === 'fulfilled' && subRes.value?.data?.success) {
 const subData = subRes.value.data.data?.data || subRes.value.data.data || []
 setSubmissions(Array.isArray(subData) ? subData : [])
 }

 if (vocRes.status === 'fulfilled' && vocRes.value?.data?.success) {
 const vocData = vocRes.value.data.data?.data || vocRes.value.data.data || []
 setVocabularies(Array.isArray(vocData) ? vocData : [])
 }
 } catch (err) {
 console.error('Error loading bahasa data for student:', err)
 } finally {
 setLoading(false)
 }
 }, [studentId, unitId])

 useEffect(() => {
 loadData()
 }, [loadData])

 // Hitung KPI
 const stats = useMemo(() => {
 const total = submissions.length
 const mutqinCount = submissions.filter((s) => s.fluency_rating === 'mutqin').length
 const lancarCount = submissions.filter((s) => s.fluency_rating === 'lancar').length
 const mengulangCount = submissions.filter((s) => s.fluency_rating === 'mengulang').length

 let avgScore = 0
 if (total > 0) {
 const sum = submissions.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0)
 avgScore = Math.round(sum / total)
 }

 return {
 total,
 mutqinCount,
 lancarCount,
 mengulangCount,
 avgScore,
 activeVocabTotal: vocabularies.length,
 }
 }, [submissions, vocabularies])

 // Filter bank kosakata
 const filteredVocabularies = useMemo(() => {
 return vocabularies.filter((v) => {
 const matchLang = selectedLanguage === 'all' || String(v.language).toLowerCase() === selectedLanguage.toLowerCase()
 const matchSearch =
 !searchWord ||
 v.word?.toLowerCase().includes(searchWord.toLowerCase()) ||
 v.translation?.toLowerCase().includes(searchWord.toLowerCase()) ||
 v.theme?.toLowerCase().includes(searchWord.toLowerCase())
 return matchLang && matchSearch
 })
 }, [vocabularies, selectedLanguage, searchWord])

 const studentName = student?.name || student?.full_name || 'Ananda'
 const className = student?.class_name || student?.kelas?.nama_kelas || student?.kelas?.name || 'Kelas Aktif'

 return (
 <div className="space-y-6">
 {/* ── 1. HERO HEADER BANNER (HERO UI / HEROUI BENCHMARK) ── */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-br from-[#E6F8F3] via-white to-[#F0FDF9] dark:from-emerald-950/40 dark:via-[#1B2433] dark:to-teal-950/30 p-5 sm:p-6 shadow-md shadow-emerald-500/10">

 <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div className="flex items-start gap-4">
 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 border border-emerald-500/30">
 <Languages className="h-7 w-7" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white px-3 py-0.5 text-xs font-bold shadow-sm">
 <Sparkles className="h-3 w-3" />
 Bilingual Arab & Inggris
 </span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
 <User className="h-3 w-3" />
 {studentName} ({className})
 </span>
 </div>
 <h1 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
 Pembiasaan Bahasa & Setoran Kosakata
 </h1>
 <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
 Pantau materi kosakata resmi yang telah disahkan, capaian setoran hafalan harian ananda, serta catatan bimbingan guru penguji.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 self-start md:self-center">
 <button
 onClick={loadData}
 disabled={loading}
 className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/80 dark:bg-emerald-900/40 dark:text-emerald-300 transition-colors shadow-sm"
 >
 <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
 Segarkan
 </button>
 </div>
 </div>
 </div>

 {/* ── 2. KPI STATS CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiStatCard
          icon={BookOpen}
          title="Total Setoran"
          value={`${stats.total} kali`}
          description="Riwayat setoran hafalan kosakata"
          tone="emerald"
        />
        <KpiStatCard
          icon={Award}
          title="Predikat Mutqin"
          value={`${stats.mutqinCount} kosakata`}
          description="Hafal fasih & tepat dalam kalimat"
          tone="teal"
        />
        <KpiStatCard
          icon={TrendingUp}
          title="Rata-rata Nilai"
          value={`${stats.avgScore > 0 ? stats.avgScore : '-'} / 100`}
          description="Skor akumulasi kelancaran"
          tone="amber"
        />
        <KpiStatCard
          icon={Languages}
          title="Bank Kosakata Aktif"
          value={`${stats.activeVocabTotal} materi`}
          description="Disahkan Kepsek & Yayasan"
          tone="sky"
        />
      </div>

      {/* ── 3. SUB-TABS NAVIGATOR ── */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 flex-wrap gap-2">
 <div className="flex items-center gap-2">
 <button
 onClick={() => setActiveSubTab('setoran')}
 className={cn(
 "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
 activeSubTab === 'setoran'
 ? "bg-emerald-600 text-white shadow-sm"
 : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300"
 )}
 >
 <BookOpen className="h-4 w-4" />
 Log Setoran Ananda ({submissions.length})
 </button>

 <button
 onClick={() => setActiveSubTab('target')}
 className={cn(
 "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
 activeSubTab === 'target'
 ? "bg-emerald-600 text-white shadow-sm"
 : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300"
 )}
 >
 <Languages className="h-4 w-4" />
 Target Kosa Kata Pekan Ini ({vocabularies.length})
 </button>

 <button
 onClick={() => setActiveSubTab('panduan')}
 className={cn(
 "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
 activeSubTab === 'panduan'
 ? "bg-emerald-600 text-white shadow-sm"
 : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300"
 )}
 >
 <HeartHandshake className="h-4 w-4" />
 Panduan Pembiasaan di Rumah
 </button>
 </div>
 </div>

 {/* ── 4. SUB-TAB KONTEN ── */}
 {/* ────────────────── SUB-TAB 1: LOG SETORAN ANANDA ────────────────── */}
 {activeSubTab === 'setoran' && (
 <div className="space-y-4">
 {loading ? (
 <div className="flex flex-col items-center justify-center p-12 text-slate-500">
 <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
 <p className="text-sm font-semibold">Memuat riwayat setoran bahasa ananda...</p>
 </div>
 ) : submissions.length === 0 ? (
 <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-3">
 <BookOpen className="h-7 w-7" />
 </div>
 <h3 className="text-base font-bold text-slate-800 dark:text-white">Belum Ada Setoran Kosakata</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
 Ananda {studentName} belum memiliki riwayat setoran kosakata bahasa Arab/Inggris yang tercatat oleh guru penguji.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {submissions.map((sub) => {
 const isMutqin = sub.fluency_rating === 'mutqin'
 const isLancar = sub.fluency_rating === 'lancar'
 const badgeColor = isMutqin
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
 : isLancar
 ? 'bg-sky-100 text-sky-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-800/60'
 : 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-emerald-800/60'

 const ratingLabel = isMutqin ? 'Mutqin' : isLancar ? 'Lancar' : 'Perlu Mengulang'

 return (
 <div
 key={sub.id}
 className="relative overflow-hidden rounded-xl border-2 border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] p-5 shadow-sm transition-all hover:shadow-md"
 >
 <div
 className={cn(
 "absolute top-0 left-0 right-0 h-1",
 isMutqin ? "bg-emerald-500" : isLancar ? "bg-sky-500" : "bg-rose-500"
 )}
 />

 <div className="flex items-start justify-between gap-3">
 <div>
 <div className="flex items-center gap-2">
 <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-black border", badgeColor)}>
 {ratingLabel.toUpperCase()}
 </span>
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 {formatDate(sub.submission_date)}
 </span>
 </div>

 <h4 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
 {sub.vocabulary?.word || 'Kosakata'}
 </h4>
 <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
 Arti: {sub.vocabulary?.translation || '-'}
 </p>
 </div>

 <div className="flex flex-col items-end">
 <span className="text-xs font-bold text-slate-400">Skor Uji</span>
 <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
 {sub.score || 0}
 <span className="text-xs text-slate-400 font-semibold">/100</span>
 </span>
 </div>
 </div>

 {/* Catatan / Feedback Penguji */}
 {sub.notes && (
 <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-emerald-200/80 dark:border-emerald-700/80/60">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
 <MessageCircle className="h-3 w-3 text-emerald-600" />
 Catatan Guru Penguji:
 </span>
 <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 font-medium italic">
 "{sub.notes}"
 </p>
 </div>
 )}

 <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
 <span className="flex items-center gap-1">
 <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 Penguji: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{sub.teacher?.name || 'Ustadz / Ustadzah'}</strong>
 </span>
 <span className="capitalize text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
 {sub.vocabulary?.language || 'Arab'}
 </span>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 )}

 {/* ────────────────── SUB-TAB 2: TARGET KOSA KATA PEKAN INI ────────────────── */}
 {activeSubTab === 'target' && (
 <div className="space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 {/* Filter Bahasa */}
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-1">Bahasa:</span>
 <button
 onClick={() => setSelectedLanguage('all')}
 className={cn(
 "px-3 py-1 rounded-lg text-xs font-bold transition-all",
 selectedLanguage === 'all'
 ? "bg-emerald-600 text-white"
 : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80"
 )}
 >
 Semua ({vocabularies.length})
 </button>
 <button
 onClick={() => setSelectedLanguage('arabic')}
 className={cn(
 "px-3 py-1 rounded-lg text-xs font-bold transition-all",
 selectedLanguage === 'arabic'
 ? "bg-emerald-600 text-white"
 : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80"
 )}
 >
 Bahasa Arab
 </button>
 <button
 onClick={() => setSelectedLanguage('english')}
 className={cn(
 "px-3 py-1 rounded-lg text-xs font-bold transition-all",
 selectedLanguage === 'english'
 ? "bg-emerald-600 text-white"
 : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80"
 )}
 >
 Bahasa Inggris
 </button>
 </div>

 {/* Pencarian */}
 <div className="relative">
 <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari kata atau arti..."
 value={searchWord}
 onChange={(e) => setSearchWord(e.target.value)}
 className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>

 {filteredVocabularies.length === 0 ? (
 <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
 <p className="text-sm font-semibold text-slate-500">Tidak ada kosa kata yang cocok dengan filter.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredVocabularies.map((item) => (
 <div
 key={item.id}
 className="rounded-xl border-2 border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] p-4 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between mb-2">
 <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
 {item.language === 'arabic' ? 'Arab' : 'Inggris'}
 </span>
 <span className="text-xs font-semibold text-slate-400">
 Tema: {item.theme || 'Keseharian'}
 </span>
 </div>

 <h4 className="text-xl font-black text-slate-900 dark:text-white">
 {item.word}
 </h4>
 <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
 Arti: {item.translation}
 </p>

 {item.example_sentence && (
 <div className="mt-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
 Contoh Kalimat:
 </span>
 <p className="text-xs text-slate-700 dark:text-slate-300 italic">
 "{item.example_sentence}"
 </p>
 </div>
 )}
 </div>

 <div className="mt-3 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs text-slate-500">
 <span>Disahkan Divisi Yayasan</span>
 <span className="text-emerald-600 font-bold flex items-center gap-1">
 <CheckCircle2 className="h-3.5 w-3.5" />
 Materi Aktif
 </span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* ────────────────── SUB-TAB 3: PANDUAN PEMBIASAAN DI RUMAH ────────────────── */}
 {activeSubTab === 'panduan' && (
 <div className="space-y-4">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-sm">
 <HeartHandshake className="h-6 w-6" />
 </div>
 <div>
 <h3 className="text-base font-black text-slate-900 dark:text-white">
 Panduan Peran Orang Tua Dalam Pembiasaan Bahasa (Bilingual)
 </h3>
 <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
 Kemampuan berbahasa aktif terbentuk melalui pengulangan (*istimrar*) dan keberanian berbicara tanpa takut salah. Ayah dan Bunda dapat membantu ananda dengan langkah sederhana berikut:
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
 <div className="rounded-xl bg-white dark:bg-slate-800/80 p-4 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
 <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 text-xs font-black">1</span>
 Sapaan Rutin Harian
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Gunakan kosakata sapaan yang telah diajarkan di sekolah setiap bangun pagi, saat berangkat, dan menjelang tidur (misal: <em>Shabahul Khair / Good Morning, Kaifa Haluk? / How are you?</em>).
 </p>
 </div>

 <div className="rounded-xl bg-white dark:bg-slate-800/80 p-4 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
 <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm mb-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 text-xs font-black">2</span>
 Apresiasi & Hindari Mencela
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Beri pujian setiap kali ananda berani mengucapkan kata Arab atau Inggris di rumah. Jangan mentertawakan kesalahan pelafalan, cukup ulangi kembali dengan contoh pengucapan yang benar.
 </p>
 </div>

 <div className="rounded-xl bg-white dark:bg-slate-800/80 p-4 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
 <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-sm mb-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900 text-xs font-black">3</span>
 Dukung Hari Bahasa (Yaumul Lughah)
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Ingatkan ananda mengenai jadwal hari bahasa di sekolah (Selasa-Rabu: Bahasa Arab, Kamis-Jumat: Bahasa Inggris) agar ananda termotivasi untuk aktif berinteraksi dengan guru dan temannya.
 </p>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 )
}
