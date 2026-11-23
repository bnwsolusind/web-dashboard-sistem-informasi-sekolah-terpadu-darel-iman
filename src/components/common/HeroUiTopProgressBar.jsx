import React, { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Spinner as HeroSpinner, Chip as HeroChip } from '@heroui/react'

/**
 * HeroUiTopProgressBar
 * Global Top Loading Progress Bar & Floating Status Badge powered by HeroUI.
 *
 * Capabilities:
 * - React Router navigation tracking (route change progress 0% -> 100%)
 * - TanStack React Query background network activity (isFetching / isMutating)
 * - High-visibility top-of-viewport emerald gradient progress bar
 * - Floating HeroUI sync status pill with spinner
 * - Zero layout shift, strictly HeroUI & Tailwind (no HeroUI)
 */
export default function HeroUiTopProgressBar() {
 const location = useLocation()
 const isFetching = useIsFetching()
 const isMutating = useIsMutating()
 const isNetworkActive = isFetching > 0 || isMutating > 0

 const [progress, setProgress] = useState(0)
 const [isVisible, setIsVisible] = useState(false)
 const timerRef = useRef(null)
 const locationRef = useRef(location.pathname + location.search)

 // Handle Route Navigation Progress
 useEffect(() => {
 const currentLoc = location.pathname + location.search
 if (locationRef.current !== currentLoc) {
 locationRef.current = currentLoc

 // Navigation started
 setIsVisible(true)
 setProgress(20)

 if (timerRef.current) clearInterval(timerRef.current)

 let currentP = 20
 timerRef.current = setInterval(() => {
 currentP += Math.floor(Math.random() * 15) + 10
 if (currentP >= 85) {
 currentP = 85
 clearInterval(timerRef.current)
 }
 setProgress(currentP)
 }, 120)

 // Complete navigation progress quickly if no pending queries
 const finishTimeout = setTimeout(() => {
 if (!isNetworkActive) {
 setProgress(100)
 setTimeout(() => {
 setIsVisible(false)
 setProgress(0)
 }, 350)
 }
 }, 400)

 return () => {
 clearInterval(timerRef.current)
 clearTimeout(finishTimeout)
 }
 }
 }, [location.pathname, location.search, isNetworkActive])

 // Handle TanStack Query Network Activity
 useEffect(() => {
 if (isNetworkActive) {
 setIsVisible(true)
 setProgress((prev) => (prev < 40 ? 40 : prev < 85 ? prev + 10 : 85))
 } else {
 if (isVisible) {
 setProgress(100)
 const hideTimer = setTimeout(() => {
 setIsVisible(false)
 setProgress(0)
 }, 300)
 return () => clearTimeout(hideTimer)
 }
 }
 }, [isNetworkActive])

 return (
 <>
 {/* 1. TOP-OF-VIEWPORT PROGRESS BAR */}
 <AnimatePresence>
 {isVisible && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="fixed top-0 left-0 right-0 z-[999999] h-[3.5px] pointer-events-none overflow-hidden bg-emerald-500/10 dark:bg-emerald-950/30"
 >
 <motion.div
 className="h-full bg-white dark:bg-[#1B2433] shadow-[0_0_12px_rgba(16,185,129,0.9)]"
 style={{ width: `${progress}%` }}
 transition={{ ease: 'easeOut', duration: 0.25 }}
 />
 {/* Shimmer highlight line */}
 <div className="absolute inset-0 bg-white dark:bg-[#1B2433] animate-pulse" />
 </motion.div>
 )}
 </AnimatePresence>

 {/* 2. FLOATING HERO UI SYNC STATUS PILL (Visible during active background data processing) */}
 <AnimatePresence>
 {isNetworkActive && (
 <motion.div
 initial={{ opacity: 0, y: -20, scale: 0.92 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -20, scale: 0.92 }}
 transition={{ type: 'spring', stiffness: 500, damping: 30 }}
 className="fixed top-[68px] right-3 sm:right-6 z-[45] pointer-events-none"
 >
 <HeroChip
 color="success"
 variant="flat"
 size="sm"
 className="border border-emerald-200/80 dark:border-emerald-800/60 bg-white/95 dark:bg-[#1B2433]/95 shadow-xl shadow-sm backdrop-blur-md px-3 py-1.5 flex items-center gap-2"
 >
 <HeroSpinner size="sm" color="success" className="w-3.5 h-3.5" />
 <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
 {isMutating > 0 ? 'Menyimpan perubahan data...' : 'Menyinkronkan data...'}
 </span>
 </HeroChip>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 )
}
