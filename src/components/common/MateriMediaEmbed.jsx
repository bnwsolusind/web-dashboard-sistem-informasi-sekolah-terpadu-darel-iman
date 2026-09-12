import React, { useState, useMemo } from 'react'
import {
  Video,
  FileText,
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  AlertCircle,
  Play,
  Film,
  Sparkles,
  BookOpen,
} from 'lucide-react'

/**
 * Helper untuk mengekstrak informasi video dan embed URL dari berbagai format video.
 */
export function parseVideoEmbed(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // 1. Deteksi YouTube (watch?v=, youtu.be/, embed/, shorts/)
  const ytRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  const ytMatch = trimmed.match(ytRegex)
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      videoId: ytMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      originalUrl: trimmed,
      label: 'YouTube Video',
    }
  }

  // 2. Deteksi Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/i
  const vimeoMatch = trimmed.match(vimeoRegex)
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      originalUrl: trimmed,
      label: 'Vimeo Video',
    }
  }

  // 3. Deteksi file video langsung (.mp4, .webm, .ogg)
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      originalUrl: trimmed,
      label: 'Video MP4 / WebM',
    }
  }

  // 4. Fallback URL umum
  return {
    type: 'generic',
    embedUrl: trimmed,
    originalUrl: trimmed,
    label: 'Media Video Pembelajaran',
  }
}

/**
 * Pemutar Video Embed yang responsif dan elegan
 */
