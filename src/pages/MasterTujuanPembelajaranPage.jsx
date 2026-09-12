import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  BookOpen,
  Layers,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Upload,
  Plus,
} from 'lucide-react'
import CsvImportModal from '../components/master-data/CsvImportModal'
import ActionDropdown from '../components/app/ActionDropdown'
import { tujuanPembelajaranService } from '../services/tujuanPembelajaranService'
import { capaianPembelajaranService } from '../services/capaianPembelajaranService'
import { educationUnitService } from '../services/educationUnitService'
import { tahunAjaranService } from '../services/tahunAjaranService'
import { masterKurikulumService } from '../services/masterKurikulumService'
import { subjectService } from '../services/subjectService'
import { getUnitJenjang } from './MasterCapaianPembelajaranPage'
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
  MasterStatusBadge,
  MasterActionGroup,
  MasterActionIconButton,
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
    purple: {
      card: 'border-purple-100 bg-purple-50/50 hover:border-purple-200 dark:border-purple-950/50 dark:bg-purple-950/20',
      title: 'text-purple-700 dark:text-purple-400',
      icon: 'text-purple-500',
      val: 'text-purple-600 dark:text-purple-300',
      sub: 'text-purple-600/70 dark:text-purple-400/70',
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

export default function MasterTujuanPembelajaranPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const [dataTp, setDataTp] = useState([])
  const [stats, setStats] = useState({
    total_tp: 0,
    total_tp_aktif: 0,
    total_cp: 0,
    cp_ber_tp: 0,
  })

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const handleExportCSV = () => {
    if (!dataTp || dataTp.length === 0) {
      alert('Tidak ada data Tujuan Pembelajaran untuk diekspor.')
      return
    }
    const headers = ['NO', 'KODE TP', 'DESKRIPSI TUJUAN PEMBELAJARAN', 'CP INDUK', 'ALOKASI JP', 'STATUS']
    let csvStr = headers.join(',') + '\n'
    dataTp.forEach((row, i) => {
      const line = [
        i + 1,
        `"${row.kode_tp || ''}"`,
        `"${row.deskripsi_tp || ''}"`,
        `"${row.capaian_pembelajaran?.nama_cp || row.cp?.nama_cp || '-'}"`,
        `"${row.alokasi_waktu_jp || 0} JP"`,
        `"${row.status !== false ? 'Aktif' : 'Nonaktif'}"`,
      ].join(',')
      csvStr += line + '\n'
    })
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `export_tujuan_pembelajaran_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
      <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
      <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
      <SquircleActionButton variant="primary" label="Tambah TP" onClick={() => handleOpenModal()} />
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

  // Master options for dependent dropdown
  const [units, setUnits] = useState([])
  const [tahunAjarans, setTahunAjarans] = useState([])
  const [kurikulums, setKurikulums] = useState([])
  const [subjects, setSubjects] = useState([])
  const [cpOptions, setCpOptions] = useState([])
  const [loadingCp, setLoadingCp] = useState(false)

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [selectedCpFilter, setSelectedCpFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  // Modal State & Form Data
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    unit_pendidikan_id: '',
    tahun_ajaran_id: '',
    kurikulum_id: '',
    mata_pelajaran_id: '',
    cp_id: '',
    kode_tp: '',
    alokasi_waktu_jp: 2,
    deskripsi_tp: '',
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

  const loadInitialMasters = async () => {
    try {
      const [uRes, tRes, kRes, sRes, sStats] = await Promise.all([
        educationUnitService.getDaftar().catch(() => ({ data: [] })),
        tahunAjaranService.getDropdown().catch(() => []),
        masterKurikulumService.getDropdown().catch(() => []),
        subjectService.getDropdown().catch(() => ({ data: [] })),
        tujuanPembelajaranService.getStats().catch(() => null),
      ])

      const extractList = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])

      setUnits(extractList(uRes))
      setTahunAjarans(extractList(tRes))
      setKurikulums(extractList(kRes))
      setSubjects(extractList(sRes))
      if (sStats) setStats(sStats)
    } catch (err) {
      console.error('Error loading master data:', err)
    }
  }

  const fetchDaftarTp = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await tujuanPembelajaranService.getDaftar({
        page,
        search,
        cp_id: selectedCpFilter,
        status: selectedStatusFilter,
        per_page: 15,
      })
      if (response?.data) {
        setDataTp(response.data)
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
      console.error('Error fetching TP data:', err)
      setErrorMsg('Gagal memuat data Tujuan Pembelajaran. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialMasters()
  }, [])

  useEffect(() => {
    fetchDaftarTp()
  }, [page, search, selectedCpFilter, selectedStatusFilter])

  // Dependent Dropdown Trigger: ketika Unit, Tahun, Kurikulum, atau Mata Pelajaran berubah
  useEffect(() => {
    if (!modalOpen) return

    const fetchFilteredCpOptions = async () => {
      setLoadingCp(true)
      try {
        const result = await capaianPembelajaranService.getDropdown({
          unit_pendidikan_id: formData.unit_pendidikan_id,
          tahun_ajaran_id: formData.tahun_ajaran_id,
          kurikulum_id: formData.kurikulum_id,
          mata_pelajaran_id: formData.mata_pelajaran_id,
        })
        setCpOptions(result)

        // Reset CP selection if current selected CP is not in new list
        if (result.length > 0) {
          const exists = result.some((cp) => cp.id === formData.cp_id)
          if (!exists) {
            setFormData((prev) => ({ ...prev, cp_id: result[0].id }))
          }
        } else {
          setFormData((prev) => ({ ...prev, cp_id: '' }))
        }
      } catch (err) {
        console.error('Error fetching dependent CP dropdown:', err)
        setCpOptions([])
      } finally {
        setLoadingCp(false)
      }
    }

    fetchFilteredCpOptions()
  }, [
    modalOpen,
    formData.unit_pendidikan_id,
    formData.tahun_ajaran_id,
    formData.kurikulum_id,
    formData.mata_pelajaran_id,
  ])

  // Dynamic Auto Generate Kode TP Preview
  useEffect(() => {
    if (editingItem) return

    const mapelObj = subjects.find((s) => s.id === formData.mata_pelajaran_id)
    const unitObj = units.find((u) => u.id === formData.unit_pendidikan_id)

    const kodeMapel = mapelObj?.kode_mapel || mapelObj?.code || 'MTK'
    const kodeUnit = unitObj?.code || unitObj?.level || 'SD'
    const seq = String(dataTp.length + 1).padStart(3, '0')

    const autoKode = `TP-${kodeMapel.toUpperCase()}-${kodeUnit.toUpperCase()}-${seq}`
    setFormData((prev) => ({ ...prev, kode_tp: autoKode }))
  }, [formData.mata_pelajaran_id, formData.unit_pendidikan_id, editingItem, dataTp.length])

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      const cp = item.capaian_pembelajaran
      setFormData({
        unit_pendidikan_id: cp?.unit_pendidikan_id || (units[0]?.id ?? ''),
        tahun_ajaran_id: cp?.tahun_ajaran_id || (tahunAjarans[0]?.id ?? ''),
        kurikulum_id: cp?.kurikulum_id || (kurikulums[0]?.id ?? ''),
        mata_pelajaran_id: cp?.mata_pelajaran_id || (subjects[0]?.id ?? ''),
        cp_id: item.cp_id || '',
        kode_tp: item.kode_tp || '',
        alokasi_waktu_jp: item.alokasi_waktu_jp || 2,
        deskripsi_tp: item.deskripsi_tp || item.deskripsi || item.nama_tp || '',
        urutan: item.urutan || 1,
        status: item.status !== undefined ? item.status : true,
      })
    } else {
      setEditingItem(null)
      const defaultUnit = isGuru && teacherUnitIds.length > 0 ? teacherUnitIds[0] : (units[0]?.id ?? '')
      const defaultTahun = tahunAjarans[0]?.id ?? ''
      const matchingKur = resolveKurikulumForUnit(defaultUnit)
      const defaultKur = matchingKur.length > 0 ? matchingKur[0].id : (kurikulums[0]?.id ?? '')
      const matchingSub = resolveSubjectsForUnit(defaultUnit, defaultKur)
      const defaultMapel = matchingSub.length > 0 ? matchingSub[0].id : (subjects[0]?.id ?? '')

      setFormData({
        unit_pendidikan_id: defaultUnit,
        tahun_ajaran_id: defaultTahun,
        kurikulum_id: defaultKur,
        mata_pelajaran_id: defaultMapel,
        cp_id: '',
        kode_tp: '',
        alokasi_waktu_jp: 2,
        deskripsi_tp: '',
        urutan: dataTp.length + 1,
        status: true,
      })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    if (!formData.cp_id) {
      setErrorMsg('Capaian Pembelajaran (CP) harus dipilih dari database.')
      return
    }
    if (!formData.deskripsi_tp.trim()) {
      setErrorMsg('Deskripsi Tujuan Pembelajaran (TP) tidak boleh kosong.')
      return
    }

    setFormSubmitting(true)
    setErrorMsg('')
    try {
      if (editingItem) {
        await tujuanPembelajaranService.ubah({
          id: editingItem.id,
          payload: formData,
        })
        setSuccessMsg('Tujuan Pembelajaran berhasil diperbarui!')
      } else {
        await tujuanPembelajaranService.tambah(formData)
        setSuccessMsg('Tujuan Pembelajaran berhasil ditambahkan dengan Kode TP otomatis!')
      }
      handleCloseModal()
      fetchDaftarTp()
      loadInitialMasters()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Error submitting form:', err)
      const msg = err.response?.data?.message || 'Gagal menyimpan TP. Pastikan CP terpilih dan aktif.'
      setErrorMsg(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleHapus = async (id, kode) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Tujuan Pembelajaran [${kode}]?`)) {
      return
    }
    try {
      await tujuanPembelajaranService.hapus(id)
      setSuccessMsg(`Tujuan Pembelajaran [${kode}] berhasil dihapus.`)
      fetchDaftarTp()
      loadInitialMasters()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Error deleting TP:', err)
      setErrorMsg('Gagal menghapus data.')
    }
  }

  const handleImport = async (rows) => {
    const failures = []
    let success = 0
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index]
      try {
        await tujuanPembelajaranService.tambah({
          unit_pendidikan_id: row.unit_pendidikan_id,
          tahun_ajaran_id: row.tahun_ajaran_id,
          kurikulum_id: row.kurikulum_id,
          mata_pelajaran_id: row.mata_pelajaran_id,
          cp_id: row.cp_id,
          kode_tp: row.kode_tp,
          deskripsi_tp: row.deskripsi_tp,
          alokasi_waktu_jp: Number(row.alokasi_waktu_jp || 2),
          urutan: Number(row.urutan || index + 1),
          status: !['0', 'false', 'nonaktif'].includes(String(row.status).toLowerCase()),
        })
        success += 1
      } catch (error) { failures.push(`baris ${index + 2}: ${error.response?.data?.message || 'gagal'}`) }
    }
    await fetchDaftarTp(); await loadInitialMasters()
    setSuccessMsg(`${success} TP berhasil diimpor${failures.length ? `, ${failures.length} gagal (${failures.slice(0, 3).join('; ')})` : '.'}`)
  }

  return (
    <PageContainer maxW="7xl">
      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Tujuan Pembelajaran' }]} />
      )}
      <MasterDataPage className="education-unit-page tp-master-page" hideBreadcrumb={embedded || hideBreadcrumb}>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Tujuan Pembelajaran (TP)"
        onPrint={() => {
          const rowsToPrint = Array.isArray(dataTp) ? dataTp : []
          printCleanTable({
            title: 'Laporan Data Tujuan Pembelajaran (TP)',
            subtitle: 'Daftar Tujuan Pembelajaran Sekolah Islam Terpadu',
            headers: ['NO', 'KODE TP', 'DESKRIPSI TUJUAN PEMBELAJARAN', 'CP INDUK', 'ALOKASI JP', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              row.kode_tp || '-',
              row.deskripsi_tp || '-',
              row.capaian_pembelajaran?.nama_cp || row.cp?.nama_cp || '-',
              `${row.alokasi_waktu_jp || 0} JP`,
              row.status !== false ? 'Aktif' : 'Nonaktif',
            ]),
          })
        }}
        onDownload={() => {
          const rowsToPrint = Array.isArray(dataTp) ? dataTp : []
          downloadPdfTable({
            title: 'Laporan Data Tujuan Pembelajaran (TP)',
            subtitle: 'Daftar Tujuan Pembelajaran Sekolah Islam Terpadu',
            headers: ['NO', 'KODE TP', 'DESKRIPSI TUJUAN PEMBELAJARAN', 'CP INDUK', 'ALOKASI JP', 'STATUS'],
            rows: rowsToPrint.map((row, i) => [
              i + 1,
              row.kode_tp || '-',
              row.deskripsi_tp || '-',
              row.capaian_pembelajaran?.nama_cp || row.cp?.nama_cp || '-',
              `${row.alokasi_waktu_jp || 0} JP`,
              row.status !== false ? 'Aktif' : 'Nonaktif',
            ]),
            filename: 'laporan_tujuan_pembelajaran.pdf',
          })
        }}
      />
      {/* Hero Section */}
      {!hidePageHeader && (
        <motion.div variants={itemVariants}>
        <MasterPageHeader
          tone="brand"
          icon={Target}
          title="Master Tujuan Pembelajaran (TP)"
          description="Kelola Tujuan Pembelajaran (TP) berbasis relasi bertingkat: Unit Pendidikan → Tahun Ajaran → Kurikulum → Mata Pelajaran → CP Database → TP → Modul Ajar."
          actions={pageActions}
        />
        </motion.div>
      )}

      <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} title="Tujuan Pembelajaran" onImport={handleImport} columns={[
        { key: 'unit_pendidikan_id' }, { key: 'tahun_ajaran_id' }, { key: 'kurikulum_id' }, { key: 'mata_pelajaran_id' }, { key: 'cp_id', required: true },
        { key: 'kode_tp', required: true, example: 'TP-MTK-01' }, { key: 'deskripsi_tp', required: true, example: 'Peserta didik mampu...' }, { key: 'alokasi_waktu_jp', example: '2' }, { key: 'urutan', example: '1' }, { key: 'status', example: '1' },
      ]} />

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTintedCard icon={Target} label="Total Tujuan Pembelajaran" value={stats.total_tp ?? 0} subtext="Terdaftar di sistem" tone="emerald" />
        <KpiTintedCard icon={CheckCircle} label="TP Status Aktif" value={stats.total_tp_aktif ?? 0} subtext="Berfungsi aktif" tone="blue" />
        <KpiTintedCard icon={BookOpen} label="Total CP Terikat" value={stats.total_cp ?? 0} subtext="Capaian Pembelajaran" tone="amber" />
        <KpiTintedCard icon={Layers} label="CP Memiliki TP" value={stats.cp_ber_tp ?? 0} subtext="Sudah dilengkapi TP" tone="purple" />
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
              placeholder="Cari kode TP, deskripsi tujuan pembelajaran, atau kata kunci..."
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
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value)
              setPage(1)
            }}
            className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          >
            <option value="">-- Semua Status --</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('')
              setSelectedCpFilter('')
              setSelectedStatusFilter('')
              setPage(1)
            }}
            className="inline-flex items-center gap-1.5 px-4 h-12 rounded-[14px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </motion.div>

      {/* Main Table */}
      <motion.div variants={itemVariants}>
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-5 py-4 sm:px-6 md:px-8 dark:border-emerald-800/40 dark:bg-gradient-to-r dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-transparent">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Data Tujuan Pembelajaran</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">Data sesuai filter dan kewenangan pengguna.</p>
          </div>
          {pageActions}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm border-collapse">
            <thead className="bg-[#F8FAFB] dark:bg-[#202B3A] border-b border-[#EDF0F4] dark:border-[#354153]">
              <tr>
                <th className="w-[8%] bg-[#F8FAFB] dark:bg-[#202B3A] px-5 sm:px-6 md:px-8 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Urutan</th>
                <th className="w-[15%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Kode TP</th>
                <th className="hidden w-[23%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Capaian Pembelajaran</th>
                <th className="w-[34%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Deskripsi TP</th>
                <th className="hidden w-[10%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider lg:table-cell">Alokasi</th>
                <th className="hidden w-[10%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Status</th>
                <th className="w-[16%] bg-[#F8FAFB] dark:bg-[#202B3A] px-5 sm:px-6 md:px-8 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0E5C44]" />
                    Memuat data Tujuan Pembelajaran...
                  </td>
                </tr>
              ) : dataTp.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    Belum ada data Tujuan Pembelajaran yang ditemukan.
                  </td>
                </tr>
              ) : (
                dataTp.map((item) => (
                  <tr key={item.id} className="group border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-all duration-200 cursor-pointer">
                    <td className="py-4 px-5 sm:px-6 md:px-8 text-center font-bold text-slate-500 dark:text-slate-400">
                      #{item.urutan}
                    </td>

                    <td className="py-4 px-5 font-mono font-bold text-xs text-[#0E5C44] dark:text-[#3FBF75]">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                        {item.kode_tp}
                      </span>
                    </td>

                    <td className="hidden px-3 py-4 md:table-cell">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {item.capaian_pembelajaran?.kode_cp || '-'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {item.capaian_pembelajaran?.nama_cp || 'Tanpa CP'}
                      </div>
                    </td>

                    <td className="py-4 px-5 max-w-md">
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {item.deskripsi_tp}
                      </p>
                    </td>

                    <td className="hidden px-3 py-4 text-center font-semibold lg:table-cell">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.alokasi_waktu_jp ?? 2} JP
                      </span>
                    </td>

                    <td className="hidden px-3 py-4 text-center sm:table-cell">
                      <MasterStatusBadge active={item.status} />
                    </td>

                    <td className="py-4 px-5 sm:px-6 md:px-8 text-center">
                      <ActionDropdown
                        onEdit={() => handleOpenModal(item)}
                        onDelete={() => handleHapus(item.id, item.kode_tp)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
      </div>
      </motion.div>

      {/* Modal Form TP - Mengikuti urutan persis yang dipersyaratkan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1B2433] w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0E5C44] to-[#1E8E5A] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-emerald-200" />
                <h3 className="text-lg font-bold">
                  {editingItem ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran Baru'}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="text-emerald-100 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {/* Field 1: Unit Pendidikan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  1. Unit Pendidikan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.unit_pendidikan_id}
                  onChange={(e) => setFormData({ ...formData, unit_pendidikan_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  required
                >
                  <option value="">-- Pilih Unit Pendidikan --</option>
                  {availableUnitsForModal.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Tahun Ajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  2. Tahun Ajaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.tahun_ajaran_id}
                  onChange={(e) => setFormData({ ...formData, tahun_ajaran_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  required
                >
                  <option value="">-- Pilih Tahun Ajaran --</option>
                  {tahunAjarans.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tahun || t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Kurikulum */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  3. Kurikulum <span className="text-rose-500">*</span>
                </label>
                  <select
                    value={formData.kurikulum_id}
                    onChange={(e) => setFormData({ ...formData, kurikulum_id: e.target.value })}
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

              {/* Field 4: Mata Pelajaran */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  4. Mata Pelajaran <span className="text-rose-500">*</span>
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

              {/* Field 5: Dropdown CP (Database, Dependent Dropdown) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>
                    5. Capaian Pembelajaran (CP) <span className="text-rose-500">*</span>
                  </span>
                  {loadingCp && <span className="text-emerald-600 text-[11px] font-normal animate-pulse">Memuat CP DB...</span>}
                </label>
                <select
                  value={formData.cp_id}
                  onChange={(e) => setFormData({ ...formData, cp_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  required
                >
                  <option value="">-- Pilih CP (Ambil Data DB Status Aktif) --</option>
                  {cpOptions.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      [{cp.kode_cp}] {cp.nama_cp}
                    </option>
                  ))}
                </select>
                {cpOptions.length === 0 && !loadingCp && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    * Belum ada CP Aktif di database untuk kriteria Unit/Tahun/Kurikulum/Mapel ini.
                  </p>
                )}
              </div>

              {/* Field 6: Kode TP (Auto Generate) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  6. Kode TP <span className="text-emerald-600 font-semibold">(Auto Generate)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.kode_tp}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-sm font-mono font-bold text-[#0E5C44] dark:text-[#3FBF75] cursor-not-allowed"
                />
              </div>

              {/* Field 7: Alokasi JP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  7. Alokasi Waktu (JP)
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.alokasi_waktu_jp}
                  onChange={(e) => setFormData({ ...formData, alokasi_waktu_jp: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                />
              </div>

              {/* Field 8: Deskripsi TP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  8. Deskripsi TP <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Masukkan uraian spesifik indikator Tujuan Pembelajaran..."
                  value={formData.deskripsi_tp}
                  onChange={(e) => setFormData({ ...formData, deskripsi_tp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C44] dark:text-slate-100"
                  required
                />
              </div>

              {/* Field 9 & 10: Urutan & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    9. Urutan
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
                    10. Status
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
                      Simpan TP
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
