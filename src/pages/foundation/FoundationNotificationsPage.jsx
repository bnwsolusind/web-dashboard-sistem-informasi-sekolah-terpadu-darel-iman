import { HeroUiHeader } from "../../components/ui/HeroUiHeader"
import React, { useState, useEffect, useCallback } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Search,
  Filter,
  Inbox,
  AlertCircle,
  Building2,
  Users,
  GraduationCap,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  Calendar,
  Sparkles
} from 'lucide-react'
import {
  reportService
} from '../../services/reportService'
import {
  Button
} from '../../components/ui/button'
import {
  Badge
} from '../../components/ui/badge'
import {
  Skeleton
} from '../../components/ui/skeleton'
import {
  EmptyState
} from '../../components/ui/empty-state'
import AppTabs from '../../components/app/AppTabs'
import {
  useToast
} from '../../components/app'
import {
  SmartScrollFab
} from '../../components/common'
import HeroUiFilterSelect from '../../components/ui/HeroUiFilterSelect'

const TAB_CATEGORIES = [
 { key: 'all', label: 'Semua' },
 { key: 'unread', label: 'Belum Dibaca' },
 { key: 'school', label: 'Informasi Sekolah' },
 { key: 'sdm', label: 'Data SDM' },
 { key: 'student', label: 'Data Siswa' },
 { key: 'report', label: 'Laporan' },
 { key: 'system', label: 'Sistem' },
]



