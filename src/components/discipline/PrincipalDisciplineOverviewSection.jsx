import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 ShieldAlert,
 ShieldCheck,
 AlertTriangle,
 FileText,
 Users,
 Scale,
 Sparkles,
 Layers,
 ChevronRight,
 TrendingDown,
 RefreshCw,
 Clock,
 CheckCircle2,
 AlertCircle,
 Eye,
} from 'lucide-react'
import { Chip as HeroChip, Button as HeroButton, Spinner as HeroSpinner } from '@heroui/react'
import { disciplineService } from '../../services/disciplineService'

export default function PrincipalDisciplineOverviewSection({ unitId, onOpenStudentSummary }) {
 const [loading, setLoading] = useState(true)
 const [data, setData] = useState(null)
 const [error, setError] = useState(null)

 const fetchOverview = async () => {
 setLoading(true)
 setError(null)
 try {
 const res = await disciplineService.getPrincipalOverview(unitId ? { unit_id: unitId } : undefined)
 if (res.success && res.data) {
 setData(res.data)
 } else {
 setError(res.message || 'Gagal memuat radar kedisiplinan unit.')
 }
 } catch (err) {
 console.error('Failed to fetch principal discipline overview:', err)
 setError(err?.response?.data?.message || 'Gagal memuat radar kedisiplinan unit.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchOverview()
 }, [unitId])

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-white border border-emerald-200/80 shadow-xs dark:bg-[#182232] dark:border-emerald-800/60">
 <HeroSpinner color="primary" label="Menghubungkan ke Radar Kedisiplinan Unit..." />
 </div>
 )
 }

 if (error || !data) {
 return (
 <div className="p-6 rounded-xl bg-rose-50/50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-800 dark:bg-rose-950/20 dark:border-emerald-800/60 dark:text-rose-300 text-center">
 <AlertCircle className="w-8 h-8 mx-auto text-rose-600 mb-2" />
 <p className="font-bold text-sm">{error || 'Data kedisiplinan unit tidak tersedia.'}</p>
 <HeroButton size="sm" color="danger" variant="flat" className="mt-3 font-bold" onPress={fetchOverview}>
 Coba Lagi
 </HeroButton>
 </div>
 )
 }

 const { kpi, early_warning_students, warning_letters, violations_by_class, violations_by_cluster, unit } = data

 return (
 <div className="space-y-6">
 {/* ── 1. MODERN HERO CARD (HEROUI + HERO UI GLOW) ── */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">

 <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
 <div className="flex items-start gap-4">
 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <Scale className="h-7 w-7 text-slate-600" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
 <Sparkles className="h-3 w-3" /> Radar Kedisiplinan & Otorisasi SP
 </span>
 <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-300">
 Unit: {unit?.name || 'Satuan Pendidikan'}
 </span>
 </div>
 <h2 className="mt-1.5 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
 Pengawasan Tata Tertib & Buku Poin Siswa
 </h2>
 <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
 Deteksi dini siswa berisiko sanksi, monitoring akumulasi pelanggaran harian, dan tindak lanjut Surat Peringatan (SP).
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 self-start md:self-auto">
 <HeroButton
 size="sm"
 variant="flat"
 color="primary"
 className="inline-flex items-center gap-1.5 font-black rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xs"
 onPress={fetchOverview}
 >
 <RefreshCw className="h-3.5 w-3.5 shrink-0" />
 <span>Segarkan Data</span>
 </HeroButton>
 </div>
 </div>
 </div>

 {/* ── 2. MASTER STATS GRID (4 KARTU KPI UNIT) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Kepatuhan */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-emerald-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Tingkat Kepatuhan Unit
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">{kpi.compliance_rate}%</p>
            <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80">Siswa Tertib</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 font-medium">{kpi.clean_students} dari {kpi.total_students} Santri</span>
            <span className="inline-flex items-center rounded-md bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              0 Poin Bersih
            </span>
          </div>
        </div>

        {/* KPI 2: Siswa Rawan & Kritis */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-rose-100/90 hover:!bg-rose-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-rose-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Siswa Rawan (≥100 Poin)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-rose-600 !text-white shadow-sm dark:!bg-rose-600 dark:!text-white">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-rose-800 dark:text-rose-200">{kpi.high_risk_count}</p>
            <span className="text-xs font-bold text-rose-700/80 dark:text-rose-400/80">Santri Kritis</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-rose-800/80 dark:text-rose-300/80 font-medium">Ambang Sanksi ST/SP</span>
            <span className="inline-flex items-center rounded-md bg-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
              Perlu Perhatian
            </span>
          </div>
        </div>

        {/* KPI 3: Surat Peringatan */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 hover:!bg-amber-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-amber-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Surat Peringatan (SP)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-amber-800 dark:text-amber-200">{kpi.total_sp_count}</p>
            <span className="text-xs font-bold text-amber-700/80 dark:text-amber-400/80">Surat Resmi</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80 font-medium">Tercatat di Sistem</span>
            <span className="inline-flex items-center rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
              ST / SP1 / SP2
            </span>
          </div>
        </div>

        {/* KPI 4: Total Poin Akumulasi */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-indigo-100/90 hover:!bg-indigo-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-indigo-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              Poin Pelanggaran Unit
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-indigo-600 !text-white shadow-sm dark:!bg-indigo-600 dark:!text-white">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-indigo-800 dark:text-indigo-200">{kpi.total_violation_points}</p>
            <span className="text-xs font-bold text-indigo-700/80 dark:text-indigo-400/80">Total Poin</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 dark:border-emerald-800/60">
            <span className="text-[10px] text-indigo-800/80 dark:text-indigo-300/80 font-medium">Dari batas 250 poin TU</span>
            <span className="inline-flex items-center rounded-md bg-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
              Skala TU
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. DUA KOLOM: RADAR EARLY WARNING & RIWAYAT SP ── */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
 {/* Col 1: Radar Early Warning Siswa Kritis */}
 <div className="flex flex-col rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433] overflow-hidden">
 <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50">
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
 <AlertTriangle className="h-4 w-4" />
 </div>
 <div>
 <h3 className="text-sm font-black text-slate-900 dark:text-white">
 Radar Siswa Rawan & Kritis
 </h3>
 <p className="text-xs text-slate-500">Akumulasi poin mendekati atau melewati ambang sanksi</p>
 </div>
 </div>
 <HeroChip size="sm" color="danger" variant="flat" className="font-extrabold text-[10px]">
 {early_warning_students.length} Siswa Terdeteksi
 </HeroChip>
 </div>

 <div className="flex-1 p-4 divide-y divide-emerald-100/80 dark:divide-emerald-900/40 overflow-y-auto max-h-[420px]">
 {early_warning_students.length === 0 ? (
 <div className="py-12 text-center text-slate-500">
 <ShieldCheck className="h-10 w-10 mx-auto text-emerald-500 mb-2 opacity-80" />
 <p className="font-bold text-xs">Alhamdulillah, Nihil Siswa Berstatus Rawan di Unit Ini.</p>
 <p className="text-xs text-slate-400 mt-0.5">Seluruh santri menjaga adab dan kedisiplinan dengan sangat baik.</p>
 </div>
 ) : (
 early_warning_students.map((st) => (
 <div key={st.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <h4 className="text-xs font-black text-slate-900 dark:text-white ">
 {st.full_name}
 </h4>
 <HeroChip
 size="sm"
 variant="flat"
 color={st.total_points >= 150 ? 'danger' : st.total_points >= 100 ? 'warning' : 'default'}
 className="text-[9px] font-black h-5"
 >
 {st.stage_name}
 </HeroChip>
 </div>
 <p className="text-xs text-slate-500 mt-0.5">
 NIS: <b className="text-slate-700 dark:text-slate-300">{st.nis}</b> • Rombel: <b className="text-slate-700 dark:text-slate-300">{st.kelas}</b>
 </p>
 {/* Mini Speedometer Progress Bar */}
 <div className="mt-1.5 flex items-center gap-2">
 <div className="w-full h-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div
 className={`h-full rounded-full ${
 st.total_points >= 150
 ? 'bg-rose-600'
 : st.total_points >= 100
 ? 'bg-amber-500'
 : 'bg-emerald-500'
 }`}
 style={{ width: `${Math.min(100, (st.total_points / 250) * 100)}%` }}
 />
 </div>
 <span className="text-[10px] font-black tabular-nums text-slate-700 dark:text-slate-300 shrink-0">
 {st.total_points}/250
 </span>
 </div>
 </div>

 <div className="shrink-0 flex items-center gap-1.5">
 {onOpenStudentSummary && (
 <HeroButton
 size="sm"
 variant="light"
 isIconOnly
 className="rounded-xl text-slate-500 hover:text-emerald-600"
 onPress={() => onOpenStudentSummary(st.id)}
 title="Lihat Lembar Skor Santri"
 >
 <Eye className="h-4 w-4" />
 </HeroButton>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 {/* Col 2: Surat Peringatan Terbitan & Pemanggilan Ortu */}
 <div className="flex flex-col rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433] overflow-hidden">
 <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50">
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
 <FileText className="h-4 w-4" />
 </div>
 <div>
 <h3 className="text-sm font-black text-slate-900 dark:text-white">
 Surat Peringatan & Respon Ortu
 </h3>
 <p className="text-xs text-slate-500">Status tindak lanjut dan konseling orang tua</p>
 </div>
 </div>
 <HeroChip size="sm" color="warning" variant="flat" className="font-extrabold text-[10px]">
 {warning_letters.length} Terdaftar
 </HeroChip>
 </div>

 <div className="flex-1 p-4 divide-y divide-emerald-100/80 dark:divide-emerald-900/40 overflow-y-auto max-h-[420px]">
 {warning_letters.length === 0 ? (
 <div className="py-12 text-center text-slate-500">
 <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2 opacity-80" />
 <p className="font-bold text-xs">Nihil Surat Peringatan di Unit Ini.</p>
 <p className="text-xs text-slate-400 mt-0.5">Tidak ada santri yang membutuhkan penerbitan ST atau SP resmi.</p>
 </div>
 ) : (
 warning_letters.map((wl) => (
 <div key={wl.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <span className="font-black text-xs text-slate-900 dark:text-white">
 {wl.student?.full_name || 'Santri'}
 </span>
 <HeroChip size="sm" color="danger" variant="dot" className="text-[9px] font-black h-5">
 {wl.letter_type?.toUpperCase()}
 </HeroChip>
 </div>
 <p className="text-xs text-slate-500 mt-0.5">
 No: <b className="text-slate-700 dark:text-slate-300">{wl.letter_number}</b> • Rombel: <b className="text-slate-700 dark:text-slate-300">{wl.student?.kelas?.nama_kelas || '-'}</b>
 </p>
 <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
 <Clock className="h-3 w-3" /> Tanggal Terbit: {wl.issue_date} • Akumulasi: <b className="text-rose-600">{wl.cumulative_points} Poin</b>
 </p>
 </div>
 <div className="shrink-0 text-right">
 <HeroChip
 size="sm"
 variant="flat"
 color={wl.parent_summon_status === 'selesai_konseling' ? 'success' : 'warning'}
 className="text-[9px] font-extrabold"
 >
 {wl.parent_summon_status === 'selesai_konseling' ? 'Konseling Selesai' : 'Menunggu Ortu'}
 </HeroChip>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>

 {/* ── 4. ANALISIS KELAS & KLUSTER PELANGGARAN ── */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Kasus per Rombel */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
 <Layers className="h-4 w-4 text-emerald-600" /> Pelanggaran Berdasarkan Rombel/Kelas
 </h4>
 <div className="space-y-2">
 {violations_by_class.length === 0 ? (
 <p className="text-xs text-slate-400 py-4 text-center">Nihil catatan pelanggaran di seluruh kelas.</p>
 ) : (
 violations_by_class.map((c, i) => (
 <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs font-medium">
 <span className="font-bold text-slate-800 dark:text-slate-200">{c.class_name}</span>
 <div className="flex items-center gap-3">
 <span className="text-xs text-slate-500">{c.count} Kasus</span>
 <HeroChip size="sm" color="danger" variant="flat" className="font-black text-[10px] h-5">
 +{c.total_points} Poin
 </HeroChip>
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 {/* Kasus per Kluster */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
 <Scale className="h-4 w-4 text-emerald-600" /> Distribusi Kluster Tata Tertib
 </h4>
 <div className="space-y-2">
 {violations_by_cluster.length === 0 ? (
 <p className="text-xs text-slate-400 py-4 text-center">Nihil catatan pelanggaran kluster.</p>
 ) : (
 violations_by_cluster.map((cl, i) => (
 <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs font-medium">
 <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs">
 {cl.cluster?.replace('_', ' ')}
 </span>
 <div className="flex items-center gap-3">
 <span className="text-xs text-slate-500">{cl.count} Kasus</span>
 <HeroChip size="sm" color="warning" variant="flat" className="font-black text-[10px] h-5">
 +{cl.total_points} Poin
 </HeroChip>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>
 )
}
