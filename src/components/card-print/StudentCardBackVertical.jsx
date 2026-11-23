import React, { useId } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { FaGraduationCap } from 'react-icons/fa'
import { getCardLogoUrl } from '../../utils/cardLogoHelper'
import { resolveFoundationName } from '../../utils/printHelper'
import { usePengaturanStore } from '../../stores/pengaturanStore'

export default function StudentCardBackVertical({
 data = {},
 config = {},
 theme = {},
 pengaturan: propPengaturan = {},
 qrToken = '',
 formatDate,
 isPrint = false,
 showPattern = true,
 showWave = true,
 backTitle = 'TATA TERTIB & KETENTUAN SISWA',
 backRules,
 backAddress,
 backShowQr = true,
}) {
 const instanceId = useId().replace(/:/g, '')
 const headerGradId = `headerGradBackV_${instanceId}`
 const footerGradId = `footerGradBackV_${instanceId}`

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

 const cardClass = `w-[340px] min-w-[340px] max-w-[340px] h-[539px] min-h-[539px] max-h-[539px] ${isPrint ? 'border-0 rounded-none' : 'rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xl'}`

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
 <div className="absolute top-0 left-0 right-0 h-[140px] z-10 text-white flex items-center px-4">
 <svg
 viewBox="0 0 340 140"
 className="absolute inset-0 w-full h-full z-0 pointer-events-none"
 preserveAspectRatio="none"
 >
 <path
 d="M 0 0 L 340 0 L 340 102 C 340 138, 0 138, 0 102 Z"
 fill={primaryColor}
 style={{ fill: primaryColor }}
 />
 <path
 d="M 0 102 C 0 138, 340 138, 340 102"
 fill="none"
 stroke={accentColor}
 strokeWidth="3.5"
 />
 </svg>

 <div className="relative z-10 flex items-center gap-3">
 <div
 className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-md"
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
 <span className="text-[9px] font-bold text-emerald-100/90 tracking-wide leading-none">
 Dareliman Edu
 </span>
 <span className="text-[8px] font-bold italic text-amber-300 mt-0.5">
 TATA TERTIB SISWA
 </span>
 </div>
 </div>
 </div>
 )}

 {/* Main Content Area */}
 <div className="absolute top-[152px] left-5 right-5 bottom-[52px] flex flex-col justify-between items-center text-center z-10">
 {/* Rules List */}
 <div className="w-full text-left">
 <h4
 className="text-xs font-black uppercase tracking-wider text-center mb-1"
 style={{ color: primaryColor }}
 >
 {backTitle || 'TATA TERTIB & KETENTUAN SISWA'}
 </h4>
 <div className="h-[1.5px] w-[85%] mx-auto bg-white dark:bg-[#1B2433] mb-2.5" />
 <ol className="space-y-2 text-[9.5px] leading-relaxed font-semibold text-slate-800">
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
 <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white shadow-md border border-emerald-200/80 dark:border-emerald-800/60 text-center w-[110px] mb-1">
 <QRCodeSVG
 value={qrToken || data.nis || data.nisn || 'DARELIMAN-VERIFY'}
 size={72}
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
 viewBox="0 0 340 48"
 className="absolute inset-0 w-full h-full z-0 pointer-events-none"
 preserveAspectRatio="none"
 >
 <rect x="0" y="0" width="340" height="48" fill={primaryColor} style={{ fill: primaryColor }} />
 <line x1="0" y1="1.5" x2="340" y2="1.5" stroke={accentColor} strokeWidth="3" />
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
