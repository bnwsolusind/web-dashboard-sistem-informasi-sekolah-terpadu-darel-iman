import {
  useState,
  useEffect
} from 'react'
import {
  Link
} from 'react-router-dom'
import {
  FaMosque
} from 'react-icons/fa6'
import {
  Phone,
  Megaphone,
  Award,
  BookOpen
} from 'lucide-react'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import {
  dashboardPemantauanService
} from '../services/dashboardPemantauanService'

export default function BeritaPublikPage() {
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const logoUrl = pengaturan?.logo_url || pengaturan?.logoUrl || ''
 const namaSekolah = pengaturan?.school_name || pengaturan?.namaSekolah || 'Yayasan Pendidikan Islam'
 const namaAplikasi = pengaturan?.application_name || 'Dareliman Edu'

 const [beritaList, setBeritaList] = useState([])
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 let mounted = true
 const fetchDatabaseBerita = async () => {
 try {
 setLoading(true)
 const res = await dashboardPemantauanService.getDaftarPengumumanSekolah()
 const apiData = res?.data || res || []

 const rawCache = localStorage.getItem('school_news_announcements_db')
 const cachedList = rawCache ? JSON.parse(rawCache) : []

 const finalBerita = Array.isArray(apiData) && apiData.length > 0 ? apiData : (Array.isArray(cachedList) ? cachedList : [])

 if (mounted) {
 setBeritaList(finalBerita)
 }
 } catch {
 const rawCache = localStorage.getItem('school_news_announcements_db')
 const cachedList = rawCache ? JSON.parse(rawCache) : []
 if (mounted) {
 setBeritaList(Array.isArray(cachedList) ? cachedList : [])
 }
 } finally {
 if (mounted) {
 setLoading(false)
 }
 }
 }

 fetchDatabaseBerita()
 return () => {
 mounted = false
 }
 }, [])

 return (
 <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans relative">
 {/* Top Header Bar */}
 <div className="relative z-20 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-white/90 dark:border-emerald-800/60 dark:bg-slate-900/90 backdrop-blur-sm shadow-xs shrink-0">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 {logoUrl ? (
 <img
 src={logoUrl}
 alt="Logo Sekolah"
 className="w-7 h-7 rounded object-contain p-0.5 bg-white border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
 />
 ) : (
 <div className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
 <FaMosque className="w-4 h-4" />
 </div>
 )}
 <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 tracking-tight">
 {namaSekolah}
 </span>
 <span className="hidden sm:inline text-xs text-slate-300 dark:text-slate-700">•</span>
 <span className="hidden sm:inline text-xs text-slate-500 font-semibold dark:text-slate-400">
 {namaAplikasi}
 </span>
 </div>

 <div className="flex items-center gap-3 text-xs">
 <span className="hidden md:inline text-slate-500 font-medium">Layanan PPDB & Informasi:</span>
 <a
 href="tel:0751448890"
 className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
 >
 <Phone className="h-3.5 w-3.5" />
 <span>(0751) 448890</span>
 </a>
 </div>
 </div>
 </div>

 {/* Main Content Area */}
 <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-8">
 <header className="berita-publik-header max-w-3xl mx-auto text-center space-y-3 pt-4">
 <div className="flex items-center justify-center gap-3">
 {logoUrl ? (
 <img
 src={logoUrl}
 alt="Logo Sekolah"
 className="w-16 h-16 rounded-xl bg-white p-1.5 shadow-md border border-emerald-200/80 dark:border-emerald-800/60 object-contain"
 />
 ) : (
 <div className="w-16 h-16 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-md">
 <FaMosque className="w-8 h-8" />
 </div>
 )}
 <div className="text-left">
 <p className="text-xs font-black text-amber-600 uppercase tracking-widest">PORTAL INFORMASI & BERITA</p>
 <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-300">{namaSekolah}</h2>
 </div>
 </div>

 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">Berita & Pengumuman Akademik Terbaru</h1>
 <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
 Halaman resmi informasi publik yang dapat diakses oleh orang tua, siswa, maupun masyarakat umum sebelum masuk ke sistem terpadu.
 </p>
 <div className="pt-2">
 <Link className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition" to="/masuk">
 Masuk ke Dashboard Sistem
 </Link>
 </div>
 </header>

 {loading ? (
 <div className="text-center py-12 text-slate-500 text-xs">Memuat informasi dan berita...</div>
 ) : beritaList.length === 0 ? (
 <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-emerald-200/80 dark:border-emerald-800/60 text-slate-500 space-y-2">
 <Megaphone className="h-8 w-8 mx-auto text-slate-400 opacity-60" />
 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Berita Publik</p>
 <p className="text-xs text-slate-400">Informasi dan berita terbaru akan ditampilkan di sini saat dipublikasikan.</p>
 </div>
 ) : (
 <div className="berita-publik-grid grid grid-cols-1 md:grid-cols-3 gap-5">
 {beritaList.map((berita) => (
 <article key={berita.id || berita.judul} className="berita-card p-5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm space-y-2.5 transition hover:shadow-md">
 <div className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
 <span>{berita.tanggal || berita.tanggal_publikasi || berita.date || '-'}</span>
 <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {berita.kategori || berita.category || 'INFORMASI'}
 </span>
 </div>
 <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{berita.judul || berita.title}</h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{berita.ringkasan || berita.desc || berita.isi}</p>
 </article>
 ))}
 </div>
 )}
 </main>

 {/* Footer Bar */}
 <footer className="relative z-20 text-center py-3 text-xs text-slate-400 border-t border-emerald-200/60 bg-white/90 dark:border-emerald-800/60 dark:bg-slate-900 shrink-0 mt-auto">
 © {new Date().getFullYear()} {namaSekolah} — {namaAplikasi}. All rights reserved.{' '}
 <span className="font-mono text-emerald-700 font-medium ml-1 dark:text-emerald-400">Ver 2.1.0</span>
 </footer>
 </div>
 )
}
