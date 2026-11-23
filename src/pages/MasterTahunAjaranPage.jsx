import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
 Archive,
 CalendarDays,
 CheckCircle2,
 Calendar,
 FileSpreadsheet,
 FileText,
 Plus,
 Printer,
 Star,
 Upload,
 Download,
 X,
 ShieldCheck,
 Sparkles,
 AlertTriangle,
 RotateCcw,
 RefreshCcw,
 Pencil,
 Trash2,
 Loader2,
 XCircle,
 Info,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useDebounce } from '../hooks/useDebounce'
import { tahunAjaranService } from '../services/tahunAjaranService'
// TahunAjaranTable migrated to canonical AppDataTable columns
import TahunAjaranFormModal from '../components/tahun-ajaran/TahunAjaranFormModal'
import TahunAjaranDetailModal from '../components/tahun-ajaran/TahunAjaranDetailModal'
import TahunAjaranImportModal from '../components/tahun-ajaran/TahunAjaranImportModal'
import PageContainer from '../components/app/PageContainer'
import {
  HeroUiHeader, useToast, MobileDataCard, KpiStatCard, PageToolbarActions } from '../components/app'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import { useAuthStore } from '../stores/authStore'
import { hasRoleLevel, ROLE_LEVELS, isFoundationUser } from '../auth/portalResolver'
import { SmartScrollFab } from '../components/common'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { handleApiExport, downloadFileFromApi } from '../utils/exportUtils'
import {
 SquircleActionButton,
 PrintOptionModal,
 MasterFilterSelect,
} from '../components/master-data'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'

// ── 1. DEFINISI TONE WARNA KARTU KPI MODERN ──────────────────────────────────
const MODERN_CARD_TONES = {
 emerald: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
 glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
 iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300',
 tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
 title: 'text-emerald-700 dark:text-emerald-400',
 val: 'text-emerald-700 dark:text-emerald-300',
 sub: 'text-emerald-600/80 dark:text-emerald-400/80',
 cta: 'text-emerald-600/60 dark:text-emerald-500/60',
 },
 teal: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-teal-400 dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
 glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
 tag: 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300',
 title: 'text-teal-700 dark:text-teal-400',
 val: 'text-teal-700 dark:text-teal-300',
 sub: 'text-teal-600/80 dark:text-teal-400/80',
 cta: 'text-teal-600/60 dark:text-teal-500/60',
 },
 amber: {
 card: 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
 glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
 tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
 title: 'text-amber-700 dark:text-amber-400',
 val: 'text-amber-700 dark:text-amber-300',
 sub: 'text-amber-600/80 dark:text-amber-400/80',
 cta: 'text-amber-600/60 dark:text-amber-500/60',
 },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick }) {
  return (
    <KpiStatCard
      icon={Icon}
      title={label}
      value={value ?? '0'}
      description={subtext}
      badge={tag}
      tone={tone}
      onClick={onClick}
    />
  )
}



