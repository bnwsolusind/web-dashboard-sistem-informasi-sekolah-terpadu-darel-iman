import {
  CloseButton
} from '../../components/ui/close-button'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Users,
  Receipt,
  Printer,
  ChevronDown,
  Trash2,
  Eye,
  Check,
  X,
  Wallet,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import ActionDropdown from '../../components/app/ActionDropdown'
import api from '../../services/api'
import {
  Card
} from '../../components/ui/card'
import {
  Badge
} from '../../components/ui/badge'
import {
  Button
} from '../../components/ui/button'
import {
  Avatar,
  AvatarFallback
} from '../../components/ui/avatar'
import {
  Pagination
} from '../../components/ui/pagination'
import {
  DatePicker
} from '@/components/ui/date-picker'
import {
  PageToolbarActions,
  KpiStatCard,
  KpiStatGrid,
  StandardSearchInput
} from '../../components/app'
import {
  printCleanTable,
  resolveFoundationName
} from '../../utils/printHelper'
import {
  usePengaturanStore
} from '../../stores/pengaturanStore'
import {
  useAuthStore
} from '../../stores/authStore'

const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
        Number(val || 0)
    )

const formatDate = (val) => {
    if (!val) return '-'
    try {
        return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val))
    } catch {
        return val
    }
}

// Custom debounce hook
function useDebounce(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
}

