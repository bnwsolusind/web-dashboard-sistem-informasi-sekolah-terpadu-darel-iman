import { useEffect, useMemo, useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  Images,
  Megaphone,
  Newspaper,
  Paperclip,
  RefreshCw,
  School,
  Search,
  Sparkles,
  Star,
  Users,
  X
} from 'lucide-react'
import { schoolInformationService } from '../../services/schoolInformationService'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuthStore } from '../../stores/authStore'

const tabs = [
  ['all', 'Semua', School],
  ['announcement', 'Pengumuman', Megaphone],
  ['event', 'Agenda', CalendarDays],
  ['news', 'Berita', Newspaper],
  ['circular', 'Surat Edaran', FileText],
  ['calendar', 'Kalender', CalendarDays],
  ['gallery', 'Galeri', Images],
]

const tabPastelColors = {
  all: 'bg-emerald-100/90 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-600',
  announcement: 'bg-blue-100/90 text-blue-800 hover:bg-blue-600 hover:text-white dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-600',
  event: 'bg-purple-100/90 text-purple-800 hover:bg-purple-600 hover:text-white dark:bg-purple-950/70 dark:text-purple-300 dark:hover:bg-purple-600',
  news: 'bg-sky-100/90 text-sky-800 hover:bg-sky-500 hover:text-white dark:bg-sky-950/70 dark:text-sky-300 dark:hover:bg-sky-500',
  circular: 'bg-amber-100/90 text-amber-800 hover:bg-amber-500 hover:text-white dark:bg-amber-950/70 dark:text-amber-300 dark:hover:bg-amber-500',
  calendar: 'bg-teal-100/90 text-teal-800 hover:bg-teal-600 hover:text-white dark:bg-teal-950/70 dark:text-teal-300 dark:hover:bg-teal-600',
  gallery: 'bg-rose-100/90 text-rose-800 hover:bg-rose-600 hover:text-white dark:bg-rose-950/70 dark:text-rose-300 dark:hover:bg-rose-600',
}

const typeLabels = Object.fromEntries(tabs.map(([id, label]) => [id, label]))

const categoryThemes = {
  ppdb: {
    borderLeft: 'border-l-4 border-l-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-emerald-500/20',
    glowHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
    titleHover: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400',
  },
  kegiatan: {
    borderLeft: 'border-l-4 border-l-purple-500',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    iconBg: 'bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white shadow-purple-500/20',
    glowHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
    titleHover: 'group-hover:text-purple-700 dark:group-hover:text-purple-400',
  },
  akademik: {
    borderLeft: 'border-l-4 border-l-sky-500',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    iconBg: 'bg-gradient-to-br from-sky-500 via-blue-600 to-sky-700 text-white shadow-sky-500/20',
    glowHover: 'hover:border-sky-400 hover:shadow-sky-500/10',
    titleHover: 'group-hover:text-sky-700 dark:group-hover:text-sky-400',
  },
  prestasi: {
    borderLeft: 'border-l-4 border-l-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-amber-500/20',
    glowHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
    titleHover: 'group-hover:text-amber-700 dark:group-hover:text-amber-400',
  },
  ujian: {
    borderLeft: 'border-l-4 border-l-indigo-500',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white shadow-indigo-500/20',
    glowHover: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
    titleHover: 'group-hover:text-indigo-700 dark:group-hover:text-indigo-400',
  },
  libur: {
    borderLeft: 'border-l-4 border-l-rose-500',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    iconBg: 'bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 text-white shadow-rose-500/20',
    glowHover: 'hover:border-rose-400 hover:shadow-rose-500/10',
    titleHover: 'group-hover:text-rose-700 dark:group-hover:text-rose-400',
  },
  umum: {
    borderLeft: 'border-l-4 border-l-teal-500',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    iconBg: 'bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-700 text-white shadow-teal-500/20',
    glowHover: 'hover:border-teal-400 hover:shadow-teal-500/10',
    titleHover: 'group-hover:text-teal-700 dark:group-hover:text-teal-400',
  },
}