// ── 3. KOMPONEN UTAMA HALAMAN MASTER TAHUN AJARAN ─────────────────────────────
export default function MasterTahunAjaranPage({
 embedded = false,
 hidePageHeader = false,
 hideBreadcrumb = false,
}) {
 const queryClient = useQueryClient()
 const user = useAuthStore((state) => state.user)
 const isFoundation = isFoundationUser(user)
 const canManage = !isFoundation && hasRoleLevel(user, ROLE_LEVELS.OPERATOR)

 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
 const [denganSampahFilter, setDenganSampahFilter] = useState('')
 const [page, setPage] = useState(1)

 // Modals & Active Entity States
 const [selectedForEdit, setSelectedForEdit] = useState(null)
 const [selectedForDetail, setSelectedForDetail] = useState(null)
 const [isFormModalOpen, setIsFormModalOpen] = useState(false)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [isExportModalOpen, setIsExportModalOpen] = useState(false)
 const [exportFormat, setExportFormat] = useState('xlsx')
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [deleteTarget, setDeleteTarget] = useState(null)
 const [pendingSavePayload, setPendingSavePayload] = useState(null)
 const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
 const perPage = 15

 // Query Data
 const query = useQuery({
 queryKey: [
 'tahun-ajaran-list',
 page,
 perPage,
 debouncedSearch,
 selectedStatusFilter,
 denganSampahFilter,
 ],
 queryFn: () =>
 tahunAjaranService.getDaftar({
 page,
 per_page: perPage,
 search: debouncedSearch,
 status: selectedStatusFilter,
 dengan_sampah: denganSampahFilter,
 order_by: 'start_date',
 order_dir: 'desc',
 }),
 })

 const listData = Array.isArray(query.data) ? query.data : query.data?.data || []
 const meta = query.data?.meta || {}
 const stats = query.data?.statistik || {}

 const toast = useToast()
 const notify = (title, message, tone = 'success') => toast(title, message, tone)

 const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tahun-ajaran-list'] })
 const apiError = (err, fallback) =>
 notify('Terjadi Kesalahan', err?.response?.data?.message || fallback, 'danger')

 // Mutasi Data
 const simpanMutation = useMutation({
 mutationFn: tahunAjaranService.tambah,
 onSuccess: (res) => {
 invalidate()
 setIsFormModalOpen(false)
 setShowSaveConfirmModal(false)
 setPendingSavePayload(null)
 notify('Berhasil Disimpan', res?.message || 'Tahun ajaran baru berhasil ditambahkan.')
 },
 onError: (err) => apiError(err, 'Gagal menyimpan data tahun ajaran baru.'),
 })

 const ubahMutation = useMutation({
 mutationFn: tahunAjaranService.ubah,
 onSuccess: (res) => {
 invalidate()
 setIsFormModalOpen(false)
 setSelectedForEdit(null)
 setShowSaveConfirmModal(false)
 setPendingSavePayload(null)
 notify('Berhasil Diperbarui', res?.message || 'Perubahan tahun ajaran berhasil disimpan.')
 },
 onError: (err) => apiError(err, 'Gagal memperbarui data tahun ajaran.'),
 })

 const setAktifMutation = useMutation({
 mutationFn: tahunAjaranService.setAktif,
 onSuccess: (res) => {
 invalidate()
 notify('Periode Aktif Diperbarui', res?.message || 'Tahun ajaran berhasil dijadikan periode utama.')
 },
 onError: (err) => apiError(err, 'Gagal mengaktifkan tahun ajaran.'),
 })

 const hapusMutation = useMutation({
 mutationFn: tahunAjaranService.hapus,
 onSuccess: (res) => {
 invalidate()
 setDeleteTarget(null)
 notify('Berhasil Dihapus', res?.message || 'Tahun ajaran berhasil dihapus.', 'success')
 },
 onError: (err) => apiError(err, 'Gagal menghapus data tahun ajaran.'),
 })

 const pulihkanMutation = useMutation({
 mutationFn: tahunAjaranService.pulihkan,
 onSuccess: (res) => {
 invalidate()
 notify('Berhasil Dipulihkan', res?.message || 'Tahun ajaran berhasil dipulihkan dari arsip.')
 },
 onError: (err) => apiError(err, 'Gagal memulihkan data tahun ajaran.'),
 })

 const [duplicateModalData, setDuplicateModalData] = useState(null)

 const importMutation = useMutation({
 mutationFn: (importPayload) => {
 if (importPayload instanceof FormData) {
 return tahunAjaranService.prosesImport(importPayload)
 }
 if (importPayload?.file) {
 const fd = new FormData()
 fd.append('file', importPayload.file)
 fd.append('overwrite', importPayload.overwrite ? '1' : '0')
 return tahunAjaranService.prosesImport(fd)
 }
 return tahunAjaranService.prosesImport(importPayload)
 },
 onSuccess: (res) => {
 invalidate()
 setIsImportModalOpen(false)
 const resData = res?.data || res || {}
 const totalBerhasil = (resData.berhasil || 0) + (resData.diperbarui || 0)
 notify(
 'Hasil Impor Data',
 `Impor selesai. ${totalBerhasil} berhasil (${resData.berhasil || 0} baru, ${resData.diperbarui || 0} ditimpa), ${resData.duplikat || 0} dilewati, ${resData.gagal || 0} gagal.`
 )

 if ((resData.duplicates && resData.duplicates.length > 0) || (resData.errors && resData.errors.length > 0) || resData.diperbarui > 0 || resData.duplikat > 0) {
 setDuplicateModalData(resData)
 }
 },
 onError: (err) => apiError(err, 'Gagal memproses berkas impor data.'),
 })

 const activeCount = stats.aktif ?? 0
 const inactiveCount = stats.tidak_aktif ?? 0
 const total = stats.total ?? (meta.total ?? listData.length)
 const statsValue = (value) => (query.isError ? '—' : value)
 const tableIsLoading = query.isLoading || query.isFetching
 const filtersAreClear = !search && !selectedStatusFilter && !denganSampahFilter

 const openAdd = () => {
 if (!canManage) return
 setSelectedForEdit(null)
 setIsFormModalOpen(true)
 }

 const resetFilters = () => {
 setSearch('')
 setSelectedStatusFilter('')
 setDenganSampahFilter('')
 setPage(1)
 }

 const handleExportData = () => {
 setIsExportModalOpen(true)
 }

 const handleProcessExport = async () => {
 setIsExportModalOpen(false)
 if (exportFormat === 'pdf') {
 const headers = ['NO', 'TAHUN AJARAN', 'STATUS UTAMA', 'TANGGAL MULAI', 'TANGGAL SELESAI', 'KETERANGAN']
 const rows = listData.map((item, idx) => [
 idx + 1,
 item.nama || item.tahun || '-',
 item.is_active ? 'Aktif Utama' : 'Tidak Aktif',
 item.tanggal_mulai || '-',
 item.tanggal_selesai || '-',
 item.keterangan || '-',
 ])
 downloadPdfTable({
 title: 'Laporan Data Master Tahun Ajaran',
 filename: `laporan_tahun_ajaran_${new Date().toISOString().slice(0, 10)}.pdf`,
 headers,
 rows,
 })
 notify('Export Berhasil', 'Dokumen PDF tahun ajaran siap diunduh.', 'success')
 return
 }

 notify('Menyiapkan Ekspor', `Memproses berkas tahun ajaran format .${exportFormat.toUpperCase()}...`, 'info')
 const result = await downloadFileFromApi(
 '/master/tahun-ajaran/export',
 { search: debouncedSearch, status: selectedStatusFilter },
 exportFormat,
 'data_master_tahun_ajaran'
 )
 if (result?.success) {
 notify('Ekspor Berhasil', `Data tahun ajaran berhasil diexport ke format .${exportFormat.toUpperCase()}.`, 'success')
 }
 }

 const pageActions = (
 <PageToolbarActions
 onPrint={() => setIsPrintModalOpen(true)}
 onImport={canManage ? () => setIsImportModalOpen(true) : undefined}
 onExport={handleExportData}
 primaryAction={canManage ? {
 label: "Tambah Periode",
 onClick: openAdd,
 } : null}
 />
 )

 // Master Datatable Columns (Canonical Standard Benchmark)
  // Master Datatable Columns (Canonical 5-Column Benchmark: 4 Content + 1 Aksi Tanpa Label)
  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Identitas Periode Akademik',
      sortable: true,
      className: 'w-[36%]',
      render: (item) => {
        const deleted = Boolean(item.deleted_at)
        const isActive = Boolean(item.is_active)
        return (
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={cn(
                'size-11 shrink-0 rounded-xl flex items-center justify-center shadow-md border transition-transform group-hover:scale-105',
                deleted
                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-400'
                  : isActive
                    ? 'bg-emerald-50 border-emerald-300/40 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                    : 'bg-white dark:bg-[#1B2433] shadow-slate-500/20 border-emerald-300/30'
              )}
            >
              <CalendarDays className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <strong className="truncate text-sm font-black text-slate-900 dark:text-white block">
                {item.name}
              </strong>
              <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.keterangan || item.metadata?.keterangan || 'Periode kalender akademik terpadu'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'start_date',
      label: 'Rentang Kalender',
      sortable: true,
      className: 'w-[26%]',
      render: (item) => (
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-800/80 px-3 py-1.5 shadow-2xs">
          <Calendar className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {item.start_date || '-'}
            </span>
            <span className="mx-1.5 text-slate-400 font-bold">s/d</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {item.end_date || '-'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'keterangan',
      label: 'Catatan & Semester',
      className: 'w-[20%]',
      render: (item) => (
        <div className="text-xs space-y-0.5">
          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
            {item.semester ? `Semester ${item.semester}` : 'Semester Terpadu'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            {item.kode_tahun || item.code || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status Periode',
      sortable: true,
      className: 'w-[18%] text-center',
      render: (item) => {
        const deleted = Boolean(item.deleted_at)
        const isActive = Boolean(item.is_active)
        if (deleted) {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/60 shadow-2xs">
              <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
              Terhapus
            </span>
          )
        }
        if (isActive) {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs">
              <Star className="size-3 text-amber-500 fill-amber-400 shrink-0" />
              Aktif Utama
            </span>
          )
        }
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
            <span className="size-1.5 rounded-full bg-slate-400" />
            Nonaktif
          </span>
        )
      },
    },
  ], [])

 const renderMobileCard = ({ row, onView, onEdit, onDelete, extraItems }) => {
 const deleted = Boolean(row.deleted_at)
 const isActive = Boolean(row.is_active)
 return (
 <MobileDataCard
 title={row.name}
 subtitle={row.keterangan || row.metadata?.keterangan || 'Periode kalender akademik terpadu'}
 badge={deleted ? 'Terhapus' : isActive ? 'Aktif Utama' : 'Nonaktif'}
 badgeVariant={deleted ? 'error' : isActive ? 'success' : 'neutral'}
 fields={[
 {
 label: 'Rentang Kalender',
 value: `${row.start_date || '-'} s/d ${row.end_date || '-'}`,
 icon: Calendar,
 },
 ]}
 onClick={!deleted ? () => setSelectedForDetail(row) : undefined}
 onView={!deleted ? () => setSelectedForDetail(row) : undefined}
 onEdit={!deleted && canManage ? () => { setSelectedForEdit(row); setIsFormModalOpen(true); } : undefined}
 onDelete={!deleted && canManage ? () => setDeleteTarget(row) : undefined}
 extraItems={extraItems}
 />
 )
 }

 const shouldHideBreadcrumb = embedded || hideBreadcrumb
 const shouldHideHeader = embedded || hidePageHeader

 return (
 <PageContainer maxW="7xl">

 {/* Print & PDF Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Tahun Ajaran"
 onPrint={() => {
 const rowsToPrint = Array.isArray(listData) ? listData : []
 printCleanTable({
 title: 'Laporan Master Data Tahun Ajaran',
 subtitle: 'Daftar Tahun Ajaran Sekolah Islam Terpadu',
 headers: ['NO', 'NAMA TAHUN AJARAN', 'RENTANG TANGGAL', 'KETERANGAN', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.name || '-',
 `${row.start_date || '-'} s/d ${row.end_date || '-'}`,
 row.keterangan || row.metadata?.keterangan || '-',
 row.deleted_at ? 'Terhapus' : row.is_active ? 'Aktif Utama' : 'Nonaktif',
 ]),
 })
 }}
 onDownload={() => {
 const rowsToPrint = Array.isArray(listData) ? listData : []
 downloadPdfTable({
 title: 'Laporan Master Data Tahun Ajaran',
 subtitle: 'Daftar Tahun Ajaran Sekolah Islam Terpadu',
 headers: ['NO', 'NAMA TAHUN AJARAN', 'RENTANG TANGGAL', 'KETERANGAN', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.name || '-',
 `${row.start_date || '-'} s/d ${row.end_date || '-'}`,
 row.keterangan || row.metadata?.keterangan || '-',
 row.deleted_at ? 'Terhapus' : row.is_active ? 'Aktif Utama' : 'Nonaktif',
 ]),
 filename: 'laporan_master_tahun_ajaran.pdf',
 })
 }}
 />

 {/* Breadcrumb Navigation */}
 {!shouldHideBreadcrumb && (
 <AppBreadcrumb
 items={[
 { label: 'Master Data', href: '/dashboard' },
 { label: 'Tahun Ajaran' },
 ]}
 />
 )}

 {/* ── MODERN VIVID HERO HEADER CARD ────────────────────────────────────── */}
      {!shouldHideHeader && (
        <HeroUiHeader
          title="Master Tahun Ajaran"
          subtitle="Pengelolaan periode akademik, rentang tanggal kalender, penetapan tahun ajaran aktif utama, dan siklus pembelajaran seluruh unit sekolah."
          icon={CalendarDays}
          roleTag="Periode Akademik"
          badge="Kalender Akademik"
          className="mb-6"
        />
      )}

 {/* ── MODERN MULTI-TONE KPI CARDS ──────────────────────────────────────── */}
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
 <ModernKpiCard
 icon={CalendarDays}
 label="Total Periode"
 value={statsValue(total)}
 subtext="Tersimpan di basis data"
 tone="emerald"
 />
 <ModernKpiCard
 icon={Star}
 label="Periode Aktif"
 value={statsValue(activeCount)}
 subtext="Ditandai sebagai periode utama"
 tag="Aktif"
 tone="teal"
 />
 <ModernKpiCard
 icon={Archive}
 label="Tidak Aktif / Arsip"
 value={statsValue(inactiveCount)}
 subtext="Periode lampau atau mendatang"
 tone="amber"
 />
 </div>

 {/* ── CANONICAL APPDATATABLE EMERALD OUTER CONTAINER ───────────────────── */}
 <div id="tabel-tahun-ajaran" className="scroll-mt-6">
 <AppDataTable
 title="Daftar Tahun Ajaran"
 icon={CalendarDays}
 iconClassName="bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 shadow-sm"
 description="Pengaturan seluruh periode kalender akademik sekolah."
 countLabel={`${Number(meta.total ?? listData.length).toLocaleString('id-ID')} periode`}
 actions={pageActions}
 search={search}
 onSearchChange={(value) => {
 setSearch(value)
 setPage(1)
 }}
 searchPlaceholder="Cari nama tahun ajaran atau keterangan..."
 filters={
 <>
 <HeroUiFilterSelect
 ariaLabel="Filter status periode"
 value={selectedStatusFilter}
 onChange={(val) => {
 setSelectedStatusFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Status' },
 { value: 'true', label: 'Aktif Utama' },
 { value: 'false', label: 'Tidak Aktif' },
 ]}
 placeholder="Semua Status"
 icon={CheckCircle2}
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 <HeroUiFilterSelect
 ariaLabel="Filter cakupan data tahun ajaran"
 value={denganSampahFilter}
 onChange={(val) => {
 setDenganSampahFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Data Aktif' },
 { value: 'true', label: 'Termasuk Terhapus' },
 ]}
 placeholder="Data Aktif"
 icon={Archive}
 size="sm"
 className="w-full sm:w-auto min-w-[150px]"
 />
 </>
 }
 onResetFilters={resetFilters}
 hasActiveFilters={!filtersAreClear}
 isLoading={tableIsLoading}
 isError={query.isError}
 errorTitle="Data tahun ajaran gagal dimuat"
 errorMessage="Periksa koneksi jaringan atau coba muat ulang data kembali."
 onRetry={query.refetch}
 isEmpty={!tableIsLoading && !query.isError && listData.length === 0}
 emptyTitle="Tahun ajaran tidak ditemukan"
 emptyDescription="Ubah kata kunci pencarian atau sesuaikan opsi filter aktif Anda."
 page={page}
 totalPages={meta.last_page ?? 1}
 totalItems={meta.total ?? listData.length}
 itemsPerPage={perPage}
 onPageChange={setPage}
 meta={{
 total: meta.total ?? listData.length,
 from: meta.from ?? (listData.length ? (page - 1) * perPage + 1 : 0),
 to: meta.to ?? (page - 1) * perPage + listData.length,
 last_page: meta.last_page ?? 1,
 current_page: meta.current_page ?? page,
 per_page: meta.per_page ?? perPage,
 }}
 serverControlled
 columns={columns}
 data={listData}
 renderMobileCard={renderMobileCard}
 onRowClick={(item) => !item.deleted_at && setSelectedForDetail(item)}
 onView={(item) => !item.deleted_at ? setSelectedForDetail(item) : undefined}
 onEdit={canManage ? ((item) => {
 setSelectedForEdit(item)
 setIsFormModalOpen(true)
 }) : undefined}
 onDelete={canManage ? setDeleteTarget : undefined}
 canEdit={(item) => !item.deleted_at}
 canDelete={(item) => !item.deleted_at}
 extraItems={(item) => {
 const deleted = Boolean(item.deleted_at)
 const isActive = Boolean(item.is_active)
 if (deleted && canManage) {
 return [
 {
 label: 'Pulihkan Data',
 icon: <RotateCcw className="size-4 text-emerald-600" />,
 onClick: () => pulihkanMutation.mutate(item.id),
 },
 ]
 }
 if (!isActive && canManage) {
 return [
 {
 label: 'Jadikan Aktif Utama',
 icon: <CheckCircle2 className="size-4 text-emerald-600" />,
 onClick: () => setAktifMutation.mutate(item.id),
 },
 ]
 }
 return []
 }}
 actionColumnLabel=""
 />
 </div>

 {/* ── FORM MODAL TAMBAH / UBAH TAHUN AJARAN ───────────────────────────── */}
 <TahunAjaranFormModal
 isOpen={isFormModalOpen}
 onClose={() => {
 setIsFormModalOpen(false)
 setSelectedForEdit(null)
 }}
 onSubmit={(payload) => {
 setPendingSavePayload(payload)
 setShowSaveConfirmModal(true)
 }}
 initialData={selectedForEdit}
 isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
 />

 {/* ── DETAIL MODAL ────────────────────────────────────────────────────── */}
 <TahunAjaranDetailModal
 isOpen={Boolean(selectedForDetail)}
 onClose={() => setSelectedForDetail(null)}
 data={selectedForDetail}
 />

 {/* ── IMPORT MODAL BATCH HARMONIZED ───────────────────────────────────── */}
 <TahunAjaranImportModal
 isOpen={isImportModalOpen}
 onClose={() => setIsImportModalOpen(false)}
 onImport={(payload) => importMutation.mutate(payload)}
 isSubmitting={importMutation.isPending}
 />

 {/* ── MODAL HASIL IMPOR & PEMBERITAHUAN DATA DUPLIKAT TAHUN AJARAN ── */}
 <AnimatePresence>
 {duplicateModalData && (
 <div
 className="overlay modal fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="ta-duplicate-report-title"
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-2xl"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}
 <div className={cn(
 "h-1.5 w-full shrink-0",
 duplicateModalData.diperbarui > 0
 ? "bg-white dark:bg-[#1B2433]"
 : duplicateModalData.duplikat > 0
 ? "bg-white dark:bg-[#1B2433]"
 : "bg-white dark:bg-[#1B2433]"
 )} />

 {/* Header */}
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className={cn(
 "rounded-xl p-2.5 text-white shadow-md shrink-0 border",
 duplicateModalData.diperbarui > 0
 ? "bg-white dark:bg-[#1B2433] border-amber-300/30 shadow-sm"
 : "bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 border-emerald-300/30 shadow-sm"
 )}>
 {duplicateModalData.diperbarui > 0 ? (
 <RefreshCcw className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
 ) : (
 <CheckCircle2 className="h-5 w-5 text-current" strokeWidth={2.25} />
 )}
 </div>
 <div>
 <h3 id="ta-duplicate-report-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Hasil Impor & Pemberitahuan Data Tahun Ajaran</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 Total {duplicateModalData.total || 0} Data
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Ringkasan sinkronisasi dan status pemrosesan data tahun ajaran
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setDuplicateModalData(null)}
 aria-label="Tutup ringkasan impor"
 className="size-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-sky-950/60 dark:text-sky-300 transition cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
 {/* KPI Summary Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 <div className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/30 text-center">
 <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Baru Ditambah</p>
 <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{duplicateModalData.berhasil || 0}</p>
 </div>
 <div className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/30 text-center">
 <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Ditimpa / Diupdate</p>
 <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{duplicateModalData.diperbarui || 0}</p>
 </div>
 <div className="p-3 rounded-xl border border-sky-200/80 bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/30 text-center">
 <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">Duplikat Dilewati</p>
 <p className="text-xl font-black text-sky-700 dark:text-sky-400 mt-0.5">{duplicateModalData.duplikat || 0}</p>
 </div>
 <div className="p-3 rounded-xl border border-rose-200/80 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/30 text-center">
 <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase">Gagal Diproses</p>
 <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{duplicateModalData.gagal || 0}</p>
 </div>
 </div>

 {/* Duplicate Detail Table if exists */}
 {duplicateModalData.duplicates && duplicateModalData.duplicates.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
 <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
 <span>Daftar Data yang Sama (Nama Tahun Ajaran Cocok)</span>
 <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
 {duplicateModalData.duplicates.length} baris
 </span>
 </p>
 </div>
 <div className="max-h-56 overflow-auto rounded-xl border border-emerald-200/80 bg-white shadow-2xs dark:border-emerald-800/60 dark:bg-[#182232]">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <tr>
 <th className="px-3 py-2 w-14">Baris</th>
 <th className="px-3 py-2">Nama Tahun Ajaran</th>
 <th className="px-3 py-2">Status Aksi</th>
 <th className="px-3 py-2">Keterangan</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-slate-800">
 {duplicateModalData.duplicates.map((item, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <td className="px-3 py-2 font-mono text-slate-500">{item.baris}</td>
 <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{item.nama}</td>
 <td className="px-3 py-2">
 <span className={cn(
 "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
 item.status === 'Ditimpa'
 ? "bg-amber-100 text-amber-800 border border-amber-300/80 dark:bg-amber-950 dark:text-amber-300"
 : "bg-sky-100 text-sky-800 border border-sky-300/80 dark:bg-sky-950 dark:text-sky-300"
 )}>
 {item.status}
 </span>
 </td>
 <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-[10px]">{item.keterangan}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Error List if exists */}
 {duplicateModalData.errors && duplicateModalData.errors.length > 0 && (
 <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/30 text-xs">
 <p className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1.5">
 <XCircle className="size-3.5" />
 <span>Catatan Kesalahan Baris Data:</span>
 </p>
 <ul className="list-disc list-inside space-y-1 text-rose-700 dark:text-rose-400 text-xs">
 {duplicateModalData.errors.slice(0, 5).map((err, i) => (
 <li key={i}>{typeof err === 'string' ? err : JSON.stringify(err)}</li>
 ))}
 {duplicateModalData.errors.length > 5 && (
 <li className="font-semibold italic">...dan {duplicateModalData.errors.length - 5} kesalahan lainnya.</li>
 )}
 </ul>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="modal-footer flex items-center justify-end border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 px-6 py-3.5 dark:border-emerald-800/60 dark:bg-slate-900/30">
 <button
 type="button"
 onClick={() => setDuplicateModalData(null)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition shadow-sm cursor-pointer"
 >
 <CheckCircle2 className="size-3.5" strokeWidth={2.2} />
 <span>Tutup & Mengerti</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── HARMONIZED EXPORT MODAL (Identik EducationUnitsPage & MasterKelasPage) ── */}
 <AnimatePresence>
 {isExportModalOpen && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="tahun-ajaran-export-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget) setIsExportModalOpen(false)
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="w-full max-w-md font-sans my-auto"
 >
 <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-white dark:bg-[#1B2433] p-2.5 shadow-md shadow-sm border border-amber-300/30 shrink-0">
 <Download className="size-5 text-emerald-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="tahun-ajaran-export-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Export Tahun Ajaran</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Unduh
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pilih format berkas untuk mengekspor data kalender akademik
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsExportModalOpen(false)}
 aria-label="Tutup modal export"
 className="rounded-xl p-2 bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="space-y-2.5 p-6 text-sm text-slate-700 dark:text-slate-200">
 {[
 { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Format Microsoft Excel Modern (Disarankan)' },
 { value: 'xls', label: 'Excel Legacy (.xls)', desc: 'Format Microsoft Excel Standard 97-2003' },
 { value: 'csv', label: 'CSV (.csv)', desc: 'Format Comma-Separated Values universal' },
 { value: 'pdf', label: 'PDF (.pdf)', desc: 'Format Cetak Dokumen Resmi' },
 ].map((opt) => (
 <label
 key={opt.value}
 className={cn(
 'flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all',
 exportFormat === opt.value
 ? 'border-emerald-500 bg-emerald-50/60 shadow-2xs dark:border-emerald-600 dark:bg-emerald-950/40'
 : 'border-emerald-200/80 hover:border-emerald-300 hover:bg-slate-50/50 dark:border-emerald-800/60 dark:hover:border-emerald-200/80 dark:hover:bg-slate-800/40'
 )}
 >
 <input
 type="radio"
 name="export-format-ta"
 value={opt.value}
 checked={exportFormat === opt.value}
 onChange={() => setExportFormat(opt.value)}
 className="accent-emerald-600 size-4"
 />
 <div>
 <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{opt.label}</span>
 <span className="block text-xs text-slate-500 dark:text-slate-400">{opt.desc}</span>
 </div>
 </label>
 ))}
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <button
 type="button"
 onClick={() => setIsExportModalOpen(false)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5 text-rose-600" strokeWidth={2.2} />
 </div>
 <span>Batal</span>
 </button>
 <button
 type="button"
 onClick={handleProcessExport}
 className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 px-5 py-2.5 text-xs font-extrabold border border-amber-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <Download className="size-3.5 text-emerald-600" strokeWidth={2.25} />
 </div>
 <span>Unduh Berkas</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── HARMONIZED SAVE / UPDATE CONFIRMATION MODAL (z-[70]) ────────────── */}
 <AnimatePresence>
 {showSaveConfirmModal && (
 <div
 className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 aria-labelledby="save-confirm-modal-title"
 onMouseDown={(e) => {
 if (
 e.target === e.currentTarget &&
 !simpanMutation.isPending &&
 !ubahMutation.isPending
 ) {
 setShowSaveConfirmModal(false)
 }
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-md font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}
 <div
 className={cn(
 'h-1.5 w-full shrink-0',
 selectedForEdit
 ? 'bg-white dark:bg-[#1B2433]'
 : 'bg-white dark:bg-[#1B2433]'
 )}
 />

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232] shrink-0">
 <div className="flex items-center gap-3">
 <div
 className={cn(
 'rounded-xl text-white p-2.5 shadow-md shrink-0 border',
 selectedForEdit
 ? 'bg-white dark:bg-[#1B2433] shadow-sm border-amber-300/30'
 : 'bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 shadow-sm border-emerald-300/30'
 )}
 >
 {selectedForEdit ? (
 <Pencil className="size-5 text-slate-600" strokeWidth={2.25} />
 ) : (
 <CalendarDays className="size-5 text-amber-600" strokeWidth={2.25} />
 )}
 </div>
 <div>
 <h3
 id="save-confirm-modal-title"
 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 <span>
 {selectedForEdit
 ? 'Konfirmasi Perubahan Data'
 : 'Konfirmasi Simpan Tahun Ajaran'}
 </span>
 <span
 className={cn(
 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
 selectedForEdit
 ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60'
 : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60'
 )}
 >
 <Sparkles className="size-3" />
 {selectedForEdit ? 'Update Data' : 'Periode Baru'}
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {selectedForEdit
 ? 'Verifikasi data tahun ajaran sebelum perubahan disimpan ke sistem.'
 : 'Verifikasi data tahun ajaran sebelum disimpan ke sistem.'}
 </p>
 </div>
 </div>

 <button
 type="button"
 disabled={simpanMutation.isPending || ubahMutation.isPending}
 onClick={() => setShowSaveConfirmModal(false)}
 aria-label="Tutup dialog konfirmasi"
 className="size-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="p-6 space-y-4 text-slate-700 dark:text-slate-200 text-xs">
 {/* Target Info Summary Card */}
 <div className="rounded-xl border border-emerald-100/90 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2.5">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-slate-500 dark:text-slate-400">
 Nama Periode
 </span>
 <span className="font-black text-slate-900 dark:text-white text-right">
 {pendingSavePayload?.name || '—'}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="font-semibold text-slate-500 dark:text-slate-400">
 Rentang Kalender
 </span>
 <span className="font-bold text-slate-800 dark:text-slate-200 text-right tabular-nums">
 {pendingSavePayload?.start_date || '—'} s/d {pendingSavePayload?.end_date || '—'}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="font-semibold text-slate-500 dark:text-slate-400">
 Status Keaktifan
 </span>
 <span className="font-bold text-slate-900 dark:text-white">
 {pendingSavePayload?.is_active ? 'Aktif Utama' : 'Nonaktif'}
 </span>
 </div>
 </div>

 {/* Semantic Notice Callout Box */}
 <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-xs font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 leading-relaxed flex items-start gap-2.5">
 <div className="size-6 shrink-0 rounded-lg bg-emerald-600 flex items-center justify-center text-white mt-0.5">
 <AlertTriangle className="size-3.5" />
 </div>
 <p>
 Pastikan seluruh tanggal kalender akademik telah sesuai dengan SK penetapan tahun ajaran yayasan sebelum menyimpan.
 </p>
 </div>
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950 shrink-0">
 <button
 type="button"
 disabled={simpanMutation.isPending || ubahMutation.isPending}
 onClick={() => setShowSaveConfirmModal(false)}
 className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-extrabold text-rose-700 transition-all duration-200 hover:scale-[1.02] hover:bg-rose-100 active:scale-95 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer disabled:opacity-50"
 >
 <X className="size-3.5" strokeWidth={2.2} />
 <span>Batal</span>
 </button>

 <button
 type="button"
 disabled={simpanMutation.isPending || ubahMutation.isPending}
 onClick={() => {
 if (!pendingSavePayload) return
 if (selectedForEdit) {
 ubahMutation.mutate({
 id: selectedForEdit.id,
 payload: pendingSavePayload,
 })
 } else {
 simpanMutation.mutate(pendingSavePayload)
 }
 }}
 className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 px-5 py-2.5 text-xs font-black shadow-md shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
 >
 {simpanMutation.isPending || ubahMutation.isPending ? (
 <Loader2 className="size-4 animate-spin" />
 ) : (
 <CheckCircle2 className="size-4" strokeWidth={2.2} />
 )}
 <span>
 {simpanMutation.isPending || ubahMutation.isPending
 ? 'Memproses...'
 : 'Ya, Konfirmasi & Simpan'}
 </span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── HARMONIZED DELETE CONFIRMATION MODAL (z-[70]) ───────────────────── */}
 <AnimatePresence>
 {deleteTarget && (
 <div
 className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 aria-labelledby="delete-tahun-ajaran-modal-title"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !hapusMutation.isPending) {
 setDeleteTarget(null)
 }
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-md font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-2xl border border-rose-200/60 bg-white shadow-2xl shadow-sm dark:border-rose-900/50 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar Merah Rose */}

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232] shrink-0">
 <div className="flex items-center gap-3">
 <div className="rounded-xl p-2.5 shadow-md shrink-0 border bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 shadow-sm border-rose-300/30">
 <Trash2 className="size-5 text-rose-600 dark:text-rose-400" strokeWidth={2.25} />
 </div>
 <div>
 <h3
 id="delete-tahun-ajaran-modal-title"
 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 <span>Hapus Tahun Ajaran</span>
 <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60">
 <AlertTriangle className="size-3" />
 Hapus Periode
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Data akan dipindahkan ke arsip dan dapat dipulihkan kembali.
 </p>
 </div>
 </div>

 <button
 type="button"
 disabled={hapusMutation.isPending}
 onClick={() => setDeleteTarget(null)}
 aria-label="Tutup dialog hapus"
 className="size-9 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
 >
 <X className="size-4 text-rose-600" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="p-6 space-y-4 text-slate-700 dark:text-slate-200 text-xs">
 {/* Target Info Summary Card */}
 <div className="rounded-xl border border-rose-100/90 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2.5">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-slate-500 dark:text-slate-400">
 Nama Tahun Ajaran
 </span>
 <span className="font-black text-slate-900 dark:text-white text-right">
 {deleteTarget?.name || '—'}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="font-semibold text-slate-500 dark:text-slate-400">
 Rentang Kalender
 </span>
 <span className="font-bold text-slate-800 dark:text-slate-200 text-right tabular-nums">
 {deleteTarget?.start_date || '—'} s/d {deleteTarget?.end_date || '—'}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="font-semibold text-slate-500 dark:text-slate-400">
 Status Saat Ini
 </span>
 <span className="font-bold text-slate-900 dark:text-white">
 {deleteTarget?.is_active ? 'Aktif Utama' : 'Nonaktif'}
 </span>
 </div>
 </div>

 {/* Danger Notice Box */}
 <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
 <div className="size-6 shrink-0 rounded-lg bg-rose-600 flex items-center justify-center text-white mt-0.5">
 <AlertTriangle className="size-3.5" />
 </div>
 <p>
 Apakah Anda yakin ingin menghapus periode ini? Tindakan ini akan mengarsipkan data tahun ajaran dari daftar operasional aktif.
 </p>
 </div>
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950 shrink-0">
 <button
 type="button"
 disabled={hapusMutation.isPending}
 onClick={() => setDeleteTarget(null)}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 text-xs font-extrabold text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 active:scale-95 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
 >
 <X className="size-3.5" strokeWidth={2.2} />
 <span>Batal</span>
 </button>

 <button
 type="button"
 disabled={hapusMutation.isPending}
 onClick={() => hapusMutation.mutate(deleteTarget.id)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
 >
 {hapusMutation.isPending ? (
 <Loader2 className="size-4 animate-spin" />
 ) : (
 <Trash2 className="size-4" strokeWidth={2.2} />
 )}
 <span>{hapusMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Smart Floating Scroll Navigator (Opsi A) */}
 <SmartScrollFab targetId="tabel-tahun-ajaran" downTooltip="Langsung ke Tabel Tahun Ajaran" />
 </PageContainer>
 )
}
