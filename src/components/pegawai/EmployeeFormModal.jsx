import { AppButton, IconButton } from '../app'
import React, { useMemo } from 'react'
import AppModal from '../app/AppModal'
import {
 Activity,
 ArrowLeft,
 ArrowRight,
 Award,
 BadgeCheck,
 BriefcaseBusiness,
 Building,
 Building2,
 Calendar,
 CheckCircle2,
 Globe,
 GraduationCap,
 Hash,
 Heart,
 IdCard,
 Mail,
 MapPin,
 Phone,
 Sparkles,
 Upload,
 User,
 UserCheck,
 UserPlus,
 Users,
 X,
} from 'lucide-react'
import PersonAvatar from '../ui/PersonAvatar'
import { Spinner } from '@/components/ui/spinner'
import { DatePicker } from '@/components/ui/date-picker'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'

export const DEFAULT_RELIGION_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']
export const DEFAULT_MARITAL_OPTIONS = ['Menikah', 'Belum Menikah', 'Cerai Hidup', 'Cerai Mati']
export const DEFAULT_EDUCATION_OPTIONS = ['SD/MI', 'SMP/MTs', 'SMA/SMK/MA', 'D1/D2/D3', 'S1/D4', 'S2', 'S3', 'Tidak Sekolah']
export const DEFAULT_EMPLOYEE_STATUS_OPTIONS = ['Tetap', 'Kontrak', 'Honorer', 'Magang', 'Percobaan', 'Non-Aktif']
export const DEFAULT_STATUS_OPTIONS = ['Aktif', 'Nonaktif', 'Cuti', 'Resign']

