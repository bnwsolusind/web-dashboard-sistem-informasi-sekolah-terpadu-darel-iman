import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
 BookOpen,
 CheckCircle2,
 Trash2,
 RotateCcw,
 RefreshCcw,
 Eye,
 Upload,
 Download,
 FileSpreadsheet,
 FileText,
 Archive,
 Library,
 Save,
 Clock3,
 Target,
 ChartNoAxesColumn,
 Printer,
 Plus,
 X,
 XCircle,
 AlertTriangle,
 Info,
 Sparkles,
 ShieldCheck,
 Power,
 Palette,
 Layers,
 GraduationCap,
 Building,
 Building2,
 Lock,
 Hash,
 Loader2,
 Check,
 Tag,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useDebounce } from '../hooks/useDebounce'
import { subjectService } from '../services/subjectService'
import { masterKurikulumService } from '../services/masterKurikulumService'
import { educationUnitService } from '../services/educationUnitService'
import { getUnitJenjang } from './MasterCapaianPembelajaranPage'
import {
  HeroUiHeader, ActionDropdown, useToast, PageToolbarActions, KpiStatCard } from '../components/app'
import { Checkbox } from '../components/ui/checkbox'
import { Button } from '../components/ui/button'
import { TableRoot, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import { useAuthStore } from '../stores/authStore'
import { getUserRoleLevel, ROLE_LEVELS, hasRoleLevel, isFoundationUser } from '../auth/portalResolver'
import { SmartScrollFab } from '../components/common'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { downloadFileFromApi } from '../utils/exportUtils'
import {
 PrintOptionModal,
 MasterFilterSelect,
} from '../components/master-data'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
 Select as HeroSelect,
 SelectTrigger as HeroSelectTrigger,
 SelectValue as HeroSelectValue,
 SelectContent as HeroSelectContent,
 SelectItem as HeroSelectItem,
} from '../components/ui/select'

const KELOMPOK_LIST = ['Pelajaran Wajib', 'Pelajaran Pendukung', 'Kekhasan SIT', 'Muatan Lokal', "Al-Qur'an/Tahfizh", 'Lainnya']
const KATEGORI_LIST = ['Wajib', 'Pilihan', 'Tahfizh/Diniyah', 'Ekstrakurikuler', 'Vokasi']

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
 card: 'border-emerald-/70 bg-white dark:bg-[#1B2433] hover:border-emerald- dark:border-emerald-/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900',
 glow: 'bg-emerald-/20 group-hover:bg-emerald-/30',
 iconBox: 'bg-white dark:bg-[#1B2433] shadow-sm',
 tag: 'bg-emerald- text-emerald- dark:bg-emerald-/60 dark:text-emerald-',
 title: 'text-emerald- dark:text-emerald-',
 val: 'text-emerald- dark:text-emerald-',
 sub: 'text-emerald-/80 dark:text-emerald-/80',
 cta: 'text-emerald-/60 dark:text-emerald-/60',
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

function ModernKpiCard({
 icon: Icon,
 label,
 subtext,
 value,
 tag,
 tone = 'emerald',
 onClick,
}) {
 const toneMap = { emerald: 'emerald', indigo: 'indigo', blue: 'sky', sky: 'sky', amber: 'amber', rose: 'rose' }
 return (
 <KpiStatCard
 title={label}
 value={value ?? '0'}
 description={subtext}
 badge={tag}
 icon={Icon}
 variant={toneMap[tone] || 'emerald'}
 onClick={onClick}
 />
 )
}

