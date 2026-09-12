/**
 * Camera & WebRTC Helper for School Management ERP
 * Provides multi-tier fallback camera stream acquisition and detailed error diagnosis
 * tailored for macOS, Windows, Android, and iOS browsers.
 */

/**
 * Request camera media stream with progressive 3-tier fallback:
 * 1. Preferred facingMode with ideal resolution (environment for mobile back camera)
 * 2. User-facing camera (MacBook / Laptop FaceTime HD Camera)
 * 3. Generic unconstrained video stream (any available OS video capture device)
 *
 * @param {Object} options
 * @param {string} options.preferredFacingMode - 'environment' or 'user'
 * @returns {Promise<MediaStream>}
 */
export async function requestCameraStream({ preferredFacingMode = 'environment' } = {}) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (!window.isSecureContext) {
      const err = new Error('Akses kamera WebRTC dinonaktifkan oleh browser pada konteks tidak aman (insecure context). Pastikan Anda membuka melalui http://localhost:5173 atau menggunakan HTTPS.')
      err.name = 'InsecureContextError'
      throw err
    }
    const err = new Error('Browser Anda tidak mendukung akses kamera WebRTC.')
    err.name = 'NotSupportedError'
    throw err
  }

  // Tier 1: Try preferred facingMode with ideal resolution
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: preferredFacingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
  } catch (errTier1) {
    console.warn('Tier 1 camera stream request failed, attempting Tier 2 (user/facetime):', errTier1.name)

    // If permission was explicitly denied, do not retry lower tiers as it will throw the same error
    if (errTier1.name === 'NotAllowedError' || errTier1.name === 'PermissionDeniedError') {
      throw errTier1
    }

    // Tier 2: Try front / laptop user camera
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
    } catch (errTier2) {
      console.warn('Tier 2 camera stream request failed, attempting Tier 3 (unconstrained video):', errTier2.name)

      if (errTier2.name === 'NotAllowedError' || errTier2.name === 'PermissionDeniedError') {
        throw errTier2
      }

      // Tier 3: Unconstrained generic video capture device
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
    }
  }
}

/**
 * Diagnoses and formats camera errors into user-friendly and actionable instructions.
 *
 * @param {Error|DOMException|Object} err
 * @returns {{ title: string, message: string, actionType: string, instructions: string[], isPermissionDenied: boolean }}
 */
export function parseCameraError(err) {
  const errorName = err?.name || ''
  const errorMessage = err?.message || ''

  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
    return {
      title: 'Izin Kamera Diblokir',
      message: 'Browser atau sistem operasi Anda menolak izin akses ke perangkat kamera.',
      actionType: 'permission',
      isPermissionDenied: true,
      instructions: [
        'Klik ikon kontrol situs / gembok di sebelah kiri URL browser (localhost:5173).',
        'Ubah setelan "Kamera" / "Camera" menjadi "Izinkan" / "Allow".',
        'Di macOS: Buka System Settings > Privacy & Security > Camera, pastikan centang Google Chrome / browser Anda aktif (ON).',
        'Setelah mengubah izin, klik tombol "Coba Nyalakan Ulang Kamera" atau muat ulang halaman.',
      ],
    }
  }

  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return {
      title: 'Perangkat Kamera Tidak Ditemukan',
      message: 'Tidak ada perangkat webcam atau kamera video yang terdeteksi pada perangkat ini.',
      actionType: 'device',
      isPermissionDenied: false,
      instructions: [
        'Pastikan webcam terpasang dengan benar pada port USB komputer/laptop Anda.',
        'Jika menggunakan laptop dengan penutup fisik kamera (privacy shutter), pastikan penutup dalam posisi terbuka.',
        'Anda juga dapat memasukkan nomor kartu/NIS secara manual pada kotak input di bawah.',
      ],
    }
  }

  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return {
      title: 'Kamera Sedang Digunakan Aplikasi Lain',
      message: 'Perangkat keras kamera sedang dikunci atau digunakan oleh aplikasi/tab lain.',
      actionType: 'busy',
      isPermissionDenied: false,
      instructions: [
        'Tutup aplikasi yang mungkin sedang mengakses kamera (Zoom, Microsoft Teams, FaceTime, Google Meet, OBS, atau Photo Booth).',
        'Periksa apakah ada tab browser lain yang sedang membuka pemindai kamera, lalu tutup tab tersebut.',
        'Klik tombol "Coba Nyalakan Ulang Kamera".',
      ],
    }
  }

  if (errorName === 'InsecureContextError') {
    return {
      title: 'Koneksi Tidak Aman (Insecure Context)',
      message: 'Fitur kamera browser memerlukan enkripsi HTTPS atau domain localhost.',
      actionType: 'security',
      isPermissionDenied: false,
      instructions: [
        'Buka aplikasi melalui alamat "http://localhost:5173" bukan melalui alamat IP lokal (192.168.x.x).',
        'Jika mengakses dari jaringan lokal / HP, aktifkan sertifikat HTTPS pada web server.',
      ],
    }
  }

  if (errorName === 'OverconstrainedError') {
    return {
      title: 'Format Kamera Tidak Didukung',
      message: 'Pengaturan resolusi atau jenis kamera tidak didukung oleh perangkat keras webcam Anda.',
      actionType: 'device',
      isPermissionDenied: false,
      instructions: [
        'Perangkat webcam tidak mendukung spesifikasi resolusi yang diminta.',
        'Coba klik tombol "Coba Nyalakan Ulang Kamera" untuk beralih ke format standar.',
      ],
    }
  }

  return {
    title: 'Kamera Tidak Dapat Diakses',
    message: errorMessage || 'Terjadi kendala saat membuka stream video kamera.',
    actionType: 'unknown',
    isPermissionDenied: false,
    instructions: [
      'Periksa apakah kamera terpasang dan izin browser telah diberikan.',
      'Klik tombol "Coba Nyalakan Ulang Kamera" atau gunakan input nomor kartu secara manual.',
    ],
  }
}

/**
 * Checks whether native BarcodeDetector API is supported in current browser.
 * @returns {boolean}
 */
export function isBarcodeDetectorSupported() {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window
}
