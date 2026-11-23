import AppBreadcrumb from '../../../components/app/AppBreadcrumb'
import React, { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  GraduationCap,
  Briefcase,
  UserX,
  Award,
  Heart,
  PlusCircle,
  LogOut
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  motion
} from 'framer-motion'
import {
  reportService
} from '../../../services/reportService'
import {
  ReportHeader
} from '../../../components/reports/ReportHeader'
import {
  ReportPeriodFilter
} from '../../../components/reports/ReportPeriodFilter'
import {
  ReportKpiGrid
} from '../../../components/reports/ReportKpiGrid'
import {
  ReportRecapTable
} from '../../../components/reports/ReportRecapTable'
import {
  ReportDetailTable
} from '../../../components/reports/ReportDetailTable'
import {
  ReportInsightCard
} from '../../../components/reports/ReportInsightCard'
import {
  ReportNotesCard
} from '../../../components/reports/ReportNotesCard'
import {
  ReportPreviewModal
} from '../../../components/reports/ReportPreviewModal'
import {
  ReportExportModal
} from '../../../components/reports/ReportExportModal'
import {
  ReadOnlyDetailModal
} from '../../../components/reports/ReadOnlyDetailModal'
import {
  ReportSkeleton
} from '../../../components/reports/ReportSkeleton'
import {
  ReportEmptyState
} from '../../../components/reports/ReportEmptyState'
import {
  ReportErrorState
} from '../../../components/reports/ReportErrorState'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import {
  Breadcrumbs
} from '@/components/ui/breadcrumbs'
import {
  printCleanTable
} from '../../../utils/printHelper'
import {
  usePengaturanStore
} from '../../../stores/pengaturanStore'
import {
  SmartScrollFab
} from '../../../components/common'

const COLORS = ['#059669', '#0D9488', '#0D9488', '#10B981', '#1E8E5A', '#34D399', '#F59E0B']

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
 hidden: { opacity: 0, y: 16 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.4, ease: 'easeOut' },
 },
}

