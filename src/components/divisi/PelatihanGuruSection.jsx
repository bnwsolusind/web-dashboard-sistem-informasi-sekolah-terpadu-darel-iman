import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
    Sparkles,
    Search,
    Plus,
    Trash2,
    Edit3,
    CheckCircle2,
    Clock,
    Award,
    Users,
    GraduationCap,
    Calendar,
    Layers,
    BookOpen,
    Building2,
    Filter,
    RefreshCw,
    HelpCircle,
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { TextArea } from '../ui/text-area'
import { Modal } from '../ui/modal'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/table'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { useToast } from '../app/ToastProvider'
import { divisiPendidikanWorkspaceService } from '../../services/divisiPendidikanWorkspaceService'
import Swal from 'sweetalert2'

export default function PelatihanGuruSection({ onDataMutate }) {
    const toast = useToast()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [filterKategori, setFilterKategori] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    // Relational options from PostgreSQL
    const [units, setUnits] = useState([])
    const [categories, setCategories] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        id: null,
        nama: '',
        kategori: 'Pedagogik & Asesmen',
        narasumber: '',
        jam_pelatihan: 32,
        tanggal_mulai: new Date().toISOString().split('T')[0],
        tanggal_selesai: '',
        lokasi: 'Aula Utama Yayasan & Zoom',
        kuota: 100,
        status: 'akan_datang',
        deskripsi: '',
        target_unit_id: '',
    })

    const loadData = async () => {
        setLoading(true)
        try {
            const [list, optionsData] = await Promise.all([
                divisiPendidikanWorkspaceService.getPelatihanList(),
                divisiPendidikanWorkspaceService.getPelatihanOptions(),
            ])
            setItems(Array.isArray(list) ? list : [])
            setUnits(optionsData?.units || [])
            setCategories(
                optionsData?.categories || [
                    'Pedagogik & Asesmen',
                    'Kepribadian & Konseling BK',
                    'Bahasa & Keislaman',
                    'Teknologi & Media Belajar',
                    'Kepemimpinan & Manajemen Sekolah',
                ]
            )
        } catch (e) {
            console.error('Gagal memuat data pelatihan guru:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            if (filterKategori !== 'all' && item.kategori !== filterKategori && !item.kategori.includes(filterKategori)) {
                return false
            }
            if (filterStatus !== 'all' && item.status !== filterStatus) {
                return false
            }
            if (search.trim()) {
                const q = search.toLowerCase()
                const text = `${item.kode_pelatihan || ''} ${item.nama || ''} ${item.narasumber || ''} ${item.kategori || ''} ${item.lokasi || ''} ${item.target_unit_name || ''}`.toLowerCase()
                if (!text.includes(q)) return false
            }
            return true
        })
    }, [items, filterKategori, filterStatus, search])

    // Summary Metrics
    const stats = useMemo(() => {
        const total = items.length
        const totalJP = items.reduce((acc, curr) => acc + (Number(curr.jam_pelatihan) || 0), 0)
        const totalPeserta = items.reduce((acc, curr) => acc + (Number(curr.terdaftar) || 0), 0)
        const selesai = items.filter((i) => i.status === 'selesai').length
        const aktif = items.filter((i) => i.status === 'berjalan' || i.status === 'akan_datang').length

        return { total, totalJP, totalPeserta, selesai, aktif }
    }, [items])

    const handleOpenAdd = () => {
        setFormData({
            id: null,
            nama: '',
            kategori: 'Pedagogik & Asesmen',
            narasumber: '',
            jam_pelatihan: 32,
            tanggal_mulai: new Date().toISOString().split('T')[0],
            tanggal_selesai: '',
            lokasi: 'Aula Utama Yayasan & Zoom',
            kuota: 100,
            status: 'akan_datang',
            deskripsi: '',
            target_unit_id: '',
        })
        setIsModalOpen(true)
    }

    const handleOpenEdit = (item) => {
        setFormData({
            id: item.id,
            nama: item.nama || '',
            kategori: item.kategori || 'Pedagogik & Asesmen',
            narasumber: item.narasumber || '',
            jam_pelatihan: item.jam_pelatihan || 32,
            tanggal_mulai: item.tanggal_mulai || new Date().toISOString().split('T')[0],
            tanggal_selesai: item.tanggal_selesai || '',
            lokasi: item.lokasi || 'Aula Utama Yayasan & Zoom',
            kuota: item.kuota || 100,
            status: item.status || 'akan_datang',
            deskripsi: item.deskripsi || '',
            target_unit_id: item.target_unit_id || '',
        })
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.nama.trim()) {
            toast('Mohon isi Nama Program Pelatihan / Workshop.', 'warning')
            return
        }
        if (!formData.tanggal_mulai) {
            toast('Mohon isi Tanggal Pelaksanaan.', 'warning')
            return
        }

        setSaving(true)
        try {
            await divisiPendidikanWorkspaceService.savePelatihan(formData)
            toast('Program pelatihan berhasil disimpan.', 'success')
            setIsModalOpen(false)
            await loadData()
            onDataMutate?.()
        } catch (e) {
            toast('Gagal menyimpan program pelatihan: ' + (e.response?.data?.message || e.message), 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        const res = await Swal.fire({
            title: 'Hapus Program Pelatihan?',
            text: 'Hapus program pelatihan ini secara permanen dari database?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#e11d48',
        })
        if (res.isConfirmed) {
            try {
                await divisiPendidikanWorkspaceService.deletePelatihan(id)
                toast('Program pelatihan berhasil dihapus.', 'success')
                await loadData()
                onDataMutate?.()
            } catch (e) {
                toast('Gagal menghapus program pelatihan.', 'error')
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <Card className="rounded-[18px] border border-teal-500/20 bg-gradient-to-br from-teal-50/70 via-white to-teal-50/30 dark:from-teal-950/40 dark:via-slate-900 dark:to-teal-950/20 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                                Total Workshop
                            </p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Program terdaftar di DB</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
                            <Layers className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[18px] border border-emerald-500/20 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                Total Jam Pelatihan
                            </p>
                            <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.totalJP} JP</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Target &ge; 32 JP/guru</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[18px] border border-sky-500/20 bg-gradient-to-br from-sky-50/70 via-white to-sky-50/30 dark:from-sky-950/40 dark:via-slate-900 dark:to-sky-950/20 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                                Guru Terdaftar
                            </p>
                            <h4 className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-1">{stats.totalPeserta}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Peserta aktif workshop</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
                            <Users className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[18px] border border-amber-500/20 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                                Status Program
                            </p>
                            <h4 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                                {stats.aktif} <span className="text-xs font-semibold text-slate-500">/ {stats.selesai} Selesai</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Aktif / Berjalan</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/30">
                            <Clock className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header Toolbar */}
            <Card className="border border-teal-500/25 shadow-sm bg-gradient-to-r from-teal-50/40 via-emerald-50/20 to-white dark:bg-slate-900">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-teal-600" />
                                Manajemen Pelatihan Guru & Pemenuhan Jam Pelatihan (JP)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Pengelolaan program workshop terpadu untuk memastikan setiap guru memenuhi target minimal 32 JP pengembangan profesi per tahun.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadData}
                                disabled={loading}
                                className="rounded-xl text-xs font-bold border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                                Muat Ulang
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 rounded-xl"
                                onClick={handleOpenAdd}
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Buat Program Workshop
                            </Button>
                        </div>
                    </div>

                    {/* Interactive Filters with Hero UI dropdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-teal-500/15">
                        <div className="relative">
                            <Input
                                placeholder="Cari program, narasumber, lokasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-xs pl-8 rounded-xl border-slate-200/80"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                        </div>

                        <HeroUiFilterSelect
                            value={filterKategori}
                            onChange={setFilterKategori}
                            options={[
                                { value: 'all', label: 'Semua Bidang Kompetensi' },
                                ...categories.map((c) => ({ value: c, label: c })),
                            ]}
                            icon={Filter}
                            placeholder="Filter Bidang Kompetensi"
                            ariaLabel="Filter Kategori"
                            size="md"
                        />

                        <HeroUiFilterSelect
                            value={filterStatus}
                            onChange={setFilterStatus}
                            options={[
                                { value: 'all', label: 'Semua Status Pelatihan' },
                                { value: 'akan_datang', label: 'Akan Datang / Terjadwal', badge: 'Jadwal', badgeColor: 'bg-sky-100 text-sky-700' },
                                { value: 'berjalan', label: 'Sedang Berjalan', badge: 'Berjalan', badgeColor: 'bg-emerald-100 text-emerald-700' },
                                { value: 'selesai', label: 'Selesai Dilaksanakan', badge: 'Selesai', badgeColor: 'bg-slate-100 text-slate-700' },
                                { value: 'dibatalkan', label: 'Dibatalkan', badge: 'Batal', badgeColor: 'bg-rose-100 text-rose-700' },
                            ]}
                            icon={CheckCircle2}
                            placeholder="Status Pelatihan"
                            ariaLabel="Filter Status"
                            size="md"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Datatable Outer Container */}
            <div className="relative overflow-hidden rounded-[22px] border-2 border-teal-300 dark:border-teal-800/80 bg-white shadow-md shadow-teal-500/10 dark:bg-[#1B2433]">
                <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent px-5 py-3.5 border-b border-teal-200/90 dark:border-teal-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                            Kalender Program Workshop & Rekapitulasi Pelatihan Guru
                        </span>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-300/40">
                        {filteredItems.length} Program Database
                    </span>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                        <p className="text-xs font-bold">Memuat data pelatihan guru dari PostgreSQL database...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        {items.length === 0 ? (
                            <div className="space-y-3 max-w-md mx-auto px-4">
                                <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center shadow-inner">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                                    Belum Ada Program Workshop Pelatihan di Database
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Database bersih dan siap menerima data riil. Buat program workshop atau pelatihan pengembangan profesi pertama Anda untuk standarisasi pemenuhan target 32 JP guru tahun ajaran ini.
                                </p>
                                <div className="pt-1">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleOpenAdd}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/30 cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        Buat Program Workshop Baru
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    Tidak ada program pelatihan yang cocok dengan filter pencarian.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter di atas.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <Table aria-label="Tabel Program Pelatihan Guru">
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-teal-100/90 via-emerald-50/70 to-teal-100/90 border-b-2 border-teal-200/90 dark:from-teal-950/90 dark:via-emerald-950/70 dark:to-teal-950/90">
                                <TableCell className="font-extrabold text-xs text-teal-950 dark:text-teal-200">KODE & NAMA WORKSHOP</TableCell>
                                <TableCell className="font-extrabold text-xs text-teal-950 dark:text-teal-200">BIDANG KOMPETENSI</TableCell>
                                <TableCell className="font-extrabold text-xs text-teal-950 dark:text-teal-200">NARASUMBER & LOKASI</TableCell>
                                <TableCell className="font-extrabold text-xs text-teal-950 dark:text-teal-200">BOBOT JP</TableCell>
                                <TableCell className="font-extrabold text-xs text-teal-950 dark:text-teal-200">PESERTA / KUOTA</TableCell>
                                <TableCell className="font-extrabold text-xs text-teal-950 dark:text-teal-200">STATUS</TableCell>
                                <TableCell className="font-extrabold text-xs text-right text-teal-950 dark:text-teal-200">AKSI DIVISI</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-teal-100/70 dark:divide-teal-900/40">
                            {filteredItems.map((item) => {
                                const percent = item.kuota > 0 ? Math.round((item.terdaftar / item.kuota) * 100) : 0
                                return (
                                    <TableRow key={item.id} className="hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-colors">
                                        <TableCell>
                                            <div className="py-1 space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-black font-mono text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950 px-1.5 py-0.5 rounded border border-teal-300/60">
                                                        {item.kode_pelatihan || 'TRN-2026'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        {item.tanggal}
                                                    </span>
                                                </div>
                                                <p className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug">
                                                    {item.nama}
                                                </p>
                                                {item.target_unit_name && (
                                                    <p className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1">
                                                        <Building2 className="w-3 h-3 text-teal-500" />
                                                        Target: {item.target_unit_name}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-100/80 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200">
                                                {item.kategori}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.narasumber}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{item.lokasi}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-xs font-black text-slate-900 dark:text-white">{item.jam_pelatihan} JP</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                    <span>{item.terdaftar} / {item.kuota}</span>
                                                    <span className="text-[10px] text-slate-400">({percent}%)</span>
                                                </div>
                                                <div className="w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${percent >= 100 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-teal-500'
                                                            }`}
                                                        style={{ width: `${Math.min(100, percent)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${item.status === 'selesai'
                                                    ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300'
                                                    : item.status === 'berjalan'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                                                        : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300'
                                                    }`}
                                            >
                                                {item.status === 'selesai' ? 'SELESAI' : item.status === 'berjalan' ? 'SEDANG BERJALAN' : 'AKAN DATANG'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(item)}
                                                    title="Ubah Program"
                                                    className="flex items-center justify-center h-8 w-8 rounded-xl bg-teal-100/80 hover:bg-teal-200/90 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 cursor-pointer transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Hapus Program"
                                                    className="flex items-center justify-center h-8 w-8 rounded-xl bg-rose-100/80 hover:bg-rose-200/90 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 cursor-pointer transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Modal Formulir Tambah / Edit Workshop */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={formData.id ? 'Ubah Program Workshop' : 'Buat Program Workshop Guru Baru'}
                description="Rancang agenda pelatihan pengembangan kompetensi pendidik dan pemenuhan target 32 JP."
                maxWidth="max-w-xl"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} disabled={saving}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Program Pelatihan'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Nama Program Pelatihan / Workshop <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            value={formData.nama}
                            onChange={(e) => setFormData((p) => ({ ...p, nama: e.target.value }))}
                            placeholder="Contoh: Workshop Implementasi Deep Learning & HOTS dalam Kurikulum SIT"
                            className="text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Bidang Kompetensi (Kategori)
                            </label>
                            <HeroUiFilterSelect
                                value={formData.kategori}
                                onChange={(val) => setFormData((p) => ({ ...p, kategori: val }))}
                                options={categories.map((c) => ({ value: c, label: c }))}
                                placeholder="Pilih Bidang Kompetensi"
                                size="sm"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Target Sasaran Unit Sekolah
                            </label>
                            <HeroUiFilterSelect
                                value={formData.target_unit_id}
                                onChange={(val) => setFormData((p) => ({ ...p, target_unit_id: val }))}
                                options={[
                                    { value: '', label: 'Seluruh Unit Sekolah Yayasan (Umum)' },
                                    ...units.map((u) => ({ value: String(u.id), label: `${u.name} (${u.code})` })),
                                ]}
                                placeholder="Seluruh Unit Sekolah Yayasan (Umum)"
                                searchable={units.length > 5}
                                size="sm"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Narasumber / Instruktur Ahli
                            </label>
                            <Input
                                value={formData.narasumber}
                                onChange={(e) => setFormData((p) => ({ ...p, narasumber: e.target.value }))}
                                placeholder="Contoh: Dr. H. Sukro Muhab, M.Si"
                                className="text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Bobot Jam Pelatihan (JP)
                            </label>
                            <Input
                                type="number"
                                min="1"
                                max="200"
                                value={formData.jam_pelatihan}
                                onChange={(e) => setFormData((p) => ({ ...p, jam_pelatihan: Number(e.target.value) }))}
                                className="text-xs font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Tanggal Mulai <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="date"
                                value={formData.tanggal_mulai}
                                onChange={(e) => setFormData((p) => ({ ...p, tanggal_mulai: e.target.value }))}
                                className="text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Tanggal Selesai (Opsional)
                            </label>
                            <Input
                                type="date"
                                value={formData.tanggal_selesai}
                                onChange={(e) => setFormData((p) => ({ ...p, tanggal_selesai: e.target.value }))}
                                className="text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Lokasi Pelaksanaan
                            </label>
                            <Input
                                value={formData.lokasi}
                                onChange={(e) => setFormData((p) => ({ ...p, lokasi: e.target.value }))}
                                placeholder="Aula / Zoom"
                                className="text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Kapasitas Kuota Peserta
                            </label>
                            <Input
                                type="number"
                                min="1"
                                value={formData.kuota}
                                onChange={(e) => setFormData((p) => ({ ...p, kuota: Number(e.target.value) }))}
                                className="text-xs font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Status Program
                            </label>
                            <HeroUiFilterSelect
                                value={formData.status}
                                onChange={(val) => setFormData((p) => ({ ...p, status: val }))}
                                options={[
                                    { value: 'akan_datang', label: 'Akan Datang (Terjadwal)' },
                                    { value: 'berjalan', label: 'Sedang Berjalan' },
                                    { value: 'selesai', label: 'Selesai Dilaksanakan' },
                                    { value: 'dibatalkan', label: 'Dibatalkan' },
                                ]}
                                placeholder="Pilih Status"
                                size="sm"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Deskripsi & Silabus Ringkas Program
                        </label>
                        <TextArea
                            rows={2}
                            placeholder="Jelaskan silabus ringkas pelatihan, materi inti yang dibahas, dan target capaian guru..."
                            value={formData.deskripsi}
                            onChange={(e) => setFormData((p) => ({ ...p, deskripsi: e.target.value }))}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}

PelatihanGuruSection.propTypes = {
    onDataMutate: PropTypes.func,
}
