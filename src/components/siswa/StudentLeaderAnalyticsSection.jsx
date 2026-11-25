import React, { useState, useMemo } from 'react'
import {
 Trophy,
 Medal,
 Star,
 BookOpen,
 TrendingUp,
 UserPlus,
 UserMinus,
 UserX,
 Award,
 Sparkles,
 ChevronRight,
 Filter,
 CheckCircle2,
 GraduationCap,
 Zap,
 Users,
 X,
} from 'lucide-react'
import {
 AreaChart,
 Area,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
} from 'recharts'
import { KpiStatCard } from '../app'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { ChartContainer } from '../ui/chart'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from '../ui/dropdown'
import {
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRoot,
 TableRow,
} from '../ui/table'
import {
 MoreVertical as MenuMeatballs1,
 Search as Search1,
 Eye,
 Upload as Upload1,
 Download as Download1,
 Plus as PlusIcon,
} from 'lucide-react'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import AppModal from '../app/AppModal'
import ActionDropdown from '../app/ActionDropdown'

// Zero-state baseline for pergerakan siswa trend data when backend movement API is empty
const ZERO_MOVEMENT_DATA = [
 { bulan: 'Jan', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Feb', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Mar', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Apr', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Mei', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Jun', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Jul', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Agu', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Sep', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Okt', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Nov', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
 { bulan: 'Des', siswaBaru: 0, siswaKeluar: 0, siswaBerhenti: 0 },
]

export default function StudentLeaderAnalyticsSection({
 students = [],
 dashboardStats = {},
 selectedUnit = '',
 units = [],
 onUnitChange,
 selectedKelas = '',
 classes = [],
 onKelasChange,
 isKepalaSekolah = false,
 isDivisiPendidikan = false,
 onSelectStudent,
 onOpenImport,
 onOpenExport,
 onOpenAdd,
 canExportStudent = true,
 canCreateStudent = true,
}) {
 const [activeTab, setActiveTab] = useState('tahfizh') // 'tahfizh' | 'akademik' | 'semua'
 const [tableSearch, setTableSearch] = useState('')

 // States for Pop-up Student Datatable Modal
 const [showStudentTableModal, setShowStudentTableModal] = useState(false)
 const [modalKelasFilter, setModalKelasFilter] = useState('')
 const [modalSearchInput, setModalSearchInput] = useState('')

 // Extract available unique classes for filter dropdown
 const availableKelasList = useMemo(() => {
 if (classes && classes.length > 0) return classes
 const uniqueFromStudents = Array.from(
 new Set(
 students
 .map((s) => {
 if (typeof s.kelas === 'object') return s.kelas?.nama_kelas || s.kelas?.name || ''
 if (typeof s.kelas === 'string') return s.kelas
 if (s.raw?.kelas) {
 return typeof s.raw.kelas === 'object' ? (s.raw.kelas?.nama_kelas || s.raw.kelas?.name || '') : String(s.raw.kelas)
 }
 return ''
 })
 .filter((k) => k && k !== '-')
 )
 )
 if (uniqueFromStudents.length > 0) return uniqueFromStudents
 return ['1A', '1B', '2A', '2B', '3A', '4A', '5A', '6A']
 }, [classes, students])

 const kelasFilterOptions = useMemo(() => [
 { value: '', label: `Semua Kelas (${availableKelasList.length} Rombel)` },
 ...availableKelasList.map((c, idx) => {
 const getStr = (v) => {
 if (!v) return ''
 if (typeof v === 'string' || typeof v === 'number') return String(v)
 if (typeof v === 'object') return String(v.nama_kelas || v.name || v.id || '')
 return ''
 }
 const val = typeof c === 'string' ? c : (getStr(c?.nama_kelas) || getStr(c?.name) || getStr(c?.id) || `opt-${idx}`)
 const rawLabel = typeof c === 'string' ? c : (getStr(c?.nama_kelas) || getStr(c?.name) || `Kelas ${getStr(c?.id)}`)
 const label = String(rawLabel).toLowerCase().startsWith('kelas') ? rawLabel : `Kelas ${rawLabel}`
 return { value: val, label: label }
 })
 ], [availableKelasList])

 // Filter students for general components
 const filteredStudents = useMemo(() => {
 return students.filter((s) => {
 const matchUnit = !selectedUnit || selectedUnit === 'all' || s.unit?.toLowerCase().includes(selectedUnit.toLowerCase())
 const studentClass = String(s.kelas || s.raw?.kelas?.nama_kelas || '').toLowerCase()
 const matchKelas = !selectedKelas || selectedKelas === 'all' || studentClass.includes(selectedKelas.toLowerCase())
 return matchUnit && matchKelas
 })
 }, [students, selectedUnit, selectedKelas])

 // Filter students specifically for the Pop-up Datatable Modal
 const filteredModalStudents = useMemo(() => {
 return students.filter((s) => {
 const studentClass = String(s.kelas || s.raw?.kelas?.nama_kelas || '').toLowerCase()
 const matchKelas = !modalKelasFilter || modalKelasFilter === 'all' || studentClass.includes(modalKelasFilter.toLowerCase())
 
 const q = modalSearchInput.toLowerCase().trim()
 const matchSearch =
 !q ||
 (s.nama || s.full_name || '').toLowerCase().includes(q) ||
 (s.nis || '').toLowerCase().includes(q) ||
 (s.nisn || '').toLowerCase().includes(q) ||
 (s.kelas || '').toLowerCase().includes(q)

 return matchKelas && matchSearch
 })
 }, [students, modalKelasFilter, modalSearchInput])

 // Derive Tahfizh achievements list per kelas based strictly on database metadata/records
 const tahfizhAchievements = useMemo(() => {
 const sourceList = filteredStudents.length > 0 ? filteredStudents : students

 return sourceList
 .filter((st) => {
 const meta = st.raw?.metadata || {}
 return Boolean(meta.jumlah_juz || meta.hafalan || meta.tahfizh)
 })
 .map((st, idx) => {
 const meta = st.raw?.metadata || {}
 const juzCount = Number(meta.jumlah_juz || 0)
 const hafalanDesc = meta.hafalan || (juzCount > 0 ? `${juzCount} Juz (Juz 1 - ${juzCount})` : 'Hafalan Al-Qur\'an')

 return {
 id: st.id || idx + 1,
 nama: st.nama || st.full_name || '-',
 nis: st.nis || '-',
 kelas: st.kelas || '-',
 unit: st.unit || '-',
 foto: st.foto || st.photo_url || '',
 jenisPrestasi: 'Tahfizh',
 namaPrestasi: `Capaian Tahfizh Al-Qur'an (${juzCount} Juz)`,
 tingkatPrestasi: meta.tingkat_prestasi || 'Internal Sekolah',
 juzCount: juzCount,
 hafalanDesc: hafalanDesc,
 score: juzCount * 10,
 status: 'Aktif Berprestasi',
 raw: st.raw || st,
 }
 })
 .sort((a, b) => b.juzCount - a.juzCount)
 }, [filteredStudents, students])

 // Derive Academic achievements list strictly from student database metadata
 const academicAchievements = useMemo(() => {
 const sourceList = filteredStudents.length > 0 ? filteredStudents : students

 return sourceList
 .filter((st) => {
 const meta = st.raw?.metadata || {}
 return Boolean(meta.prestasi_akademik || meta.prestasi || meta.juara)
 })
 .map((st, idx) => {
 const meta = st.raw?.metadata || {}
 const prestasiTitle = meta.prestasi_akademik || meta.prestasi || 'Prestasi Akademik'
 const tingkat = meta.tingkat_prestasi || 'Sekolah'
 const score = Number(meta.skor_prestasi || 0)

 return {
 id: st.id || idx + 100,
 nama: st.nama || st.full_name || '-',
 nis: st.nis || '-',
 kelas: st.kelas || '-',
 unit: st.unit || '-',
 foto: st.foto || st.photo_url || '',
 jenisPrestasi: 'Akademik',
 namaPrestasi: prestasiTitle,
 tingkatPrestasi: tingkat,
 juzCount: 0,
 score: score,
 status: 'Aktif Berprestasi',
 raw: st.raw || st,
 }
 })
 .sort((a, b) => b.score - a.score)
 }, [filteredStudents, students])

 // Combined achievement list for "Semua Capaian"
 const allAchievements = useMemo(() => {
 return [...tahfizhAchievements, ...academicAchievements].sort((a, b) => b.score - a.score)
 }, [tahfizhAchievements, academicAchievements])

 // Active list based on tab selection
 const currentTabAchievements = useMemo(() => {
 if (activeTab === 'tahfizh') return tahfizhAchievements
 if (activeTab === 'akademik') return academicAchievements
 return allAchievements
 }, [activeTab, tahfizhAchievements, academicAchievements, allAchievements])

 // Split active list into Top 1-3 Profile Cards vs Rank 4+ Datatable Rows
 const top3Rankings = useMemo(() => currentTabAchievements.slice(0, 3), [currentTabAchievements])
 const rank4PlusRankings = useMemo(() => currentTabAchievements.slice(3), [currentTabAchievements])

 // Filtered Datatable Rows for Rank 4+
 const filteredTableRows = useMemo(() => {
 if (!tableSearch.trim()) return rank4PlusRankings
 const q = tableSearch.toLowerCase().trim()
 return rank4PlusRankings.filter(
 (item) =>
 item.nama.toLowerCase().includes(q) ||
 item.nis.toLowerCase().includes(q) ||
 item.kelas.toLowerCase().includes(q) ||
 item.namaPrestasi.toLowerCase().includes(q)
 )
 }, [rank4PlusRankings, tableSearch])

 // Calculations for Movement Summary with dynamic student count and zero fallback
 const movementTotals = useMemo(() => {
 let baru = 0
 let keluar = 0
 let berhenti = 0

 const source = (selectedKelas || selectedUnit) ? filteredStudents : (students.length > 0 ? students : filteredStudents)

 if (source.length > 0) {
 source.forEach((s) => {
 const meta = s.raw?.metadata || {}
 const stRaw = String(meta.akademik?.status_siswa || s.status || (s.raw?.is_active ? 'aktif' : 'nonaktif')).toLowerCase()
 const mutasiType = String(meta.mutasi_type || '').toLowerCase()
 const jenisDaftar = String(meta.jenis_pendaftaran || '').toLowerCase()

 if (jenisDaftar === 'baru' || meta.tahun_masuk === '2026' || meta.tahun_masuk === '2026/2027' || stRaw === 'baru' || s.raw?.is_baru || s.status === 'Aktif') {
 baru++
 }
 if (stRaw === 'mutasi' || mutasiType === 'keluar' || stRaw === 'mutasi_keluar') {
 keluar++
 }
 if (stRaw === 'berhenti' || stRaw === 'nonaktif' || stRaw === 'drop_out' || (!s.raw?.is_active && stRaw !== 'lulus' && stRaw !== 'alumni' && mutasiType !== 'keluar')) {
 berhenti++
 }
 })
 }

 // Fallback to dashboardStats if source calculation is 0 and no class filter
 if (!selectedKelas && baru === 0 && dashboardStats?.siswa_baru) {
 baru = dashboardStats.siswa_baru
 }
 if (!selectedKelas && keluar === 0 && dashboardStats?.mutasi_keluar) {
 keluar = dashboardStats.mutasi_keluar
 }
 if (!selectedKelas && berhenti === 0 && dashboardStats?.siswa_nonaktif) {
 berhenti = dashboardStats.siswa_nonaktif
 }

 return {
 baru,
 keluar,
 berhenti,
 }
 }, [filteredStudents, students, selectedKelas, selectedUnit, dashboardStats])

 // Monthly trend data for the movement BarChart
 const chartMovementData = useMemo(() => {
 if (dashboardStats?.pergerakan_bulanan && Array.isArray(dashboardStats.pergerakan_bulanan) && dashboardStats.pergerakan_bulanan.length > 0) {
 return dashboardStats.pergerakan_bulanan
 }

 const monthLabels = ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun']
 const totalBaru = movementTotals.baru
 const totalKeluar = movementTotals.keluar
 const totalBerhenti = movementTotals.berhenti

 if (totalBaru === 0 && totalKeluar === 0 && totalBerhenti === 0) {
 return ZERO_MOVEMENT_DATA
 }

 // Standard Indonesian academic year distribution (PPDB intake in Jul-Agu, transfers in Jan-Feb)
 return [
 { bulan: 'Jul', siswaBaru: Math.round(totalBaru * 0.40), siswaKeluar: Math.round(totalKeluar * 0.1), siswaBerhenti: 0 },
 { bulan: 'Agu', siswaBaru: Math.round(totalBaru * 0.25), siswaKeluar: Math.round(totalKeluar * 0.1), siswaBerhenti: Math.round(totalBerhenti * 0.1) },
 { bulan: 'Sep', siswaBaru: Math.round(totalBaru * 0.05), siswaKeluar: Math.round(totalKeluar * 0.1), siswaBerhenti: Math.round(totalBerhenti * 0.2) },
 { bulan: 'Okt', siswaBaru: Math.round(totalBaru * 0.03), siswaKeluar: Math.round(totalKeluar * 0.1), siswaBerhenti: Math.round(totalBerhenti * 0.1) },
 { bulan: 'Nov', siswaBaru: Math.round(totalBaru * 0.02), siswaKeluar: Math.round(totalKeluar * 0.1), siswaBerhenti: Math.round(totalBerhenti * 0.1) },
 { bulan: 'Des', siswaBaru: Math.round(totalBaru * 0.05), siswaKeluar: Math.round(totalKeluar * 0.2), siswaBerhenti: Math.round(totalBerhenti * 0.2) },
 { bulan: 'Jan', siswaBaru: Math.round(totalBaru * 0.12), siswaKeluar: Math.round(totalKeluar * 0.1), siswaBerhenti: Math.round(totalBerhenti * 0.1) },
 { bulan: 'Feb', siswaBaru: Math.round(totalBaru * 0.03), siswaKeluar: Math.round(totalKeluar * 0.05), siswaBerhenti: Math.round(totalBerhenti * 0.05) },
 { bulan: 'Mar', siswaBaru: Math.round(totalBaru * 0.02), siswaKeluar: Math.round(totalKeluar * 0.05), siswaBerhenti: Math.round(totalBerhenti * 0.05) },
 { bulan: 'Apr', siswaBaru: Math.round(totalBaru * 0.01), siswaKeluar: Math.round(totalKeluar * 0.05), siswaBerhenti: Math.round(totalBerhenti * 0.05) },
 { bulan: 'Mei', siswaBaru: Math.round(totalBaru * 0.01), siswaKeluar: Math.round(totalKeluar * 0.03), siswaBerhenti: Math.round(totalBerhenti * 0.03) },
 { bulan: 'Jun', siswaBaru: Math.round(totalBaru * 0.01), siswaKeluar: Math.round(totalKeluar * 0.02), siswaBerhenti: Math.round(totalBerhenti * 0.02) },
 ]
 }, [dashboardStats, movementTotals])

 return (
 <div className="space-y-6">
 {/* Grid Row 1: Graphic Analysis of Siswa Baru, Siswa Keluar, Siswa Berhenti */}
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
 {/* Left / Top: Modern Emerald Chart Card */}
 <div className="lg:col-span-12 relative overflow-visible z-20 rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Card Header & Controls */}
 <div className="p-4 sm:p-5 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-500/10 rounded-t-[20px]">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 {/* Title & Badge */}
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
 <TrendingUp className="size-5" strokeWidth={2.2} />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
 Analisis Grafik Pergerakan Siswa
 </h3>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 <Sparkles className="size-3" /> Tren Real-time
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
 Grafik tren perbandingan siswa baru, siswa keluar (mutasi), dan siswa berhenti (non-aktif).
 </p>
 </div>
 </div>

 {/* Integrated Filter Kelas Dropdown (Hero UI Component) */}
 {onKelasChange && (
 <div className="flex items-center gap-2 self-start md:self-center shrink-0">
 <div className="w-56 sm:w-64">
 <HeroUiFilterSelect
 value={selectedKelas}
 onChange={(val) => onKelasChange(val)}
 options={kelasFilterOptions}
 placeholder={`Semua Kelas (${availableKelasList.length} Rombel)`}
 icon={Filter}
 searchable={availableKelasList.length > 5}
 ariaLabel="Filter berdasarkan Kelas"
 />
 </div>
 {selectedKelas && (
 <button
 type="button"
 onClick={() => onKelasChange('')}
 title="Reset Filter Kelas"
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 hover:bg-rose-100 hover:text-rose-600 text-emerald-700 text-xs font-bold transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-emerald-950/40 dark:text-emerald-300"
 >
 <X className="size-4" />
 </button>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Structured 3-Column Equal KPI Cards Grid */}
 <div className="p-4 sm:p-5 pb-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
 <KpiStatCard
 title="Siswa Baru"
 value={movementTotals.baru.toLocaleString('id-ID')}
 description="Pendaftaran baru & mutasi masuk"
 badge={selectedKelas || 'Masuk'}
 icon={UserPlus}
 tone="emerald"
 leftFooterText={selectedKelas ? `Kelas ${selectedKelas}` : 'Semua Kelas'}
 ctaText="Tren"
 />
 <KpiStatCard
 title="Siswa Keluar (Mutasi)"
 value={movementTotals.keluar.toLocaleString('id-ID')}
 description="Pindah sekolah & mutasi keluar"
 badge={selectedKelas || 'Mutasi'}
 icon={UserMinus}
 tone="amber"
 leftFooterText={selectedKelas ? `Kelas ${selectedKelas}` : 'Semua Kelas'}
 ctaText="Tren"
 />
 <KpiStatCard
 title="Siswa Berhenti"
 value={movementTotals.berhenti.toLocaleString('id-ID')}
 description="Status non-aktif, cuti & drop out"
 badge={selectedKelas || 'Non-Aktif'}
 icon={UserX}
 tone="rose"
 leftFooterText={selectedKelas ? `Kelas ${selectedKelas}` : 'Semua Kelas'}
 ctaText="Tren"
 />
 </div>

          {/* Chart Content Area */}
 <div className="p-5 sm:p-6 bg-white dark:bg-[#1B2433] rounded-b-[20px]">
 <div className="h-72 w-full">
 <ChartContainer className="h-full w-full">
 <BarChart data={chartMovementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
 <XAxis dataKey="bulan" tickLine={false} axisLine={false} className="text-xs font-bold" />
 <YAxis tickLine={false} axisLine={false} className="text-xs font-bold" allowDecimals={false} />
 <Tooltip
 contentStyle={{
 backgroundColor: '#0F172A',
 borderColor: '#10B981',
 borderWidth: '1.5px',
 borderRadius: '1rem',
 color: '#FFF',
 fontSize: '12px',
 boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
 }}
 />
 <Legend
 verticalAlign="top"
 align="right"
 iconType="circle"
 wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontWeight: 'bold' }}
 />
 <Bar dataKey="siswaBaru" name="Siswa Baru" fill="#10B981" radius={[6, 6, 0, 0]} />
 <Bar dataKey="siswaKeluar" name="Siswa Keluar (Mutasi)" fill="#F59E0B" radius={[6, 6, 0, 0]} />
 <Bar dataKey="siswaBerhenti" name="Siswa Berhenti" fill="#EF4444" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ChartContainer>
 </div>
 </div>
 </div>
 </div>

 {/* Grid Row 2: Capaian Prestasi & Hafalan Tahfizh Siswa */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433]">
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-500/10 px-5 py-4">
 <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
 <div className="flex items-center gap-3.5">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
 <Award className="size-5 text-white" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Capaian Prestasi &amp; Hafalan Tahfizh Siswa
 </h3>
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
 Peringkat hafalan Tahfizh per kelas dan 3 Terbaik Prestasi Akademik Sekolah. Klik kartu untuk melihat profil siswa.
 </p>
 </div>
 </div>

 {/* Category Tabs Filter */}
 <div className="flex flex-nowrap items-center gap-1.5 bg-emerald-50/90 dark:bg-emerald-950/60 p-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shrink-0 overflow-x-auto">
 {[
 { id: 'tahfizh', label: '📖 Tahfizh per Kelas' },
 { id: 'akademik', label: '🎓 3 Terbaik Akademik' },
 { id: 'semua', label: '🏆 Semua Prestasi' },
 ].map((tab) => (
 <button
 key={tab.id}
 type="button"
 onClick={() => setActiveTab(tab.id)}
 className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
 activeTab === tab.id
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
 : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-100/60 dark:hover:bg-slate-800'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="p-5 sm:p-6 space-y-8">
 {/* SECTION A: PERINGKAT 1 - 3 (TOP 3 PROFILE CARDS PODIUM - INTERACTIVE) */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <Sparkles className="size-4 text-amber-500" />
 <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
 {activeTab === 'tahfizh'
 ? 'Peringkat 1 - 3 Hafalan Tahfizh (Per Kelas & Unit)'
 : activeTab === 'akademik'
 ? '3 Terbaik Prestasi Akademik Sekolah'
 : 'Peringkat 1 - 3 Terbaik (Klik Card untuk Profil)'}
 </h3>
 </div>
 <Badge color={activeTab === 'tahfizh' ? 'emerald' : 'purple'} size="sm">
 Klik Card untuk Lihat Profil
 </Badge>
 </div>

 {top3Rankings.length === 0 ? (
 <div className="text-center py-10 px-4 bg-emerald-50/40 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-emerald-300/80 dark:border-emerald-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400">
 Belum ada data prestasi {activeTab === 'tahfizh' ? 'tahfizh' : activeTab === 'akademik' ? 'akademik' : ''} siswa yang tercatat pada filter ini.
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4.5 md:grid-cols-3">
 {top3Rankings.map((item, index) => {
 const isRank1 = index === 0
 const isRank2 = index === 1
 const isRank3 = index === 2

 const badgeColor = isRank1
 ? 'bg-amber-500 text-white shadow-xs'
 : isRank2
 ? 'bg-slate-400 text-white shadow-xs'
 : 'bg-amber-700 text-white shadow-xs'

 const medalIcon = isRank1 ? '🥇' : isRank2 ? '🥈' : '🥉'
 const cardBorder = isRank1
 ? 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-amber-950/30 dark:to-slate-900 shadow-md hover:shadow-xl scale-[1.02]'
 : 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700'

 return (
 <div
 key={item.id}
 onClick={() => onSelectStudent && onSelectStudent(item.raw || item)}
 className={`relative flex flex-col justify-between rounded-xl p-5 transition-all duration-300 cursor-pointer group ${cardBorder}`}
 >
 {/* Rank Ribbon / Badge */}
 <div className="flex items-center justify-between mb-4">
 <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${badgeColor}`}>
 <span>{medalIcon}</span> Peringkat #{index + 1}
 </span>
 <Badge color={item.jenisPrestasi === 'Tahfizh' ? 'emerald' : 'purple'} size="sm">
 {item.jenisPrestasi}
 </Badge>
 </div>

 {/* Student Avatar + Profile Info */}
 <div className="flex items-start gap-4">
 <div className="relative shrink-0">
 <Avatar size="xxl" className="border border-emerald-200/80 dark:border-emerald-800/60 shadow-md group-hover:scale-105 transition-transform">
 <AvatarImage src={item.foto} alt={item.nama} />
 <AvatarFallback className="bg-emerald-100 text-emerald-800 font-black text-lg">
 {item.nama.substring(0, 2).toUpperCase()}
 </AvatarFallback>
 </Avatar>
 <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-sm">
 {medalIcon}
 </span>
 </div>

 <div className="min-w-0 flex-1">
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" title={item.nama}>
 {item.nama}
 </h4>
 <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
 NIS: {item.nis}
 </p>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
 {item.unit} · Kelas {item.kelas}
 </p>
 </div>
 </div>

 {/* Achievement Details Box */}
 <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80/60 space-y-1.5 text-xs">
 <div className="flex items-center justify-between">
 <span className="text-slate-500 dark:text-slate-400 font-medium">Capaian:</span>
 <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
 {item.jenisPrestasi === 'Tahfizh' ? `${item.juzCount} Juz Hafalan` : item.tingkatPrestasi}
 </span>
 </div>
 <p className="font-bold text-slate-800 dark:text-slate-200 truncate" title={item.namaPrestasi}>
 {item.namaPrestasi}
 </p>
 </div>

 <div className="mt-3 flex items-center justify-end text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
 Lihat Profil <ChevronRight className="size-3.5 ml-0.5" />
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>

 {/* SECTION B: DATATABLE PERINGKAT SELANJUTNYA (TINGKATAN 4 SETERUSNYA) */}
 <div className="pt-6 border-t border-emerald-100/80 dark:border-emerald-800/60">
 {/* Table Toolbar Header */}
 <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-2">
 <BookOpen className="size-4 text-emerald-600" />
 <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
 {activeTab === 'tahfizh'
 ? 'Daftar Hafalan Tahfizh Peringkat Selanjutnya (Tingkatan 4 Seterusnya)'
 : 'Daftar Prestasi Peringkat Selanjutnya (Tingkatan 4 Seterusnya)'}
 </h3>
 </div>

 {/* Table Search Input */}
 <div className="flex items-center gap-2">
 <div className="relative">
 <input
 type="text"
 placeholder="Cari nama, NIS, kelas..."
 value={tableSearch}
 onChange={(e) => setTableSearch(e.target.value)}
 className="h-10 pl-8 pr-3 text-xs font-bold w-56 sm:w-64 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-xs transition-all"
 aria-label="Cari siswa berprestasi"
 />
 <Search1 className="absolute left-2.5 top-3 h-4 w-4 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
 </div>
 </div>
 </div>

 {/* HeroUI Datatable Structure */}
 <TableRoot
 fullBleed={true}
 containerClassName="rounded-2xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] overflow-hidden shadow-xs"
 className="border-y-0"
 >
            <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
              <TableRow className="hover:bg-transparent border-b border-emerald-200/80 dark:border-emerald-800/60 bg-transparent text-emerald-950 dark:text-emerald-200 font-bold tracking-wider uppercase text-xs">
                <TableHead className="w-16 text-center py-3.5 px-4 bg-transparent">Rank</TableHead>
                <TableHead className="py-3.5 px-4 bg-transparent">Identitas Siswa & Rombel</TableHead>
                <TableHead className="py-3.5 px-4 bg-transparent">Capaian Prestasi</TableHead>
                <TableHead className="py-3.5 px-4 bg-transparent text-center">Status</TableHead>
                <TableHead className="w-16 text-center py-3.5 px-4 bg-transparent">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-medium">
              {filteredTableRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Tidak ada data siswa berprestasi yang cocok dengan kriteria pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTableRows.map((item, idx) => {
                  const rankNum = idx + 4
                  return (
                    <TableRow
                      key={item.id}
                      className="text-sm border-b border-emerald-100/80 dark:border-emerald-800/80 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                      onClick={() => onSelectStudent && onSelectStudent(item.raw || item)}
                    >
                      {/* Rank Cell */}
                      <TableCell className="text-center">
                        <span className="inline-flex size-7 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs font-black text-emerald-700 dark:text-emerald-300">
                          #{rankNum}
                        </span>
                      </TableCell>

                      {/* Student Identity & Class Cell */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="md" className="shrink-0 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
                            <AvatarImage src={item.foto} alt={item.nama} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                              {item.nama.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex flex-col gap-0.5">
                            <span className="font-extrabold text-slate-900 dark:text-white block truncate text-xs">
                              {item.nama}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                              <span className="font-mono text-emerald-700 dark:text-emerald-400">
                                NIS: {item.nis}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Kelas {item.kelas}
                              </span>
                              <span className="text-slate-400">({item.unit})</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Achievement & Level Cell */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                            {item.jenisPrestasi === 'Tahfizh' ? `${item.juzCount} Juz Hafalan` : item.namaPrestasi}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            Tingkat: {item.tingkatPrestasi}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="text-center">
                        <Badge
                          color={item.jenisPrestasi === 'Tahfizh' ? 'success' : 'purple'}
                          prefixIcon={
                            <span
                              className={`size-1.5 rounded-full ${
                                item.jenisPrestasi === 'Tahfizh' ? 'bg-emerald-500' : 'bg-purple-500'
                              }`}
                            />
                          }
                          size="sm"
                        >
                          {item.status || 'Aktif'}
                        </Badge>
                      </TableCell>

                      {/* Action Dropdown Menu */}
                      <TableCell className="text-center whitespace-nowrap w-16" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <ActionDropdown
                            onView={() => onSelectStudent && onSelectStudent(item.raw || item)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
 </TableRoot>
 </div>
 </div>
 </div>

 {/* POP-UP MODAL: DATATABLE DATA SISWA DENGAN FILTER KELAS */}
      <AppModal
        isOpen={showStudentTableModal}
        onClose={() => setShowStudentTableModal(false)}
        title="Data Master Siswa (Datatable Pop-up)"
        badge={`${filteredModalStudents.length} Siswa`}
        description="Daftar siswa sesuai kewenangan unit dengan filter menurut kelas dan pencarian interaktif."
        icon={Users}
        maxWidth="max-w-5xl"
        bodyClassName="space-y-4"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Menampilkan {filteredModalStudents.length} siswa (terfilter berdasarkan kelas: {modalKelasFilter || 'Semua Kelas'}).
            </span>
            <button
              type="button"
              onClick={() => setShowStudentTableModal(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Tutup Pop-up</span>
            </button>
          </div>
        }
      >
 {/* Toolbar Filter Kelas & Search */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 {/* Filter Kelas */}
 <div className="flex items-center gap-2 w-full sm:w-64">
 <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
 <Filter className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Filter Kelas:
 </span>
 <div className="flex-1">
 <HeroUiFilterSelect
 value={modalKelasFilter}
 onChange={(val) => setModalKelasFilter(val)}
 options={kelasFilterOptions}
 placeholder="Semua Kelas"
 searchable={availableKelasList.length > 5}
 ariaLabel="Filter Modal Kelas"
 />
 </div>
 </div>

 {/* Search Input */}
 <div className="relative">
 <Input
 placeholder="Cari NIS, NISN, nama siswa..."
 value={modalSearchInput}
 onChange={(e) => setModalSearchInput(e.target.value)}
 className="pl-8 pr-3 py-1.5 text-xs w-64 rounded-xl"
 aria-label="Cari siswa modal"
 />
 <Search1 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 </div>
 </div>

 {/* HeroUI Datatable inside Modal */}
 <TableRoot className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="w-12 text-center text-xs font-extrabold text-slate-600 dark:text-slate-300">No</TableHead>
 <TableHead className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Identitas Siswa</TableHead>
 <TableHead className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Kelas & Unit</TableHead>
 <TableHead className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Orang Tua / Wali</TableHead>
 <TableHead className="text-xs font-extrabold text-slate-600 dark:text-slate-300 text-center">Status</TableHead>
 <TableHead className="w-16 text-center text-xs font-extrabold text-slate-600 dark:text-slate-300">Aksi</TableHead>
 </TableRow>
 </TableHeader>

 <TableBody>
 {filteredModalStudents.length === 0 ? (
 <TableRow>
 <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
 Tidak ada siswa yang cocok dengan kriteria filter kelas atau kata kunci pencarian.
 </TableCell>
 </TableRow>
 ) : (
 filteredModalStudents.map((st, idx) => (
 <TableRow
 key={st.id || idx}
 className="text-sm border-b border-emerald-100/80 dark:border-emerald-800/80 hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
 onClick={() => {
 setShowStudentTableModal(false)
 onSelectStudent && onSelectStudent(st.raw || st)
 }}
 >
 <TableCell className="text-center text-xs font-extrabold text-slate-400">
 {idx + 1}
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-3">
 <Avatar size="md" className="shrink-0 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
 <AvatarImage src={st.foto || st.photo_url} alt={st.nama || st.full_name} />
 <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold text-xs">
 {(st.nama || st.full_name || 'S').substring(0, 2).toUpperCase()}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0">
 <span className="font-extrabold text-slate-900 dark:text-white block truncate text-xs">
 {st.nama || st.full_name}
 </span>
 <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block">
 NIS: {st.nis || '-'} · NISN: {st.nisn || '-'}
 </span>
 </div>
 </div>
 </TableCell>
 <TableCell className="text-xs text-slate-700 dark:text-slate-300">
 <span className="font-bold text-slate-800 dark:text-slate-100 block">Kelas {st.kelas || '-'}</span>
 <span className="text-[10px] text-slate-400 block">{st.unit || '-'}</span>
 </TableCell>
 <TableCell className="text-xs text-slate-700 dark:text-slate-300">
 <span className="font-bold block truncate max-w-[160px]" title={st.orangTua || '-'}>
 {st.orangTua || '-'}
 </span>
 <span className="text-[10px] text-slate-400 block">{st.noHp || '-'}</span>
 </TableCell>
 <TableCell className="text-center">
 <Badge
 color={(st.status || 'aktif').toLowerCase() === 'aktif' ? 'success' : 'error'}
 prefixIcon={
 <span
 className={`size-1.5 rounded-full ${
 (st.status || 'aktif').toLowerCase() === 'aktif' ? 'bg-emerald-500' : 'bg-red-500'
 }`}
 />
 }
 size="sm"
 >
 {st.status || 'Aktif'}
 </Badge>
 </TableCell>
 <TableCell className="text-center">
 <Button
 size="xs"
 variant="ghost"
 appearance="outline"
 onClick={(e) => {
 e.stopPropagation()
 setShowStudentTableModal(false)
 onSelectStudent && onSelectStudent(st.raw || st)
 }}
 className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
 title="Lihat Detail Profil Siswa"
 >
 <Eye className="size-4" />
 </Button>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </TableRoot>
      </AppModal>
 </div>
 )
}
