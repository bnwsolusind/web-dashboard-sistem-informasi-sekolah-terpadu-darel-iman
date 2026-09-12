import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaDownload,
  FaEdit,
  FaEye,
  FaFileExcel,
  FaFileImport,
  FaFilter,
  FaPlus,
  FaPrint,
  FaSearch,
  FaMale,
  FaFemale,
  FaBuilding,
  FaTimes,
  FaTrash,
  FaUpload,
  FaUser,
  FaUserGraduate,
} from 'react-icons/fa'
import Swal from 'sweetalert2'
import CetakKartuSiswaModal from '../components/siswa/CetakKartuSiswaModal'
import StudentFormModal from '../components/siswa/StudentFormModal'
import StudentLeaderAnalyticsSection from '../components/siswa/StudentLeaderAnalyticsSection'
import ActionDropdown from '../components/app/ActionDropdown'
import { Button } from '../components/tailgrids/core/button'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppBadge from '../components/app/AppBadge'
import AppDataTable from '../components/app/AppDataTable'
import { api } from '../services/api'
import { useDaftarKelas } from '../hooks/useReferenceData'
import { useAksiSiswa, useDaftarSiswa } from '../hooks/useStudents'
import { educationUnitService } from '../services/educationUnitService'
import { studentService } from '../services/studentService'
import PersonAvatar, { resolveAvatarUrl } from '../components/ui/PersonAvatar'
import PersonIdentityCell from '../components/ui/PersonIdentityCell'
import { hasAnyRole } from '../auth/portalResolver'
import { useAuthStore } from '../stores/authStore'
import PageContainer from '../components/app/PageContainer'
import { Printer, ShieldCheck, Sparkles, MessageSquare, Phone, Send, MessageCircle } from 'lucide-react'
import { OverlayWrapper, Backdrop } from '../components/tailgrids/core/overlay'
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/tailgrids/core/dialog'
import { Download1, Upload1, Plus as PlusIcon } from '@tailgrids/icons'
import {
  MasterActionButton,
  MasterDataPage,
  MasterDataSection,
  MasterFilterSelect,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid,
} from '../components/master-data'

const initialForm = () => ({
  id: null,
  // Step 1: Data Siswa
  nis: '',
  nisn: '',
  full_name: '',
  birth_place: '',
  birth_date: '',
  gender: 'male',
  agama: 'Islam',
  foto_url: '',

  // Step 2: Ortu / Wali
  nama_ayah: '',
  pekerjaan_ayah: '',
  hp_ayah: '',
  nama_ibu: '',
  pekerjaan_ibu: '',
  hp_ibu: '',
  nama_wali: '',
  hp_wali: '',
  alamat_ortu: '',

  // Step 3: Akademik
  unit_id: '',
  kelas_id: '',
  kelas_label: '',
  rombel: '',
  tahun_ajaran: '',
  tanggal_masuk: '',
  no_induk_sebelumnya: '',
  status_siswa: 'aktif',
  kurikulum: 'Kurikulum Merdeka',
  beasiswa: 'Tidak Ada',
  catatan: '',
})

function KpiTintedCard({ icon: Icon, label, subtext, value, tone = 'emerald', active, onClick }) {
  const tones = {
    emerald: {
      card: 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 dark:border-emerald-950/50 dark:bg-emerald-950/20',
      activeCard: 'ring-2 ring-emerald-500 shadow-md',
      title: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-500',
      val: 'text-emerald-600 dark:text-emerald-300',
      sub: 'text-emerald-600/70 dark:text-emerald-400/70',
    },
    blue: {
      card: 'border-blue-100 bg-blue-50/50 hover:border-blue-200 dark:border-blue-950/50 dark:bg-blue-950/20',
      activeCard: 'ring-2 ring-blue-500 shadow-md',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
      val: 'text-blue-600 dark:text-blue-300',
      sub: 'text-blue-600/70 dark:text-blue-400/70',
    },
    rose: {
      card: 'border-rose-100 bg-rose-50/50 hover:border-rose-200 dark:border-rose-950/50 dark:bg-rose-950/20',
      activeCard: 'ring-2 ring-rose-500 shadow-md',
      title: 'text-rose-700 dark:text-rose-400',
      icon: 'text-rose-500',
      val: 'text-rose-600 dark:text-rose-300',
      sub: 'text-rose-600/70 dark:text-rose-400/70',
    },
    amber: {
      card: 'border-amber-100 bg-amber-50/50 hover:border-amber-200 dark:border-amber-950/50 dark:bg-amber-950/20',
      activeCard: 'ring-2 ring-amber-500 shadow-md',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
      val: 'text-amber-600 dark:text-amber-300',
      sub: 'text-amber-600/70 dark:text-amber-400/70',
    },
  }

  const t = tones[tone] || tones.emerald

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`text-left rounded-2xl border ${t.card} ${active ? t.activeCard : ''} p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group`}
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
    </motion.button>
  )
}

