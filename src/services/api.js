import axios from 'axios'
import { clearAuthArtifacts, checkSessionValidity } from '../stores/authStore'
import { useSimulationClockStore } from '../stores/simulationClockStore'
import { showToast } from '../components/app/ToastProvider'

// Throttle notifikasi error jaringan / server agar tidak spam saat multiple fetch gagal bersamaan
let lastErrorToastTime = 0
let lastErrorTitle = ''
let hasReportedServerIssue = false

const notifyServerIssueThrottled = (payload) => {
  const now = Date.now()
  if (now - lastErrorToastTime > 4000 || lastErrorTitle !== payload.title) {
    lastErrorToastTime = now
    lastErrorTitle = payload.title
    showToast(payload)
  }
}

const dispatchServerStatus = (status, message) => {
  if (typeof window !== 'undefined') {
    hasReportedServerIssue = status !== 'healthy'
    window.dispatchEvent(new CustomEvent('app-server-status', { detail: { status, message } }))
  }
}

export const resolveApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured && typeof configured === 'string' && configured.trim()) {
    let base = configured.trim().replace(/\/+$/, '')
    if (base.endsWith('/api/v1')) {
      base = base.replace(/\/api\/v1$/, '/api')
    } else if (base.endsWith('/v1')) {
      base = base.replace(/\/v1$/, '')
    }
    return base
  }

  if (typeof window !== 'undefined' && window.location) {
    // Pada mode Vite dev (:5173), hubungkan ke host yang sama di port backend :8000 (mendukung localhost dan IP LAN)
    if (window.location.port === '5173') {
      return `${window.location.protocol}//${window.location.hostname}:8000/api`
    }
    // Pada production satu domain (reverse proxy / Nginx)
    return `${window.location.origin}/api`
  }

  return (typeof window !== 'undefined' && window.location?.origin)
    ? `${window.location.origin}/api`
    : 'http://localhost:8000/api'
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }
  }

  const explicitAuth = config.headers?.Authorization || config.headers?.authorization
  const token = localStorage.getItem('school_erp_token') || sessionStorage.getItem('school_erp_token')
  const url = config.url || ''

  if (!explicitAuth && token && typeof token === 'string') {
    // Only check validity for protected endpoints (avoid infinite loop on login)
    if (!url.includes('/login') && !url.includes('/auth/')) {
      const validity = checkSessionValidity({ token })
      if (!validity.valid && !token.startsWith('dev-test-token')) {
        clearAuthArtifacts()
        window.dispatchEvent(new Event('auth-session-cleared'))
        if (window.location.pathname !== '/masuk') {
          const reason = validity.reason || 'expired'
          window.location.href = `/masuk?reason=${reason}`
        }
        return Promise.reject(new axios.Cancel('Sesi tidak valid atau telah berakhir.'))
      }
    }
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    useSimulationClockStore.getState().syncFromHeaders(response?.headers)
    if (hasReportedServerIssue) {
      dispatchServerStatus('healthy', 'Koneksi kembali normal.')
    }
    return response
  },
  (error) => {
    const status = error?.response?.status
    const config = error?.config || {}
    const isLoginEndpoint = typeof config.url === 'string' && (config.url.includes('/login') || config.url.includes('/auth/'))
    const isBackgroundPoll = typeof config.url === 'string' && config.url.includes('/notifications/unread-count')
    const shouldSuppressGlobalToast = Boolean(config.skipGlobalErrorToast || isLoginEndpoint || isBackgroundPoll)

    // 1. Tangani 401 Unauthorized (Sesi Kedaluwarsa)
    if (status === 401) {
      const token = localStorage.getItem('school_erp_token') || sessionStorage.getItem('school_erp_token')
      if (token && typeof token === 'string' && token.startsWith('dev-test-token')) {
        return Promise.reject(error)
      }
      clearAuthArtifacts()
      window.dispatchEvent(new Event('auth-session-cleared'))

      if (window.location.pathname !== '/masuk') {
        window.location.href = '/masuk?reason=expired'
      }
      return Promise.reject(error)
    }

    // 2. Tangani Koneksi Jaringan Terputus / Server Backend Mati
    const isNetworkError = !error?.response || error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED'
    if (isNetworkError) {
      const isClientOffline = typeof navigator !== 'undefined' && !navigator.onLine
      const friendlyTitle = isClientOffline ? 'Koneksi Internet Terputus' : 'Server Tidak Terjangkau'
      const friendlyDesc = isClientOffline
        ? 'Perangkat Anda sedang tidak terhubung ke jaringan internet. Periksa koneksi Wi-Fi atau data Anda.'
        : 'Tidak dapat terhubung ke server backend. Pastikan layanan backend aktif dan dapat diakses.'

      if (!error.response) {
        error.response = {
          status: 0,
          data: {
            status: 'error',
            code: isClientOffline ? 'CLIENT_OFFLINE' : 'SERVER_UNREACHABLE',
            message: friendlyDesc,
          },
        }
      } else if (error.response.data) {
        error.response.data.message = friendlyDesc
      }

      if (!shouldSuppressGlobalToast) {
        notifyServerIssueThrottled({
          title: friendlyTitle,
          description: friendlyDesc,
          type: 'error',
          action: {
            label: 'Coba Lagi',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            },
          },
        })
      }

      dispatchServerStatus(isClientOffline ? 'offline' : 'server_error', friendlyDesc)

      return Promise.reject(error)
    }

    // 3. Tangani Gangguan Basis Data (503 atau code DATABASE_CONNECTION_ERROR)
    const isDbError =
      status === 503 ||
      error?.response?.data?.code === 'DATABASE_CONNECTION_ERROR' ||
      (typeof error?.response?.data?.message === 'string' &&
        (error.response.data.message.includes('SQLSTATE') ||
          error.response.data.message.includes('PDOException') ||
          error.response.data.message.includes('could not connect to server') ||
          error.response.data.message.includes('Connection refused')))

    if (isDbError) {
      const friendlyTitle = 'Gangguan Basis Data'
      const friendlyDesc = 'Layanan database sedang tidak dapat dijangkau. Mohon hubungi administrator sistem.'

      if (error?.response?.data) {
        error.response.data.code = 'DATABASE_CONNECTION_ERROR'
        error.response.data.message = friendlyDesc
      }

      if (!shouldSuppressGlobalToast) {
        notifyServerIssueThrottled({
          title: friendlyTitle,
          description: friendlyDesc,
          type: 'error',
          action: {
            label: 'Coba Lagi',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            },
          },
        })
      }

      dispatchServerStatus('db_error', friendlyDesc)

      return Promise.reject(error)
    }

    // 4. Tangani Gateway Timeout / Server Error (502 / 504 / 500)
    if (status === 502 || status === 504) {
      const friendlyTitle = 'Server Tidak Merespons'
      const friendlyDesc = 'Server backend membutuhkan waktu terlalu lama untuk merespons (Gateway Timeout). Silakan coba lagi.'

      if (error?.response?.data) {
        error.response.data.message = friendlyDesc
      }

      if (!shouldSuppressGlobalToast) {
        notifyServerIssueThrottled({
          title: friendlyTitle,
          description: friendlyDesc,
          type: 'error',
          action: {
            label: 'Coba Lagi',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            },
          },
        })
      }

      return Promise.reject(error)
    }

    // Sanitasi Global Anti-SQL/PHP Stack Trace Leak
    const TECHNICAL_ERROR_REGEX = /(?:SQLSTATE|PDOException|Undefined column|syntax error|at \/|Stack trace|QueryException|column .* does not exist|relation .* does not exist|violates foreign key|duplicate key)/i

    if (error?.response?.data?.message && typeof error.response.data.message === 'string') {
      if (TECHNICAL_ERROR_REGEX.test(error.response.data.message)) {
        error.response.data.message = 'Terjadi kendala internal pada server. Silakan coba beberapa saat lagi.'
      }
    }

    if (status === 500) {
      const rawMsg = error?.response?.data?.message || ''
      const isTechnical = TECHNICAL_ERROR_REGEX.test(rawMsg)
      const friendlyTitle = 'Kesalahan Server Internal'
      const friendlyDesc =
        !rawMsg || rawMsg === 'Server Error' || isTechnical
          ? 'Terjadi kendala pemrosesan internal pada server. Silakan coba beberapa saat lagi.'
          : rawMsg

      if (error?.response?.data) {
        error.response.data.message = friendlyDesc
      }

      if (!shouldSuppressGlobalToast) {
        notifyServerIssueThrottled({
          title: friendlyTitle,
          description: friendlyDesc,
          type: 'error',
          action: {
            label: 'Coba Lagi',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            },
          },
        })
      }

      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api

