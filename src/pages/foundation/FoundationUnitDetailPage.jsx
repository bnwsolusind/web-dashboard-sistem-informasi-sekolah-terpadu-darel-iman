import {
  useCallback,
  useEffect,
  useState
} from 'react'
import {
  useParams,
  Link
} from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  MapPin,
  Network,
  School,
  ShieldAlert,
  UserCheck,
  UsersRound
} from 'lucide-react'
import api from '../../services/api'
import {
  MasterDataPage,
  MasterErrorState,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid,
  MasterStatusBadge,
  masterStyles
} from '../../components/master-data'
import {
  PersonIdentityCell
} from '../../components/ui/PersonIdentityCell'

export function FoundationUnitDetailPage() {
 const { id } = useParams()
 const [unitData, setUnitData] = useState(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)

 const fetchDetail = useCallback(async () => {
 setLoading(true)
 setError(false)
 try {
 const res = await api.get(`/foundation/units/${id}`)
 setUnitData(res.data?.data)
 } catch (err) {
 console.error(`Failed to fetch foundation unit detail ${id}:`, err)
 setError(true)
 } finally {
 setLoading(false)
 }
 }, [id])

 useEffect(() => {
 fetchDetail()
 }, [fetchDetail])

 const unit = unitData || {}
 const statistik = unit.statistik || {}
 const kepala = unit.kepala_sekolah || {}
 const academic = unit.academic || {}

 const quickLinks = [
 { to: '/dashboard/yayasan/struktur-organisasi', label: 'Struktur Organisasi', icon: Network },
 { to: '/dashboard/yayasan/pegawai-guru', label: 'Pegawai & Guru', icon: UsersRound },
 { to: '/dashboard/yayasan/siswa', label: 'Data Siswa', icon: GraduationCap },
 { to: '/dashboard/yayasan/siswa-baru', label: 'Siswa Baru', icon: CalendarDays },
 { to: '/dashboard/yayasan/mutasi-siswa', label: 'Mutasi Siswa', icon: Building2 },
 { to: '/dashboard/yayasan/kelulusan-alumni', label: 'Kelulusan & Alumni', icon: School },
 { to: '/dashboard/yayasan/informasi-sekolah', label: 'Informasi Sekolah', icon: MapPin },
 ]

 return (
 <MasterDataPage hideBreadcrumb className="foundation-unit-detail-page">
 <Link to="/dashboard/yayasan/unit-pendidikan" className="master-breadcrumb inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-400">
 <ArrowLeft className="h-4 w-4" />
 Kembali ke Daftar Unit
 <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
 <strong className="text-slate-800 dark:text-white">Detail Unit</strong>
 </Link>

 <MasterPageHeader
 title={loading ? 'Memuat Detail Unit...' : (unit.nama || unit.name || 'Detail Unit Pendidikan')}
 description={unit.description || unit.location || 'Pantau statistik dan informasi operasional unit pendidikan secara real-time.'}
 tone="brand"
 icon={School}
 actions={(
 <>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
 <ShieldAlert className="h-3 w-3" />
 Mode Monitoring • Read-Only
 </span>
 {!loading && !error && (
 <MasterStatusBadge active={unit.is_active} activeLabel="Unit Aktif" inactiveLabel="Unit Nonaktif" />
 )}
 </>
 )}
 />

 {error ? (
 <MasterErrorState
 title="Detail unit tidak dapat dimuat"
 description="Terjadi kesalahan saat mengambil data unit dari server."
 onRetry={fetchDetail}
 />
 ) : loading ? (
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className={`${masterStyles.card} animate-pulse p-6`}><div className="h-9 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" /><div className="mt-4 h-4 w-24 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" /><div className="mt-2 h-6 w-16 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" /></div>
 ))}
 </div>
 ) : (
 <>
 <MasterStatsGrid>
 <MasterStatCard icon={UserCheck} label="Guru" value={statistik.guru ?? 0} description="Pendidik pengajar" variant="success" delay={40} />
 <MasterStatCard icon={UsersRound} label="Pegawai" value={statistik.pegawai ?? 0} description="Tenaga pendidik & kependidikan" variant="info" delay={80} />
 <MasterStatCard icon={GraduationCap} label="Siswa Aktif" value={statistik.siswa ?? 0} description="Terdaftar aktif" variant="warning" delay={120} />
 <MasterStatCard icon={School} label="Kelas / Rombel" value={`${statistik.kelas ?? 0} / ${statistik.rombel ?? 0}`} description="Distribusi pembelajaran" variant="neutral" delay={160} />
 </MasterStatsGrid>

 <div className="grid items-start gap-5 lg:grid-cols-3">
 <section className={`${masterStyles.card} p-6 lg:col-span-2`}>
 <h2 className="text-sm font-bold text-slate-900 dark:text-white">Informasi Unit Pendidikan</h2>
 <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
 {[
 ['Kode Unit', unit.kode || unit.code || '-'],
 ['Jenis Unit', unit.jenis_unit || unit.level || '-'],
 ['Lokasi', unit.location || unit.description || '-'],
 ['Tahun Ajaran', academic.tahun_ajaran || '-'],
 ['Semester', academic.semester || '-'],
 ['Status', unit.is_active ? 'Aktif' : 'Nonaktif'],
 ].map(([label, value]) => (
 <div key={label} className="border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
 <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt>
 <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
 </div>
 ))}
 </dl>
 </section>

 <section className={`${masterStyles.card} p-6`}>
 <h2 className="text-sm font-bold text-slate-900 dark:text-white">Kepala Sekolah</h2>
 <div className="mt-4">
 <PersonIdentityCell
 name={kepala.nama || 'Belum Ditentukan'}
 subtitle={kepala.niy ? `NIY. ${kepala.niy}` : 'Kepala Unit'}
 />
 </div>
 <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
 <p className="flex items-center justify-between gap-3"><span>No. HP</span><strong className="font-semibold text-slate-700 dark:text-slate-200">{kepala.no_hp || '-'}</strong></p>
 <p className="flex items-center justify-between gap-3"><span>Email</span><strong className="max-w-[60%] truncate font-semibold text-slate-700 dark:text-slate-200">{kepala.email || '-'}</strong></p>
 </div>
 </section>
 </div>

 <section className={`${masterStyles.card} p-6`}>
 <h2 className="text-sm font-bold text-slate-900 dark:text-white">Akses Cepat Monitoring</h2>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Buka modul monitoring terkait unit ini di bawah menu Yayasan.</p>
 <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {quickLinks.map(({ to, label, icon: Icon }) => (
 <Link key={to} to={to} className="flex min-h-9 items-center gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/60 dark:border-emerald-700/80 dark:text-slate-200 dark:hover:bg-emerald-950/40">
 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><Icon className="h-4 w-4" /></span>
 {label}
 <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
 </Link>
 ))}
 </div>
 </section>
 </>
 )}
 </MasterDataPage>
 )
}