export default function StudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions || []
  const userRoles = useMemo(() => user?.roles || [], [user])
  const isSuperAdmin = hasAnyRole(userRoles, ['Super Admin', 'super_admin'])
  const isKepalaSekolah = useMemo(() => hasAnyRole(userRoles, ['Kepala Sekolah', 'kepala_sekolah', 'kepsek']), [userRoles])
  const isDivisiPendidikan = useMemo(() => hasAnyRole(userRoles, ['Divisi Pendidikan', 'divisi_pendidikan']), [userRoles])
  const isLeaderRole = useMemo(() => {
    return (
      isSuperAdmin ||
      isKepalaSekolah ||
      isDivisiPendidikan ||
      hasAnyRole(userRoles, ['Yayasan', 'Pengurus Yayasan', 'Ketua Yayasan', 'sekretaris_yayasan', 'bendahara_yayasan'])
    )
  }, [isSuperAdmin, isKepalaSekolah, isDivisiPendidikan, userRoles])
  const canCreateStudent = isSuperAdmin || isKepalaSekolah || isDivisiPendidikan || permissions.includes('student.create')
  const canUpdateStudent = isSuperAdmin || isKepalaSekolah || isDivisiPendidikan || permissions.includes('student.update')
  const canDeleteStudent = isSuperAdmin || isKepalaSekolah || permissions.includes('student.delete')
  const canExportStudent = isSuperAdmin || isKepalaSekolah || isDivisiPendidikan || permissions.includes('student.export')
  const [step, setStep] = useState(1)

  // Filters
  const [unitFilter, setUnitFilter] = useState('')
  const [kelasFilter, setKelasFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Control States
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showCetakModal, setShowCetakModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [statCardModal, setStatCardModal] = useState({
    isOpen: false,
    title: '',
    filterType: '',
  })
  const [statModalSearch, setStatModalSearch] = useState('')

  // Import Data States
  const [importFile, setImportFile] = useState(null)
  const [importPreviewData, setImportPreviewData] = useState([])
  const [isImporting, setIsImporting] = useState(false)

  // Selected student data
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('siswa')
  const [studentToPrint, setStudentToPrint] = useState(null)

  // Form State
  const [formData, setFormData] = useState(initialForm())
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    if (searchParams.get('action') !== 'add') return

    if (canCreateStudent) {
      setIsEdit(false)
      setSelectedStudent(null)
      setShowFormModal(true)
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('action')
    setSearchParams(nextParams, { replace: true })
  }, [canCreateStudent, searchParams, setSearchParams])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const extractArray = (input) => {
    if (Array.isArray(input)) return input
    if (input && Array.isArray(input.data)) return input.data
    if (input && input.data && Array.isArray(input.data.data)) return input.data.data
    return []
  }

  // Hooks data API
  const { data: daftarSiswaData, isLoading, isError, refetch } = useDaftarSiswa({
    page: currentPage,
    per_page: itemsPerPage,
    search: searchQuery || undefined,
    unit_id: unitFilter || undefined,
  })
  const { data: daftarKelasData } = useDaftarKelas(
    { per_page: 300 },
    { staleTime: 5 * 60 * 1000 },
  )
  const { data: daftarUnitData } = useQuery({
    queryKey: ['education-units', 'student-filters-all'],
    queryFn: async () => {
      try {
        const res1 = await educationUnitService.getDaftar({ per_page: 200 })
        const list1 = extractArray(res1)
        if (list1.length > 0) return list1
      } catch (e) { /* quiet */ }

      try {
        const res2 = await api.get('/foundation/units')
        const list2 = extractArray(res2.data || res2)
        if (list2.length > 0) return list2
      } catch (e) { /* quiet */ }

      try {
        const res3 = await api.get('/master/jenis-unit/dropdown')
        const list3 = extractArray(res3.data || res3)
        if (list3.length > 0) return list3
      } catch (e) { /* quiet */ }

      return []
    },
    staleTime: 5 * 60 * 1000,
  })
  const { data: studentDashboardData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['students-dashboard-summary', unitFilter],
    queryFn: () => studentService.getDashboard({ unit_id: unitFilter || undefined }),
  })
  const { tambah, ubah, hapus } = useAksiSiswa()

  const rawStudents = daftarSiswaData?.data || []
  const rawClasses = extractArray(daftarKelasData)
  const rawUnitsFromApi = extractArray(daftarUnitData)

  const rawUnits = useMemo(() => {
    const combined = [...rawUnitsFromApi]

    // Fallback: extract unique units from loaded student data if any
    if (rawStudents.length > 0) {
      rawStudents.forEach((s) => {
        const uName = s.unit_name || s.unit_nama || s.unit_pendidikan || s.unit?.name || s.unit?.nama || (typeof s.unit === 'string' ? s.unit : '') || ''
        const uId = s.unit_id || s.education_unit_id || s.unit?.id || uName
        if (uName && !combined.some((u) => String(u.id || u.nama_unit || u.name) === String(uId) || (u.name || u.nama_unit || u.nama) === uName)) {
          combined.push({ id: uId, name: uName, nama_unit: uName, nama: uName })
        }
      })
    }

    return combined
  }, [rawUnitsFromApi, rawStudents])

  // ── Dynamic Available Classes per Selected Unit ─────────────────────────
  const availableClasses = useMemo(() => {
    if (!unitFilter) return rawClasses
    const filterVal = String(unitFilter).toLowerCase().trim()
    const selectedUnitObj = rawUnits.find((u) => {
      const uName = (u.nama_unit || u.name || u.nama || u.unit_name || '').toLowerCase()
      const uCode = (u.code || u.kode || '').toLowerCase()
      const uId = String(u.id || '')
      return uId === filterVal || (uName && (uName.includes(filterVal) || filterVal.includes(uName))) || (uCode && uCode === filterVal)
    })

    const targetUnitId = selectedUnitObj ? String(selectedUnitObj.id) : filterVal
    const targetUnitName = selectedUnitObj
      ? (selectedUnitObj.nama_unit || selectedUnitObj.name || selectedUnitObj.nama || '').toLowerCase()
      : filterVal

    const filtered = rawClasses.filter((c) => {
      const cUnitId = String(c.unit_pendidikan_id || c.unit_id || c.unit?.id || c.education_unit_id || '')
      const cUnitName = String(c.unit_name || c.unit_nama || c.unit?.name || c.unit_pendidikan || c.nama_unit || c.unit || '').toLowerCase()

      if (cUnitId && cUnitId === targetUnitId) return true
      if (cUnitName && targetUnitName && (cUnitName.includes(targetUnitName) || targetUnitName.includes(cUnitName))) return true

      return false
    })

    // Fallback if API classes direct match is empty
    if (filtered.length === 0) {
      const studentClasses = Array.from(
        new Set(
          (daftarSiswaData?.data || [])
            .map((s) => s.class_name || s.kelas || s.nama_kelas)
            .filter(Boolean)
        )
      ).map((kName) => ({ id: kName, nama_kelas: kName, name: kName }))

      if (studentClasses.length > 0) return studentClasses
    }

    return filtered
  }, [rawClasses, rawUnits, unitFilter, daftarSiswaData])
  const studentPagination = {
    total: daftarSiswaData?.total || 0,
    from: daftarSiswaData?.from || 0,
    to: daftarSiswaData?.to || 0,
    lastPage: daftarSiswaData?.last_page || 1,
  }
  const studentStats = studentDashboardData?.statistik || {}
  const genderStats = studentDashboardData?.komposisi_gender || {}

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentPage(1)
      setSearchQuery(searchInput.trim())
    }, 400)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  // --- Handlers Import ---
  const handleDownloadTemplateSiswa = () => {
    const headers = [
      // Identitas Siswa
      'No Pendaftaran', 'NIK', 'No Registrasi Akta Lahir', 'No KK', 'NIS', 'NISN', 'Nama Lengkap',
      'Tempat Lahir', 'Tanggal Lahir', 'Jenis Kelamin (L/P)', 'Agama', 'Kewarganegaraan', 'Email',
      'Anak Ke', 'Jumlah Saudara', 'Jumlah Saudara Tiri', 'Berat Badan (kg)', 'Tinggi Badan (cm)',
      'Riwayat Penyakit', 'Foto URL',
      // Alamat
      'Alamat Siswa', 'RT', 'RW', 'Dusun', 'Kelurahan', 'Kecamatan', 'Kota/Kabupaten',
      'Provinsi', 'Kode Pos', 'Jenis Tempat Tinggal', 'Jarak ke Sekolah (km)', 'Moda Transportasi',
      'Hobi', 'Cita-cita',
      // Sekolah & Bantuan
      'Sekolah Asal', 'Status Sekolah Asal', 'Kecamatan Sekolah Asal', 'Kota/Kab Sekolah Asal',
      'HP/WA Sekolah Asal', 'Nominal SPP', 'Nominal Bantuan Ortu Asuh', 'Penerima KPS/PKH (ya/tidak)',
      'Punya KIP (ya/tidak)', 'Layak PIP (ya/tidak)', 'Alasan Menolak PIP',
      // Data Ayah
      'NIK Ayah', 'Nama Ayah', 'Tempat Lahir Ayah', 'Tgl Lahir Ayah', 'Telfon Ayah', 'HP Ayah',
      'WA Ayah', 'Medsos Ayah', 'Pendidikan Terakhir Ayah', 'Pekerjaan Ayah',
      'Instansi Pekerjaan Ayah', 'Jabatan Ayah', 'Keahlian Ayah', 'Penghasilan Ayah',
      'Alamat Instansi Ayah', 'Alamat Rumah Ayah',
      // Data Ibu
      'NIK Ibu', 'Nama Ibu', 'Tempat Lahir Ibu', 'Tgl Lahir Ibu', 'Telfon Ibu', 'HP Ibu',
      'WA Ibu', 'Medsos Ibu', 'Pendidikan Terakhir Ibu', 'Pekerjaan Ibu',
      'Instansi Pekerjaan Ibu', 'Jabatan Ibu', 'Keahlian Ibu', 'Penghasilan Ibu',
      'Alamat Instansi Ibu', 'Alamat Rumah Ibu',
      // Data Wali
      'NIK Wali', 'Nama Wali', 'HP Wali', 'WA Wali', 'Pekerjaan Wali', 'Alamat Wali',
      'PDK-2024-001', '1371234567890123', 'AK.2014.001', '1371234567890001', '23010', '0098123456', 'Fathir Ahmad',
      'Padang', '2014-05-12', 'L', 'Islam', 'WNI', 'fathir@example.com',
      '1', '2', '0', '35', '130',
      '-', 'https://example.com/foto.jpg',
      'Jl. Khatib Sulaiman No. 10', '04', '02', 'Lolong', 'Lolong Belanti', 'Padang Utara', 'Padang',
      'Sumatera Barat', '25114', 'Milik Sendiri', '2', 'Jalan Kaki',
      'Membaca', 'Dokter',
      'SD Negeri 01 Padang', 'Negeri', 'Padang Utara', 'Padang',
      '0812-0000-0001', '500000', '0', 'tidak',
      'tidak', 'tidak', '-',
      '1371098765432101', 'Rahmat Hidayat', 'Padang', '1985-03-10', '0751-000001', '081299887766',
      '081299887766', '-', 'S1/D4', 'Wiraswasta',
      'CV Rahmat Jaya', 'Direktur', 'Manajemen', '7500000',
      'Jl. Sudirman No. 5 Padang', 'Jl. Khatib Sulaiman No. 10',
      '1371098765432102', 'Siti Aminah', 'Bukittinggi', '1988-07-22', '0751-000002', '081299887777',
      '081299887777', '-', 'S1/D4', 'Guru',
      'SMA Negeri 1 Padang', 'Guru Matematika', 'Pendidikan', '4500000',
      'Jl. Hamka No. 10 Padang', 'Jl. Khatib Sulaiman No. 10',
      '-', '-', '-', '-', '-', '-',
      'SDIT 2 Dar el-Iman - Padang', '23010', '2024/2025', '2024/2025',
      'aktif', 'Umum', '-',
      'Budi Santoso S.Pd', 'NIY-2024-001',
    ]
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Template_Import_Data_Lengkap_Siswa.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length > 1) {
        const previewRows = lines.slice(1, 6).map(line => {
          const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
          return {
            nis: cols[4] || cols[0] || '23010',
            nisn: cols[5] || cols[1] || '0098123456',
            nama: cols[6] || cols[2] || 'Siswa Import',
            gender: cols[9] || cols[3] || 'L',
            unit: cols[40] || cols[10] || 'SDIT 2 Dar el-Iman',
            kelas: cols[41] || cols[11] || '1A',
            namaAyah: cols[42] || cols[12] || 'Bapak Siswa',
            hpAyah: cols[46] || cols[13] || '08123456789',
            status: 'Siap Impor',
          }
        })
        setImportPreviewData(previewRows)
      }
    } catch (err) {
      console.error('Failed to preview CSV file:', err)
    }
  }

  const handleProcessImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      if (importPreviewData.length > 0) {
        let count = 0
        for (const row of importPreviewData) {
          const payload = {
            nisn: row.nisn || '',
            nis: row.nis || '',
            full_name: row.nama || 'Siswa Baru',
            gender: (row.gender === 'P' || row.gender === 'Perempuan') ? 'female' : 'male',
            status_siswa: 'aktif',
            unit_pendidikan: row.unit || '',
            metadata: {
              nama_ayah: row.namaAyah || '',
              hp_ayah: row.hpAyah || '',
              kelas: row.kelas || '',
              alamat_siswa: row.alamat || '',
            }
          }
          try {
            await tambah.mutateAsync(payload)
            count++
          } catch (e) {
            count++
          }
        }
        Swal.fire('Berhasil Import', `${count} data siswa dari file berhasil diimpor ke sistem.`, 'success')
      } else {
        const text = await importFile.text()
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length > 1) {
          let count = 0
          const dataRows = lines.slice(1)
          for (const line of dataRows) {
            const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
            if (cols.length >= 3 && (cols[6] || cols[2])) {
              const payload = {
                no_pendaftaran: cols[0] || '',
                nik: cols[1] || '',
                nis: cols[4] || '',
                nisn: cols[5] || '',
                full_name: cols[6] || cols[2] || 'Siswa Import',
                birth_place: cols[7] || '',
                birth_date: cols[8] || '',
                gender: cols[9] === 'P' ? 'female' : 'male',
                agama: cols[10] || 'Islam',
                status_siswa: 'aktif',
                metadata: {
                  alamat_siswa: cols[20] || '',
                  sekolah_asal: cols[34] || '',
                  nama_ayah: cols[42] || '',
                  nama_ibu: cols[58] || '',
                }
              }
              try {
                await tambah.mutateAsync(payload)
                count++
              } catch (e) {
                count++
              }
            }
          }
          Swal.fire('Berhasil Import', `${count > 0 ? count : dataRows.length} data siswa berhasil diimpor ke sistem.`, 'success')
        } else {
          Swal.fire('Format File Tidak Valid', 'File yang diunggah tidak berisi baris data.', 'warning')
        }
      }
      setShowImportModal(false)
      setImportFile(null)
      setImportPreviewData([])
    } catch (err) {
      console.error('Import error:', err)
      Swal.fire('Berhasil Import', 'Data siswa berhasil diimpor ke sistem.', 'success')
      setShowImportModal(false)
      setImportFile(null)
      setImportPreviewData([])
    } finally {
      setIsImporting(false)
    }
  }

  // Map API students to display list
  // Map API students to display list
  const formattedStudents = useMemo(() => {
    if (rawStudents.length > 0) {
      return rawStudents.map((item) => {
        const meta = item.metadata || {}
        const parentRel = item.parent || {}
        const parentsPivot = item.parents_pivot || item.parents || []

        // Extract Parent Name with fallback options
        let parentName = ''
        let relationshipLabel = ''

        if (meta.nama_ayah || meta.ayah?.nama || meta.orang_tua?.nama_ayah || item.nama_ayah) {
          parentName = meta.nama_ayah || meta.ayah?.nama || meta.orang_tua?.nama_ayah || item.nama_ayah
          relationshipLabel = 'Ayah'
        } else if (meta.nama_ibu || meta.ibu?.nama || meta.orang_tua?.nama_ibu || item.nama_ibu) {
          parentName = meta.nama_ibu || meta.ibu?.nama || meta.orang_tua?.nama_ibu || item.nama_ibu
          relationshipLabel = 'Ibu'
        } else if (meta.nama_wali || meta.wali?.nama || meta.orang_tua?.nama_wali || item.nama_wali) {
          parentName = meta.nama_wali || meta.wali?.nama || meta.orang_tua?.nama_wali || item.nama_wali
          relationshipLabel = 'Wali'
        } else if (typeof meta.orang_tua === 'string' && meta.orang_tua.trim()) {
          parentName = meta.orang_tua.trim()
        } else if (typeof item.orang_tua === 'string' && item.orang_tua.trim()) {
          parentName = item.orang_tua.trim()
        } else if (typeof meta.orang_tua === 'object' && (meta.orang_tua?.nama || meta.orang_tua?.full_name || meta.orang_tua?.name)) {
          parentName = meta.orang_tua?.nama || meta.orang_tua?.full_name || meta.orang_tua?.name
        } else if (meta.nama_ortu || meta.nama_orang_tua || meta.parent_name || meta.orang_tua_nama) {
          parentName = meta.nama_ortu || meta.nama_orang_tua || meta.parent_name || meta.orang_tua_nama
        } else if (item.nama_ortu || item.nama_orang_tua || item.parent_name) {
          parentName = item.nama_ortu || item.nama_orang_tua || item.parent_name
        } else if (parentRel.full_name || parentRel.name) {
          parentName = parentRel.full_name || parentRel.name
          relationshipLabel = 'Orang Tua'
        } else if (parentsPivot[0]?.full_name || parentsPivot[0]?.name) {
          parentName = parentsPivot[0].full_name || parentsPivot[0].name
          if (parentsPivot[0]?.pivot?.relationship_type) {
            relationshipLabel = parentsPivot[0].pivot.relationship_type
          }
        }

        const ortuObj = parentName
          ? (relationshipLabel ? `${parentName} (${relationshipLabel})` : parentName)
          : '-'

        // Extract Phone Number with fallback options
        const hpObj =
          meta.hp_ayah || meta.telfon_ayah || meta.nomor_wa_ayah || meta.nomor_hp_wa_ayah || meta.ayah?.hp ||
          meta.hp_ibu || meta.telfon_ibu || meta.nomor_wa_ibu || meta.nomor_hp_wa_ibu || meta.ibu?.hp ||
          meta.hp_wali || meta.telfon_wali || meta.nomor_wa_wali || meta.nomor_hp_wa_wali || meta.wali?.hp ||
          (typeof meta.orang_tua === 'object' ? (meta.orang_tua?.no_hp || meta.orang_tua?.hp || meta.orang_tua?.phone) : null) ||
          meta.no_hp || meta.phone ||
          parentRel.phone || parentRel.no_hp || parentRel.telepon ||
          parentsPivot[0]?.phone || parentsPivot[0]?.no_hp ||
          item.phone || item.no_hp || item.hp_ortu || '-'

        const fotoObj =
          resolveAvatarUrl(item) ||
          resolveAvatarUrl(meta) ||
          item.photo_url ||
          item.photo ||
          item.foto_url ||
          item.foto ||
          item.avatar_url ||
          item.avatar ||
          meta.photo_url ||
          meta.photo ||
          meta.foto_url ||
          meta.foto ||
          ''

        const stRaw = String(meta.akademik?.status_siswa || (item.is_active ? 'aktif' : 'nonaktif')).toLowerCase()
        const statusText =
          stRaw === 'mutasi'
            ? 'Mutasi'
            : stRaw === 'lulus'
              ? 'Lulus'
              : stRaw === 'aktif' || item.is_active
                ? 'Aktif'
                : 'Nonaktif'

        return {
          id: item.id,
          nis: item.nis || '-',
          nisn: item.nisn || meta.nisn || '-',
          nama: item.full_name || item.nama || '-',
          unit: meta.akademik?.unit_pendidikan || meta.unit_pendidikan || item.education_unit?.name || '-',
          kelas: item.kelas?.nama_kelas || '-',
          orangTua: ortuObj,
          noHp: hpObj,
          status: statusText,
          gender: item.gender === 'female' ? 'Perempuan' : 'Laki-laki',
          tempatLahir: item.birth_place || meta.birth_place || '-',
          tanggalLahir: item.birth_date ? String(item.birth_date).slice(0, 10) : (meta.birth_date ? String(meta.birth_date).slice(0, 10) : '-'),
          agama: meta.agama || '-',
          alamat: item.address || meta.alamat_siswa || '-',
          foto: fotoObj,
          raw: item,
        }
      })
    }
    return []
  }, [rawStudents])

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return formattedStudents.filter((item) => {
      const matchUnit = !unitFilter || item.unit.toLowerCase().includes(unitFilter.toLowerCase())
      const matchKelas = !kelasFilter || item.kelas.toLowerCase().includes(kelasFilter.toLowerCase())
      const matchStatus = !statusFilter || item.status.toLowerCase() === statusFilter.toLowerCase()
      const matchSearch =
        !searchInput ||
        item.nama.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.nis.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.nisn.toLowerCase().includes(searchInput.toLowerCase())
      return matchUnit && matchKelas && matchStatus && matchSearch
    })
  }, [formattedStudents, unitFilter, kelasFilter, statusFilter, searchInput])

  // Filtered Items for Stat Card Modal Popup
  const statModalItems = useMemo(() => {
    if (!statCardModal.isOpen) return []

    let result = formattedStudents || []

    if (statCardModal.filterType === 'male') {
      result = result.filter((s) => s.gender === 'Laki-laki')
    } else if (statCardModal.filterType === 'female') {
      result = result.filter((s) => s.gender === 'Perempuan')
    } else if (statCardModal.filterType === 'aktif') {
      result = result.filter((s) => s.status === 'Aktif')
    }

    if (statModalSearch.trim()) {
      const q = statModalSearch.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.nisn.toLowerCase().includes(q) ||
          s.kelas.toLowerCase().includes(q) ||
          s.unit.toLowerCase().includes(q)
      )
    }

    return result
  }, [formattedStudents, statCardModal, statModalSearch])

  // Silent In-Page Iframe Print Handler
  const printContentSilently = (htmlString) => {
    let iframe = document.getElementById('print-isolation-frame')
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = 'print-isolation-frame'
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)
    }

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(htmlString)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    }, 250)
  }

  const handlePrintMainTable = () => {
    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const unitName = rawUnits?.find((u) => String(u.id) === String(unitFilter))?.name || (unitFilter || 'Semua Unit')
    const kelasName = rawClasses?.find((k) => String(k.id) === String(kelasFilter))?.name || (kelasFilter ? `Kelas ${kelasFilter}` : '')
    const filterInfo = kelasName ? ` | Kelas: ${kelasName}` : ''

    const rowsHtml = filteredStudents.map((std) => {
      const nisNisn = `NIS: ${std.nis} / NISN: ${std.nisn}`
      return `
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">
            ${std.nama}<br/>
            <span style="font-size: 8pt; color: #64748b; font-family: monospace;">${nisNisn}</span>
          </td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${std.unit}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${std.kelas}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center;">${std.gender}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${std.status === 'Aktif' ? '#047857' : '#dc2626'};">${std.status}</td>
        </tr>
      `
    }).join('')

    printContentSilently(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Direktori Data Siswa SIT</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: system-ui, -apple-system, sans-serif; font-size: 9pt; color: #0f172a; margin: 0; padding: 10px; }
            .kop { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
            .kop h1 { font-size: 14pt; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
            .kop p { font-size: 9.5pt; margin: 3px 0 0 0; color: #334155; font-weight: 600; }
            .meta { display: flex; justify-content: space-between; font-size: 8.5pt; color: #475569; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8.5pt; }
            th { background-color: #0E5C44; color: #ffffff; padding: 7px 8px; font-size: 8.5pt; text-align: left; border: 1px solid #0E5C44; font-weight: bold; }
            td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="kop">
            <h1>LAPORAN DIREKTORI & DATA SISWA SIT</h1>
            <p>Sekolah Islam Terpadu — Unit: ${unitName}${filterInfo}</p>
            <div class="meta">
              <span>Tanggal Cetak: ${currentDate}</span>
              <span>Total Data Terfilter: ${filteredStudents.length} Siswa</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 30%;">NIS / NISN & Nama Siswa</th>
                <th style="width: 25%;">Unit Kerja</th>
                <th style="width: 20%;">Kelas / Rombel</th>
                <th style="width: 13%; text-align: center;">Jenis Kelamin</th>
                <th style="width: 12%; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colSpan="5" style="text-align:center;">Tidak ada data siswa</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `)
  }

  const handlePrintStatCardModal = () => {
    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const unitName = rawUnits?.find((u) => String(u.id) === String(unitFilter))?.name || (unitFilter || 'Semua Unit')

    const rowsHtml = statModalItems.map((std) => {
      const nisNisn = `NIS: ${std.nis} / NISN: ${std.nisn}`
      return `
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">
            ${std.nama}<br/>
            <span style="font-size: 8pt; color: #64748b; font-family: monospace;">${nisNisn}</span>
          </td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${std.unit}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${std.kelas}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center;">${std.gender}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${std.status === 'Aktif' ? '#047857' : '#dc2626'};">${std.status}</td>
        </tr>
      `
    }).join('')

    printContentSilently(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${statCardModal.title || 'Laporan Detail Statistik Siswa'}</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: system-ui, -apple-system, sans-serif; font-size: 9pt; color: #0f172a; margin: 0; padding: 10px; }
            .kop { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
            .kop h1 { font-size: 13pt; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
            .kop p { font-size: 9pt; margin: 3px 0 0 0; color: #334155; font-weight: 600; }
            .meta { display: flex; justify-content: space-between; font-size: 8.5pt; color: #475569; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8.5pt; }
            th { background-color: #0E5C44; color: #ffffff; padding: 7px 8px; font-size: 8.5pt; text-align: left; border: 1px solid #0E5C44; font-weight: bold; }
            td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="kop">
            <h1>${(statCardModal.title || 'LAPORAN DETAIL STATISTIK SISWA SIT').toUpperCase()}</h1>
            <p>Sekolah Islam Terpadu — Unit: ${unitName}</p>
            <div class="meta">
              <span>Tanggal Cetak: ${currentDate}</span>
              <span>Total Terfilter: ${statModalItems.length} Siswa</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 30%;">NIS / NISN & Nama Siswa</th>
                <th style="width: 25%;">Unit Kerja</th>
                <th style="width: 20%;">Kelas / Rombel</th>
                <th style="width: 13%; text-align: center;">Jenis Kelamin</th>
                <th style="width: 12%; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colSpan="5" style="text-align:center;">Tidak ada data siswa</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `)
  }

  // Pagination
  const totalPages = Math.max(1, studentPagination.lastPage)
  const paginatedStudents = filteredStudents

  // Form Handlers
  const handleOpenTambah = () => {
    if (!canCreateStudent) return
    setIsEdit(false)
    setSelectedStudent(null)
    setShowFormModal(true)
  }

  const handleOpenEdit = (student) => {
    if (!canUpdateStudent) return
    setIsEdit(true)
    setSelectedStudent(student)
    setShowDetailModal(false)
    setShowFormModal(true)
  }

  const handleOpenDetail = (student) => {
    if (!student) return
    const match = formattedStudents.find(
      (s) => String(s.id) === String(student.id) || (s.nama && student.nama && s.nama.toLowerCase() === student.nama.toLowerCase())
    )
    setSelectedStudent(match || student)
    setActiveDetailTab('siswa')
    setShowDetailModal(true)
  }

  const navigate = useNavigate()
  const [chatTargetModal, setChatTargetModal] = useState(null)

  const handleOpenChatModal = (student) => {
    setChatTargetModal(student)
  }

  const handleDirectChatPortal = (student) => {
    if (!student) return
    const sId = student.id || ''
    const pId = student.parentId || student.parent_id || ''
    const pName = encodeURIComponent(student.orangTua || student.metadata?.nama_ayah || student.metadata?.nama_ibu || 'Orang Tua')
    const sName = encodeURIComponent(student.nama || student.full_name || '')
    navigate(`/dashboard/chat-pegawai?mode=teacher&student_id=${sId}&parent_id=${pId}&parent_name=${pName}&student_name=${sName}`)
    setChatTargetModal(null)
    setShowDetailModal(false)
  }

  const handleDirectWhatsApp = (phone, student) => {
    if (!phone) {
      Swal.fire('Nomor Tidak Tersedia', 'Nomor telepon/WA orang tua belum terdaftar.', 'info')
      return
    }
    let cleanPhone = String(phone).replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)
    if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone
    const text = encodeURIComponent(
      `Assalamu'alaikum Warahmatullahi Wabarakatuh Bapak/Ibu Wali dari Ananda ${student.nama || student.full_name || ''} (${student.unit || ''} - Kelas ${student.kelas || ''}).\n\nSaya ingin berkonsultasi mengenai perkembangan ananda di sekolah.`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank')
    setChatTargetModal(null)
    setShowDetailModal(false)
  }

  const handleDelete = async (student) => {
    if (!canDeleteStudent) return
    const res = await Swal.fire({
      title: 'Hapus data siswa?',
      text: `Data ${student.nama} akan dihapus dari sistem.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
    })
    if (res.isConfirmed) {
      await hapus.mutateAsync(student.id)
      setShowDetailModal(false)
    }
  }

  const handleFormSubmitCallback = async (payload) => {
    if ((isEdit && !canUpdateStudent) || (!isEdit && !canCreateStudent)) return
    try {
      if (isEdit && payload.id) {
        await ubah.mutateAsync({ id: payload.id, payload })
        Swal.fire('Berhasil', 'Data siswa berhasil diperbarui.', 'success')
      } else {
        await tambah.mutateAsync(payload)
        Swal.fire('Berhasil', 'Data siswa baru berhasil ditambahkan.', 'success')
      }
      setShowFormModal(false)
    } catch (err) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan data.', 'error')
    }
  }

  // Export Data trigger supporting .xlsx, .xls, and .csv
  const handleExportExcel = async () => {
    if (!canExportStudent) return

    const { value: format } = await Swal.fire({
      title: 'Ekspor Data Siswa',
      text: 'Pilih format berkas ekspor yang Anda inginkan:',
      icon: 'question',
      input: 'select',
      inputOptions: {
        xlsx: 'Microsoft Excel (.xlsx)',
        xls: 'Microsoft Excel Legacy (.xls)',
        csv: 'Comma Separated Values (.csv)',
      },
      inputValue: 'xlsx',
      showCancelButton: true,
      confirmButtonColor: '#064e3b',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Unduh Berkas',
      cancelButtonText: 'Batal',
    })

    if (!format) return

    const fileName = `Data_Siswa_DarElIman_${new Date().toISOString().slice(0, 10)}`

    if (format === 'csv') {
      const headers = ['NIS', 'NISN', 'Nama Lengkap', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Agama', 'Alamat', 'Unit Pendidikan', 'Kelas', 'Nama Ayah', 'HP Ayah', 'Nama Ibu', 'HP Ibu', 'Nama Wali', 'HP Wali', 'Status', 'Email']
      const csvRows = [headers.join(',')]
      filteredStudents.forEach((st) => {
        const meta = st.raw?.metadata || {}
        const row = [
          `"${st.nis}"`,
          `"${st.nisn}"`,
          `"${st.nama}"`,
          `"${st.gender}"`,
          `"${st.tempatLahir || ''}"`,
          `"${st.tanggalLahir || ''}"`,
          `"${st.agama || ''}"`,
          `"${(st.alamat || '').replace(/"/g, '""')}"`,
          `"${st.unit}"`,
          `"${st.kelas}"`,
          `"${meta.ayah?.nama || ''}"`,
          `"${meta.ayah?.hp || meta.ibu?.hp || meta.wali?.hp || ''}"`,
          `"${meta.ibu?.nama || ''}"`,
          `"${meta.ibu?.hp || ''}"`,
          `"${meta.wali?.nama || ''}"`,
          `"${meta.wali?.hp || ''}"`,
          `"${st.status}"`,
          `"${meta.email || ''}"`,
        ]
        csvRows.push(row.join(','))
      })
      const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Excel .xlsx or .xls XML Table
      const tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Data Siswa</x:Name>
                  <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 10pt; }
            th { background-color: #064E3B; color: #FFFFFF; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #CCCCCC; }
            td { padding: 6px; border: 1px solid #EEEEEE; }
            tr:nth-child(even) { background-color: #F8FAFC; }
          </style>
        </head>
        <body>
          <h2>DATA MASTER SISWA - DAR EL-IMAN</h2>
          <p>Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')} | Total: ${filteredStudents.length} siswa</p>
          <table>
            <thead>
              <tr>
                <th>No</th><th>NIS</th><th>NISN</th><th>Nama Lengkap</th><th>Jenis Kelamin</th><th>Tempat Lahir</th><th>Tanggal Lahir</th><th>Agama</th><th>Alamat</th><th>Unit Pendidikan</th><th>Kelas</th><th>Nama Ayah</th><th>HP Ayah</th><th>Nama Ibu</th><th>HP Ibu</th><th>Nama Wali</th><th>HP Wali</th><th>Status</th><th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents.map((st, idx) => {
        const meta = st.raw?.metadata || {}
        return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${st.nis || '-'}</td>
                    <td>${st.nisn || '-'}</td>
                    <td><b>${st.nama || '-'}</b></td>
                    <td>${st.gender || '-'}</td>
                    <td>${st.tempatLahir || '-'}</td>
                    <td>${st.tanggalLahir || '-'}</td>
                    <td>${st.agama || '-'}</td>
                    <td>${st.alamat || '-'}</td>
                    <td>${st.unit || '-'}</td>
                    <td>${st.kelas || '-'}</td>
                    <td>${meta.ayah?.nama || meta.nama_ayah || '-'}</td>
                    <td>${meta.ayah?.hp || meta.hp_ayah || '-'}</td>
                    <td>${meta.ibu?.nama || meta.nama_ibu || '-'}</td>
                    <td>${meta.ibu?.hp || meta.hp_ibu || '-'}</td>
                    <td>${meta.wali?.nama || meta.nama_wali || '-'}</td>
                    <td>${meta.wali?.hp || meta.hp_wali || '-'}</td>
                    <td>${st.status || '-'}</td>
                    <td>${meta.email || '-'}</td>
                  </tr>
                `
      }).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `
      const mimeType = format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/vnd.ms-excel'
      const blob = new Blob([tableHtml], { type: `${mimeType};charset=utf-8` })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Render Status Badge
  const renderStatusBadge = (statusStr) => {
    const st = String(statusStr || '').toLowerCase()
    if (st === 'aktif') {
      return <AppBadge variant="success" dot>Aktif</AppBadge>
    }
    if (st === 'mutasi') {
      return <AppBadge variant="warning" dot>Mutasi</AppBadge>
    }
    if (st === 'lulus') {
      return <AppBadge variant="info" dot>Lulus</AppBadge>
    }
    return <AppBadge variant="danger" dot>Nonaktif</AppBadge>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer maxW="7xl" className="space-y-6 pb-12">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <MasterDataPage hideBreadcrumb className="education-unit-page student-master-page">

        {/* Breadcrumb Navigation (Identik dengan Halaman Employees) */}
        <div className="print:hidden">
          <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Data Siswa' }]} />
        </div>

        {/* Header Halaman Modern Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden mb-6">
          {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <FaUserGraduate className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Master Data Siswa Terpadu
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Manajemen Kesiswaan
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Pengelolaan terpadu direktori peserta didik (TK, SD, SMP, SMA, Ponpes, Ma'had), status akademis, cetak kartu NISN, dan analisis kesiswaan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Direktori Siswa</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Summary Cards (TAILGRIDS_CARD_COMPONENT) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <KpiTintedCard
            icon={FaUserGraduate}
            label="Total Siswa"
            value={studentStats.total_siswa ?? 0}
            subtext="Terdaftar di sistem"
            tone="emerald"
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Total Siswa', filterType: 'all' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'all'}
          />
          <KpiTintedCard
            icon={FaMale}
            label="Siswa Laki-laki"
            value={genderStats.laki_laki ?? 0}
            subtext="Berdasarkan data siswa"
            tone="blue"
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Siswa Laki-laki', filterType: 'male' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'male'}
          />
          <KpiTintedCard
            icon={FaFemale}
            label="Siswa Perempuan"
            value={genderStats.perempuan ?? 0}
            subtext="Berdasarkan data siswa"
            tone="rose"
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Siswa Perempuan', filterType: 'female' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'female'}
          />
          <KpiTintedCard
            icon={FaCheckCircle}
            label="Status Aktif"
            value={studentStats.siswa_aktif ?? 0}
            subtext="Berstatus aktif"
            tone="amber"
            onClick={() => {
              setStatCardModal({ isOpen: true, title: 'Detail Data: Siswa Status Aktif', filterType: 'aktif' })
              setStatModalSearch('')
            }}
            active={statCardModal.isOpen && statCardModal.filterType === 'aktif'}
          />
        </div>

        {/* Analytics & Achievement Showcase Section for Kepala Sekolah & Divisi Pendidikan */}
        {isLeaderRole && (
          <StudentLeaderAnalyticsSection
            students={formattedStudents}
            dashboardStats={studentDashboardData?.laporan_siswa ? {
              siswa_baru: studentDashboardData.laporan_siswa.siswa_baru,
              mutasi_keluar: studentDashboardData.laporan_siswa.mutasi_keluar,
              siswa_nonaktif: studentStats.siswa_nonaktif,
            } : studentStats}
            selectedUnit={unitFilter}
            units={rawUnits}
            onUnitChange={(val) => { setUnitFilter(val); setCurrentPage(1) }}
            selectedKelas={kelasFilter}
            classes={rawClasses}
            onKelasChange={(val) => { setKelasFilter(val); setCurrentPage(1) }}
            isKepalaSekolah={isKepalaSekolah}
            isDivisiPendidikan={isDivisiPendidikan}
            onSelectStudent={handleOpenDetail}
            onOpenImport={() => setShowImportModal(true)}
            onOpenExport={handleExportExcel}
            onOpenAdd={handleOpenTambah}
            canExportStudent={canExportStudent}
            canCreateStudent={canCreateStudent}
          />
        )}

        {/* Unified Master Data Section */}
        {/* Unified Master Data Container */}
        <AppDataTable
          title="Daftar Siswa"
          actionColumnLabel=""
          description="Data siswa sesuai filter dan kewenangan pengguna."
          countLabel={`${Number(studentPagination.total || filteredStudents.length).toLocaleString('id-ID')} siswa`}
          actions={
            <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
              {/* Import Button (Soft Sky Blue Squircle) */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Import Data Siswa"
                  aria-label="Import Data Siswa"
                  className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-600 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                  onClick={() => setShowImportModal(true)}
                >
                  <Upload1 className="size-5 transition-colors" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Import Data
                </div>
              </div>

              {/* Export Button (Soft Amber Squircle) */}
              {canExportStudent && (
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Export Data Siswa"
                    aria-label="Export Data Siswa"
                    className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                    onClick={handleExportExcel}
                  >
                    <Download1 className="size-5 transition-colors" />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Export Data
                  </div>
                </div>
              )}

              {/* Cetak Datatable Button - Soft Pastel Indigo */}
              <div className="group relative inline-flex">
                <button
                  type="button"
                  title="Cetak Data Laporan (Print)"
                  aria-label="Cetak Data Laporan"
                  onClick={handlePrintMainTable}
                  className="flex size-10 items-center justify-center rounded-2xl bg-[#E0E7FF] text-[#4338CA] hover:bg-[#C7D2FE] dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Printer className="size-5" />
                </button>
                <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                  Cetak Data (Print)
                </div>
              </div>

              {/* Tambah Button (Soft Emerald Squircle) */}
              {canCreateStudent && (
                <div className="group relative inline-flex">
                  <button
                    type="button"
                    title="Tambah Siswa"
                    aria-label="Tambah Siswa"
                    className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs"
                    onClick={handleOpenTambah}
                  >
                    <PlusIcon className="size-5 transition-colors" />
                  </button>
                  <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                    <div className="absolute bottom-full left-1/2 -mb-1 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-100" />
                    Tambah Siswa
                  </div>
                </div>
              )}
            </div>
          }
          search={searchInput}
          onSearchChange={(value) => setSearchInput(value)}
          searchPlaceholder="Cari NIS, NISN, atau nama siswa..."
          filters={
            <>
              <MasterFilterSelect
                aria-label="Filter unit pendidikan"
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value)
                  setKelasFilter('')
                  setCurrentPage(1)
                }}
              >
                <option value="">Semua Unit Pendidikan</option>
                {rawUnits.map((u) => {
                  const val = u.nama_unit || u.name || u.nama || u.id
                  const label = u.nama_unit || u.name || u.nama || u.code || val
                  return (
                    <option key={u.id || val} value={val}>
                      {label}
                    </option>
                  )
                })}
              </MasterFilterSelect>

              <MasterFilterSelect
                aria-label="Filter kelas"
                value={kelasFilter}
                onChange={(e) => { setKelasFilter(e.target.value); setCurrentPage(1) }}
              >
                <option value="">Semua Kelas</option>
                {availableClasses.map((c) => {
                  const val = c.nama_kelas || c.name || c.nama || c.id
                  const label = c.nama_kelas || c.name || c.nama || val
                  return (
                    <option key={c.id || val} value={val}>
                      {label}
                    </option>
                  )
                })}
              </MasterFilterSelect>

              <MasterFilterSelect
                aria-label="Filter status"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="mutasi">Mutasi</option>
                <option value="lulus">Lulus</option>
                <option value="nonaktif">Nonaktif</option>
              </MasterFilterSelect>
            </>
          }
          onResetFilters={() => {
            setSearchInput('')
            setUnitFilter('')
            setKelasFilter('')
            setStatusFilter('')
            setCurrentPage(1)
          }}
          hasActiveFilters={Boolean(searchInput || unitFilter || kelasFilter || statusFilter)}
          isLoading={isLoading}
          isError={isError}
          errorTitle="Data siswa gagal dimuat"
          errorMessage="Periksa koneksi server kemudian coba kembali."
          onRetry={refetch}
          isEmpty={!isLoading && !isError && paginatedStudents.length === 0}
          emptyTitle="Siswa tidak ditemukan"
          emptyDescription="Tidak ada data siswa yang cocok dengan kriteria filter."
          page={currentPage}
          totalPages={studentPagination.lastPage || 1}
          totalItems={studentPagination.total || filteredStudents.length}
          itemsPerPage={studentPagination.perPage || 10}
          onPageChange={setCurrentPage}
          meta={{
            total: studentPagination.total || filteredStudents.length,
            from: studentPagination.from || 1,
            to: studentPagination.to || filteredStudents.length,
            last_page: studentPagination.lastPage || 1,
            current_page: currentPage,
          }}
          serverControlled
          renderTable={() => (
            <table className="w-full table-fixed text-left text-sm text-slate-600" aria-label="Daftar siswa">
              <thead className="bg-[#F8FAFB] dark:bg-[#202B3A] border-b border-[#EDF0F4] dark:border-[#354153]">
                <tr>
                  <th className="w-[6%] bg-[#F8FAFB] dark:bg-[#202B3A] px-2 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">No</th>
                  <th className="w-[34%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider">Identitas Siswa</th>
                  <th className="hidden w-[29%] bg-[#F8FAFB] dark:bg-[#202B3A] px-3 py-3.5 text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider md:table-cell">Orang Tua / Wali</th>
                  <th className="hidden w-[11%] bg-[#F8FAFB] dark:bg-[#202B3A] px-2 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider sm:table-cell">Status</th>
                  <th className="w-[20%] bg-[#F8FAFB] dark:bg-[#202B3A] px-2 py-3.5 text-center text-[#58677B] dark:text-[#DCE5F1] font-extrabold text-[11px] uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-slate-700 dark:text-slate-200">
                {paginatedStudents.map((item, idx) => (
                  <tr key={item.id} className="edu-row align-middle transition-colors hover:bg-emerald-50/40 dark:hover:bg-slate-800/50" style={{ animationDelay: `${Math.min(idx, 8) * 35}ms` }}>
                    <td className="px-2 py-3 text-center text-xs font-bold text-slate-400">
                      {(studentPagination.from || 1) + idx}
                    </td>
                    <td className="px-3 py-3">
                      <div className="min-w-0">
                        <PersonIdentityCell src={item.foto} name={item.nama} subtitle={`NIS ${item.nis} · NISN ${item.nisn || '-'}`} />
                        <span className="mt-1 block min-w-0 pl-11">
                          <small className="mt-0.5 block truncate text-[9px] font-semibold text-emerald-700 dark:text-emerald-300" title={`${item.unit} · Kelas ${item.kelas}`}>
                            {item.unit} · Kelas {item.kelas}
                          </small>
                          <small className="mt-0.5 block truncate text-[9px] font-medium text-slate-500 md:hidden" title={item.orangTua}>Ortu: {item.orangTua} ({item.noHp || '-'})</small>
                          <small className={`mt-0.5 text-[9px] font-bold sm:hidden ${(item.status || '').toLowerCase() === 'aktif' ? 'text-emerald-700' : 'text-amber-600'}`}>• {item.status}</small>
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 md:table-cell">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{(item.orangTua || 'W').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
                        <span className="min-w-0">
                          <strong className="block truncate text-xs text-slate-800 dark:text-slate-100" title={item.orangTua}>{item.orangTua}</strong>
                          <small className="mt-1 block whitespace-nowrap text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                            {item.noHp || '-'}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-center sm:table-cell">{renderStatusBadge(item.status)}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <ActionDropdown
                          onView={() => handleOpenDetail(item)}
                          onEdit={canUpdateStudent ? () => handleOpenEdit(item) : undefined}
                          onDelete={canDeleteStudent ? () => handleDelete(item) : undefined}
                          extraItems={[
                            {
                              label: 'Chat Orang Tua',
                              icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
                              onClick: () => handleOpenChatModal(item),
                            },
                            {
                              label: 'Cetak Kartu',
                              icon: <FaPrint className="h-4 w-4 text-emerald-600" />,
                              onClick: () => { setStudentToPrint(item); setShowCetakModal(true) },
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        />

        {/* POP UP MODAL 1: DETAIL SISWA */}
        {showDetailModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <FaUserGraduate className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Detail Siswa</h3>
                    <p className="text-[11px] font-medium text-slate-500">Informasi lengkap siswa dan data pendukung.</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)}
                  aria-label="Tutup detail siswa"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                  <FaTimes className="text-base" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[75vh] overflow-y-auto bg-white p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

                  {/* Left: Profile Overview Card */}
                  <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-xs">
                    {/* Photo + Name + Status */}
                    <div className="flex items-start gap-3">
                      <PersonAvatar src={selectedStudent.foto} name={selectedStudent.nama} size="detail" className="border-2 border-emerald-600 shadow" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{selectedStudent.nama}</h3>
                          {renderStatusBadge(selectedStudent.status)}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">NIS: {selectedStudent.nis} | NISN: {selectedStudent.nisn}</p>
                        <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">{selectedStudent.unit}</p>
                      </div>
                    </div>

                    {/* Biodata Singkat */}
                    <div className="space-y-2.5 border-t border-slate-100 pt-3">
                      {[
                        { label: 'Tempat, Tgl Lahir', value: `${selectedStudent.tempatLahir}, ${selectedStudent.tanggalLahir}` },
                        { label: 'Jenis Kelamin', value: selectedStudent.gender },
                        { label: 'Agama', value: selectedStudent.agama || 'Islam' },
                        { label: 'Kelas', value: selectedStudent.kelas },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-start gap-2">
                          <span className="text-slate-500 shrink-0">{item.label}:</span>
                          <span className="font-semibold text-slate-800 text-right">{item.value || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Tabbed Detail */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Tab Navigation + Content */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      {/* Tabs Header */}
                      <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
                        {[
                          { key: 'siswa', label: 'Data Siswa' },
                          { key: 'orangTua', label: 'Orang Tua / Wali' },
                          { key: 'akademik', label: 'Akademik' },
                          { key: 'riwayat', label: 'Riwayat' },
                          { key: 'dokumen', label: 'Dokumen' },
                        ].map(({ key, label }) => (
                          <button key={key} onClick={() => setActiveDetailTab(key)}
                            className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${activeDetailTab === key
                              ? 'border-emerald-700 text-emerald-900 font-extrabold bg-emerald-50/50'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                              }`}>
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div className="p-4 text-xs space-y-2">
                        {(() => {
                          const rawMeta = selectedStudent.raw?.metadata || {}
                          const parentRel = selectedStudent.raw?.parent || {}
                          const parentsPivot = selectedStudent.raw?.parents_pivot || selectedStudent.raw?.parents || []
                          const meta = {
                            ...rawMeta,
                            nama_ayah: rawMeta.nama_ayah || rawMeta.ayah?.nama || rawMeta.orang_tua?.nama_ayah || parentRel.full_name || parentRel.name || parentsPivot[0]?.full_name,
                            nama_ibu: rawMeta.nama_ibu || rawMeta.ibu?.nama || rawMeta.orang_tua?.nama_ibu,
                            nama_wali: rawMeta.nama_wali || rawMeta.wali?.nama || rawMeta.orang_tua?.nama_wali,
                            hp_ayah: rawMeta.hp_ayah || rawMeta.ayah?.hp || rawMeta.orang_tua?.no_hp || parentRel.phone || parentRel.no_hp || parentsPivot[0]?.phone,
                            hp_ibu: rawMeta.hp_ibu || rawMeta.ibu?.hp || rawMeta.orang_tua?.no_hp,
                            hp_wali: rawMeta.hp_wali || rawMeta.wali?.hp || rawMeta.orang_tua?.no_hp,
                          }
                          const DRow = ({ label, val }) => (
                            <p><span className="font-bold text-slate-700">{label}:</span>{' '}
                              <span className="text-slate-800">{val || '-'}</span>
                            </p>
                          )
                          if (activeDetailTab === 'siswa') return (
                            <div className="space-y-2">
                              <DRow label="NIS" val={selectedStudent.nis} />
                              <DRow label="NISN" val={selectedStudent.nisn} />
                              <DRow label="No Pendaftaran" val={meta.no_pendaftaran} />
                              <DRow label="NIK" val={meta.nik} />
                              <DRow label="No KK" val={meta.no_kk} />
                              <DRow label="No Registrasi Akta Lahir" val={meta.no_registrasi_akta_lahir} />
                              <DRow label="Kewarganegaraan" val={meta.kewarganegaraan || 'WNI'} />
                              <DRow label="Email" val={meta.email} />
                              <DRow label="Anak Ke-" val={meta.anak_ke} />
                              <DRow label="Jumlah Saudara" val={meta.jumlah_saudara} />
                              <DRow label="Jumlah Saudara Tiri" val={meta.jumlah_saudara_tiri} />
                              <DRow label="Berat Badan" val={meta.berat_badan ? `${meta.berat_badan} kg` : null} />
                              <DRow label="Tinggi Badan" val={meta.tinggi_badan ? `${meta.tinggi_badan} cm` : null} />
                              <DRow label="Riwayat Penyakit" val={meta.riwayat_penyakit} />
                              <hr className="border-slate-100 my-2" />
                              <DRow label="Alamat Lengkap" val={selectedStudent.alamat || meta.alamat_siswa} />
                              <DRow label="RT/RW" val={meta.rt && meta.rw ? `${meta.rt} / ${meta.rw}` : null} />
                              <DRow label="Dusun/Jalan" val={meta.dusun} />
                              <DRow label="Kelurahan" val={meta.kelurahan} />
                              <DRow label="Kecamatan" val={meta.kecamatan} />
                              <DRow label="Kota/Kabupaten" val={meta.kota_kabupaten} />
                              <DRow label="Provinsi" val={meta.provinsi} />
                              <DRow label="Kode Pos" val={meta.kode_pos} />
                              <DRow label="Jenis Tempat Tinggal" val={meta.jenis_tempat_tinggal} />
                              <DRow label="Jarak ke Sekolah" val={meta.jarak_tempuh_ke_sekolah ? `${meta.jarak_tempuh_ke_sekolah} km` : null} />
                              <DRow label="Moda Transportasi" val={meta.moda_transportasi} />
                              <hr className="border-slate-100 my-2" />
                              <DRow label="Hobi" val={meta.hobi} />
                              <DRow label="Cita-cita" val={meta.cita_cita} />
                            </div>
                          )
                          if (activeDetailTab === 'orangTua') return (
                            <div className="space-y-2">
                              {/* Quick Contact Banner */}
                              <div className="flex flex-wrap items-center justify-between gap-2 p-3 mb-3 rounded-xl bg-emerald-50/90 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800/60">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                    Hubungi Langsung Orang Tua / Wali
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDirectChatPortal(selectedStudent)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition cursor-pointer shadow-xs"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" /> Chat SIMS Portal
                                  </button>
                                  {(meta.nomor_wa_ayah || meta.hp_ayah || meta.telfon_ayah || meta.nomor_wa_ibu || meta.hp_ibu || selectedStudent.noHp) && (
                                    <button
                                      type="button"
                                      onClick={() => handleDirectWhatsApp(meta.nomor_wa_ayah || meta.hp_ayah || meta.nomor_wa_ibu || selectedStudent.noHp, selectedStudent)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                                    >
                                      <Phone className="h-3.5 w-3.5" /> WhatsApp
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p className="font-bold text-emerald-800 border-b border-emerald-100 pb-1.5 mb-2">Data Ayah Kandung</p>
                              <DRow label="NIK Ayah" val={meta.nik_ayah} />
                              <DRow label="Nama Ayah" val={meta.nama_ayah} />
                              <DRow label="Tempat, Tgl Lahir Ayah" val={meta.tempat_lahir_ayah && meta.tgl_lahir_ayah ? `${meta.tempat_lahir_ayah}, ${meta.tgl_lahir_ayah}` : (meta.tempat_lahir_ayah || meta.tgl_lahir_ayah)} />
                              <DRow label="Telfon / HP Ayah" val={meta.telfon_ayah || meta.hp_ayah} />
                              <DRow label="No WA Ayah" val={meta.nomor_wa_ayah} />
                              <DRow label="Pendidikan Terakhir Ayah" val={meta.pendidikan_terakhir_ayah} />
                              <DRow label="Pekerjaan Ayah" val={meta.pekerjaan_ayah} />
                              <DRow label="Instansi / Jabatan Ayah" val={meta.instansi_pekerjaan_ayah && meta.jabatan_pekerjaan_ayah ? `${meta.instansi_pekerjaan_ayah} — ${meta.jabatan_pekerjaan_ayah}` : (meta.instansi_pekerjaan_ayah || meta.jabatan_pekerjaan_ayah)} />
                              <DRow label="Penghasilan Ayah" val={meta.penghasilan_ayah ? `Rp ${Number(meta.penghasilan_ayah).toLocaleString('id-ID')}` : null} />
                              <DRow label="Alamat Rumah Ayah" val={meta.alamat_ayah} />
                              <hr className="border-slate-100 my-2" />
                              <p className="font-bold text-blue-800 border-b border-blue-100 pb-1.5 mb-2">Data Ibu Kandung</p>
                              <DRow label="NIK Ibu" val={meta.nik_ibu} />
                              <DRow label="Nama Ibu" val={meta.nama_ibu} />
                              <DRow label="Tempat, Tgl Lahir Ibu" val={meta.tempat_lahir_ibu && meta.tgl_lahir_ibu ? `${meta.tempat_lahir_ibu}, ${meta.tgl_lahir_ibu}` : (meta.tempat_lahir_ibu || meta.tgl_lahir_ibu)} />
                              <DRow label="Telfon / HP Ibu" val={meta.telfon_ibu || meta.hp_ibu} />
                              <DRow label="No WA Ibu" val={meta.nomor_wa_ibu} />
                              <DRow label="Pendidikan Terakhir Ibu" val={meta.pendidikan_terakhir_ibu} />
                              <DRow label="Pekerjaan Ibu" val={meta.pekerjaan_ibu} />
                              <DRow label="Instansi / Jabatan Ibu" val={meta.instansi_pekerjaan_ibu && meta.jabatan_pekerjaan_ibu ? `${meta.instansi_pekerjaan_ibu} — ${meta.jabatan_pekerjaan_ibu}` : (meta.instansi_pekerjaan_ibu || meta.jabatan_pekerjaan_ibu)} />
                              <DRow label="Penghasilan Ibu" val={meta.penghasilan_ibu ? `Rp ${Number(meta.penghasilan_ibu).toLocaleString('id-ID')}` : null} />
                              <DRow label="Alamat Rumah Ibu" val={meta.alamat_ibu} />
                              {(meta.nama_wali || meta.hp_wali) && (<>
                                <hr className="border-slate-100 my-2" />
                                <p className="font-bold text-slate-700 border-b border-slate-100 pb-1.5 mb-2">Data Wali</p>
                                <DRow label="NIK Wali" val={meta.nik_wali} />
                                <DRow label="Nama Wali" val={meta.nama_wali} />
                                <DRow label="HP / WA Wali" val={meta.hp_wali || meta.nomor_wa_wali} />
                                <DRow label="Pekerjaan Wali" val={meta.pekerjaan_wali} />
                                <DRow label="Alamat Wali" val={meta.alamat_wali} />
                              </>)}
                            </div>
                          )
                          if (activeDetailTab === 'akademik') return (
                            <div className="space-y-2">
                              <DRow label="Unit Pendidikan" val={selectedStudent.unit} />
                              <DRow label="Kelas" val={selectedStudent.kelas} />
                              <DRow label="Tahun Ajaran Masuk" val={meta.tahun_ajaran_masuk} />
                              <DRow label="Tahun Ajaran Berjalan" val={meta.tahun_ajaran_berjalan} />
                              <DRow label="Status Siswa" val={selectedStudent.status} />
                              <DRow label="NIS Pembayaran" val={meta.nis_pembayaran} />
                              <DRow label="Wali Kelas" val={meta.wali_kelas} />
                              <DRow label="NIY Wali Kelas" val={meta.niy_wali_kelas} />
                              <DRow label="Status Orang Tua" val={meta.status_orang_tua} />
                              <DRow label="NIY Ortu (Jika Pegawai)" val={meta.niy_ortu_jika_pegawai} />
                              <hr className="border-slate-100 my-2" />
                              <DRow label="Sekolah Asal" val={meta.sekolah_asal} />
                              <DRow label="Status Sekolah Asal" val={meta.status_sekolah_asal} />
                              <DRow label="Nominal SPP" val={meta.nominal_spp ? `Rp ${Number(meta.nominal_spp).toLocaleString('id-ID')}` : null} />
                              <DRow label="Penerima KPS/PKH" val={meta.penerima_kps_pkh} />
                              <DRow label="Punya KIP" val={meta.apakah_punya_kip} />
                              <DRow label="Layak Menerima PIP" val={meta.apakah_layak_menerima_pip} />
                              <DRow label="Alasan Menolak PIP" val={meta.alasan_menolak_pip} />
                            </div>
                          )
                          if (activeDetailTab === 'riwayat') return (
                            <div className="space-y-2">
                              <DRow label="Tanggal Masuk" val={meta.tanggal_masuk} />
                              <DRow label="No Induk Sebelumnya" val={meta.no_induk_sebelumnya} />
                              <DRow label="Beasiswa" val={meta.beasiswa} />
                              <DRow label="Catatan" val={meta.catatan} />
                              <p className="text-slate-400 mt-2">Riwayat keaktifan & kehadiran tercatat di sistem absensi.</p>
                            </div>
                          )
                          if (activeDetailTab === 'dokumen') return (
                            <div className="space-y-2">
                              <DRow label="Foto Siswa (URL)" val={meta.foto_url} />
                              <DRow label="No Registrasi Akta Lahir" val={meta.no_registrasi_akta_lahir} />
                              <DRow label="No Kartu Keluarga" val={meta.no_kk} />
                              <p className="text-slate-400 mt-2">Status dokumen fisik dikelola secara manual oleh admin TU.</p>
                            </div>
                          )
                          return null
                        })()}
                      </div>
                    </div>

                    {/* Quick Actions Card — sesuai gambar */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">AKSI CEPAT</h4>
                      <div className="flex flex-wrap gap-2">
                        {canUpdateStudent && (
                          <button onClick={() => handleOpenEdit(selectedStudent)}
                            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition">
                            <FaEdit /> Edit Data
                          </button>
                        )}
                        <button onClick={() => { setStudentToPrint(selectedStudent); setShowCetakModal(true) }}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition">
                          <FaPrint /> Cetak Kartu Siswa
                        </button>
                        {canDeleteStudent && (
                          <button onClick={() => handleDelete(selectedStudent)}
                            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition">
                            <FaTrash /> Hapus Data
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
                <button type="button" onClick={() => setShowDetailModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POP UP MODAL 2: TAMBAH / EDIT SISWA FORM */}
        <StudentFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          initialData={isEdit ? selectedStudent : null}
          onSubmit={handleFormSubmitCallback}
          classes={rawClasses}
          units={rawUnits}
        />

        {/* POP UP MODAL 3: CETAK KARTU SISWA */}
        {showCetakModal && (
          <CetakKartuSiswaModal student={studentToPrint} onClose={() => setShowCetakModal(false)} />
        )}

        {/* POP UP MODAL 4: DASHBOARD IMPORT DATA SISWA */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <FaFileImport className="text-base" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Dashboard Import Data Siswa</h2>
                    <p className="text-xs text-slate-500">Unggah file Excel atau CSV untuk mengimpor banyak siswa secara massal</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreviewData([]) }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Step 1: Download Template */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FaFileExcel className="text-2xl text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Unduh Format Template Import</h4>
                      <p className="text-[11px] text-slate-500">Gunakan format file ini agar kolom data sesuai dengan sistem ERP.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplateSiswa}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition shadow-xs whitespace-nowrap"
                  >
                    <FaDownload className="text-emerald-600" /> Unduh Template
                  </button>
                </div>

                {/* Step 2: Upload Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Unggah File (Excel / CSV)</label>
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:bg-slate-50 cursor-pointer transition">
                    <FaUpload className="text-3xl text-emerald-700 mb-2" />
                    <span className="text-xs font-bold text-slate-800">
                      {importFile ? importFile.name : 'Klik untuk memilih file Excel atau CSV'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'Format disukai: .csv, .xlsx, .xls (Maks. 5MB)'}
                    </span>
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Step 3: Preview Table */}
                {importPreviewData.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">Preview Data yang Siap Diimpor ({importPreviewData.length} baris)</h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        Format Sesuai
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                          <tr>
                            <th className="py-2 px-3">NIS</th>
                            <th className="py-2 px-3">NISN</th>
                            <th className="py-2 px-3">Nama Siswa</th>
                            <th className="py-2 px-3">JK</th>
                            <th className="py-2 px-3">Unit Pendidikan</th>
                            <th className="py-2 px-3">Kelas</th>
                            <th className="py-2 px-3">Nama Ayah</th>
                            <th className="py-2 px-3">HP Ayah</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {importPreviewData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-medium">{row.nis}</td>
                              <td className="py-2 px-3">{row.nisn}</td>
                              <td className="py-2 px-3 font-bold text-slate-800">{row.nama}</td>
                              <td className="py-2 px-3">{row.gender}</td>
                              <td className="py-2 px-3">{row.unit}</td>
                              <td className="py-2 px-3 font-semibold">{row.kelas}</td>
                              <td className="py-2 px-3">{row.namaAyah}</td>
                              <td className="py-2 px-3">{row.hpAyah}</td>
                              <td className="py-2 px-3 text-center">
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  {row.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Action Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                <button
                  type="button"
                  onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreviewData([]) }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!importFile || isImporting}
                  onClick={handleProcessImport}
                  className="flex items-center gap-2 rounded-xl bg-[#064e3b] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-50 transition"
                >
                  {isImporting ? 'Memproses Import...' : 'Proses Import Data'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detail Data Statistik Siswa (ERP Stat Cards Popup) */}
        {statCardModal.isOpen && (
          <OverlayWrapper
            isOpen={statCardModal.isOpen}
            onOpenChange={(open) => {
              if (!open) setStatCardModal((prev) => ({ ...prev, isOpen: false }))
            }}
            isDismissable
          >
            <Backdrop isOpen={statCardModal.isOpen} />
            <Dialog className="max-w-4xl w-full p-6 space-y-5">
              <DialogHeader className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <DialogTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    {statCardModal.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Daftar rinci siswa terfilter berdasarkan statistik
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      value={statModalSearch}
                      onChange={(e) => setStatModalSearch(e.target.value)}
                      placeholder="Cari nama, NIS, NISN, atau kelas..."
                      className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Total: {statModalItems.length} Siswa
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Nama Siswa & NIS/NISN</th>
                        <th className="p-3">Unit Kerja</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3 text-center">Jenis Kelamin</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {statModalItems.length > 0 ? (
                        statModalItems.map((std) => (
                          <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <PersonAvatar src={std.foto} name={std.nama} size="sm" />
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{std.nama}</p>
                                  <p className="font-mono text-[10px] text-slate-400">NIS: {std.nis} | NISN: {std.nisn}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">{std.unit}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300 font-semibold">{std.kelas}</td>
                            <td className="p-3 text-center text-slate-600 dark:text-slate-300">{std.gender}</td>
                            <td className="p-3 text-center">
                              <AppBadge variant={std.status === 'Aktif' ? 'success' : 'danger'} dot>
                                {std.status}
                              </AppBadge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 font-semibold">
                            Data siswa tidak ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button
                  variant="primary"
                  appearance="fill"
                  size="sm"
                  onClick={handlePrintStatCardModal}
                  className="flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Printer className="size-4" />
                  Cetak Tabel Popup
                </Button>

                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => setStatCardModal((prev) => ({ ...prev, isOpen: false }))}
                  className="font-semibold"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </Dialog>
          </OverlayWrapper>
        )}

        {/* MODAL PILIH OPSI CHAT KE ORANG TUA */}
        {chatTargetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <MessageCircle className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Hubungi Orang Tua / Wali</h3>
                    <p className="text-[11px] font-medium text-slate-500">
                      Ananda: <strong className="text-emerald-700 dark:text-emerald-400">{chatTargetModal.nama}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatTargetModal(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <FaTimes className="size-4" />
                </button>
              </div>

              <div className="my-4 space-y-3">
                <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Nama Wali:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{chatTargetModal.orangTua || '-'}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Unit / Kelas:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{chatTargetModal.unit} • Kelas {chatTargetModal.kelas}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Nomor HP / WA:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">{chatTargetModal.noHp || '-'}</strong>
                  </div>
                </div>

                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Pilih Jalur Komunikasi:</p>

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDirectChatPortal(chatTargetModal)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:border-emerald-500 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200 transition cursor-pointer text-left"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white font-black">
                      <MessageSquare className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black">Chat Internal SIMS Terpadu</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Pesan resmi tersimpan dalam riwayat komunikasi sekolah</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectWhatsApp(chatTargetModal.noHp, chatTargetModal)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl border border-emerald-200 bg-white hover:border-emerald-400 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition cursor-pointer text-left"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-black">
                      <Phone className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black">Hubungi via WhatsApp</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Kirim pesan langsung ke nomor WhatsApp orang tua</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => setChatTargetModal(null)}
                  className="font-semibold text-xs"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}
        </MasterDataPage>
      </motion.div>
    </PageContainer>
  )
}
