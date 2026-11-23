import { HeroUiHeader } from "../../components/ui/HeroUiHeader"
import CustomSelect from "../../components/ui/CustomSelect"
import {
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  History,
  PlayCircle,
  Search,
  ShieldCheck
} from 'lucide-react'
import {
  lmsPresensiService
} from '../../services/lmsPresensiService'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppDataTable from '../../components/app/AppDataTable'
import AppEmptyState from '../../components/app/AppEmptyState'
import AppSkeleton from '../../components/app/AppSkeleton'
import {
  Button
} from '@/components/ui/button'
import {
  Input
} from '@/components/ui/input'
import {
  Pagination
} from '@/components/ui/pagination'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow
} from '@/components/ui/table'

export default function TeacherAttendanceHistoryPage() {
 const navigate = useNavigate()
 const [loading, setLoading] = useState(true)
 const [sessions, setSessions] = useState([])
 const [search, setSearch] = useState('')
 const [statusFilter, setStatusFilter] = useState('all')
 const [currentPage, setCurrentPage] = useState(1)
 const perPage = 10

 useEffect(() => {
 let active = true
 const loadSessions = async () => {
 setLoading(true)
 try {
 const response = await lmsPresensiService.getSessions({ per_page: 100 })
 if (!active) return
 const raw = response.data?.data || response.data || []
 setSessions(Array.isArray(raw) ? raw : [])
 } catch (err) {
 console.error('Failed to load attendance history:', err)
 if (active) setSessions([])
 } finally {
 if (active) setLoading(false)
 }
 }
 loadSessions()
 return () => {
 active = false
 }
 }, [])

 const filteredSessions = useMemo(() => {
 return sessions.filter((session) => {
 const matchStatus = statusFilter === 'all' || session.status === statusFilter
 const term = search.toLowerCase()
 const subjectName = (session.schedule?.subject_name || session.subject || '').toLowerCase()
 const rombelName = (session.schedule?.class_name || session.rombel || '').toLowerCase()
 const topic = (session.topic || '').toLowerCase()
 const matchSearch = !term || subjectName.includes(term) || rombelName.includes(term) || topic.includes(term)
 return matchStatus && matchSearch
 })
 }, [sessions, statusFilter, search])

 const totalPages = Math.ceil(filteredSessions.length / perPage) || 1
 const paginatedSessions = useMemo(() => {
 const start = (currentPage - 1) * perPage
 return filteredSessions.slice(start, start + perPage)
 }, [filteredSessions, currentPage])

 const targetSessionsForStats = useMemo(() => {
 if (!search) return sessions
 const term = search.toLowerCase()
 return sessions.filter((session) => {
 const subjectName = (session.schedule?.subject_name || session.subject || '').toLowerCase()
 const rombelName = (session.schedule?.class_name || session.rombel || '').toLowerCase()
 const topic = (session.topic || '').toLowerCase()
 return subjectName.includes(term) || rombelName.includes(term) || topic.includes(term)
 })
 }, [sessions, search])

 const totalFinalized = targetSessionsForStats.filter((s) => s.status === 'finalized').length
 const totalDraft = targetSessionsForStats.filter((s) => s.status === 'draft').length
 const totalCount = targetSessionsForStats.length

 return (
 <div className="space-y-6">
 {/* Header & Breadcrumb */}
 <div>
 <AppBreadcrumb items={[{ label: 'Absensi', href: '/absensi' }, { label: 'Riwayat Presensi Guru' }]} />
        <div className="mt-3 mb-6">
        <HeroUiHeader
          title="Riwayat Presensi Mengajar"
          subtitle="Daftar seluruh sesi presensi kelas dan mata pelajaran yang pernah dicatat."
          badge="Presensi Guru"
          icon={CalendarCheck}
        />
      </div>
 </div>

 {/* KPI Metrics */}
 <div className="grid gap-4 sm:grid-cols-3">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold uppercase text-slate-500">Total Sesi Presensi</span>
 <History className="h-5 w-5 text-emerald-600" />
 </div>
 <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{totalCount}</p>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold uppercase text-slate-500">Status Finalized</span>
 <ShieldCheck className="h-5 w-5 text-teal-600" />
 </div>
 <p className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalFinalized}</p>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold uppercase text-slate-500">Status Draft</span>
 <Clock className="h-5 w-5 text-amber-600" />
 </div>
 <p className="mt-3 text-3xl font-black text-amber-600 dark:text-amber-400">{totalDraft}</p>
 </div>
 </div>

 {/* Filter Toolbar */}
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <Input
 type="text"
 placeholder="Cari mata pelajaran, rombel, atau topik..."
 value={search}
 onChange={(e) => {
 setSearch(e.target.value)
 setCurrentPage(1)
 }}
 className="pl-9 text-xs"
 />
 </div>

 <div className="flex items-center gap-2">
 <label className="text-xs font-semibold text-slate-500">Status:</label>
 <CustomSelect
 value={statusFilter}
 onChange={(e) => {
 setStatusFilter(e.target.value)
 setCurrentPage(1)
 }}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-200"
 >
 <option value="all">Semua Status</option>
 <option value="finalized">Finalized</option>
 <option value="draft">Draft</option>
 </CustomSelect>
 </div>
 </div>

 {/* Datatable */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 {loading ? (
 <div className="p-6">
 <AppSkeleton rows={6} />
 </div>
 ) : paginatedSessions.length === 0 ? (
 <div className="p-8">
 <AppEmptyState title="Tidak ada riwayat presensi" description="Belum ada sesi presensi tersimpan yang cocok dengan kriteria pencarian." />
 </div>
 ) : (
 <>
 <TableRoot fullBleed={false}>
 <TableHeader>
 <TableRow>
 <TableHead className="w-12">#</TableHead>
 <TableHead>Tanggal & Pertemuan</TableHead>
 <TableHead>Mata Pelajaran & Rombel</TableHead>
 <TableHead>Materi / Topik</TableHead>
 <TableHead>Rekap Kehadiran</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Aksi</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {paginatedSessions.map((session, index) => {
 const attendances = session.attendances || []
 const hadirCount = attendances.filter((a) => a.status === 'hadir' || a.status === 'present').length
 const totalStudents = attendances.length || session.total_students || 0

 return (
 <TableRow key={session.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 <TableCell className="font-semibold text-slate-500">
 {(currentPage - 1) * perPage + index + 1}
 </TableCell>
 <TableCell>
 <div className="font-bold text-slate-900 dark:text-white">
 {session.attendance_date || session.tanggal || '-'}
 </div>
 <span className="text-xs text-slate-500 font-medium">
 Pertemuan #{session.meeting_number || 1}
 </span>
 </TableCell>
 <TableCell>
 <div className="font-bold text-emerald-700 dark:text-emerald-400">
 {session.schedule?.subject_name || session.subject || 'Mata Pelajaran'}
 </div>
 <div className="text-xs text-slate-500 font-medium">
 Rombel: {session.schedule?.class_name || session.rombel || '-'}
 </div>
 </TableCell>
 <TableCell>
 <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2 max-w-xs">
 {session.topic || session.materi || 'Tanpa topik'}
 </p>
 </TableCell>
 <TableCell>
 <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
 {hadirCount} / {totalStudents} Hadir
 </div>
 <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden dark:bg-slate-800">
 <div
 className="h-full bg-emerald-500 rounded-full"
 style={{ width: `${totalStudents ? Math.round((hadirCount / totalStudents) * 100) : 0}%` }}
 />
 </div>
 </TableCell>
 <TableCell>
 <AppBadge variant={session.status === 'finalized' ? 'success' : 'warning'}>
 {session.status === 'finalized' ? 'Finalized' : 'Draft'}
 </AppBadge>
 </TableCell>
 <TableCell className="text-right">
 <Button
 variant="ghost"
 appearance="outline"
 size="xs"
 onClick={() => navigate(`/absensi/presensi?active_schedule=${session.schedule_id}&date=${session.attendance_date}`)}
 >
 <Eye className="mr-1 h-3.5 w-3.5" /> Detail Sesi
 </Button>
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </TableRoot>

 <div className="w-full border-t border-emerald-200/80 px-4 py-3.5 sm:px-6 dark:border-emerald-800/60">
 <Pagination
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={(page) => setCurrentPage(page)}
 sideLayout="full"
 />
 </div>
 </>
 )}
 </div>
 </div>
 )
}
