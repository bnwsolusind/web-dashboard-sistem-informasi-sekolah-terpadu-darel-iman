import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  CheckSquare,
  FileText,
  ToggleLeft,
  GitCommit,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  Layers,
  Sparkles,
  Award,
  BookOpen,
  ChevronRight,
  ArrowRight,
  List,
} from 'lucide-react'
import { lmsBankSoalService } from '../services/lmsBankSoalService'
import { subjectService } from '../services/subjectService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import CsvImportModal from '../components/master-data/CsvImportModal'
import { RotateCcw, Printer } from 'lucide-react'
import Swal from 'sweetalert2'

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

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', onClick }) {
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
    purple: {
      card: 'border-purple-100 bg-purple-50/50 hover:border-purple-200 dark:border-purple-950/50 dark:bg-purple-950/20',
      title: 'text-purple-700 dark:text-purple-400',
      icon: 'text-purple-500',
      val: 'text-purple-600 dark:text-purple-300',
      sub: 'text-purple-600/70 dark:text-purple-400/70',
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
      onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} p-5 shadow-xs transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'} group`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${t.title}`}>{label}</p>
        <Icon className={`h-4 w-4 ${t.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1.5 text-[10px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

const getMapelName = (item) => {
  if (!item) return '-'
  const mp = item.kisi_kisi?.mata_pelajaran || item.mata_pelajaran || item.subject || item.kisi_kisi?.subject
  if (typeof mp === 'string') return mp
  if (typeof mp === 'object' && mp !== null) {
    return mp.name || mp.nama || mp.nama_mapel || mp.label || mp.kode_mapel || '-'
  }
  return '-'
}

export default function LmsBankSoalPage({ embedded, hidePageHeader, tabNav }) {
  const [searchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const activeUnit = useUnitStore((state) => state.activeUnit)

  const userUnitId = useMemo(() => {
    const candidateIds = [
      user?.unit_id,
      user?.unit_pendidikan_id,
      user?.education_unit_id,
      user?.unit?.id,
      user?.education_unit?.id,
      user?.unit_pendidikan?.id,
      user?.employee?.unit_id,
      user?.employee?.unit_pendidikan_id,
      user?.employee?.education_unit_id,
      user?.school_info?.id,
    ].filter(Boolean)
    return candidateIds.length > 0 ? String(candidateIds[0]) : null
  }, [user])

  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({
    total_soal: 0,
    total_pg: 0,
    total_esai: 0,
    total_benar_salah: 0,
    total_menjodohkan: 0,
    total_aktif: 0,
  })
  const [options, setOptions] = useState({
    kisi_kisi: [],
    tipe_soal: [],
    tingkat_kesulitan: [],
  })

  const [filters, setFilters] = useState({
    search: '',
    kisi_kisi_id: '',
    tipe_soal: '',
    tingkat_kesulitan: '',
    status: '',
  })

  // Print & Import State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const handleExportCSV = () => {
    if (!dataList.length) return
    const headers = ['ID', 'Pertanyaan', 'Tipe Soal', 'Tingkat Kesulitan', 'Status']
    const rows = dataList.map((item) => [
      item.id,
      `"${(item.pertanyaan || item.soal || '').replace(/<[^>]*>?/gm, '').replace(/"/g, '""')}"`,
      item.tipe_soal || 'pg',
      item.tingkat_kesulitan || 'sedang',
      item.status ? 'Aktif' : 'Nonaktif',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `bank_soal_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = (file) => {
    Swal.fire({
      icon: 'success',
      title: 'Import Massal Berhasil',
      text: `Berkas ${file.name} berisi daftar butir soal telah berhasil di-import ke Bank Soal.`,
      confirmButtonColor: '#0E5C44',
    })
    fetchData(1)
  }

  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Hover & Row Detail Modal State
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)

  // Modal Session Questions (Daftar Pertanyaan Terdaftar di Modal)
  const [modalSessionQuestions, setModalSessionQuestions] = useState([])
  const [editingModalQuestionId, setEditingModalQuestionId] = useState(null)
  const [loadingModalQuestions, setLoadingModalQuestions] = useState(false)

  // Pair state for Menjodohkan type
  const [matchingPairs, setMatchingPairs] = useState([
    { kiri: '', kanan: '' },
    { kiri: '', kanan: '' },
  ])

  const [formData, setFormData] = useState({
    kisi_kisi_id: '',
    mata_pelajaran_id: '',
    kode_soal: '',
    pertanyaan: '',
    tipe_soal: 'pg',
    opsi_a: '',
    opsi_b: '',
    opsi_c: '',
    opsi_d: '',
    opsi_e: '',
    kunci_jawaban: 'A',
    pembahasan: '',
    poin: 2.5,
    tingkat_kesulitan: 'sedang',
    indikator: '',
    status: true,
  })

  const selectedKisiObj = useMemo(() => {
    return (options.kisi_kisi || []).find((k) => k.id === formData.kisi_kisi_id)
  }, [options.kisi_kisi, formData.kisi_kisi_id])

  useEffect(() => {
    fetchStats()
    fetchOptions()
  }, [userUnitId, activeUnit])

  useEffect(() => {
    fetchData(1)
  }, [filters, userUnitId, activeUnit])

  useEffect(() => {
    const urlKisiId = searchParams.get('kisi_id')
    const sessionKisiId = sessionStorage.getItem('bankSoal_prefill_kisi_id')
    const targetKisiId = urlKisiId || sessionKisiId

    if (targetKisiId) {
      const targetMapelId = sessionStorage.getItem('bankSoal_prefill_mapel_id') || ''
      const targetJudul = sessionStorage.getItem('bankSoal_prefill_kisi_judul') || ''

      setFilters((prev) => ({
        ...prev,
        kisi_kisi_id: targetKisiId,
      }))

      handleOpenModal(null, {
        kisi_kisi_id: targetKisiId,
        mata_pelajaran_id: targetMapelId,
      })

      if (targetJudul) {
        showNotification(`Tambah butir soal untuk: ${targetJudul}`, 'info')
      }

      sessionStorage.removeItem('bankSoal_prefill_kisi_id')
      sessionStorage.removeItem('bankSoal_prefill_kisi_judul')
      sessionStorage.removeItem('bankSoal_prefill_mapel_id')
    }
  }, [searchParams])

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        per_page: 10,
        ...filters,
      }
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const response = await lmsBankSoalService.getDaftar(params)
      if (response && response.data) {
        let rawData = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        let filteredData = rawData.filter((item) => {
          if (!item) return false
          const itemUnitId = item.unit_pendidikan_id || item.unit_id || item.kisi_kisi?.unit_pendidikan_id || item.kisi_kisi?.mata_pelajaran?.unit_pendidikan_id || item.mata_pelajaran?.unit_pendidikan_id
          if (userUnitId && itemUnitId) return String(itemUnitId) === String(userUnitId)
          return true
        })
        setDataList(filteredData)
        setPagination({
          currentPage: response.meta?.current_page || 1,
          lastPage: response.meta?.last_page || 1,
          total: response.meta?.total || filteredData.length,
        })
      }
    } catch (error) {
      console.error('Error loading Bank Soal data:', error)
      showNotification('Gagal memuat data Bank Soal', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit
      const response = await lmsBankSoalService.getStats(params)
      if (response && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading Bank Soal stats:', error)
    }
  }

  const fetchOptions = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const [resOptions, resSubjects] = await Promise.allSettled([
        lmsBankSoalService.getOptions(params),
        subjectService.getDaftar({ ...params, status: 1, per_page: 100 }),
      ])

      let bankSoalOptions = resOptions.status === 'fulfilled' ? resOptions.value?.data || resOptions.value || {} : {}
      let dbSubjectsRaw = resSubjects.status === 'fulfilled' ? resSubjects.value?.data || resSubjects.value || [] : []
      if (Array.isArray(dbSubjectsRaw?.data)) dbSubjectsRaw = dbSubjectsRaw.data

      let dbSubjects = Array.isArray(dbSubjectsRaw) ? dbSubjectsRaw.filter((s) => {
        if (!s) return false
        const sUnitId = s.unit_pendidikan_id || s.unit_id || s.education_unit_id
        if (userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
        if (activeUnit && s.jenjang) return s.jenjang === activeUnit || s.jenjang === 'All'
        return true
      }) : []

      const kisiList = (bankSoalOptions.kisi_kisi || []).filter((k) => {
        if (!k) return false
        const kUnitId = k.unit_pendidikan_id || k.unit_id || k.mata_pelajaran?.unit_pendidikan_id
        if (userUnitId && kUnitId) return String(kUnitId) === String(userUnitId)
        return true
      })

      setOptions({
        ...bankSoalOptions,
        kisi_kisi: kisiList,
        subjects: dbSubjects.length > 0 ? dbSubjects : (bankSoalOptions.subjects || []).filter((s) => {
          const sUnitId = s.unit_pendidikan_id || s.unit_id
          if (userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
          return true
        }),
      })
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  const loadExistingQuestionsForKisi = async (kisiId) => {
    if (!kisiId) {
      setModalSessionQuestions([])
      return
    }
    setLoadingModalQuestions(true)
    try {
      const res = await lmsBankSoalService.getDaftar({
        kisi_kisi_id: kisiId,
        per_page: 100,
        order_by: 'created_at',
        order_dir: 'asc',
      })
      let items = []
      if (res && res.data) {
        items = Array.isArray(res.data) ? res.data : (res.data.data || [])
      }
      setModalSessionQuestions(items)
      // Otomatis sarankan kode_soal berikutnya jika form belum terisi
      setFormData((prev) => {
        if (!prev.kode_soal && !editingModalQuestionId && !editingItem) {
          const nextNum = items.length + 1
          return { ...prev, kode_soal: `SOAL-${String(nextNum).padStart(2, '0')}` }
        }
        return prev
      })
    } catch (err) {
      console.error('Error loading existing questions for modal:', err)
      setModalSessionQuestions([])
    } finally {
      setLoadingModalQuestions(false)
    }
  }

  const handleOpenModal = (item = null, prefill = null) => {
    if (item) {
      setEditingItem(item)
      let defaultKunci = item.kunci_jawaban || ''
      let pairs = [
        { kiri: '', kanan: '' },
        { kiri: '', kanan: '' },
      ]
      if (item.tipe_soal === 'menjodohkan' && Array.isArray(item.opsi_menjodohkan)) {
        pairs = item.opsi_menjodohkan.map((p) => ({
          kiri: p.kiri || '',
          kanan: p.kanan || '',
        }))
      }
      setMatchingPairs(pairs)

      setFormData({
        kisi_kisi_id: item.kisi_kisi_id || '',
        mata_pelajaran_id: item.mata_pelajaran_id || '',
        kode_soal: item.kode_soal || '',
        pertanyaan: item.pertanyaan || '',
        tipe_soal: item.tipe_soal || 'pg',
        opsi_a: item.opsi_a || '',
        opsi_b: item.opsi_b || '',
        opsi_c: item.opsi_c || '',
        opsi_d: item.opsi_d || '',
        opsi_e: item.opsi_e || '',
        kunci_jawaban: defaultKunci,
        pembahasan: item.pembahasan || '',
        poin: item.poin || 2.5,
        tingkat_kesulitan: item.tingkat_kesulitan || 'sedang',
        indikator: item.indikator || '',
        status: item.status !== undefined ? item.status : true,
      })

      if (item.kisi_kisi_id) {
        loadExistingQuestionsForKisi(item.kisi_kisi_id)
      } else {
        setModalSessionQuestions([])
      }
    } else {
      setEditingItem(null)
      setEditingModalQuestionId(null)
      const targetKisiId = prefill?.kisi_kisi_id || filters.kisi_kisi_id || (options.kisi_kisi.length > 0 ? options.kisi_kisi[0].id : '')
      const matchedKisi = options.kisi_kisi.find((k) => k.id === targetKisiId)
      const targetMapelId = prefill?.mata_pelajaran_id || matchedKisi?.mata_pelajaran_id || (options.kisi_kisi.length > 0 ? options.kisi_kisi[0].mata_pelajaran_id : '')

      setMatchingPairs([
        { kiri: '', kanan: '' },
        { kiri: '', kanan: '' },
      ])

      setFormData({
        kisi_kisi_id: targetKisiId,
        mata_pelajaran_id: targetMapelId,
        kode_soal: '',
        pertanyaan: '',
        tipe_soal: 'pg',
        opsi_a: '',
        opsi_b: '',
        opsi_c: '',
        opsi_d: '',
        opsi_e: '',
        kunci_jawaban: 'A',
        pembahasan: '',
        poin: 2.5,
        tingkat_kesulitan: 'sedang',
        indikator: '',
        status: true,
      })

      if (targetKisiId) {
        loadExistingQuestionsForKisi(targetKisiId)
      } else {
        setModalSessionQuestions([])
      }
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setEditingModalQuestionId(null)
    fetchData(1)
    fetchStats()
  }

  const resetSingleQuestionForm = () => {
    setEditingModalQuestionId(null)
    const nextNum = modalSessionQuestions.length + 1
    setFormData((prev) => ({
      ...prev,
      kode_soal: `SOAL-${String(nextNum).padStart(2, '0')}`,
      pertanyaan: '',
      tipe_soal: 'pg',
      opsi_a: '',
      opsi_b: '',
      opsi_c: '',
      opsi_d: '',
      opsi_e: '',
      kunci_jawaban: 'A',
      pembahasan: '',
      poin: 2.5,
      tingkat_kesulitan: 'sedang',
      indikator: '',
      status: true,
    }))
  }

  const handleTypeChange = (newType) => {
    let defaultKunci = ''
    if (newType === 'pg') defaultKunci = 'A'
    if (newType === 'benar_salah') defaultKunci = 'Benar'
    if (newType === 'esai') defaultKunci = ''
    if (newType === 'menjodohkan') defaultKunci = ''

    setFormData((prev) => ({
      ...prev,
      tipe_soal: newType,
      kunci_jawaban: defaultKunci,
    }))
  }

  const handleKisiChange = (kisiId) => {
    const selectedKisi = options.kisi_kisi.find((k) => k.id === kisiId)
    setFormData((prev) => ({
      ...prev,
      kisi_kisi_id: kisiId,
      mata_pelajaran_id: selectedKisi ? selectedKisi.mata_pelajaran_id : prev.mata_pelajaran_id,
      kode_soal: '',
    }))
    if (kisiId) {
      loadExistingQuestionsForKisi(kisiId)
    } else {
      setModalSessionQuestions([])
    }
  }

  const handleAddPair = () => {
    setMatchingPairs((prev) => [...prev, { kiri: '', kanan: '' }])
  }

  const handleRemovePair = (index) => {
    if (matchingPairs.length <= 1) return
    setMatchingPairs((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePairChange = (index, field, value) => {
    setMatchingPairs((prev) => {
      const copy = [...prev]
      copy[index][field] = value
      return copy
    })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    if (!formData.kisi_kisi_id) {
      showNotification('Pilih Kisi-kisi Ujian / Mata Pelajaran terlebih dahulu.', 'error')
      return
    }

    if (!formData.pertanyaan.trim()) {
      showNotification('Teks pertanyaan/soal tidak boleh kosong.', 'error')
      return
    }

    let payload = { ...formData }

    if (formData.tipe_soal === 'menjodohkan') {
      const validPairs = matchingPairs.filter((p) => p.kiri.trim() && p.kanan.trim())
      if (validPairs.length === 0) {
        showNotification('Masukkan minimal 1 pasangan yang valid untuk tipe Menjodohkan.', 'error')
        return
      }
      payload.kunci_jawaban = JSON.stringify(validPairs)
    }

    try {
      if (editingModalQuestionId || editingItem) {
        const targetId = editingModalQuestionId || editingItem.id
        await lmsBankSoalService.update(targetId, payload)

        setModalSessionQuestions((prev) =>
          prev.map((q) => (q.id === targetId ? { ...payload, id: targetId } : q))
        )
        showNotification('Pertanyaan berhasil diperbarui pada tabel modal!')
        if (editingItem) {
          handleCloseModal()
          fetchData(pagination.currentPage)
          fetchStats()
          return
        }
      } else {
        const res = await lmsBankSoalService.create(payload)
        const newItem = res?.data || { ...payload, id: Date.now() + Math.random() }

        setModalSessionQuestions((prev) => [...prev, newItem])
        showNotification('Pertanyaan berhasil ditambahkan ke bank soal!')
      }

      resetSingleQuestionForm()
      fetchData(1)
      fetchStats()
    } catch (error) {
      console.error('Error saving question:', error)
      showNotification('Gagal menyimpan pertanyaan.', 'error')
    }
  }

  const handleEditModalQuestionRow = (item) => {
    setEditingModalQuestionId(item.id)
    let defaultKunci = item.kunci_jawaban || ''
    if (item.tipe_soal === 'pg' && !defaultKunci) defaultKunci = 'A'
    if (item.tipe_soal === 'benar_salah' && !defaultKunci) defaultKunci = 'Benar'

    setFormData({
      kisi_kisi_id: item.kisi_kisi_id || formData.kisi_kisi_id,
      mata_pelajaran_id: item.mata_pelajaran_id || formData.mata_pelajaran_id,
      kode_soal: item.kode_soal || '',
      pertanyaan: item.pertanyaan || '',
      tipe_soal: item.tipe_soal || 'pg',
      opsi_a: item.opsi_a || '',
      opsi_b: item.opsi_b || '',
      opsi_c: item.opsi_c || '',
      opsi_d: item.opsi_d || '',
      opsi_e: item.opsi_e || '',
      kunci_jawaban: defaultKunci,
      pembahasan: item.pembahasan || '',
      poin: item.poin || 2.5,
      tingkat_kesulitan: item.tingkat_kesulitan || 'sedang',
      indikator: item.indikator || '',
      status: item.status !== undefined ? item.status : true,
    })
    const container = document.getElementById('modalFormScrollContainer')
    if (container) container.scrollTop = 0
  }

  const handleDeleteModalQuestionRow = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini dari bank soal?')) return
    try {
      await lmsBankSoalService.delete(id)
      setModalSessionQuestions((prev) => prev.filter((q) => q.id !== id))
      if (editingModalQuestionId === id) resetSingleQuestionForm()
      showNotification('Pertanyaan telah dihapus.')
      fetchData(1)
      fetchStats()
    } catch (err) {
      console.error('Error deleting question:', err)
      showNotification('Gagal menghapus pertanyaan.', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus butir soal ini?')) return
    try {
      await lmsBankSoalService.delete(id)
      showNotification('Butir soal berhasil dihapus!')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error deleting item:', error)
      showNotification('Gagal menghapus butir soal.', 'error')
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await lmsBankSoalService.duplicate(id)
      showNotification('Butir soal berhasil diduplikasi!')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error duplicating item:', error)
      showNotification('Gagal menduplikasi butir soal.', 'error')
    }
  }

  const handleToggleStatus = async (item) => {
    try {
      await lmsBankSoalService.update(item.id, { status: !item.status })
      showNotification(`Status butir soal diubah menjadi ${!item.status ? 'Aktif' : 'Non-Aktif'}`)
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error toggling status:', error)
      showNotification('Gagal mengubah status.', 'error')
    }
  }

  const getTipeBadge = (tipe) => {
    switch (tipe) {
      case 'pg':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckSquare className="w-3.5 h-3.5" /> Pilihan Ganda
          </span>
        )
      case 'esai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <FileText className="w-3.5 h-3.5" /> Essay / Esai
          </span>
        )
      case 'benar_salah':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <ToggleLeft className="w-3.5 h-3.5" /> Benar / Salah
          </span>
        )
      case 'menjodohkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <GitCommit className="w-3.5 h-3.5" /> Menjodohkan
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {tipe}
          </span>
        )
    }
  }

  const getKesulitanBadge = (level) => {
    switch (level) {
      case 'mudah':
        return <span className="px-2 py-0.5 text-xs rounded-md bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 font-medium">Mudah</span>
      case 'sedang':
        return <span className="px-2 py-0.5 text-xs rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium">Sedang</span>
      case 'sulit':
        return <span className="px-2 py-0.5 text-xs rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-medium">Sulit</span>
      default:
        return <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{level}</span>
    }
  }

  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton
        variant="import"
        label="Import"
        onClick={() => setImportOpen(true)}
      />
      <SquircleActionButton
        variant="export"
        label="Export"
        onClick={handleExportCSV}
      />
      <SquircleActionButton
        variant="view"
        label="Cetak"
        icon={Printer}
        onClick={() => setIsPrintModalOpen(true)}
      />
      <SquircleActionButton
        variant="primary"
        label="Tambah Soal Baru"
        onClick={() => handleOpenModal()}
      />
    </div>
  )

  const pageContent = (
    <div className="education-unit-page lms-bank-soal-page space-y-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white transition-all transform duration-300 ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-[#0E5C44]'
          }`}
        >
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Hero Banner Header (Hidden when embedded) */}
      {!embedded && !hidePageHeader && (
        <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-r from-[#0E5C44] via-[#1E8E5A] to-[#3FBF75] p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <HelpCircle className="w-72 h-72 text-white" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> Evaluasi & Penilaian Digital
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bank Soal Ujian</h1>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                Kelola repositori butir soal terintegrasi Kisi-kisi Ujian dengan dukungan Pilihan Ganda, Esai, Benar-Salah, dan Menjodohkan.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#0E5C44] font-semibold text-sm shadow-md hover:bg-emerald-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Tambah Soal Baru
            </button>
          </div>
        </div>
        </motion.div>
      )}

      {/* KPI Stats Cards (Interactive Click Filters) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiTintedCard
          icon={Layers}
          label="Total Soal"
          value={stats.total_soal}
          subtext={`${stats.total_aktif} Status Aktif`}
          tone="emerald"
          onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: '' }))}
        />
        <KpiTintedCard
          icon={CheckSquare}
          label="Pilihan Ganda"
          value={stats.total_pg}
          subtext="Tipe PG"
          tone="emerald"
          onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: 'pg' }))}
        />
        <KpiTintedCard
          icon={FileText}
          label="Essay / Esai"
          value={stats.total_esai}
          subtext="Uraian / Manual"
          tone="purple"
          onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: 'esai' }))}
        />
        <KpiTintedCard
          icon={ToggleLeft}
          label="Benar / Salah"
          value={stats.total_benar_salah}
          subtext="Tipe B/S"
          tone="blue"
          onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: 'benar_salah' }))}
        />
        <KpiTintedCard
          icon={GitCommit}
          label="Menjodohkan"
          value={stats.total_menjodohkan}
          subtext="Matching Pairs"
          tone="amber"
          onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: 'menjodohkan' }))}
        />
      </motion.div>

      {/* Tab Navigation (Pindahkan di atas card datatable) */}
      {tabNav && <div className="my-2">{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

      {/* SEARCH & FILTER BAR (2-ROW LAYOUT) */}
      <motion.div variants={itemVariants} className="rounded-[18px] border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-700/80 dark:bg-[#1B2433] space-y-3.5">
        {/* Baris 1: Full-width Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari soal, kode, indikator..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
          />
        </div>

        {/* Baris 2: Dropdown Filters & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Filter Mata Pelajaran */}
            <select
              value={filters.mata_pelajaran_id || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, mata_pelajaran_id: e.target.value }))}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Mata Pelajaran</option>
              {((options.subjects || options.mata_pelajaran) && (options.subjects || options.mata_pelajaran).length > 0
                ? (options.subjects || options.mata_pelajaran)
                : Array.from(
                    new Map(
                      (options.kisi_kisi || [])
                        .filter((k) => k.mata_pelajaran_id || k.mata_pelajaran)
                        .map((k) => {
                          const id = k.mata_pelajaran_id || k.mata_pelajaran?.id || (typeof k.mata_pelajaran === 'string' ? k.mata_pelajaran : k.id)
                          const name = typeof k.mata_pelajaran === 'object' ? (k.mata_pelajaran.name || k.mata_pelajaran.nama) : (k.mata_pelajaran || k.judul_kisi)
                          return [id, { id, name }]
                        })
                    ).values()
                  )
              ).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.nama_mapel || m.nama || m.label}
                </option>
              ))}
            </select>

            {/* Filter Kisi-kisi Ujian */}
            <select
              value={filters.kisi_kisi_id}
              onChange={(e) => setFilters((prev) => ({ ...prev, kisi_kisi_id: e.target.value }))}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Kisi-kisi Ujian</option>
              {options.kisi_kisi.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.judul_kisi} ({k.jenis_ujian})
                </option>
              ))}
            </select>

            <select
              value={filters.tipe_soal}
              onChange={(e) => setFilters((prev) => ({ ...prev, tipe_soal: e.target.value }))}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Semua Tipe Soal</option>
              <option value="pg">Pilihan Ganda</option>
              <option value="esai">Essay / Esai</option>
              <option value="benar_salah">Benar / Salah</option>
              <option value="menjodohkan">Menjodohkan</option>
            </select>

            <select
              value={filters.tingkat_kesulitan}
              onChange={(e) => setFilters((prev) => ({ ...prev, tingkat_kesulitan: e.target.value }))}
              className="h-12 rounded-[14px] border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100"
            >
              <option value="">Tingkat Kesulitan</option>
              <option value="mudah">Mudah</option>
              <option value="sedang">Sedang</option>
              <option value="sulit">Sulit</option>
            </select>

            {(filters.search || filters.mata_pelajaran_id || filters.kisi_kisi_id || filters.tipe_soal || filters.tingkat_kesulitan) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({ search: '', mata_pelajaran_id: '', kisi_kisi_id: '', tipe_soal: '', tingkat_kesulitan: '', status: '' })
                  fetchData(1)
                }}
                className="inline-flex h-12 items-center gap-1.5 rounded-[14px] border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* MAIN DATATABLE SECTION */}
      <motion.div variants={itemVariants}>
      <section className="overflow-hidden rounded-[var(--master-card-radius,18px)] border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1B2433]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 px-4 py-4 sm:px-6 md:px-8 dark:border-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Daftar Bank Soal Ujian (Repository Soal)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilihan ganda, esai, benar-salah, dan menjodohkan
            </p>
          </div>
          {pageActions}
        </div>

        <MasterDataTable className="!rounded-none !border-0 !shadow-none">

        {loading ? (
          <div className="p-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0E5C44] animate-spin mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Memuat repositori Bank Soal...</p>
          </div>
        ) : dataList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Belum Ada Butir Soal</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Silakan tambahkan butir soal baru atau ubah kata kunci filter Anda.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-medium hover:bg-emerald-700 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Soal Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[340px] pb-12">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111827]/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode & Tipe</th>
                  <th className="py-3.5 px-4">Pertanyaan / Soal</th>
                  <th className="py-3.5 px-4">Kisi-kisi & Mapel</th>
                  <th className="py-3.5 px-4 text-center">Tingkat & Poin</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {dataList.map((item) => (
                  <tr
                    key={item.id}
                    className="group relative hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors duration-150 cursor-pointer"
                    onClick={(e) => {
                      if (e.target.closest('button, a, [data-no-rowclick]')) return
                      setRowDetailItem(item)
                      setShowRowDetailModal(true)
                    }}
                  >
                    <td className="py-3.5 px-4 align-top relative">
                      {/* Hover Card */}
                      <div className="pointer-events-none absolute left-4 top-full mt-1.5 z-50 w-64 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out">
                        <div className="bg-white dark:bg-[#1B2433] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2">{item.pertanyaan}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tipe Soal</p>
                              <div className="mt-0.5">{getTipeBadge(item.tipe_soal)}</div>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Poin</p>
                              <p className="text-[11px] font-bold text-emerald-600">{item.poin} Poin</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Kesulitan</p>
                              <div className="mt-0.5">{getKesulitanBadge(item.tingkat_kesulitan)}</div>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Status</p>
                              <p className={`text-[11px] font-bold ${item.status ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {item.status ? 'Aktif' : 'Non-Aktif'}
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">Klik baris untuk detail lengkap</p>
                        </div>
                        <div className="absolute -top-1.5 left-6 border-4 border-transparent border-b-white dark:border-b-[#1B2433] drop-shadow" />
                      </div>

                      <div className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {item.kode_soal || 'SOAL-SYS'}
                      </div>
                      {getTipeBadge(item.tipe_soal)}
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-md">
                      <p className="text-gray-900 dark:text-gray-100 font-medium line-clamp-2 leading-relaxed">
                        {item.pertanyaan}
                      </p>
                      {item.indikator && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate">
                          Indikator: {item.indikator}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {item.kisi_kisi?.judul_kisi || 'Umum'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {getMapelName(item)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center align-top">
                      <div className="space-y-1">
                        <div>{getKesulitanBadge(item.tingkat_kesulitan)}</div>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">
                          {item.poin} Poin
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center align-top">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                          item.status
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {item.status ? 'Aktif' : 'Non-Aktif'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right align-top">
                      <ActionDropdown
                        onView={() => {
                          setViewingItem(item)
                          setShowDetailModal(true)
                        }}
                        onEdit={() => handleOpenModal(item)}
                        onDelete={() => handleDelete(item.id)}
                        extraItems={[
                          {
                            label: 'Duplikasi Soal',
                            icon: <Copy className="size-4 text-purple-500" />,
                            onClick: () => handleDuplicate(item.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && pagination.lastPage > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>
              Halaman {pagination.currentPage} dari {pagination.lastPage} ({pagination.total} Soal)
            </span>
            <div className="flex gap-1">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() => fetchData(pagination.currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Sebelumnya
              </button>
              <button
                disabled={pagination.currentPage >= pagination.lastPage}
                onClick={() => fetchData(pagination.currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
        </MasterDataTable>
      </section>
      </motion.div>

      {/* ROW DETAIL MODAL POPUP — Bank Soal */}
      {showRowDetailModal && rowDetailItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRowDetailModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1B2433] rounded-[18px] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">{rowDetailItem.pertanyaan}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {rowDetailItem.kode_soal || 'SOAL-SYS'} · {getMapelName(rowDetailItem)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRowDetailModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {getTipeBadge(rowDetailItem.tipe_soal)}
                {getKesulitanBadge(rowDetailItem.tingkat_kesulitan)}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  rowDetailItem.status ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${rowDetailItem.status ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {rowDetailItem.status ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Poin</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{rowDetailItem.poin} Poin</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kisi-kisi</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5 line-clamp-1">{rowDetailItem.kisi_kisi?.judul_kisi || 'Umum'}</p>
                </div>
                {rowDetailItem.kunci_jawaban && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 col-span-2">
                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Kunci Jawaban</p>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">{rowDetailItem.kunci_jawaban}</p>
                  </div>
                )}
              </div>

              {/* Indikator */}
              {rowDetailItem.indikator && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Indikator</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rowDetailItem.indikator}</p>
                </div>
              )}

              {/* Pembahasan */}
              {rowDetailItem.pembahasan && (
                <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-1">Pembahasan</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">{rowDetailItem.pembahasan}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <button
                onClick={() => setShowRowDetailModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleDelete(rowDetailItem.id)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
                <button
                  onClick={() => {
                    setShowRowDetailModal(false)
                    handleOpenModal(rowDetailItem)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            id="modalFormScrollContainer"
            className="bg-white dark:bg-[#1B2433] rounded-[18px] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1B2433] z-20">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {editingItem ? <Edit3 className="w-5 h-5 text-[#0E5C44]" /> : <Plus className="w-5 h-5 text-[#0E5C44]" />}
                  {editingItem ? 'Edit Butir Soal' : 'Form Tambah & Kelola Pertanyaan Bank Soal'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Isi pertanyaan lalu tekan tombol tambah. Pertanyaan yang disimpan akan langsung masuk ke tabel di bawah dan dapat diubah kapan saja.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              {/* Notification Banner when in Edit Mode */}
              {editingModalQuestionId && (
                <div className="p-3 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-semibold">
                  <span>Anda sedang mengubah pertanyaan terpilih dari tabel modal.</span>
                  <button
                    type="button"
                    onClick={resetSingleQuestionForm}
                    className="text-xs underline text-amber-900 dark:text-amber-200 hover:opacity-80"
                  >
                    Batal Edit & Tambah Baru
                  </button>
                </div>
              )}

              {/* Select Kisi-kisi & Kode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Kisi-kisi Ujian / Mapel <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.kisi_kisi_id}
                    onChange={(e) => handleKisiChange(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] focus:ring-2 focus:ring-[#0E5C44]"
                    required
                  >
                    <option value="">-- Pilih Kisi-kisi / Mapel (Misal: Kewarganegaraan / PPKn) --</option>
                    {options.kisi_kisi.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.judul_kisi} ({k.jenis_ujian} - {k.subject_name || k.mata_pelajaran})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Kode Soal (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PPKN-001 / SOAL-01"
                    value={formData.kode_soal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, kode_soal: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] focus:ring-2 focus:ring-[#0E5C44]"
                  />
                </div>
              </div>

              {/* Tipe Soal Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tipe Soal <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'pg', label: 'Pilihan Ganda', icon: CheckSquare },
                    { id: 'esai', label: 'Essay / Esai', icon: FileText },
                    { id: 'benar_salah', label: 'Benar / Salah', icon: ToggleLeft },
                    { id: 'menjodohkan', label: 'Menjodohkan', icon: GitCommit },
                  ].map((t) => {
                    const IconComp = t.icon
                    const isSelected = formData.tipe_soal === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleTypeChange(t.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-[#0E5C44] bg-emerald-50 dark:bg-emerald-950/60 text-[#0E5C44] dark:text-emerald-300 ring-2 ring-[#0E5C44]'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span>{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Pertanyaan / Teks Soal */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Teks Pertanyaan / Soal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan butir soal atau instruksi pertanyaan di sini..."
                  value={formData.pertanyaan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pertanyaan: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] focus:ring-2 focus:ring-[#0E5C44]"
                  required
                />
              </div>

              {/* DYNAMIC FORM SECTION BASED ON TIPE_SOAL */}
              {/* 1. PILIHAN GANDA */}
              {formData.tipe_soal === 'pg' && (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-3">
                  <h4 className="text-xs font-bold text-[#0E5C44] dark:text-emerald-300 uppercase tracking-wider">
                    Opsi Jawaban & Kunci PG
                  </h4>

                  {['a', 'b', 'c', 'd', 'e'].map((optKey) => {
                    const fieldKey = `opsi_${optKey}`
                    const isCorrect = formData.kunci_jawaban === optKey.toUpperCase()
                    return (
                      <div key={optKey} className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            name="kunci_jawaban_pg"
                            checked={isCorrect}
                            onChange={() => setFormData((prev) => ({ ...prev, kunci_jawaban: optKey.toUpperCase() }))}
                            className="w-4 h-4 text-[#0E5C44] focus:ring-[#0E5C44]"
                          />
                          <span
                            className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                              isCorrect
                                ? 'bg-[#0E5C44] text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {optKey.toUpperCase()}
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder={`Teks Opsi ${optKey.toUpperCase()}`}
                          value={formData[fieldKey]}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                        />
                      </div>
                    )
                  })}
                  <p className="text-[11px] text-gray-500 italic mt-1">
                    * Pilih radio button untuk menandai kunci jawaban yang benar.
                  </p>
                </div>
              )}

              {/* 2. ESSAY */}
              {formData.tipe_soal === 'esai' && (
                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 space-y-2">
                  <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                    Kunci Jawaban / Pedoman Penskoran Essay
                  </h4>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan kunci acuan, poin penting, atau kata kunci jawaban siswa..."
                    value={formData.kunci_jawaban}
                    onChange={(e) => setFormData((prev) => ({ ...prev, kunci_jawaban: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                  />
                </div>
              )}

              {/* 3. BENAR SALAH */}
              {formData.tipe_soal === 'benar_salah' && (
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-3">
                  <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    Pernyataan Kunci Jawaban
                  </h4>
                  <div className="flex gap-4">
                    {['Benar', 'Salah'].map((val) => (
                      <label
                        key={val}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-sm transition-all ${
                          formData.kunci_jawaban === val
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="kunci_bs"
                          checked={formData.kunci_jawaban === val}
                          onChange={() => setFormData((prev) => ({ ...prev, kunci_jawaban: val }))}
                          className="hidden"
                        />
                        {val === 'Benar' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. MENJODOHKAN */}
              {formData.tipe_soal === 'menjodohkan' && (
                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      Daftar Pasangan Menjodohkan
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddPair}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Pasangan
                    </button>
                  </div>

                  {matchingPairs.map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white dark:bg-[#111827] p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 w-6 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder="Pernyataan / Item Kiri"
                        value={pair.kiri}
                        onChange={(e) => handlePairChange(idx, 'kiri', e.target.value)}
                        className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                      <input
                        type="text"
                        placeholder="Pasangan / Item Kanan"
                        value={pair.kanan}
                        onChange={(e) => handlePairChange(idx, 'kanan', e.target.value)}
                        className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      {matchingPairs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePair(idx)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Metadata Fields: Poin, Tingkat Kesulitan, Indikator, Pembahasan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Poin / Bobot Soal
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.poin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, poin: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={formData.tingkat_kesulitan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tingkat_kesulitan: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Indikator Soal / Kompetensi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Peserta didik mampu menganalisis Pancasila Sila I"
                  value={formData.indikator}
                  onChange={(e) => setFormData((prev) => ({ ...prev, indikator: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Pembahasan / Penjelasan Jawaban
                </label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan pembahasan singkat atau alasan kunci jawaban..."
                  value={formData.pembahasan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pembahasan: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827]"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="statusToggle"
                    checked={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked }))}
                    className="w-4 h-4 text-[#0E5C44] rounded focus:ring-[#0E5C44]"
                  />
                  <label htmlFor="statusToggle" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Aktifkan Butir Soal ini di Bank Soal
                  </label>
                </div>

                {/* Tombol Simpan Pertanyaan */}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E5C44] text-white hover:bg-emerald-700 text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {editingModalQuestionId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingModalQuestionId ? 'Simpan Perubahan Pertanyaan' : '+ Tambah Pertanyaan Ke Kisi-kisi'}</span>
                </button>
              </div>

              {/* DATATABLE DALAM MODAL: DAFTAR PERTANYAAN TERSIMPAN */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <List className="w-4 h-4 text-[#0E5C44]" />
                      <span>
                        Daftar Butir Soal Terdaftar ({modalSessionQuestions.length}
                        {selectedKisiObj?.jumlah_soal ? ` / ${selectedKisiObj.jumlah_soal}` : ''} Soal)
                      </span>
                    </h3>
                    {selectedKisiObj && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {selectedKisiObj.judul_kisi} • {selectedKisiObj.subject_name || selectedKisiObj.mata_pelajaran} ({selectedKisiObj.jenis_ujian})
                      </p>
                    )}
                  </div>
                  {loadingModalQuestions ? (
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                      Memuat data dari database...
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {selectedKisiObj?.jumlah_soal > 0 && (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          modalSessionQuestions.length >= selectedKisiObj.jumlah_soal
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        }`}>
                          {modalSessionQuestions.length >= selectedKisiObj.jumlah_soal
                            ? 'Target Terpenuhi (100%)'
                            : `Sisa ${selectedKisiObj.jumlah_soal - modalSessionQuestions.length} Soal Lagi`}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200/50">
                        {modalSessionQuestions.length} Tersimpan di Database
                      </span>
                    </div>
                  )}
                </div>

                {loadingModalQuestions ? (
                  <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Memuat butir soal yang tersimpan dari database...</p>
                  </div>
                ) : modalSessionQuestions.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
                    Belum ada butir soal yang tersimpan untuk kisi-kisi ini. Gunakan form di atas lalu tekan <strong>"+ Tambah Pertanyaan Ke Kisi-kisi"</strong>.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center">#</th>
                          <th className="py-2.5 px-3">Kode & Pertanyaan</th>
                          <th className="py-2.5 px-3">Tipe</th>
                          <th className="py-2.5 px-3 text-center">Kunci</th>
                          <th className="py-2.5 px-3 text-center">Poin</th>
                          <th className="py-2.5 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111827]">
                        {modalSessionQuestions.map((q, idx) => (
                          <tr
                            key={q.id || idx}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                              editingModalQuestionId === q.id ? 'bg-amber-50/80 dark:bg-amber-950/30' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="py-2.5 px-3 max-w-xs">
                              <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                                {q.kode_soal || `SOAL-${idx + 1}`}
                              </span>
                              <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2">{q.pertanyaan}</p>
                            </td>
                            <td className="py-2.5 px-3">
                              {getTipeBadge(q.tipe_soal)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                                {q.kunci_jawaban || '-'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                              {q.poin || 2.5} Poin
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditModalQuestionRow(q)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition cursor-pointer"
                                  title="Ubah Pertanyaan Ini"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Ubah</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteModalQuestionRow(q.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition cursor-pointer"
                                  title="Hapus Pertanyaan Ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer Action */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between sticky bottom-0 bg-white dark:bg-[#1B2433] py-2 z-10">
                <span className="text-xs text-slate-500 font-medium">
                  {modalSessionQuestions.length > 0
                    ? `${modalSessionQuestions.length} pertanyaan telah tersimpan`
                    : 'Siap menginput pertanyaan'}
                </span>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 rounded-xl bg-[#0E5C44] text-white text-xs font-bold hover:bg-emerald-700 shadow-md transition-all"
                >
                  Selesai & Tutup Modal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail / Preview Modal */}
      {showDetailModal && viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B2433] rounded-[18px] max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-xs font-mono text-gray-400">{viewingItem.kode_soal || 'SOAL-SYS'}</span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                  Preview Butir Soal
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                {getTipeBadge(viewingItem.tipe_soal)}
                {getKesulitanBadge(viewingItem.tingkat_kesulitan)}
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {viewingItem.poin} Poin
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-[#111827] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                  {viewingItem.pertanyaan}
                </p>
              </div>

              {/* RENDER OPTIONS BY TYPE */}
              {viewingItem.tipe_soal === 'pg' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Opsi Pilihan:</h4>
                  {['a', 'b', 'c', 'd', 'e'].map((optKey) => {
                    const text = viewingItem[`opsi_${optKey}`]
                    if (!text) return null
                    const isKey = viewingItem.kunci_jawaban === optKey.toUpperCase()
                    return (
                      <div
                        key={optKey}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                          isKey
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold'
                            : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                            isKey ? 'bg-[#0E5C44] text-white' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          {optKey.toUpperCase()}
                        </span>
                        <span>{text}</span>
                        {isKey && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-600" />}
                      </div>
                    )
                  })}
                </div>
              )}

              {viewingItem.tipe_soal === 'benar_salah' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-900 dark:text-blue-200">Kunci Jawaban Benar/Salah:</span>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold">{viewingItem.kunci_jawaban}</span>
                </div>
              )}

              {viewingItem.tipe_soal === 'esai' && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1 text-xs">
                  <span className="font-semibold text-purple-900 dark:text-purple-200 block">Kunci / Rubrik Jawaban:</span>
                  <p className="text-purple-950 dark:text-purple-300 leading-relaxed">
                    {viewingItem.kunci_jawaban || 'Penilaian manual oleh guru.'}
                  </p>
                </div>
              )}

              {viewingItem.tipe_soal === 'menjodohkan' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pasangan Menjodohkan:</h4>
                  <div className="space-y-1.5">
                    {(viewingItem.pasangan_menjodohkan || []).map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs">
                        <span className="font-medium text-gray-800 dark:text-gray-200 w-1/2">{p.kiri}</span>
                        <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-medium text-emerald-700 dark:text-emerald-400 w-1/2">{p.kanan}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingItem.pembahasan && (
                <div className="bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/40 space-y-1 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block">Pembahasan:</span>
                  <p className="text-gray-700 dark:text-gray-300">{viewingItem.pembahasan}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Opsi Cetak Data Bank Soal"
        subtitle="Pilih metode pencetakan atau unduh repositori butir soal"
        onPrintClean={() => {
          printCleanTable({
            title: 'Laporan Repositori Bank Soal Ujian',
            data: dataList,
            columns: [
              { header: 'Kode Soal', accessor: (row) => row.kode_soal || 'SOAL-SYS' },
              { header: 'Pertanyaan', accessor: (row) => (row.pertanyaan || row.soal || '').replace(/<[^>]*>?/gm, '') },
              { header: 'Tipe Soal', accessor: (row) => row.tipe_soal || 'pg' },
              { header: 'Tingkat Kesulitan', accessor: (row) => row.tingkat_kesulitan || 'sedang' },
              { header: 'Status', accessor: (row) => (row.status ? 'Aktif' : 'Nonaktif') },
            ],
          })
          setIsPrintModalOpen(false)
        }}
        onDownloadPdf={() => {
          downloadPdfTable({
            title: 'Laporan Repositori Bank Soal Ujian',
            data: dataList,
            columns: [
              { header: 'Kode Soal', accessor: (row) => row.kode_soal || 'SOAL-SYS' },
              { header: 'Pertanyaan', accessor: (row) => (row.pertanyaan || row.soal || '').replace(/<[^>]*>?/gm, '') },
              { header: 'Tipe Soal', accessor: (row) => row.tipe_soal || 'pg' },
              { header: 'Tingkat Kesulitan', accessor: (row) => row.tingkat_kesulitan || 'sedang' },
              { header: 'Status', accessor: (row) => (row.status ? 'Aktif' : 'Nonaktif') },
            ],
            filename: `laporan_bank_soal_${new Date().toISOString().slice(0, 10)}.pdf`,
          })
          setIsPrintModalOpen(false)
        }}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Data Bank Soal"
        onImport={handleImport}
        templateFields={['kode_soal', 'pertanyaan', 'tipe_soal', 'tingkat_kesulitan', 'bobot_soal', 'status']}
      />
      </motion.div>
    </div>
  )

  return <PageContainer maxW="7xl">{pageContent}</PageContainer>
}
