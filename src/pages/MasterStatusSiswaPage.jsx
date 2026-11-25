import React, { useState, useMemo } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Tag,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Palette,
  ArrowUpDown,
  FileText,
  X,
  Layers,
  Info,
  Upload,
  Download,
  FileSpreadsheet,
  RefreshCcw
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  studentStatusService
} from '../services/studentStatusService'
import PageContainer from '../components/app/PageContainer'
import {
  SquircleActionButton,
} from '../components/master-data'
import {
  useToast,
  AppDataTable,
  HeroUiHeader,
  KpiStatCard,
  PageToolbarActions
} from '../components/app'
import { Tooltip } from '../components/ui/tooltip'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppModal from '../components/app/AppModal'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter
} from '../components/ui/dialog'
import {
  Button
} from '../components/ui/button'
import {
  Input
} from '../components/ui/input'
import {
  FieldLabel
} from '../components/ui/field'
import {
  TextArea
} from '../components/ui/text-area'
import {
  Spinner
} from '../components/ui/spinner'
import {
  useAuthStore
} from '../stores/authStore'
import {
  hasRoleLevel,
  ROLE_LEVELS,
  isFoundationUser
} from '../auth/portalResolver'
import {
  SmartScrollFab
} from '../components/common'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  cn
} from '../lib/utils'

// Color map for badge preview and styling
const BADGE_COLOR_MAP = {
 emerald: {
 label: 'Hijau Zamrud (Emerald)',
 badge: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
 dot: 'bg-emerald-500',
 },
 blue: {
 label: 'Biru (Blue)',
 badge: 'bg-blue-50 text-blue-700 border-blue-300 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
 dot: 'bg-blue-500',
 },
 amber: {
 label: 'Kuning Jingga (Amber)',
 badge: 'bg-amber-50 text-amber-700 border-amber-300 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
 dot: 'bg-amber-500',
 },
 rose: {
 label: 'Merah (Rose)',
 badge: 'bg-rose-50 text-rose-700 border-rose-300 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
 dot: 'bg-rose-500',
 },
 purple: {
 label: 'Ungu (Purple)',
 badge: 'bg-purple-50 text-purple-700 border-purple-300 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
 dot: 'bg-purple-500',
 },
 cyan: {
 label: 'Sian (Cyan)',
 badge: 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
 dot: 'bg-cyan-500',
 },
 slate: {
 label: 'Abu-abu (Slate)',
 badge: 'bg-slate-100 text-slate-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80',
 dot: 'bg-slate-500',
 },
}

