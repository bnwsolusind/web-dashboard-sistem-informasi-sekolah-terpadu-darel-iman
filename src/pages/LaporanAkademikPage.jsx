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
  GraduationCap,
  Sparkles,
  Printer,
  RefreshCw,
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react'
import {
  Download as Download1,
  Upload as Upload1
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
 { key: 'siswa', label: 'Nama Siswa', render: (row) => row.student?.full_name || row.student?.nama || '-', export: (row) => row.student?.full_name || row.student?.nama },
 { key: 'nis', label: 'NIS', render: (row) => row.student?.nis || '-', export: (row) => row.student?.nis },
 { key: 'mapel', label: 'Mata Pelajaran', render: (row) => row.subject?.name || '-', export: (row) => row.subject?.name },
 { key: 'assignment_score', label: 'Tugas' },
 { key: 'midterm_score', label: 'UTS' },
 { key: 'final_exam_score', label: 'UAS' },
 { key: 'final_score', label: 'Nilai Akhir' },
 { key: 'grade_letter', label: 'Predikat' },
 { key: 'is_passed', label: 'Ketuntasan', render: (row) => (row.is_passed ? 'Tuntas' : 'Belum Tuntas'), export: (row) => (row.is_passed ? 'Tuntas' : 'Belum Tuntas') },
]

