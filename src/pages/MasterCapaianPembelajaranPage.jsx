import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Plus,
  Search,
} from 'lucide-react'
import CsvImportModal from '../components/master-data/CsvImportModal'
import ActionDropdown from '../components/app/ActionDropdown'
import { capaianPembelajaranService } from '../services/capaianPembelajaranService'
import { educationUnitService } from '../services/educationUnitService'
import { tahunAjaranService } from '../services/tahunAjaranService'
import { masterKurikulumService } from '../services/masterKurikulumService'
import { subjectService } from '../services/subjectService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { useAuthStore } from '../stores/authStore'
import { Printer } from 'lucide-react'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataPage,
  MasterActionButton,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterFilterBar,
  MasterSearchInput,
  MasterFilterSelect,
  MasterDataTable,
  MasterStatusBadge,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

export const getUnitJenjang = (unit) => {
  if (!unit) return ''
  const level = String(unit.level || '').toUpperCase()
  const name = String(unit.name || '').toUpperCase()
  const code = String(unit.code || '').toUpperCase()
  const combined = `${level} ${name} ${code}`

  if (/TK|PAUD|TAUD|PLAYHOUSE|KB/i.test(combined)) return 'TK'
  if (/SD|MIT|MI |IBTIDAIYAH/i.test(combined)) return 'SD'
  if (/SMP|PONPES|PESANTREN|MTS|TSANAWIYAH/i.test(combined)) return 'SMP'
  if (/SMA|MAHAD|MA |ALIYAH|SMK/i.test(combined)) return 'SMA'
  return ''
}

export const FASE_OPTIONS_BY_JENJANG = {
  TK: [
    { value: 'Fase Fondasi', label: 'Fase Fondasi (PAUD / TK)' },
  ],
  SD: [
    { value: 'Fase A', label: 'Fase A (Kelas 1 - 2)' },
    { value: 'Fase B', label: 'Fase B (Kelas 3 - 4)' },
    { value: 'Fase C', label: 'Fase C (Kelas 5 - 6)' },
  ],
  SMP: [
    { value: 'Fase D', label: 'Fase D (Kelas 7 - 9)' },
  ],
  SMA: [
    { value: 'Fase E', label: 'Fase E (Kelas 10)' },
    { value: 'Fase F', label: 'Fase F (Kelas 11 - 12)' },
  ],
}

export const ALL_FASE_OPTIONS = [
  { value: 'Fase Fondasi', label: 'Fase Fondasi (PAUD / TK)' },
  { value: 'Fase A', label: 'Fase A (Kelas 1 - 2)' },
  { value: 'Fase B', label: 'Fase B (Kelas 3 - 4)' },
  { value: 'Fase C', label: 'Fase C (Kelas 5 - 6)' },
  { value: 'Fase D', label: 'Fase D (Kelas 7 - 9)' },
  { value: 'Fase E', label: 'Fase E (Kelas 10)' },
  { value: 'Fase F', label: 'Fase F (Kelas 11 - 12)' },
]

