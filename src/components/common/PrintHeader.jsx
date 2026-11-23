import React from 'react'
import { resolveUnitDetails, resolveSystemLogoUrl, resolveFoundationName } from '../../utils/printHelper'
import { useUnitStore } from '../../stores/unitStore'
import { usePengaturanStore } from '../../stores/pengaturanStore'

/**
 * Reusable Official Dareliman Edu Print Header Component
 * Can be rendered directly in web pages, print preview modals, or printable sheets.
 */
export function PrintHeader({
 unit = null,
 user = null,
 title = '',
 subtitle = '',
 period = '',
 recordCount = null,
 printDate = null,
 showDivider = true,
 showTitle = true,
 className = '',
}) {
 const activeUnitFromStore = useUnitStore((s) => s.activeUnit)
 const pengaturan = usePengaturanStore((s) => s.pengaturan)

 const resolvedUnit = resolveUnitDetails(unit !== undefined ? unit : activeUnitFromStore, user)
 const systemLogoUrl = resolveSystemLogoUrl(pengaturan?.logo_url)
 const foundationName = resolveFoundationName(pengaturan?.school_name)
 const isUnit = resolvedUnit.isUnitScope !== false

 const currentDateStr = printDate || new Date().toLocaleDateString('id-ID', {
 weekday: 'long',
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })

 return (
 <header className={`dareliman-print-header-container font-sans text-slate-900 ${className}`}>
 {/* 3-Column Header Grid */}
 <div className="grid grid-cols-[80px_1fr_90px] items-center gap-3 pb-2 min-h-[52mm]">
 {/* Kolom Kiri: Logo Yayasan / Logo Sistem */}
 <div className="flex items-center justify-center w-[76px] h-[76px]">
 <img
 src={systemLogoUrl}
 alt="Logo Lembaga"
 className="max-w-[76px] max-h-[76px] w-auto h-auto object-contain block"
 onError={(e) => {
 e.target.style.display = 'none'
 const fallback = e.target.nextElementSibling
 if (fallback) fallback.style.display = 'flex'
 }}
 />
 <div className="hidden w-[76px] h-[76px] items-center justify-center bg-emerald-50 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 font-extrabold text-xs">
 {pengaturan?.logo_text || 'LOGO'}
 </div>
 </div>

 {/* Kolom Tengah: Yayasan, Nama Unit, Slogan, Alamat, Legalitas */}
 <div className="text-center px-1">
 <div className="text-[11pt] font-extrabold text-slate-900 tracking-wide uppercase leading-tight">
 {foundationName}
 </div>
 {isUnit && (
 <div className="text-[12.5pt] font-black text-[#047857] tracking-wide uppercase leading-snug mt-0.5">
 {resolvedUnit.unitName || resolvedUnit.name}
 </div>
 )}
 <div className="text-[8.5pt] font-semibold italic text-slate-700 my-0.5">
 {resolvedUnit.motto}
 </div>
 <div className="text-[7.8pt] font-medium text-slate-600">
 {resolvedUnit.address}{resolvedUnit.phone ? ` Telp. ${resolvedUnit.phone}` : ''}
 </div>
 <div className="text-[7.8pt] font-bold text-slate-900 mt-0.5">
 {isUnit
 ? `Izin Operasional No. : ${resolvedUnit.izinOperasional} | NPSN : ${resolvedUnit.npsn}`
 : (resolvedUnit.skPendirian ? `Badan Hukum SK Kemenkumham No. ${resolvedUnit.skPendirian}` : '')
 }
 </div>
 </div>

 {/* Kolom Kanan: Hanya Tampil jika Unit Pendidikan Spesifik */}
 <div
 className="flex flex-col items-center justify-center w-[90px] text-center"
 style={{ visibility: isUnit ? 'visible' : 'hidden' }}
 >
 {isUnit && resolvedUnit.logoUrl ? (
 <>
 <div className="flex items-center justify-center w-[74px] h-[74px]">
 <img
 src={resolvedUnit.logoUrl}
 alt={`Logo ${resolvedUnit.unitType}`}
 className="max-w-[74px] max-h-[74px] w-auto h-auto object-contain block"
 onError={(e) => {
 e.target.style.display = 'none'
 const fallback = e.target.nextElementSibling
 if (fallback) fallback.style.display = 'flex'
 }}
 />
 <div className="hidden w-[74px] h-[74px] items-center justify-center bg-emerald-50 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 font-black text-xs">
 {resolvedUnit.unitType}
 </div>
 </div>
 <div className="mt-1 text-[7.8pt] font-black text-[#047857] uppercase tracking-wider text-center leading-none">
 {resolvedUnit.unitType}
 </div>
 </>
 ) : isUnit ? (
 <>
 <div className="flex flex-col items-center justify-center w-[74px] h-[74px] bg-emerald-50/90 rounded-xl border-2 border-dashed border-[#047857] text-[#047857] text-center p-1 shadow-2xs">
 <span className="text-[11pt] font-black leading-tight tracking-tight uppercase text-emerald-900">{resolvedUnit.unitType || resolvedUnit.code || 'UNIT'}</span>
 </div>
 <div className="mt-1 text-[7.8pt] font-black text-[#047857] uppercase tracking-wider text-center leading-none">
 {resolvedUnit.unitType}
 </div>
 </>
 ) : (
 <div className="w-[74px] h-[74px]" />
 )}
 </div>
 </div>

 {/* Garis Header Tipis */}
 {showDivider && (
 <div className="border-b-2 border-slate-900 mt-1 mb-3" />
 )}

 {/* Judul Laporan & Metadata */}
 {showTitle && title && (
 <div className="text-center mb-3">
 <h1 className="text-[13.5pt] font-semibold text-[#047857] uppercase tracking-wide leading-tight m-0">
 {title}
 </h1>
 {(period || subtitle) && (
 <div className="text-[9pt] font-bold text-slate-700 mt-1">
 {period || subtitle}
 </div>
 )}
 <div className="flex justify-between items-center text-[8pt] text-slate-500 font-semibold mt-2 pb-1.5 border-b border-dashed border-emerald-300">
 <span>Dicetak pada: {currentDateStr}</span>
 {recordCount !== null && <span>Total Record: {recordCount} Data</span>}
 <span>Dokumen Resmi</span>
 </div>
 </div>
 )}
 </header>
 )
}

export default PrintHeader
