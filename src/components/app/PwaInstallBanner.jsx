import { useState, useEffect } from 'react'
import { Download, Smartphone, CheckCircle2, X, Sparkles, ShieldCheck } from 'lucide-react'

import { usePengaturanStore } from '../../stores/pengaturanStore'
import { resolveSystemLogoUrl } from '../../utils/printHelper'

function isPWAStandalone() {
 if (typeof window === 'undefined') return false
 return (
 window.matchMedia('(display-mode: standalone)').matches ||
 window.navigator.standalone === true ||
 document.referrer.includes('android-app://')
 )
}

let deferredPrompt = null
const listeners = new Set()

if (typeof window !== 'undefined') {
 window.addEventListener('beforeinstallprompt', (e) => {
 e.preventDefault()
 deferredPrompt = e
 listeners.forEach((cb) => cb(deferredPrompt))
 })

 window.addEventListener('appinstalled', () => {
 deferredPrompt = null
 listeners.forEach((cb) => cb(null))
 })
}

function usePwaInstall() {
 const [prompt, setPrompt] = useState(deferredPrompt)
 const [isStandalone, setIsStandalone] = useState(false)

 useEffect(() => {
 setIsStandalone(isPWAStandalone())
 const update = (p) => setPrompt(p)
 listeners.add(update)
 return () => listeners.delete(update)
 }, [])

 const triggerInstall = async () => {
 if (deferredPrompt) {
 deferredPrompt.prompt()
 const { outcome } = await deferredPrompt.userChoice
 if (outcome === 'accepted') {
 deferredPrompt = null
 setPrompt(null)
 }
 return outcome
 }
 return null
 }

 return {
 canInstall: !!prompt && !isStandalone,
 isStandalone,
 triggerInstall,
 }
}

export default function PwaInstallBanner({ forceShow = false, onClose }) {
 const { canInstall, isStandalone, triggerInstall } = usePwaInstall()
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const [dismissed, setDismissed] = useState(false)
 const [isIos, setIsIos] = useState(false)
 const [showIosGuide, setShowIosGuide] = useState(false)

 useEffect(() => {
 if (typeof window !== 'undefined') {
 const userAgent = window.navigator.userAgent.toLowerCase()
 setIsIos(/iphone|ipad|ipod/.test(userAgent))
 const lastDismissed = localStorage.getItem('sims_pwa_banner_dismissed')
 if (lastDismissed && Date.now() - parseInt(lastDismissed, 10) < 24 * 60 * 60 * 1000) {
 setDismissed(true)
 }
 }
 }, [])

 if (isStandalone) return null
 if (dismissed && !forceShow) return null
 if (!canInstall && !isIos && !forceShow) return null

 const handleDismiss = () => {
 setDismissed(true)
 localStorage.setItem('sims_pwa_banner_dismissed', String(Date.now()))
 if (onClose) onClose()
 }

 const handleInstallClick = async () => {
 if (isIos && !canInstall) {
 setShowIosGuide(true)
 return
 }
 const outcome = await triggerInstall()
 if (outcome === 'accepted' && onClose) {
 onClose()
 }
 }

 return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-bounce-in">
      <div className="relative rounded-2xl bg-gradient-to-br from-[#059669] via-emerald-800 to-emerald-950 p-4 text-white shadow-2xl shadow-emerald-950/40 border border-emerald-500/40 backdrop-blur-xl overflow-hidden">
        {/* Subtle Ambient Decorative Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 text-emerald-100/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition z-10 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content Banner Header with Official Logo */}
        <div className="relative z-10 flex items-start gap-3.5 pr-6">
          <div className="relative shrink-0">
            <img
              src={pengaturan?.logo_url || '/assets/images/logo.png'}
              onError={(e) => {
                if (e.target.src !== window.location.origin + '/logo.png') {
                  e.target.src = '/logo.png'
                }
              }}
              alt="Logo SIMS Terpadu PWA"
              className="h-14 w-14 object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-emerald-950 shadow-xs">
              ★
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-300/30">
                Aplikasi Resmi PWA
              </span>
            </div>
            <h4 className="text-sm font-extrabold tracking-tight text-white leading-snug">
              Pasang SIMS Terpadu
            </h4>
            <p className="text-xs text-emerald-100 leading-normal font-medium">
              Sesi aktif berlaku terus hingga 3 hari tanpa perlu login ulang!
            </p>
          </div>
        </div>

        {/* Badges Info */}
        <div className="relative z-10 mt-3 grid grid-cols-2 gap-1.5 pt-2.5 border-t border-emerald-500/30 text-[10.5px]">
          <div className="flex items-center gap-1.5 text-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span>Sesi 3 Hari Auto-Sync</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
            <span>Keamanan Terpadu</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 mt-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs px-3.5 py-2.5 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>Pasang Sekarang</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 transition cursor-pointer active:scale-95"
          >
            Nanti
          </button>
        </div>

        {/* iOS Installation Instructions Modal Popup */}
        {showIosGuide && (
          <div className="relative z-10 mt-3 rounded-xl bg-emerald-950/90 p-3 border border-emerald-500/40 text-xs text-white space-y-2">
            <p className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4" /> Cara Pasang di iPhone/iPad:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-emerald-100 font-medium">
              <li>Ketuk tombol <strong className="text-white">Bagikan (Share)</strong> di bagian bawah Safari.</li>
              <li>Pilih menu <strong className="text-white">'Tambahkan ke Layar Utama' (Add to Home Screen)</strong>.</li>
              <li>Ketuk <strong className="text-amber-300">'Tambah'</strong> untuk memasang icon aplikasi.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full mt-1 text-center font-bold text-amber-300 hover:underline text-xs cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