// ── 3. KOMPONEN UTAMA HALAMAN MASTER MATA PELAJARAN ──────────────────────────
export default function MasterSubjectPage({
 embedded = false,
 hideBreadcrumb = false,
 hidePageHeader = false,
}) {
 const queryClient = useQueryClient()

 // Filter States with Debounce
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
 const [selectedKurikulumFilter, setSelectedKurikulumFilter] = useState('')
 const [selectedKelompokFilter, setSelectedKelompokFilter] = useState('')
 const [selectedKategoriFilter, setSelectedKategoriFilter] = useState('')
 const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
 const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
 const [denganSampahFilter, setDenganSampahFilter] = useState('')
 const [page, setPage] = useState(1)
 const perPage = 15

 // Selection & Bulk States
 const [selectedIds, setSelectedIds] = useState([])

 // Modal States
 const [isFormModalOpen, setIsFormModalOpen] = useState(false)
 const [selectedForEdit, setSelectedForEdit] = useState(null)
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
 const [selectedForDetail, setSelectedForDetail] = useState(null)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [isExportModalOpen, setIsExportModalOpen] = useState(false)
 const [exportFormat, setExportFormat] = useState('xlsx')
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [deleteTarget, setDeleteTarget] = useState(null)
 const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
 const [importFile, setImportFile] = useState(null)
 const [overwriteExisting, setOverwriteExisting] = useState(false)
 const [duplicateModalData, setDuplicateModalData] = useState(null)
 // Toast Helper (Global)
 const toast = useToast()
 const notify = (title, message = '', type = 'success') => toast(title, message, type)

 // Form State
 const [formData, setFormData] = useState({
 unit_pendidikan_id: '',
 kurikulum_id: '',
 kode_mapel: '',
 nama_mapel: '',
 nama_singkat: '',
 kelompok_mapel: 'Pelajaran Wajib',
 kategori: 'Wajib',
 jenjang: 'SD',
 tingkat_kelas: 'All',
 jam_pelajaran: 2,
 kkm: 75,
 bobot_pengetahuan: 40,
 bobot_keterampilan: 40,
 bobot_sikap: 20,
 warna: '#0E5C44',
 ikon: 'BookOpen',
 urutan_tampil: 1,
 status: true,
 deskripsi: '',
 })

 // User Auth & Role Scoping
 const user = useAuthStore((state) => state.user)
 const userRoles = useMemo(() => {
 if (!user) return []
 const rawRoles = user.roles || (user.role ? [user.role] : []) || user.role_names || []
 const list = Array.isArray(rawRoles) ? rawRoles : [rawRoles]
 return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
 }, [user])

 const userLevel = useMemo(() => getUserRoleLevel(user), [user])
 const isFoundation = useMemo(() => isFoundationUser(user), [user])
 const canManage = useMemo(() => {
 if (!user || isFoundation) return false
 const normalizedRoles = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
 if (normalizedRoles.some((r) => ['superadmin', 'admin'].includes(r))) return true
 const perms = Array.isArray(user.permissions) ? user.permissions : []
 return perms.some((p) =>
 ['academic.subject.create', 'academic.subject.update', 'academic.subject.delete', 'sistem.master_data'].includes(p)
 )
 }, [isFoundation, user, userRoles])

 const canViewAllUnits = useMemo(() => {
 if (!user || userRoles.length === 0) return false
 return isFoundation || userLevel <= ROLE_LEVELS.YAYASAN // Level 1-2: Admin Sistem & Yayasan
 }, [user, userRoles, userLevel, isFoundation])

 // Queries
 const { data: unitDropdown = [] } = useQuery({
 queryKey: ['education-units-dropdown-options'],
 queryFn: async () => {
 const res = await educationUnitService.getDaftar()
 return res.data || []
 },
 })

 const userUnitId = useMemo(() => {
 const candidateIds = [
 user?.unit_id,
 user?.unit_pendidikan_id,
 user?.education_unit_id,
 user?.unit?.id,
 user?.education_unit?.id,
 user?.unit_pendidikan?.id,
 user?.employee?.unit_id,
 user?.employee?.unit_pendidikan_id,
 user?.employee?.education_unit_id,
 user?.employee?.unit?.id,
 user?.employee?.education_unit?.id,
 user?.school_info?.id,
 ].filter(Boolean)

 return candidateIds.length > 0 ? String(candidateIds[0]) : null
 }, [user])

 const userUnitName = useMemo(() => {
 const candidateNames = [
 typeof user?.education_unit === 'string' ? user.education_unit : null,
 typeof user?.unit === 'string' ? user.unit : null,
 user?.unit_name,
 user?.education_unit_name,
 user?.unit_pendidikan_name,
 user?.unit?.name || user?.unit?.nama,
 user?.education_unit?.name || user?.education_unit?.nama,
 user?.employee?.unit?.name || user?.employee?.education_unit?.name,
 user?.school_info?.nama || user?.school_info?.name,
 ]
 .filter(Boolean)
 .map((s) => String(s).toLowerCase().trim())

 return candidateNames.length > 0 ? candidateNames[0] : ''
 }, [user])

 const availableUnitOptions = useMemo(() => {
 const allUnits = unitDropdown || []
 if (canViewAllUnits) return allUnits

 if (userUnitId) {
 const filtered = allUnits.filter((u) => String(u.id) === String(userUnitId))
 if (filtered.length > 0) return filtered
 }

 if (userUnitName) {
 const matched = allUnits.filter((u) => {
 const uName = String(u.name || u.nama || '').toLowerCase().trim()
 const uCode = String(u.code || u.kode || '').toLowerCase().trim()
 return (
 uName === userUnitName ||
 uCode === userUnitName ||
 userUnitName.includes(uName) ||
 uName.includes(userUnitName)
 )
 })
 if (matched.length > 0) return matched
 }

 return allUnits.length > 0 ? [allUnits[0]] : []
 }, [unitDropdown, canViewAllUnits, userUnitId, userUnitName])

 const effectiveUserUnitId = useMemo(() => {
 if (canViewAllUnits) return ''
 if (userUnitId) return String(userUnitId)
 if (availableUnitOptions.length > 0) return String(availableUnitOptions[0].id)
 return ''
 }, [canViewAllUnits, userUnitId, availableUnitOptions])

 useEffect(() => {
 if (!canViewAllUnits && effectiveUserUnitId && selectedUnitFilter !== effectiveUserUnitId) {
 setSelectedUnitFilter(effectiveUserUnitId)
 }
 }, [canViewAllUnits, effectiveUserUnitId, selectedUnitFilter])

 const selectedUnitName = useMemo(() => {
 if (!selectedUnitFilter) return ''
 const found = (unitDropdown || []).find((u) => String(u.id) === String(selectedUnitFilter))
 return found?.name ?? found?.nama ?? found?.nama_unit ?? userUnitName ?? ''
 }, [unitDropdown, selectedUnitFilter, userUnitName])

 const { data: responseData = {}, isLoading, isError, refetch } = useQuery({
 queryKey: [
 'master-subjects-list',
 page,
 perPage,
 debouncedSearch,
 selectedUnitFilter,
 selectedKurikulumFilter,
 selectedKelompokFilter,
 selectedKategoriFilter,
 selectedJenjangFilter,
 selectedStatusFilter,
 denganSampahFilter,
 canViewAllUnits,
 effectiveUserUnitId,
 ],
 queryFn: () => {
 const targetUnitId = !canViewAllUnits ? (effectiveUserUnitId || selectedUnitFilter) : selectedUnitFilter
 return subjectService.getDaftar({
 page,
 per_page: perPage,
 search: debouncedSearch,
 unit_pendidikan_id: targetUnitId || undefined,
 kurikulum_id: selectedKurikulumFilter,
 kelompok_mapel: selectedKelompokFilter,
 kategori: selectedKategoriFilter,
 jenjang: selectedJenjangFilter,
 status: selectedStatusFilter,
 dengan_sampah: denganSampahFilter,
 order_by: 'created_at',
 order_dir: 'desc',
 })
 },
 })

 const { data: kurikulumDropdown = [] } = useQuery({
 queryKey: ['kurikulum-dropdown-options'],
 queryFn: async () => {
 const res = await masterKurikulumService.getDropdown()
 return Array.isArray(res) ? res : (res?.data || [])
 },
 })

 // Mutations with ToastStack Feedback (Zero SweetAlert2)
 const simpanMutation = useMutation({
 mutationFn: (payload) => {
 if (selectedForEdit) {
 return subjectService.ubah({ id: selectedForEdit.id, payload })
 }
 return subjectService.tambah(payload)
 },
 onSuccess: (res) => {
 notify('Berhasil Disimpan', res?.message || 'Data mata pelajaran berhasil disimpan.', 'success')
 setIsFormModalOpen(false)
 setSelectedForEdit(null)
 queryClient.invalidateQueries(['master-subjects-list'])
 },
 onError: (err) => {
 const msg = err.response?.data?.message || 'Gagal menyimpan data mata pelajaran.'
 notify('Gagal Menyimpan', msg, 'danger')
 },
 })

 const hapusMutation = useMutation({
 mutationFn: (id) => subjectService.hapus(id),
 onSuccess: (res) => {
 notify('Berhasil Dihapus', res?.message || 'Mata pelajaran berhasil dihapus.', 'success')
 setDeleteTarget(null)
 queryClient.invalidateQueries(['master-subjects-list'])
 },
 onError: (err) => {
 notify('Gagal Menghapus', err.response?.data?.message || 'Gagal menghapus mata pelajaran.', 'danger')
 },
 })

 const pulihkanMutation = useMutation({
 mutationFn: (id) => subjectService.pulihkan(id),
 onSuccess: (res) => {
 notify('Berhasil Dipulihkan', res?.message || 'Mata pelajaran berhasil dipulihkan.', 'success')
 queryClient.invalidateQueries(['master-subjects-list'])
 },
 onError: (err) => {
 notify('Gagal Memulihkan', err.response?.data?.message || 'Gagal memulihkan mata pelajaran.', 'danger')
 },
 })

 const bulkStatusMutation = useMutation({
 mutationFn: ({ ids, status }) => subjectService.bulkStatus(ids, status),
 onSuccess: (res) => {
 notify('Status Diperbarui', res?.message || 'Status berhasil diperbarui secara massal.', 'success')
 setSelectedIds([])
 queryClient.invalidateQueries(['master-subjects-list'])
 },
 onError: (err) => {
 notify('Gagal Memperbarui', err.response?.data?.message || 'Gagal memperbarui status massal.', 'danger')
 },
 })

 const bulkDeleteMutation = useMutation({
 mutationFn: (ids) => subjectService.bulkDelete(ids),
 onSuccess: (res) => {
 notify('Hapus Massal Berhasil', res?.message || 'Data terpilih berhasil dihapus.', 'success')
 setSelectedIds([])
 setBulkDeleteConfirmOpen(false)
 queryClient.invalidateQueries(['master-subjects-list'])
 },
 onError: (err) => {
 notify('Gagal Hapus Massal', err.response?.data?.message || 'Gagal menghapus data massal.', 'danger')
 },
 })

 const items = responseData.data || []
 const meta = responseData.meta || {}
 const stats = responseData.statistik || { total: 0, aktif: 0, tidak_aktif: 0, terhapus: 0 }
 const archiveCount = Number(stats.tidak_aktif || 0) + Number(stats.terhapus || 0)

 const resolveKurikulumForUnit = (unitId) => {
 if (!unitId) return kurikulumDropdown
 const currentUnit = (unitDropdown || []).find((u) => String(u.id) === String(unitId))
 const jenjang = getUnitJenjang(currentUnit)

 const direct = kurikulumDropdown.filter(
 (k) => String(k.unit_pendidikan_id) === String(unitId) || String(k.unit_id) === String(unitId)
 )
 const byJenjang = kurikulumDropdown.filter((k) => {
 if (!jenjang) return false
 const kJ = String(k.jenjang || '').toUpperCase()
 if (kJ === jenjang) return true
 if (jenjang === 'SMP' && (kJ.includes('SMP') || kJ.includes('PESANTREN'))) return true
 if (jenjang === 'SMA' && (kJ.includes('SMA') || kJ.includes('PESANTREN'))) return true
 const kText = `${k.nama_kurikulum || ''} ${k.kode_kurikulum || ''}`.toUpperCase()
 return kText.includes(jenjang)
 })
 const seen = new Set()
 const result = []
 ;[...direct, ...byJenjang].forEach((item) => {
 if (!seen.has(String(item.id))) {
 seen.add(String(item.id))
 result.push(item)
 }
 })
 return result.length > 0 ? result : kurikulumDropdown
 }

 const availableKurikulumForFilter = useMemo(() => {
 return resolveKurikulumForUnit(selectedUnitFilter)
 }, [selectedUnitFilter, kurikulumDropdown, unitDropdown])

 const availableKurikulumForForm = useMemo(() => {
 return resolveKurikulumForUnit(formData.unit_pendidikan_id)
 }, [formData.unit_pendidikan_id, kurikulumDropdown, unitDropdown])

 const resetFilters = () => {
 setSearch('')
 setSelectedUnitFilter(canViewAllUnits ? '' : effectiveUserUnitId)
 setSelectedKurikulumFilter('')
 setSelectedKelompokFilter('')
 setSelectedKategoriFilter('')
 setSelectedJenjangFilter('')
 setSelectedStatusFilter('')
 setDenganSampahFilter('')
 setPage(1)
 }

 // Multi select logic
 const isAllSelected = items.length > 0 && selectedIds.length === items.length
 const toggleSelectAll = () => {
 if (isAllSelected) {
 setSelectedIds([])
 } else {
 setSelectedIds(items.map((i) => i.id))
 }
 }

 const toggleSelectRow = (id) => {
 setSelectedIds((prev) =>
 prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
 )
 }

 const handleOpenFormTambah = () => {
 if (!canManage) return
 setSelectedForEdit(null)
 const defaultUnit = selectedUnitFilter || (availableUnitOptions[0]?.id || unitDropdown[0]?.id || '')
 const matchingKur = resolveKurikulumForUnit(defaultUnit)
 const defaultKur = selectedKurikulumFilter && matchingKur.some((k) => String(k.id) === String(selectedKurikulumFilter))
 ? selectedKurikulumFilter
 : (matchingKur[0]?.id || '')

 const currentUnit = (unitDropdown || []).find((u) => String(u.id) === String(defaultUnit))
 const defaultJenjang = getUnitJenjang(currentUnit) || 'SD'

 setFormData({
 unit_pendidikan_id: defaultUnit,
 kurikulum_id: defaultKur,
 kode_mapel: '',
 nama_mapel: '',
 nama_singkat: '',
 kelompok_mapel: 'Pelajaran Wajib',
 kategori: 'Wajib',
 jenjang: defaultJenjang,
 tingkat_kelas: 'All',
 jam_pelajaran: 2,
 kkm: 75,
 bobot_pengetahuan: 40,
 bobot_keterampilan: 40,
 bobot_sikap: 20,
 warna: '#0E5C44',
 ikon: 'BookOpen',
 urutan_tampil: (meta.total || items.length) + 1,
 status: true,
 deskripsi: '',
 })
 setIsFormModalOpen(true)
 }

 const handleOpenFormEdit = (row) => {
 if (!canManage) return
 setSelectedForEdit(row)
 setFormData({
 unit_pendidikan_id: row.unit_pendidikan_id || '',
 kurikulum_id: row.kurikulum_id || '',
 kode_mapel: row.kode_mapel || row.code || '',
 nama_mapel: row.nama_mapel || row.name || '',
 nama_singkat: row.nama_singkat || '',
 kelompok_mapel: row.kelompok_mapel || 'Pelajaran Wajib',
 kategori: row.kategori || 'Wajib',
 jenjang: row.jenjang || 'SD',
 tingkat_kelas: row.tingkat_kelas || 'All',
 jam_pelajaran: row.jam_pelajaran || 2,
 kkm: row.kkm || 75,
 bobot_pengetahuan: row.bobot_pengetahuan || 40,
 bobot_keterampilan: row.bobot_keterampilan || 40,
 bobot_sikap: row.bobot_sikap || 20,
 warna: row.warna || '#0E5C44',
 ikon: row.ikon || 'BookOpen',
 urutan_tampil: row.urutan_tampil || 1,
 status: row.status ?? true,
 deskripsi: row.deskripsi || row.description || '',
 })
 setIsFormModalOpen(true)
 }

 const handleOpenDetail = (row) => {
 setSelectedForDetail(row)
 setIsDetailModalOpen(true)
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 if (!formData.kode_mapel || !formData.nama_mapel) {
 notify('Peringatan', 'Kode dan Nama Mata Pelajaran wajib diisi.', 'warning')
 return
 }
 simpanMutation.mutate(formData)
 }

 // ── Harmonized Export Execution ───────────────────────────────────────────
 const handleProcessExport = async () => {
 setIsExportModalOpen(false)
 if (exportFormat === 'pdf') {
 const rowsToPrint = Array.isArray(items) ? items : []
 downloadPdfTable({
 title: 'Laporan Master Data Mata Pelajaran',
 subtitle: 'Daftar Mata Pelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'KODE MAPEL', 'NAMA MATA PELAJARAN', 'NAMA SINGKAT', 'KELOMPOK', 'KATEGORI', 'JENJANG', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.kode_mapel || row.code || '-',
 row.nama_mapel || row.name || row.nama || '-',
 row.nama_singkat || row.short_name || '-',
 row.kelompok_mapel || row.kelompok || '-',
 row.kategori || row.category || '-',
 row.jenjang || row.unit_pendidikan?.name || '-',
 typeof row.status === 'string' ? row.status : row.status ? 'Aktif' : 'Nonaktif',
 ]),
 filename: `laporan_master_mata_pelajaran_${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 notify('Export Berhasil', 'Dokumen PDF mata pelajaran siap diunduh.', 'success')
 return
 }

 notify('Menyiapkan Ekspor', `Sedang mengunduh berkas format .${exportFormat.toUpperCase()}...`, 'info')
 const result = await downloadFileFromApi(
 '/master/subjects/export/excel',
 {
 search: debouncedSearch,
 unit_pendidikan_id: selectedUnitFilter,
 kurikulum_id: selectedKurikulumFilter,
 kelompok_mapel: selectedKelompokFilter,
 kategori: selectedKategoriFilter,
 jenjang: selectedJenjangFilter,
 status: selectedStatusFilter,
 },
 exportFormat,
 'master_mata_pelajaran'
 )
 if (result?.success) {
 notify('Ekspor Berhasil', `Data mata pelajaran berhasil diekspor ke format .${exportFormat.toUpperCase()}.`, 'success')
 }
 }

 // ── Harmonized Import Execution ───────────────────────────────────────────
 const handleImportSubmit = async (e) => {
 e.preventDefault()
 if (!importFile) {
 notify('Peringatan', 'Pilih file Excel/CSV terlebih dahulu.', 'warning')
 return
 }
 const form = new FormData()
 form.append('file', importFile)
 form.append('overwrite', overwriteExisting ? '1' : '0')

 try {
 notify('Memproses Impor', 'Sedang memproses berkas data mata pelajaran...', 'info')
 const res = await subjectService.importFile(form)
 const resData = res?.data || {}
 const duplikatCount = resData.duplikat || 0
 const diperbaruiCount = resData.diperbarui || 0
 const berhasilCount = resData.berhasil || 0
 const totalCount = resData.total || 0

 if (duplikatCount > 0 || (diperbaruiCount > 0 && overwriteExisting)) {
 const titleMsg = overwriteExisting ? 'Impor Selesai (Data Ditimpa)' : 'Pemberitahuan Data Duplikat'
 const detailMsg = overwriteExisting
 ? `${berhasilCount} baru, ${diperbaruiCount} berhasil ditimpa dari total ${totalCount} baris.`
 : `${berhasilCount} berhasil, ${duplikatCount} baris dilewati karena sudah ada.`
 notify(titleMsg, detailMsg, overwriteExisting ? 'info' : 'warning')
 } else {
 notify('Impor Berhasil', res.message || `${berhasilCount} data mata pelajaran berhasil diimpor.`, 'success')
 }

 if (Array.isArray(resData.duplicates) && resData.duplicates.length > 0) {
 setDuplicateModalData(resData)
 }

 setIsImportModalOpen(false)
 setImportFile(null)
 setOverwriteExisting(false)
 queryClient.invalidateQueries(['master-subjects-list'])
 } catch (err) {
 notify('Gagal Impor', err.response?.data?.message || 'Proses impor gagal.', 'danger')
 }
 }

 const handleDownloadTemplate = () => {
 const headers = ['kode_mapel', 'nama_mapel', 'nama_singkat', 'kelompok_mapel', 'kategori', 'jenjang', 'jam_pelajaran', 'kkm', 'bobot_pengetahuan', 'bobot_keterampilan', 'bobot_sikap']
 const sample = ['MP-SD-PAI', 'Pendidikan Agama Islam', 'PAI', 'Pelajaran Wajib', 'Wajib', 'SD', '2', '75', '40', '40', '20']
 const csvContent = [headers.join(','), sample.map((v) => `"${v}"`).join(',')].join('\n')
 const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = 'Template_Import_Mata_Pelajaran.csv'
 a.click()
 URL.revokeObjectURL(url)
 notify('Template Diunduh', 'Format template CSV berhasil disimpan.', 'success')
 }

 // Canonical PageToolbarActions
 const pageActions = (
 <PageToolbarActions
 onPrint={() => setIsPrintModalOpen(true)}
 onImport={canManage ? () => setIsImportModalOpen(true) : undefined}
 onExport={(canManage || (Array.isArray(user?.permissions) && user.permissions.includes('subject.export'))) ? () => setIsExportModalOpen(true) : undefined}
 primaryAction={canManage ? {
 label: 'Tambah Mapel',
 icon: Plus,
 onClick: handleOpenFormTambah,
 } : null}
 />
 )

 const filtersAreActive = Boolean(
 search ||
 (canViewAllUnits && selectedUnitFilter) ||
 selectedKurikulumFilter ||
 selectedKelompokFilter ||
 selectedKategoriFilter ||
 selectedJenjangFilter ||
 selectedStatusFilter ||
 denganSampahFilter
 )

  // Master Subject Datatable Columns (Canonical 5-column Benchmark)
  const subjectColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Identitas Mapel',
      sortable: true,
      className: 'w-[32%]',
      render: (row) => {
        const subjectName = row.nama_mapel || row.name || 'Mata pelajaran'
        const subjectColor = row.warna || '#059669'
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs border text-white font-bold"
              style={{
                backgroundColor: subjectColor,
                borderColor: `${subjectColor}44`,
              }}
            >
              <BookOpen className="h-4 w-4 text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-black leading-snug text-slate-900 dark:text-white" title={subjectName}>
                {subjectName}
              </p>
              <p className="truncate font-mono text-[10px] font-bold text-slate-400 mt-0.5">
                {row.kode_mapel || row.code} {row.nama_singkat ? `(${row.nama_singkat})` : ''}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'kurikulum',
      label: 'Kurikulum & Unit',
      sortable: true,
      className: 'w-[24%]',
      render: (row) => (
        <div>
          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
            {row.kurikulum?.nama_kurikulum || 'Kurikulum Terpadu'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <Building className="size-3 text-slate-400 shrink-0" />
            <span className="truncate">{row.unit_pendidikan?.name || 'Semua Unit'}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'klasifikasi',
      label: 'Klasifikasi & Beban',
      sortable: true,
      className: 'w-[24%]',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-800/60">
              {row.kelompok_mapel || 'Wajib'}
            </span>
            <span className="inline-block rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-extrabold text-[#059669] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {row.kategori || 'Wajib'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/70 dark:bg-emerald-950/80 px-1.5 py-0.5 text-[9px] font-black text-emerald-900 dark:text-emerald-200">
            <Clock3 className="size-2.5 text-emerald-700 dark:text-emerald-400" />
            {row.jam_pelajaran || 2} JP · KKM {row.kkm || 75}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'w-[12%] text-center',
      render: (row) => (
        <span
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black border ${
            row.status
              ? 'bg-emerald-50 text-[#0E5C44] border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
              : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80'
          }`}
        >
          <span className={`size-1.5 rounded-full shrink-0 ${row.status ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{row.status ? 'Aktif' : 'Nonaktif'}</span>
        </span>
      ),
    },
  ], [])

 return (
 <PageContainer maxW="7xl">

 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Mata Pelajaran"
 onPrint={() => {
 const rowsToPrint = Array.isArray(items) ? items : []
 printCleanTable({
 title: 'Laporan Master Data Mata Pelajaran',
 subtitle: 'Daftar Mata Pelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'KODE MAPEL', 'NAMA MATA PELAJARAN', 'NAMA SINGKAT', 'KELOMPOK', 'KATEGORI', 'JENJANG', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.kode_mapel || row.code || '-',
 row.nama_mapel || row.name || row.nama || '-',
 row.nama_singkat || row.short_name || '-',
 row.kelompok_mapel || row.kelompok || '-',
 row.kategori || row.category || '-',
 row.jenjang || row.unit_pendidikan?.name || '-',
 typeof row.status === 'string' ? row.status : row.status ? 'Aktif' : 'Nonaktif',
 ]),
 })
 }}
 onDownload={handleProcessExport}
 onDownloadPdf={handleProcessExport}
 />

 {/* Breadcrumb Navigation */}
 {!(embedded || hideBreadcrumb) && (
 <div className="print:hidden mb-4">
 <AppBreadcrumb
 items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Master Data' }, { label: 'Mata Pelajaran' }]}
 />
 </div>
 )}

 {/* ── MODERN VIVID HERO HEADER CARD ────────────────────────────────────── */}
 {!hidePageHeader && !embedded && (
        <HeroUiHeader
          title="Master Mata Pelajaran"
          subtitle="Kelola referensi mata pelajaran, alokasi jam pelajaran, KKM, dan bobot penilaian rapor untuk seluruh kurikulum sekolah."
          icon={BookOpen}
          roleTag="Kurikulum & Akademik"
          badge="Kurikulum Terpadu"
          className="mb-6"
        />
      )}

 {/* ── Unit Performance & KPI Scope Bar (Hero UI Component) ── */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/20 dark:bg-emerald-950/20 p-4 sm:p-5 mb-6 shadow-sm">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 shadow-md shadow-sm shrink-0 border-2 border-emerald-300/40">
 <Building2 className="size-5" />
 </div>
 <div>
 <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Cakupan Data & KPI Mata Pelajaran
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60">
 {canViewAllUnits ? (selectedUnitName ? `Unit: ${selectedUnitName}` : 'Semua Unit') : 'Unit Terkunci'}
 </span>
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {canViewAllUnits
 ? 'Pilih unit pendidikan untuk melihat total mata pelajaran & KPI unit spesifik, atau pilih "Semua Unit" untuk melihat seluruh unit.'
 : `Menampilkan total mata pelajaran, keaktifan kurikulum, dan KPI khusus untuk unit ${selectedUnitName || userUnitName || 'sekolah Anda'}.`}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2.5 w-full sm:w-auto">
 {canViewAllUnits ? (
 <div className="relative min-w-[260px] sm:w-72">
 <HeroSelect
 value={selectedUnitFilter || ''}
 onChange={(val) => {
 setSelectedUnitFilter(String(val || ''))
 setPage(1)
 }}
 >
 <HeroSelectTrigger className="w-full h-9 rounded-xl border-2 border-emerald-300/80 bg-white px-3.5 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-800/80 dark:bg-slate-900 dark:text-slate-100">
 <HeroSelectValue placeholder="Semua Unit" />
 </HeroSelectTrigger>
 <HeroSelectContent className="z-50 max-h-72 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200 dark:border-emerald-800/80 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95">
 <HeroSelectItem id="" className="text-xs font-bold py-2 text-emerald-700 dark:text-emerald-400">
 Semua Unit
 </HeroSelectItem>
 {availableUnitOptions.map((u, idx) => {
 const val = String(u.id ?? u.unit_id ?? `unit-${idx}`)
 const label = u.name ?? u.nama ?? u.nama_unit ?? val
 return (
 <HeroSelectItem
 key={`kpi-unit-${val}-${idx}`}
 id={val}
 className="text-xs font-semibold py-2"
 >
 {label}
 </HeroSelectItem>
 )
 })}
 </HeroSelectContent>
 </HeroSelect>
 </div>
 ) : (
 <div className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300/80 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-2xs dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200">
 <Lock className="size-4 text-emerald-600 dark:text-emerald-400" />
 <span>Unit: {selectedUnitName || userUnitName || user?.unit?.name || user?.unit_name || user?.employee?.unit?.name || user?.metadata?.unit_name || 'Unit Terkunci'}</span>
 </div>
 )}

 {canViewAllUnits && selectedUnitFilter && (
 <button
 type="button"
 onClick={() => {
 setSelectedUnitFilter('')
 setPage(1)
 }}
 title="Reset Filter Unit ke Semua Unit"
 className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
 >
 <X className="size-4" />
 </button>
 )}
 </div>
 </div>
 </div>

 {/* ── MODERN MULTI-TONE KPI CARDS ──────────────────────────────────────── */}
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
 <ModernKpiCard
 icon={BookOpen}
 label="Total Mata Pelajaran"
 value={Number(stats.total || 0).toLocaleString('id-ID')}
 subtext="Terdaftar di seluruh kurikulum"
 tone="emerald"
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="Mata Pelajaran Aktif"
 value={Number(stats.aktif || 0).toLocaleString('id-ID')}
 subtext="Siap digunakan dalam pembelajaran"
 tag="Aktif"
 tone="teal"
 />
 <ModernKpiCard
 icon={Archive}
 label="Arsip / Nonaktif"
 value={Number(archiveCount || 0).toLocaleString('id-ID')}
 subtext="Nonaktif atau dalam arsip"
 tone="amber"
 />
 </div>

 {/* ── CANONICAL APPDATATABLE EMERALD OUTER CONTAINER ───────────────────── */}
 <div id="tabel-mata-pelajaran" className="scroll-mt-6">
 <AppDataTable
 title="Daftar Mata Pelajaran"
 icon={BookOpen}
 iconClassName="bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 border-2 border-emerald-300/40 shadow-sm"
 description="Data mata pelajaran sesuai filter dan kewenangan pengguna."
 countLabel={`${Number(meta.total ?? stats.total ?? 0).toLocaleString('id-ID')} mapel`}
 actions={pageActions}
 search={search}
 onSearchChange={(value) => {
 setSearch(value)
 setPage(1)
 }}
 searchPlaceholder="Cari nama atau kode mata pelajaran..."
 filters={
 <>
 <HeroUiFilterSelect
 value={selectedUnitFilter}
 onChange={(unitId) => {
 const matchingKurikulum = resolveKurikulumForUnit(unitId)
 setSelectedUnitFilter(unitId)
 if (!matchingKurikulum.some((item) => String(item.id) === String(selectedKurikulumFilter))) setSelectedKurikulumFilter('')
 setPage(1)
 }}
 options={[
 ...(canViewAllUnits ? [{ value: '', label: 'Semua Unit' }] : []),
 ...availableUnitOptions.map((unit) => ({ value: String(unit.id), label: unit.name })),
 ]}
 disabled={!canViewAllUnits && availableUnitOptions.length <= 1}
 placeholder="Semua Unit"
 icon={Building2}
 ariaLabel="Filter unit pendidikan"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[150px]"
 />

 <HeroUiFilterSelect
 value={selectedKurikulumFilter}
 onChange={(val) => { setSelectedKurikulumFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Semua Kurikulum' },
 ...availableKurikulumForFilter.map((kurikulum) => ({ value: String(kurikulum.id), label: kurikulum.nama_kurikulum })),
 ]}
 placeholder="Semua Kurikulum"
 icon={Layers}
 ariaLabel="Filter kurikulum"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[160px]"
 />

 <HeroUiFilterSelect
 value={selectedKelompokFilter}
 onChange={(val) => { setSelectedKelompokFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Semua Kelompok' },
 ...KELOMPOK_LIST.map((kelompok) => ({ value: kelompok, label: kelompok })),
 ]}
 placeholder="Semua Kelompok"
 icon={Tag}
 ariaLabel="Filter kelompok mata pelajaran"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 <HeroUiFilterSelect
 value={selectedKategoriFilter}
 onChange={(val) => { setSelectedKategoriFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Semua Kategori' },
 ...KATEGORI_LIST.map((kategori) => ({ value: kategori, label: kategori })),
 ]}
 placeholder="Semua Kategori"
 icon={BookOpen}
 ariaLabel="Filter kategori mata pelajaran"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 <HeroUiFilterSelect
 value={selectedJenjangFilter}
 onChange={(val) => { setSelectedJenjangFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Semua Jenjang' },
 ...['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK'].map((jenjang) => ({ value: jenjang, label: jenjang })),
 ]}
 placeholder="Semua Jenjang"
 icon={GraduationCap}
 ariaLabel="Filter jenjang mata pelajaran"
 size="sm"
 className="w-full sm:w-auto min-w-[130px]"
 />

 <HeroUiFilterSelect
 value={selectedStatusFilter}
 onChange={(val) => { setSelectedStatusFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Semua Status' },
 { value: 'aktif', label: 'Aktif' },
 { value: 'tidak_aktif', label: 'Nonaktif' },
 ]}
 placeholder="Semua Status"
 icon={CheckCircle2}
 ariaLabel="Filter status mata pelajaran"
 size="sm"
 className="w-full sm:w-auto min-w-[130px]"
 />

 <HeroUiFilterSelect
 value={denganSampahFilter}
 onChange={(val) => { setDenganSampahFilter(val); setPage(1) }}
 options={[
 { value: '', label: 'Data Aktif' },
 { value: '1', label: 'Termasuk Arsip' },
 ]}
 placeholder="Data Aktif"
 icon={Archive}
 ariaLabel="Filter cakupan data"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />
 </>
 }
 onResetFilters={resetFilters}
 hasActiveFilters={filtersAreActive}
 isLoading={isLoading}
 isError={isError}
 errorTitle="Data mata pelajaran gagal dimuat"
 errorMessage="Periksa koneksi jaringan atau coba muat ulang data kembali."
 onRetry={refetch}
 isEmpty={!isLoading && !isError && items.length === 0}
 emptyTitle="Mata pelajaran tidak ditemukan"
 emptyDescription="Ubah kata kunci pencarian atau sesuaikan opsi filter aktif Anda."
 page={page}
 totalPages={meta.last_page ?? 1}
 totalItems={meta.total ?? stats.total ?? items.length}
 itemsPerPage={perPage}
 onPageChange={setPage}
 meta={meta}
 serverControlled
          columns={subjectColumns}
          data={items}
          actionColumnLabel=""
          onView={(row) => handleOpenDetail(row)}
          onEdit={canManage ? (row) => handleOpenFormEdit(row) : undefined}
          onDelete={canManage ? (row) => setDeleteTarget(row) : undefined}
 />
 </div>

 {/* ── HARMONIZED FORM MODAL (TAMBAH / EDIT) ────────────────────────────── */}
 <AnimatePresence>
 {isFormModalOpen && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 aria-labelledby="subject-form-title"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !simpanMutation.isPending) {
 setIsFormModalOpen(false)
 }
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="w-full max-w-xl font-sans my-auto"
 >
 <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232] shrink-0">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 p-2.5 shadow-md shadow-sm border-2 border-emerald-300/30 shrink-0">
 <BookOpen className="size-5 text-emerald-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="subject-form-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>{selectedForEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 {selectedForEdit ? 'Perbarui' : 'Data Baru'}
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Lengkapi referensi kurikulum, klasifikasi, alokasi JP, dan parameter penilaian rapor.
 </p>
 </div>
 </div>
 <button
 type="button"
 disabled={simpanMutation.isPending}
 onClick={() => setIsFormModalOpen(false)}
 aria-label="Tutup formulir"
 className="rounded-xl p-2 bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Form Body */}
 <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Unit Pendidikan */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Unit Pendidikan <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={formData.unit_pendidikan_id}
 onChange={(newUnitId) => {
 const matchingKur = resolveKurikulumForUnit(newUnitId)
 const currentUnit = (unitDropdown || []).find((u) => String(u.id) === String(newUnitId))
 const jenjang = getUnitJenjang(currentUnit)
 const isStillValid = matchingKur.some((k) => String(k.id) === String(formData.kurikulum_id))
 setFormData({
 ...formData,
 unit_pendidikan_id: newUnitId,
 kurikulum_id: isStillValid ? formData.kurikulum_id : (matchingKur[0]?.id || ''),
 jenjang: jenjang || formData.jenjang,
 })
 }}
 options={[
 { value: '', label: 'Pilih Unit Pendidikan' },
 ...unitDropdown.map((u) => ({ value: String(u.id), label: u.name })),
 ]}
 placeholder="Pilih Unit Pendidikan"
 icon={Building}
 ariaLabel="Pilih unit pendidikan"
 searchable
 className="w-full"
 />
 </div>

 {/* Kurikulum */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Kurikulum <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={formData.kurikulum_id}
 onChange={(val) => setFormData({ ...formData, kurikulum_id: val })}
 options={[
 { value: '', label: 'Pilih Kurikulum' },
 ...availableKurikulumForForm.map((k) => ({
 value: String(k.id),
 label: `${k.nama_kurikulum} ${k.jenjang ? `(${k.jenjang})` : ''}`,
 })),
 ]}
 placeholder="Pilih Kurikulum"
 icon={Layers}
 ariaLabel="Pilih kurikulum"
 searchable
 className="w-full"
 />
 </div>

 {/* Kode Mapel */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Kode Mapel <span className="text-rose-500">*</span>
 </label>
 <div className="relative">
 <Hash className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
 <input
 type="text"
 value={formData.kode_mapel}
 onChange={(e) => setFormData({ ...formData, kode_mapel: e.target.value })}
 required
 placeholder="Contoh: MP-SD-PAI"
 className="w-full rounded-xl border border-emerald-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </div>

 {/* Nama Mapel */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Nama Mapel <span className="text-rose-500">*</span>
 </label>
 <div className="relative">
 <BookOpen className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
 <input
 type="text"
 value={formData.nama_mapel}
 onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
 required
 placeholder="Contoh: Pendidikan Agama Islam"
 className="w-full rounded-xl border border-emerald-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </div>

 {/* Nama Singkat */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Nama Singkat / Singkatan
 </label>
 <div className="relative">
 <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
 <input
 type="text"
 value={formData.nama_singkat}
 onChange={(e) => setFormData({ ...formData, nama_singkat: e.target.value })}
 placeholder="Contoh: PAI"
 className="w-full rounded-xl border border-emerald-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </div>

 {/* Kelompok Mapel */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Kelompok Mapel
 </label>
 <HeroUiFilterSelect
 value={formData.kelompok_mapel}
 onChange={(val) => setFormData({ ...formData, kelompok_mapel: val })}
 options={KELOMPOK_LIST.map((k) => ({ value: k, label: k }))}
 placeholder="Pilih Kelompok Mapel"
 icon={Tag}
 ariaLabel="Pilih kelompok mapel"
 className="w-full"
 />
 </div>

 {/* Kategori */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Kategori
 </label>
 <HeroUiFilterSelect
 value={formData.kategori}
 onChange={(val) => setFormData({ ...formData, kategori: val })}
 options={KATEGORI_LIST.map((k) => ({ value: k, label: k }))}
 placeholder="Pilih Kategori"
 icon={BookOpen}
 ariaLabel="Pilih kategori"
 className="w-full"
 />
 </div>

 {/* Jenjang */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Jenjang
 </label>
 <HeroUiFilterSelect
 value={formData.jenjang}
 onChange={(val) => setFormData({ ...formData, jenjang: val })}
 options={['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK'].map((j) => ({ value: j, label: j }))}
 placeholder="Pilih Jenjang"
 icon={GraduationCap}
 ariaLabel="Pilih jenjang"
 className="w-full"
 />
 </div>

 {/* Alokasi JP per Minggu */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Alokasi JP per Minggu
 </label>
 <div className="relative">
 <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
 <input
 type="number"
 min="1"
 max="20"
 value={formData.jam_pelajaran}
 onChange={(e) => setFormData({ ...formData, jam_pelajaran: parseInt(e.target.value) || 0 })}
 className="w-full rounded-xl border border-emerald-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </div>

 {/* KKM Minimum */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 KKM Minimum
 </label>
 <div className="relative">
 <Target className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
 <input
 type="number"
 step="0.01"
 min="0"
 max="100"
 value={formData.kkm}
 onChange={(e) => setFormData({ ...formData, kkm: parseFloat(e.target.value) || 0 })}
 className="w-full rounded-xl border border-emerald-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </div>

 {/* Bobot Pengetahuan */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Bobot Pengetahuan (%)
 </label>
 <input
 type="number"
 min="0"
 max="100"
 value={formData.bobot_pengetahuan}
 onChange={(e) => setFormData({ ...formData, bobot_pengetahuan: parseInt(e.target.value) || 0 })}
 className="w-full rounded-xl border border-emerald-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>

 {/* Bobot Keterampilan */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Bobot Keterampilan (%)
 </label>
 <input
 type="number"
 min="0"
 max="100"
 value={formData.bobot_keterampilan}
 onChange={(e) => setFormData({ ...formData, bobot_keterampilan: parseInt(e.target.value) || 0 })}
 className="w-full rounded-xl border border-emerald-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>

 {/* Bobot Sikap */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Bobot Sikap (%)
 </label>
 <input
 type="number"
 min="0"
 max="100"
 value={formData.bobot_sikap}
 onChange={(e) => setFormData({ ...formData, bobot_sikap: parseInt(e.target.value) || 0 })}
 className="w-full rounded-xl border border-emerald-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>

 {/* Warna Badge / Identitas */}
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Warna Identitas Mapel
 </label>
 <div className="flex items-center gap-3">
 <input
 type="color"
 value={formData.warna}
 onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
 className="size-10 rounded-xl cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 p-0.5 bg-white"
 />
 <input
 type="text"
 value={formData.warna}
 onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
 className="flex-1 rounded-xl border border-emerald-200/90 bg-slate-50/50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-[#0E5C44] focus:bg-white focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </div>
 </div>

 {/* ── INTERACTIVE OPERATIONAL STATUS TOGGLE CARD ─────────────── */}
 <div className="pt-2">
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
 Status Keaktifan Mapel
 </label>
 <div
 onClick={() => setFormData({ ...formData, status: !formData.status })}
 className={cn(
 'flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer select-none',
 formData.status
 ? 'border-emerald-500/40 bg-white dark:bg-[#1B2433] shadow-xs dark:border-emerald-700/60 dark:bg-[#1B2433]'
 : 'border-emerald-200/80 bg-slate-50/80 dark:border-emerald-800/60 dark:bg-slate-900/60'
 )}
 >
 <div className="flex items-center gap-3.5">
 <div
 className={cn(
 'flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all',
 formData.status
 ? 'bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 shadow-sm'
 : 'bg-slate-400 dark:bg-slate-700 shadow-slate-400/20'
 )}
 >
 {formData.status ? (
 <ShieldCheck className="size-5.5" strokeWidth={2.3} />
 ) : (
 <Power className="size-5.5" strokeWidth={2.3} />
 )}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-xs font-black text-slate-900 dark:text-white">
 {formData.status ? 'Mata Pelajaran Aktif' : 'Mata Pelajaran Nonaktif'}
 </h4>
 <span
 className={cn(
 'inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-bold border',
 formData.status
 ? 'bg-emerald-100 text-emerald-800 border-emerald-300/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
 : 'bg-slate-200 text-slate-700 border-emerald-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-800/60'
 )}
 >
 <Sparkles className="size-2.5" />
 {formData.status ? 'Aktif' : 'Arsip'}
 </span>
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
 {formData.status
 ? 'Mata pelajaran ini aktif digunakan dalam penyusunan jadwal, KBM, dan rapor.'
 : 'Mata pelajaran tidak akan muncul pada pilihan jadwal baru dan nonaktif.'}
 </p>
 </div>
 </div>

 {/* Tactile Switch Button */}
 <div
 className={cn(
 'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
 formData.status ? 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white' : 'bg-slate-300 dark:bg-slate-700'
 )}
 >
 <span
 className={cn(
 'pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
 formData.status ? 'translate-x-5' : 'translate-x-0'
 )}
 />
 </div>
 </div>
 </div>

 {/* Footer Aksi */}
 <div className="flex items-center justify-between border-t border-emerald-200/80 bg-white pt-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <Button
 type="button"
 variant="danger"
 disabled={simpanMutation.isPending}
 onClick={() => setIsFormModalOpen(false)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5 text-rose-600" strokeWidth={2.2} />
 </div>
 <span>Batal</span>
 </Button>
 <Button
 type="submit"
 variant="success"
 disabled={simpanMutation.isPending}
 className="inline-flex items-center gap-2 rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 px-5 py-2.5 text-xs font-extrabold border-2 border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
 >
 {simpanMutation.isPending ? (
 <Loader2 className="size-4 animate-spin text-emerald-600" />
 ) : (
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <Save className="size-3.5 text-slate-600" strokeWidth={2.25} />
 </div>
 )}
 <span>{simpanMutation.isPending ? 'Menyimpan...' : 'Simpan Data'}</span>
 </Button>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── HARMONIZED DETAIL MODAL ──────────────────────────────────────────── */}
 <AnimatePresence>
 {isDetailModalOpen && selectedForDetail && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 aria-labelledby="subject-detail-title"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget) setIsDetailModalOpen(false)
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="w-full max-w-xl font-sans my-auto"
 >
 <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div
 className="rounded-xl p-2.5 shadow-md text-white shrink-0 border"
 style={{
 backgroundColor: selectedForDetail.warna || '#0E5C44',
 borderColor: `${selectedForDetail.warna || '#0E5C44'}44`,
 }}
 >
 <BookOpen className="size-5 text-current" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="subject-detail-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 {selectedForDetail.nama_mapel || selectedForDetail.name}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
 {selectedForDetail.kode_mapel || selectedForDetail.code}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsDetailModalOpen(false)}
 aria-label="Tutup detail"
 className="rounded-xl p-2 bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Body */}
 <div className="p-6 space-y-3.5 text-xs">
 {/* Identity Box */}
 <div className="space-y-2 rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 dark:border-emerald-800/60">
 <span className="font-bold text-slate-500">Kode & Singkatan</span>
 <span className="font-mono font-extrabold text-slate-800 dark:text-slate-100">
 {selectedForDetail.kode_mapel || selectedForDetail.code} {selectedForDetail.nama_singkat ? `(${selectedForDetail.nama_singkat})` : ''}
 </span>
 </div>
 <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 dark:border-emerald-800/60">
 <span className="font-bold text-slate-500">Kurikulum</span>
 <span className="font-bold text-emerald-800 dark:text-emerald-300">
 {selectedForDetail.kurikulum?.nama_kurikulum || 'Kurikulum Terpadu'}
 </span>
 </div>
 <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 dark:border-emerald-800/60">
 <span className="font-bold text-slate-500">Unit Pendidikan</span>
 <span className="font-bold text-slate-800 dark:text-slate-100">
 {selectedForDetail.unit_pendidikan?.name || 'Semua Unit'}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="font-bold text-slate-500">Klasifikasi</span>
 <span className="font-bold text-slate-700 dark:text-slate-300">
 {selectedForDetail.kelompok_mapel || 'Pelajaran Wajib'} · {selectedForDetail.kategori || 'Wajib'}
 </span>
 </div>
 </div>

 {/* JP & KKM Metrics */}
 <div className="grid grid-cols-2 gap-3">
 <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/40">
 <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-slate-300 shadow-xs shrink-0">
 <Clock3 className="size-5" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Alokasi Waktu</p>
 <p className="text-sm font-black text-emerald-900 dark:text-emerald-200">{selectedForDetail.jam_pelajaran || 2} JP / Minggu</p>
 </div>
 </div>
 <div className="flex items-center gap-3 rounded-xl border border-emerald-/80 bg-emerald-/70 p-3.5 dark:border-emerald- dark:bg-emerald-/40">
 <div className="flex size-10 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xs shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
 <Target className="size-5" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">KKM Minimum</p>
 <p className="text-sm font-black text-emerald- dark:text-emerald-">{selectedForDetail.kkm || 75}</p>
 </div>
 </div>
 </div>

 {/* Bobot Penilaian */}
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
 <ChartNoAxesColumn className="size-3.5 text-emerald-700 dark:text-emerald-400" />
 Bobot Penilaian Rapor
 </p>
 <div className="grid grid-cols-3 gap-2 text-center">
 <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="block text-[10px] text-slate-400 font-bold">Pengetahuan</span>
 <strong className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedForDetail.bobot_pengetahuan || 40}%</strong>
 </div>
 <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="block text-[10px] text-slate-400 font-bold">Keterampilan</span>
 <strong className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedForDetail.bobot_keterampilan || 40}%</strong>
 </div>
 <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="block text-[10px] text-slate-400 font-bold">Sikap</span>
 <strong className="text-xs font-black text-slate-800 dark:text-slate-100">{selectedForDetail.bobot_sikap || 20}%</strong>
 </div>
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="flex justify-end border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-6 py-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
 <button
 type="button"
 onClick={() => setIsDetailModalOpen(false)}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
 >
 Tutup
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── HARMONIZED EXPORT MODAL ──────────────────────────────────────────── */}
 <AnimatePresence>
 {isExportModalOpen && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="subject-export-title"
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
 <h3 id="subject-export-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Export Mata Pelajaran</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0E5C44] border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Unduh
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pilih format berkas untuk mengekspor data mata pelajaran
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
 name="export-format-subject"
 value={opt.value}
 checked={exportFormat === opt.value}
 onChange={() => setExportFormat(opt.value)}
 className="accent-emerald-600 size-4"
 />
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{opt.label}</p>
 <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
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

 {/* ── HARMONIZED IMPORT MODAL ──────────────────────────────────────────── */}
 <AnimatePresence>
 {isImportModalOpen && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="subject-import-title"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget) setIsImportModalOpen(false)
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
 <div className="rounded-xl bg-white dark:bg-[#1B2433] p-2.5 shadow-md shadow-sky-500/30 border border-sky-300/30 shrink-0">
 <Upload className="size-5 text-slate-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="subject-import-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Import Mata Pelajaran</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300">
 <Sparkles className="size-3" />
 Batch
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Unggah file Excel atau CSV sesuai template standar
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsImportModalOpen(false)}
 aria-label="Tutup modal import"
 className="rounded-xl p-2 bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 border border-rose-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Form Body */}
 <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
 {/* Download Template Banner */}
 <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800">
 <div className="flex items-center gap-2.5">
 <FileSpreadsheet className="size-5 text-emerald-700 dark:text-emerald-400" />
 <div>
 <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Unduh Format Template</p>
 <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Format CSV siap pakai dengan header lengkap</p>
 </div>
 </div>
 <button
 type="button"
 onClick={handleDownloadTemplate}
 className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer border border-emerald-600 h-9 text-sm font-medium"
 >
 Template
 </button>
 </div>

 {/* Dropzone */}
 <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-6 text-center dark:border-emerald-700 dark:bg-emerald-950/20">
 <FileSpreadsheet className="mx-auto mb-2 size-10 text-white dark:text-emerald-400" />
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Pilih berkas Excel (.xlsx, .xls) atau CSV</p>
 <p className="text-xs text-slate-400 mt-0.5">Ukuran maksimal file 10 MB</p>
 <input
 type="file"
 accept=".xlsx, .xls, .csv"
 onChange={(e) => setImportFile(e.target.files[0] || null)}
 className="mt-3 text-xs w-full text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white file:cursor-pointer"
 />
 </div>

 {/* Opsi Timpa Data (Overwrite) */}
 <div className={cn(
 "rounded-xl border p-4 transition-all duration-200",
 overwriteExisting
 ? "border-amber-300/90 bg-white dark:bg-[#1B2433] dark:border-amber-700/60 dark:bg-amber-950/30"
 : "border-emerald-200/80 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900/40"
 )}>
 <label className="flex items-start gap-3 cursor-pointer select-none">
 <div className="pt-0.5">
 <input
 type="checkbox"
 id="overwrite-mapel-checkbox"
 checked={overwriteExisting}
 onChange={(e) => setOverwriteExisting(e.target.checked)}
 className="size-4.5 rounded-md border-emerald-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
 />
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
 Timpa Data Jika Kode Mapel Sudah Ada
 </span>
 {overwriteExisting ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-300/80 dark:bg-amber-950 dark:text-amber-300">
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
 ? 'Jika baris data pada berkas memiliki Kode Mapel yang sudah terdaftar, data mata pelajaran lama akan diperbarui otomatis.'
 : 'Jika baris data pada berkas memiliki Kode Mapel yang sudah ada di database, baris tersebut akan dilewati dan data lama tetap utuh.'}
 </p>
 </div>
 </label>
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between border-t border-emerald-200/80 bg-white pt-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <button
 type="button"
 onClick={() => {
 setIsImportModalOpen(false)
 setOverwriteExisting(false)
 }}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5 text-rose-600" strokeWidth={2.2} />
 </div>
 <span>Batal</span>
 </button>
 <button
 type="submit"
 disabled={!importFile}
 className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2.5 text-xs font-extrabold border border-sky-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <div className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <Upload className="size-3.5 text-white" strokeWidth={2.25} />
 </div>
 <span>Upload & Impor</span>
 </button>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── MODAL HASIL IMPOR & PEMBERITAHUAN DATA DUPLIKAT ── */}
 <AnimatePresence>
 {duplicateModalData && (
 <div
 className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="mapel-duplicate-report-title"
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-xl font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232] dark:shadow-black/60">
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
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
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
 <h3 id="mapel-duplicate-report-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Hasil Impor & Pemberitahuan Data</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
 Total {duplicateModalData.total} Data
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Ringkasan sinkronisasi dan status pemrosesan data mata pelajaran
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
 <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-200">
 {/* KPI Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Baru</p>
 <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{duplicateModalData.berhasil || 0}</p>
 </div>
 <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-center dark:border-amber-800/60 dark:bg-amber-950/30">
 <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Ditimpa</p>
 <p className="text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5">{duplicateModalData.diperbarui || 0}</p>
 </div>
 <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-3 text-center dark:border-sky-800/60 dark:bg-sky-950/30">
 <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">Dilewati</p>
 <p className="text-lg font-black text-sky-700 dark:text-sky-300 mt-0.5">{duplicateModalData.duplikat || 0}</p>
 </div>
 <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3 text-center dark:border-rose-800/60 dark:bg-rose-950/30">
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
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <tr>
 <th className="px-3.5 py-2.5">Baris</th>
 <th className="px-3.5 py-2.5">Kode Mapel</th>
 <th className="px-3.5 py-2.5">Nama Mapel</th>
 <th className="px-3.5 py-2.5">Status</th>
 <th className="px-3.5 py-2.5">Keterangan</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-slate-800 text-xs">
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
 </div>

 {/* Footer */}
 <div className="flex items-center justify-end border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20 px-6 py-3.5 dark:border-emerald-800/60 dark:bg-slate-900/30">
 <button
 type="button"
 onClick={() => setDuplicateModalData(null)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2 text-xs font-bold shadow-md hover:from-emerald-700 hover:to-teal-800 transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <span>Mengerti</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── HARMONIZED DELETE CONFIRMATION MODAL (z-[70]) ────────────────────── */}
 <AnimatePresence>
 {deleteTarget && (
 <div
 className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="delete-confirm-title"
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
 className="w-full max-w-md font-sans my-auto"
 >
 <div className="flex flex-col overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-2xl shadow-sm dark:border-rose-900/60 dark:bg-[#182232] dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-white dark:bg-[#1B2433] p-2.5 shadow-md shadow-sm border border-rose-300/30 shrink-0">
 <Trash2 className="size-5 text-emerald-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="delete-confirm-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Hapus Mata Pelajaran</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300">
 Konfirmasi
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Tindakan ini akan mengarsipkan data mata pelajaran
 </p>
 </div>
 </div>
 <button
 type="button"
 disabled={hapusMutation.isPending}
 onClick={() => setDeleteTarget(null)}
 aria-label="Batal hapus"
 className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
 >
 <X className="size-4" strokeWidth={2.2} />
 </button>
 </div>

 {/* Target Entity Summary Box */}
 <div className="p-6 space-y-3.5">
 <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-[10px] uppercase font-bold text-slate-400">Target Mata Pelajaran</span>
 <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
 {deleteTarget.nama_mapel || deleteTarget.name}
 </h4>
 <p className="text-xs font-mono text-slate-500 mt-0.5">
 Kode: {deleteTarget.kode_mapel || deleteTarget.code} · {deleteTarget.unit_pendidikan?.name || 'Unit'}
 </p>
 </div>

 {/* Danger Notice Box */}
 <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs font-semibold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 leading-relaxed flex items-start gap-2.5">
 <div className="size-6 shrink-0 rounded-lg bg-rose-600 flex items-center justify-center text-white mt-0.5">
 <AlertTriangle className="size-3.5" />
 </div>
 <p>
 Apakah Anda yakin ingin menghapus mata pelajaran ini? Data yang terhapus dapat dipulihkan kembali dari filter arsip jika diperlukan.
 </p>
 </div>
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
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

 {/* ── HARMONIZED BULK DELETE CONFIRMATION MODAL (z-[70]) ──────────────── */}
 <AnimatePresence>
 {bulkDeleteConfirmOpen && (
 <div
 className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="bulk-delete-confirm-title"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !bulkDeleteMutation.isPending) {
 setBulkDeleteConfirmOpen(false)
 }
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="w-full max-w-md font-sans my-auto"
 >
 <div className="flex flex-col overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-2xl shadow-sm dark:border-rose-900/60 dark:bg-[#182232] dark:shadow-black/60">
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-[#182232]">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-white dark:bg-[#1B2433] p-2.5 shadow-md shadow-sm border border-rose-300/30 shrink-0">
 <Trash2 className="size-5 text-slate-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="bulk-delete-confirm-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Hapus Massal Mata Pelajaran
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Konfirmasi penghapusan beberapa data sekaligus
 </p>
 </div>
 </div>
 <button
 type="button"
 disabled={bulkDeleteMutation.isPending}
 onClick={() => setBulkDeleteConfirmOpen(false)}
 aria-label="Batal hapus"
 className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
 >
 <X className="size-4" strokeWidth={2.2} />
 </button>
 </div>
 <div className="p-6 space-y-3.5">
 <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50">
 <span className="text-[10px] uppercase font-bold text-rose-500">Jumlah Data Terpilih</span>
 <h4 className="text-lg font-black text-rose-950 dark:text-rose-200 mt-0.5">
 {selectedIds.length} Mata Pelajaran
 </h4>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
 Apakah Anda yakin ingin menghapus seluruh data mata pelajaran yang telah Anda centang?
 </p>
 </div>
 </div>
 <div className="flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <button
 type="button"
 disabled={bulkDeleteMutation.isPending}
 onClick={() => setBulkDeleteConfirmOpen(false)}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 text-xs font-extrabold text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 active:scale-95 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
 >
 <X className="size-3.5" strokeWidth={2.2} />
 <span>Batal</span>
 </button>
 <button
 type="button"
 disabled={bulkDeleteMutation.isPending}
 onClick={() => bulkDeleteMutation.mutate(selectedIds)}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
 >
 {bulkDeleteMutation.isPending ? (
 <Loader2 className="size-4 animate-spin" />
 ) : (
 <Trash2 className="size-4" strokeWidth={2.2} />
 )}
 <span>{bulkDeleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Semua'}</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Smart Floating Scroll Navigator (Opsi A) */}
 <SmartScrollFab targetId="tabel-mata-pelajaran" downTooltip="Langsung ke Tabel Mata Pelajaran" />
 </PageContainer>
 )
}
