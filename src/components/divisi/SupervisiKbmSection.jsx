import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
 Users,
 Search,
 Plus,
 Trash2,
 Edit3,
 Eye,
 CheckCircle2,
 Clock,
 AlertTriangle,
 GraduationCap,
 Building2,
 Calendar,
 Star,
 FileText,
 Filter,
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { TextArea } from '../ui/text-area'
import { Badge } from '../ui/badge'
import { Modal } from '../ui/modal'
import { Avatar, AvatarFallback } from '../ui/avatar'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { divisiPendidikanWorkspaceService } from '../../services/divisiPendidikanWorkspaceService'
import Swal from 'sweetalert2'

export default function SupervisiKbmSection({ onDataMutate }) {
 const [items, setItems] = useState([])
 const [loading, setLoading] = useState(true)
 const [search, setSearch] = useState('')
 const [filterUnit, setFilterUnit] = useState('all')
 const [filterStatus, setFilterStatus] = useState('all')

 const [units, setUnits] = useState([])
 const [teachers, setTeachers] = useState([])

 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isDetailOpen, setIsDetailOpen] = useState(false)
 const [selectedItem, setSelectedItem] = useState(null)
 const [formData, setFormData] = useState({
 id: null,
 guru_id: '',
 guru_name: '',
 unit_id: '',
 unit_name: '',
 mapel: '',
 kelas: '',
 tanggal: new Date().toISOString().split('T')[0],
 supervisor: '',
 status: 'selesai',
 rubrik: {
 pendahuluan: 4,
 penguasaan_materi: 4,
 pengelolaan_kelas: 3,
 integrasi_islam: 4,
 media_pembelajaran: 3,
 penutup_asesmen: 4,
 },
 apresiasi: '',
 rekomendasi: '',
 })

 const loadData = async () => {
 setLoading(true)
 try {
 const [dataList, unitList, teacherList] = await Promise.all([
 divisiPendidikanWorkspaceService.getSupervisiKbmList(),
 divisiPendidikanWorkspaceService.getUnitOptions(),
 divisiPendidikanWorkspaceService.getTeacherOptions(),
 ])
 setItems(dataList)
 setUnits(unitList)
 setTeachers(teacherList)
 } catch (e) {
 console.error(e)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadData()
 }, [])

 const filteredItems = useMemo(() => {
 return items.filter((item) => {
 if (filterUnit !== 'all' && item.unit_id !== filterUnit && item.unit_name !== filterUnit) return false
 if (filterStatus !== 'all' && item.status !== filterStatus) return false
 if (search) {
 const q = search.toLowerCase()
 const text = `${item.guru_name} ${item.mapel} ${item.unit_name} ${item.kelas} ${item.supervisor}`.toLowerCase()
 if (!text.includes(q)) return false
 }
 return true
 })
 }, [items, filterUnit, filterStatus, search])

 const handleOpenAdd = () => {
 const firstTeacher = teachers[0]
 setFormData({
 id: null,
 guru_id: firstTeacher?.id || '',
 guru_name: firstTeacher?.name || '',
 unit_id: firstTeacher?.unit_id || units[0]?.id || '',
 unit_name: firstTeacher?.unit_name || units[0]?.name || '',
 mapel: '',
 kelas: '',
 tanggal: new Date().toISOString().split('T')[0],
 supervisor: 'Tim Supervisi Divisi Pendidikan',
 status: 'selesai',
 rubrik: {
 pendahuluan: 4,
 penguasaan_materi: 4,
 pengelolaan_kelas: 4,
 integrasi_islam: 4,
 media_pembelajaran: 3,
 penutup_asesmen: 4,
 },
 apresiasi: '',
 rekomendasi: '',
 })
 setIsModalOpen(true)
 }

 const handleOpenEdit = (item) => {
 setFormData({ ...item })
 setIsModalOpen(true)
 }

 const handleOpenDetail = (item) => {
 setSelectedItem(item)
 setIsDetailOpen(true)
 }

 const handleRubrikChange = (key, val) => {
 setFormData((prev) => ({
 ...prev,
 rubrik: {
 ...prev.rubrik,
 [key]: Number(val),
 },
 }))
 }

 const handleSave = async () => {
 try {
 const sum = Object.values(formData.rubrik || {}).reduce((a, b) => a + Number(b), 0)
 const skorTotal = Math.round((sum / 24) * 100)

 const payload = {
 ...formData,
 skor_total: formData.status === 'selesai' ? skorTotal : 0,
 }

 await divisiPendidikanWorkspaceService.saveSupervisiKbm(payload)
 await loadData()
 setIsModalOpen(false)
 onDataMutate?.()
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan catatan supervisi KBM: ' + (e.response?.data?.message || e.message) })
 }
 }

 const handleDelete = async (id) => {
 const res = await Swal.fire({
 title: 'Hapus Catatan Supervisi?',
 text: 'Yakin ingin menghapus catatan supervisi ini secara permanen?',
 icon: 'warning',
 showCancelButton: true,
 confirmButtonText: 'Ya, Hapus',
 cancelButtonText: 'Batal',
 confirmButtonColor: '#e11d48',
 })
 if (res.isConfirmed) {
 try {
 await divisiPendidikanWorkspaceService.deleteSupervisiKbm(id)
 await loadData()
 onDataMutate?.()
 Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Catatan supervisi berhasil dihapus.', timer: 1500, showConfirmButton: false })
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus catatan supervisi: ' + (e.response?.data?.message || e.message) })
 }
 }
 }

 return (
 <div className="space-y-6">
 {/* Top Action & Filter Toolbar */}
 <Card className="border border-emerald-200/80 dark:border-emerald-800/80 shadow-sm bg-white dark:bg-[#1B2433] dark:bg-slate-900">
 <CardContent className="p-4 sm:p-5">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 <GraduationCap className="w-5 h-5 text-emerald-600" />
 Supervisi Klinis & Observasi KBM Guru
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Instrumen observasi berkala ruang kelas oleh Divisi Pendidikan untuk standarisasi pedagogik dan nilai Islam.
 </p>
 </div>
 <div className="flex items-center gap-2.5">
 <Button
 variant="primary"
 size="sm"
 className="bg-emerald-600 text-white font-bold text-xs shadow-sm rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 onClick={handleOpenAdd}
 >
 <Plus className="w-4 h-4 mr-1.5" />
 Observasi Baru
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80">
 <div className="relative">
 <Input
 placeholder="Cari guru, mapel, kelas..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full text-xs"
 />
 </div>
 <div className="w-52">
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(filterUnit)}
 onChange={(val) => setFilterUnit(val)}
 options={[
 { value: 'all', label: 'Semua Unit Pendidikan' },
 ...units.map((u) => ({
 value: String(u.id),
 label: u.name,
 })),
 ]}
 placeholder="Semua Unit"
 aria-label="Filter Unit"
 />
 </div>
 <div className="w-44">
 <HeroUiFilterSelect
 size="sm"
 value={filterStatus}
 onChange={(val) => setFilterStatus(val)}
 options={[
 { value: 'all', label: 'Semua Status' },
 { value: 'selesai', label: 'Selesai (Sudah Dinilai)' },
 { value: 'terjadwal', label: 'Terjadwal (Mendatang)' },
 { value: 'pendampingan', label: 'Perlu Pendampingan' },
 ]}
 placeholder="Semua Status"
 aria-label="Filter Status"
 />
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Observasi Grid / List */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredItems.map((item) => {
 const isSelesai = item.status === 'selesai'
 const isTerjadwal = item.status === 'terjadwal'
 const tone = isSelesai ? 'emerald' : isTerjadwal ? 'sky' : 'amber'

 return (
 <motion.div
 key={item.id}
 whileHover={{ y: -3, transition: { duration: 0.2 } }}
 className={`group relative overflow-hidden rounded-xl border-2 p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-xl ${
 isSelesai
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#1B2433]'
 : isTerjadwal
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sky-500/10 dark:border-emerald-800/60 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-[#1B2433]'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm dark:border-emerald-800/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#1B2433]'
 }`}
 >
 {/* Ambient Glow */}
 <div
 className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${
 isSelesai ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' : isTerjadwal ? 'bg-sky-500/20 group-hover:bg-sky-500/30' : 'bg-amber-500/20 group-hover:bg-amber-500/30'
 }`}
 />

 <div className="relative z-10 flex justify-between items-start pb-2">
 <div className="flex items-center gap-3 min-w-0 flex-1">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 font-black text-sm shadow-sm border border-emerald-200/30">
 {item.guru_name.substring(0, 2).toUpperCase()}
 </div>
 <div className="min-w-0 flex-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
 Guru Pendidik
 </span>
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight " title={item.guru_name}>
 {item.guru_name}
 </h4>
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
 <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
 <span className="truncate">{item.unit_name}</span>
 </p>
 </div>
 </div>

 <span
 className={`inline-flex items-center shrink-0 ml-2 rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
 isSelesai
 ? 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-slate-500/30'
 : isTerjadwal
 ? 'bg-sky-500/10 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/30'
 : 'bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30'
 }`}
 >
 {isSelesai ? 'SELESAI' : isTerjadwal ? 'TERJADWAL' : 'PENDAMPINGAN'}
 </span>
 </div>

 <div className="relative z-10 py-2 space-y-2.5 text-xs">
 <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs border border-emerald-200/80 dark:border-emerald-700/80/60 space-y-2.5 shadow-2xs">
 <div>
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
 Mata Pelajaran
 </span>
 <p className="text-xs font-black text-slate-900 dark:text-white leading-snug mt-0.5">
 {item.mapel}
 </p>
 </div>

 <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100/80 dark:border-emerald-700/80/50">
 <div>
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
 Kelas & Rombel
 </span>
 <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5 truncate" title={item.kelas}>
 {item.kelas}
 </p>
 </div>
 <div>
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
 Tanggal Observasi
 </span>
 <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
 {item.tanggal}
 </p>
 </div>
 </div>

 <div className="pt-2 border-t border-emerald-100/80 dark:border-emerald-700/80/50">
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
 Supervisor Penilai
 </span>
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 truncate" title={item.supervisor}>
 {item.supervisor}
 </p>
 </div>
 </div>

 {isSelesai && (
 <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between">
 <div className="flex items-center gap-1.5">
 <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
 <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
 Skor Pedagogik & Nilai Islam
 </span>
 </div>
 <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
 {item.skor_total}%
 </span>
 </div>
 )}

 <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => handleOpenDetail(item)}
 title="Lihat Detail Rubrik"
 className="flex items-center justify-center h-8 w-8 rounded-xl bg-emerald-100/80 hover:bg-emerald-200/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors cursor-pointer"
 >
 <Eye className="w-4 h-4" />
 </button>
 <button
 type="button"
 onClick={() => handleOpenEdit(item)}
 title="Ubah Catatan"
 className="flex items-center justify-center h-8 w-8 rounded-xl bg-sky-100/80 hover:bg-sky-200/90 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 transition-colors cursor-pointer"
 >
 <Edit3 className="w-4 h-4" />
 </button>
 <button
 type="button"
 onClick={() => handleDelete(item.id)}
 title="Hapus Observasi"
 className="flex items-center justify-center h-8 w-8 rounded-xl bg-rose-100/80 hover:bg-rose-200/90 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 transition-colors cursor-pointer"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 </motion.div>
 )
 })}
 </div>

 {filteredItems.length === 0 && !loading && (
 <Card className="p-10 text-center border-dashed border border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/10">
 <CardContent className="flex flex-col items-center justify-center p-0">
 {items.length === 0 ? (
 <div className="space-y-3 max-w-md mx-auto">
 <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-inner">
 <GraduationCap className="w-7 h-7" />
 </div>
 <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
 Belum Ada Catatan Supervisi KBM di Database
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Database bersih dan siap menerima data riil lapangan. Saat supervisor Divisi Pendidikan melaksanakan kunjungan observasi kelas, klik tombol di bawah untuk mencatat evaluasi pedagogik dan nilai Islam guru.
 </p>
 <div className="pt-1">
 <Button
 variant="primary"
 size="sm"
 className="bg-emerald-600 text-white font-bold text-xs shadow-sm rounded-lg cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 onClick={handleOpenAdd}
 >
 <Plus className="w-4 h-4 mr-1.5" />
 Catat Observasi KBM Baru
 </Button>
 </div>
 </div>
 ) : (
 <div>
 <GraduationCap className="w-12 h-12 text-slate-300 mb-2 mx-auto" />
 <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
 Tidak ada data observasi yang cocok dengan filter pencarian.
 </p>
 <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter di atas.</p>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Modal Form Tambah / Edit */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 title={formData.id ? 'Edit Lembar Observasi KBM' : 'Instrumen Observasi KBM Guru'}
 description="Evaluasi proses belajar mengajar, penerapan nilai Islam, dan penguasaan kurikulum."
 maxWidth="max-w-xl"
 footer={
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Batal</Button>
 <Button variant="primary" size="sm" className="bg-emerald-600 text-white font-bold" onClick={handleSave}>
 Simpan Observasi
 </Button>
 </div>
 }
 >
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Guru Pengajar</label>
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(formData.guru_id)}
 onChange={(val) => {
 const t = teachers.find((tc) => String(tc.id) === String(val))
 setFormData((p) => ({
 ...p,
 guru_id: val,
 guru_name: t?.name || p.guru_name,
 unit_id: t?.unit_id || p.unit_id,
 unit_name: t?.unit_name || p.unit_name,
 }))
 }}
 options={teachers.map((t) => ({
 value: String(t.id),
 label: `${t.name} (${t.unit_name})`,
 }))}
 placeholder="Pilih Guru Pengajar"
 aria-label="Pilih Guru Pengajar"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Sekolah</label>
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(formData.unit_id)}
 onChange={(val) => {
 const u = units.find((un) => String(un.id) === String(val))
 setFormData((p) => ({ ...p, unit_id: val, unit_name: u?.name || p.unit_name }))
 }}
 options={units.map((u) => ({
 value: String(u.id),
 label: u.name,
 }))}
 placeholder="Pilih Unit"
 aria-label="Unit Sekolah"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mata Pelajaran</label>
 <Input
 value={formData.mapel}
 onChange={(e) => setFormData((p) => ({ ...p, mapel: e.target.value }))}
 className="text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kelas / Rombel</label>
 <Input
 value={formData.kelas}
 onChange={(e) => setFormData((p) => ({ ...p, kelas: e.target.value }))}
 className="text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
 <Input
 type="date"
 useNative
 value={formData.tanggal}
 onChange={(e) => setFormData((p) => ({ ...p, tanggal: e.target.value }))}
 className="text-xs"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Petugas Supervisor</label>
 <Input
 value={formData.supervisor}
 onChange={(e) => setFormData((p) => ({ ...p, supervisor: e.target.value }))}
 className="text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status Hasil</label>
 <HeroUiFilterSelect
 size="sm"
 value={formData.status}
 onChange={(val) => setFormData((p) => ({ ...p, status: val }))}
 options={[
 { value: 'selesai', label: 'Selesai (Nilai Terpenuhi)' },
 { value: 'terjadwal', label: 'Terjadwal' },
 { value: 'pendampingan', label: 'Perlu Pendampingan Lanjutan' },
 ]}
 placeholder="Pilih Status"
 aria-label="Status Hasil"
 />
 </div>
 </div>

 {/* Rubrik Skor 6 Parameter */}
 <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/80 space-y-3">
 <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300">
 Rubrik Penilaian Kinerja KBM (Skala 1 - 4)
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
 {[
 { key: 'pendahuluan', label: '1. Apersepsi & Kesiapan Adab' },
 { key: 'penguasaan_materi', label: '2. Penguasaan Materi / Deep Learning' },
 { key: 'pengelolaan_kelas', label: '3. Pengelolaan Kelas & Disiplin' },
 { key: 'integrasi_islam', label: '4. Internalisasi Nilai Islam' },
 { key: 'media_pembelajaran', label: '5. Media Pembelajaran / LMS' },
 { key: 'penutup_asesmen', label: '6. Asesmen & Refleksi Penutup' },
 ].map((param) => (
 <div key={param.key} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="font-semibold text-slate-700 dark:text-slate-300 pr-2">{param.label}</span>
 <div className="w-36">
 <HeroUiFilterSelect
 size="sm"
 value={String(formData.rubrik[param.key])}
 onChange={(val) => handleRubrikChange(param.key, val)}
 options={[
 { value: '4', label: '4 (Amat Baik)' },
 { value: '3', label: '3 (Baik)' },
 { value: '2', label: '2 (Cukup)' },
 { value: '1', label: '1 (Kurang)' },
 ]}
 placeholder="Nilai"
 aria-label={param.label}
 />
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-2">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Apresiasi & Kelebihan Guru</label>
 <TextArea
 rows={2}
 placeholder="Contoh: Penguasaan hadits pengantar sangat baik, siswa antusias..."
 value={formData.apresiasi}
 onChange={(e) => setFormData((p) => ({ ...p, apresiasi: e.target.value }))}
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rekomendasi Tindak Lanjut</label>
 <TextArea
 rows={2}
 placeholder="Contoh: Ikutkan pada workshop LMS interaktif pekan depan..."
 value={formData.rekomendasi}
 onChange={(e) => setFormData((p) => ({ ...p, rekomendasi: e.target.value }))}
 />
 </div>
 </div>
 </div>
 </Modal>

 {/* Modal Detail Rubrik */}
 <Modal
 isOpen={isDetailOpen}
 onClose={() => setIsDetailOpen(false)}
 title="Detail Lembar Observasi KBM"
 description={`${selectedItem?.guru_name} - ${selectedItem?.unit_name}`}
 maxWidth="max-w-xl"
 footer={
 <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
 Tutup
 </Button>
 }
 >
 {selectedItem && (
 <div className="space-y-3 text-xs">
 <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
 <div className="flex justify-between">
 <span className="text-slate-500">Mata Pelajaran:</span>
 <span className="font-bold">{selectedItem.mapel} ({selectedItem.kelas})</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-500">Tanggal & Supervisor:</span>
 <span className="font-semibold">{selectedItem.tanggal} - {selectedItem.supervisor}</span>
 </div>
 <div className="flex justify-between items-center pt-1 border-t border-emerald-200/60">
 <span className="text-slate-500">Skor Capaian:</span>
 <span className="font-black text-emerald-600 text-sm">{selectedItem.skor_total}%</span>
 </div>
 </div>

 <div className="space-y-1.5">
 <h5 className="font-extrabold text-slate-800 dark:text-slate-200">Rincian Rubrik:</h5>
 <div className="grid grid-cols-2 gap-2">
 {Object.entries(selectedItem.rubrik || {}).map(([k, v]) => (
 <div key={k} className="p-2 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 flex justify-between">
 <span className="capitalize">{k.replace(/_/g, ' ')}:</span>
 <span className="font-black text-emerald-700">{v} / 4</span>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-1 pt-2">
 <h5 className="font-extrabold text-slate-800 dark:text-slate-200">Apresiasi:</h5>
 <p className="p-2.5 rounded-lg bg-emerald-50/60 text-slate-700 border border-emerald-200/80 dark:border-emerald-800/60">
 {selectedItem.apresiasi || 'Belum ada catatan.'}
 </p>
 </div>

 <div className="space-y-1">
 <h5 className="font-extrabold text-slate-800 dark:text-slate-200">Rekomendasi Tindak Lanjut:</h5>
 <p className="p-2.5 rounded-lg bg-amber-50/60 text-slate-700 border border-emerald-200/80 dark:border-emerald-800/60">
 {selectedItem.rekomendasi || 'Belum ada catatan tindak lanjut.'}
 </p>
 </div>
 </div>
 )}
 </Modal>
 </div>
 )
}
