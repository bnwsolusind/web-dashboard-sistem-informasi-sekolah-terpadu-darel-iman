import { useEffect, useMemo } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  Zap,
  LayoutGrid,
  Layers,
  BookOpenCheck,
  Clock,
  Target,
  FileText,
  BookOpen,
  Film,
  Bookmark,
  Activity,
  MessageSquare,
  ClipboardList,
  UploadCloud,
  HelpCircle,
  Database,
  Laptop,
  Award,
  BarChart2,
  GraduationCap,
  Calculator,
  ShieldCheck,
  NotebookText,
} from 'lucide-react'
import AcademicModuleContainer from '../components/akademik/AcademicModuleContainer'
import MasterTahunAjaranPage from './MasterTahunAjaranPage'
import MasterModulSemesterPage from './MasterModulSemesterPage'
import MasterKurikulumPage from './MasterKurikulumPage'
import MasterKelasPage from './MasterKelasPage'
import MasterSubjectPage from './MasterSubjectPage'
import MasterSchedulePage from './MasterSchedulePage'
import MasterCapaianPembelajaranPage from './MasterCapaianPembelajaranPage'
import MasterTujuanPembelajaranPage from './MasterTujuanPembelajaranPage'
import LmsModulAjarPage from './LmsModulAjarPage'
import LmsMateriPage from './LmsMateriPage'
import LmsMediaPage from './LmsMediaPage'
import LmsReferensiPage from './LmsReferensiPage'
import LmsAktivitasBelajarPage from './LmsAktivitasBelajarPage'
import LmsDiskusiPage from './LmsDiskusiPage'
import LmsPenugasanPage from './LmsPenugasanPage'
import LmsPengumpulanTugasPage from './LmsPengumpulanTugasPage'
import LmsKisiKisiPage from './LmsKisiKisiPage'
import LmsBankSoalPage from './LmsBankSoalPage'
import LmsUjianPage from './LmsUjianPage'
import LmsPenilaianPage from './LmsPenilaianPage'
import LmsRaporPage from './LmsRaporPage'
import AssessmentFormulaPage from './AssessmentFormulaPage'
import WorshipAssessmentSettingPage from './WorshipAssessmentSettingPage'
import AssessmentImplementationNotesPage from './AssessmentImplementationNotesPage'
import { useAuthStore } from '../stores/authStore'

