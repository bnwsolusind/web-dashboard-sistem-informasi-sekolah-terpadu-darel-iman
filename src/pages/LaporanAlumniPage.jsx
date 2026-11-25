import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import AppModal from "../components/app/AppModal"
import { cn } from '../lib/utils'
import CustomSelect from "../components/ui/CustomSelect"
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Award,
 BarChart3,
 Building2,
 ChevronDown,
 Download,
 Eye,
 FileSpreadsheet,
 FileText,
 Filter,
 GraduationCap,
 Printer,
 RefreshCw,
 RotateCcw,
 Search,
 Sparkles,
 TrendingUp,
 UserCheck,
 UserMinus,
 Users,
 UserX,
 X,
 CheckCircle2,
} from 'lucide-react'
import {
 ArrowRightLeft as ArrowBothDirectionHorizontal2,
 Download as Download1,
 Upload as Upload1,
} from 'lucide-react'
import {
 Bar,
 BarChart,
 CartesianGrid,
 Cell,
 Legend,
 Line,
 LineChart,
 Pie,
 PieChart,
 ResponsiveContainer,
 Tooltip,
 XAxis,
 YAxis,
} from 'recharts'

import { exportCsv } from '../components/reports/ReportKit'
import { reportService } from '../services/reportService'
import { useDebounce } from '../hooks/useDebounce'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { PersonIdentityCell } from '../components/ui/PersonIdentityCell'
import ActionDropdown from '../components/app/ActionDropdown'
import {
 MasterStatsGrid,
 MasterStatCard,
 MasterStatusBadge,
 MasterErrorState,
 MasterEmptyState,
 PrintOptionModal,
 SquircleActionButton,
} from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'

import {
 Card,
 CardHeader,
 CardTitle,
 CardDescription,
 CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
 TableRoot,
 TableHeader,
 TableHead,
 TableBody,
 TableRow,
 TableCell,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import {
 HoverCard,
 HoverCardTrigger,
 HoverCardContent,
} from '@/components/ui/hover-card'
import {
 Dialog,
 DialogBody,
 DialogClose,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from '@/components/ui/dialog'
import { Backdrop } from '@/components/ui/dialog'

const angka = (nilai) => new Intl.NumberFormat('id-ID').format(Number(nilai || 0))
const warnaPie = ['#059669', '#0D9488', '#10B981', '#34D399', '#F59E0B', '#F43F5E']

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.08,
 delayChildren: 0.04,
 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.35, ease: 'easeOut' },
 },
}

const getStatusBadge = (row) => {
 const type = row.metadata?.mutasi_type || (row.metadata?.is_alumni ? 'alumni' : 'alumni')
 if (type === 'masuk') {
 return <Badge color="cyan" size="sm">Pemindahan Masuk</Badge>
 }
 if (type === 'keluar' || type === 'berhenti') {
 return <Badge color="error" size="sm">Pemindahan Keluar</Badge>
 }
 return <Badge color="success" size="sm">Lulusan / Alumni</Badge>
}

const getTujuanText = (row) => {
 const tujuan =
 row.metadata?.tujuan_kelulusan ||
 row.metadata?.perguruan_tinggi ||
 row.metadata?.status_lanjutan ||
 row.metadata?.pekerjaan ||
 row.tujuan_kelulusan
 if (tujuan && tujuan !== '-') return tujuan
 if (row.metadata?.mutasi_type === 'masuk') return 'Pindahan Masuk (Siswa Aktif)'
 if (row.metadata?.mutasi_type === 'keluar') return 'Pindahan Keluar (Mutasi)'
 return 'Belum Diisi / Melanjutkan Studi'
}

const getTujuanBadge = (row) => {
 const text = getTujuanText(row)
 if (text.includes('Pindahan Masuk')) return <Badge color="sky" size="sm">{text}</Badge>
 if (text.includes('Pindahan Keluar')) return <Badge color="gray" size="sm">{text}</Badge>
 const lower = text.toLowerCase()
 if (lower.includes('ptn') || lower.includes('universitas') || lower.includes('kuliah') || lower.includes('tinggi')) {
 return <Badge color="purple" size="sm">{text}</Badge>
 }
 if (lower.includes('sekolah') || lower.includes('sma') || lower.includes('smk') || lower.includes('ma')) {
 return <Badge color="blue" size="sm">{text}</Badge>
 }
 if (lower.includes('kerja') || lower.includes('karir') || lower.includes('wirausaha')) {
 return <Badge color="orange" size="sm">{text}</Badge>
 }
 if (lower.includes('pesantren') || lower.includes('ponpes')) {
 return <Badge color="violet" size="sm">{text}</Badge>
 }
 return <Badge color="gray" size="sm">{text}</Badge>
}

