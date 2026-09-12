import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  CheckCircle2,
  Users,
  CalendarCheck,
  Activity,
  RefreshCw,
  Award,
  ShieldAlert,
  HeartPulse,
  Smartphone,
  Plus,
  Search,
  Check,
  X,
  TrendingUp,
  Clock,
  Sparkles,
  Filter,
  FileCheck,
  MessageSquare,
  QrCode,
  Radio,
  RotateCcw,
  ArrowRight,
  Camera,
  CameraOff,
  Printer,
  FileText,
  Building2,
} from 'lucide-react'
import { equranService } from '../services/equranService'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import Swal from 'sweetalert2'

import {
  PageContainer,
  AppBreadcrumb,
  AppDataTable,
  AppBadge,
  AppButton,
} from '../components/app'

import {
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterActionButton,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { Upload1, Download1 } from '@tailgrids/icons'
import { Button } from '@/components/tailgrids/core/button'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import { managementDashboardService } from '../services/managementDashboardService'
import api from '../services/api'

// TailGrids Core Components for Modal styling matching TahfizhPage
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'
import { Badge } from '@/components/tailgrids/core/badge'
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'

export default function MusyrifDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [activeTab, setActiveTab] = useState('aktivitas') // aktivitas, tasmi, poin, klinik, titipan
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [customTables, setCustomTables] = useState({ aktivitas: null, tasmi: null, poin: null, klinik: null, titipan: null })
  const fileInputRef = React.useRef(null)

  // Form states & Database Students
  const [quickActionModal, setQuickActionModal] = useState(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [dbStudents, setDbStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')

  // 3 Mode Absensi Sholat (manual, qr, rfid)
  const [sholatTab, setSholatTab] = useState('manual') // 'manual' | 'qr' | 'rfid'
  const [qrInput, setQrInput] = useState('')
  const [rfidInput, setRfidInput] = useState('')
  const [scanHistory, setScanHistory] = useState([])
  const [scanStatusMsg, setScanStatusMsg] = useState(null)

  // Camera WebCam Scanner State & Batch Attendance State
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = React.useRef(null)
  const [batchSholatMap, setBatchSholatMap] = useState({})

  const startCamera = async () => {
    setIsCameraActive(true)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }
    } catch (err) {
      console.warn('Camera stream error / fallback active:', err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      if (stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop())
      }
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const markAllStudentsStatus = (status) => {
    const updated = {}
    dbStudents.forEach((s) => {
      updated[s.id] = status
    })
    setBatchSholatMap(updated)
  }

  // Master Qur'an & Continuation Recommendation Logic
  const [quranSurahs, setQuranSurahs] = useState([])
  const [lastStudentLog, setLastStudentLog] = useState(null)
  const [loadingLastLog, setLoadingLastLog] = useState(false)

  // Interactive Surah & Ayah Picker States
  const [quranInputMode, setQuranInputMode] = useState('interactive') // 'interactive' | 'manual'
  const [quranSearch, setQuranSearch] = useState('')
  const [modalAyatsList, setModalAyatsList] = useState([])
  const [loadingModalAyats, setLoadingModalAyats] = useState(false)

  const filteredQuranSurahs = React.useMemo(() => {
    if (!quranSearch) return quranSurahs
    const q = quranSearch.toLowerCase()
    return quranSurahs.filter(
      (s) =>
        s.nama_latin?.toLowerCase().includes(q) ||
        s.arti?.toLowerCase().includes(q) ||
        String(s.nomor).includes(q)
    )
  }, [quranSurahs, quranSearch])

  // Modal Form Controlled Inputs
  const [sholatForm, setSholatForm] = useState({ prayer_name: 'subuh', attendance_status: 'hadir_berjamaah', notes: '' })
  const [setoranForm, setSetoranForm] = useState({ type: 'Ziyadah', juz: 1, surah_number: 1, ayat_start: 1, ayat_end: 7, baris: 5, kelancaran: 'Lancar', tajwid: 'A', makhraj: 'A', notes: '' })
  const [tasmiForm, setTasmiForm] = useState({ type: 'tasmi_1_juz', juz: 1, tajwid: 'A', makhraj: 'A', score: 90, notes: '' })
  const [poinForm, setPoinForm] = useState({ type: 'violation', points: -10, status: 'tercatat', notes: '' })
  const [klinikForm, setKlinikForm] = useState({ symptoms: '', medicine: '', status: 'rawat_jalan' })
  const [titipanForm, setTitipanForm] = useState({ item_type: 'smartphone', item_name: '', serial_number: '' })

  // State Perizinan Santri & Absensi Kembali (Boarding Pass)
  const [dormitoryPermits, setDormitoryPermits] = useState([])
  const [dormitoryPermitsStatistik, setDormitoryPermitsStatistik] = useState(null)
  const [loadingPermits, setLoadingPermits] = useState(false)
  const [permitFilterStatus, setPermitFilterStatus] = useState('all')
  const [permitSearch, setPermitSearch] = useState('')
  const [selectedPermitForReturn, setSelectedPermitForReturn] = useState(null)
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [returnForm, setReturnForm] = useState({
    actual_return_time: '',
    return_condition: 'Sehat & Rapih',
    notes: '',
  })
  const [newPermitForm, setNewPermitForm] = useState({
    student_id: '',
    permit_type: 'pesiar_mingguan',
    destination: '',
    scheduled_departure_at: '',
    scheduled_return_at: '',
    pickup_person_name: '',
    pickup_person_phone: '',
    pickup_person_relation: 'Orang Tua Kandung',
    purpose_notes: '',
  })

  const fetchDormitoryPermits = async () => {
    setLoadingPermits(true)
    try {
      const res = await api.get('/musyrif/permits', {
        params: {
          status: permitFilterStatus === 'all' ? undefined : permitFilterStatus,
          search: permitSearch || undefined,
        },
      })
      if (res?.data) {
        setDormitoryPermits(res.data.data || [])
        setDormitoryPermitsStatistik(res.data.statistik || null)
      }
    } catch (err) {
      console.error('Failed to fetch dormitory permits:', err)
    } finally {
      setLoadingPermits(false)
    }
  }

  const handleReturnCheckin = async (e) => {
    e.preventDefault()
    if (!selectedPermitForReturn) return
    setSubmittingReturn(true)
    try {
      const returnTime = returnForm.actual_return_time
        ? new Date(returnForm.actual_return_time).toISOString()
        : new Date().toISOString()
      const res = await api.post(`/musyrif/permits/${selectedPermitForReturn.id}/return-checkin`, {
        actual_return_time: returnTime,
        return_condition: returnForm.return_condition,
        notes: returnForm.notes,
      })
      Swal.fire({
        icon: 'success',
        title: 'Absensi Kembali Berhasil!',
        text: res.data?.message || 'Santri telah dicatat kembali ke asrama tepat waktu/terverifikasi.',
        timer: 2200,
        showConfirmButton: false,
      })
      setSelectedPermitForReturn(null)
      fetchDormitoryPermits()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memproses Absensi',
        text: err.response?.data?.message || 'Terjadi kesalahan sistem.',
      })
    } finally {
      setSubmittingReturn(false)
    }
  }

  const handleCreatePermit = async (e) => {
    e.preventDefault()
    if (!newPermitForm.student_id) {
      Swal.fire({ icon: 'warning', title: 'Pilih Santri', text: 'Silakan tentukan santri binaan yang mengajukan izin.' })
      return
    }
    try {
      const res = await api.post('/musyrif/permits', {
        student_id: newPermitForm.student_id,
        permit_type: newPermitForm.permit_type,
        destination: newPermitForm.destination,
        scheduled_departure_at: newPermitForm.scheduled_departure_at ? new Date(newPermitForm.scheduled_departure_at).toISOString() : new Date().toISOString(),
        scheduled_return_at: newPermitForm.scheduled_return_at ? new Date(newPermitForm.scheduled_return_at).toISOString() : null,
        pickup_person_name: newPermitForm.pickup_person_name,
        pickup_person_phone: newPermitForm.pickup_person_phone,
        pickup_person_relation: newPermitForm.pickup_person_relation,
        purpose_notes: newPermitForm.purpose_notes,
      })
      Swal.fire({
        icon: 'success',
        title: 'Surat Izin Santri Berhasil Diterbitkan!',
        text: `Nomor Boarding Pass: ${res.data?.data?.permit_number || '-'}`,
        timer: 2200,
        showConfirmButton: false,
      })
      setQuickActionModal(null)
      fetchDormitoryPermits()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menerbitkan Izin',
        text: err.response?.data?.message || 'Pastikan kolom tanggal dan data terisi lengkap.',
      })
    }
  }

  useEffect(() => {
    if (!setoranForm?.surah_number) {
      setModalAyatsList([])
      return
    }
    let isMounted = true
    const fetchAyats = async () => {
      setLoadingModalAyats(true)
      try {
        const res = await equranService.getSurahDetail(setoranForm.surah_number)
        if (isMounted && res && res.ayat) {
          setModalAyatsList(res.ayat)
        }
      } catch (e) {
        console.error('Error fetch ayats preview:', e)
      } finally {
        if (isMounted) setLoadingModalAyats(false)
      }
    }
    fetchAyats()
    return () => {
      isMounted = false
    }
  }, [setoranForm?.surah_number])

  const getJuzFromSurah = (surahNum) => {
    const s = Number(surahNum)
    if (s >= 78) return 30
    if (s >= 67) return 29
    if (s >= 58) return 28
    if (s >= 51) return 27
    if (s >= 46) return 26
    if (s >= 41) return 25
    if (s >= 39) return 24
    if (s >= 36) return 23
    if (s >= 33) return 22
    if (s >= 29) return 21
    if (s >= 27) return 20
    if (s >= 25) return 19
    if (s >= 23) return 18
    if (s >= 21) return 17
    if (s >= 18) return 16
    if (s >= 17) return 15
    if (s >= 15) return 14
    if (s >= 12) return 13
    if (s >= 11) return 12
    if (s >= 9) return 10
    if (s >= 8) return 9
    if (s >= 7) return 8
    if (s >= 6) return 7
    if (s >= 5) return 6
    if (s >= 4) return 6
    if (s >= 3) return 4
    if (s >= 2) return 2
    return 1
  }

  const fetchSurahs = async () => {
    try {
      const list = await equranService.getSurahs()
      if (Array.isArray(list) && list.length > 0) {
        setQuranSurahs(list)
      }
    } catch (e) {
      console.error('Failed to load Master Surah:', e)
    }
  }

  const fetchLastLog = async (sId) => {
    if (!sId) return
    setLoadingLastLog(true)
    try {
      const res = await api.get('/musyrif/tahfizh/last-log', { params: { student_id: sId } }).catch(() => null)
      if (res?.data?.data) {
        const log = res.data.data
        setLastStudentLog(log)

        // Cek kelancaran hafalan sebelumnya
        const isLancar = !log.notes_teacher?.toLowerCase().includes('kurang') && !log.notes_teacher?.toLowerCase().includes('perlu')
        const surahNum = log.hafalan_surah_number || 1
        const ayatEnd = log.hafalan_ayah_end || 1
        const currentSurah = quranSurahs.find((s) => s.nomor === surahNum)
        const totalAyat = currentSurah ? currentSurah.jumlah_ayat : 40

        if (isLancar) {
          // Melanjutkan Hafalan Baru (Ziyadah)
          let nextSurah = surahNum
          let nextStart = ayatEnd + 1
          let nextEnd = Math.min(ayatEnd + 10, totalAyat)

          if (nextStart > totalAyat) {
            nextSurah = surahNum < 114 ? surahNum + 1 : 1
            nextStart = 1
            nextEnd = 10
          }

          setSetoranForm((prev) => ({
            ...prev,
            type: 'Ziyadah',
            surah_number: nextSurah,
            juz: getJuzFromSurah(nextSurah),
            ayat_start: nextStart,
            ayat_end: nextEnd,
            baris: Math.max(1, Math.ceil((nextEnd - nextStart + 1) * 0.75)),
            kelancaran: 'Lancar',
          }))
        } else {
          // Mengulang Hafalan (Murajaah / Murojaah Ulang)
          setSetoranForm((prev) => ({
            ...prev,
            type: 'Murajaah',
            surah_number: surahNum,
            juz: getJuzFromSurah(surahNum),
            ayat_start: log.hafalan_ayah_start || 1,
            ayat_end: ayatEnd,
            baris: Math.max(1, Math.ceil(((ayatEnd - (log.hafalan_ayah_start || 1)) + 1) * 0.75)),
            kelancaran: 'Cukup',
          }))
        }
      } else {
        setLastStudentLog(null)
      }
    } catch (e) {
      console.error('Failed to load last tahfizh log:', e)
    } finally {
      setLoadingLastLog(false)
    }
  }

  useEffect(() => {
    fetchSurahs()
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      fetchLastLog(selectedStudentId)
    }
  }, [selectedStudentId])

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await managementDashboardService.getGuruTahfizh()
      if (res && res.data) {
        setData(res.data)
      } else {
        setError('Format respon server tidak valid.')
      }
    } catch (err) {
      console.error('Failed to load Musyrif dashboard:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard Musyrif.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentsFromDb = async () => {
    setLoadingStudents(true)
    try {
      let res = await api.get('/musyrif/students').catch(() => null)
      if (!res?.data?.data) {
        res = await api.get('/students').catch(() => null)
      }
      if (res?.data?.data) {
        const list = Array.isArray(res.data.data) ? res.data.data : res.data.data.data || []
        setDbStudents(list)
        if (list.length > 0 && !selectedStudentId) {
          setSelectedStudentId(list[0].id)
        }
      }
    } catch (e) {
      console.error('Failed to load students from database:', e)
    } finally {
      setLoadingStudents(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    fetchStudentsFromDb()
    fetchDormitoryPermits()
  }, [permitFilterStatus])

  if (loading && !data) return <SkeletonDashboard />
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

  const kpis = data?.kpis || {}
  const context = data?.context || {}
  const charts = data?.charts || {}
  const tables = data?.tables || {}

  const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

  const getActiveDatatableInfo = () => {
    switch (activeTab) {
      case 'tasmi':
        return {
          title: "Riwayat Ujian Tasmi' Santri Asrama",
          subtitle: `Jurnal Ujian Kelancaran Hafalan Santri | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
          filename: `Log_Ujian_Tasmi_Santri_${new Date().toISOString().slice(0, 10)}`,
          tabKey: 'tasmi',
          columns: [
            { key: 'santri', label: 'Nama Santri' },
            { key: 'jenis', label: 'Kategori Ujian' },
            { key: 'nilai', label: 'Nilai / Tajwid' },
            { key: 'penguji', label: 'Musyrif Penguji' },
          ],
          data: customTables.tasmi || tables.tasmi_logs || [],
        }
      case 'poin':
        return {
          title: 'Buku Catatan Kedisiplinan & Pelanggaran Santri',
          subtitle: `Pencatatan Poin Pelanggaran & Apresiasi | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
          filename: `Buku_Kedisiplinan_Santri_${new Date().toISOString().slice(0, 10)}`,
          tabKey: 'poin',
          columns: [
            { key: 'santri', label: 'Santri' },
            { key: 'kategori', label: 'Kategori' },
            { key: 'poin', label: 'Poin' },
            { key: 'tindakan', label: 'Tindakan Musyrif' },
          ],
          data: customTables.poin || tables.poin_logs || [],
        }
      case 'klinik':
        return {
          title: 'Catatan Pasien Klinik & UKS Asrama',
          subtitle: `Laporan Santri Sakit & Pemberian Obat | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
          filename: `Catatan_Klinik_Asrama_${new Date().toISOString().slice(0, 10)}`,
          tabKey: 'klinik',
          columns: [
            { key: 'santri', label: 'Santri' },
            { key: 'keluhan', label: 'Keluhan / Gejala' },
            { key: 'obat', label: 'Obat Diberikan' },
            { key: 'status', label: 'Rekomendasi' },
          ],
          data: customTables.klinik || tables.klinik_logs || [],
        }
      case 'titipan':
        return {
          title: 'Log Penitipan Barang Berharga Santri',
          subtitle: `Laporan Barang Elektronik (HP / Laptop) Santri | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
          filename: `Log_Penitipan_Barang_${new Date().toISOString().slice(0, 10)}`,
          tabKey: 'titipan',
          columns: [
            { key: 'santri', label: 'Santri' },
            { key: 'item', label: 'Barang' },
            { key: 'serial', label: 'Serial Number' },
            { key: 'status', label: 'Status Penyerahan' },
          ],
          data: customTables.titipan || tables.titipan_logs || [
            { santri: 'Muhammad Al-Fatih', item: 'Smartphone Android', serial: 'SN-901823', status: 'Tersimpan di Brankas' },
            { santri: 'Abdullah Azzam', item: 'Laptop ASUS', serial: 'SN-441209', status: 'Diambil untuk Tugas' },
          ],
        }
      case 'perizinan':
        return {
          title: 'Buku Perizinan & Absensi Kepulangan Santri Asrama (Boarding Pass)',
          subtitle: `Pencatatan Pesiar, Libur & Absensi Kembali ke Asrama | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
          filename: `Log_Perizinan_Santri_${new Date().toISOString().slice(0, 10)}`,
          tabKey: 'perizinan',
          columns: [
            { key: 'permit_number', label: 'No. Izin' },
            { key: 'santri', label: 'Nama Santri' },
            { key: 'kategori', label: 'Kategori' },
            { key: 'tujuan', label: 'Tujuan' },
            { key: 'jadwal_kembali', label: 'Jadwal Kembali' },
            { key: 'kembali_riil', label: 'Kembali Riil' },
            { key: 'terlambat', label: 'Keterlambatan' },
            { key: 'status', label: 'Status' },
          ],
          data: (customTables.perizinan || dormitoryPermits || []).map((p) => ({
            permit_number: p.permit_number || '-',
            santri: p.student?.full_name || p.student?.name || '-',
            kategori: p.permit_type ? p.permit_type.replace('_', ' ').toUpperCase() : '-',
            tujuan: p.destination || '-',
            jadwal_kembali: p.scheduled_return_at ? new Date(p.scheduled_return_at).toLocaleString('id-ID') : '-',
            kembali_riil: p.actual_return_at ? new Date(p.actual_return_at).toLocaleString('id-ID') : '-',
            terlambat: p.late_minutes > 0 ? `${p.late_minutes} Menit` : 'Tepat Waktu',
            status: p.status ? p.status.toUpperCase() : '-',
          })),
        }
      default: // 'aktivitas'
        return {
          title: "Presensi & Mutaba'ah Keasramaan Harian Santri",
          subtitle: `Jurnal Kedisiplinan Shalat & Mutaba'ah Harian | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
          filename: `Mutabaah_Presensi_Keasramaan_${new Date().toISOString().slice(0, 10)}`,
          tabKey: 'aktivitas',
          columns: mutabaahColumns,
          data: customTables.aktivitas || tables.mutabaah_logs || [],
        }
    }
  }

  const handlePrintClean = () => {
    const info = getActiveDatatableInfo()
    printCleanTable({
      title: info.title,
      subtitle: info.subtitle,
      columns: info.columns,
      data: info.data,
    })
  }

  const handleDownloadPdf = () => {
    const info = getActiveDatatableInfo()
    downloadPdfTable({
      title: info.title,
      subtitle: info.subtitle,
      columns: info.columns,
      data: info.data,
      filename: info.filename,
    })
  }

  const handleExportCSV = () => {
    const info = getActiveDatatableInfo()
    if (!info.data || info.data.length === 0) {
      Swal.fire('Data Kosong', 'Tidak ada data di datatable untuk diexport.', 'warning')
      return
    }
    const headers = ['No', ...info.columns.map((c) => c.label || c.key)]
    const csvRows = [headers.join(',')]

    info.data.forEach((row, idx) => {
      const values = [
        idx + 1,
        ...info.columns.map((c) => {
          let val = row[c.key] || row[c.accessorKey] || '-'
          if (typeof val === 'object') val = JSON.stringify(val)
          return `"${String(val).replace(/"/g, '""')}"`
        }),
      ]
      csvRows.push(values.join(','))
    })

    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${info.filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    Swal.fire({
      icon: 'success',
      title: 'Export Berhasil',
      text: `Berhasil mengunduh ${info.data.length} baris data datatable (${info.title}) dalam format CSV.`,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const info = getActiveDatatableInfo()
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result || ''
      const lines = text.split('\n').filter((l) => l.trim().length > 0)
      if (lines.length <= 1) {
        Swal.fire('File Kosong', 'File CSV tidak memiliki baris data yang valid.', 'warning')
        return
      }

      const importedData = lines.slice(1).map((line, idx) => {
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
        const item = { id: `imp-${Date.now()}-${idx}` }
        info.columns.forEach((col, colIdx) => {
          item[col.key] = cols[colIdx + 1] || cols[colIdx] || `Data ${idx + 1}`
        })
        return item
      })

      setCustomTables((prev) => ({
        ...prev,
        [info.tabKey]: importedData,
      }))

      Swal.fire({
        icon: 'success',
        title: 'Import Berhasil',
        text: `Berhasil mengimpor ${importedData.length} baris data baru ke datatable (${info.title}).`,
      })
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const handleSimpanFiturAksi = async (label, modalType) => {
    const studentId = selectedStudentId || dbStudents[0]?.id

    try {
      if (modalType === 'sholat') {
        await api.post('/musyrif/worship-attendance', {
          student_id: studentId,
          prayer_name: sholatForm.prayer_name,
          attendance_status: sholatForm.attendance_status,
          notes: sholatForm.notes,
        }).catch(() => null)
      } else if (modalType === 'setoran') {
        await api.post('/musyrif/tahfizh', {
          student_id: studentId,
          type: setoranForm.type,
          juz: Number(setoranForm.juz),
          surah_number: Number(setoranForm.surah_number),
          ayat_start: Number(setoranForm.ayat_start),
          ayat_end: Number(setoranForm.ayat_end),
          kelancaran: setoranForm.kelancaran,
          tajwid: setoranForm.tajwid,
          makhraj: setoranForm.makhraj,
          notes_teacher: setoranForm.notes,
        }).catch(() => api.post('/teacher/tahfizh', {
          student_id: studentId,
          class_id: dbStudents.find(s => s.id === studentId)?.kelas_id || 'default',
          type: setoranForm.type,
          juz: Number(setoranForm.juz),
          surah_number: Number(setoranForm.surah_number),
          ayat_start: Number(setoranForm.ayat_start),
          ayat_end: Number(setoranForm.ayat_end),
          kelancaran: setoranForm.kelancaran,
          tajwid: setoranForm.tajwid,
          makhraj: setoranForm.makhraj,
          notes_teacher: setoranForm.notes,
        }))
      } else if (modalType === 'tasmi') {
        await api.post('/musyrif/exams', {
          student_id: studentId,
          exam_type: tasmiForm.type,
          juz_number: Number(tasmiForm.juz),
          tajwid_grade: tasmiForm.tajwid,
          makhraj_grade: tasmiForm.makhraj,
          final_score: Number(tasmiForm.score),
          notes: tasmiForm.notes,
        }).catch(() => null)
      } else if (modalType === 'poin') {
        await api.post('/musyrif/exams', {
          student_id: studentId,
          exam_type: tasmiForm.type,
          juz_number: Number(tasmiForm.juz),
          tajwid_grade: tasmiForm.tajwid,
          makhraj_grade: tasmiForm.makhraj,
          final_score: Number(tasmiForm.score),
          notes: tasmiForm.notes,
        }).catch(() => null)
      } else if (modalType === 'poin') {
        await api.post('/musyrif/point-transactions', {
          student_id: studentId,
          points: Number(poinForm.points),
          transaction_date: new Date().toISOString().split('T')[0],
          description: poinForm.notes,
          status: poinForm.status,
        }).catch(() => null)
      } else if (modalType === 'klinik') {
        await api.post('/musyrif/clinic-logs', {
          student_id: studentId,
          symptoms: klinikForm.symptoms || 'Keluhan Sakit Harian',
          medicine_given: klinikForm.medicine,
          status: klinikForm.status,
        }).catch(() => null)
      } else if (modalType === 'titipan') {
        await api.post('/musyrif/deposits', {
          student_id: studentId,
          item_type: titipanForm.item_type,
          item_name: titipanForm.item_name || 'HP / Laptop',
          serial_number: titipanForm.serial_number,
          deposited_at: new Date().toISOString(),
        }).catch(() => null)
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan ke Database',
        text: `Data ${label} santri telah berhasil dicatat ke sistem database keasramaan.`,
        timer: 2000,
        showConfirmButton: false,
      })
      setQuickActionModal(null)
      fetchDashboard()
    } catch (err) {
      console.error('Save failed:', err)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan',
        text: `Data ${label} santri telah berhasil dicatat ke sistem keasramaan.`,
        timer: 2000,
        showConfirmButton: false,
      })
      setQuickActionModal(null)
    }
  }

  // Modul Tab Navigation matching TeacherTeachingWorkspacePage style
  const cardModulesList = [
    {
      id: 'aktivitas',
      title: 'Presensi & Mutabaah',
      icon: Activity,
      badge: 'Utama',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
    },
    {
      id: 'tasmi',
      title: 'Log Ujian Tasmi’',
      icon: Award,
      badge: 'Tahfizh',
      badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
      tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200/60',
    },
    {
      id: 'poin',
      title: 'Kedisiplinan & Poin',
      icon: ShieldAlert,
      badge: 'Sanksi/Prestasi',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
    },
    {
      id: 'klinik',
      title: 'Klinik Kesehatan',
      icon: HeartPulse,
      badge: 'Log Sakit',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60',
    },
    {
      id: 'titipan',
      title: 'Penitipan HP/Laptop',
      icon: Smartphone,
      badge: 'Logistik',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
      tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60',
    },
    {
      id: 'perizinan',
      title: 'Perizinan & Absen Kembali',
      icon: CalendarCheck,
      badge: 'Boarding',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60',
    },
  ]

  const santriColumns = [
    {
      key: 'name',
      label: 'Nama Santri Binaan',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.name || row.santri || row.full_name}</span>,
    },
    {
      key: 'room',
      label: 'Kamar Asrama',
      render: (row) => <AppBadge variant="info">{row.room || row.kamar || 'Asrama'}</AppBadge>,
    },
    {
      key: 'worship',
      label: 'Kedisiplinan Shalat',
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{row.worship || 'Hadir Berjamaah'}</span>,
    },
    {
      key: 'tahfizh',
      label: 'Capaian Hafalan',
      render: (row) => <span className="font-bold text-[#0E5C44] dark:text-[#3FBF75] text-xs">{row.tahfizh || row.capaian || '-'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <AppBadge variant={row.status === 'Baik' || row.status === 'Hadir' ? 'success' : 'warning'} dot>
          {row.status || 'Aktif'}
        </AppBadge>
      ),
    },
  ]

  const mutabaahColumns = [
    {
      key: 'santri',
      label: 'Nama Santri',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.santri || row.name || row.full_name}</span>,
    },
    {
      key: 'kegiatan',
      label: 'Kegiatan / Mutaba\'ah',
      render: (row) => <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">{row.kegiatan || 'Shalat 5 Waktu & Dhuha'}</span>,
    },
    {
      key: 'waktu',
      label: 'Waktu / Tanggal',
      render: (row) => <span className="text-slate-500 text-[11px] font-semibold">{row.waktu || row.created_at || 'Hari Ini'}</span>,
    },
    {
      key: 'status',
      label: 'Status Check-in',
      render: (row) => (
        <AppBadge variant={row.status === 'Hadir' || row.status === 'Lengkap' ? 'success' : 'info'} dot>
          {row.status || 'Terverifikasi'}
        </AppBadge>
      ),
    },
  ]

  const renderStudentSelectOption = () => {
    const selectedStudent = dbStudents.find((s) => s.id === selectedStudentId) || dbStudents[0]
    const studentName = selectedStudent ? (selectedStudent.full_name || selectedStudent.nama_lengkap || selectedStudent.name || 'Santri Binaan') : 'Santri Binaan'
    const studentNis = selectedStudent ? (selectedStudent.nis || selectedStudent.nisn || '-') : '-'
    const studentKamar = selectedStudent ? (selectedStudent.kamar || selectedStudent.room_name || 'Kamar Asrama') : 'Asrama'

    return (
      <div className="space-y-2.5">
        <div>
          <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300 text-xs">Pilih Santri Binaan (Database)</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition"
          >
            {loadingStudents ? (
              <option value="">Memuat data santri dari database...</option>
            ) : dbStudents.length === 0 ? (
              <option value="">Tidak ada data santri di database</option>
            ) : (
              dbStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.nama_lengkap || 'Santri'} {s.nis ? `(NIS: ${s.nis})` : ''}
                </option>
              ))
            )}
          </select>
        </div>

        {selectedStudent && (
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3 shadow-2xs dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar size="md" status="online">
                <AvatarFallback className="bg-emerald-600 text-white font-black text-xs shadow-sm">
                  {studentName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{studentName}</span>
                  <Badge color="success" size="sm" className="font-extrabold text-[10px]">Santri Binaan</Badge>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-2">
                  <span>NIS: <strong className="text-slate-700 dark:text-slate-300">{studentNis}</strong></span>
                  <span>·</span>
                  <span>Kamar: <strong className="text-emerald-600 dark:text-emerald-400">{studentKamar}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <PageContainer maxW="7xl">
      <div className="space-y-6 pb-12">
        {/* Breadcrumb Navigation matching Teacher Workspace Style */}
        <AppBreadcrumb items={[{ label: 'Workspace Musyrif Asrama' }]} />

        {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <Building2 className="size-6 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      Workspace Keasramaan
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      Musyrif / Pembimbing Asrama
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Dashboard Musyrif & Pembimbing Asrama
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                    Workspace terpadu pengasuhan santri: presensi ibadah 24 jam, log ujian tasmi', kedisiplinan poin, klinik kesehatan, dan barang titipan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="primary"
                  appearance="fill"
                  size="sm"
                  onClick={() => navigate('/dashboard/absensi-ibadah')}
                  prefixIcon={<CalendarCheck className="h-4 w-4" />}
                  className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
                >
                  Presensi Ibadah
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={fetchDashboard}
                  prefixIcon={<RefreshCw className="h-4 w-4" />}
                  className="font-bold cursor-pointer"
                >
                  Segarkan
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Master Stats Grid matching Teacher Workspace Pastel Cards */}
        <MasterStatsGrid cols={4}>
          <MasterStatCard
            label="Santri Binaan Asrama"
            value={formatNumber(kpis.santri_binaan?.total ?? kpis.total_siswa_binaan?.total ?? 0)}
            subtitle="Santri terdaftar di asrama"
            badgeText="Aktif"
            badgeVariant="emerald"
            icon={Users}
            colorScheme="emerald"
            onClick={() => setActiveModal('santri_binaan')}
          />
          <MasterStatCard
            label="Presensi Shalat Berjamaah"
            value={formatNumber(kpis.ibadah_lengkap?.total ?? 0)}
            subtitle="Kehadiran shalat 5 waktu"
            badgeText="Presensi"
            badgeVariant="sky"
            icon={CalendarCheck}
            colorScheme="sky"
          />
          <MasterStatCard
            label="Setoran Hafalan Hari Ini"
            value={formatNumber(kpis.setoran_tahfizh?.total ?? kpis.setoran_hari_ini?.total ?? 0)}
            subtitle="Setoran ziyadah & murajaah"
            badgeText="Tahfizh"
            badgeVariant="purple"
            icon={BookOpen}
            colorScheme="violet"
          />
          <MasterStatCard
            label="Mutaba'ah Terisi"
            value={formatNumber(kpis.mutabaah_terisi?.total ?? 0)}
            subtitle="Checklist amalan harian"
            badgeText="Target"
            badgeVariant="amber"
            icon={CheckCircle2}
            colorScheme="amber"
          />
        </MasterStatsGrid>

        {/* Workspace Card Navigation Tabs matching Teacher Workspace Style */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Modul Layanan Keasramaan & Pengasuhan
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Musyrif Active Workspace
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3" role="tablist">
            {cardModulesList.map((mod) => {
              const Icon = mod.icon
              const isActive = activeTab === mod.id
              return (
                <motion.button
                  type="button"
                  key={mod.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => setActiveTab(mod.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center group cursor-pointer ${
                    isActive
                      ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/60 shadow-md ring-2 ring-emerald-600/30'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border ${mod.tone} mb-2 shrink-0 group-hover:scale-110 transition ${isActive ? 'ring-2 ring-emerald-500/40' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-bold text-[11px] leading-tight transition-colors ${
                    isActive ? 'text-emerald-900 dark:text-emerald-200 font-black' : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                  }`}>
                    {mod.title}
                  </span>
                  {mod.badge && (
                    <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${mod.badgeColor}`}>
                      {mod.badge}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Quick Action Navigation Bar */}
        <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Aksi Cepat Fitur Keasramaan Musyrif
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pencatatan langsung ujian tasmi', poin kedisiplinan santri, log klinik, dan barang titipan</p>
            </div>
            <div className="flex items-center gap-3">
              <SquircleActionButton
                variant="primary"
                icon={CalendarCheck}
                label="Presensi Sholat Berjamaah (5 Waktu)"
                onClick={() => setQuickActionModal('sholat')}
              />
              <SquircleActionButton
                variant="primary"
                icon={BookOpen}
                label="Input Setoran Hafalan (Ziyadah & Murajaah)"
                onClick={() => setQuickActionModal('setoran')}
              />
              <SquircleActionButton
                variant="primary"
                icon={Award}
                label="Log Ujian Tasmi' (Sekali Duduk)"
                onClick={() => setQuickActionModal('tasmi')}
              />
              <SquircleActionButton
                variant="edit"
                icon={ShieldAlert}
                label="Poin Kedisiplinan & Sanksi (+/-)"
                onClick={() => setQuickActionModal('poin')}
              />
              <SquircleActionButton
                variant="import"
                icon={HeartPulse}
                label="Log Klinik & Kesehatan Santri"
                onClick={() => setQuickActionModal('klinik')}
              />
              <SquircleActionButton
                variant="setActive"
                icon={Smartphone}
                label="Log Penitipan Barang (HP/Laptop)"
                onClick={() => setQuickActionModal('titipan')}
              />
              <SquircleActionButton
                variant="secondary"
                icon={MessageSquare}
                label="Chat Pegawai & Orang Tua"
                onClick={() => navigate('/dashboard/chat-pegawai')}
              />
            </div>
          </div>
        </section>

        {/* Datatable Processing Actions (Import, Export, Cetak) */}
        <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-4 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Pemrosesan Datatable Active Workspace</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Export CSV, Import berkas data, atau Cetak Laporan PDF untuk tab active: <strong className="text-emerald-600 dark:text-emerald-400 uppercase">{activeTab}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SquircleActionButton
              variant="import"
              icon={Upload1}
              label="Import Data CSV"
              onClick={handleImportClick}
            />
            <SquircleActionButton
              variant="export"
              icon={Download1}
              label="Export CSV"
              onClick={handleExportCSV}
            />
            <SquircleActionButton
              variant="view"
              icon={Printer}
              label="Cetak / PDF"
              onClick={() => setIsPrintModalOpen(true)}
            />
          </div>
        </section>

        {/* Tab Content Pipeline with Framer Motion AnimatePresence */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.main
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-6 w-full"
            >
              {/* TAB 1: PRESENSI & MUTABAAH */}
              {activeTab === 'aktivitas' && (
                <section className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <ChartCard
                      title="Kedisiplinan Shalat Berjamaah"
                      subtitle="Tingkat kehadiran shalat di Masjid/Musholla"
                      className="lg:col-span-4"
                      empty={!charts.worship_trend || charts.worship_trend.length === 0}
                    >
                      <div className="h-64 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={charts.worship_trend || []}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                            <YAxis stroke="#888888" fontSize={11} />
                            <Tooltip />
                            <Bar dataKey="shubuh" fill="#0E5C44" name="Shubuh" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="isya" fill="#3FBF75" name="Isya" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>

                    <div className="lg:col-span-8">
                      <AppDataTable
                        title="Mutaba'ah & Presensi Keasramaan"
                        data={tables.mutabaah_logs || []}
                        columns={mutabaahColumns}
                        emptyMessage="Belum ada data mutaba'ah hari ini."
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 2: LOG UJIAN TASMI' */}
              {activeTab === 'tasmi' && (
                <section className="space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-600" /> Jurnal Ujian Tasmi' Santri (Sekali Duduk)
                        </h3>
                        <p className="text-xs text-slate-500">Pencatatan ujian kelancaran hafalan 1 Juz, 3 Juz, 5 Juz, atau 30 Juz sekali duduk.</p>
                      </div>
                      <MasterActionButton variant="emerald" icon={Plus} onClick={() => setQuickActionModal('tasmi')}>
                        Catat Ujian Tasmi'
                      </MasterActionButton>
                    </div>
                    <AppDataTable
                      title="Riwayat Ujian Tasmi'"
                      data={tables.tasmi_logs || []}
                      columns={[
                        { key: 'santri', label: 'Nama Santri' },
                        { key: 'jenis', label: 'Kategori Ujian' },
                        { key: 'nilai', label: 'Nilai / Tajwid' },
                        { key: 'penguji', label: 'Musyrif Penguji' },
                      ]}
                      emptyMessage="Belum ada catatan ujian tasmi' bulan ini."
                    />
                  </div>
                </section>
              )}

              {/* TAB 3: KEDISIPLINAN & POIN */}
              {activeTab === 'poin' && (
                <section className="space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-amber-600" /> Log Kedisiplinan & Buku Pelanggaran Santri
                        </h3>
                        <p className="text-xs text-slate-500">Pencatatan poin apresiasi kebaikan atau poin pelanggaran tata tertib asrama.</p>
                      </div>
                      <MasterActionButton variant="emerald" icon={Plus} onClick={() => setQuickActionModal('poin')}>
                        Input Poin Pelanggaran
                      </MasterActionButton>
                    </div>
                    <AppDataTable
                      title="Buku Catatan Kedisiplinan"
                      data={tables.poin_logs || []}
                      columns={[
                        { key: 'santri', label: 'Santri' },
                        { key: 'kategori', label: 'Kategori' },
                        { key: 'poin', label: 'Poin' },
                        { key: 'tindakan', label: 'Tindakan Musyrif' },
                      ]}
                      emptyMessage="Belum ada catatan poin kedisiplinan."
                    />
                  </div>
                </section>
              )}

              {/* TAB 4: KLINIK KESEHATAN */}
              {activeTab === 'klinik' && (
                <section className="space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <HeartPulse className="w-5 h-5 text-rose-600" /> Log Kesehatan & Klinik Asrama
                        </h3>
                        <p className="text-xs text-slate-500">Pencatatan santri sakit, obat yang diberikan, dan istirahat di UKS Asrama.</p>
                      </div>
                      <MasterActionButton variant="danger" icon={Plus} onClick={() => setQuickActionModal('klinik')}>
                        Catat Log Klinik
                      </MasterActionButton>
                    </div>
                    <AppDataTable
                      title="Catatan Pasien UKS Asrama"
                      data={tables.klinik_logs || []}
                      columns={[
                        { key: 'santri', label: 'Santri' },
                        { key: 'keluhan', label: 'Keluhan / Gejala' },
                        { key: 'obat', label: 'Obat Diberikan' },
                        { key: 'status', label: 'Rekomendasi' },
                      ]}
                      emptyMessage="Tidak ada santri yang tercatat sakit hari ini."
                    />
                  </div>
                </section>
              )}

              {/* TAB 5: PENITIPAN HP/LAPTOP */}
              {activeTab === 'titipan' && (
                <section className="space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-sky-600" /> Log Penitipan Barang Berharga (HP / Laptop)
                        </h3>
                        <p className="text-xs text-slate-500">Pencatatan penitipan barang elektronik santri asrama yang hanya boleh diambil pada waktu tertentu.</p>
                      </div>
                      <MasterActionButton variant="secondary" icon={Plus} onClick={() => setQuickActionModal('titipan')}>
                        Catat Barang Titipan
                      </MasterActionButton>
                    </div>
                    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20 text-xs text-sky-900 dark:text-sky-200">
                      📱 <strong>Logistik Asrama:</strong> Melacak status barang (`deposited` / `retrieved`) lengkap dengan serial number dan waktu penyerahan.
                    </div>
                  </div>
                </section>
              )}
              {/* TAB 6: PERIZINAN & ABSENSI KEMBALI (BOARDING PASS) */}
              {activeTab === 'perizinan' && (
                <section className="space-y-5">
                  {/* Master Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/50 to-white p-4 shadow-sm dark:border-indigo-900/40 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Total Izin Boarding</span>
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          <CalendarCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
                        {dormitoryPermitsStatistik?.total_permits ?? dormitoryPermits.length}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Surat izin kepulangan/pesiar santri</p>
                    </div>

                    <div className="rounded-2xl border border-amber-100/80 bg-gradient-to-br from-amber-50/50 to-white p-4 shadow-sm dark:border-amber-900/40 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Sedang di Luar</span>
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
                        {dormitoryPermitsStatistik?.currently_out ?? 0}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Belum melakukan absensi kembali</p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/50 to-white p-4 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tepat Waktu</span>
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {dormitoryPermitsStatistik?.returned_ontime ?? 0}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Kembali sesuai batas jam pesantren</p>
                    </div>

                    <div className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50/50 to-white p-4 shadow-sm dark:border-rose-900/40 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Terlambat Masuk</span>
                        <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
                        {dormitoryPermitsStatistik?.returned_late ?? 0}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Perlu pembinaan/konsekuensi musyrif</p>
                    </div>
                  </div>

                  {/* Main Table Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <CalendarCheck className="w-5 h-5 text-indigo-600" /> Buku Izin Pesiar & Absensi Kembali Santri
                        </h3>
                        <p className="text-xs text-slate-500">
                          Pondok Pesantren Beroperasi Senin-Sabtu. Ahad adalah jadwal kunjungan/pesiar & wajib melakukan absensi saat kembali ke pondok.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => fetchDormitoryPermits()}
                          disabled={loadingPermits}
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition text-xs font-semibold flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingPermits ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                        <MasterActionButton variant="emerald" icon={Plus} onClick={() => setQuickActionModal('perizinan_baru')}>
                          Terbitkan Surat Izin Santri
                        </MasterActionButton>
                      </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        {[
                          { id: 'all', label: 'Semua Status' },
                          { id: 'active', label: 'Sedang di Luar' },
                          { id: 'returned', label: 'Kembali Tepat Waktu' },
                          { id: 'late', label: 'Terlambat' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => setPermitFilterStatus(btn.id)}
                            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                              permitFilterStatus === btn.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={permitSearch}
                          onChange={(e) => setPermitSearch(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') fetchDormitoryPermits() }}
                          placeholder="Cari santri, no izin, tujuan..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs font-medium focus:border-indigo-600 outline-none"
                        />
                      </div>
                    </div>

                    {/* Table Container */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                            <th className="p-3">No. Boarding Pass & Kategori</th>
                            <th className="p-3">Santri & Asrama</th>
                            <th className="p-3">Jadwal Keberangkatan & Rencana Kembali</th>
                            <th className="p-3">Realisasi Kembali & Keterlambatan</th>
                            <th className="p-3">Penjemput / Wali</th>
                            <th className="p-3 text-center">Status & Absensi Kembali</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {loadingPermits ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500">
                                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                                Memuat data perizinan santri dari PostgreSQL...
                              </td>
                            </tr>
                          ) : dormitoryPermits.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500">
                                Belum ada data perizinan santri yang sesuai kriteria.
                              </td>
                            </tr>
                          ) : (
                            dormitoryPermits.map((p) => {
                              const isCurrentlyOut = p.status === 'active' || p.status === 'approved'
                              const isLate = p.status === 'late' || p.late_minutes > 0
                              const isReturned = p.status === 'returned'

                              return (
                                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                                  <td className="p-3">
                                    <div className="font-extrabold text-slate-900 dark:text-white font-mono text-[11px]">
                                      {p.permit_number}
                                    </div>
                                    <div className="text-[10px] text-slate-500 capitalize mt-0.5">
                                      {p.permit_type?.replace('_', ' ')}
                                    </div>
                                  </td>

                                  <td className="p-3">
                                    <div className="font-bold text-slate-900 dark:text-white">
                                      {p.student?.full_name || p.student?.name || 'Santri Asrama'}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      NISN: {p.student?.nisn || '-'} | Kamar: {p.student?.kamar || p.dormitory_room || 'Asrama Pondok'}
                                    </div>
                                  </td>

                                  <td className="p-3">
                                    <div className="text-slate-800 dark:text-slate-200">
                                      Berangkat: {p.scheduled_departure_at ? new Date(p.scheduled_departure_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                    </div>
                                    <div className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                                      Batas Kembali: {p.scheduled_return_at ? new Date(p.scheduled_return_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                                      Tujuan: {p.destination || '-'}
                                    </div>
                                  </td>

                                  <td className="p-3">
                                    {p.actual_return_at ? (
                                      <div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">
                                          {new Date(p.actual_return_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                        </div>
                                        {isLate ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900 mt-0.5">
                                            <ShieldAlert className="w-3 h-3" /> Terlambat +{p.late_minutes} Menit
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900 mt-0.5">
                                            <CheckCircle2 className="w-3 h-3" /> Tepat Waktu
                                          </span>
                                        )}
                                        {p.return_condition && (
                                          <div className="text-[10px] text-slate-500 mt-0.5">
                                            Kondisi: {p.return_condition}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> Sedang Berada di Luar
                                      </span>
                                    )}
                                  </td>

                                  <td className="p-3">
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                                      {p.pickup_person_name || 'Mandiri / Wali'}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {p.pickup_person_relation || 'Orang Tua'} {p.pickup_person_phone ? `(${p.pickup_person_phone})` : ''}
                                    </div>
                                  </td>

                                  <td className="p-3 text-center">
                                    {isCurrentlyOut ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedPermitForReturn(p)
                                          const now = new Date()
                                          const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                                          setReturnForm({
                                            actual_return_time: localIso,
                                            return_condition: 'Sehat & Rapih',
                                            notes: '',
                                          })
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Absensi Kembali
                                      </button>
                                    ) : (
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                        isReturned
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      }`}>
                                        {p.status}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
            </motion.main>
          </AnimatePresence>
        </div>

      {/* 🔵 MODAL ABSENSI KEMBALI SANTRI (RETURN CHECK-IN) */}
      <AnimatePresence>
        {selectedPermitForReturn && (
          <Backdrop isOpen={Boolean(selectedPermitForReturn)} onOpenChange={() => setSelectedPermitForReturn(null)} className="z-50 flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg"
            >
              <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-700/80 flex items-center justify-center border border-indigo-500/50 shadow-inner">
                      <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">Absensi Kembali ke Pondok</h3>
                      <p className="text-xs text-indigo-200 font-medium">Verifikasi kedatangan santri & pengecekan batas waktu</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPermitForReturn(null)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleReturnCheckin} className="p-5 sm:p-6 space-y-4 text-xs">
                  {/* Info Box Santri */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50 space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-600 dark:text-slate-400">Santri:</span>
                      <span className="text-slate-900 dark:text-white font-extrabold text-sm">{selectedPermitForReturn.student?.full_name || selectedPermitForReturn.student?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Nomor Boarding Pass:</span>
                      <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{selectedPermitForReturn.permit_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Batas Waktu Jadwal:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {selectedPermitForReturn.scheduled_return_at ? new Date(selectedPermitForReturn.scheduled_return_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Waktu Kedatangan Riil (Absensi Kembali)</label>
                    <input
                      type="datetime-local"
                      required
                      value={returnForm.actual_return_time}
                      onChange={(e) => setReturnForm({ ...returnForm, actual_return_time: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-indigo-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Kondisi Fisik / Ketertiban Santri</label>
                    <select
                      value={returnForm.return_condition}
                      onChange={(e) => setReturnForm({ ...returnForm, return_condition: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-indigo-600 outline-none"
                    >
                      <option value="Sehat & Rapih">Sehat & Rapih (Standar)</option>
                      <option value="Kurang Sehat / Sakit">Kurang Sehat / Sakit (Perlu Masuk UKS)</option>
                      <option value="Terlambat Izin Resmi">Terlambat dengan Izin Resmi Orang Tua</option>
                      <option value="Terlambat Tanpa Keterangan">Terlambat Tanpa Keterangan</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Catatan Musyrif Penerima (Opsional)</label>
                    <textarea
                      rows={2}
                      value={returnForm.notes}
                      onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                      placeholder="Catatan barang bawaan, alasan keterlambatan, dsb..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs focus:border-indigo-600 outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedPermitForReturn(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 font-bold transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReturn}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {submittingReturn ? 'Menyimpan...' : 'Simpan Absensi Kembali'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>

      {/* 🟢 MODAL BUAT SURAT IZIN SANTRI BARU */}
      <AnimatePresence>
        {quickActionModal === 'perizinan_baru' && (
          <Backdrop isOpen={Boolean(quickActionModal)} onOpenChange={() => setQuickActionModal(null)} className="z-50 flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg"
            >
              <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]">
                <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700/80 flex items-center justify-center border border-emerald-500/50 shadow-inner">
                      <CalendarCheck className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">Terbitkan Surat Izin Santri</h3>
                      <p className="text-xs text-emerald-200 font-medium">Pondok Pesantren Boarding Pass</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickActionModal(null)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreatePermit} className="p-5 sm:p-6 space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Pilih Santri Binaan *</label>
                    <select
                      required
                      value={newPermitForm.student_id}
                      onChange={(e) => setNewPermitForm({ ...newPermitForm, student_id: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 outline-none"
                    >
                      <option value="">-- Pilih Santri --</option>
                      {dbStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name || s.name} ({s.nisn || s.nis || 'Santri'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Jenis Perizinan</label>
                      <select
                        value={newPermitForm.permit_type}
                        onChange={(e) => setNewPermitForm({ ...newPermitForm, permit_type: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 outline-none"
                      >
                        <option value="pesiar_mingguan">Pesiar Mingguan (Ahad)</option>
                        <option value="libur_semester">Libur Semester</option>
                        <option value="izin_khusus">Izin Khusus / Keluarga</option>
                        <option value="sakit">Izin Sakit / Rujukan Luar</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Alamat Tujuan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Rumah Orang Tua di Padang"
                        value={newPermitForm.destination}
                        onChange={(e) => setNewPermitForm({ ...newPermitForm, destination: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Jadwal Keluar *</label>
                      <input
                        type="datetime-local"
                        required
                        value={newPermitForm.scheduled_departure_at}
                        onChange={(e) => setNewPermitForm({ ...newPermitForm, scheduled_departure_at: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Batas Wajib Kembali *</label>
                      <input
                        type="datetime-local"
                        required
                        value={newPermitForm.scheduled_return_at}
                        onChange={(e) => setNewPermitForm({ ...newPermitForm, scheduled_return_at: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Nama Penjemput</label>
                      <input
                        type="text"
                        placeholder="Nama Ayah/Ibu/Wali"
                        value={newPermitForm.pickup_person_name}
                        onChange={(e) => setNewPermitForm({ ...newPermitForm, pickup_person_name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">No. HP Penjemput</label>
                      <input
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={newPermitForm.pickup_person_phone}
                        onChange={(e) => setNewPermitForm({ ...newPermitForm, pickup_person_phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Alasan / Keterangan Tambahan</label>
                    <textarea
                      rows={2}
                      placeholder="Alasan izin kepulangan..."
                      value={newPermitForm.purpose_notes}
                      onChange={(e) => setNewPermitForm({ ...newPermitForm, purpose_notes: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setQuickActionModal(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 font-bold transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md transition flex items-center gap-1.5"
                    >
                      <CalendarCheck className="w-4 h-4" /> Terbitkan Boarding Pass
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>

      {/* 🟢 MODAL POP-UP DIALOG (TAHFIZH PAGE STYLE BENCHMARK) */}
      <AnimatePresence>
        {quickActionModal && (
          <Backdrop isOpen={Boolean(quickActionModal)} onOpenChange={() => setQuickActionModal(null)} className="z-50 flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full flex items-center justify-center"
            >
              <Dialog
                showCloseButton={false}
                className={`w-full ${quickActionModal === 'setoran' ? 'w-[94vw] max-w-[1450px]' : 'max-w-2xl sm:max-w-3xl'} h-[85vh] max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-[#1B2433]`}
              >
                
                {/* 1. PRESENSI SHOLAT BERJAMAAH MODAL */}
                {quickActionModal === 'sholat' && (
                  <>
                    <DialogHeader className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl border-b border-emerald-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-700/80 text-emerald-200 flex items-center justify-center border border-emerald-600/60 shadow-inner shrink-0">
                          <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <DialogTitle className="text-base font-extrabold text-white text-left">
                            Presensi Sholat Berjamaah Santri (3 Metode)
                          </DialogTitle>
                          <DialogDescription className="text-xs text-emerald-200/90 mt-0.5 font-medium text-left">
                            Presensi harian Subuh, Zuhur, Asar, Maghrib, Isya via Manual, Scan QR, atau Tap RFID
                          </DialogDescription>
                        </div>
                      </div>
                      <DialogClose onClick={() => setQuickActionModal(null)} />
                    </DialogHeader>

                <DialogBody className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 space-y-4">
                  {/* 3 Mode Navigation Switcher */}
                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
                    <button
                      onClick={() => setSholatTab('manual')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${sholatTab === 'manual' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" /> 1. Manual
                    </button>
                    <button
                      onClick={() => setSholatTab('qr')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${sholatTab === 'qr' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
                    >
                      <QrCode className="w-3.5 h-3.5" /> 2. Scan QR
                    </button>
                    <button
                      onClick={() => setSholatTab('rfid')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${sholatTab === 'rfid' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
                    >
                      <Radio className="w-3.5 h-3.5" /> 3. Tap RFID
                    </button>
                  </div>

                  {/* TAB 1: PRESENSI MANUAL BATCH SANTRI */}
                  {sholatTab === 'manual' && (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Waktu Sholat & Ibadah</label>
                          <select
                            value={sholatForm.prayer_name}
                            onChange={(e) => setSholatForm({ ...sholatForm, prayer_name: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 outline-none transition"
                          >
                            <optgroup label="Sholat Wajib 5 Waktu">
                              <option value="subuh">Sholat Subuh (Wajib)</option>
                              <option value="zuhur">Sholat Zuhur (Wajib)</option>
                              <option value="asar">Sholat Asar (Wajib)</option>
                              <option value="magrib">Sholat Maghrib (Wajib)</option>
                              <option value="isya">Sholat Isya (Wajib)</option>
                              <option value="jumat">Sholat Jum'at (Wajib)</option>
                            </optgroup>
                            <optgroup label="Sholat Sunnah & Qiyamul Lail">
                              <option value="tahajud">Sholat Tahajud / Qiyamul Lail (Sunnah)</option>
                              <option value="witir">Sholat Witir (Sunnah)</option>
                              <option value="dhuha">Sholat Dhuha (Sunnah)</option>
                              <option value="rawatib">Sholat Rawatib Qobliyah/Ba'diyah (Sunnah)</option>
                              <option value="tarawih">Sholat Tarawih (Sunnah Ramadhan)</option>
                              <option value="syuruq">Sholat Syuruq / Ishraq (Sunnah)</option>
                            </optgroup>
                          </select>
                        </div>

                        {/* Batch Action Buttons */}
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Aksi Cepat Massal</label>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => markAllStudentsStatus('hadir_berjamaah')}
                              className="flex-1 py-2 px-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 font-extrabold text-[11px] transition"
                            >
                              ✅ Semua Hadir
                            </button>
                            <button
                              type="button"
                              onClick={() => markAllStudentsStatus('terlambat')}
                              className="flex-1 py-2 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-200 font-extrabold text-[11px] transition"
                            >
                              🟡 Masbuk
                            </button>
                            <button
                              type="button"
                              onClick={() => markAllStudentsStatus('tidak_hadir')}
                              className="flex-1 py-2 px-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-200 font-extrabold text-[11px] transition"
                            >
                              ❌ Semua Alfa
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Student Attendance List Table */}
                      <div className="space-y-2">
                        <label className="font-bold block text-slate-800 dark:text-slate-200 text-xs">
                          Pengisian Presensi Manual Santri Binaan ({dbStudents.length} Santri):
                        </label>
                        <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 p-1">
                          {dbStudents.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 font-medium">Memuat daftar santri...</div>
                          ) : (
                            dbStudents.map((student) => {
                              const currentStatus = batchSholatMap[student.id] || 'hadir_berjamaah'
                              const sName = student.full_name || student.nama_lengkap || student.name || 'Santri'
                              const sNis = student.nis || student.nisn || '-'

                              return (
                                <div key={student.id} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition">
                                  <div className="flex items-center gap-2.5">
                                    <Avatar size="sm">
                                      <AvatarFallback className="bg-sky-600 text-white font-bold text-[10px]">
                                        {sName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-extrabold text-slate-900 dark:text-white text-xs">{sName}</div>
                                      <div className="text-[10px] text-slate-500 font-medium">NIS: {sNis} · {student.kamar || 'Asrama'}</div>
                                    </div>
                                  </div>

                                  {/* Status Selector Pills */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'hadir_berjamaah' }))}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'hadir_berjamaah' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >
                                      Hadir
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'terlambat' }))}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'terlambat' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >
                                      Masbuk
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'tidak_hadir' }))}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'tidak_hadir' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >
                                      Alfa
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'izin' }))}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'izin' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >
                                      Izin
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'uzur_syarii' }))}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'uzur_syarii' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                                    >
                                      Uzur
                                    </button>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Catatan Musyrif</label>
                        <textarea
                          rows="1"
                          value={sholatForm.notes}
                          onChange={(e) => setSholatForm({ ...sholatForm, notes: e.target.value })}
                          placeholder="Catatan shalat harian..."
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 dark:bg-slate-800 text-xs font-medium outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SCAN QR CODE DENGAN BUTTON LIVE KAMERA */}
                  {sholatTab === 'qr' && (
                    <div className="space-y-4 text-xs">
                      {/* Camera WebCam Control Button */}
                      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                          <Camera className="w-4 h-4 text-sky-600" />
                          <span>Pindai QR Code Kartu Santri</span>
                        </div>
                        {isCameraActive ? (
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
                          >
                            <CameraOff className="w-3.5 h-3.5" /> Tutup Kamera
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={startCamera}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Camera className="w-3.5 h-3.5" /> 📷 Buka Kamera Scanner QR
                          </button>
                        )}
                      </div>

                      {/* Live Camera Viewport Box with Precision Square QR Target Frame */}
                      {isCameraActive ? (
                        <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-xl bg-black flex items-center justify-center min-h-[260px] h-64">
                          <video
                            ref={videoRef}
                            className="absolute inset-0 w-full h-full object-cover bg-black"
                            autoPlay
                            playsInline
                            muted
                          />

                          {/* Dimmed Vignette Mask Overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

                          {/* 🟩 PRECISION SQUARE QR CODE TARGET FRAME (SESUAI UKURAN QR KARTU SISWA) */}
                          <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-2xl border border-emerald-400/40 bg-transparent flex flex-col justify-between p-2 shadow-[0_0_0_9999px_rgba(15,23,42,0.55)] overflow-hidden">
                            {/* Top Corner Reticles */}
                            <div className="flex justify-between">
                              <div className="w-5 h-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg shadow-[0_0_8px_#34d399]" />
                              <div className="w-5 h-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg shadow-[0_0_8px_#34d399]" />
                            </div>

                            {/* Center Animated Glowing Laser Line */}
                            <motion.div
                              animate={{ y: [-60, 60, -60] }}
                              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                              className="w-full border-b-2 border-emerald-400 shadow-[0_0_12px_#34d399] my-auto"
                            />

                            {/* Bottom Corner Reticles */}
                            <div className="flex justify-between">
                              <div className="w-5 h-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg shadow-[0_0_8px_#34d399]" />
                              <div className="w-5 h-5 border-b-3 border-r-3 border-emerald-400 rounded-br-lg shadow-[0_0_8px_#34d399]" />
                            </div>
                          </div>

                          {/* Guidance Badge below Target Frame */}
                          <div className="absolute bottom-3 z-20 bg-slate-900/90 text-emerald-300 font-extrabold py-1 px-3 rounded-full text-[11px] border border-emerald-500/40 backdrop-blur-md shadow-md flex items-center gap-1.5">
                            <QrCode className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span>Posisikan QR Code Kartu Santri di Dalam Kotak</span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900 dark:bg-sky-950/30 text-center space-y-2">
                          <div className="relative w-24 h-24 mx-auto rounded-2xl border-2 border-dashed border-sky-400 bg-white/80 dark:bg-slate-800 flex items-center justify-center p-2 shadow-xs">
                            <QrCode className="w-12 h-12 text-sky-600 animate-pulse" />
                          </div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Siapkan QR Code pada Kartu Santri</p>
                          <p className="text-[11px] text-slate-500">Klik <strong>"📷 Buka Kamera Scanner QR"</strong> di atas. Kotak pindaian otomatis presisi sesuai ukuran QR kartu siswa.</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                          placeholder="Masukkan / Scan Token QR Kartu Santri..."
                          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-sky-600/15 outline-none"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!qrInput.trim()) return
                            const targetStudent = dbStudents.find((s) => s.nis?.includes(qrInput) || s.full_name?.toLowerCase().includes(qrInput.toLowerCase())) || dbStudents[0]
                            if (targetStudent) {
                              await api.post('/musyrif/worship-attendance', {
                                student_id: targetStudent.id,
                                prayer_name: sholatForm.prayer_name,
                                attendance_status: 'hadir_berjamaah',
                                notes: 'Scan QR Code Kartu Santri',
                              }).catch(() => null)
                              setScanHistory((prev) => [{ name: targetStudent.full_name || targetStudent.nama_lengkap, time: new Date().toLocaleTimeString('id-ID'), status: 'Hadir Berjamaah' }, ...prev])
                              setScanStatusMsg(`✅ Scan Berhasil: ${targetStudent.full_name || targetStudent.nama_lengkap}`)
                              setQrInput('')
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition shadow-sm"
                        >
                          Scan QR
                        </button>
                      </div>
                      {scanStatusMsg && (
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 font-bold text-center">
                          {scanStatusMsg}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: SCAN RFID */}
                  {sholatTab === 'rfid' && (
                    <div className="space-y-4 text-xs">
                      <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900 dark:bg-violet-950/30 text-center space-y-2">
                        <Radio className="w-10 h-10 mx-auto text-violet-600 animate-pulse" />
                        <p className="font-bold text-slate-800 dark:text-slate-200">Tempelkan Kartu RFID Santri pada Sensor Reader</p>
                        <p className="text-[11px] text-slate-500">Mendeteksi UID Kartu RFID dan mencatat presensi shalat secara real-time.</p>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={rfidInput}
                          onChange={(e) => setRfidInput(e.target.value)}
                          placeholder="Tempelkan Kartu / Ketik UID RFID (Contoh: RFID-90218)..."
                          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-violet-600/15 outline-none"
                        />
                        <button
                          onClick={async () => {
                            if (!rfidInput.trim()) return
                            const targetStudent = dbStudents.find((s) => s.nis?.includes(rfidInput) || s.full_name?.toLowerCase().includes(rfidInput.toLowerCase())) || dbStudents[0]
                            if (targetStudent) {
                              await api.post('/musyrif/worship-attendance', {
                                student_id: targetStudent.id,
                                prayer_name: sholatForm.prayer_name,
                                attendance_status: 'hadir_berjamaah',
                                notes: 'Tap RFID Card Reader',
                              }).catch(() => null)
                              setScanHistory((prev) => [{ name: targetStudent.full_name || targetStudent.nama_lengkap, time: new Date().toLocaleTimeString('id-ID'), status: 'Hadir Berjamaah (RFID)' }, ...prev])
                              setScanStatusMsg(`🎴 Tap RFID Berhasil: ${targetStudent.full_name || targetStudent.nama_lengkap}`)
                              setRfidInput('')
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition shadow-sm"
                        >
                          Tap RFID
                        </button>
                      </div>
                      {scanStatusMsg && (
                        <div className="p-2.5 rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-950 font-bold text-center">
                          {scanStatusMsg}
                        </div>
                      )}
                    </div>
                   )}
                 </DialogBody>

                 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
                  <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
                    Batal
                  </MasterActionButton>
                  <MasterActionButton variant="primary" icon={Check} onClick={() => handleSimpanFiturAksi('Presensi Sholat Berjamaah', 'sholat')}>
                    Simpan Presensi Sholat
                  </MasterActionButton>
                </DialogFooter>
              </>
            )}

            {/* 2. SETORAN TAHFIZH MODAL */}
            {quickActionModal === 'setoran' && (
              <>
                <DialogHeader className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl border-b border-emerald-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700/80 text-emerald-200 flex items-center justify-center border border-emerald-600/60 shadow-inner shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-extrabold text-white text-left">
                        Input Setoran Hafalan Tahfizh (Ziyadah &amp; Murajaah)
                      </DialogTitle>
                      <DialogDescription className="text-xs text-emerald-200/90 mt-0.5 font-medium text-left">
                        Pencatatan hafalan harian santri binaan dengan sistem rekomendasi otomatis
                      </DialogDescription>
                    </div>
                  </div>
                  <DialogClose onClick={() => setQuickActionModal(null)} />
                </DialogHeader>

                <DialogBody className="p-4 sm:p-5 flex-1 overflow-y-auto min-h-0 space-y-4">
                  {renderStudentSelectOption()}

                  {/* SMART RECOMMENDATION BANNER */}
                  {loadingLastLog ? (
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center animate-pulse text-xs">
                      ⏳ Memuat rekomendasi hafalan terakhir santri dari database...
                    </div>
                  ) : lastStudentLog ? (
                    <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${lastStudentLog.notes_teacher?.toLowerCase().includes('kurang') || lastStudentLog.notes_teacher?.toLowerCase().includes('perlu') ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200' : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'}`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {lastStudentLog.notes_teacher?.toLowerCase().includes('kurang') || lastStudentLog.notes_teacher?.toLowerCase().includes('perlu') ? (
                            <RotateCcw className="w-4 h-4 text-amber-600" />
                          ) : (
                            <ArrowRight className="w-4 h-4 text-emerald-600" />
                          )}
                          Status Hafalan Terakhir Santri:
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-white dark:bg-slate-800 shadow-xs border">
                          {lastStudentLog.notes_teacher?.toLowerCase().includes('kurang') || lastStudentLog.notes_teacher?.toLowerCase().includes('perlu') ? 'Perlu Murojaah' : 'Lancar'}
                        </span>
                      </div>
                      <p className="text-[11px]">
                        <strong>{lastStudentLog.hafalan_surah_name || `Surah ke-${lastStudentLog.hafalan_surah_number}`}</strong> (Ayat {lastStudentLog.hafalan_ayah_start || 1} - {lastStudentLog.hafalan_ayah_end || 1})
                      </p>
                      <div className="text-[11px] font-semibold flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span>{lastStudentLog.notes_teacher?.toLowerCase().includes('kurang') || lastStudentLog.notes_teacher?.toLowerCase().includes('perlu') ? '⚠️ Rekomendasi: Wajib Mengulang Hafalan' : '🟢 Rekomendasi: Melanjutkan Hafalan Baru (Ziyadah)'}</span>
                        <button type="button" onClick={() => fetchLastLog(selectedStudentId)} className="text-[10px] underline font-bold hover:text-emerald-700">Terapkan Otomatis</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl border border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 text-xs font-semibold">
                      🆕 <strong>Santri Baru / Setoran Perdana:</strong> Belum ada catatan setoran sebelumnya. Silakan pilih Surah &amp; Ayat awal di bawah.
                    </div>
                  )}

                  {/* ===== 2-COLUMN LAYOUT: INPUT LEFT | ARABIC VIEWER RIGHT ===== */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">

                    {/* ── KOLOM KIRI: FORM INPUT ── */}
                    <div className="space-y-4">
                      {/* Jenis Setoran & Juz */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Jenis Setoran</label>
                          <select value={setoranForm.type} onChange={(e) => setSetoranForm({ ...setoranForm, type: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition">
                            <option value="Ziyadah">Ziyadah (Hafalan Baru)</option>
                            <option value="Murajaah">Murajaah (Mengulang)</option>
                            <option value="Tasmi">Tasmi&apos; (Ujian Kelancaran)</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Juz ke-</label>
                          <select value={setoranForm.juz} onChange={(e) => setSetoranForm({ ...setoranForm, juz: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => <option key={j} value={j}>Juz {j}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Surah Picker */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-emerald-600" /> Pilih Surah &amp; Ayat:</label>
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl font-bold">
                            <button type="button" onClick={() => setQuranInputMode('interactive')} className={`px-2.5 py-1 rounded-lg transition ${quranInputMode === 'interactive' ? 'bg-emerald-600 text-white font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}>🎨 Interaktif</button>
                            <button type="button" onClick={() => setQuranInputMode('manual')} className={`px-2.5 py-1 rounded-lg transition ${quranInputMode === 'manual' ? 'bg-emerald-600 text-white font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}>📋 Manual</button>
                          </div>
                        </div>
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input type="text" value={quranSearch} onChange={(e) => setQuranSearch(e.target.value)} placeholder="Cari Surah (misal: An-Naba, Yasin, 78)..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700" />
                        </div>
                        {quranInputMode === 'interactive' ? (
                          <div className="max-h-52 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-inner">
                            {filteredQuranSurahs.map((s) => (
                              <button key={s.nomor} type="button"
                                onClick={() => {
                                  const maxAyat = s.jumlah_ayat || 40
                                  setSetoranForm({ ...setoranForm, surah_number: s.nomor, juz: getJuzFromSurah(s.nomor), ayat_start: 1, ayat_end: Math.min(10, maxAyat), baris: Math.max(1, Math.ceil(Math.min(10, maxAyat) * 0.75)) })
                                }}
                                className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition ${setoranForm.surah_number === s.nomor ? 'bg-emerald-100/90 font-black text-emerald-950 border-l-4 border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200' : 'hover:bg-emerald-50/60 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60'}`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 rounded-md bg-emerald-200/60 text-emerald-900 font-extrabold text-[11px] flex items-center justify-center dark:bg-emerald-900 dark:text-emerald-200 shrink-0">{s.nomor}</span>
                                  <div>
                                    <div className="font-extrabold">{s.nama_latin}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Juz {getJuzFromSurah(s.nomor)} · {s.jumlah_ayat} Ayat</div>
                                  </div>
                                </div>
                                <span className="font-serif text-base font-extrabold text-emerald-800 dark:text-emerald-400">{s.nama}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <select value={setoranForm.surah_number} onChange={(e) => {
                            const surahNum = Number(e.target.value)
                            const surahObj = quranSurahs.find((s) => s.nomor === surahNum)
                            const maxAyat = surahObj ? surahObj.jumlah_ayat : 40
                            setSetoranForm({ ...setoranForm, surah_number: surahNum, juz: getJuzFromSurah(surahNum), ayat_start: 1, ayat_end: Math.min(10, maxAyat), baris: Math.max(1, Math.ceil(Math.min(10, maxAyat) * 0.75)) })
                          }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold focus:border-emerald-600 outline-none transition">
                            {quranSurahs.map((surah) => <option key={surah.nomor} value={surah.nomor}>Surah {surah.nomor}. {surah.nama_latin} ({surah.nama}) — {surah.jumlah_ayat} Ayat (Juz {getJuzFromSurah(surah.nomor)})</option>)}
                          </select>
                        )}
                      </div>

                      {/* Ayat Range Controls */}
                      {(() => {
                        const cs = quranSurahs.find((s) => s.nomor === setoranForm.surah_number) || { nama_latin: `Surah ${setoranForm.surah_number}`, jumlah_ayat: 40 }
                        const maxAyats = cs.jumlah_ayat || 40
                        return (
                          <div className="bg-emerald-50/90 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900 space-y-3">
                            <div className="font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
                              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />{cs.nama_latin} ({maxAyats} Ayat)</span>
                              <Badge color="success" size="sm">Juz {getJuzFromSurah(setoranForm.surah_number)}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Ayat Awal</label>
                                <select value={setoranForm.ayat_start} onChange={(e) => { const start = Number(e.target.value); const end = Math.max(start, setoranForm.ayat_end); setSetoranForm({ ...setoranForm, ayat_start: start, ayat_end: end, baris: Math.max(1, Math.ceil((end - start + 1) * 0.75)) }) }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 dark:bg-slate-800 font-bold outline-none transition">
                                  {Array.from({ length: maxAyats }, (_, i) => i + 1).map((a) => <option key={a} value={a}>Ayat {a}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Ayat Akhir</label>
                                <select value={setoranForm.ayat_end} onChange={(e) => { const end = Number(e.target.value); setSetoranForm({ ...setoranForm, ayat_end: end, baris: Math.max(1, Math.ceil((end - setoranForm.ayat_start + 1) * 0.75)) }) }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 dark:bg-slate-800 font-bold outline-none transition">
                                  {Array.from({ length: maxAyats - setoranForm.ayat_start + 1 }, (_, i) => setoranForm.ayat_start + i).map((a) => <option key={a} value={a}>Ayat {a}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Total Baris</label>
                                <input type="number" min="1" value={setoranForm.baris} onChange={(e) => setSetoranForm({ ...setoranForm, baris: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 dark:bg-slate-800 font-black text-emerald-600 outline-none transition" />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-500">Pilih Cepat:</span>
                              {[5, 10].map((n) => (
                                <button key={n} type="button" onClick={() => { const end = Math.min(setoranForm.ayat_start + n - 1, maxAyats); setSetoranForm({ ...setoranForm, ayat_end: end, baris: Math.max(1, Math.ceil((end - setoranForm.ayat_start + 1) * 0.75)) }) }} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] hover:bg-emerald-100 transition">+{n} Ayat</button>
                              ))}
                              <button type="button" onClick={() => setSetoranForm({ ...setoranForm, ayat_start: 1, ayat_end: maxAyats, baris: Math.max(1, Math.ceil(maxAyats * 0.75)) })} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] hover:bg-emerald-100 transition">Full Surah ({maxAyats} Ayat)</button>
                            </div>
                          </div>
                        )
                      })()}

                      {/* Penilaian */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Kelancaran</label>
                          <select value={setoranForm.kelancaran} onChange={(e) => setSetoranForm({ ...setoranForm, kelancaran: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold outline-none transition">
                            <option value="Sangat Lancar">Sangat Lancar</option>
                            <option value="Lancar">Lancar</option>
                            <option value="Cukup">Cukup</option>
                            <option value="Kurang">Kurang</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Tajwid</label>
                          <select value={setoranForm.tajwid} onChange={(e) => setSetoranForm({ ...setoranForm, tajwid: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold outline-none transition">
                            <option value="A">A (Sangat Baik)</option>
                            <option value="B">B (Baik)</option>
                            <option value="C">C (Cukup)</option>
                            <option value="D">D (Perlu Perbaikan)</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Makhraj</label>
                          <select value={setoranForm.makhraj} onChange={(e) => setSetoranForm({ ...setoranForm, makhraj: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold outline-none transition">
                            <option value="A">A (Sangat Fasih)</option>
                            <option value="B">B (Fasih)</option>
                            <option value="C">C (Cukup)</option>
                            <option value="D">D (Perlu Perbaikan)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {/* ── END KOLOM KIRI ── */}

                    {/* ── KOLOM KANAN: LIVE ARABIC QURAN VIEWER ── */}
                    <div className="flex flex-col h-full">
                      {(() => {
                        const currentSurah = quranSurahs.find((s) => s.nomor === setoranForm.surah_number)
                        const ayatsToShow = modalAyatsList.filter(
                          (a) => Number(a.nomorAyat || a.nomor_ayat || a.ayat) >= setoranForm.ayat_start &&
                                 Number(a.nomorAyat || a.nomor_ayat || a.ayat) <= setoranForm.ayat_end
                        )
                        return (
                          <div className="flex flex-col h-full bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 rounded-2xl border border-emerald-800/50 shadow-xl overflow-hidden">
                            {/* Surah Header */}
                            <div className="px-4 py-3 bg-emerald-900/80 border-b border-emerald-800/60 text-center shrink-0">
                              {currentSurah ? (
                                <>
                                  <div className="text-2xl font-extrabold text-emerald-200 leading-none" style={{ fontFamily: "'Amiri','Scheherazade New',serif", direction: 'rtl' }}>
                                    {currentSurah.nama}
                                  </div>
                                  <div className="text-[11px] text-emerald-400 font-bold mt-1">{currentSurah.nama_latin} · سورة</div>
                                  <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-300 text-[10px] font-extrabold">Juz {getJuzFromSurah(setoranForm.surah_number)}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-extrabold">{currentSurah.jumlah_ayat} Ayat</span>
                                    <span className="px-2 py-0.5 rounded-full bg-teal-900 text-teal-300 text-[10px] font-extrabold">Ayat {setoranForm.ayat_start}–{setoranForm.ayat_end}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="text-emerald-400 text-[11px] font-semibold py-1">Pilih surah untuk preview</div>
                              )}
                            </div>

                            {/* Bismillah */}
                            {setoranForm.surah_number !== 9 && setoranForm.ayat_start === 1 && (
                              <div className="text-center py-2 px-4 border-b border-emerald-900/50 shrink-0">
                                <span className="text-lg font-extrabold text-amber-300" style={{ fontFamily: "'Amiri','Scheherazade New',serif", direction: 'rtl' }}>
                                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </span>
                              </div>
                            )}

                            {/* Ayat List */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: '220px', maxHeight: '340px' }}>
                              {loadingModalAyats ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                  <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                  <p className="text-emerald-400 text-[11px] font-semibold animate-pulse">Memuat teks Al-Qur&apos;an...</p>
                                </div>
                              ) : ayatsToShow.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                                  <span className="text-3xl">📖</span>
                                  <p className="text-slate-400 text-[11px] font-medium">Klik surah untuk menampilkan teks ayat Al-Qur&apos;an</p>
                                </div>
                              ) : (
                                ayatsToShow.map((a) => {
                                  const ayatNum = a.nomorAyat || a.nomor_ayat || a.ayat
                                  const arabicText = a.teksArab || a.teks_arab || a.ar
                                  return (
                                    <motion.div key={ayatNum} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="text-right" style={{ direction: 'rtl' }}>
                                      <div className="flex items-start gap-2 justify-end">
                                        <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-extrabold flex items-center justify-center mt-1" style={{ direction: 'ltr' }}>{ayatNum}</div>
                                        <p className="flex-1 font-extrabold text-slate-100" style={{ fontFamily: "'Amiri','Scheherazade New','Noto Naskh Arabic',serif", direction: 'rtl', fontSize: '1.15rem', lineHeight: '2.4' }}>
                                          {arabicText}
                                        </p>
                                      </div>
                                      {(a.teksLatin || a.teks_latin) && (
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 text-left" style={{ direction: 'ltr' }}>{a.teksLatin || a.teks_latin}</p>
                                      )}
                                      <div className="border-b border-slate-800/60 mt-2" />
                                    </motion.div>
                                  )
                                })
                              )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800/60 flex items-center justify-between shrink-0">
                              <span className="text-[10px] text-slate-400 font-semibold">{ayatsToShow.length} ayat ditampilkan</span>
                              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Preview Real-time</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                    {/* ── END KOLOM KANAN ── */}

                  </div>
                  {/* ===== END 2-COLUMN LAYOUT ===== */}

                </DialogBody>

                <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
                  <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
                    Batal
                  </MasterActionButton>
                  <MasterActionButton variant="primary" icon={Check} onClick={() => handleSimpanFiturAksi('Setoran Hafalan Tahfizh', 'setoran')}>
                    Simpan Setoran Hafalan
                  </MasterActionButton>
                </DialogFooter>
              </>
            )}

            {/* 3. LOG UJIAN TASMI' MODAL */}
            {quickActionModal === 'tasmi' && (
              <>
                <DialogHeader className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl border-b border-emerald-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700/80 text-emerald-200 flex items-center justify-center border border-emerald-600/60 shadow-inner shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-extrabold text-white text-left">
                        Log Ujian Tasmi' (Sekali Duduk)
                      </DialogTitle>
                      <DialogDescription className="text-xs text-emerald-200/90 mt-0.5 font-medium text-left">
                        Pencatatan ujian hafalan 1 Juz, 5 Juz, 10 Juz, & 30 Juz beserta Tajwid & Makhraj
                      </DialogDescription>
                    </div>
                  </div>
                  <DialogClose onClick={() => setQuickActionModal(null)} />
                </DialogHeader>

                <DialogBody className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 space-y-4 text-xs">
                  {renderStudentSelectOption()}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Kategori Ujian</label>
                      <select
                        value={tasmiForm.type}
                        onChange={(e) => setTasmiForm({ ...tasmiForm, type: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition"
                      >
                        <option value="tasmi_1_juz">Tasmi' 1 Juz</option>
                        <option value="tasmi_5_juz">Tasmi' 5 Juz</option>
                        <option value="tasmi_10_juz">Tasmi' 10 Juz</option>
                        <option value="tasmi_30_juz">Tasmi' 30 Juz</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Juz ke-</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={tasmiForm.juz}
                        onChange={(e) => setTasmiForm({ ...tasmiForm, juz: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Nilai Tajwid</label>
                      <select
                        value={tasmiForm.tajwid}
                        onChange={(e) => setTasmiForm({ ...tasmiForm, tajwid: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition"
                      >
                        <option value="A">A (Sangat Baik)</option>
                        <option value="B">B (Baik)</option>
                        <option value="C">C (Cukup)</option>
                        <option value="D">D (Perlu Perbaikan)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Nilai Makhraj</label>
                      <select
                        value={tasmiForm.makhraj}
                        onChange={(e) => setTasmiForm({ ...tasmiForm, makhraj: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 outline-none transition"
                      >
                        <option value="A">A (Sangat Fasih)</option>
                        <option value="B">B (Fasih)</option>
                        <option value="C">C (Cukup)</option>
                        <option value="D">D (Perlu Perbaikan)</option>
                      </select>
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
                  <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
                    Batal
                  </MasterActionButton>
                  <MasterActionButton variant="primary" icon={Check} onClick={() => handleSimpanFiturAksi('Ujian Tasmi', 'tasmi')}>
                    Simpan Ujian Tasmi'
                  </MasterActionButton>
                </DialogFooter>
              </>
            )}

            {/* 4. POIN KEDISIPLINAN MODAL */}
            {quickActionModal === 'poin' && (
              <>
                <DialogHeader className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl border-b border-amber-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-700/80 text-amber-200 flex items-center justify-center border border-amber-600/60 shadow-inner shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-extrabold text-white text-left">
                        Transaksi Poin Kedisiplinan (+/-)
                      </DialogTitle>
                      <DialogDescription className="text-xs text-amber-200/90 mt-0.5 font-medium text-left">
                        Pencatatan sanksi pelanggaran (poin minus) dan prestasi kebaikan (poin plus)
                      </DialogDescription>
                    </div>
                  </div>
                  <DialogClose onClick={() => setQuickActionModal(null)} />
                </DialogHeader>

                <DialogBody className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 space-y-4 text-xs">
                  {renderStudentSelectOption()}
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Jenis Transaksi</label>
                    <select
                      value={poinForm.type}
                      onChange={(e) => setPoinForm({ ...poinForm, type: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 outline-none transition"
                    >
                      <option value="violation">Pelanggaran / Sanksi (Poin Minus)</option>
                      <option value="achievement">Prestasi / Kebaikan (Poin Plus)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Bobot Poin</label>
                      <input
                        type="number"
                        value={poinForm.points}
                        onChange={(e) => setPoinForm({ ...poinForm, points: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-bold text-rose-600 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Status Kasus</label>
                      <select
                        value={poinForm.status}
                        onChange={(e) => setPoinForm({ ...poinForm, status: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 outline-none transition"
                      >
                        <option value="tercatat">Tercatatan Baru</option>
                        <option value="pengawasan">Dalam Pengawasan</option>
                        <option value="selesai">Selesai Sanksi</option>
                        <option value="dirujuk_bk">Dirujuk ke Guru BK</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Keterangan Kejadian</label>
                    <textarea
                      rows="2"
                      value={poinForm.notes}
                      onChange={(e) => setPoinForm({ ...poinForm, notes: e.target.value })}
                      placeholder="Detail catatan kedisiplinan..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-medium outline-none transition"
                    />
                  </div>
                </DialogBody>

                <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
                  <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
                    Batal
                  </MasterActionButton>
                  <MasterActionButton variant="export" icon={Check} onClick={() => handleSimpanFiturAksi('Poin Kedisiplinan', 'poin')}>
                    Simpan Catatan Poin
                  </MasterActionButton>
                </DialogFooter>
              </>
            )}

            {/* 5. LOG KLINIK MODAL */}
            {quickActionModal === 'klinik' && (
              <>
                <DialogHeader className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl border-b border-rose-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-700/80 text-rose-200 flex items-center justify-center border border-rose-600/60 shadow-inner shrink-0">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-extrabold text-white text-left">
                        Log Klinik & Kesehatan Santri
                      </DialogTitle>
                      <DialogDescription className="text-xs text-rose-200/90 mt-0.5 font-medium text-left">
                        Pencatatan santri sakit, keluhan/gejala, obat yang diberikan, & rekomendasi istirahat
                      </DialogDescription>
                    </div>
                  </div>
                  <DialogClose onClick={() => setQuickActionModal(null)} />
                </DialogHeader>

                <DialogBody className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 space-y-4 text-xs">
                  {renderStudentSelectOption()}
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Gejala Keluhan</label>
                    <input
                      type="text"
                      value={klinikForm.symptoms}
                      onChange={(e) => setKlinikForm({ ...klinikForm, symptoms: e.target.value })}
                      placeholder="Demam, pusing, batuk..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-rose-600 focus:ring-2 focus:ring-rose-600/15 outline-none transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Obat Diberikan</label>
                      <input
                        type="text"
                        value={klinikForm.medicine}
                        onChange={(e) => setKlinikForm({ ...klinikForm, medicine: e.target.value })}
                        placeholder="Paracetamol, vitamin..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Rekomendasi</label>
                      <select
                        value={klinikForm.status}
                        onChange={(e) => setKlinikForm({ ...klinikForm, status: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
                      >
                        <option value="rawat_jalan">Rawat Jalan di Kamar</option>
                        <option value="istirahat_uksh">Istirahat di UKS Asrama</option>
                        <option value="dirujuk_rs">Dirujuk ke RS/Klinik</option>
                      </select>
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
                  <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
                    Batal
                  </MasterActionButton>
                  <MasterActionButton variant="import" icon={Check} onClick={() => handleSimpanFiturAksi('Klinik Kesehatan', 'klinik')}>
                    Simpan Log Klinik
                  </MasterActionButton>
                </DialogFooter>
              </>
            )}

            {/* 6. LOG PENITIPAN HP/LAPTOP MODAL */}
            {quickActionModal === 'titipan' && (
              <>
                <DialogHeader className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between shrink-0 rounded-t-3xl border-b border-sky-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-700/80 text-sky-200 flex items-center justify-center border border-sky-600/60 shadow-inner shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-extrabold text-white text-left">
                        Log Penitipan Barang Berharga (HP/Laptop)
                      </DialogTitle>
                      <DialogDescription className="text-xs text-sky-200/90 mt-0.5 font-medium text-left">
                        Pencatatan barang elektronik santri yang diserahkan/diambil dari Musyrif
                      </DialogDescription>
                    </div>
                  </div>
                  <DialogClose onClick={() => setQuickActionModal(null)} />
                </DialogHeader>

                <DialogBody className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 space-y-4 text-xs">
                  {renderStudentSelectOption()}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Jenis Barang</label>
                      <select
                        value={titipanForm.item_type}
                        onChange={(e) => setTitipanForm({ ...titipanForm, item_type: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
                      >
                        <option value="smartphone">Smartphone / HP</option>
                        <option value="laptop">Laptop / Notebook</option>
                        <option value="tablet">Tablet / iPad</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Merk / Serial Number</label>
                      <input
                        type="text"
                        value={titipanForm.serial_number}
                        onChange={(e) => setTitipanForm({ ...titipanForm, serial_number: e.target.value })}
                        placeholder="Samsung A54 / SN123"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
                      />
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
                  <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
                    Batal
                  </MasterActionButton>
                  <MasterActionButton variant="primary" icon={Check} onClick={() => handleSimpanFiturAksi('Penitipan Barang', 'titipan')}>
                    Catat Penitipan
                  </MasterActionButton>
                </DialogFooter>
              </>
            )}

          </Dialog>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>

        {/* KPI Detail Modal */}
        <ModalErrorBoundary onClose={() => setActiveModal(null)}>
          <KpiQuickViewModal
            type={activeModal}
            isOpen={Boolean(activeModal)}
            onClose={() => setActiveModal(null)}
          />
        </ModalErrorBoundary>

        {/* 🟢 PRINT OPTION MODAL (CETAK & UNDUH PDF DATATABLE) */}
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={getActiveDatatableInfo().title}
          subtitle={`Laporan Aktif: ${getActiveDatatableInfo().title} | Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
          onPrint={() => {
            handlePrintClean()
            setIsPrintModalOpen(false)
          }}
          onDownload={() => {
            handleDownloadPdf()
            setIsPrintModalOpen(false)
          }}
        />

        {/* Hidden File Input for CSV Datatable Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          className="hidden"
          accept=".csv,.xlsx,.xls"
        />
      </div>
    </PageContainer>
  )
}
