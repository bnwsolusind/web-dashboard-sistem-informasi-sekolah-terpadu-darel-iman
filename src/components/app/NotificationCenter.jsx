import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Bell, CheckCheck, Inbox, X, UserRound, FileText, TrendingUp, Info } from 'lucide-react'
import { Drawer } from '../ui/drawer'
import { cn } from '../../lib/utils'
import AppBadge from './AppBadge'
import { reportService } from '../../services/reportService'
import { AnimatePresence, motion } from 'framer-motion'

const CATEGORIES = [
  { id: 'semua', label: 'Semua' },
  { id: 'crud', label: 'CRUD' },
  { id: 'approval', label: 'Approval' },
  { id: 'chat', label: 'Chat' },
  { id: 'absensi', label: 'Absensi' },
  { id: 'tahfizh', label: 'Tahfizh' },
  { id: 'mutabaah', label: 'Mutabaah' },
  { id: 'akademik', label: 'Akademik' },
  { id: 'lms', label: 'LMS' },
  { id: 'portal', label: 'Portal' },
  { id: 'pengumuman', label: 'Pengumuman' },
  { id: 'system', label: 'System' },
]

function inferCategory(notification) {
  const text = `${notification.title || ''} ${notification.body || notification.message || ''} ${notification.category || ''}`.toLowerCase()
  const map = [
    ['crud', ['tambah', 'perbarui', 'hapus', 'simpan', 'crud']],
    ['approval', ['setuju', 'tolak', 'approval', 'persetujuan', 'disetujui']],
    ['chat', ['chat', 'pesan', 'komentar', 'obrolan']],
    ['absensi', ['absensi', 'hadir', 'izin', 'sakit', 'presensi']],
    ['tahfizh', ['tahfizh', 'setoran', 'hafalan']],
    ['mutabaah', ['mutabaah', 'ibadah', 'amalan']],
    ['akademik', ['akademik', 'nilai', 'rapor', 'tugas']],
    ['lms', ['lms', 'materi', 'modul', 'ujian', 'bank soal']],
    ['portal', ['portal', 'orang tua', 'siswa']],
    ['pengumuman', ['pengumuman', 'info', 'informasi', 'berita']],
  ]
  for (const [category, keywords] of map) {
    if (keywords.some((k) => text.includes(k))) return category
  }
  return 'system'
}

