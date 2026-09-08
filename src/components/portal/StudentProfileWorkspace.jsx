import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeCanvas } from 'qrcode.react'
import {
  Activity, AlertCircle, Award, BookOpenCheck, CalendarCheck, CalendarDays, Camera,
  CheckCircle2, ClipboardList, Clock3, Download, Droplets, Eye, EyeOff, FileText, GraduationCap,
  HeartPulse, Home, IdCard, KeyRound, Loader2, LockKeyhole, Mail, MapPin, MessageCircle, Phone, QrCode, School,
  ShieldCheck, Sparkles, Trophy, UserRound, UsersRound,
} from 'lucide-react'
import { Modal } from '../ui/modal'
import { EmptyState } from '../ui/empty-state'
import PersonAvatar from '../../components/ui/PersonAvatar'
import api from '../../services/api'
import { familyPortalService } from '../../services/familyPortalService'

import CetakKartuSiswaModal from '../siswa/CetakKartuSiswaModal'

const card = 'rounded-[18px] border border-slate-200/80 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,.45)] dark:border-slate-800 dark:bg-slate-900'
const valueOf = (source, keys, fallback = '-') => {
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
const displayDate = (value) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(value)) : '-'
const asList = (value) => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : []

function SectionTitle({ icon: Icon, title, description }) {
  return <div className="mb-5 flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Icon className="h-5 w-5" /></span><div><h2 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}</div></div>
}

function InfoGrid({ items }) {
  return <div className="grid gap-x-6 sm:grid-cols-2">{items.map(({ label, value, icon: Icon }) => <div key={label} className="flex min-h-[74px] gap-3 border-b border-slate-100 py-3.5 last:border-b-0 dark:border-slate-800"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300">{Icon ? <Icon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">{value ?? '-'}</p></div></div>)}</div>
}

function KpiCard({ icon: Icon, label, value, subtitle, progress = 0, tone = 'emerald' }) {
  const colors = { emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950', blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950', amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950', violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950' }
  const bars = { emerald: 'bg-emerald-500', blue: 'bg-blue-500', amber: 'bg-amber-500', violet: 'bg-violet-500' }
  return <motion.article whileHover={{ y: -3 }} transition={{ duration: .18 }} className={`${card} p-4`}><div className="flex items-start justify-between gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="h-5 w-5" /></span><span className="text-xl font-black text-slate-900 dark:text-white">{value}</span></div><p className="mt-4 text-xs font-bold text-slate-700 dark:text-slate-200">{label}</p><p className="mt-1 text-[11px] text-slate-400">{subtitle}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${bars[tone]}`} style={{ width: `${Math.max(0, Math.min(100, Number(progress) || 0))}%` }} /></div></motion.article>
}