export default function LaporanAkademikPage() {
 const [filters, setFilters] = useState({ kelas_id: '', semester_id: '' })
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [rows, setRows] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [currentPage, setCurrentPage] = useState(1)
 const perPage = 10

 const load = useCallback(async () => {
 try {
 setLoading(true)
 setError('')
 const result = await reportService.grades(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
 setRows(result.data || result || [])
 } catch (err) {
 setError(err?.response?.data?.message || 'Laporan akademik gagal dimuat.')
 } finally {
 setLoading(false)
 }
 }, [filters])

 useEffect(() => {
 load()
 }, [load])

 const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'passed' | 'remedial'

 const filteredRows = useMemo(() => {
 let result = rows
 if (statusFilter === 'passed') {
 result = result.filter((r) => Boolean(r.is_passed))
 } else if (statusFilter === 'remedial') {
 result = result.filter((r) => !r.is_passed)
 }

 if (!debouncedSearch.trim()) return result
 const q = debouncedSearch.toLowerCase()
 return result.filter((r) => {
 const name = (r.student?.full_name || r.student?.nama || '').toLowerCase()
 const nis = (r.student?.nis || '').toLowerCase()
 const mapel = (r.subject?.name || '').toLowerCase()
 return name.includes(q) || nis.includes(q) || mapel.includes(q)
 })
 }, [rows, debouncedSearch, statusFilter])

 const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage))
 const paginatedRows = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredRows.slice(start, start + perPage)
 }, [filteredRows, currentPage, perPage])

 const stats = useMemo(() => {
 const values = rows.map((row) => Number(row.final_score || 0))
 const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '—'
 const passed = rows.filter((row) => Boolean(row.is_passed)).length
 return {
 total: rows.length,
 avg,
 passed,
 remedial: rows.length - passed,
 }
 }, [rows])

 const handlePrintClean = () => {
 setIsPrintModalOpen(false)
 printCleanTable({
 title: 'Laporan Rekap Akademik & Leger Nilai Siswa',
 subtitle: `Total Catatan Nilai: ${filteredRows.length} Data`,
 headers: ['#', 'Nama Siswa', 'NIS', 'Mata Pelajaran', 'Tugas', 'UTS', 'UAS', 'Nilai Akhir', 'Predikat', 'Status'],
 rows: filteredRows.map((r, i) => [
 i + 1,
 r.student?.full_name || r.student?.nama || '-',
 r.student?.nis || '-',
 r.subject?.name || '-',
 r.assignment_score || 0,
 r.midterm_score || 0,
 r.final_exam_score || 0,
 r.final_score || 0,
 r.grade_letter || '-',
 r.is_passed ? 'Tuntas' : 'Belum Tuntas',
 ]),
 })
 }

 const handleDownloadPdf = () => {
 setIsPrintModalOpen(false)
 downloadPdfTable({
 title: 'Laporan Rekap Akademik & Leger Nilai Siswa',
 subtitle: `Total Catatan Nilai: ${filteredRows.length} Data`,
 headers: ['#', 'Nama Siswa', 'NIS', 'Mata Pelajaran', 'Tugas', 'UTS', 'UAS', 'Nilai Akhir', 'Predikat', 'Status'],
 rows: filteredRows.map((r, i) => [
 i + 1,
 r.student?.full_name || r.student?.nama || '-',
 r.student?.nis || '-',
 r.subject?.name || '-',
 r.assignment_score || 0,
 r.midterm_score || 0,
 r.final_exam_score || 0,
 r.final_score || 0,
 r.grade_letter || '-',
 r.is_passed ? 'Tuntas' : 'Belum Tuntas',
 ]),
 filename: `Laporan_Akademik_${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 }


 return (
 <PageContainer className="space-y-6 pb-12">
 {/* Navigation Breadcrumb */}
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Laporan Akademik & Nilai' }]} />

 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Laporan Akademik & Leger Nilai"
 onPrint={handlePrintClean}
 onDownloadPdf={handleDownloadPdf}
 />

 {/* MODERN HERO CARD HEADER */}
      <HeroUiHeader
        title="Laporan Akademik & Leger Nilai"
        subtitle="Analisis capaian nilai akademik, rekapitulasi nilai per semester, distribusi nilai, dan pencetakan leger nilai siswa."
        badge="Laporan & Leger"
        icon={GraduationCap}
        className="mb-6"
      />

 {/* KPI Stats Grid */}
 <MasterStatsGrid columns={4}>
 <MasterStatCard
 icon={BookOpen}
 label="Total Catatan Nilai"
 value={stats.total}
 subtitle="Tercatat dalam sistem"
 variant="info"
 delay={0}
 active={statusFilter === 'all'}
 onClick={() => {
 setStatusFilter('all')
 setCurrentPage(1)
 }}
 />
 <MasterStatCard
 icon={Sparkles}
 label="Rata-rata Nilai"
 value={stats.avg}
 subtitle="Nilai akhir akumulatif"
 variant="warning"
 delay={50}
 />
 <MasterStatCard
 icon={CheckCircle2}
 label="Siswa Tuntas"
 value={stats.passed}
 subtitle={stats.total > 0 ? `${stats.passed} dari ${stats.total} entri (${((stats.passed / stats.total) * 100).toFixed(1)}%)` : 'Belum ada data'}
 variant="success"
 delay={100}
 active={statusFilter === 'passed'}
 onClick={() => {
 setStatusFilter(statusFilter === 'passed' ? 'all' : 'passed')
 setCurrentPage(1)
 }}
 />
 <MasterStatCard
 icon={AlertTriangle}
 label="Perlu Remedial"
 value={stats.remedial}
 subtitle={stats.total > 0 ? `${stats.remedial} dari ${stats.total} entri (${((stats.remedial / stats.total) * 100).toFixed(1)}%)` : 'Belum ada data'}
 variant="danger"
 delay={150}
 active={statusFilter === 'remedial'}
 onClick={() => {
 setStatusFilter(statusFilter === 'remedial' ? 'all' : 'remedial')
 setCurrentPage(1)
 }}
 />
 </MasterStatsGrid>

 {/* KPI Definition & Drilldown Transparency Banner */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 text-xs dark:border-emerald-800/60 dark:bg-[#13221f] dark:from-[#13221f] dark:to-[#1B2433]">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
 Formula KPI Ketuntasan
 </span>
 <span className="font-bold text-slate-800 dark:text-slate-100">
 Tingkat Kelulusan KKM: {stats.total > 0 ? `${((stats.passed / stats.total) * 100).toFixed(1)}%` : '—'}
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-400">
 <strong className="text-slate-700 dark:text-slate-200">Rumus:</strong> (Siswa Nilai Akhir &ge; KKM / Total Catatan Leger) &times; 100% • <strong className="text-slate-700 dark:text-slate-200">Pembilang:</strong> {stats.passed} catatan tuntas • <strong className="text-slate-700 dark:text-slate-200">Penyebut:</strong> {stats.total} catatan total • <strong className="text-slate-700 dark:text-slate-200">Batas KKM:</strong> 75.0 (Skala 100).
 </p>
 </div>
 {statusFilter !== 'all' && (
 <div className="flex items-center gap-2 shrink-0">
 <span className="rounded-lg bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Filter Aktif: {statusFilter === 'passed' ? 'Siswa Tuntas' : 'Perlu Remedial'}
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
 <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Leger Nilai Siswa</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Daftar rincian leger nilai mata pelajaran, tugas, UTS, UAS, dan predikat akhir.
 </p>
 </div>

 <div className="flex items-center gap-2 flex-nowrap shrink-0 py-1">
 <SquircleActionButton
 variant="export"
 label="Export CSV"
 onClick={() => exportCsv('rekap-akademik.csv', columns, filteredRows)}
 />
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak Data"
 onClick={() => setIsPrintModalOpen(true)}
 />
 </div>
 </div>

 {/* Filter & Search Baris 2 */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <Input
 type="text"
 placeholder="Cari siswa, NIS, atau mapel..."
 value={search}
 onChange={(e) => {
 setSearch(e.target.value)
 setCurrentPage(1)
 }}
 className="pl-9 h-9 text-xs"
 />
 </div>
 <div>
 <Input
 type="text"
 placeholder="Filter ID Kelas (Opsional)"
 value={filters.kelas_id}
 onChange={(e) => {
 setFilters({ ...filters, kelas_id: e.target.value })
 setCurrentPage(1)
 }}
 className="h-9 text-xs"
 />
 </div>
 <div>
 <Input
 type="text"
 placeholder="Filter ID Semester (Opsional)"
 value={filters.semester_id}
 onChange={(e) => {
 setFilters({ ...filters, semester_id: e.target.value })
 setCurrentPage(1)
 }}
 className="h-9 text-xs"
 />
 </div>
 </div>
 </div>

 {/* Content Table */}
 <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
 {loading ? (
 <div className="py-12">
 <MasterEmptyState loading message="Memuat leger nilai akademik..." />
 </div>
 ) : error ? (
 <div className="py-12">
 <MasterErrorState message={error} onRetry={load} />
 </div>
 ) : paginatedRows.length === 0 ? (
 <div className="py-12">
 <MasterEmptyState message="Tidak ada catatan nilai yang cocok dengan filter atau pencarian Anda." />
 </div>
 ) : (
                      <TableRoot fullBleed={false}>
                        <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                          <TableRow>
                            <TableHead className="px-4 py-3.5">SISWA & NIS</TableHead>
                            <TableHead className="px-4 py-3.5">MATA PELAJARAN</TableHead>
                            <TableHead className="px-4 py-3.5">REKAP NILAI (TUGAS • UTS • UAS)</TableHead>
                            <TableHead className="px-4 py-3.5">NILAI AKHIR & STATUS</TableHead>
                            <TableHead className="w-16 sm:w-20 text-right select-none" />
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
                          {paginatedRows.map((r, i) => (
                            <TableRow key={r.id || i} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                              <TableCell className="px-4 py-3">
                                <div className="font-bold text-slate-900 dark:text-white text-xs">{r.student?.full_name || r.student?.nama || '-'}</div>
                                <div className="font-mono text-[10px] text-slate-400">NIS: {r.student?.nis || '-'}</div>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                                  {r.subject?.name || '-'}
                                </span>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300">T: {r.assignment_score || 0}</span>
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300">UTS: {r.midterm_score || 0}</span>
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300">UAS: {r.final_exam_score || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-slate-900 dark:text-white">{r.final_score || 0} ({r.grade_letter || '-'})</span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${r.is_passed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                                    {r.is_passed ? 'Tuntas' : 'Remedial'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-right">
                                <span className="inline-block size-2 rounded-full bg-emerald-500/60" />
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
