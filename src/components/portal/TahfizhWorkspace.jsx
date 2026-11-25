import { useMemo, useState, useEffect, useCallback } from 'react'
import AppModal from '@/components/app/AppModal'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpenCheck,
  Target,
  Award,
  Calendar,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Layers,
  School,
  FileCheck2,
  BookMarked,
  RotateCw,
  Plus,
  X,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle,
  Send,
  HelpCircle,
  FileText,
  ChevronDown,
  BookOpen,
  Volume2,
  History,
  Lock,
  Unlock,
  Eye,
  Info,
} from 'lucide-react'
import {
  Card as HeroCard,
  Chip as HeroChip,
  Button as HeroButton,
  Modal as HeroModal,
} from '@heroui/react'
import { cn } from '../../lib/utils'
import { DatePicker } from '@/components/ui/date-picker'
import api from '../../services/api'

const formatDate = (val) => {
  if (!val) return '-'
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
    }).format(new Date(val))
  } catch {
    return String(val)
  }
}

// Helper untuk memeriksa apakah suatu data adalah jenis Muroja'ah (bukan Ziyadah atau Tilawah)
export const isMurajaahRecord = (item) => {
  if (!item) return false
  const raw = item.rawLog || item

  const cat = String(raw.category || item.category || raw.type || item.type || raw.jenis || '').toLowerCase().trim()
  const metaType = String(raw.metadata?.type || item.metadata?.type || '').toLowerCase().trim()

  // 1. Jika terdefinisi sebagai Ziyadah atau Tilawah, mutlak BUKAN Muroja'ah
  if (cat === 'ziyadah' || metaType === 'ziyadah') return false
  if (cat === 'tilawah' || metaType === 'tilawah') return false
  if (Boolean(raw.tilawah_text || item.tilawah_text) && !raw.murajaah_text && !raw.metadata?.submitted_by_parent) return false

  // 2. Jika secara eksplisit kategori atau tipenya Muroja'ah / Pengulangan
  if (cat === 'murajaah' || cat === "muroja'ah" || cat === 'pengulangan') return true
  if (metaType === 'murajaah' || metaType === "muroja'ah" || metaType === 'pengulangan') return true

  // 3. Jika dilaporkan mandiri oleh orang tua sebagai muroja'ah di rumah
  if (Boolean(raw.metadata?.submitted_by_parent || item.metadata?.submitted_by_parent || raw.signature_parent)) return true

  // 4. Tugas muroja'ah yang diwajibkan guru
  if (raw.murajaah_required === true || raw.murajaah_required === 1 || raw.murajaah_required === '1' || item.murajaah_required === true) {
    return true
  }

  // 5. Jika status muroja'ah aktif dan bukan default 'none' dari database
  const murajStatus = String(raw.murajaah_status || item.murajaah_status || '').toLowerCase().trim()
  if (murajStatus && !['none', 'null', 'undefined', '', '0', 'false'].includes(murajStatus)) {
    return true
  }

  // 6. Jika tidak memiliki hafalan baru (ziyadah) tapi memiliki catatan muroja'ah
  const hasHafalanBaru = Boolean(raw.hafalan_surah_name || item.hafalan_surah_name) && Boolean(raw.hafalan_ayah_start || item.hafalan_ayah_start)
  if (!hasHafalanBaru && (Boolean(raw.murajaah_text || item.murajaah_text) || Number(raw.murajaah_lembar || item.murajaah_lembar) > 0)) {
    return true
  }

  return false
}

