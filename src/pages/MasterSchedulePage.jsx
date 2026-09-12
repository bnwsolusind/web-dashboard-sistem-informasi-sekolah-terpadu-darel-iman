import { useMemo, useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Clock3,
  Users,
  Upload,
  BookOpen,
  Building2,
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  RefreshCcw,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  Pencil,
  Trash2,
  Sparkles,
  Calendar,
  Printer,
  X,
} from 'lucide-react'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { scheduleService } from '../services/scheduleService'
import { educationUnitService } from '../services/educationUnitService'
import { tahunAjaranService } from '../services/tahunAjaranService'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  ActionDropdown,
  AppBadge,
  AppButton,
  AppDrawer,
  MobileDataCard,
  PersonIdentityCell,
} from '../components/app'
import {
  MasterDataPage,
  MasterActionButton,
  MasterDataSection,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterFilterSelect,
  MasterFormModal,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'

const DAYS_MAP = [
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' },
  { id: 7, name: 'Minggu' },
]

const emptyForm = {
  unit_pendidikan_id: '',
  kelas_id: '',
  employee_id: '',
  subject_id: '',
  academic_year_id: '',
  semester_id: '',
  day_of_week: 1,
  time_start: '07:30',
  time_end: '09:00',
  week_type: 'all',
  is_active: true,
  notes: '',
}

const pickError = (error, fallback) => {
  const errors = error.response?.data?.errors
  if (errors) {
    const firstKey = Object.keys(errors)[0]
    return Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey]
  }
  return error.response?.data?.message || fallback
}

const formatTime = (value) => value?.slice(0, 5) || '--:--'
const subjectName = (item) => item?.nama_mapel || item?.name || 'Mata Pelajaran'

