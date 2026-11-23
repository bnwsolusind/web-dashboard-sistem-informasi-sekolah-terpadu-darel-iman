import { useState, useRef, useEffect, useCallback } from 'react'
import { FiSmartphone, FiInfo, FiExternalLink, FiLock, FiCheck, FiKey, FiShield, FiAlertTriangle, FiCopy } from 'react-icons/fi'
import { BsShieldCheck } from 'react-icons/bs'
import { userSecurityService } from '../../services/userSecurityService'
import { useToast } from '../app/ToastProvider'
import { Button } from '@/components/ui/button'
import { Alert, AlertContent, AlertDescription, AlertIndicator } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'

export default function TwoFactorAuthCard() {
 const [activeTab, setActiveTab] = useState('Ringkasan')
 const [otp, setOtp] = useState(['', '', '', '', '', ''])
 const [verified, setVerified] = useState(false)
 const [loading, setLoading] = useState(true)
 const [submitting, setSubmitting] = useState(false)
 const [tfaData, setTfaData] = useState({ enabled: false, secret_key: '', recovery_codes: [] })
 const [showDisableModal, setShowDisableModal] = useState(false)
 const [passwordConfirm, setPasswordConfirm] = useState('')
 const inputRefs = useRef([])
 const toast = useToast()

 const loadStatus = useCallback(async () => {
 try {
 setLoading(true)
 const data = await userSecurityService.get2faStatus()
 setTfaData(data)
 } catch (_err) {
 toast?.error?.('Gagal memuat status 2FA.')
 } finally {
 setLoading(false)
 }
 }, [toast])

 useEffect(() => {
 loadStatus()
 }, [loadStatus])

 const handleOtpChange = (index, value) => {
 const val = value.replace(/\D/g, '')
 if (val.length > 1) return
 const newOtp = [...otp]
 newOtp[index] = val
 setOtp(newOtp)

 if (val && index < 5) {
 inputRefs.current[index + 1]?.focus()
 }
 }

 const handleKeyDown = (index, e) => {
 if (e.key === 'Backspace' && !otp[index] && index > 0) {
 inputRefs.current[index - 1]?.focus()
 }
 }

 const handleVerify = async () => {
 const code = otp.join('')
 if (code.length !== 6) {
 toast?.error?.('Harap masukkan 6 digit kode OTP secara lengkap.')
 return
 }

 try {
 setSubmitting(true)
 await userSecurityService.verify2fa(code)
 setVerified(true)
 toast?.success?.('Two Factor Authentication berhasil diverifikasi dan diaktifkan!')
 await loadStatus()
 setTimeout(() => setVerified(false), 3000)
 } catch (err) {
 toast?.error?.(err?.response?.data?.message || 'Kode verifikasi tidak valid.')
 } finally {
 setSubmitting(false)
 }
 }

 const handleDisable2fa = async (e) => {
 e.preventDefault()
 if (!passwordConfirm) {
 toast?.error?.('Harap masukkan kata sandi akun untuk menonaktifkan 2FA.')
 return
 }

 try {
 setSubmitting(true)
 await userSecurityService.disable2fa(passwordConfirm)
 toast?.success?.('Two Factor Authentication telah dinonaktifkan.')
 setShowDisableModal(false)
 setPasswordConfirm('')
 await loadStatus()
 } catch (err) {
 toast?.error?.(err?.response?.data?.message || 'Kata sandi tidak sesuai.')
 } finally {
 setSubmitting(false)
 }
 }

 const copyToClipboard = (text, label) => {
 navigator.clipboard?.writeText(text)
 toast?.success?.(`${label} berhasil disalin ke clipboard!`)
 }

 const tabs = ['Ringkasan', 'Setup Authenticator', 'Recovery Code', 'Panduan']

 return (
 <Card className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 lg:p-8 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-6">
 {/* Tabs */}
 <div
 role="tablist"
 aria-label="Navigasi metode autentikasi dua faktor"
 className="inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-700/80/60 overflow-x-auto no-scrollbar max-w-full shadow-2xs"
 >
 {tabs.map((tab) => {
 const isActive = activeTab === tab
 return (
 <button
 key={tab}
 type="button"
 role="tab"
 aria-selected={isActive}
 onClick={() => setActiveTab(tab)}
 className={`rounded-xl px-4 py-2 text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
 isActive
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-md shadow-xs scale-[1.01]'
 : 'border border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-white/80 dark:hover:bg-slate-700/60 font-bold'
 }`}
 >
 {tab}
 </button>
 )
 })}
 </div>

 {activeTab === 'Recovery Code' ? (
 <div className="space-y-4 bg-slate-50/80 dark:bg-slate-800/40 p-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <FiKey className="text-emerald-600" />
 <span>Kode Pemulihan Cadangan (Recovery Codes)</span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 Gunakan salah satu kode ini jika Anda kehilangan akses ke aplikasi authenticator ponsel Anda.
 </p>
 </div>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => copyToClipboard((tfaData.recovery_codes || []).join('\n'), 'Seluruh kode pemulihan')}
 className="inline-flex items-center gap-1.5"
 >
 <FiCopy className="w-3.5 h-3.5" />
 <span>Salin Semua</span>
 </Button>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
 {(tfaData.recovery_codes || []).map((code, idx) => (
 <div
 key={idx}
 className="p-3 bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 rounded-xl font-mono text-center text-sm font-bold text-slate-700 dark:text-slate-200 shadow-2xs flex items-center justify-between px-4"
 >
 <span>{code}</span>
 <button
 type="button"
 onClick={() => copyToClipboard(code, `Kode ${code}`)}
 className="text-slate-400 hover:text-emerald-600 ml-2"
 >
 <FiCopy className="w-3.5 h-3.5" />
 </button>
 </div>
 ))}
 </div>
 </div>
 ) : activeTab === 'Setup Authenticator' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/80 dark:bg-slate-800/40 p-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80">
 <div className="space-y-3">
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <FiSmartphone className="text-emerald-600" />
 <span>1. Konfigurasi Aplikasi Authenticator</span>
 </h3>
 <p className="text-xs text-slate-600 dark:text-slate-300">
 Gunakan Google Authenticator, Microsoft Authenticator, atau aplikasi TOTP lainnya.
 </p>
 <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 space-y-2">
 <span className="text-xs font-bold text-slate-500">Secret Key Manual:</span>
 <div className="flex items-center justify-between">
 <code className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">
 {tfaData.secret_key || 'DARELIMAN-SEC-7X9B-4Q2M'}
 </code>
 <Button
 type="button"
 variant="ghost"
 size="xs"
 onClick={() => copyToClipboard(tfaData.secret_key || 'DARELIMAN-SEC-7X9B-4Q2M', 'Secret Key')}
 >
 Salin
 </Button>
 </div>
 </div>
 </div>
 <div className="space-y-3">
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
 2. Masukkan 6-Digit Kode Konfirmasi
 </h3>
 <div className="flex justify-between gap-2">
 {otp.map((digit, index) => (
 <input
 key={index}
 ref={(el) => (inputRefs.current[index] = el)}
 type="text"
 maxLength={1}
 value={digit}
 onChange={(e) => handleOtpChange(index, e.target.value)}
 onKeyDown={(e) => handleKeyDown(index, e)}
 className="w-10 h-12 text-center text-lg font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600"
 />
 ))}
 </div>
 <Button
 type="button"
 variant="primary"
 size="md"
 onClick={handleVerify}
 disabled={submitting}
 className="w-full mt-3"
 >
 {submitting ? 'Memverifikasi...' : 'Aktifkan 2FA Sekarang'}
 </Button>
 </div>
 </div>
 ) : (
 /* Ringkasan & Panduan Tab */
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
 {/* Card 1: Status 2FA */}
 <div className="lg:col-span-3 bg-slate-50/80 dark:bg-slate-800/40 p-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col items-center justify-between text-center">
 <div className="space-y-3">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
 Status 2FA
 </span>
 <div
 className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner border ${
 tfaData.enabled
 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-emerald-200/80 dark:border-emerald-800/60'
 }`}
 >
 <BsShieldCheck className="w-10 h-10" />
 </div>
 <div>
 <h4
 className={`text-base font-extrabold ${
 tfaData.enabled
 ? 'text-emerald-800 dark:text-emerald-400'
 : 'text-amber-800 dark:text-amber-400'
 }`}
 >
 {tfaData.enabled ? '2FA Aktif' : '2FA Belum Aktif'}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[180px] mx-auto">
 {tfaData.enabled
 ? 'Akun Anda dilindungi dengan Two Factor Authentication.'
 : 'Aktifkan 2FA untuk meningkatkan keamanan akses akun Anda.'}
 </p>
 </div>
 </div>

 {tfaData.enabled ? (
 <Button
 type="button"
 variant="danger"
 appearance="outline"
 size="sm"
 onClick={() => setShowDisableModal(true)}
 className="w-full mt-6"
 >
 Nonaktifkan 2FA
 </Button>
 ) : (
 <Button
 type="button"
 variant="primary"
 size="sm"
 onClick={() => setActiveTab('Setup Authenticator')}
 className="w-full mt-6"
 >
 Setup 2FA Sekarang
 </Button>
 )}
 </div>

 {/* Card 2: Metode 2FA & Verifikasi */}
 <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between space-y-5">
 <div className="space-y-4">
 <div className="border-b border-emerald-100/80 dark:border-emerald-800/60 pb-3">
 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
 Metode 2FA
 </span>
 <div className="flex items-center gap-2 mt-1">
 <FiSmartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
 Authenticator App (Google / Microsoft Authenticator)
 </h4>
 </div>
 <p className="text-xs text-slate-400 mt-1">
 {tfaData.verified_at
 ? `Diverifikasi Pada: ${new Date(tfaData.verified_at).toLocaleString('id-ID')}`
 : 'Belum diverifikasi'}
 </p>
 </div>

 <div>
 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Verifikasi 2FA</h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Masukkan kode 6 digit dari aplikasi authenticator Anda untuk pengujian.
 </p>
 </div>

 {verified && (
 <Alert status="success" className="rounded-xl">
 <AlertIndicator>
 <FiCheck className="w-4 h-4" />
 </AlertIndicator>
 <AlertContent>
 <AlertDescription>Kode 2FA berhasil diverifikasi!</AlertDescription>
 </AlertContent>
 </Alert>
 )}

 {/* OTP Input Boxes */}
 <div className="flex justify-between gap-2 my-2">
 {otp.map((digit, index) => (
 <input
 key={index}
 ref={(el) => (inputRefs.current[index] = el)}
 type="text"
 maxLength={1}
 value={digit}
 onChange={(e) => handleOtpChange(index, e.target.value)}
 onKeyDown={(e) => handleKeyDown(index, e)}
 className="w-10 h-12 text-center text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
 />
 ))}
 </div>
 </div>

 <Button
 type="button"
 variant="primary"
 size="md"
 onClick={handleVerify}
 disabled={submitting}
 className="w-full"
 >
 {submitting ? 'Memverifikasi...' : 'Verifikasi Kode'}
 </Button>
 </div>

 {/* Card 3: Informasi */}
 <div className="lg:col-span-4 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between space-y-4">
 <div className="space-y-4">
 <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
 <FiInfo className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
 <span>Informasi Keamanan</span>
 </h4>

 <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
 <li className="flex items-start gap-2.5">
 <FiLock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
 <span>2FA menambahkan lapisan keamanan ekstra untuk melindungi akun dari pencurian kata sandi.</span>
 </li>

 <li className="flex items-start gap-2.5">
 <BsShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
 <span>Anda akan diminta kode verifikasi saat login dari perangkat browser baru.</span>
 </li>

 <li className="flex items-start gap-2.5">
 <FiInfo className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
 <span>Simpan kode cadangan (Recovery Code) di tempat yang aman jika ponsel tidak dapat diakses.</span>
 </li>
 </ul>
 </div>

 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => setActiveTab('Recovery Code')}
 className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 transition-colors"
 >
 <span>Lihat Recovery Codes</span>
 <FiExternalLink className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Disable 2FA Modal */}
 {showDisableModal && (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
 <div className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xl space-y-4">
 <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <FiAlertTriangle className="text-rose-600" />
 <span>Konfirmasi Nonaktifkan 2FA</span>
 </h3>
 <p className="text-xs text-slate-600 dark:text-slate-300">
 Menonaktifkan 2FA akan menurunkan perlindungan akun Anda. Masukkan kata sandi akun untuk melanjutkan.
 </p>
 <input
 type="password"
 placeholder="Kata sandi saat ini"
 value={passwordConfirm}
 onChange={(e) => setPasswordConfirm(e.target.value)}
 className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 rounded-xl text-sm"
 />
 <div className="flex justify-end gap-2 pt-2">
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => {
 setShowDisableModal(false)
 setPasswordConfirm('')
 }}
 >
 Batal
 </Button>
 <Button
 type="button"
 variant="danger"
 size="sm"
 onClick={handleDisable2fa}
 disabled={submitting}
 >
 {submitting ? 'Memproses...' : 'Nonaktifkan 2FA'}
 </Button>
 </div>
 </div>
 </div>
 )}
 </Card>
 )
}
