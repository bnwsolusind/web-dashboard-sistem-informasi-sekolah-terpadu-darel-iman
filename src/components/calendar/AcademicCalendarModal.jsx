import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/text-area'
import {
  PRESET_CATEGORIES,
  COLOR_PALETTE,
  MODULE_LINK_OPTIONS,
  AUDIENCE_OPTIONS,
} from './calendarConstants'
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
import Swal from '@/components/ui/compat/swal-heroui'
import { DatePicker } from '@/components/ui/date-picker'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { printCleanTable } from '../../utils/printHelper'
import { usePengaturanStore, resolveFoundationName } from '../../stores/pengaturanStore'



export default function AcademicCalendarModal({ isOpen, onClose, lockedUnit = null }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const foundationName = resolveFoundationName(pengaturan)

  // Role permissions & Scoping
  const roleStr = useMemo(() => {
    if (!user) return ''
    return [
      user?.role,
      user?.role?.name,
      user?.role_name,
      ...(Array.isArray(user?.roles) ? user.roles.map((r) => (typeof r === 'string' ? r : r?.name)) : [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
  }, [user])

  const isFullAccessUser = useMemo(() => {
    if (!user) return false
    return (
      user?.is_superadmin === true ||
      (typeof user?.role_level === 'number' && user.role_level <= 2) ||
      roleStr.includes('superadmin') ||
      roleStr.includes('super_admin') ||
      roleStr.includes('super admin') ||
      roleStr.includes('admin') ||
      roleStr.includes('yayasan') ||
      roleStr.includes('pengurus')
    )
  }, [user, roleStr])

  const isParentOrStudent = useMemo(() => {
    return (
      roleStr.includes('orang tua') ||
      roleStr.includes('orang_tua') ||
      roleStr.includes('orang-tua') ||
      roleStr.includes('orangtua') ||
      roleStr.includes('parent') ||
      roleStr.includes('wali') ||
      roleStr.includes('siswa') ||
      roleStr.includes('student') ||
      roleStr.includes('alumni') ||
      roleStr.includes('santri')
    )
  }, [roleStr])

  const canManage = useMemo(() => {
    if (!user) return false
    if (isFullAccessUser) return true
    if (isParentOrStudent) return false
    if (lockedUnit) return false

    const words = roleStr.split(/[\s,_-]+/)
    const isStaffOrTeacher =
      roleStr.includes('kepala_sekolah') ||
      roleStr.includes('kepala sekolah') ||
      roleStr.includes('kepsek') ||
      roleStr.includes('tata_usaha') ||
      roleStr.includes('tata usaha') ||
      words.includes('tu') ||
      roleStr.includes('operator') ||
      roleStr.includes('divisi') ||
      roleStr.includes('kurikulum') ||
      roleStr.includes('kesiswaan') ||
      roleStr.includes('guru') ||
      roleStr.includes('musyrif')
    return isStaffOrTeacher
  }, [user, isFullAccessUser, isParentOrStudent, lockedUnit, roleStr])

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

  // View States
  const [activeTab, setActiveTab] = useState('view') // 'view' | 'manage'
  const [mainViewMode, setMainViewMode] = useState('minggu') // 'hari' | 'minggu' | 'bulan' | 'agenda'
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date()) // Dynamic current date
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
    { value: 'Semua Unit', label: `Semua Unit (${foundationName})` },
    { value: 'TK', label: 'TK / PAUD IT' },
    { value: 'SD', label: 'SD IT' },
    { value: 'SMP', label: 'SMP IT' },
    { value: 'SMA', label: 'SMA IT' }
  ])

  const resolvedTargetUnit = useMemo(() => {
    if (lockedUnit) return lockedUnit
    if (userUnit) return userUnit
    const savedChildUnit = typeof window !== 'undefined' ? localStorage.getItem('portal_active_child_unit') : null
    if (savedChildUnit) return savedChildUnit
    return ''
  }, [lockedUnit, userUnit, isOpen])

  useEffect(() => {
    if (isOpen && !isFullAccessUser) {
      const target = resolvedTargetUnit || userUnit
      if (target) {
        const matched = unitOptions.find((u) => {
          const val = String(u.value).toLowerCase()
          const lbl = String(u.label || '').toLowerCase()
          const t = target.toLowerCase()
          return val === t || t.includes(val) || val.includes(t) || lbl.includes(t)
        })

        if (matched) {
          setSelectedUnitFilter(matched.value)
        } else {
          setSelectedUnitFilter(target)
        }
      }
    }
  }, [isOpen, isFullAccessUser, resolvedTargetUnit, userUnit, unitOptions])

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

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [fetchedEvents, fetchedUnits] = await Promise.all([
        academicCalendarService.getEvents({ isParentOrStudent }),
        academicCalendarService.getEducationUnits({ isParentOrStudent })
      ])
      if (Array.isArray(fetchedEvents)) {
        setEvents(fetchedEvents)
      } else {
        setEvents([])
      }
      if (Array.isArray(fetchedUnits) && fetchedUnits.length > 0) {
        setUnitOptions(fetchedUnits)
      }
    } catch {
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [])

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
    if (isFullAccessUser) return selectedUnitFilter
    return resolvedTargetUnit || selectedUnitFilter || 'Semua Unit'
  }, [isFullAccessUser, selectedUnitFilter, resolvedTargetUnit])

  const isUnitMatch = useCallback(
    (evtUnit, targetUnit) => {
      // 1. Agenda umum berlabel "Semua Unit" / "Semua Unit Terpadu" / "Seluruh Yayasan" / "all"
      // WAJIB selalu tampil untuk seluruh civitas / seluruh role di setiap unit!
      if (
        !evtUnit ||
        evtUnit === 'Semua Unit' ||
        evtUnit === 'all' ||
        evtUnit === 'Semua Civitas' ||
        String(evtUnit).toLowerCase().includes('semua unit') ||
        String(evtUnit).toLowerCase().includes('seluruh yayasan') ||
        String(evtUnit).toLowerCase().includes('semua civitas')
      ) {
        return true
      }

      // 2. Jika user adalah Superadmin / Admin / Pengurus Yayasan dan sedang memilih "Semua Unit"
      if (isFullAccessUser && (!targetUnit || targetUnit === 'Semua Unit')) {
        return true
      }

      // 3. Jika targetUnit tidak ditentukan atau "Semua Unit", izinkan tampil
      if (!targetUnit || targetUnit === 'Semua Unit') {
        return true
      }

      // 4. Pencocokan unit spesifik (misal: agenda khusus SMAIT hanya untuk civitas SMAIT)
      const eu = String(evtUnit).toLowerCase().trim()
      const tu = String(targetUnit).toLowerCase().trim()

      if (eu === tu || eu.includes(tu) || tu.includes(eu)) return true
      if (tu.includes('sd') && eu.includes('sd')) return true
      if (tu.includes('smp') && eu.includes('smp')) return true
      if ((tu.includes('sma') || tu.includes('pesantren') || tu.includes('ponpes')) && (eu.includes('sma') || eu.includes('pesantren') || eu.includes('ponpes'))) return true
      if ((tu.includes('tk') || tu.includes('paud')) && (eu.includes('tk') || eu.includes('paud'))) return true

      return false
    },
    [isFullAccessUser]
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
    const confirmResult = await Swal.fire({
      title: 'Hapus Agenda Kalender?',
      text: 'Apakah Anda yakin ingin menghapus agenda kalender ini? Agenda yang dihapus tidak dapat dipulihkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Agenda',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
    })
    if (confirmResult.isConfirmed) {
      const updated = await academicCalendarService.hapusEvent(id)
      setEvents(updated)
      if (selectedEventDetail?.id === id) {
        setSelectedEventDetail(null)
      }
    }
  }

  const handleClearAllUserEvents = async () => {
    const confirmResult = await Swal.fire({
      title: 'Sinkronisasi Ulang Kalender?',
      text: 'Bersihkan seluruh agenda buatan lokal dan muat data terbaru murni dari API backend yayasan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Muat Ulang',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
    })
    if (confirmResult.isConfirmed) {
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
      const matchesUnit = isUnitMatch(evt.unit, activeTargetUnit)
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
  }, [events, categoryFilter, activeTargetUnit, enabledCategories, searchQuery, isUnitMatch])

  const eventsOnSelectedRange = useMemo(() => {
    if (!effectiveRange.start) return []
    return events.filter((evt) => {
      const start = evt.startDate
      const end = evt.endDate || evt.startDate
      const matchesRange =
        (start >= effectiveRange.start && start <= effectiveRange.end) ||
        (end >= effectiveRange.start && end <= effectiveRange.end) ||
        (start <= effectiveRange.start && end >= effectiveRange.end)
      const matchesUnit = isUnitMatch(evt.unit, activeTargetUnit)
      return matchesRange && matchesUnit
    })
  }, [effectiveRange, events, activeTargetUnit, isUnitMatch])

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

  const formatEventDetailDate = useCallback((dateStr) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d)
    } catch {
      return dateStr
    }
  }, [])

  const weekDays = useMemo(() => {
    const curr = new Date(currentMonthDate)
    const day = curr.getDay() // 0 = Min, 1 = Sen ...
    const diffToMon = day === 0 ? -6 : 1 - day // distance to Monday
    const monday = new Date(curr)
    monday.setDate(curr.getDate() + diffToMon)

    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dStr = d.toISOString().split('T')[0]
      const isToday = dStr === todayDateStr
      return {
        day: dayLabels[i],
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        fullDateStr: dStr,
        dateObj: d,
        isToday,
      }
    })
  }, [currentMonthDate, todayDateStr])

  const dateRangeDisplay = useMemo(() => {
    if (mainViewMode === 'minggu') {
      if (!weekDays || weekDays.length === 0) return { title: '', badge: '' }
      const start = weekDays[0].dateObj
      const end = weekDays[6].dateObj
      const startStr = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(start)
      const endStr = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(end)

      const target = new Date(currentMonthDate.valueOf())
      const dayNr = (currentMonthDate.getDay() + 6) % 7
      target.setDate(target.getDate() - dayNr + 3)
      const firstThursday = target.valueOf()
      target.setMonth(0, 1)
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + (((4 - target.getDay()) + 7) % 7))
      }
      const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000)

      return {
        title: `${startStr} – ${endStr}`,
        badge: `Minggu ke-${weekNumber > 0 ? weekNumber : 1}`
      }
    }
    if (mainViewMode === 'bulan' || mainViewMode === 'agenda') {
      return {
        title: `${monthNames[month]} ${year}`,
        badge: `Tahun ${year}`
      }
    }
    // Hari
    const dayFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(currentMonthDate)
    return {
      title: dayFmt,
      badge: currentMonthDate.toISOString().split('T')[0] === todayDateStr ? 'Hari Ini' : ''
    }
  }, [mainViewMode, weekDays, currentMonthDate, month, year, monthNames, todayDateStr])

  const currentTimeTop = useMemo(() => {
    const now = new Date()
    const hours = now.getHours() + now.getMinutes() / 60
    if (hours < 6 || hours > 18) return null
    return (hours - 6) * 48 + 4
  }, [])

  const navigateMonth = (step) => {
    if (mainViewMode === 'minggu') {
      const nextDate = new Date(currentMonthDate)
      nextDate.setDate(nextDate.getDate() + step * 7)
      setCurrentMonthDate(nextDate)
    } else if (mainViewMode === 'hari') {
      const nextDate = new Date(currentMonthDate)
      nextDate.setDate(nextDate.getDate() + step)
      setCurrentMonthDate(nextDate)
    } else {
      setCurrentMonthDate(new Date(year, month + step, 1))
    }
  }

  // Derive upcoming events dynamically from real events state
  const upcomingEventsList = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) return []
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const listToRender = events
      .filter((e) => (e.startDate || e.start_date || '') >= todayStr)
      .slice(0, 4)

    return listToRender.map((evt, idx) => {
      const color = evt.color || 'blue'
      const iconMap = {
        ujian: GraduationCap,
        kegiatan: Users,
        terima_rapor: Award,
        libur_sekolah: Palmtree,
        libur_semester: Palmtree
      }
      const IconComp = iconMap[evt.category] || CalendarDays
      return {
        id: evt.id || `up-${idx}`,
        title: evt.title,
        sub: evt.location || evt.unit || 'Semua Civitas',
        dateStr: evt.startDate === evt.endDate ? (evt.startDate || '-') : `${evt.startDate || ''} – ${evt.endDate || ''}`,
        color,
        icon: IconComp,
        bgClass: 'bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-200'
      }
    })
  }, [events])

  if (!isOpen) return null

  // If a detail event is selected, compute selected event details
  const currentDetailEvent = selectedEventDetail || (events.length > 0 ? events[0] : null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-950/65 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] print:static print:inset-auto print:z-auto print:bg-white print:p-0 print:m-0 print:block print:w-full print:overflow-visible">
      <div
        className="relative w-full max-w-4xl h-[92vh] max-h-[92vh] flex flex-col rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xl transition-all dark:border-slate-800 dark:bg-[#0F172A] print:w-full print:max-w-none print:h-auto print:max-h-none print:shadow-none print:border-none print:rounded-none print:bg-white print:p-0 print:m-0 print:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP NAVIGATION HEADER BAR (GOOGLE CALENDAR / OUTLOOK STYLE) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-[#1E293B] shrink-0 print:hidden">
          {/* LEFT SECTION: BRAND TITLE & DATE SWITCHER */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 pr-2 border-r border-slate-200 dark:border-slate-700">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <CalendarDays className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                  Kalender Akademik
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {foundationName}
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
                {dateRangeDisplay.title}
              </h3>
              {dateRangeDisplay.badge && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {dateRangeDisplay.badge}
                </span>
              )}
            </div>
          </div>

          {/* CENTER SECTION: SEGMENTED VIEW SWITCHER (HARI, MINGGU, BULAN, AGENDA) */}
          <div
            role="tablist"
            aria-label="Tampilan kalender akademik"
            className="inline-flex items-center rounded-2xl bg-slate-100/90 p-1 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs overflow-x-auto no-scrollbar"
          >
            {[
              { id: 'hari', label: 'Hari' },
              { id: 'minggu', label: 'Minggu' },
              { id: 'bulan', label: 'Bulan' },
              { id: 'agenda', label: 'Agenda' },
            ].map((mode) => {
              const isSelected = mainViewMode === mode.id && activeTab === 'view'
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setMainViewMode(mode.id)
                    setActiveTab('view')
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-400/40 scale-[1.01]'
                      : 'border border-transparent text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 hover:bg-white/80 dark:hover:bg-slate-700/60 font-bold'
                  }`}
                >
                  {mode.label}
                </button>
              )
            })}
          </div>

          {/* RIGHT SECTION: ACTIONS (CETAK, KELOLA, REFRESH, CLOSE) */}
          <div className="flex items-center gap-2">
            {/* UNIT FILTER SELECTOR */}
            <div className="w-44 sm:w-52">
              <HeroUiFilterSelect
                value={activeTargetUnit}
                onChange={(val) => isFullAccessUser && !lockedUnit && setSelectedUnitFilter(val)}
                disabled={!isFullAccessUser || Boolean(lockedUnit)}
                options={
                  lockedUnit
                    ? [{ value: lockedUnit, label: `${lockedUnit} (Unit Siswa)` }]
                    : isFullAccessUser
                    ? unitOptions.map((u) => ({ value: u.value, label: u.label || u.value }))
                    : [{ value: activeTargetUnit, label: `${activeTargetUnit} (Terkunci)` }]
                }
                placeholder="Pilih Unit Pendidikan"
                icon={Building}
                ariaLabel="Filter Unit Pendidikan"
                size="sm"
                searchable={isFullAccessUser && !lockedUnit}
                className="w-full"
              />
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
                      <HeroUiFilterSelect
                        value={isFullAccessUser ? formData.unit : activeTargetUnit}
                        onChange={(val) => isFullAccessUser && setFormData((prev) => ({ ...prev, unit: val }))}
                        disabled={!isFullAccessUser}
                        options={
                          isFullAccessUser
                            ? unitOptions.map((u) => ({ value: u.value, label: u.label || u.value }))
                            : [{ value: activeTargetUnit, label: `${activeTargetUnit} (Terkunci Sesuai Hak Akses Anda)` }]
                        }
                        placeholder="Pilih Unit Pendidikan"
                        icon={Building}
                        ariaLabel="Pilih Unit Pendidikan Sekolah"
                        size="md"
                        searchable={isFullAccessUser}
                        className="w-full"
                      />
                    </div>

                    {/* Judul Agenda */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Nama / Judul Agenda Kegiatan <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        size="sm"
                        required
                        placeholder="Contoh: Pembelajaran Bahasa Indonesia, Ujian Formatif Matematika..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    {/* Kategori Agenda */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Kategori Agenda <span className="text-rose-500">*</span>
                      </label>
                      <HeroUiFilterSelect
                        value={formData.category}
                        onChange={(val) => handleCategorySelectChange(val)}
                        options={Object.entries(PRESET_CATEGORIES).map(([key, cat]) => ({
                          value: key,
                          label: cat.label,
                        }))}
                        placeholder="Pilih Kategori"
                        icon={Tag}
                        ariaLabel="Kategori Agenda"
                        size="md"
                        searchable
                        className="w-full"
                      />
                    </div>

                    {/* Custom Label if Category custom */}
                    {formData.category === 'custom' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Nama Kategori Custom <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          type="text"
                          size="sm"
                          required
                          placeholder="Masukkan nama kategori baru..."
                          value={formData.customCategoryLabel}
                          onChange={(e) => setFormData({ ...formData, customCategoryLabel: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Warna Penanda */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Warna Penanda Card / Badge
                      </label>
                      <HeroUiFilterSelect
                        value={formData.color}
                        onChange={(val) => setFormData((prev) => ({ ...prev, color: val }))}
                        options={Object.entries(COLOR_PALETTE).map(([cKey, cVal]) => ({
                          value: cKey,
                          label: cVal.label,
                        }))}
                        placeholder="Pilih Warna"
                        icon={Palette}
                        ariaLabel="Warna Penanda Card / Badge"
                        size="md"
                        className="w-full"
                      />
                    </div>

                    {/* Tanggal Mulai */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Tanggal Mulai <span className="text-rose-500">*</span>
                      </label>
                      <DatePicker
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
                        inputClassName="px-3.5 py-2 text-xs font-semibold"
                        placeholder="Pilih tanggal mulai..."
                      />
                    </div>

                    {/* Tanggal Selesai */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Tanggal Selesai <span className="text-rose-500">*</span>
                      </label>
                      <DatePicker
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        inputClassName="px-3.5 py-2 text-xs font-semibold"
                        placeholder="Pilih tanggal selesai..."
                      />
                    </div>

                    {/* Tautan Modul */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Tautan Pintasan Modul Fitur
                      </label>
                      <HeroUiFilterSelect
                        value={formData.targetModule || ''}
                        onChange={(val) => setFormData((prev) => ({ ...prev, targetModule: val }))}
                        options={MODULE_LINK_OPTIONS.map((m) => ({ value: m.value, label: m.label }))}
                        placeholder="Pilih Tautan Modul"
                        icon={ExternalLink}
                        ariaLabel="Tautan Pintasan Modul Fitur"
                        size="md"
                        searchable
                        className="w-full"
                      />
                    </div>

                    {/* Sasaran Peserta */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Target Sasaran Civitas
                      </label>
                      <HeroUiFilterSelect
                        value={formData.audience}
                        onChange={(val) => setFormData((prev) => ({ ...prev, audience: val }))}
                        options={AUDIENCE_OPTIONS.map((aud) => ({ value: aud.value, label: aud.label }))}
                        placeholder="Pilih Target Sasaran"
                        icon={Users}
                        ariaLabel="Target Sasaran Civitas"
                        size="md"
                        className="w-full"
                      />
                    </div>

                    {/* Catatan / Keterangan */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Catatan / Keterangan Khusus
                      </label>
                      <TextArea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Penjelasan ringkas jadwal pendaftaran, lokasi, persyaratan, atau petunjuk pelaksanaan..."
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
                    className="w-full flex items-center justify-between rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white p-3 shadow-md shadow-emerald-600/25 transition-all active:scale-[0.98] cursor-pointer"
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
                    {daysGrid.map((item, idx) => {
                      const isOutside = item.monthOffset !== 0
                      const isToday = item.dateStr === todayDateStr && !isOutside
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
                        Satuan Pendidikan
                      </h4>
                    </div>
                    <div className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {unitOptions.map((u, uIdx) => {
                        const paletteColors = ['bg-emerald-500', 'bg-teal-500', 'bg-sky-500', 'bg-indigo-500', 'bg-purple-500', 'bg-amber-500']
                        const dotColor = paletteColors[uIdx % paletteColors.length]
                        return (
                          <label key={u.value} className="flex items-center gap-2.5 cursor-pointer hover:opacity-80">
                            <input
                              type="radio"
                              name="calendar_modal_unit_filter"
                              checked={selectedUnitFilter === u.value}
                              onChange={() => setSelectedUnitFilter(u.value)}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                            <span className="truncate">{u.label}</span>
                          </label>
                        )
                      })}
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
                                  isToday ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-2 ring-emerald-300 dark:ring-emerald-700' : ''
                                }`}
                              >
                                {item.day}
                              </span>
                              {isToday && (
                                <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-xs">
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
                      {weekDays.map((col, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-[11px] font-extrabold ${col.isToday ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-500 dark:text-slate-400'}`}>
                              {col.day}
                            </span>
                            {col.isToday && (
                              <span className="rounded-md bg-emerald-600 px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider text-white shadow-xs">
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
                      {currentTimeTop !== null && weekDays.some((w) => w.isToday) && (
                        <div
                          style={{ top: `${currentTimeTop}px` }}
                          className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                        >
                          <div className="h-3 w-3 rounded-full bg-rose-500 shadow-md -ml-1.5" />
                          <div className="h-0.5 w-full bg-rose-500" />
                        </div>
                      )}

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
                          {weekDays.map((col, cIdx) => (
                            <div
                              key={cIdx}
                              className={`border-l min-h-[48px] p-0.5 relative ${
                                col.isToday
                                  ? 'border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20'
                                  : cIdx === 6
                                  ? 'border-slate-100 dark:border-slate-800/60 bg-rose-50/40 dark:bg-rose-950/20'
                                  : 'border-slate-100 dark:border-slate-800/60'
                              }`}
                            />
                          ))}
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
                    {upcomingEventsList.length === 0 ? (
                      <div className="col-span-full py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                        Tidak ada agenda mendatang terdaftar
                      </div>
                    ) : (
                      upcomingEventsList.map((card) => {
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
                    }))}
                  </div>
                </div>
              </div>

              {/* RIGHT EVENT DETAIL DRAWER PANEL (MATCHING REFERENCE IMAGE SIDEBAR) */}
              {currentDetailEvent && (
                <div className="w-80 shrink-0 border-l border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-white dark:bg-[#1E293B] shadow-xl overflow-y-auto hidden md:block print:hidden">
                  {/* DETAIL HEADER */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full bg-emerald-600 shrink-0" />
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
                        {formatEventDetailDate(currentDetailEvent.startDate)}
                        {currentDetailEvent.endDate && currentDetailEvent.endDate !== currentDetailEvent.startDate
                          ? ` – ${formatEventDetailDate(currentDetailEvent.endDate)}`
                          : ''}
                      </span>
                    </div>
                    <p className="pl-6 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {currentDetailEvent.timeSlot || 'Sepanjang Hari'} · {getCategoryLabel(currentDetailEvent)}
                    </p>
                  </div>

                  {/* ACTION BUTTONS (EDIT, HAPUS, CETAK, MODUL) */}
                  <div className="flex items-center gap-2 pt-1">
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleEditClick(currentDetailEvent)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
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

                  {/* DETAIL TABS (DETAIL, SASARAN, LAMPIRAN) */}
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
                      Sasaran
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
                      Lampiran
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
                            {currentDetailEvent.location || 'Seluruh Kampus'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {currentDetailEvent.unit || currentDetailEvent.targetUnit || 'Semua Unit Pendidikan'}
                          </p>
                        </div>
                      </div>

                      {/* Notes / Materi */}
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {currentDetailEvent.notes || currentDetailEvent.description || 'Agenda Kalender Akademik'}
                          </p>
                          {(currentDetailEvent.academicYear || currentDetailEvent.semester) && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {currentDetailEvent.academicYear ? `TA ${currentDetailEvent.academicYear}` : ''}
                              {currentDetailEvent.semester ? ` · Semester ${currentDetailEvent.semester}` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {getCategoryLabel(currentDetailEvent)}
                          </span>
                          <span className="h-2 w-2 rounded-full bg-emerald-600" />
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
                            {currentDetailEvent.reminder || 'Sesuai Jadwal'} · {currentDetailEvent.audience || 'Semua Civitas'}
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
                            {currentDetailEvent.creator || currentDetailEvent.author || user?.name || 'Administrator Akademik'}
                          </p>
                        </div>
                      </div>

                      {/* RSVP ATTENDANCE DROPDOWN */}
                      <div className="pt-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Konfirmasi Kehadiran
                        </label>
                        <HeroUiFilterSelect
                          value={rsvpStatus}
                          onChange={(val) => setRsvpStatus(val)}
                          options={[
                            { value: 'hadir', label: 'Anda akan hadir ✓' },
                            { value: 'ragu', label: 'Mungkin hadir' },
                            { value: 'tidak', label: 'Tidak dapat hadir' },
                          ]}
                          placeholder="Pilih Konfirmasi"
                          icon={UserCheck}
                          ariaLabel="Konfirmasi Kehadiran"
                          size="sm"
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : activeDetailTab === 'peserta' ? (
                    /* SASARAN & AUDIENCE TAB */
                    <div className="space-y-3 text-xs">
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        Sasaran & Partisipan Agenda
                      </p>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-500 dark:text-slate-400">Target Audiens:</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">{currentDetailEvent.audience || 'Seluruh Civitas'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-500 dark:text-slate-400">Unit Terkait:</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{currentDetailEvent.unit || currentDetailEvent.targetUnit || 'Semua Unit'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-500 dark:text-slate-400">Status Agenda:</span>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {currentDetailEvent.status || 'Aktif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* LAMPIRAN TAB */
                    <div className="space-y-3 text-xs">
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        Berkas & Lampiran
                      </p>
                      {currentDetailEvent.attachment || currentDetailEvent.documentUrl ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-blue-600" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {currentDetailEvent.attachment || 'Dokumen_Kalender_Akademik.pdf'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">Tersedia</span>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                          Tidak ada berkas lampiran untuk agenda ini
                        </div>
                      )}
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
