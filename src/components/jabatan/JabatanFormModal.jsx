import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
 ArrowRight,
 Briefcase,
 Building2,
 CheckCircle2,
 ChevronDown,
 CircleCheck,
 FileText,
 Hash,
 Layers,
 Network,
 Palette,
 ShieldCheck,
 Sparkles,
 Tag,
 UserCheck,
 UserCog,
 UsersRound,
 X,
} from 'lucide-react'
import { AppButton, IconButton, AppInput, AppTextarea, AppCheckbox } from '../app'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'

// Validation Schema using Zod
const jabatanSchema = z.object({
 kode_jabatan: z.string().optional().or(z.literal('')),
 nama_jabatan: z.string().min(2, { message: 'Nama jabatan minimal 2 karakter' }),
 satuan_kerja: z.enum(['Pengurus', 'Bidang Pendidikan', 'Unit Pendidikan']),
 unit_sekolah_id: z.string().optional().nullable(),
 level_jabatan: z.coerce.number().min(1, { message: 'Pilih level jabatan (1-10)' }).max(10),
 atasan_langsung_id: z.string().optional().nullable(),
 atasan_pegawai_id: z.string().optional().nullable(),
 role_sistem_id: z.string().optional().nullable(),
 scope_akses: z.enum(['semua_unit', 'bidang_pendidikan', 'unit_sendiri', 'rombel_sendiri', 'kelas_mapel_sendiri', 'siswa_binaan']),
 urutan: z.coerce.number().min(0, { message: 'Urutan minimal 0' }),
 warna: z.string().min(1, { message: 'Warna wajib dipilih' }),
 ikon: z.string().min(1, { message: 'Ikon wajib dipilih' }),
 deskripsi: z.string().optional().nullable(),
 status: z.enum(['Aktif', 'Nonaktif']),
 tampil_struktur: z.boolean(),
 boleh_login: z.boolean(),
})

const PRESET_WARNA = [
 { hex: '#8B5CF6', label: 'Ungu (Yayasan)' },
 { hex: '#3B82F6', label: 'Biru (Kepala Sekolah)' },
 { hex: '#0284C7', label: 'Biru Muda (Wakil)' },
 { hex: '#0D9488', label: 'Teal (Divisi)' },
 { hex: '#059669', label: 'Hijau Emerald (TU)' },
 { hex: '#10B981', label: 'Hijau (Operator)' },
 { hex: '#D97706', label: 'Amber (Bendahara)' },
 { hex: '#2563EB', label: 'Royal Blue (Guru)' },
 { hex: '#7C3AED', label: 'Violet (Wali Kelas)' },
 { hex: '#DC2626', label: 'Merah (Satpam)' },
 { hex: '#6B7280', label: 'Abu-abu (CS/Umum)' },
]

const PRESET_IKON = [
 { val: 'Crown', label: 'Crown (Mahkota)' },
 { val: 'ShieldCheck', label: 'Shield (Pengurus)' },
 { val: 'UserCog', label: 'UserCog (Kepala/Pimpinan)' },
 { val: 'UserCheck', label: 'UserCheck (Wakil/Wali)' },
 { val: 'Briefcase', label: 'Briefcase (Divisi)' },
 { val: 'Building', label: 'Building (Tata Usaha)' },
 { val: 'Laptop', label: 'Laptop (Operator)' },
 { val: 'Wallet', label: 'Wallet (Bendahara)' },
 { val: 'GraduationCap', label: 'GraduationCap (Guru)' },
 { val: 'Users', label: 'Users (Tim/Wali)' },
 { val: 'BookOpen', label: 'BookOpen (Tahfizh)' },
 { val: 'FileText', label: 'FileText (Staf)' },
 { val: 'Shield', label: 'Shield (Satpam)' },
 { val: 'Broom', label: 'Broom (CS)' },
]

// Fallback statis Level Jabatan — dipakai jika API options belum terpenuhi
const LEVEL_JABATAN_OPTIONS = [
 { value: 1, label: 'Level 1 - Pengurus Yayasan' },
 { value: 2, label: 'Level 2 - Divisi Pendidikan' },
 { value: 3, label: 'Level 3 - Kepala Sekolah' },
 { value: 4, label: 'Level 4 - Wakil Kepala Sekolah' },
 { value: 5, label: 'Level 5 - Kepala Divisi' },
 { value: 6, label: 'Level 6 - Tata Usaha' },
 { value: 7, label: 'Level 7 - Operator Sekolah' },
 { value: 8, label: 'Level 8 - Guru' },
 { value: 9, label: 'Level 9 - Musyrif' },
 { value: 10, label: 'Level 10 - Staf Administrasi' },
]

