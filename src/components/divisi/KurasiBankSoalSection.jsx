import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
 BookOpen,
 Search,
 Plus,
 Trash2,
 Edit3,
 CheckCircle2,
 Clock,
 AlertTriangle,
 Building2,
 Filter,
 Layers,
 Sparkles,
 UserCheck,
 Check,
 X,
 FileText,
 HelpCircle,
 RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { TextArea } from '../ui/text-area'
import { Modal } from '../ui/modal'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/table'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { divisiPendidikanWorkspaceService } from '../../services/divisiPendidikanWorkspaceService'
import Swal from 'sweetalert2'

export default function KurasiBankSoalSection({ onDataMutate }) {
 const [items, setItems] = useState([])
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [search, setSearch] = useState('')
 const [filterUnit, setFilterUnit] = useState('all')
 const [filterKlasifikasi, setFilterKlasifikasi] = useState('all')
 const [filterStatus, setFilterStatus] = useState('all')

 // Relational options loaded directly from PostgreSQL
 const [units, setUnits] = useState([])
 const [subjects, setSubjects] = useState([])
 const [teachers, setTeachers] = useState([])

 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
 const [selectedForApprove, setSelectedForApprove] = useState(null)
 const [approveNote, setApproveNote] = useState('')

 const [formData, setFormData] = useState({
 id: null,
 kode_kurasi: '',
 judul: '',
 education_unit_id: '',
 subject_id: '',
 nama_mapel: '',
 penyusun_employee_id: '',
 nama_penyusun: '',
 jenjang: 'SMP / MTs',
 klasifikasi: 'HOTS',
 tingkat_kesukaran: 'Sedang-Tinggi',
 status: 'menunggu_reviu',
 catatan_kurator: '',
 })

 const loadData = async () => {
 setLoading(true)
 try {
 const [list, optionsData] = await Promise.all([
 divisiPendidikanWorkspaceService.getKurasiSoalList(),
 divisiPendidikanWorkspaceService.getKurasiSoalOptions(),
 ])
 setItems(Array.isArray(list) ? list : [])
 setUnits(optionsData?.units || [])
 setSubjects(optionsData?.subjects || [])
 setTeachers(optionsData?.teachers || [])
 } catch (e) {
 console.error('Gagal memuat data kurasi soal:', e)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadData()
 }, [])

 // Filtered teachers based on selected unit in modal form
 const availableTeachersForForm = useMemo(() => {
 if (!formData.education_unit_id) return teachers
 return teachers.filter((t) => t.unit_id === formData.education_unit_id)
 }, [teachers, formData.education_unit_id])

 // Filtered list
 const filteredItems = useMemo(() => {
 return items.filter((item) => {
 if (filterUnit !== 'all' && item.education_unit_id !== filterUnit && item.unit_asal !== filterUnit) {
 return false
 }
 if (filterKlasifikasi !== 'all' && item.klasifikasi !== filterKlasifikasi) {
 return false
 }
 if (filterStatus !== 'all' && item.status !== filterStatus) {
 return false
 }
 if (search.trim()) {
 const q = search.toLowerCase()
 const text = `${item.kode_kurasi || ''} ${item.judul || ''} ${item.mapel || ''} ${item.penyusun || ''} ${item.unit_asal || ''} ${item.catatan_kurator || ''}`.toLowerCase()
 if (!text.includes(q)) return false
 }
 return true
 })
 }, [items, filterUnit, filterKlasifikasi, filterStatus, search])

 // KPI Statistics
 const stats = useMemo(() => {
 const total = items.length
 const disetujui = items.filter((i) => i.status === 'disetujui').length
 const hots = items.filter((i) => i.klasifikasi === 'HOTS').length
 const menunggu = items.filter((i) => i.status === 'menunggu_reviu').length
 const revisi = items.filter((i) => i.status === 'perlu_revisi').length
 const hotsPercent = total > 0 ? Math.round((hots / total) * 100) : 0

 return { total, disetujui, hots, hotsPercent, menunggu, revisi }
 }, [items])

 const handleOpenAdd = () => {
 const defaultUnit = units[0]
 let defaultJenjang = 'SMP / MTs'
 if (defaultUnit) {
 if (defaultUnit.code?.includes('TK') || defaultUnit.code?.includes('TAUD')) defaultJenjang = 'TK / PAUD'
 else if (defaultUnit.code?.includes('SD') || defaultUnit.code?.includes('MIT')) defaultJenjang = 'SD / MI'
 else if (defaultUnit.code?.includes('SMP')) defaultJenjang = 'SMP / MTs'
 else if (defaultUnit.code?.includes('SMA') || defaultUnit.code?.includes('PONPES')) defaultJenjang = 'SMA / MA / Ponpes'
 }

 setFormData({
 id: null,
 kode_kurasi: '',
 judul: '',
 education_unit_id: defaultUnit?.id || '',
 subject_id: subjects[0]?.id || '',
 nama_mapel: subjects[0]?.name || '',
 penyusun_employee_id: '',
 nama_penyusun: '',
 jenjang: defaultJenjang,
 klasifikasi: 'HOTS',
 tingkat_kesukaran: 'Sedang-Tinggi',
 status: 'menunggu_reviu',
 catatan_kurator: '',
 })
 setIsModalOpen(true)
 }

 const handleOpenEdit = (item) => {
 setFormData({
 id: item.id,
 kode_kurasi: item.kode_kurasi || '',
 judul: item.judul || '',
 education_unit_id: item.education_unit_id || '',
 subject_id: item.subject_id || '',
 nama_mapel: item.mapel || '',
 penyusun_employee_id: item.penyusun_employee_id || '',
 nama_penyusun: item.penyusun || '',
 jenjang: item.jenjang || 'SMP / MTs',
 klasifikasi: item.klasifikasi || 'HOTS',
 tingkat_kesukaran: item.tingkat_kesukaran || 'Sedang',
 status: item.status || 'menunggu_reviu',
 catatan_kurator: item.catatan_kurator || '',
 })
 setIsModalOpen(true)
 }

 const handleUnitChange = (unitId) => {
 const selectedUnit = units.find((u) => u.id === unitId)
 let jenjang = formData.jenjang
 if (selectedUnit) {
 if (selectedUnit.code?.includes('TK') || selectedUnit.code?.includes('TAUD')) jenjang = 'TK / PAUD'
 else if (selectedUnit.code?.includes('SD') || selectedUnit.code?.includes('MIT')) jenjang = 'SD / MI'
 else if (selectedUnit.code?.includes('SMP')) jenjang = 'SMP / MTs'
 else if (selectedUnit.code?.includes('SMA') || selectedUnit.code?.includes('PONPES')) jenjang = 'SMA / MA / Ponpes'
 }

 setFormData((prev) => ({
 ...prev,
 education_unit_id: unitId,
 jenjang,
 penyusun_employee_id: '',
 nama_penyusun: '',
 }))
 }

 const handleSubjectChange = (subjectId) => {
 const selSubj = subjects.find((s) => s.id === subjectId)
 setFormData((prev) => ({
 ...prev,
 subject_id: subjectId,
 nama_mapel: selSubj?.name || prev.nama_mapel,
 }))
 }

 const handleTeacherChange = (teacherId) => {
 const selTeacher = teachers.find((t) => t.id === teacherId)
 setFormData((prev) => ({
 ...prev,
 penyusun_employee_id: teacherId,
 nama_penyusun: selTeacher?.name || prev.nama_penyusun,
 }))
 }

 const handleSave = async () => {
 if (!formData.judul.trim()) {
 Swal.fire({ icon: 'warning', title: 'Judul Wajib Diisi', text: 'Mohon isi Judul Paket Soal.' })
 return
 }
 if (!formData.education_unit_id) {
 Swal.fire({ icon: 'warning', title: 'Unit Wajib Dipilih', text: 'Mohon pilih Asal Unit Sekolah.' })
 return
 }

 setSaving(true)
 try {
 await divisiPendidikanWorkspaceService.saveKurasiSoal(formData)
 setIsModalOpen(false)
 await loadData()
 onDataMutate?.()
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: e.response?.data?.message || 'Gagal menyimpan hasil kurasi soal. Silakan coba lagi.' })
 } finally {
 setSaving(false)
 }
 }

 const handleDelete = async (id) => {
 const res = await Swal.fire({
 title: 'Hapus Paket Bank Soal?',
 text: 'Hapus paket bank soal kurasi ini secara permanen dari database?',
 icon: 'warning',
 showCancelButton: true,
 confirmButtonText: 'Ya, Hapus',
 cancelButtonText: 'Batal',
 confirmButtonColor: '#e11d48',
 })
 if (res.isConfirmed) {
 try {
 await divisiPendidikanWorkspaceService.deleteKurasiSoal(id)
 await loadData()
 onDataMutate?.()
 Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Paket bank soal berhasil dihapus.', timer: 1500, showConfirmButton: false })
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus data kurasi soal.' })
 }
 }
 }

 const handleOpenQuickApprove = (item) => {
 setSelectedForApprove(item)
 setApproveNote(
 item.catatan_kurator
 ? `${item.catatan_kurator} (Disetujui standar baku yayasan)`
 : 'Disetujui standar baku mutu yayasan oleh Divisi Pendidikan.'
 )
 setIsApproveModalOpen(true)
 }

 const handleExecuteApprove = async () => {
 if (!selectedForApprove) return
 setSaving(true)
 try {
 await divisiPendidikanWorkspaceService.approveKurasiSoal(selectedForApprove.id, approveNote)
 setIsApproveModalOpen(false)
 setSelectedForApprove(null)
 await loadData()
 onDataMutate?.()
 Swal.fire({ icon: 'success', title: 'Disetujui', text: 'Paket bank soal berhasil disetujui.', timer: 1500, showConfirmButton: false })
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: e.response?.data?.message || 'Gagal menyetujui paket kurasi.' })
 } finally {
 setSaving(false)
 }
 }

 return (
 <div className="space-y-6">
 {/* KPI Cards Row */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-purple-950/40 dark:via-slate-900 dark:to-purple-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
 Total Paket Soal
 </p>
 <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Naskah dari seluruh unit</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
 <Layers className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
 Disetujui Standar
 </p>
 <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.disetujui}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Validasi kurikulum tuntas</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
 <CheckCircle2 className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
 Bobot HOTS
 </p>
 <h4 className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
 {stats.hots} <span className="text-xs font-semibold text-slate-500">({stats.hotsPercent}%)</span>
 </h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Penalaran tingkat tinggi</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
 <Sparkles className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
 Menunggu & Revisi
 </p>
 <h4 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
 {stats.menunggu} <span className="text-xs font-semibold text-slate-500">/ {stats.revisi}</span>
 </h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Antrean kurasi aktif</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
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
 <BookOpen className="w-5 h-5 text-purple-600" />
 Standarisasi Bank Soal & Kurasi Ujian Bersama
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pusat kurasi kualitas bank soal ujian bersama semester (PTS/PAS) untuk menjamin proporsi HOTS/MOTS/LOTS se-Yayasan.
 </p>
 </div>
 <div className="flex items-center gap-2.5">
 <Button
 variant="outline"
 size="sm"
 onClick={loadData}
 disabled={loading}
 className="rounded-xl text-xs font-bold border-emerald-200/80 dark:border-emerald-800/60 text-purple-700 hover:bg-purple-50 dark:border-emerald-800/60 dark:text-purple-300"
 >
 <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
 Muat Ulang
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-emerald-600 text-white font-bold text-xs shadow-sm rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 onClick={handleOpenAdd}
 >
 <Plus className="w-4 h-4 mr-1.5" />
 Tambah Paket Soal
 </Button>
 </div>
 </div>

 {/* Interactive Filters with Hero UI dropdown */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80">
 <div className="relative">
 <Input
 placeholder="Cari kode, judul, mapel, penyusun..."
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
 value={filterKlasifikasi}
 onChange={setFilterKlasifikasi}
 options={[
 { value: 'all', label: 'Semua Tipe Kognitif' },
 { value: 'HOTS', label: 'HOTS (Higher Order Thinking)', badge: 'HOTS', badgeColor: 'bg-rose-100 text-rose-700' },
 { value: 'MOTS', label: 'MOTS (Middle Order Thinking)', badge: 'MOTS', badgeColor: 'bg-amber-100 text-amber-700' },
 { value: 'LOTS', label: 'LOTS (Lower Order Thinking)', badge: 'LOTS', badgeColor: 'bg-sky-100 text-sky-700' },
 ]}
 icon={Filter}
 placeholder="Klasifikasi Kognitif"
 ariaLabel="Filter Klasifikasi"
 size="md"
 />

 <HeroUiFilterSelect
 value={filterStatus}
 onChange={setFilterStatus}
 options={[
 { value: 'all', label: 'Semua Status Kurasi' },
 { value: 'disetujui', label: 'Disetujui Standar Yayasan', badge: 'Disetujui', badgeColor: 'bg-emerald-100 text-emerald-700' },
 { value: 'perlu_revisi', label: 'Perlu Revisi Guru', badge: 'Revisi', badgeColor: 'bg-amber-100 text-amber-700' },
 { value: 'menunggu_reviu', label: 'Menunggu Reviu', badge: 'Menunggu', badgeColor: 'bg-purple-100 text-purple-700' },
 ]}
 icon={CheckCircle2}
 placeholder="Status Kurasi"
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
 <Layers className="w-4 h-4 text-purple-600" />
 <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
 Daftar Naskah Bank Soal & Status Validasi Terpadu
 </span>
 </div>
 <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
 {filteredItems.length} Paket Soal Database
 </span>
 </div>

 {loading ? (
 <div className="py-16 text-center text-slate-500">
 <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
 <p className="text-xs font-bold">Memuat data kurasi dari PostgreSQL database...</p>
 </div>
 ) : filteredItems.length === 0 ? (
 <div className="py-16 text-center text-slate-400">
 {items.length === 0 ? (
 <div className="space-y-3 max-w-md mx-auto px-4">
 <div className="w-14 h-14 mx-auto rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-inner">
 <BookOpen className="w-7 h-7" />
 </div>
 <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
 Belum ada paket kurasi bank soal di database.
 </p>
 <p className="text-xs text-slate-500">
 Database bersih dan siap menerima data riil. Mulai standarisasi kualitas naskah soal ujian bersama se-Yayasan dengan menambahkan paket soal pertama Anda.
 </p>
 <div className="pt-1">
 <Button
 variant="primary"
 size="sm"
 onClick={handleOpenAdd}
 className="bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 >
 <Plus className="w-4 h-4 mr-1.5" />
 Tambah Paket Soal Baru
 </Button>
 </div>
 </div>
 ) : (
 <div>
 <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-white mb-2" />
 <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
 Tidak ada paket kurasi soal yang cocok dengan filter pencarian.
 </p>
 <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter di atas.</p>
 </div>
 )}
 </div>
 ) : (
 <Table aria-label="Tabel Kurasi Soal Yayasan">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableCell className="font-extrabold text-xs text-purple-950 dark:text-purple-200">KODE & JUDUL PAKET UJIAN</TableCell>
 <TableCell className="font-extrabold text-xs text-purple-950 dark:text-purple-200">MAPEL & ASAL UNIT</TableCell>
 <TableCell className="font-extrabold text-xs text-purple-950 dark:text-purple-200">PENYUSUN & JENJANG</TableCell>
 <TableCell className="font-extrabold text-xs text-purple-950 dark:text-purple-200">KLASIFIKASI KOGNITIF</TableCell>
 <TableCell className="font-extrabold text-xs text-purple-950 dark:text-purple-200">STATUS KURASI</TableCell>
 <TableCell className="font-extrabold text-xs text-right text-purple-950 dark:text-purple-200">AKSI DIVISI</TableCell>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-purple-100/70 dark:divide-purple-900/40">
 {filteredItems.map((item) => (
 <TableRow key={item.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
 <TableCell>
 <div className="py-1 space-y-0.5">
 <div className="flex items-center gap-1.5">
 <span className="text-[10px] font-black font-mono text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950 px-1.5 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-800/60">
 {item.kode_kurasi || 'KRS-2026'}
 </span>
 </div>
 <p className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug">
 {item.judul}
 </p>
 {item.catatan_kurator && (
 <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
 Catatan: &ldquo;{item.catatan_kurator}&rdquo;
 </p>
 )}
 </div>
 </TableCell>
 <TableCell>
 <p className="text-xs font-bold text-purple-900 dark:text-purple-300">{item.mapel}</p>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
 <Building2 className="w-3 h-3 text-slate-400" />
 {item.unit_asal}
 </p>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/60">
 {item.penyusun ? item.penyusun.charAt(0) : 'G'}
 </div>
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.penyusun}</p>
 <p className="text-[10px] font-semibold text-slate-500">{item.jenjang}</p>
 </div>
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-1.5">
 <span
 className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
 item.klasifikasi === 'HOTS'
 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : item.klasifikasi === 'MOTS'
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60'
 }`}
 >
 {item.klasifikasi}
 </span>
 <span className="text-[10px] text-slate-500 font-semibold">{item.tingkat_kesukaran}</span>
 </div>
 </TableCell>
 <TableCell>
 <span
 className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
 item.status === 'disetujui'
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : item.status === 'perlu_revisi'
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-emerald-200/80 dark:border-emerald-800/60'
 }`}
 >
 {item.status === 'disetujui'
 ? 'DISETUJUI YAYASAN'
 : item.status === 'perlu_revisi'
 ? 'PERLU REVISI'
 : 'MENUNGGU REVIU'}
 </span>
 </TableCell>
 <TableCell>
 <div className="flex items-center justify-end gap-1.5">
 {item.status !== 'disetujui' && (
 <button
 type="button"
 onClick={() => handleOpenQuickApprove(item)}
 className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs cursor-pointer transition-colors"
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 Setujui
 </button>
 )}
 <button
 type="button"
 onClick={() => handleOpenEdit(item)}
 title="Ubah Kurasi Soal"
 className="flex items-center justify-center h-8 w-8 rounded-xl bg-purple-100/80 hover:bg-purple-200/90 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 cursor-pointer transition-colors"
 >
 <Edit3 className="w-4 h-4" />
 </button>
 <button
 type="button"
 onClick={() => handleDelete(item.id)}
 title="Hapus Soal"
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

 {/* Modal Kurasi & Validasi Paket Soal (Full Relasional) */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={formData.id ? 'Kurasi & Validasi Paket Soal' : 'Tambah Paket Soal Baru'}
 description="Kelola standarisasi butir soal ujian bersama se-Yayasan dengan relasi database riil."
 maxWidth="max-w-xl"
 footer={
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} disabled={saving}>
 Batal
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-emerald-600 text-white font-bold border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg h-9 px-4 text-sm font-medium"
 onClick={handleSave}
 disabled={saving}
 >
 {saving ? 'Menyimpan...' : 'Simpan Hasil Kurasi'}
 </Button>
 </div>
 }
 >
 <div className="space-y-3.5">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Judul Paket Ujian / Soal <span className="text-rose-500">*</span>
 </label>
 <Input
 value={formData.judul}
 onChange={(e) => setFormData((p) => ({ ...p, judul: e.target.value }))}
 placeholder="Contoh: Paket Ujian Bersama Semester Ganjil - Fiqih Ibadah"
 className="text-xs"
 />
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
 onChange={(val) => handleUnitChange(val)}
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
 Jenjang Pendidikan
 </label>
 <HeroUiFilterSelect
 size="sm"
 value={formData.jenjang}
 onChange={(val) => setFormData((p) => ({ ...p, jenjang: val }))}
 options={[
 { value: 'TK / PAUD', label: 'TK / PAUD' },
 { value: 'SD / MI', label: 'SD / MI' },
 { value: 'SMP / MTs', label: 'SMP / MTs' },
 { value: 'SMA / MA / Ponpes', label: 'SMA / MA / Ponpes' },
 ]}
 placeholder="Pilih Jenjang"
 aria-label="Jenjang Pendidikan"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Mata Pelajaran (Database)
 </label>
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(formData.subject_id)}
 onChange={(val) => handleSubjectChange(val)}
 options={[
 { value: '', label: '-- Pilih Mata Pelajaran --' },
 ...subjects.map((s) => ({
 value: String(s.id),
 label: `${s.name} (${s.kode_mapel || '-'})`,
 })),
 ]}
 placeholder="Pilih Mata Pelajaran"
 aria-label="Mata Pelajaran"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Atau Nama Mapel Kustom
 </label>
 <Input
 value={formData.nama_mapel}
 onChange={(e) => setFormData((p) => ({ ...p, nama_mapel: e.target.value }))}
 placeholder="Misal: Fiqih Ibadah & Muamalah"
 className="text-xs"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Guru Penyusun (Pegawai Riil Unit Terpilih)
 </label>
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(formData.penyusun_employee_id)}
 onChange={(val) => handleTeacherChange(val)}
 options={[
 { value: '', label: '-- Pilih Guru Penyusun --' },
 ...availableTeachersForForm.map((t) => ({
 value: String(t.id),
 label: `${t.name} (NIY: ${t.niy})`,
 })),
 ]}
 placeholder="Pilih Guru Penyusun"
 aria-label="Guru Penyusun"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Atau Tim / Nama Penyusun Manual
 </label>
 <Input
 value={formData.nama_penyusun}
 onChange={(e) => setFormData((p) => ({ ...p, nama_penyusun: e.target.value }))}
 placeholder="Misal: Tim MGMP PAI Tingkat SMPIT"
 className="text-xs"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Klasifikasi Kognitif
 </label>
 <HeroUiFilterSelect
 size="sm"
 value={formData.klasifikasi}
 onChange={(val) => setFormData((p) => ({ ...p, klasifikasi: val }))}
 options={[
 { value: 'HOTS', label: 'HOTS (C4-C6: Analisis & Evaluasi)' },
 { value: 'MOTS', label: 'MOTS (C3: Penerapan)' },
 { value: 'LOTS', label: 'LOTS (C1-C2: Pemahaman Dasar)' },
 ]}
 placeholder="Pilih Klasifikasi"
 aria-label="Klasifikasi Kognitif"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tingkat Kesukaran
 </label>
 <HeroUiFilterSelect
 size="sm"
 value={formData.tingkat_kesukaran}
 onChange={(val) => setFormData((p) => ({ ...p, tingkat_kesukaran: val }))}
 options={[
 { value: 'Mudah', label: 'Mudah' },
 { value: 'Sedang', label: 'Sedang' },
 { value: 'Sedang-Tinggi', label: 'Sedang-Tinggi' },
 { value: 'Tinggi', label: 'Tinggi' },
 ]}
 placeholder="Pilih Kesukaran"
 aria-label="Tingkat Kesukaran"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Status Validasi Yayasan
 </label>
 <HeroUiFilterSelect
 size="sm"
 value={formData.status}
 onChange={(val) => setFormData((p) => ({ ...p, status: val }))}
 options={[
 { value: 'disetujui', label: 'Disetujui Standar Yayasan' },
 { value: 'perlu_revisi', label: 'Perlu Revisi Guru' },
 { value: 'menunggu_reviu', label: 'Menunggu Reviu' },
 ]}
 placeholder="Pilih Status"
 aria-label="Status Validasi Yayasan"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Catatan Kurator Divisi Pendidikan
 </label>
 <TextArea
 rows={3}
 placeholder="Catatan telaah kualitas butir soal, kesesuaian kisi-kisi, kunci jawaban, dan proporsi kognitif..."
 value={formData.catatan_kurator}
 onChange={(e) => setFormData((p) => ({ ...p, catatan_kurator: e.target.value }))}
 />
 </div>
 </div>
 </Modal>

 {/* Modal Quick Approve */}
 <Modal
 isOpen={isApproveModalOpen}
 onClose={() => setIsApproveModalOpen(false)}
 title="Konfirmasi Persetujuan Standar Baku Soal"
 description="Paket soal ini akan diverifikasi dan disetujui untuk ujian bersama se-Yayasan."
 maxWidth="max-w-xl"
 footer={
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="sm" onClick={() => setIsApproveModalOpen(false)} disabled={saving}>
 Batal
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-emerald-600 text-white font-bold border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg h-9 px-4 text-sm font-medium"
 onClick={handleExecuteApprove}
 disabled={saving}
 >
 {saving ? 'Memproses...' : 'Setujui Standar Baku'}
 </Button>
 </div>
 }
 >
 <div className="space-y-3">
 <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {selectedForApprove?.judul}
 </p>
 <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
 {selectedForApprove?.mapel} • {selectedForApprove?.unit_asal} • {selectedForApprove?.klasifikasi}
 </p>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Catatan Pengesahan Kurator
 </label>
 <TextArea
 rows={3}
 value={approveNote}
 onChange={(e) => setApproveNote(e.target.value)}
 placeholder="Tambahkan catatan rekomendasi atau apresiasi telaah butir soal..."
 />
 </div>
 </div>
 </Modal>
 </div>
 )
}

KurasiBankSoalSection.propTypes = {
 onDataMutate: PropTypes.func,
}