export function FoundationNotificationsPage() {
 const toast = useToast()
 const [notifications, setNotifications] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)
 const [markingAll, setMarkingAll] = useState(false)

 // Filters
 const [search, setSearch] = useState('')
 const [activeTab, setActiveTab] = useState('all')
 const [statusFilter, setStatusFilter] = useState('all')
 const [typeFilter, setTypeFilter] = useState('all')

 const fetchNotifications = useCallback(async () => {
 setLoading(true)
 setError(false)
 try {
 const res = await reportService.notifications({ per_page: 50 })
 const list = res?.data || res || []
 setNotifications(Array.isArray(list) ? list : [])
 } catch (err) {
 console.error('Failed to load notifications:', err)
 setError(true)
 } finally {
 setLoading(false)
 }
 }, [])

 useEffect(() => {
 fetchNotifications()
 }, [fetchNotifications])

 const handleMarkRead = async (id) => {
 try {
 await reportService.markNotificationRead(id)
 setNotifications((prev) =>
 prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
 )
 } catch (err) {
 console.error('Gagal menandai dibaca:', err)
 toast.error('Gagal', 'Terjadi kesalahan saat menandai notifikasi.')
 }
 }

 const handleMarkAllRead = async () => {
 setMarkingAll(true)
 try {
 await reportService.markAllNotificationsRead()
 setNotifications((prev) =>
 prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
 )
 toast.success('Berhasil!', 'Semua notifikasi telah ditandai sebagai dibaca.')
 } catch (err) {
 console.error('Gagal menandai semua dibaca:', err)
 toast.error('Gagal', 'Gagal menandai semua notifikasi dibaca.')
 } finally {
 setMarkingAll(false)
 }
 }

 // Filtered Notifications
 const filteredNotifications = notifications.filter((n) => {
 const title = (n.title || '').toLowerCase()
 const message = (n.message || n.body || '').toLowerCase()
 const type = (n.type || '').toLowerCase()
 const isRead = Boolean(n.is_read || n.read_at)

 const matchesSearch = title.includes(search.toLowerCase()) || message.includes(search.toLowerCase())
 
 let matchesStatus = true;
 if (statusFilter === 'unread' || activeTab === 'unread') {
 matchesStatus = !isRead
 } else if (statusFilter === 'read') {
 matchesStatus = isRead
 }

 let matchesType = true;
 if (typeFilter !== 'all') {
 matchesType = type.includes(typeFilter.toLowerCase())
 }

 let matchesTab = true;
 if (activeTab === 'school') matchesType = type.includes('sekolah') || type.includes('info') || type.includes('announcement')
 if (activeTab === 'sdm') matchesType = type.includes('pegawai') || type.includes('guru') || type.includes('sdm') || type.includes('hr')
 if (activeTab === 'student') matchesType = type.includes('siswa') || type.includes('mutasi') || type.includes('kelulusan')
 if (activeTab === 'report') matchesType = type.includes('laporan') || type.includes('report')
 if (activeTab === 'system') matchesType = type.includes('system') || type.includes('sistem') || type.includes('auth')

 return matchesSearch && matchesStatus && matchesType && matchesTab
 })

 // KPI Calculations
 const totalCount = notifications.length
 const unreadCount = notifications.filter((n) => !n.is_read && !n.read_at).length
 const readCount = totalCount - unreadCount
 const todayCount = notifications.filter((n) => {
 if (!n.created_at) return false
 const date = new Date(n.created_at)
 const today = new Date()
 return date.toDateString() === today.toDateString()
 }).length

 const getTypeIcon = (type) => {
 const t = (type || '').toLowerCase()
 if (t.includes('sdm') || t.includes('pegawai') || t.includes('guru')) return <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
 if (t.includes('siswa') || t.includes('mutasi') || t.includes('kelulusan')) return <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
 if (t.includes('laporan') || t.includes('report')) return <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
 if (t.includes('sekolah') || t.includes('info')) return <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
 return <Bell className="w-5 h-5 text-[#059669] dark:text-emerald-400" />
 }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Hero Banner */}
      <HeroUiHeader
        title="Pusat Notifikasi & Aktivitas Unit"
        subtitle="Lihat informasi terbaru, pembaruan data SDM, aktivitas siswa, mutasi, kelulusan, dan laporan resmi dari seluruh unit pendidikan."
        badge="Notifikasi Yayasan"
        icon={Bell}
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <Button
              variant="outline"
              onClick={fetchNotifications}
              disabled={loading}
              className="border-emerald-300 dark:border-emerald-800/60 bg-white/80 dark:bg-slate-800/80 hover:bg-white text-slate-800 dark:text-slate-200 shadow-xs"
            >
              <RefreshCw className={loading ? "w-4 h-4 mr-2 animate-spin" : "w-4 h-4 mr-2"} />
              Refresh
            </Button>
            <Button
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
              className="bg-emerald-600 text-white font-bold hover:bg-emerald-700 border-none shadow-md"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Tandai Semua Dibaca
            </Button>
          </div>
        }
      />

      {/* 2. KPI Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="!bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 p-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex items-center gap-4">
 <div className="w-12 h-9 rounded-xl !bg-emerald-600 !text-white flex items-center justify-center shrink-0">
 <Inbox className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Total Notifikasi</p>
 <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-200">{loading ? '...' : totalCount}</h3>
 <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">Semua rekaman</p>
 </div>
 </div>

 <div className="!bg-rose-100/90 hover:!bg-rose-200/70 dark:!bg-rose-950/50 p-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex items-center gap-4">
 <div className="w-12 h-9 rounded-xl !bg-rose-600 !text-white flex items-center justify-center shrink-0">
 <Bell className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">Belum Dibaca</p>
 <h3 className="text-2xl font-black text-rose-800 dark:text-rose-200">{loading ? '...' : unreadCount}</h3>
 <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">Membutuhkan perhatian</p>
 </div>
 </div>

 <div className="!bg-blue-100/90 hover:!bg-blue-200/70 dark:!bg-blue-950/50 p-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex items-center gap-4">
 <div className="w-12 h-9 rounded-xl !bg-blue-600 !text-white flex items-center justify-center shrink-0">
 <CheckCircle2 className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300">Sudah Dibaca</p>
 <h3 className="text-2xl font-black text-blue-800 dark:text-blue-200">{loading ? '...' : readCount}</h3>
 <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">Tersimpan dalam arsip</p>
 </div>
 </div>

 <div className="!bg-amber-100/90 hover:!bg-amber-200/70 dark:!bg-amber-950/50 p-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex items-center gap-4">
 <div className="w-12 h-9 rounded-xl !bg-amber-600 !text-white flex items-center justify-center shrink-0">
 <Clock className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">Hari Ini</p>
 <h3 className="text-2xl font-black text-amber-800 dark:text-amber-200">{loading ? '...' : todayCount}</h3>
 <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Notifikasi baru hari ini</p>
 </div>
 </div>
 </div>

 {/* 3. Toolbar Dua Tingkat */}
 <div className="bg-white dark:bg-[#13221f] p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-4">
 {/* Row 1: Search & Status Filter */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari notifikasi berdasarkan judul atau pesan..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#059669] transition"
 />
 </div>

 <div className="w-44 shrink-0">
 <HeroUiFilterSelect
 size="sm"
 value={statusFilter}
 onChange={(val) => setStatusFilter(val)}
 options={[
 { value: 'all', label: 'Semua Status' },
 { value: 'unread', label: 'Belum Dibaca' },
 { value: 'read', label: 'Sudah Dibaca' },
 ]}
 placeholder="Pilih Status"
 aria-label="Filter status notifikasi"
 />
 </div>
 </div>

 {/* Row 2: Category Tabs Bar */}
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 overflow-x-auto no-scrollbar">
 <AppTabs
 tabs={TAB_CATEGORIES.map((tab) => ({
 id: tab.key,
 label: tab.label,
 badge: tab.key === 'unread' && unreadCount > 0 ? unreadCount : undefined,
 }))}
 activeTab={activeTab}
 onChange={setActiveTab}
 ariaLabel="Filter kategori notifikasi"
 />
 </div>
 </div>

 {/* 4. Notification Cards List */}
 <div id="daftar-notifikasi-yayasan" className="bg-white dark:bg-[#13221f] rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs overflow-hidden scroll-mt-6">
 <div className="px-6 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
 <div>
 <h3 className="text-sm font-black text-slate-800 dark:text-white">Daftar Pemberitahuan</h3>
 <p className="text-xs text-slate-500 mt-0.5">Menampilkan {filteredNotifications.length} dari {notifications.length} notifikasi</p>
 </div>
 {unreadCount > 0 && (
 <Badge variant="warning" className="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-emerald-200/80">
 {unreadCount} Notifikasi Baru
 </Badge>
 )}
 </div>

 <div className="divide-y divide-emerald-100/80 dark:divide-slate-800/60">
 {loading ? (
 <div className="p-6 space-y-4">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="flex items-start gap-4">
 <Skeleton className="w-10 h-9 rounded-xl" />
 <div className="space-y-2 flex-1">
 <Skeleton className="h-4 w-1/3" />
 <Skeleton className="h-3 w-3/4" />
 </div>
 </div>
 ))}
 </div>
 ) : error ? (
 <div className="p-12 text-center">
 <AlertCircle className="w-12 h-9 text-rose-500 mx-auto mb-3" />
 <h4 className="text-base font-bold text-slate-800 dark:text-white">Data Notifikasi Gagal Dimuat</h4>
 <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
 Terjadi kesalahan saat mengambil notifikasi sistem. Silakan coba kembali.
 </p>
 <Button onClick={fetchNotifications} className="mt-4 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl">
 Coba Lagi
 </Button>
 </div>
 ) : filteredNotifications.length > 0 ? (
 filteredNotifications.map((notif) => {
 const isUnread = !notif.is_read && !notif.read_at
 return (
 <div
 key={notif.id}
 className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 ${
 isUnread ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
 }`}
 >
 <div className="flex items-start gap-4">
 <div className="w-10 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0 mt-0.5">
 {getTypeIcon(notif.type)}
 </div>

 <div className="space-y-1">
 <div className="flex items-center gap-2 flex-wrap">
 <h4 className={`text-sm tracking-tight ${isUnread ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
 {notif.title || 'Notifikasi Sistem'}
 </h4>
 {isUnread && (
 <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-rose-500 text-white rounded-full">
 Baru
 </span>
 )}
 {notif.type && (
 <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md">
 {notif.type}
 </span>
 )}
 </div>

 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed w-full">
 {notif.message || notif.body || 'Tidak ada rincian pesan.'}
 </p>

 <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
 <span className="flex items-center gap-1">
 <Calendar className="w-3 h-3" />
 {notif.created_at ? new Date(notif.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Baru saja'}
 </span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2 self-end md:self-center shrink-0">
 {isUnread && (
 <button
 type="button"
 onClick={() => handleMarkRead(notif.id)}
 className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 hover:bg-emerald-50 hover:text-emerald-700 text-emerald-700 dark:text-emerald-400 rounded-xl transition flex items-center gap-1.5"
 >
 <CheckCheck className="w-3.5 h-3.5" />
 Tandai Dibaca
 </button>
 )}
 </div>
 </div>
 )
 })
 ) : (
 <div className="p-12 text-center">
 <Inbox className="w-12 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
 <h4 className="text-base font-bold text-slate-800 dark:text-white">Belum Ada Notifikasi</h4>
 <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
 Informasi dan pembaruan terbaru akan tampil otomatis di halaman ini.
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="daftar-notifikasi-yayasan" downTooltip="Langsung ke Notifikasi" />
 </div>
 )
}
