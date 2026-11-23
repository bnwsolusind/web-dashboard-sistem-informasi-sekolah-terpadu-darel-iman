import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
 ShieldCheck,
 Building2,
 CheckCircle2,
 AlertTriangle,
 Clock,
 Sparkles,
 FileText,
 Sliders,
 ChevronRight,
 TrendingUp,
 RefreshCw,
 Plus,
 Trash2,
 Award,
 HelpCircle,
 FileCheck,
 Calendar,
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Modal } from '../ui/modal'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { divisiPendidikanWorkspaceService } from '../../services/divisiPendidikanWorkspaceService'
import Swal from 'sweetalert2'

export default function RadarAkreditasiSection({ onDataMutate }) {
 const [items, setItems] = useState([])
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [selectedUnitId, setSelectedUnitId] = useState('')

 // Relational options from PostgreSQL
 const [units, setUnits] = useState([])
 const [ranks, setRanks] = useState([
 'A (Unggul)',
 'B (Baik)',
 'C (Cukup)',
 'Belum Terakreditasi',
 'Proses Re-Akreditasi',
 ])

 // Modal Inisialisasi Audit Akreditasi Baru
 const [isAddModalOpen, setIsAddModalOpen] = useState(false)
 const [addForm, setAddForm] = useState({
 unit_id: '',
 peringkat_saat_ini: 'A (Unggul)',
 skor_akreditasi: 95,
 habis_berlaku: '2028-10-30',
 rekomendasi_divisi: '',
 })

 // Modal Edit Skor Butir Standar
 const [isEditModalOpen, setIsEditModalOpen] = useState(false)
 const [editIndex, setEditIndex] = useState(0)
 const [editSkor, setEditSkor] = useState(90)
 const [editBukti, setEditBukti] = useState('')

 const loadData = async () => {
 setLoading(true)
 try {
 const [list, optionsData] = await Promise.all([
 divisiPendidikanWorkspaceService.getAkreditasiList(),
 divisiPendidikanWorkspaceService.getAkreditasiOptions(),
 ])
 const auditList = Array.isArray(list) ? list : []
 setItems(auditList)
 setUnits(optionsData?.units || [])
 if (optionsData?.ranks) setRanks(optionsData.ranks)

 if (auditList.length > 0) {
 if (!selectedUnitId || !auditList.some((i) => i.unit_id === selectedUnitId || i.id === selectedUnitId)) {
 setSelectedUnitId(auditList[0].unit_id || auditList[0].id)
 }
 } else {
 setSelectedUnitId('')
 }
 } catch (e) {
 console.error('Gagal memuat data radar akreditasi:', e)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadData()
 }, [])

 // KPI Summary Metrics
 const stats = useMemo(() => {
 const total = items.length
 if (total === 0) return { total: 0, avgKesiapan: 0, akreditasiA: 0, perluPerpanjangan: 0 }
 const avgKesiapan = Math.round(items.reduce((acc, curr) => acc + (Number(curr.kesiapan_total) || 0), 0) / total)
 const akreditasiA = items.filter((i) => String(i.peringkat_saat_ini).includes('A')).length
 const perluPerpanjangan = items.filter((i) => String(i.sisa_waktu).toLowerCase().includes('bulan') && parseInt(i.sisa_waktu) <= 6).length
 return { total, avgKesiapan, akreditasiA, perluPerpanjangan }
 }, [items])

 const currentUnit = useMemo(() => {
 if (!items.length) return null
 return items.find((i) => i.unit_id === selectedUnitId || i.id === selectedUnitId) || items[0]
 }, [items, selectedUnitId])

 const handleOpenAdd = () => {
 setAddForm({
 unit_id: units[0]?.id || '',
 peringkat_saat_ini: 'A (Unggul)',
 skor_akreditasi: 95,
 habis_berlaku: '2028-10-30',
 rekomendasi_divisi: '',
 })
 setIsAddModalOpen(true)
 }

 const handleSaveAdd = async () => {
 if (!addForm.unit_id) {
 Swal.fire({ icon: 'warning', title: 'Unit Wajib Dipilih', text: 'Mohon pilih unit pendidikan.' })
 return
 }

 setSaving(true)
 try {
 await divisiPendidikanWorkspaceService.saveAkreditasi(addForm)
 setIsAddModalOpen(false)
 await loadData()
 onDataMutate?.()
 Swal.fire({ icon: 'success', title: 'Tersimpan', text: 'Data audit akreditasi berhasil disimpan.', timer: 1500, showConfirmButton: false })
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan audit akreditasi: ' + (e.response?.data?.message || e.message) })
 } finally {
 setSaving(false)
 }
 }

 const handleOpenEdit = (index, skor, bukti) => {
 setEditIndex(index)
 setEditSkor(skor)
 setEditBukti(bukti || '')
 setIsEditModalOpen(true)
 }

 const handleSaveSkor = async () => {
 if (!currentUnit) return
 setSaving(true)
 try {
 await divisiPendidikanWorkspaceService.updateAkreditasiStandar(
 currentUnit.id,
 editIndex,
 Number(editSkor),
 editBukti
 )
 setIsEditModalOpen(false)
 await loadData()
 onDataMutate?.()
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memperbarui skor butir standar: ' + (e.response?.data?.message || e.message) })
 } finally {
 setSaving(false)
 }
 }

 const handleDelete = async (id) => {
 const res = await Swal.fire({
 title: 'Hapus Audit Akreditasi?',
 text: 'Hapus data audit akreditasi unit ini secara permanen dari database?',
 icon: 'warning',
 showCancelButton: true,
 confirmButtonText: 'Ya, Hapus',
 cancelButtonText: 'Batal',
 confirmButtonColor: '#e11d48',
 })
 if (res.isConfirmed) {
 try {
 await divisiPendidikanWorkspaceService.deleteAkreditasi(id)
 await loadData()
 onDataMutate?.()
 Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data akreditasi berhasil dihapus.', timer: 1500, showConfirmButton: false })
 } catch (e) {
 Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus data akreditasi.' })
 }
 }
 }

 return (
 <div className="space-y-6">
 {/* 4 Dynamic KPI Cards Row */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
 Unit Diaudit
 </p>
 <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total} Unit</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Tercatat di DB</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
 <ShieldCheck className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
 Rata-rata Kesiapan
 </p>
 <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.avgKesiapan}%</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Pemenuhan 9 Standar</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
 <TrendingUp className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-sky-950/40 dark:via-slate-900 dark:to-sky-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
 Akreditasi A Unggul
 </p>
 <h4 className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-1">{stats.akreditasiA}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Peringkat tertinggi</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
 <Award className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>

 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 shadow-xs">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
 Perlu Perpanjangan
 </p>
 <h4 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{stats.perluPerpanjangan}</h4>
 <p className="text-[10px] text-slate-500 mt-0.5">Sisa &le; 6 bulan</p>
 </div>
 <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
 <Clock className="w-5 h-5" />
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Main Container Card (HeroUI Emerald Container) */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Header Row */}
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 p-4 sm:p-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
 <ShieldCheck className="w-4 h-4" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Audit Kesiapan Akreditasi Sekolah & 8 Standar Nasional (SNP) + JSIT
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Monitoring pemenuhan instrumen akreditasi BAN-S/M dan Standar Kekhasan SIT untuk setiap unit pendidikan binaan.
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
 Inisialisasi Audit Baru
 </Button>
 </div>
 </div>
 </div>

 {/* Unit Selector Bar if Items Exist */}
 {items.length > 0 && (
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 p-3.5 sm:p-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-2 flex-1 max-w-md">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">Pilih Unit:</span>
 <div className="flex-1">
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(selectedUnitId)}
 onChange={(val) => setSelectedUnitId(val)}
 options={items.map((item) => ({
 value: String(item.unit_id || item.id),
 label: `${item.unit_name} (${item.peringkat_saat_ini} - Kesiapan: ${item.kesiapan_total}%)`,
 }))}
 placeholder="Pilih Unit"
 aria-label="Pilih Unit Akreditasi"
 />
 </div>
 </div>

 {currentUnit && (
 <div className="flex items-center gap-2">
 <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60">
 {currentUnit.kode_audit}
 </span>
 <Button
 size="xs"
 variant="ghost"
 onClick={() => handleDelete(currentUnit.id)}
 className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg cursor-pointer"
 title="Hapus Audit Unit"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </Button>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Content Area */}
 {loading ? (
 <div className="py-16 text-center text-slate-400">
 <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
 <p className="text-xs font-bold">Memuat data radar akreditasi dari PostgreSQL database...</p>
 </div>
 ) : items.length === 0 ? (
 <div className="py-16 text-center text-slate-400">
 <div className="space-y-3 max-w-md mx-auto px-4">
 <div className="w-14 h-14 mx-auto rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shadow-inner">
 <Sparkles className="w-7 h-7" />
 </div>
 <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
 Belum Ada Data Audit Akreditasi di Database
 </h4>
 <p className="text-xs text-slate-500">
 Database bersih dan siap menerima data riil. Lakukan inisialisasi audit kesiapan akreditasi 8 Standar Nasional Pendidikan (SNP) & Kekhasan SIT pertama Anda melalui tombol di bawah.
 </p>
 <div className="pt-1">
 <Button
 variant="primary"
 size="sm"
 onClick={handleOpenAdd}
 className="bg-emerald-600 text-amber-600 font-bold text-xs rounded-lg shadow-sm cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 >
 <Plus className="w-4 h-4 mr-1.5" />
 Inisialisasi Audit Baru
 </Button>
 </div>
 </div>
 </div>
 ) : (
 currentUnit && (
 <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Kolom 1: Status Akreditasi & Ringkasan */}
 <div className="space-y-4 lg:col-span-1 bg-white dark:bg-[#1B2433] dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-5">
 <div className="space-y-1">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
 STATUS AKREDITASI UNIT
 </span>
 <h4 className="text-lg font-black text-slate-900 dark:text-white">
 {currentUnit.unit_name}
 </h4>
 <div className="pt-1">
 <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
 <Award className="w-3.5 h-3.5" />
 {currentUnit.peringkat_saat_ini}
 </span>
 </div>
 </div>

 <div className="p-3.5 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80/60 space-y-2.5 text-xs shadow-2xs">
 <div>
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
 Masa Berlaku Akreditasi
 </span>
 <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5 text-emerald-600" />
 {currentUnit.habis_berlaku}
 </p>
 </div>
 <div className="pt-2 border-t border-emerald-100/80 dark:border-emerald-700/80/50 flex justify-between items-center">
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
 Sisa Masa Aktif
 </span>
 <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black text-xs border border-emerald-200/80 dark:border-emerald-800/60">
 {currentUnit.sisa_waktu}
 </span>
 </div>
 </div>

 <div className="space-y-2 pt-2 border-t border-emerald-100/80 dark:border-emerald-800/60">
 <div className="flex justify-between items-center text-xs">
 <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
 Indeks Kesiapan Total
 </span>
 <span className="text-xl font-black text-indigo-700 dark:text-indigo-400">
 {currentUnit.kesiapan_total}%
 </span>
 </div>
 <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 h-2.5 rounded-full overflow-hidden">
 <div
 className="bg-indigo-600 h-full rounded-full transition-all duration-300"
 style={{ width: `${currentUnit.kesiapan_total}%` }}
 />
 </div>
 <p className="text-xs text-slate-500 italic mt-1">
 {currentUnit.kesiapan_total >= 90
 ? 'Status Sangat Siap menghadapi visitasi re-akreditasi.'
 : currentUnit.kesiapan_total >= 70
 ? 'Kesiapan sedang, lanjutkan pemenuhan berkas lampiran digital.'
 : 'Perlu percepatan pelengkapan bukti fisik digital.'}
 </p>
 </div>

 {currentUnit.rekomendasi_divisi && (
 <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-1">
 <span className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1">
 <AlertTriangle className="w-3.5 h-3.5" />
 Rekomendasi Divisi:
 </span>
 <p className="text-slate-700 dark:text-slate-300 italic">
 &ldquo;{currentUnit.rekomendasi_divisi}&rdquo;
 </p>
 </div>
 )}
 </div>

 {/* Kolom 2 & 3: Rincian 8 Standar SNP + JSIT */}
 <div className="lg:col-span-2 space-y-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-5 bg-white dark:bg-slate-900">
 <div className="flex justify-between items-center pb-2 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <div>
 <h4 className="text-sm font-black text-slate-900 dark:text-white">
 Checklist 8 Standar Nasional Pendidikan (SNP) & Kekhasan SIT
 </h4>
 <p className="text-xs text-slate-500">Klik butir standar untuk mengkinikan skor pemenuhan dokumen riil.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {currentUnit.standar?.map((s, idx) => (
 <div
 key={s.nama}
 onClick={() => handleOpenEdit(idx, s.skor, s.bukti)}
 className="p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group space-y-1.5"
 >
 <div className="flex justify-between items-start">
 <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors pr-2">
 {s.nama}
 </span>
 <span className="text-xs font-black text-indigo-700 dark:text-indigo-400">
 {s.skor}%
 </span>
 </div>
 <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 h-1.5 rounded-full overflow-hidden">
 <div
 className="bg-indigo-600 h-full rounded-full transition-all duration-300"
 style={{ width: `${s.skor}%` }}
 />
 </div>
 <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
 <span className="line-clamp-1">{s.bukti || 'Belum ada bukti dokumen'}</span>
 <span className="font-bold text-indigo-500 group-hover:underline shrink-0">Ubah &rarr;</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )
 )}
 </div>

 {/* Modal Inisialisasi Audit Baru */}
 <Modal
 isOpen={isAddModalOpen}
 onClose={() => setIsAddModalOpen(false)}
 title="Inisialisasi Audit Akreditasi Unit Sekolah"
 description="Pencatatan data audit akreditasi BAN-S/M dan rapor mutu 9 standar unit pendidikan."
 maxWidth="max-w-md"
 footer={
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)} disabled={saving}>
 Batal
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-emerald-600 text-amber-600 font-bold rounded-lg shadow-sm cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 onClick={handleSaveAdd}
 disabled={saving}
 >
 {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
 {saving ? 'Menyimpan...' : 'Simpan Data Audit'}
 </Button>
 </div>
 }
 >
 <div className="space-y-3.5 text-xs">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Unit Sekolah <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 size="sm"
 searchable
 value={String(addForm.unit_id)}
 onChange={(val) => setAddForm((p) => ({ ...p, unit_id: val }))}
 options={units.map((u) => ({
 value: String(u.id),
 label: `${u.name} (${u.code})`,
 }))}
 placeholder="Pilih Unit Sekolah"
 aria-label="Unit Sekolah"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Peringkat Akreditasi</label>
 <HeroUiFilterSelect
 size="sm"
 value={addForm.peringkat_saat_ini}
 onChange={(val) => setAddForm((p) => ({ ...p, peringkat_saat_ini: val }))}
 options={ranks.map((r) => ({
 value: r,
 label: r,
 }))}
 placeholder="Pilih Peringkat"
 aria-label="Peringkat Akreditasi"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Skor Akreditasi (0-100)</label>
 <Input
 type="number"
 value={String(addForm.skor_akreditasi)}
 onChange={(e) => setAddForm((p) => ({ ...p, skor_akreditasi: Number(e.target.value) }))}
 className="text-xs"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Habis Berlaku</label>
 <Input
 type="date"
 value={addForm.habis_berlaku}
 onChange={(e) => setAddForm((p) => ({ ...p, habis_berlaku: e.target.value }))}
 className="text-xs"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan / Rekomendasi Divisi</label>
 <Input
 placeholder="Contoh: Fokus pelengkapan berkas kurikulum & sarpras..."
 value={addForm.rekomendasi_divisi}
 onChange={(e) => setAddForm((p) => ({ ...p, rekomendasi_divisi: e.target.value }))}
 className="text-xs"
 />
 </div>
 </div>
 </Modal>

 {/* Modal Edit Skor Standar */}
 <Modal
 isOpen={isEditModalOpen}
 onClose={() => setIsEditModalOpen(false)}
 title="Perbarui Nilai Standar Akreditasi"
 maxWidth="max-w-md"
 footer={
 <div className="flex justify-end gap-2">
 <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
 Batal
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="bg-emerald-600 text-white font-bold rounded-lg cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 h-9 px-4 text-sm font-medium"
 onClick={handleSaveSkor}
 disabled={saving}
 >
 {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> : null}
 {saving ? 'Menyimpan...' : 'Simpan Nilai'}
 </Button>
 </div>
 }
 >
 <div className="space-y-3.5 text-xs">
 <p className="font-extrabold text-slate-900 dark:text-white">
 {currentUnit?.standar[editIndex]?.nama}
 </p>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Nilai Ketercapaian Dokumen (0 - 100%)
 </label>
 <Input
 type="number"
 min="0"
 max="100"
 value={String(editSkor)}
 onChange={(e) => setEditSkor(e.target.value)}
 className="text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Keterangan Bukti Dokumen
 </label>
 <Input
 placeholder="Contoh: Lengkap (Portofolio Digital Google Drive & Map Fisik)"
 value={editBukti}
 onChange={(e) => setEditBukti(e.target.value)}
 className="text-xs"
 />
 </div>
 </div>
 </Modal>
 </div>
 )
}

RadarAkreditasiSection.propTypes = {
 onDataMutate: PropTypes.func,
}
