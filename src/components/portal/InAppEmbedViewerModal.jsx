import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 X,
 Maximize2,
 Minimize2,
 RotateCw,
 FileText,
 Video,
 Music,
 Image as ImageIcon,
 ExternalLink,
 ShieldCheck,
 Globe,
 Sparkles,
} from 'lucide-react'

export function parseEmbedResource(rawUrl) {
 if (!rawUrl) return { type: 'unknown', embedUrl: '', label: 'Tautan', icon: Globe, tone: 'emerald' }
 const cleanUrl = String(rawUrl).trim()

 // YouTube
 const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
 if (ytMatch && ytMatch[1]) {
 return {
 type: 'youtube',
 embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
 label: 'YouTube Video',
 icon: Video,
 tone: 'rose',
 }
 }

 // Google Drive & Docs Preview
 if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com')) {
 let previewUrl = cleanUrl
 if (previewUrl.includes('/view')) {
 previewUrl = previewUrl.replace(/\/view(\?.*)?$/, '/preview')
 } else if (previewUrl.includes('/edit')) {
 previewUrl = previewUrl.replace(/\/edit(\?.*)?$/, '/preview')
 } else if (!previewUrl.includes('/preview')) {
 previewUrl = previewUrl.includes('?') ? `${previewUrl}&embedded=true` : `${previewUrl}?embedded=true`
 }
 return {
 type: 'google_docs',
 embedUrl: previewUrl,
 label: 'Google Dokumen / Drive',
 icon: FileText,
 tone: 'blue',
 }
 }

 // Audio formats
 if (/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(cleanUrl)) {
 return {
 type: 'audio',
 embedUrl: cleanUrl,
 label: 'Audio Rekaman',
 icon: Music,
 tone: 'purple',
 }
 }

 // Video formats
 if (/\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(cleanUrl)) {
 return {
 type: 'video',
 embedUrl: cleanUrl,
 label: 'Video Berkas',
 icon: Video,
 tone: 'rose',
 }
 }

 // Image formats
 if (/\.(jpeg|jpg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(cleanUrl)) {
 return {
 type: 'image',
 embedUrl: cleanUrl,
 label: 'Gambar / Foto',
 icon: ImageIcon,
 tone: 'emerald',
 }
 }

 // PDF
 if (/\.pdf(\?.*)?$/i.test(cleanUrl)) {
 return {
 type: 'pdf',
 embedUrl: cleanUrl,
 label: 'Dokumen PDF',
 icon: FileText,
 tone: 'rose',
 }
 }

 // Generic web page
 return {
 type: 'iframe',
 embedUrl: cleanUrl,
 label: 'Tautan Berkas Web',
 icon: Globe,
 tone: 'emerald',
 }
}

export default function InAppEmbedViewerModal({
 isOpen,
 url,
 title = 'Pratinjau Berkas & Tautan',
 subtitle,
 onClose,
}) {
 const [isFullscreen, setIsFullscreen] = useState(false)
 const [reloadKey, setReloadKey] = useState(0)
 const [loading, setLoading] = useState(true)

 const resource = useMemo(() => parseEmbedResource(url), [url])
 const IconComponent = resource.icon || Globe

 if (!isOpen || !url) return null

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md">
 {/* Glow Ambient di Balik Modal (Hero UI Style) */}

 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 transition={{ type: 'spring', stiffness: 380, damping: 28 }}
 className={`relative flex flex-col overflow-hidden rounded-3xl border border-emerald-500/30 dark:border-emerald-700/60 bg-white/95 dark:bg-[#1B2433]/95 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl transition-all duration-200 ${
 isFullscreen ? 'w-[98vw] h-[96vh]' : 'w-full max-w-4xl h-[88vh]'
 }`}
 >
 {/* Top Accent Gradient Bar (Hero UI Style) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

 {/* Modal Header */}
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-3.5 sm:px-6">
 <div className="flex items-center gap-3 min-w-0">
 {/* Squircle Icon Badge */}
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <IconComponent className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-800 dark:text-white ">
 {title}
 </h3>
 <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Sparkles className="h-2.5 w-2.5" />
 {resource.label}
 </span>
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
 {subtitle || resource.embedUrl}
 </p>
 </div>
 </div>

 {/* Header Action Controls */}
 <div className="flex items-center gap-1.5 sm:gap-2">
 <button
 type="button"
 onClick={() => {
 setLoading(true)
 setReloadKey((k) => k + 1)
 }}
 title="Muat Ulang Pratinjau"
 className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-800 transition"
 >
 <RotateCw className="h-4 w-4" />
 </button>

 <button
 type="button"
 onClick={() => setIsFullscreen((prev) => !prev)}
 title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
 className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-800 transition"
 >
 {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
 </button>

 <button
 type="button"
 onClick={onClose}
 title="Tutup (Kembali ke Dashboard)"
 className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 transition"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 </div>

 {/* Modal Body / Embed Content */}
 <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center">
 {resource.type === 'image' ? (
 <div className="h-full w-full flex items-center justify-center p-4 overflow-auto">
 <img
 key={reloadKey}
 src={resource.embedUrl}
 alt={title}
 className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
 onLoad={() => setLoading(false)}
 />
 </div>
 ) : resource.type === 'audio' ? (
 <div className="w-full max-w-xl p-8 rounded-xl bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-800/60 text-center shadow-2xl space-y-4">
 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-lg">
 <Music className="h-8 w-8" />
 </div>
 <div>
 <h4 className="text-base font-bold text-white">{title}</h4>
 <p className="text-xs text-slate-400">Pemutar Audio In-App</p>
 </div>
 <audio
 key={reloadKey}
 controls
 autoPlay
 src={resource.embedUrl}
 className="w-full mt-4"
 onLoadedData={() => setLoading(false)}
 >
 Browser Anda tidak mendukung pemutar audio ini.
 </audio>
 </div>
 ) : resource.type === 'video' ? (
 <div className="h-full w-full flex items-center justify-center bg-black">
 <video
 key={reloadKey}
 controls
 autoPlay
 playsInline
 src={resource.embedUrl}
 className="max-h-full max-w-full"
 onLoadedData={() => setLoading(false)}
 >
 Browser Anda tidak mendukung pemutar video ini.
 </video>
 </div>
 ) : (
 <iframe
 key={reloadKey}
 src={resource.embedUrl}
 title={title}
 className="h-full w-full border-0 bg-white"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
 allowFullScreen
 onLoad={() => setLoading(false)}
 />
 )}
 </div>

 {/* Footer Bar (Hero UI Style) */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] px-5 py-3 sm:px-6">
 <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
 <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>Pratinjau Aman Terintegrasi (Pengguna Tetap Berada di Dashboard)</span>
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={onClose}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition"
 >
 Tutup Pratinjau
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 )
}
