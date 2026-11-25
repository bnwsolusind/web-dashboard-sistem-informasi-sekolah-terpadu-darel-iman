import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	ShieldAlert,
	ShieldCheck,
	AlertTriangle,
	FileText,
	Users,
	Scale,
	Sparkles,
	Layers,
	ChevronRight,
	TrendingDown,
	RefreshCw,
	Clock,
	CheckCircle2,
	AlertCircle,
	Eye,
} from 'lucide-react'
import { Chip as HeroChip, Button as HeroButton, Spinner as HeroSpinner } from '@heroui/react'
import { disciplineService } from '../../services/disciplineService'

export default function PrincipalDisciplineOverviewSection({ unitId, onOpenStudentSummary }) {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState(null)
	const [error, setError] = useState(null)

	const fetchOverview = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await disciplineService.getPrincipalOverview(unitId ? { unit_id: unitId } : undefined)
			if (res.success && res.data) {
				setData(res.data)
			} else {
				setError(res.message || 'Gagal memuat radar kedisiplinan unit.')
			}
		} catch (err) {
			console.error('Failed to fetch principal discipline overview:', err)
			setError(err?.response?.data?.message || 'Gagal memuat radar kedisiplinan unit.')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchOverview()
	}, [unitId])

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center p-12 rounded-[22px] bg-white border-2 border-emerald-300 shadow-md shadow-emerald-500/10 dark:bg-[#182232] dark:border-emerald-700/80">
				<HeroSpinner color="success" label="Menghubungkan ke Radar Kedisiplinan Unit..." />
			</div>
		)
	}

	if (error || !data) {
		return (
			<div className="p-6 rounded-[22px] bg-rose-50/70 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 text-center shadow-md">
				<AlertCircle className="w-9 h-9 mx-auto text-rose-600 mb-2" />
				<p className="font-bold text-sm">{error || 'Data kedisiplinan unit tidak tersedia.'}</p>
				<button
					type="button"
					onClick={fetchOverview}
					className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
				>
					<RefreshCw className="h-3.5 w-3.5" />
					<span>Coba Lagi</span>
				</button>
			</div>
		)
	}

	const { kpi, early_warning_students, warning_letters, violations_by_class, violations_by_cluster, unit } = data

	return (
		<div className="space-y-6">
			{/* ── 1. MODERN HERO CARD (HEROUI + HERO UI GLOW) ── */}
			<div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
				{/* Ambient Glows */}
				<div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
				<div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl" />

				<div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
					<div className="flex items-start gap-4">
						<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border-2 border-emerald-300/40">
							<Scale className="h-7 w-7 text-white" />
						</div>
						<div>
							<div className="flex flex-wrap items-center gap-2">
								<span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-0.5 text-[10.5px] font-black uppercase tracking-wider text-white shadow-xs">
									<Sparkles className="h-3 w-3" /> Radar Kedisiplinan &amp; Otorisasi SP
								</span>
								<span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10.5px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300/80 dark:bg-emerald-950/80 dark:border-emerald-800/80 dark:text-emerald-200">
									Unit: {unit?.name || 'Satuan Pendidikan'}
								</span>
							</div>
							<h2 className="mt-1.5 text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
								Pengawasan Tata Tertib &amp; Buku Poin Siswa
							</h2>
							<p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
								Deteksi dini siswa berisiko sanksi, monitoring akumulasi pelanggaran harian, dan tindak lanjut Surat Peringatan (SP).
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 self-start md:self-auto shrink-0">
						<button
							type="button"
							onClick={fetchOverview}
							className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-sm transition-all border-2 border-emerald-600 cursor-pointer"
						>
							<RefreshCw className="h-3.5 w-3.5 shrink-0" />
							<span>Segarkan Data</span>
						</button>
					</div>
				</div>
			</div>

			{/* ── 2. MASTER STATS GRID (4 KARTU KPI UNIT) ── */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* KPI 1: Kepatuhan */}
				<div className="relative overflow-hidden rounded-[20px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] p-4 shadow-md shadow-emerald-500/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
					<div className="flex items-center justify-between pb-2 border-b border-emerald-100/80 dark:border-emerald-800/80">
						<span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
							Tingkat Kepatuhan Unit
						</span>
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300/80 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs">
							<ShieldCheck className="h-4 w-4" />
						</div>
					</div>
					<div className="mt-3 flex items-baseline gap-2">
						<p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{kpi.compliance_rate}%</p>
						<span className="text-xs font-bold text-slate-500 dark:text-slate-400">Siswa Tertib</span>
					</div>
					<div className="mt-3 flex items-center justify-between border-t border-emerald-100/80 dark:border-emerald-800/60 pt-2 text-[10.5px]">
						<span className="text-slate-500 dark:text-slate-400 font-semibold">{kpi.clean_students} dari {kpi.total_students} Santri</span>
						<span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
							0 Poin Bersih
						</span>
					</div>
				</div>

				{/* KPI 2: Siswa Rawan & Kritis */}
				<div className="relative overflow-hidden rounded-[20px] border-2 border-rose-300 dark:border-rose-700/80 bg-white dark:bg-[#1B2433] p-4 shadow-md shadow-rose-500/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
					<div className="flex items-center justify-between pb-2 border-b border-rose-100/80 dark:border-rose-800/80">
						<span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
							Siswa Rawan (≥100 Poin)
						</span>
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-300/80 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 shadow-2xs">
							<AlertTriangle className="h-4 w-4" />
						</div>
					</div>
					<div className="mt-3 flex items-baseline gap-2">
						<p className="text-2xl font-black text-rose-700 dark:text-rose-400">{kpi.critical_students_count}</p>
						<span className="text-xs font-bold text-slate-500 dark:text-slate-400">Santri Kritis</span>
					</div>
					<div className="mt-3 flex items-center justify-between border-t border-rose-100/80 dark:border-rose-800/60 pt-2 text-[10.5px]">
						<span className="text-slate-500 dark:text-slate-400 font-semibold">Ambang Sanksi ST/SP</span>
						<span className="inline-flex items-center rounded-md bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:text-rose-300">
							Perlu Perhatian
						</span>
					</div>
				</div>

				{/* KPI 3: Surat Peringatan */}
				<div className="relative overflow-hidden rounded-[20px] border-2 border-amber-300 dark:border-amber-700/80 bg-white dark:bg-[#1B2433] p-4 shadow-md shadow-amber-500/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
					<div className="flex items-center justify-between pb-2 border-b border-amber-100/80 dark:border-amber-800/80">
						<span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
							Surat Peringatan (SP)
						</span>
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-300/80 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 shadow-2xs">
							<FileText className="h-4 w-4" />
						</div>
					</div>
					<div className="mt-3 flex items-baseline gap-1.5">
						<p className="text-2xl font-black text-amber-700 dark:text-amber-400">{kpi.total_sp_count}</p>
						<span className="text-xs font-bold text-slate-500 dark:text-slate-400">Surat Resmi</span>
					</div>
					<div className="mt-3 flex items-center justify-between border-t border-amber-100/80 dark:border-amber-800/60 pt-2 text-[10.5px]">
						<span className="text-slate-500 dark:text-slate-400 font-semibold">Tercatat di Sistem</span>
						<span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
							ST / SP1 / SP2
						</span>
					</div>
				</div>

				{/* KPI 4: Total Poin Akumulasi */}
				<div className="relative overflow-hidden rounded-[20px] border-2 border-indigo-300 dark:border-indigo-700/80 bg-white dark:bg-[#1B2433] p-4 shadow-md shadow-indigo-500/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
					<div className="flex items-center justify-between pb-2 border-b border-indigo-100/80 dark:border-indigo-800/80">
						<span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
							Poin Pelanggaran Unit
						</span>
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-300/80 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 shadow-2xs">
							<TrendingDown className="h-4 w-4" />
						</div>
					</div>
					<div className="mt-3 flex items-baseline gap-1.5">
						<p className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{kpi.total_violation_points}</p>
						<span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Poin</span>
					</div>
					<div className="mt-3 flex items-center justify-between border-t border-indigo-100/80 dark:border-indigo-800/60 pt-2 text-[10.5px]">
						<span className="text-slate-500 dark:text-slate-400 font-semibold">Dari batas 250 poin TU</span>
						<span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-black text-indigo-700 dark:text-indigo-300">
							Skala TU
						</span>
					</div>
				</div>
			</div>

			{/* ── 3. DUA KOLOM: RADAR EARLY WARNING & RIWAYAT SP ── */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
				{/* Col 1: Radar Early Warning Siswa Kritis */}
				<div className="flex flex-col rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] overflow-hidden">
					<div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
						<div className="flex items-center gap-2.5">
							<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800 shadow-2xs">
								<AlertTriangle className="h-4 w-4" />
							</div>
							<div>
								<h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
									Radar Siswa Rawan &amp; Kritis
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400">Akumulasi poin mendekati atau melewati ambang sanksi</p>
							</div>
						</div>
						<span className="rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800 px-2.5 py-0.5 text-[10px] font-black text-rose-700 dark:text-rose-300 inline-flex items-center gap-1.5 shrink-0">
							{early_warning_students.length} Siswa Terdeteksi
						</span>
					</div>

					<div className="flex-1 p-5 divide-y divide-emerald-100/80 dark:divide-emerald-900/40 overflow-y-auto max-h-[420px]">
						{early_warning_students.length === 0 ? (
							<div className="py-12 flex flex-col items-center justify-center text-center">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs mb-3">
									<ShieldCheck className="h-6 w-6" />
								</div>
								<p className="font-black text-xs text-slate-800 dark:text-slate-100">
									Alhamdulillah, Nihil Siswa Berstatus Rawan di Unit Ini.
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
									Seluruh santri menjaga adab dan kedisiplinan dengan sangat baik.
								</p>
							</div>
						) : (
							early_warning_students.map((st) => (
								<div key={st.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<h4 className="text-xs font-black text-slate-900 dark:text-white">
												{st.full_name}
											</h4>
											<span
												className={`text-[9.5px] font-black px-2 py-0.5 rounded-md border ${
													st.total_points >= 150
														? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200'
														: st.total_points >= 100
														? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
														: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
												}`}
											>
												{st.stage_name}
											</span>
										</div>
										<p className="text-xs text-slate-500 mt-0.5">
											NIS: <b className="text-slate-700 dark:text-slate-300">{st.nis}</b> • Rombel: <b className="text-slate-700 dark:text-slate-300">{st.kelas}</b>
										</p>
										{/* Mini Speedometer Progress Bar */}
										<div className="mt-1.5 flex items-center gap-2">
											<div className="w-full h-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden border border-emerald-200/50">
												<div
													className={`h-full rounded-full ${
														st.total_points >= 150
															? 'bg-rose-600'
															: st.total_points >= 100
															? 'bg-amber-500'
															: 'bg-emerald-500'
													}`}
													style={{ width: `${Math.min(100, (st.total_points / 250) * 100)}%` }}
												/>
											</div>
											<span className="text-[10px] font-black tabular-nums text-slate-700 dark:text-slate-300 shrink-0">
												{st.total_points}/250
											</span>
										</div>
									</div>

									<div className="shrink-0 flex items-center gap-1.5">
										{onOpenStudentSummary && (
											<button
												type="button"
												className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300/80 transition-all cursor-pointer shadow-xs"
												onClick={() => onOpenStudentSummary(st.id)}
												title="Lihat Lembar Skor Santri"
											>
												<Eye className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Col 2: Surat Peringatan Terbitan & Pemanggilan Ortu */}
				<div className="flex flex-col rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] overflow-hidden">
					<div className="flex items-center justify-between px-5 py-4 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
						<div className="flex items-center gap-2.5">
							<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 shadow-2xs">
								<FileText className="h-4 w-4" />
							</div>
							<div>
								<h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
									Surat Peringatan &amp; Respon Ortu
								</h3>
								<p className="text-xs text-slate-500 dark:text-slate-400">Status tindak lanjut dan konseling orang tua</p>
							</div>
						</div>
						<span className="rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300 inline-flex items-center gap-1.5 shrink-0">
							{warning_letters.length} Terdaftar
						</span>
					</div>

					<div className="flex-1 p-5 divide-y divide-emerald-100/80 dark:divide-emerald-900/40 overflow-y-auto max-h-[420px]">
						{warning_letters.length === 0 ? (
							<div className="py-12 flex flex-col items-center justify-center text-center">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs mb-3">
									<CheckCircle2 className="h-6 w-6" />
								</div>
								<p className="font-black text-xs text-slate-800 dark:text-slate-100">
									Nihil Surat Peringatan di Unit Ini.
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
									Tidak ada santri yang membutuhkan penerbitan ST atau SP resmi.
								</p>
							</div>
						) : (
							warning_letters.map((wl) => (
								<div key={wl.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="font-black text-xs text-slate-900 dark:text-white">
												{wl.student?.full_name || 'Santri'}
											</span>
											<span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-200">
												{wl.letter_type?.toUpperCase()}
											</span>
										</div>
										<p className="text-xs text-slate-500 mt-0.5">
											No: <b className="text-slate-700 dark:text-slate-300">{wl.letter_number}</b> • Rombel: <b className="text-slate-700 dark:text-slate-300">{wl.student?.kelas?.nama_kelas || '-'}</b>
										</p>
										<p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
											<Clock className="h-3 w-3" /> Tanggal Terbit: {wl.issue_date} • Akumulasi: <b className="text-rose-600">{wl.cumulative_points} Poin</b>
										</p>
									</div>
									<div className="shrink-0 text-right">
										<span
											className={`text-[9.5px] font-black px-2 py-0.5 rounded-md border ${
												wl.parent_summon_status === 'selesai_konseling'
													? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
													: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
											}`}
										>
											{wl.parent_summon_status === 'selesai_konseling' ? 'Konseling Selesai' : 'Menunggu Ortu'}
										</span>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* ── 4. ANALISIS KELAS & KLUSTER PELANGGARAN ── */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Kasus per Rombel */}
				<div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
					<h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
						<Layers className="h-4 w-4 text-emerald-600" /> Pelanggaran Berdasarkan Rombel/Kelas
					</h4>
					<div className="space-y-2">
						{violations_by_class.length === 0 ? (
							<div className="p-4 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-center">
								<p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Nihil catatan pelanggaran di seluruh kelas.</p>
							</div>
						) : (
							violations_by_class.map((c, i) => (
								<div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-slate-900/60 text-xs font-medium">
									<span className="font-bold text-slate-800 dark:text-slate-200">{c.class_name}</span>
									<div className="flex items-center gap-3">
										<span className="text-xs text-slate-500">{c.count} Kasus</span>
										<span className="font-black text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-200">
											+{c.total_points} Poin
										</span>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Kasus per Kluster */}
				<div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
					<h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
						<Scale className="h-4 w-4 text-emerald-600" /> Distribusi Kluster Tata Tertib
					</h4>
					<div className="space-y-2">
						{violations_by_cluster.length === 0 ? (
							<div className="p-4 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-center">
								<p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Nihil catatan pelanggaran kluster.</p>
							</div>
						) : (
							violations_by_cluster.map((cl, i) => (
								<div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-slate-900/60 text-xs font-medium">
									<span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs">
										{cl.cluster?.replace('_', ' ')}
									</span>
									<div className="flex items-center gap-3">
										<span className="text-xs text-slate-500">{cl.count} Kasus</span>
										<span className="font-black text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-200">
											+{cl.total_points} Poin
										</span>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
