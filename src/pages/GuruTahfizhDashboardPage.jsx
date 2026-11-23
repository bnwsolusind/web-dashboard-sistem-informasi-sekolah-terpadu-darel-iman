import React, { useState, useEffect } from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  BookOpen,
  Award,
  CheckCircle2,
  UserX,
  Plus,
  FileText,
  Layers,
  RefreshCw,
  Sparkles,
  Eye,
  Target,
  Clock,
  Users,
  ChevronRight
} from 'lucide-react'
import {
  motion
} from 'framer-motion'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'

import {
  AppBreadcrumb,
  AppDataTable,
  AppBadge,
  PageContainer,
  KpiStatCard
} from '../components/app'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import {
  SquircleActionButton
} from '../components/master-data'
import TahfizhSubNav from '../components/tahfizh/TahfizhSubNav'
import SetoranStatusModal from '../components/tahfizh/SetoranStatusModal'

import {
  managementDashboardService
} from '../services/managementDashboardService'

const COLORS = ['#0E5C44', '#EF4444']

// ── MODERN CARD TONES (HeroUI Emerald Multi-Tone System) ──
const MODERN_CARD_TONES = {
 emerald: {
 card: 'border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] hover:border-emerald-500 shadow-md shadow-emerald-500/5-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
 glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
 iconBox: 'bg-emerald-50 border border-emerald-200 text-emerald-600',
 tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
 title: 'text-emerald-700 dark:text-emerald-400',
 val: 'text-emerald-700 dark:text-emerald-300',
 sub: 'text-emerald-600/80 dark:text-emerald-400/80',
 cta: 'text-emerald-600/60 dark:text-emerald-500/60',
 },
 blue: {
 card: 'border-2 border-blue-300 dark:border-blue-700/80 bg-white dark:bg-[#1B2433] hover:border-blue-500 shadow-md shadow-emerald-500/5-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
 glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
 iconBox: 'bg-emerald-50 border border-emerald-200 text-emerald-600',
 tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
 title: 'text-blue-700 dark:text-blue-400',
 val: 'text-blue-700 dark:text-blue-300',
 sub: 'text-blue-600/80 dark:text-blue-400/80',
 cta: 'text-blue-600/60 dark:text-blue-500/60',
 },
 purple: {
 card: 'border-2 border-purple-300 dark:border-purple-700/80 bg-white dark:bg-[#1B2433] hover:border-purple-500 shadow-md shadow-emerald-500/5-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
 glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
 iconBox: 'bg-emerald-50 border border-emerald-200 text-emerald-600',
 tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
 title: 'text-purple-700 dark:text-purple-400',
 val: 'text-purple-700 dark:text-purple-300',
 sub: 'text-purple-600/80 dark:text-purple-400/80',
 cta: 'text-purple-600/60 dark:text-purple-500/60',
 },
 rose: {
 card: 'border-2 border-rose-300 dark:border-rose-700/80 bg-white dark:bg-[#1B2433] hover:border-rose-500 shadow-md shadow-emerald-500/5-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
 glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
 iconBox: 'bg-emerald-50 border border-emerald-200 text-emerald-600',
 tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
 title: 'text-rose-700 dark:text-rose-400',
 val: 'text-rose-700 dark:text-rose-300',
 sub: 'text-rose-600/80 dark:text-rose-400/80',
 cta: 'text-rose-600/60 dark:text-rose-500/60',
 },
 amber: {
 card: 'border-2 border-amber-300 dark:border-amber-700/80 bg-white dark:bg-[#1B2433] hover:border-amber-500 shadow-md shadow-emerald-500/5-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
 glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
 iconBox: 'bg-emerald-50 border border-emerald-200 text-emerald-600',
 tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
 title: 'text-amber-700 dark:text-amber-400',
 val: 'text-amber-700 dark:text-amber-300',
 sub: 'text-amber-600/80 dark:text-amber-400/80',
 cta: 'text-amber-600/60 dark:text-amber-500/60',
 },
}