const getCategoryTheme = (item) => {
  const cat = String(item.category || item.type || '').toLowerCase()
  if (cat.includes('ppdb')) return categoryThemes.ppdb
  if (cat.includes('kegiatan') || cat.includes('agenda') || cat.includes('event')) return categoryThemes.kegiatan
  if (cat.includes('akademik') || cat.includes('kbm') || cat.includes('modul')) return categoryThemes.akademik
  if (cat.includes('prestasi') || cat.includes('berita') || cat.includes('news')) return categoryThemes.prestasi
  if (cat.includes('ujian') || cat.includes('cbt') || cat.includes('rapor')) return categoryThemes.ujian
  if (cat.includes('libur')) return categoryThemes.libur
  return categoryThemes.umum
}

const priorityThemes = {
  mendesak: {
    badge: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
    cardGlow: 'border-2 border-rose-300/80 bg-gradient-to-br from-rose-50/90 via-rose-50/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 shadow-md shadow-rose-500/10 hover:border-rose-400',
    topBar: 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600',
  },
  penting: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
    cardGlow: 'border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-amber-50/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 shadow-md shadow-amber-500/10 hover:border-amber-400',
    topBar: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600',
  },
  akademik: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800',
    cardGlow: 'border-2 border-sky-300/80 bg-gradient-to-br from-sky-50/90 via-sky-50/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-900 shadow-md shadow-sky-500/10 hover:border-sky-400',
    topBar: 'bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600',
  },
  umum: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
    cardGlow: 'border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 via-emerald-50/20 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 shadow-md shadow-emerald-500/10 hover:border-emerald-400',
    topBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
  },
}

const formatDate = (value) => (value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-')
const unwrap = (response) => response?.data || response || {}

function Skeletons() {
  return (
    <div className="grid gap-3.5">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-40 animate-pulse rounded-[20px] bg-slate-200/80 dark:bg-slate-800/80" />
      ))}
    </div>
  )
}

function Empty({ label }) {
  return (
    <div className="rounded-[22px] border-2 border-dashed border-emerald-300/60 bg-emerald-50/20 px-5 py-14 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <FileText className="h-7 w-7" />
      </div>
      <p className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
      <p className="mt-1 text-xs text-slate-500">Informasi baru dari sekolah akan ditampilkan otomatis di halaman ini.</p>
    </div>
  )
}

const isMatchChildUnit = (itemUnit, childUnitName, childUnitCode) => {
  if (!itemUnit) return true
  const unitLower = String(itemUnit).toLowerCase().trim()
  if (
    unitLower === 'seluruh yayasan' ||
    unitLower === 'semua unit' ||
    unitLower === 'semua unit terpadu' ||
    unitLower === 'yayasan' ||
    unitLower === 'semua' ||
    unitLower === 'all' ||
    unitLower.includes('yayasan darel iman') ||
    unitLower.includes('seluruh')
  ) {
    return true
  }
  if (!childUnitName && !childUnitCode) return true

  const childNameLower = String(childUnitName || '').toLowerCase().trim()
  const childCodeLower = String(childUnitCode || '').toLowerCase().trim()

  if (childNameLower && (unitLower.includes(childNameLower) || childNameLower.includes(unitLower))) return true
  if (childCodeLower && (unitLower.includes(childCodeLower) || childCodeLower.includes(unitLower))) return true

  return false
}

