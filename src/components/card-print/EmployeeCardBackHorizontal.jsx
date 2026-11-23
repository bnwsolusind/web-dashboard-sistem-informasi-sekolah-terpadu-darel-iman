import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getCardLogoUrl } from '../../utils/cardLogoHelper'
import { resolveFoundationName } from '../../utils/printHelper'
import { usePengaturanStore } from '../../stores/pengaturanStore'

export default function EmployeeCardBackHorizontal({
 employee,
 template = 'green',
 pengaturan: propPengaturan = {},
 qrPayload,
 isPrint = false,
 frameStyle = 'standard',
 showPattern = true,
 showWave = true,
 backTitle = 'KETENTUAN KARTU PEGAWAI',
 backRules,
 backAddress,
 backShowQr = true,
}) {
 const storePengaturan = usePengaturanStore((state) => state.pengaturan)
 if (!employee) return null

 const pengaturan =
 propPengaturan && Object.keys(propPengaturan).length > 0
 ? propPengaturan
 : (storePengaturan || {})

 const schoolName =
 pengaturan?.foundation_name ||
 pengaturan?.nama_yayasan ||
 resolveFoundationName(
 pengaturan?.school_name ||
 pengaturan?.institution_name ||
 pengaturan?.nama_yayasan ||
 pengaturan?.yayasan
 ) ||
 pengaturan?.school_name ||
 pengaturan?.institution_name ||
 'Yayasan'

 const appName = pengaturan?.application_name || pengaturan?.app_name || 'Dareliman Edu'
 const logoUrl = getCardLogoUrl(pengaturan, employee)

 const defaultBackRules = `1. Kartu ini adalah milik resmi ${schoolName}.\n2. Wajib dibawa & dikenakan selama jam kerja.\n3. Apabila menemukan kartu ini, harap mengembalikan ke kantor yayasan.\n4. QR Code digunakan untuk absensi & verifikasi Dareliman Edu.`
 const resolvedRulesText = backRules
 ? backRules.replace(/Yayasan\s+Dar\s*el-?Iman/gi, schoolName)
 : defaultBackRules
 const rulesList = (resolvedRulesText || '').split('\n').filter((r) => r.trim().length > 0)

 const defaultBackAddress = [
 pengaturan?.address,
 pengaturan?.phone ? `Telp: ${pengaturan.phone}` : null,
 pengaturan?.website ? `Website: ${pengaturan.website}` : null,
 ].filter(Boolean).join('\n') || (pengaturan?.address || '')
 const resolvedAddressText = backAddress || defaultBackAddress

 return (
 <article
 className={`employee-id-card employee-id-card--horizontal employee-id-card--${template} employee-id-card--frame-${frameStyle} ${
 isPrint ? 'employee-card-print-canvas--horizontal' : ''
 }`}
 >
 {showPattern && <div className="employee-id-card__pattern" aria-hidden="true" />}
 {showWave && <div className="employee-id-card__top-wave" aria-hidden="true" />}

 {/* Brand Header */}
 <header className="employee-id-card__brand">
 <span className="employee-id-card__logo">
 {logoUrl ? (
 <img
 src={logoUrl}
 alt={`Logo ${schoolName}`}
 onError={(e) => {
 e.currentTarget.style.display = 'none'
 if (e.currentTarget.nextElementSibling) {
 e.currentTarget.nextElementSibling.style.display = 'inline-block'
 }
 }}
 />
 ) : null}
 <b style={{ display: logoUrl ? 'none' : 'inline-block' }}>{pengaturan?.logo_text || 'YDE'}</b>
 </span>
 <strong>{schoolName}</strong>
 <small>{appName}</small>
 <em>{backTitle || 'KETENTUAN KARTU PEGAWAI'}</em>
 </header>

 <span className="employee-id-card__label">SISI BELAKANG</span>

 {/* Main Content Area */}
 <div className="absolute top-[90px] left-[24px] right-[24px] bottom-[56px] flex gap-4 items-start text-slate-800 dark:text-slate-100 z-10">
 {/* Rules List */}
 <div className="flex-1 space-y-1 text-xs leading-snug font-medium">
 <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 border-b border-emerald-200/80 dark:border-emerald-700/80 pb-1 mb-1.5">
 Tata Tertib & Ketentuan Penggunaan
 </h4>
 <ol className="space-y-1 list-decimal list-inside text-[10.5px]">
 {rulesList.map((rule, idx) => (
 <li key={idx} className="text-slate-700 dark:text-slate-200">
 {rule.replace(/^\d+\.\s*/, '')}
 </li>
 ))}
 </ol>
 </div>

 {/* QR Verification Box (Optional) */}
 {backShowQr && (
 <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/90 shadow-2xs border border-emerald-200/80 dark:border-emerald-700/80 dark:bg-slate-800/90 text-center flex-shrink-0 w-[110px]">
 <QRCodeSVG
 value={qrPayload || employee.niy || employee.email || 'DARELIMAN-EDU'}
 size={76}
 level="M"
 marginSize={2}
 bgColor="#ffffff"
 fgColor="#0f172a"
 />
 <span className="mt-1 text-[8.5px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
 Verifikasi Dareliman Edu
 </span>
 </div>
 )}
 </div>

 {/* Footer */}
 <footer>
 <b className="text-[10px] font-normal leading-tight">
 {(resolvedAddressText || pengaturan?.address || '-').split('\n').map((line, idx) => (
 <span key={idx}>
 {idx > 0 && <br />}
 {line}
 </span>
 ))}
 </b>
 <span>
 TAHUN AJARAN
 <br />
 {employee?.academic_year || employee?.tahun_ajaran || pengaturan?.tahun_ajaran_aktif || '2026/2027'}
 </span>
 </footer>
 </article>
 )
}