function HarmonizedDeleteBillModal({ isOpen, onClose, onConfirm, bill, isSubmitting, error }) {
    if (!isOpen || !bill) return null
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] dark:border-emerald-800/60 dark:bg-[#1B2433]"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3.5 mb-4">
                        <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-sm">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                                Hapus Tagihan
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                                Hapus Tagihan Siswa?
                            </h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        Apakah Anda yakin ingin menghapus tagihan <strong className="text-slate-900 dark:text-white">"{bill.title}"</strong> untuk siswa <strong className="text-slate-900 dark:text-white">{bill.student?.nama_lengkap || 'ini'}</strong>?
                    </p>
                    {error && (
                        <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 p-3 mb-4 text-xs font-semibold text-rose-700 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300">
                            {error}
                        </div>
                    )}
                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3 dark:border-emerald-800/60 dark:bg-rose-950/20 mb-6">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-rose-800 dark:text-rose-300">
                                Data tagihan yang terhapus tidak dapat dipulihkan kembali.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-9 px-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className="h-9 px-5 rounded-xl bg-white dark:bg-[#1B2433] hover:from-rose-700 hover:to-red-700 text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Tagihan'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default function StudentBillsManagementPage() {
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, bill: null, isSubmitting: false, error: '' })
    const pengaturan = usePengaturanStore((state) => state.pengaturan)
    const foundationName = resolveFoundationName(pengaturan)
    const user = useAuthStore((state) => state.user)

    const isGlobalUser = useMemo(() => {
        return Boolean(
            user?.is_superadmin ||
            user?.roles?.some((r) => ['Super Admin', 'super_admin', 'Admin', 'admin', 'Yayasan', 'Ketua Yayasan', 'Pengurus Yayasan', 'Divisi Pendidikan'].includes(r))
        )
    }, [user])

    const userUnitId = useMemo(() => {
        return user?.unit_id || user?.education_unit_id || user?.employee?.unit_id || user?.metadata?.unit_id || user?.metadata?.education_unit_id || user?.scope?.unit_id || ''
    }, [user])

    const [bills, setBills] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 })
    const [stats, setStats] = useState({
        total_bills: 0,
        total_nominal: 0,
        paid_nominal: 0,
        unpaid_nominal: 0,
        overdue_count: 0,
        collection_rate: 0,
    })

    const [loading, setLoading] = useState(true)
    const [loadingStats, setLoadingStats] = useState(true)
    const [error, setError] = useState('')

    // Filter states
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 350)
    const [selectedUnit, setSelectedUnit] = useState(() => (!isGlobalUser && userUnitId ? String(userUnitId) : ''))
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        if (!isGlobalUser && userUnitId && !selectedUnit) {
            setSelectedUnit(String(userUnitId))
        }
    }, [isGlobalUser, userUnitId, selectedUnit])

    // Master options
    const [units, setUnits] = useState([])
    const [classes, setClasses] = useState([])
    const [feeCategories, setFeeCategories] = useState([])
    const [students, setStudents] = useState([])

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isPayModalOpen, setIsPayModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedBill, setSelectedBill] = useState(null)
    const [activeReceipt, setActiveReceipt] = useState(null)

    // Form Create Bill
    const [createForm, setCreateForm] = useState({
        mode: 'single',
        student_id: '',
        class_id: '',
        fee_category_id: '',
        title: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
    })
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState('')

    // Form Pay Bill
    const [payForm, setPayForm] = useState({
        paid_amount: '',
        payment_method: 'TUNAI_KASIR',
        paid_at: new Date().toISOString().split('T')[0],
        notes: '',
    })
    const [paying, setPaying] = useState(false)
    const [payError, setPayError] = useState('')

    // 1. Fetch Reference Data (Units, Classes, Fee Categories)
    useEffect(() => {
        // Units
        api.get('/education-units')
            .then((res) => {
                const d = res.data?.data?.data ?? res.data?.data ?? []
                setUnits(Array.isArray(d) ? d : [])
            })
            .catch(() => { })

        // Fee Categories
        api.get('/finance/fee-categories')
            .then((res) => {
                const d = res.data?.data ?? []
                setFeeCategories(Array.isArray(d) ? d : [])
            })
            .catch(() => { })
    }, [])

    // Fetch classes when selectedUnit changes or on initial load
    useEffect(() => {
        const effectiveUnit = selectedUnit || (!isGlobalUser ? userUnitId : '')
        const params = effectiveUnit ? { unit_id: effectiveUnit, per_page: 100 } : { per_page: 100 }
        api.get('/classes', { params })
            .then((res) => {
                const d = res.data?.data?.data ?? res.data?.data ?? []
                setClasses(Array.isArray(d) ? d : [])
            })
            .catch(() => { })
    }, [selectedUnit, isGlobalUser, userUnitId])

    // Fetch students for create modal when class selected
    useEffect(() => {
        if (createForm.class_id) {
            api.get('/students', { params: { class_id: createForm.class_id, per_page: 100 } })
                .then((res) => {
                    const d = res.data?.data?.data ?? res.data?.data ?? []
                    setStudents(Array.isArray(d) ? d : [])
                })
                .catch(() => { })
        } else {
            setStudents([])
        }
    }, [createForm.class_id])

    // 2. Fetch Stats
    const loadStats = useCallback(() => {
        setLoadingStats(true)
        const params = {}
        if (selectedUnit) params.unit_id = selectedUnit
        api.get('/finance/stats', { params })
            .then((res) => {
                if (res.data?.success) {
                    setStats(res.data.data)
                }
            })
            .catch(() => { })
            .finally(() => setLoadingStats(false))
    }, [selectedUnit])

    // 3. Fetch Bills List
    const loadBills = useCallback(() => {
        setLoading(true)
        setError('')
        const params = {
            page,
            per_page: meta.per_page,
        }
        if (selectedUnit) params.unit_id = selectedUnit
        if (selectedClass) params.class_id = selectedClass
        if (selectedStatus) params.status = selectedStatus
        if (debouncedSearch) params.search = debouncedSearch

        api.get('/finance/bills', { params })
            .then((res) => {
                if (res.data?.success) {
                    const p = res.data.data
                    setBills(p.data || [])
                    setMeta({
                        current_page: p.current_page || 1,
                        last_page: p.last_page || 1,
                        total: p.total || 0,
                        per_page: p.per_page || 20,
                    })
                }
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Gagal memuat daftar tagihan.')
            })
            .finally(() => setLoading(false))
    }, [page, meta.per_page, selectedUnit, selectedClass, selectedStatus, debouncedSearch])

    useEffect(() => {
        loadStats()
    }, [loadStats])

    useEffect(() => {
        loadBills()
    }, [loadBills])

    // Handlers
    const handleOpenCreateModal = () => {
        setCreateForm({
            mode: 'single',
            student_id: '',
            class_id: classes[0]?.id || '',
            fee_category_id: feeCategories[0]?.id || '',
            title: 'SPP Bulan September 2026',
            amount: feeCategories[0]?.default_amount || '500000',
            due_date: new Date().toISOString().split('T')[0],
        })
        setCreateError('')
        setIsCreateModalOpen(true)
    }

    const handleSaveCreateBill = async (e) => {
        e.preventDefault()
        setCreating(true)
        setCreateError('')
        try {
            const payload = {
                title: createForm.title,
                amount: Number(createForm.amount),
                due_date: createForm.due_date,
                fee_category_id: createForm.fee_category_id,
                mode: createForm.mode,
            }
            if (createForm.mode === 'single') {
                if (!createForm.student_id) throw new Error('Harap pilih siswa.')
                payload.student_id = createForm.student_id
            } else {
                if (!createForm.class_id) throw new Error('Harap pilih kelas rombel.')
                payload.class_id = createForm.class_id
            }

            await api.post('/finance/bills', payload)
            setIsCreateModalOpen(false)
            loadBills()
            loadStats()
        } catch (err) {
            setCreateError(err.response?.data?.message || err.message || 'Gagal menerbitkan tagihan.')
        } finally {
            setCreating(false)
        }
    }

    const handleOpenPayModal = (bill) => {
        setSelectedBill(bill)
        const remaining = Number(bill.amount) - (bill.payments?.reduce((acc, p) => acc + Number(p.paid_amount), 0) || 0)
        setPayForm({
            paid_amount: remaining > 0 ? String(remaining) : String(bill.amount),
            payment_method: 'TUNAI_KASIR',
            paid_at: new Date().toISOString().split('T')[0],
            notes: '',
        })
        setPayError('')
        setIsPayModalOpen(true)
    }

    const handleSavePayment = async (e) => {
        e.preventDefault()
        if (!selectedBill) return
        setPaying(true)
        setPayError('')
        try {
            await api.post(`/finance/bills/${selectedBill.id}/payments`, {
                paid_amount: Number(payForm.paid_amount),
                payment_method: payForm.payment_method,
                paid_at: payForm.paid_at,
                notes: payForm.notes,
            })
            setIsPayModalOpen(false)
            loadBills()
            loadStats()
        } catch (err) {
            setPayError(err.response?.data?.message || err.message || 'Gagal mencatat pembayaran.')
        } finally {
            setPaying(false)
        }
    }

    const handleDeleteBill = (bill) => {
        setDeleteModal({ isOpen: true, bill, isSubmitting: false, error: '' })
    }

    const confirmDeleteBill = async () => {
        if (!deleteModal.bill) return
        setDeleteModal((prev) => ({ ...prev, isSubmitting: true, error: '' }))
        try {
            await api.delete(`/finance/bills/${deleteModal.bill.id}`)
            loadBills()
            loadStats()
            setDeleteModal({ isOpen: false, bill: null, isSubmitting: false, error: '' })
        } catch (err) {
            setDeleteModal((prev) => ({
                ...prev,
                isSubmitting: false,
                error: err.response?.data?.message || 'Gagal menghapus tagihan.',
            }))
        }
    }

    const handlePrintReceipt = (bill, payment) => {
        setActiveReceipt({ bill, payment })
        const activePayment = payment || {}
        const studentName = bill?.student?.nama_lengkap || bill?.student?.full_name || bill?.student?.name || '-'
        const unitName = bill?.student?.unit?.nama_unit || bill?.student?.unit?.name || resolveFoundationName()
        printCleanTable({
            title: 'BUKTI PEMBAYARAN & KUITANSI RESMI (SPP)',
            subtitle: `No. Kuitansi: ${activePayment.invoice_number || 'INV-OFFICIAL'} | Tanggal: ${formatDate(activePayment.paid_at || activePayment.created_at || new Date())}`,
            headers: ['Uraian Tagihan', 'Nama Siswa', 'NIS', 'Kelas', 'Metode Pembayaran', 'Jumlah Diterima', 'Status'],
            rows: [[
                bill?.title || 'Pembayaran Tagihan SPP',
                studentName,
                bill?.student?.nis || '-',
                bill?.student?.kelas?.nama_kelas || bill?.student?.class_name || '-',
                activePayment.payment_method || 'Tunai / Transfer',
                formatRupiah(activePayment.paid_amount || bill?.amount || 0),
                'LUNAS - TERVERIFIKASI KASIR',
            ]],
            unit: unitName,
            orientation: 'portrait',
            customFooter: `
 <div style="display:flex; justify-content:space-between; margin-top:35px; font-size:9pt; text-align:center;">
 <div>
 <p style="margin:0 0 45px 0;">Penyetor / Orang Tua Siswa</p>
 <p style="margin:0; font-weight:bold;">(${studentName !== '-' ? studentName : 'Orang Tua / Wali Santri'})</p>
 </div>
 <div>
 <p style="margin:0 0 45px 0;">Kasir / Bagian Keuangan</p>
 <p style="margin:0; font-weight:bold;">(${activePayment.metadata?.cashier_name || 'Petugas Keuangan'})</p>
 </div>
 </div>
 `,
        })
    }

    return (
        <div className="space-y-6 pb-12">
            {/* 1. BREADCRUMB */}
            <AppBreadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Keuangan Siswa', href: '/dashboard/keuangan/tagihan-siswa' },
                    { label: 'Tagihan & Pembayaran SPP' },
                ]}
            />

            {/* 2. MODERN HERO CARD HEADER (HEROUI STYLE) */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                            
            <CreditCard className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                                    MODUL KEUANGAN & TATA USAHA
                                </span>
                                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                    {foundationName}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                Kelola Tagihan & Pembayaran SPP Siswa
                            </h1>
                            <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                                Penerbitan tagihan pendidikan, pencatatan transaksi kasir sekolah, dan penerbitan bukti kuitansi resmi.
                            </p>
                        </div>
                    </div>

                    <PageToolbarActions
                        onRefresh={() => {
                            loadStats()
                            loadBills()
                        }}
                        refreshing={loading}
                        primaryAction={{
                            label: 'Terbitkan Tagihan',
                            icon: Plus,
                            onClick: handleOpenCreateModal,
                        }}
                    />
                </div>
            </div>

            {/* 3. MASTER STATS GRID (4 KPI CARDS) */}
            <KpiStatGrid columns={4}>
                <KpiStatCard
                    title="Total Tagihan Diterbitkan"
                    value={formatRupiah(stats.total_nominal)}
                    subtitle={`${stats.total_bills.toLocaleString('id-ID')} tagihan aktif`}
                    icon={Layers}
                    tone="emerald"
                />
                <KpiStatCard
                    title="Total Nominal Terbayar"
                    value={formatRupiah(stats.paid_nominal)}
                    subtitle={`Tingkat Kolektibilitas: ${stats.collection_rate}%`}
                    icon={CheckCircle2}
                    tone="sky"
                />
                <KpiStatCard
                    title="Total Nominal Tertunggak"
                    value={formatRupiah(stats.unpaid_nominal)}
                    subtitle="Belum dilunasi orang tua siswa"
                    icon={Clock}
                    tone="amber"
                />
                <KpiStatCard
                    title="Jatuh Tempo / Lewat Batas"
                    value={`${stats.overdue_count} Siswa`}
                    subtitle="Perlu tindak lanjut bendahara"
                    icon={AlertCircle}
                    tone="rose"
                />
            </KpiStatGrid>

            {/* 4. EMERALD DATATABLE CONTAINER */}
            <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]">
                {/* Toolbar Header */}
                <div className="border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-4 sm:p-5 dark:border-emerald-800/60 dark:from-emerald-950/50 dark:via-teal-950/30">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white">Daftar Tagihan Siswa</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Menampilkan total {meta.total} baris tagihan siswa aktif
                            </p>
                        </div>

                        {/* Filter Group */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Unit Filter */}
                            <CustomSelect
                                value={selectedUnit}
                                disabled={!isGlobalUser && Boolean(userUnitId)}
                                onChange={(e) => {
                                    setSelectedUnit(e.target.value)
                                    setSelectedClass('')
                                    setPage(1)
                                }}
                                className={`h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 ${!isGlobalUser && Boolean(userUnitId) ? 'cursor-not-allowed opacity-80' : ''}`}
                            >
                                {isGlobalUser && <option value="">Semua Unit Pendidikan</option>}
                                {units
                                    .filter((u) => isGlobalUser || String(u.id) === String(userUnitId))
                                    .map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                            </CustomSelect>

                            {/* Class Filter */}
                            <CustomSelect
                                value={selectedClass}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value)
                                    setPage(1)
                                }}
                                className="h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200"
                            >
                                <option value="">Semua Rombel / Kelas</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nama_kelas || c.name}
                                    </option>
                                ))}
                            </CustomSelect>

                            {/* Status Filter */}
                            <CustomSelect
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value)
                                    setPage(1)
                                }}
                                className="h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200"
                            >
                                <option value="">Semua Status</option>
                                <option value="unpaid">Belum Lunas</option>
                                <option value="paid">Lunas</option>
                                <option value="overdue">Jatuh Tempo</option>
                            </CustomSelect>

                            {/* Search Box */}
                            <StandardSearchInput
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setPage(1)
                                }}
                                placeholder="Cari siswa atau NIS..."
                            />
                        </div>
                    </div>
                </div>

                {/* Datatable Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-4 py-3.5">SISWA &amp; IDENTITAS</th>
                                <th className="px-4 py-3.5">KELAS &amp; UNIT</th>
                                <th className="px-4 py-3.5">URAIAN TAGIHAN &amp; NOMINAL</th>
                                <th className="px-4 py-3.5 text-center">STATUS &amp; KUITANSI</th>
                                <th className="px-4 py-3.5 text-right w-16 sm:w-20 select-none"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                            {bills.map((b) => {
                                const isPaid = String(b.status).toLowerCase() === 'paid'
                                const isOverdue = !isPaid && b.due_date && new Date(b.due_date) < new Date()
                                const latestPayment = Array.isArray(b.payments) && b.payments.length > 0 ? b.payments[0] : null

                                return (
                                    <tr key={b.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                                        {/* Kolom Siswa */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar size="sm">
                                                    <AvatarFallback className="bg-emerald-100 font-bold text-emerald-800">
                                                        {b.student?.nama_lengkap?.[0] || 'S'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        {b.student?.nama_lengkap || 'Nama Siswa'}
                                                    </p>
                                                    <p className="font-mono text-xs text-slate-400">
                                                        NIS: {b.student?.nis || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kolom Kelas & Unit */}
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">
                                                {b.student?.kelas?.nama_kelas || '-'}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {b.student?.kelas?.unit_pendidikan?.name || 'Yayasan'}
                                            </p>
                                        </td>

                                        {/* Kolom Uraian & Nominal */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{b.title}</p>
                                                    <Badge color="cyan" size="xs" className="mt-0.5">
                                                        {b.fee_category?.name || 'SPP'}
                                                    </Badge>
                                                </div>
                                                <p className="font-black text-sm text-slate-900 dark:text-white">{formatRupiah(b.amount)}</p>
                                            </div>
                                        </td>

                                        {/* Kolom Status & Kuitansi */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    {isPaid ? (
                                                        <Badge color="success" size="sm" className="font-bold">
                                                            LUNAS
                                                        </Badge>
                                                    ) : isOverdue ? (
                                                        <Badge color="error" size="sm" className="font-bold">
                                                            TERLAMBAT
                                                        </Badge>
                                                    ) : (
                                                        <Badge color="warning" size="sm" className="font-bold">
                                                            BELUM LUNAS
                                                        </Badge>
                                                    )}
                                                    {latestPayment && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrintReceipt(b, latestPayment)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                                                        >
                                                            <Printer className="h-3 w-3" />
                                                            {latestPayment.invoice_number}
                                                        </button>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400">
                                                    Tempo: {formatDate(b.due_date)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Kolom Aksi */}
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end">
                                                <ActionDropdown
                                                    onView={() => (latestPayment ? handlePrintReceipt(b, latestPayment) : handleOpenPayModal(b))}
                                                    extraItems={
                                                        !isPaid
                                                            ? [
                                                                {
                                                                    label: 'Bayar Kasir',
                                                                    icon: <Wallet className="size-4 text-emerald-600" />,
                                                                    onClick: () => handleOpenPayModal(b),
                                                                },
                                                            ]
                                                            : [
                                                                {
                                                                    label: 'Cetak Kuitansi',
                                                                    icon: <Printer className="size-4 text-sky-600" />,
                                                                    onClick: () => handlePrintReceipt(b, latestPayment),
                                                                },
                                                            ]
                                                    }
                                                    onDelete={() => handleDeleteBill(b)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="border-t border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/30 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
                    <Pagination
                        currentPage={meta.current_page}
                        totalPages={meta.last_page}
                        onPageChange={(p) => setPage(p)}
                        sideLayout="full"
                    />
                </div>
            </div>

            {/* 5. MODAL TERBITKAN TAGIHAN (SINGLE & BULK) */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-xl rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 shadow-xl dark:border-emerald-800/60 dark:bg-slate-900"
                        >
                            <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Terbitkan Tagihan Siswa</h3>
                                <CloseButton onClick={() => setIsCreateModalOpen(false)} />
                            </div>

                            {createError && (
                                <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
                                    {createError}
                                </div>
                            )}

                            <form onSubmit={handleSaveCreateBill} className="mt-4 space-y-4">
                                {/* Mode Switcher */}
                                <div className="flex rounded-xl bg-emerald-50 p-1 dark:bg-emerald-950/40">
                                    <button
                                        type="button"
                                        onClick={() => setCreateForm((prev) => ({ ...prev, mode: 'single' }))}
                                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${createForm.mode === 'single' ? 'bg-white shadow-xs text-emerald-800 dark:bg-slate-700 dark:text-white' : 'text-slate-500'
                                            }`}
                                    >
                                        Perorangan Siswa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCreateForm((prev) => ({ ...prev, mode: 'bulk_class' }))}
                                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${createForm.mode === 'bulk_class' ? 'bg-white shadow-xs text-emerald-800 dark:bg-slate-700 dark:text-white' : 'text-slate-500'
                                            }`}
                                    >
                                        Massal Per Rombel
                                    </button>
                                </div>

                                {/* Pilih Kelas Rombel */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Kelas / Rombel <span className="text-rose-500">*</span>
                                    </label>
                                    <CustomSelect
                                        value={createForm.class_id}
                                        onChange={(e) => setCreateForm((prev) => ({ ...prev, class_id: e.target.value, student_id: '' }))}
                                        required
                                        className="mt-1 h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
                                    >
                                        <option value="">Pilih Kelas...</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nama_kelas || c.name}
                                            </option>
                                        ))}
                                    </CustomSelect>
                                </div>

                                {/* Jika mode single, pilih siswa */}
                                {createForm.mode === 'single' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Nama Siswa <span className="text-rose-500">*</span>
                                        </label>
                                        <CustomSelect
                                            value={createForm.student_id}
                                            onChange={(e) => setCreateForm((prev) => ({ ...prev, student_id: e.target.value }))}
                                            required={createForm.mode === 'single'}
                                            className="mt-1 h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
                                        >
                                            <option value="">Pilih Siswa...</option>
                                            {students.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nama_lengkap} (NIS: {s.nis || '-'})
                                                </option>
                                            ))}
                                        </CustomSelect>
                                    </div>
                                )}

                                {/* Kategori Biaya */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Kategori Biaya <span className="text-rose-500">*</span>
                                    </label>
                                    <CustomSelect
                                        value={createForm.fee_category_id}
                                        onChange={(e) => {
                                            const cat = feeCategories.find((c) => c.id === e.target.value)
                                            setCreateForm((prev) => ({
                                                ...prev,
                                                fee_category_id: e.target.value,
                                                amount: cat?.default_amount ? String(cat.default_amount) : prev.amount,
                                            }))
                                        }}
                                        required
                                        className="mt-1 h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
                                    >
                                        <option value="">Pilih Kategori...</option>
                                        {feeCategories.map((fc) => (
                                            <option key={fc.id} value={fc.id}>
                                                {fc.name} ({fc.code})
                                            </option>
                                        ))}
                                    </CustomSelect>
                                </div>

                                {/* Judul Tagihan */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Judul / Uraian Tagihan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.title}
                                        onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                                        required
                                        placeholder="Contoh: SPP Bulan September 2026"
                                        className="mt-1 h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
                                    />
                                </div>

                                {/* Nominal & Jatuh Tempo */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Nominal (Rp) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={createForm.amount}
                                            onChange={(e) => setCreateForm((prev) => ({ ...prev, amount: e.target.value }))}
                                            required
                                            min="1"
                                            className="mt-1 h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Jatuh Tempo <span className="text-rose-500">*</span>
                                        </label>
                                        <DatePicker
                                            value={createForm.due_date}
                                            onChange={(e) => setCreateForm((prev) => ({ ...prev, due_date: e.target.value }))}
                                            required
                                            inputClassName="mt-1 h-9 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-2 border-t border-emerald-200/80 pt-4 dark:border-emerald-800/60">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        disabled={creating}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={creating}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg h-9 px-4 text-sm shadow-xs border border-emerald-200/80 dark:border-emerald-800/60 inline-flex items-center justify-center gap-2"
                                    >
                                        {creating ? 'Menerbitkan...' : 'Terbitkan Sekarang'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 6. MODAL CATAT PEMBAYARAN KASIR */}
            <AnimatePresence>
                {isPayModalOpen && selectedBill && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 shadow-xl dark:border-emerald-800/60 dark:bg-slate-900"
                        >
                            <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Catat Pelunasan Pembayaran</h3>
                                <CloseButton onClick={() => setIsPayModalOpen(false)} />
                            </div>

                            {payError && (
                                <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
                                    {payError}
                                </div>
                            )}

                            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800">
                                <p className="font-bold text-slate-900 dark:text-white">{selectedBill.title}</p>
                                <p className="text-slate-500">Siswa: {selectedBill.student?.nama_lengkap} ({selectedBill.student?.kelas?.nama_kelas})</p>
                                <p className="mt-1 font-black text-emerald-700 dark:text-emerald-400">
                                    Nominal Tagihan: {formatRupiah(selectedBill.amount)}
                                </p>
                            </div>

                            <form onSubmit={handleSavePayment} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Jumlah Diterima (Rp) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={payForm.paid_amount}
                                        onChange={(e) => setPayForm((prev) => ({ ...prev, paid_amount: e.target.value }))}
                                        required
                                        min="1"
                                        className="mt-1 h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Metode Pembayaran <span className="text-rose-500">*</span>
                                    </label>
                                    <CustomSelect
                                        value={payForm.payment_method}
                                        onChange={(e) => setPayForm((prev) => ({ ...prev, payment_method: e.target.value }))}
                                        required
                                        className="mt-1 h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
                                    >
                                        <option value="TUNAI_KASIR">Tunai Kasir Sekolah</option>
                                        <option value="TRANSFER_BSI">Transfer BSI Syariah</option>
                                        <option value="QRIS">QRIS Yayasan</option>
                                        <option value="TRANSFER_BANK">Transfer Bank Lainnya</option>
                                    </CustomSelect>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Tanggal Transaksi
                                    </label>
                                    <DatePicker
                                        value={payForm.paid_at}
                                        onChange={(e) => setPayForm((prev) => ({ ...prev, paid_at: e.target.value }))}
                                        required
                                        inputClassName="mt-1 h-9 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Catatan Kasir / Keterangan (Opsional)
                                    </label>
                                    <textarea
                                        value={payForm.notes}
                                        onChange={(e) => setPayForm((prev) => ({ ...prev, notes: e.target.value }))}
                                        rows={2}
                                        placeholder="Contoh: Diterima langsung oleh kasir TU"
                                        className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-2 border-t border-emerald-200/80 pt-4 dark:border-emerald-800/60">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsPayModalOpen(false)}
                                        disabled={paying}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        disabled={paying}
                                        className="!bg-[#059669] !text-white"
                                    >
                                        {paying ? 'Menyimpan...' : 'Simpan & Terbitkan Kuitansi'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 7. PRINT TEMPLATE FOR OFFICIAL RECEIPT */}
            {activeReceipt && (
                <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-8">
                    <div className="max-w-xl mx-auto border-2 border-emerald-800/60 p-6 rounded-lg text-slate-900">
                        <div className="text-center border-b-2 border-emerald-800/60 pb-4">
                            <h2 className="text-lg font-black uppercase tracking-wider">{foundationName}</h2>
                            <p className="text-xs">Dareliman Edu — Bukti Pelunasan Resmi (Kuitansi)</p>
                        </div>
                        <div className="mt-4 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span>No. Kuitansi:</span>
                                <span className="font-mono font-bold">{activeReceipt.payment.invoice_number || 'INV-OFFICIAL'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tanggal Bayar:</span>
                                <span>{formatDate(activeReceipt.payment.paid_at || activeReceipt.payment.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Nama Siswa:</span>
                                <span className="font-bold">{activeReceipt.bill.student?.nama_lengkap || activeReceipt.bill.student?.full_name || activeReceipt.bill.student?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>NIS:</span>
                                <span>{activeReceipt.bill.student?.nis || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kelas:</span>
                                <span>{activeReceipt.bill.student?.kelas?.nama_kelas || '-'}</span>
                            </div>
                            <div className="flex justify-between border-t border-emerald-300 pt-2 font-bold">
                                <span>Uraian Tagihan:</span>
                                <span>{activeReceipt.bill.title}</span>
                            </div>
                            <div className="flex justify-between text-base font-black text-emerald-800 pt-2">
                                <span>Jumlah Diterima:</span>
                                <span>{formatRupiah(activeReceipt.payment.paid_amount || activeReceipt.bill.amount)}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span>Metode:</span>
                                <span className="font-bold">{activeReceipt.payment.payment_method}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span>Status:</span>
                                <span className="font-bold uppercase text-emerald-700">LUNAS - TERVERIFIKASI KASIR</span>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-between text-center text-xs">
                            <div>
                                <p>Orang Tua / Siswa</p>
                                <div className="h-9"></div>
                                <p className="font-bold">({activeReceipt.bill.student?.nama_lengkap || 'Penyetor'})</p>
                            </div>
                            <div>
                                <p>Kasir / Tata Usaha</p>
                                <div className="h-9"></div>
                                <p className="font-bold">({activeReceipt.payment.metadata?.cashier_name || 'Petugas Keuangan'})</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HeroUI Harmonized Delete Bill Confirmation Modal */}
            <HarmonizedDeleteBillModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, bill: null, isSubmitting: false, error: '' })}
                onConfirm={confirmDeleteBill}
                bill={deleteModal.bill}
                isSubmitting={deleteModal.isSubmitting}
                error={deleteModal.error}
            />
        </div>
    )
}