const CONTAINERS = {
  pengaturan: {
    title: 'Pengaturan Akademik',
    description: 'Kelola periode, kurikulum, kelas, mata pelajaran, dan jadwal tanpa mengubah alur CRUD masing-masing modul.',
    hideHeaderCard: false,
    tabs: [
      {
        key: 'tahun-ajaran',
        label: 'Tahun Ajaran',
        component: MasterTahunAjaranPage,
        icon: BookOpen,
        description: 'Periode Akademik',
        squircleStyle: 'bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60',
      },
      {
        key: 'semester',
        label: 'Semester',
        component: MasterModulSemesterPage,
        icon: Zap,
        description: 'Modul Semester',
        squircleStyle: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60',
      },
      {
        key: 'kurikulum',
        label: 'Kurikulum',
        component: MasterKurikulumPage,
        icon: LayoutGrid,
        description: 'Acuan Standar',
        squircleStyle: 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60',
      },
      {
        key: 'kelas-rombel',
        label: 'Kelas & Rombel',
        component: MasterKelasPage,
        icon: Layers,
        description: 'Rombongan Belajar',
        squircleStyle: 'bg-orange-100 text-orange-600 dark:bg-orange-950/80 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/60',
      },
      {
        key: 'mata-pelajaran',
        label: 'Mata Pelajaran',
        component: MasterSubjectPage,
        icon: BookOpenCheck,
        description: 'Master Subjek',
        squircleStyle: 'bg-pink-100 text-pink-600 dark:bg-pink-950/80 dark:text-pink-400 border border-pink-200/80 dark:border-pink-800/60',
      },
      {
        key: 'jadwal',
        label: 'Jadwal Pelajaran',
        component: MasterSchedulePage,
        icon: Clock,
        description: 'Waktu & Ruang',
        squircleStyle: 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60',
      },
      {
        key: 'rumus-penilaian',
        label: 'Rumus Penilaian',
        component: AssessmentFormulaPage,
        icon: Calculator,
        description: 'Akademik, Tahfizh & Mutabaah',
        requiredPermission: 'assessment_formula.view',
        squircleStyle: 'bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60',
      },
      {
        key: 'program-ibadah',
        label: 'Program & Ibadah',
        component: WorshipAssessmentSettingPage,
        icon: ShieldCheck,
        description: 'Full Day & Ramadan',
        requiredPermission: 'worship_assessment.setting.view',
        squircleStyle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
      },
      {
        key: 'catatan-penilaian',
        label: 'Catatan Implementasi',
        component: AssessmentImplementationNotesPage,
        icon: NotebookText,
        description: 'Audit & Aturan Bisnis',
        requiredPermission: 'worship_assessment.setting.view',
        squircleStyle: 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60',
      },
    ],
  },
  perencanaan: {
    title: 'Perencanaan Pembelajaran',
    description: 'Susun CP, TP, Modul Ajar, Kisi-Kisi, dan Bank Soal dalam alur yang ringkas dengan data dan relasi dari API yang sudah tersedia.',
    hideHeaderCard: false,
    tabsBelowKpi: true,
    tabs: [
      {
        key: 'cp',
        label: 'Capaian Pembelajaran',
        component: MasterCapaianPembelajaranPage,
        icon: Target,
        description: 'Standar Capaian',
        squircleStyle: 'bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60',
      },
      {
        key: 'tp',
        label: 'Tujuan Pembelajaran',
        component: MasterTujuanPembelajaranPage,
        icon: FileText,
        description: 'Tujuan & Alur',
        squircleStyle: 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60',
      },
      {
        key: 'modul-ajar',
        label: 'Modul Ajar',
        component: LmsModulAjarPage,
        icon: BookOpen,
        description: 'Perencanaan RPP/MA',
        squircleStyle: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60',
      },
      {
        key: 'kisi-kisi',
        label: 'Kisi-kisi',
        component: LmsKisiKisiPage,
        icon: HelpCircle,
        description: 'Matriks Soal',
        squircleStyle: 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60',
      },
      {
        key: 'bank-soal',
        label: 'Bank Soal',
        component: LmsBankSoalPage,
        icon: Database,
        description: 'Repository Soal',
        squircleStyle: 'bg-orange-100 text-orange-600 dark:bg-orange-950/80 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/60',
      },
    ],
  },
  pembelajaran: {
    title: 'Pembelajaran',
    description: 'Akses konten pembelajaran, aktivitas, dan diskusi dari satu ruang kerja.',
    hideHeaderCard: false,
    tabsBelowKpi: true,
    tabs: [
      {
        key: 'materi',
        label: 'Materi',
        component: LmsMateriPage,
        icon: BookOpen,
        description: 'Bahan Ajar',
        squircleStyle: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60',
      },
      {
        key: 'media',
        label: 'Media',
        component: LmsMediaPage,
        icon: Film,
        description: 'Video & Audio',
        squircleStyle: 'bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60',
      },
      {
        key: 'referensi',
        label: 'Referensi',
        component: LmsReferensiPage,
        icon: Bookmark,
        description: 'Pustaka & Link',
        squircleStyle: 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60',
      },
      {
        key: 'aktivitas',
        label: 'Aktivitas Belajar',
        component: LmsAktivitasBelajarPage,
        icon: Activity,
        description: 'Kegiatan Kelas',
        squircleStyle: 'bg-orange-100 text-orange-600 dark:bg-orange-950/80 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/60',
      },
      {
        key: 'diskusi',
        label: 'Diskusi Kelas',
        component: LmsDiskusiPage,
        icon: MessageSquare,
        description: 'Forum Interaktif',
        squircleStyle: 'bg-pink-100 text-pink-600 dark:bg-pink-950/80 dark:text-pink-400 border border-pink-200/80 dark:border-pink-800/60',
      },
    ],
  },
  evaluasi: {
    title: 'Tugas & Evaluasi',
    description: 'Kelola penugasan, pengumpulan tugas, ujian CBT, dan rekap penilaian siswa dalam satu alur evaluasi.',
    hideHeaderCard: false,
    tabsBelowKpi: false,
    tabs: [
      {
        key: 'penugasan',
        label: 'Penugasan',
        component: LmsPenugasanPage,
        icon: ClipboardList,
        description: 'Instruksi Tugas',
        squircleStyle: 'bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60',
      },
      {
        key: 'pengumpulan',
        label: 'Pengumpulan Tugas',
        component: LmsPengumpulanTugasPage,
        icon: UploadCloud,
        description: 'Lembar Kerja Siswa',
        squircleStyle: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60',
      },
      {
        key: 'cbt',
        label: 'Ujian CBT',
        component: LmsUjianPage,
        icon: Laptop,
        description: 'Evaluasi CBT',
        squircleStyle: 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60',
      },
      {
        key: 'penilaian',
        label: 'Penilaian',
        component: LmsPenilaianPage,
        icon: Award,
        description: 'Rekap Penilaian',
        squircleStyle: 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60',
      },
    ],
  },
  'nilai-rapor': {
    title: 'Nilai & Rapor',
    description: 'Buku nilai, rekap, rapor digital, dan keluaran PDF tersedia dalam satu area.',
    hideHeaderCard: false,
    tabsBelowKpi: false,
    tabs: [
      {
        key: 'buku-nilai',
        label: 'Buku Nilai',
        component: LmsPenilaianPage,
        icon: Award,
        description: 'Input & Formatif',
        squircleStyle: 'bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60',
      },
      {
        key: 'rekap',
        label: 'Rekap Nilai',
        component: LmsPenilaianPage,
        icon: BarChart2,
        description: 'Analisis Sumatif',
        squircleStyle: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60',
      },
      {
        key: 'rapor',
        label: 'Rapor Digital',
        component: LmsRaporPage,
        icon: GraduationCap,
        description: 'Cetak & PDF',
        squircleStyle: 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60',
      },
    ],
  },
}

