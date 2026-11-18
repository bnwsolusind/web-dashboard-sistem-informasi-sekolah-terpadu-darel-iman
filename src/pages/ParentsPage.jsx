import React, { useMemo, useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
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
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppDataTable from '../components/app/AppDataTable'
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
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden mb-6">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Data Orang Tua &amp; Wali
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Direktori Keluarga
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
                  Kelola direktori kontak, data pekerjaan, dan relasi orang tua/wali siswa terintegrasi secara komprehensif.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Pangkalan Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Statistik KPI Modern */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
          <div className="relative overflow-hidden rounded-[20px] border-2 border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Orang Tua / Wali</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                <Users className="size-4.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {Number(summary.total ?? parentList.length).toLocaleString('id-ID')}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Tercatat dalam pangkalan data</p>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border-2 border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400">Relasi Ayah Kandung</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white shadow-sm border border-sky-300/40">
                <UserCheck className="size-4.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {Number(summary.ayah ?? 0).toLocaleString('id-ID')}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Tercatat dalam pangkalan data</p>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border-2 border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">Relasi Ibu Kandung</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white shadow-sm border border-amber-300/40">
                <HeartHandshake className="size-4.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {Number(summary.ibu ?? 0).toLocaleString('id-ID')}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Tercatat dalam pangkalan data</p>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border-2 border-teal-300/70 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white dark:border-teal-700/50 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">Relasi Wali Siswa</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-teal-300/40">
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
          iconClassName="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border border-emerald-300/40 text-white shadow-emerald-600/30"
          countLabel={`${Number(meta.total || parentList.length).toLocaleString('id-ID')} orang`}
          actions={
            <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
              {/* Cetak Datatable Button - Vivid Indigo / Violet Squircle */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Cetak Data Laporan (Print)"
                  aria-label="Cetak Data Laporan"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border border-indigo-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Printer className="size-5 text-white" strokeWidth={2.2} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Cetak Data
                </div>
              </div>

              {/* Import Button (Vivid Sky Blue / Blue Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Import Data Orang Tua"
                  aria-label="Import Data Orang Tua"
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white border border-sky-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  onClick={() => setIsImportOpen(true)}
                >
                  <Upload className="size-5 text-white" strokeWidth={2.2} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Import Data
                </div>
              </div>

              {/* Export Button (Vivid Amber / Orange Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Export Data Orang Tua"
                  aria-label="Export Data Orang Tua"
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white border border-amber-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  onClick={handleExport}
                >
                  <Download className="size-5 text-white" strokeWidth={2.2} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Export Data
                </div>
              </div>

              {/* Tambah Button (Vivid Emerald / Teal Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Tambah Orang Tua / Wali Baru"
                  aria-label="Tambah Orang Tua / Wali Baru"
                  className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border border-emerald-300/40 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                  onClick={handleOpenCreate}
                >
                  <Plus className="size-5 text-white" strokeWidth={2.5} />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Tambah Orang Tua
                </div>
              </div>
            </div>
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
                <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
                  <tr className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent">
                    <th className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider">NAMA ORANG TUA / WALI</th>
                    <th className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider">HUBUNGAN</th>
                    <th className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider">NAMA SISWA &amp; KELAS</th>
                    <th className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider">PEKERJAAN</th>
                    <th className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider">NO. HANDPHONE</th>
                    <th className="py-3.5 px-4 text-center font-extrabold text-[11px] uppercase tracking-wider w-24">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-medium text-slate-700 dark:text-slate-200">
                  {parentList.map((parent) => (
                    <tr key={parent.id} className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <PersonIdentityCell
                          src={parent.photo_url || parent.avatar_url || parent.foto}
                          name={parent.nama}
                          subtitle={parent.email !== '-' ? parent.email : (parent.nik !== '-' ? `NIK: ${parent.nik}` : '')}
                        />
                      </td>
                      <td className="py-3.5 px-4">
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
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{parent.namaSiswa}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {parent.kelasSiswa} • {parent.unitPendidikan}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          <span>{parent.pekerjaan}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{parent.noHp}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex justify-center">
                          <ActionDropdown
                            onView={() => {
                              setSelectedParent(parent)
                              setIsDetailOpen(true)
                            }}
                            onEdit={() => handleOpenEdit(parent)}
                            onDelete={() => handleOpenDelete(parent)}
                          />
                        </span>
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
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
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
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">Siswa Terkait</p>
                  <p className="mt-1 font-bold text-slate-800">{selectedParent.namaSiswa}</p>
                  <p className="text-xs text-slate-500">{selectedParent.kelasSiswa} • {selectedParent.unitPendidikan}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">No. Handphone / WA</p>
                  <p className="mt-1 font-bold text-emerald-800 font-mono">{selectedParent.noHp}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Pekerjaan</p>
                  <p className="mt-1 font-semibold text-slate-800">{selectedParent.pekerjaan}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
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
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hubungan Keluarga *</label>
                <CustomSelect
                  value={formData.hubungan}
                  onChange={(e) => setFormData({ ...formData, hubungan: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">No. Handphone / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812xxxxxxx"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Pekerjaan</label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  placeholder="Profesi atau instansi bekerja"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Alamat Tempat Tinggal</label>
                <textarea
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat lengkap domisili"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
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
