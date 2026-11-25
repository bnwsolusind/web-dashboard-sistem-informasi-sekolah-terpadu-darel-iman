import CustomSelect from "../components/ui/CustomSelect"
import React, { useState, useEffect } from 'react'
import {
  GraduationCap,
  UserCheck,
  Building,
  Briefcase,
  Save,
  Megaphone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  School,
  FileBadge
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'

import {
  AppPageHeader,
  AppBreadcrumb,
  PageContainer,
  KpiCard,
  AppBadge,
  AppSkeleton,
  AppErrorState,
  PersonIdentityCell
} from '../components/app'

import {
  alumniPortalService
} from '../services/alumniPortalService'
import {
  usePengaturanStore,
  resolveFoundationName
} from '../stores/pengaturanStore'

export default function AlumniPortalPage() {
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [isNotFound, setIsNotFound] = useState(false)
 const [data, setData] = useState(null)
 const [saving, setSaving] = useState(false)

 const [formData, setFormData] = useState({
 address: '',
 phone: '',
 email: '',
 status_lanjutan: 'Kuliah',
 perguruan_tinggi: '',
 pekerjaan: '',
 instansi: '',
 })

 const fetchDashboard = async () => {
 setLoading(true)
 setError(null)
 setIsNotFound(false)
 try {
 const res = await alumniPortalService.getDashboard()
 if (res && res.data) {
 setData(res.data)
 const prof = res.data.profile || {}
 setFormData({
 address: prof.address || '',
 phone: prof.phone || '',
 email: prof.email || '',
 status_lanjutan: prof.status_lanjutan || '',
 perguruan_tinggi: prof.perguruan_tinggi || '',
 pekerjaan: prof.pekerjaan || '',
 instansi: prof.instansi || '',
 })
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to load Alumni dashboard:', err)
 if (err.response?.status === 404) {
 setIsNotFound(true)
 } else {
 setError(err.response?.data?.message || 'Gagal memuat data portal Alumni.')
 }
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDashboard()
 }, [])

 const handleSaveProfile = async (e) => {
 e.preventDefault()
 setSaving(true)
 try {
 await alumniPortalService.updateProfile(formData)
 Swal.fire({
 icon: 'success',
 title: 'Berhasil',
 text: 'Data profil alumni berhasil diperbarui.',
 timer: 2000,
 showConfirmButton: false,
 customClass: {
 popup: 'rounded-xl shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white',
 },
 })
 fetchDashboard()
 } catch (err) {
 console.error('Failed to update alumni profile:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal',
 text: err.response?.data?.message || 'Gagal memperbarui profil alumni.',
 customClass: {
 popup: 'rounded-xl shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-white',
 },
 })
 } finally {
 setSaving(false)
 }
 }

 if (loading) return <AppSkeleton count={4} />

 if (isNotFound) {
 return (
 <PageContainer maxW="7xl">
 <div className="space-y-6 pb-12">
 <AppBreadcrumb items={[{ label: 'Portal Alumni' }]} />
 <div className="rounded-xl border border-emerald-200/80 bg-white p-12 text-center shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
 <GraduationCap className="h-8 w-8" />
 </div>
 <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
 Data Alumni Belum Terhubung
 </h3>
 <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
 Akun Anda belum terhubung dengan data kelulusan resmi siswa. Silakan hubungi bagian Tata Usaha sekolah untuk melakukan verifikasi dan penautan profil alumni Anda.
 </p>
 <div className="mt-6">
 <button
 onClick={fetchDashboard}
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <RefreshCw className="h-3.5 w-3.5" />
 Periksa Ulang Status
 </button>
 </div>
 </div>
 </div>
 </PageContainer>
 )
 }

 if (error) return <AppErrorState title="Gagal Memuat Portal Alumni" message={error} onRetry={fetchDashboard} />

 const profile = data?.profile || {}
 const kpis = data?.kpis || {}
 const announcements = data?.announcements || []

 return (
 <PageContainer maxW="7xl">
 <div className="space-y-6 pb-12">
 {/* Breadcrumb Navigation */}
 <AppBreadcrumb items={[{ label: 'Portal Alumni' }]} />

 {/* Modern Vivid Emerald Hero Header */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                <GraduationCap className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
                    <GraduationCap className="size-3 text-white" />
                    Portal Alumni &amp; Tracer Study
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Status: {profile.status_kelulusan || 'Lulus'} • Unit: {profile.education_unit || 'Sekolah'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Portal Alumni — {profile.full_name || 'Alumni'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={fetchDashboard}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-extrabold transition shadow-xs cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            </div>
          </div>

          {/* Row 2: Deskripsi Full Width */}
          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              Lulusan {profile.education_unit || 'Sekolah'} — Tahun Lulus {profile.tahun_lulus || '-'}. Pusat komunikasi dan penelusuran lulusan terpadu.
            </p>
          </div>
        </div>
 </div>

 {/* KPI Cards Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <KpiCard
 title="Tahun Lulus"
 value={kpis.tahun_lulus || profile.tahun_lulus || '-'}
 icon={GraduationCap}
 tone="emerald"
 subtitle="Tahun kelulusan resmi"
 />
 <KpiCard
 title="Unit Asal Sekolah"
 value={kpis.unit_asal || profile.education_unit || '-'}
 icon={Building}
 tone="blue"
 subtitle="Unit pendidikan kelulusan"
 />
 <KpiCard
 title="Status Profil Kontak"
 value={kpis.status_profil || (profile.phone || profile.email ? 'Terverifikasi' : 'Belum Lengkap')}
 icon={UserCheck}
 tone="green"
 subtitle="Status penelusuran alumni"
 />
 <KpiCard
 title="Aktivitas Saat Ini"
 value={kpis.status_lanjutan || profile.status_lanjutan || '-'}
 icon={Briefcase}
 tone="violet"
 subtitle="Status studi / karir alumni"
 />
 </div>

 <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
 {/* Left Column: Read-Only Academic Info + Editable Form */}
 <div className="space-y-6 lg:col-span-8">
 {/* Read-Only Official Academic Record */}
 <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-9 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center dark:bg-emerald-950/60 dark:text-[#10B981]">
 <FileBadge className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900 dark:text-white">
 Data Resmi Kelulusan (Read-Only)
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Identitas akademik resmi yang diterbitkan oleh sistem sekolah.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
 <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800/60 dark:border-emerald-800/60">
 <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">Nama Lengkap</span>
 <span className="font-bold text-slate-900 dark:text-white text-sm">{profile.full_name || '-'}</span>
 </div>
 <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800/60 dark:border-emerald-800/60">
 <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">NIS / NISN</span>
 <span className="font-bold text-slate-900 dark:text-white text-sm">{profile.nis || '-'} / {profile.nisn || '-'}</span>
 </div>
 <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800/60 dark:border-emerald-800/60">
 <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">Tahun Lulus</span>
 <span className="font-bold text-slate-900 dark:text-white text-sm">{profile.tahun_lulus || '-'}</span>
 </div>
 <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800/60 dark:border-emerald-800/60">
 <span className="text-slate-400 dark:text-slate-500 block mb-1 font-medium">Status Kelulusan</span>
 <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-[#10B981] text-sm">
 <CheckCircle2 className="w-4 h-4" />
 {profile.status_kelulusan || '-'}
 </span>
 </div>
 </div>
 </div>

 {/* Editable Form for Alumni Contact & Tracer Info */}
 <form onSubmit={handleSaveProfile} className="space-y-5 rounded-xl border border-emerald-200/80 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/60 dark:text-blue-400">
 <Briefcase className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900 dark:text-white">
 Perbarui Informasi Kontak & Karir Alumni
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Perbarui domisili, kontak, perguruan tinggi, atau tempat kerja Anda untuk tracer alumni.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
 <Phone className="w-3.5 h-3.5 text-emerald-600" /> No. HP / WhatsApp
 </label>
 <input
 type="text"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 className="w-full h-9.5 rounded-xl border-2 border-[#b6f6d9] px-3.5 bg-white text-slate-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-white dark:focus:border-[#10B981]"
 placeholder="08xxxxxxxxxx"
 />
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
 <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Aktif
 </label>
 <input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className="w-full h-9.5 rounded-xl border-2 border-[#b6f6d9] px-3.5 bg-white text-slate-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-white dark:focus:border-[#10B981]"
 placeholder="email@domain.com"
 />
 </div>

 <div className="md:col-span-2">
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
 <MapPin className="w-3.5 h-3.5 text-slate-400" /> Alamat Domisili
 </label>
 <textarea
 rows={2}
 value={formData.address}
 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
 className="w-full rounded-xl border-2 border-[#b6f6d9] p-3 bg-white text-slate-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-white dark:focus:border-[#10B981]"
 placeholder="Alamat domisili saat ini..."
 />
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
 <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Aktivitas Lanjutan
 </label>
 <CustomSelect
 value={formData.status_lanjutan}
 onChange={(e) => setFormData({ ...formData, status_lanjutan: e.target.value })}
 className="w-full h-9.5 rounded-xl border border-emerald-200/80 px-3.5 bg-white text-slate-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-white dark:focus:border-[#10B981]"
 >
 <option value="Kuliah">Kuliah (Perguruan Tinggi)</option>
 <option value="Bekerja">Bekerja</option>
 <option value="Pesantren">Pesantren / Ma'had Aly</option>
 <option value="Sekolah Lanjutan">Sekolah Lanjutan (SMA/SMK/MA)</option>
 <option value="Wirausaha">Wirausaha / Bisnis</option>
 <option value="Lainnya">Lainnya</option>
 </CustomSelect>
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
 <School className="w-3.5 h-3.5 text-slate-400" /> Nama Perguruan Tinggi / Universitas
 </label>
 <input
 type="text"
 value={formData.perguruan_tinggi}
 onChange={(e) => setFormData({ ...formData, perguruan_tinggi: e.target.value })}
 className="w-full h-9.5 rounded-xl border-2 border-[#b6f6d9] px-3.5 bg-white text-slate-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-white dark:focus:border-[#10B981]"
 placeholder="Nama universitas / kampus..."
 />
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
 <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Pekerjaan / Jabatan
 </label>
 <input
 type="text"
 value={formData.pekerjaan}
 onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
 className="w-full h-9.5 rounded-xl border-2 border-[#b6f6d9] px-3.5 bg-white text-slate-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-white dark:focus:border-[#10B981]"
 placeholder="Pekerjaan / posisi saat ini..."
 />
 </div>

 <div>
 <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
 <Building className="w-3.5 h-3.5 text-slate-400" /> Instansi / Nama Perusahaan
 </label>
 <input
 type="text"
 value={formData.instansi}
 onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
 className="w-full h-9.5 rounded-xl border-2 border-[#b6f6d9] px-3.5 bg-white text-slate-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-white dark:focus:border-[#10B981]"
 placeholder="Nama tempat bekerja / wirausaha..."
 />
 </div>
 </div>

 <div className="flex justify-end pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="submit"
 disabled={saving}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] text-white text-xs font-semibold shadow-md hover:bg-[#1E8E5A] transition-all disabled:opacity-50 dark:bg-[#10B981] dark:text-slate-900"
 >
 {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
 <span>{saving ? 'Simpan...' : 'Simpan Perubahan Profil'}</span>
 </button>
 </div>
 </form>
 </div>

 {/* Right Column: Alumni Announcements Card */}
 <div className="lg:col-span-4">
 <div className="rounded-xl border border-emerald-200/80 bg-white shadow-sm overflow-hidden dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="p-4 border-b border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2.5">
 <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950/60 dark:text-amber-400">
 <Megaphone className="w-4.5 h-4.5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-slate-900 dark:text-white">
 Pengumuman Sekolah & Alumni
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Kabar alumni & informasi resmi sekolah
 </p>
 </div>
 </div>

 {announcements.length === 0 ? (
 <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
 Belum ada pengumuman alumni saat ini.
 </div>
 ) : (
 <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
 {announcements.map((ann, idx) => (
 <div key={ann.id || idx} className="p-4 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors space-y-1.5">
 <h4 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
 {ann.judul_pengumuman || ann.judul || 'Informasi Alumni'}
 </h4>
 {ann.isi && (
 <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-xs">
 {ann.isi}
 </p>
 )}
 <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-0.5">
 <Calendar className="w-3 h-3" />
 <span>{ann.created_at ? new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </PageContainer>
)
}
