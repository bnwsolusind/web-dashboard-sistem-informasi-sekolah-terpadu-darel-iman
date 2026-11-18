import React, { useState, useMemo } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { useQuery } from '@tanstack/react-query'
import Swal from '@/components/ui/compat/swal-heroui'
import { educationUnitService } from '../services/educationUnitService'
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from '../hooks/useStudentCrud'
import { DataTable } from '../components/common/DataTable'
import { StudentFormModal } from '../components/crud/StudentFormModal'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuUserCheck,
  LuUsers,
  LuGraduationCap,
  LuSchool,
  LuRefreshCw,
} from 'react-icons/lu'

export default function StudentCrudPage() {
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [localList, setLocalList] = useState([])

  // React Query Hooks
  const queryParams = useMemo(() => ({ search, unit: unitFilter, status: statusFilter }), [search, unitFilter, statusFilter])
  const { data: apiData, isLoading, isFetching, refetch } = useStudents(queryParams)
  const { data: unitsRes } = useQuery({
    queryKey: ['education-units-student-crud'],
    queryFn: () => educationUnitService.getDaftar({ per_page: 100 }),
  })
  const educationUnits = useMemo(() => {
    const list = unitsRes?.data?.data || unitsRes?.data || (Array.isArray(unitsRes) ? unitsRes : [])
    return Array.isArray(list) ? list : []
  }, [unitsRes])
  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent()
  const deleteMutation = useDeleteStudent()

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  // Combine API data with local optimistic updates.
  const displayData = useMemo(() => {
    const rawList = Array.isArray(apiData?.data) ? apiData.data : localList
    return rawList.filter((item) => {
      const matchSearch = search === '' ||
        item.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
        item.nisn.includes(search)
      const matchUnit = unitFilter === '' || item.unit_pendidikan === unitFilter
      const matchStatus = statusFilter === '' || item.status === statusFilter
      return matchSearch && matchUnit && matchStatus
    })
  }, [apiData?.data, localList, search, unitFilter, statusFilter])

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingStudent(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (student) => {
    setEditingStudent(student)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (editingStudent) {
        // UPDATE Flow
        await updateMutation.mutateAsync({ id: editingStudent.id, data: formData })
        setLocalList((prev) =>
          prev.map((item) => (item.id === editingStudent.id ? { ...item, ...formData } : item))
        )
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Update!',
          text: 'Data siswa berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        // CREATE Flow
        const newRecord = {
          id: String(Date.now()),
          ...formData,
          created_at: new Date().toISOString().split('T')[0],
        }
        await createMutation.mutateAsync(formData).catch(() => {})
        setLocalList((prev) => [newRecord, ...prev])
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Ditambah!',
          text: 'Siswa baru berhasil didaftarkan.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      setIsModalOpen(false)
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err?.response?.data?.message || 'Terjadi kesalahan sistem',
      })
    }
  }

  const handleDelete = (student) => {
    Swal.fire({
      title: 'Hapus Data Siswa?',
      text: `Apakah Anda yakin ingin menghapus "${student.nama_lengkap}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#0f172a',
      color: '#f8fafc',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteMutation.mutateAsync(student.id).catch(() => {})
          setLocalList((prev) => prev.filter((item) => item.id !== student.id))
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Data siswa telah dihapus.',
            timer: 1500,
            showConfirmButton: false,
          })
        } catch {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error')
        }
      }
    })
  }

  // TanStack Table Column Definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'nisn',
        header: 'NISN',
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'nama_lengkap',
        header: 'Nama Siswa',
        cell: (info) => (
          <div className="font-semibold text-slate-100">{info.getValue()}</div>
        ),
      },
      {
        accessorKey: 'jenis_kelamin',
        header: 'L/P',
        cell: (info) => (
          <Badge variant={info.getValue() === 'L' ? 'info' : 'warning'}>
            {info.getValue() === 'L' ? 'Laki-laki' : 'Perempuan'}
          </Badge>
        ),
      },
      {
        accessorKey: 'unit_pendidikan',
        header: 'Unit',
        cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
      },
      {
        accessorKey: 'tingkat',
        header: 'Tingkat',
        cell: (info) => (
          <span className="text-sm font-medium text-slate-300">Kelas {info.getValue()}</span>
        ),
      },
      {
        id: 'orang_tua',
        header: 'Orang Tua / Wali',
        cell: ({ row }) => {
          const item = row.original
          const meta = item.metadata || {}
          let parentName = ''
          let relationshipLabel = ''

          if (meta.nama_ayah || meta.ayah?.nama || meta.orang_tua?.nama_ayah || item.nama_ayah) {
            parentName = meta.nama_ayah || meta.ayah?.nama || meta.orang_tua?.nama_ayah || item.nama_ayah
            relationshipLabel = 'Ayah'
          } else if (meta.nama_ibu || meta.ibu?.nama || meta.orang_tua?.nama_ibu || item.nama_ibu) {
            parentName = meta.nama_ibu || meta.ibu?.nama || meta.orang_tua?.nama_ibu || item.nama_ibu
            relationshipLabel = 'Ibu'
          } else if (meta.nama_wali || meta.wali?.nama || meta.orang_tua?.nama_wali || item.nama_wali) {
            parentName = meta.nama_wali || meta.wali?.nama || meta.orang_tua?.nama_wali || item.nama_wali
            relationshipLabel = 'Wali'
          } else if (typeof meta.orang_tua === 'string' && meta.orang_tua.trim()) {
            parentName = meta.orang_tua.trim()
          } else if (typeof item.orang_tua === 'string' && item.orang_tua.trim()) {
            parentName = item.orang_tua.trim()
          } else if (meta.nama_ortu || meta.nama_orang_tua || meta.parent_name) {
            parentName = meta.nama_ortu || meta.nama_orang_tua || meta.parent_name
          } else if (item.nama_ortu || item.nama_orang_tua || item.parent_name) {
            parentName = item.nama_ortu || item.nama_orang_tua || item.parent_name
          } else if (item.parent?.full_name || item.parent?.name) {
            parentName = item.parent.full_name || item.parent.name
          }

          const ortuText = parentName
            ? (relationshipLabel ? `${parentName} (${relationshipLabel})` : parentName)
            : '-'

          const hpText =
            meta.hp_ayah || meta.telfon_ayah || meta.nomor_wa_ayah || meta.ayah?.hp ||
            meta.hp_ibu || meta.telfon_ibu || meta.nomor_wa_ibu || meta.ibu?.hp ||
            meta.hp_wali || meta.telfon_wali || meta.nomor_wa_wali || meta.wali?.hp ||
            meta.no_hp || item.parent?.phone || item.no_hp || '-'

          return (
            <div>
              <div className="font-semibold text-slate-200 text-xs">{ortuText}</div>
              <div className="text-[11px] text-slate-400 font-mono">{hpText}</div>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const val = info.getValue()
          const variantMap = {
            Aktif: 'success',
            Nonaktif: 'danger',
            Lulus: 'info',
            Pindah: 'warning',
          }
          return <Badge variant={variantMap[val] || 'default'}>{val}</Badge>
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const student = row.original
          return (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenEditModal(student)}
                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
                title="Edit Data"
              >
                <LuPencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(student)}
                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                title="Hapus Data"
              >
                <LuTrash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <LuGraduationCap className="h-7 w-7 text-emerald-400" />
            Manajemen Data Siswa (React CRUD)
          </h1>
          <p className="text-sm text-slate-400">
            Arsitektur CRUD terpadu dengan React Query, Axios, TanStack Table, & shadcn/ui.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <LuRefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button onClick={handleOpenCreateModal} size="sm">
            <LuPlus className="h-4 w-4 mr-1.5" />
            Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded-xl">
              <LuUsers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Siswa</p>
              <h3 className="text-xl font-bold text-white">{displayData.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-950/60 text-blue-400 border border-blue-800/60 rounded-xl">
              <LuUserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Status Aktif</p>
              <h3 className="text-xl font-bold text-white">
                {displayData.filter((s) => s.status === 'Aktif').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-amber-950/60 text-amber-400 border border-amber-800/60 rounded-xl">
              <LuSchool className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Unit SDIT</p>
              <h3 className="text-xl font-bold text-white">
                {displayData.filter((s) => s.unit_pendidikan === 'SDIT').length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-purple-950/60 text-purple-400 border border-purple-800/60 rounded-xl">
              <LuGraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">SMP / SMA</p>
              <h3 className="text-xl font-bold text-white">
                {displayData.filter((s) => ['SMPIT', 'SMAIT'].includes(s.unit_pendidikan)).length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Terpadu Siswa</CardTitle>
          <CardDescription>
            Gunakan fitur pencarian global, pengurutan kolom, dan pagination otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={displayData}
            isLoading={isLoading}
            searchPlaceholder="Cari berdasarkan nama atau NISN..."
            searchValue={search}
            onSearchChange={setSearch}
            filterComponent={
              <>
                <CustomSelect
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="h-10 rounded-lg border border-slate-800 bg-slate-950/60 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Semua Unit</option>
                  {educationUnits.map((u) => (
                    <option key={u.id} value={u.code || u.name}>
                      {u.name}
                    </option>
                  ))}
                </CustomSelect>

                <CustomSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-lg border border-slate-800 bg-slate-950/60 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Pindah">Pindah</option>
                </CustomSelect>
              </>
            }
          />
        </CardContent>
      </Card>

      {/* Modal Create & Edit Form */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
