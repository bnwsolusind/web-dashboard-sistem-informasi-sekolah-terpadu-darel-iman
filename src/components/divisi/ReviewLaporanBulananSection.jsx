import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
 FileCheck,
 Search,
 CheckCircle2,
 Clock,
 AlertTriangle,
 Building2,
 Filter,
 MessageSquare,
 Edit3,
 Calendar,
 Send,
 Eye,
 Plus,
 Trash2,
 RefreshCw,
 Sparkles,
 HelpCircle,
 FolderCheck,
 FileText,
 User,
 ShieldCheck,
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

export default function ReviewLaporanBulananSection({ onDataMutate }) {
 const [items, setItems] = useState([])
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [search, setSearch] = useState('')
 const [filterStatus, setFilterStatus] = useState('all')
 const [filterUnit, setFilterUnit] = useState('all')

 // Relational options from PostgreSQL
 const [units, setUnits] = useState([])

 // Modal Review/Evaluasi
 const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
 const [selectedLaporan, setSelectedLaporan] = useState(null)
 const [reviewForm, setReviewForm] = useState({
 status_validasi: 'disetujui',
 catatan_divisi: '',
 })

 // Modal Tambah Laporan Baru
 const [isAddModalOpen, setIsAddModalOpen] = useState(false)
 const [addForm, setAddForm] = useState({
 unit_id: '',
 judul_laporan: '',
 periode: 'November 2026',
 kategori_laporan: 'Laporan Kinerja Manajerial & Akademik',
 ringkasan_laporan: '',
 status_validasi: 'menunggu',
 catatan_divisi: '',
 })

 const loadData = async () => {
 setLoading(true)
 try {
 const [list, optionsData] = await Promise.all([
 divisiPendidikanWorkspaceService.getLaporanReviewList(),
 divisiPendidikanWorkspaceService.getLaporanReviewOptions(),
 ])
 setItems(Array.isArray(list) ? list : [])
 setUnits(optionsData?.units || [])
 } catch (e) {
 console.error('Gagal memuat daftar laporan bulanan:', e)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadData()
 }, [])

 const filteredItems = useMemo(() => {
 return items.filter((item) => {
 if (filterStatus !== 'all' && item.status_validasi !== filterStatus) return false
 if (filterUnit !== 'all' && item.unit_id !== filterUnit) return false
 if (search.trim()) {
 const q = search.toLowerCase()
 const text = `${item.kode_laporan || ''} ${item.judul || ''} ${item.unit_name || ''} ${item.penginput || ''} ${item.periode || ''} ${item.catatan_divisi || ''}`.toLowerCase()
 if (!text.includes(q)) return false
 }
 return true
 })
 }, [items, filterStatus, filterUnit, search])

 // Summary Metrics
 const stats = useMemo(() => {
 const total = items.length
 const disetujui = items.filter((i) => i.status_validasi === 'disetujui').length
 const revisi = items.filter((i) => i.status_validasi === 'revisi').length
 const menunggu = items.filter((i) => i.status_validasi === 'menunggu').length
 return { total, disetujui, revisi, menunggu }
 }, [items])

 const handleOpenReview = (item) => {
 setSelectedLaporan(item)
 setReviewForm({
 status_validasi: item.status_validasi || 'disetujui',
 catatan_divisi: item.catatan_divisi || '',
 })
 setIsReviewModalOpen(true)
 }

 const handleSaveReview = async () => {
 if (!selectedLaporan) return
 if (!reviewForm.catatan_divisi.trim()) {
 Swal.fire({ icon: 'warning', title: 'Catatan Diperlukan', text: 'Mohon tuliskan catatan evaluasi atau rekomendasi dari Divisi Pendidikan.' })
 return
 }

 setSaving(true)
 try {
 await divisiPendidikanWorkspaceService.updateLaporanReview(selectedLaporan.id, {
 status_validasi: reviewForm.status_validasi,
 catatan_divisi: reviewForm.catatan_divisi,
 })
 setIsReviewModalOpen(false)
 await loadData()
 onDataMutate?.()
 Swal.fire({ icon: 'success', title: 'Tersimpan', text: 'Evaluasi laporan bulanan berhasil disimpan.', timer: 1500, showConfirmButton: false })
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan evaluasi laporan: ' + (e.response?.data?.message || e.message) })
 } finally {
 setSaving(false)
 }
 }

 const handleOpenAdd = () => {
 setAddForm({
 unit_id: units[0]?.id || '',
 judul_laporan: '',
 periode: 'November 2026',
 kategori_laporan: 'Laporan Kinerja Manajerial & Akademik',
 ringkasan_laporan: '',
 status_validasi: 'menunggu',
 catatan_divisi: '',
 })
 setIsAddModalOpen(true)
 }

 const handleSaveAdd = async () => {
 if (!addForm.judul_laporan.trim()) {
 Swal.fire({ icon: 'warning', title: 'Judul Wajib Diisi', text: 'Mohon isi Judul Laporan.' })
 return
 }

 setSaving(true)
 try {
 await divisiPendidikanWorkspaceService.saveLaporanReview(addForm)
 setIsAddModalOpen(false)
 await loadData()
 onDataMutate?.()
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal membuat laporan bulanan: ' + (e.response?.data?.message || e.message) })
 } finally {
 setSaving(false)
 }
 }

 const handleDelete = async (id) => {
 const res = await Swal.fire({
 title: 'Hapus Laporan Bulanan?',
 text: 'Hapus dokumen laporan bulanan ini secara permanen dari database?',
 icon: 'warning',
 showCancelButton: true,
 confirmButtonText: 'Ya, Hapus',
 cancelButtonText: 'Batal',
 confirmButtonColor: '#e11d48',
 })
 if (res.isConfirmed) {
 try {
 await divisiPendidikanWorkspaceService.deleteLaporanReview(id)
 await loadData()
 onDataMutate?.()
 Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Laporan bulanan telah dihapus.', timer: 1500, showConfirmButton: false })
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus laporan bulanan.' })
 }
 }
 }

 return (
 <div className="space-y-6">
 {/* KPI Cards Row */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-teal-950/40 dark:via-slate-900 dark:to-teal-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
 Total Laporan Masuk
 </p>
 <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Tercatat di DB</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
 <FileCheck className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
 Disetujui Penuh
 </p>
 <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.disetujui}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Lolos verifikasi divisi</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
 <CheckCircle2 className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
 Menunggu Reviu
 </p>
 <h4 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{stats.menunggu}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Perlu ditindaklanjuti</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
 <Clock className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
 Perlu Revisi Unit
 </p>
 <h4 className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{stats.revisi}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Dikembalikan ke sekolah</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
 <AlertTriangle className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Main Container Card (HeroUI Emerald Container) */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Header Row 1 */}
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 p-4 sm:p-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
 <FileCheck className="w-4 h-4" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Workflow Review & Catatan Revisi Laporan Bulanan Unit
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Verifikasi laporan manajerial bulanan dari Kepala Sekolah dengan catatan perbaikan interaktif sebelum dilaporkan ke Yayasan.
 </p>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2 self-start sm:self-center">
 <Button
 variant="outline"
 size="sm"
 onClick={loadData}
 disabled={loading}
 className="text-xs font-bold rounded-xl border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-300 cursor-pointer"
 >
 <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
 Segarkan
 </Button>
 <Button
 variant="primary"
 size="sm"
 onClick={handleOpenAdd}
 className="bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 >
 <Plus className="w-4 h-4 mr-1" />
 Input Laporan Baru
 </Button>
 </div>
 </div>
 </div>

 {/* Toolbar Row 2: Search & HeroUI Filter Row */}
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 p-3.5 sm:p-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 <Input
 placeholder="Cari judul laporan, unit, penginput, kode..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9 text-xs h-10 rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900"
 />
 </div>

 <HeroUiFilterSelect
 label="Status Validasi"
 value={filterStatus}
 onChange={setFilterStatus}
 options={[
 { value: 'all', label: 'Semua Status Validasi' },
 { value: 'menunggu', label: 'Menunggu Reviu' },
 { value: 'disetujui', label: 'Disetujui Penuh' },
 { value: 'revisi', label: 'Perlu Revisi Unit' },
 ]}
 icon={Filter}
 />

 <HeroUiFilterSelect
 label="Unit Pendidikan"
 value={filterUnit}
 onChange={setFilterUnit}
 options={[
 { value: 'all', label: 'Semua Unit Sekolah' },
 ...units.map((u) => ({ value: u.id, label: u.name })),
 ]}
 icon={Building2}
 />
 </div>
 </div>

 {/* Table / Empty State Content */}
 {loading ? (
 <div className="py-16 text-center text-slate-400">
 <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
 <p className="text-xs font-bold">Memuat data laporan bulanan dari PostgreSQL database...</p>
 </div>
 ) : filteredItems.length === 0 ? (
 <div className="py-16 text-center text-slate-400">
 {items.length === 0 ? (
 <div className="space-y-3 max-w-md mx-auto px-4">
 <div className="w-14 h-14 mx-auto rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center shadow-inner">
 <Sparkles className="w-7 h-7" />
 </div>
 <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
 Belum Ada Laporan Bulanan di Database
 </h4>
 <p className="text-xs text-slate-500">
 Database bersih dan siap menerima data riil. Belum ada kepala sekolah yang mengirimkan laporan bulanan atau Anda dapat menginput dokumen laporan manajerial baru melalui tombol di bawah.
 </p>
 <div className="pt-1">
 <Button
 variant="primary"
 size="sm"
 onClick={handleOpenAdd}
 className="bg-emerald-600 text-amber-600 font-bold text-xs rounded-lg shadow-sm cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 >
 <Plus className="w-4 h-4 mr-1.5" />
 Input Laporan Bulanan Baru
 </Button>
 </div>
 </div>
 ) : (
 <div>
 <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-white mb-2" />
 <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
 Tidak ada laporan bulanan yang cocok dengan filter pencarian.
 </p>
 <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter di atas.</p>
 </div>
 )}
 </div>
 ) : (
 <Table aria-label="Tabel Review Laporan Bulanan">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 <TableCell className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200">KODE & JUDUL LAPORAN</TableCell>
 <TableCell className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200">UNIT SEKOLAH & PENGINPUT</TableCell>
 <TableCell className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200">PERIODE & TANGGAL KIRIM</TableCell>
 <TableCell className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200">CATATAN EVALUASI DIVISI</TableCell>
 <TableCell className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200">STATUS VALIDASI</TableCell>
 <TableCell className="font-extrabold text-xs text-right text-emerald-950 dark:text-emerald-200">AKSI DIVISI</TableCell>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/70 dark:divide-emerald-900/40">
 {filteredItems.map((item) => {
 const isDisetujui = item.status_validasi === 'disetujui'
 const isRevisi = item.status_validasi === 'revisi'
 return (
 <TableRow key={item.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
 <TableCell>
 <div className="py-1 space-y-0.5">
 <span className="text-[10px] font-black font-mono text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950 px-1.5 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-800/60">
 {item.kode_laporan}
 </span>
 <p className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug">
 {item.judul}
 </p>
 <p className="text-[10px] text-slate-500 line-clamp-1">{item.kategori_laporan}</p>
 </div>
 </TableCell>
 <TableCell>
 <div className="space-y-0.5">
 <p className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
 <Building2 className="w-3 h-3 text-teal-600" />
 {item.unit_name}
 </p>
 <p className="text-[10px] text-slate-500 flex items-center gap-1">
 <User className="w-3 h-3 text-slate-400" />
 {item.penginput}
 </p>
 </div>
 </TableCell>
 <TableCell>
 <div className="space-y-0.5">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.periode}</p>
 <p className="text-[10px] text-slate-500 flex items-center gap-1">
 <Calendar className="w-3 h-3 text-slate-400" />
 {item.tanggal_kirim}
 </p>
 </div>
 </TableCell>
 <TableCell>
 <div className="max-w-md">
 <p className="text-xs text-slate-700 dark:text-slate-300 italic line-clamp-2">
 &ldquo;{item.catatan_divisi || 'Belum ada catatan evaluasi.'}&rdquo;
 </p>
 {item.pemeriksa && (
 <p className="text-[9.5px] text-slate-400 mt-0.5">Oleh: {item.pemeriksa}</p>
 )}
 </div>
 </TableCell>
 <TableCell>
 <span
 className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
 isDisetujui
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300'
 : isRevisi
 ? 'bg-rose-100 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300'
 : 'bg-amber-100 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/60 dark:text-amber-300'
 }`}
 >
 {isDisetujui && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
 {isRevisi && <AlertTriangle className="w-3 h-3 text-rose-600" />}
 {!isDisetujui && !isRevisi && <Clock className="w-3 h-3 text-amber-600" />}
 {isDisetujui ? 'DISETUJUI' : isRevisi ? 'PERLU REVISI' : 'MENUNGGU REVIU'}
 </span>
 </TableCell>
 <TableCell>
 <div className="flex items-center justify-end gap-1.5">
 <Button
 size="xs"
 variant="primary"
 className="bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 onClick={() => handleOpenReview(item)}
 >
 <MessageSquare className="w-3.5 h-3.5 mr-1" />
 Beri Evaluasi
 </Button>
 <Button
 size="xs"
 variant="ghost"
 className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg cursor-pointer"
 onClick={() => handleDelete(item.id)}
 title="Hapus Laporan"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 )
 })}
 </TableBody>
 </Table>
 )}
 </div>

 {/* Modal Review Laporan Interaktif */}
 <Modal
 isOpen={isReviewModalOpen}
 onClose={() => setIsReviewModalOpen(false)}
 title="Evaluasi & Umpan Balik Laporan Bulanan"
 description="Pemberian catatan perbaikan dan penetapan status validasi data manajerial unit sekolah."
 maxWidth="max-w-xl"
 footer={
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="sm" onClick={() => setIsReviewModalOpen(false)} disabled={saving}>
 Batal
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-emerald-600 text-white font-bold rounded-lg shadow-sm cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 onClick={handleSaveReview}
 disabled={saving}
 >
 {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
 {saving ? 'Menyimpan Keputusan...' : 'Kirim Keputusan Evaluasi'}
 </Button>
 </div>
 }
 >
 <div className="space-y-4 text-xs">
 {selectedLaporan && (
 <div className="p-3 bg-teal-50/70 dark:bg-slate-800/80 rounded-xl space-y-1 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80">
 <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300">
 {selectedLaporan.kode_laporan}
 </span>
 <p className="font-extrabold text-slate-900 dark:text-white text-sm">{selectedLaporan.judul}</p>
 <p className="text-slate-600 dark:text-slate-400 text-xs">
 Unit: <strong className="text-teal-700 dark:text-teal-300">{selectedLaporan.unit_name}</strong> | Periode: {selectedLaporan.periode}
 </p>
 </div>
 )}

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Keputusan Status Validasi
 </label>
 <HeroUiFilterSelect
 size="sm"
 value={reviewForm.status_validasi}
 onChange={(val) => setReviewForm((p) => ({ ...p, status_validasi: val }))}
 options={[
 { value: 'disetujui', label: 'Setujui Penuh (Laporan Lengkap & Memenuhi Standar)' },
 { value: 'revisi', label: 'Kembalikan untuk Revisi (Perlu Perbaikan Data Unit)' },
 { value: 'menunggu', label: 'Dalam Peninjauan Lanjutan (Menunggu Dokumen Pelengkap)' },
 ]}
 placeholder="Pilih Status Validasi"
 aria-label="Keputusan Status Validasi"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Catatan & Rekomendasi Perbaikan (Tembusan Resmi ke Kepala Sekolah)
 </label>
 <TextArea
 rows={4}
 placeholder="Tuliskan evaluasi mendalam per seksi (Akademik, Kesiswaan, Sarana, atau SDM)..."
 value={reviewForm.catatan_divisi}
 onChange={(e) => setReviewForm((p) => ({ ...p, catatan_divisi: e.target.value }))}
 className="text-xs"
 />
 </div>
 </div>
 </Modal>

 {/* Modal Tambah Laporan Bulanan Baru */}
 <Modal
 isOpen={isAddModalOpen}
 onClose={() => setIsAddModalOpen(false)}
 title="Input Dokumen Laporan Bulanan Baru"
 description="Pencatatan laporan kinerja manajerial dan akademik unit sekolah ke database."
 maxWidth="max-w-xl"
 footer={
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)} disabled={saving}>
 Batal
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-emerald-600 text-white font-bold rounded-lg shadow-sm cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 onClick={handleSaveAdd}
 disabled={saving}
 >
 {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
 {saving ? 'Menyimpan...' : 'Simpan Laporan'}
 </Button>
 </div>
 }
 >
 <div className="space-y-3.5 text-xs">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Unit Sekolah Pelapor <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 size="sm"
 value={String(addForm.unit_id)}
 onChange={(val) => setAddForm((p) => ({ ...p, unit_id: val }))}
 options={units.map((u) => ({
 value: String(u.id),
 label: `${u.name} (${u.code})`,
 }))}
 placeholder="Pilih Unit Sekolah"
 aria-label="Unit Sekolah Pelapor"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Judul Dokumen Laporan <span className="text-rose-500">*</span>
 </label>
 <Input
 placeholder="Contoh: Laporan Kinerja Bulanan Oktober 2026 - SDIT 1"
 value={addForm.judul_laporan}
 onChange={(e) => setAddForm((p) => ({ ...p, judul_laporan: e.target.value }))}
 className="text-xs"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Periode Bulan</label>
 <Input
 placeholder="Contoh: Oktober 2026"
 value={addForm.periode}
 onChange={(e) => setAddForm((p) => ({ ...p, periode: e.target.value }))}
 className="text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status Awal</label>
 <HeroUiFilterSelect
 size="sm"
 value={addForm.status_validasi}
 onChange={(val) => setAddForm((p) => ({ ...p, status_validasi: val }))}
 options={[
 { value: 'menunggu', label: 'Menunggu Reviu' },
 { value: 'disetujui', label: 'Disetujui Penuh' },
 { value: 'revisi', label: 'Perlu Revisi Unit' },
 ]}
 placeholder="Pilih Status"
 aria-label="Status Awal"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Ringkasan Capaian & Operasional Laporan
 </label>
 <TextArea
 rows={3}
 placeholder="Tuliskan ringkasan pokok capaian akademik, presensi, kesiswaan, atau kendala operasional..."
 value={addForm.ringkasan_laporan}
 onChange={(e) => setAddForm((p) => ({ ...p, ringkasan_laporan: e.target.value }))}
 className="text-xs"
 />
 </div>
 </div>
 </Modal>
 </div>
 )
}

ReviewLaporanBulananSection.propTypes = {
 onDataMutate: PropTypes.func,
}
