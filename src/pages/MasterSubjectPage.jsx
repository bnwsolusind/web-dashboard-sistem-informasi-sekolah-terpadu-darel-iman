import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  BookOpen,
  CheckCircle,
  Trash2,
  RefreshCw,
  Eye,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  Square,
  Archive,
  Library,
  Save,
  Clock3,
  Target,
  ChartNoAxesColumn,
  CircleX,
  Printer,
} from 'lucide-react'
import { printCleanTable } from '../utils/printHelper'
import { subjectService } from '../services/subjectService'
import { masterKurikulumService } from '../services/masterKurikulumService'
import { educationUnitService } from '../services/educationUnitService'
import { getUnitJenjang } from './MasterCapaianPembelajaranPage'
import { ActionDropdown, AppBadge, AppButton, AppModal } from '../components/app'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useAuthStore } from '../stores/authStore'
import { isGlobalAccessManager } from '../auth/portalResolver'
import {
  MasterActionButton,
  MasterDataSection,
  MasterDataPage,
  MasterFilterSelect,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'

const KELOMPOK_LIST = ['Kelompok A', 'Kelompok B', 'Kekhasan SIT', 'Muatan Lokal', 'Al-Qur\'an/Tahfizh']
const KATEGORI_LIST = ['Wajib', 'Pilihan', 'Tahfizh/Diniyah', 'Ekstrakurikuler', 'Vokasi']

export default function MasterSubjectPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false }) {
  const queryClient = useQueryClient()

  // Filter States
  const [search, setSearch] = useState('')
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('')
  const [selectedKurikulumFilter, setSelectedKurikulumFilter] = useState('')
  const [selectedKelompokFilter, setSelectedKelompokFilter] = useState('')
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState('')
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [denganSampahFilter, setDenganSampahFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage] = useState(15)

  // Selection & Bulk States
  const [selectedIds, setSelectedIds] = useState([])

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedForDetail, setSelectedForDetail] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    unit_pendidikan_id: '',
    kurikulum_id: '',
    kode_mapel: '',
    nama_mapel: '',
    nama_singkat: '',
    kelompok_mapel: 'Kelompok A',
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

  const canViewAllUnits = useMemo(() => {
    if (!user || userRoles.length === 0) return false
    return isGlobalAccessManager(userRoles)
  }, [user, userRoles])

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
    if (canViewAllUnits) {
      return allUnits
    }

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

  const { data: responseData = {}, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'master-subjects-list',
      page,
      perPage,
      search,
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
        search,
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

  // Mutations
  const simpanMutation = useMutation({
    mutationFn: (payload) => {
      if (selectedForEdit) {
        return subjectService.ubah({ id: selectedForEdit.id, payload })
      }
      return subjectService.tambah(payload)
    },
    onSuccess: (res) => {
      Swal.fire('Berhasil', res.message || 'Data mata pelajaran berhasil disimpan.', 'success')
      setIsFormModalOpen(false)
      setSelectedForEdit(null)
      queryClient.invalidateQueries(['master-subjects-list'])
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gagal menyimpan data mata pelajaran.'
      Swal.fire('Error', msg, 'error')
    },
  })

  const hapusMutation = useMutation({
    mutationFn: (id) => subjectService.hapus(id),
    onSuccess: (res) => {
      Swal.fire('Terhapus', res.message || 'Mata pelajaran berhasil dihapus.', 'success')
      queryClient.invalidateQueries(['master-subjects-list'])
    },
    onError: (err) => {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal menghapus mata pelajaran.', 'error')
    },
  })

  const pulihkanMutation = useMutation({
    mutationFn: (id) => subjectService.pulihkan(id),
    onSuccess: (res) => {
      Swal.fire('Dipulihkan', res.message || 'Mata pelajaran berhasil dipulihkan.', 'success')
      queryClient.invalidateQueries(['master-subjects-list'])
    },
  })

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }) => subjectService.bulkStatus(ids, status),
    onSuccess: (res) => {
      Swal.fire('Berhasil', res.message || 'Status berhasil diperbarui secara massal.', 'success')
      setSelectedIds([])
      queryClient.invalidateQueries(['master-subjects-list'])
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => subjectService.bulkDelete(ids),
    onSuccess: (res) => {
      Swal.fire('Berhasil', res.message || 'Data berhasil dihapus secara massal.', 'success')
      setSelectedIds([])
      queryClient.invalidateQueries(['master-subjects-list'])
    },
  })

  const items = responseData.data || []
  const meta = responseData.meta || {}
  const stats = responseData.statistik || { total: 0, aktif: 0, tidak_aktif: 0, terhapus: 0 }
  const archiveCount = Number(stats.tidak_aktif || 0) + Number(stats.terhapus || 0)
  const activePercent = Number(stats.total) > 0
    ? Math.round((Number(stats.aktif || 0) / Number(stats.total)) * 100)
    : 0

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
      kelompok_mapel: 'Kelompok A',
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
    setSelectedForEdit(row)
    setFormData({
      unit_pendidikan_id: row.unit_pendidikan_id || '',
      kurikulum_id: row.kurikulum_id || '',
      kode_mapel: row.kode_mapel || row.code || '',
      nama_mapel: row.nama_mapel || row.name || '',
      nama_singkat: row.nama_singkat || '',
      kelompok_mapel: row.kelompok_mapel || 'Kelompok A',
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
      Swal.fire('Peringatan', 'Kode dan Nama Mata Pelajaran wajib diisi.', 'warning')
      return
    }
    simpanMutation.mutate(formData)
  }

  const handleExportExcel = async () => {
    try {
       const response = await subjectService.exportExcel({
         search,
        unit_pendidikan_id: selectedUnitFilter,
        kurikulum_id: selectedKurikulumFilter,
        kelompok_mapel: selectedKelompokFilter,
        kategori: selectedKategoriFilter,
        jenjang: selectedJenjangFilter,
        status: selectedStatusFilter,
      })

       const blob = new Blob([response.data], { type: response.headers?.['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
       const url = window.URL.createObjectURL(blob)
       const a = document.createElement('a')
       a.href = url
       a.download = `master_mata_pelajaran_${new Date().toISOString().slice(0, 10)}.xlsx`
       a.click()
       window.URL.revokeObjectURL(url)
       Swal.fire('Ekspor Berhasil', 'Data mata pelajaran berhasil diekspor.', 'success')
    } catch {
      Swal.fire('Gagal', 'Gagal mendownload data ekspor Excel.', 'error')
    }
  }

  const handleExportPdf = async () => {
    try {
       const response = await subjectService.exportPdf({
        search,
        unit_pendidikan_id: selectedUnitFilter,
        kurikulum_id: selectedKurikulumFilter,
        kelompok_mapel: selectedKelompokFilter,
        kategori: selectedKategoriFilter,
        jenjang: selectedJenjangFilter,
        status: selectedStatusFilter,
      })
       const blob = new Blob([response.data], { type: response.headers?.['content-type'] || 'application/pdf' })
       const url = window.URL.createObjectURL(blob)
       const a = document.createElement('a')
       a.href = url
       a.download = `laporan_master_mata_pelajaran_${new Date().toISOString().slice(0, 10)}.pdf`
       a.click()
       window.URL.revokeObjectURL(url)
       Swal.fire('Ekspor PDF Berhasil', 'Laporan PDF berhasil diunduh.', 'success')
    } catch {
      Swal.fire('Gagal', 'Gagal mencetak dokumen PDF.', 'error')
    }
  }

  const handleImportSubmit = async (e) => {
    e.preventDefault()
    if (!importFile) {
      Swal.fire('Peringatan', 'Pilih file Excel/CSV terlebih dahulu.', 'warning')
      return
    }
    const form = new FormData()
    form.append('file', importFile)

    try {
      const res = await subjectService.importFile(form)
      Swal.fire('Impor Berhasil', res.message || 'Data berhasil diimpor.', 'success')
      setIsImportModalOpen(false)
      setImportFile(null)
      queryClient.invalidateQueries(['master-subjects-list'])
    } catch (err) {
      Swal.fire('Gagal Impor', err.response?.data?.message || 'Proses impor gagal.', 'error')
    }
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setIsImportModalOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={handleExportExcel} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah Mata Pelajaran" onClick={handleOpenFormTambah} />
    </div>
  )

  const shouldHideHeader = embedded || hidePageHeader

  return (
    <PageContainer maxW="7xl">
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
        onDownload={() => {
          if (handleExportPdf) {
            handleExportPdf()
          } else {
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
              filename: 'laporan_master_mata_pelajaran.pdf',
            })
          }
        }}
      />
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Mata Pelajaran' }]} />
      )}
      <MasterDataPage
        className="education-unit-page subject-master-page"
        hideBreadcrumb={embedded || hideBreadcrumb}
      >
      {/* PAGE HEADER */}
      {!shouldHideHeader && (
        <MasterPageHeader
          tone="brand"
          icon={BookOpen}
          title="Master Mata Pelajaran"
          description="Kelola referensi mata pelajaran untuk kurikulum, jadwal, penilaian, dan rapor."
          actions={pageActions}
        />
      )}

      {/* KPI STATISTIC CARDS */}
      <MasterStatsGrid className="education-unit-kpis">
        <MasterStatCard icon={Library} label="Total Mata Pelajaran" value={stats.total || 0} description="Terdaftar di sistem" variant="success" delay={60} loading={isLoading} />
        <MasterStatCard icon={CheckCircle} label="Mata Pelajaran Aktif" value={stats.aktif || 0} description="Siap digunakan saat ini" variant="success" delay={110} loading={isLoading} />
        <MasterStatCard icon={CircleX} label="Arsip / Nonaktif" value={archiveCount} description="Nonaktif atau terhapus" variant="warning" delay={160} loading={isLoading} />
      </MasterStatsGrid>

      <MasterDataSection
        title="Daftar Mata Pelajaran"
        description="Data mata pelajaran sesuai filter dan kewenangan pengguna."
        countLabel={`${Number(meta.total ?? stats.total ?? 0).toLocaleString('id-ID')} mapel`}
        actions={pageActions}
        stackedFilters={true}
        search={{
          value: search,
          onValueChange: (value) => { setSearch(value); setPage(1) },
          placeholder: 'Cari nama atau kode mata pelajaran...',
          'aria-label': 'Cari nama atau kode mata pelajaran',
        }}
        filters={(
          <>
            <MasterFilterSelect
              value={selectedUnitFilter}
              onChange={(event) => {
                const unitId = event.target.value
                const matchingKurikulum = resolveKurikulumForUnit(unitId)
                setSelectedUnitFilter(unitId)
                if (!matchingKurikulum.some((item) => String(item.id) === String(selectedKurikulumFilter))) setSelectedKurikulumFilter('')
                setPage(1)
              }}
              disabled={!canViewAllUnits && availableUnitOptions.length <= 1}
              aria-label="Filter unit pendidikan"
            >
              {canViewAllUnits && <option value="">Semua Unit</option>}
              {availableUnitOptions.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedKurikulumFilter} onChange={(event) => { setSelectedKurikulumFilter(event.target.value); setPage(1) }} aria-label="Filter kurikulum">
              <option value="">Semua Kurikulum</option>
              {availableKurikulumForFilter.map((kurikulum) => <option key={kurikulum.id} value={kurikulum.id}>{kurikulum.nama_kurikulum}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedKelompokFilter} onChange={(event) => { setSelectedKelompokFilter(event.target.value); setPage(1) }} aria-label="Filter kelompok mata pelajaran">
              <option value="">Semua Kelompok</option>
              {KELOMPOK_LIST.map((kelompok) => <option key={kelompok} value={kelompok}>{kelompok}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedKategoriFilter} onChange={(event) => { setSelectedKategoriFilter(event.target.value); setPage(1) }} aria-label="Filter kategori mata pelajaran">
              <option value="">Semua Kategori</option>
              {KATEGORI_LIST.map((kategori) => <option key={kategori} value={kategori}>{kategori}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedJenjangFilter} onChange={(event) => { setSelectedJenjangFilter(event.target.value); setPage(1) }} aria-label="Filter jenjang mata pelajaran">
              <option value="">Semua Jenjang</option>
              {['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK'].map((jenjang) => <option key={jenjang} value={jenjang}>{jenjang}</option>)}
            </MasterFilterSelect>
            <MasterFilterSelect value={selectedStatusFilter} onChange={(event) => { setSelectedStatusFilter(event.target.value); setPage(1) }} aria-label="Filter status mata pelajaran">
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="tidak_aktif">Nonaktif</option>
            </MasterFilterSelect>
            <MasterFilterSelect value={denganSampahFilter} onChange={(event) => { setDenganSampahFilter(event.target.value); setPage(1) }} aria-label="Filter cakupan data">
              <option value="">Data Aktif</option>
              <option value="1">Termasuk Arsip</option>
            </MasterFilterSelect>
          </>
        )}
        onReset={resetFilters}
        resetDisabled={!search && selectedUnitFilter === (canViewAllUnits ? '' : effectiveUserUnitId) && !selectedKurikulumFilter && !selectedKelompokFilter && !selectedKategoriFilter && !selectedJenjangFilter && !selectedStatusFilter && !denganSampahFilter}
        actions={selectedIds.length > 0 ? (
          <>
            <AppBadge variant="info">{selectedIds.length} dipilih</AppBadge>
            <AppButton size="sm" variant="success" icon={CheckCircle} loading={bulkStatusMutation.isPending} onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: true })}>Aktifkan</AppButton>
            <AppButton size="sm" variant="secondary" icon={Archive} loading={bulkStatusMutation.isPending} onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: false })}>Nonaktifkan</AppButton>
            <AppButton
              size="sm"
              variant="destructive"
              icon={Trash2}
              loading={bulkDeleteMutation.isPending}
              onClick={() => {
                Swal.fire({
                  title: 'Hapus Massal?',
                  text: `Apakah Anda yakin ingin menghapus ${selectedIds.length} mata pelajaran terpilih?`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#e11d48',
                  confirmButtonText: 'Ya, Hapus Semua',
                  cancelButtonText: 'Batal',
                }).then((result) => {
                  if (result.isConfirmed) bulkDeleteMutation.mutate(selectedIds)
                })
              }}
            >
              Hapus
            </AppButton>
          </>
        ) : pageActions}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={!isLoading && !isError && items.length === 0}
        emptyTitle="Mata pelajaran tidak ditemukan"
        emptyDescription="Ubah kata pencarian atau reset filter untuk melihat data lainnya."
        pagination={{ meta, page, onPageChange: setPage }}
        ariaLabel="Data mata pelajaran"
      >
          <table className="w-full table-fixed text-left text-sm text-slate-600" aria-label="Daftar mata pelajaran">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:border-slate-700 dark:bg-slate-800/70">
              <tr>
                <th className="w-[5%] px-2 py-3 text-center">
                  <button onClick={toggleSelectAll} className="rounded text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600" aria-label={isAllSelected ? 'Batalkan pilih semua' : 'Pilih semua mata pelajaran'}>
                    {isAllSelected ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="w-[27%] px-3 py-3 font-bold">Identitas Mapel</th>
                <th className="hidden w-[21%] px-3 py-3 font-bold md:table-cell">Kurikulum & Unit</th>
                <th className="hidden w-[17%] px-3 py-3 font-bold lg:table-cell">Klasifikasi</th>
                <th className="hidden w-[13%] px-3 py-3 text-center font-bold xl:table-cell">Parameter</th>
                <th className="hidden w-[10%] px-2 py-3 text-center font-bold sm:table-cell">Status</th>
                <th className="w-[17%] px-2 py-3 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {items.map((row, index) => {
                  const isSelected = selectedIds.includes(row.id)
                  const subjectName = row.nama_mapel || row.name || 'Mata pelajaran'
                  const subjectColor = row.warna || '#0E5C44'
                  return (
                    <tr
                      key={row.id}
                      className={`ui-row transition-colors hover:bg-emerald-50/40 ${isSelected ? 'bg-emerald-50/60' : ''}`}
                      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                    >
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => toggleSelectRow(row.id)} className="rounded focus:outline-none focus:ring-2 focus:ring-emerald-600" aria-label={`${isSelected ? 'Batalkan pilihan' : 'Pilih'} ${row.nama_mapel || row.name}`}>
                          {isSelected ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4 text-slate-300" />}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                            style={{
                              color: subjectColor,
                              borderColor: `${subjectColor}33`,
                              backgroundColor: `${subjectColor}12`,
                            }}
                          >
                            <BookOpen className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-extrabold leading-5 text-slate-900 dark:text-white" title={subjectName}>
                              {subjectName}
                            </p>
                            <p className="truncate font-mono text-[9px] font-medium text-slate-400">
                              {row.kode_mapel || row.code} {row.nama_singkat ? `(${row.nama_singkat})` : ''}
                            </p>
                            <p className="mt-0.5 truncate text-[9px] text-slate-400 md:hidden">{row.kurikulum?.nama_kurikulum || 'Kurikulum Terpadu'} · {row.unit_pendidikan?.name || 'Semua Unit'}</p>
                            <p className={`mt-0.5 text-[9px] font-bold sm:hidden ${row.status ? 'text-emerald-700' : 'text-rose-600'}`}>• {row.status ? 'Aktif' : 'Nonaktif'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 md:table-cell">
                        <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                          {row.kurikulum?.nama_kurikulum || 'Kurikulum Terpadu'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {row.unit_pendidikan?.name || 'Semua Unit'}
                        </p>
                      </td>
                      <td className="hidden px-3 py-3 lg:table-cell">
                        <AppBadge variant="neutral" className="mb-1">
                          {row.kelompok_mapel || 'Kelompok A'}
                        </AppBadge>
                        <AppBadge variant="success" className="block w-fit">
                          {row.kategori || 'Wajib'}
                        </AppBadge>
                      </td>
                      <td className="hidden px-3 py-3 text-center xl:table-cell">
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{row.jam_pelajaran || 2} JP · KKM {row.kkm || 75}</p>
                        <p className="mt-1 text-[9px] font-medium text-slate-400">{row.bobot_pengetahuan || 40}/{row.bobot_keterampilan || 40}/{row.bobot_sikap || 20}</p>
                      </td>
                      <td className="hidden px-2 py-3 text-center sm:table-cell">
                        <AppBadge variant={row.status ? 'success' : 'neutral'} dot>{row.status ? 'Aktif' : 'Nonaktif'}</AppBadge>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="inline-flex justify-center">
                          <ActionDropdown
                            onView={() => handleOpenDetail(row)}
                            onEdit={!row.is_deleted ? () => handleOpenFormEdit(row) : undefined}
                            extraItems={row.is_deleted ? [{
                              label: 'Pulihkan Data',
                              icon: <RefreshCw className="h-4 w-4 text-emerald-600" />,
                              onClick: () => pulihkanMutation.mutate(row.id),
                            }] : []}
                            onDelete={!row.is_deleted ? () => {
                              Swal.fire({
                                title: 'Hapus Mata Pelajaran?',
                                text: `Hapus mapel ${row.nama_mapel || row.name}?`,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#e11d48',
                                confirmButtonText: 'Ya, Hapus',
                              }).then((result) => {
                                if (result.isConfirmed) hapusMutation.mutate(row.id)
                              })
                            } : undefined}
                          />
                        </span>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
      </MasterDataSection>

      {/* FORM MODAL (CREATE & EDIT) */}
      <AppModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        icon={BookOpen}
        title={selectedForEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
        description="Lengkapi referensi kurikulum, klasifikasi, dan parameter penilaian."
        maxWidth="max-w-2xl"
      >
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Unit Pendidikan <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.unit_pendidikan_id}
                    onChange={(e) => {
                      const newUnitId = e.target.value
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
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">Pilih Unit Pendidikan</option>
                    {unitDropdown.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Kurikulum <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.kurikulum_id}
                    onChange={(e) => setFormData({ ...formData, kurikulum_id: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">Pilih Kurikulum</option>
                    {availableKurikulumForForm.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kurikulum} {k.jenjang ? `(${k.jenjang})` : (k.kode_kurikulum ? `(${k.kode_kurikulum})` : '')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Kode Mapel <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.kode_mapel}
                    onChange={(e) => setFormData({ ...formData, kode_mapel: e.target.value })}
                    required
                    placeholder="Contoh: MP-SD-PAI"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Nama Mapel <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.nama_mapel}
                    onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                    required
                    placeholder="Contoh: Pendidikan Agama Islam"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Nama Singkat / Singkatan</label>
                  <input
                    type="text"
                    value={formData.nama_singkat}
                    onChange={(e) => setFormData({ ...formData, nama_singkat: e.target.value })}
                    placeholder="Contoh: PAI"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Kelompok Mapel</label>
                  <select
                    value={formData.kelompok_mapel}
                    onChange={(e) => setFormData({ ...formData, kelompok_mapel: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {KELOMPOK_LIST.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {KATEGORI_LIST.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Alokasi JP per Minggu</label>
                  <input
                    type="number"
                    value={formData.jam_pelajaran}
                    onChange={(e) => setFormData({ ...formData, jam_pelajaran: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">KKM Minimum</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.kkm}
                    onChange={(e) => setFormData({ ...formData, kkm: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Bobot Pengetahuan (%)</label>
                  <input
                    type="number"
                    value={formData.bobot_pengetahuan}
                    onChange={(e) => setFormData({ ...formData, bobot_pengetahuan: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Bobot Keterampilan (%)</label>
                  <input
                    type="number"
                    value={formData.bobot_keterampilan}
                    onChange={(e) => setFormData({ ...formData, bobot_keterampilan: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Bobot Sikap (%)</label>
                  <input
                    type="number"
                    value={formData.bobot_sikap}
                    onChange={(e) => setFormData({ ...formData, bobot_sikap: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="ui-button rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={simpanMutation.isPending}
                  className="ui-button rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-800/20 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="mr-2 inline h-4 w-4" />
                  {simpanMutation.isPending ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
      </AppModal>

      {/* DETAIL MODAL */}
      {selectedForDetail && (
        <AppModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          icon={Eye}
          title="Detail Mata Pelajaran"
          description={selectedForDetail.nama_mapel || selectedForDetail.name}
          maxWidth="max-w-xl"
        >
            <div className="space-y-3">
              <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-bold text-slate-500">Kode Mapel</span>
                  <span className="font-mono font-extrabold text-slate-800">{selectedForDetail.kode_mapel || selectedForDetail.code}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-bold text-slate-500">Nama Mapel</span>
                  <span className="font-black text-slate-800">{selectedForDetail.nama_mapel || selectedForDetail.name}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-bold text-slate-500">Kurikulum</span>
                  <span className="font-bold text-slate-700">{selectedForDetail.kurikulum?.nama_kurikulum || '-'}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-bold text-slate-500">Unit Pendidikan</span>
                  <span className="font-bold text-slate-700">{selectedForDetail.unit_pendidikan?.name || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-800">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Alokasi JP</p>
                    <p className="mt-0.5 text-base font-black text-emerald-800">{selectedForDetail.jam_pelajaran || 2} JP / Minggu</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-800">
                    <Target className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">KKM Minimum</p>
                    <p className="mt-0.5 text-base font-black text-emerald-800">{selectedForDetail.kkm || 75}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4">
                <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                  <ChartNoAxesColumn className="h-4 w-4 text-emerald-800" />
                  Bobot Penilaian Rapor
                </p>
                <div className="flex flex-col gap-2 text-xs font-bold text-slate-700 sm:flex-row sm:justify-between">
                  <span>Pengetahuan: {selectedForDetail.bobot_pengetahuan || 40}%</span>
                  <span>Keterampilan: {selectedForDetail.bobot_keterampilan || 40}%</span>
                  <span>Sikap: {selectedForDetail.bobot_sikap || 20}%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="ui-button rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
        </AppModal>
      )}

      {/* STATISTICS MODAL */}
      <AppModal
        isOpen={isStatisticsModalOpen}
        onClose={() => setIsStatisticsModalOpen(false)}
        icon={ChartNoAxesColumn}
        title="Statistik Mata Pelajaran"
        description="Ringkasan berdasarkan filter aktif."
        maxWidth="max-w-2xl"
      >
            <div className="space-y-5">
              <MasterStatsGrid className="education-unit-kpis">
                <MasterStatCard icon={Library} label="Total" value={stats.total || 0} description="Mata pelajaran" variant="success" />
                <MasterStatCard icon={CheckCircle} label="Aktif" value={stats.aktif || 0} description={`${activePercent}% dari total`} variant="success" />
                <MasterStatCard icon={CircleX} label="Arsip" value={archiveCount} description="Nonaktif / terhapus" variant="warning" />
              </MasterStatsGrid>
              <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Tingkat keaktifan</span><span>{activePercent}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-200" style={{ width: `${activePercent}%` }} />
                </div>
              </section>
            </div>
      </AppModal>

      {/* IMPORT MODAL */}
      <AppModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        icon={Upload}
        title="Impor Data Mata Pelajaran"
        description="Unggah file Excel atau CSV sesuai format data mata pelajaran."
        maxWidth="max-w-md"
      >
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                <FileSpreadsheet className="mx-auto mb-2 h-8 w-8 text-emerald-800" />
                <p className="font-bold text-slate-700">Pilih file Excel (.xlsx) / CSV</p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="mt-2 text-xs w-full"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => Swal.fire('Format Impor', 'Header kolom: kode_mapel, nama_mapel, kelompok_mapel, kategori, jam_pelajaran, kkm.', 'info')}
                  className="ui-button text-left text-xs font-semibold text-emerald-800 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  Download Template
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="ui-button rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!importFile}
                    className="ui-button inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-800/20 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4" />
                    Upload & Impor
                  </button>
                </div>
              </div>
            </form>
      </AppModal>

    </MasterDataPage>
    </PageContainer>
  )
}
