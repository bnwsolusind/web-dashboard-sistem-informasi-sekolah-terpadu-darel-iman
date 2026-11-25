import CustomSelect from "../components/ui/CustomSelect"
import {
  useToast
} from '../components/app/ToastProvider'
import React, { useState, useEffect } from 'react'
import {
  useNavigate
} from 'react-router-dom'
import api from '../services/api'
import {
  Cell,
  Line,
  LineChart,
  BarChart,
  Bar,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import {
  Building2,
  UserCheck,
  Users,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  School,
  Layers,
  FileSpreadsheet,
  Upload,
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  Target,
  Award,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  ChevronRight,
  Eye,
  Edit,
  Settings,
  BellRing,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Megaphone,
  Wallet,
  Fingerprint,
  RefreshCw,
  AlertTriangle,
  Check,
  X
} from 'lucide-react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import StatCard from '../components/StatCard'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import PageToolbarActions from '../components/app/PageToolbarActions'
import { SquircleActionButton } from '../components/master-data'
import {
  Badge
} from '@/components/ui/badge'
import {
  Button
} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Modal
} from '../components/ui/modal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'

const PRESTASI_COLORS = ['#10B981', '#0284C7', '#F59E0B', '#8B5CF6', '#EF4444']

const CustomChartTooltip = ({ active, payload, label }) => {
 if (active && payload && payload.length) {
 return (
 <div className="rounded-xl border border-emerald-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-emerald-700/80/80 dark:bg-slate-900/95 text-xs">
 {label && <p className="font-extrabold text-slate-900 dark:text-white mb-1.5 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-1">{label}</p>}
 <div className="space-y-1">
 {payload.map((item, idx) => (
 <div key={idx} className="flex items-center justify-between gap-4 text-xs">
 <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
 <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color || item.fill }} />
 {item.name}:
 </span>
 <span className="font-extrabold text-slate-900 dark:text-white">{item.value}</span>
 </div>
 ))}
 </div>
 </div>
 )
 }
 return null
}

