import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  Search,
  X,
  UserCheck,
  GraduationCap,
  Users,
  BookOpen,
  Building2,
  School,
  FileText,
  Compass,
  ArrowRight,
} from 'lucide-react'

const SYSTEM_INDEX = [
  // Master Unit & Organization
  { title: 'Unit Pendidikan', type: 'Unit', link: '/dashboard/students/unit-pendidikan', desc: 'Kelola TK, SD, SMP, SMA, Ponpes' },
  { title: 'Jenis Unit', type: 'Unit', link: '/dashboard/master-jenis-unit', desc: 'Master jenjang dan kategori unit' },
  { title: 'Master Jabatan', type: 'Pegawai', link: '/dashboard/master-jabatan', desc: 'Struktur jabatan & posisi pegawai' },
  
  // Pegawai & Guru
  { title: 'Data Pegawai & Tendik', type: 'Pegawai', link: '/dashboard/employees', desc: 'Direktori pegawai kependidikan' },
  { title: 'Portal Guru & Workspace', type: 'Guru', link: '/portal-guru', desc: 'Jadwal, presensi, & kelas guru' },
  { title: 'Chat & Komunikasi Pegawai', type: 'Pegawai', link: '/dashboard/chat-pegawai', desc: 'Pesan internal civitas sekolah' },

  // Siswa & Orang Tua
  { title: 'Data Lengkap Siswa', type: 'Siswa', link: '/dashboard/students', desc: 'Master data siswa aktif & alumni' },
  { title: 'Data Kelas & Rombel', type: 'Kelas', link: '/dashboard/students/kelas', desc: 'Manajemen ruang kelas dan rombel' },
  { title: 'Portal Siswa', type: 'Portal', link: '/portal-siswa', desc: 'Portal peserta didik' },
  { title: 'Portal Orang Tua', type: 'Portal', link: '/portal-orangtua', desc: 'Portal wali murid & komunikasi' },

  // Akademik & Mapel
  { title: 'Pengaturan Akademik & Kurikulum', type: 'Mapel', link: '/dashboard/akademik/pengaturan', desc: 'Tahun ajaran, semester, & kurikulum' },
  { title: 'Perencanaan Pembelajaran (CP/TP)', type: 'Mapel', link: '/dashboard/akademik/perencanaan', desc: 'Capaian & tujuan pembelajaran' },
  { title: 'Materi & Modul Ajar LMS', type: 'Mapel', link: '/dashboard/akademik/pembelajaran', desc: 'Bahan ajar & media digital' },
  { title: 'Bank Soal & Kisi-kisi', type: 'Mapel', link: '/dashboard/akademik/evaluasi', desc: 'Ujian CBT & kisi-kisi' },
  { title: 'Buku Nilai & Rapor', type: 'Mapel', link: '/dashboard/akademik/nilai-rapor', desc: 'Pengolahan rapor semester' },

  // Al-Qur'an & Keagamaan
  { title: 'Master Surah Al-Qur’an', type: 'Mapel', link: '/dashboard/master-quran-surah', desc: 'Daftar surah & juz setoran' },
  { title: 'Jadwal Sholat & Ibadah', type: 'Portal', link: '/dashboard/master-jadwal-sholat', desc: 'Waktu sholat & presensi ibadah' },
  { title: 'Doa & Dzikir Yaumiyah', type: 'Portal', link: '/dashboard/master-doa', desc: 'Kumpulan doa harian santri' },
  { title: 'Dashboard Mutabaah', type: 'Portal', link: '/dashboard/mutabaah', desc: 'Rekap ibadah harian santri' },

  // Absensi & Gerbang
  { title: 'Absensi Pembelajaran', type: 'Portal', link: '/dashboard/absensi-pembelajaran', desc: 'Presensi kelas & jam mengajar' },
  { title: 'Absensi Gerbang Sekolah', type: 'Portal', link: '/dashboard/absensi-gerbang', desc: 'Gate scanner RFID & QR Code' },
  { title: 'Absensi Ibadah Santri', type: 'Portal', link: '/dashboard/absensi-ibadah', desc: 'Kehadiran sholat berjamaah' },

  // Laporan & Analytics
  { title: 'Laporan Presensi Siswa', type: 'Laporan', link: '/dashboard/laporan-absensi', desc: 'Rekapitulasi kehadiran & keterlambatan' },
  { title: 'Laporan Siswa & Kelulusan', type: 'Laporan', link: '/dashboard/laporan-siswa', desc: 'Statistik kesiswaan per unit' },
  { title: 'Laporan Alumni', type: 'Laporan', link: '/dashboard/laporan-alumni', desc: 'Tracer study & perguruan tinggi' },
  { title: 'Laporan SDM & Guru', type: 'Laporan', link: '/dashboard/yayasan/laporan/sdm', desc: 'Statistik kepegawaian yayasan' },
  { title: 'Laporan Rekapitulasi Prestasi Siswa', type: 'Laporan', link: '/dashboard/yayasan/laporan/prestasi', desc: 'Rekapitulasi prestasi per unit, kepala sekolah, dan divisi' },
]

