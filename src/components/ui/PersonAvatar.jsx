import { useEffect, useMemo, useState } from 'react'
import { UserRound } from 'lucide-react'

const sizeClassMap = {
 xs: 'h-7 w-7 text-xs',
 sm: 'h-8 w-8 text-xs',
 table: 'h-9 w-9 text-xs',
 card: 'h-14 w-14 text-base',
 detail: 'h-16 w-16 text-lg',
 profile: 'h-32 w-32 text-2xl',
}

function getInitials(name) {
 if (!name) return 'U'

 const parts = String(name).trim().split(/\s+/).filter(Boolean)
 if (parts.length === 0) return 'U'
 if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

 return (parts[0][0] + parts[1][0]).toUpperCase()
}

function getFallbackTone(name) {
 const safeName = String(name || 'User')
 const code = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
 const tones = [
 'from-emerald-600 to-emerald-500',
 'from-sky-600 to-sky-500',
 'from-violet-600 to-violet-500',
 'from-amber-600 to-amber-500',
 'from-rose-600 to-rose-500',
 'from-cyan-600 to-cyan-500',
 ]

 return tones[code % tones.length]
}

/**
 * Resolves avatar/photo URL robustly from any employee or user object or string path.
 */
export function resolveAvatarUrl(src) {
 if (!src) return null

 let raw = src
 if (typeof src === 'object') {
 raw =
 src.photo_url ||
 src.avatar_url ||
 src.user?.photo_url ||
 src.user?.avatar_url ||
 src.foto ||
 src.foto_path ||
 src.photo ||
 src.avatar ||
 src.foto_url ||
 src.user?.foto ||
 src.user?.photo ||
 src.user?.avatar ||
 src.metadata?.photo_url ||
 src.metadata?.avatar_url ||
 src.metadata?.foto ||
 src.metadata?.photo ||
 src.metadata?.avatar ||
 src.metadata?.foto_url ||
 src.user?.metadata?.photo_url ||
 src.user?.metadata?.avatar_url ||
 src.user?.metadata?.foto ||
 src.user?.metadata?.photo ||
 src.user?.metadata?.avatar ||
 src.user?.metadata?.avatar_url ||
 src.raw?.photo_url ||
 src.raw?.avatar_url ||
 src.raw?.foto ||
 ''
 }

 if (!raw || typeof raw !== 'string') return null
 const trimmed = raw.trim()
 if (!trimmed) return null

 if (trimmed.includes('data:image/')) {
 const idx = trimmed.indexOf('data:image/')
 return trimmed.slice(idx)
 }
 if (trimmed.startsWith('data:')) return trimmed

 const envApiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location?.origin ? `${window.location.origin}/api` : 'http://localhost:8000/api')
 let backendOrigin = envApiBase.replace(/\/api\/?$/, '')

 if (typeof window !== 'undefined' && window.location) {
 const currentHost = window.location.hostname || 'localhost'
 if (backendOrigin.includes('localhost')) {
 backendOrigin = backendOrigin.replace('localhost', currentHost)
 } else if (backendOrigin.includes('127.0.0.1')) {
 backendOrigin = backendOrigin.replace('127.0.0.1', currentHost)
 }
 }

 let url = trimmed
 if (/^https?:\/\//i.test(url)) {
 if (typeof window !== 'undefined' && window.location) {
 const currentHost = window.location.hostname || 'localhost'
 if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/storage\/|\/app\/|\/uploads\/)/i.test(url)) {
 url = url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, backendOrigin)
 }
 }
 return url
 }

 const cleanPath = url.startsWith('/') ? url : `/${url}`
 if (cleanPath.startsWith('/storage/')) {
 return `${backendOrigin}${cleanPath}`
 }
 return `${backendOrigin}/storage${cleanPath}`
}

export default function PersonAvatar({
 src,
 name,
 size = 'table',
 shape = 'circle',
 className = '',
 alt,
 showPreview = false,
}) {
 const [imageFailed, setImageFailed] = useState(false)

 useEffect(() => {
 setImageFailed(false)
 }, [src])

 const resolvedSrc = useMemo(() => resolveAvatarUrl(src), [src])

 const isCircle = shape === 'circle'
 const wrapperClass = [
 'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-emerald-200/80 bg-white dark:bg-[#1B2433] shadow-sm',
 isCircle ? 'rounded-full' : 'rounded-xl',
 sizeClassMap[size] || sizeClassMap.table,
 className,
 ].filter(Boolean).join(' ')

 const fallbackClass = [
 'flex h-full w-full items-center justify-center bg-white dark:bg-[#1B2433]',
 getFallbackTone(name),
 'font-bold uppercase tracking-wide',
 ].filter(Boolean).join(' ')

 if (!resolvedSrc || imageFailed) {
 return (
 <span className={wrapperClass} title={name}>
 {resolvedSrc && imageFailed ? (
 <UserRound className="h-1/2 w-1/2 text-white/90" />
 ) : (
 <span className={fallbackClass}>{getInitials(name)}</span>
 )}
 </span>
 )
 }

 return (
 <span className={wrapperClass} title={name}>
 <img
 src={resolvedSrc}
 alt={alt || name || 'Avatar'}
 loading="eager"
 className="h-full w-full object-cover"
 onError={() => setImageFailed(true)}
 />
 {showPreview && (
 <span className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 transition hover:opacity-100">
 <UserRound className="h-5 w-5 text-white" />
 </span>
 )}
 </span>
 )
}
