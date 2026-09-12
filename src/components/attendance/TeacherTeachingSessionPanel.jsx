import { useEffect, useRef, useState } from 'react'
import { Camera, Clock3, Play, QrCode, Radio, RefreshCw, Square, XCircle, ChevronRight } from 'lucide-react'
import { AppBadge, AppButton, AppCard, AppModal } from '../app'
import { teacherTeachingService } from '../../services/teacherTeachingService'
import { requestCameraStream, parseCameraError, isBarcodeDetectorSupported } from '../../utils/cameraHelper'

const statusVariant = {
  hadir: 'success',
  terlambat: 'warning',
  ready: 'info',
  active: 'success',
  completed: 'neutral',
  belum_presensi: 'neutral',
}

const statusLabel = {
  hadir: 'Hadir',
  terlambat: 'Terlambat',
  ready: 'Siap Mengajar',
  active: 'Sedang Mengajar',
  completed: 'Selesai Mengajar',
  belum_presensi: 'Belum Presensi',
}

function getDeviceId() {
  const key = 'simsit.teacher.presence.device_id'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const created = window.crypto?.randomUUID?.() || `browser-${Date.now()}`
  window.localStorage.setItem(key, created)
  return created
}

export default function TeacherTeachingSessionPanel({ onNotify, isModal = false }) {
  const [schedules, setSchedules] = useState([])
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [attendance, setAttendance] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [cameraErrorInfo, setCameraErrorInfo] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const detectorRef = useRef(null)
  const scanTimerRef = useRef(null)
  const processingRef = useRef(false)

  const selectedSchedule = schedules.find((item) => item.id === selectedScheduleId) || schedules[0]

  const notify = (type, title, message) => onNotify?.(type, title, message)

  const loadSchedules = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await teacherTeachingService.schedules()
      const nextSchedules = data.schedules || []
      setSchedules(nextSchedules)
      setSelectedScheduleId((current) => nextSchedules.some((item) => item.id === current) ? current : (nextSchedules[0]?.id || ''))
      const current = nextSchedules.find((item) => item.id === selectedScheduleId) || nextSchedules[0]
      setAttendance(current?.attendance || null)
      setSession(current?.session || null)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Jadwal mengajar Step 04 belum dapat dimuat.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedules()
    const deviceId = getDeviceId()
    const sendHeartbeat = () => {
      if (document.visibilityState === 'hidden') return
      teacherTeachingService.heartbeat(deviceId, 'Browser Portal Guru').catch(() => {})
    }
    sendHeartbeat()
    const heartbeatTimer = window.setInterval(sendHeartbeat, 20000)
    return () => window.clearInterval(heartbeatTimer)
  }, [])

  useEffect(() => {
    const current = schedules.find((item) => item.id === selectedScheduleId)
    setAttendance(current?.attendance || null)
    setSession(current?.session || null)
  }, [selectedScheduleId, schedules])

  useEffect(() => {
    let timer
    if (session?.teaching_session_status === 'active') {
      const startTime = session?.start_time ? new Date(session.start_time).getTime() : Date.now()
      const updateTimer = () => {
        const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000))
        setElapsedSeconds(diff)
      }
      updateTimer()
      timer = window.setInterval(updateTimer, 1000)
    } else {
      setElapsedSeconds(0)
    }
    return () => window.clearInterval(timer)
  }, [session])

  const formatElapsed = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0')
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`
  }

  useEffect(() => () => stopCamera(), [])

  const stopCamera = () => {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current)
    scanTimerRef.current = null
    detectorRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }

  const closeScanner = () => {
    stopCamera()
    setCameraErrorInfo(null)
    setCameraError('')
    setShowScanner(false)
  }

  const submitCard = async (value = qrToken) => {
    const token = String(value || '').trim()
    if (!selectedSchedule?.id || !token || processingRef.current) return
    processingRef.current = true
    setProcessing(true)
    setError('')
    try {
      const result = await teacherTeachingService.scanCard({ schedule_id: selectedSchedule.id, qr_token: token })
      setAttendance(result?.attendance || null)
      setSession(result?.session || null)
      setQrToken('')
      notify('success', 'Presensi Berhasil', `Guru berhasil diabsen (${result?.attendance?.status || 'hadir'}).`)
      closeScanner()
    } catch (scanError) {
      const message = scanError?.response?.data?.message || scanError?.message || 'Gagal mengenali kartu pengajar.'
      setError(message)
      notify('error', 'Scan Ditolak', message)
    } finally {
      processingRef.current = false
      setProcessing(false)
    }
  }

  const startCamera = async () => {
    setCameraError('')
    setCameraErrorInfo(null)
    try {
      const stream = await requestCameraStream({ preferredFacingMode: 'environment' })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
      if (!isBarcodeDetectorSupported()) {
        setCameraErrorInfo({
          title: 'Pemindaian Otomatis QR Belum Aktif',
          message: 'Browser ini belum mendukung BarcodeDetector API. Stream kamera tetap aktif.',
          actionType: 'notice',
          instructions: [
            'Gunakan peramban Google Chrome atau Microsoft Edge terbaru untuk pemindaian QR otomatis.',
            'Atau masukkan token kartu secara manual pada formulir.',
          ],
        })
        return
      }
      detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || processingRef.current) return
        try {
          const codes = await detectorRef.current.detect(videoRef.current)
          const value = codes[0]?.rawValue
          if (value) await submitCard(value)
        } catch {
          // Frame tanpa QR valid diabaikan sampai pemindaian berikutnya.
        }
      }, 500)
    } catch (cameraRequestError) {
      stopCamera()
      const parsed = parseCameraError(cameraRequestError)
      setCameraErrorInfo(parsed)
      setCameraError(parsed.message)
    }
  }

  const openScanner = () => {
    setShowScanner(true)
    window.setTimeout(startCamera, 100)
  }

  const startTeaching = async () => {
    if (!session?.id || processing) return
    setProcessing(true)
    try {
      const nextSession = await teacherTeachingService.startSession(session.id)
      setSession(nextSession)
      notify('success', 'Sesi Dimulai', 'Status mengajar sekarang aktif.')
    } catch (requestError) {
      notify('error', 'Sesi Belum Dimulai', requestError.response?.data?.message || 'Sesi mengajar tidak dapat dimulai.')
    } finally {
      setProcessing(false)
    }
  }

  const closeTeaching = async () => {
    if (!session?.id || processing) return
    setProcessing(true)
    try {
      const nextSession = await teacherTeachingService.closeSession(session.id)
      setSession(nextSession)
      notify('success', 'Sesi Selesai', 'Sesi mengajar ditutup pada server.')
      setShowCompleteModal(false)
    } catch (requestError) {
      notify('error', 'Sesi Belum Ditutup', requestError.response?.data?.message || 'Sesi mengajar tidak dapat ditutup.')
    } finally {
      setProcessing(false)
    }
  }

  const attendanceStatus = attendance?.status || 'belum_presensi'
  const teachingStatus = session?.teaching_session_status || 'belum_presensi'

  const panelBody = (
    <>
      {error && <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"><XCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {loading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" aria-label="Memuat presensi mengajar" />
      ) : schedules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700">Belum ada jadwal mengajar aktif pada hari ini.</div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {schedules.map((schedule) => (
              <button
                type="button"
                key={schedule.id}
                onClick={() => setSelectedScheduleId(schedule.id)}
                className={`rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/20 ${selectedSchedule?.id === schedule.id ? 'border-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30' : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900/40'}`}
              >
                <div className="flex items-start justify-between gap-2"><span className="text-xs font-bold text-slate-900 dark:text-white">{schedule.subject?.name || schedule.subject?.nama_mapel || 'Mata Pelajaran'}</span><AppBadge dot variant={statusVariant[schedule.session?.teaching_session_status || schedule.attendance?.status || 'belum_presensi'] || 'neutral'}>{statusLabel[schedule.session?.teaching_session_status || schedule.attendance?.status || 'belum_presensi'] || 'Belum Presensi'}</AppBadge></div>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">{schedule.class?.nama_kelas || schedule.class?.kode_kelas || 'Rombel'} · {schedule.time_start?.slice(0, 5)}–{schedule.time_end?.slice(0, 5)}</p>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Jadwal Terpilih</p>
              <h3 className="mt-1 truncate text-base font-extrabold text-slate-900 dark:text-white">{selectedSchedule?.subject?.name || selectedSchedule?.subject?.nama_mapel || 'Mata Pelajaran'}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{selectedSchedule?.class?.nama_kelas || selectedSchedule?.class?.kode_kelas || 'Rombel'} · {selectedSchedule?.time_start?.slice(0, 5)}–{selectedSchedule?.time_end?.slice(0, 5)}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <AppBadge dot variant={statusVariant[attendanceStatus] || 'neutral'}>{statusLabel[attendanceStatus] || attendanceStatus}</AppBadge>
              <AppBadge dot variant={statusVariant[teachingStatus] || 'neutral'}>{statusLabel[teachingStatus] || teachingStatus}</AppBadge>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">QR token kartu guru / scanner USB</span>
              <input
                value={qrToken}
                onChange={(event) => setQrToken(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); submitCard() } }}
                autoComplete="off"
                placeholder="Scan QR kartu guru atau tempel token opaque"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>
          </div>

          {/* SOFT PASTEL SQUIRCLE ACTION BUTTONS WITH FLOATING HOVER TOOLTIPS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Tombol Mulai Sesi Mengajar (Membuka Kamera Scan ID Card) */}
            {teachingStatus !== 'active' ? (
              <div className="relative group flex items-center gap-2">
                <button
                  type="button"
                  onClick={openScanner}
                  disabled={processing}
                  className="w-12 h-12 rounded-[16px] bg-purple-100/90 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 shadow-sm hover:scale-105 hover:bg-purple-200/90 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                  aria-label="Scan ID Card & Mulai Sesi Mengajar"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Mulai Sesi Mengajar</span>
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                  Scan ID Card & Mulai Sesi Mengajar
                </div>
              </div>
            ) : (
              <div className="relative group flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(true)}
                  disabled={processing}
                  className="w-12 h-12 rounded-[16px] bg-rose-100/90 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 shadow-sm hover:scale-105 hover:bg-rose-200/90 active:scale-95 transition-all flex items-center justify-center"
                  aria-label="Akhiri Sesi Mengajar"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Selesai Mengajar ({formatElapsed(elapsedSeconds)})</span>
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg z-20">
                  Akhiri / Selesai Sesi Mengajar
                </div>
              </div>
            )}

            {/* Realtime Attendance Timestamps */}
            {attendance?.check_in_at && (
              <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                <Clock3 className="w-4 h-4 text-emerald-600" />
                <span>Presensi Masuk: <strong>{new Date(attendance.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong></span>
              </div>
            )}
            {teachingStatus === 'active' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800 animate-pulse">
                <Radio className="w-4 h-4" />
                <span>Sesi Belajar Realtime Aktif • {formatElapsed(elapsedSeconds)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAMERA SCANNER MODAL WITH ID CARD QR CODE GUIDE FRAME */}
      <AppModal isOpen={showScanner} onClose={closeScanner} title="Scan QR Kartu Guru" description="Posisikan QR code pada ID card pegawai/guru di dalam bingkai" icon={Camera} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            
            {/* Target Viewfinder Overlay Tailored to Teacher ID Card QR Code Size */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-500 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                {/* Corner Brackets */}
                <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                {/* Laser Beam */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-pulse absolute top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white flex items-center gap-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Kamera Realtime Active</span>
            </div>

            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-xs font-semibold text-slate-300 bg-slate-950/80">
                Kamera sedang dipersiapkan...
              </div>
            )}
          </div>

          {cameraErrorInfo ? (
            <div className={`rounded-2xl border p-4 text-xs ${
              cameraErrorInfo.actionType === 'notice'
                ? 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200'
                : 'border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                  cameraErrorInfo.actionType === 'notice'
                    ? 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                    : 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                }`}>
                  !
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-extrabold text-xs">{cameraErrorInfo.title}</p>
                  <p className="text-[11px] leading-relaxed opacity-90">{cameraErrorInfo.message}</p>
                  {cameraErrorInfo.instructions?.length > 0 && (
                    <div className="mt-2 space-y-1 rounded-xl bg-white/70 p-2 text-[10px] font-medium dark:bg-black/20">
                      <p className="font-bold uppercase tracking-wider text-[9px] opacity-75">Panduan Penyelesaian:</p>
                      <ol className="list-decimal pl-3 space-y-0.5">
                        {cameraErrorInfo.instructions.map((step, idx) => (
                          <li key={idx} className="leading-normal">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {cameraErrorInfo.actionType !== 'notice' && (
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-emerald-700 transition"
                      >
                        <RefreshCw className="h-3 w-3" /> Coba Nyalakan Ulang
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : cameraError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              {cameraError}
            </div>
          ) : null}
        </div>
      </AppModal>

      {/* Modal Konfirmasi Selesai Mengajar */}
      <AppModal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="Selesai Sesi Mengajar" description="Konfirmasi penutupan sesi mengajar di kelas ini." icon={Square} maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detail Sesi Mengajar</p>
            <h4 className="mt-1 font-extrabold text-sm text-slate-900 dark:text-white">
              {selectedSchedule?.subject?.name || selectedSchedule?.subject?.nama_mapel || 'Mata Pelajaran'}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              {selectedSchedule?.class?.nama_kelas || selectedSchedule?.class?.kode_kelas || 'Rombel'} · {selectedSchedule?.time_start?.slice(0, 5)}–{selectedSchedule?.time_end?.slice(0, 5)} WIB
            </p>
            {teachingStatus === 'active' && (
              <p className="mt-1 text-xs font-bold text-emerald-600">
                Durasi Mengajar: {formatElapsed(elapsedSeconds)}
              </p>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Apakah Anda yakin ingin menyelesaikan sesi mengajar ini? Kehadiran mengajar akan ditutup dan diselesaikan pada server.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <AppButton variant="outline" onClick={() => setShowCompleteModal(false)}>
              Batal
            </AppButton>
            <AppButton variant="danger" icon={Square} onClick={closeTeaching} loading={processing}>
              Ya, Selesai Mengajar
            </AppButton>
          </div>
        </div>
      </AppModal>
    </>
  )

  if (isModal) {
    return panelBody
  }

  return (
    <AppCard
      id="teacher-step04-panel"
      icon={QrCode}
      title="Presensi Mengajar Step 04"
      description="QR kartu guru mengidentifikasi guru; server tetap memvalidasi jadwal dan konteks akademik."
      actions={<AppButton variant="ghost" size="sm" icon={RefreshCw} onClick={loadSchedules} loading={loading} tooltip="Muat ulang jadwal" />}
    >
      {panelBody}
    </AppCard>
  )
}