export default function AcademicLmsContainerPage({ section }) {
  const user = useAuthStore((state) => state.user)
  const userRoles = useMemo(() => {
    const rList = user?.roles || []
    return rList.map((r) => (typeof r === 'string' ? r : r.name || ''))
  }, [user])

  const isRestrictedRole = useMemo(() => {
    if (section !== 'pengaturan') return false
    const isSuperAdminOrAdminOrPrincipal = userRoles.some((r) =>
      ['Super Admin', 'SuperAdmin', 'superadmin', 'Admin', 'admin', 'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'Divisi Pendidikan', 'divisi_pendidikan'].includes(r)
    )
    if (isSuperAdminOrAdminOrPrincipal) return false

    return userRoles.some((r) =>
      ['Guru', 'guru', 'Wali Kelas', 'wali_kelas', 'Guru Mapel', 'Guru Tahfizh', 'Guru BK',
       'Musyrif', 'Musyrifah', 'musyrif', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing'].includes(r)
    )
  }, [section, userRoles])

  const config = CONTAINERS[section]
  const userPermissions = useMemo(() => new Set((user?.permissions || []).map((p) => typeof p === 'string' ? p : p.name)), [user])
  const availableTabs = useMemo(() => config.tabs.filter((tab) => !tab.requiredPermission || userPermissions.has(tab.requiredPermission) || userPermissions.has('*')), [config.tabs, userPermissions])
  const location = useLocation()
  const [searchParams] = useSearchParams()

  if (isRestrictedRole) {
    return <Navigate to="/dashboard" replace />
  }
  const activeTab = searchParams.get('tab')
  const defaultTab = availableTabs[0].key
  const selected = useMemo(() => {
    return availableTabs.find((t) =>
      t.key === activeTab ||
      (activeTab === 'modul-semester' && t.key === 'semester') ||
      (activeTab === 'semester' && t.key === 'modul-semester') ||
      (activeTab === 'ujian-cbt' && t.key === 'cbt') ||
      (activeTab === 'cbt' && t.key === 'ujian-cbt')
    )
  }, [activeTab, availableTabs])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  if (!selected) {
    const params = new URLSearchParams(searchParams)
    params.set('tab', defaultTab)
    return <Navigate to={`${location.pathname}?${params.toString()}`} replace />
  }

  const ActivePage = selected.component
  const tabs = availableTabs.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    description: t.description,
    squircleStyle: t.squircleStyle,
  }))

  const breadcrumbItems = useMemo(() => [
    { label: 'Akademik', to: location.pathname },
    { label: config.title, to: `${location.pathname}?tab=${defaultTab}` },
    { label: selected.label }
  ], [location.pathname, config.title, defaultTab, selected.label])

  return (
    <AcademicModuleContainer
      title={config.title}
      description={config.description}
      tabs={tabs}
      hideHeader={config.hideHeaderCard}
      tabsBelowKpi={config.tabsBelowKpi}
      breadcrumbItems={breadcrumbItems}
    >
      <ActivePage embedded hidePageHeader hideBreadcrumb />
    </AcademicModuleContainer>
  )
}
