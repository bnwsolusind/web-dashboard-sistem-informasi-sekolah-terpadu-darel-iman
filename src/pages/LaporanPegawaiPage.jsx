import ActionDropdown from "../components/app/ActionDropdown"
import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import CustomSelect from "../components/ui/CustomSelect"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Building2,
 ChevronDown,
 Download,
 Eye,
 FileSpreadsheet,
 FileText,
 Filter,
 Printer,
 RefreshCw,
 Search,
 UserCheck,
 UserMinus,
 Users,
 UserX,
 X,
 Briefcase,
 GraduationCap,
 CheckCircle2,
 Sparkles,
} from 'lucide-react'
import {
 ArrowRightLeft as ArrowBothDirectionHorizontal2,
 Download as Download1,
} from 'lucide-react'
import {
 Bar,
 BarChart,
 CartesianGrid,
 Cell,
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

import { Button } from '@/components/ui/button'
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
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from '@/components/ui/dialog'
import { Backdrop } from '@/components/ui/dialog'

const angka = (nilai) => new Intl.NumberFormat('id-ID').format(Number(nilai || 0))
const warnaPie = ['#059669', '#0D9488', '#10B981', '#34D399', '#F59E0B', '#F43F5E']

export default function LaporanPegawaiPage() {
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [rows, setRows] = useState([])
 const [dashboard, setDashboard] = useState({})
 
 // Filters
 const [unit, setUnit] = useState('semua')
 const [jenisKelamin, setJenisKelamin] = useState('semua')
 const [status, setStatus] = useState('semua')
 const [jabatan, setJabatan] = useState('semua')
 const [period, setPeriod] = useState('semua')
 const [dateFrom, setDateFrom] = useState('')
 const [dateTo, setDateTo] = useState('')

 // Pagination & Sorting
 const [halaman, setHalaman] = useState(1)
 const [perHalaman, setPerHalaman] = useState(10)
 const [sortKey, setSortKey] = useState('full_name')
 const [sortOrder, setSortOrder] = useState('asc')

 // Modals
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [selectedRowModal, setSelectedRowModal] = useState(null)
 const [printTargetRow, setPrintTargetRow] = useState(null)

 const getPeriodDateRange = (periodKey) => {
 const now = new Date()
 const iso = (d) => d.toISOString().slice(0, 10)
 const todayStr = iso(now)

 if (periodKey === 'hari') return { from: todayStr, to: todayStr }
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

 const loadData = useCallback(async () => {
 try {
 setLoading(true)
 setError('')
 const [list, stats] = await Promise.all([
 reportService.employees({ search: debouncedSearch }),
 reportService.employeeStats(),
 ])
 setRows(list.data || list || [])
 setDashboard(stats || {})
 } catch (err) {
 setError(err?.response?.data?.message || 'Laporan pegawai & guru gagal dimuat.')
 } finally {
 setLoading(false)
 }
 }, [debouncedSearch])

 useEffect(() => {
 loadData()
 }, [loadData])

 const daftarUnit = useMemo(
 () => [...new Set(rows.map((r) => r.education_unit?.name || r.unit?.name || r.unit).filter(Boolean))],
 [rows]
 )

 const daftarJabatan = useMemo(
 () => [...new Set(rows.map((r) => r.position?.name || r.jabatan?.name || r.jabatan).filter(Boolean))],
 [rows]
 )

 const handleSort = (key) => {
 if (sortKey === key) {
 setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
 } else {
 setSortKey(key)
 setSortOrder('asc')
 }
 }

 const hasilFilter = useMemo(() => {
 const filtered = rows.filter((r) => {
 const nama = r.nama_lengkap || r.full_name || r.nama || r.user?.name || ''
 const nip = r.niy || r.nip || ''
 const unitName = r.education_unit?.name || r.unit?.name || r.unit || ''
 const jabatanName = r.position?.name || r.jabatan?.name || r.jabatan || ''
 const cocokCari = `${nama} ${nip} ${unitName} ${jabatanName}`
 .toLowerCase()
 .includes(debouncedSearch.toLowerCase())

 const jkVal = String(r.gender || r.jenis_kelamin || '').toUpperCase()
 const cocokJK =
 jenisKelamin === 'semua' ||
 (jenisKelamin === 'L' && (jkVal.startsWith('L') || jkVal.includes('LAKI'))) ||
 (jenisKelamin === 'P' && (jkVal.startsWith('P') || jkVal.includes('PEREMPUAN')))

 const statusRaw = String(r.status || r.status_pegawai || 'aktif').toLowerCase()
 const cocokStatus =
 status === 'semua' ||
 (status === 'aktif' && (statusRaw.includes('aktif') || statusRaw === 'active' || statusRaw === 'tetap' || statusRaw === 'kontrak')) ||
 (status === 'nonaktif' && (statusRaw.includes('non') || statusRaw === 'inactive' || statusRaw.includes('cuti') || statusRaw.includes('keluar')))

 const cocokUnit = unit === 'semua' || unitName === unit
 const cocokJabatan = jabatan === 'semua' || jabatanName === jabatan

 const tglItem = r.created_at?.slice(0, 10) || r.tanggal_masuk || r.tgl_masuk
 let cocokPeriode = true
 if (dateFrom && tglItem) cocokPeriode = tglItem >= dateFrom
 if (dateTo && tglItem && cocokPeriode) cocokPeriode = tglItem <= dateTo

 return cocokCari && cocokJK && cocokStatus && cocokUnit && cocokJabatan && cocokPeriode
 })

 if (sortKey) {
 filtered.sort((a, b) => {
 let valA = a[sortKey] || a.nama_lengkap || a.full_name || a.nama || ''
 let valB = b[sortKey] || b.nama_lengkap || b.full_name || b.nama || ''
 if (typeof valA === 'string') valA = valA.toLowerCase()
 if (typeof valB === 'string') valB = valB.toLowerCase()
 if (valA < valB) return sortOrder === 'asc' ? -1 : 1
 if (valA > valB) return sortOrder === 'asc' ? 1 : -1
 return 0
 })
 }
 return filtered
 }, [rows, debouncedSearch, jenisKelamin, status, unit, jabatan, dateFrom, dateTo, sortKey, sortOrder])

 const totalHalaman = Math.max(Math.ceil(hasilFilter.length / perHalaman), 1)
 const baris = hasilFilter.slice((halaman - 1) * perHalaman, halaman * perHalaman)

 useEffect(() => {
 setHalaman(1)
 }, [search, status, unit, jenisKelamin, jabatan, period, dateFrom, dateTo, perHalaman])

 // KPIs
 const totalPegawai = Number(dashboard.total || dashboard.total_pegawai || rows.length)
 const pegawaiAktif = Number(
 dashboard.aktif ||
 dashboard.pegawai_aktif ||
 (dashboard.status ? (dashboard.status.tetap || 0) + (dashboard.status.kontrak || 0) + (dashboard.status.aktif || 0) : 0) ||
 rows.filter((r) => {
 const s = String(r.status_pegawai || r.status || '').toLowerCase()
 return s.includes('aktif') || s === 'tetap' || s === 'kontrak'
 }).length
 )
 const guru = Number(dashboard.guru || dashboard.total_guru || rows.filter((r) => String(r.position?.name || r.jabatan).toLowerCase().includes('guru')).length)
 const tendik = Number(dashboard.tendik || dashboard.total_tendik || Math.max(totalPegawai - guru, 0))
 const nonaktif = Math.max(totalPegawai - pegawaiAktif, 0)

 // Chart Data
 const dataJabatanChart = useMemo(() => {
 const map = new Map()
 rows.forEach((r) => {
 const jName = r.position?.name || r.jabatan?.name || r.jabatan || 'Lainnya'
 map.set(jName, (map.get(jName) || 0) + 1)
 })
 return [...map].slice(0, 6).map(([nama, jumlah]) => ({ nama, jumlah }))
 }, [rows])

 const dataUnitChart = useMemo(() => {
 const map = new Map()
 rows.forEach((r) => {
 const uName = r.education_unit?.name || r.unit?.name || r.unit || 'Umum/Pusat'
 map.set(uName, (map.get(uName) || 0) + 1)
 })
 return [...map].map(([nama, jumlah]) => ({ nama, jumlah }))
 }, [rows])

 const resetFilter = () => {
 setUnit('semua')
 setJenisKelamin('semua')
 setStatus('semua')
 setJabatan('semua')
 setPeriod('semua')
 setDateFrom('')
 setDateTo('')
 setSearch('')
 setSortKey('full_name')
 setSortOrder('asc')
 setHalaman(1)
 }

 const kolomCsv = [
 { key: 'nip', label: 'NIP', export: (r) => r.niy || r.nip || '-' },
 { key: 'full_name', label: 'Nama Pegawai', export: (r) => r.nama_lengkap || r.full_name || r.nama || r.user?.name || '-' },
 { key: 'gender', label: 'Jenis Kelamin', export: (r) => r.gender || r.jenis_kelamin || '-' },
 { key: 'unit', label: 'Unit', export: (r) => r.education_unit?.name || r.unit?.name || r.unit || '-' },
 { key: 'position', label: 'Jabatan', export: (r) => r.position?.name || r.jabatan?.name || r.jabatan || '-' },
 { key: 'status', label: 'Status', export: (r) => r.status_pegawai || r.status || '-' },
 ]

 const handlePrintClean = () => {
 const listToPrint = printTargetRow ? [printTargetRow] : hasilFilter
 const title = printTargetRow ? `Laporan Pegawai: ${printTargetRow.nama_lengkap || printTargetRow.full_name || printTargetRow.nama}` : 'Rekap Laporan Data Pegawai & Guru'
 const subtitle = `Total: ${listToPrint.length} Pegawai`

 printCleanTable({
 title,
 subtitle,
 headers: ['NO', 'NIP/NIY', 'NAMA PEGAWAI', 'UNIT', 'JABATAN', 'JK', 'STATUS'],
 rows: listToPrint.map((r, i) => [
 i + 1,
 r.niy || r.nip || '-',
 r.nama_lengkap || r.full_name || r.nama || '-',
 r.education_unit?.name || r.unit?.name || r.unit || '-',
 r.position?.name || r.jabatan?.name || r.jabatan || '-',
 r.gender || r.jenis_kelamin || '-',
 r.status_pegawai || r.status || '-',
 ]),
 })
 }

 const handleDownloadPdf = () => {
 const listToPrint = printTargetRow ? [printTargetRow] : hasilFilter
 const title = printTargetRow ? `Laporan Pegawai: ${printTargetRow.full_name || printTargetRow.nama}` : 'Rekap Laporan Data Pegawai & Guru'
 const filename = `rekap-pegawai-${new Date().toISOString().slice(0, 10)}.pdf`

 downloadPdfTable({
 title,
 filename,
 headers: ['NO', 'NIP', 'NAMA PEGAWAI', 'UNIT', 'JABATAN', 'JK', 'STATUS'],
 rows: listToPrint.map((r, i) => [
 i + 1,
 r.nip || '-',
 r.full_name || r.nama || '-',
 r.education_unit?.name || r.unit?.name || r.unit || '-',
 r.position?.name || r.jabatan?.name || r.jabatan || '-',
 r.gender || r.jenis_kelamin || '-',
 r.status_pegawai || r.status || '-',
 ]),
 })
 }

 if (loading) {
 return (
 <PageContainer maxW="7xl">
 <MasterEmptyState loading message="Memuat laporan data pegawai & guru..." />
 </PageContainer>
 )
 }

 if (error) {
 return (
 <PageContainer maxW="7xl">
 <MasterErrorState message={error} onRetry={loadData} />
 </PageContainer>
 )
 }

 return (
 <PageContainer className="space-y-6 pb-12">
 {/* Breadcrumb */}
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Rekap Data' },
 { label: 'Pegawai & Guru' },
 ]}
 />

      {/* MODERN HERO CARD HEADER (Harmonized Super Admin Standard) */}
      <HeroUiHeader
        title="Laporan Rekap Data Pegawai & Guru"
        subtitle="Pusat rekapitulasi SDM terpadu: statistik status aktif/non-aktif, distribusi unit kerja, jenis kelamin, dan penugasan jabatan."
        badge="Laporan Kepegawaian & SDM"
        icon={Briefcase}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={loadData}
            disabled={loading}
            prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            className="border border-emerald-500/40 bg-white/80 hover:bg-white text-emerald-800 dark:bg-slate-900/80 dark:text-emerald-300 font-bold shadow-xs cursor-pointer"
          >
            Segarkan Data
          </Button>
        }
      />

      {/* Print Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => { setIsPrintModalOpen(false); setPrintTargetRow(null); }}
 title={printTargetRow ? `Cetak Laporan: ${printTargetRow.nama_lengkap || printTargetRow.full_name || printTargetRow.nama}` : 'Laporan Data Pegawai & Guru'}
 onPrint={handlePrintClean}
 />

      {/* Detail Dialog Modal (HeroUI Harmonized Modal) */}
      <AnimatePresence>
        {selectedRowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRowModal(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] dark:border-emerald-800/60 dark:bg-[#182232]"
              role="dialog"
              aria-modal="true"
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

              <div className="p-6">
                {/* Header */}
                <div className="mb-5 flex items-start justify-between gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md border border-emerald-400/40">
                      <Eye className="size-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                          Detail Data Pegawai
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Sparkles className="size-3" />
                          Profil Pegawai
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Informasi profil lengkap dan penugasan kepegawaian.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MasterStatusBadge status={typeof selectedRowModal.status_pegawai === 'string' ? selectedRowModal.status_pegawai : (typeof selectedRowModal.status === 'string' ? selectedRowModal.status : 'Aktif')} />
                    <button
                      type="button"
                      onClick={() => setSelectedRowModal(null)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:text-slate-300 transition-colors cursor-pointer"
                      aria-label="Tutup modal"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-100/80 dark:border-emerald-800/60">
                    <div className="size-14 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-2xs">
                      {(selectedRowModal.full_name || selectedRowModal.nama || 'P').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {selectedRowModal.full_name || selectedRowModal.nama}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        NIP: {selectedRowModal.nip || '-'}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        {selectedRowModal.position?.name || selectedRowModal.jabatan?.name || selectedRowModal.jabatan_name || (typeof selectedRowModal.jabatan === 'string' ? selectedRowModal.jabatan : '') || 'Pegawai'} — {selectedRowModal.education_unit?.name || selectedRowModal.unit?.name || selectedRowModal.unit_name || (typeof selectedRowModal.unit === 'string' ? selectedRowModal.unit : '') || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl border border-emerald-100/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900/40">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">NIP</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">{selectedRowModal.nip || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Nama Lengkap</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{selectedRowModal.full_name || selectedRowModal.nama || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Unit Kerja</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{selectedRowModal.education_unit?.name || selectedRowModal.unit?.name || selectedRowModal.unit_name || (typeof selectedRowModal.unit === 'string' ? selectedRowModal.unit : '') || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Jabatan</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{selectedRowModal.position?.name || selectedRowModal.jabatan?.name || selectedRowModal.jabatan_name || (typeof selectedRowModal.jabatan === 'string' ? selectedRowModal.jabatan : '') || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Jenis Kelamin</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{selectedRowModal.gender || selectedRowModal.jenis_kelamin || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Status Kepegawaian</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">{typeof selectedRowModal.status_pegawai === 'string' ? selectedRowModal.status_pegawai : (typeof selectedRowModal.status === 'string' ? selectedRowModal.status : '-')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-emerald-200/80 pt-4 dark:border-emerald-800/60">
                  <button
                    type="button"
                    onClick={() => { setPrintTargetRow(selectedRowModal); setIsPrintModalOpen(true); }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 transition-all cursor-pointer"
                  >
                    <Printer className="size-3.5" />
                    Cetak Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRowModal(null)}
                    className="rounded-xl border border-emerald-200/80 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


 {/* KPI Stats Grid */}
 <MasterStatsGrid columns={5}>
 <MasterStatCard 
 icon={Users} 
 label="Total Pegawai" 
 value={angka(totalPegawai)} 
 subtitle={totalPegawai > 0 ? `${totalPegawai} SDM terdaftar` : 'Belum ada data'} 
 variant="success" 
 delay={0}
 active={status === 'semua' && !search}
 onClick={() => { setStatus('semua'); setSearch(''); setJabatan('semua'); }} 
 />
 <MasterStatCard 
 icon={CheckCircle2} 
 label="Pegawai Aktif" 
 value={angka(pegawaiAktif)} 
 subtitle={totalPegawai > 0 ? `${pegawaiAktif} dari ${totalPegawai} pegawai (${((pegawaiAktif / totalPegawai) * 100).toFixed(1)}%)` : 'Belum ada data'} 
 variant="info" 
 delay={50}
 active={status === 'aktif'}
 onClick={() => { setStatus(status === 'aktif' ? 'semua' : 'aktif'); setSearch(''); }} 
 />
 <MasterStatCard 
 icon={GraduationCap} 
 label="Guru Pendidik" 
 value={angka(guru)} 
 subtitle={totalPegawai > 0 ? `${guru} dari ${totalPegawai} pegawai (${((guru / totalPegawai) * 100).toFixed(1)}%)` : 'Tenaga Pendidik'} 
 variant="warning" 
 delay={100}
 active={search.toLowerCase() === 'guru'}
 onClick={() => { setSearch(search.toLowerCase() === 'guru' ? '' : 'Guru'); setStatus('semua'); }} 
 />
 <MasterStatCard 
 icon={Briefcase} 
 label="Tenaga Kependidikan" 
 value={angka(tendik)} 
 subtitle={totalPegawai > 0 ? `${tendik} dari ${totalPegawai} pegawai (${((tendik / totalPegawai) * 100).toFixed(1)}%)` : 'Tendik / Staf Support'} 
 variant="neutral" 
 delay={150}
 active={search.toLowerCase() === 'tendik' || search.toLowerCase() === 'staf'}
 onClick={() => { setSearch(search.toLowerCase() === 'tendik' ? '' : 'Tendik'); setStatus('semua'); }} 
 />
 <MasterStatCard 
 icon={UserX} 
 label="Pegawai Non-Aktif" 
 value={angka(nonaktif)} 
 subtitle={totalPegawai > 0 ? `${nonaktif} dari ${totalPegawai} pegawai (${((nonaktif / totalPegawai) * 100).toFixed(1)}%)` : 'Cuti / Resign'} 
 variant="danger" 
 delay={200}
 active={status === 'nonaktif'}
 onClick={() => { setStatus(status === 'nonaktif' ? 'semua' : 'nonaktif'); setSearch(''); }} 
 />
 </MasterStatsGrid>

 {/* KPI Definition & Transparency Banner */}
 <div className="rounded-xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-4 text-xs dark:border-emerald-800/60 dark:bg-[#13221f] dark:from-[#13221f] dark:to-[#1B2433]">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
 Formula Rasio SDM Pegawai & Guru
 </span>
 <span className="font-bold text-slate-800 dark:text-slate-100">
 SDM Aktif: {totalPegawai > 0 ? `${((pegawaiAktif / totalPegawai) * 100).toFixed(1)}%` : '—'} • Guru: {totalPegawai > 0 ? `${((guru / totalPegawai) * 100).toFixed(1)}%` : '—'} • Tendik: {totalPegawai > 0 ? `${((tendik / totalPegawai) * 100).toFixed(1)}%` : '—'}
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-400">
 <strong className="text-slate-700 dark:text-slate-200">Rumus:</strong> (Jumlah Kategori SDM / Total Pegawai Terdaftar) &times; 100% • <strong className="text-slate-700 dark:text-slate-200">Penyebut Basis:</strong> {totalPegawai} pegawai • <strong className="text-slate-700 dark:text-slate-200">Cakupan:</strong> Seluruh unit & staf yayasan.
 </p>
 </div>
 {(status !== 'semua' || search) && (
 <div className="flex items-center gap-2 shrink-0">
 <span className="rounded-lg bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300/80">
 Filter: {status !== 'semua' ? `Status ${status}` : `Pencarian "${search}"`}
 </span>
 <button
 type="button"
 onClick={() => { setStatus('semua'); setSearch(''); setJabatan('semua'); }}
 className="rounded-lg bg-emerald-50 border border-emerald-200/80 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
 >
 Reset Filter
 </button>
 </div>
 )}
 </div>
 </div>

 {/* 3-Column Equal Grid (Style persis LaporanAbsensiPage) */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
 {/* Col 1: Panel Filter Laporan */}
 <article className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Laporan Pegawai</h2>
 <button type="button" onClick={resetFilter} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
 Reset Filter
 </button>
 </div>

 <div className="space-y-3">
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unit Kerja</label>
 <CustomSelect
 value={unit}
 onChange={(e) => { setUnit(e.target.value); setHalaman(1); }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Unit Kerja</option>
 {daftarUnit.map((u) => <option key={u} value={u}>{u}</option>)}
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Jabatan</label>
 <CustomSelect
 value={jabatan}
 onChange={(e) => { setJabatan(e.target.value); setHalaman(1); }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Jabatan</option>
 {daftarJabatan.map((j) => <option key={j} value={j}>{j}</option>)}
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Jenis Kelamin</label>
 <CustomSelect
 value={jenisKelamin}
 onChange={(e) => { setJenisKelamin(e.target.value); setHalaman(1); }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Gender</option>
 <option value="L">Laki-laki (L)</option>
 <option value="P">Perempuan (P)</option>
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Status Keaktifan</label>
 <CustomSelect
 value={status}
 onChange={(e) => { setStatus(e.target.value); setHalaman(1); }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Status</option>
 <option value="aktif">Aktif</option>
 <option value="nonaktif">Non-aktif / Cuti</option>
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Periode Tanggal</label>
 <CustomSelect
 value={period}
 onChange={(e) => {
 const nextP = e.target.value
 setPeriod(nextP)
 if (nextP !== 'custom' && nextP !== 'semua') {
 const { from, to } = getPeriodDateRange(nextP)
 setDateFrom(from)
 setDateTo(to)
 } else if (nextP === 'semua') {
 setDateFrom('')
 setDateTo('')
 }
 setHalaman(1)
 }}
 className="w-full h-9 px-3 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="semua">Semua Periode</option>
 <option value="hari">Hari Ini</option>
 <option value="minggu">7 Hari Terakhir</option>
 <option value="bulan">Bulan Ini</option>
 <option value="semester">6 Bulan Terakhir</option>
 <option value="tahun">Tahun Ini</option>
 <option value="custom">Rentang Kustom</option>
 </CustomSelect>
 </div>

 <div className="grid grid-cols-2 gap-2 pt-1">
 <div>
 <label className="block text-xs font-medium text-slate-500 mb-0.5">Tanggal Mulai</label>
 <DatePicker
 value={dateFrom}
 onChange={(e) => { setDateFrom(e.target.value); setPeriod('custom'); setHalaman(1); }}
 placeholder="Mulai..."
 inputClassName="h-8 text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-500 mb-0.5">Tanggal Selesai</label>
 <DatePicker
 value={dateTo}
 onChange={(e) => { setDateTo(e.target.value); setPeriod('custom'); setHalaman(1); }}
 placeholder="Selesai..."
 inputClassName="h-8 text-xs"
 />
 </div>
 </div>
 </div>
 </div>
 </article>

 {/* Col 2: Grafik Distribusi Jabatan */}
 <article className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Jabatan SDM</h2>
 <span className="text-xs font-semibold text-slate-400">Position Breakdown</span>
 </div>
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={dataJabatanChart} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
 <XAxis dataKey="nama" tick={{ fontSize: 10 }} stroke="#888888" />
 <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
 <Tooltip formatter={(v) => [angka(v), 'Pegawai']} />
 <Bar dataKey="jumlah" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={44} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </article>

 {/* Col 3: Grafik Distribusi Unit Kerja */}
 <article className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Unit Kerja</h2>
 <span className="text-xs font-bold text-slate-500">{angka(totalPegawai)} Total</span>
 </div>
 <div className="flex flex-col items-center justify-center flex-1">
 <div className="relative w-48 h-48 sm:w-52 sm:h-52 mb-3 flex items-center justify-center">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={dataUnitChart} dataKey="jumlah" nameKey="nama" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
 {dataUnitChart.map((_, i) => <Cell key={i} fill={warnaPie[i % warnaPie.length]} />)}
 </Pie>
 <Tooltip formatter={(v) => [angka(v), 'Pegawai']} />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <strong className="text-xl font-black text-slate-900 dark:text-white">{angka(totalPegawai)}</strong>
 <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total SDM</span>
 </div>
 </div>

 <div className="w-full grid grid-cols-2 gap-2 text-xs">
 {dataUnitChart.slice(0, 4).map((item, i) => (
 <div key={item.nama} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
 <span className="size-2.5 rounded-full shrink-0" style={{ background: warnaPie[i % warnaPie.length] }} />
 <div className="flex items-center justify-between w-full min-w-0">
 <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{item.nama}</span>
 <span className="text-xs font-bold text-slate-900 dark:text-white ml-1">{angka(item.jumlah)}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </article>
 </div>

 {/* ── Datatable Card (HeroUI Emerald Datatable - 5 Columns Standard) ── */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Daftar Pegawai & Guru</h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Total {hasilFilter.length} Pegawai
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Rincian data kepegawaian terdaftar beserta unit kerja dan jabatannya.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 py-1">
              <SquircleActionButton variant="export" label="Export CSV" onClick={() => exportCsv('rekap-pegawai.csv', kolomCsv, hasilFilter)} />
              <SquircleActionButton variant="print" label="Cetak Data" onClick={() => { setPrintTargetRow(null); setIsPrintModalOpen(true); }} />
            </div>
          </div>

          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIP, Nama Pegawai, Jabatan, atau Unit Kerja..."
              className="w-full pl-10 pr-9 h-9 text-xs font-semibold rounded-xl border border-emerald-200/90 bg-emerald-50/20 text-slate-800 placeholder:text-emerald-700/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:text-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Menampilkan <strong>{hasilFilter.length}</strong> pegawai terfilter</span>

            <div className="relative flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Per Halaman:</span>
              <div className="relative">
                <CustomSelect
                  value={perHalaman}
                  onChange={(e) => { setPerHalaman(Number(e.target.value)); setHalaman(1); }}
                  className="h-9 cursor-pointer appearance-none rounded-xl border border-emerald-200/90 bg-emerald-50/20 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:text-slate-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </CustomSelect>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          {hasilFilter.length === 0 ? (
            <div className="py-8">
              <MasterEmptyState message="Tidak ada data pegawai yang cocok dengan filter atau pencarian Anda." />
            </div>
          ) : (
            <TableRoot className="w-full text-left border-collapse text-xs">
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow>
                  {/* Kolom 1: Pegawai / Guru (Nama & NIP) */}
                  <TableHead className="py-3 px-4 font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 cursor-pointer select-none" onClick={() => handleSort('full_name')}>
                    <div className="flex items-center gap-1.5">
                      <span>Pegawai / Guru</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </TableHead>
                  {/* Kolom 2: Unit Kerja */}
                  <TableHead className="py-3 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                    Unit Kerja
                  </TableHead>
                  {/* Kolom 3: Jabatan & Gender */}
                  <TableHead className="py-3 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                    Jabatan & Peran
                  </TableHead>
                  {/* Kolom 4: Status Kepegawaian */}
                  <TableHead className="py-3 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                    Status
                  </TableHead>
                  {/* Kolom 5: Aksi (Tanpa Label Header Sesuai Aturan) */}
                  <TableHead className="py-3 px-4 w-24 text-right select-none" />
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                {baris.map((item, index) => {
                  const nameStr = item.nama_lengkap || item.full_name || item.nama || item.user?.name || '-'
                  const nipStr = item.niy || item.nip || '-'
                  const unitStr = item.education_unit?.name || item.unit?.name || item.unit || '-'
                  const jabatanStr = item.position?.name || item.jabatan?.name || item.jabatan || '-'
                  const genderStr = item.gender || item.jenis_kelamin || ''
                  const isActive = item.status === 'Aktif' || item.status_pegawai === 'Tetap' || item.status_pegawai === 'Kontrak' || item.status === true || (typeof item.status === 'string' && item.status.toLowerCase() === 'aktif')

                  return (
                    <TableRow key={item.id || item.nip || index} className="hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors">
                      {/* Kolom 1: Identitas Pegawai */}
                      <TableCell className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedRowModal(item)}
                          className="font-extrabold text-slate-900 dark:text-white text-xs border-b border-dashed border-slate-400/60 hover:border-emerald-600 transition-colors cursor-pointer text-left"
                        >
                          <PersonIdentityCell name={nameStr} subtitle={nipStr !== '-' ? `NIP: ${nipStr}` : null} />
                        </button>
                      </TableCell>

                      {/* Kolom 2: Unit Kerja */}
                      <TableCell className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300 text-xs">
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                          {unitStr}
                        </span>
                      </TableCell>

                      {/* Kolom 3: Jabatan & Peran */}
                      <TableCell className="py-3 px-4 text-center text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{jabatanStr}</div>
                        {genderStr && (
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Gender: {genderStr}</div>
                        )}
                      </TableCell>

                      {/* Kolom 4: Status Pegawai */}
                      <TableCell className="py-3 px-4 text-center">
                        <MasterStatusBadge
                          active={isActive}
                          activeLabel={item.status_pegawai || 'Aktif'}
                          inactiveLabel={item.status_pegawai || 'Tidak Aktif'}
                          className="cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setSelectedRowModal(item)}
                        />
                      </TableCell>

                      {/* Kolom 5: Aksi (Tanpa Label Header) */}
                      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                        <ActionDropdown
                          onView={() => setSelectedRowModal(item)}
                          extraItems={[
                            {
                              label: "Cetak Data Pegawai",
                              icon: Printer,
                              onClick: () => {
                                setPrintTargetRow(item)
                                setIsPrintModalOpen(true)
                              }
                            }
                          ]}
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
          <Pagination currentPage={halaman} totalPages={totalHalaman} onPageChange={(page) => setHalaman(page)} sideLayout="full" />
        </div>
      </div>
</PageContainer>
 )
}