import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 ShieldAlert,
 ShieldCheck,
 AlertTriangle,
 Award,
 Calendar,
 User,
 Search,
 CheckCircle2,
 AlertCircle,
 Clock,
 Sparkles,
 Info,
 RefreshCw,
 FileText,
 TrendingDown,
 TrendingUp,
 ChevronRight,
 School,
 Layers,
 ChevronDown,
} from 'lucide-react'
import {
 Button as HeroButton,
 Chip as HeroChip,
 Input as HeroInput,
 Spinner as HeroSpinner,
} from '@heroui/react'
import { familyPortalService } from '../../services/familyPortalService'

export default function DisciplineSummaryWorkspace({ childId }) {
 const [data, setData] = useState(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [search, setSearch] = useState('')
 const [filterType, setFilterType] = useState('all') // 'all' | 'violation' | 'achievement'
 const [showThresholds, setShowThresholds] = useState(false)

 const loadData = async () => {
 try {
 setLoading(true)
 setError('')
 const res = await familyPortalService.disciplineSummary(childId)
 if (res?.success) {
 setData(res.data)
 } else {
 setError(res?.message || 'Gagal memuat rekapitulasi poin tata tertib.')
 }
 } catch (err) {
 setError(err?.response?.data?.message || 'Gagal memuat rekapitulasi poin tata tertib.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadData()
 }, [childId])

 const filteredTransactions = useMemo(() => {
 if (!data?.transactions) return []
 return data.transactions.filter((t) => {
 const pts = Number(t.points)
 if (filterType === 'violation' && pts >= 0) return false
 if (filterType === 'achievement' && pts <= 0) return false

 if (search.trim()) {
 const q = search.toLowerCase()
 const catName = t.category?.name?.toLowerCase() || ''
 const desc = t.description?.toLowerCase() || ''
 const reporter = t.reported_by?.name?.toLowerCase() || ''
 return catName.includes(q) || desc.includes(q) || reporter.includes(q)
 }
 return true
 })
 }, [data?.transactions, filterType, search])

 if (loading) {
 return (
 <div className="flex min-h-[360px] flex-col items-center justify-center gap-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-8 dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm animate-pulse">
 <ShieldAlert className="h-6 w-6" />
 </div>
 <div className="text-center">
 <p className="text-sm font-black text-slate-800 dark:text-white">Menyelaraskan Buku Poin Santri...</p>
 <p className="text-xs text-slate-400">Memuat catatan kepatuhan dari master tata tertib TU</p>
 </div>
 <HeroSpinner color="success" size="sm" />
 </div>
 )
 }

 if (error) {
 return (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/70 p-6 text-center shadow-md dark:border-emerald-800/60 dark:bg-rose-950/30">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
 <AlertTriangle className="h-6 w-6" />
 </div>
 <h4 className="mt-3 text-sm font-extrabold text-rose-900 dark:text-rose-200">{error}</h4>
 <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-400">
 Pastikan koneksi stabil atau hubungi bagian Tata Usaha sekolah.
 </p>
 <HeroButton
 color="danger"
 size="sm"
 variant="solid"
 onPress={loadData}
 className="mt-4 inline-flex items-center gap-1.5 font-bold cursor-pointer rounded-xl px-5"
 >
 <RefreshCw className="h-3.5 w-3.5 shrink-0" />
 <span>Muat Ulang</span>
 </HeroButton>
 </div>
 )
 }

 const cumulativePoints = data?.cumulative_points ?? data?.violation_points ?? 0
 const maxStandardPoints = data?.max_standard_points ?? 250
 const safePointsRemaining = data?.safe_points_remaining ?? Math.max(0, maxStandardPoints - cumulativePoints)
 const violationPoints = data?.violation_points ?? 0
 const achievementPoints = data?.achievement_points ?? 0
 const riskPercentage = data?.risk_percentage ?? Math.min(100, Math.round((cumulativePoints / maxStandardPoints) * 100))
 const isClean = cumulativePoints === 0
 const isHealthy = cumulativePoints < 31
 const isWarning = cumulativePoints >= 31 && cumulativePoints < 100
 const isDanger = cumulativePoints >= 100

 return (
 <div className="space-y-6">
 {/* ── 1. HERO HEADER: POIN DISIPLIN SANTRI (MODERN HERO CARD HEROUI) ── */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Dual Multi-tone Ambient Glow */}

 <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
 <div className="flex items-start gap-4">
 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <ShieldAlert className="h-7 w-7 text-slate-600" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
 <Sparkles className="h-3 w-3" /> Buku Poin & Tata Tertib Santri
 </span>
 <span
 className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-black border ${
 isClean
 ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-300'
 : isHealthy
 ? 'bg-teal-50 text-teal-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950/80 dark:border-emerald-800/60 dark:text-teal-300'
 : isWarning
 ? 'bg-amber-50 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/80 dark:border-emerald-800/60 dark:text-amber-300'
 : 'bg-rose-50 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/80 dark:border-emerald-800/60 dark:text-rose-300'
 }`}
 >
 Status: {isClean ? 'Sangat Baik (Nihil Catatan)' : isHealthy ? 'Baik (Sanksi Ringan)' : isWarning ? 'Waspada (Sanksi Sedang)' : 'Perhatian Khusus (ST/SP)'}
 </span>
 </div>
 <h2 className="mt-1.5 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
 {data?.student?.full_name || 'Santri'}
 </h2>
 <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
 NIS: <b className="text-slate-900 dark:text-white">{data?.student?.nis || '-'}</b> • Rombel:{' '}
 <b className="text-slate-900 dark:text-white">{data?.student?.kelas || '-'}</b> • Unit:{' '}
 <b className="text-slate-900 dark:text-white">{data?.student?.unit || 'Sekolah'}</b>{' '}
 <span className="inline-flex items-center rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/80">
 {data?.student?.is_boarding ? 'Asrama (Boarding)' : 'Fullday School'}
 </span>
 </p>
 </div>
 </div>

 {/* Poin Disiplin Display Box */}
 <div className="flex items-center gap-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/95 p-4 shadow-sm backdrop-blur-md dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="text-right">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
 Poin Disiplin
 </span>
 <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
 <span
 className={`text-3xl font-black tracking-tight ${
 isClean
 ? 'text-emerald-600 dark:text-emerald-400'
 : isHealthy
 ? 'text-teal-600 dark:text-teal-400'
 : isWarning
 ? 'text-amber-600 dark:text-amber-400'
 : 'text-rose-600 dark:text-rose-400'
 }`}
 >
 {cumulativePoints}
 </span>
 <span className="text-xs font-extrabold text-slate-400">/ {maxStandardPoints} Poin Maksimal TU</span>
 </div>
 </div>
 <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
 <div className="flex items-center justify-center">
 {isClean ? (
 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
 <ShieldCheck className="h-6 w-6" />
 </div>
 ) : isHealthy ? (
 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300">
 <ShieldCheck className="h-6 w-6" />
 </div>
 ) : (
 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
 <AlertTriangle className="h-6 w-6" />
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Progress Bar Akumulasi Pelanggaran terhadap Batas Maksimal TU */}
 <div className="mt-5 space-y-1.5 border-t border-emerald-200/80 dark:border-emerald-800/60 pt-3.5">
 <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
 <span className="flex items-center gap-1.5">
 <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Akumulasi Pelanggaran terhadap Batas Sanksi TU
 </span>
 <span className={`font-extrabold ${isClean ? 'text-emerald-700 dark:text-emerald-400' : isDanger ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
 {cumulativePoints === 0 ? '0 Poin (100% Bersih & Tertib)' : `${cumulativePoints} Poin (${riskPercentage}% Risiko Sanksi)`}
 </span>
 </div>
 <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-50 dark:bg-emerald-950/40">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(100, Math.max(0, (cumulativePoints / maxStandardPoints) * 100))}%` }}
 transition={{ duration: 0.8, ease: 'easeOut' }}
 className={`h-full rounded-full ${
 cumulativePoints >= 150
 ? 'bg-white dark:bg-[#1B2433]'
 : cumulativePoints >= 31
 ? 'bg-white dark:bg-[#1B2433]'
 : cumulativePoints > 0
 ? 'bg-white dark:bg-[#1B2433]'
 : 'bg-white dark:bg-[#1B2433]'
 }`}
 />
 </div>
 </div>
 </div>

 {/* ── 2. MASTER STATS GRID (4 KARTU KPI BERWARNA DENGAN SQUIRCLE ICON) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Batas Maksimal Sanksi TU */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 !bg-indigo-100/90 hover:!bg-indigo-200/70 p-4 shadow-xs transition hover:shadow-md dark:border-emerald-800/60 dark:!bg-indigo-950/50 dark:hover:!bg-indigo-950/70 hover:border-emerald-300 dark:hover:border-emerald-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              Batas Maksimal Sanksi
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-indigo-600 !text-white shadow-sm dark:!bg-indigo-600 dark:!text-white">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-black text-indigo-800 dark:text-indigo-200">{maxStandardPoints}</p>
            <span className="text-xs font-bold text-indigo-700/80 dark:text-indigo-300/80">Poin</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-indigo-700/90 dark:text-indigo-300/90">Ambang Level 6 Master TU</span>
            <span className="inline-flex items-center rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
              Standar TU
            </span>
          </div>
        </div>

        {/* Card 2: Total Pelanggaran */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 !bg-rose-100/90 hover:!bg-rose-200/70 p-4 shadow-xs transition hover:shadow-md dark:border-emerald-800/60 dark:!bg-rose-950/50 dark:hover:!bg-rose-950/70 hover:border-emerald-300 dark:hover:border-emerald-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Total Pelanggaran
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-rose-600 !text-white shadow-sm dark:!bg-rose-600 dark:!text-white">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-rose-800 dark:text-rose-200">-{violationPoints}</p>
            <span className="text-xs font-bold text-rose-700/80 dark:text-rose-300/80">Poin</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-rose-700/90 dark:text-rose-300/90 font-medium">Pengurangan kedisiplinan</span>
            <span className="inline-flex items-center rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-black text-rose-800 dark:bg-rose-900/80 dark:text-rose-200 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
              {data?.total_violations_count || 0} Kasus
            </span>
          </div>
        </div>

        {/* Card 3: Total Prestasi */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-4 shadow-xs transition hover:shadow-md dark:border-emerald-800/60 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70 hover:border-emerald-300 dark:hover:border-emerald-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Total Prestasi
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">+{achievementPoints}</p>
            <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-300/80">Poin</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-emerald-700/90 dark:text-emerald-300/90 font-medium">Apresiasi adab & capaian</span>
            <span className="inline-flex items-center rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
              {data?.total_achievements_count || 0} Apresiasi
            </span>
          </div>
        </div>

        {/* Card 4: Surat Peringatan */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 !bg-amber-100/90 hover:!bg-amber-200/70 p-4 shadow-xs transition hover:shadow-md dark:border-emerald-800/60 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70 hover:border-emerald-300 dark:hover:border-emerald-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Surat Peringatan (SP)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-amber-800 dark:text-amber-200">
              {data?.warning_letters?.length || 0}
            </p>
            <span className="text-xs font-bold text-amber-700/80 dark:text-amber-300/80">Surat</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-amber-700/90 dark:text-amber-300/90 font-medium">Diterbitkan Kesiswaan/TU</span>
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black ${
              data?.warning_letters?.length
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-white/90 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs'
            }`}>
              {data?.warning_letters?.length ? 'Ada SP Aktif' : 'Nihil SP'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. PANDUAN TINGKAT AMBANG BATAS SANKSI RESMI TU (COLLAPSIBLE ELEGANT) ── */}
 {data?.all_thresholds && data.all_thresholds.length > 0 && (
 <div className="overflow-hidden rounded-xl border-2 border-emerald-200/80 bg-white shadow-sm transition dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <button
 type="button"
 onClick={() => setShowThresholds(!showThresholds)}
 className="flex w-full items-center justify-between p-4 sm:p-5 text-left transition hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 cursor-pointer"
 >
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
 <Info className="h-5 w-5" />
 </div>
 <div>
 <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
 Panduan 6 Tingkat Ambang Batas Peringatan & Sanksi Resmi TU
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Pedoman akumulasi poin pelanggaran dan konsekuensi madrasah bagi santri
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-400 hidden sm:inline">
 {showThresholds ? 'Sembunyikan' : 'Lihat Detail'}
 </span>
 <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-transform dark:bg-emerald-950/60 dark:text-emerald-300 ${
 showThresholds ? 'rotate-180' : ''
 }`}>
 <ChevronDown className="h-4 w-4" />
 </div>
 </div>
 </button>

 <AnimatePresence>
 {showThresholds && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 transition={{ duration: 0.25 }}
 className="border-t border-emerald-200/80 p-4 sm:p-5 dark:border-emerald-800/60 bg-slate-50/40 dark:bg-slate-900/20"
 >
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
 {data.all_thresholds.map((th) => {
 const isReached = violationPoints >= th.min_points
 const pointRange = th.max_points
 ? `${th.min_points} - ${th.max_points} Poin`
 : `≥ ${th.min_points} Poin`

 return (
 <div
 key={th.id}
 className={`rounded-xl border-2 p-3.5 transition-all ${
 isReached
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/90 shadow-xs dark:border-emerald-800/60 dark:bg-rose-950/50'
 : 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433]'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
 isReached
 ? 'bg-rose-600 text-white'
 : 'bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
 }`}>
 Tingkat {th.stage_order}
 </span>
 <span className={`rounded-lg px-2 py-0.5 text-xs font-black ${
 isReached
 ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
 : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 }`}>
 {pointRange}
 </span>
 </div>

 <h5 className="mt-2 text-xs font-black text-slate-900 dark:text-white">
 {th.sanction_name || `Sanksi Tingkat ${th.stage_order}`}
 </h5>

 <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
 {th.sanction_details || 'Pembinaan adab dan evaluasi kedisiplinan santri.'}
 </p>

 {th.notes && (
 <div className="mt-2 rounded-lg bg-slate-100/80 p-2 text-[10px] text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
 <b>Catatan:</b> {th.notes}
 </div>
 )}
 </div>
 )
 })}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )}

 {/* ── 4. DATATABLE OUTER CONTAINER: RIWAYAT PENILAIAN PERILAKU & TATA TERTIB ── */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Toolbar Header */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 sm:px-5 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <FileText className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Riwayat Catatan Perilaku & Poin Kedisiplinan
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Pencatatan resmi berbasis 122 pasal tata tertib madrasah
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <span className="inline-flex items-center rounded-lg bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 px-2.5 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300">
 {filteredTransactions.length} dari {data?.transactions?.length || 0} catatan
 </span>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2.5 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 sm:px-5">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="relative w-full sm:w-72">
 <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari pasal, kata kunci, guru pencatat..."
 className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-8.5 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>

 {/* Filter Toggle Pills */}
 <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1 dark:border-emerald-800/60 dark:bg-slate-800">
 <button
 type="button"
 onClick={() => setFilterType('all')}
 className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
 filterType === 'all'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
 }`}
 >
 Semua Catatan
 </button>
 <button
 type="button"
 onClick={() => setFilterType('violation')}
 className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
 filterType === 'violation'
 ? 'bg-rose-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400'
 }`}
 >
 Pelanggaran ({data?.total_violations_count || 0})
 </button>
 <button
 type="button"
 onClick={() => setFilterType('achievement')}
 className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
 filterType === 'achievement'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400'
 }`}
 >
 Prestasi ({data?.total_achievements_count || 0})
 </button>
 </div>
 </div>
 </div>

 {/* Content Table / List */}
 {filteredTransactions.length === 0 ? (
 <div className="p-10 text-center">
 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <ShieldCheck className="h-8 w-8" />
 </div>
 <h4 className="mt-3 text-base font-black text-slate-800 dark:text-white">
 {search || filterType !== 'all'
 ? 'Tidak ada catatan yang sesuai dengan filter'
 : 'Alhamdulillah, Nihil Catatan Pelanggaran'}
 </h4>
 <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
 {search || filterType !== 'all'
 ? 'Silakan coba sesuaikan kata kunci pencarian atau ubah tombol filter.'
 : 'Ananda senantiasa mematuhi adab, tata tertib, dan menjaga akhlak karimah di lingkungan madrasah.'}
 </p>
 </div>
 ) : (
 <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {filteredTransactions.map((item, idx) => {
 const pts = Number(item.points)
 const isViolation = pts < 0
 return (
 <div
 key={item.id}
 className="p-4 sm:p-5 transition hover:bg-emerald-50/30 dark:hover:bg-slate-800/40"
 >
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
 <div className="flex items-start gap-3.5">
 <div
 className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${
 isViolation
 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
 : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
 }`}
 >
 {isViolation ? <AlertTriangle className="h-5 w-5" /> : <Award className="h-5 w-5" />}
 </div>

 <div className="space-y-1">
 <div className="flex flex-wrap items-center gap-2">
 <span
 className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black ${
 isViolation
 ? 'bg-rose-50 text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-300'
 : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300'
 }`}
 >
 {isViolation ? 'Pelanggaran' : 'Prestasi'}
 </span>
 {item.category?.cluster && (
 <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80">
 Klaster: {item.category.cluster}
 </span>
 )}
 <span className="text-xs font-semibold text-slate-400">
 • {item.transaction_date || '-'}
 </span>
 </div>

 <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
 {item.category?.code ? `[${item.category.code}] ` : ''}
 {item.category?.name || 'Catatan Kedisiplinan'}
 </h4>

 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 {item.description || '-'}
 </p>

 {item.follow_up && (
 <div className="mt-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-2.5 text-xs text-slate-700 dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-300">
 <span className="font-bold text-slate-900 dark:text-white">
 Tindak Lanjut / Konsekuensi TU:
 </span>{' '}
 {item.follow_up}
 </div>
 )}

 <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
 <span className="flex items-center gap-1 font-medium">
 <User className="h-3 w-3 text-slate-400" /> Dicatat oleh:{' '}
 <b className="text-slate-700 dark:text-slate-200">
 {item.reported_by?.name || 'Guru / Musyrif'}
 </b>
 </span>
 {item.status && (
 <span className="capitalize font-medium">
 • Status: <b className="text-slate-700 dark:text-slate-200">{item.status.replace('_', ' ')}</b>
 </span>
 )}
 </div>
 </div>
 </div>

 <div className="shrink-0 sm:text-right">
 <span
 className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-black shadow-xs ${
 isViolation
 ? 'bg-rose-100 text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:border-emerald-800/60 dark:text-rose-300'
 : 'bg-emerald-100 text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:border-emerald-800/60 dark:text-emerald-300'
 }`}
 >
 {pts > 0 ? `+${pts}` : pts} Poin
 </span>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 </div>
 )
}