function ModernKpiCard({
  icon: Icon,
  title,
  label,
  value,
  subtitle,
  subtext,
  description,
  tag,
  badge,
  tone = 'emerald',
  variant,
  ctaText,
  onClick,
  active = false,
  isActive = false,
  className = '',
  trend,
  trendText,
  card,
  ...props
}) {
  return (
    <KpiStatCard
      icon={Icon || card?.icon}
      title={card?.title || title || label}
      value={card?.formattedValue ?? card?.value ?? value}
      description={card?.subtext || subtitle || subtext || description || (trendText ? `${trend ? trend + ' ' : ''}${trendText}` : undefined)}
      badge={card?.badgeText || badge || tag}
      tone={variant || tone || card?.tone || 'emerald'}
      ctaText={ctaText || card?.ctaText || card?.footerLabel}
      onClick={onClick || card?.onClick}
      className={className}
      active={active || isActive}
      trend={trend}
      trendText={trendText}
      card={card}
      {...props}
    />
  )
}

export default function GuruTahfizhDashboardPage() {
 const navigate = useNavigate()
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [data, setData] = useState(null)
 const [activeModal, setActiveModal] = useState(null)
 const [setoranModalOpen, setSetoranModalOpen] = useState(false)
 const [setoranModalTab, setSetoranModalTab] = useState('sudah')

 const handleOpenSetoranModal = (tab = 'sudah') => {
 setSetoranModalTab(tab)
 setSetoranModalOpen(true)
 }

 const fetchDashboard = async () => {
 setLoading(true)
 setError(null)
 try {
 const res = await managementDashboardService.getGuruTahfizh()
 if (res && res.data) {
 setData(res.data)
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to load Guru Tahfizh dashboard:', err)
 setError(err.response?.data?.message || 'Gagal memuat data dashboard Guru Tahfizh.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDashboard()
 }, [])

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

 const kpis = data?.kpis || {}
 const context = data?.context || {}
 const charts = data?.charts || {}
 const tables = data?.tables || {}

 const setoranDetails = charts?.setoran_details || {}
 const sudahList = setoranDetails?.sudah_setor || []
 const belumList = setoranDetails?.belum_setor || []
 const totalBinaan = setoranDetails?.total_binaan || kpis?.total_siswa_binaan?.total || (sudahList.length + belumList.length)
 const sudahCount = setoranDetails?.sudah_count ?? kpis?.siswa_sudah_setor?.total ?? sudahList.length
 const belumCount = setoranDetails?.belum_count ?? kpis?.siswa_belum_setor?.total ?? belumList.length
 const persentaseSelesai = setoranDetails?.persentase_selesai ?? (totalBinaan > 0 ? Math.round((sudahCount / totalBinaan) * 100) : 0)

 const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

 const setoranColumns = [
 {
 key: 'student',
 label: 'Siswa Binaan',
 render: (row) => (
 <span className="font-extrabold text-slate-900 dark:text-white text-xs">
 {row.student?.full_name || 'Siswa'}
 </span>
 ),
 },
 {
 key: 'surah',
 label: 'Surah & Ayat',
 render: (row) => (
 <span className="font-bold text-[#0E5C44] dark:text-[#3FBF75] text-xs">
 {row.hafalan_surah_name || 'Surah'} ({row.hafalan_ayah_start || 1}-{row.hafalan_ayah_end || 1})
 </span>
 ),
 },
 {
 key: 'baris',
 label: 'Baris',
 render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{row.hafalan_baris || row.line_count || 0} Baris</span>,
 },
 {
 key: 'murajaah',
 label: 'Murajaah',
 render: (row) => <AppBadge variant="info">{row.murajaah_text || `${row.murajaah_lembar || 0} Lembar`}</AppBadge>,
 },
 {
 key: 'date',
 label: 'Tanggal',
 render: (row) => (
 <span className="text-xs text-slate-500 font-medium">
 {row.record_date || row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-')}
 </span>
 ),
 },
 ]

 return (
 <PageContainer maxW="7xl">
 <div className="space-y-6 pb-12">
 {/* Breadcrumb Navigation */}
 <div className="mb-4 print:hidden">
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Dashboard Guru Tahfizh' }]} />
 </div>

 {/* MODERN HERO CARD HEADER (HeroUI Vivid Emerald Spec) */}
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="print:hidden">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">

 <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30">
                <BookOpen className="size-5 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-0.5 sm:px-3.5 sm:py-1 text-xs sm:text-xs font-extrabold shadow-sm">
 <Sparkles className="size-3 sm:size-3.5 text-amber-300 animate-pulse" />
 Workspace Guru Tahfizh
 </span>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {context.tahun_ajaran ? `TA ${context.tahun_ajaran.nama}` : 'Halaqah Tahfizh'}
 </span>
 </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Dashboard Guru Tahfizh / Musyrif
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <SquircleActionButton
 variant="primary"
 icon={Plus}
 label="Input Setoran"
 onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
 />
 <SquircleActionButton
                    variant="refresh"
                    icon={RefreshCw}
                    label="Segarkan Data"
                    onClick={fetchDashboard}
                    disabled={loading}
                    className={loading ? 'animate-spin' : ''}
                  />
            </div>
          </div>

          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
              Monitor setoran hafalan Al-Qur&apos;an, murajaah harian, dan capaian target santri/siswa binaan secara terpadu.
            </p>
          </div>
        </div>
 </div>
 </motion.div>

 {/* Tahfizh Sub-Navigation (5 tab modul terpadu) */}
 <TahfizhSubNav />

 {/* Primary KPI Grid (Modern Multi-Tone KPI Cards) */}
 <section className="space-y-3">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 Metrik Setoran &amp; Capaian Hafalan
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ringkasan santri binaan, setoran hari ini, dan progres murajaah</p>
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
 <ModernKpiCard
 label="Siswa Binaan"
 value={formatNumber(kpis.total_siswa_binaan?.total)}
 description="Total santri binaan halaqah"
 icon={BookOpen}
 tone="blue"
 tag="Halaqah"
 onClick={() => setActiveModal('total_siswa_binaan')}
 />
 <ModernKpiCard
 label="Setoran Hari Ini"
 value={formatNumber(kpis.setoran_hari_ini?.total)}
 description="Total setoran tercatat hari ini"
 icon={CheckCircle2}
 tone="emerald"
 tag="Tercatat"
 />
 <ModernKpiCard
 label="Siswa Sudah Setor"
 value={formatNumber(kpis.siswa_sudah_setor?.total)}
 description="Santri yang telah menyetor"
 icon={Award}
 tone="purple"
 tag="Tuntas"
 />
 <ModernKpiCard
 label="Siswa Belum Setor"
 value={formatNumber(kpis.siswa_belum_setor?.total)}
 description="Perlu ditindaklanjuti & dimotivasi"
 icon={UserX}
 tone="rose"
 tag="Follow Up"
 />
 </div>
 </section>

 {/* Secondary Volume KPIs */}
 <section className="space-y-3">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
 <ModernKpiCard
 label="Total Baris Setoran Hafalan"
 value={formatNumber(kpis.total_setoran_baris?.total)}
 description="Total baris hafalan baru tervalidasi"
 icon={Layers}
 tone="emerald"
 tag="Ziyadah"
 />
 <ModernKpiCard
 label="Total Murajaah (Lembar)"
 value={formatNumber(kpis.total_murajaah_lembar?.total)}
 description="Total lembar pengulangan hafalan mutqin"
 icon={BookOpen}
 tone="amber"
 tag="Murajaah"
 />
 </div>
 </section>

 {/* Quick Action Navigation (§K + Soft Squircle Action Buttons) */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/10">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-3">
 <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-md shadow-emerald-600/30">
 <FileText className="size-5.5 text-white" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Aksi Cepat Guru Tahfizh</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pintas input setoran hafalan, monitoring target, dan rekap harian</p>
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-2 shrink-0">
 <SquircleActionButton
 variant="primary"
 icon={Plus}
 label="Input Setoran"
 onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
 />
 <SquircleActionButton
 variant="view"
 icon={BookOpen}
 label="Monitoring Target"
 onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
 />
 <SquircleActionButton
 variant="export"
 icon={FileText}
 label="Rekap Harian"
 onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
 />
 </div>
 </div>
 </section>

 {/* Setoran Status Rich Card & Log Table */}
 <section className="space-y-3">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
 {/* RICH STATUS SETORAN HARI INI CARD */}
 <div className="lg:col-span-5 relative overflow-hidden rounded-2xl border-2 border-emerald-300/80 bg-white p-5 sm:p-6 shadow-md shadow-sm dark:border-emerald-700/80 dark:bg-[#1B2433] flex flex-col justify-between">
 <div>
 {/* Header Card */}
 <div className="flex items-start justify-between gap-3 mb-3.5">
 <div className="flex items-center gap-2.5">
 <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white shadow-sm shadow-teal-600/30">
 <Clock className="size-4.5 sm:size-5 text-white" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Status Setoran Hari Ini
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Perbandingan santri sudah vs belum setor
 </p>
 </div>
 </div>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-300/70 px-2.5 py-0.5 text-xs font-extrabold shrink-0">
 <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
 {persentaseSelesai}% Tuntas
 </span>
 </div>

 {/* Progress Bar Capaian */}
 <div className="mb-3.5 p-3 rounded-xl bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#151D2A] border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
 <Sparkles className="size-3 text-amber-500" />
 Capaian Halaqah Hari Ini
 </span>
 <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">
 {sudahCount} / {totalBinaan} Santri ({persentaseSelesai}%)
 </span>
 </div>
 <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 rounded-full h-2.5 overflow-hidden p-0.5">
 <div
 className="bg-white dark:bg-[#1B2433] h-full rounded-full transition-all duration-500"
 style={{ width: `${Math.min(100, Math.max(0, persentaseSelesai))}%` }}
 />
 </div>
 </div>

 {/* Dual Interactive Status Tiles */}
 <div className="grid grid-cols-2 gap-2.5 mb-3.5">
 <div
 onClick={() => handleOpenSetoranModal('sudah')}
 role="button"
 tabIndex={0}
 className="group relative overflow-hidden rounded-2xl border-2 border-emerald-300/80 bg-white dark:bg-[#1B2433] dark:border-emerald-700/80 dark:bg-[#1B2433] p-3 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-sm"
 >
 <div className="flex items-center justify-between mb-1">
 <span className="inline-flex size-6.5 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
 <CheckCircle2 className="size-3.5" />
 </span>
 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5">
 Rincian <ChevronRight className="size-3" />
 </span>
 </div>
 <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200">
 {sudahCount}
 </div>
 <div className="text-xs font-bold text-emerald-700/90 dark:text-emerald-400/90">
 Santri Sudah Setor
 </div>
 </div>

 <div
 onClick={() => handleOpenSetoranModal('belum')}
 role="button"
 tabIndex={0}
 className="group relative overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-white dark:bg-[#1B2433] dark:border-amber-700/80 dark:bg-[#1B2433] p-3 cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-sm"
 >
 <div className="flex items-center justify-between mb-1">
 <span className="inline-flex size-6.5 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs">
 <UserX className="size-3.5" />
 </span>
 <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 group-hover:underline flex items-center gap-0.5">
 Rincian <ChevronRight className="size-3" />
 </span>
 </div>
 <div className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-200">
 {belumCount}
 </div>
 <div className="text-xs font-bold text-amber-700/90 dark:text-amber-400/90">
 Santri Belum Setor
 </div>
 </div>
 </div>

 {/* Donut Chart Visual */}
 <div className="h-40 w-full my-1">
 {(!charts.setoran_summary || charts.setoran_summary.length === 0 || totalBinaan === 0) ? (
 <div className="h-full flex items-center justify-center text-xs text-slate-400">
 Belum ada data setoran hari ini
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={charts.setoran_summary || []}
 cx="50%"
 cy="50%"
 innerRadius={46}
 outerRadius={68}
 paddingAngle={5}
 dataKey="total"
 nameKey="status"
 >
 {(charts.setoran_summary || []).map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 )}
 </div>

 {/* Mini Preview: Santri Baru Setor Hari Ini */}
 <div className="mt-3 pt-3 border-t border-emerald-100/90 dark:border-emerald-900/60">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <Sparkles className="size-3.5 text-amber-500" />
 Santri Baru Setor Hari Ini
 </span>
 {sudahList.length > 0 && (
 <button
 type="button"
 onClick={() => handleOpenSetoranModal('sudah')}
 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
 >
 Lihat Semua ({sudahCount}) →
 </button>
 )}
 </div>

 {sudahList.length === 0 ? (
 <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/70 dark:border-emerald-800/70 text-center">
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Belum ada santri menyetor hari ini.
 </p>
 <button
 type="button"
 onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
 className="mt-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
 >
 <Plus className="size-3" /> Input setoran pertama
 </button>
 </div>
 ) : (
 <div className="space-y-1.5">
 {sudahList.slice(0, 3).map((item, idx) => (
 <div
 key={item.id || idx}
 onClick={() => handleOpenSetoranModal('sudah')}
 className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/60 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/50 transition-colors cursor-pointer text-xs"
 >
 <div className="flex items-center gap-2 min-w-0">
 <span className="flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[10px] font-black text-white shadow-xs">
 {item.student_name ? item.student_name[0] : 'S'}
 </span>
 <div className="min-w-0">
 <p className="font-bold text-slate-900 dark:text-white truncate">
 {item.student_name}
 </p>
 <p className="text-xs text-[#0E5C44] dark:text-[#3FBF75] font-semibold truncate">
 {item.surah_name} ({item.ayah_start}-{item.ayah_end})
 </p>
 </div>
 </div>
 <div className="flex items-center gap-1.5 shrink-0">
 {item.time && (
 <span className="text-[10px] text-slate-400 font-medium">
 {item.time} WIB
 </span>
 )}
 <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
 {item.kelancaran || 'Lancar'}
 </span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Card Footer CTA Button */}
 <div className="mt-3.5 pt-3 border-t border-emerald-100/90 dark:border-emerald-900/60">
 <button
 type="button"
 onClick={() => handleOpenSetoranModal('sudah')}
 className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-[#1B2433] hover:from-emerald-700 hover:to-teal-800 text-xs font-bold shadow-md shadow-sm transition-all cursor-pointer group"
 >
 <Users className="size-4" />
 <span>Lihat Rincian Santri ({sudahCount} Sudah • {belumCount} Belum)</span>
 <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
 </button>
 </div>
 </div>

 {/* RIWAYAT SETORAN TERBARU DATATABLE */}
 <div className="lg:col-span-7 relative overflow-hidden rounded-2xl border-2 border-emerald-300/80 bg-white shadow-md shadow-sm dark:border-emerald-700/80 dark:bg-[#1B2433]">
 <div className="p-4 sm:p-5 border-b border-emerald-100/90 dark:border-emerald-900/60 bg-slate-50/50 dark:bg-slate-900/50">
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Riwayat Setoran Terbaru
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Catatan hafalan dan murajaah siswa binaan halaqah
 </p>
 </div>
 <div className="p-4">
 <AppDataTable
 title=""
 description=""
 data={tables.recent_logs || []}
 columns={setoranColumns}
 keyField="student"
 searchPlaceholder="Cari siswa atau surah..."
 />
 </div>
 </div>
 </div>
 </section>

 {/* Dedicated Setoran Status Modal (Sudah vs Belum Setor) */}
 <SetoranStatusModal
 isOpen={setoranModalOpen}
 onClose={() => setSetoranModalOpen(false)}
 initialTab={setoranModalTab}
 details={setoranDetails}
 onInputSetoran={(studentId) => {
 navigate(studentId ? `/portal-guru/workspace?tab=tahfizh&student_id=${studentId}` : '/portal-guru/workspace?tab=tahfizh')
 }}
 />

 {/* Global KPI Detail Modal */}
 <ModalErrorBoundary onClose={() => setActiveModal(null)}>
 <KpiQuickViewModal
 type={activeModal}
 isOpen={Boolean(activeModal)}
 onClose={() => setActiveModal(null)}
 />
 </ModalErrorBoundary>
 </div>
 </PageContainer>
 )
}