export default function EmployeeFormModal({
 isOpen,
 onClose,
 isEditMode = false,
 currentStep = 1,
 setCurrentStep,
 formData,
 setFormData,
 onSubmit,
 isSubmitting = false,
 unitsList = [],
 positionsList = [],
 statusPegawaiOptions = DEFAULT_EMPLOYEE_STATUS_OPTIONS,
 maritalStatusOptions = DEFAULT_MARITAL_OPTIONS,
 lastEducationOptions = DEFAULT_EDUCATION_OPTIONS,
 religionOptions = DEFAULT_RELIGION_OPTIONS,
 handleFotoUpload,
 isUnitPersonnelManager = false,
 isGlobalPersonnelManager = true,
 userUnitId = '',
 canDeleteEmployee = false,
 toggleEmployeeStatus,
 onDeleteTarget,
}) {

 // Isolasi Unit: Kunci unit jika user bukan global manager atau adalah unit personnel manager
 const isUnitLocked = (!isGlobalPersonnelManager || isUnitPersonnelManager) && Boolean(userUnitId)

 // Filter daftar unit hanya untuk unit user jika dalam mode isolasi unit
 const filteredUnitsList = useMemo(() => {
 if (isUnitLocked) {
 const scoped = unitsList.filter((u) => String(u.id ?? u.unit_id ?? '') === String(userUnitId))
 return scoped.length > 0 ? scoped : (userUnitId ? [{ id: userUnitId, name: 'Unit Pengguna' }] : unitsList)
 }
 return unitsList
 }, [unitsList, isUnitLocked, userUnitId])

 // Normalisasi opsi status pegawai unik
 const availableStatusPegawai = useMemo(() => {
 return Array.from(new Set([...statusPegawaiOptions, formData.status_pegawai].filter(Boolean)))
 }, [statusPegawaiOptions, formData.status_pegawai])

 // Normalisasi opsi status perkawinan unik
 const availableMaritalStatus = useMemo(() => {
 return Array.from(new Set([...maritalStatusOptions, formData.status_perkawinan].filter(Boolean)))
 }, [maritalStatusOptions, formData.status_perkawinan])

 // Normalisasi opsi pendidikan terakhir unik
 const availableLastEducation = useMemo(() => {
 return Array.from(new Set([...lastEducationOptions, formData.pendidikan_terakhir].filter(Boolean)))
 }, [lastEducationOptions, formData.pendidikan_terakhir])

 // Normalisasi opsi agama unik
 const availableReligions = useMemo(() => {
 return Array.from(new Set([...religionOptions, formData.agama].filter(Boolean)))
 }, [religionOptions, formData.agama])

 const handleNikChange = (e) => {
 const rawVal = e.target.value
 // Filter angka saja, batas 16 digit sesuai NIK standar Dukcapil
 const cleanDigits = rawVal.replace(/\D/g, '').slice(0, 16)
 setFormData((p) => ({ ...p, nik: cleanDigits }))
 }

 const handlePhoneChange = (e) => {
 const rawVal = e.target.value
 // Boleh angka, spasi, dash, plus
 const cleanPhone = rawVal.replace(/[^\d+-\s]/g, '').slice(0, 20)
 setFormData((p) => ({ ...p, no_hp: cleanPhone }))
 }

  return (
    <AppModal
      isOpen={Boolean(isOpen)}
      onClose={() => !isSubmitting && onClose()}
      title={isEditMode ? (isUnitPersonnelManager ? 'Edit Jabatan Pegawai' : 'Edit Pegawai') : 'Tambah Pegawai'}
      badge={isEditMode ? 'Update' : 'Baru'}
      description={`Langkah ${currentStep} dari 4 · ${
        currentStep === 1 ? 'Identitas & Foto' :
        currentStep === 2 ? 'Kepegawaian' :
        currentStep === 3 ? 'Kontak & Alamat' :
        'Konfirmasi Data'
      }`}
      icon={UserPlus}
      maxWidth="max-w-4xl"
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      headerActions={
        isUnitPersonnelManager ? (
          <span className="hidden sm:inline-flex rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white border border-white/30">
            Hanya jabatan unit ini yang dapat diubah
          </span>
        ) : null
      }
      subHeader={
 <div className="border-b border-emerald-100/80 bg-slate-50/70 p-2 sm:p-2.5 dark:border-emerald-800/60 dark:bg-slate-900/50 overflow-x-auto no-scrollbar">
 <div className="grid grid-cols-4 gap-1 sm:gap-2 min-w-[280px]">
 {[
 { step: 1, label: 'Identitas & Foto', shortLabel: 'Identitas', icon: UserCheck },
 { step: 2, label: 'Kepegawaian', shortLabel: 'Kepegawaian', icon: BriefcaseBusiness },
 { step: 3, label: 'Kontak & Alamat', shortLabel: 'Kontak', icon: Phone },
 { step: 4, label: 'Konfirmasi', shortLabel: 'Selesai', icon: CheckCircle2 },
 ].map((s) => {
 const isActive = currentStep === s.step
 const isDone = currentStep > s.step
 return (
 <button
 key={s.step}
 type="button"
 onClick={() => setCurrentStep(s.step)}
 className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1.5 sm:px-2.5 text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer min-w-0 ${
 isActive
 ? 'bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50'
 : isDone
 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100/80 border-2 border-[#b6f6d9] dark:border-emerald-800/60'
 : 'bg-white text-slate-400 border-2 border-[#b6f6d9] hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/60 dark:border-emerald-700/80/60 dark:text-slate-500'
 }`}
 >
 <s.icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
 <span className="hidden sm:inline truncate">{s.label}</span>
 <span className="sm:hidden truncate">{s.shortLabel}</span>
 </button>
 )
 })}
 </div>
 </div>

      }
      footer={
        <div className="flex w-full flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            {currentStep > 1 && !isUnitPersonnelManager && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                <ArrowLeft className="size-4" />
                <span>Kembali</span>
              </button>
            )}
            {currentStep < 4 && !isUnitPersonnelManager && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="size-4 ml-1" strokeWidth={2} />
              </button>
            )}
            {(currentStep === 4 || isEditMode || isUnitPersonnelManager) && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onSubmit}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
              >
                {isSubmitting && <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                <span>{isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Pegawai'}</span>
              </button>
            )}
          </div>
        </div>
      }
    >
 {/* Banner Status in Edit Mode */}
 {isEditMode && (
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-teal-950/20">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border-2 border-[#b6f6d9] dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 font-black text-xs">
 {formData.niy ? formData.niy.slice(-3) : 'NIY'}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-black text-slate-900 dark:text-white">{formData.nama_lengkap}</span>
 <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold dark:bg-emerald-900/60 dark:text-emerald-300">
 {formData.status || 'Aktif'}
 </span>
 </div>
 <p className="text-xs font-semibold text-slate-500">
 {formData.niy || '-'} · {formData.status_pegawai || 'Tetap'}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 {isGlobalPersonnelManager && typeof toggleEmployeeStatus === 'function' && (
 <button
 type="button"
 onClick={() => toggleEmployeeStatus(formData)}
 className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
 >
 {formData.status === 'Aktif' ? 'Nonaktifkan Pegawai' : 'Aktifkan Pegawai'}
 </button>
 )}
 {canDeleteEmployee && typeof onDeleteTarget === 'function' && (
 <button
 type="button"
 onClick={() => {
 onDeleteTarget(formData)
 onClose()
 }}
 className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
 >
 Hapus Pegawai
 </button>
 )}
 </div>
 </div>
 )}

 {/* STEP 1: Identitas & Foto */}
 {currentStep === 1 && (
 <div className="space-y-4">
 <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 Identitas Pegawai
 </h3>

 {/* Upload Foto */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Foto Pegawai</label>
 {formData.foto ? (
 <div className="flex items-center gap-4 p-3.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-800/60">
 <PersonAvatar
 src={formData.foto}
 name={formData.nama_lengkap}
 size="detail"
 className="h-16 w-16 shrink-0 border-2 border-[#b6f6d9] dark:border-emerald-800/60 shadow-sm"
 />
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Foto Berhasil Diunggah</p>
 <button
 type="button"
 onClick={() => setFormData((p) => ({ ...p, foto: '' }))}
 className="text-xs font-bold text-rose-600 hover:underline mt-1 inline-block cursor-pointer"
 >
 Hapus Foto & Upload Ulang
 </button>
 </div>
 </div>
 ) : (
 <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 p-5 text-center hover:bg-emerald-50/35 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer transition-all dark:border-emerald-800/60 dark:bg-slate-900/30">
 <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] border-2 border-[#b6f6d9] dark:border-emerald-800/60 text-[#059669] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#10B981]">
 <Upload className="size-5" strokeWidth={2.2} />
 </div>
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Upload Foto Profil</span>
 <span className="text-xs text-slate-400 mt-0.5">PNG, JPG Maksimal 2MB</span>
 <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
 </label>
 )}
 </div>

 {/* NIY & NIK */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 NIY (Nomor Induk Yayasan) <span className="text-slate-400 font-normal">(Auto jika kosong)</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Hash className="size-4" />
 </div>
 <input
 type="text"
 placeholder="NIY-2026xxxx"
 value={formData.niy || ''}
 onChange={(e) => setFormData((p) => ({ ...p, niy: e.target.value.trimStart() }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 NIK (Nomor Induk Kependudukan) <span className="text-slate-400 font-normal">(16 digit angka)</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <IdCard className="size-4" />
 </div>
 <input
 type="text"
 maxLength={16}
 placeholder="1371xxxxxxxxxxxx"
 value={formData.nik || ''}
 onChange={handleNikChange}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20 font-mono"
 />
 </div>
 </div>
 </div>

 {/* Gelar Depan & Nama Lengkap */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Gelar Depan</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <GraduationCap className="size-4" />
 </div>
 <input
 type="text"
 placeholder="Ust. / Dr."
 value={formData.gelar_depan || ''}
 onChange={(e) => setFormData((p) => ({ ...p, gelar_depan: e.target.value }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Nama Lengkap <span className="text-rose-500">*</span>
 </label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <User className="size-4" />
 </div>
 <input
 type="text"
 required
 placeholder="Ahmad Farhan"
 value={formData.nama_lengkap || ''}
 onChange={(e) => setFormData((p) => ({ ...p, nama_lengkap: e.target.value }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 </div>

 {/* Gelar Belakang & Nama Panggilan */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Gelar Belakang</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Award className="size-4" />
 </div>
 <input
 type="text"
 placeholder="S.Pd / M.Pd"
 value={formData.gelar_belakang || ''}
 onChange={(e) => setFormData((p) => ({ ...p, gelar_belakang: e.target.value }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Nama Panggilan</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <UserCheck className="size-4" />
 </div>
 <input
 type="text"
 placeholder="Farhan"
 value={formData.nama_panggilan || ''}
 onChange={(e) => setFormData((p) => ({ ...p, nama_panggilan: e.target.value }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 </div>

 {/* Jenis Kelamin, Tempat Lahir, Tanggal Lahir */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Jenis Kelamin <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={formData.jenis_kelamin || 'L'}
 onChange={(val) => setFormData((p) => ({ ...p, jenis_kelamin: val }))}
 options={[
 { value: 'L', label: 'Laki-laki (L)' },
 { value: 'P', label: 'Perempuan (P)' },
 ]}
 placeholder="Pilih Jenis Kelamin"
 icon={Users}
 ariaLabel="Pilih jenis kelamin"
 size="md"
 className="w-full"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tempat Lahir</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <MapPin className="size-4" />
 </div>
 <input
 type="text"
 placeholder="Padang"
 value={formData.tempat_lahir || ''}
 onChange={(e) => setFormData((p) => ({ ...p, tempat_lahir: e.target.value }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Lahir</label>
 <DatePicker
 value={formData.tanggal_lahir || ''}
 onChange={(e) => setFormData((p) => ({ ...p, tanggal_lahir: e.target.value }))}
 inputClassName="py-2.5 text-xs font-semibold"
 placeholder="Pilih tanggal lahir..."
 />
 </div>
 </div>

 {/* Agama, Status Perkawinan, Pendidikan Terakhir */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Agama</label>
 <HeroUiFilterSelect
 value={formData.agama || 'Islam'}
 onChange={(val) => setFormData((p) => ({ ...p, agama: val }))}
 options={availableReligions.map((rel) => ({ value: rel, label: rel }))}
 placeholder="Pilih Agama"
 icon={Heart}
 ariaLabel="Pilih agama"
 size="md"
 className="w-full"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Status Perkawinan</label>
 <HeroUiFilterSelect
 value={formData.status_perkawinan || ''}
 onChange={(val) => setFormData((p) => ({ ...p, status_perkawinan: val }))}
 options={[
 { value: '', label: 'Pilih Status Perkawinan' },
 ...availableMaritalStatus.map((ms) => ({ value: ms, label: ms })),
 ]}
 placeholder="Pilih Status Perkawinan"
 icon={Heart}
 ariaLabel="Pilih status perkawinan"
 size="md"
 className="w-full"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Pendidikan Terakhir</label>
 <HeroUiFilterSelect
 value={formData.pendidikan_terakhir || ''}
 onChange={(val) => setFormData((p) => ({ ...p, pendidikan_terakhir: val }))}
 options={[
 { value: '', label: 'Pilih Pendidikan Terakhir' },
 ...availableLastEducation.map((edu) => ({ value: edu, label: edu })),
 ]}
 placeholder="Pilih Pendidikan Terakhir"
 icon={GraduationCap}
 ariaLabel="Pilih pendidikan terakhir"
 size="md"
 className="w-full"
 />
 </div>
 </div>
 </div>
 )}

 {/* STEP 2: Kepegawaian */}
 {currentStep === 2 && (
 <div className="space-y-4">
 <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 Status & Penempatan Kepegawaian
 </h3>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Unit Kerja / Sekolah
 {isUnitLocked && (
 <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold ml-1.5">
 (Terkunci Unit Anda)
 </span>
 )}
 </label>
 <HeroUiFilterSelect
 value={formData.unit_id || ''}
 onChange={(val) => setFormData((p) => ({ ...p, unit_id: val }))}
 options={[
 { value: '', label: 'Pilih Unit Pendidikan' },
 ...filteredUnitsList.map((u) => ({ value: String(u.id), label: u.name })),
 ]}
 disabled={isUnitLocked || isUnitPersonnelManager}
 placeholder="Pilih Unit Pendidikan"
 icon={Building2}
 ariaLabel="Pilih unit pendidikan"
 size="md"
 searchable
 className="w-full"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Jabatan Master</label>
 <HeroUiFilterSelect
 value={formData.jabatan_id || ''}
 onChange={(val) => setFormData((p) => ({ ...p, jabatan_id: val }))}
 options={[
 { value: '', label: 'Pilih Jabatan' },
 ...positionsList.map((p) => ({ value: String(p.id), label: p.name })),
 ]}
 placeholder="Pilih Jabatan"
 icon={BriefcaseBusiness}
 ariaLabel="Pilih jabatan"
 size="md"
 searchable
 className="w-full"
 />
 </div>
 </div>

 <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isUnitPersonnelManager ? 'hidden' : ''}`}>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Status Pegawai</label>
 <HeroUiFilterSelect
 value={formData.status_pegawai || 'Tetap'}
 onChange={(val) => setFormData((p) => ({ ...p, status_pegawai: val }))}
 options={availableStatusPegawai.map((st) => ({ value: st, label: st }))}
 placeholder="Status Pegawai"
 icon={BadgeCheck}
 ariaLabel="Pilih status pegawai"
 size="md"
 className="w-full"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Status Keaktifan</label>
 <HeroUiFilterSelect
 value={formData.status || 'Aktif'}
 onChange={(val) => setFormData((p) => ({ ...p, status: val }))}
 options={DEFAULT_STATUS_OPTIONS.map((st) => ({ value: st, label: st }))}
 placeholder="Status Keaktifan"
 icon={Activity}
 ariaLabel="Pilih status keaktifan"
 size="md"
 className="w-full"
 />
 </div>
 </div>

 <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isUnitPersonnelManager ? 'hidden' : ''}`}>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Masuk</label>
 <DatePicker
 value={formData.tanggal_masuk || ''}
 onChange={(e) => setFormData((p) => ({ ...p, tanggal_masuk: e.target.value }))}
 inputClassName="py-2.5 text-xs font-semibold"
 placeholder="Pilih tanggal masuk..."
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Keluar (Jika Ada)</label>
 <DatePicker
 value={formData.tanggal_keluar || ''}
 onChange={(e) => setFormData((p) => ({ ...p, tanggal_keluar: e.target.value }))}
 inputClassName="py-2.5 text-xs font-semibold"
 placeholder="Pilih tanggal keluar..."
 />
 </div>
 </div>
 </div>
 )}

 {/* STEP 3: Kontak & Alamat */}
 {currentStep === 3 && (
 <div className="space-y-4">
 <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 Kontak & Alamat
 </h3>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">No. WhatsApp / HP</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Phone className="size-4" />
 </div>
 <input
 type="text"
 placeholder="0812-3456-7890"
 value={formData.no_hp || ''}
 onChange={handlePhoneChange}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Email Pegawai</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Mail className="size-4" />
 </div>
 <input
 type="email"
 placeholder="contoh: pegawai@sekolah.sch.id"
 value={formData.email || ''}
 onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value.trim() }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Alamat Tempat Tinggal</label>
 <div className="relative">
 <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
 <MapPin className="size-4" />
 </div>
 <textarea
 rows={3}
 placeholder="Jl. Khatib Sulaiman No. 20..."
 value={formData.alamat || ''}
 onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20 resize-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Kota / Kabupaten</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Building className="size-4" />
 </div>
 <input
 type="text"
 placeholder="Padang"
 value={formData.kota || ''}
 onChange={(e) => setFormData((p) => ({ ...p, kota: e.target.value }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Provinsi</label>
 <div className="relative flex items-center">
 <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
 <Globe className="size-4" />
 </div>
 <input
 type="text"
 placeholder="Sumatera Barat"
 value={formData.provinsi || ''}
 onChange={(e) => setFormData((p) => ({ ...p, provinsi: e.target.value }))}
 className="w-full rounded-xl border-2 border-[#b6f6d9] bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-300 focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/12 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-600/80 dark:focus:border-[#10B981] dark:focus:bg-slate-900 dark:focus:ring-[#10B981]/20"
 />
 </div>
 </div>
 </div>
 </div>
 )}

 {/* STEP 4: Konfirmasi */}
 {!isUnitPersonnelManager && currentStep === 4 && (
 <div className="space-y-4">
 <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2">
 Konfirmasi Data Pegawai
 </h3>

 <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:bg-slate-900/60 dark:border-emerald-800/60 p-4 sm:p-5 space-y-2.5 sm:space-y-3 text-xs">
 <div className="flex flex-col sm:flex-row sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">NIY:</span>
 <span className="font-bold text-slate-800 dark:text-white break-words">{formData.niy || '(Otomatis di-generate)'}</span>
 </div>
 <div className="flex flex-col sm:flex-row sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">NIK:</span>
 <span className="font-bold text-slate-800 dark:text-white">{formData.nik || '-'}</span>
 </div>
 <div className="flex flex-col sm:flex-row sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">Nama Lengkap:</span>
 <span className="font-bold text-slate-800 dark:text-white break-words">
 {[formData.gelar_depan, formData.nama_lengkap, formData.gelar_belakang].filter(Boolean).join(' ') || '-'}
 </span>
 </div>
 <div className="flex flex-col sm:flex-row sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">Jenis Kelamin:</span>
 <span className="font-bold text-slate-800 dark:text-white">{formData.jenis_kelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span>
 </div>
 <div className="flex flex-col sm:flex-row sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">Agama / Status Nikah:</span>
 <span className="font-bold text-slate-800 dark:text-white">
 {formData.agama || 'Islam'} · {formData.status_perkawinan || '-'}
 </span>
 </div>
 <div className="flex flex-col sm:flex-row sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">Pendidikan Terakhir:</span>
 <span className="font-bold text-slate-800 dark:text-white">{formData.pendidikan_terakhir || '-'}</span>
 </div>
 <div className="flex flex-col sm:flex-row sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">Unit Kerja & Jabatan:</span>
 <span className="font-bold text-slate-800 dark:text-white break-words">
 {unitsList.find((u) => String(u.id) === String(formData.unit_id))?.name || '-'} — {positionsList.find((p) => String(p.id) === String(formData.jabatan_id))?.name || '-'}
 </span>
 </div>
 <div className="flex flex-col sm:flex-row sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">Status Kepegawaian:</span>
 <span className="font-bold text-emerald-700 dark:text-emerald-400">
 {formData.status_pegawai || 'Tetap'} ({formData.status || 'Aktif'})
 </span>
 </div>
 <div className="flex flex-col sm:flex-row sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2 gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">Kontak HP / WhatsApp:</span>
 <span className="font-bold text-slate-800 dark:text-white">{formData.no_hp || '-'}</span>
 </div>
 <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
 <span className="text-slate-500 font-medium">Email:</span>
 <span className="font-bold text-slate-800 dark:text-white break-words">{formData.email || '-'}</span>
 </div>
 </div>
 </div>
 )}
    </AppModal>
  )
}