export const LaporanSdmPage = () => {
 const sitePengaturan = usePengaturanStore((state) => state.pengaturan)
 const [filters, setFilters] = useState({ period: 'year', page: 1, per_page: 15, search: '' })
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)
 const [reportData, setReportData] = useState(null)

 const [allDetails, setAllDetails] = useState([])

 // Modals state
 const [isPreviewOpen, setIsPreviewOpen] = useState(false)
 const [isExportOpen, setIsExportOpen] = useState(false)
 const [exportFormat, setExportFormat] = useState('excel')
 const [detailModalData, setDetailModalData] = useState(null)

 const fetchReport = async () => {
 setLoading(true)
 setError(false)
 try {
 const res = await reportService.getFoundationSdmReport(filters)
 setReportData(res)

 // Fetch unpaginated report dataset for modals so modals contain ALL records matching KPI cards
 const fullRes = await reportService.getFoundationSdmReport({ ...filters, page: 1, per_page: 1000 })
 if (fullRes && Array.isArray(fullRes.details)) {
 setAllDetails(fullRes.details)
 } else if (res && Array.isArray(res.details)) {
 setAllDetails(res.details)
 }
 } catch (err) {
 console.error('Failed to fetch SDM report', err)
 setError(true)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchReport()
 }, [filters])

 const handlePeriodChange = (periodObj) => {
 setFilters((prev) => ({ ...prev, ...periodObj, page: 1 }))
 }

 const handleResetFilter = () => {
 setFilters({ period: 'year', page: 1, per_page: 15, search: '' })
 }

 const handleViewDetail = async (row) => {
 try {
 const detail = await reportService.getFoundationSdmDetail(row.id)
 setDetailModalData(detail)
 } catch (e) {
 setDetailModalData(row)
 }
 }

 const handleExportPdf = () => {
 setExportFormat('pdf')
 setIsExportOpen(true)
 }

 const handleExportExcel = () => {
 setExportFormat('excel')
 setIsExportOpen(true)
 }

 const handleConfirmExport = async ({ format, orientation, options }) => {
 await reportService.exportFoundationReport('sdm', { ...filters, format, orientation, ...options })
 }

 const handlePrintReport = () => {
 if (!reportData) return
 const headers = [
 'No',
 'Unit Pendidikan',
 'Guru',
 'Non-Guru',
 'Total SDM',
 'Aktif',
 'Nonaktif',
 'Laki-Laki',
 'Perempuan',
 ]

 const rows = (reportData.unit_recaps || []).map((r, idx) => [
 idx + 1,
 r.unit_name || '-',
 (r.guru ?? 0).toLocaleString('id-ID'),
 (r.non_guru ?? 0).toLocaleString('id-ID'),
 (r.total_sdm ?? 0).toLocaleString('id-ID'),
 (r.aktif ?? 0).toLocaleString('id-ID'),
 (r.nonaktif ?? 0).toLocaleString('id-ID'),
 (r.laki_laki ?? 0).toLocaleString('id-ID'),
 (r.perempuan ?? 0).toLocaleString('id-ID'),
 ])

 if (reportData.unit_recaps_total) {
 const tot = reportData.unit_recaps_total
 rows.push([
 '—',
 'TOTAL KESELURUHAN',
 (tot.guru ?? 0).toLocaleString('id-ID'),
 (tot.non_guru ?? 0).toLocaleString('id-ID'),
 (tot.total_sdm ?? 0).toLocaleString('id-ID'),
 (tot.aktif ?? 0).toLocaleString('id-ID'),
 (tot.nonaktif ?? 0).toLocaleString('id-ID'),
 (tot.laki_laki ?? 0).toLocaleString('id-ID'),
 (tot.perempuan ?? 0).toLocaleString('id-ID'),
 ])
 }

 const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
 printCleanTable({
 title: 'LAPORAN REKAPITULASI SDM & PEGAWAI',
 subtitle: reportData.report?.title || orgName || 'Laporan Rekapitulasi SDM & Pegawai',
 period: reportData.report?.period?.label || filters.period || 'Tahun Ajaran Aktif',
 headers,
 rows,
 orientation: 'landscape',
 foundationName: orgName,
 systemLogo: sitePengaturan?.logo_url,
 })
 }

 if (loading && !reportData) return <ReportSkeleton />
 if (error) return <ReportErrorState onRetry={fetchReport} />
 if (!reportData || !reportData.summary) return <ReportEmptyState onReset={handleResetFilter} />

 const { summary, charts, unit_recaps, unit_recaps_total, details, insights, meta, report } = reportData

 const activeDetails = allDetails.length > 0 ? allDetails : (details || [])

 const kpiItems = [
 { key: 'total_sdm', title: 'Total SDM Pegawai', value: summary.total_sdm, unit: 'Pegawai', icon: Users, iconBg: 'bg-emerald-50 text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-300' },
 { key: 'guru', title: 'Total Guru / Pendidik', value: summary.total_guru, unit: 'Guru', icon: GraduationCap, iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' },
 { key: 'non_guru', title: 'Pegawai Non-Guru', value: summary.total_non_guru, unit: 'Tendik', icon: Briefcase, iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300' },
 { key: 'aktif', title: 'SDM Aktif', value: summary.sdm_aktif, unit: 'Aktif', icon: UserCheck, iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300' },
 { key: 'guru_tetap', title: 'Guru Tetap', value: summary.guru_tetap, unit: 'Tetap', icon: Award, iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
 { key: 'laki_laki', title: 'Laki-Laki', value: summary.laki_laki, unit: 'SDM', icon: Heart, iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300' },
 { key: 'perempuan', title: 'Perempuan', value: summary.perempuan, unit: 'SDM', icon: Heart, iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300' },
 { key: 'sdm_baru', title: 'SDM Baru (Periode)', value: summary.sdm_baru, unit: 'Baru', icon: PlusCircle, iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' },
 ]

 const recapColumns = [
 { header: 'Unit Pendidikan', accessor: 'unit_name' },
 { header: 'Guru', accessor: 'guru', align: 'right' },
 { header: 'Pegawai Non-Guru', accessor: 'non_guru', align: 'right' },
 { header: 'Total SDM', accessor: 'total_sdm', align: 'right' },
 { header: 'Aktif', accessor: 'aktif', align: 'right' },
 { header: 'Nonaktif', accessor: 'nonaktif', align: 'right' },
 { header: 'Laki-Laki', accessor: 'laki_laki', align: 'right' },
 { header: 'Perempuan', accessor: 'perempuan', align: 'right' },
 ]

 const detailColumns = [
 { header: 'Pegawai & Jenis SDM', accessor: 'nama' },
 { header: 'Unit & Jabatan', accessor: 'unit' },
 { header: 'Status Kepegawaian', accessor: 'status_kepegawaian' },
 { header: 'Tanggal Masuk', accessor: 'tanggal_masuk' },
 ]

 return (
 <motion.div
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 className="laporan-page-content space-y-6 pb-12"
 >
 {/* 🧭 HeroUI Breadcrumbs Navigation */}
 <motion.div variants={itemVariants} className="print:hidden">
 <Breadcrumbs
 dividerType="chevron"
 items={[
 { href: '/dashboard/yayasan', label: 'Yayasan' },
 { href: '/dashboard/yayasan/laporan', label: 'Laporan Eksekutif' },
 { label: 'Laporan SDM' },
 ]}
 />
 </motion.div>

 {/* 1. Header Laporan */}
 <motion.div variants={itemVariants}>
 <ReportHeader
 title={report.title}
 description={report.description}
 periodLabel={report.period?.label}
 generatedAt={report.generated_at}
 />
 </motion.div>

 {/* 2. Ringkasan Analisis Laporan (Di bawah Header) */}
 <motion.div variants={itemVariants} className="print:hidden">
 <ReportInsightCard insights={insights} unitRecaps={unit_recaps} summary={summary} details={activeDetails} />
 </motion.div>

 {/* 3. Catatan & Identitas Laporan */}
 <motion.div variants={itemVariants} className="print:hidden">
 <ReportNotesCard
 periodLabel={report.period?.label}
 generatedAt={report.generated_at}
 />
 </motion.div>

 {/* 4. Filter Periode & Aksi Laporan */}
 <motion.div variants={itemVariants}>
 <ReportPeriodFilter
 period={filters.period}
 startDate={filters.tanggal_mulai}
 endDate={filters.tanggal_selesai}
 onChange={handlePeriodChange}
 onReset={handleResetFilter}
 onRefresh={fetchReport}
 onOpenPreview={() => setIsPreviewOpen(true)}
 onPrint={handlePrintReport}
 onExportPdf={handleExportPdf}
 onExportExcel={handleExportExcel}
 loading={loading}
 />
 </motion.div>

 {/* 5. KPI Ringkasan */}
 <motion.div variants={itemVariants}>
 <ReportKpiGrid items={kpiItems} details={activeDetails} />
 </motion.div>

 {/* 6. Grafik & Visualisasi */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2 print:hidden">
 <Card className="border border-emerald-200/80 bg-white shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-bold text-slate-900 dark:text-emerald-600">Distribusi Guru vs Pegawai per Unit</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={charts.unit_distribution || []}>
 <XAxis dataKey="name" stroke="#888888" fontSize={11} />
 <YAxis stroke="#888888" fontSize={11} />
 <Tooltip />
 <Legend />
 <Bar dataKey="guru" name="Guru" fill="#059669" radius={[4, 4, 0, 0]} />
 <Bar dataKey="non_guru" name="Pegawai Non-Guru" fill="#10B981" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 <Card className="border border-emerald-200/80 bg-white shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-bold text-slate-900 dark:text-amber-600">Status Kepegawaian SDM</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={charts.status_kepegawaian || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
 {(charts.status_kepegawaian || []).map((_, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>
 </motion.div>

 {/* 6. Rekap Per Unit */}
 <motion.div variants={itemVariants} id="tabel-rekap-sdm" className="scroll-mt-6">
 <ReportRecapTable
 title="Rekapitulasi SDM per Unit Pendidikan"
 columns={recapColumns}
 data={unit_recaps}
 totalRow={unit_recaps_total}
 />
 </motion.div>

 {/* 7. Data Rinci & Action Popup */}
 <motion.div variants={itemVariants}>
 <ReportDetailTable
 title="Rincian Data SDM Pegawai"
 description="Daftar rincian data pembentuk angka laporan. Hanya aksi Lihat Detail yang tersedia."
 columns={detailColumns}
 data={details}
 meta={meta}
 search={filters.search}
 perPage={filters.per_page}
 onSearchChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
 onPerPageChange={(perPage) => setFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }))}
 onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
 onViewDetail={handleViewDetail}
 filters={filters}
 onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))}
 />
 </motion.div>

 {/* Modals */}
 <ReportPreviewModal
 isOpen={isPreviewOpen}
 onClose={() => setIsPreviewOpen(false)}
 reportData={reportData}
 onPrint={handlePrintReport}
 onExportPdf={() => setIsExportOpen(true)}
 />

 <ReportExportModal
 isOpen={isExportOpen}
 onClose={() => setIsExportOpen(false)}
 onConfirmExport={handleConfirmExport}
 defaultFormat={exportFormat}
 />

 <ReadOnlyDetailModal
 isOpen={!!detailModalData}
 onClose={() => setDetailModalData(null)}
 title="Detail Data SDM Pegawai"
 data={detailModalData}
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-rekap-sdm" downTooltip="Langsung ke Tabel SDM" />
 </motion.div>
 )
}
