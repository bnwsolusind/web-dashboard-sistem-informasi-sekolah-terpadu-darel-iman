import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { LuSave, LuX } from 'react-icons/lu'
import { educationUnitService } from '../../services/educationUnitService'

// Schema Validasi Zod
const studentSchema = z.object({
  nisn: z.string().min(10, 'NISN minimal 10 digit').max(10, 'NISN maksimal 10 digit'),
  nama_lengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  jenis_kelamin: z.enum(['L', 'P'], { required_error: 'Pilih jenis kelamin' }),
  unit_pendidikan: z.string().min(1, 'Pilih unit pendidikan'),
  tingkat: z.string().min(1, 'Pilih tingkat/kelas'),
  status: z.enum(['Aktif', 'Nonaktif', 'Lulus', 'Pindah']),
})

export function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  units = [],
}) {
  const isEditMode = Boolean(initialData?.id)
  const [unitList, setUnitList] = useState(units)

  useEffect(() => {
    if (units && units.length > 0) {
      setUnitList(units)
    } else {
      educationUnitService.getDaftar().then((res) => {
        const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.data || []))
        if (Array.isArray(data) && data.length > 0) {
          setUnitList(data)
        }
      }).catch(() => {})
    }
  }, [units])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nisn: '',
      nama_lengkap: '',
      jenis_kelamin: 'L',
      unit_pendidikan: 'SDIT',
      tingkat: '1',
      status: 'Aktif',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        nisn: initialData.nisn || '',
        nama_lengkap: initialData.nama_lengkap || '',
        jenis_kelamin: initialData.jenis_kelamin || 'L',
        unit_pendidikan: initialData.unit_pendidikan || initialData.unit || 'SDIT',
        tingkat: initialData.tingkat || '1',
        status: initialData.status || 'Aktif',
      })
    } else {
      reset({
        nisn: '',
        nama_lengkap: '',
        jenis_kelamin: 'L',
        unit_pendidikan: 'SDIT',
        tingkat: '1',
        status: 'Aktif',
      })
    }
  }, [initialData, reset, isOpen])

  const handleFormSubmit = (data) => {
    onSubmit(data)
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-xl">
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</DialogTitle>
        <DialogDescription>
          Isi formulir berikut dengan data yang valid. Klik simpan setelah selesai.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 my-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* NISN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              NISN <span className="text-red-400">*</span>
            </label>
            <Input
              {...register('nisn')}
              placeholder="Contoh: 0012345678"
              maxLength={10}
              className={errors.nisn ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.nisn && (
              <p className="text-xs text-red-400 mt-1">{errors.nisn.message}</p>
            )}
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap <span className="text-red-400">*</span>
            </label>
            <Input
              {...register('nama_lengkap')}
              placeholder="Nama lengkap siswa"
              className={errors.nama_lengkap ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.nama_lengkap && (
              <p className="text-xs text-red-400 mt-1">{errors.nama_lengkap.message}</p>
            )}
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Jenis Kelamin <span className="text-red-400">*</span>
            </label>
            <select
              {...register('jenis_kelamin')}
              className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="L">Laki-laki (Ikhwan)</option>
              <option value="P">Perempuan (Akhwat)</option>
            </select>
          </div>

          {/* Unit Pendidikan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Unit Pendidikan <span className="text-red-400">*</span>
            </label>
            <select
              {...register('unit_pendidikan')}
              className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Pilih Unit Pendidikan</option>
              {unitList.map((u) => {
                const val = typeof u === 'string' ? u : (u.code || u.nama_unit || u.name || u.id || '')
                const lbl = typeof u === 'string' ? u : (u.nama_unit || u.name || u.code || val)
                return (
                  <option key={val || lbl} value={val}>
                    {lbl}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Tingkat */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tingkat <span className="text-red-400">*</span>
            </label>
            <select
              {...register('tingkat')}
              className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((t) => (
                <option key={t} value={String(t)}>
                  Kelas {t}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Status Siswa <span className="text-red-400">*</span>
            </label>
            <select
              {...register('status')}
              className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
              <option value="Lulus">Lulus</option>
              <option value="Pindah">Pindah</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            <LuX className="h-4 w-4 mr-1.5" /> Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <LuSave className="h-4 w-4 mr-1.5" />
            {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Siswa'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

StudentFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isSubmitting: PropTypes.bool,
}
