import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 Award,
 Building2,
 Check,
 CheckCircle2,
 ChevronDown,
 FileText,
 GraduationCap,
 Hash,
 Palette,
 Power,
 RefreshCcw,
 Save,
 School,
 Sparkles,
 Tag,
 X,
} from 'lucide-react'
import { renderJenisUnitIcon } from './JenisUnitTable'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { AppInput, AppTextarea } from '../app'

const JENJANG_OPTIONS = [
 'PAUD',
 'TK',
 'SD',
 'MI',
 'SMP',
 'MTs',
 'SMA',
 'MA',
 'Pondok Pesantren',
 'Mahad',
]

const ICON_OPTIONS = [
 { value: 'Building', label: 'Building (Gedung)' },
 { value: 'School', label: 'School (Sekolah)' },
 { value: 'Book', label: 'Book (Buku / Kitab)' },
 { value: 'Mosque', label: 'Mosque (Masjid)' },
 { value: 'Graduation', label: 'Graduation (Kelulusan)' },
 { value: 'University', label: 'University (Kampus / Mahad)' },
 { value: 'Children', label: 'Children (Anak Usia Dini)' },
 { value: 'Home', label: 'Home (Rumah)' },
]

const COLOR_PRESETS = [
 '#10B981', // Hijau (Default)
 '#06B6D4', // Cyan
 '#3B82F6', // Biru
 '#F59E0B', // Amber
 '#6366F1', // Indigo
 '#8B5CF6', // Purple
 '#059669', // Emerald
 '#D97706', // Warm Amber
]