export default function JabatanFormModal({
 isOpen,
 onClose,
 onSubmit,
 initialData = null,
 options = {},
 isSubmitting = false,
 isKepalaSekolah = false,
 isUnitScopedManager = false,
}) {
 const isEdit = Boolean(initialData?.id)
 const [currentStep, setCurrentStep] = useState(1)

 const {
 register,
 handleSubmit,
 setValue,
 watch,
 reset,
 trigger,
 formState: { errors },
 } = useForm({
 resolver: zodResolver(jabatanSchema),
 defaultValues: {
 kode_jabatan: '',
 nama_jabatan: '',
 satuan_kerja: 'Unit Pendidikan',
 unit_sekolah_id: '',
 level_jabatan: 8,
 atasan_langsung_id: '',
 atasan_pegawai_id: '',
 role_sistem_id: '',
 scope_akses: 'unit_sendiri',
 urutan: 0,
 warna: '#3B82F6',
 ikon: 'UserCheck',
 deskripsi: '',
 status: 'Aktif',
 tampil_struktur: true,
 boleh_login: false,
 },
 })

 const watchWarna = watch('warna')
 const watchNama = watch('nama_jabatan')
 const watchKode = watch('kode_jabatan')
 const watchLevel = watch('level_jabatan')
 const watchDeskripsi = watch('deskripsi')

 useEffect(() => {
 if (isOpen) {
 setCurrentStep(1)
 const defaultUnitId = (isUnitScopedManager && options.unit_sekolah?.[0]?.id)
 ? options.unit_sekolah[0].id
 : ''

 if (initialData) {
 reset({
 kode_jabatan: initialData.kode_jabatan || initialData.code || '',
 nama_jabatan: initialData.nama_jabatan || initialData.name || '',
 satuan_kerja: initialData.satuan_kerja || 'Unit Pendidikan',
 unit_sekolah_id: initialData.unit_sekolah_id || defaultUnitId,
 level_jabatan: initialData.level_jabatan || 8,
 atasan_langsung_id: initialData.atasan_langsung_id || '',
 atasan_pegawai_id: initialData.atasan_pegawai_id || '',
 role_sistem_id: initialData.role_sistem_id ? String(initialData.role_sistem_id) : '',
 scope_akses: initialData.scope_akses || 'unit_sendiri',
 urutan: initialData.urutan || 0,
 warna: initialData.warna || '#3B82F6',
 ikon: initialData.ikon || 'UserCheck',
 deskripsi: initialData.deskripsi || initialData.description || '',
 status: initialData.status === 'Aktif' || initialData.is_active ? 'Aktif' : 'Nonaktif',
 tampil_struktur: typeof initialData.tampil_struktur === 'boolean' ? initialData.tampil_struktur : true,
 boleh_login: typeof initialData.boleh_login === 'boolean' ? initialData.boleh_login : false,
 })
 } else {
 reset({
 kode_jabatan: '',
 nama_jabatan: '',
 satuan_kerja: 'Unit Pendidikan',
 unit_sekolah_id: defaultUnitId,
 level_jabatan: 8,
 atasan_langsung_id: '',
 atasan_pegawai_id: '',
 role_sistem_id: '',
 scope_akses: 'unit_sendiri',
 urutan: 0,
 warna: '#3B82F6',
 ikon: 'UserCheck',
 deskripsi: '',
 status: 'Aktif',
 tampil_struktur: true,
 boleh_login: false,
 })
 }
 }
 }, [isOpen, initialData, reset, isUnitScopedManager, options.unit_sekolah])

 if (!isOpen) return null

 const handleNext = async () => {
 if (currentStep === 1) {
 const isValid = await trigger(['nama_jabatan', 'kode_jabatan'])
 if (isValid) setCurrentStep(2)
 } else if (currentStep === 2) {
 const isValid = await trigger(['level_jabatan', 'unit_sekolah_id'])
 if (isValid) setCurrentStep(3)
 } else if (currentStep === 3) {
 setCurrentStep(4)
 }
 }

 const submitHandler = (data) => {
 onSubmit(data)
 }

 const stepList = [
 { step: 1, label: 'Identitas & Kode' },
 { step: 2, label: 'Level & Afiliasi' },
 { step: 3, label: 'Visual & Hak Akses' },
 { step: 4, label: 'Konfirmasi' },
 ]

 return (
 <div
 id="jabatan-form-modal"
 className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
 role="dialog"
 aria-modal="true"
 aria-labelledby="form-jabatan-title"
 tabIndex={-1}
 onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
 >
 <div className="modal-dialog font-sans my-auto w-full max-w-4xl">
 <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-card-dark dark:shadow-black/60">
 {/* Top accent line */}

 {/* Modal Header Bar */}
 <div className="modal-header flex items-center justify-between border-b border-emerald-200/80 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 text-[#059669] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#10B981]">
 <Network className="h-5 w-5" strokeWidth={2.25} />
 </div>
 <div>
 <h3 id="form-jabatan-title" className="modal-title text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 {isEdit ? 'Edit Jabatan' : 'Tambah Jabatan'}
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#059669] border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
 <Sparkles className="size-3" /> {isEdit ? 'Update' : 'Baru'}
 </span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lengkapi informasi struktur jabatan kepegawaian.</p>
 </div>
 </div>
        <IconButton
          icon={X}
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Tutup form jabatan"
        />
 </div>

 {/* Modal Main Body Grid */}
 <form onSubmit={handleSubmit(submitHandler)} className="flex min-h-0 flex-1 flex-col">
 <div className="modal-body flex min-h-0 flex-1 flex-col overflow-y-auto p-0">
 {/* Horizontal Wizard Stepper */}
 <div className="flex shrink-0 items-center justify-between gap-1 overflow-x-auto border-b border-emerald-100/80 bg-slate-50/60 p-3.5 dark:border-emerald-800/80 dark:bg-slate-900/40">
 {stepList.map((s) => {
 const isActive = currentStep === s.step
 const isDone = currentStep > s.step
 return (
 <button
 key={s.step}
 type="button"
 onClick={() => setCurrentStep(s.step)}
 className={`flex flex-1 min-w-max items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
 isActive
 ? 'bg-white dark:bg-[#1B2433] shadow-md'
 : isDone
 ? 'bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'bg-white text-slate-500 border border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900 dark:border-emerald-800/60 dark:text-slate-400'
 }`}
 >
 <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-extrabold ${
 isActive ? 'bg-white/20' : isDone ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {s.step}
 </span>
 <span className="truncate">{s.label}</span>
 </button>
 )
 })}
 </div>

 {/* Right Main Column / Form Content */}
 <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
 {/* STEP 1: Identitas & Kode */}
 {currentStep === 1 && (
 <div className="space-y-4">
 <div className="flex items-center justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
 <Briefcase className="size-4 text-[#059669] dark:text-[#10B981]" />
 Identitas Utama Jabatan
 </h3>
 <span className="text-xs font-semibold text-slate-400">* Wajib diisi</span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Satuan Kerja */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Satuan Kerja <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={watch('satuan_kerja')}
 onChange={(val) => setValue('satuan_kerja', val, { shouldValidate: true })}
 options={(options.satuan_kerja || [
 { value: 'Pengurus', label: 'Pengurus' },
 { value: 'Bidang Pendidikan', label: 'Bidang Pendidikan' },
 { value: 'Unit Pendidikan', label: 'Unit Pendidikan' },
 ])
 .filter((item) => isUnitScopedManager
 ? item.value === 'Unit Pendidikan'
 : (!isKepalaSekolah || item.value !== 'Pengurus'))
 .map((item) => ({ value: item.value, label: item.label }))}
 placeholder="Pilih Satuan Kerja"
 icon={Building2}
 ariaLabel="Pilih satuan kerja"
 size="md"
 className="w-full"
 />
 </div>

 {/* Kode Jabatan */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Kode Jabatan <span className="text-slate-400 font-normal">(Auto jika kosong)</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <Tag className="size-4" />
 </div>
 <AppInput type="text" size="sm" placeholder="NIY-2026xxxx / JBT-001"
 value={watch('kode_jabatan') || ''}
 onChange={(e) => setValue('kode_jabatan', e.target.value, { shouldValidate: true })}
 className="pl-10"
 />
 </div>
 {errors.kode_jabatan && (
 <p className="text-xs font-semibold text-rose-500">{errors.kode_jabatan.message}</p>
 )}
 </div>

 {/* Nama Jabatan */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Nama Jabatan <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <UserCog className="size-4" />
 </div>
 <AppInput type="text" size="sm" placeholder="Contoh: Kepala Sekolah / Guru Kelas"
 value={watch('nama_jabatan') || ''}
 onChange={(e) => setValue('nama_jabatan', e.target.value, { shouldValidate: true })}
 className={`pl-10 ${errors.nama_jabatan ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50' : ''}`}
 />
 </div>
 {errors.nama_jabatan && (
 <p className="text-xs font-semibold text-rose-500">{errors.nama_jabatan.message}</p>
 )}
 </div>

 {/* Cakupan Akses */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Cakupan Akses <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={watch('scope_akses')}
 onChange={(val) => setValue('scope_akses', val, { shouldValidate: true })}
 options={(options.scope_akses || [
 { value: 'semua_unit', label: 'Semua Unit' },
 { value: 'bidang_pendidikan', label: 'Bidang Pendidikan' },
 { value: 'unit_sendiri', label: 'Unit Pendidikan Sendiri' },
 { value: 'rombel_sendiri', label: 'Rombel Sendiri' },
 { value: 'kelas_mapel_sendiri', label: 'Kelas & Mata Pelajaran Sendiri' },
 { value: 'siswa_binaan', label: 'Siswa Binaan' },
 ])
 .filter((item) => !isUnitScopedManager || !['semua_unit', 'bidang_pendidikan'].includes(item.value))
 .map((item) => ({ value: item.value, label: item.label }))}
 placeholder="Pilih Cakupan Akses"
 icon={ShieldCheck}
 ariaLabel="Pilih cakupan akses"
 size="md"
 className="w-full"
 />
 </div>
 </div>

 {/* Deskripsi */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Deskripsi / Tugas Pokok Jabatan
 </label>
 <div className="relative flex items-start">
 <div className="pointer-events-none absolute left-3.5 top-3 z-10 flex items-center text-slate-400 dark:text-slate-500">
 <FileText className="size-4" />
 </div>
 <AppTextarea rows={3} placeholder="Penjelasan ringkas peran, wewenang, dan deskripsi pekerjaan..."
 value={watch('deskripsi') || ''}
 onChange={(e) => setValue('deskripsi', e.target.value)}
 className="pl-10"
 />
 </div>
 </div>
 </div>
 )}

 {/* STEP 2: Level & Afiliasi */}
 {currentStep === 2 && (
 <div className="space-y-4">
 <div className="flex items-center justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
 <Layers className="size-4 text-[#059669] dark:text-[#10B981]" />
 Level Hirarki & Afiliasi Unit
 </h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Level Jabatan */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Level Jabatan <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={String(watch('level_jabatan') ?? '')}
 onChange={(val) => setValue('level_jabatan', Number(val), { shouldValidate: true })}
 options={[
 { value: '', label: '-- Pilih Level Jabatan --' },
 ...(options.level_jabatan?.length > 0 ? options.level_jabatan : LEVEL_JABATAN_OPTIONS)
 .filter((lvl) => !isUnitScopedManager || Number(lvl.value) > 2)
 .filter((lvl) => !isKepalaSekolah || Number(lvl.value) !== 1)
 .map((lvl) => ({ value: String(lvl.value), label: lvl.label })),
 ]}
 placeholder="-- Pilih Level Jabatan --"
 icon={Layers}
 ariaLabel="Pilih level jabatan"
 size="md"
 className="w-full"
 />
 {errors.level_jabatan && (
 <p className="text-xs font-semibold text-rose-500">{errors.level_jabatan.message}</p>
 )}
 </div>

 {/* Unit Sekolah */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Unit Sekolah / Yayasan
 <span className="text-slate-400 font-normal ml-1">(dari Data Unit Pendidikan)</span>
 </label>
 <HeroUiFilterSelect
 value={String(watch('unit_sekolah_id') ?? '')}
 onChange={(val) => setValue('unit_sekolah_id', val, { shouldValidate: true })}
 options={[
 ...(!isUnitScopedManager ? [{ value: '', label: '-- Semua Unit / Yayasan --' }] : []),
 ...(options.unit_sekolah || []).map((unit) => ({
 value: String(unit.id),
 label: `${unit.nama} ${unit.kode ? `(${unit.kode})` : ''}`,
 })),
 ]}
 placeholder="-- Semua Unit / Yayasan --"
 icon={Building2}
 ariaLabel="Pilih unit sekolah"
 size="md"
 searchable
 className="w-full"
 />
 {(options.unit_sekolah || []).length === 0 && (
 <p className="text-xs font-medium text-amber-700">Belum ada data unit pendidikan. Tambahkan di menu Unit Pendidikan.</p>
 )}
 {isUnitScopedManager && (
 <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
 <Sparkles className="size-3 shrink-0" />
 Unit otomatis terhubung sesuai wilayah wewenang unit akun Anda.
 </p>
 )}
 </div>

 {/* Atasan Langsung */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Atasan Langsung
 <span className="text-slate-400 font-normal ml-1">(dari Data Pegawai)</span>
 </label>
 <HeroUiFilterSelect
 value={String(watch('atasan_pegawai_id') ?? '')}
 onChange={(val) => setValue('atasan_pegawai_id', val, { shouldValidate: true })}
 options={[
 { value: '', label: '-- Tidak Ada / Langsung ke Yayasan --' },
 ...(options.atasan_langsung || []).map((p) => ({
 value: String(p.id),
 label: `${p.nama_pegawai}${p.nama_jabatan ? ` — ${p.nama_jabatan}` : ''}${p.niy ? ` (${p.niy})` : ''}`,
 })),
 ]}
 placeholder="-- Tidak Ada / Langsung ke Yayasan --"
 icon={UsersRound}
 ariaLabel="Pilih atasan langsung"
 size="md"
 searchable
 className="w-full"
 />
 {(options.atasan_langsung || []).length === 0 && (
 <p className="text-xs font-medium text-amber-700">Belum ada data pegawai aktif. Tambahkan di menu Kepegawaian.</p>
 )}
 </div>

 {/* Role Sistem */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 Role Sistem
 <span className="text-slate-400 font-normal ml-1">(dari Tabel Hak Akses)</span>
 </label>
 <HeroUiFilterSelect
 value={String(watch('role_sistem_id') ?? '')}
 onChange={(val) => setValue('role_sistem_id', val, { shouldValidate: true })}
 options={[
 { value: '', label: '-- Tanpa Role / Atur Manual --' },
 ...(options.role_sistem || []).map((r) => ({
 value: String(r.id),
 label: r.name,
 })),
 ]}
 placeholder="-- Tanpa Role / Atur Manual --"
 icon={ShieldCheck}
 ariaLabel="Pilih role sistem"
 size="md"
 searchable
 className="w-full"
 />
 {(options.role_sistem || []).length === 0 && (
 <p className="text-xs text-amber-500 font-medium">⚠ Belum ada role terdaftar. Tambahkan di menu Hak Akses.</p>
 )}
 </div>
 </div>
 </div>
 )}

 {/* STEP 3: Visual & Hak Akses */}
 {currentStep === 3 && (
 <div className="space-y-4">
 <div className="flex items-center justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
 <Palette className="size-4 text-[#059669] dark:text-[#10B981]" />
 Visual & Konfigurasi Fitur
 </h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {/* Urutan Tampilan */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Urutan Tampilan</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Hash className="size-4" />
 </div>
 <AppInput
                    type="number"
                    min="0"
                    {...register('urutan')}
                    className="pl-10"
                  />
 </div>
 </div>

 {/* Warna Indikator */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Warna Indikator</label>
 <div className="flex items-center space-x-2">
 <input
 type="color"
 {...register('warna')}
 className="h-9 w-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer p-0.5 shadow-2xs hover:scale-105 transition-transform dark:border-emerald-700/80"
 />
 <input
 type="text"
 {...register('warna')}
 placeholder="#3B82F6"
 className="w-full rounded-xl border border-emerald-200/80 bg-slate-50/50 px-3 py-2.5 text-xs font-mono font-bold uppercase text-slate-800 focus:border-[#059669] focus:bg-white focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 <div className="flex flex-wrap gap-1.5 mt-2">
 {PRESET_WARNA.map((p) => (
 <button
 key={p.hex}
 type="button"
 onClick={() => setValue('warna', p.hex)}
 className={`h-5 w-5 rounded-full border border-emerald-200/80 transition-transform cursor-pointer ${
 watchWarna === p.hex ? 'scale-125 ring-2 ring-[#059669]' : 'hover:scale-110'
 }`}
 style={{ backgroundColor: p.hex }}
 title={p.label}
 />
 ))}
 </div>
 </div>

 {/* Pilihan Ikon */}
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Pilihan Ikon</label>
 <HeroUiFilterSelect
 value={watch('ikon')}
 onChange={(val) => setValue('ikon', val, { shouldValidate: true })}
 options={PRESET_IKON.map((i) => ({ value: i.val, label: i.label }))}
 placeholder="Pilih Ikon"
 icon={UserCheck}
 ariaLabel="Pilih ikon visual"
 size="md"
 className="w-full"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60 p-4 rounded-xl border border-emerald-200/80 dark:bg-slate-900/40 dark:border-emerald-800/60">
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Status Operasional</label>
 <HeroUiFilterSelect
 value={watch('status')}
 onChange={(val) => setValue('status', val, { shouldValidate: true })}
 options={[
 { value: 'Aktif', label: 'Aktif' },
 { value: 'Nonaktif', label: 'Nonaktif' },
 ]}
 placeholder="Status Operasional"
 icon={CheckCircle2}
 ariaLabel="Pilih status operasional"
 size="md"
 className="w-full"
 />
 </div>

 <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200/80 dark:bg-slate-900 dark:border-emerald-800/60">
 <div>
 <span className="text-xs font-extrabold text-slate-900 dark:text-white block">Tampil Struktur</span>
 <span className="text-[10px] text-slate-500 dark:text-slate-400">Bagan Organisasi</span>
 </div>
 <AppCheckbox
                    isSelected={watch('tampil_struktur')}
                    onValueChange={(val) => setValue('tampil_struktur', val)}
                  />
 </div>

 <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200/80 dark:bg-slate-900 dark:border-emerald-800/60">
 <div>
 <span className="text-xs font-extrabold text-slate-900 dark:text-white block">Boleh Login</span>
 <span className="text-[10px] text-slate-500 dark:text-slate-400">Akun Pengguna</span>
 </div>
 <AppCheckbox
                    isSelected={watch('boleh_login')}
                    onValueChange={(val) => setValue('boleh_login', val)}
                  />
 </div>
 </div>
 </div>
 )}

 {/* STEP 4: Konfirmasi */}
 {currentStep === 4 && (
 <div className="space-y-4">
 <div className="flex items-center justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
 <CheckCircle2 className="size-4 text-[#059669] dark:text-[#10B981]" />
 Konfirmasi Data Jabatan
 </h3>
 </div>

 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/60 p-5 space-y-3 text-xs dark:bg-slate-900/40 dark:border-emerald-800/60">
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Nama Jabatan:</span>
 <span className="font-extrabold text-slate-900 dark:text-white">{watchNama || '-'}</span>
 </div>
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Kode Jabatan:</span>
 <span className="font-bold text-slate-800 font-mono dark:text-slate-200">{watchKode || 'Auto-generated'}</span>
 </div>
 <div className="flex justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 <span className="text-slate-500 font-medium">Level Jabatan:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">Level {watchLevel}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500 font-medium">Deskripsi:</span>
 <span className="font-medium text-slate-700 dark:text-slate-300">{watchDeskripsi || '-'}</span>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>

      {/* Modal Bottom Action Footer */}
      <div className="modal-footer flex items-center justify-between border-t border-emerald-100/80 bg-white px-6 py-4 dark:border-emerald-800/60 dark:bg-slate-950">
        <AppButton variant="ghost" size="md" onClick={onClose}>
          Batal
        </AppButton>

        <div className="flex items-center gap-2.5">
          {currentStep < 4 ? (
            <AppButton
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="end"
              onClick={handleNext}
            >
              Selanjutnya
            </AppButton>
          ) : (
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              icon={CircleCheck}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEdit ? "Simpan Perubahan" : "Simpan Jabatan"}
            </AppButton>
          )}
        </div>
      </div>
    </form>
  </div>
</div>
</div>
)
}