const TYPE_ICONS = {
  Siswa: GraduationCap,
  Guru: UserCheck,
  Pegawai: Users,
  Mapel: BookOpen,
  Unit: Building2,
  Kelas: School,
  Portal: Compass,
  Laporan: FileText,
}

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('Semua')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setActiveTab('Semua')
    }
  }, [isOpen])

  // Handle Ctrl+K globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        } else {
          // Trigger open via custom event or direct state if wrapped globally
          window.dispatchEvent(new CustomEvent('open-global-search'))
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const tabs = ['Semua', 'Siswa', 'Guru', 'Pegawai', 'Mapel', 'Unit', 'Kelas', 'Portal', 'Laporan']

  const filtered = SYSTEM_INDEX.filter((item) => {
    if (item.link?.includes('/unit-pendidikan') || item.link?.includes('/master-jenis-unit')) {
      const isDenied = roles.some((r) => [
        'kepalasekolah', 'kepsek', 'divisipendidikan', 'divisi_pendidikan', 'kepalabidangpendidikan'
      ].includes(String(r).toLowerCase().replace(/[\s_-]+/g, '')))
      const isSuperAdmin = roles.some((r) => String(r).toLowerCase().replace(/[\s_-]+/g, '').includes('superadmin'))
      if (isDenied && !isSuperAdmin) return false
    }
    if (item.link?.includes('/akademik/nilai-rapor') || item.link?.includes('/lms/penilaian') || item.link?.includes('/lms/rapor')) {
      const isDenied = roles.some((r) => [
        'yayasan', 'ketuayayasan', 'pengurusyayasan', 'sekretarisyayasan', 'bendaharayayasan',
        'kepalasekolah', 'divisipendidikan'
      ].includes(String(r).toLowerCase().replace(/[\s_-]+/g, '')))
      const isSuperAdmin = roles.some((r) => String(r).toLowerCase().replace(/[\s_-]+/g, '').includes('superadmin'))
      if (isDenied && !isSuperAdmin) return false
    }
    if (item.link?.includes('/portal-guru') || item.link?.includes('/dashboard/musyrif')) {
      const isDenied = roles.some((r) => [
        'yayasan', 'ketuayayasan', 'pengurusyayasan', 'sekretarisyayasan', 'bendaharayayasan', 'pengurus',
        'kepalasekolah', 'kepsek'
      ].includes(String(r).toLowerCase().replace(/[\s_-]+/g, '')))
      const isSuperAdmin = roles.some((r) => String(r).toLowerCase().replace(/[\s_-]+/g, '').includes('superadmin'))
      if (isDenied && !isSuperAdmin) return false
    }
    if (item.link?.includes('/absensi-gerbang') || item.link?.includes('/laporan-alumni') || item.link?.includes('/kelola-alumni') || item.link?.includes('/laporan-tahfizh')) {
      const isTeacherOnly = roles.some((r) => [
        'guru', 'gurumatapelajaran', 'gurutahfizh', 'gurubk', 'walikelas', 'musyrif', 'musyrifah'
      ].includes(String(r).toLowerCase().replace(/[\s_-]+/g, ''))) &&
      !roles.some((r) => [
        'superadmin', 'admin', 'tatausaha', 'tu', 'operator', 'kepalasekolah', 'kepsek', 'divisipendidikan'
      ].includes(String(r).toLowerCase().replace(/[\s_-]+/g, '')))
      if (isTeacherOnly) return false
    }
    const matchesTab = activeTab === 'Semua' || item.type === activeTab
    const q = query.toLowerCase().trim()
    const matchesQuery = !q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
    return matchesTab && matchesQuery
  })

  const handleSelect = (link) => {
    onClose()
    navigate(link)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-[20px] bg-white text-slate-800 shadow-2xl border border-slate-200/80 overflow-hidden z-10 animate-[masterModalFadeScale_0.25s_ease-out] dark:bg-[#1B2433] dark:border-slate-800 dark:text-slate-100">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 text-[#0E5C44] dark:text-[#3FBF75] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari Siswa, Guru, Pegawai, Mapel, Unit, Kelas, Portal, Laporan... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold placeholder-slate-400 focus:outline-none dark:text-white dark:placeholder-slate-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </span>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 px-4 py-2 text-xs scrollbar-none dark:border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#0E5C44] text-white dark:bg-[#3FBF75] dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const IconComp = TYPE_ICONS[item.type] || Compass
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.link)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 cursor-pointer transition-all duration-150 dark:hover:bg-slate-800/60 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0E5C44] border border-emerald-100 group-hover:scale-105 transition-transform dark:bg-emerald-950/40 dark:text-[#3FBF75] dark:border-emerald-900/30">
                      <IconComp className="h-4.5 w-4.5 stroke-[2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0E5C44] dark:group-hover:text-[#3FBF75]">
                          {item.title}
                        </h4>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider dark:bg-slate-800 dark:text-slate-400">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#0E5C44] dark:text-[#3FBF75]" />
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Search className="mx-auto h-8 w-8 stroke-[1.5] text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Hasil Pencarian Tidak Ditemukan</p>
              <p className="text-[11px] text-slate-400 mt-1">Coba kata kunci lain atau pilih kategori yang berbeda.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[10px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
          <span>Tekan <kbd className="font-bold text-slate-600 dark:text-slate-300">Enter</kbd> untuk memilih</span>
          <span>Sistem Manajemen Sekolah Terpadu</span>
        </div>
      </div>
    </div>
  )
}

GlobalSearchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
