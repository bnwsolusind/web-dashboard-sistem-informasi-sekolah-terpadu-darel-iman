import React, { useId } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
 BookOpen,
 CalendarDays,
 Droplets,
 Globe,
 IdCard,
 School,
 ShieldCheck,
 Smartphone,
 Sparkles,
 UserRound,
} from 'lucide-react'
import { FaGraduationCap, FaQrcode } from 'react-icons/fa'
import PersonAvatar from '../ui/PersonAvatar'
import { getCardLogoUrl } from '../../utils/cardLogoHelper'
import { resolveFoundationName } from '../../utils/printHelper'
import { usePengaturanStore } from '../../stores/pengaturanStore'

export default function StudentCardVertical({
 data,
 config = {},
 theme = {},
 pengaturan: propPengaturan = {},
 qrToken = '',
 formatDate,
 isPrint = false,
 frameStyle = 'standard',
 photoShape = 'rounded',
 showPattern = true,
 showWave = true,
 headerMotto,
 footerMotto,
}) {
 const instanceId = useId().replace(/:/g, '')
 const headerGradId = `headerGradV_${instanceId}`
 const footerGradId = `footerGradV_${instanceId}`

 const storePengaturan = usePengaturanStore((state) => state.pengaturan)
 if (!data) return null

 const {
 showPhoto = true,
 showLogo = true,
 showQr = true,
 showNis = true,
 showNisn = true,
 showClass = true,
 showRombel = true,
 showUnit = true,
 } = config

 const pengaturan =
 propPengaturan && Object.keys(propPengaturan).length > 0
 ? propPengaturan
 : (storePengaturan || {})

 const sekolah =
 resolveFoundationName(
 pengaturan?.school_name ||
 pengaturan?.institution_name ||
 pengaturan?.nama_yayasan ||
 pengaturan?.yayasan
 ) ||
 pengaturan?.school_name ||
 'Yayasan Pendidikan Islam'
 const logo = getCardLogoUrl(pengaturan, data)
 const brandTitle = sekolah.replace(/^YAYASAN\s*/i, '').replace(/\s*-\s*/g, '-').trim()
 const activeHeaderMotto = headerMotto || pengaturan?.motto || 'Berilmu, Berakhlak, Beramal'
 const activeFooterMotto = footerMotto || pengaturan?.card_footer_motto || 'Sekolah Unggulan\nBerbasis Al-Qur\'an'

 const primaryColor = theme.primary || '#004D32'
 const darkColor = theme.dark || '#003822'
 const accentColor = theme.accent || '#E5A93C'

 const formattedDateVal = formatDate ? formatDate(data.tanggalLahir) : (data.tanggalLahir || '-')

 const photoShapeClass = photoShape === 'circle' ? 'rounded-full' : photoShape === 'square' ? 'rounded-sm' : photoShape === 'shield' ? 'rounded-b-3xl rounded-t-sm' : 'rounded-xl'

 const frameClass = frameStyle === 'rounded'
 ? 'rounded-xl'
 : frameStyle === 'double'
 ? 'border-4 border-double border-emerald-300'
 : frameStyle === 'glow'
 ? 'shadow-[0_0_25px_rgba(0,77,50,0.3)] rounded-xl'
 : 'rounded-xl'

 const cardClass = `w-[340px] min-w-[340px] max-w-[340px] h-[539px] min-h-[539px] max-h-[539px] ${isPrint ? '' : frameClass} ${isPrint ? '' : 'shadow-2xl'}`

 const footerMottoLines = (activeFooterMotto || 'Sekolah Unggulan\nBerbasis Al-Qur\'an').split('\n')

 const kelasDisplay = typeof data?.kelas === 'object' && data?.kelas !== null
 ? (data.kelas.nama_kelas || data.kelas.name || '-')
 : String(data?.kelas || '-')
 const rombelDisplay = typeof data?.rombel === 'object' && data?.rombel !== null
 ? (data.rombel.name || data.rombel.nama || '-')
 : String(data?.rombel || '-')

 return (
 <article
 id={isPrint ? undefined : 'printable-student-card'}
 className={`${cardClass} relative block overflow-hidden bg-white text-slate-900 font-sans box-border ${isPrint ? 'border-0 rounded-none' : 'border border-emerald-200/80 dark:border-emerald-800/60'}`}
 >
 {/* Background Dot Matrix Pattern (Bottom Area) */}
 {showPattern && (
 <span
 className="absolute bottom-[48px] left-0 right-0 h-[250px] opacity-[0.14] pointer-events-none z-0"
 style={{
 backgroundImage: `radial-gradient(${primaryColor} 1.5px, transparent 1.5px)`,
 backgroundSize: '14px 14px',
 }}
 />
 )}

 {/* Top Header Arc Banner SVG */}
 {showWave && (
 <div className="absolute top-0 left-0 right-0 h-[140px] z-10 text-white flex flex-col justify-between p-3.5">
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

 {/* Header Left Branding */}
 <div className="relative z-10 flex items-center">
 {showLogo && (
 <div
 className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-md mr-2"
 style={{ border: `2px solid ${accentColor}` }}
 >
 {logo ? (
 <img
 src={logo}
 alt="Logo situs"
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
 style={{ display: logo ? 'none' : 'flex', color: primaryColor }}
 >
 <FaGraduationCap className="text-xl" />
 </span>
 </div>
 )}
 <div className="flex flex-col min-w-0 text-white">
 <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-emerald-100/90 leading-none">
 YAYASAN
 </span>
 <h3 className="text-sm font-black uppercase tracking-tight text-white leading-none my-0.5">
 {brandTitle}
 </h3>
 <span className="text-[8px] font-semibold text-emerald-100/90 tracking-wide leading-none">
 Islamic School
 </span>
 </div>
 </div>

 {/* Header Right Tab & Motto */}
 <div className="absolute top-0 right-4 px-3.5 py-1 z-20 flex items-center justify-center">
 <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 110 24">
 <path d="M 0 0 L 110 0 L 110 14 C 110 20, 102 24, 94 24 L 16 24 C 8 24, 0 20, 0 14 Z" fill={primaryColor} />
 </svg>
 <span className="relative z-10 text-white text-[9px] font-black uppercase tracking-widest">
 KARTU PELAJAR
 </span>
 </div>
 <div className="absolute top-[28px] right-4 text-right z-20">
 <p className="text-[8.5px] font-bold italic text-emerald-100/90">
 {activeHeaderMotto}
 </p>
 <div className="flex justify-end mt-0.5">
 <Sparkles className="h-3 w-3" style={{ color: accentColor }} />
 </div>
 </div>
 </div>
 )}

 {/* Student Photo Box (Overlapping top header arc) */}
 {showPhoto && (
 <div className="absolute top-[66px] left-1/2 -translate-x-1/2 w-[126px] h-[140px] z-20 bg-white p-1 rounded-xl border-2 border-emerald-200/80 shadow-md flex items-center justify-center">
 <div
 className={`w-full h-full overflow-hidden ${photoShapeClass} bg-emerald-50 flex items-center justify-center`}
 style={{ backgroundColor: data.foto ? undefined : primaryColor }}
 >
 <PersonAvatar
 src={data.foto}
 name={data.nama}
 size="profile"
 className={`h-full! w-full! border-0 shadow-none ${photoShapeClass}`}
 />
 </div>
 </div>
 )}

 {/* Student Name & Unit Pill Badge */}
 <div className={`absolute left-3 right-3 z-10 flex flex-col items-center text-center ${showPhoto ? 'top-[206px]' : 'top-[155px]'}`}>
 <Sparkles className="h-3 w-3 mb-0.5 shrink-0" style={{ color: accentColor }} />
 <h2
 className={`font-black uppercase tracking-tight line-clamp-2 break-words my-0.5 w-full ${
 (data.nama || '').trim().length > 32
 ? 'text-xs leading-[1.2]'
 : (data.nama || '').trim().length > 24
 ? 'text-[13.5px] leading-[1.15]'
 : (data.nama || '').trim().length > 18
 ? 'text-sm leading-[1.15]'
 : 'text-[16.5px] leading-tight'
 }`}
 style={{ color: primaryColor }}
 title={data.nama}
 >
 {data.nama}
 </h2>
 {showUnit && (
 <div className="relative w-fit max-w-[96%] min-h-[22px] px-3.5 py-0.5 flex items-center justify-center">
 <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 160 22">
 <rect x="0.75" y="0.75" width="158.5" height="20.5" rx="10.25" fill={primaryColor} stroke={accentColor} strokeWidth="1.5" />
 </svg>
 <span
 className={`relative z-10 text-white font-black uppercase tracking-wider text-center max-w-[150px] line-clamp-1 break-words ${
 (data.unit || sekolah || '').length > 24
 ? 'text-[6.8px] leading-tight'
 : 'text-[7.5px]'
 }`}
 title={data.unit || sekolah}
 >
 {data.unit || sekolah}
 </span>
 </div>
 )}
 </div>

 {/* Student Metadata Table (Perfect Grid Alignment) */}
 <div className={`absolute left-5 right-5 z-10 space-y-1 text-slate-800 ${showPhoto ? 'top-[274px]' : 'top-[218px]'}`}>
 {showNis && (
 <div className="grid grid-cols-[18px_72px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <IdCard className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px] text-left">NIS</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span className="font-black text-slate-900 text-[10px] tracking-wide truncate text-left">{data.nis}</span>
 </div>
 )}

 {showNisn && (
 <div className="grid grid-cols-[18px_72px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px] text-left">NISN</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span className="font-black text-slate-900 text-[10px] tracking-wide truncate text-left">{data.nisn}</span>
 </div>
 )}

 {showClass && (
 <div className="grid grid-cols-[18px_72px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <UserRound className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px] text-left">Kelas</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span
 className={`font-black text-slate-900 text-left line-clamp-1 break-words ${
 (kelasDisplay.length + (showRombel && rombelDisplay && rombelDisplay !== '-' ? rombelDisplay.length : 0)) > 26
 ? 'text-[8.5px] leading-tight'
 : 'text-[9.5px]'
 }`}
 title={`${kelasDisplay}${showRombel && rombelDisplay && rombelDisplay !== '-' ? ` / ${rombelDisplay}` : ''}`}
 >
 {kelasDisplay}
 {showRombel && rombelDisplay && rombelDisplay !== '-' ? ` / ${rombelDisplay}` : ''}
 </span>
 </div>
 )}

 <div className="grid grid-cols-[18px_72px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <CalendarDays className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px] text-left">Tanggal Lahir</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span className="font-black text-slate-900 text-[9.5px] truncate text-left">{formattedDateVal}</span>
 </div>

 <div className="grid grid-cols-[18px_72px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <Droplets className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px] text-left">Gol. Darah</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span className="font-black text-slate-900 text-[9.5px] truncate text-left">{data.golonganDarah || '-'}</span>
 </div>
 </div>

 {/* Clean QR Code Container Box */}
 {showQr && (
 <div className="absolute top-[376px] left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
 <div className="w-[88px] h-[88px] bg-white rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-md p-1.5 flex items-center justify-center">
 {qrToken ? (
 <QRCodeSVG value={qrToken} size={74} level="M" marginSize={1} bgColor="#ffffff" fgColor="#0f172a" />
 ) : (
 <FaQrcode style={{ width: 66, height: 66 }} className="text-slate-300" />
 )}
 </div>
 </div>
 )}

 {/* Bottom Footer Banner SVG */}
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
 {/* Left: Custom School Slogan / Motto */}
 <div className="flex items-center gap-2 pr-2.5 min-w-0">
 <BookOpen className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
 <div className="min-w-0">
 {footerMottoLines.map((line, idx) => (
 <p key={idx} className={`${idx === 0 ? 'text-[8px] font-extrabold text-white' : 'text-[7.5px] font-medium text-emerald-100'} leading-tight`}>
 {line}
 </p>
 ))}
 </div>
 </div>

 {/* Right: Website URL */}
 <div className="flex items-center justify-end gap-1.5 pl-2.5 text-right min-w-0">
 <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />
 <span className="text-[8.5px] font-bold text-emerald-50 whitespace-nowrap">{pengaturan?.website || 'www.sekolah.sch.id'}</span>
 </div>
 </div>
 </footer>
 </article>
 )
}
