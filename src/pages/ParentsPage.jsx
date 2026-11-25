import CustomSelect from "../components/ui/CustomSelect"
import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
 Users,
 UserCheck,
 Phone,
 GraduationCap,
 Briefcase,
 HeartHandshake,
 FileSpreadsheet,
 Plus,
 Upload,
 UserPlus,
 Printer,
 Download,
 ShieldCheck,
 Sparkles,
 FileText,
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import { parentService } from '../services/parentService'
import { handleApiExport } from '../utils/exportUtils'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import PersonAvatar from '../components/ui/PersonAvatar'
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import HeroUiHeader from '../components/ui/HeroUiHeader'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
import PageToolbarActions from '../components/app/PageToolbarActions'
import CsvImportModal from '../components/master-data/CsvImportModal'
import {
 MasterFilterSelect,
 MasterBadge,
 MasterDetailModal,
 MasterFormModal,
 MasterDeleteDialog,
 PrintOptionModal,
} from '../components/master-data'

const initialParentForm = {
 id: null,
 nama: '',
 hubungan: 'Ayah',
 nik: '',
 phone: '',
 email: '',
 pekerjaan: '',
 alamat: '',
}

export default function ParentsPage() {
 const queryClient = useQueryClient()

 // State Filters & Pagination
 const [search, setSearch] = useState('')
 const [hubunganFilter, setHubunganFilter] = useState('Semua')
 const [page, setPage] = useState(1)

 // Modals state
 const [selectedParent, setSelectedParent] = useState(null)
 const [isDetailOpen, setIsDetailOpen] = useState(false)
 const [isFormOpen, setIsFormOpen] = useState(false)
 const [isDeleteOpen, setIsDeleteOpen] = useState(false)
 const [isImportOpen, setIsImportOpen] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [formData, setFormData] = useState(initialParentForm)

 // Query Real Data from Parent API
 const { data: parentResponse, isLoading, isError, refetch } = useQuery({
 queryKey: ['parents-list', page, search, hubunganFilter],
 queryFn: () =>
 parentService.getParents({
 page,
 per_page: 20,
 search: search || undefined,
 hubungan: hubunganFilter !== 'Semua' ? hubunganFilter : undefined,
 }),
 })

 const parentList = parentResponse?.data || []
 const meta = parentResponse?.meta || {}
 const summary = parentResponse?.summary || {}

 // Mutations
 const saveMutation = useMutation({
 mutationFn: (payload) => {
 if (payload.id) {
 return parentService.updateParent(payload.id, payload)
 }
 return parentService.createParent(payload)
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['parents-list'])
 setIsFormOpen(false)
 Swal.fire({
 icon: 'success',
 title: 'Berhasil',
 text: 'Data orang tua / wali berhasil disimpan.',
 timer: 1800,
 showConfirmButton: false,
 })
 },
 onError: (err) => {
 Swal.fire({
 icon: 'error',
 title: 'Gagal Menyimpan',
 text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
 })
 },
 })

 const deleteMutation = useMutation({
 mutationFn: (id) => parentService.deleteParent(id),
 onSuccess: () => {
 queryClient.invalidateQueries(['parents-list'])
 setIsDeleteOpen(false)
 setSelectedParent(null)
 Swal.fire({
 icon: 'success',
 title: 'Berhasil Dihapus',
 text: 'Data orang tua / wali berhasil dihapus.',
 timer: 1800,
 showConfirmButton: false,
 })
 },
 onError: (err) => {
 Swal.fire({
 icon: 'error',
 title: 'Gagal Menghapus',
 text: err.response?.data?.message || 'Terjadi kesalahan saat menghapus data.',
 })
 },
 })

 const handleOpenCreate = () => {
 setFormData(initialParentForm)
 setIsFormOpen(true)
 }

 const handleOpenEdit = (item) => {
 setFormData({
 id: item.id,
 nama: item.nama || '',
 hubungan: item.hubungan || 'Ayah',
 nik: item.nik && item.nik !== '-' ? item.nik : '',
 phone: item.noHp && item.noHp !== '-' ? item.noHp : '',
 email: item.email && item.email !== '-' ? item.email : '',
 pekerjaan: item.pekerjaan && item.pekerjaan !== '-' ? item.pekerjaan : '',
 alamat: item.alamat && item.alamat !== '-' ? item.alamat : '',
 })
 setIsFormOpen(true)
 }

 const handleOpenDelete = (item) => {
 setSelectedParent(item)
 setIsDeleteOpen(true)
 }

 const handleExport = async () => {
 const params = {}
 if (search) params.search = search
 if (hubunganFilter && hubunganFilter !== 'Semua') params.hubungan = hubunganFilter

 await handleApiExport({
 endpoint: '/parents/export',
 params,
 title: 'Ekspor Data Orang Tua / Wali',
 defaultFilename: `Data_Orang_Tua_Wali_${new Date().toISOString().slice(0, 10)}`,
 })
 }

 const handlePrint = (type) => {
 const columns = [
 { key: 'no', label: 'No' },
 { key: 'nama', label: 'Nama Orang Tua / Wali' },
 { key: 'hubungan', label: 'Hubungan' },
 { key: 'namaSiswa', label: 'Nama Siswa' },
 { key: 'unitPendidikan', label: 'Unit' },
 { key: 'kelasSiswa', label: 'Kelas' },
 { key: 'pekerjaan', label: 'Pekerjaan' },
 { key: 'noHp', label: 'No. Handphone' },
 ]
 const rows = parentList.map((p, idx) => ({
 no: ((meta.current_page || page) - 1) * (meta.per_page || 20) + idx + 1,
 nama: p.nama,
 hubungan: p.hubungan,
 namaSiswa: p.namaSiswa || '-',
 unitPendidikan: p.unitPendidikan || '-',
 kelasSiswa: p.kelasSiswa || '-',
 pekerjaan: p.pekerjaan || '-',
 noHp: p.noHp || '-',
 }))

 if (type === 'pdf') {
 downloadPdfTable({
 title: 'Laporan Data Orang Tua & Wali Siswa',
 filename: 'Laporan_Data_Orang_Tua_Wali.pdf',
 columns,
 data: rows,
 })
 } else {
 printCleanTable({
 title: 'Laporan Data Orang Tua & Wali Siswa',
 columns,
 data: rows,
 })
 }
 }

 const handleImportRows = async (rows) => {
 try {
 const res = await parentService.importParents(rows)
 queryClient.invalidateQueries(['parents-list'])
 Swal.fire('Berhasil', res?.message || `${rows.length} data orang tua berhasil diimpor.`, 'success')
 setIsImportOpen(false)
 } catch (err) {
 Swal.fire('Gagal Import', err.response?.data?.message || 'Terjadi kesalahan saat mengimpor data.', 'error')
 }
 }

 return (
 <PageContainer maxW="7xl">
 <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Orang Tua / Wali' }]} />

 <div className="space-y-6 pb-12">
 {/* Header Halaman Modern Hero Card */}
      <HeroUiHeader
        title="Data Orang Tua & Wali"
        subtitle="Kelola direktori kontak, data pekerjaan, dan relasi orang tua/wali siswa terintegrasi secara komprehensif."
        icon={Users}
        roleTag="Direktori Keluarga"
        badge="Pangkalan Data"
        className="mb-6"
      />

 

 {/* Ringkasan Statistik KPI Modern */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
 <div className="relative overflow-hidden rounded-xl border-2 border-emerald-200/80 bg-white dark:border-emerald-700/80 dark:bg-[#1B2433] dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 p-5 shadow-xs">
 <div className="flex items-center justify-between mb-3">
 <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Orang Tua / Wali</span>
 <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <Users className="size-4.5" />
 </div>
 </div>
 <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
 {Number(summary.total ?? parentList.length).toLocaleString('id-ID')}
 </div>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Tercatat dalam pangkalan data</p>
 </div>

 <div className="relative overflow-hidden rounded-xl border-2 border-emerald-200/80 bg-white dark:border-emerald-700/80 dark:bg-[#1B2433] dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900 p-5 shadow-xs">
 <div className="flex items-center justify-between mb-3">
 <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400">Relasi Ayah Kandung</span>
 <div className="flex size-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm border border-sky-300/40">
 <UserCheck className="size-4.5" />
 </div>
 </div>
 <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
 {Number(summary.ayah ?? 0).toLocaleString('id-ID')}
 </div>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Tercatat dalam pangkalan data</p>
 </div>

 <div className="relative overflow-hidden rounded-xl border-2 border-emerald-200/80 bg-white dark:border-emerald-700/80 dark:bg-[#1B2433] dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 p-5 shadow-xs">
 <div className="flex items-center justify-between mb-3">
 <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">Relasi Ibu Kandung</span>
 <div className="flex size-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm border border-amber-300/40">
 <HeartHandshake className="size-4.5" />
 </div>
 </div>
 <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
 {Number(summary.ibu ?? 0).toLocaleString('id-ID')}
 </div>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Tercatat dalam pangkalan data</p>
 </div>

 <div className="relative overflow-hidden rounded-xl border-2 border-emerald-200/80 bg-white dark:border-emerald-700/80 dark:bg-[#1B2433] dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900 p-5 shadow-xs">
 <div className="flex items-center justify-between mb-3">
 <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">Relasi Wali Siswa</span>
 <div className="flex size-9 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm border border-teal-300/40">
 <GraduationCap className="size-4.5" />
 </div>
 </div>
 <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
 {Number(summary.wali ?? 0).toLocaleString('id-ID')}
 </div>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Tercatat dalam pangkalan data</p>
 </div>
 </div>

 {/* Canonical AppDataTable Emerald Outer Container */}
 <AppDataTable
 title="Daftar Orang Tua / Wali Siswa"
 description="Direktori data orang tua/wali siswa terdaftar."
 icon={Users}
 iconClassName="bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 border-2 border-emerald-300 shadow-sm"
 countLabel={`${Number(meta.total || parentList.length).toLocaleString('id-ID')} orang`}
 actions={
 <PageToolbarActions
 onPrint={() => setIsPrintModalOpen(true)}
 printLabel="Cetak Data Laporan (Print)"
 onImport={() => setIsImportOpen(true)}
 importLabel="Import Data Orang Tua"
 onExport={handleExport}
 exportLabel="Export Data Orang Tua"
 onAdd={handleOpenCreate}
 addLabel="Tambah Orang Tua / Wali Baru"
 />
 }
 search={search}
 onSearchChange={(value) => {
 setSearch(value)
 setPage(1)
 }}
 searchPlaceholder="Cari nama orang tua, nama siswa, NIK, atau nomor HP..."
 filters={
 <MasterFilterSelect
 aria-label="Filter hubungan keluarga"
 value={hubunganFilter}
 onChange={(e) => {
 setHubunganFilter(e.target.value)
 setPage(1)
 }}
 >
 <option value="Semua">Semua Hubungan</option>
 <option value="Ayah">Ayah</option>
 <option value="Ibu">Ibu</option>
 <option value="Wali">Wali</option>
 </MasterFilterSelect>
 }
 hasActiveFilters={Boolean(search || hubunganFilter !== 'Semua')}
 onResetFilters={() => {
 setSearch('')
 setHubunganFilter('Semua')
 setPage(1)
 }}
 isLoading={isLoading}
 isError={isError}
 onRetry={refetch}
 isEmpty={!isLoading && !isError && parentList.length === 0}
 emptyTitle="Data Orang Tua Tidak Ditemukan"
 emptyDescription="Belum ada data orang tua/wali yang sesuai dengan kriteria pencarian Anda."
 page={page}
 totalPages={meta.last_page || 1}
 totalItems={meta.total || parentList.length}
 itemsPerPage={meta.per_page || 20}
 onPageChange={setPage}
 meta={{
 total: meta.total || parentList.length,
 from: meta.from || 1,
 to: meta.to || parentList.length,
 last_page: meta.last_page || 1,
 current_page: meta.current_page || page,
 }}
 serverControlled
 renderTable={() => (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" aria-label="Daftar orang tua dan wali">
            <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
              <tr className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-transparent text-emerald-950 dark:text-emerald-200">
                <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider">NAMA ORANG TUA / WALI</th>
                <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider">SISWA &amp; UNIT PENDIDIKAN</th>
                <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider">PEKERJAAN</th>
                <th className="py-3.5 px-4 font-extrabold text-xs uppercase tracking-wider">KONTAK NO. HP</th>
                <th className="py-3.5 px-4 text-right w-16 sm:w-20 select-none bg-transparent"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-medium text-slate-700 dark:text-slate-200">
              {parentList.map((parent) => (
                <tr key={parent.id} className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <PersonIdentityCell
                        src={parent.photo_url || parent.avatar_url || parent.foto}
                        name={parent.nama}
                        subtitle={parent.email !== '-' ? parent.email : (parent.nik !== '-' ? `NIK: ${parent.nik}` : '')}
                      />
                      <MasterBadge
                        variant={
                          parent.hubungan === 'Ayah'
                            ? 'info'
                            : parent.hubungan === 'Ibu'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {parent.hubungan}
                      </MasterBadge>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{parent.namaSiswa}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {parent.kelasSiswa} • {parent.unitPendidikan}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Briefcase className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{parent.pekerjaan}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{parent.noHp}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end">
                      <ActionDropdown
                        onView={() => {
                          setSelectedParent(parent)
                          setIsDetailOpen(true)
                        }}
                        onEdit={() => handleOpenEdit(parent)}
                        onDelete={() => handleOpenDelete(parent)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
 )}
 />

 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 onPrint={handlePrint}
 title="Cetak & Unduh Data Orang Tua / Wali"
 description="Pilih format pencetakan dokumen direktori data orang tua murid."
 />

 {/* Detail Modal */}
 <MasterDetailModal
 isOpen={isDetailOpen}
 onClose={() => setIsDetailOpen(false)}
 icon={Users}
 title="Detail Orang Tua / Wali"
 description="Informasi lengkap mengenai kontak dan data relasi orang tua siswa"
 >
 {selectedParent && (
 <div className="space-y-4 p-6 text-sm">
 <div className="rounded-xl border border-emerald-100/80 bg-slate-50/50 p-4 space-y-3">
 <div className="flex items-center gap-3">
 <PersonAvatar
 src={selectedParent.photo_url || selectedParent.avatar_url || selectedParent.foto}
 name={selectedParent.nama}
 size="card"
 />
 <div>
 <h3 className="text-base font-bold text-slate-900">{selectedParent.nama}</h3>
 <div className="flex items-center gap-2 mt-0.5">
 <MasterBadge variant="info">{selectedParent.hubungan}</MasterBadge>
 {selectedParent.email !== '-' && (
 <span className="text-xs text-slate-500">{selectedParent.email}</span>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div className="rounded-xl border border-emerald-200/80 p-4">
 <p className="text-xs font-bold text-slate-400 uppercase">Siswa Terkait</p>
 <p className="mt-1 font-bold text-slate-800">{selectedParent.namaSiswa}</p>
 <p className="text-xs text-slate-500">{selectedParent.kelasSiswa} • {selectedParent.unitPendidikan}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 p-4">
 <p className="text-xs font-bold text-slate-400 uppercase">No. Handphone / WA</p>
 <p className="mt-1 font-bold text-emerald-800 font-mono">{selectedParent.noHp}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 p-4 sm:col-span-2">
 <p className="text-xs font-bold text-slate-400 uppercase">Pekerjaan</p>
 <p className="mt-1 font-semibold text-slate-800">{selectedParent.pekerjaan}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 p-4 sm:col-span-2">
 <p className="text-xs font-bold text-slate-400 uppercase">Alamat Tempat Tinggal</p>
 <p className="mt-1 font-medium text-slate-700">{selectedParent.alamat}</p>
 </div>
 </div>
 </div>
 )}
 </MasterDetailModal>

 {/* Create / Edit Form Modal */}
 <MasterFormModal
 isOpen={isFormOpen}
 onClose={() => setIsFormOpen(false)}
 onSubmit={(e) => {
 e.preventDefault()
 saveMutation.mutate(formData)
 }}
 isSubmitting={saveMutation.isPending}
 icon={formData.id ? Users : UserPlus}
 title={formData.id ? 'Ubah Data Orang Tua / Wali' : 'Tambah Orang Tua / Wali'}
 description="Lengkapi formulir informasi orang tua atau wali murid di bawah ini."
 >
 <div className="space-y-4 p-6 text-sm">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div className="space-y-1.5 sm:col-span-2">
 <label className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
 <input
 type="text"
 required
 value={formData.nama}
 onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
 placeholder="Nama lengkap orang tua / wali"
 className="w-full rounded-xl border border-emerald-200/80 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">Hubungan Keluarga *</label>
 <CustomSelect
 value={formData.hubungan}
 onChange={(e) => setFormData({ ...formData, hubungan: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
 >
 <option value="Ayah">Ayah</option>
 <option value="Ibu">Ibu</option>
 <option value="Wali">Wali</option>
 </CustomSelect>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">NIK</label>
 <input
 type="text"
 value={formData.nik}
 onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
 placeholder="Nomor Induk Kependudukan"
 className="w-full rounded-xl border border-emerald-200/80 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none font-mono"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">No. Handphone / WhatsApp</label>
 <input
 type="text"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 placeholder="0812xxxxxxx"
 className="w-full rounded-xl border border-emerald-200/80 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none font-mono"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">Email</label>
 <input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 placeholder="email@example.com"
 className="w-full rounded-xl border border-emerald-200/80 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
 />
 </div>

 <div className="space-y-1.5 sm:col-span-2">
 <label className="text-xs font-bold text-slate-700">Pekerjaan</label>
 <input
 type="text"
 value={formData.pekerjaan}
 onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
 placeholder="Profesi atau instansi bekerja"
 className="w-full rounded-xl border border-emerald-200/80 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
 />
 </div>

 <div className="space-y-1.5 sm:col-span-2">
 <label className="text-xs font-bold text-slate-700">Alamat Tempat Tinggal</label>
 <textarea
 rows={3}
 value={formData.alamat}
 onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
 placeholder="Alamat lengkap domisili"
 className="w-full rounded-xl border border-emerald-200/80 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
 />
 </div>
 </div>
 </div>
 </MasterFormModal>

 {/* Delete Confirmation Dialog */}
 <MasterDeleteDialog
 isOpen={isDeleteOpen}
 onClose={() => setIsDeleteOpen(false)}
 onConfirm={() => selectedParent && deleteMutation.mutate(selectedParent.id)}
 isDeleting={deleteMutation.isPending}
 title="Hapus Data Orang Tua / Wali"
 description={`Apakah Anda yakin ingin menghapus data "${selectedParent?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
 />

 {/* Bulk Import Modal */}
 <CsvImportModal
 isOpen={isImportOpen}
 onClose={() => setIsImportOpen(false)}
 onImport={handleImportRows}
 title="Import Data Orang Tua / Wali"
 templateColumns={['nama', 'hubungan', 'nik', 'phone', 'email', 'pekerjaan', 'alamat']}
 sampleData={[
 {
 nama: 'Ahmad Dahlan',
 hubungan: 'Ayah',
 nik: '1371012345670001',
 phone: '081267891234',
 email: 'ahmad.dahlan@example.com',
 pekerjaan: 'Wiraswasta',
 alamat: 'Jl. Khatib Sulaiman No. 10, Padang',
 },
 {
 nama: 'Siti Aminah',
 hubungan: 'Ibu',
 nik: '1371012345670002',
 phone: '081267891235',
 email: 'siti.aminah@example.com',
 pekerjaan: 'Guru',
 alamat: 'Jl. Khatib Sulaiman No. 10, Padang',
 },
 ]}
 />
 </div>
 </PageContainer>
 )
}