export default function DashboardPage() {
 const navigate = useNavigate()
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [activeKpiModal, setActiveKpiModal] = useState(null)
 const [tabTahfizh, setTabTahfizh] = useState('unit')
 const [selectedTahfizUnitFilter, setSelectedTahfizUnitFilter] = useState('Semua Unit')
 const [loading, setLoading] = useState(true)
 const [apiData, setApiData] = useState(null)

 // Global toast integration
 const toast = useToast()
 const pushToast = (type, title, message = '') => {
 const tone = type === 'error' || type === 'danger' ? 'error' : type === 'warning' ? 'warning' : 'success'
 toast(message ? `${title}: ${message}` : title, tone)
 }

 // Fetch real data from backend API
 const fetchDashboardData = async () => {
 setLoading(true)
 try {
 const res = await api.get('/foundation/dashboard')
 if (res.data && res.data.data) {
 setApiData(res.data.data)
 }
 } catch (err) {
 console.error('Error fetching foundation dashboard:', err)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDashboardData()
 }, [])

 // KPI Metrics (Strictly derived from live DB payload)
 const kpis = apiData?.kpis || {}

 const getKpiData = (key, legacyKey) => {
 let total = 0
 let growth = 0

 if (kpis[key] && typeof kpis[key] === 'object') {
 total = kpis[key].total ?? 0
 growth = kpis[key].growth ?? 0
 } else if (kpis[`total_${key}`] !== undefined) {
 total = kpis[`total_${key}`]
 growth = kpis[`growth_${key}`] ?? 0
 } else if (legacyKey && kpis[legacyKey] !== undefined) {
 total = kpis[legacyKey]
 growth = kpis[`growth_${key}`] ?? 0
 }

 const absGrowth = Math.abs(growth)
 return {
 value: Number(total).toLocaleString('id-ID'),
 trend: absGrowth === 0 ? '0' : String(absGrowth),
 trendType: growth >= 0 ? 'up' : 'down',
 trendText: growth === 0 ? 'tidak ada perubahan' : 'dari bulan lalu'
 }
 }

 const kpiUnit = getKpiData('unit_pendidikan', 'total_unit')
 const kpiGuru = getKpiData('guru', 'total_guru')
 const kpiPegawai = getKpiData('pegawai', 'total_pegawai')
 const kpiSiswa = getKpiData('siswa', 'total_siswa_aktif')
 const kpiOrtu = getKpiData('orang_tua', 'total_ortu')
 const kpiAlumni = getKpiData('alumni', 'total_alumni')
 const kpiKelas = getKpiData('kelas', 'total_kelas')
 const kpiRombel = getKpiData('rombel', 'total_rombel')
 const kpiSiswaBaru = getKpiData('siswa_baru')
 const kpiMutasiMasuk = getKpiData('mutasi_masuk')
 const kpiMutasiKeluar = getKpiData('mutasi_keluar')
 const kpiSiswaBerhenti = getKpiData('siswa_berhenti')
 const kpiSiswaLulus = getKpiData('siswa_lulus')
 const kpiMenungguAlumni = getKpiData('menunggu_alumni')

 // Unit Education Table Data (Dynamic from DB if available)
 const dataUnitPendidikan = (apiData?.unit_summaries || []).map((u, idx) => ({
 no: idx + 1,
 id: u.id,
 name: u.name,
 siswa: Number(u.siswa_aktif_count || 0).toLocaleString('id-ID'),
 guru: String(u.guru_count || 0),
 pegawai: String(u.pegawai_count || 0),
 kelas: String(u.kelas_count || u.rombel_count || 0),
 rombel: String(u.rombel_count || u.kelas_count || 0),
 presensiSiswa: '-',
 presensiGuru: '-',
 tahfizh: '-',
 }))

 // Dynamic Announcements from DB if available
 const recentInformationList = (apiData?.recent_information || []).map((item) => ({
 title: item.judul,
 sub: item.isi || 'Pengumuman Resmi Yayasan',
 date: item.tanggal,
 }))

 // Donut chart data for Prestasi Siswa
 const dataPrestasiDonut = apiData?.charts?.prestasi_distribution || []

 // Grouped Bar chart data for Target vs Realisasi Tahfizh
 const dataTargetTahfizh = apiData?.charts?.tahfizh_target_progress || []

 // Line chart data for Tren Kehadiran Bulanan
 const dataKehadiranBulanan = apiData?.charts?.attendance_trend || []

 const handleExportData = () => {
 pushToast('success', 'Mengekspor Excel', 'Rekap data eksekutif yayasan sedang diunduh.')
 }

 const handleImportSubmit = (e) => {
 e.preventDefault()
 setIsImportModalOpen(false)
 pushToast('success', 'Import Berhasil', 'Data master telah diperbarui.')
 }

 return (
 <PageContainer maxW="7xl">
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Ringkasan Yayasan' }]} />
 <div className="space-y-6 pb-12 bg-slate-50/50 dark:bg-transparent min-h-screen">
 {/* 1. HERO BANNER WITH ISLAMIC DOME SILHOUETTE & MONITORING BADGE */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
 {/* Dual Multi-Tone Ambient Glow */}

 <div className="absolute inset-0 opacity-15 pointer-events-none">
 <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
 <defs>
 <pattern id="islamicHeroPattern" width="60" height="60" patternUnits="userSpaceOnUse">
 <path d="M 30,0 L 60,30 L 30,60 L 0,30 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" />
 <circle cx="30" cy="30" r="12" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill="url(#islamicHeroPattern)" />
 </svg>
 </div>

 <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-800 dark:text-emerald-100 border-2 border-emerald-300 backdrop-blur-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-300 animate-pulse" />
                  Mode Monitoring Eksekutif Yayasan
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pt-1">
                <span>Pengurus Yayasan</span>
                <span className="text-2xl">👋</span>
              </h2>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              <PageToolbarActions
                onExport={handleExportData}
                exportLabel="Export Laporan"
                showLabel
              />
            </div>
          </div>

          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs md:text-sm text-slate-700 dark:text-emerald-100/90 font-medium leading-relaxed">
              Monitoring agregat seluruh unit pendidikan, SDM, siswa, mutasi, kelulusan & alumni
            </p>
          </div>
        </div>
 </div>

 {/* 2. GLOBAL FILTER BAR LINTAS UNIT */}
 <div className="p-4 rounded-[22px] bg-white dark:bg-[#1B2433] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-md shadow-emerald-500/10 dark:border-emerald-800/60 shadow-sm space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
 <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 Filter Global Lintas Unit & Periode
 </span>
 <span className="text-xs text-slate-400 font-medium">Monitoring Real-Time</span>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
 <CustomSelect className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b302c] border border-emerald-200/80 dark:border-emerald-700/80 font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500">
 <option value="all">Tahun Ajaran: Semua</option>
 {(apiData?.academic_years || []).map((ay) => (
 <option key={ay.id || ay.name} value={ay.name || ay.id}>{ay.name}</option>
 ))}
 </CustomSelect>
 <CustomSelect className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b302c] border border-emerald-200/80 dark:border-emerald-700/80 font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500">
 <option value="all">Semester: Semua</option>
 <option value="ganjil">Ganjil</option>
 <option value="genap">Genap</option>
 </CustomSelect>
 <CustomSelect className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b302c] border border-emerald-200/80 dark:border-emerald-700/80 font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500">
 <option value="all">Unit: Semua Unit</option>
 {(apiData?.unit_summaries || []).map((u) => (
 <option key={u.id} value={u.id}>{u.name}</option>
 ))}
 </CustomSelect>
 <CustomSelect className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b302c] border border-emerald-200/80 dark:border-emerald-700/80 font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500">
 <option value="all">Jenis Unit: Semua</option>
 {(apiData?.jenis_units || []).map((ju) => (
 <option key={ju.id || ju.name} value={ju.id || ju.name}>{ju.name}</option>
 ))}
 </CustomSelect>
 <CustomSelect className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b302c] border border-emerald-200/80 dark:border-emerald-700/80 font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500">
 <option value="all">Kota/Kab: Semua</option>
 </CustomSelect>
 <CustomSelect className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b302c] border border-emerald-200/80 dark:border-emerald-700/80 font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500">
 <option value="all">Status: Semua</option>
 <option value="aktif">Aktif</option>
 <option value="nonaktif">Nonaktif</option>
 </CustomSelect>
 <CustomSelect className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b302c] border border-emerald-200/80 dark:border-emerald-700/80 font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500">
 <option value="year">Periode: Tahunan</option>
 <option value="month">Bulanan</option>
 <option value="semester">Semesteran</option>
 </CustomSelect>
 </div>
 </div>

 {/* 3. 12 KPI CARDS GRID WITH CLICK NAVIGATION */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
 <StatCard title="Total Unit Pendidikan" value={kpiUnit.value} trend={kpiUnit.trend} trendType={kpiUnit.trendType} trendText="unit sekolah" onClick={() => navigate('/dashboard/yayasan/unit-pendidikan')} />
 <StatCard title="Total Pegawai" value={kpiPegawai.value} trend={kpiPegawai.trend} trendType={kpiPegawai.trendType} trendText="pegawai aktif" onClick={() => navigate('/dashboard/yayasan/pegawai-guru')} />
 <StatCard title="Total Guru" value={kpiGuru.value} trend={kpiGuru.trend} trendType={kpiGuru.trendType} trendText="guru pengajar" onClick={() => navigate('/dashboard/yayasan/pegawai-guru')} />
 <StatCard title="Tenaga Kependidikan" value={String(Math.max(0, Number(kpiPegawai.value || 0) - Number(kpiGuru.value || 0)))} trend="0" trendType="up" trendText="staf & TU" onClick={() => navigate('/dashboard/yayasan/pegawai-guru')} />
 <StatCard title="Total Siswa Aktif" value={kpiSiswa.value} trend={kpiSiswa.trend} trendType={kpiSiswa.trendType} trendText="terdaftar" onClick={() => navigate('/dashboard/yayasan/siswa')} />
 <StatCard title="Siswa Baru" value={kpiSiswaBaru.value} trend={kpiSiswaBaru.trend} trendType={kpiSiswaBaru.trendType} trendText="tahun ajaran ini" onClick={() => navigate('/dashboard/yayasan/siswa-baru')} />
 <StatCard title="Mutasi Masuk" value={kpiMutasiMasuk.value} trend={kpiMutasiMasuk.trend} trendType={kpiMutasiMasuk.trendType} trendText="siswa pindahan" onClick={() => navigate('/dashboard/yayasan/mutasi-siswa')} />
 <StatCard title="Mutasi Keluar" value={kpiMutasiKeluar.value} trend={kpiMutasiKeluar.trend} trendType={kpiMutasiKeluar.trendType} trendText="pindah sekolah" onClick={() => navigate('/dashboard/yayasan/mutasi-siswa')} />
 <StatCard title="Siswa Berhenti" value={kpiSiswaBerhenti.value} trend={kpiSiswaBerhenti.trend} trendType={kpiSiswaBerhenti.trendType} trendText="berhenti studi" onClick={() => navigate('/dashboard/yayasan/mutasi-siswa')} />
 <StatCard title="Siswa Lulus" value={kpiSiswaLulus.value} trend={kpiSiswaLulus.trend} trendType={kpiSiswaLulus.trendType} trendText="lulus tahun ini" onClick={() => navigate('/dashboard/yayasan/kelulusan-alumni')} />
 <StatCard title="Menunggu Alumni" value={kpiMenungguAlumni.value} trend={kpiMenungguAlumni.trend} trendType={kpiMenungguAlumni.trendType} trendText="proses verifikasi" onClick={() => navigate('/dashboard/yayasan/kelulusan-alumni')} />
 <StatCard title="Total Alumni" value={kpiAlumni.value} trend={kpiAlumni.trend} trendType={kpiAlumni.trendType} trendText="terdata" onClick={() => navigate('/dashboard/yayasan/kelulusan-alumni')} />
 </div>

 {/* 3. ROW 2: MONITORING AKADEMIK & PRESTASI SISWA */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
 {/* Monitoring Akademik (Left 2 cols) */}
 <Card className="lg:col-span-2 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
 <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-emerald-600">
 Monitoring Akademik
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {/* Progress Bars Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
 <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="text-slate-600 dark:text-slate-300 font-semibold text-xs">
 Kehadiran Guru
 </div>
 <div className="flex items-baseline gap-1.5">
 <span className="text-xl font-black text-slate-900 dark:text-white">{apiData?.monitoring_akademik?.kehadiran_guru ?? 0}%</span>
 </div>
 <div className="h-2 w-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${apiData?.monitoring_akademik?.kehadiran_guru ?? 0}%` }} />
 </div>
 </div>

 <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="text-slate-600 dark:text-slate-300 font-semibold text-xs">
 Kehadiran Siswa
 </div>
 <div className="flex items-baseline gap-1.5">
 <span className="text-xl font-black text-slate-900 dark:text-white">{apiData?.monitoring_akademik?.kehadiran_siswa ?? 0}%</span>
 </div>
 <div className="h-2 w-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${apiData?.monitoring_akademik?.kehadiran_siswa ?? 0}%` }} />
 </div>
 </div>

 <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="text-slate-600 dark:text-slate-300 font-semibold text-xs">
 Input Nilai
 </div>
 <div className="flex items-baseline gap-1.5">
 <span className="text-xl font-black text-slate-900 dark:text-white">{apiData?.monitoring_akademik?.input_nilai ?? 0}%</span>
 </div>
 <div className="h-2 w-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${apiData?.monitoring_akademik?.input_nilai ?? 0}%` }} />
 </div>
 <p className="text-[10px] text-slate-400">Status input</p>
 </div>

 <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="text-slate-600 dark:text-slate-300 font-semibold text-xs">
 Input Tahfiz
 </div>
 <div className="flex items-baseline gap-1.5">
 <span className="text-xl font-black text-slate-900 dark:text-white">{apiData?.monitoring_akademik?.input_tahfiz ?? 0}%</span>
 </div>
 <div className="h-2 w-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${apiData?.monitoring_akademik?.input_tahfiz ?? 0}%` }} />
 </div>
 <p className="text-[10px] text-slate-400">Status input</p>
 </div>

 <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="text-slate-600 dark:text-slate-300 font-semibold text-xs">
 Input Mutabaah
 </div>
 <div className="flex items-baseline gap-1.5">
 <span className="text-xl font-black text-slate-900 dark:text-white">{apiData?.monitoring_akademik?.input_mutabaah ?? 0}%</span>
 </div>
 <div className="h-2 w-full rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${apiData?.monitoring_akademik?.input_mutabaah ?? 0}%` }} />
 </div>
 <p className="text-[10px] text-slate-400">Status input</p>
 </div>
 </div>

 {/* Bottom Row Badges: Terlambat & Tidak Hadir */}
 <div className="flex items-center gap-6 pt-2">
 <div className="flex items-center gap-2 text-xs font-semibold">
 <span className="text-slate-600 dark:text-slate-300">Terlambat Hari Ini</span>
 <span className="text-lg font-black text-slate-900 dark:text-white">{apiData?.monitoring_akademik?.terlambat_hari_ini ?? 0}</span>
 </div>
 <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
 <div className="flex items-center gap-2 text-xs font-semibold">
 <span className="text-slate-600 dark:text-slate-300">Tidak Hadir</span>
 <span className="text-lg font-black text-slate-900 dark:text-white">{apiData?.monitoring_akademik?.tidak_hadir_hari_ini ?? 0}</span>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Prestasi Siswa (Semua Unit) Donut Card */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-emerald-600">
 Prestasi Siswa <span className="text-xs text-slate-400 font-normal">(Semua Unit)</span>
 </CardTitle>
 <SquircleActionButton
 variant="view"
 label="Lihat Semua"
 onClick={() => navigate('/dashboard/laporan-siswa')}
 showLabel
 />
 </CardHeader>
 <CardContent className="flex items-center gap-3 pt-2">
 {/* Donut Chart with Center Text */}
 <div className="relative h-44 w-44 shrink-0">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={dataPrestasiDonut}
 cx="50%"
 cy="50%"
 innerRadius={52}
 outerRadius={75}
 paddingAngle={3}
 dataKey="value"
 >
 {dataPrestasiDonut.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <span className="text-2xl font-black text-slate-900 dark:text-white">{apiData?.kpis?.total_prestasi ?? 0}</span>
 <span className="text-[10px] font-bold text-slate-400">Total Prestasi</span>
 </div>
 </div>

 {/* Legend List */}
 <div className="space-y-2 flex-1 text-xs font-semibold">
 {dataPrestasiDonut.map((item) => (
 <div key={item.name} className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
 <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
 </div>
 <span className="text-slate-900 font-extrabold dark:text-white text-xs">
 {item.value} <span className="text-slate-400 font-normal text-[10px]">({item.percent})</span>
 </span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* 4. ROW 3: TARGET VS REALISASI TAHFIDZ, MONITORING IBADAH, RANKING UNIT, AGENDA YAYASAN */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
 {/* Target vs Realisasi Tahfizh */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between gap-2">
 <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">
 Target vs Realisasi Tahfiz <span className="text-[10px] text-slate-400 font-normal">(Semua Unit)</span>
 </CardTitle>
 <div className="relative">
 <CustomSelect
 value={selectedTahfizUnitFilter}
 onChange={(e) => setSelectedTahfizUnitFilter(e.target.value)}
 className="appearance-none text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 pr-5 outline-none border border-emerald-200/80 dark:border-emerald-700/80 cursor-pointer"
 >
 <option value="Semua Unit">Semua Unit</option>
 {(apiData?.unit_summaries || []).map((u) => (
 <option key={u.id} value={u.name}>{u.name}</option>
 ))}
 </CustomSelect>
 <ChevronDown className="h-3 w-3 text-slate-400 absolute right-1.5 top-1.5 pointer-events-none" />
 </div>
 </div>
 {/* Filter Tabs */}
 <div className="flex items-center gap-1 mt-2 bg-emerald-50 dark:bg-emerald-950/40 p-1 rounded-xl w-fit text-xs font-bold">
 <button
 onClick={() => setTabTahfizh('unit')}
 className={`px-3 py-1 rounded-lg transition ${tabTahfizh === 'unit' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
 >
 Per Unit
 </button>
 <button
 onClick={() => setTabTahfizh('guru')}
 className={`px-3 py-1 rounded-lg transition ${tabTahfizh === 'guru' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
 >
 Per Guru
 </button>
 <button
 onClick={() => setTabTahfizh('kelas')}
 className={`px-3 py-1 rounded-lg transition ${tabTahfizh === 'kelas' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
 >
 Per Kelas
 </button>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 {/* Chart Legend */}
 <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
 <span className="flex items-center gap-1">
 <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
 Target (Halaman)
 </span>
 <span className="flex items-center gap-1">
 <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />
 Realisasi (Halaman)
 </span>
 </div>

 <div className="h-44 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={dataTargetTahfizh} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
 <XAxis dataKey="unit" fontSize={10} stroke="#94A3B8" />
 <YAxis fontSize={10} stroke="#94A3B8" />
 <RechartsTooltip content={<CustomChartTooltip />} />
 <Bar dataKey="target" fill="#10B981" radius={[4, 4, 0, 0]} />
 <Bar dataKey="realisasi" fill="#6366F1" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 {/* Monitoring Ibadah (4 Gauges) */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-bold text-slate-900 dark:text-emerald-600">
 Monitoring Ibadah
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-2">
 <div className="grid grid-cols-2 gap-3 text-center">
 {/* Shalat */}
 <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
 <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
 <path className="text-slate-200 dark:text-slate-700" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
 <path className="text-emerald-500" strokeDasharray={`${apiData?.monitoring_ibadah?.shalat ?? 0}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
 </svg>
 <span className="absolute text-xs font-bold text-slate-900 dark:text-white">{apiData?.monitoring_ibadah?.shalat ?? 0}%</span>
 </div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Shalat</p>
 <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Pencapaian</span>
 </div>

 {/* Tilawah */}
 <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
 <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
 <path className="text-slate-200 dark:text-slate-700" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
 <path className="text-blue-500" strokeDasharray={`${apiData?.monitoring_ibadah?.tilawah ?? 0}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
 </svg>
 <span className="absolute text-xs font-bold text-slate-900 dark:text-white">{apiData?.monitoring_ibadah?.tilawah ?? 0}%</span>
 </div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Tilawah</p>
 <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Pencapaian</span>
 </div>

 {/* Murajaah */}
 <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
 <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
 <path className="text-slate-200 dark:text-slate-700" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
 <path className="text-teal-500" strokeDasharray={`${apiData?.monitoring_ibadah?.murajaah ?? 0}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
 </svg>
 <span className="absolute text-xs font-bold text-slate-900 dark:text-white">{apiData?.monitoring_ibadah?.murajaah ?? 0}%</span>
 </div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Murajaah</p>
 <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Pencapaian</span>
 </div>

 {/* Mutabaah */}
 <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
 <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
 <path className="text-slate-200 dark:text-slate-700" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
 <path className="text-amber-500" strokeDasharray={`${apiData?.monitoring_ibadah?.mutabaah ?? 0}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
 </svg>
 <span className="absolute text-xs font-bold text-slate-900 dark:text-white">{apiData?.monitoring_ibadah?.mutabaah ?? 0}%</span>
 </div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mutabaah</p>
 <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Pencapaian</span>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Ranking Unit Pendidikan */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-600">
 Ranking Unit Pendidikan
 </CardTitle>
 <SquircleActionButton variant="view" label="Lihat Semua" onClick={() => navigate('/dashboard/students/unit-pendidikan')} showLabel />
 </CardHeader>
 <CardContent className="space-y-3 pt-1 text-xs">
 {(apiData?.unit_rankings || []).length > 0 ? (
 (apiData?.unit_rankings || []).map((rank) => (
 <div key={rank.rank} className="space-y-1">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-slate-800 dark:text-slate-200">
 <strong className="text-emerald-700 mr-1.5">{rank.rank}</strong> {rank.name}
 </span>
 <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{rank.score}%</span>
 </div>
 <div className="h-2 w-full bg-emerald-50 dark:bg-slate-700 rounded-full overflow-hidden">
 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rank.score}%` }} />
 </div>
 </div>
 ))
 ) : (
 <p className="text-slate-400 text-xs">Belum ada data unit pendidikan</p>
 )}
 </CardContent>
 </Card>

 {/* Agenda Yayasan */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-xs font-bold text-slate-900 dark:text-emerald-600">
 Agenda Yayasan
 </CardTitle>
 <SquircleActionButton variant="view" label="Lihat Semua" onClick={() => navigate('/dashboard/pengaturan')} showLabel />
 </CardHeader>
 <CardContent className="space-y-3 pt-1 text-xs">
 {(apiData?.agenda_yayasan || []).length > 0 ? (
 (apiData?.agenda_yayasan || []).map((agenda) => (
 <div key={agenda.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#1b302c]/50 border border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
 {agenda.jam || '08:00'}
 </div>
 <div className="min-w-0 flex-1">
 <p className="font-bold text-slate-900 dark:text-white truncate">{agenda.judul}</p>
 <p className="text-[10px] text-slate-400 truncate">{agenda.isi}</p>
 </div>
 </div>
 ))
 ) : (
 <p className="text-slate-400 text-xs">Belum ada agenda resmi</p>
 )}
 </CardContent>
 </Card>
 </div>

 {/* 5. ROW 4: TREN KEHADIRAN BULANAN, AKTIVITAS TERBARU, PENGUMUMAN, AKSES CEPAT */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
 {/* Tren Kehadiran Bulanan */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-bold text-slate-900 dark:text-emerald-600">
 Tren Kehadiran Bulanan <span className="text-[10px] text-slate-400 font-normal">(Semua Unit)</span>
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
 <span className="flex items-center gap-1">
 <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
 Guru
 </span>
 <span className="flex items-center gap-1">
 <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" />
 Siswa
 </span>
 </div>
 <div className="h-44 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={dataKehadiranBulanan} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
 <XAxis dataKey="bulan" fontSize={10} stroke="#94A3B8" />
 <YAxis domain={[90, 100]} fontSize={10} stroke="#94A3B8" />
 <RechartsTooltip content={<CustomChartTooltip />} />
 <Line type="monotone" dataKey="guru" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
 <Line type="monotone" dataKey="siswa" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 {/* Aktivitas Terbaru */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-xs font-bold text-slate-900 dark:text-emerald-600">
 Aktivitas Terbaru
 </CardTitle>
 <SquircleActionButton variant="view" label="Lihat Semua" onClick={() => navigate('/dashboard/attendance')} showLabel />
 </CardHeader>
 <CardContent className="space-y-3 pt-1 text-xs">
 {(apiData?.recent_activities || []).length > 0 ? (
 (apiData?.recent_activities || []).map((act) => (
 <div key={act.id} className="flex items-start justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 pb-2">
 <div>
 <p className="font-bold text-slate-900 dark:text-white">{act.title}</p>
 <p className="text-[10px] text-slate-400">{act.subtitle}</p>
 </div>
 <span className="text-[10px] font-bold text-slate-400 shrink-0">{act.time}</span>
 </div>
 ))
 ) : (
 <p className="text-slate-400 text-xs">Belum ada aktivitas terbaru</p>
 )}
 </CardContent>
 </Card>

 {/* Pengumuman (Dynamic from DB) */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-600">
 Pengumuman
 </CardTitle>
 <SquircleActionButton variant="view" label="Lihat Semua" onClick={() => navigate('/dashboard/yayasan/informasi-sekolah')} showLabel />
 </CardHeader>
 <CardContent className="space-y-3 pt-1 text-xs">
 {recentInformationList.slice(0, 3).map((info, idx) => (
 <div key={idx} className={`flex items-start justify-between ${idx !== 2 ? 'border-b border-emerald-200/80 dark:border-emerald-800/80 pb-2' : ''}`}>
 <div>
 <p className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{info.title}</p>
 <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{info.sub}</p>
 </div>
 <span className="text-[10px] font-bold text-slate-400 shrink-0">{info.date}</span>
 </div>
 ))}
 </CardContent>
 </Card>

 {/* Akses Cepat (8 App Icons Grid) */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-bold text-slate-900 dark:text-white">
 Akses Cepat
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-1 pb-3 px-3">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
 {/* Absensi */}
 <button
 onClick={() => navigate('/dashboard/attendance')}
 aria-label="Akses cepat Absensi"
 className="group flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 border-2 border-emerald-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[66px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
 >
 <Fingerprint className="h-5 w-5 text-slate-600 group-hover:scale-110 transition-transform stroke-[2]" />
 <span className="text-[10px] font-extrabold text-white leading-tight block truncate w-full">Absensi</span>
 </button>

 {/* Tahfiz */}
 <button
 onClick={() => navigate('/dashboard/tahfizh')}
 aria-label="Akses cepat Tahfiz"
 className="group flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white dark:bg-[#1B2433] border border-purple-300/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[66px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
 >
 <BookOpen className="h-5 w-5 text-current group-hover:scale-110 transition-transform stroke-[2]" />
 <span className="text-[10px] font-extrabold text-white leading-tight block truncate w-full">Tahfiz</span>
 </button>

 {/* Akademik */}
 <button
 onClick={() => navigate('/dashboard/akademik/dashboard')}
 aria-label="Akses cepat Akademik"
 className="group flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white dark:bg-[#1B2433] border border-sky-300/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[66px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40"
 >
 <Calendar className="h-5 w-5 text-white group-hover:scale-110 transition-transform stroke-[2]" />
 <span className="text-[10px] font-extrabold text-white leading-tight block truncate w-full">Akademik</span>
 </button>

 {/* Nilai */}
 <button
 onClick={() => navigate('/dashboard/laporan-akademik')}
 aria-label="Akses cepat Nilai"
 className="group flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 border border-amber-300/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[66px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
 >
 <Award className="h-5 w-5 text-slate-600 group-hover:scale-110 transition-transform stroke-[2]" />
 <span className="text-[10px] font-extrabold text-white leading-tight block truncate w-full">Nilai</span>
 </button>

 {/* Keuangan */}
 <button
 onClick={() => navigate('/dashboard/pengaturan')}
 aria-label="Akses cepat Keuangan"
 className="group flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white dark:bg-[#1B2433] border border-teal-300/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[66px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
 >
 <Wallet className="h-5 w-5 text-white group-hover:scale-110 transition-transform stroke-[2]" />
 <span className="text-[10px] font-extrabold text-white leading-tight block truncate w-full">Keuangan</span>
 </button>

 {/* Laporan */}
 <button
 onClick={() => navigate('/dashboard/yayasan/laporan')}
 aria-label="Akses cepat Laporan"
 className="group flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 border-2 border-emerald-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[66px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
 >
 <FileSpreadsheet className="h-5 w-5 text-slate-600 group-hover:scale-110 transition-transform stroke-[2]" />
 <span className="text-[10px] font-extrabold text-white leading-tight block truncate w-full">Laporan</span>
 </button>

 {/* Pengumuman */}
 <button
 onClick={() => navigate('/dashboard/yayasan/informasi-sekolah')}
 aria-label="Akses cepat Pengumuman"
 className="group flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 border border-rose-300/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[66px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
 >
 <Megaphone className="h-5 w-5 text-white group-hover:scale-110 transition-transform stroke-[2]" />
 <span className="text-[10px] font-extrabold text-white leading-tight block truncate w-full">Pengumuman</span>
 </button>

 {/* Pengaturan */}
 <button
 onClick={() => navigate('/dashboard/pengaturan')}
 aria-label="Akses cepat Pengaturan"
 className="group flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white dark:bg-[#1B2433] border border-emerald-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-h-[66px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/40"
 >
 <Settings className="h-5 w-5 text-white group-hover:scale-110 transition-transform stroke-[2]" />
 <span className="text-[10px] font-extrabold text-white leading-tight block truncate w-full">Pengaturan</span>
 </button>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* 6. ROW 5: DATA UNIT PENDIDIKAN TABLE */}
 <Card className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 shadow-sm">
 <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
 <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">
 Data Unit Pendidikan
 </CardTitle>
 <SquircleActionButton variant="view" label="Lihat Semua" onClick={() => navigate('/dashboard/students/unit-pendidikan')} showLabel />
 </CardHeader>

 <CardContent className="pt-0">
 <div className="overflow-x-auto rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
 <table className="w-full text-left text-xs border-collapse">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="p-3.5">No</th>
 <th className="p-3.5">Unit Pendidikan</th>
 <th className="p-3.5">Siswa</th>
 <th className="p-3.5">Guru</th>
 <th className="p-3.5">Pegawai</th>
 <th className="p-3.5">Kelas</th>
 <th className="p-3.5">Rombel</th>
 <th className="p-3.5">Kehadiran Siswa</th>
 <th className="p-3.5">Kehadiran Guru</th>
 <th className="p-3.5">Tahfiz</th>
 <th className="p-3.5 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40/80 font-medium">
 {dataUnitPendidikan.map((unit) => (
 <tr key={unit.no} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition">
 <td className="p-3.5 font-bold text-slate-400">{unit.no}</td>
 <td className="p-3.5 font-bold text-slate-900 dark:text-white">{unit.name}</td>
 <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">{unit.siswa}</td>
 <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">{unit.guru}</td>
 <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">{unit.pegawai}</td>
 <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">{unit.kelas}</td>
 <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">{unit.rombel}</td>
 <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">{unit.presensiSiswa}</td>
 <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">{unit.presensiGuru}</td>
 <td className="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">{unit.tahfizh}</td>
 <td className="p-3.5 text-center">
 <div className="flex items-center justify-center gap-1 text-slate-400">
 <button onClick={() => navigate(`/dashboard/yayasan/unit-pendidikan/${unit.id}`)} className="p-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition" title="Lihat Detail">
 <Eye className="h-4 w-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* IMPORT EXCEL MODAL */}
 <Modal
 isOpen={isImportModalOpen}
 onClose={() => setIsImportModalOpen(false)}
 title="Import Data Master Excel"
 footer={
 <>
 <Button variant="secondary" size="sm" onClick={() => setIsImportModalOpen(false)}>
 Batal
 </Button>
 <Button variant="primary" size="sm" onClick={handleImportSubmit} className="bg-[#059669] text-white hover:bg-[#1E8E5A]">
 Unggah & Import
 </Button>
 </>
 }
 >
 <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
 <p className="text-slate-600 dark:text-slate-300">
 Pilih file rekap Excel (.xlsx, .csv) data unit pendidikan, siswa, atau guru.
 </p>
 <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 rounded-xl p-6 text-center bg-slate-50 dark:bg-[#1b302c]/40">
 <Upload className="h-8 w-8 text-[#059669] dark:text-[#10B981] mx-auto mb-2" />
 <p className="font-bold text-slate-700 dark:text-slate-200">Klik untuk jelajah berkas</p>
 <p className="text-[10px] text-slate-400 mt-1">Maksimal 10MB (.xlsx)</p>
 <input type="file" className="hidden" id="excelFileInput" />
 <label htmlFor="excelFileInput" className="inline-block mt-3 px-4 py-1.5 rounded-xl bg-[#059669] text-white text-xs font-bold cursor-pointer hover:bg-[#1E8E5A]">
 Pilih Berkas
 </label>
 </div>
 </form>
 </Modal>

 {/* KPI QUICK VIEW MODAL (POPUP) */}
 <ModalErrorBoundary onClose={() => setActiveKpiModal(null)}>
 <KpiQuickViewModal
 type={activeKpiModal}
 isOpen={Boolean(activeKpiModal)}
 onClose={() => setActiveKpiModal(null)}
 />
 </ModalErrorBoundary>

 {/* Toast Notification Stack */}
 {null}
</div>
 </PageContainer>
 )
}
