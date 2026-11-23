import React, { useId } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { FaGraduationCap } from 'react-icons/fa'
import { getCardLogoUrl } from '../../utils/cardLogoHelper'
import { resolveFoundationName } from '../../utils/printHelper'
import { usePengaturanStore } from '../../stores/pengaturanStore'

export default function StudentCardBackHorizontal({
 data = {},
 config = {},
 theme = {},
 pengaturan: propPengaturan = {},
 qrToken = '',
 formatDate,
 isPrint = false,
 showPattern = true,
 showWave = true,
 backTitle = 'TATA TERTIB SISWA',
 backRules,
 backAddress,
 backShowQr = true,
}) {
 const instanceId = useId().replace(/:/g, '')
 const headerGradId = `headerGradBackH_${instanceId}`
 const footerGradId = `footerGradBackH_${instanceId}`

 const primaryColor = theme.primary || '#004D32'
 const darkColor = theme.dark || '#003822'
 const accentColor = theme.accent || '#E5A93C'

 const storePengaturan = usePengaturanStore((state) => state.pengaturan)
 const pengaturan =
 propPengaturan && Object.keys(propPengaturan).length > 0
 ? propPengaturan
 : (storePengaturan || {})

 const schoolName =
 resolveFoundationName(
 pengaturan?.school_name ||
 pengaturan?.institution_name ||
 pengaturan?.nama_yayasan ||
 pengaturan?.yayasan
 ) ||
 pengaturan?.school_name ||
 'YAYASAN DAR EL-IMAN'
 const brandTitle = schoolName.replace(/^YAYASAN\s*/i, '').replace(/\s*-\s*/g, '-').trim()
 const logoUrl = getCardLogoUrl(pengaturan, data)

 const defaultBackRules =
 pengaturan?.card_rules_student ||
 `1. Kartu ini adalah kartu identitas resmi siswa ${schoolName}.\n2. Wajib dibawa & dikenakan selama jam KBM sekolah.\n3. Apabila menemukan kartu ini, harap mengembalikan ke piket sekolah.\n4. QR Code digunakan untuk absensi gerbang & verifikasi Dareliman Edu.`
 const resolvedRulesText = backRules
 ? backRules.replace(/Yayasan\s+Dar\s*el-?Iman/gi, schoolName)
 : defaultBackRules
 const rulesList = (resolvedRulesText || '').split('\n').filter((r) => r.trim().length > 0)

 const cardClass = `w-[560px] min-w-[560px] max-w-[560px] h-[353px] min-h-[353px] max-h-[353px] ${isPrint ? 'border-0 rounded-none' : 'rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xl'}`

 return (
 <article
 className={`${cardClass} relative block overflow-hidden bg-white text-slate-900 font-sans box-border`}
 >
 {/* Pattern background */}
 {showPattern && (
 <span
 className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
 style={{
 backgroundImage: `radial-gradient(${primaryColor} 1.2px, transparent 1.2px)`,
 backgroundSize: '12px 12px',
 }}
 />
 )}

 {/* Top Header Arc Banner SVG */}
 {showWave && (
 <div className="absolute top-0 left-0 right-0 h-[74px] z-10 flex items-center px-4">
 <svg
 viewBox="0 0 560 74"
 className="absolute inset-0 w-full h-full z-0 pointer-events-none"
 preserveAspectRatio="none"
 >
 <path
 d="M 0 0 L 560 0 L 560 50 C 560 74, 500 74, 440 74 L 0 74 Z"
 fill={primaryColor}
 style={{ fill: primaryColor }}
 />
 <path
 d="M 0 72.5 L 440 72.5 C 500 72.5, 560 72.5, 560 50"
 fill="none"
 stroke={accentColor}
 strokeWidth="3.5"
 />
 </svg>

 <div className="relative z-10 flex items-center gap-3">
 <div
 className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-md"
 style={{ border: `2px solid ${accentColor}` }}
 >
 {logoUrl ? (
 <img
 src={logoUrl}
 alt="Logo"
 className="h-full w-full object-contain"
 onError={(e) => {
 e.currentTarget.style.display = 'none'
 if (e.currentTarget.nextElementSibling) {
 e.currentTarget.nextElementSibling.style.display = 'flex'
 }
 }}
 />
 ) : null}
 <span
 className="items-center justify-center font-black text-xs uppercase"
 style={{ display: logoUrl ? 'none' : 'flex', color: primaryColor }}
 >
 <FaGraduationCap className="text-xl" />
 </span>
 </div>
 <div className="flex flex-col min-w-0 text-white">
 <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-emerald-100/90 leading-none">
 YAYASAN
 </span>
 <h3 className="text-sm font-black uppercase tracking-tight text-white leading-none my-0.5">
 {brandTitle}
 </h3>
 <span className="text-[8.5px] font-bold text-emerald-100/90 tracking-wide leading-none">
 Dareliman Edu
 </span>
 </div>
 </div>
 </div>
 )}

 {/* Top Right Header Badge SVG */}
 <div className="absolute top-0 right-5 h-[30px] z-10 flex items-center justify-center px-4">
 <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 140 30">
 <path d="M 0 0 L 140 0 L 140 20 C 140 26, 132 30, 124 30 L 16 30 C 8 30, 0 26, 0 20 Z" fill={darkColor} />
 <path d="M 0 0 L 0 20 C 0 26, 8 30, 16 30 L 124 30 C 132 30, 140 26, 140 20 L 140 0" fill="none" stroke={accentColor} strokeWidth="1.5" />
 </svg>
 <span className="relative z-10 text-white text-[9.5px] font-black uppercase tracking-widest">
 TATA TERTIB SISWA
 </span>
 </div>

 {/* Main Content Area */}
 <div className="absolute top-[82px] left-5 right-5 bottom-[52px] flex items-center justify-between gap-4 z-10">
 {/* Rules List */}
 <div className="flex-1 min-w-0 text-left">
 <h4
 className="text-xs font-black uppercase tracking-wider mb-1"
 style={{ color: primaryColor }}
 >
 {backTitle || 'TATA TERTIB SISWA'}
 </h4>
 <div className="h-[1.5px] w-full bg-white dark:bg-[#1B2433] mb-2" />
 <ol className="space-y-1.5 text-[9.5px] leading-snug font-semibold text-slate-800">
 {rulesList.map((rule, idx) => (
 <li key={idx} className="flex items-start gap-1.5">
 <span className="font-black shrink-0" style={{ color: primaryColor }}>
 {idx + 1}.
 </span>
 <span>{rule.replace(/^\d+\.\s*/, '')}</span>
 </li>
 ))}
 </ol>
 </div>

 {/* QR Verification Box */}
 {backShowQr && (
 <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60 text-center w-[116px] shrink-0">
 <QRCodeSVG
 value={qrToken || data.nis || data.nisn || 'DARELIMAN-VERIFY'}
 size={84}
 level="M"
 marginSize={1}
 bgColor="#ffffff"
 fgColor="#0f172a"
 />
 <span className="mt-1 text-[7.5px] font-black text-slate-600 uppercase tracking-wider">
 VERIFIKASI DARELIMAN EDU
 </span>
 </div>
 )}
 </div>

 {/* Footer Banner SVG */}
 <footer className="absolute bottom-0 left-0 right-0 h-[48px] flex items-center px-4 text-white z-20">
 <svg
 viewBox="0 0 560 48"
 className="absolute inset-0 w-full h-full z-0 pointer-events-none"
 preserveAspectRatio="none"
 >
 <rect x="0" y="0" width="560" height="48" fill={primaryColor} style={{ fill: primaryColor }} />
 <line x1="0" y1="1.5" x2="560" y2="1.5" stroke={accentColor} strokeWidth="3" />
 </svg>

 <div className="relative z-10 grid grid-cols-[1fr_auto] w-full items-center divide-x divide-emerald-200/80/20 text-xs">
 <div className="pr-2.5 min-w-0">
 <p className="text-[8px] font-semibold text-emerald-50 leading-tight">
 {pengaturan?.address || '-'}
 </p>
 <p className="text-[7.5px] font-medium text-emerald-100 leading-tight">
 {pengaturan?.phone ? `Telp: ${pengaturan.phone}` : ''}
 {pengaturan?.website ? ` | Website: ${pengaturan.website}` : ''}
 </p>
 </div>

 <div className="pl-2.5 text-right min-w-0 shrink-0">
 <span className="text-[7.5px] font-black text-emerald-100 uppercase block leading-none">
 TAHUN AJARAN
 </span>
 <span className="text-[9.5px] font-black text-white block mt-0.5 leading-none">
 {data?.academic_year || data?.tahun_ajaran || data?.tahun_ajaran_berjalan || pengaturan?.tahun_ajaran_aktif || '2026/2027'}
 </span>
 </div>
 </div>
 </footer>
 </article>
 )
}
