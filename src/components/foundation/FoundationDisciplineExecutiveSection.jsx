import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
 ShieldAlert,
 ShieldCheck,
 AlertTriangle,
 Crown,
 FileText,
 Award,
 Sparkles,
 RefreshCw,
 AlertCircle,
 Building2,
 CheckCircle2,
 Scale,
} from 'lucide-react'
import { Chip as HeroChip, Button as HeroButton, Spinner as HeroSpinner } from '@heroui/react'
import { disciplineService } from '../../services/disciplineService'

export default function FoundationDisciplineExecutiveSection() {
 const [loading, setLoading] = useState(true)
 const [data, setData] = useState(null)
 const [error, setError] = useState(null)

 const fetchOverview = async () => {
 setLoading(true)
 setError(null)
 try {
 const res = await disciplineService.getFoundationOverview()
 if (res.success && res.data) {
 setData(res.data)
 } else {
 setError(res.message || 'Gagal memuat overview eksekutif kedisiplinan yayasan.')
 }
 } catch (err) {
 console.error('Failed to fetch foundation discipline overview:', err)
 setError(err?.response?.data?.message || 'Gagal memuat overview eksekutif kedisiplinan yayasan.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchOverview()
 }, [])

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-white border border-emerald-200/80 shadow-xs dark:bg-card-dark dark:border-emerald-800/60">
 <HeroSpinner color="primary" label="Menghubungkan ke Ringkasan Eksekutif Adab Yayasan..." />
 </div>
 )
 }

 if (error || !data) {
 return (
 <div className="p-6 rounded-xl bg-rose-50/50 border border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800/60 dark:text-rose-300 text-center">
 <AlertCircle className="w-8 h-8 mx-auto text-rose-600 mb-2" />
 <p className="font-bold text-sm">{error || 'Data ringkasan eksekutif tidak tersedia.'}</p>
 <HeroButton size="sm" color="danger" variant="flat" className="mt-3 font-bold" onPress={fetchOverview}>
 Coba Lagi
 </HeroButton>
 </div>
 )
 }

 const { scorecard, critical_watchlist, severe_warning_letters, unit_ranking } = data

 return (
 <div className="space-y-6">
 {/* ── 1. HERO EXECUTIVE YAYASAN ── */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22]">
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <Crown className="size-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                  <Sparkles className="size-3" /> Ringkasan Eksekutif Yayasan
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/90 dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-300">
                  Pengurus & Pembina Yayasan
                </span>
              </div>
              <h2 className="mt-1.5 text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                Tata Kelola Karakter & Mitigasi Risiko Disiplin
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                Laporan makro iklim kepatuhan adab santri, pengawasan kasus sanksi berat (SP2/DO), dan perlindungan integritas lembaga.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeroButton
              size="sm"
              variant="flat"
              color="primary"
              className="inline-flex items-center gap-1.5 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-xs cursor-pointer border border-emerald-600"
              onPress={fetchOverview}
            >
              <RefreshCw className="size-3.5 shrink-0 text-white" />
              <span>Segarkan</span>
            </HeroButton>
          </div>
        </div>
      </div>

 {/* ── 2. MACRO EXECUTIVE SCORECARD ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Indeks Kepatuhan Adab Yayasan (Emerald Theme) */}
        <div className="group relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#F0FBF7]/50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-5 shadow-xs transition-all duration-200 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                <ShieldCheck className="size-5 text-white" />
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 shadow-2xs">
                0 Pelanggaran
              </span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider block mb-1 leading-snug text-emerald-800 dark:text-emerald-300">
              Indeks Kepatuhan Adab Yayasan
            </span>
            <strong className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight block my-1">
              {scorecard.compliance_rate}%
            </strong>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {scorecard.clean_students} dari {scorecard.total_students} Santri
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t border-emerald-100 dark:border-emerald-900/60">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              Santri Tertib
            </span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Detail &rarr;
            </span>
          </div>
        </div>

        {/* Card 2: Total Surat Peringatan Berat (Amber Theme) */}
        <div className="group relative overflow-hidden rounded-[22px] border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/60 via-[#FFFBEB]/50 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-5 shadow-xs transition-all duration-200 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                <FileText className="size-5 text-white" />
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 shadow-2xs">
                Level 4 - 6
              </span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider block mb-1 leading-snug text-amber-800 dark:text-amber-300">
              Total Surat Peringatan Berat
            </span>
            <strong className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight block my-1">
              {scorecard.total_severe_sp}
            </strong>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              SP1, SP2, dan Keluar
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t border-amber-100 dark:border-amber-900/60">
            <span className="text-amber-700 dark:text-amber-400 font-bold">
              Berkas SP
            </span>
            <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Detail &rarr;
            </span>
          </div>
        </div>

        {/* Card 3: Pelanggaran Kategori Berat (Rose Theme) */}
        <div className="group relative overflow-hidden rounded-[22px] border-2 border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/60 via-[#FFF1F2]/50 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-5 shadow-xs transition-all duration-200 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs">
                <AlertTriangle className="size-5 text-white" />
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 shadow-2xs">
                Mitigasi Hukum
              </span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider block mb-1 leading-snug text-rose-800 dark:text-rose-300">
              Pelanggaran Kategori Berat
            </span>
            <strong className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight block my-1">
              {scorecard.total_permanent_violations}
            </strong>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Asusila, Narkoba, Fisik
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t border-rose-100 dark:border-rose-900/60">
            <span className="text-rose-700 dark:text-rose-400 font-bold">
              Kasus Permanen
            </span>
            <span className="inline-flex items-center gap-0.5 text-rose-700 dark:text-rose-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Detail &rarr;
            </span>
          </div>
        </div>

        {/* Card 4: Status Integritas Yayasan (Teal Theme) */}
        <div className="group relative overflow-hidden rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/60 via-[#F0FDFA]/50 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-5 shadow-xs transition-all duration-200 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-teal-600 text-white shadow-xs">
                <Scale className="size-5 text-white" />
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 shadow-2xs">
                Aman
              </span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider block mb-1 leading-snug text-teal-800 dark:text-teal-300">
              Status Integritas Yayasan
            </span>
            <strong className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight block my-1">
              Terkendali
            </strong>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Zero Public Escalation
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t border-teal-100 dark:border-teal-900/60">
            <span className="text-teal-700 dark:text-teal-400 font-bold">
              Status Integritas
            </span>
            <span className="inline-flex items-center gap-0.5 text-teal-700 dark:text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Detail &rarr;
            </span>
          </div>
        </div>
      </div>
      {/* ── 3. CRITICAL ESCALATION WATCHLIST & REKOMENDASI KEPSEK ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Watchlist Kasus Berat & Permanen */}
        <div className="flex flex-col rounded-2xl border-2 border-emerald-500/25 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-emerald-500/20 dark:border-emerald-800/40 !bg-[#D5F2E3] dark:!bg-[#112a22] min-h-[72px]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
                <AlertTriangle className="size-4.5 text-white" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  Critical Watchlist: Kasus Berat & Sanksi Level Tinggi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Hanya menampilkan pelanggaran yang berpotensi pemulangan/pengeluaran
                </p>
              </div>
            </div>
            <span className="shrink-0 whitespace-nowrap inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black bg-rose-600 text-white shadow-xs">
              {critical_watchlist.length} Kasus
            </span>
          </div>

          <div className="flex-1 p-4 divide-y divide-emerald-100/80 dark:divide-emerald-900/40 overflow-y-auto max-h-[420px] bg-white dark:bg-[#1B2433]">
            {critical_watchlist.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <ShieldCheck className="size-10 mx-auto text-emerald-600 mb-2 opacity-80" />
                <p className="font-bold text-xs text-slate-700 dark:text-slate-200">Alhamdulillah, Nihil Kasus Kritis Berat di Seluruh Satuan Pendidikan.</p>
                <p className="text-xs text-slate-400 mt-0.5">Tidak ada santri yang terlibat pelanggaran permanen atau sanksi pemulangan.</p>
              </div>
            ) : (
              critical_watchlist.map((tr) => (
                <div key={tr.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 dark:text-white">
                        {tr.student?.full_name || 'Santri'}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-[9px] font-black">
                        {tr.category?.level?.toUpperCase() || 'BERAT'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                      {tr.category?.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Unit: <b>{tr.student?.educationUnit?.name || '-'}</b> • Rombel: <b>{tr.student?.kelas?.nama_kelas || '-'}</b> • Tanggal: {tr.transaction_date}
                    </p>
                    {tr.category?.direct_consequence && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Konsekuensi: <i className="text-slate-600 dark:text-slate-300">{tr.category.direct_consequence}</i>
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center rounded-md bg-rose-600 text-white px-2 py-0.5 text-xs font-black shadow-2xs">
                      +{tr.points} Poin
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Peringkat Kepatuhan Unit Binaan */}
        <div className="flex flex-col rounded-2xl border-2 border-emerald-500/25 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-emerald-500/20 dark:border-emerald-800/40 !bg-[#D5F2E3] dark:!bg-[#112a22] min-h-[72px]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Award className="size-4.5 text-white" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  Peringkat Kepatuhan Adab Unit Sekolah
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Evaluasi tahunan persentase kedisiplinan per unit
                </p>
              </div>
            </div>
            <span className="shrink-0 whitespace-nowrap inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black bg-emerald-600 text-white shadow-xs">
              {unit_ranking.length} Unit
            </span>
          </div>

          <div className="flex-1 p-4 divide-y divide-emerald-100/80 dark:divide-emerald-900/40 overflow-y-auto max-h-[420px] bg-white dark:bg-[#1B2433]">
            {unit_ranking.map((u, idx) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${idx === 0 ? 'bg-amber-500 text-white shadow-xs' : idx === 1 ? 'bg-slate-400 text-white shadow-xs' : idx === 2 ? 'bg-amber-700 text-white shadow-xs' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-white">{u.name}</h5>
                    <p className="text-[10px] text-slate-500">{u.total_students} Santri Terdaftar</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500"
                      style={{ width: `${u.compliance_rate}%` }}
                    />
                  </div>
                  <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {u.compliance_rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
            </div>
    </div>
  )
}
