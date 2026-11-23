import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  motion
} from 'framer-motion'
import {
  BookOpen,
  Sparkles,
  Printer,
  RefreshCw,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react'

import {
  reportService
} from '../services/reportService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  MasterStatsGrid,
  MasterStatCard,
  MasterEmptyState,
  MasterErrorState,
  PrintOptionModal,
  SquircleActionButton
} from '../components/master-data'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  exportCsv
} from '../components/reports/ReportKit'

import {
  Button
} from '@/components/ui/button'
import {
  Input
} from '@/components/ui/input'
import {
  Pagination
} from '@/components/ui/pagination'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table'

const columns = [
 { key: 'siswa', label: 'Siswa', render: (row) => row.siswa?.full_name || row.student?.full_name || '-', export: (row) => row.siswa?.full_name || row.student?.full_name },
 { key: 'tugas', label: 'Tugas', render: (row) => row.penugasan?.judul || row.assignment?.title || '-', export: (row) => row.penugasan?.judul || row.assignment?.title },
 { key: 'submitted_at', label: 'Dikumpulkan', render: (row) => row.dikumpulkan_pada || row.submitted_at || '-' },
 { key: 'status', label: 'Status' },
 { key: 'nilai', label: 'Nilai', render: (row) => row.nilai ?? row.score ?? '-' },
]

const firstNumber = (object, keys) => {
 for (const key of keys) if (object?.[key] !== undefined) return object[key]
 return 0
}

