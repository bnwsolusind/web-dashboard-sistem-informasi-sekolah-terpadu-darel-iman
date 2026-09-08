import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Users, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'

export default function EmployeeChatPage() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []

  const isTeacher = roles.some((r) => {
    const name = typeof r === 'string' ? r : r?.name || ''
    return /guru|wali|teacher|pengajar|bk|tahfizh|pai/i.test(name)
  }) || roles.some((r) => {
    const name = typeof r === 'string' ? r : r?.name || ''
    return /super.*admin|admin|kepala|kepsek|divisi/i.test(name)
  })

  const [activeTabMode, setActiveTabMode] = useState('employee') // 'employee' | 'teacher'
  const [parentUnreadCount, setParentUnreadCount] = useState(0)

  // Check unread messages from parents periodically for teachers
  React.useEffect(() => {
    if (!isTeacher) return
    let isMounted = true

    const checkParentUnread = async () => {
      try {
        const { familyPortalService } = await import('../services/familyPortalService')
        const res = await familyPortalService.teacherConversations().catch(() => ({ data: [] }))
        const list = Array.isArray(res?.data) ? res.data : []
        const totalUnread = list.reduce((acc, conv) => acc + (conv.unread_count || 0), 0)
        if (isMounted) setParentUnreadCount(totalUnread)
      } catch {
        // silent fallback
      }
    }

    checkParentUnread()
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      checkParentUnread()
    }, 20000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [isTeacher])

  return (
    <PageContainer className="space-y-6 pb-12">
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Chat & Komunikasi Pegawai' },
        ]}
      />

      {/* MODERN HERO CARD HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <MessageSquare className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Modul Komunikasi Terpadu
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Pusat Pesan &amp; Diskusi Sekolah
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Layanan perpesanan internal antar pegawai, guru, staf, serta konsultasi wali kelas dan orang tua murid.
                </p>
              </div>
            </div>

            {/* Tab Switcher for Teachers who also deal with Parent Messages */}
            {isTeacher && (
              <div className="flex items-center gap-1.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 p-1.5 border border-emerald-500/20 shadow-sm backdrop-blur-md self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setActiveTabMode('employee')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTabMode === 'employee'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Users className="h-4 w-4" /> Chat Pegawai
                </button>

                <button
                  onClick={() => setActiveTabMode('teacher')}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeTabMode === 'teacher'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <HeartHandshake className="h-4 w-4" /> Pesan Orang Tua
                  {parentUnreadCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-xs animate-pulse">
                      {parentUnreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Alert Banner for New Incoming Parent Messages */}
      {parentUnreadCount > 0 && activeTabMode === 'employee' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-amber-500/20 p-4 border-2 border-amber-500/40 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 text-white font-black text-xs shadow-xs animate-bounce">
              {parentUnreadCount}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Ada {parentUnreadCount} pesan baru dari Orang Tua Murid!
              </p>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Wali santri telah mengirimkan pesan konsultasi. Klik tombol di kanan untuk membuka.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTabMode('teacher')}
            className="shrink-0 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md hover:brightness-110 transition cursor-pointer"
          >
            Buka Pesan Orang Tua &rarr;
          </button>
        </motion.div>
      )}

      {/* Main Chat Workspace */}
      <ChatGuruWorkspace mode={activeTabMode} hideHeader={false} />
    </PageContainer>
  )
}
