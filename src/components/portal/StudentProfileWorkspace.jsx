import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeCanvas } from 'qrcode.react'
import {
 Activity,
 AlertCircle,
 Award,
 BookOpenCheck,
 CalendarCheck,
 CalendarDays,
 Camera,
 CheckCircle2,
 ClipboardList,
 Clock3,
 Download,
 Droplets,
 Eye,
 EyeOff,
 FileText,
 GraduationCap,
 HeartPulse,
 Home,
 IdCard,
 KeyRound,
 Layers,
 Loader2,
 LockKeyhole,
 Mail,
 MapPin,
 MessageCircle,
 Phone,
 QrCode,
 School,
 ShieldCheck,
 Sparkles,
 Trophy,
 User,
 UserRound,
 UsersRound,
 X,
} from 'lucide-react'
import {
 Card as HeroCard,
 Chip as HeroChip,
 Button as HeroButton,
 Modal as HeroModal,
 Tooltip as HeroTooltip,
} from '@heroui/react'
import { Modal } from '../ui/modal'
import { EmptyState } from '../ui/empty-state'
import PersonAvatar from '../../components/ui/PersonAvatar'
import api from '../../services/api'
import { familyPortalService } from '../../services/familyPortalService'
import Swal from '@/components/ui/compat/swal-heroui'
import CetakKartuSiswaModal from '../siswa/CetakKartuSiswaModal'

const valueOf = (source, keys, fallback = '-') => {
 if (!source) return fallback
 for (const key of keys) {
 const value = key.split('.').reduce((item, part) => item?.[part], source)
 if (value !== undefined && value !== null && value !== '') {
 if (typeof value === 'object') {
 return value.nama_kelas || value.name || value.nama_lengkap || value.nama || value.title || fallback
 }
 return String(value)
 }
 }
 return fallback
}

const displayDate = (value) => {
 if (!value) return '-'
 try {
 return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(value))
 } catch {
 return String(value)
 }
}

const asList = (value) => {
 if (Array.isArray(value)) return value
 if (value && typeof value === 'object') return Object.values(value)
 return []
}

function SectionHeader({ icon: Icon, title, description, badge }) {
 return (
 <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <Icon className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
 {title}
 </h3>
 {description && (
 <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
 {description}
 </p>
 )}
 </div>
 </div>
 {badge && (
 <HeroChip
 size="sm"
 variant="flat"
 color="success"
 className="font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
 >
 {badge}
 </HeroChip>
 )}
 </div>
 )
}

function InfoTilesGrid({ items }) {
 return (
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {items.map(({ label, value, icon: Icon }) => (
 <div
 key={label}
 className="group flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3.5 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/30 hover:shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20"
 >
 <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#059669] shadow-2xs border border-emerald-200/60 group-hover:bg-[#059669] group-hover:text-white transition-colors dark:border-emerald-700/80 dark:bg-slate-800 dark:text-[#18A972]">
 {Icon ? <Icon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
 {label}
 </p>
 <p className="mt-0.5 break-words text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
 {value ?? '-'}
 </p>
 </div>
 </div>
 ))}
 </div>
 )
}

function HeroKpiCard({ icon: Icon, label, value, subtitle, progress = 0, tone = 'emerald' }) {
 const themes = {
 emerald: {
 border: 'border-emerald-200/80 dark:border-emerald-800/60',
 iconBg: 'bg-emerald-500 shadow-sm',
 bar: 'from-emerald-500 to-teal-500',
 glow: 'from-emerald-500/10 via-teal-500/5',
 badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60',
 },
 blue: {
 border: 'border-emerald-200/80 dark:border-emerald-800/60',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm shadow-emerald-500/20',
    bar: 'from-emerald-500 to-teal-600',
    glow: 'from-emerald-500/10 via-teal-500/5',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60',
 },
 amber: {
 border: 'border-emerald-200/80 dark:border-emerald-800/60',
 iconBg: 'bg-amber-500 text-white shadow-sm',
 bar: 'from-amber-500 to-orange-500',
 glow: 'from-amber-500/10 via-orange-500/5',
 badge: 'bg-amber-50 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60',
 },
 violet: {
 border: 'border-emerald-200/80 dark:border-emerald-800/60',
 iconBg: 'bg-violet-600 text-white shadow-violet-500/20',
 bar: 'from-violet-500 to-purple-600',
 glow: 'from-violet-500/10 via-purple-500/5',
 badge: 'bg-violet-50 text-violet-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300 dark:border-emerald-800/60',
 },
 }

 const t = themes[tone] || themes.emerald

 return (
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard
 className={`relative overflow-hidden rounded-xl border-2 ${t.border} bg-white p-4.5 sm:p-5 shadow-xs transition-all hover:shadow-md dark:bg-slate-900`}
 >
 <div aria-hidden="true" className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] ${t.glow} to-transparent blur-xl`} />
 <div className="relative flex items-center justify-between gap-3">
 <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.iconBg} shadow-md`}>
 <Icon className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {value ?? '-'}
 </span>
 </div>
 <p className="relative mt-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
 {label}
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 {subtitle}
 </p>
 <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-50 dark:bg-emerald-950/40">
 <div
 className={`h-full rounded-full bg-white dark:bg-[#1B2433] ${t.bar} transition-all duration-500`}
 style={{ width: `${Math.max(0, Math.min(100, Number(progress) || 0))}%` }}
 />
 </div>
 </HeroCard>
 </motion.div>
 )
}

