import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppModal from '../components/app/AppModal'
import PageToolbarActions from '../components/app/PageToolbarActions'
import {
  useEffect,
  useMemo,
  useState
} from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import Swal from '@/components/ui/compat/swal-heroui'
import AppTabs from '../components/app/AppTabs'
import {
  DatePicker
} from '@/components/ui/date-picker'
import {
  ShieldCheck,
  Home,
  School,
  UserCheck,
  Users,
  Calendar,
  CalendarDays,
  Moon,
  Sun,
  Clock,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  ListChecks,
  Building2,
  Check,
  RefreshCw
} from 'lucide-react'
import {
  worshipAssessmentSettingService as service
} from '../services/worshipAssessmentSettingService'

// Label dan kamus Bahasa Indonesia
const PROGRAM_LABELS = {
  fullday: { label: 'Full Day School (Senin - Jumat)', short: 'Full Day', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60' },
  boarding: { label: 'Pesantren / Asrama (Boarding)', short: 'Pesantren', color: 'bg-indigo-50 text-indigo-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-emerald-800/60' },
  regular: { label: 'Reguler', short: 'Reguler', color: 'bg-slate-50 text-slate-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60' },
  tahfizh: { label: 'Program Khusus Tahfizh', short: 'Tahfizh', color: 'bg-amber-50 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-emerald-800/60' },
}

const SOURCE_LABELS = {
  school: { label: 'Sekolah / Guru (Di Kelas)', short: 'Guru / Sekolah', icon: School, color: 'bg-blue-50 text-blue-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-blue-950/40 dark:text-blue-300' },
  parent: { label: 'Orang Tua / Wali (Di Rumah)', short: 'Orang Tua / Wali', icon: Home, color: 'bg-purple-50 text-purple-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950/40 dark:text-purple-300' },
  supervisor: { label: 'Musyrif / Pembina Asrama', short: 'Musyrif Asrama', icon: UserCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300' },
  student: { label: 'Siswa Mandiri', short: 'Siswa Mandiri', icon: Users, color: 'bg-sky-50 text-sky-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/40 dark:text-sky-300' },
  either: { label: 'Orang Tua atau Siswa', short: 'Ortu / Siswa', icon: Users, color: 'bg-teal-50 text-teal-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950/40 dark:text-teal-300' },
}

const LOCATION_LABELS = {
  school: { label: 'Di Sekolah / Pondok', short: 'Sekolah', icon: School, color: 'bg-blue-50 text-blue-700 border-emerald-200/80' },
  home: { label: 'Di Rumah Bersama Keluarga', short: 'Rumah', icon: Home, color: 'bg-violet-50 text-violet-700 border-emerald-200/80' },
  any: { label: 'Di Mana Saja (Bebas)', short: 'Fleksibel', icon: Sparkles, color: 'bg-slate-50 text-slate-700 border-emerald-200/80' },
}

const PERIOD_LABELS = {
  regular: { label: 'Semester Reguler', icon: Calendar, color: 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  ramadan: { label: 'Bulan Suci Ramadan', icon: Moon, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
}

const WEEKDAY_NAMES = [
  { val: 1, label: 'Senin' },
  { val: 2, label: 'Selasa' },
  { val: 3, label: 'Rabu' },
  { val: 4, label: 'Kamis' },
  { val: 5, label: 'Jumat' },
  { val: 6, label: 'Sabtu' },
  { val: 7, label: 'Ahad' },
]

export default function WorshipAssessmentSettingPage() {
  const [data, setData] = useState({ programs: [], periods: [], rules: [] })
  const [options, setOptions] = useState({
    units: [],
    classes: [],
    academic_years: [],
    semesters: [],
    templates: [],
    agenda_items: [],
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('rules') // 'rules' | 'programs' | 'periods'

  // Filter States untuk Tab Aturan
  const [searchRule, setSearchRule] = useState('')
  const [filterProgramType, setFilterProgramType] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterLocation, setFilterLocation] = useState('')

  // Form Modals State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false)
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false)

  // Form State
  const [programForm, setProgramForm] = useState({
    education_unit_id: '',
    class_id: '',
    program_type: 'fullday',
    school_weekdays: [1, 2, 3, 4, 5],
    is_active: true,
  })

  const [periodForm, setPeriodForm] = useState({
    name: '',
    period_type: 'ramadan',
    scope: 'global',
    education_unit_id: '',
    class_id: '',
    academic_year_id: '',
    semester_id: '',
    template_id: '',
    start_date: '',
    end_date: '',
    priority: 100,
    is_active: true,
  })

  const [ruleForm, setRuleForm] = useState({
    assessment_period_id: '',
    agenda_item_id: '',
    program_type: 'fullday',
    input_source: 'parent',
    location: 'home',
    school_day_only: false,
    requires_verification: false,
    priority: 10,
    is_active: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [resData, resOptions] = await Promise.all([service.list(), service.options()])
      setData(resData.data || { programs: [], periods: [], rules: [] })
      setOptions(resOptions.data || {})

      const firstUnit = resOptions.data?.units?.[0]?.id || ''
      const activeYear =
        resOptions.data?.academic_years?.find((x) => x.is_active)?.id ||
        resOptions.data?.academic_years?.[0]?.id ||
        ''
      const activeSem =
        resOptions.data?.semesters?.find((x) => x.is_active)?.id ||
        resOptions.data?.semesters?.[0]?.id ||
        ''

      setProgramForm((v) => ({ ...v, education_unit_id: v.education_unit_id || firstUnit }))
      setPeriodForm((v) => ({
        ...v,
        education_unit_id: v.education_unit_id || firstUnit,
        academic_year_id: v.academic_year_id || activeYear,
        semester_id: v.semester_id || activeSem,
      }))
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: err.response?.data?.message || 'Terjadi kesalahan saat memuat konfigurasi ibadah.',
        confirmButtonColor: '#059669',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handlers Simpan
  const handleSaveProgram = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        education_unit_id: programForm.education_unit_id,
        class_id: programForm.class_id || null,
        program_type: programForm.program_type,
        school_weekdays: programForm.school_weekdays,
        is_active: programForm.is_active,
      }
      await service.createProgram(payload)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan',
        text: 'Program operasional unit berhasil dikonfigurasi.',
        timer: 1800,
        showConfirmButton: false,
      })
      setIsProgramModalOpen(false)
      loadData()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.message || 'Pastikan unit dan data wajib telah dipilih.',
        confirmButtonColor: '#059669',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSavePeriod = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        name: periodForm.name,
        period_type: periodForm.period_type,
        scope: periodForm.scope,
        education_unit_id: periodForm.scope === 'global' ? null : periodForm.education_unit_id || null,
        class_id: periodForm.scope === 'class' ? periodForm.class_id || null : null,
        academic_year_id: periodForm.academic_year_id,
        semester_id: periodForm.semester_id || null,
        template_id: periodForm.template_id || null,
        start_date: periodForm.start_date,
        end_date: periodForm.end_date,
        priority: Number(periodForm.priority) || 50,
        is_active: periodForm.is_active,
      }
      await service.createPeriod(payload)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan',
        text: 'Periode penilaian ibadah berhasil ditambahkan.',
        timer: 1800,
        showConfirmButton: false,
      })
      setIsPeriodModalOpen(false)
      setPeriodForm((v) => ({ ...v, name: '', start_date: '', end_date: '' }))
      loadData()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.message || 'Periksa kembali rentang tanggal dan isian formulir.',
        confirmButtonColor: '#059669',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveRule = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        assessment_period_id: ruleForm.assessment_period_id || null,
        agenda_item_id: ruleForm.agenda_item_id,
        program_type: ruleForm.program_type,
        input_source: ruleForm.input_source,
        location: ruleForm.location,
        school_day_only: Boolean(ruleForm.school_day_only),
        requires_verification: Boolean(ruleForm.requires_verification),
        priority: Number(ruleForm.priority) || 10,
        is_active: ruleForm.is_active,
      }
      await service.createRule(payload)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan',
        text: 'Aturan tanggung jawab input berhasil ditambahkan.',
        timer: 1800,
        showConfirmButton: false,
      })
      setIsRuleModalOpen(false)
      loadData()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.message || 'Pastikan seluruh kolom wajib telah dipilih.',
        confirmButtonColor: '#059669',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handlers Hapus
  const handleDeleteItem = (type, id, label) => {
    Swal.fire({
      title: 'Konfirmasi Hapus Data',
      html: `Apakah Anda yakin ingin menghapus konfigurasi <b>${label}</b>?<br><span class="text-xs text-rose-500">Tindakan ini tidak dapat dibatalkan.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Data',
      cancelButtonText: 'Batal',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          if (type === 'rule') await service.deleteRule(id)
          else if (type === 'program') await service.deleteProgram(id)
          else if (type === 'period') await service.deletePeriod(id)

          Swal.fire({
            icon: 'success',
            title: 'Berhasil Dihapus',
            timer: 1500,
            showConfirmButton: false,
          })
          loadData()
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus',
            text: err.response?.data?.message || 'Data gagal dihapus dari database.',
            confirmButtonColor: '#059669',
          })
        }
      }
    })
  }

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return (data.rules || []).filter((r) => {
      const matchSearch =
        !searchRule ||
        r.agenda_item?.name?.toLowerCase().includes(searchRule.toLowerCase()) ||
        r.agenda_item?.code?.toLowerCase().includes(searchRule.toLowerCase())
      const matchProgram = !filterProgramType || r.program_type === filterProgramType
      const matchSource = !filterSource || r.input_source === filterSource
      const matchLocation = !filterLocation || r.location === filterLocation
      return matchSearch && matchProgram && matchSource && matchLocation
    })
  }, [data.rules, searchRule, filterProgramType, filterSource, filterLocation])

  // Ringkasan KPI
  const stats = useMemo(() => {
    const rulesCount = data.rules?.length || 0
    const schoolRules = (data.rules || []).filter((r) => r.input_source === 'school' || r.input_source === 'supervisor').length
    const homeRules = (data.rules || []).filter((r) => r.input_source === 'parent' || r.input_source === 'either').length
    const programsCount = data.programs?.length || 0
    const periodsCount = data.periods?.length || 0
    return { rulesCount, schoolRules, homeRules, programsCount, periodsCount }
  }, [data])

  return (
    <div className="space-y-6">
      {/* HERO HEADER MODERN HEROUI */}
      <div className="space-y-4">
        <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Penilaian Ibadah' }]} />
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/20 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="h-3 w-3" /> Mutaba'ah Terpadu
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {options.academic_years?.find((x) => x.is_active)?.name ? `Tahun Ajaran ${options.academic_years.find((x) => x.is_active).name}` : 'Tahun Ajaran Aktif'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Program & Penilaian Ibadah Siswa
                  </h1>
                </div>
              </div>

              <PageToolbarActions
                onRefresh={loadData}
                refreshLabel="Muat Ulang"
                refreshing={loading}
              />
            </div>

            <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
              <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                Atur operasional Full Day, Pesantren, periode Ramadan, serta pembagian tanggung jawab input sekolah dan rumah.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-emerald-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Aturan Tanggung Jawab</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white">
              <ListChecks className="h-4 w-4 text-white" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-800 dark:text-emerald-200">
            {stats.rulesCount} <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80">Aturan</span>
          </div>
          <p className="mt-1 text-xs font-medium text-emerald-700/80 dark:text-emerald-400/80">Matriks input sekolah & rumah</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-blue-100/90 hover:!bg-blue-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-blue-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Input Sekolah & Musyrif</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl !bg-blue-600 !text-white shadow-sm dark:!bg-blue-600 dark:!text-white">
              <School className="h-4 w-4 text-white" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-800 dark:text-blue-200">
            {stats.schoolRules} <span className="text-xs font-bold text-blue-700/80 dark:text-blue-400/80">Amalan</span>
          </div>
          <p className="mt-1 text-xs font-medium text-blue-700/80 dark:text-blue-400/80">Dzuhur, Ashar, Dhuha, Pondok</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-purple-100/90 hover:!bg-purple-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-purple-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">Input Orang Tua / Wali</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl !bg-purple-600 !text-white shadow-sm dark:!bg-purple-600 dark:!text-white">
              <Home className="h-4 w-4 text-white" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-800 dark:text-purple-200">
            {stats.homeRules} <span className="text-xs font-bold text-purple-700/80 dark:text-purple-400/80">Amalan</span>
          </div>
          <p className="mt-1 text-xs font-medium text-purple-700/80 dark:text-purple-400/80">Subuh, Maghrib, Isya, Adab</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 hover:!bg-amber-200/70 p-4 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-amber-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Program & Periode</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl !bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white">
              <CalendarDays className="h-4 w-4 text-white" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-800 dark:text-amber-200">
            {stats.programsCount} <span className="text-xs font-bold text-amber-700/80 dark:text-amber-400/80">Unit · {stats.periodsCount} Periode</span>
          </div>
          <p className="mt-1 text-xs font-medium text-amber-700/80 dark:text-amber-400/80">Reguler & Semarak Ramadan</p>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <AppTabs
        tabs={[
          {
            id: 'rules',
            label: '1. Tanggung Jawab Pencatatan (Sekolah vs Rumah)',
            icon: ListChecks,
            badge: data.rules?.length || 0,
          },
          {
            id: 'programs',
            label: '2. Program Operasional Unit (Full Day vs Pesantren)',
            icon: Building2,
            badge: data.programs?.length || 0,
          },
          {
            id: 'periods',
            label: '3. Periode Penilaian (Reguler & Ramadan)',
            icon: Moon,
            badge: data.periods?.length || 0,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="Pengaturan penilaian ibadah"
      />

      {/* TAB 1: ATURAN TANGGUNG JAWAB INPUT */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Header & Filter Bar */}
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Matriks Pembagian Tugas Pencatatan Ibadah
                </h3>
                <p className="text-xs text-slate-500">
                  Menentukan siapa yang berhak mencatat amalan dan di mana lokasinya untuk mencegah pemalsuan data mutaba'ah.
                </p>
              </div>

              <PageToolbarActions
                primaryAction={{
                  label: 'Tambah Aturan Input',
                  onClick: () => setIsRuleModalOpen(true),
                }}
              />
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-4 bg-slate-50/60 dark:bg-slate-900/60 border-b border-emerald-200/80 dark:border-emerald-800/60">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <input
                  type="text"
                  placeholder="Cari nama amalan..."
                  value={searchRule}
                  onChange={(e) => setSearchRule(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <CustomSelect
                value={filterProgramType}
                onChange={(e) => setFilterProgramType(e.target.value)}
                className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Semua Program Sekolah</option>
                <option value="fullday">Full Day School</option>
                <option value="boarding">Pesantren / Boarding</option>
                <option value="regular">Reguler</option>
                <option value="tahfizh">Tahfizh</option>
              </CustomSelect>

              <CustomSelect
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Semua Pencatat</option>
                <option value="school">Sekolah / Guru</option>
                <option value="parent">Orang Tua / Wali</option>
                <option value="supervisor">Musyrif Asrama</option>
                <option value="either">Orang Tua / Siswa</option>
              </CustomSelect>

              <CustomSelect
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-200/80 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Semua Lokasi</option>
                <option value="school">Di Sekolah / Asrama</option>
                <option value="home">Di Rumah Bersama Ortu</option>
                <option value="any">Bebas / Di Mana Saja</option>
              </CustomSelect>
            </div>

            {/* Emerald Datatable */}
            <div className="overflow-x-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3.5">AKTIVITAS &amp; AMALAN IBADAH</th>
                    <th className="px-4 py-3.5">PROGRAM &amp; LOKASI</th>
                    <th className="px-4 py-3.5">PENCATAT &amp; KONTEKS</th>
                    <th className="px-4 py-3.5">VALIDASI GURU</th>
                    <th className="px-4 py-3.5 text-right w-16 sm:w-20 select-none"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {filteredRules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Tidak ada aturan yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredRules.map((rule) => {
                      const prog = PROGRAM_LABELS[rule.program_type] || PROGRAM_LABELS.fullday
                      const src = SOURCE_LABELS[rule.input_source] || SOURCE_LABELS.parent
                      const loc = LOCATION_LABELS[rule.location] || LOCATION_LABELS.home
                      const SourceIcon = src.icon
                      const LocIcon = loc.icon

                      return (
                        <tr key={rule.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="h-4 w-4" />
                              </span>
                              <div>
                                <div className="font-black text-slate-900 dark:text-white">{rule.agenda_item?.name || '-'}</div>
                                <div className="text-[10px] font-mono text-slate-400">{rule.agenda_item?.code}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-black ${prog.color}`}>
                              {prog.short}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${src.color}`}>
                              <SourceIcon className="h-3 w-3" />
                              <span>{src.short}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                              <LocIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{loc.short}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {rule.period ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <Moon className="h-3 w-3" />
                                <span>{rule.period.name}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Harian Reguler</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {rule.requires_verification ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold dark:text-emerald-400">
                                <Check className="h-3.5 w-3.5" /> Ya (Wajib)
                              </span>
                            ) : (
                              <span className="text-slate-400">Tidak</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteItem('rule', rule.id, rule.agenda_item?.name || 'Aturan')}
                              className="inline-flex items-center justify-center rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 transition"
                              title="Hapus Aturan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROGRAM OPERASIONAL UNIT & KELAS */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Program Operasional Unit Pendidikan & Jam Efektif
                </h3>
                <p className="text-xs text-slate-500">
                  Konfigurasi hari aktif sekolah untuk memisahkan jadwal Full Day (Senin-Jumat) dan Pesantren Asrama (Senin-Sabtu/Minggu).
                </p>
              </div>

              <PageToolbarActions
                primaryAction={{
                  label: 'Tambah Program Unit',
                  onClick: () => setIsProgramModalOpen(true),
                }}
              />
            </div>

            <div className="overflow-x-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3.5">UNIT PENDIDIKAN &amp; KELAS</th>
                    <th className="px-4 py-3.5">JENIS PROGRAM</th>
                    <th className="px-4 py-3.5">HARI AKTIF &amp; JAM</th>
                    <th className="px-4 py-3.5">STATUS</th>
                    <th className="px-4 py-3.5 text-right w-16 sm:w-20 select-none"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {(data.programs || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Belum ada program unit yang dikonfigurasi.
                      </td>
                    </tr>
                  ) : (
                    (data.programs || []).map((prog) => {
                      const meta = prog.metadata || {}
                      const pType = PROGRAM_LABELS[prog.program_type] || PROGRAM_LABELS.fullday
                      const weekdays = prog.school_weekdays || [1, 2, 3, 4, 5]

                      return (
                        <tr key={prog.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-emerald-600" />
                              <span>{prog.education_unit?.name || 'Seluruh Unit'}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {prog.kelas?.nama_kelas ? (
                              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold dark:bg-emerald-950/40">
                                {prog.kelas.nama_kelas}
                              </span>
                            ) : (
                              <span className="text-slate-400">Semua Rombel</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black ${pType.color}`}>
                              {pType.label}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {WEEKDAY_NAMES.map((d) => {
                                const isActive = weekdays.includes(d.val)
                                return (
                                  <span
                                    key={d.val}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${isActive
                                      ? 'bg-emerald-600 text-white dark:bg-emerald-700'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                      }`}
                                  >
                                    {d.label.slice(0, 3)}
                                  </span>
                                )
                              })}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {meta.jam_belajar || (prog.program_type === 'boarding' ? '24 Jam Asrama' : '07.00 - 16.00 WIB')}
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                              <Check className="h-3 w-3" /> Aktif
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteItem('program', prog.id, prog.education_unit?.name || 'Program')}
                              className="inline-flex items-center justify-center rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 transition"
                              title="Hapus Program"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERIODE PENILAIAN (REGULER & RAMADAN) */}
      {activeTab === 'periods' && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Daftar Periode Penilaian & Kalender Khusus Ibadah
                </h3>
                <p className="text-xs text-slate-500">
                  Periode bertanggal untuk mengaktifkan amalan khusus Ramadan (Tarawih, Puasa, Tadarus) yang mengalahkan aturan reguler.
                </p>
              </div>

              <PageToolbarActions
                primaryAction={{
                  label: 'Tambah Periode Ibadah',
                  onClick: () => setIsPeriodModalOpen(true),
                }}
              />
            </div>

            <div className="overflow-x-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3.5">NAMA PERIODE &amp; JENIS</th>
                    <th className="px-4 py-3.5">CAKUPAN UNIT &amp; TEMPLATE</th>
                    <th className="px-4 py-3.5">RENTANG TANGGAL</th>
                    <th className="px-4 py-3.5">PRIORITAS</th>
                    <th className="px-4 py-3.5 text-right w-16 sm:w-20 select-none"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {(data.periods || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Belum ada periode penilaian ibadah yang didaftarkan.
                      </td>
                    </tr>
                  ) : (
                    (data.periods || []).map((period) => {
                      const isRamadan = period.period_type === 'ramadan'
                      return (
                        <tr key={period.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition">
                          <td className="px-4 py-3 font-black text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isRamadan ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                                {isRamadan ? <Moon className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                              </span>
                              <div>
                                <div>{period.name}</div>
                                {period.configuration?.deskripsi && (
                                  <div className="text-[10px] text-slate-400 font-normal">{period.configuration.deskripsi}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${isRamadan ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                              {isRamadan ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                              <span>{isRamadan ? 'Bulan Ramadan' : 'Reguler'}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {period.education_unit?.name || 'Global (Semua Unit)'}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-mono text-xs text-slate-700 dark:text-slate-300">
                              {period.start_date ? new Date(period.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'} s.d.{' '}
                              {period.end_date ? new Date(period.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {period.template?.name ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                                <BookOpen className="h-3 w-3" />
                                <span>{period.template.name}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">Template Aktif Unit</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              P-{period.priority || 10}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteItem('period', period.id, period.name)}
                              className="inline-flex items-center justify-center rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 transition"
                              title="Hapus Periode"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH ATURAN INPUT */}
      <AppModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title="Tambah Aturan Tanggung Jawab Input"
        description="Tentukan siapa yang mencatat dan di mana lokasinya"
        icon={ListChecks}
        maxWidth="max-w-lg"
        footer={
          <div className="flex w-full justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsRuleModalOpen(false)}
              className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="worship-rule-form"
              disabled={submitting}
              className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Simpan Aturan
            </button>
          </div>
        }
      >
        <form id="worship-rule-form" onSubmit={handleSaveRule} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Aktivitas / Amalan Ibadah *</label>
            <CustomSelect
              required
              value={ruleForm.agenda_item_id}
              onChange={(e) => setRuleForm({ ...ruleForm, agenda_item_id: e.target.value })}
              className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
            >
              <option value="">-- Pilih Amalan Ibadah --</option>
              {(options.agenda_items || []).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} ({x.code})
                </option>
              ))}
            </CustomSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Program Sekolah *</label>
              <CustomSelect
                value={ruleForm.program_type}
                onChange={(e) => setRuleForm({ ...ruleForm, program_type: e.target.value })}
                className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
              >
                <option value="fullday">Full Day School</option>
                <option value="boarding">Pesantren / Boarding</option>
                <option value="regular">Reguler</option>
                <option value="tahfizh">Tahfizh</option>
              </CustomSelect>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Periode Khusus (Opsional)</label>
              <CustomSelect
                value={ruleForm.assessment_period_id}
                onChange={(e) => setRuleForm({ ...ruleForm, assessment_period_id: e.target.value })}
                className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
              >
                <option value="">Aturan Reguler Harian</option>
                {(data.periods || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </CustomSelect>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Pencatat (Tanggung Jawab) *</label>
              <CustomSelect
                value={ruleForm.input_source}
                onChange={(e) => setRuleForm({ ...ruleForm, input_source: e.target.value })}
                className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
              >
                <option value="school">Sekolah / Guru (Di Kelas)</option>
                <option value="parent">Orang Tua / Wali (Di Rumah)</option>
                <option value="supervisor">Musyrif / Asrama (Pondok)</option>
                <option value="either">Orang Tua / Siswa</option>
                <option value="student">Siswa Mandiri</option>
              </CustomSelect>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Lokasi Pelaksanaan *</label>
              <CustomSelect
                value={ruleForm.location}
                onChange={(e) => setRuleForm({ ...ruleForm, location: e.target.value })}
                className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
              >
                <option value="school">Di Sekolah / Pondok</option>
                <option value="home">Di Rumah Bersama Keluarga</option>
                <option value="any">Di Mana Saja (Bebas)</option>
              </CustomSelect>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 dark:border-emerald-800/60 dark:bg-slate-800/60">
            <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ruleForm.requires_verification}
                onChange={(e) => setRuleForm({ ...ruleForm, requires_verification: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Perlu Verifikasi Guru / Pembina</span>
            </label>

            <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ruleForm.school_day_only}
                onChange={(e) => setRuleForm({ ...ruleForm, school_day_only: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Hanya Hari Efektif Sekolah</span>
            </label>
          </div>
        </form>
      </AppModal>

      {/* MODAL 2: TAMBAH PROGRAM UNIT */}
      <AppModal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        title="Tambah Program Operasional Unit"
        description="Konfigurasi Full Day vs Pesantren dan hari sekolah"
        icon={Building2}
        maxWidth="max-w-lg"
        footer={
          <div className="flex w-full justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsProgramModalOpen(false)}
              className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="worship-program-form"
              disabled={submitting || programForm.school_weekdays.length === 0}
              className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Simpan Program
            </button>
          </div>
        }
      >
        <form id="worship-program-form" onSubmit={handleSaveProgram} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Unit Pendidikan *</label>
            <CustomSelect
              required
              value={programForm.education_unit_id}
              onChange={(e) => setProgramForm({ ...programForm, education_unit_id: e.target.value, class_id: '' })}
              className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
            >
              {(options.units || []).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </CustomSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Kelas / Rombel (Opsional)</label>
              <CustomSelect
                value={programForm.class_id}
                onChange={(e) => setProgramForm({ ...programForm, class_id: e.target.value })}
                className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
              >
                <option value="">Seluruh Rombel Unit</option>
                {(options.classes || [])
                  .filter((x) => x.unit_pendidikan_id === programForm.education_unit_id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama_kelas}
                    </option>
                  ))}
              </CustomSelect>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Program *</label>
              <CustomSelect
                value={programForm.program_type}
                onChange={(e) => setProgramForm({ ...programForm, program_type: e.target.value })}
                className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
              >
                <option value="fullday">Full Day School</option>
                <option value="boarding">Pesantren / Boarding</option>
                <option value="regular">Reguler</option>
                <option value="tahfizh">Program Khusus Tahfizh</option>
              </CustomSelect>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Hari Aktif Sekolah *</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEKDAY_NAMES.map((day) => {
                const isChecked = (programForm.school_weekdays || []).includes(day.val)
                return (
                  <button
                    type="button"
                    key={day.val}
                    onClick={() => {
                      const current = programForm.school_weekdays || []
                      const updated = isChecked ? current.filter((x) => x !== day.val) : [...current, day.val]
                      setProgramForm({ ...programForm, school_weekdays: updated })
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${isChecked
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 text-slate-600 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>
        </form>
      </AppModal>

      {/* MODAL 3: TAMBAH PERIODE PENILAIAN */}
      <AppModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        title="Tambah Periode Penilaian Ibadah"
        description="Atur kalender semester reguler atau periode khusus Ramadan"
        icon={Moon}
        maxWidth="max-w-lg"
        footer={
          <div className="flex w-full justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsPeriodModalOpen(false)}
              className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="worship-period-form"
              disabled={submitting}
              className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Simpan Periode
            </button>
          </div>
        }
      >
        <form id="worship-period-form" onSubmit={handleSavePeriod} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Nama Periode *</label>
            <input
              required
              type="text"
              placeholder="Contoh: Periode Semarak Ramadan 1448 H"
              value={periodForm.name}
              onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })}
              className="mt-1 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Periode *</label>
              <CustomSelect
                value={periodForm.period_type}
                onChange={(e) => setPeriodForm({ ...periodForm, period_type: e.target.value })}
                className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
              >
                <option value="ramadan">Bulan Suci Ramadan</option>
                <option value="regular">Semester Reguler</option>
              </CustomSelect>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Cakupan Unit *</label>
              <CustomSelect
                value={periodForm.scope}
                onChange={(e) => setPeriodForm({ ...periodForm, scope: e.target.value })}
                className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
              >
                <option value="global">Global (Semua Unit)</option>
                <option value="unit">Per Unit Tertentu</option>
              </CustomSelect>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Mulai *</label>
              <DatePicker
                required
                value={periodForm.start_date}
                onChange={(e) => setPeriodForm({ ...periodForm, start_date: e.target.value })}
                inputClassName="mt-1 p-2.5"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Selesai *</label>
              <DatePicker
                required
                value={periodForm.end_date}
                onChange={(e) => setPeriodForm({ ...periodForm, end_date: e.target.value })}
                inputClassName="mt-1 p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Template Mutaba'ah (Opsional)</label>
            <CustomSelect
              value={periodForm.template_id}
              onChange={(e) => setPeriodForm({ ...periodForm, template_id: e.target.value })}
              className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 dark:border-emerald-800/60 dark:bg-slate-800"
            >
              <option value="">Gunakan template aktif unit</option>
              {(options.templates || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </CustomSelect>
          </div>
        </form>
      </AppModal>
    </div>
  )
}
