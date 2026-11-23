import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Camera, CameraOff, CheckCircle2, ListChecks, QrCode, RefreshCw, X, XCircle } from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import { lmsPresensiService } from '../../services/lmsPresensiService'

const methods = [
 ['manual', 'Pemanggilan Nama Siswa (Roll Call)', ListChecks],
 ['qr', 'QR Code Kartu Siswa', QrCode],
]

export function AttendanceMethodSelector({ value, onChange }) {
 return (
 <div className="grid gap-3.5 sm:grid-cols-2">
 {methods.map(([id, label, Icon]) => {
 const isActive = value === id
 return (
 <button
 key={id}
 type="button"
 onClick={() => onChange(id)}
 className={`flex items-center justify-start gap-3.5 rounded-xl border p-4 text-left text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
 isActive
 ? 'border-2 border-emerald-500 bg-emerald-50/70 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-md scale-[1.01]'
 : 'border border-emerald-200/90 bg-emerald-50/40 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-900 dark:border-emerald-800/60 dark:bg-[#1B2433] dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 shadow-2xs hover:shadow-xs'
 }`}
 >
 <div className={`flex size-10 items-center justify-center rounded-xl transition-colors shrink-0 ${
 isActive
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
 }`}>
 <Icon size={20} />
 </div>
 <span className="truncate">{label}</span>
 </button>
 )
 })}
 </div>
 )
}

