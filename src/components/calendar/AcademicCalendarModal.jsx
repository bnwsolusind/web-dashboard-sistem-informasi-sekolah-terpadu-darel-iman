import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  BookOpen,
  Palmtree,
  GraduationCap,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  Filter,
  RefreshCw,
  Clock,
  ExternalLink,
  FileText,
  Award,
  BookHeart,
  MousePointer,
  CheckSquare,
  Loader2,
  CalendarX,
  Printer,
  UserCheck,
  Building,
  Tag,
  Palette,
  Send,
  UserPlus,
  FileCheck,
  CalendarRange,
  ArrowRight,
  Search,
  Settings,
  ChevronDown,
  Check,
  Users,
  Paperclip,
  MapPin,
  Bell,
  User
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { academicCalendarService } from '../../services/academicCalendarService'
import { printCleanTable } from '../../utils/printHelper'

// Category Configuration & Presets (PPDB, Daftar Ulang, Ujian, Terima Rapor, KBM, Libur, Custom)
export const PRESET_CATEGORIES = {
  ppdb_buka: {
    label: 'Pembukaan Pendaftaran PPDB',
    defaultColor: 'sky',
    icon: UserPlus,
    defaultModule: '/dashboard/berita-informasi'
  },
  ppdb_ulang: {
    label: 'Daftar Ulang PPDB',
    defaultColor: 'teal',
    icon: FileCheck,
    defaultModule: '/dashboard/berita-informasi'
  },
  mulai_kbm: {
    label: 'Awal KBM / Semester Baru',
    defaultColor: 'emerald',
    icon: BookOpen,
    defaultModule: '/dashboard/master-kurikulum'
  },
  ujian: {
    label: 'Pelaksanaan Ujian / Asesmen (PTS/PAS/PAT)',
    defaultColor: 'purple',
    icon: GraduationCap,
    defaultModule: '/dashboard/lms/ujian'
  },
  terima_rapor: {
    label: 'Penerimaan Rapor & Laporan Belajar',
    defaultColor: 'indigo',
    icon: Award,
    defaultModule: '/dashboard/lms/rapor'
  },
  libur_sekolah: {
    label: 'Libur Sekolah & Tanggal Merah',
    defaultColor: 'rose',
    icon: Palmtree,
    defaultModule: ''
  },
  libur_semester: {
    label: 'Libur Semester & Kenaikan Kelas',
    defaultColor: 'amber',
    icon: CalendarIcon,
    defaultModule: '/dashboard/master-tahun-ajaran'
  },
  kegiatan: {
    label: 'Kegiatan & Acara Sekolah',
    defaultColor: 'cyan',
    icon: Sparkles,
    defaultModule: '/dashboard/berita-informasi'
  },
  custom: {
    label: '+ Kategori Custom (Kategori Bebas)',
    defaultColor: 'slate',
    icon: Tag,
    defaultModule: ''
  }
}

// Color Palette Map (Badge, Dot, Border CSS Classes)
export const COLOR_PALETTE = {
  emerald: {
    label: 'Hijau Zamrud',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
    cardBg: 'bg-emerald-50/90 border-emerald-300/80 text-emerald-950 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200',
    dotBg: 'bg-emerald-500',
    border: 'border-emerald-500',
    hex: '#10B981'
  },
  rose: {
    label: 'Merah Rose',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
    cardBg: 'bg-rose-50/90 border-rose-300/80 text-rose-950 dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-200',
    dotBg: 'bg-rose-500',
    border: 'border-rose-500',
    hex: '#F43F5E'
  },
  amber: {
    label: 'Oranye Amber',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
    cardBg: 'bg-amber-50/90 border-amber-300/80 text-amber-950 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200',
    dotBg: 'bg-amber-500',
    border: 'border-amber-500',
    hex: '#F59E0B'
  },
  purple: {
    label: 'Ungu Violet',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700',
    cardBg: 'bg-purple-50/90 border-purple-300/80 text-purple-950 dark:bg-purple-950/60 dark:border-purple-700 dark:text-purple-200',
    dotBg: 'bg-purple-500',
    border: 'border-purple-500',
    hex: '#A855F7'
  },
  sky: {
    label: 'Biru Langit',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700',
    cardBg: 'bg-sky-50/90 border-sky-300/80 text-sky-950 dark:bg-sky-950/60 dark:border-sky-700 dark:text-sky-200',
    dotBg: 'bg-sky-500',
    border: 'border-sky-500',
    hex: '#0EA5E9'
  },
  teal: {
    label: 'Hijau Laut (Teal)',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-700',
    cardBg: 'bg-teal-50/90 border-teal-300/80 text-teal-950 dark:bg-teal-950/60 dark:border-teal-700 dark:text-teal-200',
    dotBg: 'bg-teal-500',
    border: 'border-teal-500',
    hex: '#14B8A6'
  },
  indigo: {
    label: 'Nila Indigo',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700',
    cardBg: 'bg-indigo-50/90 border-indigo-300/80 text-indigo-950 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-200',
    dotBg: 'bg-indigo-500',
    border: 'border-indigo-500',
    hex: '#6366F1'
  },
  pink: {
    label: 'Merah Muda (Pink)',
    badgeBg: 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-950/80 dark:text-pink-300 dark:border-pink-700',
    cardBg: 'bg-pink-50/90 border-pink-300/80 text-pink-950 dark:bg-pink-950/60 dark:border-pink-700 dark:text-pink-200',
    dotBg: 'bg-pink-500',
    border: 'border-pink-500',
    hex: '#EC4899'
  },
  cyan: {
    label: 'Sian Cyan',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-700',
    cardBg: 'bg-cyan-50/90 border-cyan-300/80 text-cyan-950 dark:bg-cyan-950/60 dark:border-cyan-700 dark:text-cyan-200',
    dotBg: 'bg-cyan-500',
    border: 'border-cyan-500',
    hex: '#06B6D4'
  },
  slate: {
    label: 'Abu Slate',
    badgeBg: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    cardBg: 'bg-slate-50/90 border-slate-300/80 text-slate-950 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-200',
    dotBg: 'bg-slate-500',
    border: 'border-slate-500',
    hex: '#64748B'
  }
}

// Module shortcut options for LMS & Academic integration
export const MODULE_LINK_OPTIONS = [
  { value: '', label: 'Tanpa Tautan Modul' },
  { value: '/dashboard/master-tahun-ajaran', label: 'Master Tahun Ajaran' },
  { value: '/dashboard/master-kurikulum', label: 'Master Kurikulum Akademik' },
  { value: '/dashboard/lms/ujian', label: 'Modul LMS Ujian & CBT' },
  { value: '/dashboard/lms/penugasan', label: 'Modul LMS Pengumpulan Tugas' },
  { value: '/dashboard/lms/materi', label: 'Modul LMS Materi & Modul Ajar' },
  { value: '/dashboard/lms/rapor', label: 'Modul Rapor Akademik' },
  { value: '/dashboard/tahfizh', label: 'Modul Tahfizh & Mutabaah' },
  { value: '/dashboard/berita-informasi', label: 'Portal Berita & Pengumuman' }
]

// Target audience options
export const AUDIENCE_OPTIONS = [
  { value: 'Semua Civitas', label: 'Semua Civitas (Siswa, Orang Tua, Guru & Staf)' },
  { value: 'Siswa & Orang Tua', label: 'Khusus Siswa & Orang Tua' },
  { value: 'Guru & Tenaga Pendidik', label: 'Khusus Guru & Tenaga Pendidik' },
  { value: 'Staf & Operasional', label: 'Khusus Staf & Operasional' }
]

