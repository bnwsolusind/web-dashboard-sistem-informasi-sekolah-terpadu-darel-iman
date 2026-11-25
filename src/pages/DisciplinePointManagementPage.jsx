import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Button as HeroButton,
  Input as HeroInput,
  Spinner as HeroSpinner
} from '@heroui/react'
import { Chip as HeroChip } from '../components/ui/badge'
import {
  Card,
  CardHeader,
  CardContent
} from '../components/ui/card'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Award,
  BookOpen,
  FileText,
  UserCheck,
  Search,
  Filter,
  Plus,
  RotateCcw,
  Printer,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Building,
  School,
  Flame,
  Home,
  Bookmark,
  MessageSquare,
  AlertOctagon,
  Calendar,
  Send,
  Pencil,
  Trash2,
  X,
  ArrowUpDown
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  PageContainer,
  AppBreadcrumb,
  AppModal,
  AppTabs,
  PageToolbarActions
} from '../components/app'
import { SquircleActionButton } from '../components/master-data'
import HeroUiHeader from '../components/ui/HeroUiHeader'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  Input as UiInput
} from '../components/ui/input'
import {
  TextArea as UiTextArea
} from '../components/ui/text-area'
import {
  canSwitchEducationUnit
} from '../auth/portalResolver'
import {
  useAuthStore
} from '../stores/authStore'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  disciplineService
} from '../services/disciplineService'
import api from '../services/api'

// Cluster Configurations
const CLUSTERS = [
 { key: 'all', label: 'Semua Kluster', icon: Scale, color: 'default' },
 { key: 'peraturan_umum', label: 'A. Peraturan Umum', icon: Building, color: 'primary' },
 { key: 'kelas_halaqoh', label: 'B. Kelas & Halaqoh', icon: School, color: 'secondary' },
 { key: 'asrama', label: 'C. Peraturan Asrama', icon: Home, color: 'warning' },
 { key: 'masjid', label: 'D. Peraturan di Masjid', icon: Sparkles, color: 'success' },
]

