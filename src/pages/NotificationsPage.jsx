import CustomSelect from "../components/ui/CustomSelect"
import AppDataTable from "../components/app/AppDataTable"
import {
  useCallback,
  useEffect,
  useState,
  useMemo
} from 'react'
import {
  useForm
} from 'react-hook-form'
import {
  CheckCheck,
  Bell,
  Megaphone,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  ShieldCheck,
  Clock,
  AlertCircle,
  Inbox,
  Send
} from 'lucide-react'
import {
  motion
} from 'framer-motion'
import {
  useAksiPengumumanSekolah,
  useDaftarPengumumanSekolah
} from '../hooks/useDashboardPemantauan'
import {
  reportService
} from '../services/reportService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ConfirmDialog from '../components/app/ConfirmDialog'
import AppBadge from '../components/app/AppBadge'
import {
  Button
} from '../components/ui/button'
import { SquircleActionButton } from '../components/master-data'
import {
  DatePicker
} from '@/components/ui/date-picker'

export default function NotificationsPage() {
 const { data: daftarPengumuman } = useDaftarPengumumanSekolah({ per_page: 20 })
 const aksiPengumuman = useAksiPengumumanSekolah()
 const [notifications, setNotifications] = useState([])
 const [loadingNotif, setLoadingNotif] = useState(true)

 // Dialog Konfirmasi States
 const [pendingPengumuman, setPendingPengumuman] = useState(null)
 const [showSaveConfirm, setShowSaveConfirm] = useState(false)
 const [deleteTarget, setDeleteTarget] = useState(null)

 const loadNotifications = useCallback(async () => {
 try {
 setLoadingNotif(true)
 const data = await reportService.notifications()
 setNotifications(data.data || data || [])
 } catch (_err) {
 // Abaikan jika belum ada notifikasi
 } finally {
 setLoadingNotif(false)
 }
 }, [])

 useEffect(() => {
 loadNotifications()
 }, [loadNotifications])

 const handleMarkRead = async (id) => {
 await reportService.markNotificationRead(id)
 loadNotifications()
 }

 const handleMarkAllRead = async () => {
 await reportService.markAllNotificationsRead()
 loadNotifications()
 }

 const formPengumuman = useForm({
 defaultValues: {
 judul_pengumuman: '',
 isi_pengumuman: '',
 target_peran: 'Semua',
 mulai_tampil: new Date().toISOString().slice(0, 10),
 selesai_tampil: '',
 prioritas: 1,
 status_aktif: true,
 },
 })

 const submitPengumuman = (values) => {
 const payload = {
 judul_pengumuman: values.judul_pengumuman,
 isi_pengumuman: values.isi_pengumuman,
 target_peran: [values.target_peran],
 mulai_tampil: values.mulai_tampil,
 selesai_tampil: values.selesai_tampil || null,
 prioritas: Number(values.prioritas),
 status_aktif: values.status_aktif,
 data_tambahan: { sumber: 'modul-notifikasi' },
 }
 setPendingPengumuman(payload)
 setShowSaveConfirm(true)
 }

 const handleConfirmSavePengumuman = async () => {
 if (!pendingPengumuman) return
 await aksiPengumuman.tambah.mutateAsync(pendingPengumuman)
 formPengumuman.reset({
 ...formPengumuman.getValues(),
 judul_pengumuman: '',
 isi_pengumuman: '',
 })
 setShowSaveConfirm(false)
 }

 const handleConfirmDeletePengumuman = async () => {
 if (!deleteTarget) return
 await aksiPengumuman.hapus.mutateAsync(deleteTarget.id)
 setDeleteTarget(null)
 }

 const unreadCount = useMemo(() => {
 return notifications.filter((n) => !n.is_read).length
 }, [notifications])

 const announcementsList = useMemo(() => {
 return daftarPengumuman?.data || []
 }, [daftarPengumuman])

 return (
 <PageContainer>
 <div className="space-y-6 pb-12">
 {/* Breadcrumb */}
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Notifikasi & Pengumuman' },
 ]}
 />

 {/* Modern Hero Header */}
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-4">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <Bell className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <Sparkles className="size-3 animate-pulse text-white" />
 Pusat Informasi & Notifikasi
 </span>
 {unreadCount > 0 && (
 <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {unreadCount} Pesan Baru
 </span>
 )}
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Notifikasi Sistem & Pengumuman Sekolah
 </h1>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
 Pantau riwayat pemberitahuan otomatis akun Anda dan kelola distribusi pengumuman resmi ke seluruh pengguna.
 </p>
 </div>
 </div>

 <div className="flex shrink-0 items-center gap-2">
 <SquircleActionButton
 variant="primary"
 icon={CheckCheck}
 label="Tandai Semua Dibaca"
 onClick={handleMarkAllRead}
 disabled={loadingNotif || unreadCount === 0}
 showLabel
 />
 </div>
 </div>
 </div>
 </motion.div>

 {/* KPI Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-4.5 shadow-sm dark:border-emerald-800/60 dark:!bg-emerald-950/50">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Total Notifikasi</p>
 <h3 className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-200">{notifications.length}</h3>
 </div>
 <div className="flex size-11 items-center justify-center rounded-xl !bg-emerald-600 !text-white">
 <Inbox className="size-5" />
 </div>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 hover:!bg-amber-200/70 p-4.5 shadow-sm dark:border-emerald-800/60 dark:!bg-amber-950/50">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Belum Dibaca</p>
 <h3 className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-200">{unreadCount}</h3>
 </div>
 <div className="flex size-11 items-center justify-center rounded-xl !bg-amber-600 !text-white">
 <Bell className="size-5" />
 </div>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-sky-100/90 hover:!bg-sky-200/70 p-4.5 shadow-sm dark:border-emerald-800/60 dark:!bg-sky-950/50">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">Pengumuman Aktif</p>
 <h3 className="mt-1 text-2xl font-black text-sky-800 dark:text-sky-200">{announcementsList.length}</h3>
 </div>
 <div className="flex size-11 items-center justify-center rounded-xl !bg-emerald-600 !text-white">
 <Megaphone className="size-5" />
 </div>
 </div>
 </div>
 </div>

 {/* Section 1: Notifikasi Pengguna */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-4 dark:border-emerald-800/60 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
 <Bell className="size-4" />
 </div>
 <div>
 <h2 className="text-sm font-black text-slate-900 dark:text-white">Pemberitahuan Sistem Akun</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400">Log notifikasi transaksi, presensi, dan aktivitas sistem terbaru</p>
 </div>
 </div>
 </div>

 <div className="p-5">
 {loadingNotif ? (
 <div className="flex items-center justify-center py-10 text-slate-500 dark:text-slate-400 text-xs font-medium">
 <Clock className="size-4 animate-spin mr-2 text-emerald-600" /> Memuat notifikasi...
 </div>
 ) : notifications.length > 0 ? (
 <div className="space-y-3">
 {notifications.map((n) => (
 <div
 key={n.id}
 className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
 n.is_read
 ? 'border-emerald-200/80 bg-slate-50/70 dark:border-emerald-800/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/30 text-slate-900 dark:text-white shadow-xs'
 }`}
 >
 <div className="space-y-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 {!n.is_read && (
 <span className="size-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
 )}
 <h4 className="text-xs font-black tracking-tight">{n.title}</h4>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
 <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-semibold pt-1">
 <Clock className="size-3" />
 <span>{new Date(n.created_at).toLocaleString('id-ID')}</span>
 </div>
 </div>
 {!n.is_read && (
 <SquircleActionButton
 variant="restore"
 icon={CheckCheck}
 label="Tandai Dibaca"
 onClick={() => handleMarkRead(n.id)}
 showLabel
 className="shrink-0 self-start sm:self-auto"
 />
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-10 text-slate-400 dark:text-slate-500">
 <Inbox className="size-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
 <p className="text-xs font-semibold">Belum ada notifikasi baru untuk akun Anda.</p>
 </div>
 )}
 </div>
 </section>

 {/* Section 2: Form Tambah Pengumuman */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-4 dark:border-emerald-800/60 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
 <Megaphone className="size-4" />
 </div>
 <div>
 <h2 className="text-sm font-black text-slate-900 dark:text-white">Publikasi Pengumuman Sekolah</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400">Buat maklumat atau informasi penting untuk disiarkan ke dashboard pengguna</p>
 </div>
 </div>
 </div>

 <div className="p-5">
 <form onSubmit={formPengumuman.handleSubmit(submitPengumuman)} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Judul Pengumuman</label>
 <input
 type="text"
 placeholder="Contoh: Jadwal Libur Awal Ramadhan 1448 H"
 {...formPengumuman.register('judul_pengumuman', { required: true })}
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Peran Pengguna</label>
 <CustomSelect
 {...formPengumuman.register('target_peran')}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value="Semua">Semua Pengguna</option>
 <option value="Guru">Semua Guru & Musyrif</option>
 <option value="Orang Tua">Orang Tua / Wali Murid</option>
 <option value="Siswa">Siswa / Santri</option>
 <option value="Staf">Staf & Karyawan</option>
 </CustomSelect>
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Isi Pengumuman Ringkas</label>
 <textarea
 rows={3}
 placeholder="Tuliskan isi pengumuman atau instruksi penting secara jelas..."
 {...formPengumuman.register('isi_pengumuman', { required: true })}
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mulai Tampil</label>
 <DatePicker
 value={formPengumuman.watch('mulai_tampil')}
 onChange={(e) => formPengumuman.setValue('mulai_tampil', e.target.value, { shouldValidate: true })}
 required
 inputClassName="px-3.5 py-2 text-xs"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Selesai Tampil</label>
 <DatePicker
 value={formPengumuman.watch('selesai_tampil')}
 onChange={(e) => formPengumuman.setValue('selesai_tampil', e.target.value, { shouldValidate: true })}
 inputClassName="px-3.5 py-2 text-xs"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Prioritas (1-10)</label>
 <input
 type="number"
 min="1"
 max="10"
 {...formPengumuman.register('prioritas')}
 className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
 <CustomSelect
 {...formPengumuman.register('status_aktif')}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 >
 <option value={true}>Aktif</option>
 <option value={false}>Nonaktif</option>
 </CustomSelect>
 </div>
 </div>

 <div className="flex justify-end pt-2">
 <Button variant="primary" size="sm" type="submit" className="rounded-xl font-bold">
 <Send className="size-4 mr-1.5" />
 Simpan & Publikasikan Pengumuman
 </Button>
 </div>
 </form>
 </div>
 </section>

 {/* Section 3: Datatable Pengumuman Aktif */}
 <AppDataTable
 title="Daftar Pengumuman Terbit"
 description={`Total ${announcementsList.length} pengumuman terdaftar di sistem`}
 icon={Megaphone}
 countLabel={`${announcementsList.length} Pengumuman`}
 showToolbar={false}
 showPagination={false}
 >
 <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3.5">JUDUL PENGUMUMAN</th>
                <th className="px-4 py-3.5">TARGET & PRIORITAS</th>
                <th className="px-4 py-3.5">PERIODE TAYANG</th>
                <th className="px-4 py-3.5">STATUS</th>
                <th className="px-4 py-3.5 text-right w-16 sm:w-20 select-none"></th>
              </tr>
            </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {announcementsList.length > 0 ? (
 announcementsList.map((row) => (
 <tr key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
 <td className="px-4 py-3.5">
 <div className="font-bold text-slate-900 dark:text-white">{row.judul_pengumuman}</div>
 {row.isi_pengumuman && (
 <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{row.isi_pengumuman}</div>
 )}
 </td>
 <td className="px-4 py-3.5">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
 {Array.isArray(row.target_peran) ? row.target_peran.join(', ') : (row.target_peran || 'Semua')}
 </span>
 <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 P{row.prioritas}
 </span>
 </div>
 </td>
 <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">
 <div>{row.mulai_tampil}</div>
 <div className="text-[10px] text-slate-400">s/d {row.selesai_tampil || 'Permanen'}</div>
 </td>
 <td className="px-4 py-3.5">
 <AppBadge status={row.status_aktif ? 'aktif' : 'nonaktif'}>
 {row.status_aktif ? 'Aktif' : 'Nonaktif'}
 </AppBadge>
 </td>
                  <td className="px-4 py-3.5 text-right">
                    <SquircleActionButton
                      variant="delete"
                      icon={Trash2}
                      label="Hapus Pengumuman"
                      onClick={() => setDeleteTarget(row)}
                    />
                  </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500">
 Belum ada pengumuman sekolah yang dibuat.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </AppDataTable>

 {/* Konfirmasi Simpan Pengumuman */}
 <ConfirmDialog
 isOpen={showSaveConfirm}
 onClose={() => setShowSaveConfirm(false)}
 onConfirm={handleConfirmSavePengumuman}
 isLoading={aksiPengumuman.tambah.isPending}
 action="create"
 title="Konfirmasi Simpan Pengumuman"
 message={`Apakah Anda yakin ingin mempublikasikan pengumuman "${pendingPengumuman?.judul_pengumuman}"?`}
 />

 {/* Konfirmasi Hapus Pengumuman */}
 <ConfirmDialog
 isOpen={Boolean(deleteTarget)}
 onClose={() => setDeleteTarget(null)}
 onConfirm={handleConfirmDeletePengumuman}
 isLoading={aksiPengumuman.hapus.isPending}
 action="delete"
 title="Konfirmasi Hapus Pengumuman"
 message={`Apakah Anda yakin ingin menghapus pengumuman "${deleteTarget?.judul_pengumuman}"?`}
 />
 </div>
 </PageContainer>
 )
}
