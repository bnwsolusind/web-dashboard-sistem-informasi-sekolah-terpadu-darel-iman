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
 Sparkles,
 UserRound,
} from 'lucide-react'
import { FaGraduationCap, FaQrcode } from 'react-icons/fa'
import PersonAvatar from '../ui/PersonAvatar'
import { getCardLogoUrl } from '../../utils/cardLogoHelper'
import { resolveFoundationName } from '../../utils/printHelper'
import { usePengaturanStore } from '../../stores/pengaturanStore'

export default function StudentCardHorizontal({
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
 const headerGradId = `headerGradH_${instanceId}`
 const footerGradId = `footerGradH_${instanceId}`

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

 const cardClass = `w-[560px] min-w-[560px] max-w-[560px] h-[353px] min-h-[353px] max-h-[353px] ${isPrint ? '' : frameClass} ${isPrint ? '' : 'shadow-2xl'}`

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
 {/* Background Subtle Pattern */}
 {showPattern && (
 <span
 className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
 style={{
 backgroundImage: `radial-gradient(${primaryColor} 1.2px, transparent 1.2px)`,
 backgroundSize: '12px 12px',
 }}
 />
 )}

 {/* Top Left Header Curved SVG Banner (Renders in print even if Background graphics is off) */}
 {showWave && (
 <div className="absolute top-0 left-0 w-[69%] h-[80px] z-10 flex items-center px-4">
 <svg
 viewBox="0 0 386 80"
 className="absolute inset-0 w-full h-full z-0 pointer-events-none"
 preserveAspectRatio="none"
 >
 <path
 d="M 0 0 L 386 0 C 386 48, 386 80, 320 80 L 0 80 Z"
 fill={primaryColor}
 style={{ fill: primaryColor }}
 />
 <path
 d="M 0 78.5 L 320 78.5 C 384 78.5, 384 48, 384 0"
 fill="none"
 stroke={accentColor}
 strokeWidth="3.5"
 />
 </svg>

 <div className="relative z-10 flex items-center">
 {showLogo && (
 <div
 className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-md mr-2.5"
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
 <FaGraduationCap className="text-2xl" />
 </span>
 </div>
 )}
 <div className="flex flex-col min-w-0 text-white">
 <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-emerald-100/90 leading-tight">
 YAYASAN
 </span>
 <h3 className="text-base font-black uppercase tracking-tight text-white leading-none my-0.5">
 {brandTitle}
 </h3>
 <span className="text-[8px] font-semibold text-emerald-100/90 tracking-wide leading-tight">
 Islamic School
 </span>
 </div>
 </div>
 </div>
 )}

 {/* Top Right Header Badge & Motto */}
 <div className="absolute top-0 right-0 left-[69%] h-[80px] z-10">
 <div className="absolute top-0 right-5 px-4.5 py-1.5 z-10 flex items-center justify-center">
 <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 130 30">
 <path d="M 0 0 L 130 0 L 130 18 C 130 26, 122 30, 114 30 L 16 30 C 8 30, 0 26, 0 18 Z" fill={primaryColor} />
 </svg>
 <span className="relative z-10 text-white text-[10px] font-black uppercase tracking-widest">
 KARTU PELAJAR
 </span>
 </div>
 <div className="absolute top-[34px] right-5 text-right z-10">
 <p className="text-[8.5px] font-bold italic" style={{ color: primaryColor }}>
 {activeHeaderMotto}
 </p>
 <div className="flex justify-end mt-0.5">
 <Sparkles className="h-3 w-3" style={{ color: accentColor }} />
 </div>
 </div>
 </div>

 {/* Main Card Body (Below Top Header) */}
 <div className="relative z-10 w-full h-full pt-[84px] pb-[52px] px-4 flex items-start">
 {/* Left Side: Photo Frame & Education Unit Badge */}
 {showPhoto && (
 <div className="flex flex-col items-center shrink-0 w-[140px] mr-3">
 <div
 className={`w-[126px] h-[144px] bg-white p-1 rounded-xl border-2 border-emerald-200/80 shadow-md overflow-hidden flex items-center justify-center`}
 >
 <div
 className={`w-full h-full overflow-hidden ${photoShapeClass} bg-emerald-50 flex items-center justify-center`}
 style={{ backgroundColor: data.foto ? undefined : primaryColor }}
 >
 <PersonAvatar
 src={data.foto}
 name={data.nama}
 size="card"
 className={`h-full! w-full! border-0 shadow-none ${photoShapeClass}`}
 />
 </div>
 </div>
 {showUnit && (
 <div className="relative mt-1.5 w-[140px] min-h-[20px] py-0.5 flex items-center justify-center px-1.5">
 <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 140 20">
 <rect x="0.75" y="0.75" width="138.5" height="18.5" rx="9.25" fill={primaryColor} stroke={accentColor} strokeWidth="1.5" style={{ fill: primaryColor }} />
 </svg>
 <span
 className={`relative z-10 text-white font-black uppercase tracking-tight text-center max-w-[134px] line-clamp-1 break-words ${
 (data.unit || sekolah || '').length > 25
 ? 'text-[5.5px] leading-tight'
 : (data.unit || sekolah || '').length > 18
 ? 'text-[6.2px] leading-tight'
 : 'text-[7px]'
 }`}
 title={data.unit || sekolah}
 >
 {data.unit || sekolah}
 </span>
 </div>
 )}
 </div>
 )}

 {/* Center: Student Name & Metadata Table */}
 <div className="flex-1 min-w-0 pr-3 pt-0.5">
 <h2
 className={`font-black uppercase tracking-tight line-clamp-2 break-words ${
 (data.nama || '').trim().length > 32
 ? 'text-[11.5px] leading-[1.2]'
 : (data.nama || '').trim().length > 24
 ? 'text-sm leading-[1.15]'
 : (data.nama || '').trim().length > 18
 ? 'text-[14.5px] leading-[1.15]'
 : 'text-lg leading-tight'
 }`}
 style={{ color: primaryColor }}
 title={data.nama}
 >
 {data.nama}
 </h2>

 {/* Golden Ornament Line */}
 <div className="flex items-center gap-2 my-1.5 w-[90%]">
 <span className="h-[1.5px] flex-1 bg-white dark:bg-[#1B2433]" />
 <Sparkles className="h-3 w-3 shrink-0" style={{ color: accentColor }} />
 <span className="h-[1.5px] flex-1 bg-white dark:bg-[#1B2433]" />
 </div>

 {/* Details Table with Perfect Grid Alignment */}
 <div className="space-y-1.5 text-slate-800">
 {showNis && (
 <div className="grid grid-cols-[18px_70px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <IdCard className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px]">NIS</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span className="font-black text-slate-900 text-[10px] tracking-wide truncate">{data.nis}</span>
 </div>
 )}

 {showNisn && (
 <div className="grid grid-cols-[18px_70px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px]">NISN</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span className="font-black text-slate-900 text-[10px] tracking-wide truncate">{data.nisn}</span>
 </div>
 )}

 {showClass && (
 <div className="grid grid-cols-[18px_70px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <UserRound className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px]">Kelas</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span
 className={`font-black text-slate-900 line-clamp-1 break-words ${
 (kelasDisplay.length + (showRombel && rombelDisplay && rombelDisplay !== '-' ? rombelDisplay.length : 0)) > 26
 ? 'text-[8.5px] leading-tight'
 : (kelasDisplay.length + (showRombel && rombelDisplay && rombelDisplay !== '-' ? rombelDisplay.length : 0)) > 19
 ? 'text-[9px] leading-tight'
 : 'text-[9.5px]'
 }`}
 title={`${kelasDisplay}${showRombel && rombelDisplay && rombelDisplay !== '-' ? ` / ${rombelDisplay}` : ''}`}
 >
 {kelasDisplay}
 {showRombel && rombelDisplay && rombelDisplay !== '-' ? ` / ${rombelDisplay}` : ''}
 </span>
 </div>
 )}

 <div className="grid grid-cols-[18px_70px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <CalendarDays className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px]">Tanggal Lahir</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span className="font-black text-slate-900 text-[9.5px] truncate">{formattedDateVal}</span>
 </div>

 <div className="grid grid-cols-[18px_70px_6px_1fr] items-center text-[9px]">
 <span className="w-4 h-4 rounded bg-emerald-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
 <Droplets className="h-2.5 w-2.5" strokeWidth={2.2} />
 </span>
 <span className="font-extrabold text-slate-700 text-[9px]">Gol. Darah</span>
 <span className="font-bold text-slate-400 text-center">:</span>
 <span className="font-black text-slate-900 text-[9.5px] truncate">{data.golonganDarah || '-'}</span>
 </div>
 </div>
 </div>

 {/* Right Side: Clean QR Code Box */}
 {showQr && (
 <div className="flex flex-col items-center shrink-0 w-[128px] pt-1">
 <div className="w-[128px] h-[128px] bg-white rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-md p-2 flex items-center justify-center">
 {qrToken ? (
 <QRCodeSVG value={qrToken} size={106} level="M" marginSize={1} bgColor="#ffffff" fgColor="#0f172a" />
 ) : (
 <FaQrcode style={{ width: 94, height: 94 }} className="text-slate-300" />
 )}
 </div>
 </div>
 )}
 </div>

 {/* Bottom Footer SVG Banner (Renders in print even if Background graphics is off) */}
 <footer className="absolute bottom-0 left-0 right-0 h-[48px] flex items-center px-4 text-white z-20">
 <svg
 viewBox="0 0 560 48"
 className="absolute inset-0 w-full h-full z-0 pointer-events-none"
 preserveAspectRatio="none"
 >
 <rect x="0" y="0" width="560" height="48" fill={primaryColor} style={{ fill: primaryColor }} />
 <line x1="0" y1="1.5" x2="560" y2="1.5" stroke={accentColor} strokeWidth="3" />
 </svg>

 <div className="relative z-10 grid grid-cols-[1fr_auto] w-full items-center gap-4 text-xs">
 {/* Left: Custom School Slogan / Motto */}
 <div className="flex items-center gap-2.5 min-w-0 pr-3 border-r border-emerald-200/20">
 <BookOpen className="h-4.5 w-4.5 shrink-0" style={{ color: accentColor }} />
 <div className="min-w-0">
 {footerMottoLines.map((line, idx) => (
 <p key={idx} className={`${idx === 0 ? 'text-[8.5px] font-extrabold text-white' : 'text-[7.8px] font-medium text-emerald-100'} leading-tight`}>
 {line}
 </p>
 ))}
 </div>
 </div>

 {/* Right: Website URL */}
 <div className="flex items-center justify-end gap-1.5 text-right shrink-0">
 <Globe className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
 <span className="text-[9px] font-bold text-emerald-50 whitespace-nowrap">{pengaturan?.website || 'www.sekolah.sch.id'}</span>
 </div>
 </div>
 </footer>
 </article>
 )
}
