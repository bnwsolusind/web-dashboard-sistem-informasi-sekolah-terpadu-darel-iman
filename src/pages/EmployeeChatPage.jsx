import React, { useState } from 'react'
import {
  motion
} from 'framer-motion'
import {
  MessageSquare,
  Users,
  HeartHandshake,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import {
  useAuthStore
} from '../stores/authStore'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'
import {
  useSearchParams
} from 'react-router-dom'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppTabs from '../components/app/AppTabs'

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

 const [searchParams] = useSearchParams()
 const initialMode = searchParams.get('mode') === 'teacher' ? 'teacher' : 'employee'
 const [activeTabMode, setActiveTabMode] = useState(initialMode) // 'employee' | 'teacher'
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
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-4">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <MessageSquare className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <Sparkles className="size-3 animate-pulse text-white" />
 Modul Komunikasi Terpadu
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Pusat Pesan &amp; Diskusi Sekolah
 </h1>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
 Layanan perpesanan internal antar pegawai, guru, staf, serta konsultasi wali kelas dan orang tua murid.
 </p>
 </div>
 </div>

 {/* Tab Switcher for Teachers who also deal with Parent Messages */}
 {isTeacher && (
 <AppTabs
 tabs={[
 { id: 'employee', label: 'Chat Pegawai', icon: Users },
 {
 id: 'teacher',
 label: 'Pesan Orang Tua',
 icon: HeartHandshake,
 badge: parentUnreadCount > 0 ? parentUnreadCount : undefined,
 },
 ]}
 activeTab={activeTabMode}
 onChange={setActiveTabMode}
 ariaLabel="Mode perpesanan"
 />
 )}
 </div>
 </div>
 </motion.div>

 {/* Alert Banner for New Incoming Parent Messages */}
 {parentUnreadCount > 0 && activeTabMode === 'employee' && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-white dark:bg-[#1B2433] p-4 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm"
 >
 <div className="flex items-center gap-3">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] font-black text-xs shadow-xs animate-bounce">
 {parentUnreadCount}
 </div>
 <div>
 <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
 Ada {parentUnreadCount} pesan baru dari Orang Tua Murid!
 </p>
 <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
 Wali santri telah mengirimkan pesan konsultasi. Klik tombol di kanan untuk membuka.
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setActiveTabMode('teacher')}
 className="shrink-0 rounded-xl bg-white dark:bg-[#1B2433] px-4 py-2 text-xs font-black shadow-md hover:brightness-110 transition cursor-pointer"
 >
 Buka Pesan Orang Tua &rarr;
 </button>
 </motion.div>
 )}

 {/* Main Chat Workspace */}
 <ChatGuruWorkspace
 mode={activeTabMode}
 hideHeader={false}
 targetStudentId={searchParams.get('student_id')}
 targetParentId={searchParams.get('parent_id')}
 initialMessage={searchParams.get('initial_message')}
 />
 </PageContainer>
 )
}