export default function LaporanAlumniPage() {
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [rows, setRows] = useState([])
 const [dashboard, setDashboard] = useState({})

 const [pencarian, setPencarian] = useState('')
 const debouncedPencarian = useDebounce(pencarian, 350)
 const [unit, setUnit] = useState('semua')
 const [tahunLulus, setTahunLulus] = useState('semua')
 const [mutasiType, setMutasiType] = useState('semua')
 const [tujuanKelulusan, setTujuanKelulusan] = useState('semua')
 const [period, setPeriod] = useState('semua')
 const [dateFrom, setDateFrom] = useState('')
 const [dateTo, setDateTo] = useState('')

 const [halaman, setHalaman] = useState(1)
 const [perHalaman, setPerHalaman] = useState(15)
 const [sortKey, setSortKey] = useState('nama')
 const [sortOrder, setSortOrder] = useState('asc')
 const [viewModeTahunan, setViewModeTahunan] = useState('both')

 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [selectedAlumniModal, setSelectedAlumniModal] = useState(null)
 const [printTargetAlumni, setPrintTargetAlumni] = useState(null)

 const getPeriodDateRange = (periodKey) => {
 const now = new Date()
 const iso = (d) => d.toISOString().slice(0, 10)
 const todayStr = iso(now)

 if (periodKey === 'hari') {
 return { from: todayStr, to: todayStr }
 }
 if (periodKey === 'minggu') {
 const past = new Date(now)
 past.setDate(now.getDate() - 6)
 return { from: iso(past), to: todayStr }
 }
 if (periodKey === 'bulan') {
 const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
 return { from: iso(firstDay), to: todayStr }
 }
 if (periodKey === 'semester') {
 const past = new Date(now.getFullYear(), now.getMonth() - 5, 1)
 return { from: iso(past), to: todayStr }
 }
 if (periodKey === 'tahun') {
 const firstDay = new Date(now.getFullYear(), 0, 1)
 return { from: iso(firstDay), to: todayStr }
 }
 return { from: '', to: '' }
 }

 const muatData = useCallback(async () => {
 try {
 setLoading(true)
 setError('')
 const params = {}
 if (debouncedPencarian) params.search = debouncedPencarian
 if (tahunLulus !== 'semua') params.tahun_lulus = tahunLulus
 if (mutasiType !== 'semua') params.mutasi_type = mutasiType
 if (tujuanKelulusan !== 'semua') params.tujuan_kelulusan = tujuanKelulusan

 const [list, stats] = await Promise.all([
 reportService.alumni(params),
 reportService.alumniStats(),
 ])
 setRows(list.data || list || [])
 setDashboard(stats.data || stats || {})
 } catch (err) {
 setError(err?.response?.data?.message || 'Laporan kelulusan, mutasi & alumni gagal dimuat.')
 } finally {
 setLoading(false)
 }
 }, [debouncedPencarian, tahunLulus, mutasiType, tujuanKelulusan])

 useEffect(() => {
 muatData()
 }, [muatData])

 const daftarUnit = useMemo(() => {
 const list = rows
 .map((r) => r.education_unit?.name || r.unit?.name || r.unit)
 .filter((u) => u && u !== '-')
 return [...new Set(list)]
 }, [rows])

 const yearsOptions = ['2026', '2025', '2024', '2023', '2022', '2021']

 const hasilFilter = useMemo(() => {
 const filtered = rows.filter((row) => {
 const studentName = row.full_name || row.nama || ''
 const studentNis = row.nis || row.nisn || ''
 const unitName = row.education_unit?.name || row.unit?.name || row.unit || ''
 const tujuanText = getTujuanText(row)

 const cocokCari =
 !pencarian ||
 `${studentNis} ${studentName} ${unitName} ${tujuanText}`
 .toLowerCase()
 .includes(pencarian.toLowerCase())

 const cocokUnit = unit === 'semua' || unitName === unit

 const rowTahun = String(
 row.metadata?.tahun_lulus ||
 row.metadata?.tahun_mutasi ||
 new Date(row.updated_at || row.created_at || Date.now()).getFullYear()
 )
 const cocokTahun = tahunLulus === 'semua' || rowTahun === String(tahunLulus)

 const type = row.metadata?.mutasi_type || 'alumni'
 const cocokMutasi =
 mutasiType === 'semua' ||
 (mutasiType === 'alumni' && (type === 'alumni' || !row.metadata?.mutasi_type)) ||
 (mutasiType === 'masuk' && type === 'masuk') ||
 (mutasiType === 'keluar' && (type === 'keluar' || type === 'berhenti'))

 const lowerTujuan = tujuanText.toLowerCase()
 const cocokTujuan =
 tujuanKelulusan === 'semua' ||
 (tujuanKelulusan === 'ptn' &&
 (lowerTujuan.includes('ptn') ||
 lowerTujuan.includes('universitas') ||
 lowerTujuan.includes('kuliah'))) ||
 (tujuanKelulusan === 'sekolah' &&
 (lowerTujuan.includes('sekolah') ||
 lowerTujuan.includes('sma') ||
 lowerTujuan.includes('smk') ||
 lowerTujuan.includes('ma'))) ||
 (tujuanKelulusan === 'kerja' &&
 (lowerTujuan.includes('kerja') ||
 lowerTujuan.includes('karir') ||
 lowerTujuan.includes('wirausaha'))) ||
 (tujuanKelulusan === 'pesantren' &&
 (lowerTujuan.includes('pesantren') || lowerTujuan.includes('ponpes'))) ||
 (tujuanKelulusan === 'lainnya' && (!lowerTujuan || lowerTujuan.includes('belum')))

 const tglItem =
 row.created_at?.slice(0, 10) ||
 row.updated_at?.slice(0, 10) ||
 row.tanggal ||
 row.date
 let cocokPeriode = true
 if (dateFrom && tglItem) {
 cocokPeriode = tglItem >= dateFrom
 }
 if (dateTo && tglItem && cocokPeriode) {
 cocokPeriode = tglItem <= dateTo
 }

 return cocokCari && cocokUnit && cocokTahun && cocokMutasi && cocokTujuan && cocokPeriode
 })

 if (sortKey) {
 filtered.sort((a, b) => {
 let valA = ''
 let valB = ''

 if (sortKey === 'nama') {
 valA = a.full_name || a.nama || ''
 valB = b.full_name || b.nama || ''
 } else if (sortKey === 'nis') {
 valA = a.nis || a.nisn || ''
 valB = b.nis || b.nisn || ''
 } else if (sortKey === 'unit') {
 valA = a.education_unit?.name || a.unit?.name || a.unit || ''
 valB = b.education_unit?.name || b.unit?.name || b.unit || ''
 } else if (sortKey === 'tahun') {
 valA = String(a.metadata?.tahun_lulus || a.metadata?.tahun_mutasi || '')
 valB = String(b.metadata?.tahun_lulus || b.metadata?.tahun_mutasi || '')
 } else {
 valA = a[sortKey] ?? ''
 valB = b[sortKey] ?? ''
 }

 if (typeof valA === 'string') valA = valA.toLowerCase()
 if (typeof valB === 'string') valB = valB.toLowerCase()

 if (valA < valB) return sortOrder === 'asc' ? -1 : 1
 if (valA > valB) return sortOrder === 'asc' ? 1 : -1
 return 0
 })
 }

 return filtered
 }, [rows, pencarian, unit, tahunLulus, mutasiType, tujuanKelulusan, dateFrom, dateTo, sortKey, sortOrder])

 const totalHalaman = Math.max(Math.ceil(hasilFilter.length / perHalaman), 1)
 const baris = useMemo(() => {
 const start = (halaman - 1) * perHalaman
 return hasilFilter.slice(start, start + perHalaman)
 }, [hasilFilter, halaman, perHalaman])

 useEffect(() => {
 setHalaman(1)
 }, [pencarian, unit, tahunLulus, mutasiType, tujuanKelulusan, period, dateFrom, dateTo, perHalaman])

 const handleSort = (key) => {
 if (sortKey === key) {
 setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
 } else {
 setSortKey(key)
 setSortOrder('asc')
 }
 }

 const resetFilter = () => {
 setPencarian('')
 setUnit('semua')
 setTahunLulus('semua')
 setMutasiType('semua')
 setTujuanKelulusan('semua')
 setPeriod('semua')
 setDateFrom('')
 setDateTo('')
 setSortKey('nama')
 setSortOrder('asc')
 setHalaman(1)
 }

 // Rekap Data Kelulusan & Mutasi per Tahun
 const rekapTahunan = useMemo(() => {
 const yearsSet = new Set(yearsOptions)
 rows.forEach((r) => {
 const thn = String(
 r.metadata?.tahun_lulus ||
 r.metadata?.tahun_mutasi ||
 new Date(r.updated_at || r.created_at || Date.now()).getFullYear()
 )
 if (thn && thn !== 'NaN' && thn !== 'undefined') yearsSet.add(thn)
 })

 const sortedYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a))

 return sortedYears.map((tahun) => {
 const filteredRows = rows.filter((r) => {
 const rowTahun = String(
 r.metadata?.tahun_lulus ||
 r.metadata?.tahun_mutasi ||
 new Date(r.updated_at || r.created_at || Date.now()).getFullYear()
 )
 return rowTahun === String(tahun)
 })

 const totalLulusan = filteredRows.filter(
 (r) => !r.metadata?.mutasi_type || r.metadata?.mutasi_type === 'alumni' || r.metadata?.is_alumni
 ).length

 const pindahMasuk = filteredRows.filter(
 (r) => r.metadata?.mutasi_type === 'masuk'
 ).length

 const pindahKeluar = filteredRows.filter(
 (r) => r.metadata?.mutasi_type === 'keluar' || r.metadata?.mutasi_type === 'berhenti'
 ).length

 const lanjutStudi = filteredRows.filter((r) => {
 const text = getTujuanText(r)
 return text !== 'Belum Diisi / Melanjutkan Studi' && !text.includes('Pindahan')
 }).length

 const total = filteredRows.length
 const persentaseLanjut = totalLulusan > 0 ? Math.round((lanjutStudi / totalLulusan) * 100) : 0

 return {
 tahun,
 totalLulusan,
 pindahMasuk,
 pindahKeluar,
 lanjutStudi,
 persentaseLanjut,
 total,
 }
 })
 }, [rows, yearsOptions])

 // Total Keseluruhan Rekap Tahunan
 const totalRekapTahunan = useMemo(() => {
 return rekapTahunan.reduce(
 (acc, item) => ({
 totalLulusan: acc.totalLulusan + item.totalLulusan,
 pindahMasuk: acc.pindahMasuk + item.pindahMasuk,
 pindahKeluar: acc.pindahKeluar + item.pindahKeluar,
 lanjutStudi: acc.lanjutStudi + item.lanjutStudi,
 total: acc.total + item.total,
 }),
 { totalLulusan: 0, pindahMasuk: 0, pindahKeluar: 0, lanjutStudi: 0, total: 0 }
 )
 }, [rekapTahunan])

 // Data Grafik Multi-Series Rekapitulasi Tahunan (Urutan Kronologis: Lama ke Baru)
 const dataGrafikTahunan = useMemo(() => {
 return [...rekapTahunan]
 .reverse()
 .map((item) => ({
 tahun: `Thn ${item.tahun}`,
 'Total Alumni': item.totalLulusan,
 'Pindah Masuk': item.pindahMasuk,
 'Pindah Keluar': item.pindahKeluar,
 'Lanjut Studi': item.lanjutStudi,
 'Persentase Lanjut (%)': item.persentaseLanjut,
 }))
 }, [rekapTahunan])

 // Data Grafik 1: Tren Kelulusan & Mutasi per Tahun (BarChart)
 const dataTahunan = useMemo(() => {
 const map = new Map()
 rows.forEach((r) => {
 const thn = String(
 r.metadata?.tahun_lulus ||
 r.metadata?.tahun_mutasi ||
 new Date(r.updated_at || r.created_at || Date.now()).getFullYear()
 )
 map.set(thn, (map.get(thn) || 0) + 1)
 })
 const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
 return sorted.map(([tahun, jumlah]) => ({ nama: `Thn ${tahun}`, jumlah }))
 }, [rows])

 // Data Grafik 2: Distribusi Tujuan Kelulusan (PieChart Donut)
 const dataTujuanPie = useMemo(() => {
 const map = new Map()
 hasilFilter.forEach((r) => {
 const text = getTujuanText(r)
 let cat = 'Belum Diisi / Lainnya'
 const lower = text.toLowerCase()
 if (
 lower.includes('ptn') ||
 lower.includes('universitas') ||
 lower.includes('kuliah') ||
 lower.includes('tinggi')
 ) {
 cat = 'Perguruan Tinggi'
 } else if (
 lower.includes('sekolah') ||
 lower.includes('sma') ||
 lower.includes('smk') ||
 lower.includes('ma')
 ) {
 cat = 'Sekolah Lanjutan'
 } else if (
 lower.includes('kerja') ||
 lower.includes('karir') ||
 lower.includes('wirausaha')
 ) {
 cat = 'Karir / Kerja'
 } else if (lower.includes('pesantren') || lower.includes('ponpes')) {
 cat = 'Pondok Pesantren'
 } else if (lower.includes('masuk')) {
 cat = 'Pindahan Masuk'
 } else if (lower.includes('keluar')) {
 cat = 'Pindahan Keluar'
 }
 map.set(cat, (map.get(cat) || 0) + 1)
 })
 return [...map.entries()].map(([nama, jumlah]) => ({ nama, jumlah }))
 }, [hasilFilter])

 const kolomCsvTahunan = [
 { key: 'tahun', label: 'Tahun Ajaran / Lulus', export: (row) => `Tahun ${row.tahun}` },
 { key: 'totalLulusan', label: 'Total Alumni / Lulusan', export: (row) => row.totalLulusan },
 { key: 'pindahMasuk', label: 'Pemindahan Masuk', export: (row) => row.pindahMasuk },
 { key: 'pindahKeluar', label: 'Pemindahan Keluar', export: (row) => row.pindahKeluar },
 { key: 'lanjutStudi', label: 'Melanjutkan Studi / Karir', export: (row) => row.lanjutStudi },
 { key: 'persentaseLanjut', label: 'Persentase Lanjut Studi (%)', export: (row) => `${row.persentaseLanjut}%` },
 { key: 'total', label: 'Total Rekord Data', export: (row) => row.total },
 ]

 const handlePrintCleanTahunan = () => {
 printCleanTable({
 title: 'Laporan Rekapitulasi Total Kelulusan & Mutasi Per Tahun',
 subtitle: `Total Data: ${rekapTahunan.length} Tahun Ajaran | Total Alumni: ${totalRekapTahunan.totalLulusan} Siswa`,
 headers: ['NO', 'TAHUN AJARAN / LULUS', 'TOTAL ALUMNI / LULUSAN', 'MUTASI MASUK', 'MUTASI KELUAR', 'LANJUT STUDI / KARIR', 'PERSENTASE (%)', 'TOTAL DATA'],
 rows: rekapTahunan.map((item, index) => [
 index + 1,
 `Tahun ${item.tahun}`,
 item.totalLulusan,
 item.pindahMasuk,
 item.pindahKeluar,
 item.lanjutStudi,
 `${item.persentaseLanjut}%`,
 item.total,
 ]),
 unit: unit !== 'semua' ? unit : null,
 orientation: 'landscape',
 })
 }

 const handleDownloadPdfTahunan = () => {
 downloadPdfTable({
 title: 'Laporan Rekapitulasi Total Kelulusan & Mutasi Per Tahun',
 filename: `Laporan_Total_Kelulusan_Per_Tahun_${new Date().toISOString().slice(0, 10)}.pdf`,
 headers: ['NO', 'TAHUN AJARAN / LULUS', 'TOTAL ALUMNI / LULUSAN', 'MUTASI MASUK', 'MUTASI KELUAR', 'LANJUT STUDI / KARIR', 'PERSENTASE (%)', 'TOTAL DATA'],
 rows: rekapTahunan.map((item, index) => [
 index + 1,
 `Tahun ${item.tahun}`,
 item.totalLulusan,
 item.pindahMasuk,
 item.pindahKeluar,
 item.lanjutStudi,
 `${item.persentaseLanjut}%`,
 item.total,
 ]),
 unit: unit !== 'semua' ? unit : null,
 orientation: 'landscape',
 })
 }

 const kolomCsv = [
 { key: 'nis', label: 'NIS / NISN', export: (row) => row.nis || row.nisn || '-' },
 { key: 'nama', label: 'Nama Siswa / Alumni', export: (row) => row.full_name || row.nama || '-' },
 { key: 'jenis_kelamin', label: 'JK', export: (row) => row.gender || row.jenis_kelamin || '-' },
 { key: 'unit', label: 'Unit Pendidikan', export: (row) => row.education_unit?.name || row.unit?.name || row.unit || '-' },
 {
 key: 'status',
 label: 'Jenis Status',
 export: (row) =>
 row.metadata?.mutasi_type === 'masuk'
 ? 'Pemindahan Masuk'
 : row.metadata?.mutasi_type === 'keluar'
 ? 'Pemindahan Keluar'
 : 'Lulusan / Alumni',
 },
 {
 key: 'tahun',
 label: 'Tahun',
 export: (row) =>
 row.metadata?.tahun_lulus ||
 row.metadata?.tahun_mutasi ||
 new Date(row.updated_at || row.created_at || Date.now()).getFullYear(),
 },
 { key: 'tujuan', label: 'Tujuan Kelulusan', export: (row) => getTujuanText(row) },
 ]

 const handlePrintClean = () => {
 const listToPrint = printTargetAlumni ? [printTargetAlumni] : hasilFilter
 const title = printTargetAlumni
 ? `Laporan Detail Alumni: ${printTargetAlumni.full_name || printTargetAlumni.nama || ''}`
 : 'Rekap Kelulusan, Pemindahan, & Alumni'
 const subtitle = printTargetAlumni
 ? `NIS: ${printTargetAlumni.nis || printTargetAlumni.nisn || '-'} | Unit: ${printTargetAlumni.education_unit?.name || printTargetAlumni.unit?.name || '-'}`
 : `Total Data: ${listToPrint.length} Siswa/Alumni`

 const activeUnitTarget = printTargetAlumni
 ? (printTargetAlumni.education_unit?.name || printTargetAlumni.unit?.name || printTargetAlumni.unit)
 : (unit !== 'semua' ? unit : null)

 printCleanTable({
 title,
 subtitle,
 headers: ['NO', 'NIS / NISN', 'NAMA SISWA / ALUMNI', 'JK', 'UNIT PENDIDIKAN', 'JENIS STATUS', 'TAHUN', 'TUJUAN KELULUSAN'],
 rows: listToPrint.map((item, index) => [
 index + 1,
 item.nis || item.nisn || '-',
 item.full_name || item.nama || '-',
 item.gender || item.jenis_kelamin || '-',
 item.education_unit?.name || item.unit?.name || item.unit || '-',
 item.metadata?.mutasi_type === 'masuk'
 ? 'Pemindahan Masuk'
 : item.metadata?.mutasi_type === 'keluar'
 ? 'Pemindahan Keluar'
 : 'Lulusan / Alumni',
 item.metadata?.tahun_lulus ||
 item.metadata?.tahun_mutasi ||
 new Date(item.updated_at || item.created_at || Date.now()).getFullYear(),
 getTujuanText(item),
 ]),
 unit: activeUnitTarget,
 orientation: 'landscape',
 })
 }

 const handleDownloadPdf = () => {
 const listToPrint = printTargetAlumni ? [printTargetAlumni] : hasilFilter
 const title = printTargetAlumni
 ? `Laporan Detail Alumni: ${printTargetAlumni.full_name || printTargetAlumni.nama || ''}`
 : 'Rekap Kelulusan, Pemindahan, & Alumni'
 const filename = printTargetAlumni
 ? `laporan-alumni-${printTargetAlumni.nis || printTargetAlumni.id || 'detail'}.pdf`
 : `Laporan_Alumni_Mutasi_${new Date().toISOString().slice(0, 10)}.pdf`

 const activeUnitTarget = printTargetAlumni
 ? (printTargetAlumni.education_unit?.name || printTargetAlumni.unit?.name || printTargetAlumni.unit)
 : (unit !== 'semua' ? unit : null)

 downloadPdfTable({
 title,
 filename,
 headers: ['NO', 'NIS / NISN', 'NAMA SISWA / ALUMNI', 'JK', 'UNIT PENDIDIKAN', 'JENIS STATUS', 'TAHUN', 'TUJUAN KELULUSAN'],
 rows: listToPrint.map((item, index) => [
 index + 1,
 item.nis || item.nisn || '-',
 item.full_name || item.nama || '-',
 item.gender || item.jenis_kelamin || '-',
 item.education_unit?.name || item.unit?.name || item.unit || '-',
 item.metadata?.mutasi_type === 'masuk'
 ? 'Pemindahan Masuk'
 : item.metadata?.mutasi_type === 'keluar'
 ? 'Pemindahan Keluar'
 : 'Lulusan / Alumni',
 item.metadata?.tahun_lulus ||
 item.metadata?.tahun_mutasi ||
 new Date(item.updated_at || item.created_at || Date.now()).getFullYear(),
 getTujuanText(item),
 ]),
 unit: activeUnitTarget,
 orientation: 'landscape',
 })
 }

 if (loading) {
 return (
 <PageContainer maxW="7xl">
 <MasterEmptyState loading message="Memuat laporan alumni, mutasi, & kelulusan..." />
 </PageContainer>
 )
 }

 if (error) {
 return (
 <PageContainer maxW="7xl">
 <MasterErrorState message={error} onRetry={muatData} />
 </PageContainer>
 )
 }

 const totalAlumniVal = Number(
 dashboard.total_alumni || rows.filter((r) => !r.metadata?.mutasi_type || r.metadata?.mutasi_type === 'alumni').length
 )
 const pindahMasukVal = Number(
 dashboard.pindah_masuk || rows.filter((r) => r.metadata?.mutasi_type === 'masuk').length
 )
 const pindahKeluarVal = Number(
 dashboard.pindah_keluar || rows.filter((r) => r.metadata?.mutasi_type === 'keluar' || r.metadata?.mutasi_type === 'berhenti').length
 )
 const lanjutStudiVal = Number(
 dashboard.lanjut_studi || rows.filter((r) => getTujuanText(r) !== 'Belum Diisi / Melanjutkan Studi').length
 )
 const totalPrestasiVal = Number(dashboard.total_prestasi || 0)

 return (
 <PageContainer className="space-y-6 pb-12">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 {/* ── Breadcrumb Navigation ── */}
 <motion.div variants={itemVariants}>
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Kesiswaan & Alumni', href: '/dashboard/students' },
 { label: 'Laporan Alumni & Mutasi' },
 ]}
 />
 </motion.div>

  {/* MODERN HERO CARD HEADER (Harmonized Super Admin Standard) */}
      <HeroUiHeader
        title="Laporan Rekap Data Alumni, Kelulusan & Mutasi"
        subtitle="Pusat penelusuran kelulusan siswa: statistik alumni, pemindahan masuk/keluar, tracer studi universitas/karir, dan rekap per tahun."
        badge="Laporan Alumni & Kelulusan"
        icon={GraduationCap}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={muatData}
            disabled={loading}
            prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            className="border border-emerald-500/40 bg-white/80 hover:bg-white text-emerald-800 dark:bg-slate-900/80 dark:text-emerald-300 font-bold shadow-xs cursor-pointer"
          >
            Segarkan Data
          </Button>
        }
      />

      {/* ── Print Option Modal Integration ───────────────────────────────────── */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => {
 setIsPrintModalOpen(false)
 setPrintTargetAlumni(null)
 }}
 title={
 printTargetAlumni
 ? `Cetak Laporan Alumni: ${printTargetAlumni.full_name || printTargetAlumni.nama}`
 : 'Rekap Kelulusan, Pemindahan, & Alumni'
 }
 activeUnit={
 printTargetAlumni
 ? (printTargetAlumni.education_unit?.name || printTargetAlumni.unit?.name || printTargetAlumni.unit)
 : (unit !== 'semua' ? unit : null)
 }
 onPrint={handlePrintClean}
 onDownloadPdf={handleDownloadPdf}
 />

      {/* ── Detail Alumni Dialog Modal (HeroUI Harmonized Modal) ── */}
      <AppModal
        isOpen={Boolean(selectedAlumniModal)}
        onClose={() => setSelectedAlumniModal(null)}
        title="Detail Data Alumni / Mutasi"
        badge="Profil Siswa"
        description="Informasi riwayat kelulusan, unit pendidikan, dan penelusuran studi/karir."
        icon={Eye}
        maxWidth="max-w-xl"
        headerActions={selectedAlumniModal ? getStatusBadge(selectedAlumniModal) : null}
        footer={
          selectedAlumniModal ? (
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    exportCsv(
                      `alumni-${selectedAlumniModal.nis || selectedAlumniModal.id}.csv`,
                      kolomCsv,
                      [selectedAlumniModal]
                    )
                  }
                  className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100 px-3.5 text-xs font-black text-amber-800 hover:bg-amber-200 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="size-3.5" />
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrintTargetAlumni(selectedAlumniModal)
                    setIsPrintModalOpen(true)
                  }}
                  className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-4 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <Printer className="size-3.5" />
                  Cetak Laporan
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlumniModal(null)}
                className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          ) : null
        }
      >
        {selectedAlumniModal && (
          <div className="space-y-4 text-xs">
                  {/* Summary Profile Header */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-100/80 dark:border-emerald-800/60">
                    <div className="size-14 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-2xs">
                      {selectedAlumniModal.foto_url ? (
                        <img
                          src={selectedAlumniModal.foto_url}
                          alt={selectedAlumniModal.full_name || selectedAlumniModal.nama}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (selectedAlumniModal.full_name || selectedAlumniModal.nama || 'A')
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {selectedAlumniModal.full_name || selectedAlumniModal.nama}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        NIS / NISN: {selectedAlumniModal.nis || selectedAlumniModal.nisn || '-'}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        Unit:{' '}
                        {selectedAlumniModal.education_unit?.name ||
                          selectedAlumniModal.unit?.name ||
                          selectedAlumniModal.unit_name ||
                          (typeof selectedAlumniModal.unit === 'string' ? selectedAlumniModal.unit : '') ||
                          '-'}
                      </p>
                    </div>
                  </div>

                  {/* Detail Information Grid */}
                  <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl border border-emerald-100/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900/40">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        NIS / NISN
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">
                        {selectedAlumniModal.nis || selectedAlumniModal.nisn || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Jenis Kelamin
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {selectedAlumniModal.gender || selectedAlumniModal.jenis_kelamin || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Tahun Lulus / Mutasi
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {selectedAlumniModal.metadata?.tahun_lulus ||
                          selectedAlumniModal.metadata?.tahun_mutasi ||
                          new Date(
                            selectedAlumniModal.updated_at ||
                              selectedAlumniModal.created_at ||
                              Date.now()
                          ).getFullYear()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Unit Pendidikan
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {selectedAlumniModal.education_unit?.name ||
                          selectedAlumniModal.unit?.name ||
                          selectedAlumniModal.unit_name ||
                          (typeof selectedAlumniModal.unit === 'string' ? selectedAlumniModal.unit : '') ||
                          '-'}
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-emerald-200/80 dark:border-emerald-800/60 pt-2.5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Tujuan Kelulusan / Studi Lanjut
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs block mt-0.5">
                        {getTujuanText(selectedAlumniModal)}
                      </span>
                    </div>
                  </div>
                </div>
        )}
      </AppModal>


 {/* ── KPI Summary Cards Grid (5-Card Grid) ────────────────────────────── */}
 <motion.div variants={itemVariants}>
 <MasterStatsGrid columns={5}>
 <MasterStatCard
 icon={GraduationCap}
 label="Total Alumni / Lulusan"
 value={angka(totalAlumniVal)}
 subtitle="Siswa tamat / lulus"
 variant="info"
 delay={0}
 />
 <MasterStatCard
 icon={UserCheck}
 label="Pemindahan Masuk"
 value={angka(pindahMasukVal)}
 subtitle="Mutasi siswa masuk"
 variant="success"
 delay={50}
 />
 <MasterStatCard
 icon={UserMinus}
 label="Pemindahan Keluar"
 value={angka(pindahKeluarVal)}
 subtitle="Mutasi siswa keluar"
 variant="danger"
 delay={100}
 />
 <MasterStatCard
 icon={TrendingUp}
 label="Lanjut Studi / Karir"
 value={angka(lanjutStudiVal)}
 subtitle={totalAlumniVal > 0 ? `${lanjutStudiVal} dari ${totalAlumniVal} alumni (${((lanjutStudiVal / totalAlumniVal) * 100).toFixed(1)}%)` : 'Tujuan kelulusan tercatat'}
 variant="warning"
 delay={150}
 active={tujuanKelulusan !== 'semua'}
 onClick={() => {
 setTujuanKelulusan(tujuanKelulusan === 'semua' ? 'PTN' : 'semua')
 setHalaman(1)
 }}
 />
 <MasterStatCard
 icon={Award}
 label="Total Prestasi"
 value={angka(totalPrestasiVal)}
 subtitle="Tercatat di sistem"
 variant="neutral"
 delay={200}
 />
 </MasterStatsGrid>

 {/* KPI Definition & Drilldown Transparency Banner */}
 <div className="mt-4 rounded-xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-4 text-xs dark:border-emerald-800/60 dark:bg-[#13221f] dark:from-[#13221f] dark:to-[#1B2433]">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
 Formula Capaian Lanjut Studi
 </span>
 <span className="font-bold text-slate-800 dark:text-slate-100">
 Rasio Lanjut Studi/Karir: {totalAlumniVal > 0 ? `${((lanjutStudiVal / totalAlumniVal) * 100).toFixed(1)}%` : '—'}
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-400">
 <strong className="text-slate-700 dark:text-slate-200">Rumus:</strong> (Alumni Terdata Melanjutkan Studi / Total Alumni Terdata) &times; 100% • <strong className="text-slate-700 dark:text-slate-200">Pembilang:</strong> {lanjutStudiVal} alumni • <strong className="text-slate-700 dark:text-slate-200">Penyebut Basis:</strong> {totalAlumniVal} alumni terdata.
 </p>
 </div>
 {tujuanKelulusan !== 'semua' && (
 <div className="flex items-center gap-2 shrink-0">
 <span className="rounded-lg bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300/80">
 Filter: {tujuanKelulusan}
 </span>
 <button
 type="button"
 onClick={() => {
 setTujuanKelulusan('semua')
 setHalaman(1)
 }}
 className="rounded-lg bg-emerald-50 border border-emerald-200/80 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
 >
 Reset Filter
 </button>
 </div>
 )}
 </div>
 </div>
 </motion.div>

 {/* ── 3-Column Equal Grid Section ───────────────────────────────────── */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
 {/* Column 1: Panel Filter Laporan */}
 <article className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">
 Filter Laporan Alumni & Mutasi
 </h2>
 <button
 type="button"
 onClick={resetFilter}
 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
 >
 Reset Filter
 </button>
 </div>

 <div className="space-y-3">
 {/* Unit Pendidikan */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
 Unit Pendidikan
 </label>
 <CustomSelect
 value={unit}
 onChange={(e) => {
 setUnit(e.target.value)
 setHalaman(1)
 }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Unit Pendidikan</option>
 {daftarUnit.map((item) => (
 <option key={item} value={item}>
 {item}
 </option>
 ))}
 </CustomSelect>
 </div>

 {/* Tahun Lulus / Mutasi */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
 Tahun Lulus / Mutasi
 </label>
 <CustomSelect
 value={tahunLulus}
 onChange={(e) => {
 setTahunLulus(e.target.value)
 setHalaman(1)
 }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Tahun</option>
 {yearsOptions.map((y) => (
 <option key={y} value={y}>
 Tahun {y}
 </option>
 ))}
 </CustomSelect>
 </div>

 {/* Jenis Status / Mutasi */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
 Jenis Status / Mutasi
 </label>
 <CustomSelect
 value={mutasiType}
 onChange={(e) => {
 setMutasiType(e.target.value)
 setHalaman(1)
 }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Status & Mutasi</option>
 <option value="alumni">Lulusan / Alumni</option>
 <option value="masuk">Pemindahan Masuk (Mutasi Masuk)</option>
 <option value="keluar">Pemindahan Keluar (Mutasi Keluar)</option>
 </CustomSelect>
 </div>

 {/* Tujuan Kelulusan */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
 Tujuan Kelulusan
 </label>
 <CustomSelect
 value={tujuanKelulusan}
 onChange={(e) => {
 setTujuanKelulusan(e.target.value)
 setHalaman(1)
 }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Tujuan Kelulusan</option>
 <option value="ptn">Perguruan Tinggi (PTN / PTS)</option>
 <option value="sekolah">Sekolah Lanjutan (SMA/SMK/MA)</option>
 <option value="kerja">Bekerja / Karir / Wirausaha</option>
 <option value="pesantren">Pondok Pesantren</option>
 <option value="lainnya">Belum Diisi / Lainnya</option>
 </CustomSelect>
 </div>

 {/* Periode Waktu */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
 Periode Waktu
 </label>
 <CustomSelect
 value={period}
 onChange={(e) => {
 const nextPeriod = e.target.value
 setPeriod(nextPeriod)
 if (nextPeriod !== 'custom' && nextPeriod !== 'semua') {
 const { from, to } = getPeriodDateRange(nextPeriod)
 setDateFrom(from)
 setDateTo(to)
 } else if (nextPeriod === 'semua') {
 setDateFrom('')
 setDateTo('')
 }
 setHalaman(1)
 }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Periode Data</option>
 <option value="hari">Hari Ini (Per Hari)</option>
 <option value="minggu">7 Hari Terakhir (Per Minggu)</option>
 <option value="bulan">Bulan Ini (Per Bulan)</option>
 <option value="semester">6 Bulan Terakhir (Per Semester)</option>
 <option value="tahun">Tahun Ini (Per Tahun)</option>
 <option value="custom">Rentang Tanggal Kustom</option>
 </CustomSelect>
 </div>

 {/* Date From & Date To */}
 <div className="grid grid-cols-2 gap-2 pt-1">
 <div>
 <label className="block text-xs font-medium text-slate-500 mb-0.5">Tanggal Mulai</label>
 <DatePicker
 value={dateFrom}
 onChange={(e) => {
 setDateFrom(e.target.value)
 setPeriod('custom')
 setHalaman(1)
 }}
 placeholder="Mulai..."
 inputClassName="h-8 text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-500 mb-0.5">Tanggal Selesai</label>
 <DatePicker
 value={dateTo}
 onChange={(e) => {
 setDateTo(e.target.value)
 setPeriod('custom')
 setHalaman(1)
 }}
 placeholder="Selesai..."
 inputClassName="h-8 text-xs"
 />
 </div>
 </div>
 </div>
 </div>
 </article>

 {/* Column 2: Grafik Tren Kelulusan & Mutasi per Tahun */}
 <article className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Tren Kelulusan & Mutasi</h2>
 <span className="text-xs font-semibold text-slate-400">Rekap Tahunan</span>
 </div>
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={dataTahunan} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
 <XAxis dataKey="nama" tick={{ fontSize: 10 }} stroke="#888888" />
 <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
 <Tooltip formatter={(v) => [angka(v), 'Alumni/Siswa']} />
 <Bar dataKey="jumlah" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={44} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </article>

 {/* Column 3: Grafik Distribusi Tujuan Kelulusan (PieChart Donut) */}
 <article className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Tujuan Kelulusan</h2>
 <span className="text-xs font-bold text-slate-500">{angka(hasilFilter.length)} Total</span>
 </div>
 <div className="flex flex-col items-center justify-center flex-1">
 <div className="relative w-48 h-48 sm:w-52 sm:h-52 mb-3 flex items-center justify-center">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={dataTujuanPie}
 dataKey="jumlah"
 nameKey="nama"
 innerRadius="62%"
 outerRadius="88%"
 paddingAngle={2}
 >
 {dataTujuanPie.map((_, i) => (
 <Cell key={i} fill={warnaPie[i % warnaPie.length]} />
 ))}
 </Pie>
 <Tooltip formatter={(v) => [angka(v), 'Alumni/Siswa']} />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <strong className="text-xl font-black text-slate-900 dark:text-white">
 {angka(hasilFilter.length)}
 </strong>
 <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
 Total Data
 </span>
 </div>
 </div>

 <div className="w-full grid grid-cols-2 gap-2 text-xs">
 {dataTujuanPie.slice(0, 4).map((item, i) => (
 <div
 key={item.nama}
 className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60"
 >
 <span
 className="size-2.5 rounded-full shrink-0"
 style={{ background: warnaPie[i % warnaPie.length] }}
 />
 <div className="flex items-center justify-between w-full min-w-0">
 <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
 {item.nama}
 </span>
 <span className="text-xs font-bold text-slate-900 dark:text-white ml-1">
 {angka(item.jumlah)}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </article>
 </div>
 </motion.div>

 {/* ── Laporan Total Kelulusan Per Tahun Section ───────────────────────────── */}
 <motion.div variants={itemVariants}>
 <div className="overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 {/* Header Toolbar */}
 <div className="p-4 sm:p-6 space-y-3 border-b border-emerald-200/80 dark:border-emerald-800/80">
 <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
 <span>Laporan & Grafik Total Kelulusan Per Tahun</span>
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Visualisasi grafik & rekapitulasi akumulasi jumlah siswa lulus (alumni), pemindahan masuk/keluar, dan penelusuran studi per tahun ajaran.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2 shrink-0">
 {/* View Mode Selector Buttons */}
 <div className="flex items-center gap-1 p-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold">
 <button
 type="button"
 onClick={() => setViewModeTahunan('both')}
 className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
 viewModeTahunan === 'both'
 ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
 : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
 }`}
 >
 Grafik & Tabel
 </button>
 <button
 type="button"
 onClick={() => setViewModeTahunan('chart')}
 className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
 viewModeTahunan === 'chart'
 ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
 : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
 }`}
 >
 Hanya Grafik
 </button>
 <button
 type="button"
 onClick={() => setViewModeTahunan('table')}
 className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
 viewModeTahunan === 'table'
 ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
 : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
 }`}
 >
 Hanya Tabel
 </button>
 </div>

 <SquircleActionButton
 variant="export"
 label="Export CSV Tahunan"
 onClick={() => exportCsv('rekap-kelulusan-per-tahun.csv', kolomCsvTahunan, rekapTahunan)}
 />
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak Rekap"
 onClick={handlePrintCleanTahunan}
 />
 </div>
 </div>
 </div>

 {/* Visual Chart Panel Section */}
 {(viewModeTahunan === 'both' || viewModeTahunan === 'chart') && (
 <div className="p-4 sm:p-6 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/40 dark:bg-slate-900/30">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
 <div className="flex items-center gap-2">
 <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
 Grafik Komparasi Total Alumni, Mutasi & Penelusuran Studi Per Tahun
 </h3>
 </div>
 <span className="text-xs text-slate-400 font-medium">
 Visualisasi perbandingan {dataGrafikTahunan.length} tahun ajaran
 </span>
 </div>

 <div className="h-72 w-full pt-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={dataGrafikTahunan} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
 <XAxis dataKey="tahun" tick={{ fontSize: 11 }} stroke="#888888" />
 <YAxis tick={{ fontSize: 11 }} stroke="#888888" />
 <Tooltip formatter={(v, name) => [angka(v) + (name.includes('%') ? '%' : ' Siswa'), name]} />
 <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
 <Bar dataKey="Total Alumni" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
 <Bar dataKey="Pindah Masuk" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={32} />
 <Bar dataKey="Pindah Keluar" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={32} />
 <Bar dataKey="Lanjut Studi" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={32} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 )}

 {/* Datatable Viewport */}
 {(viewModeTahunan === 'both' || viewModeTahunan === 'table') && (
 <div className="mx-4 sm:mx-6 md:mx-8 overflow-x-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <TableRoot fullBleed={false}>
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableHead className="w-12 text-center">#</TableHead>
 <TableHead className="text-left">Tahun Ajaran / Lulus</TableHead>
 <TableHead className="text-center">Total Alumni / Lulusan</TableHead>
 <TableHead className="text-center">Pemindahan Masuk</TableHead>
 <TableHead className="text-center">Pemindahan Keluar</TableHead>
 <TableHead className="text-center">Lanjut Studi / Karir</TableHead>
 <TableHead className="text-center">Persentase Penelusuran</TableHead>
 <TableHead className="text-center">Total Record</TableHead>
 <TableHead className="text-center">Aksi Quick Filter</TableHead>
 </TableRow>
 </TableHeader>

 <TableBody>
 {rekapTahunan.map((item, index) => {
 const isSelected = String(tahunLulus) === String(item.tahun)

 return (
 <TableRow
 key={item.tahun}
 className={`hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors ${
 isSelected ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
 }`}
 >
 <TableCell className="text-center font-bold text-slate-400 text-xs">
 {index + 1}
 </TableCell>

 <TableCell className="text-left font-extrabold text-slate-900 dark:text-emerald-600 text-xs">
 <div className="flex items-center gap-2">
 <span className="size-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center justify-center text-xs font-black shadow-2xs">
 {item.tahun.slice(-2)}
 </span>
 <span>Tahun {item.tahun}</span>
 </div>
 </TableCell>

 <TableCell className="text-center">
 <Badge color="success" size="sm">
 {angka(item.totalLulusan)} Siswa
 </Badge>
 </TableCell>

 <TableCell className="text-center">
 <Badge color="cyan" size="sm">
 {angka(item.pindahMasuk)} Siswa
 </Badge>
 </TableCell>

 <TableCell className="text-center">
 <Badge color="error" size="sm">
 {angka(item.pindahKeluar)} Siswa
 </Badge>
 </TableCell>

 <TableCell className="text-center">
 <Badge color="warning" size="sm">
 {angka(item.lanjutStudi)} Siswa
 </Badge>
 </TableCell>

 <TableCell className="text-center font-mono font-bold text-xs">
 <div className="flex items-center justify-center gap-1.5">
 <div className="w-16 h-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden">
 <div
 className="h-full bg-emerald-500 rounded-full"
 style={{ width: `${Math.min(item.persentaseLanjut, 100)}%` }}
 />
 </div>
 <span className="text-emerald-600 dark:text-emerald-400">
 {item.persentaseLanjut}%
 </span>
 </div>
 </TableCell>

 <TableCell className="text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs">
 {angka(item.total)}
 </TableCell>

 <TableCell className="text-center">
 <Button
 size="xs"
 variant={isSelected ? 'primary' : 'ghost'}
 onClick={() => {
 if (isSelected) {
 setTahunLulus('semua')
 } else {
 setTahunLulus(item.tahun)
 }
 setHalaman(1)
 }}
 className={
 isSelected
 ? 'bg-emerald-600 text-white font-semibold'
 : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 font-semibold'
 }
 >
 {isSelected ? 'Reset Filter' : 'Filter Tahun Ini'}
 </Button>
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>

 {/* Grand Total Footer */}
 <tfoot className="border-t-2 border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50/80 dark:bg-slate-900/60 font-bold text-xs">
 <TableRow>
 <TableCell colSpan={2} className="text-left font-black text-slate-900 dark:text-emerald-600 uppercase tracking-wider py-3.5">
 TOTAL KESELURUHAN PER TAHUN
 </TableCell>
 <TableCell className="text-center">
 <Badge color="success" size="md">
 {angka(totalRekapTahunan.totalLulusan)} Siswa
 </Badge>
 </TableCell>
 <TableCell className="text-center">
 <Badge color="cyan" size="md">
 {angka(totalRekapTahunan.pindahMasuk)} Siswa
 </Badge>
 </TableCell>
 <TableCell className="text-center">
 <Badge color="error" size="md">
 {angka(totalRekapTahunan.pindahKeluar)} Siswa
 </Badge>
 </TableCell>
 <TableCell className="text-center">
 <Badge color="warning" size="md">
 {angka(totalRekapTahunan.lanjutStudi)} Siswa
 </Badge>
 </TableCell>
 <TableCell className="text-center font-mono font-black text-emerald-600 dark:text-emerald-400">
 {totalRekapTahunan.totalLulusan > 0
 ? Math.round((totalRekapTahunan.lanjutStudi / totalRekapTahunan.totalLulusan) * 100)
 : 0}
 %
 </TableCell>
 <TableCell className="text-center font-mono font-black text-slate-800 dark:text-slate-200">
 {angka(totalRekapTahunan.total)}
 </TableCell>
 <TableCell className="text-center text-[10px] text-slate-400">
 {rekapTahunan.length} Tahun
 </TableCell>
 </TableRow>
 </tfoot>
 </TableRoot>
 </div>
 )}
 </div>
 </motion.div>

 {/* ── Main Master Datatable Card ─────────────────────────────────────── */}
 <motion.div variants={itemVariants}>
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/25 bg-white shadow-md shadow-sm dark:border-emerald-600/35 dark:bg-[#1B2433]">
 {/* Toolbar Header 3-Baris Terstruktur */}
 <div className="p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-500/20">
 {/* Baris 1: Title & Toolbar Squircle Action Buttons */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
 Rincian Data Alumni & Mutasi
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Daftar rekapitulasi kelulusan siswa, pemindahan masuk & keluar per tahun, serta penelusuran data tujuan kelulusan.
 </p>
 </div>

 <div className="flex items-center gap-2 flex-nowrap shrink-0 py-1">
 <SquircleActionButton
 variant="export"
 label="Export CSV"
 onClick={() => exportCsv('rekap-alumni-mutasi.csv', kolomCsv, hasilFilter)}
 />
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak Data"
 onClick={() => {
 setPrintTargetAlumni(null)
 setIsPrintModalOpen(true)
 }}
 />
 </div>
 </div>

 {/* Baris 2: Input Pencarian Memanjang Full Width */}
 <div className="relative w-full">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <Input
 type="text"
 value={pencarian}
 onChange={(e) => setPencarian(e.target.value)}
 placeholder="Cari NIS, NISN, Nama Siswa/Alumni, Unit, atau Tujuan Kelulusan..."
 className="w-full pl-10 pr-9 h-9 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-900/60"
 />
 {pencarian && (
 <button
 type="button"
 onClick={() => setPencarian('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>

 {/* Baris 3: Per-Page Control & Summary Info */}
 <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
 <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
 <span>
 Menampilkan <strong>{hasilFilter.length}</strong> data terfilter
 </span>
 </div>

 {/* Per Page Select */}
 <div className="relative flex items-center gap-1.5">
 <span className="text-xs font-medium text-slate-500">Per Halaman:</span>
 <div className="relative">
 <CustomSelect
 value={perHalaman}
 onChange={(e) => {
 setPerHalaman(Number(e.target.value))
 setHalaman(1)
 }}
 className="h-9 cursor-pointer appearance-none rounded-xl border border-emerald-200/80 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 focus:border-emerald-600 focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value={5}>5</option>
 <option value={10}>10</option>
 <option value={15}>15</option>
 <option value={25}>25</option>
 <option value={50}>50</option>
 <option value={100}>100</option>
 </CustomSelect>
 <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
 </div>
 </div>
 </div>
 </div>

 {/* ── Viewport Datatable Edge-to-Edge (HeroUI Emerald - 5 Columns Standard) ── */}
        <div className="w-full overflow-x-auto">
          {hasilFilter.length === 0 ? (
            <div className="py-8">
              <MasterEmptyState message="Tidak ada data Alumni / Mutasi yang cocok dengan filter atau pencarian Anda." />
            </div>
          ) : (
            <TableRoot className="w-full text-left border-collapse text-xs">
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow>
                  {/* Kolom 1: Identitas Siswa / Alumni (Nama & NIS) */}
                  <TableHead
                    className="py-3 px-4 font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 cursor-pointer select-none"
                    onClick={() => handleSort('nama')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Identitas Siswa / Alumni</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </TableHead>

                  {/* Kolom 2: Unit Pendidikan */}
                  <TableHead
                    className="py-3 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 cursor-pointer select-none"
                    onClick={() => handleSort('unit')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Unit Pendidikan</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </TableHead>

                  {/* Kolom 3: Tahun & Status */}
                  <TableHead
                    className="py-3 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 cursor-pointer select-none"
                    onClick={() => handleSort('tahun')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Tahun & Status</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </TableHead>

                  {/* Kolom 4: Tujuan Kelulusan */}
                  <TableHead className="py-3 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                    Tujuan Kelulusan
                  </TableHead>

                  {/* Kolom 5: Aksi (Tanpa Label Header) */}
                  <TableHead className="py-3 px-4 w-24 text-right select-none" />
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {baris.map((item, index) => {
                  const studentName = item.full_name || item.nama || 'Siswa/Alumni'
                  const studentNis = item.nis || item.nisn || '-'
                  const unitName =
                    item.education_unit?.name || item.unit?.name || item.unit || '-'
                  const tahun =
                    item.metadata?.tahun_lulus ||
                    item.metadata?.tahun_mutasi ||
                    new Date(
                      item.updated_at || item.created_at || Date.now()
                    ).getFullYear()

                  return (
                    <TableRow
                      key={item.id || item.nis || index}
                      className="hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      {/* Kolom 1: Identitas Siswa */}
                      <TableCell className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedAlumniModal(item)}
                          className="font-extrabold text-slate-900 dark:text-white text-xs border-b border-dashed border-slate-400/60 hover:border-emerald-600 transition-colors cursor-pointer text-left block"
                        >
                          <PersonIdentityCell
                            src={item.foto_url}
                            name={studentName}
                            subtitle={`NIS: ${studentNis}`}
                          />
                        </button>
                      </TableCell>

                      {/* Kolom 2: Unit Pendidikan */}
                      <TableCell className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300 text-xs">
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                          {unitName}
                        </span>
                      </TableCell>

                      {/* Kolom 3: Tahun & Status */}
                      <TableCell className="py-3 px-4 text-center text-xs">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">
                          Tahun {tahun}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(item)}
                        </div>
                      </TableCell>

                      {/* Kolom 4: Tujuan Kelulusan */}
                      <TableCell className="py-3 px-4 text-center text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-700/80">
                          {getTujuanText(item)}
                        </span>
                      </TableCell>

                      {/* Kolom 5: Aksi (Tanpa Label Header) */}
                      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                        <ActionDropdown
                          onView={() => setSelectedAlumniModal(item)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableRoot>
          )}
        </div>

        <div className="w-full border-t border-emerald-200/80 bg-emerald-50/30 px-4 py-3 sm:px-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <Pagination
 currentPage={halaman}
 totalPages={totalHalaman}
 onPageChange={(page) => setHalaman(page)}
 sideLayout="full"
 />
 </div>
 </div>
 </motion.div>
 </motion.div>
 </PageContainer>
 )
}
