import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
 Award,
 Search,
 Plus,
 Trash2,
 Edit3,
 Printer,
 CheckCircle2,
 Clock,
 Sparkles,
 ShieldCheck,
 Building2,
 Filter,
 FileText,
 QrCode as QrIcon,
 RefreshCw,
 HelpCircle,
 User,
 GraduationCap,
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { TextArea } from '../ui/text-area'
import { Modal } from '../ui/modal'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/table'
import { QRCodeSVG } from 'qrcode.react'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { divisiPendidikanWorkspaceService } from '../../services/divisiPendidikanWorkspaceService'
import Swal from 'sweetalert2'

export default function MunaqasyahTahfizhSection({ onDataMutate }) {
 const [items, setItems] = useState([])
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [search, setSearch] = useState('')
 const [filterUnit, setFilterUnit] = useState('all')
 const [filterJuz, setFilterJuz] = useState('all')
 const [filterStatus, setFilterStatus] = useState('all')

 // Relational options loaded directly from PostgreSQL
 const [units, setUnits] = useState([])
 const [students, setStudents] = useState([])
 const [examiners, setExaminers] = useState([])

 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isCertificateOpen, setIsCertificateOpen] = useState(false)
 const [certItem, setCertItem] = useState(null)

 const [formData, setFormData] = useState({
 id: null,
 student_id: '',
 nama_siswa: '',
 nis: '',
 education_unit_id: '',
 unit_name: '',
 kelas: '',
 juz_diuji: 'Juz 30 (Sekali Duduk)',
 tanggal_ujian: new Date().toISOString().split('T')[0],
 penguji_employee_id: '',
 penguji: '',
 nilai_tajwid: 0,
 nilai_fashahah: 0,
 nilai_kelancaran: 0,
 status: 'terjadwal',
 catatan_dewan_penguji: '',
 })

 const loadData = async () => {
 setLoading(true)
 try {
 const [list, optionsData] = await Promise.all([
 divisiPendidikanWorkspaceService.getMunaqasyahList(),
 divisiPendidikanWorkspaceService.getMunaqasyahOptions(),
 ])
 setItems(Array.isArray(list) ? list : [])
 setUnits(optionsData?.units || [])
 setStudents(optionsData?.students || [])
 setExaminers(optionsData?.examiners || [])
 } catch (e) {
 console.error('Gagal memuat data munaqasyah:', e)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadData()
 }, [])

 // Filtered students by selected unit in modal form
 const availableStudentsForForm = useMemo(() => {
 if (!formData.education_unit_id) return students
 return students.filter((s) => s.unit_id === formData.education_unit_id)
 }, [students, formData.education_unit_id])

 // Filtered examiners by selected unit in modal form
 const availableExaminersForForm = useMemo(() => {
 if (!formData.education_unit_id) return examiners
 const unitExaminers = examiners.filter((e) => e.unit_id === formData.education_unit_id)
 return unitExaminers.length > 0 ? unitExaminers : examiners
 }, [examiners, formData.education_unit_id])

 const filteredItems = useMemo(() => {
 return items.filter((item) => {
 if (filterUnit !== 'all' && item.unit_id !== filterUnit && item.unit_name !== filterUnit) {
 return false
 }
 if (filterJuz !== 'all' && !item.juz_diuji.includes(filterJuz)) {
 return false
 }
 if (filterStatus !== 'all' && item.status !== filterStatus) {
 return false
 }
 if (search.trim()) {
 const q = search.toLowerCase()
 const text = `${item.nama_siswa || ''} ${item.nis || ''} ${item.unit_name || ''} ${item.penguji || ''} ${item.juz_diuji || ''} ${item.nomor_syahadah || ''}`.toLowerCase()
 if (!text.includes(q)) return false
 }
 return true
 })
 }, [items, filterUnit, filterJuz, filterStatus, search])

 // Statistics KPI
 const stats = useMemo(() => {
 const total = items.length
 const lulus = items.filter((i) => i.status === 'lulus').length
 const terjadwal = items.filter((i) => i.status === 'terjadwal').length
 const mengulang = items.filter((i) => i.status === 'mengulang').length
 const mumtaz = items.filter((i) => (i.predikat || '').toLowerCase().includes('mumtaz')).length

 return { total, lulus, terjadwal, mengulang, mumtaz }
 }, [items])

 const handleOpenAdd = () => {
 const defaultUnit = units[0]
 setFormData({
 id: null,
 student_id: '',
 nama_siswa: '',
 nis: '',
 education_unit_id: defaultUnit?.id || '',
 unit_name: defaultUnit?.name || '',
 kelas: '',
 juz_diuji: 'Juz 30 (Sekali Duduk)',
 tanggal_ujian: new Date().toISOString().split('T')[0],
 penguji_employee_id: examiners[0]?.id || '',
 penguji: examiners[0]?.name || 'Dewan Penguji Divisi Tahfizh',
 nilai_tajwid: 0,
 nilai_fashahah: 0,
 nilai_kelancaran: 0,
 status: 'terjadwal',
 catatan_dewan_penguji: '',
 })
 setIsModalOpen(true)
 }

 const handleOpenEdit = (item) => {
 setFormData({
 id: item.id,
 student_id: item.student_id || '',
 nama_siswa: item.nama_siswa || '',
 nis: item.nis || '',
 education_unit_id: item.unit_id || '',
 unit_name: item.unit_name || '',
 kelas: item.kelas || '',
 juz_diuji: item.juz_diuji || 'Juz 30 (Sekali Duduk)',
 tanggal_ujian: item.tanggal_ujian || new Date().toISOString().split('T')[0],
 penguji_employee_id: item.penguji_employee_id || '',
 penguji: item.penguji || '',
 nilai_tajwid: item.nilai_tajwid || 0,
 nilai_fashahah: item.nilai_fashahah || 0,
 nilai_kelancaran: item.nilai_kelancaran || 0,
 status: item.status || 'terjadwal',
 catatan_dewan_penguji: item.catatan_dewan_penguji || '',
 })
 setIsModalOpen(true)
 }

 const handleSelectStudent = (studentId) => {
 const selStudent = students.find((s) => s.id === studentId)
 if (selStudent) {
 setFormData((prev) => ({
 ...prev,
 student_id: selStudent.id,
 nama_siswa: selStudent.name,
 nis: selStudent.nis,
 education_unit_id: selStudent.unit_id || prev.education_unit_id,
 unit_name: selStudent.unit_name || prev.unit_name,
 kelas: selStudent.kelas !== '-' ? selStudent.kelas : prev.kelas,
 }))
 }
 }

 const handleOpenCert = (item) => {
 setCertItem(item)
 setIsCertificateOpen(true)
 }

 const handleSave = async () => {
 if (!formData.nama_siswa.trim()) {
 Swal.fire({ icon: 'warning', title: 'Santri Wajib Dipilih', text: 'Mohon pilih Santri / Siswa atau isi nama santri.' })
 return
 }
 if (!formData.education_unit_id) {
 Swal.fire({ icon: 'warning', title: 'Unit Wajib Dipilih', text: 'Mohon pilih Asal Unit Sekolah.' })
 return
 }

 setSaving(true)
 try {
 await divisiPendidikanWorkspaceService.saveMunaqasyah(formData)
 setIsModalOpen(false)
 await loadData()
 onDataMutate?.()
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: e.response?.data?.message || 'Gagal menyimpan data munaqasyah. Silakan coba lagi.' })
 } finally {
 setSaving(false)
 }
 }

 const handleDelete = async (id) => {
 const res = await Swal.fire({
 title: 'Hapus Arsip Munaqasyah?',
 text: 'Hapus arsip munaqasyah ini secara permanen dari database?',
 icon: 'warning',
 showCancelButton: true,
 confirmButtonText: 'Ya, Hapus',
 cancelButtonText: 'Batal',
 confirmButtonColor: '#e11d48',
 })
 if (res.isConfirmed) {
 try {
 await divisiPendidikanWorkspaceService.deleteMunaqasyah(id)
 await loadData()
 onDataMutate?.()
 Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Arsip munaqasyah berhasil dihapus.', timer: 1500, showConfirmButton: false })
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus data munaqasyah.' })
 }
 }
 }

 // Calculated average and preview predicate in modal
 const modalAvg = Math.round(
 (Number(formData.nilai_tajwid || 0) + Number(formData.nilai_fashahah || 0) + Number(formData.nilai_kelancaran || 0)) / 3
 )
 const modalPredikat =
 formData.status === 'terjadwal'
 ? 'Menunggu Ujian'
 : formData.status === 'mengulang'
 ? 'Mengulang / Perlu Tahsin'
 : modalAvg >= 92
 ? 'Mumtaz (Istimewa)'
 : modalAvg >= 85
 ? 'Jayyid Jiddan (Sangat Baik)'
 : 'Jayyid (Cukup/Baik)'

 return (
 <div className="space-y-6">
 {/* KPI Cards Row */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
 Total Santri Diuji
 </p>
 <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Arsip seluruh unit</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
 <Award className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
 Lulus Syahadah
 </p>
 <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.lulus}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Tervalidasi Sekali Duduk</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
 <ShieldCheck className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-teal-950/40 dark:via-slate-900 dark:to-teal-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
 Predikat Mumtaz
 </p>
 <h4 className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-1">{stats.mumtaz}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Skor rata-rata &ge; 92</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
 <Sparkles className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-sky-950/40 dark:via-slate-900 dark:to-sky-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
 Terjadwal & Ulang
 </p>
 <h4 className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-1">
 {stats.terjadwal} <span className="text-xs font-semibold text-slate-500">/ {stats.mengulang}</span>
 </h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Antrean munaqasyah</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
 <Clock className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Header Toolbar Card */}
 <Card className="border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm bg-white dark:bg-[#1B2433] dark:bg-slate-900">
 <CardContent className="p-4 sm:p-5">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 <Award className="w-5 h-5 text-amber-600" />
 Penjaminan Mutu & Munaqasyah Akbar Tahfizh
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Sentralisasi validasi kelulusan sekali duduk dan penerbitan nomor syahadah berstandar baku Divisi Pendidikan.
 </p>
 </div>
 <div className="flex items-center gap-2.5">
 <Button
 variant="outline"
 size="sm"
 onClick={loadData}
 disabled={loading}
 className="rounded-xl text-xs font-bold border-emerald-200/80 dark:border-emerald-800/60 text-amber-700 hover:bg-amber-50 dark:border-emerald-800/60 dark:text-amber-300"
 >
 <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
 Muat Ulang
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-amber-600 hover:bg-amber-700 text-amber-600 font-bold text-xs shadow-sm rounded-xl"
 onClick={handleOpenAdd}
 >
 <Plus className="w-4 h-4 mr-1.5" />
 Daftarkan Santri Munaqasyah
 </Button>
 </div>
 </div>

 {/* Interactive Filters with Hero UI dropdown */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80">
 <div className="relative">
 <Input
 placeholder="Cari santri, NIS, penguji, syahadah..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="text-xs pl-8 rounded-xl border-emerald-200/80"
 />
 <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2.5 top-3" />
 </div>

 <HeroUiFilterSelect
 value={filterUnit}
 onChange={setFilterUnit}
 options={[
 { value: 'all', label: 'Semua Unit Sekolah' },
 ...units.map((u) => ({ value: u.id, label: u.name, subtext: u.code })),
 ]}
 icon={Building2}
 placeholder="Filter Unit Sekolah"
 ariaLabel="Filter Unit"
 size="md"
 />

 <HeroUiFilterSelect
 value={filterJuz}
 onChange={setFilterJuz}
 options={[
 { value: 'all', label: 'Semua Kategori Juz' },
 { value: 'Juz 30', label: 'Juz 30 (Sekali Duduk)' },
 { value: 'Juz 29', label: 'Juz 29 (Sekali Duduk)' },
 { value: '5 Juz', label: '5 Juz (Sekali Duduk)' },
 { value: '10 Juz', label: '10 Juz (Sekali Duduk)' },
 { value: '30 Juz', label: '30 Juz Mutqin (Khatam)' },
 ]}
 icon={Filter}
 placeholder="Filter Kategori Juz"
 ariaLabel="Filter Juz"
 size="md"
 />

 <HeroUiFilterSelect
 value={filterStatus}
 onChange={setFilterStatus}
 options={[
 { value: 'all', label: 'Semua Status Kelulusan' },
 { value: 'lulus', label: 'Lulus (Diterbitkan Syahadah)', badge: 'Lulus', badgeColor: 'bg-emerald-100 text-emerald-700' },
 { value: 'terjadwal', label: 'Terjadwal (Belum Diuji)', badge: 'Jadwal', badgeColor: 'bg-sky-100 text-sky-700' },
 { value: 'mengulang', label: 'Mengulang / Perlu Tahsin', badge: 'Ulang', badgeColor: 'bg-amber-100 text-amber-700' },
 ]}
 icon={CheckCircle2}
 placeholder="Status Kelulusan"
 ariaLabel="Filter Status"
 size="md"
 />
 </div>
 </CardContent>
 </Card>

 {/* Datatable Outer Container */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 <div className="bg-white dark:bg-[#1B2433] px-5 py-3.5 border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Award className="w-4 h-4 text-amber-600" />
 <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
 Daftar Peserta Munaqasyah & Verifikasi Syahadah
 </span>
 </div>
 <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
 {filteredItems.length} Santri Terdaftar
 </span>
 </div>

 {loading ? (
 <div className="py-16 text-center text-slate-500">
 <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600 mb-2" />
 <p className="text-xs font-bold">Memuat data munaqasyah dari PostgreSQL database...</p>
 </div>
 ) : filteredItems.length === 0 ? (
 <div className="py-16 text-center text-slate-400">
 {items.length === 0 ? (
 <div className="space-y-3 max-w-md mx-auto px-4">
 <div className="w-14 h-14 mx-auto rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shadow-inner">
 <Award className="w-7 h-7" />
 </div>
 <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
 Belum Ada Arsip Munaqasyah Akbar di Database
 </h4>
 <p className="text-xs text-slate-500">
 Database bersih dan siap menerima data riil. Daftarkan santri yang siap mengikuti ujian sekali duduk untuk proses pengujian dan penerbitan nomor syahadah resmi yayasan.
 </p>
 <div className="pt-1">
 <Button
 variant="primary"
 size="sm"
 onClick={handleOpenAdd}
 className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
 >
 <Plus className="w-4 h-4 mr-1.5" />
 Daftarkan Santri Munaqasyah
 </Button>
 </div>
 </div>
 ) : (
 <div>
 <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
 <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
 Tidak ada data munaqasyah yang cocok dengan filter pencarian.
 </p>
 <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter di atas.</p>
 </div>
 )}
 </div>
 ) : (
 <Table aria-label="Tabel Munaqasyah Tahfizh">
 <TableHeader>
 <TableRow className="bg-white dark:bg-[#1B2433] border-b border-emerald-200/80 dark:border-emerald-800/80 dark:from-amber-950/90 dark:via-orange-950/70 dark:to-amber-950/90">
 <TableCell className="font-extrabold text-xs text-amber-950 dark:text-amber-200">SANTRI & ASAL UNIT</TableCell>
 <TableCell className="font-extrabold text-xs text-amber-950 dark:text-amber-200">JUZ DIUJI & PREDIKAT</TableCell>
 <TableCell className="font-extrabold text-xs text-amber-950 dark:text-amber-200">DEWAN PENGUJI</TableCell>
 <TableCell className="font-extrabold text-xs text-amber-950 dark:text-amber-200">NILAI AKHIR</TableCell>
 <TableCell className="font-extrabold text-xs text-amber-950 dark:text-amber-200">SYAHADAH & STATUS</TableCell>
 <TableCell className="font-extrabold text-xs text-right text-amber-950 dark:text-amber-200">AKSI DIVISI</TableCell>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-amber-100/70 dark:divide-amber-900/40">
 {filteredItems.map((item) => (
 <TableRow key={item.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors">
 <TableCell>
 <div className="flex items-center gap-2.5 py-1">
 <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black text-xs flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
 {item.nama_siswa ? item.nama_siswa.charAt(0) : 'S'}
 </div>
 <div>
 <p className="font-extrabold text-slate-900 dark:text-white text-xs">{item.nama_siswa}</p>
 <p className="text-xs text-slate-500">
 NIS: {item.nis} • {item.unit_name} {item.kelas ? `(${item.kelas})` : ''}
 </p>
 </div>
 </div>
 </TableCell>
 <TableCell>
 <p className="text-xs font-bold text-amber-950 dark:text-amber-200">{item.juz_diuji}</p>
 <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
 <Sparkles className="w-3 h-3 text-amber-500" />
 {item.predikat}
 </span>
 </TableCell>
 <TableCell>
 <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.penguji}</p>
 <p className="text-[10px] text-slate-400 mt-0.5">{item.tanggal_ujian}</p>
 </TableCell>
 <TableCell>
 {item.status === 'terjadwal' ? (
 <span className="text-xs text-slate-400 font-medium italic">Belum Diuji</span>
 ) : (
 <div className="text-xs">
 <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
 {item.nilai_akhir}
 </span>
 <p className="text-[10px] text-slate-500">
 T: {item.nilai_tajwid} | F: {item.nilai_fashahah} | K: {item.nilai_kelancaran}
 </p>
 </div>
 )}
 </TableCell>
 <TableCell>
 <div className="space-y-1">
 <span
 className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
 item.status === 'lulus'
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : item.status === 'terjadwal'
 ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60'
 }`}
 >
 {item.status === 'lulus' ? 'LULUS TAHFIDZ' : item.status === 'terjadwal' ? 'TERJADWAL' : 'MENGULANG'}
 </span>
 {item.nomor_syahadah && item.nomor_syahadah !== 'PENDING' && (
 <p className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
 <QrIcon className="w-3 h-3 text-amber-600" />
 {item.nomor_syahadah}
 </p>
 )}
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center justify-end gap-1.5">
 {item.status === 'lulus' && (
 <button
 type="button"
 onClick={() => handleOpenCert(item)}
 title="Cetak Syahadah Kelulusan"
 className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-xs cursor-pointer transition-colors"
 >
 <Printer className="w-3.5 h-3.5" />
 Syahadah
 </button>
 )}
 <button
 type="button"
 onClick={() => handleOpenEdit(item)}
 title="Ubah Data Munaqasyah"
 className="flex items-center justify-center h-8 w-8 rounded-xl bg-amber-100/80 hover:bg-amber-200/90 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 cursor-pointer transition-colors"
 >
 <Edit3 className="w-4 h-4" />
 </button>
 <button
 type="button"
 onClick={() => handleDelete(item.id)}
 title="Hapus Data Munaqasyah"
 className="flex items-center justify-center h-8 w-8 rounded-xl bg-rose-100/80 hover:bg-rose-200/90 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 cursor-pointer transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </div>

 {/* Modal Formulir Tambah / Edit Munaqasyah */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={formData.id ? 'Ubah Data Munaqasyah Akbar' : 'Daftarkan Santri Munaqasyah Akbar'}
 description="Kelola penilaian ujian sekali duduk dan kelayakan penerbitan syahadah resmi yayasan."
 maxWidth="max-w-xl"
 footer={
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} disabled={saving}>
 Batal
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-amber-600 hover:bg-amber-700 text-amber-600 font-bold"
 onClick={handleSave}
 disabled={saving}
 >
 {saving ? 'Menyimpan...' : 'Simpan Data Munaqasyah'}
 </Button>
 </div>
 }
 >
 <div className="space-y-3.5">
 {/* Santri Selection */}
 <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
 <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
 Pilih Santri / Siswa (Master Database)
 </label>
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={formData.student_id}
 onChange={(val) => handleSelectStudent(val)}
 options={[
 { value: '', label: '-- Cari / Pilih dari Data Santri Terdaftar --' },
 ...availableStudentsForForm.map((s) => ({
 value: String(s.id),
 label: `${s.name} (NIS: ${s.nis}) • ${s.unit_name}`,
 })),
 ]}
 placeholder="Pilih Santri / Siswa"
 aria-label="Pilih Santri / Siswa"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Nama Lengkap Santri <span className="text-rose-500">*</span>
 </label>
 <Input
 value={formData.nama_siswa}
 onChange={(e) => setFormData((p) => ({ ...p, nama_siswa: e.target.value }))}
 placeholder="Contoh: Muhammad Zaidan Al-Fatih"
 className="text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 NIS / NISN
 </label>
 <Input
 value={formData.nis}
 onChange={(e) => setFormData((p) => ({ ...p, nis: e.target.value }))}
 placeholder="Nomor Induk Santri"
 className="text-xs"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Asal Unit Sekolah <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(formData.education_unit_id)}
 onChange={(val) => {
 const selUnit = units.find((u) => String(u.id) === String(val))
 setFormData((p) => ({
 ...p,
 education_unit_id: val,
 unit_name: selUnit?.name || p.unit_name,
 }))
 }}
 options={[
 { value: '', label: '-- Pilih Unit Sekolah --' },
 ...units.map((u) => ({
 value: String(u.id),
 label: `${u.name} (${u.code})`,
 })),
 ]}
 placeholder="Pilih Unit Sekolah"
 aria-label="Asal Unit Sekolah"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Kelas / Rombel
 </label>
 <Input
 value={formData.kelas}
 onChange={(e) => setFormData((p) => ({ ...p, kelas: e.target.value }))}
 placeholder="Contoh: Kelas 9 Abu Ubaidah"
 className="text-xs"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Kategori Juz yang Diuji
 </label>
 <HeroUiFilterSelect
 size="sm"
 value={formData.juz_diuji}
 onChange={(val) => setFormData((p) => ({ ...p, juz_diuji: val }))}
 options={[
 { value: 'Juz 30 (Sekali Duduk)', label: 'Juz 30 (Sekali Duduk)' },
 { value: 'Juz 29 & 30 (2 Juz)', label: 'Juz 29 & 30 (2 Juz)' },
 { value: 'Juz 1 s/d 5 (5 Juz Sekali Duduk)', label: 'Juz 1 s/d 5 (5 Juz Sekali Duduk)' },
 { value: 'Juz 1 s/d 10 (10 Juz Sekali Duduk)', label: 'Juz 1 s/d 10 (10 Juz Sekali Duduk)' },
 { value: 'Juz 1 s/d 15 (15 Juz Sekali Duduk)', label: 'Juz 1 s/d 15 (15 Juz Sekali Duduk)' },
 { value: '30 Juz Bil Ghaib (Sekali Duduk)', label: '30 Juz Bil Ghaib (Sekali Duduk)' },
 ]}
 placeholder="Pilih Kategori Juz"
 aria-label="Kategori Juz yang Diuji"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal Pelaksanaan Ujian
 </label>
 <Input
 type="date"
 value={formData.tanggal_ujian}
 onChange={(e) => setFormData((p) => ({ ...p, tanggal_ujian: e.target.value }))}
 className="text-xs"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Dewan Penguji (Guru Tahfizh Database)
 </label>
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(formData.penguji_employee_id)}
 onChange={(val) => {
 const selExp = examiners.find((ex) => String(ex.id) === String(val))
 setFormData((p) => ({
 ...p,
 penguji_employee_id: val,
 penguji: selExp?.name || p.penguji,
 }))
 }}
 options={[
 { value: '', label: '-- Pilih dari Dewan Penguji / Asatidzah --' },
 ...availableExaminersForForm.map((ex) => ({
 value: String(ex.id),
 label: `${ex.name} (${ex.unit_name})`,
 })),
 ]}
 placeholder="Pilih Dewan Penguji"
 aria-label="Dewan Penguji"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Atau Nama Penguji Tamu / Syaikh
 </label>
 <Input
 value={formData.penguji}
 onChange={(e) => setFormData((p) => ({ ...p, penguji: e.target.value }))}
 placeholder="Contoh: Syaikh Abdul Karim, Al-Hafizh"
 className="text-xs"
 />
 </div>
 </div>

 {/* Nilai dan Predikat */}
 <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
 <div className="flex items-center justify-between">
 <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
 Nilai Rubrik Munaqasyah Sekali Duduk
 </h4>
 <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
 Rata-rata: {modalAvg} ({modalPredikat})
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
 1. Tajwid & Makhraj (0 - 100)
 </label>
 <Input
 type="number"
 min="0"
 max="100"
 value={formData.nilai_tajwid}
 onChange={(e) => setFormData((p) => ({ ...p, nilai_tajwid: e.target.value }))}
 className="text-xs font-bold"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
 2. Fashahah & Adab (0 - 100)
 </label>
 <Input
 type="number"
 min="0"
 max="100"
 value={formData.nilai_fashahah}
 onChange={(e) => setFormData((p) => ({ ...p, nilai_fashahah: e.target.value }))}
 className="text-xs font-bold"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
 3. Kelancaran Hafalan (0 - 100)
 </label>
 <Input
 type="number"
 min="0"
 max="100"
 value={formData.nilai_kelancaran}
 onChange={(e) => setFormData((p) => ({ ...p, nilai_kelancaran: e.target.value }))}
 className="text-xs font-bold"
 />
 </div>
 </div>

 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Status Keputusan Dewan Penguji
 </label>
 <HeroUiFilterSelect
 size="sm"
 value={formData.status}
 onChange={(val) => setFormData((p) => ({ ...p, status: val }))}
 options={[
 { value: 'terjadwal', label: 'TERJADWAL (Ujian Mendatang / Belum Diuji)' },
 { value: 'lulus', label: 'LULUS (Diterbitkan Nomor Syahadah Resmi)' },
 { value: 'mengulang', label: 'MENGULANG (Perlu Pendampingan Tahsin Lanjutan)' },
 ]}
 placeholder="Pilih Status"
 aria-label="Status Keputusan Dewan Penguji"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Catatan Dewan Penguji & Rekomendasi
 </label>
 <TextArea
 rows={2}
 placeholder="Catatan kelebihan makhraj, kelancaran ayat mutasyabihat, atau arahan tahfidz lanjutan..."
 value={formData.catatan_dewan_penguji}
 onChange={(e) => setFormData((p) => ({ ...p, catatan_dewan_penguji: e.target.value }))}
 />
 </div>
 </div>
 </Modal>

 {/* Modal Cetak Syahadah Resmi dengan QR Code */}
 <Modal
 isOpen={isCertificateOpen}
 onClose={() => setIsCertificateOpen(false)}
 title="Syahadah Kelulusan Tahfizh Al-Qur'an"
 description="Dokumen resmi penjaminan mutu tahfizh sekali duduk Yayasan Dar el-Iman."
 maxWidth="max-w-xl"
 footer={
 <div className="flex justify-between w-full">
 <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
 <ShieldCheck className="w-4 h-4 text-emerald-600" /> Dokumen Terverifikasi Digital
 </span>
 <div className="flex gap-2">
 <Button variant="ghost" size="sm" onClick={() => setIsCertificateOpen(false)}>
 Tutup
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-amber-600 hover:bg-amber-700 text-amber-600 font-bold"
 onClick={() => window.print()}
 >
 <Printer className="w-4 h-4 mr-1.5" />
 Cetak Syahadah (PDF)
 </Button>
 </div>
 </div>
 }
 >
 {certItem && (
 <div className="p-6 sm:p-8 rounded-xl border-4 border-double border-amber-600/40 bg-white dark:bg-[#1B2433] text-center space-y-4">
 <div className="flex items-center justify-center gap-2">
 <ShieldCheck className="w-8 h-8 text-amber-600" />
 <div>
 <h3 className="text-base font-black tracking-widest uppercase text-amber-950">
 YAYASAN DAR EL-IMAN PADANG
 </h3>
 <p className="text-xs font-bold text-amber-800 tracking-wider">
 DIVISI PENDIDIKAN & PENJAMINAN MUTU TAHFIZH
 </p>
 </div>
 </div>

 <div className="py-2 border-y border-amber-300">
 <h2 className="text-xl font-black text-amber-900 tracking-wide">
 شَهَادَةُ حِفْظِ القُرْآنِ الكَرِيمِ
 </h2>
 <p className="text-xs font-semibold text-slate-600 mt-0.5">
 SERTIFIKAT KELULUSAN MUNAQASYAH TAHFIZH AL-QUR'AN
 </p>
 <p className="text-xs font-mono font-bold text-amber-700 mt-1">
 Nomor: {certItem.nomor_syahadah}
 </p>
 </div>

 <p className="text-xs text-slate-700">Dewan Penguji Divisi Pendidikan menerangkan bahwa:</p>
 <h1 className="text-xl font-semibold text-slate-900 tracking-wide uppercase">
 {certItem.nama_siswa}
 </h1>
 <p className="text-xs font-medium text-slate-600">
 NIS: {certItem.nis} • {certItem.unit_name}
 </p>

 <div className="py-3 px-4 rounded-xl bg-amber-100/60 border border-emerald-200/80 dark:border-emerald-800/60 max-w-md mx-auto">
 <p className="text-xs font-extrabold text-amber-950">
 Telah Lulus Ujian Munaqasyah Sekali Duduk
 </p>
 <p className="text-sm font-black text-emerald-800 mt-0.5">
 {certItem.juz_diuji}
 </p>
 <p className="text-xs font-black text-amber-800 mt-1">
 Predikat: {certItem.predikat} (Nilai Akhir: {certItem.nilai_akhir})
 </p>
 </div>

 <div className="flex items-center justify-between pt-4 px-4">
 <div className="flex flex-col items-center">
 <div className="p-1.5 bg-white rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <QRCodeSVG
 value={`https://dareliman.sch.id/verify/syahadah/${certItem.nomor_syahadah}`}
 size={64}
 />
 </div>
 <span className="text-[9px] text-slate-400 mt-1">Scan Verifikasi Digital</span>
 </div>

 <div className="text-right text-xs">
 <p className="text-slate-500">Padang, {certItem.tanggal_ujian}</p>
 <p className="font-bold text-slate-800 mt-1">Dewan Penguji Tahfizh,</p>
 <p className="font-extrabold text-amber-900 mt-8 underline">{certItem.penguji}</p>
 </div>
 </div>
 </div>
 )}
 </Modal>
 </div>
 )
}

MunaqasyahTahfizhSection.propTypes = {
 onDataMutate: PropTypes.func,
}