export default function MasterStatusSiswaPage() {
 const queryClient = useQueryClient()
 const user = useAuthStore((s) => s.user)

 const isFoundation = isFoundationUser(user)
 const permissions = Array.isArray(user?.permissions) ? user.permissions : []
 const canManage =
 !isFoundation &&
 (hasRoleLevel(user, ROLE_LEVELS.ADMIN) ||
 ['sistem.master_data', 'student.manage', 'operator.manage'].some((perm) =>
 permissions.includes(perm)
 ))

 // Search & Filter
 const [searchInput, setSearchInput] = useState('')
 const debouncedSearch = useDebounce(searchInput, 300)
 const [filterActive, setFilterActive] = useState('all') // 'all' | 'active' | 'inactive'

 // Modal State
 const [isFormOpen, setIsFormOpen] = useState(false)
 const [editingItem, setEditingItem] = useState(null)
 const [formData, setFormData] = useState({
 code: '',
 name: '',
 badge_color: 'emerald',
 order: 0,
 is_active: true,
 description: '',
 })
 const [formErrors, setFormErrors] = useState({})

 // Delete Dialog State
 const [deleteTarget, setDeleteTarget] = useState(null)

 // Import Modal & Duplicate States
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [importFile, setImportFile] = useState(null)
 const [overwriteExisting, setOverwriteExisting] = useState(false)
 const [duplicateModalData, setDuplicateModalData] = useState(null)
 const toast = useToast()
 const notify = (title, message = '', type = 'success') => toast(title, message, type)

 // Query Data
 const { data: responseData, isLoading, refetch } = useQuery({
 queryKey: ['student-statuses'],
 queryFn: () => studentStatusService.getAll(),
 })

 const rawList = useMemo(() => {
 const d = responseData?.data || responseData || []
 return Array.isArray(d) ? d : []
 }, [responseData])

 // Filtered List
 const filteredList = useMemo(() => {
 return rawList.filter((item) => {
 const q = debouncedSearch.toLowerCase().trim()
 const matchSearch =
 !q ||
 (item.name && item.name.toLowerCase().includes(q)) ||
 (item.code && item.code.toLowerCase().includes(q)) ||
 (item.description && item.description.toLowerCase().includes(q))

 const matchActive =
 filterActive === 'all' ||
 (filterActive === 'active' && item.is_active) ||
 (filterActive === 'inactive' && !item.is_active)

 return matchSearch && matchActive
 })
 }, [rawList, debouncedSearch, filterActive])

 // KPIs
 const stats = useMemo(() => {
 const total = rawList.length
 const active = rawList.filter((i) => i.is_active).length
 const inactive = total - active
 return { total, active, inactive }
 }, [rawList])

 // Mutations
 const createMutation = useMutation({
 mutationFn: (payload) => studentStatusService.create(payload),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['student-statuses'] })
 queryClient.invalidateQueries({ queryKey: ['student-statuses-dropdown'] })
 setIsFormOpen(false)
 resetForm()
 },
 onError: (err) => {
 const msg = err.response?.data?.message || err.message || 'Gagal menyimpan status'
 setFormErrors({ submit: msg })
 },
 })

 const updateMutation = useMutation({
 mutationFn: ({ id, payload }) => studentStatusService.update(id, payload),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['student-statuses'] })
 queryClient.invalidateQueries({ queryKey: ['student-statuses-dropdown'] })
 setIsFormOpen(false)
 resetForm()
 },
 onError: (err) => {
 const msg = err.response?.data?.message || err.message || 'Gagal memperbarui status'
 setFormErrors({ submit: msg })
 },
 })

 const deleteMutation = useMutation({
 mutationFn: (id) => studentStatusService.delete(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['student-statuses'] })
 queryClient.invalidateQueries({ queryKey: ['student-statuses-dropdown'] })
 setDeleteTarget(null)
 },
 onError: (err) => {
 const msg = err.response?.data?.message || err.message || 'Gagal menghapus status siswa.'
 Swal.fire({
 title: 'Gagal Menghapus Status',
 text: msg,
 icon: 'error',
 confirmButtonColor: '#059669',
 })
 },
 })

 const importMutation = useMutation({
 mutationFn: (formPayload) => studentStatusService.prosesImport(formPayload),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['student-statuses'] })
 queryClient.invalidateQueries({ queryKey: ['student-statuses-dropdown'] })
 const resData = res?.data || {}
 const duplikatCount = resData.duplikat || 0
 const diperbaruiCount = resData.diperbarui || 0
 const berhasilCount = resData.berhasil || 0
 const totalCount = resData.total || 0

 if (duplikatCount > 0 || (diperbaruiCount > 0 && overwriteExisting)) {
 const titleMsg = overwriteExisting ? 'Impor Selesai (Data Ditimpa)' : 'Pemberitahuan Data Duplikat'
 const detailMsg = overwriteExisting
 ? `${berhasilCount} baru, ${diperbaruiCount} berhasil ditimpa dari total ${totalCount} data.`
 : `${berhasilCount} berhasil, ${duplikatCount} data dilewati karena sudah ada.`
 notify(titleMsg, detailMsg, overwriteExisting ? 'info' : 'warning')
 } else {
 notify('Import Data Berhasil', res?.message || `${berhasilCount} data status siswa berhasil diimpor.`, 'success')
 }

 if (Array.isArray(resData.duplicates) && resData.duplicates.length > 0) {
 setDuplicateModalData(resData)
 }
 setIsImportModalOpen(false)
 setImportFile(null)
 setOverwriteExisting(false)
 },
 onError: (err) => {
 notify('Gagal Mengimpor', err.response?.data?.message || 'Proses impor gagal.', 'danger')
 },
 })

 const handleImportSubmit = (e) => {
 e.preventDefault()
 if (!importFile) {
 notify('Peringatan', 'Pilih file spreadsheet Excel/CSV terlebih dahulu.', 'warning')
 return
 }
 const form = new FormData()
 form.append('file', importFile)
 form.append('overwrite', overwriteExisting ? '1' : '0')
 importMutation.mutate(form)
 }

 const handleDownloadTemplate = () => {
 studentStatusService.downloadTemplate()
 notify('Template Diunduh', 'Berkas template CSV berhasil diunduh.', 'success')
 }

 const resetForm = () => {
 setEditingItem(null)
 setFormData({
 code: '',
 name: '',
 badge_color: 'emerald',
 order: rawList.length + 1,
 is_active: true,
 description: '',
 })
 setFormErrors({})
 }

 const handleOpenAdd = () => {
 resetForm()
 setFormData((prev) => ({ ...prev, order: (rawList.length || 0) + 1 }))
 setIsFormOpen(true)
 }

 const handleOpenEdit = (item) => {
 setEditingItem(item)
 setFormData({
 code: item.code || '',
 name: item.name || '',
 badge_color: item.badge_color || 'emerald',
 order: item.order ?? 0,
 is_active: !!item.is_active,
 description: item.description || '',
 })
 setFormErrors({})
 setIsFormOpen(true)
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 const errors = {}

 if (!formData.code.trim()) {
 errors.code = 'Kode status wajib diisi'
 } else if (!/^[a-z0-9_-]+$/i.test(formData.code.trim())) {
 errors.code = 'Kode hanya boleh berupa huruf, angka, tanda strip, atau garis bawah'
 }

 if (!formData.name.trim()) {
 errors.name = 'Nama status wajib diisi'
 }

 if (Object.keys(errors).length > 0) {
 setFormErrors(errors)
 return
 }

 const payload = {
 code: formData.code.trim().toLowerCase(),
 name: formData.name.trim(),
 badge_color: formData.badge_color,
 order: Number(formData.order) || 0,
 is_active: !!formData.is_active,
 description: formData.description?.trim() || null,
 }

 if (editingItem) {
 updateMutation.mutate({ id: editingItem.id, payload })
 } else {
 createMutation.mutate(payload)
 }
 }

  // Kolom Master Datatable Status Siswa
  // Kolom Master Datatable Status Siswa (Canonical 5-Column: 4 Content + 1 Aksi)
  const statusColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Status & Kode',
      sortable: true,
      className: 'w-[34%]',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-mono text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
            {item.order ?? 0}
          </span>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">
              {item.name}
            </span>
            <code className="rounded border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-slate-600 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300">
              {item.code}
            </code>
          </div>
        </div>
      ),
    },
    {
      key: 'badge_color',
      label: 'Pratinjau Badge',
      className: 'w-[22%]',
      render: (item) => {
        const colorConfig = BADGE_COLOR_MAP[item.badge_color] || BADGE_COLOR_MAP.emerald
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs',
              colorConfig.badge
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', colorConfig.dot)} />
            {item.name}
          </span>
        )
      },
    },
    {
      key: 'description',
      label: 'Keterangan',
      className: 'w-[24%] text-xs text-slate-500 dark:text-slate-400 truncate',
      render: (item) => item.description || '—',
    },
    {
      key: 'is_active',
      label: 'Status Sistem',
      sortable: true,
      className: 'w-[12%] text-center',
      render: (item) => (
        item.is_active ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-sky-950/60 dark:text-sky-300">
            <XCircle className="h-3 w-3" />
            Nonaktif
          </span>
        )
      ),
    },
  ], [])

  const renderMobileCard = ({ row: item }) => {
    const colorConfig = BADGE_COLOR_MAP[item.badge_color] || BADGE_COLOR_MAP.emerald
    return (
      <div className="p-4 bg-white dark:bg-[#1B2433] rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 font-mono text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              {item.order ?? 0}
            </span>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              {item.name}
            </span>
            <code className="rounded-md border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {item.code}
            </code>
          </div>
          <div>
            {item.is_active ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-sky-950/60 dark:text-sky-300">
                <XCircle className="h-2.5 w-2.5" />
                Nonaktif
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs', colorConfig.badge)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', colorConfig.dot)} />
            {item.name}
          </span>
          {canManage && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenEdit(item)}
                className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100 transition-colors dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300 cursor-pointer"
                title="Ubah Status"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 transition-colors dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer"
                title="Hapus Status"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
 <PageContainer>
 {/* Breadcrumb Navigation */}
 <AppBreadcrumb
 items={[
 { label: 'Master Data', href: '/dashboard' },
 { label: 'Status Siswa', active: true },
 ]}
 />

      {/* Modern Hero Header Banner (Canonical HeroUiHeader) */}
      <HeroUiHeader
        icon={Tag}
        title="Master Status Siswa"
        tag={{ text: "Single Source of Truth Database", icon: Sparkles }}
        description="Konfigurasi dinamis status peserta didik untuk integrasi penerimaan, mutasi, kelulusan, dan rapor."
        actions={
          <SquircleActionButton
            variant="sync"
            icon={RefreshCcw}
            label="Segarkan Data Real-Time"
            onClick={() => refetch()}
          />
        }
      />

      {/* KPI Stats Cards (Canonical KpiStatCard) */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiStatCard
          icon={Layers}
          title="Total Status"
          value={stats.total}
          description="Opsi status terdaftar di database"
          badge="Total"
          tone="emerald"
          onClick={() => setFilterActive('all')}
          footerAction={{ label: 'Lihat Semua Status', onClick: () => setFilterActive('all') }}
        />
        <KpiStatCard
          icon={CheckCircle2}
          title="Status Aktif"
          value={stats.active}
          description="Aktif digunakan pada data siswa"
          badge="Aktif"
          tone="sky"
          onClick={() => setFilterActive('active')}
          footerAction={{ label: 'Filter Status Aktif', onClick: () => setFilterActive('active') }}
        />
        <KpiStatCard
          icon={XCircle}
          title="Status Nonaktif"
          value={stats.inactive}
          description="Dinonaktifkan / diarsipkan"
          badge="Nonaktif"
          tone="rose"
          onClick={() => setFilterActive('inactive')}
          footerAction={{ label: 'Filter Nonaktif', onClick: () => setFilterActive('inactive') }}
        />
      </div>

 {/* Datatable Emerald Container Standar Resmi AppDataTable */}
        <AppDataTable
          id="tabel-status-siswa"
          title="Daftar Status Siswa Terdaftar"
          countLabel={`${filteredList.length} Status`}
          description="Menampilkan seluruh status siswa aktif & arsip dari database"
          icon={<Tag className="size-4.5 text-white" strokeWidth={2.2} />}
          iconClassName="!bg-emerald-600 !text-white !border-emerald-600 !rounded-xl !size-8.5 shadow-xs"
          className="mt-6 scroll-mt-6 rounded-2xl border-2 border-emerald-500/25 dark:border-emerald-600/35 shadow-md shadow-emerald-500/10"
          fullBleed={true}
          headerClassName="bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 dark:border-emerald-800/40 px-5 py-4 min-h-[72px]"
          actions={
            canManage ? (
              <PageToolbarActions
                onImport={() => setIsImportModalOpen(true)}
                importLabel="Import Data Status Siswa"
                onRefresh={() => refetch()}
                primaryAction={{
                  label: 'Tambah Status Siswa',
                  onClick: handleOpenAdd,
                }}
              />
            ) : (
              <PageToolbarActions onRefresh={() => refetch()} />
            )
          }
          search={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Cari kode, nama status, atau keterangan..."
          filters={
            <div className="flex flex-wrap items-center gap-2.5 w-full bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80">
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300 mr-1">Status Sistem:</span>
              <div className="flex items-center rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-0.5 shadow-2xs dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setFilterActive('all')}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer',
                    filterActive === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 opacity-70 hover:opacity-100 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilterActive('active')}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer',
                    filterActive === 'active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 opacity-70 hover:opacity-100 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setFilterActive('inactive')}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer',
                    filterActive === 'inactive'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 opacity-70 hover:opacity-100 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  Nonaktif
                </button>
              </div>
              {(searchInput || filterActive !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setFilterActive('all')
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 transition cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          }
          hasActiveFilters={Boolean(searchInput || filterActive !== 'all')}
          onResetFilters={() => {
            setSearchInput('')
            setFilterActive('all')
          }}
          columns={statusColumns}
          actionColumnLabel=""
          data={filteredList}
          renderMobileCard={renderMobileCard}
          clientPagination={true}
          clientPageSize={10}
          isLoading={isLoading}
          emptyTitle="Tidak ada data status siswa"
          emptyDescription={debouncedSearch ? 'Coba gunakan kata kunci pencarian yang berbeda' : 'Klik tombol Tambah untuk membuat status baru'}
          onEdit={canManage ? (item) => handleOpenEdit(item) : undefined}
          onDelete={canManage ? (item) => setDeleteTarget(item) : undefined}
        />

        {/* ================= MODAL TAMBAH / UBAH STATUS (HARMONIZED MODAL) ================= */}
        <AppModal
          isOpen={isFormOpen}
          onClose={() => !(createMutation.isPending || updateMutation.isPending) && setIsFormOpen(false)}
          title={editingItem ? 'Ubah Status Siswa' : 'Tambah Status Siswa Baru'}
          badge={editingItem ? 'Update Data' : 'Opsi Baru'}
          description="Atur label, kode status, serta warna badge yang tampil pada profil siswa."
          icon={editingItem ? Pencil : Tag}
          variant={editingItem ? 'warning' : 'emerald'}
          maxWidth="max-w-xl"
          disableBackdropClose={createMutation.isPending || updateMutation.isPending}
          hideCloseButton={createMutation.isPending || updateMutation.isPending}
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                <X className="size-4" strokeWidth={2} />
                <span>Batal</span>
              </button>
              <button
                type="submit"
                form="status-siswa-form"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Spinner size="xs" />}
                <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Status'}</span>
              </button>
            </>
          }
        >
          <form id="status-siswa-form" onSubmit={handleSubmit} className="space-y-4">
                      {formErrors.submit && (
                        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-medium">
                          {formErrors.submit}
                        </div>
                      )}

                      <div>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Kode Status (System Identifier) <span className="text-rose-500">*</span>
                        </FieldLabel>
                        <Input
                          type="text"
                          useNative
                          placeholder="contoh: aktif, lulus, mutasi_keluar"
                          value={formData.code}
                          isError={Boolean(formErrors.code)}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              code: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                            }))
                          }
                          className="font-mono mt-1"
                        />
                        {formErrors.code && (
                          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                            {formErrors.code}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">
                          Kode unik yang disimpan pada record tabel siswa di database.
                        </p>
                      </div>

                      <div>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Nama / Label Status <span className="text-rose-500">*</span>
                        </FieldLabel>
                        <Input
                          type="text"
                          useNative
                          placeholder="contoh: Aktif, Lulus, Mutasi Keluar"
                          value={formData.name}
                          isError={Boolean(formErrors.name)}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="mt-1"
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Warna Badge Tampilan
                        </FieldLabel>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {Object.entries(BADGE_COLOR_MAP).map(([key, item]) => {
                            const isSelected = formData.badge_color === key
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({ ...prev, badge_color: key }))
                                }
                                className={cn(
                                  'flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition-all cursor-pointer',
                                  isSelected
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200'
                                    : 'border-emerald-200/80 bg-white text-slate-700 hover:bg-slate-50 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                )}
                              >
                                <span
                                  className={cn(
                                    'size-2.5 rounded-full shrink-0',
                                    item.dot
                                  )}
                                />
                                <span className="truncate">{item.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Badge Preview */}
                      <div>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Pratinjau Hasil Badge
                        </FieldLabel>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs',
                              (
                                BADGE_COLOR_MAP[formData.badge_color] ||
                                BADGE_COLOR_MAP.emerald
                              ).badge
                            )}
                          >
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                (
                                  BADGE_COLOR_MAP[formData.badge_color] ||
                                  BADGE_COLOR_MAP.emerald
                                ).dot
                              )}
                            />
                            {formData.name || 'Contoh Status'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Urutan Tampilan
                          </FieldLabel>
                          <Input
                            type="number"
                            min="0"
                            useNative
                            value={formData.order}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                order: parseInt(e.target.value, 10) || 0,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Status Sistem
                          </FieldLabel>
                          <label className="mt-2 flex items-center gap-2 cursor-pointer p-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/20 dark:bg-emerald-950/20">
                            <input
                              type="checkbox"
                              checked={formData.is_active}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                              }
                              className="size-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800"
                            />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Aktifkan Status Ini
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Keterangan / Deskripsi
                        </FieldLabel>
                        <TextArea
                          rows={2}
                          placeholder="Keterangan opsional mengenai alur status ini..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                          }
                          className="mt-1"
                        />
                      </div>
          </form>
        </AppModal>

        <AppModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
          title="Hapus Status Siswa?"
          badge="Konfirmasi Hapus"
          description="Tindakan ini tidak dapat dibatalkan"
          icon={Trash2}
          variant="danger"
          maxWidth="max-w-md"
          zIndex={70}
          disableBackdropClose={deleteMutation.isPending}
          hideCloseButton={deleteMutation.isPending}
          bodyClassName="space-y-4"
          footer={
            <>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                <X className="size-4" strokeWidth={2} />
                <span>Batal</span>
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                className="h-9.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-rose-600 shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {deleteMutation.isPending && <Spinner size="xs" />}
                <span>Ya, Hapus Permanen</span>
              </button>
            </>
          }
        >
          {deleteTarget && (
            <>
                    <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 p-4 text-xs text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 leading-relaxed">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="size-4.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Peringatan Penghapusan Data:</p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">
                            Opsi status <strong className="text-rose-700 dark:text-rose-300">&ldquo;{deleteTarget.name}&rdquo;</strong> (kode: <code className="bg-rose-100 dark:bg-rose-900/50 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">{deleteTarget.code}</code>) akan dihapus secara permanen dari daftar pilihan sistem.
                          </p>
                        </div>
                      </div>
                    </div>
            </>
          )}
        </AppModal>

        <AppModal
          isOpen={isImportModalOpen}
          onClose={() => !importMutation.isPending && setIsImportModalOpen(false)}
          title="Import Status Siswa"
          badge="Batch"
          description="Unggah berkas Excel atau CSV sesuai template status siswa"
          icon={Upload}
          maxWidth="max-w-xl"
          disableBackdropClose={importMutation.isPending}
          hideCloseButton={importMutation.isPending}
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                <X className="size-4" strokeWidth={2} />
                <span>Batal</span>
              </button>
              <button
                type="submit"
                form="status-siswa-import-form"
                disabled={importMutation.isPending || !importFile}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <Upload className="size-4" />
                <span>{importMutation.isPending ? 'Mengimpor...' : 'Upload & Impor'}</span>
              </button>
            </>
          }
        >
          <form id="status-siswa-import-form" onSubmit={handleImportSubmit} className="space-y-4">
 {/* Download Template Banner */}
 <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <FileSpreadsheet className="size-5 text-emerald-700 dark:text-emerald-400" />
 <div>
 <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Unduh Format Template</p>
 <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Gunakan format CSV resmi agar kolom terpetakan otomatis</p>
 </div>
 </div>
 <button
 type="button"
 onClick={handleDownloadTemplate}
 className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <Download className="size-3.5" />
 <span>Template</span>
 </button>
 </div>

 {/* Dropzone */}
 <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 p-6 text-center dark:bg-emerald-950/20">
 <FileSpreadsheet className="mx-auto mb-2 size-10 text-sky-600 dark:text-sky-400" />
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
 {importFile ? importFile.name : 'Pilih berkas Excel (.xlsx, .xls) atau CSV'}
 </p>
 <p className="text-xs text-slate-400 mt-0.5">Ukuran maksimal file 10 MB</p>
 <input
 type="file"
 accept=".xlsx, .xls, .csv"
 onChange={(e) => setImportFile(e.target.files[0] || null)}
 className="mt-3 text-xs w-full text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white file:cursor-pointer"
 />
 </div>

 {/* Opsi Timpa Data (Overwrite) */}
 <div className={cn(
 "rounded-xl border p-4 transition-all duration-200",
 overwriteExisting
 ? "border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:border-emerald-800/60 dark:bg-amber-950/30"
 : "border-emerald-200/80 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900/40"
 )}>
 <label className="flex items-start gap-3 cursor-pointer select-none">
 <div className="pt-0.5">
 <input
 type="checkbox"
 id="overwrite-status-siswa-checkbox"
 checked={overwriteExisting}
 onChange={(e) => setOverwriteExisting(e.target.checked)}
 className="size-4.5 rounded-md border-emerald-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
 />
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
 Timpa Data Jika Kode / Nama Status Sudah Ada
 </span>
 {overwriteExisting ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300">
 <RefreshCcw className="size-2.5" />
 Opsi Timpa Aktif
 </span>
 ) : (
 <span className="inline-flex items-center rounded-full bg-sky-50 border border-sky-200/80 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 Lewati Duplikat (Default)
 </span>
 )}
 </div>
 <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
 {overwriteExisting
 ? 'Jika baris data pada berkas memiliki Kode atau Nama yang sudah terdaftar, data status siswa lama akan diperbarui otomatis.'
 : 'Jika baris data pada berkas memiliki Kode atau Nama yang sudah ada di database, baris tersebut akan dilewati dan data lama tetap utuh.'}
 </p>
 </div>
 </label>
 </div>

          </form>
        </AppModal>

        <AppModal
          isOpen={Boolean(duplicateModalData)}
          onClose={() => setDuplicateModalData(null)}
          title="Hasil Impor & Pemberitahuan Data"
          badge={duplicateModalData ? `Total ${duplicateModalData.total} Data` : undefined}
          description="Ringkasan sinkronisasi dan status pemrosesan data status siswa"
          icon={duplicateModalData?.diperbarui > 0 ? RefreshCcw : CheckCircle2}
          maxWidth="max-w-2xl"
          zIndex={70}
          disableBackdropClose
          bodyClassName="space-y-4 text-sm text-slate-700 dark:text-slate-200"
          footer={
            <div className="flex w-full justify-end">
              <button
                type="button"
                onClick={() => setDuplicateModalData(null)}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
              >
                <span>Mengerti</span>
              </button>
            </div>
          }
        >
          {duplicateModalData && (
            <>
 {/* KPI Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-3 text-center dark:bg-emerald-950/30">
 <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Baru</p>
 <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{duplicateModalData.berhasil || 0}</p>
 </div>
 <div className="rounded-xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50/50 p-3 text-center dark:bg-amber-950/30">
 <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Ditimpa</p>
 <p className="text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5">{duplicateModalData.diperbarui || 0}</p>
 </div>
 <div className="rounded-xl border-2 border-sky-300 dark:border-sky-800 bg-sky-50/50 p-3 text-center dark:bg-sky-950/30">
 <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">Dilewati</p>
 <p className="text-lg font-black text-sky-700 dark:text-sky-300 mt-0.5">{duplicateModalData.duplikat || 0}</p>
 </div>
 <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/50 p-3 text-center dark:bg-rose-950/30">
 <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Gagal</p>
 <p className="text-lg font-black text-rose-700 dark:text-rose-300 mt-0.5">{duplicateModalData.gagal || 0}</p>
 </div>
 </div>

 {/* Duplicate / Updated Rows List */}
 {Array.isArray(duplicateModalData.duplicates) && duplicateModalData.duplicates.length > 0 && (
 <div className="space-y-2">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
 <span>Rincian Data Yang Sesuai / Terdeteksi Duplikat</span>
 <span className="text-xs text-slate-500 font-normal">
 {duplicateModalData.duplicates.length} item
 </span>
 </p>
 <div className="max-h-56 overflow-auto rounded-xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-slate-900/60">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 text-slate-800 border-b-2 border-emerald-200/90 text-xs font-black uppercase tracking-wider dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-300">
 <tr>
 <th className="px-3.5 py-2.5">Baris</th>
 <th className="px-3.5 py-2.5">Kode Status</th>
 <th className="px-3.5 py-2.5">Nama Status</th>
 <th className="px-3.5 py-2.5">Status</th>
 <th className="px-3.5 py-2.5">Keterangan</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
 {duplicateModalData.duplicates.map((dup, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <td className="px-3.5 py-2 font-mono text-slate-500">#{dup.baris || idx + 1}</td>
 <td className="px-3.5 py-2 font-mono font-semibold text-slate-900 dark:text-white">{dup.kode || '-'}</td>
 <td className="px-3.5 py-2 font-medium text-slate-700 dark:text-slate-200">{dup.nama || '-'}</td>
 <td className="px-3.5 py-2">
 <span className={cn(
 "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
 dup.status === 'Ditimpa'
 ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
 : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
 )}>
 {dup.status}
 </span>
 </td>
 <td className="px-3.5 py-2 text-slate-500 dark:text-slate-400">{dup.keterangan || '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
            </>
          )}
        </AppModal>

 {/* Smart Floating Scroll Navigator (Opsi A) */}
 <SmartScrollFab targetId="tabel-status-siswa" downTooltip="Langsung ke Tabel Status" />
 </PageContainer>
 )
}
