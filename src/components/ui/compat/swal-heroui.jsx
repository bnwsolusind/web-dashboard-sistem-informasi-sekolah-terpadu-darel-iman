import React from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { createRoot } from 'react-dom/client'
import { Modal as HeroModal } from '@heroui/react'
import { globalToast as toast } from '../../app/ToastProvider'
import { Button } from '../button'

/**
 * HeroUI Canonical SweetAlert2 Compatibility Bridge
 * Provides full SweetAlert2 interface compatibility using standard HeroUI components.
 */

let validationMessageSetter = null
let loadingStateSetter = null
let activeLoadingState = false
let activeRoot = null

export const Swal = {
 DismissReason: {
 cancel: 'cancel',
 backdrop: 'backdrop',
 close: 'close',
 esc: 'esc',
 timer: 'timer',
 },

 isVisible: () => {
 return Boolean(document.getElementById('heroui-swal-container'))
 },

 isLoading: () => {
 return activeLoadingState
 },

 showLoading: () => {
 activeLoadingState = true
 if (loadingStateSetter) {
 loadingStateSetter(true)
 }
 },

 hideLoading: () => {
 activeLoadingState = false
 if (loadingStateSetter) {
 loadingStateSetter(false)
 }
 },

 showValidationMessage: (msg) => {
 if (validationMessageSetter) {
 validationMessageSetter(msg)
 }
 },

 resetValidationMessage: () => {
 if (validationMessageSetter) {
 validationMessageSetter('')
 }
 },

 getConfirmButton: () => {
 return document.querySelector('#heroui-swal-container button[data-action="confirm"]')
 },

 getCancelButton: () => {
 return document.querySelector('#heroui-swal-container button[data-action="cancel"]')
 },

 close: () => {
 if (activeRoot) {
 try {
 activeRoot.unmount()
 } catch {
 // Ignore
 }
 activeRoot = null
 }
 const container = document.getElementById('heroui-swal-container')
 if (container) {
 container.remove()
 }
 validationMessageSetter = null
 loadingStateSetter = null
 activeLoadingState = false
 },

 fire: (...args) => {
 let options = {}

 if (args.length === 1 && typeof args[0] === 'object') {
 options = args[0] || {}
 } else if (args.length >= 1) {
 options = {
 title: args[0] || '',
 text: args[1] || '',
 icon: args[2] || 'info',
 }
 }

 const {
 title = '',
 text = '',
 html = null,
 icon = 'info',
 toast: isToast = false,
 showCancelButton = false,
 confirmButtonText = showCancelButton ? 'Ya, Lanjutkan' : 'OK',
 cancelButtonText = 'Batal',
 isDestructive = false,
 input = null,
 inputPlaceholder = '',
 inputOptions = {},
 inputValue: initialInputValue = '',
 preConfirm = null,
 didOpen = null,
 allowOutsideClick = true,
 } = options

 if (isToast) {
 const displayTitle = title ? String(title) : ''
 const displayText = text ? String(text) : (html ? String(html).replace(/<[^>]*>?/gm, '') : '')

 if (icon === 'success') {
 toast.success(displayTitle || 'Berhasil', { description: displayText || undefined })
 } else if (icon === 'error') {
 toast.error(displayTitle || 'Terjadi Kesalahan', { description: displayText || undefined })
 } else if (icon === 'warning') {
 toast.warning(displayTitle || 'Peringatan', { description: displayText || undefined })
 } else {
 toast.info(displayTitle || 'Informasi', { description: displayText || undefined })
 }

 return Promise.resolve({
 isConfirmed: true,
 isDenied: false,
 isDismissed: false,
 value: true,
 })
 }

 return new Promise((resolve) => {
 let hostEl = document.getElementById('heroui-swal-container')
 if (!hostEl) {
 hostEl = document.createElement('div')
 hostEl.id = 'heroui-swal-container'
 document.body.appendChild(hostEl)
 }

 const root = createRoot(hostEl)
 activeRoot = root

 const cleanup = () => {
 try {
 root.unmount()
 } catch {
 // Ignore
 }
 if (hostEl && hostEl.parentNode) {
 hostEl.parentNode.removeChild(hostEl)
 }
 activeRoot = null
 validationMessageSetter = null
 loadingStateSetter = null
 activeLoadingState = false
 }

 function DialogWrapper() {
 const [inputValue, setInputValue] = React.useState(() => {
 if (initialInputValue !== undefined && initialInputValue !== '') {
 return String(initialInputValue)
 }
 if (input === 'select' && inputOptions && Object.keys(inputOptions).length > 0) {
 return Object.keys(inputOptions)[0]
 }
 return ''
 })
 const [validationMsg, setValidationMsg] = React.useState('')
 const [isSubmitting, setIsSubmitting] = React.useState(activeLoadingState)

 React.useEffect(() => {
 validationMessageSetter = setValidationMsg
 loadingStateSetter = setIsSubmitting
 if (typeof didOpen === 'function') {
 try {
 didOpen(hostEl)
 } catch (err) {
 console.warn('[Swal.didOpen error]', err)
 }
 }
 return () => {
 validationMessageSetter = null
 loadingStateSetter = null
 }
 }, [])

 const handleConfirm = async () => {
 setIsSubmitting(true)
 setValidationMsg('')

 try {
 let resultVal = input
 ? (inputValue || (input === 'select' && inputOptions ? Object.keys(inputOptions)[0] : ''))
 : true
 if (preConfirm) {
 const res = await preConfirm(resultVal)
 if (res === false) {
 setIsSubmitting(false)
 return
 }
 if (res !== undefined) {
 resultVal = res
 }
 }

 cleanup()
 resolve({
 isConfirmed: true,
 isDenied: false,
 isDismissed: false,
 value: resultVal,
 })
 } catch (err) {
 setValidationMsg(err?.message || 'Validasi gagal.')
 setIsSubmitting(false)
 }
 }

 const handleCancel = () => {
 cleanup()
 resolve({
 isConfirmed: false,
 isDenied: false,
 isDismissed: true,
 dismiss: Swal.DismissReason.cancel,
 })
 }

 const handleBackdropClose = () => {
 if (!allowOutsideClick) return
 cleanup()
 resolve({
 isConfirmed: false,
 isDenied: false,
 isDismissed: true,
 dismiss: Swal.DismissReason.backdrop,
 })
 }

 const isDanger = isDestructive || (confirmButtonText && /hapus|delete|keluar|reset/i.test(confirmButtonText))

 return (
 <HeroModal
 isOpen={true}
 onOpenChange={(open) => {
 if (!open) handleBackdropClose()
 }}
 >
 <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-[100] flex items-center justify-center p-4">
 <HeroModal.Container className="w-full flex items-center justify-center min-h-full">
 <HeroModal.Dialog className="relative w-full max-w-md overflow-hidden rounded-3xl pt-8 border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-6 sm:p-7 shadow-2xl shadow-emerald-950/20 text-slate-800 dark:bg-[#182232] dark:text-slate-100 space-y-4">
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0 absolute top-0 left-0 right-0" />
 
 <div>
 <h3 className="text-lg font-black text-slate-900 dark:text-white">
 {title || (showCancelButton ? 'Konfirmasi Tindakan' : 'Informasi')}
 </h3>
 {(text || html) && (
 <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
 {text || (html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null)}
 </div>
 )}
 </div>

 {input === 'select' && (
 <div className="space-y-2">
 <CustomSelect
 autoFocus
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
 >
 {Object.entries(inputOptions || {}).map(([val, label]) => (
 <option key={val} value={val}>
 {label}
 </option>
 ))}
 </CustomSelect>
 </div>
 )}

 {input === 'password' && (
 <div className="space-y-2">
 <input
 type="password"
 autoFocus
 value={inputValue}
 placeholder={inputPlaceholder}
 onChange={(e) => setInputValue(e.target.value)}
 className="w-full px-3 py-2 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
 />
 </div>
 )}

 {input === 'text' && (
 <div className="space-y-2">
 <input
 type="text"
 autoFocus
 value={inputValue}
 placeholder={inputPlaceholder}
 onChange={(e) => setInputValue(e.target.value)}
 className="w-full px-3 py-2 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
 />
 </div>
 )}

 {validationMsg && (
 <p className="text-xs font-semibold text-rose-500">{validationMsg}</p>
 )}

 <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-800/60">
 {showCancelButton && (
 <Button
 variant="ghost"
 size="sm"
 data-action="cancel"
 disabled={isSubmitting}
 onClick={handleCancel}
 >
 {cancelButtonText}
 </Button>
 )}
 <Button
 variant={isDanger ? 'danger' : 'primary'}
 size="sm"
 data-action="confirm"
 disabled={isSubmitting}
 onClick={handleConfirm}
 >
 {confirmButtonText}
 </Button>
 </div>
 </HeroModal.Dialog>
 </HeroModal.Container>
 </HeroModal.Backdrop>
 </HeroModal>
 )
 }

 root.render(<DialogWrapper />)
 })
 },
}

export default Swal
