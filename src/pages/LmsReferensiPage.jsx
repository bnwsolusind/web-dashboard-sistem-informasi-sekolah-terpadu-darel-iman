import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import CustomSelect from "../components/ui/CustomSelect"
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 BookOpen,
 BookMarked,
 User,
 Building,
 Calendar,
 Link as LinkIcon,
 FileText,
 Plus,
 Search,
 Edit3,
 Trash2,
 RefreshCw,
 CheckCircle,
 AlertCircle,
 X,
 Sparkles,
 Filter,
 ChevronLeft,
 ChevronRight,
 ExternalLink,
 Eye,
 FileUp,
 Clock,
 Layers,
 Download,
 Info,
 Check,
 Ban,
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import { lmsReferensiService } from '../services/lmsReferensiService'
import { useDebounce } from '../hooks/useDebounce'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
 MasterDataTable,
 SquircleActionButton,
 PrintOptionModal,
} from '../components/master-data'
import {
 TableRoot,
 TableHeader,
 TableBody,
 TableRow,
 TableHead,
 TableCell,
} from '../components/ui/table'
import CsvImportModal from '../components/master-data/CsvImportModal'
import ActionDropdown from '../components/app/ActionDropdown'
import AppModal from '../components/app/AppModal'
import { RotateCcw, Printer } from 'lucide-react'

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.05,
 delayChildren: 0.02,
 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.35, ease: 'easeOut' },
 },
}

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
 const tones = {
 emerald: {
 card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
 title: 'text-emerald-700 dark:text-emerald-400',
 icon: 'text-emerald-500',
 val: 'text-emerald-600 dark:text-emerald-300',
 sub: 'text-emerald-600/70 dark:text-emerald-400/70',
 },
 teal: {
 card: 'border-teal-100 bg-teal-50/50 hover:border-teal-200 dark:border-teal-950/50 dark:bg-teal-950/20',
 title: 'text-teal-700 dark:text-teal-400',
 icon: 'text-teal-500',
 val: 'text-teal-600 dark:text-teal-300',
 sub: 'text-teal-600/70 dark:text-teal-400/70',
 },
 blue: {
 card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
 title: 'text-blue-700 dark:text-blue-400',
 icon: 'text-blue-500',
 val: 'text-blue-600 dark:text-blue-300',
 sub: 'text-blue-600/70 dark:text-blue-400/70',
 },
 purple: {
 card: 'border-purple-100 bg-purple-50/50 hover:border-purple-200 dark:border-purple-950/50 dark:bg-purple-950/20',
 title: 'text-purple-700 dark:text-purple-400',
 icon: 'text-purple-500',
 val: 'text-purple-600 dark:text-purple-300',
 sub: 'text-purple-600/70 dark:text-purple-400/70',
 },
 amber: {
 card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
 title: 'text-amber-700 dark:text-amber-400',
 icon: 'text-amber-500',
 val: 'text-amber-600 dark:text-amber-300',
 sub: 'text-amber-600/70 dark:text-amber-400/70',
 },
 }
 const t = tones[tone] || tones.emerald
 return (
 <motion.div
 variants={itemVariants}
 whileHover={{ scale: 1.04, y: -2 }}
 whileTap={{ scale: 0.96 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 onClick={onClick}
 className={`text-left rounded-xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group`}
 >
 <div className="flex items-center justify-between">
 <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
 <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
 </div>
 <p className={`mt-2 text-2xl font-extrabold ${t.val}`}>{value ?? 0}</p>
 {subtext && (
 <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
 {subtext}
 </p>
 )}
 </motion.div>
 )
}

export default function LmsReferensiPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
 const [dataReferensi, setDataReferensi] = useState([])
 const [optionsModulAjar, setOptionsModulAjar] = useState([])
 const [optionsReferensiUmum, setOptionsReferensiUmum] = useState([])
 const [stats, setStats] = useState({
 total_referensi: 0,
 total_aktif: 0,
 total_non_aktif: 0,
 dengan_file: 0,
 dengan_url: 0,
 total_modul_ajar: 0,
 })

 const [loading, setLoading] = useState(true)
 const [errorMsg, setErrorMsg] = useState('')
 const [successMsg, setSuccessMsg] = useState('')

 // KPI Modal State
 const [kpiModalOpen, setKpiModalOpen] = useState(false)
 const [kpiModalCategory, setKpiModalCategory] = useState({
 title: '',
 items: [],
 })

 // Filters & Pagination
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedModulAjar, setSelectedModulAjar] = useState('')
 const [selectedStatus, setSelectedStatus] = useState('')
 const [page, setPage] = useState(1)
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 total: 0,
 per_page: 15,
 })

 // Modal State
 const [modalOpen, setModalOpen] = useState(false)
 const [previewModalOpen, setPreviewModalOpen] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [importOpen, setImportOpen] = useState(false)
 const [previewItem, setPreviewItem] = useState(null)
 const [editingItem, setEditingItem] = useState(null)
 const [formSubmitting, setFormSubmitting] = useState(false)
 const [selectedFile, setSelectedFile] = useState(null)
 const [selectedReferensiUmumId, setSelectedReferensiUmumId] = useState('')

 const handleExportCSV = () => {
 const headers = ['NO', 'JUDUL', 'PENULIS', 'PENERBIT', 'TAHUN', 'MODUL AJAR', 'URL/FILE', 'STATUS']
 const rows = (dataReferensi || []).map((r, i) => [
 i + 1,
 `"${(r.judul || '').replace(/"/g, '""')}"`,
 `"${(r.penulis || '').replace(/"/g, '""')}"`,
 `"${(r.penerbit || '').replace(/"/g, '""')}"`,
 r.tahun || '',
 `"${(r.modul_ajar?.judul_modul || 'Referensi Umum').replace(/"/g, '""')}"`,
 `"${(r.url || r.file_url || '').replace(/"/g, '""')}"`,
 r.status === 'aktif' ? 'Aktif' : 'Non-Aktif',
 ])
 const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
 const encodedUri = encodeURI(csvContent)
 const link = document.createElement('a')
 link.setAttribute('href', encodedUri)
 link.setAttribute('download', `export_referensi_pembelajaran_${new Date().toISOString().slice(0, 10)}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }

 const handleImport = async (parsedData) => {
 setSuccessMsg(`Berhasil mengimpor ${parsedData.length} data referensi pembelajaran.`)
 fetchDaftarReferensi()
 }

 const pageActions = (
 <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
 <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
 <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
 <SquircleActionButton variant="print" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
 <SquircleActionButton variant="primary" label="Tambah Referensi" onClick={() => handleOpenAddModal()} />
 </div>
 )

 const [formData, setFormData] = useState({
 modul_ajar_id: '',
 judul: '',
 penulis: '',
 penerbit: '',
 tahun: new Date().getFullYear(),
 url: '',
 status: 'aktif',
 })

 const loadInitialOptionsAndStats = async () => {
 try {
 const [optRes, statsRes] = await Promise.all([
 lmsReferensiService.getOptions(),
 lmsReferensiService.getStats(),
 ])
 if (optRes?.data?.modul_ajar_options) {
 setOptionsModulAjar(optRes.data.modul_ajar_options)
 }
 if (optRes?.data?.referensi_umum_options) {
 setOptionsReferensiUmum(optRes.data.referensi_umum_options)
 }
 if (statsRes?.data) {
 setStats(statsRes.data)
 }
 } catch (err) {
 console.error('Failed to load initial options and stats:', err)
 }
 }

 const computedStats = useMemo(() => {
 return {
 total_referensi: dataReferensi.length,
 total_aktif: dataReferensi.filter((r) => r.status === 'aktif').length,
 dengan_file: dataReferensi.filter((r) => !!r.file || !!r.file_url).length,
 dengan_url: dataReferensi.filter((r) => !!r.url).length,
 total_modul_ajar: new Set(dataReferensi.map((r) => r.modul_ajar_id || r.modul_ajar?.id).filter(Boolean)).size,
 }
 }, [dataReferensi])

 const handleOpenKpiModal = (type) => {
 let title = ''
 let items = []

 if (type === 'total') {
 title = 'Total Referensi Terdaftar'
 items = dataReferensi
 } else if (type === 'aktif') {
 title = 'Daftar Referensi Aktif'
 items = dataReferensi.filter((r) => r.status === 'aktif')
 } else if (type === 'file') {
 title = 'Daftar Referensi Berkas File Dokumen'
 items = dataReferensi.filter((r) => !!r.file || !!r.file_url)
 } else if (type === 'url') {
 title = 'Daftar Referensi Tautan URL Web'
 items = dataReferensi.filter((r) => !!r.url)
 } else if (type === 'modul') {
 title = 'Daftar Referensi Berdasarkan Modul Ajar'
 items = dataReferensi
 }

 setKpiModalCategory({ title, items })
 setKpiModalOpen(true)
 }

 const fetchDaftarReferensi = async () => {
 setLoading(true)
 setErrorMsg('')
 try {
 const response = await lmsReferensiService.getDaftar({
 page,
 search: debouncedSearch,
 modul_ajar_id: selectedModulAjar,
 status: selectedStatus,
 per_page: 15,
 })
 if (response?.data) {
 setDataReferensi(response.data)
 if (response.meta) {
 setPagination({
 current_page: response.meta.current_page || 1,
 last_page: response.meta.last_page || 1,
 total: response.meta.total || 0,
 per_page: response.meta.per_page || 15,
 })
 }
 if (response.statistik) {
 setStats(response.statistik)
 }
 }
 } catch (err) {
 setErrorMsg('Gagal memuat daftar Referensi Pembelajaran. Silakan coba lagi.')
 console.error(err)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadInitialOptionsAndStats()
 }, [])

 useEffect(() => {
 fetchDaftarReferensi()
 }, [page, debouncedSearch, selectedModulAjar, selectedStatus])

 const handleOpenAddModal = () => {
 setEditingItem(null)
 setSelectedFile(null)
 setSelectedReferensiUmumId('')
 setFormData({
 modul_ajar_id: '',
 judul: '',
 penulis: '',
 penerbit: '',
 tahun: new Date().getFullYear(),
 url: '',
 status: 'aktif',
 })
 setModalOpen(true)
 }

 const handleOpenEditModal = (item) => {
 setEditingItem(item)
 setSelectedFile(null)
 setSelectedReferensiUmumId('')
 setFormData({
 modul_ajar_id: item.modul_ajar_id || '',
 judul: item.judul || '',
 penulis: item.penulis || '',
 penerbit: item.penerbit || '',
 tahun: item.tahun || new Date().getFullYear(),
 url: item.url || '',
 status: item.status || 'aktif',
 })
 setModalOpen(true)
 }

 const handleSelectReferensiUmum = (refId) => {
 setSelectedReferensiUmumId(refId)
 if (!refId) return
 const selectedRef = optionsReferensiUmum.find((r) => r.id === refId)
 if (selectedRef) {
 setFormData((prev) => ({
 ...prev,
 judul: selectedRef.judul || prev.judul,
 penulis: selectedRef.penulis || prev.penulis,
 penerbit: selectedRef.penerbit || prev.penerbit,
 tahun: selectedRef.tahun || prev.tahun,
 url: selectedRef.url || prev.url,
 }))
 }
 }

 const handleOpenPreviewModal = (item) => {
 setPreviewItem(item)
 setPreviewModalOpen(true)
 }

 const handleFormChange = (e) => {
 const { name, value } = e.target
 setFormData((prev) => ({ ...prev, [name]: value }))
 }

 const handleFileChange = (e) => {
 if (e.target.files && e.target.files[0]) {
 setSelectedFile(e.target.files[0])
 }
 }

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (!formData.judul.trim()) {
 Swal.fire('Peringatan', 'Judul referensi wajib diisi!', 'warning')
 return
 }

 setFormSubmitting(true)
 try {
 const payload = new FormData()
 payload.append('modul_ajar_id', formData.modul_ajar_id || '')
 payload.append('judul', formData.judul)
 if (formData.penulis) payload.append('penulis', formData.penulis)
 if (formData.penerbit) payload.append('penerbit', formData.penerbit)
 if (formData.tahun) payload.append('tahun', formData.tahun)
 if (formData.url) payload.append('url', formData.url)
 payload.append('status', formData.status)

 if (selectedFile) {
 payload.append('file', selectedFile)
 }

 if (editingItem) {
 await lmsReferensiService.update(editingItem.id, payload)
 setSuccessMsg('Referensi Pembelajaran berhasil diperbarui!')
 } else {
 await lmsReferensiService.create(payload)
 setSuccessMsg('Referensi Pembelajaran berhasil ditambahkan!')
 }

 setModalOpen(false)
 fetchDaftarReferensi()
 loadInitialOptionsAndStats()
 } catch (err) {
 console.error(err)
 const errRes = err.response?.data
 const pesan = errRes?.message || 'Gagal menyimpan data Referensi Pembelajaran.'
 Swal.fire('Error', pesan, 'error')
 } finally {
 setFormSubmitting(false)
 }
 }

 const handleDelete = async (id, judul) => {
 const result = await Swal.fire({
 title: 'Konfirmasi Hapus',
 text: `Apakah Anda yakin ingin menghapus referensi "${judul}"?`,
 icon: 'warning',
 showCancelButton: true,
 confirmButtonColor: '#d33',
 cancelButtonColor: '#3085d6',
 confirmButtonText: 'Ya, Hapus!',
 cancelButtonText: 'Batal',
 })

 if (result.isConfirmed) {
 try {
 await lmsReferensiService.delete(id)
 Swal.fire('Berhasil', 'Referensi Pembelajaran berhasil dihapus.', 'success')
 fetchDaftarReferensi()
 loadInitialOptionsAndStats()
 } catch (err) {
 console.error(err)
 Swal.fire('Error', 'Gagal menghapus data Referensi Pembelajaran.', 'error')
 }
 }
 }

 const getStatusBadge = (status) => {
 const isActive = status === 'aktif'
 return (
 <span
 className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
 isActive
 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
 : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-emerald-200/80 dark:border-emerald-700/80'
 }`}
 >
 <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
 {isActive ? 'Aktif' : 'Non-Aktif'}
 </span>
 )
 }

 return (
 <PageContainer maxW="7xl">
 {!(embedded || hideBreadcrumb) && (
 <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Referensi Pembelajaran' }]} />
 )}
 <div className="lms-referensi-page space-y-6">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Referensi Pembelajaran"
 onPrint={() => {
 const rowsToPrint = Array.isArray(dataReferensi) ? dataReferensi : []
 printCleanTable({
 title: 'Laporan Data Referensi Pembelajaran',
 subtitle: 'Daftar Referensi Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'JUDUL REFERENSI', 'PENULIS & PENERBIT', 'TAHUN', 'MODUL AJAR TERKAIT', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.judul || '-',
 `${row.penulis || '-'}${row.penerbit ? ` / ${row.penerbit}` : ''}`,
 row.tahun || '-',
 row.modul_ajar?.judul_modul || 'Referensi Umum',
 row.status === 'aktif' ? 'Aktif' : 'Non-Aktif',
 ]),
 })
 }}
 onDownload={() => {
 const rowsToPrint = Array.isArray(dataReferensi) ? dataReferensi : []
 downloadPdfTable({
 title: 'Laporan Data Referensi Pembelajaran',
 subtitle: 'Daftar Referensi Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'JUDUL REFERENSI', 'PENULIS & PENERBIT', 'TAHUN', 'MODUL AJAR TERKAIT', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.judul || '-',
 `${row.penulis || '-'}${row.penerbit ? ` / ${row.penerbit}` : ''}`,
 row.tahun || '-',
 row.modul_ajar?.judul_modul || 'Referensi Umum',
 row.status === 'aktif' ? 'Aktif' : 'Non-Aktif',
 ]),
 filename: 'laporan_referensi_pembelajaran.pdf',
 })
 }}
 />

 <CsvImportModal
 open={importOpen}
 onClose={() => setImportOpen(false)}
 title="Referensi Pembelajaran"
 onImport={handleImport}
 columns={[
 { key: 'modul_ajar_id' },
 { key: 'judul', required: true, example: 'Buku Fiqih Islam Terpadu' },
 { key: 'penulis', example: 'Dr. Ahmad' },
 { key: 'penerbit', example: 'Penerbit Erlangga' },
 { key: 'tahun', example: '2024' },
 { key: 'url', example: 'https://...' },
 { key: 'status', example: 'aktif' },
 ]}
 />
 {/* Header Banner */}
        {!hidePageHeader && (
          <div className="mb-6">
            <HeroUiHeader
              title="Referensi Pembelajaran"
              subtitle="Kelola buku acuan, jurnal, modul luar, dan sumber kepustakaan digital terpadu (Modul Ajar 1:N Referensi)."
              badge="Modul LMS Terpadu"
              icon={BookMarked}
            />
          </div>
        )}

 {/* Alert Messages */}
 {successMsg && (
 <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm shadow-sm animate-fade-in">
 <div className="flex items-center gap-3">
 <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>{successMsg}</span>
 </div>
 <button onClick={() => setSuccessMsg('')} className="hover:opacity-75">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {errorMsg && (
 <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm shadow-sm animate-fade-in">
 <div className="flex items-center gap-3">
 <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 <button onClick={() => setErrorMsg('')} className="hover:opacity-75">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {/* KPI Cards */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
 <KpiTintedCard
 icon={BookMarked}
 label="Total Referensi"
 value={computedStats.total_referensi}
 subtext="Item referensi terdaftar"
 tone="emerald"
 onClick={() => handleOpenKpiModal('total')}
 />
 <KpiTintedCard
 icon={CheckCircle}
 label="Status Aktif"
 value={computedStats.total_aktif}
 subtext="Siap digunakan mengajar"
 tone="teal"
 onClick={() => handleOpenKpiModal('aktif')}
 />
 <KpiTintedCard
 icon={FileText}
 label="Dengan File Dokumen"
 value={computedStats.dengan_file}
 subtext="Berkas PDF/Dokumen terunggah"
 tone="blue"
 onClick={() => handleOpenKpiModal('file')}
 />
 <KpiTintedCard
 icon={LinkIcon}
 label="Tautan URL Web"
 value={computedStats.dengan_url}
 subtext="Link portal/jurnal eksternal"
 tone="purple"
 onClick={() => handleOpenKpiModal('url')}
 />
 <KpiTintedCard
 icon={Layers}
 label="Modul Ajar Terkait"
 value={computedStats.total_modul_ajar}
 subtext="Induk Modul Ajar aktif"
 tone="amber"
 onClick={() => handleOpenKpiModal('modul')}
 />
 </motion.div>

 {/* Tab Navigation Card (below KPI grid) */}
 {tabNav && (
 <motion.div variants={itemVariants}>
 {typeof tabNav === 'function' ? tabNav() : tabNav}
 </motion.div>
 )}

 {/* DATA TABLE CONTAINER */}
 <motion.div variants={itemVariants}>
 <section className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:bg-[#1B2433]" aria-labelledby="referensi-table-title">
 {/* Row 1: Table Title and Action Buttons */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center gap-3">
 <div>
 <h2 id="referensi-table-title" className="text-base font-extrabold text-slate-900 dark:text-white">Data Referensi Pembelajaran</h2>
 <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">Daftar buku acuan, jurnal, dan kepustakaan digital terpadu.</p>
 </div>
 <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
 {pagination.total || 0} Data
 </span>
 </div>
 {pageActions}
 </div>

 {/* Row 2: Full-width Search Input */}
 <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:from-slate-900/40 dark:via-emerald-950/20 dark:to-slate-900/40">
 <div className="relative w-full">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari judul, penulis, penerbit, tahun..."
 value={search}
 onChange={(e) => {
 setSearch(e.target.value)
 setPage(1)
 }}
 className="h-9 w-full rounded-xl border border-emerald-200/80 bg-white pl-10 pr-4 text-xs font-medium text-slate-700 shadow-inner outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200"
 />
 </div>
 </div>

 {/* Row 3: Horizontal Filter Bar */}
 <div className="flex flex-wrap items-center gap-2.5 px-3 sm:px-4 py-2.5 border-b border-emerald-200/80 bg-slate-50/50 dark:bg-slate-900/50 dark:border-emerald-800/60 dark:from-slate-900/30 dark:to-slate-900/30">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
 Filter:
 </span>

 <CustomSelect
 value={selectedModulAjar}
 onChange={(e) => {
 setSelectedModulAjar(e.target.value)
 setPage(1)
 }}
 className="h-9 rounded-xl border border-emerald-200/80 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="">-- Semua Modul Ajar --</option>
 <option value="umum">-- Referensi Umum (Tanpa Modul) --</option>
 {optionsModulAjar.map((modul) => (
 <option key={modul.id} value={modul.id}>
 {modul.kode_modul ? `[${modul.kode_modul}] ` : ''}
 {modul.judul_modul}
 </option>
 ))}
 </CustomSelect>

 <CustomSelect
 value={selectedStatus}
 onChange={(e) => {
 setSelectedStatus(e.target.value)
 setPage(1)
 }}
 className="h-9 rounded-xl border border-emerald-200/80 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="">-- Semua Status --</option>
 <option value="aktif">Aktif</option>
 <option value="non-aktif">Non-Aktif</option>
 </CustomSelect>

 <button
 type="button"
 onClick={() => {
 setSearch('')
 setSelectedModulAjar('')
 setSelectedStatus('')
 setPage(1)
 }}
 className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
 title="Reset Filter"
 >
 <RotateCcw className="size-3.5" />
 <span>Reset</span>
 </button>
 </div>

 <MasterDataTable className="!rounded-none !border-0 !shadow-none">
                      <TableRoot className="w-full text-left border-collapse">
                        <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                          <TableRow>
                            <TableHead className="py-3 px-4">JUDUL REFERENSI</TableHead>
                            <TableHead className="py-3 px-4">PENULIS &amp; PENERBIT</TableHead>
                            <TableHead className="py-3 px-4">MODUL AJAR</TableHead>
                            <TableHead className="py-3 px-4 text-center">STATUS</TableHead>
                            <TableHead className="w-16 sm:w-20 text-right select-none" />
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
                          {kpiModalCategory.items.map((item, idx) => (
                            <TableRow key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                              <TableCell className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.judul}</TableCell>
                              <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                                {item.penulis ? `${item.penulis} (${item.tahun || '-'})` : '-'}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                                {item.modul_ajar?.judul_modul || '-'}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-center">{getStatusBadge(item.status)}</TableCell>
                              <TableCell className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setKpiModalOpen(false)
                                    handleOpenPreviewModal(item)
                                  }}
                                  className="px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 font-semibold text-xs transition-colors cursor-pointer"
                                >
                                  Detail
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </TableRoot>
 </MasterDataTable>

 {/* Pagination Footer */}
 {pagination.last_page > 1 && (
 <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-[#1B2433] border-t border-emerald-200/90 dark:border-emerald-800/60 text-xs text-slate-600 dark:text-slate-300 gap-3">
 <span>
 Menampilkan <span className="font-bold text-emerald-700 dark:text-emerald-400">{pagination.from || 0} - {pagination.to || 0}</span> dari total <span className="font-bold text-slate-900 dark:text-white">{pagination.total || 0}</span> referensi
 </span>
 <div className="flex items-center gap-2">
 <button
 disabled={pagination.current_page === 1}
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 aria-label="Halaman Sebelumnya"
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
 >
 <ChevronLeft className="size-5 text-emerald-600" />
 </button>
 <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
 Halaman {pagination.current_page} dari {pagination.last_page}
 </span>
 <button
 disabled={pagination.current_page === pagination.last_page}
 onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
 aria-label="Halaman Selanjutnya"
 className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
 >
 <ChevronRight className="size-5 text-emerald-600" />
 </button>
 </div>
 </div>
 )}
 </section>
 </motion.div>

 {/* KPI DETAIL MODAL */}
 <AppModal
 isOpen={kpiModalOpen}
 onClose={() => setKpiModalOpen(false)}
 title={kpiModalCategory.title}
 description={`Menampilkan ${kpiModalCategory.items.length} referensi terdaftar`}
 icon={BookMarked}
 maxWidth="max-w-4xl"
 zIndex={50}
 footer={
 <button
 type="button"
 onClick={() => setKpiModalOpen(false)}
 className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
 >
 Tutup
 </button>
 }
 >
 {kpiModalCategory.items.length === 0 ? (
 <div className="py-12 text-center text-slate-400">
 <BookMarked className="w-12 h-9 mx-auto mb-3 opacity-30" />
 <p className="font-semibold text-sm">Tidak ada data referensi dalam kategori ini.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <TableRoot className="w-full text-left border-collapse">
 <TableHeader>
 <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
 <TableHead className="py-3 px-4 text-center w-12">No</TableHead>
 <TableHead className="py-3 px-4">Judul Referensi</TableHead>
 <TableHead className="py-3 px-4">Penulis &amp; Penerbit</TableHead>
 <TableHead className="py-3 px-4">Modul Ajar</TableHead>
 <TableHead className="py-3 px-4 text-center">Status</TableHead>
 <TableHead className="py-3 px-4 text-right">Aksi</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
 {kpiModalCategory.items.map((item, idx) => (
 <TableRow key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <TableCell className="py-3 px-4 text-center text-slate-400 text-xs font-medium">{idx + 1}</TableCell>
 <TableCell className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.judul}</TableCell>
 <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
 {item.penulis ? `${item.penulis} (${item.tahun || '-'})` : '-'}
 </TableCell>
 <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
 {item.modul_ajar?.judul_modul || '-'}
 </TableCell>
 <TableCell className="py-3 px-4 text-center">{getStatusBadge(item.status)}</TableCell>
 <TableCell className="py-3 px-4 text-right">
 <button
 onClick={() => {
 setKpiModalOpen(false)
 handleOpenPreviewModal(item)
 }}
 className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition-colors"
 >
 Detail
 </button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 )}
 </AppModal>

 {/* Add/Edit Modal */}
 <AppModal
 isOpen={modalOpen}
 onClose={() => setModalOpen(false)}
 title={editingItem ? 'Edit Referensi Pembelajaran' : 'Tambah Referensi Pembelajaran Baru'}
 description="Lengkapi informasi buku, jurnal, atau referensi digital."
 icon={BookMarked}
 maxWidth="max-w-2xl"
 zIndex={50}
 footer={
 <>
 <button
 type="button"
 onClick={() => setModalOpen(false)}
 className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
 >
 Batal
 </button>
 <button
 type="submit"
 form="lms-referensi-form"
 disabled={formSubmitting}
 className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0E5C44] hover:bg-[#1E8E5A] active:scale-95 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
 >
 {formSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
 {editingItem ? 'Simpan Perubahan' : 'Tambah Referensi'}
 </button>
 </>
 }
 >
 <form id="lms-referensi-form" onSubmit={handleSubmit} className="space-y-4">
 {/* Pilih dari Data Referensi Umum (Pre-fill Opsional) */}
 {!editingItem && optionsReferensiUmum.length > 0 && (
 <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
 <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E5C44] dark:text-emerald-400">
 Salin dari Data Referensi Umum (Opsional)
 </label>
 <CustomSelect
 value={selectedReferensiUmumId}
 onChange={(e) => handleSelectReferensiUmum(e.target.value)}
 className="w-full px-3.5 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0E5C44] focus:outline-none transition-all"
 >
 <option value="">-- Pilih Referensi Umum yang Tersedia --</option>
 {optionsReferensiUmum.map((ref) => (
 <option key={ref.id} value={ref.id}>
 {ref.judul} {ref.penulis ? `(${ref.penulis})` : ''}
 </option>
 ))}
 </CustomSelect>
 <p className="text-xs text-emerald-700 dark:text-emerald-300">
 Pilih referensi umum terdaftar untuk mengisi otomatis Judul, Penulis, Penerbit, Tahun, dan URL.
 </p>
 </div>
 )}

 {/* Select Modul Ajar */}
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
 Tautkan Modul Ajar (Opsional)
 </label>
 <CustomSelect
 name="modul_ajar_id"
 value={formData.modul_ajar_id}
 onChange={handleFormChange}
 className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0E5C44] focus:outline-none transition-all"
 >
 <option value="">-- Referensi Umum (Tanpa Modul) --</option>
 {optionsModulAjar.map((modul) => (
 <option key={modul.id} value={modul.id}>
 {modul.kode_modul ? `[${modul.kode_modul}] ` : ''}
 {modul.judul_modul}
 </option>
 ))}
 </CustomSelect>
 </div>

 {/* Judul Referensi */}
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
 Judul Referensi <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 name="judul"
 placeholder="Contoh: Buku Paket Matematika Kurikulum Merdeka SMP Kelas VII"
 value={formData.judul}
 onChange={handleFormChange}
 required
 className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0E5C44] focus:outline-none transition-all"
 />
 </div>

 {/* Penulis & Penerbit */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
 Penulis / Pengarang
 </label>
 <input
 type="text"
 name="penulis"
 placeholder="Contoh: Dr. Ahmad Dahlan"
 value={formData.penulis}
 onChange={handleFormChange}
 className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0E5C44] focus:outline-none transition-all"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
 Penerbit
 </label>
 <input
 type="text"
 name="penerbit"
 placeholder="Contoh: Kemendikbudristek / Erlangga"
 value={formData.penerbit}
 onChange={handleFormChange}
 className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0E5C44] focus:outline-none transition-all"
 />
 </div>
 </div>

 {/* Tahun & Status */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
 Tahun Terbit
 </label>
 <input
 type="number"
 name="tahun"
 min="1900"
 max="2100"
 placeholder="2024"
 value={formData.tahun}
 onChange={handleFormChange}
 className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0E5C44] focus:outline-none transition-all"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
 Status Referensi
 </label>
 <CustomSelect
 name="status"
 value={formData.status}
 onChange={handleFormChange}
 className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0E5C44] focus:outline-none transition-all"
 >
 <option value="aktif">Aktif</option>
 <option value="non-aktif">Non-Aktif</option>
 </CustomSelect>
 </div>
 </div>

 {/* URL Eksternal Link */}
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
 Tautan URL Eksternal / Website / Jurnal
 </label>
 <input
 type="url"
 name="url"
 placeholder="https://..."
 value={formData.url}
 onChange={handleFormChange}
 className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-700/80 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0E5C44] focus:outline-none transition-all"
 />
 </div>

 {/* Upload File PDF / Dokumen */}
 <div>
 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
 Unggah Berkas File (PDF/DOC/Image, maks 20MB)
 </label>
 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-emerald-200/80 dark:border-emerald-700/80 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/30 hover:border-[#0E5C44] transition-all">
 <div className="space-y-1 text-center">
 <FileUp className="mx-auto h-9 w-10 text-slate-400" />
 <div className="flex text-sm text-slate-600 dark:text-slate-400">
 <label
 htmlFor="file-upload"
 className="relative cursor-pointer font-medium text-[#0E5C44] dark:text-emerald-400 hover:underline"
 >
 <span>Pilih berkas file</span>
 <input
 id="file-upload"
 name="file-upload"
 type="file"
 onChange={handleFileChange}
 className="sr-only"
 />
 </label>
 <p className="pl-1">atau drag and drop di sini</p>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-500">PDF, DOC, DOCX, PNG, JPG hingga 20MB</p>
 {selectedFile && (
 <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
 <Check className="w-4 h-4" /> Terpilih: {selectedFile.name}
 </div>
 )}
 {editingItem?.file_url && !selectedFile && (
 <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
 File saat ini sudah ada. Pilih file baru jika ingin menggantinya.
 </p>
 )}
 </div>
 </div>
 </div>
 </form>
 </AppModal>

 {/* Preview / Detail Modal */}
 <AppModal
 isOpen={Boolean(previewModalOpen && previewItem)}
 onClose={() => setPreviewModalOpen(false)}
 title="Detail Referensi Pembelajaran"
 description="Informasi lengkap kepustakaan & modul"
 icon={Eye}
 maxWidth="max-w-xl"
 zIndex={50}
 footer={
 <button
 type="button"
 onClick={() => setPreviewModalOpen(false)}
 className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
 >
 Tutup
 </button>
 }
 >
 {previewItem && (
 <>
 <div>
 <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Judul Referensi</span>
 <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{previewItem.judul}</h4>
 </div>

 <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-emerald-100/80 dark:border-emerald-800/60">
 <div>
 <span className="text-xs text-slate-400 block">Penulis</span>
 <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
 {previewItem.penulis || '-'}
 </span>
 </div>
 <div>
 <span className="text-xs text-slate-400 block">Penerbit</span>
 <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
 {previewItem.penerbit || '-'}
 </span>
 </div>
 <div>
 <span className="text-xs text-slate-400 block">Tahun Terbit</span>
 <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
 {previewItem.tahun || '-'}
 </span>
 </div>
 <div>
 <span className="text-xs text-slate-400 block">Status</span>
 <span className="text-sm font-semibold capitalize text-emerald-600 dark:text-emerald-400">
 {previewItem.status || 'aktif'}
 </span>
 </div>
 </div>

 {previewItem.modul_ajar && (
 <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
 <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
 Modul Ajar Terkait
 </span>
 <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
 {previewItem.modul_ajar.judul_modul}
 </p>
 {previewItem.modul_ajar.kode_modul && (
 <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
 Kode: {previewItem.modul_ajar.kode_modul}
 </p>
 )}
 </div>
 )}

 <div className="space-y-2 pt-2">
 {previewItem.file_url && (
 <a
 href={previewItem.file_url}
 target="_blank"
 rel="noopener noreferrer"
 className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0E5C44] hover:bg-[#1E8E5A] text-white font-semibold text-sm rounded-xl transition-all shadow-md"
 >
 <Download className="w-4 h-4" /> Unduh Berkas File
 </a>
 )}
 {previewItem.url && (
 <a
 href={previewItem.url}
 target="_blank"
 rel="noopener noreferrer"
 className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl transition-all border border-emerald-200/80 dark:border-emerald-700/80"
 >
 <ExternalLink className="w-4 h-4" /> Buka Tautan URL Web
 </a>
 )}
 </div>
 </>
 )}
 </AppModal>
 </motion.div>
 </div>
 </PageContainer>
 )
}
