import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
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
  RefreshCw,
} from 'lucide-react'
import { worshipAssessmentSettingService as service } from '../services/worshipAssessmentSettingService'

// Label dan kamus Bahasa Indonesia
const PROGRAM_LABELS = {
  fullday: { label: 'Full Day School (Senin - Jumat)', short: 'Full Day', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  boarding: { label: 'Pesantren / Asrama (Boarding)', short: 'Pesantren', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' },
  regular: { label: 'Reguler', short: 'Reguler', color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  tahfizh: { label: 'Program Khusus Tahfizh', short: 'Tahfizh', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
}

const SOURCE_LABELS = {
  school: { label: 'Sekolah / Guru (Di Kelas)', short: 'Guru / Sekolah', icon: School, color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300' },
  parent: { label: 'Orang Tua / Wali (Di Rumah)', short: 'Orang Tua / Wali', icon: Home, color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300' },
  supervisor: { label: 'Musyrif / Pembina Asrama', short: 'Musyrif Asrama', icon: UserCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' },
  student: { label: 'Siswa Mandiri', short: 'Siswa Mandiri', icon: Users, color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300' },
  either: { label: 'Orang Tua atau Siswa', short: 'Ortu / Siswa', icon: Users, color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300' },
}

const LOCATION_LABELS = {
  school: { label: 'Di Sekolah / Pondok', short: 'Sekolah', icon: School, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  home: { label: 'Di Rumah Bersama Keluarga', short: 'Rumah', icon: Home, color: 'bg-violet-50 text-violet-700 border-violet-200' },
  any: { label: 'Di Mana Saja (Bebas)', short: 'Fleksibel', icon: Sparkles, color: 'bg-slate-50 text-slate-700 border-slate-200' },
}

const PERIOD_LABELS = {
  regular: { label: 'Semester Reguler', icon: Calendar, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
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
      {/* HERO HEADER MODERN TAILGRIDS */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/20 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="h-3 w-3" /> Mutaba'ah Terpadu
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {options.academic_years?.find((x) => x.is_active)?.name ? `Tahun Ajaran ${options.academic_years.find((x) => x.is_active).name}` : 'Tahun Ajaran Aktif'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Program & Penilaian Ibadah Siswa
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Atur operasional Full Day, Pesantren, periode Ramadan, serta pembagian tanggung jawab input sekolah dan rumah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              title="Perbarui Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/20 bg-white p-4 shadow-sm dark:border-emerald-600/25 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Aturan Tanggung Jawab</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ListChecks className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {stats.rulesCount} <span className="text-xs font-medium text-slate-500">Aturan</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Matriks input sekolah & rumah</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500/20 bg-white p-4 shadow-sm dark:border-blue-600/25 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Input Sekolah & Musyrif</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <School className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700 dark:text-blue-400">
            {stats.schoolRules} <span className="text-xs font-medium text-slate-500">Amalan</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Dzuhur, Ashar, Dhuha, Pondok</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/20 bg-white p-4 shadow-sm dark:border-purple-600/25 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Input Orang Tua / Wali</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Home className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700 dark:text-purple-400">
            {stats.homeRules} <span className="text-xs font-medium text-slate-500">Amalan</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Subuh, Maghrib, Isya, Adab</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/20 bg-white p-4 shadow-sm dark:border-amber-600/25 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Program & Periode</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <CalendarDays className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700 dark:text-amber-400">
            {stats.programsCount} <span className="text-xs font-medium text-slate-500">Unit · {stats.periodsCount} Periode</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Reguler & Semarak Ramadan</p>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
            activeTab === 'rules'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/20'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <ListChecks className="h-4 w-4" />
          <span>1. Tanggung Jawab Pencatatan (Sekolah vs Rumah)</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === 'rules' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
            {data.rules?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('programs')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
            activeTab === 'programs'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/20'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>2. Program Operasional Unit (Full Day vs Pesantren)</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === 'programs' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
            {data.programs?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('periods')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
            activeTab === 'periods'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/20'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <Moon className="h-4 w-4" />
          <span>3. Periode Penilaian (Reguler & Ramadan)</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === 'periods' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
            {data.periods?.length || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: ATURAN TANGGUNG JAWAB INPUT */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Header & Filter Bar */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Matriks Pembagian Tugas Pencatatan Ibadah
                </h3>
                <p className="text-xs text-slate-500">
                  Menentukan siapa yang berhak mencatat amalan dan di mana lokasinya untuk mencegah pemalsuan data mutaba'ah.
                </p>
              </div>

              <button
                onClick={() => setIsRuleModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-900/20 hover:opacity-95 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Aturan Input</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-4 bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama amalan..."
                  value={searchRule}
                  onChange={(e) => setSearchRule(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <select
                value={filterProgramType}
                onChange={(e) => setFilterProgramType(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Semua Program Sekolah</option>
                <option value="fullday">Full Day School</option>
                <option value="boarding">Pesantren / Boarding</option>
                <option value="regular">Reguler</option>
                <option value="tahfizh">Tahfizh</option>
              </select>

              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Semua Pencatat</option>
                <option value="school">Sekolah / Guru</option>
                <option value="parent">Orang Tua / Wali</option>
                <option value="supervisor">Musyrif Asrama</option>
                <option value="either">Orang Tua / Siswa</option>
              </select>

              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Semua Lokasi</option>
                <option value="school">Di Sekolah / Asrama</option>
                <option value="home">Di Rumah Bersama Ortu</option>
                <option value="any">Bebas / Di Mana Saja</option>
              </select>
            </div>

            {/* Emerald Datatable */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:border-emerald-900/60 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Aktivitas / Amalan Ibadah</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Program Sekolah</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Pencatat (Tanggung Jawab)</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Lokasi Pelaksanaan</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Konteks / Periode</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Perlu Validasi Guru</th>
                    <th className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-200">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
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
                        <tr key={rule.id} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition">
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
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-black ${prog.color}`}>
                              {prog.short}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${src.color}`}>
                              <SourceIcon className="h-3 w-3" />
                              <span>{src.short}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                              <LocIcon className="h-3.5 w-3.5 text-slate-400" />
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
                              <span className="text-slate-400 text-[11px]">Harian Reguler</span>
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
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Program Operasional Unit Pendidikan & Jam Efektif
                </h3>
                <p className="text-xs text-slate-500">
                  Konfigurasi hari aktif sekolah untuk memisahkan jadwal Full Day (Senin-Jumat) dan Pesantren Asrama (Senin-Sabtu/Minggu).
                </p>
              </div>

              <button
                onClick={() => setIsProgramModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-900/20 hover:opacity-95 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Program Unit</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:border-emerald-900/60 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Unit Pendidikan</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Cakupan Kelas</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Jenis Program</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Hari Aktif Sekolah</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Keterangan Jam</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Status</th>
                    <th className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-200">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(data.programs || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Belum ada program unit yang dikonfigurasi.
                      </td>
                    </tr>
                  ) : (
                    (data.programs || []).map((prog) => {
                      const meta = prog.metadata || {}
                      const pType = PROGRAM_LABELS[prog.program_type] || PROGRAM_LABELS.fullday
                      const weekdays = prog.school_weekdays || [1, 2, 3, 4, 5]

                      return (
                        <tr key={prog.id} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-emerald-600" />
                              <span>{prog.education_unit?.name || 'Seluruh Unit'}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {prog.kelas?.nama_kelas ? (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold dark:bg-slate-800">
                                {prog.kelas.nama_kelas}
                              </span>
                            ) : (
                              <span className="text-slate-400">Semua Rombel</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-black ${pType.color}`}>
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
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                      isActive
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

                          <td className="px-4 py-3 text-slate-500 text-[11px]">
                            {meta.jam_belajar || (prog.program_type === 'boarding' ? '24 Jam Asrama' : '07.00 - 16.00 WIB')}
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
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
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Daftar Periode Penilaian & Kalender Khusus Ibadah
                </h3>
                <p className="text-xs text-slate-500">
                  Periode bertanggal untuk mengaktifkan amalan khusus Ramadan (Tarawih, Puasa, Tadarus) yang mengalahkan aturan reguler.
                </p>
              </div>

              <button
                onClick={() => setIsPeriodModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-900/20 hover:opacity-95 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Periode Ibadah</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:border-emerald-900/60 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Nama Periode</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Jenis Periode</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Cakupan Unit</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Rentang Tanggal</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Template Terhubung</th>
                    <th className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Prioritas</th>
                    <th className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-200">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(data.periods || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Belum ada periode penilaian ibadah yang didaftarkan.
                      </td>
                    </tr>
                  ) : (
                    (data.periods || []).map((period) => {
                      const isRamadan = period.period_type === 'ramadan'
                      return (
                        <tr key={period.id} className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-black text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isRamadan ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
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
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${isRamadan ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                              {isRamadan ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                              <span>{isRamadan ? 'Bulan Ramadan' : 'Reguler'}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {period.education_unit?.name || 'Global (Semua Unit)'}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
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
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-white p-6 shadow-2xl dark:border-emerald-600/40 dark:bg-slate-900 animate-scaleUp">
            <div className="mb-5 flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-900/20">
                  <ListChecks className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Tambah Aturan Tanggung Jawab Input</h3>
                  <p className="text-xs text-slate-500">Tentukan siapa yang mencatat dan di mana lokasinya</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Aktivitas / Amalan Ibadah *</label>
                <select
                  required
                  value={ruleForm.agenda_item_id}
                  onChange={(e) => setRuleForm({ ...ruleForm, agenda_item_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">-- Pilih Amalan Ibadah --</option>
                  {(options.agenda_items || []).map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} ({x.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Program Sekolah *</label>
                  <select
                    value={ruleForm.program_type}
                    onChange={(e) => setRuleForm({ ...ruleForm, program_type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="fullday">Full Day School</option>
                    <option value="boarding">Pesantren / Boarding</option>
                    <option value="regular">Reguler</option>
                    <option value="tahfizh">Tahfizh</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Periode Khusus (Opsional)</label>
                  <select
                    value={ruleForm.assessment_period_id}
                    onChange={(e) => setRuleForm({ ...ruleForm, assessment_period_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="">Aturan Reguler Harian</option>
                    {(data.periods || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Pencatat (Tanggung Jawab) *</label>
                  <select
                    value={ruleForm.input_source}
                    onChange={(e) => setRuleForm({ ...ruleForm, input_source: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="school">Sekolah / Guru (Di Kelas)</option>
                    <option value="parent">Orang Tua / Wali (Di Rumah)</option>
                    <option value="supervisor">Musyrif / Asrama (Pondok)</option>
                    <option value="either">Orang Tua / Siswa</option>
                    <option value="student">Siswa Mandiri</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Lokasi Pelaksanaan *</label>
                  <select
                    value={ruleForm.location}
                    onChange={(e) => setRuleForm({ ...ruleForm, location: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="school">Di Sekolah / Pondok</option>
                    <option value="home">Di Rumah Bersama Keluarga</option>
                    <option value="any">Di Mana Saja (Bebas)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
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

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-2.5 font-black text-white hover:opacity-95 shadow-md shadow-emerald-900/20 disabled:opacity-50"
                >
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH PROGRAM UNIT */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-white p-6 shadow-2xl dark:border-emerald-600/40 dark:bg-slate-900 animate-scaleUp">
            <div className="mb-5 flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-900/20">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Tambah Program Operasional Unit</h3>
                  <p className="text-xs text-slate-500">Konfigurasi Full Day vs Pesantren dan hari sekolah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProgramModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Unit Pendidikan *</label>
                <select
                  required
                  value={programForm.education_unit_id}
                  onChange={(e) => setProgramForm({ ...programForm, education_unit_id: e.target.value, class_id: '' })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                >
                  {(options.units || []).map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Kelas / Rombel (Opsional)</label>
                  <select
                    value={programForm.class_id}
                    onChange={(e) => setProgramForm({ ...programForm, class_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="">Seluruh Rombel Unit</option>
                    {(options.classes || [])
                      .filter((x) => x.unit_pendidikan_id === programForm.education_unit_id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama_kelas}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Program *</label>
                  <select
                    value={programForm.program_type}
                    onChange={(e) => setProgramForm({ ...programForm, program_type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="fullday">Full Day School</option>
                    <option value="boarding">Pesantren / Boarding</option>
                    <option value="regular">Reguler</option>
                    <option value="tahfizh">Program Khusus Tahfizh</option>
                  </select>
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
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          isChecked
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || programForm.school_weekdays.length === 0}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-2.5 font-black text-white hover:opacity-95 shadow-md shadow-emerald-900/20 disabled:opacity-50"
                >
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH PERIODE PENILAIAN */}
      {isPeriodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-white p-6 shadow-2xl dark:border-emerald-600/40 dark:bg-slate-900 animate-scaleUp">
            <div className="mb-5 flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-900/20">
                  <Moon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Tambah Periode Penilaian Ibadah</h3>
                  <p className="text-xs text-slate-500">Atur kalender semester reguler atau periode khusus Ramadan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPeriodModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePeriod} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Periode *</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Periode Semarak Ramadan 1448 H"
                  value={periodForm.name}
                  onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Periode *</label>
                  <select
                    value={periodForm.period_type}
                    onChange={(e) => setPeriodForm({ ...periodForm, period_type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="ramadan">Bulan Suci Ramadan</option>
                    <option value="regular">Semester Reguler</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Cakupan Unit *</label>
                  <select
                    value={periodForm.scope}
                    onChange={(e) => setPeriodForm({ ...periodForm, scope: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="global">Global (Semua Unit)</option>
                    <option value="unit">Per Unit Tertentu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Mulai *</label>
                  <input
                    required
                    type="date"
                    value={periodForm.start_date}
                    onChange={(e) => setPeriodForm({ ...periodForm, start_date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Selesai *</label>
                  <input
                    required
                    type="date"
                    value={periodForm.end_date}
                    onChange={(e) => setPeriodForm({ ...periodForm, end_date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Template Mutaba'ah (Opsional)</label>
                <select
                  value={periodForm.template_id}
                  onChange={(e) => setPeriodForm({ ...periodForm, template_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">Gunakan template aktif unit</option>
                  {(options.templates || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPeriodModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-2.5 font-black text-white hover:opacity-95 shadow-md shadow-emerald-900/20 disabled:opacity-50"
                >
                  Simpan Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
