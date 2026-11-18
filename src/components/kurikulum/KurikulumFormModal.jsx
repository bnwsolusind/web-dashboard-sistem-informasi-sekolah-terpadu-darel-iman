import React, { useState, useEffect } from 'react'
import { X, BookOpen, Save, RefreshCw, AlertCircle, Building2, Calendar, Layers, GraduationCap, CheckCircle2 } from 'lucide-react'
import { api } from '../../services/api'
import AppModal from '../app/AppModal'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/text-area'
import { codeGeneratorService } from '../../services/codeGeneratorService'

const JENIS_OPTIONS = ['SIT', 'Merdeka', 'Nasional', 'Pesantren', 'Lokal', 'Lainnya']
const JENJANG_OPTIONS = ['TK', 'PAUD', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'Pesantren']

export default function KurikulumFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  availableUnitOptions = [],
  canViewAllUnits = true,
}) {
  const [formData, setFormData] = useState({
    kode_kurikulum: '',
    nama_kurikulum: '',
    jenis_kurikulum: 'SIT',
    unit_pendidikan_id: '',
    jenjang: 'SD',
    tahun_ajaran_id: '',
    semester_id: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status: true,
    deskripsi: '',
  })

  const [units, setUnits] = useState([])
  const [tahunAjarans, setTahunAjarans] = useState([])
  const [semesters, setSemesters] = useState([])
  const [errors, setErrors] = useState({})

  const displayUnits = (availableUnitOptions && availableUnitOptions.length > 0) ? availableUnitOptions : units

  const selectedUnitObj = React.useMemo(() => {
    if (!formData.unit_pendidikan_id) return null
    return displayUnits.find((u) => String(u.id) === String(formData.unit_pendidikan_id)) || null
  }, [formData.unit_pendidikan_id, displayUnits])

  const detectedJenjang = React.useMemo(() => {
    if (!selectedUnitObj) return ''
    return getJenjangFromUnit(selectedUnitObj)
  }, [selectedUnitObj])

  const availableJenjangModalOptions = React.useMemo(() => {
    if (detectedJenjang) {
      const matched = JENJANG_OPTIONS.filter((j) => j.toLowerCase() === detectedJenjang.toLowerCase())
      if (matched.length > 0) return matched
    }
    return JENJANG_OPTIONS
  }, [detectedJenjang])

  // Fetch Dropdown options for Units & Tahun Ajaran when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  // Populate form data on Edit or Reset on Create
  useEffect(() => {
    if (initialData) {
      setFormData({
        kode_kurikulum: initialData.kode_kurikulum || '',
        nama_kurikulum: initialData.nama_kurikulum || '',
        jenis_kurikulum: initialData.jenis_kurikulum || 'SIT',
        unit_pendidikan_id: initialData.unit_pendidikan_id || '',
        jenjang: initialData.jenjang || 'SD',
        tahun_ajaran_id: initialData.tahun_ajaran_id || '',
        semester_id: initialData.semester_id || '',
        tanggal_mulai: initialData.tanggal_mulai || '',
        tanggal_selesai: initialData.tanggal_selesai || '',
        status: initialData.status !== undefined ? initialData.status : true,
        deskripsi: initialData.deskripsi || '',
      })
    } else {
      setFormData({
        kode_kurikulum: '',
        nama_kurikulum: '',
        jenis_kurikulum: 'SIT',
        unit_pendidikan_id: displayUnits[0]?.id || '',
        jenjang: 'SD',
        tahun_ajaran_id: tahunAjarans[0]?.id || '',
        semester_id: '',
        tanggal_mulai: `${new Date().getFullYear()}-07-15`,
        tanggal_selesai: `${new Date().getFullYear() + 1}-06-30`,
        status: true,
        deskripsi: '',
      })
      codeGeneratorService.preview('curriculum_code')
        .then(res => {
          if (res?.preview_code) {
            setFormData(prev => ({ ...prev, kode_kurikulum: res.preview_code }))
          }
        })
        .catch(() => { })
    }
    setErrors({})
  }, [initialData, isOpen, displayUnits, tahunAjarans])

  const fetchOptions = async () => {
    try {
      // Fetch Education Units
      const resUnits = await api.get('/education-units')
      const unitList = resUnits.data?.data || resUnits.data || []
      setUnits(unitList)

      // Fetch Academic Years
      const resTA = await api.get('/master/tahun-ajaran/dropdown')
      const taList = resTA.data?.data || resTA.data || []
      setTahunAjarans(taList)
    } catch (err) {
      console.error('Gagal mengambil data referensi form kurikulum:', err)
    }
  }

  function getJenjangFromUnit(unit) {
    if (!unit) return ''
    const str = `${unit.code || ''} ${unit.level || ''} ${unit.name || ''} ${unit.nama || ''} ${unit.tingkat || ''}`.toUpperCase()
    if (str.includes('TAUD') || str.includes('PAUD')) return 'PAUD'
    if (str.includes('TK')) return 'TK'
    if (str.includes('MIT') || str.includes(' MI ') || str.endsWith(' MI') || str.startsWith('MI ')) return 'MI'
    if (str.includes('SD')) return 'SD'
    if (str.includes('MTS')) return 'MTs'
    if (str.includes('SMP')) return 'SMP'
    if (str.includes('MA') && !str.includes('SMA') && !str.includes('MAHAD')) return 'MA'
    if (str.includes('SMA')) return 'SMA'
    if (str.includes('PONDOK') || str.includes('PESANTREN') || str.includes('MAHAD')) return 'Pesantren'
    return unit.jenjang || 'SD'
  }

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }

      if (name === 'unit_pendidikan_id') {
        const u = displayUnits.find((unit) => String(unit.id) === String(value))
        if (u) {
          const autoJenjang = getJenjangFromUnit(u)
          if (autoJenjang) {
            next.jenjang = autoJenjang
          }
        }
      }

      return next
    })

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!formData.kode_kurikulum?.trim()) errs.kode_kurikulum = 'Kode kurikulum wajib diisi.'
    if (!formData.nama_kurikulum?.trim()) errs.nama_kurikulum = 'Nama kurikulum wajib diisi.'
    if (!formData.unit_pendidikan_id) errs.unit_pendidikan_id = 'Unit pendidikan wajib dipilih.'
    if (!formData.tanggal_mulai) errs.tanggal_mulai = 'Tanggal mulai wajib diisi.'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Data Master Kurikulum' : 'Tambah Master Kurikulum Baru'}
      subtitle={initialData ? 'Perbarui informasi rincian kurikulum yang berlaku.' : 'Lengkapi formulir untuk menambahkan kurikulum unit pendidikan.'}
      icon={<BookOpen className="h-5 w-5" />}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-rose-950/20 hover:from-rose-600 hover:to-red-800 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
              <X className="size-3.5" strokeWidth={2.5} />
            </span>
            <span>Batal</span>
          </button>
          <button
            type="submit"
            form="kurikulum-main-form"
            disabled={isSubmitting}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-950/20 hover:from-emerald-600 hover:to-teal-800 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
              {isSubmitting ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
              )}
            </span>
            <span>{isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Simpan Data')}</span>
          </button>
        </div>
      }
    >
      <form id="kurikulum-main-form" onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kode Kurikulum */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Kode Kurikulum <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              size="sm"
              name="kode_kurikulum"
              value={formData.kode_kurikulum}
              onChange={handleChange}
              placeholder="Misal: KUR-SD-SIT-2026"
              className={`font-mono ${errors.kode_kurikulum ? 'border-rose-400 bg-rose-50/30' : ''}`}
            />
            {errors.kode_kurikulum && (
              <p className="text-rose-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.kode_kurikulum}
              </p>
            )}
          </div>

          {/* Nama Kurikulum */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Nama Kurikulum <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              size="sm"
              name="nama_kurikulum"
              value={formData.nama_kurikulum}
              onChange={handleChange}
              placeholder="Misal: Kurikulum Merdeka Terpadu SD"
              className={errors.nama_kurikulum ? 'border-rose-400 bg-rose-50/30' : ''}
            />
            {errors.nama_kurikulum && (
              <p className="text-rose-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.nama_kurikulum}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Jenis Kurikulum */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Jenis Kurikulum <span className="text-rose-500">*</span>
            </label>
            <HeroUiFilterSelect
              value={formData.jenis_kurikulum}
              onChange={(val) => handleChange({ target: { name: 'jenis_kurikulum', value: val } })}
              options={JENIS_OPTIONS.map((j) => ({ value: j, label: j }))}
              placeholder="Pilih Jenis Kurikulum"
              icon={Layers}
              ariaLabel="Pilih jenis kurikulum"
              size="md"
              searchable
              className="w-full"
            />
          </div>

          {/* Jenjang */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Jenjang <span className="text-rose-500">*</span>
            </label>
            <HeroUiFilterSelect
              value={formData.jenjang}
              onChange={(val) => handleChange({ target: { name: 'jenjang', value: val } })}
              options={availableJenjangModalOptions.map((j) => ({ value: j, label: j }))}
              disabled={availableJenjangModalOptions.length <= 1}
              placeholder="Pilih Jenjang"
              icon={GraduationCap}
              ariaLabel="Pilih jenjang"
              size="md"
              searchable
              className="w-full"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Status Berlaku</label>
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 font-bold text-slate-800">
                  {formData.status ? 'Aktif' : 'Nonaktif'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unit Pendidikan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Unit Pendidikan <span className="text-rose-500">*</span>
            </label>
            <HeroUiFilterSelect
              value={formData.unit_pendidikan_id ? String(formData.unit_pendidikan_id) : ''}
              onChange={(val) => handleChange({ target: { name: 'unit_pendidikan_id', value: val } })}
              options={[
                ...(canViewAllUnits ? [{ value: '', label: '-- Pilih Unit Pendidikan --' }] : []),
                ...displayUnits.map((u) => ({
                  value: String(u.id),
                  label: `${u.name || u.nama} (${u.code || u.kode})`,
                })),
              ]}
              disabled={!canViewAllUnits && displayUnits.length <= 1}
              placeholder="Pilih Unit Pendidikan"
              icon={Building2}
              ariaLabel="Pilih unit pendidikan"
              size="md"
              searchable
              className="w-full"
            />
            {errors.unit_pendidikan_id && (
              <p className="text-rose-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.unit_pendidikan_id}
              </p>
            )}
          </div>

          {/* Tahun Ajaran */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Tahun Ajaran <span className="text-rose-500">*</span>
            </label>
            <HeroUiFilterSelect
              value={formData.tahun_ajaran_id ? String(formData.tahun_ajaran_id) : ''}
              onChange={(val) => handleChange({ target: { name: 'tahun_ajaran_id', value: val } })}
              options={[
                { value: '', label: '-- Pilih Tahun Ajaran --' },
                ...tahunAjarans.map((t) => ({
                  value: String(t.id),
                  label: `${t.nama || t.name}${t.is_active ? ' (Aktif)' : ''}`,
                })),
              ]}
              placeholder="Pilih Tahun Ajaran"
              icon={Calendar}
              ariaLabel="Pilih tahun ajaran"
              size="md"
              searchable
              className="w-full"
            />
            {errors.tahun_ajaran_id && (
              <p className="text-rose-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.tahun_ajaran_id}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tanggal Mulai */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Tanggal Mulai Berlaku <span className="text-rose-500">*</span>
            </label>
            <DatePicker
              name="tanggal_mulai"
              value={formData.tanggal_mulai}
              onChange={handleChange}
              inputClassName={`py-2.5 font-semibold ${errors.tanggal_mulai ? 'border-rose-400 bg-rose-50/30' : ''
                }`}
              placeholder="Pilih tanggal mulai..."
            />
            {errors.tanggal_mulai && (
              <p className="text-rose-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.tanggal_mulai}
              </p>
            )}
          </div>

          {/* Tanggal Selesai */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Tanggal Selesai (Opsional)</label>
            <DatePicker
              name="tanggal_selesai"
              value={formData.tanggal_selesai}
              onChange={handleChange}
              inputClassName="py-2.5 font-semibold"
              placeholder="Pilih tanggal selesai..."
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Deskripsi / Catatan Kurikulum</label>
          <TextArea
            name="deskripsi"
            rows={3}
            value={formData.deskripsi}
            onChange={handleChange}
            placeholder="Catatan tambahan mengenai struktur kurikulum..."
          />
        </div>
      </form>
    </AppModal>
  )
}