export function VideoEmbedPlayer({ url, title = 'Video Pembelajaran', className = '' }) {
  const [loadError, setLoadError] = useState(false)
  const videoInfo = useMemo(() => parseVideoEmbed(url), [url])

  if (!url || !videoInfo) return null

  return (
    <div className={`overflow-hidden rounded-2xl border border-rose-200/80 bg-slate-950 shadow-md dark:border-rose-900/40 ${className}`}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-2.5 text-xs text-white">
        <div className="flex items-center gap-2 truncate">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <Film className="size-4" />
          </div>
          <span className="truncate font-bold tracking-wide text-slate-100">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-300">
            {videoInfo.label}
          </span>
          <a
            href={videoInfo.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-white/20 hover:text-white transition-colors"
            title="Buka di tab baru"
          >
            <span>Buka</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      {/* Video Content Container */}
      <div className="relative aspect-video w-full bg-black">
        {videoInfo.type === 'direct' ? (
          <video
            controls
            playsInline
            className="h-full w-full object-contain"
            title={title}
            onError={() => setLoadError(true)}
          >
            <source src={videoInfo.embedUrl} />
            Browser Anda tidak mendukung tag video HTML5.
          </video>
        ) : (
          <iframe
            src={videoInfo.embedUrl}
            title={title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setLoadError(true)}
          />
        )}

        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center text-white">
            <AlertCircle className="size-10 text-rose-400 mb-2" />
            <p className="font-bold text-sm">Pemutar video tidak dapat dimuat langsung di frame ini.</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Situs sumber mungkin membatasi penayangan di dalam frame embed.</p>
            <a
              href={videoInfo.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              <ExternalLink className="size-4" />
              Tonton di Tab Baru
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Penampil Dokumen PDF interaktif dengan iframe & fallback viewer
 */
export function PdfDocumentViewer({ url, title = 'Lampiran Dokumen PDF', height = '500px', className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [embedFailed, setEmbedFailed] = useState(false)

  if (!url) return null

  // Ensure format is friendly for modern browser PDF viewers
  const pdfViewUrl = url.includes('#') ? url : `${url}#toolbar=1&navpanes=0`

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-md transition-all duration-300 dark:border-sky-900/40 dark:bg-slate-900 ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl' : ''
      } ${className}`}
    >
      {/* Document Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/80 px-4 py-3 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            <FileText className="size-4" />
          </div>
          <div className="truncate">
            <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Dokumen PDF Tersemat</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Buka dokumen di tab baru"
          >
            <ExternalLink className="size-3.5 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Tab Baru</span>
          </a>

          <a
            href={url}
            download
            className="flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-sky-700 transition"
            title="Download file dokumen"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Unduh</span>
          </a>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title={isExpanded ? 'Perkecil tampilan' : 'Perbesar layar penuh'}
          >
            {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* PDF Frame / Object */}
      <div className="relative flex-1 bg-slate-100 dark:bg-slate-950" style={{ height: isExpanded ? 'calc(100% - 56px)' : height }}>
        {!embedFailed ? (
          <iframe
            src={pdfViewUrl}
            title={title}
            className="h-full w-full border-0"
            onError={() => setEmbedFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-600 dark:text-slate-300">
            <FileText className="size-12 text-sky-500 opacity-60 mb-3" />
            <p className="text-sm font-bold">Pratinjau PDF tidak dapat ditampilkan langsung di browser ini.</p>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">Anda dapat membuka dokumen secara langsung di tab baru atau mengunduhnya ke perangkat.</p>
            <div className="mt-4 flex gap-3">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0E5C44] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#1E8E5A]"
              >
                <ExternalLink className="size-4" />
                Buka Dokumen di Tab Baru
              </a>
              <a
                href={url}
                download
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <Download className="size-4" />
                Unduh PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Komponen Terpadu yang menampilkan Pembahasan, Dokumen PDF, & Video Embed
 */
export default function MateriMediaEmbed({
  materi,
  className = '',
  defaultTab = 'konten',
}) {
  const hasFile = Boolean(materi?.file || materi?.file_raw)
  const hasVideo = Boolean(materi?.video)
  const isPdf = hasFile && (
    (materi.file || '').toLowerCase().includes('.pdf') ||
    materi.tipe === 'dokumen' ||
    materi.tipe === 'pdf' ||
    materi.tipe_materi === 'dokumen' ||
    materi.tipe_materi === 'pdf'
  )

  const availableTabs = [
    { id: 'konten', label: 'Uraian Materi', icon: BookOpen },
    ...(hasFile ? [{ id: 'dokumen', label: isPdf ? 'Dokumen PDF' : 'Lampiran Dokumen', icon: FileText }] : []),
    ...(hasVideo ? [{ id: 'video', label: 'Video Pembelajaran', icon: Video }] : []),
  ]

  const [activeTab, setActiveTab] = useState(
    availableTabs.some((t) => t.id === defaultTab)
      ? defaultTab
      : availableTabs[0]?.id || 'konten'
  )

  const fileUrl = materi?.file || materi?.file_raw
  const videoUrl = materi?.video

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation if multiple media available */}
      {availableTabs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 dark:border-slate-800 dark:bg-slate-900/60">
          {availableTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0E5C44] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
                {tab.id === 'dokumen' && (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] uppercase tracking-wider">
                    PDF
                  </span>
                )}
                {tab.id === 'video' && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9px] uppercase tracking-wider text-white">
                    PLAY
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Tab 1: Konten Teks / Uraian */}
      {activeTab === 'konten' && (
        <div className="space-y-4">
          {materi?.ringkasan && (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <h5 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1.5">
                <Sparkles className="size-4" />
                Ringkasan Materi
              </h5>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{materi.ringkasan}</p>
            </div>
          )}

          {materi?.isi && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <div className="whitespace-pre-line text-xs sm:text-sm">{materi.isi}</div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Dokumen PDF */}
      {activeTab === 'dokumen' && hasFile && (
        <div className="space-y-3">
          <PdfDocumentViewer
            url={fileUrl}
            title={materi?.judul ? `Dokumen: ${materi.judul}` : 'Lampiran Dokumen Materi'}
            height="520px"
          />
        </div>
      )}

      {/* Tab 3: Video Pembelajaran */}
      {activeTab === 'video' && hasVideo && (
        <div className="space-y-3">
          <VideoEmbedPlayer
            url={videoUrl}
            title={materi?.judul ? `Video: ${materi.judul}` : 'Video Pembelajaran'}
          />
        </div>
      )}
    </div>
  )
}