// Helper untuk mengekstrak data kanonis Surah dan Rentang Ayat dari log setoran
const parseLogInfo = (log, allSurahs = []) => {
  if (!log) return null

  let surahNum = log.hafalan_surah_number || log.metadata?.surah_number || log.surah_number || null
  let surahName = log.hafalan_surah_name || log.metadata?.surah_name || log.surah_name || null

  let aStart =
    log.hafalan_ayah_start !== undefined && log.hafalan_ayah_start !== null
      ? Number(log.hafalan_ayah_start)
      : log.ayat_start !== undefined && log.ayat_start !== null
        ? Number(log.ayat_start)
        : log.ayat_mulai !== undefined && log.ayat_mulai !== null
          ? Number(log.ayat_mulai)
          : log.metadata?.ayat_start !== undefined && log.metadata?.ayat_start !== null
            ? Number(log.metadata.ayat_start)
            : null

  let aEnd =
    log.hafalan_ayah_end !== undefined && log.hafalan_ayah_end !== null
      ? Number(log.hafalan_ayah_end)
      : log.ayat_end !== undefined && log.ayat_end !== null
        ? Number(log.ayat_end)
        : log.ayat_selesai !== undefined && log.ayat_selesai !== null
          ? Number(log.ayat_selesai)
          : log.metadata?.ayat_end !== undefined && log.metadata?.ayat_end !== null
            ? Number(log.metadata.ayat_end)
            : null

  const rawTexts = [
    log.murajaah_text,
    log.tilawah_text,
    log.surah,
    log.nama_surah,
    log.catatan,
  ].filter(Boolean)

  for (const raw of rawTexts) {
    if (typeof raw !== 'string') continue
    const matchVerses = raw.match(
      /(?:surah\s+)?([a-zA-Z\s'\-]+?)\s*(?:\(ayat\s*|\s*ayat\s*|\s*:\s*|\(\s*)(\d+)\s*(?:[-–—]|s\/d|\s*to\s*)\s*(\d+)/i
    )
    if (matchVerses) {
      if (!surahName) surahName = matchVerses[1].trim()
      if (aStart === null || isNaN(aStart)) aStart = parseInt(matchVerses[2], 10)
      if (aEnd === null || isNaN(aEnd)) aEnd = parseInt(matchVerses[3], 10)
      break
    }
  }

  if (!surahName && rawTexts.length > 0) {
    surahName = rawTexts[0]
      .replace(/^(surah|qs\.?)\s+/i, '')
      .replace(/\(.*?\)/g, '')
      .trim()
  }

  // Cocokkan ke daftar Surah master dari database
  let matchedSurah = null
  if (surahNum) {
    matchedSurah = allSurahs.find((s) => Number(s.nomor) === Number(surahNum))
  }
  if (!matchedSurah && surahName) {
    const cleanName = surahName.toLowerCase().replace(/[^a-z]/g, '')
    matchedSurah = allSurahs.find((s) => {
      const latinClean = String(s.nama_latin || '').toLowerCase().replace(/[^a-z]/g, '')
      return latinClean === cleanName || latinClean.includes(cleanName) || cleanName.includes(latinClean)
    })
  }

  if (matchedSurah) {
    surahNum = Number(matchedSurah.nomor)
    surahName = matchedSurah.nama_latin
  }

  const teacherName =
    log.teacher?.full_name ||
    log.teacher?.nama_lengkap ||
    log.teacher?.name ||
    log.teacher_name ||
    log.penguji ||
    log.pengampu ||
    log.signature_teacher ||
    '-'

  return {
    id: log.id || (surahNum && aStart ? `${surahNum}-${aStart}-${aEnd || aStart}` : (log.created_at || String(Math.random()))),
    surahNum,
    surahName: surahName || (surahNum ? `Surah ${surahNum}` : (log.surah || log.nama_surah || 'Setoran Hafalan')),
    aStart: aStart !== null && aStart !== undefined && !isNaN(Number(aStart)) ? Number(aStart) : null,
    aEnd: aEnd !== null && aEnd !== undefined && !isNaN(Number(aEnd)) ? Number(aEnd) : (aStart !== null && aStart !== undefined && !isNaN(Number(aStart)) ? Number(aStart) : null),
    matchedSurah,
    date: log.record_date || log.date || log.tanggal || log.created_at,
    teacherName,
    notesTeacher: log.notes_teacher || log.catatan || null,
    nilai: log.nilai || log.predikat || log.quality || null,
    tajwid: log.tajwid || null,
    kelancaran: log.kelancaran || null,
    makhraj: log.makhraj || null,
    category: log.category || log.type || log.jenis || null,
    rawLog: log,
  }
}

export default function TahfizhWorkspace({
  logs = [],
  target = null,
  achievement = null,
  pendingHomeMurajaah = null,
  loading = false,
  student = null,
  onMurajaahSubmitted = () => { },
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // State Surah Al-Qur'an (100% Dinamis dari Backend Database via /api/equran/surah)
  const [surahList, setSurahList] = useState([])
  const [isSurahListLoading, setIsSurahListLoading] = useState(false)

  // State Modal Detail Setoran
  const [selectedLogDetail, setSelectedLogDetail] = useState(null)

  // State Modal Setoran Muroja'ah di Rumah
  const [isMurajaahModalOpen, setIsMurajaahModalOpen] = useState(false)
  const [isMurajaahLockedByTeacher, setIsMurajaahLockedByTeacher] = useState(false)
  const [submittingMurajaah, setSubmittingMurajaah] = useState(false)
  const [submitFeedback, setSubmitFeedback] = useState(null)

  // State Mushaf Viewer Interaktif
  const [showMushafViewer, setShowMushafViewer] = useState(true)
  const [surahAyatList, setSurahAyatList] = useState([])
  const [isAyatLoading, setIsAyatLoading] = useState(false)

  // Sumber data setoran/hafalan yang sedang diulang (wajib data muroja'ah)
  const [activeSourceRecord, setActiveSourceRecord] = useState(null)

  // Form State
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [ayatStart, setAyatStart] = useState('')
  const [ayatEnd, setAyatEnd] = useState('')
  const [recordDate, setRecordDate] = useState('')
  const [recordTime, setRecordTime] = useState('')
  const [murajaahLembar, setMurajaahLembar] = useState('')
  const [notesParent, setNotesParent] = useState('')

  // Ambil daftar Surah lengkap (1-114) secara dinamis dari database sistem
  useEffect(() => {
    let isMounted = true
    const fetchSurahs = async () => {
      try {
        setIsSurahListLoading(true)
        const res = await api.get('/equran/surah')
        const list = res.data?.data || []
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setSurahList(list)
        }
      } catch (err) {
        console.error('Gagal mengambil daftar surah Al-Qur\'an:', err)
      } finally {
        if (isMounted) setIsSurahListLoading(false)
      }
    }
    fetchSurahs()
    return () => {
      isMounted = false
    }
  }, [])

  // Fungsi memuat ayat-ayat dari database untuk Mushaf Viewer
  const loadSurahVerses = useCallback(async (surahNumber) => {
    if (!surahNumber) return
    try {
      setIsAyatLoading(true)
      const res = await api.get(`/equran/surah/${surahNumber}`)
      const ayat = res.data?.ayat || res.data?.data?.ayat || []
      setSurahAyatList(Array.isArray(ayat) ? ayat : [])
    } catch {
      setSurahAyatList([])
    } finally {
      setIsAyatLoading(false)
    }
  }, [])

  const safeLogs = useMemo(() => {
    if (Array.isArray(logs)) return logs
    if (logs && Array.isArray(logs.data)) return logs.data
    if (logs && logs.data && Array.isArray(logs.data.data)) return logs.data.data
    return []
  }, [logs])

  // Kumpulan data KHUSUS MURAJA'AH saja (bukan Ziyadah atau Tilawah)
  const murajaahRecords = useMemo(() => {
    return safeLogs
      .filter((log) => isMurajaahRecord(log))
      .map((log) => parseLogInfo(log, surahList))
      .filter((parsed) => parsed && parsed.surahName && parsed.aStart && parsed.aEnd)
  }, [safeLogs, surahList])

  const totalAyatFromLogs = useMemo(() => {
    return safeLogs.reduce((acc, curr) => {
      if (curr.jumlah_ayat !== undefined && curr.jumlah_ayat !== null && Number(curr.jumlah_ayat) > 0) {
        return acc + Number(curr.jumlah_ayat)
      }
      const start = Number(curr.hafalan_ayah_start ?? curr.ayat_start ?? curr.ayat_mulai)
      const end = Number(curr.hafalan_ayah_end ?? curr.ayat_end ?? curr.ayat_selesai)
      if (start > 0 && end >= start) {
        return acc + (end - start + 1)
      }
      return acc + (Number(curr.hafalan_baris) || 0)
    }, 0)
  }, [safeLogs])

  const totalAyat = achievement?.validated_unique_ayah ?? totalAyatFromLogs

  // Cari log setoran terbaru
  const latestLog = useMemo(() => {
    return (
      safeLogs.find((l) => (l.hafalan_surah_name || l.surah || l.nama_surah) && (l.hafalan_ayah_start || l.ayat_start || l.ayat_mulai)) ||
      safeLogs.find((l) => l.hafalan_surah_name || l.surah || l.nama_surah || l.tilawah_text) ||
      safeLogs[0] ||
      null
    )
  }, [safeLogs])

  const latestSurah = latestLog?.hafalan_surah_name || latestLog?.surah || latestLog?.nama_surah || (latestLog?.tilawah_text ? latestLog.tilawah_text : '')
  const latestAyatStart = latestLog?.hafalan_ayah_start ?? latestLog?.ayat_start ?? latestLog?.ayat_mulai
  const latestAyatEnd = latestLog?.hafalan_ayah_end ?? latestLog?.ayat_end ?? latestLog?.ayat_selesai
  const latestDate = latestLog?.record_date || latestLog?.date || latestLog?.tanggal || latestLog?.created_at
  const latestTeacher = latestLog?.teacher?.full_name || latestLog?.teacher?.nama_lengkap || latestLog?.teacher?.name || latestLog?.teacher_name || latestLog?.pengampu || latestLog?.signature_teacher || '-'
  const latestNilai = latestLog?.nilai || latestLog?.predikat || latestLog?.quality || null

  const targetProgress = useMemo(() => {
    if (achievement?.achievement_percentage !== null && achievement?.achievement_percentage !== undefined) {
      return achievement.achievement_percentage
    }
    const targetAyat = target?.target_ayat
    return targetAyat && targetAyat > 0 ? Math.min(100, Math.round((totalAyat / targetAyat) * 100)) : null
  }, [achievement, totalAyat, target])

  const targetSurah = target?.surah_target || target?.target_surah || null
  const targetAyatTotal = target?.target_ayat || null

  // Filter logs berdasarkan kategori (ziyadah, murajaah, tilawah) dan pencarian
  const filteredLogs = useMemo(() => {
    return safeLogs.filter((item) => {
      const isMuraj = isMurajaahRecord(item)
      const cat = String(item.category || item.type || '').toLowerCase()
      const hasZiyadah = cat === 'ziyadah' || (!isMuraj && item.hafalan_surah_name && (item.hafalan_ayah_start || item.ayat_start))
      const hasTilawah = cat === 'tilawah' || Boolean(item.tilawah_text)

      let matchCategory = true
      if (activeCategory === 'ziyadah') matchCategory = hasZiyadah
      else if (activeCategory === 'murajaah') matchCategory = isMuraj
      else if (activeCategory === 'tilawah') matchCategory = hasTilawah

      if (!matchCategory) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const surah = String(item.hafalan_surah_name || item.surah || item.nama_surah || item.tilawah_text || item.murajaah_text || '').toLowerCase()
        const teacher = String(item.teacher?.full_name || item.teacher?.nama_lengkap || item.teacher?.name || item.teacher_name || '').toLowerCase()
        const note = String(item.notes_teacher || item.catatan || item.notes_parent || '').toLowerCase()
        const pred = String(item.nilai || item.predikat || '').toLowerCase()

        return surah.includes(q) || teacher.includes(q) || note.includes(q) || pred.includes(q)
      }

      return true
    })
  }, [safeLogs, activeCategory, searchQuery])

  // Ayat yang sedang dimuroja'ahkan (hanya memfilter ayat dalam rentang yang diulang)
  const repeatedVerses = useMemo(() => {
    if (!surahAyatList || surahAyatList.length === 0) return []
    const start = parseInt(ayatStart, 10)
    const end = parseInt(ayatEnd, 10)
    const s = !isNaN(start) && start > 0 ? start : (surahAyatList[0]?.nomor_ayat || 1)
    const e = !isNaN(end) && end >= s ? end : (selectedSurah?.jumlah_ayat || surahAyatList[surahAyatList.length - 1]?.nomor_ayat || s)
    return surahAyatList.filter((ay) => {
      const no = Number(ay.nomor_ayat || ay.nomor || ay.ayat)
      return no >= s && no <= e
    })
  }, [surahAyatList, ayatStart, ayatEnd, selectedSurah])

  // Buka Modal Pengulangan (Muroja'ah) terikat pada data hafalan yang dipilih
  const openMurajaahModalWithRecord = (sourceParsed, isLocked = false) => {
    if (!sourceParsed) return

    setIsMurajaahLockedByTeacher(isLocked)
    setActiveSourceRecord(sourceParsed)
    setSubmitFeedback(null)

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const calculatedPages =
      sourceParsed.rawLog?.murajaah_lembar && Number(sourceParsed.rawLog.murajaah_lembar) > 0
        ? String(sourceParsed.rawLog.murajaah_lembar)
        : sourceParsed.aStart && sourceParsed.aEnd && Number(sourceParsed.aEnd) >= Number(sourceParsed.aStart)
          ? String(Math.max(0.5, Math.round(((Number(sourceParsed.aEnd) - Number(sourceParsed.aStart) + 1) / 15) * 10) / 10))
          : ''

    setRecordDate(todayStr)
    setRecordTime(timeStr)
    setMurajaahLembar(calculatedPages)
    setNotesParent('')

    let sObj = null
    if (sourceParsed.matchedSurah) {
      sObj = sourceParsed.matchedSurah
    } else if (sourceParsed.surahNum) {
      sObj = surahList.find((s) => Number(s.nomor) === Number(sourceParsed.surahNum)) || null
    } else if (sourceParsed.surahName) {
      const clean = sourceParsed.surahName.toLowerCase().replace(/[^a-z]/g, '')
      sObj = surahList.find((s) => {
        const lat = String(s.nama_latin || '').toLowerCase().replace(/[^a-z]/g, '')
        return lat === clean || lat.includes(clean) || clean.includes(lat)
      }) || null
    }

    if (!sObj && (sourceParsed.surahNum || sourceParsed.surahName)) {
      sObj = {
        nomor: sourceParsed.surahNum || null,
        nama_latin: sourceParsed.surahName || (sourceParsed.surahNum ? `Surah #${sourceParsed.surahNum}` : ''),
        jumlah_ayat: null,
      }
    }

    setSelectedSurah(sObj)
    setAyatStart(sourceParsed.aStart !== null && sourceParsed.aStart !== undefined ? String(sourceParsed.aStart) : '')
    setAyatEnd(sourceParsed.aEnd !== null && sourceParsed.aEnd !== undefined ? String(sourceParsed.aEnd) : (sourceParsed.aStart ? String(sourceParsed.aStart) : ''))

    // Muat teks ayat mushaf secara otomatis dari database
    if (sObj?.nomor) {
      void loadSurahVerses(sObj.nomor)
    }

    setIsMurajaahModalOpen(true)
  }

  // Buka Modal dari Kartu Tugas Aktif Ustadz (pendingHomeMurajaah) -> Terkunci Otomatis (isLocked = true)
  const openMurajaahForAssignment = (assignment) => {
    if (!assignment) return
    const parsed = parseLogInfo(assignment, surahList)
    openMurajaahModalWithRecord(
      {
        ...parsed,
        isTeacherAssignment: true,
        notesTeacher: assignment.notes_teacher || null,
      },
      true // isLocked = true, dikunci dari guru!
    )
  }

  // Buka Modal dari tombol Header: Hanya untuk tugas ustadz atau riwayat murojaah ananda
  const handleOpenGeneralMurajaah = () => {
    if (pendingHomeMurajaah && pendingHomeMurajaah.status !== 'submitted_by_parent') {
      openMurajaahForAssignment(pendingHomeMurajaah)
      return
    }
    if (murajaahRecords.length > 0) {
      openMurajaahModalWithRecord(murajaahRecords[0], false)
      return
    }
  }

  // Ganti target hafalan yang sedang dimuroja'ahkan (hanya dari daftar riwayat muroja'ah)
  const handleSwitchTargetHafalan = (targetId) => {
    const found = murajaahRecords.find((r) => String(r.id) === String(targetId))
    if (found) {
      openMurajaahModalWithRecord(found, false)
    }
  }

  // Submit Handler ke Backend
  const handleSubmitMurajaah = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (!selectedSurah) {
      setSubmitFeedback({
        type: 'error',
        message: 'Data surah hafalan yang dimuroja\'ahkan tidak terdeteksi.',
      })
      return
    }

    const startNum = parseInt(ayatStart, 10)
    const endNum = parseInt(ayatEnd, 10)

    if (isNaN(startNum) || startNum < 1) {
      setSubmitFeedback({
        type: 'error',
        message: 'Nomor ayat awal minimal 1.',
      })
      return
    }
    if (isNaN(endNum) || endNum < startNum) {
      setSubmitFeedback({
        type: 'error',
        message: 'Nomor ayat akhir harus lebih besar atau sama dengan ayat awal.',
      })
      return
    }
    if (selectedSurah.jumlah_ayat && endNum > selectedSurah.jumlah_ayat) {
      setSubmitFeedback({
        type: 'error',
        message: `Surah ${selectedSurah.nama_latin} hanya memiliki ${selectedSurah.jumlah_ayat} ayat. Ayat akhir tidak boleh melebihi batas surah.`,
      })
      return
    }

    const studentId = student?.id
    if (!studentId) {
      setSubmitFeedback({
        type: 'error',
        message: 'Data ananda/siswa tidak terdeteksi. Silakan pilih ananda terlebih dahulu.',
      })
      return
    }

    setSubmittingMurajaah(true)
    setSubmitFeedback(null)

    try {
      const payload = {
        student_id: studentId,
        surah_number: Number(selectedSurah.nomor),
        ayat_start: startNum,
        ayat_end: endNum,
        record_date: recordDate,
        record_time: recordTime || undefined,
        murajaah_lembar:
          !isNaN(parseFloat(murajaahLembar)) && parseFloat(murajaahLembar) > 0
            ? parseFloat(murajaahLembar)
            : endNum >= startNum
              ? Math.max(0.5, Math.round(((endNum - startNum + 1) / 15) * 10) / 10)
              : null,
        notes_parent: notesParent.trim() || undefined,
      }

      const res = await api.post('/portal/tahfizh/murajaah', payload)
      setSubmitFeedback({
        type: 'success',
        message: res.data?.message || 'Alhamdulillah, laporan pengulangan hafalan di rumah berhasil dikirim ke Ustadz.',
      })

      setTimeout(() => {
        setIsMurajaahModalOpen(false)
        if (typeof onMurajaahSubmitted === 'function') {
          onMurajaahSubmitted()
        }
      }, 1300)
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        'Gagal mengirim laporan setoran muroja\'ah. Silakan periksa kelengkapan isian Anda.'
      setSubmitFeedback({
        type: 'error',
        message: errMsg,
      })
    } finally {
      setSubmittingMurajaah(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. HERO HEADER CONTAINER */}
      <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] p-5 sm:p-7 shadow-lg shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[.06] [background-image:radial-gradient(circle_at_2px_2px,#059669_1.5px,transparent_0)] [background-size:24px_24px]"
        />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xl shadow-sm">
              <BookOpenCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <HeroChip
                  size="sm"
                  variant="flat"
                  className="font-extrabold text-[10.5px] bg-emerald-500/20 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
                >
                  <Sparkles className="h-3 w-3 text-emerald-600 mr-1 inline" />
                  Al-Qur'an & Tahfizh Santri
                </HeroChip>
                {student?.unit_name && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200">
                    <School className="h-3 w-3 text-emerald-600" />
                    <span>{student.unit_name}</span>
                  </span>
                )}
                {student?.class_name && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200">
                    <Layers className="h-3 w-3 text-teal-600" />
                    <span>{student.class_name}</span>
                  </span>
                )}
              </div>
              <h1 className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Tahfizh & Setoran Hafalan
              </h1>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-xl">
                Rekapitulasi resmi hafalan Al-Qur'an, setoran ziyadah harian, penguatan muroja'ah di rumah, serta verifikasi tajwid & makhraj ananda.
              </p>
            </div>
          </div>

          {/* Action Header Button: Muroja'ah Hanya Tampil untuk Tugas Muroja'ah Ustadz atau saat Tab Muroja'ah Aktif */}
          <div className="flex flex-wrap items-center gap-3">
            {(pendingHomeMurajaah || (activeCategory === 'murajaah' && murajaahRecords.length > 0)) && (
              <HeroButton
                size="md"
                onPress={handleOpenGeneralMurajaah}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white px-5 py-2.5 text-xs sm:text-sm font-black shadow-lg shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <RotateCw className="h-4 w-4" />
                {pendingHomeMurajaah && pendingHomeMurajaah.status !== 'submitted_by_parent'
                  ? 'Ulangi Tugas Muroja\'ah'
                  : 'Muroja\'ah Hafalan Ananda'}
              </HeroButton>
            )}

            {/* Target Box Quick Pill */}
            {(targetSurah || targetAyatTotal) && (
              <div className="shrink-0 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 p-3.5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-800/90 max-w-md">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" />
                  Target Semester
                </span>
                <p className="mt-0.5 text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {targetSurah || (targetAyatTotal ? `${targetAyatTotal} Ayat` : '-')}
                </p>
                {targetAyatTotal ? (
                  <p className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                    {targetProgress !== null ? `${targetProgress}% tercapai` : 'Berjalan'}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </HeroCard>

      {/* 2. ACTIVE PENDING TASK CARD (Tugas Pengulangan di Rumah dari Ustadz) */}
      {pendingHomeMurajaah && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <HeroCard
            className={cn(
              'relative overflow-hidden rounded-xl border-2 p-5 sm:p-6 shadow-md transition-all',
              pendingHomeMurajaah.status === 'submitted_by_parent'
                ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:border-emerald-800/60 dark:bg-slate-900'
                : 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:border-emerald-800/60 dark:bg-slate-900'
            )}
          >
            <div
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full blur-3xl',
                pendingHomeMurajaah.status === 'submitted_by_parent'
                  ? 'bg-sky-400/20'
                  : 'bg-amber-400/25'
              )}
            />

            <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-0.5 text-[10.5px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                    Tugas Pengulangan di Rumah
                  </span>

                  <HeroChip
                    size="sm"
                    variant="flat"
                    className={cn(
                      'font-black text-[10px]',
                      pendingHomeMurajaah.status === 'submitted_by_parent'
                        ? 'bg-sky-100 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300 dark:border-emerald-800/60'
                        : 'bg-amber-100 text-amber-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
                    )}
                  >
                    {pendingHomeMurajaah.status === 'submitted_by_parent'
                      ? 'Laporan Terkirim (Menunggu Verifikasi)'
                      : 'Wajib Diulang di Rumah'}
                  </HeroChip>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
                  Surah {pendingHomeMurajaah.surah_name || (pendingHomeMurajaah.surah_number ? `Surah ke-${pendingHomeMurajaah.surah_number}` : '-')}
                  {pendingHomeMurajaah.ayat_start ? ` (Ayat ${pendingHomeMurajaah.ayat_start}${pendingHomeMurajaah.ayat_end ? ` - ${pendingHomeMurajaah.ayat_end}` : ''})` : ''}
                </h3>

                {pendingHomeMurajaah.notes_teacher && (
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-xl italic">
                    "{pendingHomeMurajaah.notes_teacher}"
                  </p>
                )}

                {pendingHomeMurajaah.record_date && (
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 pt-0.5">
                    Ditugaskan pada: <b>{formatDate(pendingHomeMurajaah.record_date)}</b>
                  </p>
                )}
              </div>

              {/* Action Button: Lakukan & Kirim Setoran Muraja'ah */}
              <div className="shrink-0">
                {pendingHomeMurajaah.status !== 'submitted_by_parent' ? (
                  <HeroButton
                    size="md"
                    onPress={() => openMurajaahForAssignment(pendingHomeMurajaah)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white px-5 py-2.5 text-xs sm:text-sm font-black shadow-lg shadow-sm hover:scale-[1.02] cursor-pointer"
                  >
                    <BookCheckIcon className="h-4 w-4" />
                    Lakukan & Kirim Setoran Muraja'ah
                  </HeroButton>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-800 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300">
                    <CheckCircle className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Laporan pengulangan telah dikirim ke Ustadz. Menunggu verifikasi.</span>
                  </div>
                )}
              </div>
            </div>
          </HeroCard>
        </motion.div>
      )}

      {/* 3. KPI CARDS (4 CARDS) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Card 1: Total Ayat */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-4.5 sm:p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-emerald-950/50">
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white">
                <BookOpenCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200">
                {totalAyat}
              </span>
            </div>
            <p className="relative mt-3.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
              Total Hafalan (Ayat)
            </p>
            <p className="relative mt-0.5 text-xs font-medium text-emerald-700/80 dark:text-emerald-400/80">
              Ayat unik yang telah tervalidasi
            </p>
          </div>
        </motion.div>

        {/* Card 2: Surah Selesai */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-teal-100/90 hover:!bg-teal-200/70 p-4.5 sm:p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-teal-950/50">
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl !bg-teal-600 !text-white shadow-sm dark:!bg-teal-600 dark:!text-white">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-teal-800 dark:text-teal-200">
                {achievement?.completed_surah_count ?? 0}
              </span>
            </div>
            <p className="relative mt-3.5 text-xs font-black text-teal-800 dark:text-teal-300">
              Surah Selesai
            </p>
            <p className="relative mt-0.5 text-xs font-medium text-teal-700/80 dark:text-teal-400/80">
              Seluruh ayat tuntas mutqin
            </p>
          </div>
        </motion.div>

        {/* Card 3: Progress Target */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 hover:!bg-amber-200/70 p-4.5 sm:p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-amber-950/50">
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl !bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white">
                <Award className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-200">
                {targetProgress !== null ? `${targetProgress}%` : '-'}
              </span>
            </div>
            <p className="relative mt-3.5 text-xs font-black text-amber-800 dark:text-amber-300">
              Progress Hafalan
            </p>
            <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200/80 dark:bg-amber-900/60">
              <div
                className="h-full rounded-full bg-amber-600 dark:bg-amber-500 transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, Number(targetProgress) || 0))}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Card 4: Juz Selesai */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-violet-100/90 hover:!bg-violet-200/70 p-4.5 sm:p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-violet-950/50">
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl !bg-violet-600 !text-white shadow-sm dark:!bg-violet-600 dark:!text-white">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-violet-800 dark:text-violet-200">
                {achievement?.completed_juz_count ?? 0}
              </span>
            </div>
            <p className="relative mt-3.5 text-xs font-black text-violet-800 dark:text-violet-300">
              Juz Selesai
            </p>
            <p className="relative mt-0.5 text-xs font-medium text-violet-700/80 dark:text-violet-400/80">
              Tervalidasi lengkap penguji
            </p>
          </div>
        </motion.div>
      </div>

      {/* 4. SETORAN TERAKHIR AKTIF (HERO HIGHLIGHT CARD) */}
      <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md dark:border-emerald-800/60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-40 w-40 bg-emerald-500/20 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-200">
                <Sparkles className="h-3 w-3 text-emerald-300" /> Setoran Terakhir Aktif
              </span>
              {latestNilai && (
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  Nilai: {latestNilai}
                </span>
              )}
            </div>
            <h3 className="mt-2.5 text-lg sm:text-xl font-black text-white">
              {latestSurah
                ? latestAyatStart && latestAyatEnd
                  ? `${latestSurah} : Ayat ${latestAyatStart} - ${latestAyatEnd}`
                  : latestSurah
                : 'Belum Ada Setoran'}
            </h3>
            <p className="mt-1 text-xs text-emerald-100/90 font-medium">
              {latestLog ? (
                <>
                  Tanggal: <b>{formatDate(latestDate)}</b> · Penguji:{' '}
                  <b>{latestTeacher}</b>
                </>
              ) : (
                'Catatan setoran ananda akan otomatis muncul setelah disetorkan kepada asatidz.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {latestLog?.notes_teacher && (
              <div className="rounded-xl border border-emerald-200/15 bg-white/10 p-3 max-w-md text-xs italic text-emerald-50">
                "{latestLog.notes_teacher}"
              </div>
            )}

            {/* Tombol Muroja'ah pada Setoran Terakhir HANYA jika jenis datanya adalah Muroja'ah */}
            {latestLog && isMurajaahRecord(latestLog) && (
              <HeroButton
                size="sm"
                onPress={() => openMurajaahModalWithRecord(parseLogInfo(latestLog, surahList), false)}
                className="shrink-0 rounded-xl bg-white/20 border border-emerald-200/30 hover:bg-white/30 font-black text-xs cursor-pointer shadow-xs"
              >
                <RotateCw className="h-3.5 w-3.5 mr-1" /> Ulangi Hafalan Ini
              </HeroButton>
            )}
          </div>
        </div>
      </HeroCard>

      {/* 5. TOOLBAR FILTER & PENCARIAN */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Semua Setoran' },
            { id: 'ziyadah', label: 'Ziyadah (Baru)' },
            { id: 'murajaah', label: "Muroja'ah (Sekolah & Rumah)" },
            { id: 'tilawah', label: 'Tilawah' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-emerald-200/80 dark:border-emerald-800/60 text-slate-600 hover:bg-emerald-50/40 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300'
                  }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari surah, ayat, penguji..."
            className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* 6. RIWAYAT SETORAN TAHFIZH (HERO LIST CONTAINER) */}
      <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Riwayat Setoran Hafalan Santri
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Daftar seluruh setoran ziyadah harian, tilawah, dan pengulangan muroja'ah santri.
            </p>
          </div>
          <HeroChip size="sm" variant="flat" color="success" className="font-extrabold text-xs">
            {filteredLogs.length} Setoran Tercatat
          </HeroChip>
        </div>

        <div className="mt-4 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
          {filteredLogs.map((item, idx) => {
            const parsed = parseLogInfo(item, surahList)
            const isMuraj = isMurajaahRecord(item)
            const surahTitle = parsed?.surahName || item.hafalan_surah_name || item.surah || item.nama_surah || item.tilawah_text || 'Setoran Tahfizh'
            const aStart = parsed?.aStart ?? (item.hafalan_ayah_start ?? item.ayat_start ?? item.ayat_mulai)
            const aEnd = parsed?.aEnd ?? (item.hafalan_ayah_end ?? item.ayat_end ?? item.ayat_selesai)
            const itemDate = item.record_date || item.date || item.tanggal || item.created_at
            const teacherName = parsed?.teacherName || '-'
            const itemNote = item.notes_teacher || item.catatan || item.notes_parent
            const nilaiVal = item.nilai || item.predikat || item.quality || null
            const isApproved =
              String(item.status).toLowerCase() === 'approved' ||
              String(item.status).toLowerCase() === 'verified'
            const isPending =
              String(item.status).toLowerCase() === 'pending_approval' ||
              String(item.murajaah_status).toLowerCase() === 'submitted_by_parent'

            const isSubmittedByParent =
              Boolean(item.metadata?.submitted_by_parent) ||
              Boolean(item.signature_parent) ||
              Boolean(item.notes_parent && !item.teacher_id)

            return (
              <div
                key={item.id || idx}
                className="group flex flex-wrap items-center justify-between gap-4 py-3.5 transition-all hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 rounded-xl px-2.5 -mx-2.5"
              >
                <div
                  className="space-y-1.5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => setSelectedLogDetail(parsed || item)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {surahTitle}
                    </span>
                    {aStart ? (
                      <HeroChip
                        size="sm"
                        variant="flat"
                        color="success"
                        className="font-extrabold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60"
                      >
                        {aEnd && aEnd !== aStart ? `Ayat ${aStart} - ${aEnd}` : `Ayat ${aStart}`}
                      </HeroChip>
                    ) : (
                      <HeroChip
                        size="sm"
                        variant="flat"
                        className="font-extrabold text-[10px] bg-teal-50 text-teal-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950 dark:text-teal-300 dark:border-emerald-800/60"
                      >
                        {isMuraj ? "Muroja'ah" : item.tilawah_text ? 'Tilawah' : 'Ziyadah'}
                      </HeroChip>
                    )}

                    {/* Lencana Khusus Pengulangan di Rumah oleh Orang Tua */}
                    {isSubmittedByParent && (
                      <HeroChip
                        size="sm"
                        variant="flat"
                        className="font-extrabold text-[10px] bg-sky-50 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300 dark:border-emerald-800/60"
                      >
                        <User className="h-2.5 w-2.5 mr-1 inline text-sky-600" />
                        Muroja'ah di Rumah (Ortu)
                      </HeroChip>
                    )}

                    {item.jumlah_ayat ? (
                      <span className="text-[10.5px] font-medium text-slate-400">
                        ({item.jumlah_ayat} Ayat)
                      </span>
                    ) : null}

                    {item.murajaah_lembar ? (
                      <span className="text-[10.5px] font-medium text-slate-400">
                        · {item.murajaah_lembar} Lembar
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {formatDate(itemDate)}{' '}
                    {item.metadata?.murajaah_time ? `pukul ${item.metadata.murajaah_time}` : ''} ·{' '}
                    {isSubmittedByParent ? (
                      <>
                        Pelapor:{' '}
                        <b className="text-slate-700 dark:text-slate-200">
                          {item.metadata?.parent_name || item.signature_parent || 'Orang Tua / Wali'}
                        </b>
                      </>
                    ) : (
                      <>
                        Penguji:{' '}
                        <b className="text-slate-700 dark:text-slate-200">{teacherName}</b>
                      </>
                    )}
                  </p>

                  {itemNote ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium">
                      "{itemNote}"
                    </p>
                  ) : null}

                  {/* Rincian Makhraj / Tajwid jika tersedia */}
                  {(item.tajwid || item.kelancaran || item.makhraj) && (
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      {item.tajwid && (
                        <span>
                          Tajwid: <b className="text-emerald-700 dark:text-emerald-400">{item.tajwid}</b>
                        </span>
                      )}
                      {item.kelancaran && (
                        <span>
                          Kelancaran: <b className="text-emerald-700 dark:text-emerald-400">{item.kelancaran}</b>
                        </span>
                      )}
                      {item.makhraj && (
                        <span>
                          Makhraj: <b className="text-emerald-700 dark:text-emerald-400">{item.makhraj}</b>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2.5">
                  {nilaiVal ? (
                    <span className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white px-3 py-1 text-xs font-black shadow-xs">
                      {nilaiVal}
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 text-xs font-bold">
                      Menunggu Verifikasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 text-xs font-bold">
                      {isApproved ? 'Terverifikasi' : 'Tercatat'}
                    </span>
                  )}

                  {/* Tombol Rincian Detail Modal */}
                  <HeroButton
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setSelectedLogDetail(parsed || item)}
                    className="size-8 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 cursor-pointer"
                    title="Lihat Rincian Setoran"
                  >
                    <Eye className="h-4 w-4" />
                  </HeroButton>

                  {/* Tombol Ulangi Muroja'ah: HANYA TAMPIL UNTUK DATA MURAJAAH SAJA */}
                  {isMuraj && parsed && (
                    <HeroButton
                      size="sm"
                      variant="flat"
                      onPress={() => openMurajaahModalWithRecord(parsed, false)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60 font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      <RotateCw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Ulangi (Muroja'ah)
                    </HeroButton>
                  )}
                </div>
              </div>
            )
          })}

          {!filteredLogs.length && (
            <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
              <BookOpenCheck className="mx-auto h-10 w-10 text-emerald-300 dark:text-emerald-700" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum Ada Riwayat Setoran Tahfizh
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchQuery || activeCategory !== 'all'
                  ? 'Tidak ada setoran hafalan yang sesuai dengan filter atau kata kunci pencarian.'
                  : 'Catatan setoran ziyadah dan muroja\'ah santri akan otomatis muncul di sini setelah divalidasi oleh asatidz pembimbing.'}
              </p>
              {(searchQuery || activeCategory !== 'all') && (
                <HeroButton
                  size="sm"
                  variant="bordered"
                  onPress={() => {
                    setActiveCategory('all')
                    setSearchQuery('')
                  }}
                  className="mt-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-300 font-bold cursor-pointer"
                >
                  Reset Filter
                </HeroButton>
              )}
            </div>
          )}
        </div>
      </HeroCard>

      {/* 7. HERO UI MODAL: DETAIL RINCIAN SETORAN SISWA */}
      {selectedLogDetail && (() => {
        const item = selectedLogDetail
        const isDetailMuraj = isMurajaahRecord(item)
        const surahTitle = item.surahName || item.hafalan_surah_name || item.surah || item.nama_surah || item.tilawah_text || 'Setoran Hafalan'
        const aStart = item.aStart ?? (item.hafalan_ayah_start ?? item.ayat_start ?? item.ayat_mulai)
        const aEnd = item.aEnd ?? (item.hafalan_ayah_end ?? item.ayat_end ?? item.ayat_selesai)
        const itemDate = item.date || item.record_date || item.tanggal || item.created_at
        const teacherName = item.teacherName || item.teacher?.full_name || item.teacher?.nama_lengkap || item.teacher?.name || '-'
        const itemNote = item.notesTeacher || item.notes_teacher || item.catatan || item.notes_parent

        return (
          <AppModal
            isOpen={Boolean(selectedLogDetail)}
            onClose={() => setSelectedLogDetail(null)}
            title={surahTitle}
            badge={isDetailMuraj ? "Rincian Muroja'ah" : 'Rincian Setoran Tahfizh'}
            icon={BookOpenCheck}
            maxWidth="max-w-xl"
            zIndex="z-[70]"
            footer={
              <div className="flex w-full items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedLogDetail(null)}
                  className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Tutup
                </button>
                {isDetailMuraj && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedLogDetail
                      setSelectedLogDetail(null)
                      setTimeout(() => {
                        openMurajaahModalWithRecord(target, false)
                      }, 200)
                    }}
                    className="inline-flex h-9.5 items-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 cursor-pointer"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Ulangi (Muroja'ah)
                  </button>
                )}
              </div>
            }
          >
            <div className="space-y-4 text-slate-700 dark:text-slate-200">
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Rentang Hafalan:</span>
                  <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                    {aStart && aEnd && aStart !== aEnd
                      ? `Ayat ${aStart} s/d ${aEnd}`
                      : aStart
                        ? `Ayat ${aStart}`
                        : 'Setoran Lengkap'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tanggal Setor:</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatDate(itemDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Guru / Penguji:</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {teacherName}
                  </span>
                </div>
                {item.nilai && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Predikat Mutu:</span>
                    <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-xs font-black">
                      {item.nilai}
                    </span>
                  </div>
                )}
              </div>

              {itemNote && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Catatan / Evaluasi Pembimbing:
                  </label>
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-3 text-xs italic text-slate-700 dark:border-emerald-700/80 dark:bg-slate-800/80 dark:text-slate-300">
                    "{itemNote}"
                  </div>
                </div>
              )}

              {(item.tajwid || item.kelancaran || item.makhraj) && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {item.tajwid && (
                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 text-center dark:border-emerald-700/80 dark:bg-slate-800">
                      <span className="block text-[10px] text-slate-400">Tajwid</span>
                      <span className="text-xs font-black text-emerald-600">{item.tajwid}</span>
                    </div>
                  )}
                  {item.kelancaran && (
                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 text-center dark:border-emerald-700/80 dark:bg-slate-800">
                      <span className="block text-[10px] text-slate-400">Kelancaran</span>
                      <span className="text-xs font-black text-emerald-600">{item.kelancaran}</span>
                    </div>
                  )}
                  {item.makhraj && (
                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 text-center dark:border-emerald-700/80 dark:bg-slate-800">
                      <span className="block text-[10px] text-slate-400">Makhraj</span>
                      <span className="text-xs font-black text-emerald-600">{item.makhraj}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AppModal>
        )
      })()}

      {/* 8. HERO UI MODAL: FORM PENGULANGAN (MUROJA'AH) DI RUMAH DENGAN MUSHAF VIEWER & KUNCI GURU */}
      <AppModal
        isOpen={isMurajaahModalOpen}
        onClose={() => { if (!submittingMurajaah) setIsMurajaahModalOpen(false) }}
        disableBackdropClose={submittingMurajaah}
        hideCloseButton={submittingMurajaah}
        title="Lapor Pengulangan (Muroja'ah) Hafalan"
        badge="Input Murajaah di Rumah"
        subtitle={student?.full_name || undefined}
        icon={BookMarked}
        maxWidth="max-w-4xl"
        zIndex="z-[70]"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Pengulangan berbasis data hafalan nyata ananda di sekolah
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {student?.class_name ? `Kelas ${student.class_name}` : ''}
            </span>
          </div>
        }
      >
        <div className="space-y-5 text-slate-700 dark:text-slate-200">
          {/* Live Feedback Alert Banner */}
          {submitFeedback && (
            <div
              className={cn(
                'flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-semibold',
                submitFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50 text-rose-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/80 dark:text-rose-200 dark:border-emerald-800/60'
              )}
            >
              {submitFeedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="flex-1">{submitFeedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
            {/* Kolom Kiri (2 Kolom): INFORMASI DATA ASAL HAFALAN & KONTROL TERKUNCI */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4.5 dark:border-emerald-800/60 dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" />
                    Target Hafalan yang Diulang
                  </span>

                  {/* Status Terkunci dari Guru (Persis Mobile-App) */}
                  {isMurajaahLockedByTeacher ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] font-black dark:bg-amber-950 dark:text-amber-200 dark:border-emerald-800/60">
                      <Lock className="h-3 w-3 text-amber-600 dark:text-amber-300" /> Terkunci dari Guru
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60">
                      <Unlock className="h-3 w-3 text-emerald-600" /> Mandiri di Rumah
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    Surah {activeSourceRecord?.surahName || selectedSurah?.nama_latin || '-'}
                  </h4>
                  <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Rentang Wajib: Ayat {activeSourceRecord?.aStart || ayatStart} - {activeSourceRecord?.aEnd || ayatEnd}
                  </p>
                </div>

                {selectedSurah && (
                  <div className="rounded-xl bg-white/80 dark:bg-slate-800/80 p-2.5 text-xs font-medium space-y-1 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Nomor Surah:</span>
                      <b className="text-slate-800 dark:text-slate-200">Surah ke-{selectedSurah.nomor}</b>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Total Ayat:</span>
                      <b className="text-slate-800 dark:text-slate-200">{selectedSurah.jumlah_ayat} Ayat</b>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Tempat Turun:</span>
                      <b className="text-slate-800 dark:text-slate-200">{selectedSurah.tempat_turun}</b>
                    </div>
                  </div>
                )}

                {activeSourceRecord?.teacherName && activeSourceRecord.teacherName !== '-' && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Penguji Asal: <b>{activeSourceRecord.teacherName}</b>
                    {activeSourceRecord.date ? ` (${formatDate(activeSourceRecord.date)})` : ''}
                  </p>
                )}

                {activeSourceRecord?.notesTeacher && (
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 p-2.5 text-xs italic text-amber-900 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-200">
                    Catatan Ustadz: "{activeSourceRecord.notesTeacher}"
                  </div>
                )}

                {/* Tombol Toggle Buka Mushaf Al-Qur'an (Persis Mobile-App) */}
                <HeroButton
                  size="sm"
                  variant="flat"
                  onPress={() => setShowMushafViewer((prev) => !prev)}
                  className={cn(
                    'w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs font-black cursor-pointer transition-all',
                    showMushafViewer
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  {showMushafViewer ? 'Tutup Lembar Mushaf' : 'Buka Lembar Mushaf (Teks Ayat)'}
                </HeroButton>
              </div>

              {/* Selector Ganti Target HANYA dari Riwayat Muroja'ah (Bukan Ziyadah atau Tilawah) */}
              {!isMurajaahLockedByTeacher && murajaahRecords.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>Pilih Muroja'ah Lain yang Diulang:</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{murajaahRecords.length} Riwayat</span>
                  </label>
                  <CustomSelect
                    value={activeSourceRecord?.id || ''}
                    onChange={(e) => handleSwitchTargetHafalan(e.target.value)}
                    disabled={submittingMurajaah}
                    className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
                  >
                    {murajaahRecords.map((rec) => (
                      <option key={rec.id} value={rec.id}>
                        Surah {rec.surahName} (Ayat {rec.aStart}-{rec.aEnd}) · {formatDate(rec.date)}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
              )}
            </div>

            {/* Kolom Kanan (3 Kolom): VIEWER MUSHAF AYAT & FORMULIR PENGULANGAN ORANG TUA */}
            <div className="lg:col-span-3 space-y-4">
              {/* 1. VIEWER MUSHAF AYAT DARI DATABASE (Hanya merender ayat yang diulang, persis mobile-app) */}
              {showMushafViewer && (
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-900/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5 dark:border-emerald-800/60">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        Mushaf Ayat: Surah {selectedSurah?.nama_latin} ({ayatStart} - {ayatEnd})
                      </span>
                    </div>
                    <span className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black dark:bg-emerald-950 dark:text-emerald-300">
                      {repeatedVerses.length} Ayat Ditampilkan
                    </span>
                  </div>

                  {isAyatLoading ? (
                    <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      <span>Mengambil teks ayat Al-Qur'an dari database...</span>
                    </div>
                  ) : repeatedVerses.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Tidak ada ayat yang cocok untuk nomor {ayatStart} s/d {ayatEnd}.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
                      {repeatedVerses.map((ay) => {
                        const noAyat = ay.nomor_ayat || ay.nomor
                        const arabText = ay.teks_arab || ay.ar
                        const latinText = ay.teks_latin || ay.tr
                        const indoText = ay.teks_indonesia || ay.idn

                        return (
                          <div
                            key={noAyat}
                            className="rounded-xl border border-emerald-200/80 bg-white p-3.5 dark:border-emerald-800/60 dark:bg-slate-950 shadow-2xs space-y-2"
                          >
                            {/* Baris Atas: Nomor Ayat & Teks Arab Naskh */}
                            <div className="flex items-start justify-between gap-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-black dark:bg-emerald-950 dark:text-emerald-300">
                                {noAyat}
                              </span>
                              <p
                                dir="rtl"
                                className="text-right text-lg sm:text-xl font-serif text-slate-900 dark:text-white leading-loose select-all"
                                style={{ fontFamily: "'Traditional Arabic', 'Scheherazade New', 'Amiri', serif" }}
                              >
                                {arabText}
                              </p>
                            </div>

                            {/* Bacaan Transliterasi Latin */}
                            {latinText && (
                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 italic">
                                {latinText}
                              </p>
                            )}

                            {/* Arti / Terjemahan Bahasa Indonesia */}
                            {indoText && (
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {indoText}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 2. FORMULIR PENGULANGAN ORANG TUA */}
              <form onSubmit={handleSubmitMurajaah} className="space-y-4">
                {/* Rentang Ayat yang Diulang Kali Ini */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Ayat Mulai Diulang</span>
                      {isMurajaahLockedByTeacher && <Lock className="h-3 w-3 text-amber-500" />}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedSurah?.jumlah_ayat || undefined}
                      value={ayatStart}
                      onChange={(e) => setAyatStart(e.target.value)}
                      disabled={isMurajaahLockedByTeacher || submittingMurajaah}
                      required
                      className={cn(
                        'h-9.5 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:text-white',
                        isMurajaahLockedByTeacher
                          ? 'bg-slate-100 text-slate-500 dark:bg-slate-800/80 cursor-not-allowed'
                          : 'bg-white dark:bg-slate-800'
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Ayat Selesai Diulang</span>
                      {isMurajaahLockedByTeacher && <Lock className="h-3 w-3 text-amber-500" />}
                    </label>
                    <input
                      type="number"
                      min={ayatStart ? Number(ayatStart) : 1}
                      max={selectedSurah?.jumlah_ayat || undefined}
                      value={ayatEnd}
                      onChange={(e) => setAyatEnd(e.target.value)}
                      disabled={isMurajaahLockedByTeacher || submittingMurajaah}
                      required
                      className={cn(
                        'h-9.5 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:text-white',
                        isMurajaahLockedByTeacher
                          ? 'bg-slate-100 text-slate-500 dark:bg-slate-800/80 cursor-not-allowed'
                          : 'bg-white dark:bg-slate-800'
                      )}
                    />
                  </div>
                </div>

                {/* Summary Tag */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                  <span>Jumlah ayat yang dimuroja'ah:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {Number(ayatEnd) >= Number(ayatStart)
                      ? `${Number(ayatEnd) - Number(ayatStart) + 1} Ayat`
                      : 'Rentang tidak valid'}
                  </span>
                </div>

                {/* Tanggal & Waktu Muroja'ah di Rumah */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tanggal Muroja'ah
                    </label>
                    <DatePicker
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      disabled={submittingMurajaah}
                      required
                      inputClassName="h-9.5 text-xs font-semibold"
                      placeholder="Pilih tanggal..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Jam / Waktu
                    </label>
                    <input
                      type="time"
                      value={recordTime}
                      onChange={(e) => setRecordTime(e.target.value)}
                      disabled={submittingMurajaah}
                      className="h-9.5 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Jumlah Lembar Muroja'ah */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Jumlah Lembar / Halaman Dibaca
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={murajaahLembar}
                    onChange={(e) => setMurajaahLembar(e.target.value)}
                    disabled={submittingMurajaah}
                    className="h-9.5 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Catatan Evaluasi Orang Tua */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Catatan Evaluasi Orang Tua (Opsional)
                  </label>
                  <textarea
                    rows={2.5}
                    value={notesParent}
                    onChange={(e) => setNotesParent(e.target.value)}
                    disabled={submittingMurajaah}
                    placeholder="Catatan mengenai kelancaran hafalan, tajwid, atau makhraj ananda saat mengulang di rumah..."
                    className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 text-xs font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Status Notice Callout */}
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/70 p-3 text-xs text-sky-900 dark:border-emerald-800/60 dark:bg-sky-950/40 dark:text-sky-200 flex items-start gap-2">
                  <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <p>
                    Data pengulangan ini akan disimpan ke database dan langsung diteruskan ke Guru / Ustadz Tahfizh untuk verifikasi dan penilaian mutqin.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
                  <HeroButton
                    size="sm"
                    isDisabled={submittingMurajaah}
                    onPress={() => setIsMurajaahModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 cursor-pointer"
                  >
                    Batal
                  </HeroButton>
                  <HeroButton
                    size="sm"
                    type="submit"
                    isDisabled={submittingMurajaah}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-black text-white shadow-md transition-all cursor-pointer',
                      submittingMurajaah
                        ? 'bg-slate-400 opacity-70 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-sm hover:scale-[1.02]'
                    )}
                  >
                    {submittingMurajaah ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Simpan & Ajukan Verifikasi
                      </>
                    )}
                  </HeroButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AppModal>
    </div>
  )
}

function BookCheckIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="m9 9.5 2 2 4-4" />
    </svg>
  )
}