export default function MasterSchedulePage({ embedded = false, hideBreadcrumb = false }) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  // Filters
  const [unitFilter, setUnitFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [dayFilter, setDayFilter] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // View state
  const [viewMode, setViewMode] = useState('table') // 'table' | 'weekly'
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState(new Date().getDay() || 1)

  // Modals & Drawers
  const [modal, setModal] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [printTeacherFilter, setPrintTeacherFilter] = useState('')
  const [detailDrawerItem, setDetailDrawerItem] = useState(null)
  const [editing, setEditing] = useState(null)

  // Form State & Validation
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [conflictWarning, setConflictWarning] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  // Fetch Options
  const { data: options = {}, isLoading: optionsLoading } = useQuery({
    queryKey: ['schedule-options'],
    queryFn: scheduleService.getOptions,
  })

  // Fetch Units for dropdown filter & dependent form
  const { data: unitsResponse = {} } = useQuery({
    queryKey: ['education-units-all'],
    queryFn: () => educationUnitService.getAll(),
  })
  const unitsList = unitsResponse.data || []

  // Fetch Fallback Academic Years if needed
  const { data: tahunAjaranFallback = [] } = useQuery({
    queryKey: ['academic-years-dropdown-fallback'],
    queryFn: tahunAjaranService.getDropdown,
  })

  // Derived Tahun Ajaran Options
  const tahunAjaranList = useMemo(() => {
    const fromOpts =
      options.tahun_ajaran ||
      options.tahunAjaran ||
      options.academic_years ||
      options.academic_year
    if (Array.isArray(fromOpts) && fromOpts.length > 0) return fromOpts
    if (Array.isArray(tahunAjaranFallback) && tahunAjaranFallback.length > 0) return tahunAjaranFallback
    return []
  }, [options, tahunAjaranFallback])

  // Derived unit options combining options.kelas, options.guru & unitsList
  const unitOptions = useMemo(() => {
    if (unitsList.length > 0) return unitsList
    const map = new Map()
    ;(options.kelas || []).forEach((k) => {
      if (k.unitPendidikan || k.unit_pendidikan) {
        const u = k.unitPendidikan || k.unit_pendidikan
        map.set(u.id, u)
      }
    })
    return Array.from(map.values())
  }, [unitsList, options.kelas])

  // Effective Day filter: in weekly view mode, use selectedWeeklyDay; in table view mode, use dayFilter
  const effectiveDayFilter = viewMode === 'weekly' ? selectedWeeklyDay : dayFilter

  // Query Schedule List
  const { data: response = {}, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'schedules',
      page,
      search,
      unitFilter,
      yearFilter,
      semesterFilter,
      subjectFilter,
      classFilter,
      effectiveDayFilter,
      teacherFilter,
      statusFilter,
      viewMode,
    ],
    queryFn: () =>
      scheduleService.getDaftar({
        page,
        per_page: viewMode === 'weekly' ? 24 : 15,
        search,
        unit_pendidikan_id: unitFilter || undefined,
        academic_year_id: yearFilter || undefined,
        semester_id: semesterFilter || undefined,
        subject_id: subjectFilter || undefined,
        kelas_id: classFilter || undefined,
        day_of_week: effectiveDayFilter || undefined,
        employee_id: teacherFilter || undefined,
        is_active: statusFilter || undefined,
      }),
  })

  const items = response.data || []
  const meta = response.meta || {}
  const stats = response.statistik || {}

  // Guru Picker Modal State
  const [guruPickerOpen, setGuruPickerOpen] = useState(false)
  const [guruSearchText, setGuruSearchText] = useState('')

  // Filtered Dependent Options for Form
  const filteredSemesters = useMemo(() => {
    const list = options.semester || []
    if (!form.academic_year_id) return list
    const filtered = list.filter(
      (s) => s.academic_year_id === form.academic_year_id
    )
    return filtered.length > 0 ? filtered : list
  }, [options.semester, form.academic_year_id])

  const filteredKelas = useMemo(() => {
    const list = options.kelas || []
    if (list.length === 0) return []
    const filtered = list.filter((k) => {
      const matchUnit = !form.unit_pendidikan_id || k.unit_pendidikan_id === form.unit_pendidikan_id
      const matchYear = !form.academic_year_id || k.tahun_ajaran_id === form.academic_year_id
      const matchSemester = !form.semester_id || k.semester_id === form.semester_id
      return matchUnit && matchYear && matchSemester
    })
    if (filtered.length > 0) return filtered

    // Fallback: match unit & year if semester is empty
    const matchUnitYear = list.filter((k) => {
      const matchUnit = !form.unit_pendidikan_id || k.unit_pendidikan_id === form.unit_pendidikan_id
      const matchYear = !form.academic_year_id || k.tahun_ajaran_id === form.academic_year_id
      return matchUnit && matchYear
    })
    if (matchUnitYear.length > 0) return matchUnitYear

    // Fallback: match unit only
    const matchUnitOnly = list.filter((k) => !form.unit_pendidikan_id || k.unit_pendidikan_id === form.unit_pendidikan_id)
    if (matchUnitOnly.length > 0) return matchUnitOnly

    return list
  }, [options.kelas, form.unit_pendidikan_id, form.academic_year_id, form.semester_id])

  const filteredGuru = useMemo(() => {
    const list = options.guru || []
    if (!form.unit_pendidikan_id) return list
    const filtered = list.filter((g) => g.unit_id === form.unit_pendidikan_id)
    return filtered.length > 0 ? filtered : list
  }, [options.guru, form.unit_pendidikan_id])

  const filteredGuruInPicker = useMemo(() => {
    const list = filteredGuru
    if (!guruSearchText.trim()) return list
    const q = guruSearchText.toLowerCase()
    return list.filter(
      (g) =>
        g.nama_lengkap?.toLowerCase().includes(q) ||
        g.niy?.toLowerCase().includes(q) ||
        g.nik?.toLowerCase().includes(q)
    )
  }, [filteredGuru, guruSearchText])

  const filteredSubjects = useMemo(() => {
    const list = options.mata_pelajaran || []
    if (!form.unit_pendidikan_id) return list
    const filtered = list.filter((m) => !m.unit_pendidikan_id || m.unit_pendidikan_id === form.unit_pendidikan_id)
    return filtered.length > 0 ? filtered : list
  }, [options.mata_pelajaran, form.unit_pendidikan_id])

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? scheduleService.ubah({ id: editing.id, payload }) : scheduleService.tambah(payload),
    onSuccess: (result) => {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan',
        text: result.message || 'Jadwal pelajaran berhasil diperbarui.',
        confirmColor: '#0E5C44',
      })
      setModal(false)
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
    onError: (error) => {
      const errMsg = pickError(error, 'Periksa kembali kelengkapan data dan potensi bentrok jadwal.')
      setConflictWarning(errMsg)
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors)
      }
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: scheduleService.hapus,
    onSuccess: (result) => {
      Swal.fire({
        icon: 'success',
        title: 'Jadwal Terhapus',
        text: result.message || 'Jadwal pelajaran telah dihapus.',
        confirmColor: '#0E5C44',
      })
      if (detailDrawerItem) setDetailDrawerItem(null)
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
    onError: (error) => Swal.fire('Gagal', pickError(error, 'Jadwal gagal dihapus.'), 'error'),
  })

  // Open Form Handlers
  const openAdd = () => {
    const activeYear = (tahunAjaranList || []).find((item) => item.is_active)
    const yearId = activeYear?.id || tahunAjaranList?.[0]?.id || ''
    const activeSemester = (options.semester || []).find(
      (item) => item.is_active && item.academic_year_id === yearId
    )
    setEditing(null)
    setFormErrors({})
    setConflictWarning('')
    setIsDirty(false)
    setForm({
      ...emptyForm,
      academic_year_id: yearId,
      semester_id:
        activeSemester?.id ||
        options.semester?.find((item) => item.academic_year_id === yearId)?.id ||
        '',
    })
    setModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setFormErrors({})
    setConflictWarning('')
    setIsDirty(false)
    
    // Detect unit_pendidikan_id from item's class or subject or employee
    const detectedUnitId =
      item.kelas?.unit_pendidikan_id ||
      item.subject?.unit_pendidikan_id ||
      item.employee?.unit_id ||
      ''

    setForm({
      unit_pendidikan_id: detectedUnitId,
      kelas_id: item.kelas_id || item.school_class_id || '',
      employee_id: item.employee_id || item.teacher_id || '',
      subject_id: item.subject_id || '',
      academic_year_id: item.academic_year_id || '',
      semester_id: item.semester_id || '',
      day_of_week: item.day_of_week || 1,
      time_start: item.time_start?.slice(0, 5) || '07:30',
      time_end: item.time_end?.slice(0, 5) || '09:00',
      week_type: item.week_type || 'all',
      is_active: item.is_active ?? true,
      notes: item.metadata?.notes || '',
    })
    setModal(true)
  }

  // Handle Form Input Change with Dependent Dropdown Logic
  const handleFormChange = (field, value) => {
    setIsDirty(true)
    setFormErrors((prev) => ({ ...prev, [field]: null }))
    setConflictWarning('')

    setForm((prev) => {
      const updated = { ...prev, [field]: value }

      // If Unit changes: reset dependent fields if invalid for new unit
      if (field === 'unit_pendidikan_id') {
        if (value) {
          const validClass = (options.kelas || []).find(
            (k) => k.id === prev.kelas_id && k.unit_pendidikan_id === value
          )
          if (!validClass) updated.kelas_id = ''

          const validGuru = (options.guru || []).find(
            (g) => g.id === prev.employee_id && g.unit_id === value
          )
          if (!validGuru) updated.employee_id = ''

          const validSubject = (options.mata_pelajaran || []).find(
            (m) =>
              m.id === prev.subject_id &&
              (!m.unit_pendidikan_id || m.unit_pendidikan_id === value)
          )
          if (!validSubject) updated.subject_id = ''
        }
      }

      // If Tahun Ajaran changes: reset semester & kelas
      if (field === 'academic_year_id') {
        const validSemester = (options.semester || []).find(
          (s) => s.id === prev.semester_id && s.academic_year_id === value
        )
        if (!validSemester) {
          const firstSemester = (options.semester || []).find(
            (s) => s.academic_year_id === value
          )
          updated.semester_id = firstSemester?.id || ''
        }
        updated.kelas_id = ''
      }

      // If Kelas is selected directly: auto-populate unit, year, semester if empty
      if (field === 'kelas_id' && value) {
        const selectedKelas = (options.kelas || []).find((k) => k.id === value)
        if (selectedKelas) {
          if (selectedKelas.unit_pendidikan_id) {
            updated.unit_pendidikan_id = selectedKelas.unit_pendidikan_id
          }
          if (selectedKelas.tahun_ajaran_id) {
            updated.academic_year_id = selectedKelas.tahun_ajaran_id
          }
          if (selectedKelas.semester_id) {
            updated.semester_id = selectedKelas.semester_id
          }
        }
      }

      return updated
    })
  }

  // Validate form client-side
  const validateClient = () => {
    const errors = {}
    if (!form.academic_year_id) errors.academic_year_id = 'Tahun Ajaran wajib dipilih.'
    if (!form.semester_id) errors.semester_id = 'Semester wajib dipilih.'
    if (!form.kelas_id) errors.kelas_id = 'Kelas / Rombel wajib dipilih.'
    if (!form.employee_id) errors.employee_id = 'Guru Pengampu wajib dipilih.'
    if (!form.subject_id) errors.subject_id = 'Mata Pelajaran wajib dipilih.'
    if (!form.day_of_week) errors.day_of_week = 'Hari Mengajar wajib dipilih.'
    if (!form.time_start) errors.time_start = 'Jam mulai wajib diisi.'
    if (!form.time_end) errors.time_end = 'Jam selesai wajib diisi.'

    if (form.time_start && form.time_end && form.time_end <= form.time_start) {
      errors.time_end = 'Jam selesai harus lebih akhir dari jam mulai.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validateClient()) {
      return
    }

    const payload = {
      kelas_id: form.kelas_id,
      employee_id: form.employee_id,
      subject_id: form.subject_id,
      academic_year_id: form.academic_year_id,
      semester_id: form.semester_id,
      day_of_week: Number(form.day_of_week),
      time_start: form.time_start,
      time_end: form.time_end,
      week_type: form.week_type,
      is_active: form.is_active,
    }

    saveMutation.mutate(payload)
  }

  const remove = async (item) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Jadwal Pelajaran?',
      text: `${subjectName(item.subject)} · ${item.kelas?.nama_kelas || 'Kelas'}`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Jadwal',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
    })
    if (result.isConfirmed) deleteMutation.mutate(item.id)
  }

  const resetFilters = () => {
    setSearch('')
    setUnitFilter('')
    setYearFilter('')
    setSemesterFilter('')
    setSubjectFilter('')
    setClassFilter('')
    setDayFilter('')
    setTeacherFilter('')
    setStatusFilter('')
    setPage(1)
  }

  const activeFilterCount = [
    unitFilter,
    yearFilter,
    semesterFilter,
    subjectFilter,
    classFilter,
    dayFilter,
    teacherFilter,
    statusFilter,
  ].filter(Boolean).length

  // CSV Import handler
  const importRows = async (rows) => {
    let success = 0
    const failures = []
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index]
      try {
        await scheduleService.tambah({
          ...row,
          day_of_week: Number(row.day_of_week),
          is_active: !['0', 'false', 'nonaktif'].includes(String(row.is_active).toLowerCase()),
        })
        success += 1
      } catch (error) {
        failures.push(`baris ${index + 2}: ${error.response?.data?.message || 'gagal'}`)
      }
    }
    queryClient.invalidateQueries({ queryKey: ['schedules'] })
    await Swal.fire({
      icon: failures.length ? 'warning' : 'success',
      title: 'Import Selesai',
      text: `${success} jadwal berhasil diimport, ${failures.length} gagal.${
        failures.length ? ` (${failures.slice(0, 3).join('; ')})` : ''
      }`,
      confirmColor: '#0E5C44',
    })
  }

  // CSV Export handler
  const handleExportCSV = async () => {
    try {
      if (!items || items.length === 0) {
        Swal.fire('Info', 'Tidak ada data jadwal untuk diekspor.', 'info')
        return
      }
      const headers = ['NO', 'GURU', 'MATA PELAJARAN', 'KELAS', 'HARI', 'JAM MULAI', 'JAM SELESAI', 'STATUS']
      let csvStr = headers.join(',') + '\n'
      items.forEach((row, i) => {
        const line = [
          i + 1,
          `"${row.employee?.nama_lengkap || row.guru_name || ''}"`,
          `"${row.subject?.nama_mapel || row.mapel_name || ''}"`,
          `"${row.kelas?.nama_kelas || row.kelas_name || ''}"`,
          `"${row.day_name || row.day_of_week || ''}"`,
          `"${row.time_start || ''}"`,
          `"${row.time_end || ''}"`,
          `"${row.is_active ? 'Aktif' : 'Nonaktif'}"`,
        ].join(',')
        csvStr += line + '\n'
      })
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `export_jadwal_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      Swal.fire('Error', 'Gagal mengunduh data ekspor.', 'error')
    }
  }

  // Weekly Grid Schedule Data Grouping
  const weeklyGridData = useMemo(() => {
    return items.filter((item) => (item.day_of_week ?? 1) === Number(selectedWeeklyDay))
  }, [items, selectedWeeklyDay])

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah Jadwal" onClick={openAdd} />
    </div>
  )

  const shouldHideHeader = embedded || hidePageHeader

  return (
    <MasterDataPage
      className="schedule-master-page space-y-6"
      hideBreadcrumb={embedded || hideBreadcrumb}
    >
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Jadwal Pelajaran"
        teachersList={options.guru || []}
        selectedTeacherId={printTeacherFilter}
        onTeacherChange={(id) => setPrintTeacherFilter(id)}
        onPrint={() => {
          const allRows = Array.isArray(items) ? items : []
          const printTeacher = (options.guru || []).find((g) => g.id === printTeacherFilter)
          const rowsToPrint = printTeacherFilter
            ? allRows.filter(
                (r) =>
                  r.employee_id === printTeacherFilter ||
                  r.employee?.id === printTeacherFilter ||
                  r.teacher_id === printTeacherFilter
              )
            : allRows

          printCleanTable({
            title: printTeacher
              ? `Laporan Jadwal Pelajaran - ${printTeacher.nama_lengkap}`
              : 'Laporan Data Jadwal Pelajaran',
            subtitle: printTeacher
              ? `Jadwal Mengajar Guru: ${printTeacher.nama_lengkap}${printTeacher.niy ? ` (NIY ${printTeacher.niy})` : ''}`
              : 'Daftar Sesi Pelajaran & Jam Mengajar Sekolah Islam Terpadu',
            headers: ['NO', 'HARI & JAM', 'MATA PELAJARAN', 'KELAS & UNIT', 'GURU PENGAMPUL', 'PERIODE AKADEMIK', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              `${row.nama_hari || DAYS_MAP.find((d) => d.id === row.day_of_week)?.name || 'Senin'} (${formatTime(row.time_start)} - ${formatTime(row.time_end)})`,
              `${subjectName(row.subject) || row.subject_name || '-'}${row.subject?.kode_mapel || row.subject?.code ? ` [${row.subject.kode_mapel || row.subject.code}]` : ''}`,
              `${row.kelas?.nama_kelas || row.school_class?.name || row.kelas_name || '-'}${row.kelas?.unit_pendidikan?.name || row.unit_name ? ` (${row.kelas?.unit_pendidikan?.name || row.unit_name})` : ''}`,
              `${row.employee?.nama_lengkap || row.teacher?.name || row.guru_name || '-'}${row.employee?.niy ? ` (NIY ${row.employee.niy})` : ''}`,
              `${row.academic_year?.name || row.tahun_ajaran_name || '-'}${row.semester?.name ? ` - ${row.semester.name}` : ''}`,
              row.is_active ? 'Aktif' : 'Nonaktif',
            ]),
          })
        }}
        onDownload={() => {
          const allRows = Array.isArray(items) ? items : []
          const printTeacher = (options.guru || []).find((g) => g.id === printTeacherFilter)
          const rowsToPrint = printTeacherFilter
            ? allRows.filter(
                (r) =>
                  r.employee_id === printTeacherFilter ||
                  r.employee?.id === printTeacherFilter ||
                  r.teacher_id === printTeacherFilter
              )
            : allRows

          downloadPdfTable({
            title: printTeacher
              ? `Laporan Jadwal Pelajaran - ${printTeacher.nama_lengkap}`
              : 'Laporan Data Jadwal Pelajaran',
            subtitle: printTeacher
              ? `Jadwal Mengajar Guru: ${printTeacher.nama_lengkap}${printTeacher.niy ? ` (NIY ${printTeacher.niy})` : ''}`
              : 'Daftar Sesi Pelajaran & Jam Mengajar Sekolah Islam Terpadu',
            headers: ['NO', 'HARI & JAM', 'MATA PELAJARAN', 'KELAS & UNIT', 'GURU PENGAMPUL', 'PERIODE AKADEMIK', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              `${row.nama_hari || DAYS_MAP.find((d) => d.id === row.day_of_week)?.name || 'Senin'} (${formatTime(row.time_start)} - ${formatTime(row.time_end)})`,
              `${subjectName(row.subject) || row.subject_name || '-'}${row.subject?.kode_mapel || row.subject?.code ? ` [${row.subject.kode_mapel || row.subject.code}]` : ''}`,
              `${row.kelas?.nama_kelas || row.school_class?.name || row.kelas_name || '-'}${row.kelas?.unit_pendidikan?.name || row.unit_name ? ` (${row.kelas?.unit_pendidikan?.name || row.unit_name})` : ''}`,
              `${row.employee?.nama_lengkap || row.teacher?.name || row.guru_name || '-'}${row.employee?.niy ? ` (NIY ${row.employee.niy})` : ''}`,
              `${row.academic_year?.name || row.tahun_ajaran_name || '-'}${row.semester?.name ? ` - ${row.semester.name}` : ''}`,
              row.is_active ? 'Aktif' : 'Nonaktif',
            ]),
            filename: printTeacher
              ? `jadwal_mengajar_${printTeacher.nama_lengkap.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`
              : 'laporan_jadwal_pelajaran.pdf',
          })
        }}
      />
      {/* Header Banner */}
      {!shouldHideHeader && (
        <MasterPageHeader
          icon={CalendarDays}
          title="Jadwal Pelajaran & Plot Mengajar"
          description="Kelola alokasi jam mengajar guru, rombongan belajar, dan mata pelajaran terintegrasi akademik."
          actions={pageActions}
        />
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Jadwal Pelajaran"
        onImport={importRows}
        columns={[
          { key: 'kelas_id', required: true, example: 'UUID Kelas' },
          { key: 'employee_id', required: true, example: 'UUID Guru' },
          { key: 'subject_id', required: true, example: 'UUID Mapel' },
          { key: 'academic_year_id', required: true, example: 'UUID Tahun Ajaran' },
          { key: 'semester_id', required: true, example: 'UUID Semester' },
          { key: 'day_of_week', required: true, example: '1 (Senin) - 7 (Minggu)' },
          { key: 'time_start', required: true, example: '07:30' },
          { key: 'time_end', required: true, example: '09:00' },
          { key: 'week_type', example: 'all' },
          { key: 'is_active', example: '1' },
        ]}
      />

      {/* Stats Summary Cards */}
      <MasterStatsGrid>
        <MasterStatCard
          icon={CalendarDays}
          label="TOTAL JADWAL"
          value={stats.total ?? 0}
          description="Sesi mengajar terdaftar"
          variant="success"
          loading={isLoading}
        />
        <MasterStatCard
          icon={CheckCircle2}
          label="JADWAL AKTIF"
          value={stats.aktif ?? 0}
          description="Siap digunakan presensi"
          variant="info"
          loading={isLoading}
        />
        <MasterStatCard
          icon={Clock3}
          label="NONAKTIF / ARSIP"
          value={stats.tidak_aktif ?? 0}
          description="Jadwal diarsipkan"
          variant="warning"
          loading={isLoading}
        />
        <MasterStatCard
          icon={Users}
          label="GURU TERJADWAL"
          value={stats.guru_terjadwal ?? 0}
          description="Guru mengajar aktif"
          variant="neutral"
          loading={isLoading}
        />
      </MasterStatsGrid>

      {/* Main Section */}
      <MasterDataSection
        title="Daftar Jadwal & Plot Mengajar"
        description="Filter jadwal pelajaran berdasarkan unit, periode akademik, guru, atau rombel."
        countLabel={`${Number(meta.total ?? 0).toLocaleString('id-ID')} jadwal`}
        search={{
          value: search,
          onValueChange: (val) => {
            setSearch(val)
            setPage(1)
          },
          placeholder: 'Cari guru, mata pelajaran, atau nama kelas...',
          'aria-label': 'Cari jadwal pelajaran',
        }}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {pageActions}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'table'
                    ? 'bg-[#0E5C44] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>Daftar Tabel</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'weekly'
                    ? 'bg-[#0E5C44] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Matriks Mingguan</span>
              </button>
            </div>
          </div>
        }
        filters={
          <>
            {/* Filter Unit Pendidikan */}
            <MasterFilterSelect
              aria-label="Filter Unit Pendidikan"
              value={unitFilter}
              onChange={(e) => {
                setUnitFilter(e.target.value)
                setClassFilter('')
                setTeacherFilter('')
                setSubjectFilter('')
                setPage(1)
              }}
            >
              <option value="">Semua Unit</option>
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.nama}
                </option>
              ))}
            </MasterFilterSelect>

            {/* Filter Hari */}
            <MasterFilterSelect
              aria-label="Filter Hari Mengajar"
              value={dayFilter}
              onChange={(e) => {
                setDayFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Hari</option>
              {DAYS_MAP.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </MasterFilterSelect>

            {/* Filter Guru */}
            <MasterFilterSelect
              aria-label="Filter Guru"
              value={teacherFilter}
              onChange={(e) => {
                setTeacherFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Guru</option>
              {(options.guru || [])
                .filter((g) => !unitFilter || g.unit_id === unitFilter)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama_lengkap}
                  </option>
                ))}
            </MasterFilterSelect>

            {/* Filter Status */}
            <MasterFilterSelect
              aria-label="Filter Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </MasterFilterSelect>
          </>
        }
        onReset={resetFilters}
        resetDisabled={!search && activeFilterCount === 0}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isEmpty={!isLoading && !isError && items.length === 0}
        emptyTitle="Belum Ada Jadwal Pelajaran"
        emptyDescription="Tidak ada jadwal yang sesuai dengan filter. Tambahkan jadwal baru atau sesuaikan kata kunci pencarian."
        pagination={{ meta, page, onPageChange: setPage }}
        ariaLabel="Tabel Jadwal Pelajaran"
      >
        {/* VIEW MODE 1: WEEKLY MATRIX GRID */}
        {viewMode === 'weekly' ? (
          <div className="p-5 space-y-5">
            {/* Days Tab Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
              {DAYS_MAP.map((day) => {
                const dayCount =
                  stats?.per_hari?.[day.id] ??
                  stats?.per_hari?.[String(day.id)] ??
                  (selectedWeeklyDay === day.id ? items.length : 0)

                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      setSelectedWeeklyDay(day.id)
                      setDayFilter(String(day.id))
                      setPage(1)
                    }}
                    className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
                      selectedWeeklyDay === day.id
                        ? 'bg-[#0E5C44] text-white shadow-md shadow-emerald-900/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{day.name}</span>
                    <span className="ml-1 rounded-full bg-black/10 px-2 py-0.5 text-[10px]">
                      {dayCount}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Grid of Schedules for Selected Day */}
            {weeklyGridData.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {weeklyGridData.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setDetailDrawerItem(item)}
                    className="group relative cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-[#3FBF75] hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433]"
                  >
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold dark:text-emerald-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(item.time_start)} – {formatTime(item.time_end)}
                      </span>
                      <AppBadge variant={item.is_active ? 'success' : 'neutral'} dot>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </AppBadge>
                    </div>

                    <h4 className="mt-2 text-sm font-extrabold text-slate-900 group-hover:text-[#0E5C44] dark:text-white dark:group-hover:text-[#3FBF75]">
                      {subjectName(item.subject)}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>
                          {item.kelas?.nama_kelas || item.school_class?.name || 'Kelas'}
                          {item.kelas?.unit_pendidikan?.name && (
                            <span className="text-slate-400">
                              {' '}
                              · {item.kelas.unit_pendidikan.name}
                            </span>
                          )}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{item.employee?.nama_lengkap || item.teacher?.name || 'Guru'}</span>
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.academic_year?.name || item.tahun_ajaran_name || '-'}
                      </span>
                      <span className="text-[11px] font-bold text-[#0E5C44] group-hover:underline dark:text-[#3FBF75]">
                        Detail →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                Tidak ada jadwal pelajaran pada hari {DAYS_MAP.find((d) => d.id === selectedWeeklyDay)?.name}.
              </div>
            )}
          </div>
        ) : (
          /* VIEW MODE 2: TABLE & MOBILE DATA CARDS */
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:bg-slate-800/70">
                  <tr>
                    <th className="w-[14%] p-4">Hari & Jam</th>
                    <th className="w-[22%] p-4">Mata Pelajaran</th>
                    <th className="w-[18%] p-4">Kelas & Unit</th>
                    <th className="w-[20%] p-4">Guru Pengampu</th>
                    <th className="hidden w-[14%] p-4 lg:table-cell">Periode Akademik</th>
                    <th className="w-[10%] p-4 sm:table-cell">Status</th>
                    <th className="w-[12%] p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:divide-slate-800 dark:text-slate-200">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="group border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-all duration-200 cursor-pointer"
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div>{item.nama_hari || DAYS_MAP.find((d) => d.id === item.day_of_week)?.name}</div>
                        <div className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                          {formatTime(item.time_start)} – {formatTime(item.time_end)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="truncate font-bold text-slate-900 dark:text-white">
                          {subjectName(item.subject)}
                        </div>
                        <div className="font-mono text-xs text-slate-400">
                          {item.subject?.kode_mapel || item.subject?.code || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="truncate font-semibold text-slate-800 dark:text-slate-100">
                          {item.kelas?.nama_kelas || item.school_class?.name || '-'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {item.kelas?.unit_pendidikan?.name || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <PersonIdentityCell
                          src={
                            item.employee?.photo_url ||
                            item.employee?.avatar_url ||
                            item.employee?.foto
                          }
                          name={item.employee?.nama_lengkap || item.teacher?.name || '-'}
                          subtitle={
                            item.employee?.niy ? `NIY ${item.employee.niy}` : 'Guru pengampu'
                          }
                        />
                      </td>
                      <td className="hidden p-4 text-xs lg:table-cell">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {item.academic_year?.name || '-'}
                        </div>
                        <div className="text-slate-500">{item.semester?.name || '-'}</div>
                      </td>
                      <td className="p-4">
                        <AppBadge variant={item.is_active ? 'success' : 'neutral'} dot>
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </AppBadge>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex justify-center">
                          <ActionDropdown
                            onView={() => setDetailDrawerItem(item)}
                            onEdit={() => openEdit(item)}
                            onDelete={() => remove(item)}
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Data Cards View */}
            <div className="grid gap-3 p-4 md:hidden">
              {items.map((item) => (
                <MobileDataCard
                  key={item.id}
                  title={subjectName(item.subject)}
                  subtitle={`${item.nama_hari || DAYS_MAP.find((d) => d.id === item.day_of_week)?.name} (${formatTime(item.time_start)}–${formatTime(item.time_end)})`}
                  avatarSrc={
                    item.employee?.photo_url ||
                    item.employee?.avatar_url ||
                    item.employee?.foto
                  }
                  badge={item.is_active ? 'Aktif' : 'Nonaktif'}
                  badgeVariant={item.is_active ? 'success' : 'neutral'}
                  fields={[
                    {
                      label: 'Kelas & Unit',
                      value: `${item.kelas?.nama_kelas || 'Kelas'} · ${item.kelas?.unit_pendidikan?.name || 'Unit'}`,
                      icon: Building2,
                    },
                    {
                      label: 'Guru Pengampu',
                      value: item.employee?.nama_lengkap || item.teacher?.name || 'Guru',
                      icon: Users,
                    },
                  ]}
                  onView={() => setDetailDrawerItem(item)}
                  onEdit={() => openEdit(item)}
                  onDelete={() => remove(item)}
                />
              ))}
            </div>
          </>
        )}
      </MasterDataSection>

      {/* DETAIL DRAWER */}
      <AppDrawer
        isOpen={Boolean(detailDrawerItem)}
        onClose={() => setDetailDrawerItem(null)}
        icon={CalendarDays}
        title="Detail Jadwal Pelajaran"
        description="Informasi lengkap alokasi waktu dan penugasan guru."
        footer={
          <div className="flex items-center justify-end gap-2">
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => setDetailDrawerItem(null)}
            >
              Tutup
            </AppButton>
            {detailDrawerItem && (
              <>
                <AppButton
                  variant="primary"
                  size="sm"
                  icon={Pencil}
                  onClick={() => {
                    const item = detailDrawerItem
                    setDetailDrawerItem(null)
                    openEdit(item)
                  }}
                >
                  Edit Jadwal
                </AppButton>
                <AppButton
                  variant="destructive"
                  size="sm"
                  icon={Trash2}
                  onClick={() => remove(detailDrawerItem)}
                >
                  Hapus
                </AppButton>
              </>
            )}
          </div>
        }
      >
        {detailDrawerItem && (
          <div className="space-y-5 p-1">
            {/* Header Highlight Card */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  {detailDrawerItem.nama_hari ||
                    DAYS_MAP.find((d) => d.id === detailDrawerItem.day_of_week)?.name}
                </span>
                <AppBadge variant={detailDrawerItem.is_active ? 'success' : 'neutral'} dot>
                  {detailDrawerItem.is_active ? 'Aktif' : 'Nonaktif'}
                </AppBadge>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                {formatTime(detailDrawerItem.time_start)} – {formatTime(detailDrawerItem.time_end)} WIB
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {subjectName(detailDrawerItem.subject)}
              </p>
            </div>

            {/* Information Grid */}
            <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Informasi Penugasan
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Kelas / Rombel</span>
                  <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
                    {detailDrawerItem.kelas?.nama_kelas || detailDrawerItem.school_class?.name || '-'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Unit Pendidikan</span>
                  <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
                    {detailDrawerItem.kelas?.unit_pendidikan?.name || '-'}
                  </div>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-slate-400">Guru Pengampu</span>
                  <div className="mt-1">
                    <PersonIdentityCell
                      src={
                        detailDrawerItem.employee?.photo_url ||
                        detailDrawerItem.employee?.avatar_url
                      }
                      name={
                        detailDrawerItem.employee?.nama_lengkap ||
                        detailDrawerItem.teacher?.name ||
                        '-'
                      }
                      subtitle={
                        detailDrawerItem.employee?.niy
                          ? `NIY ${detailDrawerItem.employee.niy}`
                          : 'Guru Pengampu'
                      }
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-slate-400">Tahun Ajaran</span>
                  <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
                    {detailDrawerItem.academic_year?.name || '-'}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-slate-400">Semester</span>
                  <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
                    {detailDrawerItem.semester?.name || '-'}
                  </div>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-slate-400">Pola Minggu</span>
                  <div className="mt-0.5 font-semibold text-slate-800 dark:text-white">
                    {detailDrawerItem.week_type === 'odd'
                      ? 'Minggu Ganjil'
                      : detailDrawerItem.week_type === 'even'
                      ? 'Minggu Genap'
                      : 'Setiap Minggu'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppDrawer>

      {/* FORM MODAL (TAMBAH / EDIT) */}
      <MasterFormModal
        isOpen={modal}
        onClose={() => {
          if (isDirty) {
            Swal.fire({
              title: 'Batalkan perubahan?',
              text: 'Data yang dimasukkan belum disimpan.',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Ya, batalkan',
              cancelButtonText: 'Lanjutkan edit',
              confirmButtonColor: '#dc2626',
            }).then((res) => {
              if (res.isConfirmed) setModal(false)
            })
          } else {
            setModal(false)
          }
        }}
        icon={CalendarDays}
        title={editing ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
        description="Lengkapi informasi akademik, penugasan guru, dan alokasi waktu mengajar."
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              form="schedule-form"
              disabled={saveMutation.isPending}
              className="h-11 rounded-xl bg-[#0E5C44] px-5 text-xs font-semibold text-white shadow-md shadow-emerald-900/20 hover:bg-emerald-900 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        }
      >
        <form
          id="schedule-form"
          onSubmit={submit}
          className="space-y-6 p-6 text-xs font-semibold text-slate-700 dark:text-slate-200"
        >
          {/* Conflict Warning Banner */}
          {conflictWarning && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="text-xs">
                <strong className="block font-bold">Peringatan Bentrok / Validasi:</strong>
                <span>{conflictWarning}</span>
              </div>
            </div>
          )}

          {/* GRUP 1: INFORMASI AKADEMIK */}
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E5C44] dark:text-[#3FBF75]">
              <Building2 className="h-4 w-4" />
              <span>1. Informasi & Periode Akademik</span>
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Unit Pendidikan */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Unit Pendidikan
                </label>
                <select
                  value={form.unit_pendidikan_id}
                  onChange={(e) => handleFormChange('unit_pendidikan_id', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827]"
                >
                  <option value="">Semua Unit (Lintas Unit)</option>
                  {unitOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Ajaran */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Tahun Ajaran *
                </label>
                <select
                  required
                  value={form.academic_year_id}
                  onChange={(e) => handleFormChange('academic_year_id', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.academic_year_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">Pilih Tahun Ajaran</option>
                  {(tahunAjaranList || []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.tahun_ajaran || item.nama} {item.is_active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
                {formErrors.academic_year_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.academic_year_id}
                  </p>
                )}
              </div>

              {/* Semester */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Semester *
                </label>
                <select
                  required
                  value={form.semester_id}
                  onChange={(e) => handleFormChange('semester_id', e.target.value)}
                  disabled={!form.academic_year_id}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 disabled:opacity-50 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.semester_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">
                    {!form.academic_year_id ? 'Pilih Thn Ajaran Dulu' : 'Pilih Semester'}
                  </option>
                  {filteredSemesters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} {item.is_active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
                {formErrors.semester_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.semester_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GRUP 2: PENUGASAN PEMBELAJARAN */}
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E5C44] dark:text-[#3FBF75]">
              <BookOpen className="h-4 w-4" />
              <span>2. Penugasan Pembelajaran</span>
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Kelas / Rombel */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Kelas / Rombel *
                </label>
                <select
                  required
                  value={form.kelas_id}
                  onChange={(e) => handleFormChange('kelas_id', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.kelas_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">
                    {filteredKelas.length === 0
                      ? 'Tidak ada kelas sesuai filter'
                      : 'Pilih Kelas / Rombel'}
                  </option>
                  {filteredKelas.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_kelas}
                      {item.unitPendidikan?.name || item.unit_pendidikan?.name
                        ? ` · ${item.unitPendidikan?.name || item.unit_pendidikan?.name}`
                        : ''}
                    </option>
                  ))}
                </select>
                {formErrors.kelas_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.kelas_id}
                  </p>
                )}
              </div>

              {/* Guru Pengampu */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Guru Pengampu *
                  </label>
                  <button
                    type="button"
                    onClick={() => setGuruPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E5C44] hover:text-emerald-700 dark:text-[#3FBF75] hover:underline"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Cari & Pilih Guru
                  </button>
                </div>
                <select
                  required
                  value={form.employee_id}
                  onChange={(e) => handleFormChange('employee_id', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.employee_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">
                    {filteredGuru.length === 0
                      ? 'Tidak ada guru sesuai unit'
                      : 'Pilih Guru Pengampu'}
                  </option>
                  {filteredGuru.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_lengkap} {item.niy ? `(NIY ${item.niy})` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.employee_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.employee_id}
                  </p>
                )}
              </div>

              {/* Mata Pelajaran */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Mata Pelajaran *
                </label>
                <select
                  required
                  value={form.subject_id}
                  onChange={(e) => handleFormChange('subject_id', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.subject_id ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">
                    {filteredSubjects.length === 0
                      ? 'Tidak ada mapel sesuai unit'
                      : 'Pilih Mata Pelajaran'}
                  </option>
                  {filteredSubjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {subjectName(item)} {item.kode_mapel || item.code ? `(${item.kode_mapel || item.code})` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.subject_id && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.subject_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GRUP 3: WAKTU DAN TEMPAT */}
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E5C44] dark:text-[#3FBF75]">
              <Clock className="h-4 w-4" />
              <span>3. Waktu & Jadwal Mengajar</span>
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Hari Mengajar */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Hari Mengajar *
                </label>
                <select
                  required
                  value={form.day_of_week}
                  onChange={(e) => handleFormChange('day_of_week', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827]"
                >
                  {DAYS_MAP.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pola Minggu */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Pola Minggu
                </label>
                <select
                  value={form.week_type}
                  onChange={(e) => handleFormChange('week_type', e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827]"
                >
                  <option value="all">Setiap Minggu</option>
                  <option value="odd">Minggu Ganjil</option>
                  <option value="even">Minggu Genap</option>
                </select>
              </div>

              {/* Jam Mulai */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Jam Mulai *
                </label>
                <input
                  required
                  type="time"
                  value={form.time_start}
                  onChange={(e) => handleFormChange('time_start', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 font-mono outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.time_start ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.time_start && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.time_start}
                  </p>
                )}
              </div>

              {/* Jam Selesai */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Jam Selesai *
                </label>
                <input
                  required
                  type="time"
                  value={form.time_end}
                  onChange={(e) => handleFormChange('time_end', e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 font-mono outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] ${
                    formErrors.time_end ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.time_end && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {formErrors.time_end}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GRUP 4: STATUS & OPTIONAL */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => handleFormChange('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-[#0E5C44] focus:ring-[#0E5C44]"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">
                  Jadwal Aktif untuk Presensi
                </span>
                <span className="block text-[11px] font-medium text-slate-400">
                  Jadwal aktif dapat langsung dipilih oleh guru saat penginputan absensi kelas.
                </span>
              </div>
            </label>
          </div>
        </form>
      </MasterFormModal>

      {/* Modal Interactive Picker Guru Pengampu */}
      {guruPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-[#111827]">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pilih Guru Pengampu</h3>
                  <p className="text-xs text-slate-500">Cari & pilih guru pengajar jadwal ini</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuruPickerOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Search */}
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={guruSearchText}
                  onChange={(e) => setGuruSearchText(e.target.value)}
                  placeholder="Cari nama guru atau NIY..."
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-xs font-medium outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Guru List Scroll */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredGuruInPicker.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Tidak ada data guru ditemukan untuk kata kunci "{guruSearchText}"
                  </div>
                ) : (
                  filteredGuruInPicker.map((guru) => {
                    const isSelected = form.employee_id === guru.id
                    return (
                      <div
                        key={guru.id}
                        onClick={() => {
                          handleFormChange('employee_id', guru.id)
                          setGuruPickerOpen(false)
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                            : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-emerald-100 font-bold text-emerald-800 flex items-center justify-center text-sm shadow-sm">
                            {guru.nama_lengkap?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{guru.nama_lengkap}</p>
                            <p className="text-[11px] text-slate-500">
                              {guru.niy ? `NIY: ${guru.niy}` : 'Guru Active'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isSelected
                              ? 'bg-[#0E5C44] text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-[#0E5C44] hover:text-white dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {isSelected ? 'Terpilih' : 'Pilih Guru'}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MasterDataPage>
  )
}
