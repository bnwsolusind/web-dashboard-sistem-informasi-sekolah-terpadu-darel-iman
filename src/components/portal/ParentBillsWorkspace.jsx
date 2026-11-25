import React, { useMemo, useState } from 'react'
import AppModal from '@/components/app/AppModal'
import { motion, AnimatePresence } from 'framer-motion'
import {
 CreditCard,
 CheckCircle2,
 AlertCircle,
 Clock,
 Printer,
 Calendar,
 FileText,
 Search,
 ExternalLink,
 ShieldCheck,
 Receipt,
 Copy,
 Check,
 Sparkles,
 X,
 ChevronRight,
 RefreshCw,
 Building2,
 CheckSquare,
 Square,
 Info,
} from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import AppTabs from '../app/AppTabs'
import api from '../../services/api'
import { printCleanTable, resolveFoundationName } from '../../utils/printHelper'
import { usePengaturanStore } from '../../stores/pengaturanStore'

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

export default function ParentBillsWorkspace({ bills = [], loading = false, student, onRefresh }) {
 const [filter, setFilter] = useState('all')
 const [search, setSearch] = useState('')
 const [activeReceipt, setActiveReceipt] = useState(null)
 const [copiedVa, setCopiedVa] = useState(false)
 const [copiedModalVa, setCopiedModalVa] = useState(false)

 // Multi-select for VA Payment
 const [selectedBillIds, setSelectedBillIds] = useState([])
 const [isPayModalOpen, setIsPayModalOpen] = useState(false)
 const [selectedBank, setSelectedBank] = useState('BSI') // 'BSI' or 'NAGARI'
 const [processingVa, setProcessingVa] = useState(false)
 const [vaResult, setVaResult] = useState(null)
 const [payError, setPayError] = useState(null)

 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)

 const studentMeta = student?.metadata || {}
 const studentPemb = studentMeta.pembiayaan || {}
 const studentName = student?.nama_lengkap || student?.full_name || student?.name || 'Ananda'
 const studentNis = student?.nis || studentMeta?.nis || student?.nisn || ''
 const bsiPrefix = pengaturan?.bsi_va_prefix || '9023'
 const rawPaymentId =
 studentMeta.no_va ||
 studentMeta.nis_pembayaran ||
 student?.no_va ||
 studentPemb.nip_pembayaran ||
 studentPemb.nis_pembayaran ||
 studentMeta.no_pendaftaran ||
 student?.nis ||
 studentMeta.nis ||
 student?.nisn ||
 ''
 const cleanPaymentId = String(rawPaymentId).replace(/\D/g, '')
 const studentVa = cleanPaymentId
 ? (cleanPaymentId.startsWith(bsiPrefix) ? cleanPaymentId : `${bsiPrefix}${cleanPaymentId}`)
 : ''

 const handleCopyVa = (val = studentVa) => {
 if (!val) return
 navigator.clipboard.writeText(val)
 setCopiedVa(true)
 setTimeout(() => setCopiedVa(false), 2000)
 }

 const handleCopyModalVa = (val) => {
 if (!val) return
 navigator.clipboard.writeText(val)
 setCopiedModalVa(true)
 setTimeout(() => setCopiedModalVa(false), 2000)
 }

 const safeBills = useMemo(() => (Array.isArray(bills) ? bills : []), [bills])

 const stats = useMemo(() => {
 let totalNominal = 0
 let paidNominal = 0
 let unpaidNominal = 0
 let totalCount = safeBills.length
 let paidCount = 0
 let unpaidCount = 0

 safeBills.forEach((b) => {
 const amount = Number(b.amount || 0)
 totalNominal += amount

 const isPaid = String(b.status).toUpperCase() === 'PAID'
 if (isPaid) {
 paidNominal += amount
 paidCount++
 } else {
 unpaidNominal += amount
 unpaidCount++
 }
 })

 return { totalNominal, paidNominal, unpaidNominal, totalCount, paidCount, unpaidCount }
 }, [safeBills])

 const filteredBills = useMemo(() => {
 return safeBills.filter((b) => {
 const status = String(b.status || 'UNPAID').toUpperCase()
 const title = String(b.title || '').toLowerCase()
 const category = String(b.fee_category?.name || b.feeCategory?.name || '').toLowerCase()
 const isOverdue = status === 'UNPAID' && b.due_date && new Date(b.due_date) < new Date()

 let statusMatch = true
 if (filter === 'unpaid') statusMatch = status === 'UNPAID' && !isOverdue
 if (filter === 'paid') statusMatch = status === 'PAID'
 if (filter === 'overdue') statusMatch = isOverdue

 const searchMatch = !search || title.includes(search.toLowerCase()) || category.includes(search.toLowerCase())

 return statusMatch && searchMatch
 })
 }, [safeBills, filter, search])

 // Unpaid bills that can be selected
 const unpaidBills = useMemo(() => {
 return safeBills.filter((b) => String(b.status).toUpperCase() !== 'PAID')
 }, [safeBills])

 const toggleSelectBill = (id) => {
 setSelectedBillIds((prev) =>
 prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
 )
 }

 const handleSelectAllUnpaid = () => {
 if (selectedBillIds.length === unpaidBills.length) {
 setSelectedBillIds([])
 } else {
 setSelectedBillIds(unpaidBills.map((b) => b.id))
 }
 }

 // Selected bills objects and total
 const selectedBillsData = useMemo(() => {
 return safeBills.filter((b) => selectedBillIds.includes(b.id))
 }, [safeBills, selectedBillIds])

 const selectedTotal = useMemo(() => {
 return selectedBillsData.reduce((acc, b) => acc + Number(b.remaining_amount || b.amount || 0), 0)
 }, [selectedBillsData])

 const openPaymentModal = () => {
 setPayError(null)
 setVaResult(null)
 setIsPayModalOpen(true)
 }

 const handleProcessVaPayment = async () => {
 if (selectedBillsData.length === 0) return
 setProcessingVa(true)
 setPayError(null)

 try {
 // Map to items expected by SIPDEI API
 const items = selectedBillsData.map((b) => {
 const rawId = b.metadata?.sipdei_id || String(b.id).replace(/^sipdei_/, '')
 const numId = parseInt(rawId, 10) || 1
 let jenis = 'TAGIHAN'
 if (b.fee_category?.category === 'TUNGGAKAN') jenis = 'TUNGGAKAN'
 if (b.fee_category?.category === 'DANA_ORTU_ASUH') jenis = 'DANA_ORTU_ASUH'

 return {
 jenis,
 id: numId,
 bayar: Number(b.remaining_amount || b.amount || 0),
 }
 })

 const headers = {}
 if (student?.id) {
 headers['X-Child-Id'] = student.id
 }

 const res = await api.post(
 '/portal/bills/pay-va',
 {
 bank: selectedBank,
 items,
 },
 { headers }
 )

 if (res.data?.success && res.data?.data) {
 setVaResult(res.data.data)
 if (typeof onRefresh === 'function') {
 onRefresh()
 }
 } else {
 setPayError(res.data?.message || 'Gagal menerbitkan Virtual Account dari SIPDEI.')
 }
 } catch (err) {
 setPayError(
 err.response?.data?.message ||
 'Terjadi kesalahan saat menghubungi server SIPDEI untuk membuat pembayaran Virtual Account.'
 )
 } finally {
 setProcessingVa(false)
 }
 }

 const printReceipt = (bill, payment) => {
 setActiveReceipt({ bill, payment })
 const activePayment = payment || {}
 const sName = bill?.student?.nama_lengkap || bill?.student?.full_name || bill?.student?.name || studentName
 const unitName = bill?.student?.unit?.nama_unit || bill?.student?.unit?.name || foundationName
 printCleanTable({
 title: 'BUKTI PEMBAYARAN & KUITANSI RESMI (SPP)',
 subtitle: `No. Kuitansi: ${activePayment.invoice_number || 'INV-OFFICIAL'} | Tanggal: ${
 activePayment.paid_at
 ? new Date(activePayment.paid_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })
 : new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })
 }`,
 headers: ['Uraian Tagihan', 'Nama Siswa', 'NIS', 'Kelas', 'Metode Pembayaran', 'Jumlah Diterima', 'Status'],
 rows: [
 [
 bill?.title || 'Pembayaran Tagihan SPP',
 sName,
 bill?.student?.nis || studentNis || '-',
 bill?.student?.kelas?.nama_kelas || bill?.student?.class_name || '-',
 activePayment.payment_method || 'Tunai / Transfer',
 formatRupiah(activePayment.paid_amount || bill?.amount || 0),
 'LUNAS - TERVERIFIKASI KASIR',
 ],
 ],
 unit: unitName,
 orientation: 'portrait',
 customFooter: `
 <div style="display:flex; justify-content:space-between; margin-top:35px; font-size:9pt; text-align:center;">
 <div>
 <p style="margin:0 0 45px 0;">Penyetor / Orang Tua Siswa</p>
 <p style="margin:0; font-weight:bold;">(${sName !== '-' ? sName : 'Orang Tua / Wali Santri'})</p>
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
 <div className="space-y-6 pb-20">
 {/* 1. HERO KPI STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-sky-100/90 hover:!bg-sky-200/70 p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-sky-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 dark:text-sky-300">Total Kewajiban</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-sky-600 dark:!text-white">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-sky-800 dark:text-sky-200">{formatRupiah(stats.totalNominal)}</h3>
            <p className="mt-1 text-xs font-medium text-sky-700/80 dark:text-sky-400/80">
              {stats.totalCount} pos tagihan terdaftar
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-emerald-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Sudah Terbayar</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-200">{formatRupiah(stats.paidNominal)}</h3>
            <p className="mt-1 text-xs font-medium text-emerald-700/80 dark:text-emerald-400/80">
              {stats.paidCount} tagihan lunas terverifikasi
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 hover:!bg-amber-200/70 p-5 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:!bg-amber-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">Sisa Menunggu Bayar</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl !bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-amber-800 dark:text-amber-200">{formatRupiah(stats.unpaidNominal)}</h3>
            <p className="mt-1 text-xs font-medium text-amber-700/80 dark:text-amber-400/80">
              {stats.unpaidCount} tagihan menunggu pembayaran
            </p>
          </div>
        </div>
      </div>

      {/* 2. INFORMASI PEMBAYARAN RESMI & VIRTUAL ACCOUNT SIPDEI ANANDA */}
 <div className="grid grid-cols-1 gap-4">
 <Card className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4.5 shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div className="flex items-start gap-3">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <CreditCard className="h-5 w-5" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
 Layanan Virtual Account SIPDEI
 </span>
 <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-300">
 <Sparkles className="h-3 w-3" />
 BSI & Bank Nagari
 </span>
 </div>
 <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1">
 Tagihan Siswa: {studentName} ({studentNis || 'NIS Siswa'})
 </h4>
 <div className="mt-2 flex flex-wrap items-center gap-2">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 font-mono text-sm sm:text-base font-extrabold text-emerald-800 shadow-inner dark:border-emerald-800/60 dark:bg-slate-900 dark:text-emerald-300">
 {studentVa || 'VA Resmi Dibuat Otomatis'}
 </div>
 {studentVa && (
 <button
 type="button"
 onClick={() => handleCopyVa(studentVa)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
 >
 {copiedVa ? (
 <>
 <Check className="h-3.5 w-3.5 text-emerald-200" />
 <span>Tersalin!</span>
 </>
 ) : (
 <>
 <Copy className="h-3.5 w-3.5" />
 <span>Salin VA</span>
 </>
 )}
 </button>
 )}
 {unpaidBills.length > 0 && (
 <button
 type="button"
 onClick={() => {
 setSelectedBillIds(unpaidBills.map((b) => b.id))
 openPaymentModal()
 }}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white hover:from-emerald-700 hover:to-teal-700 px-3.5 py-1.5 text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer"
 >
 <Sparkles className="h-3.5 w-3.5 text-amber-300" />
 <span>Bayar Semua Tagihan ({formatRupiah(stats.unpaidNominal)})</span>
 </button>
 )}
 </div>
 <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Pilih tagihan yang ingin dibayarkan di bawah untuk mendapatkan nomor <b>Virtual Account Bank Nagari</b> atau <b>BSI</b> resmi yang langsung mengunci nominal dan terverifikasi otomatis.
 </p>
 </div>
 </div>
 </div>
 </Card>
 </div>

 {/* 3. TOOLBAR & FILTER */}
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex flex-wrap items-center gap-2">
 <AppTabs
 tabs={[
 { id: 'all', label: 'Semua Tagihan' },
 { id: 'unpaid', label: 'Belum Lunas' },
 { id: 'paid', label: 'Lunas' },
 { id: 'overdue', label: 'Jatuh Tempo' },
 ]}
 activeTab={filter}
 onChange={setFilter}
 ariaLabel="Filter status tagihan"
 size="sm"
 />

 {unpaidBills.length > 0 && (
 <button
 type="button"
 onClick={handleSelectAllUnpaid}
 className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
 >
 {selectedBillIds.length === unpaidBills.length ? (
 <>
 <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
 <span>Batal Pilih Semua</span>
 </>
 ) : (
 <>
 <Square className="h-3.5 w-3.5 text-emerald-600" />
 <span>Pilih Semua Belum Lunas</span>
 </>
 )}
 </button>
 )}
 </div>

 <div className="relative min-w-[240px]">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari jenis tagihan..."
 className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white pl-9 pr-3 text-xs outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800"
 />
 </div>
 </div>

 {/* 4. LIST TAGIHAN DENGAN CHECKBOX PEMBAYARAN */}
 <div className={`space-y-3.5 transition-all ${selectedBillIds.length > 0 ? 'pb-28' : 'pb-6'}`}>
 {filteredBills.map((b) => {
 const status = String(b.status || 'UNPAID').toUpperCase()
 const isPaid = status === 'PAID'
 const isOverdue = !isPaid && b.due_date && new Date(b.due_date) < new Date()
 const categoryName = b.fee_category?.name || b.feeCategory?.name || 'Biaya Sekolah'
 const payments = Array.isArray(b.payments) ? b.payments : []
 const isSelected = selectedBillIds.includes(b.id)

 return (
 <motion.div key={b.id} whileHover={{ y: -1 }}>
 <Card
 className={`rounded-xl border p-5 shadow-xs transition-all ${
 isSelected
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-100/60 shadow-sm border-l-4 border-l-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40'
 : isPaid
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 border-l-4 border-l-emerald-600 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/25'
 : isOverdue
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/70 border-l-4 border-l-rose-600 shadow-sm dark:border-emerald-800/60 dark:bg-rose-950/25'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 border-l-4 border-l-amber-500 shadow-sm dark:border-emerald-800/60 dark:bg-amber-950/25'
 }`}
 >
 <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 pb-4 dark:border-emerald-800/80">
 <div className="flex items-start gap-3">
 {!isPaid && (
 <button
 type="button"
 onClick={() => toggleSelectBill(b.id)}
 className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 transition cursor-pointer dark:border-emerald-700/80"
 >
 {isSelected ? (
 <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white">
 <Check className="h-3.5 w-3.5" />
 </div>
 ) : (
 <div className="h-5 w-5 rounded-md bg-white dark:bg-slate-800" />
 )}
 </button>
 )}
 <div>
 <div className="flex items-center gap-2">
 <Badge color={isPaid ? 'success' : isOverdue ? 'error' : 'warning'} size="sm" className="font-bold">
 {categoryName}
 </Badge>
 {b.source === 'sipdei' && (
 <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <CheckCircle2 className="h-3 w-3 text-emerald-600" />
 SIPDEI
 </span>
 )}
 <span className={`text-xs font-medium ${isPaid ? 'text-emerald-700 dark:text-emerald-400' : isOverdue ? 'text-rose-700 dark:text-rose-400' : 'text-amber-800 dark:text-amber-400'}`}>
 Jatuh Tempo: {formatDate(b.due_date)}
 </span>
 </div>
 <h3 className={`mt-2 text-base font-bold ${isPaid ? 'text-emerald-950 dark:text-white' : 'text-slate-900 dark:text-white'}`}>{b.title}</h3>
 </div>
 </div>

 <div className="text-right">
 <p className={`text-lg font-black ${isPaid ? 'text-emerald-800 dark:text-emerald-300' : isOverdue ? 'text-rose-700 dark:text-rose-300' : 'text-amber-800 dark:text-amber-300'}`}>
 {formatRupiah(b.remaining_amount || b.amount)}
 </p>
 {b.paid_amount > 0 && !isPaid && (
 <p className="text-[10px] text-slate-400">
 Sudah dibayar: {formatRupiah(b.paid_amount)} dari {formatRupiah(b.amount)}
 </p>
 )}
 <div className="mt-1 flex justify-end gap-1.5">
 {isPaid ? (
 <Badge color="success" size="sm" className="font-extrabold">
 LUNAS
 </Badge>
 ) : isOverdue ? (
 <Badge color="error" size="sm" className="font-extrabold">
 TERLAMBAT
 </Badge>
 ) : (
 <Badge color="warning" size="sm" className="font-extrabold">
 BELUM LUNAS
 </Badge>
 )}
 {!isPaid && (
 <Button
 type="button"
 size="xs"
 onClick={() => {
 setSelectedBillIds([b.id])
 openPaymentModal()
 }}
 className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-6 px-2.5 rounded-lg shadow-xs"
 >
 Bayar Ini
 </Button>
 )}
 </div>
 </div>
 </div>

 {/* RIWAYAT PELUNASAN / KUITANSI */}
 {payments.length > 0 && (
 <div className="mt-4 rounded-xl bg-slate-50/70 p-3.5 dark:bg-slate-800/40">
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
 Riwayat Pembayaran & Kuitansi:
 </p>
 <div className="mt-2 space-y-2">
 {payments.map((p) => (
 <div
 key={p.id}
 className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-2.5 text-xs shadow-2xs dark:bg-slate-900"
 >
 <div className="flex items-center gap-2">
 <Receipt className="h-4 w-4 text-emerald-600" />
 <div>
 <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
 {p.invoice_number || 'INV-OFFICIAL'}
 </span>
 <span className="ml-2 text-xs text-slate-400">
 ({p.payment_method || 'TRANSFER'}) • {formatDate(p.paid_at || p.created_at)}
 </span>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <span className="font-bold text-emerald-700 dark:text-emerald-300">
 {formatRupiah(p.paid_amount || b.amount)}
 </span>
 <Button
 type="button"
 size="xs"
 variant="ghost"
 onClick={() => printReceipt(b, p)}
 className="cursor-pointer gap-1 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
 >
 <Printer className="h-3.5 w-3.5" />
 Kuitansi
 </Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </Card>
 </motion.div>
 )
 })}

 {!filteredBills.length && (
 <Card className="rounded-xl border border-dashed border-emerald-300 p-16 text-center text-xs text-slate-400 dark:border-emerald-700/80">
 <CreditCard className="mx-auto mb-3 h-10 w-10 text-slate-300" />
 Tidak ada data tagihan yang sesuai kriteria pencarian.
 </Card>
 )}
 </div>

 {/* 5. STICKY FLOATING ACTION BAR FOR SELECTED BILLS */}
 <AnimatePresence>
 {selectedBillIds.length > 0 && (
 <motion.div
 initial={{ opacity: 0, y: 50 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 50 }}
 className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-2xl rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-900/95 p-3.5 sm:p-4 text-white shadow-2xl backdrop-blur-md"
 >
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/80 text-white font-extrabold text-sm">
 {selectedBillIds.length}
 </div>
 <div>
 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
 Total Pembayaran Dipilih
 </p>
 <p className="text-base sm:text-lg font-black text-emerald-400">
 {formatRupiah(selectedTotal)}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setSelectedBillIds([])}
 className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={openPaymentModal}
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: px-4 py-2 text-xs font-black shadow-lg shadow-sm hover:from-emerald-600 hover:to-teal-600 transition active:scale-95 cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <CreditCard className="h-4 w-4" />
 <span>Bayar via Virtual Account</span>
 <ChevronRight className="h-4 w-4" />
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* 6. MODAL PEMBAYARAN VIRTUAL ACCOUNT (HEROUI) */}
 <AppModal
 isOpen={isPayModalOpen}
 onClose={() => setIsPayModalOpen(false)}
 title={vaResult ? 'Instruksi Pembayaran VA' : 'Bayar Tagihan Siswa'}
 badge={vaResult ? 'Virtual Account Berhasil Diterbitkan' : 'Pilihan Bank Pembayaran'}
 icon={CreditCard}
 maxWidth="max-w-lg"
 zIndex="z-[70]"
 >
 <div>
 {payError && (
 <div className="mb-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/70 p-3 text-xs text-rose-800 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-300 flex items-start gap-2">
 <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
 <p>{payError}</p>
 </div>
 )}

 {/* STEP 1: FORM PEMILIHAN BANK & REVIEW TAGIHAN */}
 {!vaResult ? (
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
 Pilih Bank Tujuan Virtual Account:
 </label>
 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"
 onClick={() => setSelectedBank('BSI')}
 className={`rounded-xl border-2 p-3.5 text-left transition cursor-pointer ${
 selectedBank === 'BSI'
 ? 'border-slate-600 bg-emerald-50/70 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/40'
 : 'border-emerald-200/80 bg-slate-50/40 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-900'
 }`}
 >
 <div className="flex items-center justify-between mb-1.5">
 <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300">
 Bank BSI
 </span>
 {selectedBank === 'BSI' && (
 <CheckCircle2 className="h-4 w-4 text-white" />
 )}
 </div>
 <p className="text-[10px] text-slate-500 dark:text-slate-400">
 Bank Syariah Indonesia (BSI Mobile, ATM, Transfer Kode 451)
 </p>
 </button>

 <button
 type="button"
 onClick={() => setSelectedBank('NAGARI')}
 className={`rounded-xl border-2 p-3.5 text-left transition cursor-pointer ${
 selectedBank === 'NAGARI'
 ? 'border-slate-600 bg-emerald-50/70 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/40'
 : 'border-emerald-200/80 bg-slate-50/40 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-900'
 }`}
 >
 <div className="flex items-center justify-between mb-1.5">
 <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300">
 Bank Nagari
 </span>
 {selectedBank === 'NAGARI' && (
 <CheckCircle2 className="h-4 w-4 text-emerald-600" />
 )}
 </div>
 <p className="text-[10px] text-slate-500 dark:text-slate-400">
 Nagari Mobile, ATM Bank Nagari, Transfer VA Kode 118
 </p>
 </button>
 </div>
 </div>

 {/* Ringkasan Item Terpilih */}
 <div>
 <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 Rincian Tagihan yang Dibayarkan ({selectedBillsData.length} item):
 </p>
 <div className="max-h-40 overflow-y-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 p-2.5 dark:border-emerald-800/60 dark:bg-slate-900 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {selectedBillsData.map((b) => (
 <div key={b.id} className="flex items-center justify-between py-1.5 text-xs">
 <span className="truncate pr-2 font-medium text-slate-800 dark:text-slate-200">
 {b.title}
 </span>
 <span className="font-bold text-slate-900 dark:text-white shrink-0">
 {formatRupiah(b.remaining_amount || b.amount)}
 </span>
 </div>
 ))}
 </div>
 </div>

 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/30 flex items-center justify-between">
 <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
 Total yang Harus Ditransfer:
 </span>
 <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
 {formatRupiah(selectedTotal)}
 </span>
 </div>

 <div className="flex items-center justify-end gap-2 pt-2">
 <Button
 type="button"
 variant="ghost"
 onClick={() => setIsPayModalOpen(false)}
 className="text-xs cursor-pointer font-bold"
 >
 Batal
 </Button>
 <Button
 type="button"
 disabled={processingVa}
 onClick={handleProcessVaPayment}
 className="h-9 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs border border-emerald-200/80 dark:border-emerald-800/60 inline-flex items-center gap-2 cursor-pointer"
 >
 {processingVa ? (
 <>
 <RefreshCw className="h-4 w-4 animate-spin" />
 <span>Menerbitkan VA...</span>
 </>
 ) : (
 <>
 <Sparkles className="h-4 w-4" />
 <span>Terbitkan Nomor VA Resmi</span>
 </>
 )}
 </Button>
 </div>
 </div>
 ) : (
 /* STEP 2: HASIL PENERBITAN VIRTUAL ACCOUNT RESMI */
 <div className="space-y-4">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 text-center">
 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
 Nomor Virtual Account {vaResult.bank || selectedBank}
 </p>
 <div className="my-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 font-mono text-xl sm:text-2xl font-black text-emerald-900 shadow-inner dark:border-emerald-800/60 dark:bg-slate-900 dark:text-emerald-300 tracking-wider">
 {vaResult.nomor_va}
 </div>

 <div className="flex items-center justify-center gap-2 mt-3">
 <button
 type="button"
 onClick={() => handleCopyModalVa(vaResult.nomor_va)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer"
 >
 {copiedModalVa ? (
 <>
 <Check className="h-3.5 w-3.5" />
 <span>Tersalin!</span>
 </>
 ) : (
 <>
 <Copy className="h-3.5 w-3.5" />
 <span>Salin Nomor VA</span>
 </>
 )}
 </button>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-3.5 text-xs space-y-1.5 dark:border-emerald-800/60 dark:bg-slate-900">
 {vaResult.kode_biller && (
 <div className="flex justify-between">
 <span className="text-slate-500">Kode Biller / Institusi:</span>
 <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
 {vaResult.kode_biller}
 </span>
 </div>
 )}
 <div className="flex justify-between">
 <span className="text-slate-500">Nama Akademik:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {vaResult.nama_akademik || 'Yayasan Dar El Iman'}
 </span>
 </div>
 <div className="flex justify-between pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <span className="font-bold text-slate-700 dark:text-slate-300">Total Harus Ditransfer:</span>
 <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm">
 {formatRupiah(vaResult.total_bayar)}
 </span>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-2">
 <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
 <p>
 <b>Penting:</b> Nominal transfer di m-banking/ATM harus persis sama sebesar{' '}
 <b>{formatRupiah(vaResult.total_bayar)}</b>. Selisih nominal dapat menyebabkan pembayaran tidak terverifikasi otomatis oleh bank.
 </p>
 </div>

 <div className="flex items-center justify-between pt-2">
 {vaResult.panduan_url ? (
 <a
 href={vaResult.panduan_url}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50/40 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200"
 >
 <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
 <span>Panduan PDF ({selectedBank})</span>
 </a>
 ) : (
 <div />
 )}

 <Button
 type="button"
 onClick={() => {
 setIsPayModalOpen(false)
 setSelectedBillIds([])
 setVaResult(null)
 }}
 className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 rounded-xl cursor-pointer"
 >
 Selesai
 </Button>
 </div>
 </div>
 )}
 </div>
 </AppModal>

 {/* 7. PRINT RECEIPT TEMPLATE (HIDDEN ON SCREEN, VISIBLE ON PRINT) */}
 {activeReceipt && (
 <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-8">
 <div className="max-w-xl mx-auto border-2 border-slate-800 p-6 rounded-lg text-slate-900">
 <div className="text-center border-b-2 border-slate-800 pb-4">
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
 <span className="font-bold">{studentName}</span>
 </div>
 <div className="flex justify-between">
 <span>Kelas:</span>
 <span>{student?.class_name || student?.kelas?.name || '-'}</span>
 </div>
 <div className="flex justify-between border-t border-emerald-300 pt-2 font-bold">
 <span>Uraian:</span>
 <span>{activeReceipt.bill.title}</span>
 </div>
 <div className="flex justify-between text-base font-black text-emerald-800 pt-2">
 <span>Jumlah Diterima:</span>
 <span>{formatRupiah(activeReceipt.payment.paid_amount || activeReceipt.bill.amount)}</span>
 </div>
 <div className="flex justify-between pt-1">
 <span>Status:</span>
 <span className="font-bold uppercase text-emerald-700">LUNAS - TERVERIFIKASI SISTEM</span>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 )
}