export default function LaporanLmsPage() {
 const [data, setData] = useState({ material: {}, assignment: {}, submission: {}, reportCard: {}, rows: [] })
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [currentPage, setCurrentPage] = useState(1)
 const perPage = 10

 const load = useCallback(async () => {
 try {
 setLoading(true)
 setError('')
 const [material, assignment, submission, reportCard, list] = await Promise.all([
 reportService.materialStats(),
 reportService.assignmentStats(),
 reportService.submissionStats(),
 reportService.reportCardStats(),
 reportService.submissions(),
 ])
 setData({ material, assignment, submission, reportCard, rows: list.data || list || [] })
 } catch (err) {
 setError(err?.response?.data?.message || 'Laporan aktivitas LMS gagal dimuat.')
 } finally {
 setLoading(false)
 }
 }, [])

 useEffect(() => {
 load()
 }, [load])

 const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'submitted' | 'pending'

 const filteredRows = useMemo(() => {
 let result = data.rows
 if (statusFilter === 'pending') {
 result = result.filter((r) => {
 const s = (r.status || '').toLowerCase()
 const hasScore = r.nilai != null && r.nilai !== '' && r.score != null && r.score !== ''
 return s === 'pending' || s === 'submitted' || !hasScore
 })
 }

 if (!debouncedSearch.trim()) return result
 const q = debouncedSearch.toLowerCase()
 return result.filter((r) => {
 const siswaName = (r.siswa?.full_name || r.student?.full_name || '').toLowerCase()
 const tugasTitle = (r.penugasan?.judul || r.assignment?.title || '').toLowerCase()
 const statusStr = (r.status || '').toLowerCase()
 return siswaName.includes(q) || tugasTitle.includes(q) || statusStr.includes(q)
 })
 }, [data.rows, debouncedSearch, statusFilter])

 const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage))
 const paginatedRows = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredRows.slice(start, start + perPage)
 }, [filteredRows, currentPage, perPage])

 const stats = useMemo(() => {
 return {
 material: firstNumber(data.material, ['total', 'total_materi']),
 assignment: firstNumber(data.assignment, ['total', 'total_penugasan', 'total_tugas']),
 submission: firstNumber(data.submission, ['total', 'total_pengumpulan']),
 pending: firstNumber(data.submission, ['belum_dinilai', 'pending', 'total_belum_dinilai']),
 reportCard: firstNumber(data.reportCard, ['total', 'total_rapor']),
 }
 }, [data])

 const handlePrintClean = () => {
 setIsPrintModalOpen(false)
 printCleanTable({
 title: 'Laporan Rekap Aktivitas LMS & Pengumpulan Tugas',
 subtitle: `Total Data Pengumpulan: ${filteredRows.length} Rekaman`,
 headers: ['#', 'Nama Siswa', 'Judul Tugas / Penugasan', 'Waktu Dikumpulkan', 'Status', 'Nilai'],
 rows: filteredRows.map((r, i) => [
 i + 1,
 r.siswa?.full_name || r.student?.full_name || '-',
 r.penugasan?.judul || r.assignment?.title || '-',
 r.dikumpulkan_pada || r.submitted_at || '-',
 r.status || '-',
 r.nilai ?? r.score ?? '-',
 ]),
 })
 }

 const handleDownloadPdf = () => {
 setIsPrintModalOpen(false)
 downloadPdfTable({
 title: 'Laporan Rekap Aktivitas LMS & Pengumpulan Tugas',
 subtitle: `Total Data Pengumpulan: ${filteredRows.length} Rekaman`,
 headers: ['#', 'Nama Siswa', 'Judul Tugas / Penugasan', 'Waktu Dikumpulkan', 'Status', 'Nilai'],
 rows: filteredRows.map((r, i) => [
 i + 1,
 r.siswa?.full_name || r.student?.full_name || '-',
 r.penugasan?.judul || r.assignment?.title || '-',
 r.dikumpulkan_pada || r.submitted_at || '-',
 r.status || '-',
 r.nilai ?? r.score ?? '-',
 ]),
 filename: `Laporan_LMS_${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 }


 return (
 <PageContainer className="space-y-6 pb-12">
 {/* Navigation Breadcrumb */}
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Laporan Aktivitas LMS' }]} />

 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Laporan Aktivitas LMS & Pengumpulan Tugas"
 onPrint={handlePrintClean}
 onDownloadPdf={handleDownloadPdf}
 />

 {/* MODERN HERO CARD HEADER */}
      <HeroUiHeader
        title="Laporan Rekap Aktivitas LMS & E-Learning"
        subtitle="Monitoring materi modul digital, penugasan guru, log pengumpulan tugas siswa, status verifikasi penilaian, dan penerbitan rapor."
        badge="Laporan E-Learning LMS"
        icon={BookOpen}
        className="mb-6"
      />

 {/* KPI Stats Grid */}
 <MasterStatsGrid columns={5}>
 <MasterStatCard
 icon={BookOpen}
 label="Materi Pembelajaran"
 value={stats.material}
 subtitle="Modul & bahan ajar"
 variant="info"
 delay={0}
 />
 <MasterStatCard
 icon={FileText}
 label="Total Penugasan"
 value={stats.assignment}
 subtitle="Tugas dari guru"
 variant="warning"
 delay={50}
 active={statusFilter === 'all'}
 onClick={() => {
 setStatusFilter('all')
 setCurrentPage(1)
 }}
 />
 <MasterStatCard
 icon={CheckCircle2}
 label="Tugas Dikumpulkan"
 value={stats.submission}
 subtitle={stats.assignment > 0 ? `${stats.submission} dari ${stats.assignment} tugas (${((stats.submission / stats.assignment) * 100).toFixed(1)}%)` : 'Tugas terkirim siswa'}
 variant="success"
 delay={100}
 active={statusFilter === 'submitted'}
 onClick={() => {
 setStatusFilter(statusFilter === 'submitted' ? 'all' : 'submitted')
 setCurrentPage(1)
 }}
 />
 <MasterStatCard
 icon={Clock}
 label="Belum Dinilai"
 value={stats.pending}
 subtitle={stats.submission > 0 ? `${stats.pending} dari ${stats.submission} tugas (${((stats.pending / stats.submission) * 100).toFixed(1)}%)` : 'Perlu penilaian guru'}
 variant="danger"
 delay={150}
 active={statusFilter === 'pending'}
 onClick={() => {
 setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')
 setCurrentPage(1)
 }}
 />
 <MasterStatCard
 icon={Award}
 label="Rapor Digital"
 value={stats.reportCard}
 subtitle="Capaian semester"
 variant="neutral"
 delay={200}
 />
 </MasterStatsGrid>

 {/* KPI Definition & Drilldown Transparency Banner */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 text-xs dark:border-emerald-800/60 dark:bg-[#13221f] dark:from-[#13221f] dark:to-[#1B2433]">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
 Formula KPI LMS
 </span>
 <span className="font-bold text-slate-800 dark:text-slate-100">
 Pengumpulan: {stats.assignment > 0 ? `${((stats.submission / stats.assignment) * 100).toFixed(1)}%` : '—'} • Belum Dinilai: {stats.submission > 0 ? `${((stats.pending / stats.submission) * 100).toFixed(1)}%` : '—'}
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-400">
 <strong className="text-slate-700 dark:text-slate-200">Tugas Dikumpulkan:</strong> (Tugas Terkumpul / Total Tugas Diberikan) &times; 100% ({stats.submission}/{stats.assignment}) • <strong className="text-slate-700 dark:text-slate-200">Belum Dinilai:</strong> (Tugas Antrean Koreksi / Total Tugas Terkumpul) &times; 100% ({stats.pending}/{stats.submission}).
 </p>
 </div>
 {statusFilter !== 'all' && (
 <div className="flex items-center gap-2 shrink-0">
 <span className="rounded-lg bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Filter Aktif: {statusFilter === 'pending' ? 'Belum Dinilai' : 'Semua Terkumpul'}
 </span>
 <button
 type="button"
 onClick={() => {
 setStatusFilter('all')
 setCurrentPage(1)
 }}
 className="rounded-lg bg-emerald-50 border border-emerald-200/80 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
 >
 Reset Filter
 </button>
 </div>
 )}
 </div>
 </div>

 {/* HEROUI EMERALD DATATABLE CONTAINER */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 {/* Toolbar Header Terstruktur 3-Baris */}
 <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Status Pengumpulan Tugas LMS</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Daftar log pengumpulan tugas siswa beserta waktu pengiriman, status koreksi, dan perolehan nilai.
 </p>
 </div>

 <div className="flex items-center gap-2 flex-nowrap shrink-0 py-1">
 <SquircleActionButton
 variant="export"
 label="Export CSV"
 onClick={() => exportCsv('rekap-lms.csv', columns, filteredRows)}
 />
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak Data"
 onClick={() => setIsPrintModalOpen(true)}
 />
 </div>
 </div>

 {/* Search Baris 2 */}
 <div className="relative w-full max-w-md pt-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <Input
 type="text"
 placeholder="Cari nama siswa, judul tugas, atau status..."
 value={search}
 onChange={(e) => {
 setSearch(e.target.value)
 setCurrentPage(1)
 }}
 className="pl-9 h-9 text-xs"
 />
 </div>
 </div>

 {/* Content Table */}
 <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
 {loading ? (
 <div className="py-12">
 <MasterEmptyState loading message="Memuat aktivitas LMS..." />
 </div>
 ) : error ? (
 <div className="py-12">
 <MasterErrorState message={error} onRetry={load} />
 </div>
 ) : paginatedRows.length === 0 ? (
 <div className="py-12">
 <MasterEmptyState message="Tidak ada pengumpulan tugas yang cocok dengan pencarian Anda." />
 </div>
 ) : (
              <TableRoot fullBleed={false}>
                <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                  <TableRow>
                    <TableHead>SISWA & IDENTITAS</TableHead>
                    <TableHead>JUDUL TUGAS & MAPEL</TableHead>
                    <TableHead className="text-center">WAKTU PENGUMPULAN</TableHead>
                    <TableHead className="text-center">STATUS & NILAI</TableHead>
                    <TableHead className="w-16 sm:w-20 text-right select-none" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.map((r, i) => (
                    <TableRow key={r.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {(r.siswa?.full_name || r.student?.full_name || 'S').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-emerald-100 text-xs">
                              {r.siswa?.full_name || r.student?.full_name || '-'}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              NIS: {r.siswa?.nis || r.student?.nis || '-'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {r.penugasan?.judul || r.assignment?.title || '-'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {r.penugasan?.mata_pelajaran?.nama || r.mapel || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-slate-600 dark:text-slate-300">
                        <div className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.dikumpulkan_pada || r.submitted_at || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                            {r.status || 'Terkirim'}
                          </span>
                          <span className="font-black text-xs text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {r.nilai ?? r.score ?? '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center p-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 transition-colors cursor-pointer" title="Detail Pengumpulan">
                          <FileText className="w-4 h-4" />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
 )}
 </div>

 {/* Footer Pagination Baris 3 */}
 {filteredRows.length > 0 && (
 <div className="p-4 border-t border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30">
 <Pagination
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={setCurrentPage}
 sideLayout="full"
 />
 </div>
 )}
 </div>
 </PageContainer>
 )
}
