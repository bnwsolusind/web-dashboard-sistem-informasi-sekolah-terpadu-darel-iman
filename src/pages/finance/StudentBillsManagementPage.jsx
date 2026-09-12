import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ArrowUpDown,
} from 'lucide-react'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import api from '../../services/api'
import { Card } from '../../components/tailgrids/core/card'
import { Badge } from '../../components/tailgrids/core/badge'
import { Button } from '../../components/tailgrids/core/button'
import { Pagination } from '../../components/tailgrids/core/pagination'
import { Avatar, AvatarFallback } from '../../components/tailgrids/core/avatar'

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

export default function StudentBillsManagementPage() {
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
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)

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
      .catch(() => {})

    // Fee Categories
    api.get('/finance/fee-categories')
      .then((res) => {
        const d = res.data?.data ?? []
        setFeeCategories(Array.isArray(d) ? d : [])
      })
      .catch(() => {})
  }, [])

  // Fetch classes when selectedUnit changes or on initial load
  useEffect(() => {
    const params = selectedUnit ? { unit_id: selectedUnit, per_page: 100 } : { per_page: 100 }
    api.get('/classes', { params })
      .then((res) => {
        const d = res.data?.data?.data ?? res.data?.data ?? []
        setClasses(Array.isArray(d) ? d : [])
      })
      .catch(() => {})
  }, [selectedUnit])

  // Fetch students for create modal when class selected
  useEffect(() => {
    if (createForm.class_id) {
      api.get('/students', { params: { class_id: createForm.class_id, per_page: 100 } })
        .then((res) => {
          const d = res.data?.data?.data ?? res.data?.data ?? []
          setStudents(Array.isArray(d) ? d : [])
        })
        .catch(() => {})
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
      .catch(() => {})
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

  const handleDeleteBill = async (bill) => {
    if (!window.confirm(`Hapus tagihan "${bill.title}" untuk siswa ${bill.student?.nama_lengkap || 'ini'}?`)) return
    try {
      await api.delete(`/finance/bills/${bill.id}`)
      loadBills()
      loadStats()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus tagihan.')
    }
  }

  const handlePrintReceipt = (bill, payment) => {
    setActiveReceipt({ bill, payment })
    setTimeout(() => {
      window.print()
    }, 300)
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

      {/* 2. MODERN HERO CARD HEADER (TAILGRIDS STYLE) */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/30">
              <CreditCard className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  MODUL KEUANGAN & TATA USAHA
                </span>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Yayasan Dar El-Iman
                </span>
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Kelola Tagihan & Pembayaran SPP Siswa
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                Penerbitan tagihan pendidikan, pencatatan transaksi kasir sekolah, dan penerbitan bukti kuitansi resmi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                loadStats()
                loadBills()
              }}
              className="cursor-pointer gap-1.5 border border-emerald-500/30 bg-white/80 dark:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-700 dark:text-emerald-300 ${loading ? 'animate-spin' : ''}`} />
              Segarkan
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              className="cursor-pointer gap-1.5 !bg-[#0E5C44] !text-white shadow-md shadow-emerald-950/20"
            >
              <Plus className="h-4 w-4" />
              Terbitkan Tagihan
            </Button>
          </div>
        </div>
      </div>

      {/* 3. MASTER STATS GRID (4 KPI CARDS) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Tagihan Diterbitkan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{formatRupiah(stats.total_nominal)}</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {stats.total_bills.toLocaleString('id-ID')} tagihan aktif
            </p>
          </div>
        </Card>

        <Card className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Nominal Terbayar</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-blue-600 dark:text-blue-400">{formatRupiah(stats.paid_nominal)}</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Tingkat Kolektibilitas: <span className="font-bold text-emerald-600">{stats.collection_rate}%</span>
            </p>
          </div>
        </Card>

        <Card className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Nominal Tertunggak</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-amber-600 dark:text-amber-400">{formatRupiah(stats.unpaid_nominal)}</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Belum dilunasi orang tua siswa
            </p>
          </div>
        </Card>

        <Card className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jatuh Tempo / Lewat Batas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-rose-600 dark:text-rose-400">{stats.overdue_count} Siswa</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Perlu tindak lanjut bendahara
            </p>
          </div>
        </Card>
      </div>

      {/* 4. EMERALD DATATABLE CONTAINER */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Toolbar Header */}
        <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5">
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
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value)
                  setSelectedClass('')
                  setPage(1)
                }}
                className="h-9 rounded-xl border border-emerald-500/30 bg-white px-3 text-xs font-medium outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Semua Unit Pendidikan</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              {/* Class Filter */}
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setPage(1)
                }}
                className="h-9 rounded-xl border border-emerald-500/30 bg-white px-3 text-xs font-medium outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Semua Rombel / Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kelas || c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setPage(1)
                }}
                className="h-9 rounded-xl border border-emerald-500/30 bg-white px-3 text-xs font-medium outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">Semua Status</option>
                <option value="unpaid">Belum Lunas</option>
                <option value="paid">Lunas</option>
                <option value="overdue">Jatuh Tempo</option>
              </select>

              {/* Search Box */}
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Cari siswa atau NIS..."
                  className="h-9 w-full rounded-xl border border-emerald-500/30 bg-white pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Datatable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b-2 border-emerald-200/90 bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 font-black uppercase tracking-wider text-slate-700 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3.5">Siswa</th>
                <th className="px-4 py-3.5">Kelas & Unit</th>
                <th className="px-4 py-3.5">Uraian Tagihan</th>
                <th className="px-4 py-3.5 text-right">Nominal</th>
                <th className="px-4 py-3.5 text-center">Jatuh Tempo</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Kuitansi / Invoice</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bills.map((b) => {
                const isPaid = String(b.status).toLowerCase() === 'paid'
                const isOverdue = !isPaid && b.due_date && new Date(b.due_date) < new Date()
                const latestPayment = Array.isArray(b.payments) && b.payments.length > 0 ? b.payments[0] : null

                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
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
                          <p className="font-mono text-[11px] text-slate-400">
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
                      <p className="text-[11px] text-slate-400">
                        {b.student?.kelas?.unit_pendidikan?.name || 'Yayasan'}
                      </p>
                    </td>

                    {/* Kolom Uraian */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-white">{b.title}</p>
                      <Badge color="cyan" size="xs" className="mt-0.5">
                        {b.fee_category?.name || 'SPP'}
                      </Badge>
                    </td>

                    {/* Kolom Nominal */}
                    <td className="px-4 py-3 text-right">
                      <p className="font-black text-slate-900 dark:text-white">{formatRupiah(b.amount)}</p>
                    </td>

                    {/* Kolom Jatuh Tempo */}
                    <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                      {formatDate(b.due_date)}
                    </td>

                    {/* Kolom Status */}
                    <td className="px-4 py-3 text-center">
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
                    </td>

                    {/* Kolom Invoice / Kuitansi */}
                    <td className="px-4 py-3 text-center">
                      {latestPayment ? (
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(b, latestPayment)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                        >
                          <Printer className="h-3 w-3" />
                          {latestPayment.invoice_number}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>

                    {/* Kolom Aksi */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isPaid && (
                          <Button
                            type="button"
                            size="xs"
                            variant="primary"
                            onClick={() => handleOpenPayModal(b)}
                            className="cursor-pointer gap-1 !bg-emerald-700 !text-white text-[11px]"
                          >
                            <Wallet className="h-3 w-3" />
                            Bayar Kasir
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          onClick={() => handleDeleteBill(b)}
                          className="cursor-pointer text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {!bills.length && !loading && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-slate-400">
                    <Receipt className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    Tidak ada data tagihan yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="border-t border-emerald-500/20 bg-slate-50/50 p-4 dark:bg-slate-800/40">
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
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Terbitkan Tagihan Siswa</h3>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {createError && (
                <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
                  {createError}
                </div>
              )}

              <form onSubmit={handleSaveCreateBill} className="mt-4 space-y-4">
                {/* Mode Switcher */}
                <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setCreateForm((prev) => ({ ...prev, mode: 'single' }))}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                      createForm.mode === 'single' ? 'bg-white shadow-xs text-emerald-800 dark:bg-slate-700 dark:text-white' : 'text-slate-500'
                    }`}
                  >
                    Perorangan Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm((prev) => ({ ...prev, mode: 'bulk_class' }))}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                      createForm.mode === 'bulk_class' ? 'bg-white shadow-xs text-emerald-800 dark:bg-slate-700 dark:text-white' : 'text-slate-500'
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
                  <select
                    value={createForm.class_id}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, class_id: e.target.value, student_id: '' }))}
                    required
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="">Pilih Kelas...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama_kelas || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jika mode single, pilih siswa */}
                {createForm.mode === 'single' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nama Siswa <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={createForm.student_id}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, student_id: e.target.value }))}
                      required={createForm.mode === 'single'}
                      className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="">Pilih Siswa...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama_lengkap} (NIS: {s.nis || '-'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Kategori Biaya */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kategori Biaya <span className="text-rose-500">*</span>
                  </label>
                  <select
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
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="">Pilih Kategori...</option>
                    {feeCategories.map((fc) => (
                      <option key={fc.id} value={fc.id}>
                        {fc.name} ({fc.code})
                      </option>
                    ))}
                  </select>
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
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
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
                      className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Jatuh Tempo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={createForm.due_date}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, due_date: e.target.value }))}
                      required
                      className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
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
                    size="sm"
                    disabled={creating}
                    className="!bg-[#0E5C44] !text-white"
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
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Catat Pelunasan Pembayaran</h3>
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
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
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Metode Pembayaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={payForm.payment_method}
                    onChange={(e) => setPayForm((prev) => ({ ...prev, payment_method: e.target.value }))}
                    required
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="TUNAI_KASIR">Tunai Kasir Sekolah</option>
                    <option value="TRANSFER_BSI">Transfer BSI Syariah</option>
                    <option value="QRIS">QRIS Yayasan</option>
                    <option value="TRANSFER_BANK">Transfer Bank Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    value={payForm.paid_at}
                    onChange={(e) => setPayForm((prev) => ({ ...prev, paid_at: e.target.value }))}
                    required
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
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
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
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
                    className="!bg-[#0E5C44] !text-white"
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
          <div className="max-w-xl mx-auto border-2 border-slate-800 p-6 rounded-lg text-slate-900">
            <div className="text-center border-b-2 border-slate-800 pb-4">
              <h2 className="text-lg font-black uppercase tracking-wider">Yayasan Dar El-Iman Padang</h2>
              <p className="text-xs">Sistem Manajemen Sekolah Terpadu — Bukti Pelunasan Resmi (Kuitansi)</p>
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
                <span className="font-bold">{activeReceipt.bill.student?.nama_lengkap || 'Siswa'}</span>
              </div>
              <div className="flex justify-between">
                <span>NIS:</span>
                <span>{activeReceipt.bill.student?.nis || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Kelas:</span>
                <span>{activeReceipt.bill.student?.kelas?.nama_kelas || '-'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-2 font-bold">
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
                <div className="h-12"></div>
                <p className="font-bold">({activeReceipt.bill.student?.nama_lengkap || 'Penyetor'})</p>
              </div>
              <div>
                <p>Kasir / Tata Usaha</p>
                <div className="h-12"></div>
                <p className="font-bold">({activeReceipt.payment.metadata?.cashier_name || 'Petugas Keuangan'})</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
