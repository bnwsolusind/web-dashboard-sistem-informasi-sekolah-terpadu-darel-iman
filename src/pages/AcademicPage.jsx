import { useForm } from 'react-hook-form'
import CustomSelect from '@/components/ui/CustomSelect'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Send,
  Trash2,
} from 'lucide-react'
import { useAksiLaporanBulanan, useDaftarLaporanBulanan } from '../hooks/useDashboardPemantauan'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppPageHeader from '../components/app/AppPageHeader'
import KpiCard from '../components/app/KpiCard'
import AppBadge from '../components/app/AppBadge'
import AppEmptyState from '../components/app/AppEmptyState'
import AppSkeleton from '../components/app/AppSkeleton'

export default function AcademicPage() {
  const { data: daftarLaporan, isLoading, isError, refetch } = useDaftarLaporanBulanan({ per_page: 20 })
  const aksiLaporan = useAksiLaporanBulanan()

  const formLaporan = useForm({
    defaultValues: {
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      judul_laporan: '',
      ringkasan_laporan: '',
      tindak_lanjut: '',
      status_validasi: 'draf',
    },
  })

  const submitLaporan = async (values) => {
    const payload = {
      ...values,
      bulan: Number(values.bulan),
      tahun: Number(values.tahun),
      data_tambahan: { sumber: 'modul-akademik' },
    }

    await aksiLaporan.tambah.mutateAsync(payload)
    formLaporan.reset({
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      judul_laporan: '',
      ringkasan_laporan: '',
      tindak_lanjut: '',
      status_validasi: 'draf',
    })
  }

  const reportsList = daftarLaporan?.data || []
  const totalCount = reportsList.length
  const tervalidasiCount = reportsList.filter(r => r.status_validasi === 'tervalidasi').length
  const diajukanCount = reportsList.filter(r => r.status_validasi === 'diajukan').length
  const drafCount = reportsList.filter(r => r.status_validasi === 'draf' || r.status_validasi === 'revisi').length

  const getStatusBadge = (status) => {
    switch (status) {
      case 'tervalidasi':
        return <AppBadge variant="success" dot>Tervalidasi</AppBadge>
      case 'diajukan':
        return <AppBadge variant="warning" dot>Diajukan</AppBadge>
      case 'revisi':
        return <AppBadge variant="danger" dot>Revisi</AppBadge>
      default:
        return <AppBadge variant="neutral" dot>Draf</AppBadge>
    }
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* ── Breadcrumb Navigation ── */}
      <AppBreadcrumb
        items={[
          { label: 'Akademik & LMS', to: '/dashboard/akademik/dashboard' },
          { label: 'Laporan Bulanan' },
        ]}
      />

      {/* ── Modern Hero Card ── */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-transparent blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Modul Laporan Akademik Bulanan
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <BookOpen className="h-3.5 w-3.5" />
                  Akademik & LMS
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
                Kelola pembuatan, penyusunan, dan validasi laporan bulanan akademik unit pendidikan terpadu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Total Laporan"
          value={isLoading ? undefined : totalCount}
          icon={FileText}
          colorScheme="emerald"
          subtitle="Tercatat di sistem"
          loading={isLoading}
        />
        <KpiCard
          title="Tervalidasi"
          value={isLoading ? undefined : tervalidasiCount}
          icon={CheckCircle2}
          colorScheme="green"
          subtitle="Sudah disetujui"
          loading={isLoading}
        />
        <KpiCard
          title="Diajukan"
          value={isLoading ? undefined : diajukanCount}
          icon={Send}
          colorScheme="amber"
          subtitle="Menunggu verifikasi"
          loading={isLoading}
        />
        <KpiCard
          title="Draf / Revisi"
          value={isLoading ? undefined : drafCount}
          icon={Clock}
          colorScheme="violet"
          subtitle="Membutuhkan tindakan"
          loading={isLoading}
        />
      </div>

      {/* ── Content Grid: Form Input & Table Display ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form Card Column (5 cols desktop) */}
        <div className="lg:col-span-5">
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-700/60 dark:bg-[#1B2433]">
            <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4.5 w-4.5 text-[#0E5C44] dark:text-[#3FBF75]" />
                Buat Laporan Bulanan Baru
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Isi formulir berikut untuk menambahkan data laporan akademik baru.
              </p>
            </div>

            <form onSubmit={formLaporan.handleSubmit(submitLaporan)} className="space-y-4">
              {/* Periode: Bulan & Tahun */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Bulan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="Bulan (1-12)"
                    {...formLaporan.register('bulan', { required: true })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Tahun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    placeholder="Tahun (2026)"
                    {...formLaporan.register('tahun', { required: true })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Judul Laporan */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Judul Laporan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Laporan Capaian Kurikulum Agustus"
                  {...formLaporan.register('judul_laporan', { required: true })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Ringkasan Laporan */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Ringkasan Laporan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan poin utama perkembangan akademik..."
                  {...formLaporan.register('ringkasan_laporan', { required: true })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Tindak Lanjut */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Tindak Lanjut
                </label>
                <input
                  type="text"
                  placeholder="Rencana aksi atau perbaikan berikutnya..."
                  {...formLaporan.register('tindak_lanjut')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Status Validasi */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Status Validasi <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  {...formLaporan.register('status_validasi', { required: true })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="draf">Draf</option>
                  <option value="diajukan">Diajukan</option>
                  <option value="tervalidasi">Tervalidasi</option>
                  <option value="revisi">Revisi</option>
                </CustomSelect>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={aksiLaporan.tambah.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/25 transition active:scale-98 disabled:cursor-wait disabled:opacity-70 cursor-pointer"
                >
                  {aksiLaporan.tambah.isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>Simpan Laporan Bulanan</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Table Column (7 cols desktop) */}
        <div className="lg:col-span-7">
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 overflow-hidden dark:border-emerald-700/60 dark:bg-[#1B2433]">
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-transparent p-5 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-transparent flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-[#0E5C44] dark:text-[#3FBF75]" />
                  Daftar Laporan Bulanan
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Data laporan bulanan akademik yang tersimpan dalam sistem.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {reportsList.length} Total
              </span>
            </div>

            {isLoading ? (
              <div className="p-6">
                <AppSkeleton variant="table" rows={4} cols={4} />
              </div>
            ) : isError ? (
              <div className="p-6 text-center">
                <p className="text-xs font-semibold text-rose-600">Gagal memuat data laporan.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 text-xs font-bold text-[#0E5C44] underline"
                >
                  Coba Lagi
                </button>
              </div>
            ) : reportsList.length === 0 ? (
              <div className="p-8">
                <AppEmptyState
                  title="Belum ada laporan bulanan"
                  description="Gunakan formulir di samping untuk membuat laporan akademik bulanan pertama."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Periode</th>
                      <th className="px-4 py-3.5">Judul Laporan</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reportsList.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[#0E5C44] dark:text-[#3FBF75]" />
                            <span>{row.bulan}/{row.tahun}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <strong className="block text-xs font-extrabold text-slate-900 dark:text-white">
                            {row.judul_laporan || '—'}
                          </strong>
                          {row.ringkasan_laporan && (
                            <span className="line-clamp-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {row.ringkasan_laporan}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(row.status_validasi)}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => aksiLaporan.hapus.mutate(row.id)}
                            disabled={aksiLaporan.hapus.isPending}
                            title="Hapus laporan ini"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