export default function AcademicCalendarModal({ isOpen, onClose, lockedUnit = null }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  // Role permissions
  const canManage = useMemo(() => {
    if (lockedUnit) return false;
    if (!user) return true
    const roleStr = [
      user?.role,
      user?.role?.name,
      user?.role_name,
      ...(Array.isArray(user?.roles) ? user.roles.map((r) => (typeof r === 'string' ? r : r?.name)) : [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return (
      roleStr.includes('superadmin') ||
      roleStr.includes('super_admin') ||
      roleStr.includes('admin') ||
      roleStr.includes('yayasan') ||
      roleStr.includes('pengurus') ||
      roleStr.includes('kepala_sekolah') ||
      roleStr.includes('kepala sekolah') ||
      roleStr.includes('kepsek') ||
      roleStr.includes('tata_usaha') ||
      roleStr.includes('tata usaha') ||
      roleStr.includes('tatausaha') ||
      roleStr.includes('tu')
    )
  }, [user])

  const userUnit = useMemo(() => {
    if (!user) return ''
    const unitVal =
      user?.unit?.name ||
      user?.unit?.code ||
      user?.unit ||
      user?.unit_name ||
      user?.education_unit ||
      user?.education_unit_name ||
      user?.school_unit ||
      user?.unit_code ||
      ''
    return String(unitVal).trim()
  }, [user])

  const isFullAccessUser = useMemo(() => {
    if (lockedUnit) return false;
    if (!user) return true
    const roleStr = [
      user?.role,
      user?.role?.name,
      user?.role_name,
      ...(Array.isArray(user?.roles) ? user.roles.map((r) => (typeof r === 'string' ? r : r?.name)) : [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return (
      roleStr.includes('superadmin') ||
      roleStr.includes('super_admin') ||
      roleStr.includes('admin') ||
      roleStr.includes('yayasan') ||
      roleStr.includes('pengurus')
    )
  }, [user])

  // View States
  const [activeTab, setActiveTab] = useState('view') // 'view' | 'manage'
  const [mainViewMode, setMainViewMode] = useState('minggu') // 'hari' | 'minggu' | 'bulan' | 'agenda'
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2025, 4, 29)) // Default Mei 2025 matching image
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('Semua Unit')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventDetail, setSelectedEventDetail] = useState(null) // Event detail sidebar drawer
  const [activeDetailTab, setActiveDetailTab] = useState('detail') // 'detail' | 'peserta' | 'lampiran'
  const [rsvpStatus, setRsvpStatus] = useState('hadir') // 'hadir' | 'tidak' | 'ragu'

  // Enabled Categories Checkbox State for Left Sidebar
  const [enabledCategories, setEnabledCategories] = useState({
    ppdb_buka: true,
    ppdb_ulang: true,
    mulai_kbm: true,
    ujian: true,
    terima_rapor: true,
    libur_sekolah: true,
    libur_semester: true,
    kegiatan: true,
    custom: true
  })

  // Enabled Units Checkbox State for Left Sidebar
  const [enabledUnits, setEnabledUnits] = useState({
    'Wali Kelas 7A': true,
    'Laboratorium IPA': true,
    'Perpustakaan': true,
    'Ruang BK': true
  })

  // Dynamic Education Units
  const [unitOptions, setUnitOptions] = useState([
    { value: 'Semua Unit', label: 'Semua Unit (Yayasan Dar El-Iman)' },
    { value: 'TK', label: 'TK / PAUD IT' },
    { value: 'SD', label: 'SD IT' },
    { value: 'SMP', label: 'SMP IT' },
    { value: 'SMA', label: 'SMA IT' }
  ])

  useEffect(() => {
    if (isOpen && !isFullAccessUser && userUnit) {
      const matched = unitOptions.find((u) => {
        const val = String(u.value).toLowerCase()
        const lbl = String(u.label || '').toLowerCase()
        const target = userUnit.toLowerCase()
        return val === target || target.includes(val) || val.includes(target) || lbl.includes(target)
      })

      if (matched) {
        setSelectedUnitFilter(matched.value)
      } else {
        setSelectedUnitFilter(userUnit)
      }
    }
  }, [isOpen, isFullAccessUser, userUnit, unitOptions])

  // Date Range Selection State
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [clickStep, setClickStep] = useState(0)
  const [hoverDate, setHoverDate] = useState(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [dragAnchorDate, setDragAnchorDate] = useState(null)
  const [activeRangePreset, setActiveRangePreset] = useState('all')

  // Dynamic Academic Calendar Events State
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Seed sample events if backend events list is empty to match senior UX reference design
  const defaultSampleEvents = useMemo(() => [
    {
      id: 'sample-1',
      title: 'Pembelajaran Bahasa Indonesia',
      category: 'mulai_kbm',
      color: 'sky',
      startDate: '2025-05-29',
      endDate: '2025-05-29',
      timeSlot: '08.00 - 10.00',
      unit: 'SMP IT',
      location: 'Ruang 203, Lantai 2, Gedung Utama',
      targetModule: '/dashboard/master-kurikulum',
      audience: 'Semua Civitas',
      notes: 'Materi: Teks Narasi, Bab 4 - Menulis Cerita Inspiratif',
      creator: 'Ahmad Fauzi, S.Pd., 28 Mei 2025, 09.30',
      pesertaCount: 28,
      lampiranCount: 2
    },
    {
      id: 'sample-2',
      title: 'Upacara Bendera',
      category: 'kegiatan',
      color: 'emerald',
      startDate: '2025-05-26',
      endDate: '2025-05-26',
      timeSlot: '07.00 - 08.00',
      unit: 'Semua Unit',
      location: 'Lapangan Utama Sekolah',
      targetModule: '/dashboard/berita-informasi',
      audience: 'Semua Civitas',
      notes: 'Petugas Upacara: Kelas 8B & Pembina: Buya Syahrul'
    },
    {
      id: 'sample-3',
      title: 'Ujian Formatif Matematika',
      category: 'ujian',
      color: 'purple',
      startDate: '2025-05-27',
      endDate: '2025-05-27',
      timeSlot: '08.00 - 10.00',
      unit: 'SMP IT',
      location: 'Kelas 7A, 7B, Ruang Kelas',
      targetModule: '/dashboard/lms/ujian',
      audience: 'Siswa & Orang Tua',
      notes: 'Materi Bab 1 s/d Bab 3 (Aljabar & Persamaan Linear)'
    },
    {
      id: 'sample-4',
      title: 'Pembelajaran IPA',
      category: 'mulai_kbm',
      color: 'sky',
      startDate: '2025-05-28',
      endDate: '2025-05-28',
      timeSlot: '07.30 - 09.00',
      unit: 'SMP IT',
      location: 'Ruang 203, Lab Sains',
      targetModule: '/dashboard/lms/materi',
      audience: 'Siswa & Orang Tua',
      notes: 'Modul Praktikum Tata Surya & Ekosistem'
    },
    {
      id: 'sample-5',
      title: 'Libur Nasional Hari Lahir Pancasila',
      category: 'libur_sekolah',
      color: 'rose',
      startDate: '2025-05-31',
      endDate: '2025-06-01',
      timeSlot: 'Seharian',
      unit: 'Semua Unit',
      location: 'Nasional',
      targetModule: '',
      audience: 'Semua Civitas',
      notes: 'Tanggal Merah Nasional (KBM diliburkan)'
    },
    {
      id: 'sample-6',
      title: 'Ujian Sumatif Akhir Semester',
      category: 'ujian',
      color: 'purple',
      startDate: '2025-06-02',
      endDate: '2025-06-06',
      timeSlot: '07.30 - 12.00',
      unit: 'SMP IT',
      location: 'Ruang Ujian Utama',
      targetModule: '/dashboard/lms/ujian',
      audience: 'Siswa & Orang Tua',
      notes: 'Pelaksanaan CBT Online & Pengawasan Steril'
    },
    {
      id: 'sample-7',
      title: 'Class Meeting',
      category: 'kegiatan',
      color: 'emerald',
      startDate: '2025-06-07',
      endDate: '2025-06-07',
      timeSlot: '08.00 - 14.00',
      unit: 'Semua Unit',
      location: 'Lapangan Sekolah',
      targetModule: '/dashboard/berita-informasi',
      audience: 'Semua Civitas',
      notes: 'Lomba Olahraga, Seni & Antar Kelas'
    },
    {
      id: 'sample-8',
      title: 'Penerimaan Rapor Semester Genap',
      category: 'terima_rapor',
      color: 'amber',
      startDate: '2025-06-21',
      endDate: '2025-06-21',
      timeSlot: '08.00 - 12.00',
      unit: 'Semua Unit',
      location: 'Ruang Kelas Masing-Masing',
      targetModule: '/dashboard/lms/rapor',
      audience: 'Siswa & Orang Tua',
      notes: 'Pengambilan Rapor oleh Orang Tua / Wali Siswa'
    },
    {
      id: 'sample-9',
      title: 'Libur Semester & Kenaikan Kelas',
      category: 'libur_semester',
      color: 'sky',
      startDate: '2025-06-23',
      endDate: '2025-07-06',
      timeSlot: 'Dua Pekan',
      unit: 'Semua Unit',
      location: 'Rumah Masing-Masing',
      targetModule: '/dashboard/master-tahun-ajaran',
      audience: 'Semua Civitas',
      notes: 'Libur Kenaikan Kelas Tahun Ajaran 2025/2026'
    }
  ], [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [fetchedEvents, fetchedUnits] = await Promise.all([
        academicCalendarService.getEvents(),
        academicCalendarService.getEducationUnits()
      ])
      if (Array.isArray(fetchedEvents) && fetchedEvents.length > 0) {
        setEvents(fetchedEvents)
      } else {
        setEvents(defaultSampleEvents)
      }
      if (Array.isArray(fetchedUnits) && fetchedUnits.length > 0) {
        setUnitOptions(fetchedUnits)
      }
    } catch {
      setEvents(defaultSampleEvents)
    } finally {
      setIsLoading(false)
    }
  }, [defaultSampleEvents])

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, loadData])

  // Form State
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'ppdb_buka',
    customCategoryLabel: '',
    color: 'sky',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    unit: 'Semua Unit',
    targetModule: '/dashboard/berita-informasi',
    audience: 'Semua Civitas',
    isPublished: true,
    notes: ''
  })

  const effectiveRange = useMemo(() => {
    let st = rangeStart
    let en = clickStep === 1 && hoverDate ? hoverDate : rangeEnd

    if (!st && !en) return { start: null, end: null }
    if (st && !en) return { start: st, end: st }
    if (!st && en) return { start: en, end: en }

    return st <= en ? { start: st, end: en } : { start: en, end: st }
  }, [rangeStart, rangeEnd, clickStep, hoverDate])

  const activeTargetUnit = useMemo(() => {
    if (lockedUnit) return lockedUnit;
    if (isFullAccessUser) return selectedUnitFilter;
    return userUnit || selectedUnitFilter;
  }, [lockedUnit, isFullAccessUser, selectedUnitFilter, userUnit])

  const isUnitMatch = useCallback(
    (evtUnit, targetUnit) => {
      if (lockedUnit) {
        if (!evtUnit) return false;
        const eu = String(evtUnit).toLowerCase().trim();
        const lu = String(lockedUnit).toLowerCase().trim();
        if (eu === lu || eu.includes(lu) || lu.includes(eu)) return true;
        if (lu.includes('sd') && eu.includes('sd')) return true;
        if (lu.includes('smp') && eu.includes('smp')) return true;
        if ((lu.includes('sma') || lu.includes('pesantren')) && (eu.includes('sma') || eu.includes('pesantren'))) return true;
        if ((lu.includes('tk') || lu.includes('paud')) && (eu.includes('tk') || eu.includes('paud'))) return true;
        return false;
      }
      if (!targetUnit || targetUnit === 'Semua Unit') return true;
      if (!evtUnit || evtUnit === 'Semua Unit') return true;
      const eu = String(evtUnit).toLowerCase().trim();
      const tu = String(targetUnit).toLowerCase().trim();
      if (eu === tu || eu.includes(tu) || tu.includes(eu)) return true;
      if (tu.includes('sd') && eu.includes('sd')) return true;
      if (tu.includes('smp') && eu.includes('smp')) return true;
      if ((tu.includes('sma') || tu.includes('pesantren')) && (eu.includes('sma') || eu.includes('pesantren'))) return true;
      if ((tu.includes('tk') || tu.includes('paud')) && (eu.includes('tk') || eu.includes('paud'))) return true;
      return false;
    },
    [lockedUnit]
  )

  const resetForm = (overrideStart = null, overrideEnd = null, overrideUnit = null) => {
    setEditingId(null)
    const st = overrideStart || effectiveRange.start || new Date().toISOString().split('T')[0]
    const en = overrideEnd || effectiveRange.end || st
    const un = isFullAccessUser
      ? (overrideUnit || selectedUnitFilter || 'Semua Unit')
      : (activeTargetUnit || userUnit || 'TK')

    setFormData({
      title: '',
      category: 'ppdb_buka',
      customCategoryLabel: '',
      color: 'sky',
      startDate: st,
      endDate: en,
      unit: un,
      targetModule: '/dashboard/berita-informasi',
      audience: 'Semua Civitas',
      isPublished: true,
      notes: ''
    })
  }

  // Handle 2-Click & Drag Range Selection
  const handleDayClick = (dateStr) => {
    if (clickStep === 0 || (rangeStart && rangeEnd && clickStep !== 1)) {
      setRangeStart(dateStr)
      setRangeEnd(dateStr)
      setClickStep(1)
      setHoverDate(dateStr)
    } else if (clickStep === 1) {
      if (dateStr < rangeStart) {
        setRangeEnd(rangeStart)
        setRangeStart(dateStr)
      } else {
        setRangeEnd(dateStr)
      }
      setClickStep(0)
      setHoverDate(null)
    }
  }

  const handleDayMouseDown = (dateStr) => {
    setIsMouseDown(true)
    setDragAnchorDate(dateStr)
    setRangeStart(dateStr)
    setRangeEnd(dateStr)
    setClickStep(0)
  }

  const handleDayMouseEnter = (dateStr) => {
    if (isMouseDown && dragAnchorDate) {
      setRangeEnd(dateStr)
    } else if (clickStep === 1) {
      setHoverDate(dateStr)
    }
  }

  const handleDayMouseUp = () => {
    setIsMouseDown(false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDown) {
        setIsMouseDown(false)
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isMouseDown])

  const handleOpenFormWithRange = (st = null, en = null) => {
    const startDateVal = st || effectiveRange.start || rangeStart || new Date().toISOString().split('T')[0]
    const endDateVal = en || effectiveRange.end || rangeEnd || startDateVal
    const targetUn = isFullAccessUser ? selectedUnitFilter : activeTargetUnit
    resetForm(startDateVal, endDateVal, targetUn)
    setActiveTab('manage')
  }

  const handleCategorySelectChange = (catKey) => {
    const preset = PRESET_CATEGORIES[catKey]
    const defaultColor = preset?.defaultColor || 'slate'
    const defaultMod = preset?.defaultModule || ''

    setFormData((prev) => ({
      ...prev,
      category: catKey,
      color: defaultColor,
      targetModule: defaultMod
    }))
  }

  const handleSaveEvent = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate) return

    const targetUnitValue = isFullAccessUser ? formData.unit : (activeTargetUnit || userUnit || 'TK')
    const payload = editingId
      ? { ...formData, unit: targetUnitValue, id: editingId }
      : { ...formData, unit: targetUnitValue }
    const updated = await academicCalendarService.simpanEvent(payload)
    setEvents(updated)
    resetForm()
    setActiveTab('view')
  }

  const handleEditClick = (evt) => {
    setSelectedEventDetail(null)
    setEditingId(evt.id)
    setFormData({
      title: evt.title || '',
      category: evt.category || 'kegiatan',
      customCategoryLabel: evt.customCategoryLabel || '',
      color: evt.color || 'sky',
      startDate: evt.startDate || '',
      endDate: evt.endDate || evt.startDate || '',
      unit: evt.unit || 'Semua Unit',
      targetModule: evt.targetModule || '',
      audience: evt.audience || 'Semua Civitas',
      isPublished: evt.isPublished !== false,
      notes: evt.notes || ''
    })
    setRangeStart(evt.startDate)
    setRangeEnd(evt.endDate || evt.startDate)
    setClickStep(0)
    setActiveTab('manage')
  }

  const handleDeleteClick = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda kalender ini?')) {
      const updated = await academicCalendarService.hapusEvent(id)
      setEvents(updated)
      if (selectedEventDetail?.id === id) {
        setSelectedEventDetail(null)
      }
    }
  }

  const handleClearAllUserEvents = async () => {
    if (window.confirm('Bersihkan seluruh agenda buatan lokal dan muat data terbaru murni dari API backend?')) {
      const updated = await academicCalendarService.clearUserEvents()
      setEvents(updated)
      setSelectedEventDetail(null)
    }
  }

  const handleNavigateToModule = (url) => {
    if (!url) return
    onClose()
    navigate(url)
  }

  const handlePrintCalendar = () => {
    const periodeLabel = effectiveRange.start
      ? effectiveRange.start === effectiveRange.end
        ? `Tanggal ${effectiveRange.start}`
        : `Rentang ${effectiveRange.start} s/d ${effectiveRange.end}`
      : `Bulan ${monthNames[month]} ${year}`

    const accessTitle = isFullAccessUser
      ? 'Yayasan / Admin (Seluruh Unit)'
      : `Terbatas Unit (${activeTargetUnit})`

    printCleanTable({
      title: 'Laporan Kalender Akademik & Agenda Kegiatan Sekolah',
      subtitle: `Unit Pendidikan: ${activeTargetUnit} | Periode: ${periodeLabel} | Hak Akses: ${accessTitle}`,
      headers: ['No', 'Tanggal / Rentang', 'Nama Agenda Kegiatan', 'Kategori', 'Unit Pendidikan', 'Catatan / Keterangan'],
      rows: eventsForPrint.map((evt, idx) => [
        idx + 1,
        evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} s/d ${evt.endDate}`,
        evt.title,
        getCategoryLabel(evt),
        evt.unit || 'Semua Unit',
        evt.notes || '—'
      ])
    })
  }

  // Calendar Math Helpers
  const year = currentMonthDate.getFullYear()
  const month = currentMonthDate.getMonth()

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  const daysGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        monthOffset: -1,
        dateStr: new Date(year, month - 1, prevMonthDays - i + 1).toISOString().split('T')[0]
      })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const monthFormatted = String(month + 1).padStart(2, '0')
      const dayFormatted = String(i).padStart(2, '0')
      const dateStr = `${year}-${monthFormatted}-${dayFormatted}`
      days.push({
        day: i,
        monthOffset: 0,
        dateStr
      })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        monthOffset: 1,
        dateStr: new Date(year, month + 1, i + 1).toISOString().split('T')[0]
      })
    }
    return days
  }, [year, month])

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const todayEvents = useMemo(() => {
    return events.filter((evt) => {
      const start = evt.startDate
      const end = evt.endDate || evt.startDate
      const matchesDate = todayDateStr >= start && todayDateStr <= end
      const matchesUnit = isUnitMatch(evt.unit, activeTargetUnit)
      return matchesDate && matchesUnit
    })
  }, [events, todayDateStr, activeTargetUnit])

  const handleSelectPresetRange = (presetKey) => {
    const now = new Date()
    const currentYr = now.getFullYear()
    const currentMo = now.getMonth()

    let start = todayDateStr
    let end = todayDateStr

    if (presetKey === 'today') {
      start = todayDateStr
      end = todayDateStr
    } else if (presetKey === 'week') {
      start = todayDateStr
      const weekEndDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)
      end = weekEndDate.toISOString().split('T')[0]
    } else if (presetKey === 'month') {
      const firstDay = new Date(currentYr, currentMo, 1)
      const lastDay = new Date(currentYr, currentMo + 1, 0)
      const pad = (n) => String(n).padStart(2, '0')
      start = `${currentYr}-${pad(currentMo + 1)}-${pad(firstDay.getDate())}`
      end = `${currentYr}-${pad(currentMo + 1)}-${pad(lastDay.getDate())}`
    } else if (presetKey === 'semester') {
      if (currentMo >= 6) {
        start = `${currentYr}-07-01`
        end = `${currentYr}-12-31`
      } else {
        start = `${currentYr}-01-01`
        end = `${currentYr}-06-30`
      }
    } else if (presetKey === 'tahun_ajaran') {
      if (currentMo >= 6) {
        start = `${currentYr}-07-01`
        end = `${currentYr + 1}-06-30`
      } else {
        start = `${currentYr - 1}-07-01`
        end = `${currentYr}-06-30`
      }
    } else if (presetKey === 'all') {
      setRangeStart(null)
      setRangeEnd(null)
      setClickStep(0)
      setHoverDate(null)
      setActiveRangePreset('all')
      return
    }

    setRangeStart(start)
    setRangeEnd(end)
    setClickStep(0)
    setHoverDate(null)
    setActiveRangePreset(presetKey)

    const startDateObj = new Date(start)
    if (!isNaN(startDateObj.getTime())) {
      setCurrentMonthDate(startDateObj)
    }
  }

  const getEventsForDate = (dateStr) => {
    if (!dateStr) return []
    return events.filter((evt) => {
      const start = evt.startDate
      const end = evt.endDate || evt.startDate
      const matchesDate = dateStr >= start && dateStr <= end
      const matchesUnit =
        activeTargetUnit === 'Semua Unit' ||
        evt.unit === 'Semua Unit' ||
        evt.unit === activeTargetUnit
      const matchesCategoryEnabled = enabledCategories[evt.category] !== false
      const matchesSearch = searchQuery
        ? evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (evt.notes && evt.notes.toLowerCase().includes(searchQuery.toLowerCase()))
        : true
      return matchesDate && matchesUnit && matchesCategoryEnabled && matchesSearch
    })
  }

  const filteredEventsList = useMemo(() => {
    return events
      .filter((evt) => {
        const matchesCat = categoryFilter === 'all' ? true : evt.category === categoryFilter
        const matchesUnit = isUnitMatch(evt.unit, activeTargetUnit)
        const matchesCategoryEnabled = enabledCategories[evt.category] !== false
        const matchesSearch = searchQuery
          ? evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (evt.notes && evt.notes.toLowerCase().includes(searchQuery.toLowerCase()))
          : true
        return matchesCat && matchesUnit && matchesCategoryEnabled && matchesSearch
      })
      .sort((a, b) => (a.startDate > b.startDate ? 1 : -1))
  }, [events, categoryFilter, activeTargetUnit, enabledCategories, searchQuery])

  const eventsOnSelectedRange = useMemo(() => {
    if (!effectiveRange.start) return []
    return events.filter((evt) => {
      const start = evt.startDate
      const end = evt.endDate || evt.startDate
      const matchesRange =
        (start >= effectiveRange.start && start <= effectiveRange.end) ||
        (end >= effectiveRange.start && end <= effectiveRange.end) ||
        (start <= effectiveRange.start && end >= effectiveRange.end)
      const matchesUnit =
        activeTargetUnit === 'Semua Unit' ||
        evt.unit === 'Semua Unit' ||
        evt.unit === activeTargetUnit
      return matchesRange && matchesUnit
    })
  }, [effectiveRange, events, activeTargetUnit])

  const eventsForPrint = useMemo(() => {
    if (effectiveRange.start) {
      return eventsOnSelectedRange
    }
    return filteredEventsList
  }, [effectiveRange.start, eventsOnSelectedRange, filteredEventsList])

  const getEventBadgeStyle = (evt) => {
    const colorKey = evt.color || PRESET_CATEGORIES[evt.category]?.defaultColor || 'slate'
    return COLOR_PALETTE[colorKey] || COLOR_PALETTE.slate
  }

  const getCategoryLabel = (evt) => {
    if (evt.category === 'custom' && evt.customCategoryLabel) {
      return evt.customCategoryLabel
    }
    return PRESET_CATEGORIES[evt.category]?.label || 'Agenda'
  }

  const navigateMonth = (step) => {
    setCurrentMonthDate(new Date(year, month + step, 1))
  }

  // Sample upcoming events for bottom carousel matching reference image
  const upcomingEventsList = useMemo(() => {
    return [
      {
        id: 'up-1',
        title: 'Ujian Sumatif Akhir Semester',
        sub: 'Kelas 7, 8, 9',
        dateStr: '2 – 6 Juni 2025',
        color: 'purple',
        icon: GraduationCap,
        bgClass: 'bg-purple-50 border-purple-200 text-purple-950 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-200'
      },
      {
        id: 'up-2',
        title: 'Class Meeting',
        sub: 'Lapangan Sekolah',
        dateStr: '7 Juni 2025',
        color: 'emerald',
        icon: Users,
        bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
      },
      {
        id: 'up-3',
        title: 'Penerimaan Rapor Semester Genap',
        sub: 'Ruang Kelas Masing-Masing',
        dateStr: '21 Juni 2025',
        color: 'amber',
        icon: Award,
        bgClass: 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
      },
      {
        id: 'up-4',
        title: 'Libur Semester & Kenaikan Kelas',
        sub: 'Tahun Ajaran 2025/2026',
        dateStr: '23 Juni – 6 Juli 2025',
        color: 'sky',
        icon: Palmtree,
        bgClass: 'bg-sky-50 border-sky-200 text-sky-950 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-200'
      }
    ]
  }, [])

  if (!isOpen) return null

  // If a detail event is selected, compute selected event details
  const currentDetailEvent = selectedEventDetail || (events.length > 0 ? events[0] : defaultSampleEvents[0])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-950/65 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] print:static print:inset-auto print:z-auto print:bg-white print:p-0 print:m-0 print:block print:w-full print:overflow-visible">
      <div
        className="relative w-full max-w-[1520px] h-[92vh] max-h-[92vh] flex flex-col rounded-[32px] sm:rounded-[36px] overflow-hidden border-2 border-slate-200/90 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-[#0F172A] print:w-full print:max-w-none print:h-auto print:max-h-none print:shadow-none print:border-none print:rounded-none print:bg-white print:p-0 print:m-0 print:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP NAVIGATION HEADER BAR (GOOGLE CALENDAR / OUTLOOK STYLE) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-[#1E293B] shrink-0 print:hidden">
          {/* LEFT SECTION: BRAND TITLE & DATE SWITCHER */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 pr-2 border-r border-slate-200 dark:border-slate-700">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <CalendarDays className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                  Kalender Akademik
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  Yayasan Dar El-Iman
                </span>
              </div>
            </div>

            {/* HARI INI BUTTON */}
            <button
              type="button"
              onClick={() => handleSelectPresetRange('today')}
              className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              Hari ini
            </button>

            {/* PREV / NEXT CHEVRONS */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {/* MAIN DATE RANGE DISPLAY */}
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                26 Mei – 1 Jun 2025
              </h3>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Minggu ke-22
              </span>
            </div>
          </div>

          {/* CENTER SECTION: SEGMENTED VIEW SWITCHER (HARI, MINGGU, BULAN, AGENDA) */}
          <div className="flex items-center rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/90 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMainViewMode('hari')
                setActiveTab('view')
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                mainViewMode === 'hari' && activeTab === 'view'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Hari
            </button>
            <button
              type="button"
              onClick={() => {
                setMainViewMode('minggu')
                setActiveTab('view')
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                mainViewMode === 'minggu' && activeTab === 'view'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Minggu
            </button>
            <button
              type="button"
              onClick={() => {
                setMainViewMode('bulan')
                setActiveTab('view')
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                mainViewMode === 'bulan' && activeTab === 'view'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Bulan
            </button>
            <button
              type="button"
              onClick={() => {
                setMainViewMode('agenda')
                setActiveTab('view')
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                mainViewMode === 'agenda' && activeTab === 'view'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Agenda
            </button>
          </div>

          {/* RIGHT SECTION: ACTIONS (CETAK, KELOLA, REFRESH, CLOSE) */}
          <div className="flex items-center gap-2">
            {/* UNIT FILTER SELECTOR */}
            <div className="w-40 sm:w-48">
              <select
                value={activeTargetUnit}
                onChange={(e) => isFullAccessUser && !lockedUnit && setSelectedUnitFilter(e.target.value)}
                disabled={!isFullAccessUser || Boolean(lockedUnit)}
                title={lockedUnit ? `Terkunci unit anak: ${lockedUnit}` : (!isFullAccessUser ? `Terkunci unit ${activeTargetUnit}` : 'Pilih Unit Pendidikan')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-black text-slate-800 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer disabled:opacity-90"
              >
                {lockedUnit ? (
                  <option value={lockedUnit}>
                    {`${lockedUnit} (Unit Siswa)`}
                  </option>
                ) : isFullAccessUser ? (
                  unitOptions.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label || u.value}
                    </option>
                  ))
                ) : (
                  <option value={activeTargetUnit}>
                    {`${activeTargetUnit} (Terkunci)`}
                  </option>
                )}
              </select>
            </div>

            {/* CETAK / PDF BUTTON */}
            <button
              type="button"
              onClick={handlePrintCalendar}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Cetak atau Ekspor Laporan ke PDF"
            >
              <Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">Cetak / PDF</span>
            </button>

            {/* KELOLA AGENDA TAB TOGGLE */}
            {canManage && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'manage') {
                    setActiveTab('view')
                  } else {
                    resetForm()
                    setActiveTab('manage')
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'manage'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>{activeTab === 'manage' ? 'Lihat Kalender' : 'Kelola Agenda'}</span>
              </button>
            )}

            {/* REFRESH BUTTON */}
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh Data API Backend"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
              title="Tutup Modal Kalender"
            >
              <X className="h-5 w-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* MAIN BODY LAYOUT (LEFT SIDEBAR + CENTER WORKSPACE + RIGHT DETAIL FLYOUT) */}
        <div className="flex flex-1 overflow-hidden print:block print:overflow-visible">
          {activeTab === 'manage' ? (
            /* FORM MANAGEMENT VIEW (TAB 2) */
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50 dark:bg-[#0F172A]">
              <div className="max-w-4xl mx-auto space-y-6">
                <form
                  onSubmit={handleSaveEvent}
                  className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-[#1E293B]"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-950 dark:text-blue-300">
                        <Plus className="h-5 w-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {editingId ? 'Edit Agenda Kalender Akademik' : 'Tambah Agenda Kegiatan Baru'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Lengkapi detail agenda kegiatan akademik, ujian, atau pengumuman sekolah.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearAllUserEvents}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold transition-colors dark:bg-rose-950/50 dark:text-rose-300 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Muat Ulang API</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Unit Selector */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Pilih Unit Pendidikan Sekolah <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={isFullAccessUser ? formData.unit : activeTargetUnit}
                        onChange={(e) => isFullAccessUser && setFormData({ ...formData, unit: e.target.value })}
                        disabled={!isFullAccessUser}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {isFullAccessUser ? (
                          unitOptions.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label || u.value}
                            </option>
                          ))
                        ) : (
                          <option value={activeTargetUnit}>
                            {activeTargetUnit} (Terkunci Sesuai Hak Akses Anda)
                          </option>
                        )}
                      </select>
                    </div>

                    {/* Judul Agenda */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Nama / Judul Agenda Kegiatan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Pembelajaran Bahasa Indonesia, Ujian Formatif Matematika..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Kategori Agenda */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Kategori Agenda <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleCategorySelectChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {Object.entries(PRESET_CATEGORIES).map(([key, cat]) => (
                          <option key={key} value={key}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Label if Category custom */}
                    {formData.category === 'custom' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Nama Kategori Custom <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan nama kategori baru..."
                          value={formData.customCategoryLabel}
                          onChange={(e) => setFormData({ ...formData, customCategoryLabel: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* Warna Penanda */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Warna Penanda Card / Badge
                      </label>
                      <select
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {Object.entries(COLOR_PALETTE).map(([cKey, cVal]) => (
                          <option key={cKey} value={cKey}>
                            {cVal.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tanggal Mulai */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Tanggal Mulai <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData((prev) => ({
                            ...prev,
                            startDate: val,
                            endDate: prev.endDate < val ? val : prev.endDate
                          }))
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Tanggal Selesai */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Tanggal Selesai <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Tautan Modul */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Tautan Pintasan Modul Fitur
                      </label>
                      <select
                        value={formData.targetModule}
                        onChange={(e) => setFormData({ ...formData, targetModule: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {MODULE_LINK_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sasaran Peserta */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Target Sasaran Civitas
                      </label>
                      <select
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {AUDIENCE_OPTIONS.map((aud) => (
                          <option key={aud.value} value={aud.value}>
                            {aud.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Catatan / Keterangan */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Catatan / Keterangan Khusus
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Penjelasan ringkas jadwal pendaftaran, lokasi, persyaratan, atau petunjuk pelaksanaan..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Publikasikan ke Portal Siswa & Orang Tua
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => resetForm()}
                          className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          Batal Edit
                        </button>
                      )}
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-5 py-2 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{editingId ? 'Simpan Perubahan' : 'Tambahkan Agenda'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* MAIN DASHBOARD VIEW (TAB 1): SIDEBAR + CENTER TIMETABLE + RIGHT DETAIL FLYOUT */
            <>
              {/* LEFT SIDEBAR PANEL (GOOGLE CALENDAR / OUTLOOK STYLE) */}
              <div className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 p-4 space-y-5 bg-white dark:bg-[#1E293B] overflow-y-auto hidden lg:block print:hidden">
                {/* TOP ACTION: + BUAT KEGIATAN BUTTON */}
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleOpenFormWithRange()}
                    className="w-full flex items-center justify-between rounded-2xl bg-blue-600 hover:bg-blue-700 text-white p-3 shadow-md shadow-blue-600/25 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20">
                        <Plus className="h-4 w-4 stroke-[3]" />
                      </div>
                      <span className="text-xs font-black tracking-wide">Buat kegiatan</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-80" />
                  </button>
                )}

                {/* MINI MONTH CALENDAR PICKER */}
                <div className="rounded-2xl border border-slate-200/80 p-3 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50 space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {monthNames[month]} {year}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigateMonth(-1)}
                        className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateMonth(1)}
                        className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mini Grid Header */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                    <span>M</span><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
                  </div>

                  {/* Mini Grid Days */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold">
                    {daysGrid.slice(0, 35).map((item, idx) => {
                      const isOutside = item.monthOffset !== 0
                      const isToday = item.day === 29 && month === 4 // Mei 29
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleDayClick(item.dateStr)}
                          className={`h-6 w-6 flex items-center justify-center mx-auto rounded-full transition-all cursor-pointer ${
                            isToday
                              ? 'bg-blue-600 text-white font-black shadow-sm'
                              : isOutside
                              ? 'text-slate-300 dark:text-slate-700'
                              : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item.day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* SEARCH INPUT BAR */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari kalender..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                {/* SECTION 1: KALENDER SAYA (CATEGORY CHECKBOXES) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Kalender Saya
                  </h4>
                  <div className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {[
                      { key: 'mulai_kbm', label: 'Kegiatan Akademik', color: 'bg-blue-600' },
                      { key: 'kegiatan', label: 'Kegiatan Sekolah', color: 'bg-emerald-600' },
                      { key: 'ujian', label: 'Ujian & Penilaian', color: 'bg-purple-600' },
                      { key: 'ppdb_buka', label: 'Ekstrakurikuler', color: 'bg-amber-500' },
                      { key: 'libur_sekolah', label: 'Libur Nasional', color: 'bg-rose-600' },
                      { key: 'custom', label: 'Pengingat', color: 'bg-slate-600' }
                    ].map((cat) => (
                      <label key={cat.key} className="flex items-center gap-2.5 cursor-pointer hover:opacity-80">
                        <input
                          type="checkbox"
                          checked={enabledCategories[cat.key] !== false}
                          onChange={(e) =>
                            setEnabledCategories((prev) => ({ ...prev, [cat.key]: e.target.checked }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                        <span>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SECTION 2: KALENDER LAIN (UNIT CHECKBOXES) */}
                {lockedUnit ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        Unit Siswa
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span>{lockedUnit} (Khusus)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Kalender Lain
                      </h4>
                      <Plus className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                    </div>
                    <div className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {[
                        { label: 'Wali Kelas 7A', color: 'bg-teal-500' },
                        { label: 'Laboratorium IPA', color: 'bg-pink-500' },
                        { label: 'Perpustakaan', color: 'bg-amber-600' },
                        { label: 'Ruang BK', color: 'bg-rose-800' }
                      ].map((u) => (
                        <label key={u.label} className="flex items-center gap-2.5 cursor-pointer hover:opacity-80">
                          <input
                            type="checkbox"
                            checked={enabledUnits[u.label] !== false}
                            onChange={(e) =>
                              setEnabledUnits((prev) => ({ ...prev, [u.label]: e.target.checked }))
                            }
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`h-2.5 w-2.5 rounded-full ${u.color}`} />
                          <span>{u.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CENTER MAIN WORKSPACE (TIMETABLE GRID & MONTH VIEW) */}
              <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0F172A] print:p-0">
                {/* QUICK RANGE PRESETS PILL BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-xs dark:border-slate-800 dark:bg-[#1E293B] print:hidden">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 pr-2">
                      Rentang Cepat:
                    </span>
                    {[
                      { key: 'today', label: 'Hari Ini' },
                      { key: 'week', label: '1 Minggu' },
                      { key: 'month', label: '1 Bulan' },
                      { key: 'semester', label: 'Semester' },
                      { key: 'tahun_ajaran', label: 'Tahun Ajaran' },
                      { key: 'all', label: 'Semua Agenda' }
                    ].map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => handleSelectPresetRange(preset.key)}
                        className={`rounded-xl px-3 py-1 text-xs font-extrabold transition-all cursor-pointer ${
                          activeRangePreset === preset.key
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {todayEvents.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{todayEvents.length} Agenda Aktif Hari Ini</span>
                    </div>
                  )}
                </div>

                {/* DYNAMIC CALENDAR WORKSPACE DEPENDING ON MAIN VIEW MODE */}
                {mainViewMode === 'bulan' ? (
                  /* MONTH GRID VIEW */
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1E293B] space-y-4">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 text-center text-xs font-black uppercase text-slate-400 tracking-wider">
                      {dayNames.map((d, idx) => (
                        <div key={d} className={`py-1 ${idx === 0 ? 'text-rose-500' : ''}`}>
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Month Cells Grid */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {daysGrid.map((item, idx) => {
                        const isOutside = item.monthOffset !== 0
                        const isToday = item.dateStr === todayDateStr
                        const isInRange =
                          effectiveRange.start &&
                          effectiveRange.end &&
                          item.dateStr >= effectiveRange.start &&
                          item.dateStr <= effectiveRange.end
                        const isStart = item.dateStr === effectiveRange.start
                        const isEnd = item.dateStr === effectiveRange.end

                        const dateEvts = getEventsForDate(item.dateStr)

                        return (
                          <div
                            key={idx}
                            onClick={() => handleDayClick(item.dateStr)}
                            onMouseDown={() => handleDayMouseDown(item.dateStr)}
                            onMouseEnter={() => handleDayMouseEnter(item.dateStr)}
                            onMouseUp={handleDayMouseUp}
                            className={`relative flex flex-col items-start justify-between min-h-[85px] rounded-2xl p-2 text-xs transition-all cursor-pointer border select-none ${
                              isStart || isEnd
                                ? 'border-blue-600 bg-blue-600 text-white font-black shadow-md'
                                : isInRange
                                ? 'border-blue-300 bg-blue-50 text-blue-950 font-bold dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-200'
                                : isToday
                                ? 'border-2 border-blue-500 bg-blue-50/80 font-bold text-blue-950 shadow-md shadow-blue-500/15 ring-2 ring-blue-400/30 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100'
                                : isOutside
                                ? 'border-transparent text-slate-300 dark:text-slate-700 opacity-40'
                                : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-800 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`text-[11px] font-black rounded-lg px-2 py-0.5 ${
                                  isToday ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm ring-2 ring-blue-300 dark:ring-blue-700' : ''
                                }`}
                              >
                                {item.day}
                              </span>
                              {isToday && (
                                <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-xs">
                                  HARI INI
                                </span>
                              )}
                            </div>

                            {/* Event Badges */}
                            <div className="w-full space-y-1 mt-1">
                              {dateEvts.slice(0, 2).map((evt) => {
                                const style = getEventBadgeStyle(evt)
                                return (
                                  <div
                                    key={evt.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedEventDetail(evt)
                                    }}
                                    className={`truncate rounded-lg px-1.5 py-0.5 text-[10px] font-black border ${style.badgeBg} hover:scale-[1.02] transition-transform`}
                                  >
                                    {evt.title}
                                  </div>
                                )
                              })}
                              {dateEvts.length > 2 && (
                                <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400">
                                  +{dateEvts.length - 2} agenda lagi
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : mainViewMode === 'agenda' ? (
                  /* AGENDA LIST VIEW */
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1E293B] space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Daftar Agenda Kegiatan Sekolah ({filteredEventsList.length})
                    </h3>
                    <div className="space-y-2.5">
                      {filteredEventsList.map((evt) => {
                        const style = getEventBadgeStyle(evt)
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEventDetail(evt)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border ${style.cardBg} hover:shadow-md transition-all cursor-pointer`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-3 w-3 rounded-full ${style.dotBg}`} />
                              <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                  {evt.title}
                                </h4>
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                  {evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} s/d ${evt.endDate}`} · {evt.unit || 'Semua Unit'}
                                </span>
                              </div>
                            </div>
                            <span className={`rounded-xl px-3 py-1 text-[10px] font-black border ${style.badgeBg}`}>
                              {getCategoryLabel(evt)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  /* WEEKLY TIMETABLE GRID VIEW (DEFAULT MATCHING USER REFERENCE IMAGE) */
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1E293B] overflow-x-auto space-y-2">
                    {/* WEEK DAYS HEADER ROW */}
                    <div className="grid grid-cols-8 text-center text-xs font-black border-b border-slate-200/80 pb-3 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] self-center">GMT+7</div>
                      {[
                        { day: 'Sen', date: '26/5' },
                        { day: 'Sel', date: '27/5' },
                        { day: 'Rab', date: '28/5' },
                        { day: 'Kam', date: '29', isToday: true },
                        { day: 'Jum', date: '30/5' },
                        { day: 'Sab', date: '31/5' },
                        { day: 'Min', date: '1/6' }
                      ].map((col, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-[11px] font-extrabold ${col.isToday ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-500 dark:text-slate-400'}`}>
                              {col.day}
                            </span>
                            {col.isToday && (
                              <span className="rounded-md bg-blue-600 px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider text-white shadow-xs">
                                HARI INI
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-full transition-all ${
                              col.isToday
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300 dark:ring-blue-800'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {col.date}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* TIMETABLE SCHEDULE GRID (06.00 TO 17.00) */}
                    <div className="relative min-w-[700px]">
                      {/* RED CURRENT TIME INDICATOR BAR */}
                      <div className="absolute top-[185px] left-0 right-0 z-20 flex items-center pointer-events-none">
                        <div className="h-3 w-3 rounded-full bg-rose-500 shadow-md -ml-1.5" />
                        <div className="h-0.5 w-full bg-rose-500" />
                      </div>

                      {[
                        '06.00', '07.00', '08.00', '09.00', '10.00',
                        '11.00', '12.00', '13.00', '14.00', '15.00', '16.00', '17.00'
                      ].map((timeStr, rowIdx) => (
                        <div
                          key={timeStr}
                          className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800/60 min-h-[48px] items-start"
                        >
                          <div className="text-[11px] font-bold text-slate-400 pt-1">
                            {timeStr}
                          </div>
                          <div className="border-l border-slate-100 dark:border-slate-800/60 min-h-[48px] p-0.5 relative">
                            {rowIdx === 1 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[1])}
                                className="rounded-xl bg-emerald-100/90 border border-emerald-300 p-2 text-emerald-950 dark:bg-emerald-950/70 dark:border-emerald-700 dark:text-emerald-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-emerald-700 dark:text-emerald-400">07.00 – 08.00</span>
                                <span className="text-xs font-black block leading-tight">Upacara Bendera</span>
                                <span className="text-[9px] font-semibold block opacity-80">Lapangan Sekolah</span>
                              </div>
                            )}
                          </div>
                          <div className="border-l border-slate-100 dark:border-slate-800/60 min-h-[48px] p-0.5 relative">
                            {rowIdx === 2 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[2])}
                                className="rounded-xl bg-purple-100/90 border border-purple-300 p-2 text-purple-950 dark:bg-purple-950/70 dark:border-purple-700 dark:text-purple-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-purple-700 dark:text-purple-400">08.00 – 10.00</span>
                                <span className="text-xs font-black block leading-tight">Ujian Formatif Matematika</span>
                                <span className="text-[9px] font-semibold block opacity-80">Kelas 7A, 7B</span>
                              </div>
                            )}
                            {rowIdx === 9 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[0])}
                                className="rounded-xl bg-pink-100/90 border border-pink-300 p-2 text-pink-950 dark:bg-pink-950/70 dark:border-pink-700 dark:text-pink-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-pink-700 dark:text-pink-400">15.00 – 16.30</span>
                                <span className="text-xs font-black block leading-tight">Konseling Siswa</span>
                                <span className="text-[9px] font-semibold block opacity-80">Ruang BK</span>
                              </div>
                            )}
                          </div>
                          <div className="border-l border-slate-100 dark:border-slate-800/60 min-h-[48px] p-0.5 relative">
                            {rowIdx === 1 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[3])}
                                className="rounded-xl bg-sky-100/90 border border-sky-300 p-2 text-sky-950 dark:bg-sky-950/70 dark:border-sky-700 dark:text-sky-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-sky-700 dark:text-sky-400">07.30 – 09.00</span>
                                <span className="text-xs font-black block leading-tight">Pembelajaran IPA</span>
                                <span className="text-[9px] font-semibold block opacity-80">Kelas 7A · Ruang 203</span>
                              </div>
                            )}
                            {rowIdx === 5 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[1])}
                                className="rounded-xl bg-emerald-100/90 border border-emerald-300 p-2 text-emerald-950 dark:bg-emerald-950/70 dark:border-emerald-700 dark:text-emerald-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-emerald-700 dark:text-emerald-400">11.00 – 12.00</span>
                                <span className="text-xs font-black block leading-tight">Rapat Guru</span>
                                <span className="text-[9px] font-semibold block opacity-80">Ruang Meeting</span>
                              </div>
                            )}
                          </div>

                          {/* KAMIS 29 (ACTIVE HIGHLIGHTED DAY MATCHING USER REFERENCE IMAGE) */}
                          <div className="border-l border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20 min-h-[48px] p-0.5 relative">
                            {rowIdx === 2 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[0])}
                                className="rounded-xl bg-blue-600 text-white border-2 border-blue-400 p-2 shadow-md cursor-pointer hover:scale-[1.02] transition-transform z-10"
                              >
                                <span className="text-[9px] font-bold block text-blue-100">08.00 – 10.00</span>
                                <span className="text-xs font-black block leading-tight">Pembelajaran Bahasa Indonesia</span>
                                <span className="text-[9px] font-semibold block opacity-90">Kelas 7A · Ruang 203</span>
                              </div>
                            )}
                            {rowIdx === 7 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[7])}
                                className="rounded-xl bg-amber-100/90 border border-amber-300 p-2 text-amber-950 dark:bg-amber-950/70 dark:border-amber-700 dark:text-amber-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-amber-700 dark:text-amber-400">13.00 – 15.00</span>
                                <span className="text-xs font-black block leading-tight">Kegiatan Literasi</span>
                                <span className="text-[9px] font-semibold block opacity-80">Perpustakaan</span>
                              </div>
                            )}
                            {rowIdx === 9 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[1])}
                                className="rounded-xl bg-emerald-100/90 border border-emerald-300 p-2 text-emerald-950 dark:bg-emerald-950/70 dark:border-emerald-700 dark:text-emerald-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-emerald-700 dark:text-emerald-400">15.30 – 17.00</span>
                                <span className="text-xs font-black block leading-tight">Persiapan Porseni</span>
                                <span className="text-[9px] font-semibold block opacity-80">Aula Sekolah</span>
                              </div>
                            )}
                          </div>

                          <div className="border-l border-slate-100 dark:border-slate-800/60 min-h-[48px] p-0.5 relative">
                            {rowIdx === 3 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[3])}
                                className="rounded-xl bg-purple-100/90 border border-purple-300 p-2 text-purple-950 dark:bg-purple-950/70 dark:border-purple-700 dark:text-purple-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-purple-700 dark:text-purple-400">09.00 – 11.00</span>
                                <span className="text-xs font-black block leading-tight">Ujian Praktik IPA</span>
                                <span className="text-[9px] font-semibold block opacity-80">Lab. IPA</span>
                              </div>
                            )}
                            {rowIdx === 7 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[0])}
                                className="rounded-xl bg-sky-100/90 border border-sky-300 p-2 text-sky-950 dark:bg-sky-950/70 dark:border-sky-700 dark:text-sky-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-sky-700 dark:text-sky-400">13.00 – 14.30</span>
                                <span className="text-xs font-black block leading-tight">Bimbingan Kelas</span>
                                <span className="text-[9px] font-semibold block opacity-80">Ruang Kelas</span>
                              </div>
                            )}
                          </div>
                          <div className="border-l border-slate-100 dark:border-slate-800/60 min-h-[48px] p-0.5 relative">
                            {rowIdx === 3 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[7])}
                                className="rounded-xl bg-amber-100/90 border border-amber-300 p-2 text-amber-950 dark:bg-amber-950/70 dark:border-amber-700 dark:text-amber-200 cursor-pointer shadow-2xs hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-amber-700 dark:text-amber-400">09.00 – 11.00</span>
                                <span className="text-xs font-black block leading-tight">Pramuka</span>
                                <span className="text-[9px] font-semibold block opacity-80">Latihan Rutin Lapangan</span>
                              </div>
                            )}
                          </div>
                          <div className="border-l border-slate-100 dark:border-slate-800/60 min-h-[48px] p-0.5 relative bg-rose-50/40 dark:bg-rose-950/20">
                            {rowIdx === 1 && (
                              <div
                                onClick={() => setSelectedEventDetail(defaultSampleEvents[4])}
                                className="rounded-xl bg-rose-600 text-white p-2 shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                              >
                                <span className="text-[9px] font-bold block text-rose-200">Libur Nasional</span>
                                <span className="text-xs font-black block leading-tight">Hari Lahir Pancasila</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BOTTOM SECTION: KEGIATAN MENDATANG (UPCOMING EVENTS CAROUSEL/CARDS) */}
                <div className="space-y-3 pt-2 print:hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Kegiatan Mendatang
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleSelectPresetRange('all')}
                      className="text-xs font-extrabold text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat semua</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {upcomingEventsList.map((card) => {
                      const IconComp = card.icon
                      return (
                        <div
                          key={card.id}
                          className={`rounded-2xl border p-3.5 flex items-start gap-3 ${card.bgClass} hover:shadow-md transition-all cursor-pointer`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60 dark:bg-slate-900/60 shadow-xs">
                            <IconComp className="h-4.5 w-4.5" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black leading-snug">
                              {card.title}
                            </h4>
                            <p className="text-[10px] font-bold opacity-80">
                              {card.sub}
                            </p>
                            <p className="text-[10px] font-black pt-1">
                              {card.dateStr}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT EVENT DETAIL DRAWER PANEL (MATCHING REFERENCE IMAGE SIDEBAR) */}
              {currentDetailEvent && (
                <div className="w-80 shrink-0 border-l border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-[#1E293B] shadow-xl overflow-y-auto hidden md:block print:hidden">
                  {/* DETAIL HEADER */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full bg-blue-600 shrink-0" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {currentDetailEvent.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEventDetail(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* TIME & DATE SUBTITLE */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>
                        {currentDetailEvent.startDate === '2025-05-29'
                          ? 'Kamis, 29 Mei 2025'
                          : currentDetailEvent.startDate}
                      </span>
                    </div>
                    <p className="pl-6 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {currentDetailEvent.timeSlot || '08.00 – 10.00 (GMT+7)'} · Setiap Kamis
                    </p>
                  </div>

                  {/* ACTION BUTTONS (EDIT, HAPUS, CETAK, MODUL) */}
                  <div className="flex items-center gap-2 pt-1">
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleEditClick(currentDetailEvent)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs font-black shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(currentDetailEvent.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Hapus Agenda"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handlePrintCalendar}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Cetak Agenda"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    {currentDetailEvent.targetModule && (
                      <button
                        type="button"
                        onClick={() => handleNavigateToModule(currentDetailEvent.targetModule)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Buka Tautan Modul"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* DETAIL TABS (DETAIL, PESERTA, LAMPIRAN) */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-black">
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('detail')}
                      className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                        activeDetailTab === 'detail'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('peserta')}
                      className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                        activeDetailTab === 'peserta'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Peserta ({currentDetailEvent.pesertaCount || 28})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('lampiran')}
                      className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                        activeDetailTab === 'lampiran'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Lampiran ({currentDetailEvent.lampiranCount || 2})
                    </button>
                  </div>

                  {/* TAB CONTENT: DETAIL INFO LIST WITH ICONS */}
                  {activeDetailTab === 'detail' ? (
                    <div className="space-y-3.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {currentDetailEvent.location || 'Ruang 203'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {currentDetailEvent.unit || 'Lantai 2, Gedung Utama'}
                          </p>
                        </div>
                      </div>

                      {/* Notes / Materi */}
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {currentDetailEvent.notes || 'Materi: Teks Narasi'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Bab 4 – Menulis Cerita Inspiratif
                          </p>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {getCategoryLabel(currentDetailEvent)}
                          </span>
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                        </div>
                      </div>

                      {/* Reminder / Audience */}
                      <div className="flex items-start gap-3">
                        <Bell className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            Pengingat
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            15 menit sebelum · {currentDetailEvent.audience || 'Semua Civitas'}
                          </p>
                        </div>
                      </div>

                      {/* Creator */}
                      <div className="flex items-start gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            Dibuat oleh
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {currentDetailEvent.creator || 'Ahmad Fauzi, S.Pd. · 28 Mei 2025'}
                          </p>
                        </div>
                      </div>

                      {/* RSVP ATTENDANCE DROPDOWN */}
                      <div className="pt-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Konfirmasi Kehadiran
                        </label>
                        <select
                          value={rsvpStatus}
                          onChange={(e) => setRsvpStatus(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white cursor-pointer"
                        >
                          <option value="hadir">Anda akan hadir ✓</option>
                          <option value="ragu">Mungkin hadir</option>
                          <option value="tidak">Tidak dapat hadir</option>
                        </select>
                      </div>
                    </div>
                  ) : activeDetailTab === 'peserta' ? (
                    /* PESERTA LIST TAB */
                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        Daftar Peserta Terdaftar (28 Siswa)
                      </p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {['Ahmad Fauzi', 'Aisyah Putri', 'Budi Santoso', 'Dewi Lestari', 'Fahri Ramadhan'].map((nama, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{nama}</span>
                            <span className="text-[10px] font-bold text-emerald-600">Hadir</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* LAMPIRAN TAB */
                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        Berkas & Modul Lampiran (2 File)
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-blue-600" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">Modul_Teks_Narasi.pdf</span>
                          </div>
                          <span className="text-[10px] text-slate-400">1.2 MB</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-blue-600" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">Lembar_Kerja_Siswa.docx</span>
                          </div>
                          <span className="text-[10px] text-slate-400">450 KB</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