export default function NotificationCenter({
  items: controlledItems,
  unreadCount: controlledUnread,
  onMarkRead: externalMarkRead,
  onMarkAllRead: externalMarkAllRead,
  disabled = false,
  bellClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('semua')
  const [items, setItems] = useState(controlledItems || [])
  const [unreadCount, setUnreadCount] = useState(controlledUnread || 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const popoverRef = useRef(null)

  const controlled = Boolean(controlledItems)

  const muatUnreadCount = useCallback(async () => {
    if (controlled || disabled || (typeof document !== 'undefined' && document.hidden)) return
    try {
      const count = await reportService.notificationUnreadCount()
      setUnreadCount(Number(count.unread_count) || 0)
    } catch {
      // ignore
    }
  }, [controlled, disabled])

  const muatNotifikasi = useCallback(async () => {
    if (controlled || disabled) return
    setLoading(true)
    setError(false)
    try {
      const data = await reportService.notifications({ per_page: 50 })
      const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      setItems(list)
    } catch {
      setError(true)
      setItems([])
    } finally {
      setLoading(false)
    }
    muatUnreadCount()
  }, [controlled, disabled, muatUnreadCount])

  // Periodic polling only polls unread count (very lightweight payload)
  useEffect(() => {
    muatUnreadCount()
    const interval = setInterval(muatUnreadCount, 30000)
    const onVisibilityChange = () => {
      if (!document.hidden) muatUnreadCount()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [muatUnreadCount])

  // When popover or modal opens, fetch the full notifications list
  useEffect(() => {
    if (popoverOpen || isOpen) {
      muatNotifikasi()
    }
  }, [popoverOpen, isOpen, muatNotifikasi])

  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = () => {
      setIsOpen(true)
      muatNotifikasi()
    }
    window.addEventListener('open-notification-center', handler)
    return () => window.removeEventListener('open-notification-center', handler)
  }, [muatNotifikasi])

  const resolvedItems = controlledItems || items
  const resolvedUnread = controlledUnread ?? unreadCount

  const tandaiSemuaDibaca = async () => {
    if (externalMarkAllRead) {
      await externalMarkAllRead()
      return
    }
    try {
      await reportService.markAllNotificationsRead()
      setUnreadCount(0)
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    } catch {
      // ignore
    }
  }

  const tandaiDibaca = async (item) => {
    if (externalMarkRead) {
      await externalMarkRead(item)
      return
    }
    try {
      await reportService.markNotificationRead(item.id)
      setUnreadCount((prev) => Math.max(0, prev - 1))
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)))
    } catch {
      // ignore
    }
  }

  const filteredItems = useMemo(() => {
    if (activeCategory === 'semua') return resolvedItems
    return resolvedItems.filter((item) => inferCategory(item) === activeCategory)
  }, [resolvedItems, activeCategory])

  const normalized = useMemo(
    () =>
      filteredItems.map((item, idx) => {
        const time = item.created_at ? new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Baru saja'
        const themes = [
          { bg: 'bg-amber-100 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400', Icon: UserRound },
          { bg: 'bg-rose-100 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400', Icon: FileText },
          { bg: 'bg-emerald-100 text-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-400', Icon: TrendingUp },
          { bg: 'bg-blue-100 text-blue-500 dark:bg-blue-950/60 dark:text-blue-400', Icon: Info },
        ]
        const theme = themes[idx % themes.length]
        return {
          ...item,
          time: item.time || time,
          title: item.title || item.message || item.body || 'Notifikasi Baru',
          category: inferCategory(item),
          unread: !item.read_at,
          bg: theme.bg,
          Icon: theme.Icon,
        }
      }),
    [filteredItems]
  )

  const popoverDisplayItems = normalized.slice(0, 5)

  return (
    <div className="relative" ref={popoverRef}>
      {/* Squircle Notification Bell Button */}
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:scale-[1.03] active:scale-[0.97] focus:outline-none',
          popoverOpen
            ? 'border-2 border-[#3B59FE] bg-white text-[#3B59FE] dark:bg-slate-900 dark:border-[#3B59FE]'
            : 'border-slate-200/80 bg-slate-50/80 text-slate-700 hover:bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800',
          bellClassName
        )}
        title="Pemberitahuan Sistem"
        aria-label="Pemberitahuan"
      >
        <Bell className="h-5 w-5 stroke-[1.8]" />
        {(resolvedUnread > 0 || popoverDisplayItems.some((d) => d.unread)) && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#FF3B30] ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {/* Popover Dropdown Card Matching Image 2 */}
      <AnimatePresence>
        {popoverOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-3xl bg-white dark:bg-[#1B2433] p-5 shadow-2xl border border-slate-100 dark:border-slate-800 z-50"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Notifikasi</h3>
              <button
                type="button"
                onClick={() => setPopoverOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-2 space-y-1.5 max-h-[340px] overflow-y-auto custom-scrollbar">
              {popoverDisplayItems.length === 0 ? (
                <div className="py-8 text-center">
                  <Inbox className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tidak ada notifikasi baru</p>
                </div>
              ) : (
                popoverDisplayItems.map((item) => {
                  const ItemIcon = item.Icon || Info
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.unread) tandaiDibaca(item)
                      }}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={cn('h-11 w-11 shrink-0 rounded-full flex items-center justify-center transition-transform group-hover:scale-105', item.bg)}>
                          <ItemIcon className="h-5 w-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#3B59FE] dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-0.5">{item.time}</p>
                        </div>
                      </div>
                      {item.unread && (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 animate-pulse" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setPopoverOpen(false)
                  setIsOpen(true)
                }}
                className="font-bold text-[#3B59FE] hover:underline dark:text-blue-400"
              >
                Lihat Semua Riwayat
              </button>
              <button
                type="button"
                onClick={tandaiSemuaDibaca}
                className="font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Tandai dibaca
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Drawer */}
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Pemberitahuan & Activity Log" position="right">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            {resolvedUnread > 0 && (
              <AppBadge variant="success" dot>{resolvedUnread} belum dibaca</AppBadge>
            )}
            <button
              type="button"
              onClick={tandaiSemuaDibaca}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#0E5C44] transition hover:underline dark:text-[#3FBF75]"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tandai semua dibaca
            </button>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[10px] font-bold transition',
                  activeCategory === cat.id
                    ? 'border-[#0E5C44] bg-[#0E5C44] text-white dark:border-[#3FBF75] dark:bg-[#3FBF75] dark:text-slate-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-[#0E5C44]/40 hover:text-[#0E5C44] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="py-6 text-center text-xs text-rose-500">
              Gagal memuat notifikasi. Silakan muat ulang halaman.
            </p>
          )}

          {!loading && !error && normalized.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Inbox className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak Ada Notifikasi</p>
              <p className="mt-1 text-xs text-slate-400">Belum ada notifikasi pada kategori ini.</p>
            </div>
          )}

          {!loading && !error && normalized.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                if (item.unread) tandaiDibaca(item)
              }}
              className={cn(
                'w-full rounded-2xl border p-4 text-left transition',
                item.unread
                  ? 'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-800/80 dark:bg-emerald-950/30'
                  : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <AppBadge variant={item.category === 'system' ? 'neutral' : 'info'}>{item.category}</AppBadge>
                  <h5 className="truncate text-xs font-bold text-slate-900 dark:text-white">{item.title}</h5>
                </div>
                {item.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.desc}</p>
              <p className="mt-2 text-[10px] font-medium text-slate-400">{item.time}</p>
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  )
}