export default function JenisUnitFormModal({
 isOpen,
 onClose,
 onSubmit,
 initialData = null,
 isSubmitting = false,
}) {
 const [formData, setFormData] = useState({
 kode_jenis: '',
 nama_jenis: '',
 singkatan: '',
 jenjang: 'SD',
 urutan: 1,
 warna_badge: '#10B981',
 icon: 'School',
 status: true,
 keterangan: '',
 })

 const [errors, setErrors] = useState({})

 useEffect(() => {
 if (initialData) {
 setFormData({
 kode_jenis: initialData.kode_jenis || '',
 nama_jenis: initialData.nama_jenis || '',
 singkatan: initialData.singkatan || '',
 jenjang: initialData.jenjang || 'SD',
 urutan: initialData.urutan || 1,
 warna_badge: initialData.warna_badge || '#10B981',
 icon: initialData.icon || 'School',
 status: initialData.status !== undefined ? Boolean(initialData.status) : true,
 keterangan: initialData.keterangan || '',
 })
 } else {
 setFormData({
 kode_jenis: '',
 nama_jenis: '',
 singkatan: '',
 jenjang: 'SD',
 urutan: 1,
 warna_badge: '#10B981',
 icon: 'School',
 status: true,
 keterangan: '',
 })
 }
 setErrors({})
 }, [initialData, isOpen])

 const handleReset = () => {
 setFormData({
 kode_jenis: initialData?.kode_jenis || '',
 nama_jenis: initialData?.nama_jenis || '',
 singkatan: initialData?.singkatan || '',
 jenjang: initialData?.jenjang || 'SD',
 urutan: initialData?.urutan || 1,
 warna_badge: initialData?.warna_badge || '#10B981',
 icon: initialData?.icon || 'School',
 status: initialData?.status !== undefined ? Boolean(initialData?.status) : true,
 keterangan: initialData?.keterangan || '',
 })
 setErrors({})
 }

 const validate = () => {
 const errs = {}
 if (!formData.kode_jenis.trim()) {
 errs.kode_jenis = 'Kode wajib diisi'
 }
 if (!formData.nama_jenis.trim()) {
 errs.nama_jenis = 'Nama wajib diisi'
 }
 if (!formData.jenjang) {
 errs.jenjang = 'Jenjang pendidikan wajib dipilih'
 }
 if (formData.urutan === '' || formData.urutan === null || isNaN(formData.urutan)) {
 errs.urutan = 'Urutan harus angka'
 }

 setErrors(errs)
 return Object.keys(errs).length === 0
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 if (!validate()) return

 onSubmit({
 ...formData,
 urutan: parseInt(formData.urutan, 10),
 })
 }

 const isEdit = Boolean(initialData)

 return (
 <AnimatePresence>
 {isOpen && (
 <div
 id="jenis-unit-form-modal"
 className="overlay modal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 role="dialog"
 aria-modal="true"
 aria-labelledby="jenis-unit-form-title"
 tabIndex={-1}
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !isSubmitting) onClose()
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-xl"
 >
 <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-card-dark dark:shadow-black/60">
 {/* Top accent line */}
 <div
 className={`h-1.5 w-full shrink-0 ${
 isEdit
 ? 'bg-white dark:bg-[#1B2433]'
 : 'bg-white dark:bg-[#1B2433]'
 }`}
 />

 {/* Header Modal */}
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <div className="flex items-center gap-3">
 <div
 className={`rounded-xl border p-2.5 shadow-md ${
 isEdit
 ? 'bg-white dark:bg-[#1B2433] shadow-sm border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm border-emerald-300'
 }`}
 >
 <School className="h-5 w-5 text-slate-600" strokeWidth={2.25} />
 </div>
 <div>
 <h3
 id="jenis-unit-form-title"
 className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2"
 >
 {isEdit ? 'Edit Jenis Unit Pendidikan' : 'Tambah Jenis Unit Pendidikan'}
 <span
 className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
 isEdit
 ? 'bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-emerald-800/60'
 : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60'
 }`}
 >
 <Sparkles className="size-3" /> {isEdit ? 'Update Data' : 'Unit Baru'}
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Kelola klasifikasi jenjang, visual kategori, dan status operasional jenis unit.
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 aria-label="Tutup form jenis unit"
 className="size-9 flex items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
 >
 <X className="size-4 text-rose-600" strokeWidth={2.25} />
 </button>
 </div>

 {/* Form Body */}
 <form onSubmit={handleSubmit} className="modal-body min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-xs text-slate-700 dark:text-slate-200">
 {/* Kode & Nama */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Kode Jenis */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Kode Jenis <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Tag className="size-4" />
 </div>
 <AppInput
 type="text"
 size="sm"
 value={formData.kode_jenis}
 onChange={(e) =>
 setFormData({ ...formData, kode_jenis: e.target.value.toUpperCase() })
 }
 placeholder="Contoh: SDIT"
 className={`pl-10 ${errors.kode_jenis ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50' : ''}`}
 />
 </div>
 {errors.kode_jenis && (
 <p className="text-xs font-semibold text-rose-500">{errors.kode_jenis}</p>
 )}
 </div>

 {/* Nama Jenis Unit */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Nama Jenis Unit <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Building2 className="size-4" />
 </div>
 <AppInput
 type="text"
 size="sm"
 value={formData.nama_jenis}
 onChange={(e) => setFormData({ ...formData, nama_jenis: e.target.value })}
 placeholder="Contoh: Sekolah Dasar Islam Terpadu"
 className={`pl-10 ${errors.nama_jenis ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50' : ''}`}
 />
 </div>
 {errors.nama_jenis && (
 <p className="text-xs font-semibold text-rose-500">{errors.nama_jenis}</p>
 )}
 </div>
 </div>

 {/* Singkatan & Jenjang */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Singkatan */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Singkatan</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <FileText className="size-4" />
 </div>
 <AppInput
 type="text"
 size="sm"
 value={formData.singkatan}
 onChange={(e) => setFormData({ ...formData, singkatan: e.target.value })}
 placeholder="Contoh: SDIT"
 className="pl-10"
 />
 </div>
 </div>

 {/* Jenjang Pendidikan */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Jenjang Pendidikan <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={formData.jenjang}
 onChange={(val) => setFormData({ ...formData, jenjang: val })}
 options={JENJANG_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
 placeholder="Pilih Jenjang"
 icon={GraduationCap}
 ariaLabel="Pilih jenjang pendidikan"
 size="md"
 className="w-full"
 />
 {errors.jenjang && <p className="text-xs font-semibold text-rose-500">{errors.jenjang}</p>}
 </div>
 </div>

 {/* Urutan & Icon */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Urutan */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Urutan Tampilan <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Hash className="size-4" />
 </div>
 <AppInput
 type="number"
 size="sm"
 min="1"
 value={formData.urutan}
 onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
 placeholder="Contoh: 1"
 className={`pl-10 ${errors.urutan ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50' : ''}`}
 />
 </div>
 {errors.urutan && <p className="text-xs font-semibold text-rose-500">{errors.urutan}</p>}
 </div>

 {/* Icon */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Icon Visual</label>
 <div className="flex items-center gap-2">
 <div className="flex-1">
 <HeroUiFilterSelect
 value={formData.icon}
 onChange={(val) => setFormData({ ...formData, icon: val })}
 options={ICON_OPTIONS.map((ico) => ({ value: ico.value, label: ico.label }))}
 placeholder="Pilih Icon Visual"
 icon={School}
 ariaLabel="Pilih icon visual"
 size="md"
 className="w-full"
 />
 </div>
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-2xs">
 {renderJenisUnitIcon(formData.icon, 'w-5 h-5')}
 </div>
 </div>
 </div>
 </div>

 {/* Warna Badge Preset */}
 <div className="space-y-2 rounded-xl border border-emerald-200/80 bg-slate-50/50 p-4 dark:border-emerald-700/80/80 dark:bg-slate-900/40">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
 <Palette className="size-4 text-[#059669] dark:text-[#10B981]" /> Warna Badge Identitas
 </label>
 <div className="flex flex-wrap items-center gap-3">
 <div className="relative flex items-center gap-2">
 <input
 type="color"
 value={formData.warna_badge}
 onChange={(e) => setFormData({ ...formData, warna_badge: e.target.value })}
 className="h-9 w-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer p-0.5 shadow-2xs hover:scale-105 transition-transform dark:border-emerald-700/80"
 />
 <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 bg-white border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg shadow-2xs dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-200">
 {formData.warna_badge}
 </span>
 </div>
 <div className="flex items-center gap-1.5 sm:ml-auto">
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Preset:</span>
 {COLOR_PRESETS.map((color) => (
 <button
 type="button"
 key={color}
 onClick={() => setFormData({ ...formData, warna_badge: color })}
 className={`h-6 w-6 rounded-full border-2 transition-transform cursor-pointer ${
 formData.warna_badge === color
 ? 'border-slate-800 scale-110 shadow-sm dark:border-emerald-200/80'
 : 'border-transparent hover:scale-105'
 }`}
 style={{ backgroundColor: color }}
 />
 ))}
 </div>
 </div>
 </div>

 {/* Interactive Operational Status Toggle Card */}
 <div
 onClick={() => setFormData((p) => ({ ...p, status: !p.status }))}
 className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
 formData.status
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 hover:bg-emerald-50/80 dark:border-emerald-800/60 dark:bg-emerald-950/20'
 : 'border-emerald-200/80 bg-slate-50/50 hover:bg-slate-100/60 dark:border-emerald-700/80/80 dark:bg-slate-900/30'
 }`}
 >
 <div className="flex items-center gap-3.5 min-w-0">
 <div
 className={`flex size-10 items-center justify-center rounded-xl shadow-xs transition-colors shrink-0 ${
 formData.status
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'bg-slate-200 text-slate-500 dark:bg-sky-950/60 dark:text-sky-300'
 }`}
 >
 {formData.status ? <CheckCircle2 className="size-5" /> : <Power className="size-5" />}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-xs font-black text-slate-900 dark:text-white">
 Status Operasional Jenis Unit
 </p>
 <span
 className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
 formData.status
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'bg-slate-200 text-slate-700 border-emerald-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-700/80'
 }`}
 >
 <Sparkles className="size-2.5" />
 {formData.status ? 'Aktif' : 'Nonaktif'}
 </span>
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
 {formData.status
 ? 'Jenis unit ini aktif dan dapat dipilih saat membuat unit sekolah baru'
 : 'Jenis unit dinonaktifkan sementara dari pilihan operasional sistem'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
 <span
 className={`text-xs font-black transition-colors ${
 formData.status ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
 }`}
 >
 {formData.status ? 'Aktif' : 'Nonaktif'}
 </span>
 <button
 type="button"
 role="switch"
 aria-checked={formData.status}
 aria-label="Toggle status operasional jenis unit"
 onClick={() => setFormData((p) => ({ ...p, status: !p.status }))}
 className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${
 formData.status
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
 : 'bg-slate-300 dark:bg-slate-700'
 }`}
 >
 <span
 className={`pointer-events-none inline-flex size-5.5 items-center justify-center transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
 formData.status ? 'translate-x-5' : 'translate-x-0.5'
 }`}
 >
 {formData.status ? (
 <Check className="size-3 text-emerald-700" strokeWidth={3} />
 ) : (
 <X className="size-3 text-slate-400" strokeWidth={3} />
 )}
 </span>
 </button>
 </div>
 </div>

 {/* Keterangan */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Keterangan</label>
 <div className="relative flex items-start">
 <div className="pointer-events-none absolute left-3.5 top-3 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <FileText className="size-4" />
 </div>
 <AppTextarea
 rows={3}
 value={formData.keterangan}
 onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
 placeholder="Masukkan keterangan atau deskripsi jenis unit..."
 className="pl-10"
 />
 </div>
 </div>

 {/* Buttons Footer */}
 <div className="modal-footer px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-surface-dark-inner flex items-center justify-between shrink-0">
 <button
 type="button"
 onClick={handleReset}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <RefreshCcw className="size-4" strokeWidth={2} />
 Reset
 </button>

 <div className="flex items-center gap-2.5">
 <button
 type="button"
 onClick={onClose}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <X className="size-4" />
 Batal
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-emerald-600/25 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer"
 >
 {isSubmitting ? (
 <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : (
 <Save className="size-4" strokeWidth={2} />
 )}
 {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Jenis Unit'}
 </button>
 </div>
 </div>
 </form>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 )
}

