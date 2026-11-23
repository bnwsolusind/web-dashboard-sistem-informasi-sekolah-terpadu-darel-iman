import React, { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getCardLogoUrl } from '../../utils/cardLogoHelper'
import { resolveAvatarUrl } from '../ui/PersonAvatar'
import { resolveFoundationName } from '../../utils/printHelper'
import { usePengaturanStore } from '../../stores/pengaturanStore'

export default function EmployeeCardVertical({
 employee,
 template = 'green',
 pengaturan: propPengaturan = {},
 formatDate,
 qrPayload,
 isPrint = false,
 isEditing = false,
 layoutConfig = {},
 frameStyle = 'standard',
 photoShape = 'rounded',
 showPattern = true,
 showWave = true,
 headerMotto,
 footerMotto,
 onElementMove,
}) {
 const [activeDragKey, setActiveDragKey] = useState(null)
 const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 })

 const storePengaturan = usePengaturanStore((state) => state.pengaturan)
 if (!employee) return null

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
 'Yayasan Pendidikan Islam'
 const appName = pengaturan?.application_name || 'ISLAMIC SCHOOL'
 const logoUrl = getCardLogoUrl(pengaturan, employee)
 const activeHeaderMotto = headerMotto || pengaturan?.motto || 'Berilmu, Berakhlak, Beramal'
 const activeFooterMotto = footerMotto || pengaturan?.card_footer_motto || 'Generasi Beriman, Berilmu,\nBerakhlak Mulia'
 const namaLengkap = `${employee.gelar_depan ? `${employee.gelar_depan} ` : ''}${employee.nama_lengkap || ''}${employee.gelar_belakang ? `, ${employee.gelar_belakang}` : ''}`
 const initials = (employee.nama_lengkap || 'PE').substring(0, 2).toUpperCase()
 const formattedBirthDate = formatDate ? formatDate(employee.tanggal_lahir) : (employee.tanggal_lahir || '—')

 const handleStartDrag = (key, clientX, clientY) => {
 if (!isEditing) return
 const pos = layoutConfig[key] || { x: 0, y: 0 }
 dragStartRef.current = {
 x: clientX,
 y: clientY,
 initialX: pos.x || 0,
 initialY: pos.y || 0,
 }
 setActiveDragKey(key)

 const handleMove = (moveX, moveY) => {
 const dx = moveX - dragStartRef.current.x
 const dy = moveY - dragStartRef.current.y
 if (onElementMove) {
 onElementMove(key, {
 x: Math.round(dragStartRef.current.initialX + dx),
 y: Math.round(dragStartRef.current.initialY + dy),
 })
 }
 }

 const onMouseMove = (e) => handleMove(e.clientX, e.clientY)
 const onTouchMove = (e) => {
 if (e.touches && e.touches[0]) {
 handleMove(e.touches[0].clientX, e.touches[0].clientY)
 }
 }

 const onEnd = () => {
 setActiveDragKey(null)
 window.removeEventListener('mousemove', onMouseMove)
 window.removeEventListener('mouseup', onEnd)
 window.removeEventListener('touchmove', onTouchMove)
 window.removeEventListener('touchend', onEnd)
 }

 window.addEventListener('mousemove', onMouseMove)
 window.addEventListener('mouseup', onEnd)
 window.addEventListener('touchmove', onTouchMove)
 window.addEventListener('touchend', onEnd)
 }

 const getStyle = (key) => {
 const pos = layoutConfig[key]
 if (!pos || (pos.x === 0 && pos.y === 0)) return {}
 return {
 transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
 }
 }

 return (
 <article
 id={isPrint ? undefined : 'printable-employee-card'}
 className={`employee-id-card employee-id-card--vertical employee-id-card--${template} employee-id-card--frame-${frameStyle} ${isEditing ? 'is-drag-mode' : ''
 } ${isPrint ? 'employee-card-print-canvas--vertical' : ''}`}
 >
 {showPattern && <div className="employee-id-card__pattern" aria-hidden="true" />}
 {showWave && <div className="employee-id-card__top-wave" aria-hidden="true" />}

 <header
 className={`employee-id-card__brand ${isEditing ? 'employee-id-draggable' : ''} ${activeDragKey === 'brand' ? 'is-dragging' : ''}`}
 style={getStyle('brand')}
 onMouseDown={(e) => {
 if (isEditing) {
 e.preventDefault()
 handleStartDrag('brand', e.clientX, e.clientY)
 }
 }}
 onTouchStart={(e) => {
 if (isEditing && e.touches[0]) {
 handleStartDrag('brand', e.touches[0].clientX, e.touches[0].clientY)
 }
 }}
 >
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
 <b style={{ display: logoUrl ? 'none' : 'inline-block' }}>{pengaturan.logo_text || 'YDE'}</b>
 </span>
 <strong>{schoolName}</strong>
 <small>{appName}</small>
 <em>{activeHeaderMotto}</em>
 </header>

 <div
 className={`employee-id-card__photo employee-id-card__photo--${photoShape} ${isEditing ? 'employee-id-draggable' : ''} ${activeDragKey === 'photo' ? 'is-dragging' : ''
 }`}
 style={getStyle('photo')}
 onMouseDown={(e) => {
 if (isEditing) {
 e.preventDefault()
 handleStartDrag('photo', e.clientX, e.clientY)
 }
 }}
 onTouchStart={(e) => {
 if (isEditing && e.touches[0]) {
 handleStartDrag('photo', e.touches[0].clientX, e.touches[0].clientY)
 }
 }}
 >
 <span className="employee-id-card__photo-initials">{initials}</span>
 {(() => {
 const resolved = resolveAvatarUrl(employee)
 if (!resolved) return null
 return (
 <img
 src={resolved}
 alt={namaLengkap}
 onError={(e) => {
 e.currentTarget.style.display = 'none'
 }}
 />
 )
 })()}
 </div>

 <div
 className={`employee-id-card__identity ${isEditing ? 'employee-id-draggable' : ''} ${activeDragKey === 'identity' ? 'is-dragging' : ''}`}
 style={getStyle('identity')}
 onMouseDown={(e) => {
 if (isEditing) {
 e.preventDefault()
 handleStartDrag('identity', e.clientX, e.clientY)
 }
 }}
 onTouchStart={(e) => {
 if (isEditing && e.touches[0]) {
 handleStartDrag('identity', e.touches[0].clientX, e.touches[0].clientY)
 }
 }}
 >
 <h3>{namaLengkap}</h3>
 <strong>{employee.jabatan_name || 'Pegawai'}</strong>
 </div>

 <dl
 className={`employee-id-card__meta ${isEditing ? 'employee-id-draggable' : ''} ${activeDragKey === 'meta' ? 'is-dragging' : ''}`}
 style={getStyle('meta')}
 onMouseDown={(e) => {
 if (isEditing) {
 e.preventDefault()
 handleStartDrag('meta', e.clientX, e.clientY)
 }
 }}
 onTouchStart={(e) => {
 if (isEditing && e.touches[0]) {
 handleStartDrag('meta', e.touches[0].clientX, e.touches[0].clientY)
 }
 }}
 >
 <div>
 <dt>NIY</dt>
 <dd>{employee.niy || '—'}</dd>
 </div>
 <div>
 <dt>Unit Kerja</dt>
 <dd>{employee.unit_name || '—'}</dd>
 </div>
 <div>
 <dt>Tanggal Lahir</dt>
 <dd>{formattedBirthDate}</dd>
 </div>
 <div>
 <dt>Status</dt>
 <dd>{employee.status_pegawai || employee.status || '—'}</dd>
 </div>
 </dl>

 <div
 className={`employee-id-card__qr ${isEditing ? 'employee-id-draggable' : ''} ${activeDragKey === 'qr' ? 'is-dragging' : ''}`}
 style={getStyle('qr')}
 onMouseDown={(e) => {
 if (isEditing) {
 e.preventDefault()
 handleStartDrag('qr', e.clientX, e.clientY)
 }
 }}
 onTouchStart={(e) => {
 if (isEditing && e.touches[0]) {
 handleStartDrag('qr', e.touches[0].clientX, e.touches[0].clientY)
 }
 }}
 >
 <QRCodeSVG
 value={qrPayload || employee.niy || employee.email || 'DARELIMAN-EDU'}
 size={91}
 level="M"
 marginSize={4}
 bgColor="#ffffff"
 fgColor="#0f172a"
 title={`QR akses Dareliman Edu ${namaLengkap}`}
 />
 </div>

 <footer
 className={`${isEditing ? 'employee-id-draggable' : ''} ${activeDragKey === 'footer' ? 'is-dragging' : ''}`}
 style={getStyle('footer')}
 onMouseDown={(e) => {
 if (isEditing) {
 e.preventDefault()
 handleStartDrag('footer', e.clientX, e.clientY)
 }
 }}
 onTouchStart={(e) => {
 if (isEditing && e.touches[0]) {
 handleStartDrag('footer', e.touches[0].clientX, e.touches[0].clientY)
 }
 }}
 >
 <b>
 {(activeFooterMotto || 'Generasi Beriman, Berilmu,\nBerakhlak Mulia').split('\n').map((line, idx) => (
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

