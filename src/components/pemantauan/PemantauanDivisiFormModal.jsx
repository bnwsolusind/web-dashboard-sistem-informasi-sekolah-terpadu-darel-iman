import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppModal from '../app/AppModal'
import {
 Layers,
 Save,
 X,
 Lock,
 ShieldCheck,
 UserCheck,
 Calendar,
 Percent,
 Sparkles,
 Pencil,
 Building2,
 TrendingUp,
 FileText,
 AlertCircle,
 CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { InputGroupTextarea } from '@/components/ui/input-group'
import {
 Select,
 SelectTrigger,
 SelectValue,
 SelectContent,
 SelectItem,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { educationUnitService } from '../../services/educationUnitService'
import { divisionService } from '../../services/divisionService'

const STATUS_OPTIONS = [
 { id: 'proses', name: 'Dalam Proses' },
 { id: 'tercapai', name: 'Tercapai (Sesuai Target)' },
 { id: 'terlambat', name: 'Terlambat (Perlu Tindak Lanjut)' },
 { id: 'belum_tercapai', name: 'Belum Tercapai' },
]

export default function PemantauanDivisiFormModal({
 isOpen,
 onClose,
 onSubmit,
 initialData = null,
 isSubmitting = false,
 currentUserUnit = '',
 isUnitRestricted = false,
 isDivisi = false,
 unitOptions = [],
 divisionOptions = [],
}) {
 const isEditMode = Boolean(initialData?.id)

 const [availableUnits, setAvailableUnits] = useState(unitOptions)
 const [availableDivisions, setAvailableDivisions] = useState(divisionOptions)

 const isYayasanDivision = (name) => {
 if (!name) return false
 return /yayasan|pengurus[\s_]*yayasan|ketua[\s_]*yayasan|sekretaris[\s_]*yayasan|bendahara[\s_]*yayasan|pembina[\s_]*yayasan|pengawas[\s_]*yayasan/i.test(name)
 }

 const filteredDivisions = useMemo(() => {
 if (!isDivisi) return availableDivisions
 return availableDivisions.filter((d) => !isYayasanDivision(d.name || d.nama || ''))
 }, [availableDivisions, isDivisi])

 useEffect(() => {
 if (unitOptions && unitOptions.length > 0) {
 setAvailableUnits(unitOptions)
 return
 }
 let isCancelled = false
 educationUnitService
 .getDaftar({ per_page: 100 })
 .then((res) => {
 if (isCancelled) return
 const list = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
 if (Array.isArray(list) && list.length > 0) {
 setAvailableUnits(list)
 }
 })
 .catch(() => {})
 return () => {
 isCancelled = true
 }
 }, [unitOptions])

 useEffect(() => {
 if (divisionOptions && divisionOptions.length > 0) {
 setAvailableDivisions(divisionOptions)
 return
 }
 let isCancelled = false
 divisionService
 .getDropdown()
 .then((data) => {
 if (isCancelled) return
 const list = Array.isArray(data) ? data : []
 if (list.length > 0) {
 setAvailableDivisions(list)
 }
 })
 .catch(() => {})
 return () => {
 isCancelled = true
 }
 }, [divisionOptions])

 const defaultUnit = currentUserUnit || availableUnits[0]?.name || availableUnits[0]?.code || ''
 const defaultDivisi = filteredDivisions[0]?.name || ''

 const [formData, setFormData] = useState({
 unit_pendidikan: defaultUnit,
 nama_divisi: defaultDivisi,
 kategori_laporan: '',
 aspek_pemantauan: '',
 persentase_capaian: 90,
 status_pemantauan: 'tercapai',
 tanggal_pemantauan: new Date().toISOString().split('T')[0],
 petugas_supervisi: '',
 catatan: '',
 })

 const [errors, setErrors] = useState({})

 useEffect(() => {
 if (initialData) {
 setFormData({
 unit_pendidikan: initialData.unit_pendidikan || defaultUnit,
 nama_divisi: initialData.nama_divisi || defaultDivisi,
 kategori_laporan: initialData.kategori_laporan || '',
 aspek_pemantauan: initialData.aspek_pemantauan || '',
 persentase_capaian: initialData.persentase_capaian !== undefined ? Number(initialData.persentase_capaian) : 90,
 status_pemantauan: initialData.status_pemantauan || 'tercapai',
 tanggal_pemantauan: initialData.tanggal_pemantauan
 ? new Date(initialData.tanggal_pemantauan).toISOString().split('T')[0]
 : new Date().toISOString().split('T')[0],
 petugas_supervisi: initialData.petugas_supervisi || '',
 catatan: initialData.catatan || '',
 })
 } else {
 setFormData({
 unit_pendidikan: isUnitRestricted ? currentUserUnit : defaultUnit,
 nama_divisi: defaultDivisi,
 kategori_laporan: '',
 aspek_pemantauan: '',
 persentase_capaian: 90,
 status_pemantauan: 'tercapai',
 tanggal_pemantauan: new Date().toISOString().split('T')[0],
 petugas_supervisi: '',
 catatan: '',
 })
 }
 setErrors({})
 }, [initialData, isOpen, currentUserUnit, isUnitRestricted, defaultUnit, defaultDivisi])

 const validate = () => {
 const errs = {}
 if (!formData.unit_pendidikan?.trim()) errs.unit_pendidikan = 'Unit pendidikan wajib dipilih.'
 if (!formData.nama_divisi?.trim()) errs.nama_divisi = 'Nama divisi wajib dipilih.'
 if (isDivisi && isYayasanDivision(formData.nama_divisi)) {
 errs.nama_divisi = 'Divisi Pendidikan tidak berhak memonitoring pengurus yayasan.'
 }
 if (!formData.aspek_pemantauan?.trim()) errs.aspek_pemantauan = 'Aspek pemantauan wajib diisi.'
 if (formData.persentase_capaian < 0 || formData.persentase_capaian > 100) {
 errs.persentase_capaian = 'Persentase harus di antara 0 - 100.'
 }
 if (!formData.tanggal_pemantauan) errs.tanggal_pemantauan = 'Tanggal pemantauan wajib diisi.'
 setErrors(errs)
 return Object.keys(errs).length === 0
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 if (!validate()) return
 const matchedUnit = availableUnits.find(
 (u) => (u.name || u.code) === formData.unit_pendidikan || u.id === formData.unit_pendidikan
 )
 const matchedDiv = availableDivisions.find(
 (d) => (d.name || d.nama || d.code) === formData.nama_divisi || d.id === formData.nama_divisi
 )

 onSubmit({
 ...formData,
 unit_id: matchedUnit?.id || null,
 unit_pendidikan: matchedUnit?.name || formData.unit_pendidikan,
 division_id: matchedDiv?.id || null,
 nama_divisi: matchedDiv?.name || formData.nama_divisi,
 persentase_capaian: Number(formData.persentase_capaian),
 })
 }

 const capVal = Number(formData.persentase_capaian) || 0
 const progressBgClass =
 capVal >= 80 ? 'bg-emerald-500' : capVal >= 65 ? 'bg-blue-500' : capVal >= 50 ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={isEditMode ? 'Ubah Laporan Pemantauan Divisi' : 'Input Laporan Pemantauan Divisi'}
      badge={isEditMode ? 'Perbarui' : 'Laporan Baru'}
      description="Lengkapi rincian supervisi, temuan lapangan, dan rekomendasi tindak lanjut."
      icon={isEditMode ? Pencil : Layers}
      variant={isEditMode ? 'warning' : 'emerald'}
      maxWidth="max-w-xl"
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      footer={
        <>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-60"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <button
            type="submit"
            form="pemantauan-divisi-form"
            disabled={isSubmitting}
            className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-60"
          >
            <Save className="size-4" />
            <span>{isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan Laporan' : 'Simpan Laporan Supervisi'}</span>
          </button>
        </>
      }
    >
      <form id="pemantauan-divisi-form" onSubmit={handleSubmit} className="space-y-4">
 {/* Hero Mini Banner Info Card */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-4 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/60">
 <div className="flex items-center justify-between gap-3 relative z-10">
 <div className="flex items-center gap-2.5">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <TrendingUp className="size-4.5" />
 </div>
 <div>
 <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
 <span>Divisi: {formData.nama_divisi || 'Pilih Divisi'}</span>
 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded">
 {formData.unit_pendidikan || 'Unit'}
 </span>
 </p>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
 Capaian Kinerja: <strong className="text-emerald-700 dark:text-emerald-300 font-extrabold">{capVal}%</strong> · Status: {formData.status_pemantauan.replace('_', ' ').toUpperCase()}
 </p>
 </div>
 </div>
 <div className="text-right shrink-0">
 <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl text-white ${progressBgClass} shadow-xs`}>
 <CheckCircle2 className="size-3.5" />
 {capVal >= 80 ? 'Target Terpenuhi' : capVal >= 65 ? 'Dalam Proses' : 'Perlu Evaluasi'}
 </span>
 </div>
 </div>
 </div>

 {/* Grid Baris 1: Unit Pendidikan & Tanggal Supervisi */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <div className="flex items-center justify-between">
 <FieldLabel htmlFor="unit_pendidikan" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
 Unit Pendidikan <span className="text-rose-500">*</span>
 </FieldLabel>
 {isUnitRestricted ? (
 <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md dark:bg-amber-950/60 dark:text-amber-300">
 <Lock className="size-3" /> Unit Terkunci
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md dark:bg-emerald-950/60 dark:text-emerald-300">
 <ShieldCheck className="size-3" /> Seluruh Unit
 </span>
 )}
 </div>

 {isUnitRestricted ? (
 <div className="h-10 px-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/40 flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-white">
 <span>{formData.unit_pendidikan}</span>
 <Lock className="size-4 text-amber-500" />
 </div>
 ) : (
 <Select
 value={formData.unit_pendidikan}
 onChange={(val) => setFormData({ ...formData, unit_pendidikan: String(val) })}
 >
 <SelectTrigger className="w-full h-10 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs">
 <SelectValue placeholder="Pilih Unit Sekolah..." />
 </SelectTrigger>
 <SelectContent className="z-50 bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xl max-h-60 overflow-y-auto">
 {availableUnits.map((opt) => (
 <SelectItem key={opt.id} id={opt.name || opt.code || opt.id} className="text-xs font-semibold py-2">
 {opt.name || opt.code}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 )}
 {errors.unit_pendidikan && <p className="text-xs font-bold text-rose-500">{errors.unit_pendidikan}</p>}
 </div>

 {/* Tanggal Pemantauan */}
 <div className="space-y-1.5">
 <FieldLabel htmlFor="tanggal_pemantauan" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
 Tanggal Supervisi <span className="text-rose-500">*</span>
 </FieldLabel>
 <DatePicker
 id="tanggal_pemantauan"
 value={formData.tanggal_pemantauan}
 onChange={(e) => setFormData({ ...formData, tanggal_pemantauan: e.target.value })}
 inputClassName="h-10 text-xs font-bold rounded-xl border-emerald-200/80 bg-slate-50/60 shadow-2xs"
 placeholder="Pilih tanggal..."
 />
 {errors.tanggal_pemantauan && <p className="text-xs font-bold text-rose-500">{errors.tanggal_pemantauan}</p>}
 </div>
 </div>

 {/* Grid Baris 2: Nama Divisi & Kategori Laporan */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <FieldLabel htmlFor="nama_divisi" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
 Nama Divisi Terkait <span className="text-rose-500">*</span>
 </FieldLabel>
 <Select
 value={formData.nama_divisi}
 onChange={(val) => setFormData({ ...formData, nama_divisi: String(val) })}
 >
 <SelectTrigger className="w-full h-10 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs">
 <SelectValue placeholder="Pilih Divisi..." />
 </SelectTrigger>
 <SelectContent className="z-50 bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xl max-h-64 overflow-y-auto">
 {filteredDivisions.map((opt) => (
 <SelectItem key={opt.id || opt.name} id={opt.name} className="text-xs font-semibold py-2">
 {opt.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.nama_divisi && <p className="text-xs font-bold text-rose-500">{errors.nama_divisi}</p>}
 </div>

 <div className="space-y-1.5">
 <FieldLabel htmlFor="kategori_laporan" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
 Bidang / Kategori Supervisi
 </FieldLabel>
 <Input
 id="kategori_laporan"
 type="text"
 value={formData.kategori_laporan}
 onChange={(e) => setFormData({ ...formData, kategori_laporan: e.target.value })}
 placeholder="Contoh: Kurikulum, Al-Qur'an & Tahfizh, Kesiswaan, Sarpras"
 className="h-10 rounded-xl text-xs font-bold border-emerald-200/80 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs"
 />
 </div>
 </div>

 {/* Aspek Pemantauan / Indikator Kerja */}
 <div className="space-y-1.5">
 <FieldLabel htmlFor="aspek_pemantauan" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
 Aspek & Indikator Pemantauan <span className="text-rose-500">*</span>
 </FieldLabel>
 <Input
 id="aspek_pemantauan"
 type="text"
 placeholder="Contoh: Keterlaksanaan Sesi KBM, Target Ziyadah & Muraja'ah, Monitoring Disiplin"
 value={formData.aspek_pemantauan}
 onChange={(e) => setFormData({ ...formData, aspek_pemantauan: e.target.value })}
 className="h-10 rounded-xl text-xs font-black border-emerald-200/80 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs"
 />
 {errors.aspek_pemantauan ? (
 <p className="text-xs font-bold text-rose-500">{errors.aspek_pemantauan}</p>
 ) : (
 <p className="text-xs text-slate-400">Deskripsikan program kerja operasional atau indikator penilaian divisi.</p>
 )}
 </div>

 {/* Grid Baris 3: Persentase Capaian & Status */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-emerald-200/80 bg-slate-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <div className="space-y-1.5">
 <div className="flex items-center justify-between">
 <FieldLabel htmlFor="persentase_capaian" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
 Capaian Target (%) <span className="text-rose-500">*</span>
 </FieldLabel>
 <span className={`text-xs font-black tabular-nums ${capVal >= 80 ? 'text-emerald-600' : capVal >= 65 ? 'text-blue-600' : capVal >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
 {capVal}%
 </span>
 </div>
 <Input
 id="persentase_capaian"
 type="number"
 min="0"
 max="100"
 step="1"
 value={formData.persentase_capaian}
 onChange={(e) => setFormData({ ...formData, persentase_capaian: e.target.value })}
 className="h-10 rounded-xl text-xs font-black border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs"
 />
 {/* Live Gradient Progress Bar */}
 <div className="h-2 w-full bg-emerald-50 dark:bg-emerald-950/40 rounded-full overflow-hidden mt-1.5">
 <div
 className={`h-full rounded-full transition-all duration-300 ${progressBgClass}`}
 style={{ width: `${Math.min(Math.max(capVal, 0), 100)}%` }}
 />
 </div>
 {errors.persentase_capaian && <p className="text-xs font-bold text-rose-500">{errors.persentase_capaian}</p>}
 </div>

 <div className="space-y-1.5">
 <FieldLabel htmlFor="status_pemantauan" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
 Status Ketercapaian <span className="text-rose-500">*</span>
 </FieldLabel>
 <Select
 value={formData.status_pemantauan}
 onChange={(val) => setFormData({ ...formData, status_pemantauan: String(val) })}
 >
 <SelectTrigger className="w-full h-10 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs">
 <SelectValue placeholder="Pilih Status..." />
 </SelectTrigger>
 <SelectContent className="z-50 bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xl">
 {STATUS_OPTIONS.map((opt) => (
 <SelectItem key={opt.id} id={opt.id} className="text-xs font-semibold py-2">
 {opt.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <p className="text-[10.5px] text-slate-400">
 Otomatis tersinkronisasi dengan status target evaluasi SOP.
 </p>
 </div>
 </div>

 {/* Petugas Supervisi */}
 <div className="space-y-1.5">
 <FieldLabel htmlFor="petugas_supervisi" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
 <UserCheck className="size-3.5 text-emerald-600" />
 Petugas Supervisi / Pengawas Divisi
 </FieldLabel>
 <Input
 id="petugas_supervisi"
 type="text"
 placeholder="Contoh: Ustadz Hamzah, S.Pd.I / Tim Penjamin Mutu SIT"
 value={formData.petugas_supervisi}
 onChange={(e) => setFormData({ ...formData, petugas_supervisi: e.target.value })}
 className="h-10 rounded-xl text-xs font-bold border-emerald-200/80 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs"
 />
 </div>

 {/* Catatan / Ringkasan Evaluasi */}
 <div className="space-y-1.5">
 <FieldLabel htmlFor="catatan" className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
 <FileText className="size-3.5 text-emerald-600" />
 Catatan Evaluasi & Rekomendasi Solusi Pimpinan
 </FieldLabel>
 <InputGroupTextarea
 id="catatan"
 rows={3}
 placeholder="Tuliskan temuan lapangan, kendala teknis, serta arahan tindak lanjut untuk kepala sekolah dan yayasan..."
 value={formData.catatan}
 onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 p-3 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:bg-white dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 shadow-2xs"
 />
 </div>
      </form>
    </AppModal>
  )
}