export function AttendanceCapturePanel({ method, session, onRecorded, captureActive = false, disabled = false }) {
 const [identifier, setIdentifier] = useState('')
 const [busy, setBusy] = useState(false)
 const [result, setResult] = useState(null)

 // Camera Pop-up State
 const [showCameraModal, setShowCameraModal] = useState(false)
 const [cameraActive, setCameraActive] = useState(false)
 const [cameraLoading, setCameraLoading] = useState(false)
 const [cameraError, setCameraError] = useState('')
 const [modalInput, setModalInput] = useState('')

 // Continuous scan: cooldown + in-viewfinder flash feedback
 const [scanCooldown, setScanCooldown] = useState(false) // true = sedang dalam jeda antar-scan
 const [viewfinderFlash, setViewfinderFlash] = useState(null) // 'success' | 'error' | null

 const videoRef = useRef(null)
 const streamRef = useRef(null)
 const detectorRef = useRef(null)
 const scanTimerRef = useRef(null)
 const busyRef = useRef(false)
 const scanCooldownRef = useRef(false) // ref-copy agar dapat dibaca di closure interval

 const stopCamera = () => {
 if (scanTimerRef.current) {
 window.clearInterval(scanTimerRef.current)
 scanTimerRef.current = null
 }
 detectorRef.current = null
 if (streamRef.current) {
 streamRef.current.getTracks().forEach((track) => track.stop())
 streamRef.current = null
 }
 if (videoRef.current) {
 videoRef.current.srcObject = null
 }
 setCameraActive(false)
 }

 useEffect(() => {
 return () => {
 stopCamera()
 }
 }, [])

 const startCamera = async () => {
 setCameraLoading(true)
 setCameraError('')
 stopCamera()

 try {
 let mediaStream = null
 try {
 mediaStream = await navigator.mediaDevices.getUserMedia({
 video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
 })
 } catch (e) {
 mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
 }

 streamRef.current = mediaStream

 if (videoRef.current) {
 videoRef.current.srcObject = mediaStream
 await videoRef.current.play()
 }
 setCameraActive(true)

 if (!('BarcodeDetector' in window)) {
 setCameraError('Pemindaian otomatis belum tersedia di browser ini. Gunakan scanner USB atau input opaque token di bawah.')
 return
 }

 try {
 detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
 scanTimerRef.current = window.setInterval(async () => {
 // Jangan proses jika kamera/detektor belum siap, atau sedang busy/cooldown
 if (
 !videoRef.current ||
 videoRef.current.readyState < 2 ||
 busyRef.current ||
 scanCooldownRef.current ||
 !detectorRef.current
 ) return

 try {
 const codes = await detectorRef.current.detect(videoRef.current)
 const value = codes[0]?.rawValue
 if (value) {
 // Aktifkan cooldown agar frame berikutnya tidak memproses kode yang sama
 scanCooldownRef.current = true
 setScanCooldown(true)
 // Proses langsung ke server — kamera TETAP aktif (tidak stopCamera())
 await processScanCode(value, 'camera')
 // Cooldown 2.5 detik sebelum bisa scan berikutnya
 setTimeout(() => {
 scanCooldownRef.current = false
 setScanCooldown(false)
 setViewfinderFlash(null)
 }, 2500)
 }
 } catch {
 // Frame tanpa QR valid diabaikan sampai pemindaian berikutnya.
 }
 }, 400)
 } catch {
 setCameraError('Browser tidak dapat membuat pemindai QR otomatis. Gunakan scanner USB atau input manual.')
 }
 } catch (err) {
 console.error('Camera Access Error:', err)
 setCameraError('Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan di browser.')
 setCameraActive(false)
 } finally {
 setCameraLoading(false)
 }
 }

 const openCameraModal = () => {
 setShowCameraModal(true)
 setTimeout(() => {
 startCamera()
 }, 200)
 }

 const closeCameraModal = () => {
 stopCamera()
 setShowCameraModal(false)
 }

 // Auto-submit USB scanner: debounce 300ms setelah input terakhir
 // Scanner USB biasanya selesai <100ms, jadi 300ms cukup aman
 useEffect(() => {
 if (!modalInput.trim() || disabled || !captureActive || busy) return
 const timer = setTimeout(() => {
 processScanCode(modalInput, 'usb')
 }, 300)
 return () => clearTimeout(timer)
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [modalInput])

 const processScanCode = async (codeToScan, source = 'usb') => {
 const rawCode = String(codeToScan || '').trim()
 if (!rawCode || disabled || !captureActive || busyRef.current) return

 if (!session?.id) {
 setResult({ scan_status: 'rejected', message: 'Mulai sesi presensi mengajar terlebih dahulu.' })
 return
 }

 busyRef.current = true
 setBusy(true)
 try {
 const response = await lmsPresensiService.scanAttendance(session.id, 'qr', { identifier: codeToScan })
 const payload = response?.data || {}
 setResult(payload)
 if (payload.scan_status === 'success') {
 onRecorded?.(payload)
 if (source === 'camera') {
 // Flash hijau di viewfinder — kamera tetap aktif
 setViewfinderFlash('success')
 // Toast ringan agar tidak memblokir kamera
 Swal.fire({
 icon: 'success',
 title: payload.student?.full_name || payload.student?.nama_lengkap || 'Berhasil',
 text: payload.message,
 timer: 2000,
 showConfirmButton: false,
 toast: true,
 position: 'top-end',
 })
 } else {
 Swal.fire({
 icon: 'success',
 title: 'Presensi Berhasil',
 text: payload.message,
 timer: 2000,
 showConfirmButton: false,
 })
 }
 } else if (payload.scan_status === 'duplicate_scan') {
 if (source === 'camera') setViewfinderFlash('duplicate')
 Swal.fire({
 icon: 'info',
 title: 'Sudah Tercatat',
 text: payload.message,
 ...(source === 'camera' && { toast: true, position: 'top-end', timer: 2000, showConfirmButton: false }),
 })
 } else {
 if (source === 'camera') setViewfinderFlash('error')
 Swal.fire({
 icon: 'error',
 title: 'Pemindaian Ditolak',
 text: payload.message,
 ...(source === 'camera' && { toast: true, position: 'top-end', timer: 2500, showConfirmButton: false }),
 })
 }
 } catch (err) {
 const msg = err.response?.data?.message || 'Siswa tidak ditemukan dalam roster kelas ini.'
 setResult({ scan_status: 'rejected', message: msg })
 if (source === 'camera') setViewfinderFlash('error')
 Swal.fire({
 icon: 'error',
 title: 'Pemindaian Ditolak',
 text: msg,
 ...(source === 'camera' && { toast: true, position: 'top-end', timer: 2500, showConfirmButton: false }),
 })
 } finally {
 setIdentifier('')
 setModalInput('')
 setBusy(false)
 busyRef.current = false
 }
 }

 const handleScanSubmit = (e) => {
 e?.preventDefault()
 if (!identifier.trim() || disabled || !captureActive) return
 processScanCode(identifier, 'usb')
 }

 const handleModalSubmit = (e) => {
 e?.preventDefault()
 if (!modalInput.trim() || disabled || !captureActive) return
 processScanCode(modalInput)
 }

 if (method === 'manual') {
 return (
 <div className="flex items-start gap-3.5 rounded-xl border border-emerald-200/90 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 p-4.5 shadow-2xs dark:border-emerald-800/60 dark:from-emerald-950/50 dark:via-emerald-900/30 dark:to-emerald-950/20">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs mt-0.5">
 <ListChecks size={20} />
 </div>
 <div>
 <h4 className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
 Checklist Presensi Manual (Roll Call)
 </h4>
 <p className="mt-1 text-xs font-semibold text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed">
 Gunakan tombol opsi status di bawah untuk checklist kehadiran siswa satu per satu (
 <span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-md">Hadir</span>,{' '}
 <span className="font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md">Terlambat</span>,{' '}
 <span className="font-extrabold text-sky-700 dark:text-sky-300 bg-sky-100/90 dark:bg-sky-900/60 px-1.5 py-0.5 rounded-md">Izin</span>,{' '}
 <span className="font-extrabold text-violet-700 dark:text-violet-300 bg-violet-100/90 dark:bg-violet-900/60 px-1.5 py-0.5 rounded-md">Sakit</span>,{' '}
 <span className="font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-900/60 px-1.5 py-0.5 rounded-md">Alpha</span>).
 </p>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:border-emerald-700/80 dark:bg-[#1B2433]">
 {!captureActive && <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-300">Capture QR belum aktif. Simpan roster lalu klik <b>Mulai Capture</b>; server akan memeriksa status sesi sebelum menerima scan.</div>}
 {/* Action Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-emerald-50/60 p-4 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:border-emerald-800/60">
 <div>
 <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
 <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Pemindai Kamera Live QR Code
 </h4>
 <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
 Gunakan kamera laptop/HP atau scanner USB kartu siswa.
 </p>
 </div>
 <button
 type="button"
 onClick={openCameraModal}
 disabled={cameraLoading}
 className="flex items-center justify-center gap-2 rounded-lg bg-[#059669] hover:bg-[#047857] px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-60 whitespace-nowrap border border-[#059669] h-9 text-sm rounded-xl cursor-pointer"
 >
 <Camera className="h-4 w-4" /> Buka Kamera Pemindai Live
 </button>
 </div>

 {/* Manual Input Scanner USB Form */}
 <form onSubmit={handleScanSubmit} className="space-y-2">
 <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
 Input / Hardware Scanner USB Kartu
 </label>
 <div className="flex gap-2">
 <input
 type="text"
 autoFocus
 value={identifier}
 onChange={(e) => setIdentifier(e.target.value)}
 disabled={disabled || !captureActive || busy}
 placeholder="Scan opaque QR kartu siswa via scanner USB..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white"
 />
 <button
 type="submit"
 disabled={disabled || !captureActive || busy}
 className="rounded-lg bg-[#059669] hover:bg-[#047857] px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 whitespace-nowrap border border-[#059669] h-9 text-sm rounded-xl cursor-pointer"
 >
 Proses QR
 </button>
 </div>
 </form>

 {/* Result feedback */}
 {result && (
 <div
 className={`flex items-center gap-3 rounded-xl p-3.5 text-xs font-semibold ${
 result.scan_status === 'success'
 ? 'bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
 : 'bg-rose-100/70 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
 }`}
 >
 {result.scan_status === 'success' ? (
 <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 ) : (
 <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
 )}
 <div>
 <b className="text-sm">{result.student?.full_name || result.student?.nama_lengkap || 'Pemberitahuan'}</b>
 <p className="mt-0.5">{result.message}</p>
 </div>
 </div>
 )}

 {/* Live Camera Pop-up Modal — Premium QR Scanner with Square ID Card Viewfinder */}
 <AnimatePresence>
 {showCameraModal && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-md"
 onClick={closeCameraModal}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 450, damping: 30 }}
 className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] dark:border-emerald-800/60 dark:bg-slate-900"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Ambient Glow Blobs */}

 {/* Modal Header — Gradient Emerald */}
 <div className="relative z-10 flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-[#1B2433] p-5 dark:border-emerald-800/60">
 <div className="flex items-center gap-3.5">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-emerald-200/25 shadow-md">
 <Camera className="h-5 w-5" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-base font-black tracking-tight text-white">
 Pemindai Live QR Code Kartu Siswa
 </h3>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-100 border border-emerald-200/20">
 <span className="relative flex h-1.5 w-1.5">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
 </span>
 LIVE
 </span>
 </div>
 <p className="text-xs font-medium text-emerald-100/80 mt-0.5">
 Presensi Mata Pelajaran
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={closeCameraModal}
 className="rounded-full p-2 /70 hover:bg-white/15 hover:text-white transition cursor-pointer"
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 {/* Modal Body */}
 <div className="relative z-10 p-5 space-y-4">
 {/* Warning jika capture belum aktif */}
 {!captureActive && (
 <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 p-3.5 text-xs font-semibold text-amber-800 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300">
 <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
 <span>Kamera aktif untuk preview, namun <b>scan belum dapat diproses</b>. Klik tombol <b>"Mulai Capture"</b> terlebih dahulu agar data presensi dapat disimpan.</span>
 </div>
 )}

 {/* Square QR Code Viewfinder — Sized for Student ID Card */}
 <div className="relative mx-auto aspect-square w-full max-w-[310px] overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-950 shadow-2xl shadow-sm dark:border-emerald-800/60">
 <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

 {/* Vignette + Square Reticle Overlay */}
 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
 {/* Square QR Reticle — 210px mobile / 230px desktop */}
 <div className="relative z-10 h-52 w-52 sm:h-56 sm:w-56 rounded-xl border border-emerald-200/90 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.52)] overflow-hidden">
 {/* 4 Precision L-Shaped Corner Markers */}
 <span className="absolute top-0 left-0 h-6 w-6 border-t-[3.5px] border-l-[3.5px] border-slate-400 rounded-tl-xl shadow-[0_0_8px_#10b981]" />
 <span className="absolute top-0 right-0 h-6 w-6 border-t-[3.5px] border-r-[3.5px] border-slate-400 rounded-tr-xl shadow-[0_0_8px_#10b981]" />
 <span className="absolute bottom-0 left-0 h-6 w-6 border-b-[3.5px] border-l-[3.5px] border-slate-400 rounded-bl-xl shadow-[0_0_8px_#10b981]" />
 <span className="absolute bottom-0 right-0 h-6 w-6 border-b-[3.5px] border-r-[3.5px] border-slate-400 rounded-br-xl shadow-[0_0_8px_#10b981]" />

 {/* Animated Laser Scanning Beam (framer-motion) */}
 {cameraActive && (
 <>
 {/* Sweeping Soft Glow Beam */}
 <motion.div
 animate={{ top: ['-20%', '85%', '-20%'] }}
 transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
 className="absolute inset-x-0 h-14 bg-white dark:bg-[#1B2433] pointer-events-none z-10"
 />
 {/* Sharp Laser Line */}
 <motion.div
 animate={{ top: ['4%', '94%', '4%'] }}
 transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
 className="absolute inset-x-1 h-1 bg-white dark:bg-[#1B2433] shadow-[0_0_16px_#10b981,0_0_24px_#34d399] z-20 pointer-events-none"
 />
 </>
 )}

 {/* Dynamic Badge: Ready / Cooldown / Flash State */}
 <div className="absolute -bottom-9 inset-x-0 flex justify-center pointer-events-none">
 {scanCooldown ? (
 <span className={`backdrop-blur-md px-3 py-0.5 text-[10px] font-black rounded-full border whitespace-nowrap shadow-xl flex items-center gap-1.5 ${
 viewfinderFlash === 'success'
 ? 'bg-emerald-600/90 text-white border-slate-400/60'
 : viewfinderFlash === 'duplicate'
 ? 'bg-sky-700/90 text-white border-sky-400/60'
 : viewfinderFlash === 'error'
 ? 'bg-rose-600/90 text-white border-rose-400/60'
 : 'bg-slate-950/90 text-emerald-300 border-slate-500/40'
 }`}>
 {viewfinderFlash === 'success' && '✓ Tersimpan — siap scan berikutnya'}
 {viewfinderFlash === 'duplicate' && '⚠ Sudah tercatat — cooldown...'}
 {viewfinderFlash === 'error' && '✗ Gagal — cooldown...'}
 {!viewfinderFlash && 'Memproses...'}
 </span>
 ) : (
 <span className="bg-slate-950/90 backdrop-blur-md px-3 py-0.5 text-[10px] font-black text-emerald-300 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 whitespace-nowrap shadow-xl flex items-center gap-1.5">
 <span className="relative flex h-1.5 w-1.5">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
 </span>
 Posisikan QR Code di Dalam Kotak
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Camera Loading Overlay */}
 {cameraLoading && (
 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/85 text-white gap-2.5">
 <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
 <p className="text-xs font-bold text-slate-200">Menghubungkan ke kamera...</p>
 </div>
 )}

 {/* In-Viewfinder Flash Overlay: muncul saat QR berhasil/gagal di-scan */}
 <AnimatePresence>
 {viewfinderFlash && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.25 }}
 className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 pointer-events-none ${
 viewfinderFlash === 'success'
 ? 'bg-emerald-500/25'
 : viewfinderFlash === 'duplicate'
 ? 'bg-sky-500/25'
 : 'bg-rose-500/25'
 }`}
 >
 <motion.div
 initial={{ scale: 0.5, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ type: 'spring', stiffness: 500, damping: 25 }}
 className={`flex h-16 w-16 items-center justify-center rounded-full shadow-2xl ${
 viewfinderFlash === 'success'
 ? 'bg-emerald-500 shadow-sm'
 : viewfinderFlash === 'duplicate'
 ? 'bg-sky-500 text-white shadow-sky-500/50'
 : 'bg-rose-500 text-white shadow-sm'
 }`}
 >
 {viewfinderFlash === 'success' && <CheckCircle2 className="h-8 w-8" />}
 {viewfinderFlash === 'duplicate' && <XCircle className="h-8 w-8" />}
 {viewfinderFlash === 'error' && <XCircle className="h-8 w-8" />}
 </motion.div>
 <span className={`rounded-full px-4 py-1 text-xs font-extrabold backdrop-blur-md ${
 viewfinderFlash === 'success'
 ? 'bg-emerald-900/80 text-emerald-100'
 : viewfinderFlash === 'duplicate'
 ? 'bg-sky-900/80 text-sky-100'
 : 'bg-rose-900/80 text-rose-100'
 }`}>
 {viewfinderFlash === 'success' && 'Presensi Tersimpan ✓'}
 {viewfinderFlash === 'duplicate' && 'Sudah Tercatat'}
 {viewfinderFlash === 'error' && 'Scan Ditolak'}
 </span>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Camera Error Panel */}
 {cameraError && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/90 p-4 text-xs dark:border-emerald-800/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 space-y-2.5">
 <div className="flex items-start gap-2.5">
 <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
 <div className="space-y-1">
 <p className="font-extrabold text-sm text-rose-900 dark:text-rose-100">Kamera Tidak Dapat Diakses</p>
 <p className="leading-relaxed">{cameraError}</p>
 </div>
 </div>
 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2">
 <span className="text-xs text-rose-700 dark:text-rose-300">
 Klik ikon 🔒 di address bar → set Camera ke <b>Allow</b> → Refresh.
 </span>
 <button
 type="button"
 onClick={startCamera}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition cursor-pointer text-xs shrink-0"
 >
 <RefreshCw className="h-3.5 w-3.5" /> Coba Lagi
 </button>
 </div>
 </div>
 )}

 {/* Manual Input / USB Scanner Form */}
 <form onSubmit={handleModalSubmit} className="space-y-2 pt-1">
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
 Input Kode / NISN Kartu
 </label>
 <div className="flex gap-2">
 <input
 type="text"
 autoFocus
 value={modalInput}
 onChange={(e) => setModalInput(e.target.value)}
 disabled={disabled || !captureActive || busy}
 placeholder="Hasil scan QR / Ketik NISN siswa..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-700/80 dark:bg-slate-800 dark:text-white disabled:opacity-60"
 />
 <button
 type="submit"
 disabled={disabled || !captureActive || busy}
 className="rounded-lg bg-[#059669] hover:bg-[#047857] px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 whitespace-nowrap border border-[#059669] h-9 text-sm rounded-xl cursor-pointer"
 >
 Proses Scan
 </button>
 </div>
 </form>
 </div>

 {/* Footer */}
 <div className="relative z-10 flex items-center justify-between border-t border-emerald-100/80 bg-slate-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-800/40">
 <button
 type="button"
 onClick={cameraActive ? stopCamera : startCamera}
 className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-50/40 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300 transition"
 >
 {cameraActive ? (
 <><CameraOff className="h-3.5 w-3.5 text-rose-500" /> Matikan Kamera</>
 ) : (
 <><Camera className="h-3.5 w-3.5 text-emerald-500" /> Nyalakan Ulang Kamera</>
 )}
 </button>
 <button
 type="button"
 onClick={closeCameraModal}
 className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-slate-300 dark:bg-emerald-950/40 dark:text-slate-200 transition"
 >
 Tutup
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}
