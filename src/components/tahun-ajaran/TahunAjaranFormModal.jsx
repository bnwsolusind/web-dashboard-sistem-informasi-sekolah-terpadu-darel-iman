import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 CalendarDays,
 Calendar,
 FileText,
 X,
 Sparkles,
 Pencil,
 ShieldCheck,
 Power,
 Save,
 Loader2,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { AppInput, AppDatePicker, AppTextarea } from '../app'

export default function TahunAjaranFormModal({
 isOpen,
 onClose,
 onSubmit,
 initialData = null,
 isSubmitting = false,
}) {
 const isEdit = Boolean(initialData?.id || initialData?.name)

 const [formData, setFormData] = useState({
 name: '',
 start_date: '',
 end_date: '',
 is_active: false,
 keterangan: '',
 })

 const [errors, setErrors] = useState({})

 useEffect(() => {
 if (isOpen) {
 if (initialData) {
 setFormData({
 name: initialData.name || '',
 start_date: initialData.start_date || '',
 end_date: initialData.end_date || '',
 is_active: Boolean(initialData.is_active),
 keterangan: initialData.keterangan || initialData.metadata?.keterangan || '',
 })
 } else {
 const currentYear = new Date().getFullYear()
 setFormData({
 name: `${currentYear}/${currentYear + 1}`,
 start_date: `${currentYear}-07-01`,
 end_date: `${currentYear + 1}-06-30`,
 is_active: false,
 keterangan: '',
 })
 }
 setErrors({})
 }
 }, [initialData, isOpen])

 const validate = () => {
 const errs = {}
 if (!formData.name || !formData.name.trim()) {
 errs.name = 'Nama tahun ajaran wajib diisi.'
 }
 if (!formData.start_date) {
 errs.start_date = 'Tanggal mulai wajib diisi.'
 }
 if (!formData.end_date) {
 errs.end_date = 'Tanggal selesai wajib diisi.'
 }
 if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
 errs.end_date = 'Tanggal selesai harus setelah tanggal mulai.'
 }
 setErrors(errs)
 return Object.keys(errs).length === 0
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 if (!validate()) return
 onSubmit(formData)
 }

 return (
 <AnimatePresence>
 {isOpen && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
 role="dialog"
 aria-modal="true"
 aria-labelledby="modal-tahun-ajaran-title"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !isSubmitting) onClose()
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="my-auto w-full max-w-xl font-sans"
 >
 <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-card-dark dark:shadow-black/60">
 {/* Top Accent Gradient Bar */}
 <div
 className={cn(
 'h-1.5 w-full shrink-0',
 isEdit
 ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600'
 : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
 )}
 />

 {/* Modal Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner shrink-0">
 <div className="flex items-center gap-3.5">
 <div
 className={cn(
 'rounded-xl text-white p-3 shadow-md shrink-0 border',
 isEdit
 ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25 border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25 border-emerald-300'
 )}
 >
 {isEdit ? (
 <Pencil className="size-5" strokeWidth={2.25} />
 ) : (
 <CalendarDays className="size-5" strokeWidth={2.25} />
 )}
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3
 id="modal-tahun-ajaran-title"
 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white"
 >
 {isEdit ? 'Ubah Master Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
 </h3>
 <span
 className={cn(
 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border',
 isEdit
 ? 'bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-emerald-800/60'
 : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
 )}
 >
 <Sparkles className="size-3" />
 {isEdit ? 'Update Data' : 'Periode Baru'}
 </span>
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
 Lengkapi identitas periode, rentang kalender aktif, dan status operasional.
 </p>
 </div>
 </div>

 {/* Tombol Close Squircle */}
 <button
 type="button"
 disabled={isSubmitting}
 onClick={onClose}
 aria-label="Tutup form modal"
 className="size-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
 >
 <X className="size-4" strokeWidth={2.25} />
 </button>
 </div>

 {/* Modal Body / Form */}
 <form
 id="tahun-ajaran-form"
 onSubmit={handleSubmit}
 className="flex-1 overflow-y-auto p-6 space-y-5"
 >
 {/* GRUP 1: IDENTITAS PERIODE */}
 <div className="space-y-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
 <CalendarDays className="size-4" />
 <span>1. Identitas Periode Akademik</span>
 </h4>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Nama Tahun Ajaran <span className="text-rose-500">*</span>
 </label>
 <div className="relative">
 <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <AppInput
									type="text"
									required
									value={formData.name}
									onChange={(e) => {
										setFormData({ ...formData, name: e.target.value })
										if (errors.name) setErrors({ ...errors, name: null })
									}}
									placeholder="Contoh: 2026/2027"
									isError={Boolean(errors.name)}
									className="h-11 w-full pl-10"
								/>
 </div>
 {errors.name && (
 <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.name}</p>
 )}
 </div>
 </div>

 {/* GRUP 2: RENTANG KALENDER AKADEMIK */}
 <div className="space-y-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
 <Calendar className="size-4" />
 <span>2. Rentang Kalender Akademik</span>
 </h4>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Tanggal Mulai <span className="text-rose-500">*</span>
 </label>
 <AppDatePicker required isError={Boolean(errors.start_date)} value={formData.start_date}
 onChange={(e) => {
 setFormData({ ...formData, start_date: e.target.value })
 if (errors.start_date) setErrors({ ...errors, start_date: null })
 }}
 className="w-full"
 inputClassName={cn(
 'h-11',
 errors.start_date && 'border-rose-500 ring-2 ring-rose-500/20'
 )}
 placeholder="Pilih tanggal mulai..."
 />
 {errors.start_date && (
 <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.start_date}</p>
 )}
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Tanggal Selesai <span className="text-rose-500">*</span>
 </label>
 <AppDatePicker required isError={Boolean(errors.end_date)} value={formData.end_date}
 onChange={(e) => {
 setFormData({ ...formData, end_date: e.target.value })
 if (errors.end_date) setErrors({ ...errors, end_date: null })
 }}
 className="w-full"
 inputClassName={cn(
 'h-11',
 errors.end_date && 'border-rose-500 ring-2 ring-rose-500/20'
 )}
 placeholder="Pilih tanggal selesai..."
 />
 {errors.end_date && (
 <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.end_date}</p>
 )}
 </div>
 </div>
 </div>

 {/* GRUP 3: CATATAN & KETERANGAN TAMBAHAN */}
 <div className="space-y-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
 <FileText className="size-4" />
 <span>3. Catatan & Keterangan Tambahan</span>
 </h4>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-800 dark:text-slate-100">
 Keterangan Periode (Opsional)
 </label>
 <div className="relative">
 <FileText className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-emerald-600 dark:text-emerald-400" />
 <AppTextarea
									rows={3}
									value={formData.keterangan}
									onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
									placeholder="Tambahkan catatan khusus, informasi kurikulum, atau memo kalender akademik..."
									className="pl-10"
								/>
 </div>
 </div>
 </div>

 {/* GRUP 4: INTERACTIVE OPERATIONAL STATUS TOGGLE CARD (PRINSIP #8) */}
 <div
 className={cn(
 'relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200',
 formData.is_active
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900'
 : 'border-emerald-200/80 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-800/30'
 )}
 >
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-3 min-w-0">
 <div
 className={cn(
 'flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors',
 formData.is_active
 ? 'bg-slate-100 border border-emerald-200/80 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300'
 : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
 )}
 >
 {formData.is_active ? (
 <ShieldCheck className="size-5" />
 ) : (
 <Power className="size-5" />
 )}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-900 dark:text-white">
 Jadikan Periode Aktif Utama
 </span>
 <span
 className={cn(
 'inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-bold border',
 formData.is_active
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'bg-slate-200 text-slate-600 border-emerald-300 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
 )}
 >
 <Sparkles className="size-2.5" />
 {formData.is_active ? 'Status Aktif' : 'Nonaktif'}
 </span>
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
 Mengaktifkan tahun ajaran ini akan menjadikannya periode default seluruh sistem sekolah dan menonaktifkan status aktif periode sebelumnya.
 </p>
 </div>
 </div>

 {/* Switch Taktil Modern */}
 <button
 type="button"
 role="switch"
 aria-checked={formData.is_active}
 onClick={() => setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))}
 className={cn(
 'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
 formData.is_active
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white'
 : 'bg-slate-300 dark:bg-slate-700'
 )}
 >
 <span
 className={cn(
 'pointer-events-none inline-block size-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
 formData.is_active ? 'translate-x-5' : 'translate-x-0'
 )}
 />
 </button>
 </div>
 </div>
 </form>

 {/* Modal Footer */}
 <div className="flex items-center justify-between border-t border-emerald-200/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-surface-dark-inner shrink-0">
 <button
 type="button"
 disabled={isSubmitting}
 onClick={onClose}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 text-xs font-extrabold text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 active:scale-95 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
 >
 <X className="size-3.5" strokeWidth={2.2} />
 <span>Batal</span>
 </button>

 <button
 type="submit"
 form="tahun-ajaran-form"
 disabled={isSubmitting}
 className={cn(
 'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black text-white shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50',
 isEdit
 ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
 : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
 )}
 >
 {isSubmitting ? (
 <Loader2 className="size-4 animate-spin" />
 ) : (
 <Save className="size-4" strokeWidth={2.2} />
 )}
 <span>
 {isSubmitting
 ? 'Menyimpan...'
 : isEdit
 ? 'Perbarui Tahun Ajaran'
 : 'Simpan Tahun Ajaran'}
 </span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 )
}
