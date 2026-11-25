import React, { useState, useEffect, useCallback } from 'react'
import {
	FileSpreadsheet,
	Save,
	Calendar,
	CheckCircle2,
	AlertCircle,
	FileText,
	Send,
	ListOrdered,
	RefreshCw,
	Sparkles,
	Clock,
	Check,
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import AppModal from '../app/AppModal'
import { FieldLabel, FieldDescription } from '@/components/ui/field'
import { dashboardPemantauanService } from '../../services/dashboardPemantauanService'
import HeroUiFilterSelect from '@/components/ui/HeroUiFilterSelect'

const BULAN_LIST = [
	{ value: '1', label: 'Januari' },
	{ value: '2', label: 'Februari' },
	{ value: '3', label: 'Maret' },
	{ value: '4', label: 'April' },
	{ value: '5', label: 'Mei' },
	{ value: '6', label: 'Juni' },
	{ value: '7', label: 'Juli' },
	{ value: '8', label: 'Agustus' },
	{ value: '9', label: 'September' },
	{ value: '10', label: 'Oktober' },
	{ value: '11', label: 'November' },
	{ value: '12', label: 'Desember' },
]

export default function InputLaporanBulananModal({
	isOpen,
	onClose,
	unitName = 'Unit Sekolah',
	onSuccess,
}) {
	const currentDate = new Date()
	const defaultMonth = String(currentDate.getMonth() + 1)
	const defaultYear = currentDate.getFullYear()

	const [activeTab, setActiveTab] = useState('form') // 'form' | 'history'
	const [bulan, setBulan] = useState(defaultMonth)
	const [tahun, setTahun] = useState(defaultYear)
	const [judulLaporan, setJudulLaporan] = useState('')
	const [ringkasanLaporan, setRingkasanLaporan] = useState('')
	const [tindakLanjut, setTindakLanjut] = useState('')
	const [statusValidasi, setStatusValidasi] = useState('diajukan')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errors, setErrors] = useState({})

	// History reports states
	const [reportsList, setReportsList] = useState([])
	const [loadingReports, setLoadingReports] = useState(false)

	// Fetch historical reports
	const fetchReportsHistory = useCallback(async () => {
		setLoadingReports(true)
		try {
			const res = await dashboardPemantauanService.getDaftarLaporanBulanan({
				tahun: tahun,
				per_page: 50,
			})
			const data = res?.data?.data || res?.data || res || []
			setReportsList(Array.isArray(data) ? data : [])
		} catch (err) {
			console.error('Failed to load submitted monthly reports:', err)
		} finally {
			setLoadingReports(false)
		}
	}, [tahun])

	// Update automatic title when month or year changes
	useEffect(() => {
		if (isOpen) {
			const monthObj = BULAN_LIST.find((b) => b.value === String(bulan))
			const monthName = monthObj ? monthObj.label : ''
			setJudulLaporan(`Laporan Kinerja & Evaluasi Bulanan - ${monthName} ${tahun}`)
			setErrors({})
			fetchReportsHistory()
		}
	}, [isOpen, bulan, tahun, fetchReportsHistory])

	const validate = () => {
		const errs = {}
		if (!judulLaporan.trim()) errs.judulLaporan = 'Judul laporan wajib diisi'
		if (!ringkasanLaporan.trim()) errs.ringkasanLaporan = 'Ringkasan laporan kinerja wajib diisi'
		setErrors(errs)
		return Object.keys(errs).length === 0
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!validate()) return

		setIsSubmitting(true)
		try {
			const payload = {
				bulan: parseInt(bulan, 10),
				tahun: parseInt(tahun, 10),
				judul_laporan: judulLaporan.trim(),
				ringkasan_laporan: ringkasanLaporan.trim(),
				tindak_lanjut: tindakLanjut.trim() || null,
				status_validasi: statusValidasi,
				data_tambahan: {
					unit_pelapor: unitName,
					waktu_input: new Date().toISOString(),
				},
			}

			await dashboardPemantauanService.tambahLaporanBulanan(payload)

			await Swal.fire({
				icon: 'success',
				title: 'Laporan Berhasil Terkirim!',
				text: `Laporan bulanan ${judulLaporan} telah berhasil disimpan dan diteruskan ke Pengurus Yayasan & Divisi Pendidikan.`,
				confirmButtonColor: '#059669',
			})

			// Reset form & reload history
			setRingkasanLaporan('')
			setTindakLanjut('')
			setActiveTab('history')
			fetchReportsHistory()
			if (onSuccess) onSuccess()
		} catch (err) {
			const msg = err?.response?.data?.message || 'Gagal menyimpan laporan bulanan. Pastikan data valid.'
			Swal.fire({
				icon: 'error',
				title: 'Gagal Menyimpan Laporan',
				text: msg,
				confirmButtonColor: '#059669',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<AppModal
			isOpen={isOpen}
			onClose={onClose}
			title="Input Laporan Kinerja Bulanan"
			description={`Laporan resmi operasional kepala sekolah (${unitName}) untuk Divisi Pendidikan & Yayasan`}
			icon={FileSpreadsheet}
			maxWidth="max-w-3xl"
			variant="emerald"
			zIndex={60}
			bodyClassName="p-5 sm:p-6 space-y-4"
			subHeader={
				<div className="flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
					<button
						type="button"
						onClick={() => setActiveTab('form')}
						className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
							activeTab === 'form'
								? 'bg-emerald-600 text-white shadow-xs'
								: 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/60 dark:text-slate-300 dark:hover:bg-slate-800'
						}`}
					>
						<FileText className="size-3.5" />
						<span>Form Input Laporan Baru</span>
					</button>
					<button
						type="button"
						onClick={() => {
							setActiveTab('history')
							fetchReportsHistory()
						}}
						className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
							activeTab === 'history'
								? 'bg-emerald-600 text-white shadow-xs'
								: 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/60 dark:text-slate-300 dark:hover:bg-slate-800'
						}`}
					>
						<ListOrdered className="size-3.5" />
						<span>Daftar Laporan Resmi Dikirim</span>
						<span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
							activeTab === 'history'
								? 'bg-white text-emerald-800'
								: 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200'
						}`}>
							{reportsList.length}
						</span>
					</button>
				</div>
			}
			footer={
				activeTab === 'form' ? (
					<>
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black transition-all cursor-pointer border border-slate-300 dark:border-slate-700 active:scale-95"
						>
							Batal
						</button>
						<button
							type="submit"
							form="input-laporan-bulanan-form"
							disabled={isSubmitting}
							className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2 cursor-pointer border-2 border-emerald-600 active:scale-95 disabled:opacity-50"
						>
							{isSubmitting ? (
								<>
									<div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									<span>Menyimpan Laporan...</span>
								</>
							) : (
								<>
									<Send className="size-3.5" />
									<span>Simpan &amp; Kirim Laporan</span>
								</>
							)}
						</button>
					</>
				) : (
					<button
						type="button"
						onClick={onClose}
						className="h-9.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black transition-all cursor-pointer active:scale-95"
					>
						Tutup
					</button>
				)
			}
		>
			{activeTab === 'form' ? (
				<form id="input-laporan-bulanan-form" onSubmit={handleSubmit} className="space-y-4">
					{/* Form Info Box */}
					<div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/80 text-xs">
						<Sparkles className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
						<div className="text-slate-700 dark:text-slate-200">
							<p className="font-extrabold text-emerald-900 dark:text-emerald-200">Laporan Resmi Operasional</p>
							<p className="mt-0.5 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
								Laporan bulanan akan otomatis terkirim dan tersinkronisasi ke pemantauan divisi pendidikan yayasan serta pengurus pembina yayasan.
							</p>
						</div>
					</div>

					{/* Grid: Bulan (4 col), Tahun (3 col), Status (5 col) */}
					<div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
						<div className="sm:col-span-4">
							<FieldLabel className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5 block">
								Bulan Laporan
							</FieldLabel>
							<HeroUiFilterSelect
								size="sm"
								value={bulan}
								onChange={(val) => setBulan(val)}
								options={BULAN_LIST.map((b) => ({
									value: String(b.value),
									label: b.label,
								}))}
								placeholder="Pilih Bulan"
								aria-label="Bulan Laporan"
							/>
						</div>

						<div className="sm:col-span-3">
							<FieldLabel className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5 block">
								Tahun Laporan
							</FieldLabel>
							<input
								type="number"
								min="2020"
								max="2035"
								value={tahun}
								onChange={(e) => setTahun(Number(e.target.value))}
								className="w-full h-10 px-3.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
							/>
						</div>

						<div className="sm:col-span-5">
							<FieldLabel className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5 block">
								Status Pengajuan
							</FieldLabel>
							<HeroUiFilterSelect
								size="sm"
								value={statusValidasi}
								onChange={(val) => setStatusValidasi(val)}
								options={[
									{ value: 'diajukan', label: 'Ajukan Sekarang (Diajukan)' },
									{ value: 'draf', label: 'Simpan Sebagai Draf' },
								]}
								placeholder="Pilih Status"
								aria-label="Status Pengajuan"
							/>
						</div>
					</div>

					{/* Judul Laporan */}
					<div>
						<FieldLabel className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5 block">
							Judul Laporan <span className="text-rose-500">*</span>
						</FieldLabel>
						<input
							type="text"
							value={judulLaporan}
							onChange={(e) => setJudulLaporan(e.target.value)}
							placeholder="Contoh: Laporan Evaluasi & Kinerja Bulanan - November 2026"
							className={`w-full h-10 px-3.5 rounded-xl border-2 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none transition-all shadow-xs dark:bg-slate-900 ${
								errors.judulLaporan
									? 'border-rose-400 bg-rose-50/50 dark:border-rose-700'
									: 'border-[#b6f6d9] bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80'
							}`}
						/>
						{errors.judulLaporan && (
							<p className="text-xs font-semibold text-rose-500 mt-1">{errors.judulLaporan}</p>
						)}
					</div>

					{/* Ringkasan Laporan Kinerja */}
					<div>
						<FieldLabel className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5 block">
							Ringkasan Capaian &amp; Kinerja Unit <span className="text-rose-500">*</span>
						</FieldLabel>
						<textarea
							rows={4}
							value={ringkasanLaporan}
							onChange={(e) => setRingkasanLaporan(e.target.value)}
							placeholder="Tuliskan capaian akademik, perkembangan tahfizh, kedisiplinan guru & siswa, serta program unit yang telah terealisasi..."
							className={`w-full p-3.5 rounded-xl border-2 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none transition-all shadow-xs dark:bg-slate-900 leading-relaxed ${
								errors.ringkasanLaporan
									? 'border-rose-400 bg-rose-50/50 dark:border-rose-700'
									: 'border-[#b6f6d9] bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80'
							}`}
						/>
						{errors.ringkasanLaporan ? (
							<p className="text-xs font-semibold text-rose-500 mt-1">{errors.ringkasanLaporan}</p>
						) : (
							<FieldDescription className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
								Mencakup persentase kehadiran, kelulusan juz tahfizh, kegiatan ekstrakurikuler, dan tata kelola unit.
							</FieldDescription>
						)}
					</div>

					{/* Kendala & Rencana Tindak Lanjut */}
					<div>
						<FieldLabel className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5 block">
							Kendala Lapangan &amp; Rencana Tindak Lanjut Solutif
						</FieldLabel>
						<textarea
							rows={3}
							value={tindakLanjut}
							onChange={(e) => setTindakLanjut(e.target.value)}
							placeholder="Tuliskan hambatan yang dihadapi unit sekolah dan solusi/bantuan yang diharapkan dari yayasan/divisi..."
							className="w-full p-3.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:text-slate-100 transition-all shadow-xs leading-relaxed"
						/>
					</div>
				</form>
			) : (
				/* History Table Tab */
				<div className="space-y-4">
					<div className="flex items-center justify-between pb-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
						<div>
							<h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
								Daftar Rekam Laporan Resmi Unit
							</h4>
							<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
								Rekam laporan kinerja yang telah dikirim ke Divisi Pendidikan &amp; Yayasan
							</p>
						</div>
						<button
							type="button"
							onClick={fetchReportsHistory}
							disabled={loadingReports}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
						>
							<RefreshCw className={`size-3.5 ${loadingReports ? 'animate-spin' : ''}`} />
							<span>Segarkan</span>
						</button>
					</div>

					{loadingReports ? (
						<div className="py-12 flex flex-col items-center justify-center text-slate-400">
							<div className="size-7 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mb-2" />
							<p className="text-xs font-bold text-slate-600 dark:text-slate-300">Memuat riwayat laporan...</p>
						</div>
					) : reportsList.length === 0 ? (
						<div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/30 dark:bg-emerald-950/20 p-6">
							<FileSpreadsheet className="size-10 text-emerald-400 mb-2 stroke-1" />
							<p className="text-xs font-bold text-slate-700 dark:text-slate-200">Belum Ada Laporan Terkirim</p>
							<p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
								Unit belum mengirimkan laporan kinerja resmi untuk periode tahun ini. Silakan input laporan baru melalui tab form.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xs">
							<table className="w-full text-left text-xs">
								<thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 border-b-2 border-emerald-200/90 text-emerald-900 dark:text-emerald-200 font-black">
									<tr>
										<th className="py-2.5 px-3">Periode</th>
										<th className="py-2.5 px-3">Judul &amp; Ringkasan</th>
										<th className="py-2.5 px-3">Status</th>
										<th className="py-2.5 px-3">Tanggal Input</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 bg-white dark:bg-[#1B2433]">
									{reportsList.map((r, idx) => {
										const monthName = BULAN_LIST.find((b) => b.value === String(r.bulan))?.label || `Bulan ${r.bulan}`
										const isApproved = r.status_validasi === 'disetujui' || r.status_validasi === 'terverifikasi'
										const isSubmitted = r.status_validasi === 'diajukan'
										return (
											<tr key={r.id || idx} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors">
												<td className="py-3 px-3 align-top whitespace-nowrap">
													<span className="font-extrabold text-emerald-800 dark:text-emerald-300 block">
														{monthName} {r.tahun}
													</span>
													<span className="text-[10px] text-slate-400 font-mono">
														ID #{r.id || idx + 1}
													</span>
												</td>
												<td className="py-3 px-3 align-top">
													<p className="font-extrabold text-slate-900 dark:text-white leading-tight">
														{r.judul_laporan || 'Laporan Kinerja Bulanan'}
													</p>
													<p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-2 mt-1 leading-snug">
														{r.ringkasan_laporan || '-'}
													</p>
													{r.tindak_lanjut && (
														<p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 font-semibold flex items-center gap-1">
															<AlertCircle className="size-3 shrink-0" />
															<span>Tindak lanjut: {r.tindak_lanjut}</span>
														</p>
													)}
												</td>
												<td className="py-3 px-3 align-top whitespace-nowrap">
													<span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
														isApproved
															? 'bg-emerald-50 text-emerald-800 border-emerald-300'
															: isSubmitted
															? 'bg-teal-50 text-teal-800 border-teal-300'
															: 'bg-slate-100 text-slate-700 border-slate-300'
													}`}>
														{isApproved && <Check className="size-3" />}
														{isSubmitted && <Clock className="size-3" />}
														<span className="capitalize">{r.status_validasi || 'diajukan'}</span>
													</span>
												</td>
												<td className="py-3 px-3 align-top whitespace-nowrap text-[11px] text-slate-500 font-medium">
													{r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', {
														day: 'numeric',
														month: 'short',
														year: 'numeric'
													}) : 'Baru saja'}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</AppModal>
	)
}