function TimelineList({ items, emptyTitle }) {
 if (!items.length) {
 return (
 <EmptyState
 icon={<Clock3 className="h-7 w-7 text-emerald-500" />}
 title={emptyTitle}
 description="Informasi ini belum tersedia pada data siswa."
 />
 )
 }

 return (
 <div className="relative ml-2 space-y-4 border-l-2 border-emerald-200/80 pl-6 dark:border-emerald-800/60">
 {items.map((item, index) => (
 <div key={item.id || index} className="relative">
 <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950" />
 <div className="flex flex-wrap items-start justify-between gap-2 rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-800/50 border border-emerald-200/80 dark:border-emerald-800/60">
 <div>
 <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
 {item.school || item.sekolah || item.title || item.judul || item.activity || 'Aktivitas siswa'}
 </p>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
 {item.level || item.jenjang || item.description || item.keterangan || item.subject || ''}
 </p>
 </div>
 <span className="rounded-full bg-emerald-100/80 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {item.year || item.tahun || item.date || item.waktu || item.status || '-'}
 </span>
 </div>
 </div>
 ))}
 </div>
 )
}

export default function StudentProfileWorkspace({
 student = {},
 dashboard = {},
 readOnly = true,
 onPhotoUpdated,
}) {
 const fileInputRef = useRef(null)
 const meta = student.metadata || {}
 const initialPhoto = student.photo || student.photo_url || student.avatar_url || student.photo_thumb || meta.photo || meta.foto_url || meta.foto || ''
 const [customPhoto, setCustomPhoto] = useState(initialPhoto)
 const [uploadingPhoto, setUploadingPhoto] = useState(false)
 const [showCardModal, setShowCardModal] = useState(false)

 useEffect(() => {
 setCustomPhoto(initialPhoto)
 }, [initialPhoto])

 const [qrOpen, setQrOpen] = useState(false)
 const [qrToken, setQrToken] = useState('')
 const [qrError, setQrError] = useState('')
 const [detailModal, setDetailModal] = useState(null)

 const handlePhotoUpload = async (e) => {
 const file = e.target.files?.[0]
 if (!file) return
 if (!file.type.startsWith('image/')) {
 Swal.fire({
 title: 'Format Berkas Tidak Didukung',
 text: 'Silakan pilih gambar dengan format JPG, PNG, atau WEBP.',
 icon: 'warning',
 confirmButtonColor: '#059669',
 })
 return
 }
 if (file.size > 3 * 1024 * 1024) {
 Swal.fire({
 title: 'Ukuran Berkas Terlalu Besar',
 text: 'Ukuran foto maksimal yang diperbolehkan adalah 3MB.',
 icon: 'warning',
 confirmButtonColor: '#059669',
 })
 return
 }

 const childId = student.id || student.uuid
 if (!childId) {
 Swal.fire({
 title: 'ID Siswa Tidak Ditemukan',
 text: 'Data identitas siswa belum termuat dengan lengkap.',
 icon: 'error',
 confirmButtonColor: '#059669',
 })
 return
 }

 const reader = new FileReader()
 reader.onload = (event) => {
 const dataUrl = event.target?.result
 if (dataUrl) setCustomPhoto(dataUrl)
 }
 reader.readAsDataURL(file)

 const formData = new FormData()
 formData.append('photo', file)

 setUploadingPhoto(true)
 try {
 const res = await familyPortalService.updateChildPhoto(childId, formData)
 if (res?.success) {
 const savedUrl = res.data?.photo_url || res.data?.photo
 if (savedUrl) {
 setCustomPhoto(savedUrl)
 student.photo_url = savedUrl
 student.photo = res.data?.photo || savedUrl
 if (student.metadata) {
 student.metadata.photo = res.data?.photo || savedUrl
 student.metadata.photo_url = savedUrl
 }
 }
 if (typeof onPhotoUpdated === 'function') {
 onPhotoUpdated(savedUrl, childId)
 }
 Swal.fire({
 title: 'Foto Berhasil Diperbarui',
 text: 'Foto profil siswa telah berhasil disimpan ke server.',
 icon: 'success',
 confirmButtonColor: '#059669',
 })
 } else {
 Swal.fire({
 title: 'Gagal Menyimpan Foto',
 text: res?.message || 'Gagal menyimpan foto siswa ke server.',
 icon: 'error',
 confirmButtonColor: '#059669',
 })
 setCustomPhoto(initialPhoto)
 }
 } catch (err) {
 const errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengunggah foto siswa.'
 Swal.fire({
 title: 'Gagal Mengunggah Foto',
 text: errMsg,
 icon: 'error',
 confirmButtonColor: '#059669',
 })
 setCustomPhoto(initialPhoto)
 } finally {
 setUploadingPhoto(false)
 if (fileInputRef.current) {
 fileInputRef.current.value = ''
 }
 }
 }

 const parents = asList(student.parents)
 const father = parents.find((item) => /ayah|father/i.test(item.pivot?.relationship_type || item.relationship_type || '')) || meta.ayah || {}
 const mother = parents.find((item) => /ibu|mother/i.test(item.pivot?.relationship_type || item.relationship_type || '')) || meta.ibu || {}
 const guardian = parents.find((item) => /wali|guardian/i.test(item.pivot?.relationship_type || item.relationship_type || '')) || meta.wali || {}
 const achievements = asList(meta.prestasi || meta.achievements)
 const education = asList(meta.riwayat_pendidikan || meta.education_history)
 const documents = asList(meta.dokumen || meta.documents)
 const activity = asList(meta.aktivitas_terbaru || dashboard.recent_activities)
 const schedules = asList(dashboard.schedules_today)
 const gradeValues = asList(dashboard.latest_grades).map((item) => Number(item.final_score || item.nilai_akhir || item.nilai_tugas)).filter(Number.isFinite)
 const average = gradeValues.length ? Math.round(gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length) : null
 const photo = student.photo || student.photo_url || student.photo_thumb || meta.photo
 const name = student.full_name || student.nama_lengkap || '-'
 const status = student.is_active === false ? 'Tidak Aktif' : valueOf(student, ['status', 'academic_status'], 'Aktif')
 const className = valueOf(student, ['kelas.nama_kelas', 'kelas.name', 'class_name', 'kelas'])
 const unitName = valueOf(student, ['unit_name', 'education_unit.name', 'educationUnit.name', 'unit.name'])
 const waliKelas = valueOf(student, ['wali_kelas', 'kelas.wali_kelas.nama_lengkap', 'metadata.wali_kelas'])
 const guruBk = valueOf(student, ['musyrif', 'metadata.guru_bk', 'guru_bk'])
 const asrama = valueOf(student, ['asrama', 'metadata.asrama'])

 useEffect(() => {
 let active = true
 const defaultToken = `STUDENT_CARD:${student?.nis || student?.nisn || student?.id || '103'}:${student?.full_name || student?.nama_lengkap || 'Siswa'}`
 setQrToken(defaultToken)
 setQrError('')

 if (student?.id) {
 api.get('/portal/attendance-qr', { headers: { 'X-Child-Id': student.id } })
 .then((response) => {
 if (active && response.data?.data?.qr_token) {
 setQrToken(response.data.data.qr_token)
 }
 })
 .catch(() => {
 // Keep defaultToken fallback so QR Code Canvas is ALWAYS rendered
 })
 }

 return () => { active = false }
 }, [student?.id, student?.nis, student?.nisn, student?.full_name, student?.nama_lengkap])

 const personal = [
 { label: 'Nama Lengkap', value: name, icon: UserRound },
 { label: 'Nama Panggilan', value: valueOf(meta, ['nama_panggilan', 'nickname']), icon: UserRound },
 { label: 'NIS', value: student.nis || '-', icon: IdCard },
 { label: 'NIK', value: valueOf(student, ['nik', 'metadata.nik']), icon: IdCard },
 { label: 'Tempat Lahir', value: student.birth_place || '-', icon: MapPin },
 { label: 'Tanggal Lahir', value: displayDate(student.birth_date), icon: CalendarDays },
 { label: 'Jenis Kelamin', value: student.gender === 'male' ? 'Laki-laki' : student.gender === 'female' ? 'Perempuan' : valueOf(student, ['gender', 'jenis_kelamin']), icon: UsersRound },
 { label: 'Agama', value: valueOf(student, ['religion', 'metadata.agama'], 'Islam'), icon: ShieldCheck },
 { label: 'Kewarganegaraan', value: valueOf(meta, ['kewarganegaraan', 'citizenship']), icon: Home },
 { label: 'Golongan Darah', value: valueOf(meta, ['golongan_darah', 'blood_type']), icon: Droplets },
 { label: 'Bahasa', value: valueOf(meta, ['bahasa', 'language']), icon: MessageCircle },
 { label: 'Anak Ke', value: valueOf(meta, ['anak_ke', 'birth_order']), icon: UsersRound },
 { label: 'Status Anak', value: valueOf(meta, ['status_anak', 'child_status']), icon: CheckCircle2 },
 { label: 'Alamat', value: student.address || '-', icon: MapPin },
 { label: 'RT / RW', value: `${valueOf(meta, ['rt'])} / ${valueOf(meta, ['rw'])}`, icon: MapPin },
 { label: 'Kelurahan', value: valueOf(meta, ['kelurahan', 'village']), icon: MapPin },
 { label: 'Kecamatan', value: valueOf(meta, ['kecamatan', 'district']), icon: MapPin },
 { label: 'Kota / Kab.', value: valueOf(meta, ['kota', 'city']), icon: MapPin },
 { label: 'Provinsi', value: valueOf(meta, ['provinsi', 'province']), icon: MapPin },
 { label: 'Kode Pos', value: valueOf(meta, ['kode_pos', 'postal_code']), icon: MapPin },
 { label: 'Email', value: valueOf(student, ['email', 'user.email', 'metadata.email']), icon: Mail },
 { label: 'Nomor HP', value: valueOf(student, ['phone', 'metadata.nomor_hp', 'metadata.phone']), icon: Phone },
 { label: 'Status Siswa', value: status, icon: CheckCircle2 },
 ]

 const parentItems = (data) => [
 { label: 'Nama', value: valueOf(data, ['nama_lengkap', 'name', 'full_name', 'nama']), icon: UserRound },
 { label: 'NIK', value: valueOf(data, ['nik']), icon: IdCard },
 { label: 'Pekerjaan', value: valueOf(data, ['occupation', 'pekerjaan']), icon: ClipboardList },
 { label: 'Pendidikan', value: valueOf(data, ['education', 'pendidikan']), icon: GraduationCap },
 { label: 'Nomor HP / WA', value: valueOf(data, ['phone', 'phone_number', 'nomor_hp']), icon: Phone },
 { label: 'Email', value: valueOf(data, ['email']), icon: Mail },
 { label: 'Alamat Tinggal', value: valueOf(data, ['address', 'alamat']), icon: MapPin },
 ]

 const academic = [
 { label: 'Unit Pendidikan', value: unitName, icon: School },
 { label: 'Jenjang Pendidikan', value: valueOf(student, ['jenjang', 'education_unit.jenjang', 'metadata.jenjang']), icon: GraduationCap },
 { label: 'Kelas', value: className, icon: School },
 { label: 'Rombel', value: valueOf(student, ['kelas.rombel', 'metadata.rombel']), icon: UsersRound },
 { label: 'NISN', value: student.nisn || '-', icon: IdCard },
 { label: 'Status Akademik', value: valueOf(student, ['academic_status', 'metadata.status_akademik'], status), icon: CheckCircle2 },
 { label: 'Tanggal Masuk', value: displayDate(valueOf(student, ['entry_date', 'metadata.tanggal_masuk'], null)), icon: CalendarCheck },
 { label: 'Tanggal Keluar', value: displayDate(valueOf(student, ['exit_date', 'metadata.tanggal_keluar'], null)), icon: CalendarCheck },
 { label: 'Wali Kelas', value: waliKelas, icon: UserRound },
 { label: 'Guru BK / Musyrif', value: guruBk, icon: UserRound },
 ...(asrama !== '-' ? [{ label: 'Asrama & Musyrif', value: `${asrama} (${guruBk})`, icon: Home }] : []),
 { label: 'Status Keaktifan', value: status, icon: ShieldCheck },
 ]

 const health = [
 { label: 'Golongan Darah', value: valueOf(meta, ['golongan_darah', 'kesehatan.golongan_darah']), icon: Droplets },
 { label: 'Alergi', value: valueOf(meta, ['alergi', 'kesehatan.alergi']), icon: AlertCircle },
 { label: 'Riwayat Penyakit', value: valueOf(meta, ['riwayat_penyakit', 'kesehatan.riwayat_penyakit']), icon: HeartPulse },
 { label: 'Vaksinasi Terakhir', value: valueOf(meta, ['vaksin', 'kesehatan.vaksin']), icon: ShieldCheck },
 { label: 'Tinggi Badan', value: valueOf(meta, ['tinggi_badan', 'kesehatan.tinggi']) !== '-' ? `${valueOf(meta, ['tinggi_badan', 'kesehatan.tinggi'])} cm` : '-', icon: Activity },
 { label: 'Berat Badan', value: valueOf(meta, ['berat_badan', 'kesehatan.berat']) !== '-' ? `${valueOf(meta, ['berat_badan', 'kesehatan.berat'])} kg` : '-', icon: Activity },
 ]

 return (
 <div className="space-y-6">
 {/* 1. HERO PROFILE CARD CONTAINER */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-7 shadow-lg shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Dual Multi-tone Ambient Glow */}
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="absolute inset-0 opacity-[.06] [background-image:radial-gradient(circle_at_2px_2px,#059669_1.5px,transparent_0)] [background-size:24px_24px]"
 />

 <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center justify-between">
 {/* Avatar & Identitas */}
 <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row sm:items-center">
 {/* Foto Siswa & Tombol Kamera */}
 <div className="flex flex-col items-center gap-2.5 shrink-0">
 <div
 className="relative group cursor-pointer"
 onClick={() => fileInputRef.current?.click()}
 title="Klik untuk mengubah foto siswa"
 >
 <div className="rounded-xl p-1 bg-white dark:bg-[#1B2433] shadow-xl shadow-sm">
 <PersonAvatar
 src={customPhoto || student.photo_url || student.avatar_url || photo}
 name={name}
 size="detail"
 className="h-28 w-28 rounded-xl border-4 border-emerald-200/80 dark:border-slate-900 transition-all duration-300 group-hover:scale-[1.02] group-hover:brightness-95 object-cover"
 />
 </div>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation()
 if (!uploadingPhoto) fileInputRef.current?.click()
 }}
 disabled={uploadingPhoto}
 className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-lg ring-2 ring-white dark:ring-slate-900 transition-all hover:scale-110 cursor-pointer disabled:opacity-75"
 title="Ubah Foto Siswa"
 >
 {uploadingPhoto ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : (
 <Camera className="h-4 w-4" />
 )}
 </button>
 </div>

 <HeroButton
 size="sm"
 variant="flat"
 color="success"
 onPress={() => !uploadingPhoto && fileInputRef.current?.click()}
 isDisabled={uploadingPhoto}
 className="h-7 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 px-3 text-xs font-black text-emerald-800 shadow-2xs hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-slate-800/90 dark:text-emerald-300 cursor-pointer"
 >
 {uploadingPhoto ? (
 <>
 <Loader2 className="h-3 w-3 animate-spin mr-1 text-emerald-700" />
 <span>Menyimpan...</span>
 </>
 ) : (
 <>
 <Camera className="h-3 w-3 mr-1 text-emerald-700 dark:text-emerald-300" />
 <span>Ubah Foto</span>
 </>
 )}
 </HeroButton>

 <input
 ref={fileInputRef}
 type="file"
 accept="image/jpeg,image/png,image/webp,image/jpg"
 className="hidden"
 onChange={handlePhotoUpload}
 disabled={uploadingPhoto}
 />
 </div>

 {/* Detail Siswa & Chips */}
 <div className="text-center sm:text-left min-w-0">
 <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
 <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
 {name}
 </h1>
 <HeroChip
 size="sm"
 variant="solid"
 color={status === 'Aktif' ? 'success' : 'danger'}
 className="font-extrabold text-xs shadow-2xs"
 >
 <span className="inline-block h-1.5 w-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
 {status}
 </HeroChip>
 <HeroChip
 size="sm"
 variant="flat"
 className="font-extrabold text-xs bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
 >
 <Sparkles className="h-3 w-3 text-emerald-600 mr-1 inline" />
 Profil Ananda Terverifikasi
 </HeroChip>
 </div>

 <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
 NIS: <b className="font-mono text-emerald-800 dark:text-emerald-300">{student.nis || '-'}</b> · NISN: <b className="font-mono text-teal-800 dark:text-teal-300">{student.nisn || '-'}</b>
 </p>

 {/* Lencana Konteks Pendidikan */}
 <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-xs font-bold text-slate-700 sm:justify-start dark:text-slate-300">
 {unitName && (
 <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/85 px-3 py-1 shadow-2xs dark:border-emerald-800/60 dark:bg-slate-800">
 <School className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>{unitName}</span>
 </span>
 )}
 {className && (
 <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/85 px-3 py-1 shadow-2xs dark:border-emerald-800/60 dark:bg-slate-800">
 <Layers className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
 <span>{className}</span>
 </span>
 )}
 {dashboard.academic_context?.academic_year && (
 <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 bg-white/85 px-3 py-1 shadow-2xs dark:border-emerald-700/80 dark:bg-slate-800">
 <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
 <span>TA {dashboard.academic_context.academic_year}</span>
 </span>
 )}
 {dashboard.academic_context?.semester && (
 <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 bg-white/85 px-3 py-1 shadow-2xs dark:border-emerald-700/80 dark:bg-slate-800">
 <span>{dashboard.academic_context.semester}</span>
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Action Buttons: Kartu Siswa & QR Siswa */}
 <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start lg:justify-end shrink-0">
 <HeroButton
 size="md"
 onPress={() => setShowCardModal(true)}
 className="flex min-h-12 items-center gap-3 rounded-xl bg-white dark:bg-[#1B2433] px-4.5 py-3 text-left shadow-lg shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer"
 >
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
 <IdCard className="h-5 w-5" />
 </div>
 <div className="leading-tight">
 <b className="block text-xs font-black">Kartu Siswa (Pelajar)</b>
 <small className="text-[10px] text-emerald-100 font-medium">Buka format cetak resmi</small>
 </div>
 </HeroButton>

 <HeroButton
 size="md"
 variant="bordered"
 onPress={() => setQrOpen(true)}
 className="flex min-h-12 items-center gap-3 rounded-xl border border-emerald-200/80 bg-white/90 px-4.5 py-3 text-left shadow-sm transition-all hover:scale-[1.02] hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-slate-800/90 cursor-pointer"
 >
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <QrCode className="h-5 w-5" />
 </div>
 <div className="leading-tight">
 <b className="block text-xs font-black text-slate-900 dark:text-white">QR Presensi Siswa</b>
 <small className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Scan gerbang & kartu</small>
 </div>
 </HeroButton>
 </div>
 </div>

 {/* Readonly Banner Notice */}
 <div className="relative mt-5 border-t border-emerald-200/80 dark:border-emerald-800/60 pt-3.5 text-xs font-medium text-slate-600 dark:border-emerald-800/60 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
 <span>
 {readOnly
 ? 'Biodata terverifikasi resmi oleh Tata Usaha dan ditampilkan dalam mode baca-saja.'
 : 'Perubahan kontak darurat dan identitas resmi mengikuti proses verifikasi operator sekolah.'}
 </span>
 <span className="font-bold text-emerald-800 dark:text-emerald-300">
 Dareliman Edu
 </span>
 </div>
 </HeroCard>

 {/* 2. RINGKASAN AKADEMIK & CAPAIAN (4 KPI HERO CARDS) */}
 <section className="space-y-3">
 <SectionHeader
 icon={GraduationCap}
 title="Ringkasan Capaian Akademik & Ibadah"
 description="Pantauan cepat capaian pembelajaran, kehadiran, dan kedisiplinan terkini ananda."
 badge="Live Status"
 />
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
 <HeroKpiCard
 icon={Award}
 label="Nilai Rata-rata"
 value={average ?? '-'}
 progress={average || 0}
 subtitle={average == null ? 'Belum ada penilaian' : `${gradeValues.length} nilai terbit`}
 tone="blue"
 />
 <HeroKpiCard
 icon={CalendarCheck}
 label="Presensi Hari Ini"
 value={dashboard.attendance_today || '-'}
 progress={/hadir/i.test(dashboard.attendance_today || '') ? 100 : 0}
 subtitle="Status kehadiran"
 tone="emerald"
 />
 <HeroKpiCard
 icon={BookOpenCheck}
 label="Hafalan Tahfizh"
 value={dashboard.kpi?.total_tahfizh_ayat ?? '-'}
 progress={Math.min(100, Number(dashboard.kpi?.total_tahfizh_ayat) || 0)}
 subtitle="Total ayat mutqin"
 tone="amber"
 />
 <HeroKpiCard
 icon={HeartPulse}
 label="Mutaba'ah Yaumiyyah"
 value={dashboard.kpi?.mutabaah_status || '-'}
 progress={/selesai|lengkap|terisi|verified/i.test(dashboard.kpi?.mutabaah_status || '') ? 100 : 0}
 subtitle="Status harian"
 tone="violet"
 />
 </div>
 </section>

 {/* 3. DATA PRIBADI SISWA */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <SectionHeader
 icon={UserRound}
 title="Data Pribadi Siswa"
 description="Informasi identitas lengkap siswa yang tercatat dalam data kependudukan dan Dapodik."
 />
 <InfoTilesGrid items={personal} />
 </HeroCard>

 {/* 4. DATA ORANG TUA & WALI */}
 <section className="space-y-3">
 <SectionHeader
 icon={UsersRound}
 title="Data Orang Tua & Wali Murid"
 description="Kontak keluarga dan informasi penanggung jawab siswa yang tersimpan resmi di yayasan."
 />
 <div className="grid gap-4 lg:grid-cols-3">
 {[
 ['Data Ayah Kandung', father, 'Ayah'],
 ['Data Ibu Kandung', mother, 'Ibu'],
 ['Data Wali Siswa (Opsional)', guardian, 'Wali'],
 ].map(([title, data, role]) => (
 <HeroCard
 key={title}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900 flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between mb-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
 <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
 <User className="h-4 w-4 text-emerald-600" />
 <span>{title}</span>
 </h4>
 <HeroChip size="sm" variant="flat" color="success" className="font-bold text-[10px]">
 {role}
 </HeroChip>
 </div>
 <div className="space-y-2.5">
 {parentItems(data).map(({ label, value, icon: Icon }) => (
 <div
 key={label}
 className="flex items-center justify-between rounded-xl bg-slate-50/70 p-2.5 text-xs dark:bg-slate-800/40 border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
 <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 {label}
 </span>
 <span className="font-extrabold text-slate-800 dark:text-slate-200 text-right truncate max-w-[150px]">
 {value ?? '-'}
 </span>
 </div>
 ))}
 </div>
 </div>
 </HeroCard>
 ))}
 </div>
 </section>

 {/* 5. DATA AKADEMIK & KELAS */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <SectionHeader
 icon={School}
 title="Data Akademik & Penempatan Kelas"
 description="Informasi jenjang, rombongan belajar, nomor induk nasional, serta asatidz pembimbing."
 />
 <InfoTilesGrid items={academic} />
 </HeroCard>

 {/* 6. RIWAYAT PENDIDIKAN & PRESTASI (2 COLUMNS) */}
 <div className="grid gap-6 xl:grid-cols-2">
 {/* Riwayat Pendidikan */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <SectionHeader
 icon={GraduationCap}
 title="Riwayat Pendidikan Sebelumnya"
 description="Jenjang sekolah yang telah diselesaikan ananda."
 />
 <TimelineList items={education} emptyTitle="Riwayat pendidikan belum dicatat" />
 </HeroCard>

 {/* Prestasi */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <SectionHeader
 icon={Trophy}
 title="Penghargaan & Prestasi"
 description="Apresiasi dan pencapaian akademik maupun non-akademik."
 badge={`${achievements.length} Prestasi`}
 />
 {achievements.length ? (
 <div className="grid gap-3 sm:grid-cols-2">
 {achievements.map((item, index) => (
 <button
 key={item.id || index}
 type="button"
 onClick={() => setDetailModal({ type: 'achievement', item })}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/30 p-4 text-left transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-amber-50/70 hover:shadow-xs dark:border-emerald-800/60 dark:bg-amber-950/20 cursor-pointer"
 >
 <div className="flex items-center justify-between mb-2">
 <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
 <Trophy className="h-4 w-4" />
 </span>
 <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9.5px] font-extrabold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
 {item.category || item.kategori || item.tingkat || 'Prestasi'}
 </span>
 </div>
 <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2">
 {item.title || item.nama || item.judul || 'Prestasi Siswa'}
 </p>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
 {item.year || item.tahun || item.date || '-'}
 </p>
 </button>
 ))}
 </div>
 ) : (
 <EmptyState
 icon={<Trophy className="h-7 w-7 text-amber-500" />}
 title="Belum ada prestasi tercatat"
 description="Catatan prestasi santri akan otomatis muncul setelah divalidasi oleh Bagian Kesiswaan."
 />
 )}
 </HeroCard>
 </div>

 {/* 7. KESEHATAN & DOKUMEN (2 COLUMNS) */}
 <div className="grid gap-6 xl:grid-cols-2">
 {/* Rekam Kesehatan */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <SectionHeader
 icon={HeartPulse}
 title="Kondisi & Rekam Kesehatan"
 description="Informasi medis dasar dan data fisik ananda untuk penanganan UKS."
 />
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
 {health.map(({ label, value, icon: Icon }) => (
 <div
 key={label}
 className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-slate-800/40"
 >
 <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
 <Icon className="h-3.5 w-3.5 text-emerald-600" />
 <span>{label}</span>
 </div>
 <p className="mt-1 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
 {value ?? '-'}
 </p>
 </div>
 ))}
 </div>
 </HeroCard>

 {/* Berkas & Dokumen */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <SectionHeader
 icon={FileText}
 title="Berkas & Dokumen Siswa"
 description="Arsip akta kelahiran, kartu keluarga, dan rapor terdahulu."
 badge={`${documents.length} Berkas`}
 />
 {documents.length ? (
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
 {documents.map((item, index) => (
 <button
 key={item.id || index}
 type="button"
 onClick={() => setDetailModal({ type: 'document', item })}
 className="flex min-h-24 flex-col justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-3.5 text-left transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-slate-800/50 cursor-pointer"
 >
 <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
 <div>
 <b className="block text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
 {item.name || item.nama || item.type || item.jenis || 'Dokumen'}
 </b>
 <span className="mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold">
 Lihat rincian →
 </span>
 </div>
 </button>
 ))}
 </div>
 ) : (
 <EmptyState
 icon={<FileText className="h-7 w-7 text-emerald-600" />}
 title="Dokumen belum tersedia"
 description="Belum ada arsip dokumen yang dilampirkan pada sistem administrasi portal."
 />
 )}
 </HeroCard>
 </div>

 {/* 8. AKTIVITAS TERBARU & JADWAL HARI INI */}
 <div className="grid gap-6 xl:grid-cols-2">
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <SectionHeader
 icon={Activity}
 title="Aktivitas & Log Terbaru"
 description="Aktivitas pembelajaran dan riwayat interaksi terkini."
 />
 <TimelineList items={activity} emptyTitle="Belum ada aktivitas terbaru" />
 </HeroCard>

 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <SectionHeader
 icon={CalendarDays}
 title="Jadwal Pelajaran Hari Ini"
 description="Agenda KBM tatap muka aktif pada hari ini."
 />
 {schedules.length ? (
 <div className="space-y-2.5">
 {schedules.map((item, index) => (
 <div
 key={item.id || index}
 className="flex items-center justify-between rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20"
 >
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-emerald-600 px-2.5 py-1 text-center font-mono text-xs font-black text-white shadow-2xs">
 {item.time_start || item.start_time || '-'}
 </div>
 <div>
 <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
 {item.subject?.name || 'Mata Pelajaran'}
 </p>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
 {item.employee?.nama_lengkap || item.teacher?.name || 'Guru Pengampu'} · {item.room || item.ruangan || 'Ruang KBM'}
 </p>
 </div>
 </div>
 <HeroChip size="sm" variant="flat" color="success" className="font-bold text-[10px]">
 KBM Aktif
 </HeroChip>
 </div>
 ))}
 </div>
 ) : (
 <EmptyState
 icon={<CalendarDays className="h-7 w-7 text-emerald-600" />}
 title="Tidak ada jadwal hari ini"
 description="Hari ini tidak terdapat jam KBM tatap muka atau kegiatan terjadwal."
 />
 )}
 </HeroCard>
 </div>

 {/* 9. PENGATURAN PASSWORD LOGIN ANAK (JIKA BUKAN READ-ONLY) */}
 {!readOnly && <ChildPasswordSettingsSection student={student} />}

 {/* MODAL QR KARTU SISWA DENGAN QRCODECANVAS */}
 <Modal
 isOpen={qrOpen}
 onClose={() => setQrOpen(false)}
 title="QR Presensi Kartu Siswa"
 maxWidth="max-w-md"
 footer={
 <HeroButton
 size="sm"
 color="success"
 onPress={() => setQrOpen(false)}
 className="bg-emerald-700 text-white font-bold"
 >
 Tutup
 </HeroButton>
 }
 >
 <div className="flex flex-col items-center text-center p-3">
 <div className="flex min-h-[252px] min-w-[252px] items-center justify-center rounded-xl bg-white p-5 shadow-inner border border-emerald-200/80 dark:border-emerald-800/60">
 {qrToken ? (
 <QRCodeCanvas value={qrToken} size={220} level="M" />
 ) : (
 <p className="max-w-[220px] text-xs font-semibold text-slate-500">
 {qrError || 'Memuat QR kartu presensi...'}
 </p>
 )}
 </div>
 <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">{name}</h3>
 <p className="mt-0.5 text-xs font-mono text-emerald-700 dark:text-emerald-400">
 NIS: {student.nis || '-'} · Kelas: {className || '-'}
 </p>
 <p className="mt-2 text-xs text-slate-400 max-w-md">
 Arahkan kode QR ini ke kamera scanner presensi gerbang sekolah saat kedatangan maupun kepulangan santri.
 </p>
 </div>
 </Modal>

 {/* MODAL CETAK KARTU SISWA RESMI */}
 {showCardModal && (
 <CetakKartuSiswaModal
 student={student}
 showSettings={false}
 onClose={() => setShowCardModal(false)}
 />
 )}

 {/* MODAL DETAIL PRESTASI / DOKUMEN */}
 {detailModal && (
 <Modal
 isOpen={Boolean(detailModal)}
 onClose={() => setDetailModal(null)}
 title={detailModal.type === 'achievement' ? 'Rincian Prestasi Santri' : 'Rincian Berkas Dokumen'}
 maxWidth="max-w-md"
 footer={
 <HeroButton
 size="sm"
 color="success"
 onPress={() => setDetailModal(null)}
 className="bg-emerald-700 text-white font-bold"
 >
 Tutup
 </HeroButton>
 }
 >
 <div className="space-y-3 p-2 text-xs">
 <div className="rounded-xl bg-emerald-50 p-3.5 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
 {detailModal.type === 'achievement' ? 'Nama Prestasi' : 'Nama Berkas'}
 </p>
 <h4 className="mt-1 text-sm font-black text-slate-900 dark:text-white">
 {detailModal.item?.title || detailModal.item?.nama || detailModal.item?.name || '-'}
 </h4>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
 Kategori: <b>{detailModal.item?.category || detailModal.item?.kategori || detailModal.item?.type || '-'}</b>
 </p>
 {detailModal.item?.description && (
 <p className="mt-2 text-slate-700 dark:text-slate-200 italic">
 "{detailModal.item.description}"
 </p>
 )}
 </div>
 <p className="text-xs text-slate-400">
 Tercatat pada data terpadu administrasi santri: {name}.
 </p>
 </div>
 </Modal>
 )}
 </div>
 )
}

function ChildPasswordSettingsSection({ student }) {
 const [password, setPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [loading, setLoading] = useState(false)
 const [message, setMessage] = useState({ text: '', type: '' })

 const handleSubmit = async (e) => {
 e.preventDefault()
 setMessage({ text: '', type: '' })

 if (password.length < 6) {
 setMessage({ text: 'Password minimal 6 karakter.', type: 'error' })
 return
 }

 if (password !== confirmPassword) {
 setMessage({ text: 'Konfirmasi password baru tidak cocok.', type: 'error' })
 return
 }

 setLoading(true)
 try {
 await familyPortalService.updateChildPassword(student.id, {
 password,
 password_confirmation: confirmPassword,
 })
 setMessage({
 text: `Password login untuk ${student.full_name || student.nama_lengkap || 'anak'} berhasil diperbarui!`,
 type: 'success',
 })
 setPassword('')
 setConfirmPassword('')
 } catch (err) {
 setMessage({
 text: err.response?.data?.message || 'Gagal memperbarui password login anak.',
 type: 'error',
 })
 } finally {
 setLoading(false)
 }
 }

 return (
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 sm:p-6 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm">
 <SectionHeader
 icon={LockKeyhole}
 title="Pengaturan Password Login Anak"
 description="Tentukan atau perbarui kata sandi yang digunakan ananda untuk login ke Portal Siswa."
 badge="Keamanan Akun"
 />

 {message.text && (
 <div
 className={`mb-4 rounded-xl p-3.5 text-xs font-bold ${message.type === 'success'
 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300'
 : 'bg-rose-100 text-rose-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300'
 }`}
 >
 {message.text}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3.5 dark:border-emerald-800/60 dark:bg-slate-800/80">
 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identitas Akun Login Anak</p>
 <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
 {student.nis ? `NIS: ${student.nis}` : student.nisn ? `NISN: ${student.nisn}` : student.full_name || 'Siswa'}
 </p>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
 Password Baru Anak
 </label>
 <div className="relative">
 <input
 type={showPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="Minimal 6 karakter..."
 required
 className="h-11 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 pr-10 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
 aria-label="Toggle password visibility"
 >
 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 </div>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
 Konfirmasi Password Baru
 </label>
 <input
 type={showPassword ? 'text' : 'password'}
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 placeholder="Ulangi password baru..."
 required
 className="h-11 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 </div>
 </div>

 <HeroButton
 type="submit"
 size="md"
 color="success"
 isDisabled={loading}
 isLoading={loading}
 className="bg-[#059669] hover:bg-[#047857] text-white font-bold gap-2 rounded-xl shadow-sm cursor-pointer"
 >
 {!loading && <KeyRound className="h-4 w-4" />}
 {loading ? 'Menyimpan...' : 'Simpan Password Login Anak'}
 </HeroButton>
 </form>
 </HeroCard>
 )
}
