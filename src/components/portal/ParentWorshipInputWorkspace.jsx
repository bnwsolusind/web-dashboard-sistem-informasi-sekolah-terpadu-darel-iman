import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 CheckCircle2,
 Home,
 Save,
 Calendar,
 Info,
 Loader2,
 Sparkles,
 AlertCircle,
 X,
} from 'lucide-react'
import {
 Card as HeroCard,
 Chip as HeroChip,
 Button as HeroButton,
} from '@heroui/react'
import { cn } from '../../lib/utils'
import { DatePicker } from '@/components/ui/date-picker'
import api from '../../services/api'

// Status option structure — not hardcoded labels, but structured status mappings
const STATUS_OPTIONS = [
 { value: 'good', label: 'Terlaksana', activeStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white shadow-sm' },
 { value: 'less', label: 'Kurang', activeStyle: 'bg-white dark:bg-[#1B2433] shadow-sm' },
 { value: 'not_done', label: 'Belum', activeStyle: 'bg-white dark:bg-[#1B2433] shadow-sm' },
 { value: 'na', label: 'Uzur / N/A', activeStyle: 'bg-white dark:bg-[#1B2433] shadow-sm shadow-slate-400/20' },
]

export default function ParentWorshipInputWorkspace({ studentId }) {
 const [context, setContext] = useState(null)
 const [values, setValues] = useState({})
 const [notes, setNotes] = useState({})
 const [submitFeedback, setSubmitFeedback] = useState(null)
 const [saving, setSaving] = useState(false)
 const [date, setDate] = useState(
 () => new Intl.DateTimeFormat('en-CA').format(new Date())
 )

 const load = async () => {
 setSubmitFeedback(null)
 try {
 const r = await api.get(
 `/portal/children/${studentId}/worship-input`,
 { params: { date } }
 )
 const data = r.data?.data || null
 setContext(data)
 if (data?.items && Array.isArray(data.items)) {
 const initialVals = {}
 const initialNotes = {}
 data.items.forEach((item) => {
 if (item.status_value)
 initialVals[item.agenda_item_id] = item.status_value
 if (item.notes)
 initialNotes[item.agenda_item_id] = item.notes
 })
 setValues(initialVals)
 setNotes(initialNotes)
 }
 } catch (e) {
 setSubmitFeedback({
 type: 'error',
 message:
 e.response?.data?.message ||
 'Agenda ibadah rumah belum dapat dimuat.',
 })
 }
 }

 useEffect(() => {
 if (studentId) load()
 }, [studentId, date])

 const save = async () => {
 const items = Object.entries(values).map(
 ([agenda_item_id, status_value]) => ({
 agenda_item_id,
 status_value,
 notes: notes[agenda_item_id] || null,
 })
 )
 if (!items.length) return
 setSaving(true)
 setSubmitFeedback(null)
 try {
 await api.post(`/portal/children/${studentId}/worship-input`, {
 date,
 items,
 })
 setSubmitFeedback({
 type: 'success',
 message: 'Alhamdulillah, mutabaah ibadah rumah berhasil disimpan.',
 })
 await load()
 } catch (e) {
 setSubmitFeedback({
 type: 'error',
 message:
 e.response?.data?.message || 'Mutabaah gagal disimpan.',
 })
 } finally {
 setSaving(false)
 }
 }

 const isEditable =
 context?.can_parent_input !== false && context?.can_edit !== false

 const periodLabel =
 context?.period?.name || context?.period_label || null
 const programLabel =
 context?.program === 'boarding'
 ? 'Boarding / Asrama'
 : context?.program === 'fullday'
 ? 'Fullday'
 : context?.program
 ? context.program.charAt(0).toUpperCase() +
 context.program.slice(1)
 : null

 const formatDisplayDate = (val) => {
 if (!val) return '-'
 try {
 return new Intl.DateTimeFormat('id-ID', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 }).format(new Date(val))
 } catch {
 return String(val)
 }
 }

 return (
 <div className="space-y-5">
 {/* HERO HEADER */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-16 -bottom-16 h-52 w-52 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="absolute inset-0 opacity-[.04] [background-image:radial-gradient(circle_at_2px_2px,#7c3aed_1.5px,transparent_0)] [background-size:24px_24px]"
 />

 <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
 <div className="flex items-center gap-3.5">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xl shadow-sm">
 <Home className="h-6 w-6" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <HeroChip
 size="sm"
 variant="flat"
 className="font-extrabold text-[10.5px] bg-purple-500/20 border border-emerald-200/80 dark:border-emerald-800/60 text-purple-800 dark:text-purple-300"
 >
 <Sparkles className="h-3 w-3 text-purple-600 mr-1 inline" />
 Ibadah Rumah
 </HeroChip>
 {periodLabel && (
 <HeroChip
 size="sm"
 variant="flat"
 className="font-black text-[10px] bg-white/70 text-slate-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 dark:border-emerald-700/80"
 >
 {periodLabel}
 </HeroChip>
 )}
 {programLabel && (
 <HeroChip
 size="sm"
 variant="flat"
 className="font-black text-[10px] bg-violet-100 text-violet-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300 dark:border-emerald-800/60"
 >
 {programLabel}
 </HeroChip>
 )}
 </div>
 <h3 className="mt-1 text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
 Input Mutaba'ah di Rumah
 </h3>
 </div>
 </div>
 <div className="flex items-center gap-2.5 shrink-0">
 <DatePicker
 value={date}
 onChange={(e) => setDate(e.target.value)}
 className="w-40"
 inputClassName="py-2 text-xs font-bold"
 />
 </div>
 </div>

 {/* Current Date Info */}
 <p className="relative mt-3 text-xs font-medium text-purple-700/70 dark:text-purple-400/70">
 {formatDisplayDate(date)}
 </p>
 </HeroCard>

 {/* Feedback Alert Banner */}
 <AnimatePresence>
 {submitFeedback && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 transition={{ duration: 0.2 }}
 >
 <div
 className={cn(
 'flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-semibold',
 submitFeedback.type === 'success'
 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/60'
 : 'bg-rose-50 text-rose-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/80 dark:text-rose-200 dark:border-emerald-800/60'
 )}
 >
 {submitFeedback.type === 'success' ? (
 <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
 ) : (
 <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
 )}
 <span className="flex-1">{submitFeedback.message}</span>
 <button
 type="button"
 onClick={() => setSubmitFeedback(null)}
 className="shrink-0 cursor-pointer"
 >
 <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Non-Editable Notice */}
 {!isEditable && (
 <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 p-3.5 text-xs text-amber-900 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-200">
 <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
 <span>
 {context?.header_status && context.header_status !== 'draft'
 ? 'Agenda hari ini telah difinalisasi oleh pembimbing dan tidak dapat diubah lagi.'
 : 'Mode saat ini adalah pemantauan laporan (bukan input orang tua).'}
 </span>
 </div>
 )}

 {/* MAIN CARD - ACTIVITY LIST */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="grid gap-3 md:grid-cols-2">
 {(context?.items || []).map((item) => {
 const currentVal = values[item.agenda_item_id]
 const locationLabel = item.location || null
 const needsVerification = item.requires_verification || false

 return (
 <motion.div
 key={item.agenda_item_id}
 whileHover={{ scale: 1.005 }}
 transition={{ duration: 0.15 }}
 className="rounded-xl border-2 border-emerald-200/80 bg-white p-4 transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-800/40 dark:hover:border-emerald-700"
 >
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0 flex-1">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {item.name}
 </p>
 <p className="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
 {locationLabel ? `Lokasi: ${locationLabel}` : ''}
 {needsVerification
 ? `${locationLabel ? ' · ' : ''}Perlu verifikasi pembimbing`
 : ''}
 </p>
 </div>
 {item.verification_status && (
 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'shrink-0 font-extrabold text-[9px]',
 item.verification_status === 'verified'
 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'bg-amber-100 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
 )}
 >
 {item.verification_status === 'verified'
 ? 'Terverifikasi'
 : 'Menunggu'}
 </HeroChip>
 )}
 </div>
 <div className="mt-3 flex flex-wrap gap-1.5">
 {STATUS_OPTIONS.map(({ value, label, activeStyle }) => (
 <button
 type="button"
 key={value}
 disabled={!isEditable}
 onClick={() =>
 setValues({
 ...values,
 [item.agenda_item_id]: value,
 })
 }
 className={cn(
 'rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
 currentVal === value
 ? activeStyle
 : 'border-2 border-emerald-200/80 bg-white text-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-purple-50/40 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:border-emerald-700',
 'disabled:opacity-50 disabled:cursor-not-allowed'
 )}
 >
 {label}
 </button>
 ))}
 </div>
 </motion.div>
 )
 })}
 </div>

 {/* Empty State */}
 {context && (!context.items || context.items.length === 0) && (
 <div className="py-14 text-center space-y-2">
 <Home className="mx-auto h-10 w-10 text-purple-300 dark:text-purple-700" />
 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
 Belum Ada Aktivitas Rumah
 </p>
 <p className="text-xs text-slate-400 max-w-sm mx-auto">
 Belum ada aktivitas rumah yang ditugaskan kepada orang tua untuk
 tanggal ini.
 </p>
 </div>
 )}

 {/* Save Button */}
 {context?.items?.length > 0 && isEditable && (
 <div className="mt-6 flex justify-end">
 <HeroButton
 isDisabled={saving || !Object.keys(values).length}
 onPress={save}
 className={cn(
 'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg transition-all cursor-pointer',
 saving
 ? 'bg-slate-400 opacity-70 cursor-not-allowed'
 : 'bg-white dark:bg-[#1B2433] shadow-sm hover:scale-[1.02]'
 )}
 >
 {saving ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
 </>
 ) : (
 <>
 <Save className="h-4 w-4" /> Simpan Ibadah Rumah
 </>
 )}
 </HeroButton>
 </div>
 )}
 </HeroCard>
 </div>
 )
}
