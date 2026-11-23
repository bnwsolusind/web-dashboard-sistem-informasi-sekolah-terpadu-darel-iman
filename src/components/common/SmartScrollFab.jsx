import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ArrowUp } from 'lucide-react'

/**
 * SmartScrollFab (Option A - Smart Floating Scroll Navigator)
 * ─────────────────────────────────────────────────────────────────────────────
 * Tombol melayang cerdas HeroUI Emerald Squircle yang mendeteksi posisi scroll:
 * - Posisi atas (scrollY <= threshold): Ikon panah bawah (scroll ke tabel data target).
 * - Posisi bawah (scrollY > threshold): Otomatis bertransformasi menjadi panah atas (scroll ke puncak).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function SmartScrollFab({
 targetId = 'tabel-utama',
 threshold = 350,
 downTooltip = 'Langsung ke Tabel Data',
 upTooltip = 'Kembali ke Paling Atas',
 className = 'fixed right-6 bottom-24 z-40 print:hidden group',
}) {
 const [isScrolledDown, setIsScrolledDown] = useState(false)

 useEffect(() => {
 const handleScroll = () => {
 setIsScrolledDown(window.scrollY > threshold)
 }
 window.addEventListener('scroll', handleScroll, { passive: true })
 return () => window.removeEventListener('scroll', handleScroll)
 }, [threshold])

 const handleQuickScroll = () => {
 if (isScrolledDown) {
 window.scrollTo({ top: 0, behavior: 'smooth' })
 } else {
 const el = document.getElementById(targetId)
 if (el) {
 el.scrollIntoView({ behavior: 'smooth', block: 'start' })
 } else {
 window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
 }
 }
 }

 const currentTooltip = isScrolledDown ? upTooltip : downTooltip

 return (
 <div className={className}>
 {/* Floating Tooltip */}
 <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out whitespace-nowrap rounded-xl bg-slate-900/90 dark:bg-emerald-50 backdrop-blur-md px-3 py-1.5 text-xs font-extrabold dark:text-slate-900 shadow-xl border border-slate-700/50 dark:border-emerald-300">
 <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/90 dark:border-l-slate-100/95" />
 <span>{currentTooltip}</span>
 </div>

 {/* Squircle Action Button */}
 <button
 type="button"
 onClick={handleQuickScroll}
 aria-label={currentTooltip}
 className="flex size-12 items-center justify-center rounded-full bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-[#059669]/30 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#059669]/30"
 >
 <AnimatePresence mode="wait">
 {isScrolledDown ? (
 <motion.div
 key="arrow-up"
 initial={{ opacity: 0, y: 6, rotate: -45 }}
 animate={{ opacity: 1, y: 0, rotate: 0 }}
 exit={{ opacity: 0, y: -6, rotate: 45 }}
 transition={{ duration: 0.18 }}
 >
 <ArrowUp className="size-5 text-white" strokeWidth={2.5} />
 </motion.div>
 ) : (
 <motion.div
 key="arrow-down"
 initial={{ opacity: 0, y: -6, rotate: 45 }}
 animate={{ opacity: 1, y: 0, rotate: 0 }}
 exit={{ opacity: 0, y: 6, rotate: -45 }}
 transition={{ duration: 0.18 }}
 >
 <ArrowDown className="size-5 text-white" strokeWidth={2.5} />
 </motion.div>
 )}
 </AnimatePresence>
 </button>
 </div>
 )
}