export default function SchoolInformationWorkspace({ studentId, student, embedded = false }) {
  const user = useAuthStore((state) => state.user)
  const userRoles = Array.isArray(user?.roles) ? user.roles.map((r) => (typeof r === 'string' ? r : r.name)) : [user?.role || '']
  const isParentOrStudent =
    userRoles.some((r) => /orang tua|parent|ortu|siswa|student/i.test(r)) ||
    !userRoles.some((r) => /admin|yayasan|guru|pegawai|staff|kepala/i.test(r))

  const activeTabs = useMemo(() => {
    if (isParentOrStudent) {
      return tabs.filter(([id]) => id !== 'news')
    }
    return tabs
  }, [isParentOrStudent])

  const client = useQueryClient()
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)
  const [savedOnly, setSavedOnly] = useState(false)
  const [draftSearch, setDraftSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({ search: '', category: '', priority: '', read_status: '', has_attachment: '' })

  useEffect(() => {
    const timer = setTimeout(() => setFilters((old) => ({ ...old, search: draftSearch })), 350)
    return () => clearTimeout(timer)
  }, [draftSearch])

  useEffect(() => {
    setPage(1)
  }, [tab, filters, savedOnly, studentId, student?.unit_name])

  const key = [
    'portal-school-information',
    studentId || 'self',
    student?.education_unit_id,
    student?.unit_name,
    student?.unit_code,
    tab,
    filters,
    savedOnly,
    page,
  ]

  const summary = useQuery({
    queryKey: ['portal-school-information-summary', studentId || 'self', student?.education_unit_id, student?.unit_name, student?.unit_code],
    queryFn: () =>
      schoolInformationService.summary(studentId, {
        unit_name: student?.unit_name,
        unit_code: student?.unit_code,
        education_unit_id: student?.education_unit_id,
      }),
  })

  const listing = useQuery({
    queryKey: key,
    queryFn: () =>
      schoolInformationService.list(studentId, {
        ...filters,
        type: tab,
        bookmarked: savedOnly ? 1 : undefined,
        has_attachment: filters.has_attachment || undefined,
        page,
        per_page: 12,
        unit_name: student?.unit_name,
        unit_code: student?.unit_code,
        education_unit_id: student?.education_unit_id,
      }),
  })

  const data = unwrap(listing.data)
  const summaryData = unwrap(summary.data)
  const rawItems = data?.data || []

  const items = useMemo(() => {
    return rawItems.filter((item) => isMatchChildUnit(item.education_unit || item.unit_name || item.unit, student?.unit_name, student?.unit_code))
  }, [rawItems, student?.unit_name, student?.unit_code])

  const calendarItems = useMemo(() => {
    const list = summaryData?.calendar || []
    return list.filter((item) => isMatchChildUnit(item.education_unit || item.unit_name || item.unit, student?.unit_name, student?.unit_code))
  }, [summaryData?.calendar, student?.unit_name, student?.unit_code])

  const events = useMemo(() => {
    const list = summaryData?.upcoming_events || []
    return list.filter((item) => isMatchChildUnit(item.education_unit || item.unit_name || item.unit, student?.unit_name, student?.unit_code))
  }, [summaryData?.upcoming_events, student?.unit_name, student?.unit_code])

  const news = useMemo(() => {
    const list = summaryData?.latest_news || []
    return list.filter((item) => isMatchChildUnit(item.education_unit || item.unit_name || item.unit, student?.unit_name, student?.unit_code))
  }, [summaryData?.latest_news, student?.unit_name, student?.unit_code])

  const circulars = useMemo(() => {
    const list = summaryData?.latest_circulars || []
    return list.filter((item) => isMatchChildUnit(item.education_unit || item.unit_name || item.unit, student?.unit_name, student?.unit_code))
  }, [summaryData?.latest_circulars, student?.unit_name, student?.unit_code])

  const galleries = useMemo(() => {
    return (summaryData?.galleries || []).filter((item) =>
      isMatchChildUnit(item.education_unit || item.unit_name || item.unit, student?.unit_name, student?.unit_code)
    )
  }, [summaryData?.galleries, student?.unit_name, student?.unit_code])

  const importantItems = useMemo(() => {
    return (summaryData?.important || []).filter((item) =>
      isMatchChildUnit(item.education_unit || item.unit_name || item.unit, student?.unit_name, student?.unit_code)
    )
  }, [summaryData?.important, student?.unit_name, student?.unit_code])

  const mutate = useMutation({
    mutationFn: ({ id, action }) => schoolInformationService.updateState(id, action, studentId),
    onSuccess: (response) => {
      const updated = unwrap(response)
      setDetail((old) => (old?.id === updated?.id ? updated : old))
      client.invalidateQueries({ queryKey: ['portal-school-information'] })
      client.invalidateQueries({ queryKey: ['portal-school-information-summary'] })
      client.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAll = useMutation({
    mutationFn: () => schoolInformationService.markAllRead(studentId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['portal-school-information'] })
      client.invalidateQueries({ queryKey: ['portal-school-information-summary'] })
    },
  })

  const openDetail = (item) => {
    setDetail(item)
    if (!item.is_read) mutate.mutate({ id: item.id, action: 'read' })
  }

  const reset = () => {
    setDraftSearch('')
    setFilters({ search: '', category: '', priority: '', read_status: '', has_attachment: '' })
    setSavedOnly(false)
  }

  const emptyLabel =
    {
      announcement: 'Belum ada pengumuman yang dipublikasikan untuk unit sekolah ini.',
      event: 'Belum ada agenda mendatang untuk unit sekolah ini.',
      news: 'Belum ada berita terbaru.',
      circular: 'Belum ada surat edaran.',
      gallery: 'Belum ada dokumentasi kegiatan.',
    }[tab] || 'Belum ada informasi yang dipublikasikan untuk unit sekolah anak ini.'

  const monthTitle = useMemo(() => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date()), [])

  const categoryCounts = useMemo(() => {
    const rawAll = rawItems.filter((item) => isMatchChildUnit(item.education_unit || item.unit_name || item.unit, student?.unit_name, student?.unit_code))
    return {
      all: rawAll.length,
      announcement: rawAll.filter((i) => i.type === 'announcement' || i.type === 'pengumuman').length,
      event: events.length,
      news: news.length,
      circular: circulars.length,
      calendar: calendarItems.length,
      gallery: galleries.length,
    }
  }, [rawItems, events, news, circulars, calendarItems, galleries, student?.unit_name, student?.unit_code])

  return (
    <div className={`space-y-5 ${embedded ? '' : 'mx-auto max-w-7xl p-4 sm:p-6'}`}>
      {!embedded ? (
        <header className="relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#0E5C44] via-[#187154] to-[#3FBF75] p-6 text-white shadow-xl sm:p-8">
          <School className="absolute -bottom-8 right-4 h-40 w-40 text-white/10" aria-hidden="true" />
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-emerald-100">Portal / Informasi Sekolah</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">Informasi Sekolah</h1>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-emerald-50">
                Pengumuman, agenda, berita, dan surat edaran disesuaikan khusus untuk unit sekolah anak Anda.
              </p>
              {student && (
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <Badge color="cyan" size="sm" className="border-transparent bg-white/20 text-white font-bold">
                    Siswa: {student.full_name} {student.kelas?.nama_kelas ? `(${student.kelas.nama_kelas})` : ''}
                  </Badge>
                  <Badge color="success" size="sm" className="border border-emerald-300/40 bg-emerald-950/70 text-emerald-200 font-bold">
                    Unit: {student.unit_name || student.unit || 'Sekolah Terpadu'}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                appearance="outline"
                size="sm"
                onClick={() => setSavedOnly(!savedOnly)}
                prefixIcon={<Bookmark className="h-4 w-4" />}
                className="border-white/30 bg-white/15 text-white hover:bg-white/25 rounded-xl font-bold"
              >
                Tersimpan ({summaryData?.bookmarked_count || 0})
              </Button>
              <Button
                variant="ghost"
                appearance="outline"
                size="sm"
                disabled={markAll.isPending || !summaryData?.unread_count}
                onClick={() => markAll.mutate()}
                prefixIcon={<Check className="h-4 w-4" />}
                className="border-white/30 bg-white/15 text-white hover:bg-white/25 rounded-xl font-bold"
              >
                Tandai Dibaca
              </Button>
              <Button
                variant="ghost"
                appearance="outline"
                size="sm"
                iconOnly
                onClick={() => {
                  listing.refetch()
                  summary.refetch()
                }}
                className="border-white/30 bg-white/15 text-white hover:bg-white/25 rounded-xl"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Badge color="warning" size="md" className="font-extrabold shadow-md">
                {summaryData?.unread_count || 0} baru
              </Badge>
            </div>
          </div>
        </header>
      ) : (
        /* MODERN HERO HEADER CARD (SINKRON DENGAN STANDAR PROYEK HEROUI HERO) */
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-400/10 blur-3xl dark:from-emerald-500/15" />
          <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30 ring-4 ring-white/60 dark:ring-slate-800/80">
                <Megaphone className="h-6 w-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Informasi & Pengumuman Sekolah
                  </h2>
                  {student?.unit_name && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                      <School className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      {student.unit_name}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium max-w-2xl">
                  Pengumuman, agenda kegiatan, berita, dan surat edaran disesuaikan khusus untuk unit sekolah siswa.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                appearance="outline"
                size="xs"
                onClick={() => setSavedOnly(!savedOnly)}
                prefixIcon={<Bookmark className="h-3.5 w-3.5" />}
                className={`font-black rounded-xl transition-all ${
                  savedOnly
                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                }`}
              >
                Tersimpan ({summaryData?.bookmarked_count || 0})
              </Button>
              <Button
                variant="ghost"
                appearance="outline"
                size="xs"
                disabled={markAll.isPending || !summaryData?.unread_count}
                onClick={() => markAll.mutate()}
                prefixIcon={<Check className="h-3.5 w-3.5 text-emerald-600" />}
                className="bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 font-black rounded-xl"
              >
                Tandai Dibaca
              </Button>
              <Button
                variant="ghost"
                appearance="outline"
                size="xs"
                iconOnly
                onClick={() => {
                  listing.refetch()
                  summary.refetch()
                }}
                title="Perbarui data informasi"
                className="bg-white text-slate-700 border-slate-200 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 rounded-xl"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              {(summaryData?.unread_count || 0) > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1 text-xs font-black text-white shadow-sm shadow-rose-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  {summaryData.unread_count} baru
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INFORMASI PENTING UNIT DENGAN STYLE KARTU VIBRANT */}
      {!!importantItems.length && (
        <section aria-labelledby="important-title" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            </span>
            <h2 id="important-title" className="text-base font-black text-slate-900 dark:text-white">
              Informasi Penting Unit ({student?.unit_name || 'Sekolah Terpadu'})
            </h2>
          </div>
          <div className="grid gap-3.5 lg:grid-cols-3">
            {importantItems.map((item) => {
              const pTheme = priorityThemes[item.priority] || priorityThemes.umum
              const cTheme = getCategoryTheme(item)
              return (
                <button
                  key={item.id}
                  onClick={() => openDetail(item)}
                  className={`group relative overflow-hidden rounded-[20px] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${pTheme.cardGlow}`}
                >
                  {/* Top vibrant accent gradient line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${pTheme.topBar}`} />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${pTheme.badge}`}>
                        <AlertCircle className="h-3 w-3" />
                        {item.priority}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${cTheme.badge}`}>
                        {item.category || typeLabels[item.type]}
                      </span>
                    </div>
                    {!item.is_read && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Baru
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3.5 text-sm font-black text-slate-900 dark:text-white line-clamp-2 transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {item.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="truncate max-w-[170px]">{item.education_unit}</span>
                    <span className="shrink-0">{formatDate(item.published_at)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* FILTER & PENCARIAN DENGAN BORDER AKSEN MODERN */}
      <section className="relative overflow-hidden rounded-[20px] border-2 border-emerald-500/20 bg-white p-4 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900" aria-label="Filter informasi">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari informasi</span>
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <input
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              className="h-11 w-full rounded-xl border-2 border-emerald-200/80 bg-slate-50/70 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-emerald-900/60 dark:bg-slate-800 dark:focus:bg-slate-900"
              placeholder="Cari pengumuman, agenda, berita, atau surat edaran..."
            />
          </label>
          <Button
            variant="ghost"
            appearance="outline"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            prefixIcon={<Filter className="h-4 w-4 text-emerald-600" />}
            className="border-2 border-emerald-200/80 bg-slate-50/70 hover:bg-emerald-50 font-bold dark:border-slate-700 dark:bg-slate-800 rounded-xl"
          >
            Filter
          </Button>
          <Button
            variant="ghost"
            appearance="outline"
            size="sm"
            onClick={reset}
            className="border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-xl dark:border-slate-700"
          >
            Reset
          </Button>
        </div>
        {filtersOpen && (
          <div className="mt-3.5 grid gap-3 border-t border-emerald-100/80 pt-3.5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
            <CustomSelect
              aria-label="Kategori"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Semua kategori</option>
              {['Umum', 'Akademik', 'Keuangan', 'Kegiatan', 'Keamanan', 'PPDB'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </CustomSelect>
            <CustomSelect
              aria-label="Prioritas"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value.toLowerCase() })}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Semua prioritas</option>
              {['Mendesak', 'Penting', 'Akademik', 'Umum'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </CustomSelect>
            <CustomSelect
              aria-label="Status baca"
              value={filters.read_status}
              onChange={(e) => setFilters({ ...filters, read_status: e.target.value })}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Semua status baca</option>
              <option value="unread">Belum dibaca</option>
              <option value="read">Sudah dibaca</option>
            </CustomSelect>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium dark:border-slate-700">
              <input
                type="checkbox"
                checked={filters.has_attachment === '1'}
                onChange={(e) => setFilters({ ...filters, has_attachment: e.target.checked ? '1' : '' })}
              />
              Memiliki lampiran
            </label>
          </div>
        )}
      </section>

      {/* NAVIGASI KATEGORI TAB */}
      <nav role="tablist" className="flex gap-2 overflow-x-auto no-scrollbar rounded-[20px] border-2 border-emerald-500/20 bg-white p-2 shadow-xs dark:border-emerald-800/40 dark:bg-slate-900" aria-label="Kategori informasi">
        {activeTabs.map(([id, label, Icon]) => {
          const isActive = tab === id
          const count = categoryCounts[id] ?? summaryData?.counts?.[id] ?? 0
          const pastelColor = tabPastelColors[id] || tabPastelColors.all
          return (
            <Button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              variant={isActive ? 'primary' : 'ghost'}
              appearance={isActive ? 'fill' : 'outline'}
              size="xs"
              onClick={() => setTab(id)}
              prefixIcon={<Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : ''}`} />}
              className={`cursor-pointer transition-all duration-200 font-bold shrink-0 rounded-xl ${
                isActive
                  ? '!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40 scale-[1.02]'
                  : `${pastelColor} border-transparent`
              }`}
            >
              <span>{label}</span>
              <span
                className={`ml-1 flex h-4 min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : count > 0
                    ? 'bg-white/70 text-slate-800 dark:bg-slate-950 dark:text-slate-200'
                    : 'bg-black/10 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </Button>
          )
        })}
      </nav>

      {/* KONTEN UTAMA & SIDEBAR */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main>
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {savedOnly ? 'Informasi Tersimpan' : typeLabels[tab]} ({student?.unit_name || 'Unit Sekolah'})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {items.length} informasi sesuai unit sekolah anak
              </p>
            </div>
          </div>

          {listing.isLoading ? (
            <Skeletons />
          ) : listing.isError ? (
            <div className="rounded-[22px] border-2 border-rose-200 bg-rose-50/70 p-6 text-center dark:border-rose-900 dark:bg-rose-950/30">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
              <h3 className="mt-3 font-black text-slate-900 dark:text-white">Informasi Tidak Dapat Dimuat</h3>
              <p className="mt-1 text-xs text-slate-500">Terjadi kesalahan saat memuat informasi sekolah.</p>
              <Button size="sm" onClick={() => listing.refetch()} className="mt-4 bg-[#0E5C44] text-white font-bold rounded-xl">
                Coba Lagi
              </Button>
            </div>
          ) : !items.length ? (
            <Empty label={emptyLabel} />
          ) : (
            <div className="space-y-3.5">
              {items.map((item) => {
                const cTheme = getCategoryTheme(item)
                const pTheme = priorityThemes[item.priority] || priorityThemes.umum
                return (
                  <article
                    key={item.id}
                    tabIndex="0"
                    onKeyDown={(e) => e.key === 'Enter' && openDetail(item)}
                    className={`group relative overflow-hidden rounded-[20px] border-2 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${cTheme.borderLeft} ${
                      item.is_read
                        ? 'border-slate-200/90 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900'
                        : 'border-emerald-300 bg-gradient-to-r from-emerald-50/60 via-teal-50/30 to-white dark:border-emerald-800/80 dark:bg-emerald-950/20'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      {/* Category Squircle Icon Badge */}
                      <div className={`hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md ${cTheme.iconBg}`}>
                        <Megaphone className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${cTheme.badge}`}>
                              {item.category || typeLabels[item.type]}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${pTheme.badge}`}>
                              <AlertCircle className="h-3 w-3" />
                              {item.priority}
                            </span>
                            {!item.is_read && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-black text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                Belum dibaca
                              </span>
                            )}
                          </div>
                          {/* Bookmark Icon Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              mutate.mutate({ id: item.id, action: item.is_bookmarked ? 'unbookmark' : 'bookmark' })
                            }}
                            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                              item.is_bookmarked
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800'
                            }`}
                            title={item.is_bookmarked ? 'Hapus simpan' : 'Simpan informasi'}
                          >
                            {item.is_bookmarked ? (
                              <BookmarkCheck className="h-4 w-4 fill-amber-500 text-amber-600" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <h3 className={`mt-3 text-base text-slate-900 dark:text-white transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400 ${item.is_read ? 'font-bold' : 'font-black'}`}>
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
                          {item.summary}
                        </p>

                        {/* Metadata Badges */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                            <School className="h-3 w-3 text-emerald-600" />
                            {item.education_unit}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                            <Users className="h-3 w-3 text-slate-500" />
                            {item.audience}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                            <CalendarDays className="h-3 w-3 text-teal-600" />
                            {formatDate(item.published_at)}
                          </span>
                          {item.attachments?.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <Paperclip className="h-3 w-3 text-blue-600" />
                              {item.attachments.length} lampiran
                            </span>
                          )}
                        </div>

                        {/* Action Footer */}
                        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <Button
                            size="sm"
                            onClick={() => openDetail(item)}
                            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black rounded-xl shadow-md shadow-emerald-600/20"
                          >
                            Baca Selengkapnya
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {(data?.last_page || 1) > 1 && (
            <div className="mt-4 flex items-center justify-between rounded-[20px] border-2 border-emerald-500/20 bg-white p-3 shadow-xs dark:border-emerald-800/40 dark:bg-slate-900">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-bold transition-all disabled:opacity-40 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Halaman {data.current_page} dari {data.last_page}
              </span>
              <button
                disabled={page >= data.last_page}
                onClick={() => setPage(page + 1)}
                className="flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-bold transition-all disabled:opacity-40 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-4">
          {/* AGENDA MENDATANG */}
          <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/20 bg-white p-5 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-600/20">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-black text-sm text-slate-900 dark:text-white">Agenda Mendatang</h2>
                <p className="text-[10px] text-slate-400 font-medium">Jadwal kegiatan terdekat</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {events.map((item) => {
                const dateObj = new Date(item.event?.start_at || item.calendar_date || item.published_at)
                const dayNum = dateObj.getDate() || '•'
                const monthShort = dateObj.toLocaleDateString('id-ID', { month: 'short' })
                return (
                  <button
                    key={item.id}
                    onClick={() => openDetail(item)}
                    className="group flex w-full gap-3 rounded-xl border border-slate-200/80 p-2.5 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-black shadow-sm shadow-emerald-600/20">
                      <span className="text-sm leading-none">{dayNum}</span>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-100">{monthShort}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <b className="line-clamp-2 text-xs font-bold text-slate-800 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                        {item.title}
                      </b>
                      <small className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">
                        {item.event?.location || item.education_unit}
                      </small>
                    </div>
                  </button>
                )
              })}
              {!events.length && (
                <p className="text-xs text-slate-400 py-3 text-center">Belum ada agenda mendatang untuk unit sekolah ini.</p>
              )}
            </div>
          </section>

          {/* KALENDER PENDIDIKAN */}
          <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/20 bg-white p-5 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-600/20">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-black text-sm text-slate-900 dark:text-white">Kalender Pendidikan</h2>
                  <p className="text-[10px] capitalize text-slate-400 font-medium">{monthTitle}</p>
                </div>
              </div>
            </div>
            <div className="mt-3.5 space-y-2">
              {calendarItems.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => openDetail(item)}
                  className="group block w-full rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                >
                  <b className="line-clamp-2 text-xs font-bold text-slate-800 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                    {item.title}
                  </b>
                  <span className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{item.category || 'Akademik'}</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatDate(item.calendar_date || item.published_at)}
                    </span>
                  </span>
                </button>
              ))}
              {!calendarItems.length && (
                <p className="text-xs text-slate-400 py-3 text-center">Belum ada kalender pendidikan yang dipublikasikan.</p>
              )}
            </div>
          </section>
        </aside>
      </div>

      {((!isParentOrStudent && news.length > 0) || circulars.length > 0 || galleries.length > 0) && (
        <section className={`grid gap-5 ${!isParentOrStudent && news.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
          {!isParentOrStudent && news.length > 0 && <SummarySection title="Berita Sekolah" items={news} onOpen={openDetail} />}
          {circulars.length > 0 && <SummarySection title="Surat Edaran" items={circulars} onOpen={openDetail} />}
          {galleries.length > 0 && <SummarySection title="Galeri Kegiatan" items={galleries} onOpen={openDetail} />}
        </section>
      )}

      {/* DETAIL MODAL DRAWER */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="information-detail-title"
          onMouseDown={(e) => e.target === e.currentTarget && setDetail(null)}
        >
          <div className="h-full w-full overflow-y-auto bg-white shadow-2xl dark:bg-slate-900 sm:max-w-2xl sm:rounded-l-[22px]">
            <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200/90 bg-white/95 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
              <div>
                <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                  {typeLabels[detail.type] || detail.category}
                </span>
                <h2 id="information-detail-title" className="mt-2.5 text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {detail.title}
                </h2>
              </div>
              <button
                onClick={() => setDetail(null)}
                aria-label="Tutup detail"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${priorityThemes[detail.priority]?.badge || priorityThemes.umum.badge}`}>
                  <AlertCircle className="h-3 w-3" />
                  {detail.priority}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/70 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <School className="h-3 w-3 text-emerald-600" />
                  {detail.education_unit}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/70 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Users className="h-3 w-3 text-teal-600" />
                  {detail.audience}
                </span>
              </div>
              {detail.cover && (
                <img src={detail.cover} alt={`Sampul ${detail.title}`} className="max-h-80 w-full rounded-[18px] object-cover shadow-sm" />
              )}
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300 font-normal">
                {detail.content}
              </div>
              <dl className="grid gap-3 rounded-[18px] border border-slate-200/80 bg-slate-50/80 p-4 text-xs sm:grid-cols-2 dark:border-slate-700/80 dark:bg-slate-800">
                <div>
                  <dt className="text-slate-400 font-semibold">Penerbit</dt>
                  <dd className="mt-1 font-bold text-slate-800 dark:text-slate-100">{detail.publisher}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-semibold">Tanggal Publikasi</dt>
                  <dd className="mt-1 font-bold text-slate-800 dark:text-slate-100">{formatDate(detail.published_at)}</dd>
                </div>
              </dl>
              {detail.attachments?.length > 0 && (
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Lampiran Dokumen</h3>
                  <div className="mt-3 space-y-2">
                    {detail.attachments.map((file, index) => (
                      <a
                        key={file.id || index}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-h-11 items-center gap-3 rounded-xl border-2 border-emerald-200/70 bg-emerald-50/30 px-4 text-xs font-bold hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 transition-all"
                      >
                        <Download className="h-4 w-4 text-emerald-600" />
                        {file.name || `Lampiran ${index + 1}`}
                        <span className="ml-auto text-[10px] text-slate-400">
                          {file.type || 'Dokumen'} {file.size ? `· ${file.size}` : ''}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <footer className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <Button variant="ghost" onClick={() => setDetail(null)} className="rounded-xl font-bold">
                Tutup
              </Button>
              <Button
                variant="ghost"
                appearance="outline"
                onClick={() => mutate.mutate({ id: detail.id, action: detail.is_bookmarked ? 'unbookmark' : 'bookmark' })}
                className="gap-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                <Bookmark className="h-4 w-4" />
                {detail.is_bookmarked ? 'Hapus Simpan' : 'Simpan'}
              </Button>
              {detail.requires_acknowledgement && !detail.acknowledged_at && (
                <Button
                  onClick={() => mutate.mutate({ id: detail.id, action: 'acknowledge' })}
                  className="gap-2 bg-[#0E5C44] text-white rounded-xl font-bold"
                >
                  <Check className="h-4 w-4" />
                  Saya Sudah Membaca
                </Button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

function SummarySection({ title, items, onOpen }) {
  return (
    <section className="rounded-[22px] border-2 border-emerald-500/20 bg-white p-5 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900">
      <h2 className="font-black text-sm text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-3.5 space-y-2">
        {items.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onOpen(item)}
            className="block w-full rounded-xl p-3 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800"
          >
            <b className="line-clamp-2 text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</b>
            <span className="mt-1 block text-[10px] text-slate-400">
              {formatDate(item.published_at)} · {item.education_unit}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