function Timeline({ items, emptyTitle }) {
  if (!items.length) return <EmptyState icon={<Clock3 className="h-7 w-7" />} title={emptyTitle} description="Informasi ini belum tersedia pada data siswa." />
  return <div className="relative ml-2 space-y-5 border-l border-emerald-200 pl-6 dark:border-emerald-900">{items.map((item, index) => <div key={item.id || index} className="relative"><span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950" /><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.school || item.sekolah || item.title || item.judul || item.activity || 'Aktivitas siswa'}</p><p className="mt-1 text-xs text-slate-500">{item.level || item.jenjang || item.description || item.keterangan || item.subject || ''}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.year || item.tahun || item.date || item.waktu || item.status || '-'}</span></div></div>)}</div>
}

export default function StudentProfileWorkspace({ student = {}, dashboard = {}, readOnly = true, onPhotoUpdated }) {
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
  const [detail, setDetail] = useState(null)

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Format berkas tidak didukung. Silakan pilih gambar (JPG, PNG, WEBP).')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran berkas terlalu besar. Maksimal 3MB.')
      return
    }

    const childId = student.id || student.uuid
    if (!childId) {
      alert('ID Siswa tidak ditemukan.')
      return
    }

    // Instant local preview
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
      } else {
        alert(res?.message || 'Gagal menyimpan foto siswa ke server.')
        setCustomPhoto(initialPhoto)
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengunggah foto siswa.'
      alert(errMsg)
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
          // Keep defaultToken fallback so QR Code Canvas is ALWAYS rendered!
        })
    }

    return () => { active = false }
  }, [student?.id, student?.nis, student?.nisn, student?.full_name, student?.nama_lengkap])

  const personal = [
    { label: 'Nama Lengkap', value: name, icon: UserRound }, { label: 'Nama Panggilan', value: valueOf(meta, ['nama_panggilan', 'nickname']), icon: UserRound },
    { label: 'NIS', value: student.nis || '-', icon: IdCard }, { label: 'NIK', value: valueOf(student, ['nik', 'metadata.nik']), icon: IdCard },
    { label: 'Tempat Lahir', value: student.birth_place || '-', icon: MapPin }, { label: 'Tanggal Lahir', value: displayDate(student.birth_date), icon: CalendarDays },
    { label: 'Jenis Kelamin', value: student.gender === 'male' ? 'Laki-laki' : student.gender === 'female' ? 'Perempuan' : valueOf(student, ['gender', 'jenis_kelamin']), icon: UsersRound },
    { label: 'Agama', value: valueOf(student, ['religion', 'metadata.agama'], 'Islam'), icon: ShieldCheck }, { label: 'Kewarganegaraan', value: valueOf(meta, ['kewarganegaraan', 'citizenship']), icon: Home },
    { label: 'Golongan Darah', value: valueOf(meta, ['golongan_darah', 'blood_type']), icon: Droplets }, { label: 'Bahasa', value: valueOf(meta, ['bahasa', 'language']), icon: MessageCircle },
    { label: 'Anak Ke', value: valueOf(meta, ['anak_ke', 'birth_order']), icon: UsersRound }, { label: 'Status Anak', value: valueOf(meta, ['status_anak', 'child_status']), icon: CheckCircle2 },
    { label: 'Alamat', value: student.address || '-', icon: MapPin }, { label: 'RT / RW', value: `${valueOf(meta, ['rt'])} / ${valueOf(meta, ['rw'])}`, icon: MapPin },
    { label: 'Kelurahan', value: valueOf(meta, ['kelurahan', 'village']), icon: MapPin }, { label: 'Kecamatan', value: valueOf(meta, ['kecamatan', 'district']), icon: MapPin },
    { label: 'Kota', value: valueOf(meta, ['kota', 'city']), icon: MapPin }, { label: 'Provinsi', value: valueOf(meta, ['provinsi', 'province']), icon: MapPin },
    { label: 'Kode Pos', value: valueOf(meta, ['kode_pos', 'postal_code']), icon: MapPin }, { label: 'Email', value: valueOf(student, ['email', 'user.email', 'metadata.email']), icon: Mail },
    { label: 'Nomor HP', value: valueOf(student, ['phone', 'metadata.nomor_hp', 'metadata.phone']), icon: Phone }, { label: 'Status', value: status, icon: CheckCircle2 },
  ]
  const parentItems = (data) => [
    { label: 'Nama', value: valueOf(data, ['nama_lengkap', 'name', 'full_name', 'nama']), icon: UserRound }, { label: 'NIK', value: valueOf(data, ['nik']), icon: IdCard },
    { label: 'Pekerjaan', value: valueOf(data, ['occupation', 'pekerjaan']), icon: ClipboardList }, { label: 'Pendidikan', value: valueOf(data, ['education', 'pendidikan']), icon: GraduationCap },
    { label: 'Nomor HP', value: valueOf(data, ['phone', 'phone_number', 'nomor_hp']), icon: Phone }, { label: 'Email', value: valueOf(data, ['email']), icon: Mail },
    { label: 'Alamat', value: valueOf(data, ['address', 'alamat']), icon: MapPin },
  ]
  const academic = [
    { label: 'Unit Pendidikan', value: unitName, icon: School }, { label: 'Jenjang', value: valueOf(student, ['jenjang', 'education_unit.jenjang', 'metadata.jenjang']), icon: GraduationCap },
    { label: 'Kelas', value: className, icon: School }, { label: 'Rombel', value: valueOf(student, ['kelas.rombel', 'metadata.rombel']), icon: UsersRound },
    { label: 'NISN', value: student.nisn || '-', icon: IdCard }, { label: 'Status Akademik', value: valueOf(student, ['academic_status', 'metadata.status_akademik'], status), icon: CheckCircle2 },
    { label: 'Tanggal Masuk', value: displayDate(valueOf(student, ['entry_date', 'metadata.tanggal_masuk'], null)), icon: CalendarCheck }, { label: 'Tanggal Keluar', value: displayDate(valueOf(student, ['exit_date', 'metadata.tanggal_keluar'], null)), icon: CalendarCheck },
    { label: 'Wali Kelas', value: waliKelas, icon: UserRound }, { label: 'Guru BK / Musyrif', value: guruBk, icon: UserRound },
    ...(asrama !== '-' ? [{ label: 'Asrama & Musyrif', value: `${asrama} (${guruBk})`, icon: Home }] : []),
    { label: 'Status Siswa', value: status, icon: ShieldCheck },
  ]
  const health = [
    { label: 'Golongan Darah', value: valueOf(meta, ['golongan_darah', 'kesehatan.golongan_darah']), icon: Droplets }, { label: 'Alergi', value: valueOf(meta, ['alergi', 'kesehatan.alergi']), icon: AlertCircle },
    { label: 'Riwayat Penyakit', value: valueOf(meta, ['riwayat_penyakit', 'kesehatan.riwayat_penyakit']), icon: HeartPulse }, { label: 'Vaksin', value: valueOf(meta, ['vaksin', 'kesehatan.vaksin']), icon: ShieldCheck },
    { label: 'Tinggi', value: valueOf(meta, ['tinggi_badan', 'kesehatan.tinggi']), icon: Activity }, { label: 'Berat', value: valueOf(meta, ['berat_badan', 'kesehatan.berat']), icon: Activity },
  ]

  return <div className="space-y-5">
    <section className={`${card} relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-5 dark:from-emerald-950/70 dark:via-slate-900 dark:to-slate-900 sm:p-7`}>
      <div aria-hidden="true" className="absolute inset-0 opacity-[.06] [background-image:radial-gradient(circle_at_2px_2px,#0E5C44_1.5px,transparent_0)] [background-size:24px_24px]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Klik untuk mengubah foto siswa">
              <PersonAvatar
                src={customPhoto || student.photo_url || student.avatar_url || photo}
                name={name}
                size="detail"
                className="h-28 w-28 rounded-[24px] border-4 border-white shadow-xl dark:border-slate-800 transition duration-200 group-hover:scale-[1.02] group-hover:brightness-90"
              />
              <button
                type="button"
                onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#0E5C44] text-white shadow-lg ring-2 ring-white dark:ring-slate-900 transition hover:scale-110 cursor-pointer disabled:opacity-75"
                title="Ubah Foto Siswa"
              >
                {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white/90 px-3 py-1 text-[11px] font-bold text-emerald-800 shadow-xs hover:bg-emerald-50 transition cursor-pointer dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300 disabled:opacity-75"
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700 dark:text-emerald-400" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Ubah Foto</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
            />
          </div>
          <div className="text-center sm:text-left"><div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start"><h1 className="text-2xl font-black text-slate-950 dark:text-white">{name}</h1><span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{status}</span></div><p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">NIS {student.nis || '-'} · NISN {student.nisn || '-'}</p><div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-slate-600 sm:justify-start dark:text-slate-300"><span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm dark:bg-slate-800">{unitName}</span><span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm dark:bg-slate-800">{className}</span><span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm dark:bg-slate-800">{dashboard.academic_context?.academic_year || '-'}</span><span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm dark:bg-slate-800">{dashboard.academic_context?.semester || '-'}</span></div></div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start lg:justify-end">
          <button type="button" onClick={() => setShowCardModal(true)} className="flex min-h-11 items-center gap-3 rounded-2xl border border-emerald-300 bg-[#0E5C44] px-4 py-3 text-left text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0b4835]">
            <IdCard className="h-7 w-7 text-emerald-200" />
            <span><b className="block text-xs">Kartu Siswa (Pelajar)</b><small className="text-[10px] text-emerald-100">Menampilkan kartu siswa</small></span>
          </button>
          <button type="button" onClick={() => setQrOpen(true)} className="flex min-h-11 items-center gap-3 rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 text-left shadow-lg transition hover:-translate-y-0.5 dark:border-emerald-900 dark:bg-slate-800">
            <QrCode className="h-7 w-7 text-emerald-700 dark:text-emerald-300" />
            <span><b className="block text-xs">QR Kartu Siswa</b><small className="text-[10px] text-slate-500">Klik untuk melihat QR</small></span>
          </button>
        </div>
      </div>
      <p className="relative mt-5 border-t border-emerald-100 pt-4 text-[11px] text-slate-500 dark:border-emerald-900 dark:text-slate-400">{readOnly ? 'Biodata ditampilkan dalam mode baca-saja.' : 'Perubahan kontak mengikuti proses verifikasi tata usaha.'}</p>
    </section>

    <section><SectionTitle icon={GraduationCap} title="Ringkasan Akademik" description="Ringkasan dari data akademik yang telah diterbitkan." /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><KpiCard icon={Award} label="Nilai Rata-rata" value={average ?? '-'} progress={average || 0} subtitle={average == null ? 'Belum ada nilai' : `${gradeValues.length} nilai terbaru`} tone="blue" /><KpiCard icon={CalendarCheck} label="Kehadiran" value={dashboard.attendance_today || '-'} progress={/hadir/i.test(dashboard.attendance_today || '') ? 100 : 0} subtitle="Status hari ini" /><KpiCard icon={BookOpenCheck} label="Tahfizh" value={dashboard.kpi?.total_tahfizh_ayat ?? '-'} progress={Math.min(100, Number(dashboard.kpi?.total_tahfizh_ayat) || 0)} subtitle="Total ayat tercatat" tone="amber" /><KpiCard icon={HeartPulse} label="Mutabaah" value={dashboard.kpi?.mutabaah_status || '-'} progress={/selesai|lengkap|terisi/i.test(dashboard.kpi?.mutabaah_status || '') ? 100 : 0} subtitle="Status hari ini" tone="violet" /></div></section>

    <section className={`${card} p-5 sm:p-6`}><SectionTitle icon={UserRound} title="Data Pribadi" description="Informasi identitas siswa sesuai data sekolah." /><InfoGrid items={personal} /></section>
    <section><SectionTitle icon={UsersRound} title="Data Orang Tua & Wali" description="Kontak keluarga yang tersimpan pada sistem." /><div className="grid gap-4 lg:grid-cols-3">{[['Ayah', father], ['Ibu', mother], ['Wali (opsional)', guardian]].map(([label, data]) => <article key={label} className={`${card} p-5`}><h3 className="mb-2 text-sm font-extrabold text-slate-900 dark:text-white">{label}</h3><InfoGrid items={parentItems(data)} /></article>)}</div></section>
    <section className={`${card} p-5 sm:p-6`}><SectionTitle icon={School} title="Data Akademik" description="Kelas dan status akademik aktif siswa." /><InfoGrid items={academic} /></section>

    <div className="grid gap-5 xl:grid-cols-2"><section className={`${card} p-5 sm:p-6`}><SectionTitle icon={GraduationCap} title="Riwayat Pendidikan" /><Timeline items={education} emptyTitle="Riwayat pendidikan belum dicatat" /></section><section className={`${card} p-5 sm:p-6`}><SectionTitle icon={Trophy} title="Prestasi" />{achievements.length ? <div className="grid gap-3 sm:grid-cols-2">{achievements.map((item, index) => <button key={item.id || index} type="button" onClick={() => setDetail({ type: 'achievement', item })} className="rounded-2xl border border-slate-100 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-emerald-950/20"><Award className="h-5 w-5 text-amber-500" /><p className="mt-3 text-sm font-bold">{item.title || item.nama || item.judul || 'Prestasi siswa'}</p><p className="mt-1 text-xs text-slate-500">{item.category || item.kategori || item.tingkat || 'Prestasi'}</p></button>)}</div> : <EmptyState icon={<Trophy className="h-7 w-7" />} title="Belum ada prestasi" description="Prestasi siswa belum tersedia pada profil." />}</section></div>

    <section className={`${card} p-5 sm:p-6`}><SectionTitle icon={HeartPulse} title="Kesehatan" description="Informasi kesehatan yang tercatat di sekolah." /><InfoGrid items={health} /></section>
    <section className={`${card} p-5 sm:p-6`}><SectionTitle icon={FileText} title="Dokumen" description="Dokumen siswa yang telah tersimpan." />{documents.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{documents.map((item, index) => <button key={item.id || index} type="button" onClick={() => setDetail({ type: 'document', item })} className="flex min-h-28 flex-col items-start rounded-2xl border border-slate-100 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-emerald-950/20"><FileText className="h-6 w-6 text-emerald-600" /><b className="mt-3 text-xs">{item.name || item.nama || item.type || item.jenis || 'Dokumen'}</b><span className="mt-1 text-[10px] text-slate-400">Lihat detail</span></button>)}</div> : <EmptyState icon={<FileText className="h-7 w-7" />} title="Dokumen belum tersedia" description="Belum ada dokumen yang dapat ditampilkan pada portal." />}</section>

    <div className="grid gap-5 xl:grid-cols-2"><section className={`${card} p-5 sm:p-6`}><SectionTitle icon={Activity} title="Aktivitas Terbaru" /><Timeline items={activity} emptyTitle="Belum ada aktivitas terbaru" /></section><section className={`${card} p-5 sm:p-6`}><SectionTitle icon={CalendarDays} title="Jadwal Hari Ini" />{schedules.length ? <div className="space-y-2">{schedules.map((item, index) => <div key={item.id || index} className="grid grid-cols-[74px_1fr] gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60"><b className="text-xs text-emerald-700 dark:text-emerald-300">{item.time_start || item.start_time || '-'}<span className="block font-normal text-slate-400">{item.time_end || item.end_time || ''}</span></b><div><p className="text-xs font-bold">{item.subject?.name || 'Mata Pelajaran'}</p><p className="mt-1 text-[11px] text-slate-500">{item.employee?.nama_lengkap || item.teacher?.name || 'Guru'} · {item.room || item.ruangan || 'Ruangan belum dicatat'}</p></div></div>)}</div> : <EmptyState icon={<CalendarDays className="h-7 w-7" />} title="Tidak ada jadwal hari ini" description="Jadwal pelajaran hari ini belum tersedia." />}</section></div>



    {!readOnly && <ChildPasswordSettingsSection student={student} />}

    <Modal isOpen={qrOpen} onClose={() => setQrOpen(false)} title="QR Kartu Siswa" maxWidth="max-w-md" footer={<button type="button" onClick={() => setQrOpen(false)} className="h-10 rounded-xl bg-[#0E5C44] px-5 text-xs font-bold text-white">Tutup</button>}><div className="flex flex-col items-center text-center"><div className="flex min-h-[252px] min-w-[252px] items-center justify-center rounded-[18px] bg-white p-4 shadow-inner">{qrToken ? <QRCodeCanvas value={qrToken} size={220} level="M" /> : <p className="max-w-[220px] text-xs font-semibold text-slate-500">{qrError || 'Memuat QR kartu...'}</p>}</div><h3 className="mt-5 font-black">{name}</h3><p className="mt-1 text-xs text-slate-500">QR hanya berisi identitas kartu opaque.</p></div></Modal>
    {showCardModal && <CetakKartuSiswaModal student={student} showSettings={false} onClose={() => setShowCardModal(false)} />}
  </div>
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
      setMessage({ text: `Password login untuk ${student.full_name || student.nama_lengkap || 'anak'} berhasil diperbarui!`, type: 'success' })
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Gagal memperbarui password login anak.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`${card} p-5 sm:p-6 border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900`}>
      <SectionTitle
        icon={LockKeyhole}
        title="Pengaturan Password Login Anak"
        description="Tentukan atau ubah password yang digunakan anak Anda untuk login ke Portal Siswa."
      />

      {message.text && (
        <div className={`mb-4 rounded-xl p-3.5 text-xs font-bold ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Identitas Login Anak</p>
          <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
            {student.nis ? `NIS: ${student.nis}` : student.nisn ? `NISN: ${student.nisn}` : student.full_name || 'Siswa'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Password Baru Anak</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">Konfirmasi Password Baru</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru..."
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {loading ? 'Menyimpan...' : 'Simpan Password Login Anak'}
        </button>
      </form>
    </section>
  )
}
