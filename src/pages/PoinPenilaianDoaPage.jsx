import React, { useState, useEffect, useMemo } from 'react'
import {
  CheckCircle2,
  Edit3,
  FileCheck,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  Loader2,
  PenTool,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { prayerAssessmentService } from '../services/prayerAssessmentService'
import { kelasService } from '../services/kelasService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import PageContainer from '../components/app/PageContainer'

export default function PoinPenilaianDoaPage() {
  const user = useAuthStore((state) => state.user)
  const activeUnit = useUnitStore((state) => state.activeUnit)

  // Roles permission check
  const roles = useMemo(() => {
    return (user?.roles || []).map((r) => (typeof r === 'string' ? r.toLowerCase() : (r.name || '').toLowerCase()))
  }, [user])

  const canManageSettings = useMemo(() => {
    return (
      user?.is_superadmin ||
      roles.some((r) =>
        ['super admin', 'admin', 'kepala sekolah', 'kepsek', 'divisi pendidikan', 'tata usaha', 'tu'].includes(r)
      )
    )
  }, [user, roles])

  // Mode: 'scoring' (Lembar Penilaian Siswa) vs 'settings' (Pengaturan 62 Target Poin & Grade)
  const [activeTab, setActiveTab] = useState('scoring')

  // Master Items (62 Doa) & Grade Rules
  const [items, setItems] = useState([])
  const [gradeRules, setGradeRules] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)

  // Filter Siswa untuk Mode Lembar Penilaian
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Lembar Penilaian Siswa
  const [studentSheet, setStudentSheet] = useState(null)
  const [editScores, setEditScores] = useState({}) // { [prayer_item_id]: { score: number, is_paraf: boolean, notes: string } }
  const [loadingSheet, setLoadingSheet] = useState(false)
  const [savingSheet, setSavingSheet] = useState(false)

  // State Edit Pengaturan (Mode Settings)
  const [editableItems, setEditableItems] = useState([])
  const [editableGrades, setEditableGrades] = useState([])
  const [savingSettings, setSavingSettings] = useState(false)

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Muat Master Items & Grade Rules
  const loadMasterData = async () => {
    setLoadingItems(true)
    try {
      const [itemsRes, gradeRes] = await Promise.all([
        prayerAssessmentService.getItems(),
        prayerAssessmentService.getGradeRules(),
      ])
      if (itemsRes?.success) {
        setItems(itemsRes.data || [])
        setEditableItems(JSON.parse(JSON.stringify(itemsRes.data || [])))
      }
      if (gradeRes?.success) {
        setGradeRules(gradeRes.data || [])
        setEditableGrades(JSON.parse(JSON.stringify(gradeRes.data || [])))
      }
    } catch (err) {
      console.error('Error loading master prayer data:', err)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: 'Data target doa harian belum berhasil dimuat dari server.',
        confirmButtonColor: '#059669',
      })
    } finally {
      setLoadingItems(false)
    }
  }

  // 2. Muat Kelas
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await kelasService.getAll()
        const list = Array.isArray(res) ? res : res?.data || []
        setClasses(list)
        if (list.length > 0 && !selectedClassId) {
          setSelectedClassId(list[0].id)
        }
      } catch (err) {
        console.error('Error loading classes:', err)
      }
    }
    loadClasses()
    loadMasterData()
  }, [])

  // 3. Muat Siswa saat Kelas Dipilih
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([])
      setSelectedStudentId('')
      return
    }
    const loadStudents = async () => {
      setLoadingStudents(true)
      try {
        const res = await kelasService.getById(selectedClassId)
        const studentList = res?.students || res?.data?.students || []
        setStudents(studentList)
        if (studentList.length > 0) {
          setSelectedStudentId(studentList[0].id)
        } else {
          setSelectedStudentId('')
          setStudentSheet(null)
        }
      } catch (err) {
        console.error('Error loading students for class:', err)
      } finally {
        setLoadingStudents(false)
      }
    }
    loadStudents()
  }, [selectedClassId])

  // 4. Muat Lembar Penilaian Siswa saat Siswa Dipilih
  const loadStudentAssessment = async (studentId) => {
    if (!studentId) return
    setLoadingSheet(true)
    try {
      const res = await prayerAssessmentService.getStudentSheet(studentId)
      if (res?.success) {
        setStudentSheet(res)
        // Inisialisasi editScores
        const initial = {}
        ;(res.items || []).forEach((row) => {
          initial[row.id] = {
            score: row.poin !== null ? row.poin : '',
            is_paraf: false,
            notes: row.notes || '',
            originalParaf: Boolean(row.paraf_name),
          }
        })
        setEditScores(initial)
      }
    } catch (err) {
      console.error('Error loading student sheet:', err)
    } finally {
      setLoadingSheet(false)
    }
  }

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentAssessment(selectedStudentId)
    }
  }, [selectedStudentId])

  // Handler Nilai diubah
  const handleScoreChange = (itemId, val) => {
    setEditScores((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        score: val,
      },
    }))
  }

  // Handler Paraf diklik
  const handleToggleParaf = (itemId) => {
    setEditScores((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        is_paraf: !prev[itemId]?.is_paraf,
      },
    }))
  }

  // Simpan Lembar Penilaian Siswa
  const handleSaveStudentScores = async () => {
    if (!selectedStudentId) return
    setSavingSheet(true)
    try {
      const payload = Object.entries(editScores).map(([prayer_item_id, item]) => ({
        prayer_item_id,
        score: item.score !== '' && item.score !== null ? Number(item.score) : null,
        is_paraf: Boolean(item.is_paraf),
        notes: item.notes || null,
      }))

      await prayerAssessmentService.saveStudentScores(selectedStudentId, payload)
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan',
        text: 'Nilai poin dan paraf ujian hafalan doa telah diperbarui di database.',
        timer: 1800,
        showConfirmButton: false,
      })
      await loadStudentAssessment(selectedStudentId)
    } catch (err) {
      console.error('Error saving scores:', err)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan nilai.',
        confirmButtonColor: '#059669',
      })
    } finally {
      setSavingSheet(false)
    }
  }

  // Simpan Pengaturan 62 Target Doa & Skala Grade (Kepsek / Divisi / TU)
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      // 1. Simpan items
      const updatePromises = editableItems.map((item) =>
        prayerAssessmentService.updateItem(item.id, {
          order_number: Number(item.order_number),
          name: item.name,
          max_score: Number(item.max_score),
          passing_score: Number(item.passing_score),
          is_active: Boolean(item.is_active),
        })
      )
      // 2. Simpan rules
      const gradePromise = prayerAssessmentService.updateGradeRules(editableGrades)

      await Promise.all([...updatePromises, gradePromise])

      Swal.fire({
        icon: 'success',
        title: 'Pengaturan Tersimpan',
        text: 'Perubahan daftar 62 doa dan skala grade berhasil diperbarui.',
        timer: 1800,
        showConfirmButton: false,
      })
      await loadMasterData()
    } catch (err) {
      console.error('Error saving settings:', err)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Pengaturan',
        text: err?.response?.data?.message || 'Periksa hak akses atau format inputan Anda.',
        confirmButtonColor: '#059669',
      })
    } finally {
      setSavingSettings(false)
    }
  }

  // Filter daftar doa
  const filteredRows = useMemo(() => {
    const list = studentSheet?.items || items || []
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      (r) =>
        r.nama?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        String(r.no || r.order_number).includes(q)
    )
  }, [studentSheet, items, searchQuery])

  // Fungsi Cetak Lembar Dokumen Sekolah
  const handlePrint = () => {
    window.print()
  }

  return (
    <PageContainer>
      {/* Header Banner */}
      <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
              <FileCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Poin Penilaian Doa (62 Doa Harian)</h1>
              <p className="mt-1 text-xs text-emerald-100">
                Dokumen resmi kurikulum sekolah untuk evaluasi hafalan doa, paraf guru penguji, dan kalkulasi predikat.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManageSettings && (
              <div className="flex rounded-xl bg-black/20 p-1 backdrop-blur-md">
                <button
                  onClick={() => setActiveTab('scoring')}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'scoring' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <PenTool className="h-3.5 w-3.5" />
                  Lembar Penilaian Siswa
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'settings' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Pengaturan 62 Target & Grade
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <Printer className="h-4 w-4" />
              Cetak Dokumen
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: LEMBAR PENILAIAN SISWA (UNTUK GURU, WALAS, KEPSEK) */}
      {activeTab === 'scoring' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">Pilih Kelas</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama_kelas} ({c.tingkat})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Pilih Siswa {loadingStudents && '...'}
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={loadingStudents || students.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama_lengkap || s.name} (NIS: {s.nis})
                    </option>
                  ))}
                  {students.length === 0 && <option value="">Tidak ada siswa di kelas ini</option>}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">Cari Doa</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ketik nama doa atau nomor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleSaveStudentScores}
                  disabled={savingSheet || !selectedStudentId}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingSheet ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Simpan Nilai & Paraf
                </button>
              </div>
            </div>
          </div>

          {/* Ringkasan Skor & Predikat Grade Siswa */}
          {studentSheet?.summary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Rata-rata Skor
                </p>
                <p className="mt-2 text-2xl font-black text-emerald-950 dark:text-white">
                  {studentSheet.summary.average_score}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                  Total Poin: {studentSheet.summary.total_points}
                </p>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-900/40 dark:bg-sky-950/30">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Predikat / Grade</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-lg bg-sky-600 px-2.5 py-1 text-base font-black text-white">
                    Grade {studentSheet.summary.grade}
                  </span>
                  <span className="text-sm font-bold text-sky-900 dark:text-sky-200">
                    {studentSheet.summary.grade_label}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-sky-700">{studentSheet.summary.grade_description}</p>
              </div>

              <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4 dark:border-teal-900/40 dark:bg-teal-950/30">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">Doa Tuntas (KKM 75)</p>
                <p className="mt-2 text-2xl font-black text-teal-950 dark:text-white">
                  {studentSheet.summary.passed_items} / {studentSheet.summary.total_items}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-teal-600">
                  {Math.round((studentSheet.summary.passed_items / (studentSheet.summary.total_items || 1)) * 100)}%
                  Target Tercapai
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4 dark:border-purple-900/40 dark:bg-purple-950/30">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Identitas Siswa</p>
                <p className="mt-1 font-bold text-purple-950 dark:text-white truncate">
                  {studentSheet.student?.name}
                </p>
                <p className="text-[11px] text-purple-600">
                  {studentSheet.student?.class} · {studentSheet.student?.unit}
                </p>
              </div>
            </div>
          )}

          {/* TABEL FISIK OTENTIK SESUAI GAMBAR KERTAS SEKOLAH */}
          <div className="rounded-2xl border-2 border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {/* Header Cetak Formal (Hanya tampil saat print atau di lembar otentik) */}
            <div className="p-6 text-center border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Poin Penilaian Doa
              </h2>
              {studentSheet?.student && (
                <div className="mt-2 flex flex-wrap justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    Nama: <strong className="text-slate-900 dark:text-white">{studentSheet.student.name}</strong>
                  </span>
                  <span>
                    Kelas: <strong className="text-slate-900 dark:text-white">{studentSheet.student.class}</strong>
                  </span>
                  <span>
                    Tahun Ajaran:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {studentSheet.student.academic_year || '2026/2027'}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {loadingSheet ? (
              <div className="flex flex-col items-center justify-center p-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-xs font-semibold text-slate-500">Memuat lembar penilaian doa siswa...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    {/* Header Hijau Sage Persis Sesuai Gambar */}
                    <tr className="border-y-2 border-slate-900 bg-[#B8D8BA] text-slate-900 dark:bg-emerald-950 dark:text-emerald-100">
                      <th className="w-14 border-r border-slate-900 px-3 py-2.5 text-center font-black">No</th>
                      <th className="border-r border-slate-900 px-4 py-2.5 font-black">Doa Doa Harian</th>
                      <th className="w-28 border-r border-slate-900 px-3 py-2.5 text-center font-black">Poin</th>
                      <th className="w-36 px-3 py-2.5 text-center font-black">Paraf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
                    {filteredRows.map((row, idx) => {
                      const scoreState = editScores[row.id] || {}
                      const currentScore = scoreState.score
                      const isParafed = scoreState.is_paraf || Boolean(row.paraf_name)

                      return (
                        <tr
                          key={row.id}
                          className="border-b border-slate-300 hover:bg-emerald-50/40 dark:border-slate-800 dark:hover:bg-slate-800/50"
                        >
                          {/* Kolom 1: No */}
                          <td className="border-r border-slate-300 px-3 py-2 text-center font-bold text-slate-900 dark:text-white">
                            {row.no || row.order_number || idx + 1}
                          </td>

                          {/* Kolom 2: Doa Doa Harian */}
                          <td className="border-r border-slate-300 px-4 py-2 font-medium">
                            <span className="text-slate-900 dark:text-slate-100">{row.nama || row.name}</span>
                            {row.grup && (
                              <span className="ml-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-500 dark:bg-slate-800 print:hidden">
                                {row.grup}
                              </span>
                            )}
                          </td>

                          {/* Kolom 3: Poin */}
                          <td className="border-r border-slate-300 px-2 py-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="-"
                              value={currentScore !== undefined ? currentScore : ''}
                              onChange={(e) => handleScoreChange(row.id, e.target.value)}
                              className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-extrabold text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white print:border-none print:shadow-none"
                            />
                          </td>

                          {/* Kolom 4: Paraf */}
                          <td className="px-2 py-1 text-center">
                            {row.paraf_name ? (
                              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate max-w-[100px]">{row.paraf_name}</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleParaf(row.id)}
                                className={`rounded-md px-2.5 py-1 text-[10.5px] font-bold transition-all print:hidden ${
                                  scoreState.is_paraf
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {scoreState.is_paraf ? '✓ Siap Paraf' : 'Paraf'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: PENGATURAN MASTER 62 DOA & SKALA GRADE (KEPSEK, DIVISI PENDIDIKAN, TU) */}
      {activeTab === 'settings' && canManageSettings && (
        <div className="space-y-6">
          {/* Action Bar Simpan Pengaturan */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Konfigurasi Master Target Doa & Standar Grade
              </h3>
              <p className="text-xs text-slate-500">
                Wewenang Kepala Sekolah, Divisi Pendidikan, dan Tata Usaha (TU) untuk mengatur kurikulum poin doa.
              </p>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Seluruh Perubahan
            </button>
          </div>

          {/* Konfigurasi Rentang Skala Grade */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">
              1. Skala Konversi Nilai ke Grade & Predikat
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {editableGrades.map((g, idx) => (
                <div
                  key={g.id || idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-700 px-2 py-0.5 text-xs font-black text-white">
                      Grade {g.grade}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Urutan: {g.order_index}
                    </span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Nama Predikat
                      <input
                        type="text"
                        value={g.label}
                        onChange={(e) => {
                          const next = [...editableGrades]
                          next[idx].label = e.target.value
                          setEditableGrades(next)
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs font-bold text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block text-[10px] font-semibold text-slate-500">
                        Skor Min
                        <input
                          type="number"
                          value={g.min_score}
                          onChange={(e) => {
                            const next = [...editableGrades]
                            next[idx].min_score = Number(e.target.value)
                            setEditableGrades(next)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white p-1 text-center text-xs font-bold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </label>
                      <label className="block text-[10px] font-semibold text-slate-500">
                        Skor Max
                        <input
                          type="number"
                          value={g.max_score}
                          onChange={(e) => {
                            const next = [...editableGrades]
                            next[idx].max_score = Number(e.target.value)
                            setEditableGrades(next)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white p-1 text-center text-xs font-bold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel Master 62 Target Doa Harian */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                2. Daftar 62 Doa Harian & Bobot Poin Maksimum
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <th className="w-16 px-3 py-2.5 text-center">No</th>
                    <th className="px-4 py-2.5">Nama Doa Doa Harian</th>
                    <th className="w-36 px-3 py-2.5 text-center">Kelompok</th>
                    <th className="w-28 px-3 py-2.5 text-center">Poin Maks</th>
                    <th className="w-28 px-3 py-2.5 text-center">KKM</th>
                    <th className="w-20 px-3 py-2.5 text-center">Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {editableItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          value={item.order_number}
                          onChange={(e) => {
                            const next = [...editableItems]
                            next[idx].order_number = e.target.value
                            setEditableItems(next)
                          }}
                          className="w-12 rounded border border-slate-300 bg-white p-1 text-center font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const next = [...editableItems]
                            next[idx].name = e.target.value
                            setEditableItems(next)
                          }}
                          className="w-full rounded border border-slate-300 bg-white p-1.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="text"
                          value={item.group || ''}
                          onChange={(e) => {
                            const next = [...editableItems]
                            next[idx].group = e.target.value
                            setEditableItems(next)
                          }}
                          className="w-full rounded border border-slate-300 bg-white p-1 text-center text-[11px] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          value={item.max_score}
                          onChange={(e) => {
                            const next = [...editableItems]
                            next[idx].max_score = e.target.value
                            setEditableItems(next)
                          }}
                          className="w-16 rounded border border-slate-300 bg-white p-1 text-center font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          value={item.passing_score}
                          onChange={(e) => {
                            const next = [...editableItems]
                            next[idx].passing_score = e.target.value
                            setEditableItems(next)
                          }}
                          className="w-16 rounded border border-slate-300 bg-white p-1 text-center font-bold text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(item.is_active)}
                          onChange={(e) => {
                            const next = [...editableItems]
                            next[idx].is_active = e.target.checked
                            setEditableItems(next)
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