export default function DisciplinePointManagementPage() {
 const user = useAuthStore((state) => state.user)

 // Otorisasi Peran Dinamis
 const userRoles = useMemo(() => {
 return (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || ''))
 }, [user])

 const isAdmin = useMemo(() => {
 const adminRoles = ['Super Admin', 'Superadmin', 'super_admin', 'Admin', 'admin', 'Tata Usaha', 'tu', 'TU', 'tata_usaha', 'Operator']
 return userRoles.some((r) => adminRoles.includes(r))
 }, [userRoles])

 const isMusyrif = useMemo(() => {
 return userRoles.some((r) => ['Musyrif', 'musyrif', 'Musyrifah', 'musyrifah', 'Musyrif Asrama'].includes(r))
 }, [userRoles])

 const isWaliKelas = useMemo(() => {
 return userRoles.some((r) => ['Wali Kelas', 'wali_kelas', 'wali-kelas'].includes(r))
 }, [userRoles])

 const isWakaKesantrian = useMemo(() => {
 return userRoles.some((r) => ['Waka Kesantrian', 'waka_kesantrian', 'Wakil Kesantrian', 'Kepala Asrama'].includes(r))
 }, [userRoles])

 const isGuru = useMemo(() => {
 return userRoles.some((r) => r.toLowerCase().includes('guru') || r.toLowerCase().includes('teacher'))
 }, [userRoles])

 const isKepsek = useMemo(() => {
 return userRoles.some((r) => ['Kepala Sekolah', 'kepala_sekolah', 'Kepsek', 'kepsek'].includes(r))
 }, [userRoles])

 const isDivisi = useMemo(() => {
 return userRoles.some((r) => r.toLowerCase().includes('divisi') || r.toLowerCase().includes('yayasan'))
 }, [userRoles])

 // State Halaman Utama
 const [activeTab, setActiveTab] = useState('violations')
 const [loading, setLoading] = useState(false)
 const [stats, setStats] = useState(null)

 // State Transaksi & Pelanggaran
 const [violations, setViolations] = useState([])
 const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
 const [searchInput, setSearchInput] = useState('')
 const debouncedSearch = useDebounce(searchInput, 350)
 const [selectedCluster, setSelectedCluster] = useState('all')
 const [selectedLevel, setSelectedLevel] = useState('all')
 const [selectedUnitId, setSelectedUnitId] = useState('all')
 const [selectedClassId, setSelectedClassId] = useState('all')
 const [classesList, setClassesList] = useState([])
 const [classesLoading, setClassesLoading] = useState(false)
 const [sortBy, setSortBy] = useState('date_desc')
 const [educationUnits, setEducationUnits] = useState([])

 // State Master Kategori (Aturan Tata Tertib)
 const [categories, setCategories] = useState([])
 const [categoriesLoading, setCategoriesLoading] = useState(false)
 const [masterSearch, setMasterSearch] = useState('')
 const debouncedMasterSearch = useDebounce(masterSearch, 350)
 const [masterCluster, setMasterCluster] = useState('all')

 // State Ambang Batas Sanksi
 const [thresholds, setThresholds] = useState([])

 // State Modal Input Pelanggaran
 const [isInputModalOpen, setIsInputModalOpen] = useState(false)
 const [savingViolation, setSavingViolation] = useState(false)
 const [studentsList, setStudentsList] = useState([])
 const [studentsLoading, setStudentsLoading] = useState(false)
 const [modalUnitFilter, setModalUnitFilter] = useState('all')
 const [modalCategoryCluster, setModalCategoryCluster] = useState('all')
 const [modalCategorySearch, setModalCategorySearch] = useState('')
 const [studentSearchInput, setStudentSearchInput] = useState('')
 const debouncedStudentSearch = useDebounce(studentSearchInput, 350)
 const [selectedStudent, setSelectedStudent] = useState(null)
 const [selectedCategory, setSelectedCategory] = useState(null)
 const [violationForm, setViolationForm] = useState({
 student_id: '',
 category_id: '',
 points: '',
 transaction_date: new Date().toISOString().split('T')[0],
 incident_location: 'kelas',
 description: '',
 direct_consequence_notes: '',
 })

 // State Modal Lembar Skor Santri (Speedometer 0 - 250 Poin)
 const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
 const [summaryData, setSummaryData] = useState(null)
 const [summaryLoading, setSummaryLoading] = useState(false)

 // State Modal Surat Peringatan (ST / SP1 / SP2)
 const [isLetterModalOpen, setIsLetterModalOpen] = useState(false)
 const [letterForm, setLetterForm] = useState({
 student_id: '',
 letter_type: 'st',
 letter_number: '',
 parent_summon_date: '',
 notes: '',
 signed_by_role: 'Waka Kesantrian / Kepala Sekolah',
 })
 const [savingLetter, setSavingLetter] = useState(false)

 // State Modal Master Kategori (CRUD Admin)
 const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
 const [editingCategory, setEditingCategory] = useState(null)
 const [categoryForm, setCategoryForm] = useState({
 cluster: 'peraturan_umum',
 pasal_number: '1',
 rule_name: '',
 name: '',
 violation_detail: '',
 level: 'ringan',
 code: '',
 point_weight: 10,
 direct_consequence: '',
 is_permanent: false,
 target_unit_type: 'all',
 })
 const [savingCategory, setSavingCategory] = useState(false)

 // 1. Load Data Awal (Stats & Unit Pendidikan)
 const loadInitialData = useCallback(async () => {
 try {
 setLoading(true)
 const [statsRes, unitsRes, thresholdsRes] = await Promise.all([
 disciplineService.getDashboardStats().catch(() => null),
 api.get('/education-units').catch(() => ({ data: [] })),
 disciplineService.getThresholds().catch(() => ({ data: [] })),
 ])

 if (statsRes?.data) setStats(statsRes.data)
 if (unitsRes?.data) setEducationUnits(unitsRes.data.data || unitsRes.data || [])
 if (thresholdsRes?.data) setThresholds(thresholdsRes.data)
 } catch (err) {
 console.error('Failed to load initial discipline data:', err)
 } finally {
 setLoading(false)
 }
 }, [])

 useEffect(() => {
 loadInitialData()
 }, [loadInitialData])

 // Load Kelas Dinamis saat Unit Pendidikan Dipilih
 useEffect(() => {
 let isMounted = true
 const fetchClasses = async () => {
 if (selectedUnitId === 'all') {
 setClassesList([])
 setSelectedClassId('all')
 return
 }
 try {
 setClassesLoading(true)
 const res = await api.get('/kelas', { params: { unit_id: selectedUnitId, per_page: 100 } })
 if (isMounted) {
 const list = res?.data?.data || res?.data || []
 setClassesList(Array.isArray(list) ? list : [])
 setSelectedClassId('all')
 }
 } catch (err) {
 console.error('Failed to load classes for unit:', err)
 if (isMounted) setClassesList([])
 } finally {
 if (isMounted) setClassesLoading(false)
 }
 }
 fetchClasses()
 return () => {
 isMounted = false
 }
 }, [selectedUnitId])

 // 2. Load Transaksi Pelanggaran
 const fetchViolations = useCallback(
 async (page = 1) => {
 try {
 setLoading(true)
 const params = {
 page,
 per_page: 15,
 search: debouncedSearch || undefined,
 cluster: selectedCluster !== 'all' ? selectedCluster : undefined,
 level: selectedLevel !== 'all' ? selectedLevel : undefined,
 unit_id: selectedUnitId !== 'all' ? selectedUnitId : undefined,
 class_id: selectedClassId !== 'all' ? selectedClassId : undefined,
 sort_by: sortBy,
 }
 const res = await disciplineService.getViolations(params)
 setViolations(res.data || [])
 if (res.meta) {
 setPagination({
 current_page: res.meta.current_page,
 last_page: res.meta.last_page,
 total: res.meta.total,
 })
 }
 } catch (err) {
 console.error('Failed to fetch violations:', err)
 } finally {
 setLoading(false)
 }
 },
 [debouncedSearch, selectedCluster, selectedLevel, selectedUnitId, selectedClassId, sortBy]
 )

 useEffect(() => {
 if (activeTab === 'violations') {
 fetchViolations(1)
 }
 }, [fetchViolations, activeTab])

 // 3. Load Master Kategori Pelanggaran
 const fetchCategories = useCallback(async () => {
 try {
 setCategoriesLoading(true)
 const params = {
 all: true,
 search: debouncedMasterSearch || undefined,
 cluster: masterCluster !== 'all' ? masterCluster : undefined,
 }
 const res = await disciplineService.getCategories(params)
 setCategories(res.data || [])
 } catch (err) {
 console.error('Failed to fetch categories:', err)
 } finally {
 setCategoriesLoading(false)
 }
 }, [debouncedMasterSearch, masterCluster])

 useEffect(() => {
 if (activeTab === 'rules' || isInputModalOpen) {
 fetchCategories()
 }
 }, [fetchCategories, activeTab, isInputModalOpen])

 const canSwitchUnit = useMemo(() => canSwitchEducationUnit(user), [user])
 const userAssignedUnitId =
 user?.education_unit_id ||
 user?.unit_id ||
 user?.employee?.unit_id ||
 user?.metadata?.unit_id ||
 user?.metadata?.education_unit_id ||
 ''

 // Unit Pendidikan Options untuk HeroUiFilterSelect (dengan badge Boarding/Fullday otomatis)
 const unitFilterOptions = useMemo(() => {
 const mapped = educationUnits.map((u) => {
 const isBoarding = u.program_type === 'boarding' || /PONPES|MAHAD|PESANTREN|ASRAMA/i.test(u.name || '')
 return {
 value: String(u.id),
 label: u.name,
 badge: isBoarding ? 'Boarding' : 'Fullday',
 badgeColor: isBoarding ? 'warning' : 'primary',
 }
 })
 if (!canSwitchUnit && mapped.length > 0) {
 return mapped
 }
 return [
 { value: 'all', label: 'Semua Unit Pendidikan' },
 ...mapped,
 ]
 }, [educationUnits, canSwitchUnit])

 useEffect(() => {
 if (!canSwitchUnit) {
 const targetId = String(userAssignedUnitId || (educationUnits.length === 1 ? educationUnits[0].id : ''))
 if (targetId) {
 if (selectedUnitId === 'all') setSelectedUnitId(targetId)
 if (modalUnitFilter === 'all') setModalUnitFilter(targetId)
 }
 }
 }, [canSwitchUnit, userAssignedUnitId, educationUnits, selectedUnitId, modalUnitFilter])

 // Class Options untuk HeroUiFilterSelect (terfilter otomatis berdasarkan unit yang dipilih)
 const classFilterOptions = useMemo(() => {
 if (selectedUnitId === 'all') {
 return [{ value: 'all', label: 'Semua Kelas' }]
 }
 return [
 { value: 'all', label: 'Semua Kelas di Unit Ini' },
 ...classesList.map((k) => ({
 value: String(k.id),
 label: k.nama_kelas || k.name || `Kelas ${k.tingkat || ''}`,
 })),
 ]
 }, [selectedUnitId, classesList])

 // Filter Kategori/Pasal Dinamis untuk Modal
 const filteredModalCategories = useMemo(() => {
 return categories.filter((c) => {
 const matchCluster = modalCategoryCluster === 'all' || c.cluster === modalCategoryCluster
 const s = modalCategorySearch.toLowerCase().trim()
 const matchSearch =
 !s ||
 (c.name || '').toLowerCase().includes(s) ||
 (c.code || '').toLowerCase().includes(s) ||
 (c.rule_name || '').toLowerCase().includes(s) ||
 (c.violation_detail || '').toLowerCase().includes(s) ||
 String(c.pasal_number || '').includes(s)
 return matchCluster && matchSearch
 })
 }, [categories, modalCategoryCluster, modalCategorySearch])

 // Opsi Butir Pelanggaran untuk HeroUiFilterSelect di Modal
 const modalCategoryOptions = useMemo(() => {
 return filteredModalCategories.map((c) => ({
 value: String(c.id),
 label: `[Pasal ${c.pasal_number || c.code}] ${c.rule_name || c.name}`,
 badge: `+${c.point_weight} Poin`,
 subtext: `Tingkat ${c.level?.toUpperCase()} • ${c.is_permanent ? 'Permanen (Tanpa Pemutihan)' : 'Bisa Diputihkan'}${c.direct_consequence ? ' • Sanksi: ' + c.direct_consequence : ''}`,
 }))
 }, [filteredModalCategories])

 // 4. Cari Siswa Dinamis untuk Form Input (Melalui dedicated disciplineService.searchStudents)
 useEffect(() => {
 if (!isInputModalOpen) return
 const fetchStudents = async () => {
 try {
 setStudentsLoading(true)
 const res = await disciplineService.searchStudents({
 search: debouncedStudentSearch || undefined,
 unit_id: modalUnitFilter !== 'all' ? modalUnitFilter : undefined,
 })
 setStudentsList(res.data || [])
 } catch (err) {
 console.error('Failed to fetch students:', err)
 } finally {
 setStudentsLoading(false)
 }
 }
 fetchStudents()
 }, [debouncedStudentSearch, modalUnitFilter, isInputModalOpen])

 // Cek apakah user berwenang mengisi untuk siswa yang dipilih
 const studentUnitContext = useMemo(() => {
 if (!selectedStudent) return null
 const unit = selectedStudent.education_unit || selectedStudent.educationUnit
 const unitName = (selectedStudent.unit_name || unit?.name || '').toUpperCase() + ' ' + (unit?.code || '').toUpperCase()
 const isBoarding = Boolean(selectedStudent.is_boarding || unit?.program_type === 'boarding' || /PONPES|MAHAD|PESANTREN|ASRAMA/.test(unitName))

 let isAuthorized = false
 let reason = ''

 if (isAdmin || isDivisi) {
 isAuthorized = true
 } else if (isBoarding) {
 if (isMusyrif || isWaliKelas || isWakaKesantrian || isKepsek) {
 isAuthorized = true
 } else {
 reason = 'Unit Boarding/Pesantren: Hanya dapat diinput oleh Musyrif, Wali Kelas, Waka Kesantrian, atau Kepala Sekolah.'
 }
 } else {
 if (isGuru || isWaliKelas || isKepsek) {
 isAuthorized = true
 } else {
 reason = 'Unit Fullday: Dapat diinput oleh Seluruh Lini Guru (Wali Kelas, Guru Mapel), Kepala Sekolah, dan Divisi Pendidikan.'
 }
 }

 return {
 isBoarding,
 unitName: selectedStudent.unit_name || unit?.name || 'Unit Pendidikan',
 isAuthorized,
 reason,
 }
 }, [selectedStudent, isAdmin, isDivisi, isMusyrif, isWaliKelas, isWakaKesantrian, isGuru, isKepsek])

 // Handler Submit Input Pelanggaran
 const handleSubmitViolation = async (e) => {
 e.preventDefault()
 if (!selectedStudent) {
 Swal.fire({ icon: 'warning', title: 'Pilih Siswa/Santri', text: 'Silakan pilih siswa yang melanggar tata tertib.' })
 return
 }
 if (!selectedCategory) {
 Swal.fire({ icon: 'warning', title: 'Pilih Aturan Pelanggaran', text: 'Silakan pilih jenis pelanggaran tata tertib.' })
 return
 }
 if (studentUnitContext && !studentUnitContext.isAuthorized) {
 Swal.fire({ icon: 'error', title: 'Akses Tidak Diizinkan', text: studentUnitContext.reason })
 return
 }

 try {
 setSavingViolation(true)
 const payload = {
 student_id: selectedStudent.id,
 category_id: selectedCategory.id,
 points: violationForm.points ? parseInt(violationForm.points) : selectedCategory.point_weight,
 transaction_date: violationForm.transaction_date,
 incident_location: violationForm.incident_location,
 description: violationForm.description,
 direct_consequence_notes: violationForm.direct_consequence_notes,
 }

 const res = await disciplineService.recordViolation(payload)
 const data = res.data

 setIsInputModalOpen(false)
 setSelectedStudent(null)
 setSelectedCategory(null)
 setViolationForm({
 student_id: '',
 category_id: '',
 points: '',
 transaction_date: new Date().toISOString().split('T')[0],
 incident_location: 'kelas',
 description: '',
 direct_consequence_notes: '',
 })

 fetchViolations(1)
 loadInitialData()

 // Alert Sukses & Info Ambang Batas
 if (data?.needs_warning_letter) {
 Swal.fire({
 icon: 'warning',
 title: 'Poin Mencapai Ambang Batas!',
 html: `<p>Santri <b>${selectedStudent.full_name}</b> telah mencapai <b>${data.cumulative_points} Poin</b>.</p>
 <p class="text-sm mt-2 text-rose-600 font-bold">${data.current_stage?.sanction_name || 'Perlu Tindak Lanjut Surat Peringatan'}</p>`,
 confirmButtonText: 'Lihat Lembar Skor',
 showCancelButton: true,
 cancelButtonText: 'Tutup',
 }).then((result) => {
 if (result.isConfirmed) {
 handleOpenSummary(selectedStudent.id)
 }
 })
 } else {
 Swal.fire({
 icon: 'success',
 title: 'Pelanggaran Berhasil Dicatat',
 text: `Poin kelakuan berhasil disimpan. Akumulasi berjalan: ${data?.cumulative_points || 0} Poin.`,
 })
 }
 } catch (err) {
 console.error('Failed to submit violation:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal Menyimpan',
 text: err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
 })
 } finally {
 setSavingViolation(false)
 }
 }

 // Handler Buka Lembar Skor Santri (Speedometer Poin)
 const handleOpenSummary = async (studentId) => {
 try {
 setSummaryLoading(true)
 setIsSummaryModalOpen(true)
 const res = await disciplineService.getStudentSummary(studentId)
 setSummaryData(res.data)
 } catch (err) {
 console.error('Failed to load student summary:', err)
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat memuat lembar skor kedisiplinan santri.' })
 } finally {
 setSummaryLoading(false)
 }
 }

 // Handler Buka Modal Terbitkan Surat Peringatan
 const handleOpenLetterModal = (student, defaultType = 'st') => {
 setLetterForm({
 student_id: student.id,
 letter_type: defaultType,
 letter_number: '',
 parent_summon_date: '',
 notes: '',
 signed_by_role: 'Waka Kesantrian / Kepala Sekolah',
 })
 setIsLetterModalOpen(true)
 }

 // Handler Submit Surat Peringatan
 const handleSubmitLetter = async (e) => {
 e.preventDefault()
 try {
 setSavingLetter(true)
 await disciplineService.issueWarningLetter(letterForm)
 setIsLetterModalOpen(false)
 Swal.fire({ icon: 'success', title: 'Surat Resmi Diterbitkan', text: 'Surat peringatan telah tercatat secara resmi.' })
 if (summaryData?.student?.id) {
 handleOpenSummary(summaryData.student.id)
 }
 fetchViolations(pagination.current_page)
 } catch (err) {
 console.error('Failed to issue warning letter:', err)
 Swal.fire({ icon: 'error', title: 'Gagal Menerbitkan', text: err?.response?.data?.message || 'Terjadi kesalahan.' })
 } finally {
 setSavingLetter(false)
 }
 }

 // Helper Warna Badge Level
 const getLevelBadge = (level) => {
 switch (level) {
 case 'berat':
 return <HeroChip size="sm" color="danger" variant="flat" className="font-bold">Berat</HeroChip>
 case 'sedang':
 return <HeroChip size="sm" color="warning" variant="flat" className="font-bold">Sedang</HeroChip>
 default:
 return <HeroChip size="sm" color="success" variant="flat" className="font-bold">Ringan</HeroChip>
 }
 }

 // Helper Warna Cluster
 const getClusterBadge = (cluster) => {
 switch (cluster) {
 case 'asrama':
 return <HeroChip size="sm" color="warning" variant="dot">Asrama</HeroChip>
 case 'kelas_halaqoh':
 return <HeroChip size="sm" color="secondary" variant="dot">Kelas/Halaqoh</HeroChip>
 case 'masjid':
 return <HeroChip size="sm" color="success" variant="dot">Masjid</HeroChip>
 default:
 return <HeroChip size="sm" color="primary" variant="dot">Umum</HeroChip>
 }
 }

 return (
 <PageContainer>
 {/* 1. HERO HEADER WITH AMBIENT GLOW */}
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Kesantrian & Kedisiplinan', href: '/dashboard/kesantrian' },
 { label: 'Tata Tertib & Poin' },
 ]}
 />

 <HeroUiHeader
 title="Tata Tertib & Poin"
 subtitle="Manajemen kedisiplinan berjenjang terintegrasi (1 - 250 Poin): Pencatatan langsung oleh Musyrif Asrama, Wali Kelas, Guru Mapel, Waka Kesantrian, dan Divisi Pendidikan."
 icon={Scale}
 roleBadge={userRoles[0] || 'Petugas'}
 theme="emerald"
 actions={
 <PageToolbarActions
 primaryAction={{
 label: 'Catat Pelanggaran',
 onClick: () => setIsInputModalOpen(true),
 }}
 >
 {isAdmin && (
 <SquircleActionButton
 variant="secondary"
 icon={Bookmark}
 label="Kelola Tata Tertib"
 onClick={() => setActiveTab('rules')}
 />
 )}
 </PageToolbarActions>
 }
 />

 {/* 2. MASTER STATS GRID (5 KARTU KPI DENGAN GAYA MODERN HERO UI & AMBIENT GLOW) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 my-6">
 {[
 {
 key: 'kasus-bulan-ini',
 label: 'Kasus Bulan Ini',
 value: stats?.violations_this_month ?? 0,
 subtitle: 'Pelanggaran tercatat',
 tag: 'Bulan Ini',
 footer: 'Monitoring Aktif',
 icon: ShieldAlert,
 targetTab: 'violations',
 theme: {
 card: 'border-emerald-300 !bg-emerald-100/90 hover:!bg-emerald-200/70 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-sm dark:border-emerald-800/60 dark:!bg-emerald-950/50',
 glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
 iconBox: '!bg-emerald-600 !text-white shadow-sm',
 tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
 title: 'text-emerald-800 dark:text-emerald-400',
 val: 'text-emerald-900 dark:text-emerald-100',
 sub: 'text-emerald-700/85 dark:text-emerald-300/80',
 cta: 'text-emerald-700 dark:text-emerald-400',
 },
 },
 {
 key: 'sp-aktif',
 label: 'Status SP1 / SP2 Aktif',
 value: stats?.active_sp_count ?? 0,
 subtitle: 'Santri dalam pantauan khusus',
 tag: 'Pantauan Khusus',
 footer: 'Perlu Konseling',
 icon: AlertTriangle,
 targetTab: 'thresholds',
 theme: {
 card: 'border-emerald-200/80 !bg-amber-100/90 hover:!bg-amber-200/70 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-sm dark:border-emerald-800/60 dark:!bg-amber-950/50',
 glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
 iconBox: '!bg-amber-600 !text-white shadow-sm',
 tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
 title: 'text-amber-800 dark:text-amber-400',
 val: 'text-amber-900 dark:text-amber-100',
 sub: 'text-amber-700/85 dark:text-amber-300/80',
 cta: 'text-amber-700 dark:text-amber-400',
 },
 },
 {
 key: 'kasus-berat',
 label: 'Kasus Berat Permanen',
 value: stats?.permanent_violations_count ?? 0,
 subtitle: 'Poin tidak dapat diputihkan',
 tag: 'Tanpa Pemutihan',
 footer: 'Sanksi Tegas',
 icon: Flame,
 targetTab: 'violations',
 onCardClick: () => {
 setActiveTab('violations')
 setSelectedLevel('berat')
 },
 theme: {
 card: 'border-emerald-200/80 !bg-rose-100/90 hover:!bg-rose-200/70 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-sm dark:border-emerald-800/60 dark:!bg-rose-950/50',
 glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
 iconBox: '!bg-rose-600 !text-white shadow-sm',
 tag: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
 title: 'text-rose-800 dark:text-rose-400',
 val: 'text-rose-900 dark:text-rose-100',
 sub: 'text-rose-700/85 dark:text-rose-300/80',
 cta: 'text-rose-700 dark:text-rose-400',
 },
 },
 {
 key: 'selesai-dibina',
 label: 'Sanksi Selesai Dibina',
 value: stats?.resolved_count ?? 0,
 subtitle: 'Telah menuntaskan sanksi',
 tag: 'Tuntas',
 footer: 'Evaluasi Positif',
 icon: CheckCircle2,
 targetTab: 'violations',
 theme: {
 card: 'border-emerald-200/80 !bg-teal-100/90 hover:!bg-teal-200/70 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-sm dark:border-emerald-800/60 dark:!bg-teal-950/50',
 glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
 iconBox: '!bg-teal-600 !text-white shadow-sm',
 tag: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
 title: 'text-teal-800 dark:text-teal-400',
 val: 'text-teal-900 dark:text-teal-100',
 sub: 'text-teal-700/85 dark:text-teal-300/80',
 cta: 'text-teal-700 dark:text-teal-400',
 },
 },
 {
 key: 'katalog-aturan',
 label: 'Katalog Tata Tertib',
 value: categories.length || 122,
 subtitle: 'Pasal aturan aktif',
 tag: '4 Kluster',
 footer: 'Buku Saku Resmi',
 icon: Scale,
 targetTab: 'rules',
 theme: {
 card: 'border-emerald-200/80 !bg-indigo-100/90 hover:!bg-indigo-200/70 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-sm dark:border-emerald-800/60 dark:!bg-indigo-950/50',
 glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
 iconBox: '!bg-indigo-600 !text-white shadow-sm',
 tag: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
 title: 'text-indigo-800 dark:text-indigo-400',
 val: 'text-indigo-900 dark:text-indigo-100',
 sub: 'text-indigo-700/85 dark:text-indigo-300/80',
 cta: 'text-indigo-700 dark:text-indigo-400',
 },
 },
 ].map((card, idx) => {
 const Icon = card.icon
 const t = card.theme
 return (
 <motion.article
 key={card.key}
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.25, delay: idx * 0.05 }}
 whileHover={{ scale: 1.02, y: -3 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => {
 if (card.onCardClick) {
 card.onCardClick()
 } else if (card.targetTab) {
 setActiveTab(card.targetTab)
 }
 }}
 role="button"
 tabIndex={0}
 className={`group relative overflow-hidden rounded-xl border-2 p-4 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${t.card}`}
 title={`Klik untuk melihat detail ${card.label}`}
 >

 <div>
 {/* Header with 3D Gradient Icon Box & Pill Tag */}
 <div className="flex items-center justify-between gap-2 mb-3">
 <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${t.iconBox}`}>
 <Icon className="size-5" />
 </div>
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-2xs ${t.tag}`}>
 {card.tag}
 </span>
 </div>

 {/* Metric Label & Value */}
 <div>
 <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${t.title}`}>
 {card.label}
 </span>
 <strong className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums block leading-none ${t.val}`}>
 {card.value}
 </strong>
 <p className={`mt-1.5 text-xs font-medium leading-relaxed ${t.sub}`}>
 {card.subtitle}
 </p>
 </div>
 </div>

 {/* Click Affordance Footer */}
 <div className="flex items-center justify-between text-[10.5px] font-bold pt-3 mt-3 border-t border-emerald-200/80 dark:border-emerald-800/80">
 <span className="text-slate-500 dark:text-slate-400">
 {card.footer}
 </span>
 <span className={`inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform ${t.cta}`}>
 Buka <ChevronRight className="h-3.5 w-3.5" />
 </span>
 </div>
 </motion.article>
 )
 })}
 </div>

 {/* 3. TABS NAVIGASI UTAMA (HERO UI / APPTABS) */}
 <div className="mt-6">
 <AppTabs
 activeTab={activeTab}
 onChange={(key) => setActiveTab(String(key))}
 variant="pill"
 tabs={[
 {
 id: 'violations',
 label: 'Buku Pelanggaran & Catat Poin',
 icon: FileText,
 badge: pagination.total,
 },
 {
 id: 'rules',
 label: 'Katalog Master Tata Tertib',
 icon: BookOpen,
 badge: categories.length || 122,
 },
 {
 id: 'thresholds',
 label: 'Skala Ambang Batas (1 - 250 Poin)',
 icon: Scale,
 badge: '6 Tingkat',
 },
 ]}
 />
 </div>

 {/* TAB 1: BUKU PELANGGARAN & LEDGER TRANSAKSI */}
 {activeTab === 'violations' && (
 <div className="mt-4 space-y-4">
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Search & Action (Row 1) */}
 <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
 <div className="relative w-full sm:flex-1">
 <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400 z-10" />
 <UiInput
 type="text"
 placeholder="Cari santri, NIS, atau jenis pelanggaran..."
 value={searchInput}
 onChange={(e) => setSearchInput(e.target.value)}
 className="h-9 rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 pl-10 pr-8 text-xs sm:text-sm shadow-2xs"
 />
 {searchInput && (
 <button
 type="button"
 onClick={() => setSearchInput('')}
 aria-label="Hapus pencarian"
 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:border-emerald-800/60 dark:text-emerald-300 text-xs font-black shadow-2xs">
 <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
 Total {pagination.total || 0} Kasus
 </span>

 <PageToolbarActions
 primaryAction={{
 label: 'Catat Pelanggaran',
 onClick: () => setIsInputModalOpen(true),
 }}
 />
 </div>
 </div>

 {/* Structured Filter Bar HeroUI (Row 2) */}
 <div className="bg-white dark:bg-[#1B2433] dark:bg-[#151D2A] p-3 sm:p-4 border-b border-emerald-200/80 dark:border-emerald-800/80 flex flex-wrap items-center gap-2.5">
 <div className="w-full sm:w-56">
 <HeroUiFilterSelect
 disabled={!canSwitchUnit}
 value={selectedUnitId}
 onChange={(val) => {
 setSelectedUnitId(val || 'all')
 setPage(1)
 }}
 options={unitFilterOptions}
 placeholder="Semua Unit Pendidikan"
 icon={Building}
 searchable={true}
 size="sm"
 className="w-full"
 />
 </div>

 {/* Filter Turunan: Kelas / Rombel */}
 <div className="w-full sm:w-52">
 <HeroUiFilterSelect
 value={selectedClassId}
 onChange={(val) => {
 setSelectedClassId(val || 'all')
 setPage(1)
 }}
 options={classFilterOptions}
 placeholder={selectedUnitId === 'all' ? 'Semua Kelas (Pilih Unit)' : 'Semua Kelas di Unit Ini'}
 icon={School}
 searchable={true}
 disabled={selectedUnitId === 'all' && classesList.length === 0}
 size="sm"
 className="w-full"
 />
 </div>

 <div className="w-full sm:w-44">
 <HeroUiFilterSelect
 value={selectedCluster}
 onChange={(val) => {
 setSelectedCluster(val || 'all')
 setPage(1)
 }}
 options={[
 { value: 'all', label: 'Semua Kluster' },
 { value: 'peraturan_umum', label: 'A. Peraturan Umum' },
 { value: 'kelas_halaqoh', label: 'B. Kelas & Halaqoh' },
 { value: 'asrama', label: 'C. Peraturan Asrama' },
 { value: 'masjid', label: 'D. Peraturan di Masjid' },
 ]}
 placeholder="Semua Kluster"
 icon={Bookmark}
 size="sm"
 className="w-full"
 />
 </div>

 <div className="w-full sm:w-36">
 <HeroUiFilterSelect
 value={selectedLevel}
 onChange={(val) => {
 setSelectedLevel(val || 'all')
 setPage(1)
 }}
 options={[
 { value: 'all', label: 'Semua Tingkat' },
 { value: 'ringan', label: 'Tingkat Ringan' },
 { value: 'sedang', label: 'Tingkat Sedang' },
 { value: 'berat', label: 'Tingkat Berat' },
 ]}
 placeholder="Semua Tingkat"
 icon={ShieldAlert}
 size="sm"
 className="w-full"
 />
 </div>

 <div className="w-full sm:w-44">
 <HeroUiFilterSelect
 value={sortBy}
 onChange={(val) => {
 setSortBy(val || 'date_desc')
 setPage(1)
 }}
 options={[
 { value: 'date_desc', label: 'Terbaru (Waktu)' },
 { value: 'points_desc', label: 'Poin Tertinggi (Terberat)' },
 { value: 'points_asc', label: 'Poin Terendah (Teringan)' },
 { value: 'date_asc', label: 'Terlama (Waktu)' },
 ]}
 placeholder="Urutan Data"
 icon={ArrowUpDown}
 size="sm"
 className="w-full"
 />
 </div>

 {(selectedCluster !== 'all' || selectedLevel !== 'all' || selectedUnitId !== 'all' || selectedClassId !== 'all' || searchInput || sortBy !== 'date_desc') && (
 <SquircleActionButton
 variant="restore"
 icon={RotateCcw}
 label="Reset Filter"
 onClick={() => {
 setSearchInput('')
 setSelectedCluster('all')
 setSelectedLevel('all')
 setSelectedUnitId('all')
 setSelectedClassId('all')
 setSortBy('date_desc')
 }}
 />
 )}
 </div>

 {/* Table Body */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="p-3.5 sm:px-4">Tanggal & Waktu</th>
 <th className="p-3.5 sm:px-4">Santri / Siswa</th>
 <th className="p-3.5 sm:px-4">Kluster & Pelanggaran</th>
 <th className="p-3.5 sm:px-4 text-center">Poin</th>
 <th className="p-3.5 sm:px-4">Pencatat (Petugas)</th>
 <th className="p-3.5 sm:px-4">Tindakan Langsung</th>
 <th className="p-3.5 sm:px-4 text-right"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {loading ? (
 <tr>
 <td colSpan={5} className="py-12 text-center">
 <HeroSpinner color="primary" label="Memuat data pelanggaran santri..." />
 </td>
 </tr>
 ) : violations.length === 0 ? (
 <tr>
 <td colSpan={5} className="py-16 px-4 text-center">
 <div className="max-w-md mx-auto flex flex-col items-center">
 <div className="w-16 h-16 rounded-xl bg-white dark:bg-[#1B2433] flex items-center justify-center shadow-lg shadow-sm mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
 <ShieldCheck className="w-8 h-8 text-emerald-600" />
 </div>

 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-black mb-2 shadow-2xs">
 <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Status Disiplin: Kondusif & Tertib
 </span>

 <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
 Alhamdulillah, Belum Ada Catatan Pelanggaran
 </h4>

 <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
 Data kedisiplinan dan tata tertib santri berjalan dengan sangat baik pada filter terpilih.
 </p>

 <div className="mt-5 flex items-center gap-2">
 <HeroButton
 size="sm"
 color="primary"
 variant="solid"
 className="font-black bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-sm rounded-xl"
 startContent={<Plus className="w-4 h-4" />}
 onPress={() => setIsInputModalOpen(true)}
 >
 Catat Pelanggaran
 </HeroButton>

 {(selectedCluster !== 'all' || selectedLevel !== 'all' || selectedUnitId !== 'all' || searchInput || sortBy !== 'date_desc') && (
 <HeroButton
 size="sm"
 variant="flat"
 color="default"
 className="font-bold rounded-xl"
 startContent={<RotateCcw className="w-3.5 h-3.5" />}
 onPress={() => {
 setSearchInput('')
 setSelectedCluster('all')
 setSelectedLevel('all')
 setSelectedUnitId('all')
 setSortBy('date_desc')
 }}
 >
 Reset Filter
 </HeroButton>
 )}
 </div>
 </div>
 </td>
 </tr>
 ) : (
 violations.map((row) => (
 <tr key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition">
 <td className="p-3.5 sm:px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
 {row.transaction_date}
 <span className="block text-[10px] text-slate-500 font-normal">
 Lokasi: {row.incident_location || 'Kelas'}
 </span>
 </td>
 <td className="p-3.5 sm:px-4">
 <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
 <span>{row.student?.full_name || 'Santri'}</span>
 <HeroChip size="sm" variant="flat" color={row.student?.educationUnit?.program_type === 'boarding' ? 'warning' : 'default'} className="text-[10px] h-5">
 {row.student?.educationUnit?.program_type === 'boarding' ? 'Boarding' : 'Fullday'}
 </HeroChip>
 </div>
 <div className="text-xs text-slate-500">
 NIS: {row.student?.nis || '-'} | Kelas: {row.student?.kelas?.nama_kelas || '-'}
 </div>
 </td>
 <td className="p-3.5 sm:px-4 max-w-xs">
 <div className="flex items-center gap-1.5 mb-1">
 {getClusterBadge(row.category?.cluster)}
 {getLevelBadge(row.category?.level)}
 {row.category?.is_permanent && (
 <HeroChip size="sm" color="danger" variant="solid" className="text-[9px] h-4 font-black">
 PERMANENT
 </HeroChip>
 )}
 </div>
 <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{row.category?.name}</p>
 <p className="text-xs text-slate-500 line-clamp-1">{row.description}</p>
 </td>
 <td className="p-3.5 sm:px-4 text-center">
 <span className="inline-flex items-center px-2.5 py-1 rounded-xl font-black text-sm bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
 +{row.points}
 </span>
 </td>
 <td className="p-3.5 sm:px-4 whitespace-nowrap">
 <span className="font-bold text-slate-800 dark:text-slate-200 block">
 {row.reported_by?.name || row.reportedBy?.name || 'Petugas'}
 </span>
 <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
 {row.recorder_role || 'Petugas Lapangan'}
 </span>
 </td>
 <td className="p-3.5 sm:px-4 max-w-xs">
 <span className="text-slate-600 dark:text-slate-300 block line-clamp-2">
 {row.direct_consequence_notes || row.category?.direct_consequence || '-'}
 </span>
 </td>
 <td className="p-3.5 sm:px-4 text-right whitespace-nowrap">
 <HeroButton
 size="sm"
 color="primary"
 variant="flat"
 startContent={<Eye className="w-3.5 h-3.5" />}
 onPress={() => handleOpenSummary(row.student_id)}
 >
 Lembar Skor
 </HeroButton>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {pagination.total > 15 && (
 <div className="p-4 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
 <span>Total: {pagination.total} Pelanggaran</span>
 <div className="flex gap-2">
 <HeroButton
 size="sm"
 variant="bordered"
 disabled={pagination.current_page <= 1}
 onPress={() => fetchViolations(pagination.current_page - 1)}
 >
 Sebelumnya
 </HeroButton>
 <HeroButton
 size="sm"
 variant="bordered"
 disabled={pagination.current_page >= pagination.last_page}
 onPress={() => fetchViolations(pagination.current_page + 1)}
 >
 Selanjutnya
 </HeroButton>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {/* TAB 2: KATALOG MASTER TATA TERTIB */}
 {activeTab === 'rules' && (
 <div className="mt-4 space-y-4">
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Master */}
 <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto flex-1 max-w-2xl">
 <div className="relative w-full sm:flex-1">
 <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 z-10" />
 <UiInput
 type="text"
 placeholder="Cari pasal atau teks tata tertib..."
 value={masterSearch}
 onChange={(e) => setMasterSearch(e.target.value)}
 className="h-9 rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 pl-9 pr-8 text-xs"
 />
 </div>
 <HeroUiFilterSelect
 value={masterCluster}
 onChange={(val) => setMasterCluster(val || 'all')}
 options={[
 { value: 'all', label: 'Semua Kluster (A-D)' },
 { value: 'peraturan_umum', label: 'A. Peraturan Umum' },
 { value: 'kelas_halaqoh', label: 'B. Kelas & Halaqoh' },
 { value: 'asrama', label: 'C. Peraturan Asrama' },
 { value: 'masjid', label: 'D. Peraturan di Masjid' },
 ]}
 placeholder="Semua Kluster (A-D)"
 size="sm"
 className="w-full sm:w-52"
 />
 </div>

 {isAdmin && (
 <PageToolbarActions
 primaryAction={{
 label: 'Tambah Aturan Tata Tertib',
 onClick: () => {
 setEditingCategory(null)
 setCategoryForm({
 cluster: 'peraturan_umum',
 pasal_number: '1',
 rule_name: '',
 name: '',
 violation_detail: '',
 level: 'ringan',
 code: `VIO-${Date.now().toString().slice(-4)}`,
 point_weight: 10,
 direct_consequence: '',
 is_permanent: false,
 target_unit_type: 'all',
 })
 setIsCategoryModalOpen(true)
 },
 }}
 />
 )}
 </div>

 {/* Table Master Rules */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="p-3.5 sm:px-4">Kode & No</th>
 <th className="p-3.5 sm:px-4">Peraturan Induk</th>
 <th className="p-3.5 sm:px-4">Pelanggaran & Rincian</th>
 <th className="p-3.5 sm:px-4 text-center">Poin</th>
 <th className="p-3.5 sm:px-4">Kategori</th>
 <th className="p-3.5 sm:px-4">Konsekuensi Langsung</th>
 <th className="p-3.5 sm:px-4 text-center">Status</th>
 {isAdmin && <th className="p-3.5 sm:px-4 text-right"></th>}
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {categoriesLoading ? (
 <tr>
 <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center">
 <HeroSpinner color="primary" label="Memuat katalog master tata tertib..." />
 </td>
 </tr>
 ) : (
 categories.map((cat) => (
 <tr key={cat.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition">
 <td className="p-3.5 sm:px-4 whitespace-nowrap font-mono font-bold text-slate-700 dark:text-slate-300">
 {cat.code}
 <span className="block text-[10px] text-slate-500 font-sans font-normal">
 No. {cat.pasal_number || '-'}
 </span>
 </td>
 <td className="p-3.5 sm:px-4 max-w-xs">
 <span className="font-bold text-emerald-900 dark:text-emerald-300 block line-clamp-2">
 {cat.rule_name || '-'}
 </span>
 <span className="text-[10px] text-slate-500 uppercase">{cat.cluster?.replace('_', ' ')}</span>
 </td>
 <td className="p-3.5 sm:px-4 max-w-sm">
 <p className="font-bold text-slate-900 dark:text-white">{cat.name}</p>
 {cat.violation_detail && (
 <p className="text-xs text-slate-500 mt-0.5 italic">Rincian: {cat.violation_detail}</p>
 )}
 </td>
 <td className="p-3.5 sm:px-4 text-center">
 <span className="px-2 py-0.5 rounded-lg font-black text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300">
 +{cat.point_weight}
 </span>
 </td>
 <td className="p-3.5 sm:px-4 whitespace-nowrap">{getLevelBadge(cat.level)}</td>
 <td className="p-3.5 sm:px-4 max-w-xs">
 <span className="text-slate-700 dark:text-slate-300 font-medium">
 {cat.direct_consequence || '-'}
 </span>
 </td>
 <td className="p-3.5 sm:px-4 text-center whitespace-nowrap">
 {cat.is_permanent ? (
 <HeroChip size="sm" color="danger" variant="solid" className="text-[10px] font-black h-5">
 PERMANENT
 </HeroChip>
 ) : (
 <span className="text-slate-400 text-xs">-</span>
 )}
 </td>
 {isAdmin && (
 <td className="p-3.5 sm:px-4 text-right whitespace-nowrap">
 <div className="flex items-center justify-end gap-1">
 <HeroButton
 isIconOnly
 size="sm"
 variant="light"
 color="warning"
 onPress={() => {
 setEditingCategory(cat)
 setCategoryForm({
 cluster: cat.cluster || 'peraturan_umum',
 pasal_number: cat.pasal_number || '1',
 rule_name: cat.rule_name || '',
 name: cat.name || '',
 violation_detail: cat.violation_detail || '',
 level: cat.level || 'ringan',
 code: cat.code || '',
 point_weight: cat.point_weight || 10,
 direct_consequence: cat.direct_consequence || '',
 is_permanent: Boolean(cat.is_permanent),
 target_unit_type: cat.target_unit_type || 'all',
 })
 setIsCategoryModalOpen(true)
 }}
 >
 <Pencil className="w-3.5 h-3.5" />
 </HeroButton>
 <HeroButton
 isIconOnly
 size="sm"
 variant="light"
 color="danger"
 onPress={() => {
 Swal.fire({
 title: 'Hapus Aturan?',
 text: `Hapus aturan ${cat.name}?`,
 icon: 'warning',
 showCancelButton: true,
 confirmButtonText: 'Ya, Hapus',
 }).then(async (res) => {
 if (res.isConfirmed) {
 await disciplineService.deleteCategory(cat.id)
 fetchCategories()
 }
 })
 }}
 >
 <Trash2 className="w-3.5 h-3.5" />
 </HeroButton>
 </div>
 </td>
 )}
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* TAB 3: SKALA AMBANG BATAS POIN (1 - 250 POIN) */}
 {activeTab === 'thresholds' && (
 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {thresholds.map((t) => (
 <Card
 key={t.id}
 className={`border-2 ${
 t.stage_order >= 5
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/30 dark:border-emerald-800/60 dark:bg-rose-950/20'
 : t.stage_order >= 3
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/30 dark:border-emerald-800/60 dark:bg-amber-950/20'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:border-emerald-800/60 dark:bg-emerald-950/20'
 }`}
 >
 <CardContent className="p-5 space-y-3">
 <div className="flex items-center justify-between">
 <HeroChip
 size="sm"
 color={t.stage_order >= 5 ? 'danger' : t.stage_order >= 3 ? 'warning' : 'success'}
 variant="shadow"
 className="font-black"
 >
 Tingkat {t.stage_order}: {t.min_points} - {t.max_points ? `${t.max_points} Poin` : '250+ Poin'}
 </HeroChip>
 {t.letter_type && (
 <HeroChip size="sm" color="danger" variant="flat" className="font-bold uppercase">
 {t.letter_type}
 </HeroChip>
 )}
 </div>

 <div>
 <h4 className="font-black text-sm text-slate-900 dark:text-white">{t.sanction_name}</h4>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">{t.sanction_details}</p>
 </div>

 {t.notes && (
 <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-slate-500">
 <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Keterangan:</span>
 {t.notes}
 </div>
 )}

 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between text-xs font-semibold text-slate-500">
 <span>Panggilan Ortu: {t.requires_parent_call ? 'Wajib' : 'Tidak'}</span>
 <span>Dikeluarkan: {t.is_expulsion ? 'Ya' : 'Tidak'}</span>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 )}

      {/* 4. MODAL INPUT PELANGGARAN KEDISIPLINAN */}
      <AppModal
        isOpen={isInputModalOpen}
        onClose={() => !savingViolation && setIsInputModalOpen(false)}
        title="Catat Pelanggaran Tata Tertib"
        badge="Buku Saku"
        description="Input poin kelakuan santri/siswa sesuai Buku Saku Peraturan Resmi"
        icon={ShieldAlert}
        maxWidth="max-w-3xl"
        disableBackdropClose={savingViolation}
        hideCloseButton={savingViolation}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsInputModalOpen(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              form="discipline-violation-form"
              disabled={savingViolation || !selectedStudent || !selectedCategory || (studentUnitContext && !studentUnitContext.isAuthorized)}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <span>{savingViolation ? 'Menyimpan...' : 'Simpan Catatan Poin'}</span>
            </button>
          </>
        }
      >
        <form id="discipline-violation-form" onSubmit={handleSubmitViolation} className="space-y-5 text-xs">
 {/* SEKSI 1: IDENTIFIKASI SANTRI / SISWA */}
 <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#059669] text-white text-[10px] font-black">1</span>
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
 Identifikasi Santri / Siswa yang Melanggar <span className="text-rose-500">*</span>
 </h4>
 </div>
 {!selectedStudent && (
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
 {studentsLoading ? 'Mencari...' : `${studentsList.length} santri tersedia`}
 </span>
 )}
 </div>

 {!selectedStudent ? (
 <div className="space-y-2.5">
 {/* Filter Bar Siswa: Unit Pendidikan (Boarding/Fullday otomatis mengikuti Unit) & Search Input */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 <HeroUiFilterSelect
 disabled={!canSwitchUnit}
 value={modalUnitFilter}
 onChange={(val) => setModalUnitFilter(val || 'all')}
 options={unitFilterOptions}
 placeholder="Pilih Unit Pendidikan..."
 icon={Building}
 searchable={true}
 size="sm"
 className="w-full"
 />

 {/* Search Input Santri */}
 <div className="relative w-full">
 <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 z-10" />
 <UiInput
 type="text"
 placeholder="Ketik nama lengkap, NIS, atau NISN santri..."
 value={studentSearchInput}
 onChange={(e) => setStudentSearchInput(e.target.value)}
 className="h-9 rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-9 text-xs"
 />
 </div>
 </div>

 {/* Hasil Daftar Siswa / Santri */}
 {studentsLoading ? (
 <div className="py-8 flex flex-col items-center justify-center gap-2">
 <HeroSpinner color="primary" size="sm" />
 <span className="text-xs text-slate-500">Memuat data santri...</span>
 </div>
 ) : studentsList.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
 {studentsList.map((st) => (
 <button
 key={st.id}
 type="button"
 onClick={() => {
 setSelectedStudent(st)
 setViolationForm((prev) => ({ ...prev, student_id: st.id }))
 setStudentSearchInput(st.name)
 }}
 className="w-full text-left p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white hover:bg-emerald-50/70 dark:bg-slate-800/80 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700/80 transition shadow-2xs group flex items-center justify-between gap-2.5 cursor-pointer"
 >
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 font-black flex items-center justify-center shrink-0 shadow-xs text-xs">
 {(st.name || 'S').charAt(0).toUpperCase()}
 </div>
 <div className="min-w-0">
 <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
 {st.name}
 </h5>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
 NIS: {st.nis} • {st.kelas_name}
 </p>
 </div>
 </div>
 <div className="flex flex-col items-end gap-0.5 shrink-0">
 <HeroChip
 size="sm"
 variant="flat"
 color={st.is_boarding ? 'warning' : 'success'}
 className="text-[9px] h-4 font-bold"
 >
 {st.is_boarding ? 'Boarding' : 'Fullday'}
 </HeroChip>
 <span className="text-[9px] font-bold text-slate-400">
 Poin: <span className={st.total_points > 0 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>{st.total_points}</span>
 </span>
 </div>
 </button>
 ))}
 </div>
 ) : (
 <div className="py-6 text-center text-slate-400 text-xs">
 Tidak ditemukan santri yang sesuai dengan kriteria filter.
 </div>
 )}
 </div>
 ) : (
 /* KARTU SANTRI TERPILIH (HERO UI CARD) */
 <div className="p-3.5 rounded-xl bg-white dark:bg-[#1B2433] dark:from-emerald-950/60 dark:via-slate-900 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="relative">
 <div className="w-11 h-9 rounded-xl bg-white dark:bg-[#1B2433] font-black flex items-center justify-center text-base shadow-md border border-emerald-200/80 dark:border-emerald-800/60">
 {(selectedStudent.name || 'S').charAt(0).toUpperCase()}
 </div>
 <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-emerald-200/80 dark:border-slate-900" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-black text-slate-900 dark:text-white">
 {selectedStudent.name}
 </h4>
 <HeroChip size="sm" variant="solid" color={studentUnitContext?.isBoarding ? 'warning' : 'primary'} className="text-[10px] h-4 font-extrabold">
 {studentUnitContext?.isBoarding ? 'Santri Boarding' : 'Siswa Fullday'}
 </HeroChip>
 </div>
 <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
 {studentUnitContext?.unitName} • Kelas: {selectedStudent.kelas_name} • NIS: {selectedStudent.nis}
 </p>
 <div className="flex items-center gap-2 mt-0.5">
 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
 Akumulasi: <span className="text-rose-600 font-black">{selectedStudent.total_points || 0} Poin</span>
 </span>
 <span className="text-slate-300">•</span>
 <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400">
 {selectedStudent.risk_status}
 </span>
 </div>
 </div>
 </div>
 <HeroButton
 size="sm"
 variant="bordered"
 color="danger"
 onPress={() => {
 setSelectedStudent(null)
 setViolationForm((prev) => ({ ...prev, student_id: '' }))
 setStudentSearchInput('')
 }}
 className="font-bold shrink-0 rounded-xl"
 >
 Ganti Santri
 </HeroButton>
 </div>
 )}

 {/* STATUS VERIFIKASI WEWENANG INPUT */}
 {studentUnitContext && (
 <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
 studentUnitContext.isAuthorized
 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60'
 }`}>
 {studentUnitContext.isAuthorized ? (
 <>
 <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>Wewenang Terverifikasi: Diizinkan mencatat poin kelakuan pada {studentUnitContext.unitName}.</span>
 </>
 ) : (
 <>
 <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
 <span>{studentUnitContext.reason}</span>
 </>
 )}
 </div>
 )}
 </div>

 {/* SEKSI 2: PILIH ATURAN & PASAL BUKU SAKU */}
 <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
 <div className="flex items-center gap-2">
 <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#059669] text-white text-[10px] font-black">2</span>
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
 Pilih Butir Pelanggaran Buku Saku Resmi <span className="text-rose-500">*</span>
 </h4>
 </div>

 {/* Filter Kluster & Search Kata Kunci */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 <HeroUiFilterSelect
 value={modalCategoryCluster}
 onChange={(val) => setModalCategoryCluster(val || 'all')}
 options={[
 { value: 'all', label: 'Semua Kluster (122 Pasal)', badge: '122' },
 { value: 'peraturan_umum', label: 'A. Peraturan Umum', badge: 'Kluster A' },
 { value: 'kelas_halaqoh', label: 'B. Kelas & Halaqoh', badge: 'Kluster B' },
 { value: 'asrama', label: 'C. Peraturan Asrama', badge: 'Kluster C' },
 { value: 'masjid', label: 'D. Peraturan di Masjid', badge: 'Kluster D' },
 ]}
 placeholder="Pilih Kluster Tata Tertib"
 icon={Scale}
 size="sm"
 className="w-full"
 />

 <div className="relative w-full">
 <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 z-10" />
 <UiInput
 type="text"
 placeholder="Cari kata kunci pasal / pelanggaran..."
 value={modalCategorySearch}
 onChange={(e) => setModalCategorySearch(e.target.value)}
 className="h-9 rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-9 text-xs"
 />
 </div>
 </div>

 {/* Dropdown Aturan Pelanggaran HeroUI */}
 <div>
 <HeroUiFilterSelect
 id="modal-select-category"
 value={selectedCategory?.id ? String(selectedCategory.id) : ''}
 onChange={(val) => {
 const cat = categories.find((c) => String(c.id) === String(val))
 setSelectedCategory(cat || null)
 if (cat) {
 setViolationForm((prev) => ({
 ...prev,
 category_id: cat.id,
 points: cat.point_weight,
 direct_consequence_notes: cat.direct_consequence || '',
 }))
 } else {
 setViolationForm((prev) => ({
 ...prev,
 category_id: '',
 points: 0,
 direct_consequence_notes: '',
 }))
 }
 }}
 options={modalCategoryOptions}
 placeholder={`-- Pilih Butir Pelanggaran (${filteredModalCategories.length} pasal tersedia) --`}
 icon={BookOpen}
 searchable={true}
 allowClear={true}
 size="md"
 className="w-full"
 />
 </div>

 {/* KARTU PREVIEW PASAL TERPILIH */}
 {selectedCategory && (
 <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 text-xs">
 <div className="flex items-center justify-between flex-wrap gap-2">
 <span className="font-extrabold text-amber-950 dark:text-amber-200 text-sm">
 Pasal {selectedCategory.pasal_number}: {selectedCategory.rule_name || selectedCategory.name}
 </span>
 <div className="flex items-center gap-1.5">
 <HeroChip size="sm" color="danger" variant="solid" className="font-black text-[10px] h-5">
 +{selectedCategory.point_weight} Poin
 </HeroChip>
 {getLevelBadge(selectedCategory.level)}
 {selectedCategory.is_permanent && (
 <HeroChip size="sm" color="danger" variant="solid" className="text-[10px] font-black h-5">
 PERMANEN
 </HeroChip>
 )}
 </div>
 </div>

 {selectedCategory.violation_detail && (
 <p className="text-xs text-amber-900 dark:text-amber-300">
 <span className="font-bold">Deskripsi:</span> {selectedCategory.violation_detail}
 </p>
 )}

 {selectedCategory.direct_consequence && (
 <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
 <span className="font-bold text-rose-700 dark:text-rose-400 block">
 Sanksi Langsung Buku Saku:
 </span>
 <span className="text-slate-800 dark:text-slate-200 font-medium">
 {selectedCategory.direct_consequence}
 </span>
 </div>
 )}
 </div>
 )}
 </div>

 {/* SEKSI 3: DETAIL WAKTU, LOKASI & KRONOLOGI */}
 <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
 <div className="flex items-center gap-2">
 <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#059669] text-white text-[10px] font-black">3</span>
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
 Waktu, Lokasi & Kronologi Insiden
 </h4>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal Kejadian
 </label>
 <UiInput
 type="date"
 useNative
 size="sm"
 value={violationForm.transaction_date}
 onChange={(e) => setViolationForm({ ...violationForm, transaction_date: e.target.value })}
 className="w-full text-xs font-semibold rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Lokasi Kejadian
 </label>
 <HeroUiFilterSelect
 value={violationForm.incident_location}
 onChange={(val) => setViolationForm((prev) => ({ ...prev, incident_location: val || 'kelas' }))}
 options={[
 { value: 'kelas', label: 'Ruang Kelas / Halaqoh' },
 { value: 'asrama', label: 'Gedung / Kamar Asrama' },
 { value: 'masjid', label: 'Masjid Pondok' },
 { value: 'lingkungan_pondok', label: 'Lingkungan Sekolah / Pondok' },
 { value: 'luar_pondok', label: 'Luar Area Pondok' },
 ]}
 placeholder="Pilih Lokasi Kejadian"
 size="sm"
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Poin Pelanggaran
 </label>
 <UiInput
 type="number"
 size="sm"
 value={violationForm.points}
 onChange={(e) => setViolationForm({ ...violationForm, points: e.target.value })}
 className="w-full text-xs font-black text-rose-600 rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Kronologi / Keterangan Kejadian <span className="text-rose-500">*</span>
 </label>
 <UiTextArea
 rows={2}
 placeholder="Jelaskan kronologi singkat, waktu kejadian, saksi, atau pembinaan yang telah dilakukan..."
 value={violationForm.description}
 onChange={(e) => setViolationForm({ ...violationForm, description: e.target.value })}
 className="w-full text-xs font-medium rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 required
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tindak Lanjut / Konsekuensi yang Telah Diberikan Langsung
 </label>
 <UiInput
 type="text"
 size="sm"
 placeholder="Contoh: Barang disita ke kantor, berdiri membaca istighfar 15 menit, dll"
 value={violationForm.direct_consequence_notes}
 onChange={(e) => setViolationForm({ ...violationForm, direct_consequence_notes: e.target.value })}
 className="w-full text-xs font-medium rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>
 </div>

        </form>
      </AppModal>

      {/* 5. MODAL LEMBAR SKOR SANTRI */}
      <AppModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        title="Lembar Skor Kedisiplinan & Buku Saku Santri"
        badge="Rekapitulasi"
        description="Rekapitulasi berjalan dan status sanksi resmi"
        icon={Scale}
        maxWidth="max-w-3xl"
        bodyClassName="space-y-5 text-xs"
        footer={
          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={() => setIsSummaryModalOpen(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Tutup</span>
            </button>
          </div>
        }
      >
 {summaryLoading ? (
 <div className="py-12 text-center">
 <HeroSpinner color="primary" label="Memuat lembar skor santri..." />
 </div>
 ) : summaryData ? (
 <>
 {/* Profil Santri */}
 <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
 <div>
 <h4 className="font-black text-base text-slate-900 dark:text-white">
 {summaryData.student?.full_name}
 </h4>
 <p className="text-slate-500 mt-0.5">
 NIS: {summaryData.student?.nis} | Unit: {summaryData.student?.educationUnit?.name} | Kelas: {summaryData.student?.kelas?.nama_kelas || '-'}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <HeroChip size="sm" color={summaryData.student?.educationUnit?.program_type === 'boarding' ? 'warning' : 'default'} variant="flat">
 {summaryData.student?.educationUnit?.program_type === 'boarding' ? 'Boarding' : 'Fullday'}
 </HeroChip>
 </div>
 </div>

 {/* SPEEDOMETER / RISK PROGRESS BAR (0 - 250 POIN) */}
 <div className="p-5 rounded-xl bg-white dark:bg-[#1B2433] space-y-3 shadow-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center justify-between">
 <div>
 <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
 Akumulasi Poin Pelanggaran
 </span>
 <div className="flex items-baseline gap-2 mt-1">
 <span className="text-3xl font-black text-rose-400">
 {summaryData.cumulative_points}
 </span>
 <span className="text-xs text-slate-400 font-semibold">/ 250 Poin Maksimal</span>
 </div>
 </div>

 <div className="text-right">
 <HeroChip
 size="md"
 color={
 summaryData.cumulative_points >= 200
 ? 'danger'
 : summaryData.cumulative_points >= 100
 ? 'warning'
 : 'success'
 }
 variant="shadow"
 className="font-black"
 >
 {summaryData.current_stage?.sanction_name || 'Status Aman'}
 </HeroChip>
 </div>
 </div>

 {/* Bar Visual Progress */}
 <div className="w-full h-3.5 rounded-full bg-slate-700/80 overflow-hidden relative">
 <div
 className={`h-full transition-all duration-500 rounded-full ${
 summaryData.cumulative_points >= 200
 ? 'bg-white dark:bg-[#1B2433]'
 : summaryData.cumulative_points >= 100
 ? 'bg-white dark:bg-[#1B2433]'
 : 'bg-white dark:bg-[#1B2433]'
 }`}
 style={{ width: `${Math.min(100, (summaryData.cumulative_points / 250) * 100)}%` }}
 />
 </div>

 <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-1 border-t border-emerald-700/80/60">
 <span>1 Poin (Ringan)</span>
 <span>31 Poin (Sedang)</span>
 <span>100 Poin (ST)</span>
 <span>150 Poin (SP1)</span>
 <span>200 Poin (SP2)</span>
 <span className="text-rose-400">250 Poin (Keluar)</span>
 </div>
 </div>

 {/* Breakdown 4 Kluster */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
 <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-500 text-[10px] font-bold block">A. Umum</span>
 <span className="text-base font-black text-blue-700 dark:text-blue-300">
 {summaryData.breakdown_by_cluster?.peraturan_umum || 0} Poin
 </span>
 </div>
 <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-500 text-[10px] font-bold block">B. Kelas & Halaqoh</span>
 <span className="text-base font-black text-purple-700 dark:text-purple-300">
 {summaryData.breakdown_by_cluster?.kelas_halaqoh || 0} Poin
 </span>
 </div>
 <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-500 text-[10px] font-bold block">C. Asrama</span>
 <span className="text-base font-black text-amber-700 dark:text-amber-300">
 {summaryData.breakdown_by_cluster?.asrama || 0} Poin
 </span>
 </div>
 <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-500 text-[10px] font-bold block">D. Masjid</span>
 <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
 {summaryData.breakdown_by_cluster?.masjid || 0} Poin
 </span>
 </div>
 </div>

 {/* Surat Peringatan Section */}
 <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
 <div className="flex items-center justify-between">
 <h5 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
 <FileText className="w-4 h-4 text-emerald-600" />
 Surat Peringatan & Teguran Diterbitkan
 </h5>
 {(isAdmin || isWakaKesantrian || isKepsek || isDivisi) && (
 <HeroButton
 size="sm"
 color="danger"
 variant="flat"
 startContent={<Send className="w-3.5 h-3.5" />}
 onPress={() => handleOpenLetterModal(summaryData.student, 'st')}
 >
 Terbitkan Surat Peringatan
 </HeroButton>
 )}
 </div>

 {(!summaryData.warning_letters || summaryData.warning_letters.length === 0) ? (
 <p className="text-xs text-slate-500 py-2">Belum ada surat peringatan yang diterbitkan untuk santri ini.</p>
 ) : (
 <div className="space-y-2">
 {(summaryData.warning_letters || []).map((letRow) => (
 <div
 key={letRow.id}
 className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs"
 >
 <div>
 <span className="font-bold text-slate-900 dark:text-white block">
 No: {letRow.letter_number} ({letRow.letter_type.toUpperCase()})
 </span>
 <span className="text-xs text-slate-500">
 Diterbitkan: {letRow.issue_date} | Akumulasi: {letRow.cumulative_points} Poin
 </span>
 </div>
 <HeroChip size="sm" color={letRow.parent_summon_status === 'hadir' ? 'success' : 'warning'} variant="flat">
 {letRow.parent_summon_status?.replace('_', ' ')}
 </HeroChip>
 </div>
 ))}
 </div>
 )}
 </div>
 </>
 ) : null}
      </AppModal>

      {/* 6. MODAL TERBITKAN SURAT PERINGATAN */}
      <AppModal
        isOpen={isLetterModalOpen}
        onClose={() => !savingLetter && setIsLetterModalOpen(false)}
        title="Penerbitan Surat Peringatan / Teguran Resmi"
        badge="Surat Peringatan"
        description="Terbitkan ST, SP1, SP2, atau surat pengembalian resmi santri"
        icon={AlertTriangle}
        variant="danger"
        maxWidth="max-w-lg"
        disableBackdropClose={savingLetter}
        hideCloseButton={savingLetter}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsLetterModalOpen(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              form="discipline-letter-form"
              disabled={savingLetter}
              className="h-9.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-rose-600 shadow-md shadow-rose-600/20 disabled:opacity-50"
            >
              <span>{savingLetter ? 'Menerbitkan...' : 'Terbitkan Surat'}</span>
            </button>
          </>
        }
      >
        <form id="discipline-letter-form" onSubmit={handleSubmitLetter} className="space-y-3 text-xs">
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Jenis Surat Peringatan <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 value={letterForm.letter_type}
 onChange={(val) => setLetterForm((prev) => ({ ...prev, letter_type: val || 'st' }))}
 options={[
 { value: 'st', label: 'Surat Teguran (ST) - Ambang 100 Poin', badge: '100 Poin' },
 { value: 'sp1', label: 'Surat Peringatan Pertama (SP1) - Ambang 150 Poin', badge: '150 Poin' },
 { value: 'sp2', label: 'Surat Peringatan Kedua (SP2) - Ambang 200 Poin', badge: '200 Poin' },
 { value: 'keluar', label: 'Surat Pengembalian ke Orang Tua (Dikeluarkan) - 250 Poin', badge: '250 Poin' },
 ]}
 placeholder="Pilih Jenis Surat Peringatan"
 size="sm"
 className="w-full"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Nomor Surat (Biarkan kosong untuk penomoran otomatis)
 </label>
 <UiInput
 type="text"
 size="sm"
 placeholder="Contoh: ST/PONDOK/XI/2026/001"
 value={letterForm.letter_number}
 onChange={(e) => setLetterForm({ ...letterForm, letter_number: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Jadwal Pemanggilan Orang Tua / Wali
 </label>
 <UiInput
 type="datetime-local"
 useNative
 size="sm"
 value={letterForm.parent_summon_date}
 onChange={(e) => setLetterForm({ ...letterForm, parent_summon_date: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Catatan Pembinaan / Isi Surat
 </label>
 <UiTextArea
 rows={3}
 placeholder="Catatan tambahan untuk dicantumkan dalam surat peringatan..."
 value={letterForm.notes}
 onChange={(e) => setLetterForm({ ...letterForm, notes: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>

        </form>
      </AppModal>

      {/* 7. MODAL MASTER ATURAN TATA TERTIB (CRUD ADMIN) */}
      {isAdmin && (
        <AppModal
          isOpen={isCategoryModalOpen}
          onClose={() => !savingCategory && setIsCategoryModalOpen(false)}
          title={editingCategory ? 'Edit Aturan Tata Tertib' : 'Tambah Aturan Tata Tertib Baru'}
          badge={editingCategory ? 'Perbarui' : 'Aturan Baru'}
          description="Kelola pasal pelanggaran, kluster, bobot poin, dan konsekuensi"
          icon={ShieldAlert}
          maxWidth="max-w-2xl"
          disableBackdropClose={savingCategory}
          hideCloseButton={savingCategory}
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                <X className="size-4" strokeWidth={2} />
                <span>Batal</span>
              </button>
              <button
                type="submit"
                form="discipline-category-form"
                disabled={savingCategory}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <span>{savingCategory ? 'Menyimpan...' : 'Simpan Aturan'}</span>
              </button>
            </>
          }
        >
          <form
            id="discipline-category-form"
 onSubmit={async (e) => {
 e.preventDefault()
 try {
 setSavingCategory(true)
 if (editingCategory) {
 await disciplineService.updateCategory(editingCategory.id, categoryForm)
 Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Aturan tata tertib diperbarui.' })
 } else {
 await disciplineService.createCategory(categoryForm)
 Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Aturan tata tertib ditambahkan.' })
 }
 setIsCategoryModalOpen(false)
 fetchCategories()
 } catch (err) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: err?.response?.data?.message || 'Terjadi kesalahan.' })
 } finally {
 setSavingCategory(false)
 }
 }}
            className="space-y-3 text-xs"
          >
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kluster</label>
 <HeroUiFilterSelect
 value={categoryForm.cluster}
 onChange={(val) => setCategoryForm((prev) => ({ ...prev, cluster: val || 'peraturan_umum' }))}
 options={[
 { value: 'peraturan_umum', label: 'A. Peraturan Umum' },
 { value: 'kelas_halaqoh', label: 'B. Kelas & Halaqoh' },
 { value: 'asrama', label: 'C. Peraturan Asrama' },
 { value: 'masjid', label: 'D. Peraturan di Masjid' },
 ]}
 placeholder="Pilih Kluster"
 size="sm"
 className="w-full"
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor / Pasal</label>
 <UiInput
 type="text"
 size="sm"
 value={categoryForm.pasal_number}
 onChange={(e) => setCategoryForm({ ...categoryForm, pasal_number: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Peraturan Induk (Bab/Pasal)
 </label>
 <UiInput
 type="text"
 size="sm"
 placeholder="Contoh: Santri wajib menjalankan ibadah sesuai syariat islam"
 value={categoryForm.rule_name}
 onChange={(e) => setCategoryForm({ ...categoryForm, rule_name: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 required
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Nama Pelanggaran
 </label>
 <UiInput
 type="text"
 size="sm"
 placeholder="Contoh: Meninggalkan shalat 5 waktu"
 value={categoryForm.name}
 onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 required
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Rincian Spesifik Kasus (Opsional)
 </label>
 <UiInput
 type="text"
 size="sm"
 placeholder="Contoh: Melukai dengan sengaja"
 value={categoryForm.violation_detail}
 onChange={(e) => setCategoryForm({ ...categoryForm, violation_detail: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Unik</label>
 <UiInput
 type="text"
 size="sm"
 value={categoryForm.code}
 onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800 font-mono font-bold"
 required
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bobot Poin</label>
 <UiInput
 type="number"
 size="sm"
 value={categoryForm.point_weight}
 onChange={(e) => setCategoryForm({ ...categoryForm, point_weight: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800 font-black text-rose-600"
 required
 />
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
 <HeroUiFilterSelect
 value={categoryForm.level}
 onChange={(val) => setCategoryForm((prev) => ({ ...prev, level: val || 'ringan' }))}
 options={[
 { value: 'ringan', label: 'Ringan' },
 { value: 'sedang', label: 'Sedang' },
 { value: 'berat', label: 'Berat' },
 ]}
 placeholder="Pilih Kategori"
 size="sm"
 className="w-full"
 />
 </div>
 </div>

 <div>
 <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
 Konsekuensi Langsung (Opsional)
 </label>
 <UiInput
 type="text"
 size="sm"
 placeholder="Contoh: Pakaian disita dan tidak dikembalikan, Diberdirikan, dll"
 value={categoryForm.direct_consequence}
 onChange={(e) => setCategoryForm({ ...categoryForm, direct_consequence: e.target.value })}
 className="w-full rounded-xl border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-800"
 />
 </div>

 <div className="flex items-center gap-2 pt-2">
 <input
 type="checkbox"
 id="is_permanent_check"
 checked={categoryForm.is_permanent}
 onChange={(e) => setCategoryForm({ ...categoryForm, is_permanent: e.target.checked })}
 className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
 />
 <label htmlFor="is_permanent_check" className="text-xs font-bold text-rose-700 dark:text-rose-400">
 Poin Pelanggaran Bersifat PERMANENT (Tidak dapat diputihkan)
 </label>
 </div>

          </form>
        </AppModal>
 )}
 </PageContainer>
 )
}
