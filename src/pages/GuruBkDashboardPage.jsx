import React, { useState, useEffect } from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  FileText,
  ShieldCheck,
  Users,
  AlertTriangle,
  Plus,
  RefreshCw
} from 'lucide-react'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiStatCard,
  AppDataTable,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
  HeroUiHeader
} from '../components/app'
import { Tooltip } from '../components/ui/tooltip'

import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'

import {
  managementDashboardService
} from '../services/managementDashboardService'

export default function GuruBkDashboardPage() {
 const navigate = useNavigate()
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [data, setData] = useState(null)
 const [activeModal, setActiveModal] = useState(null)

 const fetchDashboard = async () => {
 setLoading(true)
 setError(null)
 try {
 const res = await managementDashboardService.getGuruBk()
 if (res && res.data) {
 setData(res.data)
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to load Guru BK dashboard:', err)
 setError(err.response?.data?.message || 'Gagal memuat data dashboard Guru BK.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDashboard()
 }, [])

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

 const kpis = data?.kpis || {}
 const context = data?.context || {}
 const tables = data?.tables || {}

 const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

 const caseColumns = [
 {
 key: 'student',
 label: 'Nama Siswa',
 render: (row) => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.student?.full_name || 'Siswa'}</span>,
 },
 {
 key: 'category',
 label: 'Kategori',
 render: (row) => <AppBadge variant="info">{row.category || 'Konseling'}</AppBadge>,
 },
 {
 key: 'title',
 label: 'Judul Catatan',
 render: (row) => <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{row.title || 'Catatan Pendampingan'}</span>,
 },
 {
 key: 'priority',
 label: 'Prioritas',
 render: (row) => (
 <AppBadge variant={row.priority === 'Tinggi' || row.priority === 'High' ? 'danger' : 'warning'} dot>
 {row.priority || 'Normal'}
 </AppBadge>
 ),
 },
 {
 key: 'date',
 label: 'Tanggal',
 render: (row) => <span className="text-xs text-slate-500 font-medium">{row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-')}</span>,
 },
 ]

 return (
 <PageContainer maxW="7xl">
 <div className="space-y-6 pb-12">
 {/* Breadcrumb Navigation */}
 <AppBreadcrumb items={[{ label: 'Dashboard Guru BK' }]} />

      {/* Modern Vivid Emerald HeroUI Header */}
      <HeroUiHeader
        icon={ShieldCheck}
        title="Dashboard Guru BK (Bimbingan Konseling)"
        tag={{ text: 'Konseling & Proteksi BK', icon: ShieldCheck }}
        description="Ruang pendampingan konseling dan penanganan catatan perilaku santri yang terproteksi dan rahasia."
        actions={
          <div className="flex items-center gap-2">
            <Tooltip content="Tambah Catatan Konseling Baru">
              <button
                type="button"
                onClick={() => navigate('/portal-guru/workspace')}
                aria-label="Tambah Catatan Konseling Baru"
                className="size-9 flex items-center justify-center p-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="size-4 text-white" />
              </button>
            </Tooltip>
            <Tooltip content="Segarkan Data Konseling">
              <button
                type="button"
                onClick={fetchDashboard}
                disabled={loading}
                aria-label="Segarkan Data Konseling"
                className="size-9 flex items-center justify-center p-0 rounded-xl border-2 border-emerald-300/80 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={loading ? 'size-4 animate-spin text-emerald-700' : 'size-4 text-emerald-700 dark:text-emerald-300'} />
              </button>
            </Tooltip>
          </div>
        }
      />

 {/* Filter Bar */}
 <AppFilterBar label="Filter Kasus Konseling" onReset={fetchDashboard} />

 {/* Primary KPI Grid */}
 <section className="space-y-3">
 <SectionHeader title="Kondisi Kasus & Pendampingan Konseling" subtitle="Total catatan konseling, siswa didampingi, dan kasus butuh tindak lanjut" />
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <KpiStatCard
 title="Total Catatan Konseling"
 value={formatNumber(kpis.total_konseling?.total)}
 icon={FileText}
 tone="emerald"
 badge="Catatan BK"
 onClick={() => setActiveModal('total_konseling')}
 />
 <KpiStatCard
 title="Siswa Dalam Pendampingan"
 value={formatNumber(kpis.siswa_dalam_pendampingan?.total)}
 icon={Users}
 tone="blue"
 badge="Didampingi"
 onClick={() => setActiveModal('siswa_dalam_pendampingan')}
 />
 <KpiStatCard
 title="Butuh Tindak Lanjut"
 value={formatNumber(kpis.kasus_menunggu_tindak_lanjut?.total)}
 icon={AlertTriangle}
 tone="amber"
 badge="Pending"
 onClick={() => setActiveModal('kasus_menunggu_tindak_lanjut')}
 />
 <KpiStatCard
 title="Kasus Prioritas Tinggi"
 value={formatNumber(kpis.kasus_prioritas_tinggi?.total)}
 icon={AlertTriangle}
 tone="rose"
 badge="Prioritas"
 onClick={() => setActiveModal('kasus_prioritas_tinggi')}
 />
 </div>
 </section>

 {/* Security Banner */}
 <section className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
 <ShieldCheck className="h-6 w-6 text-[#059669] dark:text-[#10B981] shrink-0" />
 <div className="text-xs">
 <span className="font-bold block text-sm">Proteksi Kerahasiaan Data BK Terjamin</span>
 Catatan konseling dan pendampingan siswa hanya dapat diakses oleh konselor / guru BK yang berwenang.
 </div>
 </section>

 {/* Quick Action Navigation */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs">
              <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">Aksi Cepat Guru BK</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Pintas penambahan dan penelusuran catatan konseling siswa</p>
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
          </div>
        </div>
      </section>

 {/* Active Cases Table */}
 <section className="space-y-3">
 <AppDataTable
 title="Daftar Pendampingan / Catatan Konseling Terbaru"
 description="Informasi umum pendampingan siswa terdaftar"
 data={tables.cases || []}
 columns={caseColumns}
 keyField="student"
 searchPlaceholder="Cari siswa atau catatan konseling..."
 />
 </section>

 {/* KPI Detail Modal */}
 <ModalErrorBoundary onClose={() => setActiveModal(null)}>
 <KpiQuickViewModal
 type={activeModal}
 isOpen={Boolean(activeModal)}
 onClose={() => setActiveModal(null)}
 />
 </ModalErrorBoundary>
 </div>
 </PageContainer>
 )
}
