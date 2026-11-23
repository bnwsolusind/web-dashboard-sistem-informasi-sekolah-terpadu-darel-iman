import {
  useState,
  useEffect,
  useMemo
} from 'react'
import {
  useSearchParams
} from 'react-router-dom'
import {
  User,
  Lock,
  ShieldCheck,
  Monitor,
  Activity,
  Grid,
  KeyRound,
  Sparkles,
  Zap
} from 'lucide-react'
import {
  motion
} from 'framer-motion'

import {
  PageContainer
} from '@/components/app'
import AppBreadcrumb from '@/components/app/AppBreadcrumb'
import {
  useAuthStore
} from '../stores/authStore'
import {
  Badge
} from '@/components/ui/badge'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertTitle
} from '@/components/ui/alert'
import {
  hasAnyRole,
  getUserRoleLevel,
  ROLE_LEVELS
} from '../auth/portalResolver'

import UserProfileCard from '../components/auth/UserProfileCard'
import ChangePasswordCard from '../components/auth/ChangePasswordCard'
import ChildPasswordManagementCard from '../components/auth/ChildPasswordManagementCard'
import TwoFactorAuthCard from '../components/auth/TwoFactorAuthCard'
import SessionLoginCard from '../components/auth/SessionLoginCard'
import ActivityLoginCard from '../components/auth/ActivityLoginCard'
import SelectUnitCard from '../components/auth/SelectUnitCard'
import SelectAcademicYearCard from '../components/auth/SelectAcademicYearCard'

const VALID_TABS = ['profil', 'ganti-password', 'password-anak', '2fa', 'session-login', 'activity-login', 'unit-tahun']

const containerVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.35, staggerChildren: 0.08 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export default function UserProfileManagementPage() {
 const user = useAuthStore((state) => state.user)

 const userRoles = useMemo(() => {
 if (!user) return []
 const rolesList = Array.isArray(user.roles) ? user.roles : [user.role || user.roles].filter(Boolean)
 return rolesList.map((r) => (typeof r === 'string' ? r : r?.name || r?.slug || ''))
 }, [user])

 const primaryRole = userRoles[0] || (typeof user?.role === 'string' ? user?.role : user?.role?.name) || 'Pegawai'

 const userLevel = useMemo(() => getUserRoleLevel(user), [user])
 const canEditUnitAndRole = useMemo(() => {
 if (!user) return false
 if (user.is_super_admin || user.is_admin || user.id === 1) return true
 return userLevel <= ROLE_LEVELS.PIMPINAN_YAYASAN // Level 1 s/d 5 (Super Admin, Admin, TU/Operator, Kepsek, Yayasan)
 }, [user, userLevel])

 const isParent = useMemo(() => {
 return userLevel === ROLE_LEVELS.ORANG_TUA // Level 8
 }, [userLevel])

 const [searchParams] = useSearchParams()
 const tabFromUrl = searchParams.get('tab')
 const [activeTab, setActiveTab] = useState(
 VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'profil'
 )

 // Sync tab when URL param changes
 useEffect(() => {
 if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
 setActiveTab(tabFromUrl)
 }
 }, [tabFromUrl])

 const tabs = [
 {
 id: 'profil',
 label: 'Profil User',
 icon: User,
 activeColor: 'bg-emerald-600 text-white shadow-sm',
 inactiveColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-md hover:shadow-sm',
 },
 {
 id: 'ganti-password',
 label: 'Ganti Password',
 icon: Lock,
 activeColor: 'bg-sky-600 text-white shadow-md shadow-sky-600/30',
 inactiveColor: 'bg-sky-100/90 text-sky-700 hover:bg-sky-600 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white hover:shadow-md hover:shadow-sky-600/30',
 },
 ...(isParent
 ? [
 {
 id: 'password-anak',
 label: 'Password Login Anak',
 icon: KeyRound,
 activeColor: 'bg-amber-500 text-white shadow-sm',
 inactiveColor: 'bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white hover:shadow-md hover:shadow-sm',
 },
 ]
 : []),
 {
 id: '2fa',
 label: 'Keamanan 2FA',
 icon: ShieldCheck,
 activeColor: 'bg-violet-600 text-white shadow-md shadow-violet-600/30',
 inactiveColor: 'bg-violet-100/90 text-violet-700 hover:bg-violet-600 hover:text-white dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white hover:shadow-md hover:shadow-violet-600/30',
 },
 {
 id: 'session-login',
 label: 'Session Login',
 icon: Monitor,
 activeColor: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
    inactiveColor: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-md hover:shadow-sm',},
 {
 id: 'activity-login',
 label: 'Activity Login',
 icon: Activity,
 activeColor: 'bg-rose-600 text-white shadow-sm',
 inactiveColor: 'bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white hover:shadow-md hover:shadow-sm',
 },
 {
 id: 'unit-tahun',
 label: 'Unit & Tahun Ajaran',
 icon: Grid,
 restricted: !canEditUnitAndRole,
 activeColor: 'bg-teal-600 text-white shadow-sm',
 inactiveColor: 'bg-teal-100/90 text-teal-700 hover:bg-teal-600 hover:text-white dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white hover:shadow-md hover:shadow-sm',
 },
 ]

 return (
 <PageContainer className="space-y-6 pb-12">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 {/* Navigation Breadcrumb */}
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Pengaturan Akun' },
 { label: 'Profil & Keamanan' },
 ]}
 />
 </motion.div>

 {/* MODERN HERO CARD HEADER (MATCHING FOUNDATION PROFILE PAGE STYLE) */}
 <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 print:hidden">

 <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-4 min-w-0">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">

            <User className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">

                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
 Profil & Keamanan Akun
 </span>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 Role: {primaryRole}
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Pengaturan Profil & Keamanan Akun
 </h1>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
 Kelola data pribadi {user?.name || user?.fullName || 'Pengguna'}, ganti kata sandi, verifikasi 2FA, pantau riwayat sesi login & aktivitas akun Anda secara terpadu.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2.5 shrink-0 z-10 self-end sm:self-center">
 <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 dark:bg-emerald-950/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span>Akun Aktif ({primaryRole})</span>
 </div>
 </div>
 </div>
 </motion.div>

 {/* 2. Tabs Bar (Restored Previous Multi-Color Pastel Squircle Button Style) */}
 <motion.nav
 variants={itemVariants}
 role="tablist"
 aria-label="Navigasi Pengaturan Profil"
 className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 sm:p-2.5 shadow-xs overflow-x-auto no-scrollbar max-w-full"
 >
 <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
 {tabs.map((tab) => {
 const IconComp = tab.icon
 const isActive = activeTab === tab.id
 return (
 <motion.button
 key={tab.id}
 type="button"
 role="tab"
 aria-selected={isActive}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.97 }}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 select-none ${
 isActive ? tab.activeColor : tab.inactiveColor
 }`}
 >
 <IconComp className="size-4 shrink-0" />
 <span>{tab.label}</span>
 {tab.restricted && (
 <Badge color="warning" size="sm" className="py-0 px-1.5 text-[10px] ml-1">
 🔒 Terkunci
 </Badge>
 )}
 </motion.button>
 )
 })}
 </div>
 </motion.nav>

 {/* 3. Tab Content Container */}
 <motion.div variants={itemVariants} className="transition-all duration-200">
 {activeTab === 'profil' && <UserProfileCard />}
 {activeTab === 'ganti-password' && <ChangePasswordCard />}
 {activeTab === 'password-anak' && <ChildPasswordManagementCard />}
 {activeTab === '2fa' && <TwoFactorAuthCard />}
 {activeTab === 'session-login' && <SessionLoginCard />}
 {activeTab === 'activity-login' && <ActivityLoginCard />}
 {activeTab === 'unit-tahun' && (
 <div className="space-y-6">
 {!canEditUnitAndRole && (
 <Alert status="warning" className="rounded-xl">
 <AlertIndicator>
 <Lock className="w-5 h-5" />
 </AlertIndicator>
 <AlertContent>
 <AlertTitle>Akses Terbatas: Pemilihan Unit Pendidikan & Tahun Ajaran</AlertTitle>
 <AlertDescription>
 Fitur pergantian Unit Pendidikan & Tahun Ajaran aktif <strong>terkunci</strong> dan tidak dapat diubah oleh role Anda. Akses ini hanya diberikan kepada <strong>Super Admin, Admin, Pengurus Yayasan, Kepala Sekolah, dan Divisi Pendidikan</strong>.
 </AlertDescription>
 </AlertContent>
 </Alert>
 )}
 <SelectUnitCard disabled={!canEditUnitAndRole} />
 <SelectAcademicYearCard disabled={!canEditUnitAndRole} />
 </div>
 )}
 </motion.div>
 </motion.div>
 </PageContainer>
 )
}
