import React, { useMemo, useState } from 'react'
import AppModal from '@/components/app/AppModal'
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
        <AppModal
            isOpen={Boolean(isOpen && url)}
            onClose={onClose}
            title={title}
            description={subtitle || resource.embedUrl}
            badge={resource.label}
            icon={IconComponent}
            maxWidth={isFullscreen ? 'max-w-[98vw]' : 'max-w-4xl'}
            zIndex="z-[100]"
            bodyClassName="p-0"
            headerActions={
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true)
                            setReloadKey((k) => k + 1)
                        }}
                        title="Muat Ulang Pratinjau"
                        className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 border border-white/25 transition cursor-pointer"
                    >
                        <RotateCw className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsFullscreen((prev) => !prev)}
                        title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                        className="hidden sm:flex size-9 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 border border-white/25 transition cursor-pointer"
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                </div>
            }
            footer={
                <div className="flex w-full flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Pratinjau Aman Terintegrasi (Pengguna Tetap Berada di Dashboard)</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                        Tutup Pratinjau
                    </button>
                </div>
            }
        >
            {/* Modal Body / Embed Content */}
            <div className={`relative bg-slate-950 overflow-hidden flex items-center justify-center ${isFullscreen ? 'h-[78vh]' : 'h-[66vh]'}`}>
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
        </AppModal>
    )
}