export const getDefaultFaseForJenjang = (jenjang) => {
  if (jenjang === 'TK') return { fase: 'Fase Fondasi', kelas_target: 'TK A' }
  if (jenjang === 'SD') return { fase: 'Fase A', kelas_target: 'Kelas 1' }
  if (jenjang === 'SMP') return { fase: 'Fase D', kelas_target: 'Kelas 7' }
  if (jenjang === 'SMA') return { fase: 'Fase E', kelas_target: 'Kelas 10' }
  return { fase: 'Fase A', kelas_target: 'Kelas 1' }
}

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald' }) {
  const tones = {
    emerald: {
      card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
      title: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-500',
      val: 'text-emerald-600 dark:text-emerald-300',
      sub: 'text-emerald-600/70 dark:text-emerald-400/70',
    },
    blue: {
      card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
    amber: {
      card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
      val: 'text-amber-600 dark:text-amber-300',
      sub: 'text-amber-600/70 dark:text-amber-400/70',
    },
  }
  const t = tones[tone] || tones.emerald
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md cursor-default group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
        <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-3xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

export default function MasterCapaianPembelajaranPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const [dataCp, setDataCp] = useState([])
  const [units, setUnits] = useState([])
  const [tahunAjarans, setTahunAjarans] = useState([])
  const [kurikulums, setKurikulums] = useState([])
  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState({
    total_cp: 0,
    total_cp_aktif: 0,
    total_cp_nonaktif: 0,
  })

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedTahun, setSelectedTahun] = useState('')
  const [selectedKurikulum, setSelectedKurikulum] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const handleExportCSV = () => {
    if (!dataCp || dataCp.length === 0) {
      alert('Tidak ada data Capaian Pembelajaran untuk diekspor.')
      return
    }
    const headers = ['NO', 'KODE CP', 'NAMA CP', 'FASE & KELAS', 'MATA PELAJARAN', 'STATUS']
    let csvStr = headers.join(',') + '\n'
    dataCp.forEach((row, i) => {
      const line = [
        i + 1,
        `"${row.kode_cp || ''}"`,
        `"${row.nama_cp || ''}"`,
        `"${row.fase || ''} (${row.kelas_target || ''})"`,
        `"${row.mata_pelajaran?.nama_mapel || row.mata_pelajaran?.name || '-'}"`,
        `"${row.status !== false ? 'Aktif' : 'Nonaktif'}"`,
      ].join(',')
      csvStr += line + '\n'
    })
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `export_capaian_pembelajaran_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah CP" onClick={() => handleOpenModal()} />
    </div>
  )

  // User Auth & Teacher Scoping
  const user = useAuthStore((state) => state.user)

  const userRoles = useMemo(() => {
    if (!user?.roles) return []
    return user.roles.map((r) => (typeof r === 'string' ? r : r.name || r.role_name || ''))
  }, [user])

  const isGuru = useMemo(() => {
    const rList = userRoles.map((r) => r.toLowerCase())
    const mainRole = String(user?.role || '').toLowerCase()
    return (
      rList.some((r) => r.includes('guru') || r.includes('wali_kelas') || r.includes('wali kelas')) ||
      mainRole.includes('guru')
    )
  }, [userRoles, user?.role])

  const teacherUnitIds = useMemo(() => {
    if (!user) return []
    const ids = []
    if (user.unit_id) ids.push(String(user.unit_id))
    if (user.unit_pendidikan_id) ids.push(String(user.unit_pendidikan_id))
    if (user.education_unit_id) ids.push(String(user.education_unit_id))
    if (user.unit?.id) ids.push(String(user.unit.id))
    if (user.school_info?.id) ids.push(String(user.school_info.id))
    if (Array.isArray(user.units)) {
      user.units.forEach((u) => ids.push(String(typeof u === 'object' ? u.id : u)))
    }
    if (Array.isArray(user.unit_ids)) {
      user.unit_ids.forEach((u) => ids.push(String(u)))
    }
    return Array.from(new Set(ids))
  }, [user])

  const teacherSubjectIds = useMemo(() => {
    if (!user) return []
    const ids = []
    const rawList =
      user.subject_ids ||
      user.subjects ||
      user.mata_pelajaran_ids ||
      user.mata_pelajaran ||
      user.teacher_subjects ||
      user.assigned_subjects ||
      []
    if (Array.isArray(rawList)) {
      rawList.forEach((s) => ids.push(String(typeof s === 'object' ? s.id : s)))
    }
    if (user.subject_id) ids.push(String(user.subject_id))
    if (user.mata_pelajaran_id) ids.push(String(user.mata_pelajaran_id))
    return Array.from(new Set(ids))
  }, [user])

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    unit_pendidikan_id: '',
    tahun_ajaran_id: '',
    kurikulum_id: '',
    mata_pelajaran_id: '',
    kode_cp: '',
    nama_cp: '',
    deskripsi: '',
    fase: 'Fase A',
    kelas_target: 'Kelas 1',
    urutan: 1,
    status: true,
  })

  const availableUnitsForModal = useMemo(() => {
    if (isGuru && teacherUnitIds.length > 0) {
      const filtered = units.filter((u) => teacherUnitIds.includes(String(u.id)))
      return filtered.length > 0 ? filtered : units
    }
    return units
  }, [isGuru, teacherUnitIds, units])

  const resolveKurikulumForUnit = (unitId) => {
    if (!unitId) return kurikulums
    const currentUnit = units.find((u) => String(u.id) === String(unitId))
    const jenjang = getUnitJenjang(currentUnit)

    const direct = kurikulums.filter(
      (k) => String(k.unit_pendidikan_id) === String(unitId) || String(k.unit_id) === String(unitId)
    )
    const byJenjang = kurikulums.filter((k) => {
      if (!jenjang) return false
      const kJ = String(k.jenjang || '').toUpperCase()
      if (kJ === jenjang) return true
      if (jenjang === 'SMP' && (kJ.includes('SMP') || kJ.includes('PESANTREN'))) return true
      if (jenjang === 'SMA' && (kJ.includes('SMA') || kJ.includes('PESANTREN'))) return true
      const kText = `${k.nama_kurikulum || ''} ${k.kode_kurikulum || ''}`.toUpperCase()
      return kText.includes(jenjang)
    })
    const seen = new Set()
    const result = []
    ;[...direct, ...byJenjang].forEach((item) => {
      if (!seen.has(String(item.id))) {
        seen.add(String(item.id))
        result.push(item)
      }
    })
    return result.length > 0 ? result : kurikulums
  }

  const resolveSubjectsForUnit = (unitId, kurId) => {
    let list = subjects
    const currentUnit = units.find((u) => String(u.id) === String(unitId))
    const jenjang = getUnitJenjang(currentUnit)

    if (unitId) {
      const unitSubs = list.filter((s) => String(s.unit_pendidikan_id) === String(unitId))
      if (unitSubs.length > 0) {
        list = unitSubs
      } else if (jenjang) {
        const jSubs = list.filter((s) => {
          const str = `${s.kode_mapel || ''} ${s.nama_mapel || ''} ${s.code || ''} ${s.name || ''}`.toUpperCase()
          return str.includes(jenjang)
        })
        if (jSubs.length > 0) list = jSubs
      }
    }

    if (kurId) {
      const kurSubs = list.filter((s) => !s.kurikulum_id || String(s.kurikulum_id) === String(kurId))
      if (kurSubs.length > 0) {
        list = kurSubs
      }
    }

    if (isGuru && teacherSubjectIds.length > 0) {
      const guruSubs = list.filter((s) => teacherSubjectIds.includes(String(s.id)))
      if (guruSubs.length > 0) list = guruSubs
    }

    return list.length > 0 ? list : subjects
  }

  const availableKurikulumsForModal = useMemo(() => {
    const targetUnit = formData.unit_pendidikan_id || (isGuru && teacherUnitIds.length > 0 ? teacherUnitIds[0] : '')
    return resolveKurikulumForUnit(targetUnit)
  }, [kurikulums, formData.unit_pendidikan_id, isGuru, teacherUnitIds, units])

  const availableSubjectsForModal = useMemo(() => {
    const targetUnit = formData.unit_pendidikan_id || (isGuru && teacherUnitIds.length > 0 ? teacherUnitIds[0] : '')
    return resolveSubjectsForUnit(targetUnit, formData.kurikulum_id)
  }, [subjects, formData.unit_pendidikan_id, formData.kurikulum_id, isGuru, teacherUnitIds, teacherSubjectIds, units])

  const availableFasesForModal = useMemo(() => {
    const targetUnit = formData.unit_pendidikan_id || (isGuru && teacherUnitIds.length > 0 ? teacherUnitIds[0] : '')
    const currentUnit = units.find((u) => String(u.id) === String(targetUnit))
    const targetJenjang = getUnitJenjang(currentUnit)
    if (targetJenjang && FASE_OPTIONS_BY_JENJANG[targetJenjang]) {
      return FASE_OPTIONS_BY_JENJANG[targetJenjang]
    }
    return ALL_FASE_OPTIONS
  }, [units, formData.unit_pendidikan_id, isGuru, teacherUnitIds])

  const loadDropdownMasterData = async () => {
    try {
      const [uRes, tRes, kRes, sRes, sStats] = await Promise.all([
        educationUnitService.getDaftar().catch(() => ({ data: [] })),
        tahunAjaranService.getDropdown().catch(() => []),
        masterKurikulumService.getDropdown().catch(() => []),
        subjectService.getDropdown().catch(() => ({ data: [] })),
        capaianPembelajaranService.getStats().catch(() => null),
      ])

      const extractList = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])

      setUnits(extractList(uRes))
      setTahunAjarans(extractList(tRes))
      setKurikulums(extractList(kRes))
      setSubjects(extractList(sRes))
      if (sStats) setStats(sStats)
    } catch (err) {
      console.error('Error loading dropdown masters:', err)
    }
  }

  const fetchDaftarCp = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await capaianPembelajaranService.getDaftar({
        page,
        search,
        unit_pendidikan_id: selectedUnit,
        tahun_ajaran_id: selectedTahun,
        kurikulum_id: selectedKurikulum,
        mata_pelajaran_id: selectedSubject,
        status: selectedStatus,
        per_page: 15,
      })
      if (response?.data) {
        setDataCp(response.data)
        if (response.meta) {
          setPagination({
            current_page: response.meta.current_page || 1,
            last_page: response.meta.last_page || 1,
            total: response.meta.total || 0,
            per_page: response.meta.per_page || 15,
          })
        }
      }
    } catch (err) {
      console.error('Error fetching CP data:', err)
      setErrorMsg('Gagal memuat data Capaian Pembelajaran. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDropdownMasterData()
  }, [])

  useEffect(() => {
    fetchDaftarCp()
  }, [page, search, selectedUnit, selectedTahun, selectedKurikulum, selectedSubject, selectedStatus])

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        unit_pendidikan_id: item.unit_pendidikan_id || '',
        tahun_ajaran_id: item.tahun_ajaran_id || '',
        kurikulum_id: item.kurikulum_id || '',
        mata_pelajaran_id: item.mata_pelajaran_id || '',
        kode_cp: item.kode_cp || '',
        nama_cp: item.nama_cp || '',
        deskripsi: item.deskripsi || '',
        fase: item.fase || 'Fase A',
        kelas_target: item.kelas_target || 'Kelas 1',
        urutan: item.urutan || 1,
        status: item.status !== undefined ? item.status : true,
      })
    } else {
      setEditingItem(null)
      const defaultUnit = isGuru && teacherUnitIds.length > 0
        ? teacherUnitIds[0]
        : (selectedUnit || (units.length > 0 ? units[0].id : ''))

      const currentUnit = units.find((u) => String(u.id) === String(defaultUnit))
      const jenjang = getUnitJenjang(currentUnit)
      const defaultFaseData = getDefaultFaseForJenjang(jenjang)

      const matchingKur = resolveKurikulumForUnit(defaultUnit)
      const defaultKur = selectedKurikulum && matchingKur.some((k) => String(k.id) === String(selectedKurikulum))
        ? selectedKurikulum
        : (matchingKur.length > 0 ? matchingKur[0].id : '')

      const matchingSub = resolveSubjectsForUnit(defaultUnit, defaultKur)
      const defaultSub = selectedSubject && matchingSub.some((s) => String(s.id) === String(selectedSubject))
        ? selectedSubject
        : (matchingSub.length > 0 ? matchingSub[0].id : (subjects.length > 0 ? subjects[0].id : ''))

      const defaultTahun = selectedTahun || (tahunAjarans.length > 0 ? tahunAjarans[0].id : '')

      setFormData({
        unit_pendidikan_id: defaultUnit,
        tahun_ajaran_id: defaultTahun,
        kurikulum_id: defaultKur,
        mata_pelajaran_id: defaultSub,
        kode_cp: `CP-MAPEL-${(pagination.total || dataCp.length) + 1}`,
        nama_cp: '',
        deskripsi: '',
        fase: defaultFaseData.fase,
        kelas_target: defaultFaseData.kelas_target,
        urutan: (pagination.total || dataCp.length) + 1,
        status: true,
      })
    }
    setModalOpen(true)
  }

  const handleUnitChangeInForm = (newUnitId) => {
    const currentUnit = units.find((u) => String(u.id) === String(newUnitId))
    const jenjang = getUnitJenjang(currentUnit)
    const defaultFaseData = getDefaultFaseForJenjang(jenjang)

    const matchingKur = resolveKurikulumForUnit(newUnitId)
    const newKurId = matchingKur.length > 0 ? matchingKur[0].id : ''

    const matchingSub = resolveSubjectsForUnit(newUnitId, newKurId)
    const newSubId = matchingSub.length > 0 ? matchingSub[0].id : ''

    setFormData((prev) => ({
      ...prev,
      unit_pendidikan_id: newUnitId,
      kurikulum_id: newKurId,
      mata_pelajaran_id: newSubId,
      fase: defaultFaseData.fase,
      kelas_target: defaultFaseData.kelas_target,
    }))
  }

  const handleKurikulumChangeInForm = (newKurId) => {
    const matchingSub = resolveSubjectsForUnit(formData.unit_pendidikan_id, newKurId)
    const currentSubValid = matchingSub.some((s) => String(s.id) === String(formData.mata_pelajaran_id))
    const newSubId = currentSubValid ? formData.mata_pelajaran_id : (matchingSub.length > 0 ? matchingSub[0].id : '')

    setFormData((prev) => ({
      ...prev,
      kurikulum_id: newKurId,
      mata_pelajaran_id: newSubId,
    }))
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    if (!formData.kurikulum_id) {
      setErrorMsg('Kurikulum harus dipilih.')
      return
    }
    if (!formData.mata_pelajaran_id) {
      setErrorMsg('Mata Pelajaran harus dipilih.')
      return
    }
    if (!formData.kode_cp.trim() || !formData.nama_cp.trim()) {
      setErrorMsg('Kode dan Nama Capaian Pembelajaran wajib diisi.')
      return
    }

    setFormSubmitting(true)
    setErrorMsg('')
    try {
      if (editingItem) {
        await capaianPembelajaranService.ubah({
          id: editingItem.id,
          payload: formData,
        })
        setSuccessMsg('Capaian Pembelajaran berhasil diperbarui!')
      } else {
        await capaianPembelajaranService.tambah(formData)
        setSuccessMsg('Capaian Pembelajaran berhasil ditambahkan!')
      }
      handleCloseModal()
      fetchDaftarCp()
      loadDropdownMasterData()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Error submitting CP form:', err)
      const msg = err.response?.data?.message || 'Gagal menyimpan data. Pastikan kolom diisi dengan benar.'
      setErrorMsg(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleHapus = async (id, kode) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Capaian Pembelajaran [${kode}]?`)) {
      return
    }
    try {
      await capaianPembelajaranService.hapus(id)
      setSuccessMsg(`Capaian Pembelajaran [${kode}] berhasil dihapus.`)
      fetchDaftarCp()
      loadDropdownMasterData()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Error deleting CP:', err)
      setErrorMsg('Gagal menghapus data Capaian Pembelajaran.')
    }
  }

  const handleImport = async (rows) => {
    const failures = []
    let success = 0
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index]
      try {
        await capaianPembelajaranService.tambah({
          unit_pendidikan_id: row.unit_pendidikan_id,
          tahun_ajaran_id: row.tahun_ajaran_id,
          kurikulum_id: row.kurikulum_id,
          mata_pelajaran_id: row.mata_pelajaran_id,
          kode_cp: row.kode_cp,
          nama_cp: row.nama_cp,
          deskripsi: row.deskripsi || '',
          fase: row.fase || 'Fase A',
          kelas_target: row.kelas_target || 'Kelas 1',
          urutan: Number(row.urutan || index + 1),
          status: !['0', 'false', 'nonaktif'].includes(String(row.status).toLowerCase()),
        })
        success += 1
      } catch (error) { failures.push(`baris ${index + 2}: ${error.response?.data?.message || 'gagal'}`) }
    }
    await fetchDaftarCp(); await loadDropdownMasterData()
    setSuccessMsg(`${success} CP berhasil diimpor${failures.length ? `, ${failures.length} gagal (${failures.slice(0, 3).join('; ')})` : '.'}`)
  }

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Capaian Pembelajaran' }]} />
      )}
      <MasterDataPage
        className="education-unit-page cp-master-page"
        hideBreadcrumb={embedded || hideBreadcrumb}
      >
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Capaian Pembelajaran (CP)"
        onPrint={() => {
          const rowsToPrint = Array.isArray(dataCp) ? dataCp : []
          printCleanTable({
            title: 'Laporan Data Capaian Pembelajaran (CP)',
            subtitle: 'Daftar Capaian Pembelajaran Sekolah Islam Terpadu',
            headers: ['NO', 'KODE CP', 'NAMA CAPAIAN PEMBELAJARAN', 'FASE / KELAS', 'MATA PELAJARAN', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              row.kode_cp || '-',
              row.nama_cp || '-',
              `${row.fase || '-'} (${row.kelas_target || '-'})`,
              row.mata_pelajaran?.nama_mapel || row.mata_pelajaran?.name || '-',
              row.status !== false ? 'Aktif' : 'Nonaktif',
            ]),
          })
        }}
        onDownload={() => {
          const rowsToPrint = Array.isArray(dataCp) ? dataCp : []
          downloadPdfTable({
            title: 'Laporan Data Capaian Pembelajaran (CP)',
            subtitle: 'Daftar Capaian Pembelajaran Sekolah Islam Terpadu',
            headers: ['NO', 'KODE CP', 'NAMA CAPAIAN PEMBELAJARAN', 'FASE / KELAS', 'MATA PELAJARAN', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              row.kode_cp || '-',
              row.nama_cp || '-',
              `${row.fase || '-'} (${row.kelas_target || '-'})`,
              row.mata_pelajaran?.nama_mapel || row.mata_pelajaran?.name || '-',
              row.status !== false ? 'Aktif' : 'Nonaktif',
            ]),
            filename: 'laporan_capaian_pembelajaran.pdf',
          })
        }}
      />
      {/* Hero Banner */}
      {!hidePageHeader && (
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 mb-6">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <BookOpen className="size-6 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      Capaian Pembelajaran
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Master Capaian Pembelajaran (CP)
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                    Kelola CP berbasis Kurikulum, Unit Pendidikan, dan Mapel sebagai fondasi utama TP &amp; Modul Ajar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} title="Capaian Pembelajaran" onImport={handleImport} columns={[
        { key: 'unit_pendidikan_id' }, { key: 'tahun_ajaran_id' }, { key: 'kurikulum_id', required: true }, { key: 'mata_pelajaran_id', required: true },
        { key: 'kode_cp', required: true, example: 'CP-MTK-01' }, { key: 'nama_cp', required: true, example: 'Bilangan' }, { key: 'deskripsi' }, { key: 'fase', example: 'Fase A' }, { key: 'kelas_target', example: 'Kelas 1' }, { key: 'urutan', example: '1' }, { key: 'status', example: '1' },
      ]} />

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiTintedCard icon={BookOpen} label="Total Capaian Pembelajaran" value={stats.total_cp ?? 0} subtext="Terdaftar di sistem" tone="emerald" />
        <KpiTintedCard icon={CheckCircle} label="CP Status Aktif" value={stats.total_cp_aktif ?? 0} subtext="Siap digunakan" tone="blue" />
        <KpiTintedCard icon={AlertCircle} label="CP Nonaktif" value={stats.total_cp_nonaktif ?? 0} subtext="Arsip / Nonaktif" tone="amber" />
      </motion.div>

      {/* Tab Navigation Card (below KPI grid, above filter) */}
      {tabNav && (
        <motion.div variants={itemVariants}>
          {typeof tabNav === 'function' ? tabNav() : tabNav}
        </motion.div>
      )}

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span className="text-sm font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar (2-Row Layout) */}
      <motion.div variants={itemVariants} className="rounded-[18px] border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-700/80 dark:bg-[#1B2433] space-y-3.5">
        {/* Baris 1: Field Pencarian Full-Width */}
        <div className="w-full">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode CP, nama capaian pembelajaran, atau deskripsi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-700 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            />
          </div>
        </div>

        {/* Baris 2: Dropdown Filter & Sortir */}
        <div className="flex flex-wrap items-center gap-2.5 w-full">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
            Filter & Sortir:
          </span>

          <select
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Unit --</option>
            {units.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name || item.code}
              </option>
            ))}
          </select>

          <select
            value={selectedTahun}
            onChange={(e) => {
              setSelectedTahun(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Tahun Ajaran --</option>
            {tahunAjarans.map((item) => (
              <option key={item.id} value={item.id}>
                {item.tahun || item.name}
              </option>
            ))}
          </select>

          <select
            value={selectedKurikulum}
            onChange={(e) => {
              setSelectedKurikulum(e.target.value)
              setSelectedSubject('')
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Kurikulum --</option>
            {kurikulums.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama_kurikulum || item.kode_kurikulum}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Mapel --</option>
            {subjects
              .filter((item) => {
                if (selectedUnit && item.unit_pendidikan_id && String(item.unit_pendidikan_id) !== String(selectedUnit)) {
                  return false
                }
                if (selectedKurikulum && item.kurikulum_id && String(item.kurikulum_id) !== String(selectedKurikulum)) {
                  return false
                }
                return true
              })
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_mapel || item.name}
                </option>
              ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Status --</option>
            <option value="aktif">Aktif</option>
            <option value="tidak_aktif">Nonaktif</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('')
              setSelectedUnit('')
              setSelectedTahun('')
              setSelectedKurikulum('')
              setSelectedSubject('')
              setSelectedStatus('')
              setPage(1)
            }}
            className="inline-flex items-center gap-1.5 px-4 h-12 rounded-[14px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Reset Filter"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]" aria-labelledby="cp-table-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
          <div>
            <h2 id="cp-table-title" className="text-base font-extrabold text-slate-900 dark:text-white">Data Capaian Pembelajaran</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">Data sesuai filter dan kewenangan pengguna.</p>
          </div>
          {pageActions}
        </div>

      {/* Main Table */}
      <MasterDataTable className="!rounded-none !border-0 !shadow-none">
          <table className="w-full table-fixed text-left text-sm border-collapse">
            <thead className="bg-[#F8FAFB] dark:bg-[#202B3A] border-b border-[#EDF0F4] dark:border-[#354153]">
              <tr>
                <th className="w-[8%] bg-[#F8FAFB] dark:bg-[#202B3A] px-5 sm:px-6 md:px-8 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Urutan</th>
                <th className="w-[14%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Kode CP</th>
                <th className="w-[32%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Nama & Deskripsi CP</th>
                <th className="hidden w-[20%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Kurikulum & Mapel</th>
                <th className="hidden w-[12%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider lg:table-cell">Fase / Kelas</th>
                <th className="hidden w-[10%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Status</th>
                <th className="w-[16%] bg-[#F8FAFB] dark:bg-[#202B3A] px-5 sm:px-6 md:px-8 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0E5C44]" />
                    Memuat data Capaian Pembelajaran...
                  </td>
                </tr>
              ) : dataCp.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    Belum ada data Capaian Pembelajaran yang ditemukan.
                  </td>
                </tr>
              ) : (
                dataCp.map((item) => (
                  <tr key={item.id} className="group border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-all duration-200 cursor-pointer">
                    <td className="py-4 px-5 sm:px-6 md:px-8 text-center font-bold text-slate-500 dark:text-slate-400">
                      #{item.urutan}
                    </td>

                    <td className="py-4 px-5 font-mono font-bold text-xs text-[#0E5C44] dark:text-[#3FBF75]">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                        {item.kode_cp}
                      </span>
                    </td>

                    <td className="py-4 px-5 max-w-md">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{item.nama_cp}</div>
                      {item.deskripsi && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {item.deskripsi}
                        </p>
                      )}
                    </td>

                    <td className="hidden px-3 py-4 md:table-cell">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {item.subject?.nama_mapel || item.subject?.name || '-'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.kurikulum?.nama_kurikulum || 'Tanpa Kurikulum'}
                      </div>
                    </td>

                    <td className="hidden px-3 py-4 text-center lg:table-cell">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        {item.fase || '-'} ({item.kelas_target || 'Semua'})
                      </span>
                    </td>

                    <td className="hidden px-3 py-4 text-center sm:table-cell">
                      <MasterStatusBadge active={item.status} />
                    </td>

                    <td className="py-4 px-5 sm:px-6 md:px-8 text-center">
                      <ActionDropdown
                        onEdit={() => handleOpenModal(item)}
                        onDelete={() => handleHapus(item.id, item.kode_cp)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        {pagination.last_page > 1 && (
          <div className="px-5 py-4 sm:px-6 md:px-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-500">
            <div>
              Menampilkan Halaman <span className="font-bold">{pagination.current_page}</span> dari{' '}
              <span className="font-bold">{pagination.last_page}</span> ({pagination.total} data total)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => Math.min(p + 1, pagination.last_page))}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </MasterDataTable>
      </section>
      </motion.div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0E5C44] to-[#1E8E5A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-emerald-200" />
                <h3 className="text-lg font-bold">
                  {editingItem ? 'Edit Capaian Pembelajaran' : 'Tambah Capaian Pembelajaran Baru'}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="text-emerald-100 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Unit Pendidikan
                  </label>
                  <select
                    value={formData.unit_pendidikan_id}
                    onChange={(e) => handleUnitChangeInForm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  >
                    <option value="">-- Pilih Unit --</option>
                    {availableUnitsForModal.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Tahun Ajaran
                  </label>
                  <select
                    value={formData.tahun_ajaran_id}
                    onChange={(e) => setFormData({ ...formData, tahun_ajaran_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  >
                    <option value="">-- Pilih Tahun Ajaran --</option>
                    {tahunAjarans.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tahun || t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Kurikulum <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.kurikulum_id}
                    onChange={(e) => handleKurikulumChangeInForm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                    required
                  >
                    <option value="">-- Pilih Kurikulum --</option>
                    {availableKurikulumsForModal.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kurikulum || k.kode_kurikulum} {k.jenjang ? `(${k.jenjang})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.mata_pelajaran_id}
                    onChange={(e) => setFormData({ ...formData, mata_pelajaran_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                    required
                  >
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {availableSubjectsForModal.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama_mapel || s.name} {s.kode_mapel || s.code ? `[${s.kode_mapel || s.code}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Kode CP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: CP-MTK-SD-01"
                    value={formData.kode_cp}
                    onChange={(e) => setFormData({ ...formData, kode_cp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Fase <span className="text-slate-400 font-normal">(Kurikulum)</span>
                  </label>
                  <select
                    value={formData.fase}
                    onChange={(e) => {
                      const newFase = e.target.value
                      let newKelas = formData.kelas_target
                      if (newFase === 'Fase Fondasi') newKelas = 'TK A'
                      else if (newFase === 'Fase A') newKelas = 'Kelas 1'
                      else if (newFase === 'Fase B') newKelas = 'Kelas 3'
                      else if (newFase === 'Fase C') newKelas = 'Kelas 5'
                      else if (newFase === 'Fase D') newKelas = 'Kelas 7'
                      else if (newFase === 'Fase E') newKelas = 'Kelas 10'
                      else if (newFase === 'Fase F') newKelas = 'Kelas 11'
                      setFormData({ ...formData, fase: newFase, kelas_target: newKelas })
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  >
                    {availableFasesForModal.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Kelas Target
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kelas 1, TK A"
                    value={formData.kelas_target}
                    onChange={(e) => setFormData({ ...formData, kelas_target: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Nama Capaian Pembelajaran (CP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama / ringkasan Capaian Pembelajaran..."
                  value={formData.nama_cp}
                  onChange={(e) => setFormData({ ...formData, nama_cp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Deskripsi Lengkap CP
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi uraian kompetensi elemen CP..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Urutan
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Status Aktivasi
                  </label>
                  <select
                    value={formData.status ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 bg-[#0E5C44] hover:bg-[#1E8E5A] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Simpan CP
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
    </MasterDataPage>
    </PageContainer>
  )
}
