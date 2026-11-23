import { useState, useRef, useEffect } from 'react'
import {
 FiLock,
 FiEye,
 FiEyeOff,
 FiAlertCircle,
 FiX,
 FiUser,
 FiCameraOff,
} from 'react-icons/fi'
import { FaMosque } from 'react-icons/fa6'
import { BsQrCode } from 'react-icons/bs'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../stores/authStore'
import { usePengaturanStore } from '../../stores/pengaturanStore'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '@/components/ui/alert'
import { showAuthPopup } from '../ui/AuthPopup'

export default function LoginCard({ onNavigate, onLoginSuccess }) {
 const setSession = useAuthStore((state) => state.setSession)
 const pengaturan = usePengaturanStore((state) => state.pengaturan)

 // Single Unified Form inputs
 const [form, setForm] = useState({
 identifier: '',
 password: '',
 rememberMe: false,
 })

 const [showPassword, setShowPassword] = useState(false)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [errorTitle, setErrorTitle] = useState('Gagal Autentikasi')
 const [sessionNotice, setSessionNotice] = useState(null)
 const [successNotice, setSuccessNotice] = useState(null)
 const [workspaceOptions, setWorkspaceOptions] = useState([])

 useEffect(() => {
 const params = new URLSearchParams(window.location.search)
 const reason = params.get('reason')
 if (reason === 'inactivity' || reason === 'expired') {
 setSessionNotice({
 status: 'error',
 title: 'Pemberitahuan Sesi',
 message: 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan masuk kembali.',
 })
 } else if (reason === 'browser_mismatch') {
 setSessionNotice({
 status: 'error',
 title: 'Pemberitahuan Sesi',
 message: 'Status login memerlukan autentikasi baru saat berpindah browser/link. Silakan masuk kembali.',
 })
 }
 }, [])

 // QR Modal scanner state
 const [showQrModal, setShowQrModal] = useState(false)
 const [qrTokenInput, setQrTokenInput] = useState('')
 const [qrLoading, setQrLoading] = useState(false)
 const [qrError, setQrError] = useState('')

 // Camera stream state
 const videoRef = useRef(null)
 const [cameraActive, setCameraActive] = useState(false)
 const [cameraError, setCameraError] = useState('')

 // Real Camera WebRTC Stream Lifecycle
 useEffect(() => {
 let stream = null
 let animationFrameId = null
 let barcodeDetector = null

 if (showQrModal) {
 setCameraError('')
 setCameraActive(false)

 if ('BarcodeDetector' in window) {
 try {
 barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] })
 } catch {
 barcodeDetector = null
 }
 }

 if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
 navigator.mediaDevices
 .getUserMedia({ video: { facingMode: 'environment' } })
 .then((mediaStream) => {
 stream = mediaStream
 if (videoRef.current) {
 videoRef.current.srcObject = mediaStream
 videoRef.current
 .play()
 .then(() => setCameraActive(true))
 .catch(() => setCameraActive(true))

 // Scan frame loop using native BarcodeDetector if available
 if (barcodeDetector) {
 const scanFrame = async () => {
 if (videoRef.current && videoRef.current.readyState === 4) {
 try {
 const barcodes = await barcodeDetector.detect(videoRef.current)
 if (barcodes && barcodes.length > 0) {
 const code = barcodes[0].rawValue
 if (code) {
 setQrTokenInput(code)
 }
 }
 } catch {
 // ignore frame detect error
 }
 }
 animationFrameId = requestAnimationFrame(scanFrame)
 }
 animationFrameId = requestAnimationFrame(scanFrame)
 }
 }
 })
 .catch((err) => {
 setCameraActive(false)
 if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
 setCameraError('Izin kamera ditolak. Silakan berikan izin akses kamera pada browser Anda.')
 } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
 setCameraError('Kamera tidak ditemukan pada perangkat Anda.')
 } else {
 setCameraError('Tidak dapat mengaktifkan kamera. Anda dapat memasukkan/menempelkan token QR secara manual.')
 }
 })
 } else {
 setCameraError('Browser Anda tidak mendukung akses kamera WebRTC.')
 }
 }

 return () => {
 if (animationFrameId) cancelAnimationFrame(animationFrameId)
 if (stream) {
 stream.getTracks().forEach((track) => track.stop())
 }
 setCameraActive(false)
 }
 }, [showQrModal])

 const getRoleDisplayName = (user) => {
 if (!user) return 'Pengguna'
 if (Array.isArray(user.roles) && user.roles.length > 0) {
 return user.roles.join(', ')
 }
 if (user.role) return user.role
 return 'Pengguna'
 }

 const handleSubmit = async (e) => {
 e.preventDefault()
 setLoading(true)
 setError('')
 setSuccessNotice(null)
 setWorkspaceOptions([])

 try {
 const result = await authService.login({
 identifier: form.identifier,
 password: form.password,
 device_name: 'web-dashboard',
 })

 if (!result.token || !result.user) throw new Error('Respons autentikasi tidak valid.')

 const roleName = getRoleDisplayName(result.user)
 const userName = result.user?.name || result.user?.nama || form.identifier

 setSuccessNotice({
 title: 'Autentikasi Berhasil!',
 description: `Selamat datang, ${userName}! Anda berhasil masuk ke sistem. Mengalihkan...`,
 })

 setSession({ token: result.token, user: result.user, loginTime: new Date().toISOString() })

 showAuthPopup({
 type: 'success',
 title: 'Berhasil Masuk!',
 message: `Selamat datang, ${userName}! Anda berhasil masuk ke sistem.`,
 })

 setTimeout(() => {
 if (onLoginSuccess) onLoginSuccess(result)
 else if (onNavigate) onNavigate(6)
 }, 450)
 } catch (err) {
 if (err?.response?.status === 409 && err.response.data?.workspace_chooser) {
 setWorkspaceOptions(err.response.data.workspaces || [])
 setLoading(false)
 return
 }

 const status = err?.response?.status
 const errCode = err?.response?.data?.code
 let resolvedTitle = 'Username / Password Salah'
 let fallbackMsg = 'Username, NIP, NIS, NIK, atau password tidak valid.'

 if (status === 0 || err?.code === 'ERR_NETWORK' || errCode === 'SERVER_UNREACHABLE' || errCode === 'CLIENT_OFFLINE') {
 const isClientOffline = typeof navigator !== 'undefined' && !navigator.onLine
 resolvedTitle = isClientOffline ? 'Koneksi Internet Terputus' : 'Server Tidak Terjangkau'
 fallbackMsg = isClientOffline
 ? 'Perangkat Anda sedang tidak terhubung ke jaringan internet. Periksa koneksi internet Anda.'
 : 'Tidak dapat terhubung ke server backend. Pastikan server aktif dan coba kembali.'
 } else if (status === 503 || errCode === 'DATABASE_CONNECTION_ERROR') {
 resolvedTitle = 'Gangguan Basis Data'
 fallbackMsg = 'Layanan database sedang tidak dapat dijangkau. Silakan hubungi administrator sistem.'
 } else if (status === 502 || status === 504) {
 resolvedTitle = 'Server Tidak Merespons'
 fallbackMsg = 'Server backend membutuhkan waktu terlalu lama untuk merespons (Gateway Timeout).'
 } else if (status === 500) {
 resolvedTitle = 'Gangguan Sistem Server'
 fallbackMsg = 'Terjadi kendala teknis pada server backend. Silakan hubungi administrator.'
 }

 const msg =
 err?.response?.data?.message ||
 err?.response?.data?.errors?.identifier?.[0] ||
 fallbackMsg

 setErrorTitle(resolvedTitle)
 setError(msg)
 showAuthPopup({
 type: 'error',
 title: resolvedTitle,
 message: msg,
 })
 setLoading(false)
 }
 }

 const handleWorkspaceLogin = async (portalType) => {
 setLoading(true)
 setError('')
 setSuccessNotice(null)

 try {
 const result = await authService.loginParentStudent({
 portal_type: portalType,
 identifier: form.identifier,
 password: form.password,
 device_name: 'web-dashboard',
 })

 if (!result.token || !result.user) throw new Error('Respons autentikasi tidak valid.')

 const roleName = getRoleDisplayName(result.user)
 const userName = result.user?.name || result.user?.nama || form.identifier

 setSuccessNotice({
 title: 'Akses Berhasil!',
 description: `Selamat datang, ${userName}! Anda berhasil masuk ke portal. Mengalihkan...`,
 })

 setSession({ token: result.token, user: result.user, loginTime: new Date().toISOString() })
 setWorkspaceOptions([])

 showAuthPopup({
 type: 'success',
 title: 'Berhasil Masuk!',
 message: `Selamat datang, ${userName}! Anda berhasil masuk ke portal.`,
 })

 setTimeout(() => {
 if (onLoginSuccess) onLoginSuccess(result)
 else if (onNavigate) onNavigate(6)
 }, 450)
 } catch (err) {
 setError(err?.response?.data?.message || 'Kredensial atau workspace tidak valid.')
 setLoading(false)
 }
 }

 const handleQrSubmit = async (e) => {
 e.preventDefault()
 if (!qrTokenInput.trim()) return
 setQrLoading(true)
 setQrError('')
 setSuccessNotice(null)

 try {
 const result = await authService.loginEmployeeQr({
 qr_token: qrTokenInput.trim(),
 device_name: 'web-dashboard',
 })

 if (!result.token || !result.user) throw new Error('Respons autentikasi tidak valid.')

 const roleName = getRoleDisplayName(result.user)
 const userName = result.user?.name || result.user?.nama || 'Pegawai'

 setSuccessNotice({
 title: 'Verifikasi QR Code Berhasil!',
 description: `ID Card Pegawai atas nama ${userName} berhasil diverifikasi. Mengalihkan ke sistem...`,
 })

 setSession({
 token: result.token,
 user: result.user,
 loginTime: new Date().toISOString(),
 })

 showAuthPopup({
 type: 'success',
 title: 'Verifikasi QR Berhasil!',
 message: `ID Card atas nama ${userName} berhasil diverifikasi.`,
 })

 setShowQrModal(false)

 setTimeout(() => {
 if (onLoginSuccess) onLoginSuccess(result)
 else if (onNavigate) onNavigate(6)
 }, 450)
 } catch (err) {
 const msg = err?.response?.data?.message || 'QR Code tidak valid, kedaluwarsa, atau telah dicabut.'
 setQrError(msg)
 setQrLoading(false)
 }
 }

 const logoUrl = pengaturan?.logo_url || pengaturan?.logoUrl || '/logo.png'
 const namaSekolah = pengaturan?.school_name || pengaturan?.namaSekolah || 'Yayasan Pendidikan Islam'
 const rawApp = pengaturan?.application_name
 const namaAplikasi = (!rawApp || rawApp === 'Sistem Manajemen Sekolah Terpadu' || rawApp === 'Dareliman Edu') ? 'Dareliman Edu' : rawApp

 return (
 <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-300">
				{/* Top Header Banner */}
				<div className="bg-gradient-to-br from-[#059669] via-emerald-800 to-emerald-950 px-6 py-6 sm:px-8 sm:py-7 text-white text-center relative overflow-hidden border-b border-emerald-600/30">
					{/* Ambient Decorative Glows */}
					<div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
					<div className="absolute -left-8 -top-8 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

					<div className="relative z-10 space-y-2">
						{logoUrl ? (
							<img
								src={logoUrl}
								onError={(e) => {
									if (e.target.src !== window.location.origin + "/logo.png") {
										e.target.src = "/logo.png"
									}
								}}
								alt={`Logo ${namaSekolah || "Yayasan"}`}
								className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto drop-shadow-xl transition-transform duration-300 hover:scale-105"
							/>
						) : (
							<div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 text-white drop-shadow-xl mx-auto">
								<FaMosque className="w-12 h-12" />
							</div>
						)}
						<div>
							<span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black text-amber-300 bg-amber-400/20 border border-amber-300/30 uppercase tracking-widest mb-1.5">
								Pusat Pendidikan Islam Terpadu
							</span>
							<h2 className="text-lg font-black tracking-tight text-white drop-shadow-xs">
								{namaSekolah || "YAYASAN DAR EL - IMAN"}
							</h2>
							<p className="text-xs font-bold text-emerald-200 tracking-widest uppercase mt-0.5">
								{namaAplikasi || "DARELIMAN EDU"}
							</p>
						</div>
					</div>
				</div>

 {/* Main Form Body */}
 <div className="p-5 sm:p-7 flex flex-col gap-4.5">
 {/* Form Title */}
 <div className="text-center space-y-1">
 <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
 Masuk ke Sistem Terpadu
 </h3>
 <p className="text-xs sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
 Superadmin, Admin, Pegawai, Guru, Siswa, dan Orang Tua
 </p>
 </div>

 {/* Form Input */}
 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Success Notice Banner with HeroUI Alert */}
 {successNotice && (
 <Alert status="success" className="animate-fade-in">
 <AlertIndicator />
 <AlertContent>
 <AlertTitle>{successNotice.title}</AlertTitle>
 <AlertDescription>{successNotice.description}</AlertDescription>
 </AlertContent>
 </Alert>
 )}

 {/* Session Notice Banner with HeroUI Alert */}
 {sessionNotice && !successNotice && (
 <Alert
 status={typeof sessionNotice === 'object' ? sessionNotice.status : 'error'}
 className="animate-fade-in"
 >
 <AlertIndicator />
 <AlertContent>
 <AlertTitle>
 {typeof sessionNotice === 'object' && sessionNotice.title
 ? sessionNotice.title
 : 'Pemberitahuan Sesi'}
 </AlertTitle>
 <AlertDescription>
 {typeof sessionNotice === 'object' ? sessionNotice.message : sessionNotice}
 </AlertDescription>
 </AlertContent>
 </Alert>
 )}

 {/* Error Banner with HeroUI Alert */}
 {error && !successNotice && (
 <Alert status="error" className="animate-fade-in">
 <AlertIndicator />
 <AlertContent>
 <AlertTitle>{errorTitle || 'Gagal Autentikasi'}</AlertTitle>
 <AlertDescription>{error}</AlertDescription>
 </AlertContent>
 </Alert>
 )}

 {workspaceOptions.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 p-3 text-xs text-amber-950">
 <p className="font-bold">Identitas cocok dengan lebih dari satu workspace.</p>
 <p className="mt-1">Pilih workspace setelah password berhasil diverifikasi.</p>
 <div className="mt-3 grid gap-2 sm:grid-cols-2">
 {workspaceOptions.map((workspace) => (
 <Button
 key={workspace.portal_type}
 type="button"
 onClick={() => handleWorkspaceLogin(workspace.portal_type)}
 disabled={loading || Boolean(successNotice)}
 pending={loading || Boolean(successNotice)}
 variant="primary"
 appearance="outline"
 size="sm"
 className="w-full text-left justify-start font-semibold text-amber-900 border-amber-300 hover:bg-amber-100"
 >
 Masuk sebagai {workspace.label}
 </Button>
 ))}
 </div>
 </div>
 )}

 {/* Identifier Input */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 Email, NIY, No. KK, NIS, NIK, Username, atau No. HP
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
 <FiUser className="w-4 h-4" />
 </div>
 <input
 type="text"
 value={form.identifier}
 onChange={(e) => setForm({ ...form, identifier: e.target.value })}
 placeholder="Email / NIY / No. KK / NIS / NIK / No. HP"
 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
 required
 />
 </div>
 </div>

 {/* Password Input */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 Password / PIN
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
 <FiLock className="w-4 h-4" />
 </div>
 <input
 type={showPassword ? 'text' : 'password'}
 value={form.password}
 onChange={(e) => setForm({ ...form, password: e.target.value })}
 placeholder="Masukkan Password / PIN"
 className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 {/* Remember Me & Forgot Password */}
 <div className="flex items-center justify-between text-xs pt-0.5">
 <label className="flex items-center cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
 <input
 type="checkbox"
 checked={form.rememberMe}
 onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
 className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300 dark:border-emerald-700/80 accent-emerald-700"
 />
 <span className="ml-2">Ingat saya</span>
 </label>
 <button
 type="button"
 onClick={() => onNavigate && onNavigate(2)}
 className="font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline"
 >
 Lupa password?
 </button>
 </div>

 {/* Submit Button with HeroUI Button & Spinner */}
 <Button
 type="submit"
 disabled={loading || Boolean(successNotice)}
 pending={loading || Boolean(successNotice)}
 variant="primary"
 appearance="fill"
 size="md"
 className="w-full h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-200/80 dark:border-emerald-800/60 text-sm font-semibold shadow-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
 >
 {(loading || successNotice) ? (
 <span>{successNotice ? 'Berhasil! Mengalihkan Sesi...' : 'Memverifikasi Hak Akses...'}</span>
 ) : (
 'Masuk ke Sistem'
 )}
 </Button>
 </form>

 {/* Alternative QR Code Button */}
 <div className="pt-2 border-t border-emerald-100/80 text-center">
 <p className="text-xs font-medium text-slate-400 mb-2.5 uppercase tracking-wider">
 atau gunakan autentikasi cepat
 </p>
 <button
 type="button"
 onClick={() => {
 setQrError('')
 setQrTokenInput('')
 setShowQrModal(true)
 }}
 className="w-full h-9 px-3.5 bg-white hover:bg-emerald-50/60 text-slate-700 border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
 >
 <BsQrCode className="w-4 h-4 text-white" />
 <span>Scan QR ID Card Pegawai / Kartu Siswa</span>
 </button>
 </div>

 {/* Footer info */}
 <div className="text-center text-xs text-slate-400 border-t border-emerald-100/80 pt-3">
 © {new Date().getFullYear()} {namaSekolah}. Hak Cipta Dilindungi.{' '}
 <span className="font-mono text-emerald-700 font-semibold">Ver 2.1.0</span>
 </div>
 </div>

 {/* QR Scanner Modal with Real WebRTC Camera Stream */}
 {showQrModal && (
 <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 animate-in zoom-in-95">
 <div className="flex items-center justify-between border-b border-emerald-100/80 pb-3 mb-4">
 <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
 <BsQrCode className="w-5 h-5 text-emerald-600" />
 <span>Scan QR Code ID Card Pegawai / Kartu Siswa</span>
 </div>
 <button
 type="button"
 onClick={() => setShowQrModal(false)}
 className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
 >
 <FiX className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleQrSubmit} className="space-y-4">
 {qrError && (
 <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
 <FiAlertCircle className="w-4 h-4 shrink-0 text-red-500" />
 <span>{qrError}</span>
 </div>
 )}

 {/* Real Video Camera Viewport */}
 <div className="relative aspect-square bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-emerald-200/80 dark:border-emerald-800/60 text-white shadow-inner">
 {/* HTML5 Video Stream Element */}
 <video
 ref={videoRef}
 autoPlay
 playsInline
 muted
 className={`w-full h-full object-cover transition-opacity duration-300 ${
 cameraActive ? 'opacity-100' : 'opacity-0 absolute'
 }`}
 />

 {/* Animated Target Viewfinder Overlay */}
 {cameraActive && (
 <div className="absolute inset-10 border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 rounded-xl pointer-events-none animate-pulse flex items-center justify-center">
 <span className="bg-emerald-950/80 backdrop-blur text-amber-300 font-mono text-[10px] px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
 Kamera Aktif — Pindai QR Code
 </span>
 </div>
 )}

 {/* Connecting / Camera Error Fallback UI */}
 {!cameraActive && (
 <div className="p-6 text-center flex flex-col items-center justify-center">
 {cameraError ? (
 <>
 <FiCameraOff className="w-12 h-12 text-amber-400 mb-2" />
 <p className="text-xs text-slate-300 font-medium mb-1">
 {cameraError}
 </p>
 <p className="text-xs text-slate-400">
 Anda dapat mengetikkan/menempelkan token QR secara manual pada kolom di bawah.
 </p>
 </>
 ) : (
 <>
 <svg className="animate-spin h-8 w-8 text-emerald-400 mb-3" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
 </svg>
 <p className="text-xs font-semibold text-emerald-300">
 Mengaktifkan Kamera Perangkat...
 </p>
 <span className="text-[10px] text-slate-400 mt-1">
 Mohon izinkan akses kamera jika diminta browser
 </span>
 </>
 )}
 </div>
 )}
 </div>

 {/* Alternative Token Input for Hardware Scanner */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">
 Atau tempelkan token/input barcode scanner:
 </label>
 <input
 type="text"
 value={qrTokenInput}
 onChange={(e) => setQrTokenInput(e.target.value)}
 placeholder="Paste token QR di sini..."
 className="w-full px-3.5 py-2.5 text-xs bg-slate-50 text-slate-800 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
 />
 </div>

 <div className="flex gap-2 pt-1">
 <button
 type="button"
 onClick={() => setShowQrModal(false)}
 className="flex-1 py-2.5 px-4 bg-emerald-50 hover:bg-slate-200 text-emerald-700 rounded-xl text-xs font-semibold transition-all"
 >
 Batal
 </button>
 <Button
 type="submit"
 disabled={qrLoading || !qrTokenInput.trim() || Boolean(successNotice)}
 pending={qrLoading || Boolean(successNotice)}
 variant="primary"
 appearance="fill"
 size="sm"
 className="flex-1 font-semibold shadow-sm"
 >
 {(qrLoading || successNotice) ? (
 <>
 <Spinner size="xs" />
 <span>{successNotice ? 'Berhasil...' : 'Memverifikasi...'}</span>
 </>
 ) : (
 'Verifikasi QR'
 )}
 </Button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 )
}
