import React from 'react'
import { motion } from 'framer-motion'
import { Card as HeroCard } from '@heroui/react'
import { Sparkles } from 'lucide-react'

/**
 * HeroUiPageFallback
 * Canonical Suspense fallback component for lazy-loaded route chunks.
 *
 * Tampilan selaras dengan desain Dar El-Iman emerald:
 * - Kartu tengah melengkung rounded-2xl dengan border emerald halus
 * - Squircle Spinner hijau zamrud berputar presisi dengan lencana Sparkles
 * - Tombol / Badge Status hijau zamrud dengan teks putih kontras: "MEMUAT MODUL"
 * - Judul "Menyiapkan Halaman..." & deskripsi
 * - Shimmer skeleton bar bernuansa emerald
 */
export default function HeroUiPageFallback({
  title = 'Menyiapkan Halaman...',
  message = 'Sedang memuat modul dan menyinkronkan data tampilan sistem.',
}) {
  return (
    <div className="relative min-h-[50vh] w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* HeroUI Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <HeroCard className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-white/95 dark:bg-[#1B2433]/95 p-0 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
          <div className="p-6 sm:p-7 flex flex-col items-center text-center">
            {/* 3D Squircle Icon Badge with Vivid Emerald Spinner */}
            <div className="relative mb-4 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 shadow-lg border border-emerald-300 dark:border-emerald-700/60">
                <div className="relative flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-200 border-t-emerald-600 dark:border-emerald-900/80 dark:border-t-emerald-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md border-2 border-white dark:border-[#1B2433]">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>

            {/* Tombol Status Badge: Warna Hijau Zamrud Solid dengan Tulisan Putih Kontras */}
            <div className="mb-2.5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-emerald-600/30">
              MEMUAT MODUL
            </div>

            {/* Title & Description */}
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              {message}
            </p>

            {/* Shimmer Placeholder Lines */}
            <div className="mt-6 w-full space-y-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 border border-emerald-100/80 dark:border-emerald-900/40">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="h-2.5 w-4/5 rounded-md bg-emerald-200/60 dark:bg-emerald-800/40 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
                <div className="h-2.5 w-3/5 rounded-md bg-emerald-200/40 dark:bg-emerald-800/30 animate-pulse" />
              </div>
            </div>
          </div>
        </HeroCard>
      </motion.div>
    </div>
  )
}
