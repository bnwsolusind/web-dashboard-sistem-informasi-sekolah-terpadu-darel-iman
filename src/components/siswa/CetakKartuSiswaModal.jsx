import { useEffect, useMemo, useRef, useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { downloadStudentIdCard, printStudentIdCard } from '../../services/idCardPrintService.jsx'
import StudentIdCard from '../card-print/StudentIdCard'
import {
  FaBookmark,
  FaCheck,
  FaDownload,
  FaGraduationCap,
  FaIdCard,
  FaMobileAlt,
  FaPrint,
  FaQrcode,
  FaTimes,
} from 'react-icons/fa'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import { BookOpen, CalendarDays, Camera, Droplets, IdCard, LoaderCircle, RotateCcw, School, Search, ShieldCheck, UserRound } from 'lucide-react'
import { studentService } from '../../services/studentService'
import { usePengaturanStore } from '../../stores/pengaturanStore'
import PersonAvatar from '../ui/PersonAvatar'
import Swal from '@/components/ui/compat/swal-heroui'

function getStudentUnitAddress(data, pengaturan) {
  const unitObj = data?.raw?.unit || (typeof data?.unit === 'object' && data?.unit !== null ? data.unit : null)
  const addressText = unitObj?.address || unitObj?.alamat || (pengaturan?.address ? `${pengaturan.address}${pengaturan.city ? `, ${pengaturan.city}` : ''}` : '')
  const phoneText = unitObj?.phone || unitObj?.telepon || pengaturan?.phone || pengaturan?.telepon || ''
  const webText = unitObj?.website || pengaturan?.website || ''
  const lines = []
  if (addressText) lines.push(addressText)
  const contactParts = []
  if (phoneText) contactParts.push(`Telp: ${phoneText}`)
  if (webText) contactParts.push(`Website: ${webText}`)
  if (contactParts.length > 0) lines.push(contactParts.join(' | '))
  return lines.join('\n')
}

const THEMES = [
  { id: 'green', name: 'Hijau DEI', primary: '#004D32', dark: '#003822', secondary: '#0E5C44', soft: '#ecfdf5', accent: '#E5A93C' },
  { id: 'blue', name: 'Biru Modern', primary: '#1D4ED8', dark: '#1e40af', secondary: '#3B82F6', soft: '#eff6ff', accent: '#93C5FD' },
  { id: 'purple', name: 'Ungu Elegan', primary: '#6D28D9', dark: '#5b21b6', secondary: '#8B5CF6', soft: '#f5f3ff', accent: '#C4B5FD' },
  { id: 'orange', name: 'Oranye Ceria', primary: '#EA580C', dark: '#c2410c', secondary: '#F97316', soft: '#fff7ed', accent: '#FDBA74' },
  { id: 'teal', name: 'Teal Fresh', primary: '#0F766E', dark: '#115e59', secondary: '#14B8A6', soft: '#f0fdfa', accent: '#99F6E4' },
  { id: 'navy', name: 'Navy Premium', primary: '#172554', dark: '#0f172a', secondary: '#1E3A8A', soft: '#eff6ff', accent: '#60A5FA' },
]

const DEFAULT_CONFIG = {
  orientation: 'horizontal',
  templateColor: 'green',
  showPhoto: true,
  showLogo: true,
  showQr: true,
  showNis: true,
  showNisn: true,
  showClass: true,
  showRombel: true,
  showUnit: true,
  showAcademicYear: false,
  showMotto: true,
}

function normalizeStudent(item) {
  const meta = item?.metadata || item?.raw?.metadata || {}
  const rawKelas = item?.kelas || item?.school_class?.name || meta.kelas_label || meta.akademik?.kelas
  const kelasStr = typeof rawKelas === 'object' && rawKelas !== null
    ? (rawKelas.nama_kelas || rawKelas.name || rawKelas.nama || '-')
    : (typeof rawKelas === 'string' ? rawKelas : '-')

  const rawRombel = item?.rombel || (typeof rawKelas === 'object' && rawKelas !== null ? rawKelas.rombel : null) || meta.rombel || meta.akademik?.rombel
  const rombelStr = typeof rawRombel === 'object' && rawRombel !== null
    ? (rawRombel.name || rawRombel.nama || '-')
    : (typeof rawRombel === 'string' ? rawRombel : '-')

  return {
    ...item,
    id: item?.id,
    nama: item?.nama || item?.full_name || item?.nama_lengkap || '-',
    nis: item?.nis || '-',
    nisn: item?.nisn || meta.nisn || '-',
    unit: item?.unit || item?.unit_name || item?.unit_pendidikan || meta.akademik?.unit_pendidikan || meta.unit_pendidikan || '-',
    kelas: kelasStr,
    rombel: rombelStr,
    status: item?.status || (item?.is_active === false ? 'Nonaktif' : 'Aktif'),
    foto: item?.foto || meta.foto_url || meta.foto || meta.photo_url || meta.photo || meta.avatar || meta.avatar_url || meta.url_foto || item?.raw?.foto_url || item?.raw?.user?.avatar || '',
    tanggalLahir: item?.tanggal_lahir || item?.birth_date || meta.tanggal_lahir || meta.birth_date || '',
    golonganDarah: item?.golongan_darah || item?.blood_type || meta.golongan_darah || meta.blood_type || '-',
    raw: item?.raw || item,
  }
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

export default function CetakKartuSiswaModal({ student, onClose, showSettings = true }) {
  const modalFileInputRef = useRef(null)
  const [cardConfig, setCardConfig] = useState(DEFAULT_CONFIG)
  const [selectedStudent, setSelectedStudent] = useState(() => normalizeStudent(student))

  const data = useMemo(() => {
    const meta = selectedStudent?.raw?.metadata || {}
    return {
      id: selectedStudent?.id,
      nis: selectedStudent?.nis || '-',
      nisn: selectedStudent?.nisn || meta.nisn || '-',
      nama: selectedStudent?.nama || '-',
      unit: selectedStudent?.unit || '-',
      kelas: selectedStudent?.kelas || '-',
      rombel: selectedStudent?.rombel || '-',
      status: selectedStudent?.status || 'Aktif',
      tahunAjaran: meta.tahun_ajaran_berjalan || meta.akademik?.tahun_ajaran || '-',
      tanggalLahir: selectedStudent?.tanggalLahir || selectedStudent?.raw?.birth_date || '-',
      golonganDarah: selectedStudent?.golonganDarah || '-',
      foto: selectedStudent?.foto || meta.foto_url || '',
      educationUnitId: selectedStudent?.raw?.unit_id || null,
      raw: selectedStudent?.raw,
    }
  }, [selectedStudent])

  const handleModalPhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: 'Format Berkas Tidak Didukung',
        text: 'Silakan pilih gambar dengan format JPG atau PNG untuk foto kartu pelajar.',
        icon: 'warning',
        confirmButtonColor: '#059669',
      })
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (dataUrl) {
        setSelectedStudent((prev) => ({ ...prev, foto: dataUrl }))
        if (student) {
          student.photo_url = dataUrl
          student.photo = dataUrl
          student.foto = dataUrl
          if (student.metadata) student.metadata.foto = dataUrl
        }
      }
    }
    reader.readAsDataURL(file)
  }
  const [studentSearch, setStudentSearch] = useState('')
  const [studentOptions, setStudentOptions] = useState(() => student ? [normalizeStudent(student)] : [])
  const [isSaving, setIsSaving] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState(null)
  const [qrToken, setQrToken] = useState('')
  const [qrError, setQrError] = useState('')
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  // Card Control Tabs & Back Side States
  const [cardControlTab, setCardControlTab] = useState('style') // 'style' | 'back' | 'template'
  const [cardSide, setCardSide] = useState('front') // 'front' | 'back'
  const [backTitle, setBackTitle] = useState('TATA TERTIB SISWA')
  const [backRules, setBackRules] = useState(
    () => pengaturan?.card_rules_student || ''
  )
  const [backAddress, setBackAddress] = useState(
    () => getStudentUnitAddress(data, pengaturan)
  )
  const [backShowQr, setBackShowQr] = useState(true)
  const [printSides, setPrintSides] = useState('both') // 'both' | 'front' | 'back'

  // Additional Front Style States (Matching Employee Settings)
  const [frameStyle, setFrameStyle] = useState('standard') // 'standard' | 'rounded' | 'double' | 'glow'
  const [photoShape, setPhotoShape] = useState('rounded') // 'circle' | 'rounded' | 'square' | 'shield'
  const [showPattern, setShowPattern] = useState(true)
  const [showWave, setShowWave] = useState(true)
  const [headerMotto, setHeaderMotto] = useState(
    () => pengaturan?.motto || 'Berilmu, Berakhlak, Beramal'
  )
  const [footerMotto, setFooterMotto] = useState(
    () => pengaturan?.card_footer_motto || 'Sekolah Unggulan\nBerbasis Al-Qur\'an'
  )

  useEffect(() => {
    if (pengaturan?.card_rules_student && !backRules) {
      setBackRules(pengaturan.card_rules_student)
    }
    if (!backAddress) {
      setBackAddress(getStudentUnitAddress(data, pengaturan))
    }
  }, [pengaturan, data])

  const {
    orientation, templateColor: themeId, showPhoto, showQr, showLogo,
    showNis, showNisn, showClass, showRombel, showUnit,
    showAcademicYear, showMotto,
  } = cardConfig
  const updateConfig = (key, value) => setCardConfig((current) => ({ ...current, [key]: value }))
  const theme = THEMES.find((item) => item.id === themeId) || THEMES[0]

  useEffect(() => {
    setSelectedStudent(normalizeStudent(student))
  }, [student])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      studentService.getDaftar({ per_page: 15, search: studentSearch || undefined })
        .then((result) => {
          const list = (result?.data || []).map(normalizeStudent)
          setStudentOptions(list.length ? list : (student ? [normalizeStudent(student)] : []))
        })
        .catch(() => {})
    }, 350)
    return () => window.clearTimeout(timer)
  }, [student, studentSearch])

  useEffect(() => {
    let active = true
    studentService.getCardSetting(data.educationUnitId)
      .then((result) => {
        const setting = result?.data
        if (!active || !setting) return
        setCardConfig({
          orientation: setting.orientation || 'horizontal',
          templateColor: setting.template_color || 'green',
          showPhoto: setting.show_photo ?? true,
          showLogo: setting.show_logo ?? true,
          showQr: setting.show_qrcode ?? true,
          showNis: setting.show_nis ?? true,
          showNisn: setting.show_nisn ?? true,
          showClass: setting.show_class ?? true,
          showRombel: setting.show_rombel ?? true,
          showUnit: setting.show_unit ?? true,
          showAcademicYear: setting.show_academic_year ?? false,
          showMotto: setting.show_motto ?? true,
        })
      })
      .catch(() => {
        try {
          const cached = JSON.parse(localStorage.getItem('student_card_template') || 'null')
          if (active && cached) setCardConfig((current) => ({ ...current, ...cached }))
        } catch {
          // Gunakan konfigurasi default.
        }
      })
    return () => { active = false }
  }, [data.educationUnitId])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    let active = true
    const fallbackToken = data.id || data.nis || data.nisn ? `STUDENT_CARD:${data.id || data.nis || data.nisn}:${data.nama || ''}` : ''
    setQrToken(fallbackToken)
    setQrError('')

    if (!data.id) {
      return () => { active = false }
    }

    studentService.getAttendanceQrToken(data.id)
      .then((result) => {
        if (active) {
          const token = result?.data?.qr_token || result?.qr_token || fallbackToken
          setQrToken(token)
        }
      })
      .catch(() => {
        if (active) {
          setQrToken(fallbackToken)
        }
      })

    return () => { active = false }
  }, [data.id, data.nis, data.nisn, data.nama])

  if (!student) return null

  const sekolah = pengaturan?.school_name || pengaturan?.namaSekolah || ''
  const logo = pengaturan?.logo_url || pengaturan?.logoUrl || ''
  const brandTitle = sekolah
    ? sekolah
        .replace(/^YAYASAN\s*/i, '')
        .replace(/\s*-\s*/g, '-')
        .trim()
    : ''
  const initials = (data?.nama || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'S'
  const formatDate = (value) => {
    if (!value || value === '-') return '-'
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime())
      ? value
      : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed)
  }

  const saveTemplate = async () => {
    setIsSaving(true)
    try {
      if (data.educationUnitId) {
        await studentService.saveCardSetting({
          education_unit_id: data.educationUnitId,
          orientation,
          template_color: themeId,
          show_photo: showPhoto,
          show_logo: showLogo,
          show_qrcode: showQr,
          show_nis: showNis,
          show_nisn: showNisn,
          show_class: showClass,
          show_rombel: showRombel,
          show_unit: showUnit,
          show_academic_year: showAcademicYear,
          show_motto: showMotto,
        }).catch(() => {})
      }
      localStorage.setItem('dareliman_student_card_config', JSON.stringify(cardConfig))
      setToast({ tone: 'success', title: 'Template Tersimpan', message: 'Konfigurasi desain kartu siswa berhasil diperbarui.' })
    } catch (err) {
      console.error('SAVE_TEMPLATE_ERROR:', err)
      setToast({ tone: 'danger', title: 'Gagal Menyimpan', message: 'Terjadi kesalahan saat menyimpan preferensi desain.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrint = () => {
    if (!data.id) {
      setToast({ tone: 'warning', title: 'Pilih Siswa', message: 'Silakan pilih data siswa sebelum mencetak kartu.' })
      return
    }
    setToast({
      tone: 'info',
      title: 'Menyiapkan Cetakan ID Card',
      message: 'Tips: Centang "Background graphics" (Grafik latar belakang) pada dialog cetak peramban agar warna hijau & logo kartu muncul penuh!',
    })
    printStudentIdCard({
      data,
      config: cardConfig,
      theme,
      pengaturan,
      qrToken,
      formatDate,
      printSides,
      frameStyle,
      photoShape,
      showPattern,
      showWave,
      headerMotto,
      footerMotto,
      backTitle,
      backRules,
      backAddress,
      backShowQr,
    })
  }

  const handleDownload = () => {
    if (!data?.id) {
      setToast({ tone: 'warning', title: 'Pilih Siswa', message: 'Silakan pilih data siswa sebelum mengunduh kartu.' })
      return
    }
    setToast({ tone: 'success', title: 'Kartu Siap Diunduh', message: 'Menyiapkan dokumen hasil unduhan...' })
    downloadStudentIdCard({
      data,
      config: cardConfig,
      theme,
      pengaturan,
      qrToken,
      formatDate,
      printSides,
      frameStyle,
      photoShape,
      showPattern,
      showWave,
      headerMotto,
      footerMotto,
      backTitle,
      backRules,
      backAddress,
      backShowQr,
    })
  }

  const resetTemplate = () => {
    setCardConfig(DEFAULT_CONFIG)
    setCardSide('front')
    setFrameStyle('standard')
    setPhotoShape('rounded')
    setShowPattern(true)
    setShowWave(true)
    setHeaderMotto(pengaturan?.motto || 'Berilmu, Berakhlak, Beramal')
    setFooterMotto(pengaturan?.card_footer_motto || 'Sekolah Unggulan\nBerbasis Al-Qur\'an')
    setBackTitle('TATA TERTIB SISWA')
    setBackRules(pengaturan?.card_rules_student || '')
    if (selectedStudent) {
      setBackAddress(getStudentUnitAddress(data, pengaturan))
    }
    setBackShowQr(true)
    setPrintSides('both')
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm">
        <section className="my-3 flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B2433] shadow-xl">
          <header className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm"><FaIdCard /></span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Kartu Siswa (Pelajar)</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{showSettings ? 'Pratinjau kartu identitas, QR absensi Dareliman Edu, dan kustomisasi sisi belakang.' : 'Pratinjau kartu identitas resmi dan QR absensi Dareliman Edu.'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showSettings && (
                <button type="button" onClick={saveTemplate} disabled={isSaving} className="hidden h-9 items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-medium text-white disabled:opacity-60 sm:flex cursor-pointer transition-colors shadow-xs">
                  {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FaBookmark />} {isSaving ? 'Menyimpan...' : 'Simpan Pilihan'}
                </button>
              )}
              <button type="button" onClick={onClose} aria-label="Tutup" className="flex size-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 cursor-pointer transition-colors"><FaTimes /></button>
            </div>
          </header>

          <div className={`grid min-h-0 flex-1 ${showSettings ? 'lg:grid-cols-[360px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
            {showSettings && (
              <aside className="overflow-y-auto border-r border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4">
              <div className="space-y-4">
                <section>
                  <h3 className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-700">1. Pilih Data Siswa</h3>
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Cari nama siswa, NIS, atau NISN..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[11px] outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100" />
                  </label>
                  <CustomSelect
                    value={selectedStudent?.id || ''}
                    onChange={(event) => setSelectedStudent(studentOptions.find((item) => String(item.id) === event.target.value) || null)}
                    className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-600"
                  >
                    <option value="">Pilih siswa...</option>
                    {studentOptions.map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.nis} · {item.nisn}</option>)}
                  </CustomSelect>
                  {selectedStudent && (
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                      <PersonAvatar src={data.foto} name={data.nama} size="table" className="border-emerald-200 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <strong className="block text-xs font-bold text-slate-800 leading-snug line-clamp-2" title={data.nama}>{data.nama}</strong>
                        <small className="block truncate text-[9.5px] text-slate-500 font-medium">NIS {data.nis} · NISN {data.nisn}</small>
                        <small className="block truncate text-[9.5px] font-semibold text-emerald-700">{data.unit} · Kelas {data.kelas} · {data.status}</small>
                      </span>
                    </div>
                  )}
                </section>

                <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1">
                  <button
                    type="button"
                    onClick={() => setCardControlTab('style')}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                      cardControlTab === 'style'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🎨 Depan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardControlTab('back')
                      setCardSide('back')
                    }}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                      cardControlTab === 'back'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📝 Belakang
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardControlTab('template')}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                      cardControlTab === 'template'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚙️ Template
                  </button>
                </div>

                {cardControlTab === 'style' && (
                  <div className="space-y-4">
                    {/* Frame & Shape Customizer */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-700">Gaya Frame / Border</label>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {[
                            ['standard', 'Standard'],
                            ['rounded', 'Soft Rounded'],
                            ['double', 'Double Line'],
                            ['glow', 'Glow Accent'],
                          ].map(([styleKey, styleLabel]) => (
                            <button
                              key={styleKey}
                              type="button"
                              onClick={() => setFrameStyle(styleKey)}
                              className={`rounded-lg border px-2.5 py-1 text-left text-[11px] font-medium transition-all cursor-pointer ${
                                frameStyle === styleKey
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              {styleLabel}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-700">Bentuk Foto Siswa</label>
                        <div className="grid grid-cols-4 gap-1 text-center">
                          {[
                            ['circle', 'Bulat'],
                            ['rounded', 'Membuat'],
                            ['square', 'Kotak'],
                            ['shield', 'Perisai'],
                          ].map(([shapeKey, shapeLabel]) => (
                            <button
                              key={shapeKey}
                              type="button"
                              onClick={() => setPhotoShape(shapeKey)}
                              className={`rounded-lg border py-1 text-[10px] font-medium transition-all cursor-pointer ${
                                photoShape === shapeKey
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              {shapeLabel}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={showPattern}
                            onChange={(e) => setShowPattern(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Pola Latar
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={showWave}
                            onChange={(e) => setShowWave(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Gelombang Atas
                        </label>
                      </div>
                    </div>

                    {/* Tagline & Motto Customizer */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Tagline Sub-Header</label>
                        <input
                          type="text"
                          value={headerMotto}
                          onChange={(e) => setHeaderMotto(e.target.value)}
                          placeholder="Berilmu, Berakhlak, Beramal"
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Slogan Banner Footer</label>
                        <textarea
                          rows={2}
                          value={footerMotto}
                          onChange={(e) => setFooterMotto(e.target.value)}
                          placeholder={"Sekolah Unggulan\nBerbasis Al-Qur'an"}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none resize-none font-medium"
                        />
                      </div>
                    </div>

                    <section>
                      <h3 className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-700">Elemen Tampilan Depan</h3>
                      <div className="grid grid-cols-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
                        <Toggle label="Foto Siswa" checked={showPhoto} onChange={(value) => updateConfig('showPhoto', value)} />
                        <Toggle label="Logo Yayasan" checked={showLogo} onChange={(value) => updateConfig('showLogo', value)} />
                        <Toggle label="QR Code" checked={showQr} onChange={(value) => updateConfig('showQr', value)} />
                        <Toggle label="NIS" checked={showNis} onChange={(value) => updateConfig('showNis', value)} />
                        <Toggle label="NISN" checked={showNisn} onChange={(value) => updateConfig('showNisn', value)} />
                        <Toggle label="Kelas" checked={showClass} onChange={(value) => updateConfig('showClass', value)} />
                        <Toggle label="Rombel" checked={showRombel} onChange={(value) => updateConfig('showRombel', value)} />
                        <Toggle label="Unit Pendidikan" checked={showUnit} onChange={(value) => updateConfig('showUnit', value)} />
                        <Toggle label="Tahun Ajaran" checked={showAcademicYear} onChange={(value) => updateConfig('showAcademicYear', value)} />
                        <Toggle label="Motto" checked={showMotto} onChange={(value) => updateConfig('showMotto', value)} />
                      </div>
                    </section>
                  </div>
                )}

                {cardControlTab === 'back' && (
                  <div className="space-y-3.5">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Pengaturan Sisi Belakang</h4>
                        <p className="text-[11px] text-slate-500">Atur judul, tata tertib siswa, dan alamat unit sekolah.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Judul Header Belakang</label>
                        <input
                          type="text"
                          value={backTitle}
                          onChange={(e) => setBackTitle(e.target.value)}
                          placeholder="TATA TERTIB SISWA"
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Poin Tata Tertib Siswa</label>
                        <textarea
                          rows={4}
                          value={backRules}
                          onChange={(e) => setBackRules(e.target.value)}
                          placeholder="1. Kartu ini adalah milik resmi..."
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none font-medium resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-semibold text-slate-700">Alamat & Kontak Footer</label>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedStudent) {
                                setBackAddress(getStudentUnitAddress(data, pengaturan))
                              }
                            }}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                          >
                            📍 Sync Unit
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={backAddress}
                          onChange={(e) => setBackAddress(e.target.value)}
                          placeholder="Jl. Gajah Mada No. 28..."
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none font-medium resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                          <input
                            type="checkbox"
                            checked={backShowQr}
                            onChange={(e) => setBackShowQr(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Tampilkan QR Code Belakang
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {cardControlTab === 'template' && (
                  <div className="space-y-4">
                    <section>
                      <h3 className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-700">Orientasi Kartu</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['horizontal', 'Horizontal'],
                          ['vertical', 'Vertikal'],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateConfig('orientation', value)}
                            className={`relative flex h-12 items-center justify-center gap-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                              orientation === value
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                            }`}
                          >
                            <FaIdCard className={value === 'vertical' ? 'rotate-90' : ''} />
                            {label}
                            {orientation === value && <FaCheck className="absolute right-2 top-2 text-[9px]" />}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-1.5">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-700">Sisi Halaman Yang Dicetak</h3>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        {[
                          ['both', 'Keduanya'],
                          ['front', 'Depan'],
                          ['back', 'Belakang'],
                        ].map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setPrintSides(val)}
                            className={`rounded-lg border py-1.5 text-[10.5px] font-semibold transition-all cursor-pointer ${
                              printSides === val
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-700">Pilih Warna Kartu</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {THEMES.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateConfig('templateColor', item.id)}
                            className={`relative overflow-hidden rounded-xl border bg-white p-1.5 text-left transition cursor-pointer ${
                              themeId === item.id ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-200'
                            }`}
                          >
                            <span className="block h-9 rounded-lg" style={{ background: `linear-gradient(145deg, ${item.primary}, ${item.soft} 58%, ${item.accent})` }} />
                            <span className="mt-1 flex justify-center gap-0.5">{[item.primary, item.secondary, item.accent].map((color) => <i key={color} className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />)}</span>
                            <span className="mt-1 block truncate text-center text-[8px] font-bold text-slate-600">{item.name}</span>
                            {themeId === item.id && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-700 text-[8px] text-white"><FaCheck /></span>}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                <button type="button" onClick={resetTemplate} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                  <RotateCcw className="h-4 w-4" /> Reset Template
                </button>
              </div>
            </aside>
          )}

            <main className="min-h-0 overflow-y-auto p-5 sm:p-6">
              {showSettings && (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Preview Kartu Siswa (Pelajar)</h3>
                      <p className="text-[11px] text-slate-500">QR hanya aktif untuk siswa yang sudah tersimpan dan memiliki token absensi.</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${qrToken ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {qrToken ? 'QR Absensi Aktif' : 'QR Belum Aktif'}
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 border border-slate-300/60 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateConfig('orientation', 'horizontal')}
                        className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          orientation === 'horizontal'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        ↔️ Horizontal
                      </button>
                      <button
                        type="button"
                        onClick={() => updateConfig('orientation', 'vertical')}
                        className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          orientation === 'vertical'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        ↕️ Vertikal
                      </button>
                    </div>

                    <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 border border-slate-300/60 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setCardSide('front')}
                        className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          cardSide === 'front'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        🎴 Sisi Depan
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardSide('back')}
                        className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          cardSide === 'back'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        🃏 Sisi Belakang
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col items-center gap-4">
                <div className="flex min-h-[460px] w-full items-center justify-center overflow-auto rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_center,_#f8fafc,_#eef2f7)] p-6 shadow-inner">
                  <StudentIdCard
                    data={data}
                    config={cardConfig}
                    theme={theme}
                    pengaturan={pengaturan}
                    qrToken={qrToken}
                    formatDate={formatDate}
                    isPrint={false}
                    cardSide={cardSide}
                    frameStyle={frameStyle}
                    photoShape={photoShape}
                    showPattern={showPattern}
                    showWave={showWave}
                    headerMotto={headerMotto}
                    footerMotto={footerMotto}
                    backTitle={backTitle}
                    backRules={backRules}
                    backAddress={backAddress}
                    backShowQr={backShowQr}
                  />
                </div>
              </div>

              {showSettings && qrError && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] font-medium text-amber-800">{qrError}</p>}

              {showSettings && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><FaQrcode className="text-emerald-700" /><span className="text-[10px]"><b className="block text-slate-800">QR Aman</b><span className="text-slate-500">Token terenkripsi</span></span></div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><FaPrint className="text-emerald-700" /><span className="text-[10px]"><b className="block text-slate-800">Siap Cetak CR80</b><span className="text-slate-500">Ukuran standar 85.6 × 53.98 mm</span></span></div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><FaMobileAlt className="text-emerald-700" /><span className="text-[10px]"><b className="block text-slate-800">Mobile Ready</b><span className="text-slate-500">Dapat dipindai Android & iOS</span></span></div>
                </div>
              )}
            </main>
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
            <button type="button" onClick={onClose} className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-xs">Tutup</button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => modalFileInputRef.current?.click()}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-xs"
              >
                <Camera className="h-4 w-4 text-slate-500" /> Ubah Foto
              </button>
              <input
                ref={modalFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleModalPhotoChange}
              />
              <button type="button" onClick={saveTemplate} disabled={isSaving} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 disabled:opacity-60 sm:hidden cursor-pointer shadow-xs">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FaBookmark />} Simpan
              </button>
              <button type="button" onClick={handleDownload} disabled={isProcessing} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-4 text-sm font-medium disabled:opacity-60 cursor-pointer shadow-xs transition-colors">
                <FaDownload className="text-slate-500" /> Unduh ID Card
              </button>
              <button type="button" onClick={handlePrint} className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-medium text-white cursor-pointer shadow-xs transition-colors"><FaPrint /> Cetak ID Card</button>
            </div>
          </footer>
        </section>
      </div>
      {toast && (
        <div className={`fixed right-4 top-4 z-[70] w-[min(360px,calc(100vw-2rem))] rounded-xl border bg-white dark:bg-[#1B2433] p-4 shadow-2xl ${
          toast.tone === 'danger' ? 'border-rose-200 dark:border-rose-800' : toast.tone === 'warning' ? 'border-amber-200 dark:border-amber-800' : 'border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
              toast.tone === 'danger' ? 'bg-rose-600' : toast.tone === 'warning' ? 'bg-amber-500' : 'bg-emerald-600'
            }`}>{toast.tone === 'danger' ? <FaTimes /> : <FaCheck />}</span>
            <div className="min-w-0"><strong className="block text-sm text-slate-900 dark:text-white">{toast.title}</strong><p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{toast.message}</p></div>
            <button type="button" onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"><FaTimes /></button>
          </div>
        </div>
      )}
    </>
  )
}
