import React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

const STEP_PASTEL_STYLES = [
 {
 // Step 1: Sky Blue (Pilih Jadwal)
 active: 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/30 scale-[1.02]',
 done: 'bg-sky-100/90 text-sky-800 border-emerald-200/80 hover:bg-sky-200/90 dark:bg-sky-950/80 dark:text-sky-300 dark:border-emerald-800/60',
 inactive: 'bg-slate-50/80 text-slate-600 border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900/60 dark:text-slate-400 dark:border-emerald-800/60',
 badgeActive: 'bg-white text-sky-700',
 iconDone: 'text-sky-600 dark:text-sky-400',
 },
 {
 // Step 2: Emerald Green (Checklist / QR)
 active: 'bg-emerald-600 text-white border-slate-600 shadow-sm scale-[1.02]',
 done: 'bg-emerald-100/90 text-emerald-800 border-emerald-200/80 hover:bg-emerald-200/90 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60',
 inactive: 'bg-slate-50/80 text-slate-600 border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900/60 dark:text-slate-400 dark:border-emerald-800/60',
 badgeActive: 'bg-white text-emerald-700',
 iconDone: 'text-emerald-600 dark:text-emerald-400',
 },
 {
 // Step 3: Amber / Orange (Review Roster)
 active: 'bg-amber-500 text-white border-emerald-200/80 dark:border-emerald-800/60 shadow-sm scale-[1.02]',
 done: 'bg-amber-100/90 text-amber-800 border-emerald-200/80 hover:bg-amber-200/90 dark:bg-amber-950/80 dark:text-amber-300 dark:border-emerald-800/60',
 inactive: 'bg-slate-50/80 text-slate-600 border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900/60 dark:text-slate-400 dark:border-emerald-800/60',
 badgeActive: 'bg-white text-amber-700',
 iconDone: 'text-amber-600 dark:text-amber-400',
 },
 {
 // Step 4: Indigo / Violet (Finalisasi)
 active: 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[1.02]',
 done: 'bg-emerald-100/90 text-emerald-800 border-emerald-200/80 hover:bg-emerald-200/90 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60',
 inactive: 'bg-slate-50/80 text-slate-600 border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900/60 dark:text-slate-400 dark:border-emerald-800/60',
 badgeActive: 'bg-white text-emerald-700',
 iconDone: 'text-emerald-600 dark:text-emerald-400',
 },
]

export function WorkflowStepBar({ steps, currentStepIndex, onNextStep, moduleName }) {
 const navigate = useNavigate()

 const handleStepClick = (step, index) => {
 if (step.onClick) {
 step.onClick()
 } else if (step.link) {
 navigate(step.link)
 }
 }

 const nextStep = steps[currentStepIndex + 1]

 return (
 <div className="mb-6 rounded-xl border border-emerald-200/80 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
 <div className="flex items-center gap-2">
 <span className="flex h-6 px-2.5 items-center justify-center rounded-full bg-emerald-100/90 text-xs font-black uppercase tracking-wider text-[#059669] border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60">
 Flow
 </span>
 <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
 Alur Kerja: {moduleName || 'Modul Sistem'}
 </h4>
 </div>
 {nextStep && (
 <motion.button
 whileHover={{ scale: 1.03, y: -1 }}
 whileTap={{ scale: 0.97 }}
 type="button"
 onClick={() => handleStepClick(nextStep, currentStepIndex + 1)}
 className="inline-flex items-center gap-2 rounded-xl bg-[#059669] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#167856] transition-colors cursor-pointer dark:bg-[#059669] dark:hover:bg-[#167856]"
 >
 <span>Langkah Berikutnya: {nextStep.label}</span>
 <ArrowRight className="h-3.5 w-3.5" />
 </motion.button>
 )}
 </div>

 <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
 {steps.map((step, idx) => {
 const isDone = idx < currentStepIndex
 const isCurrent = idx === currentStepIndex
 const theme = STEP_PASTEL_STYLES[idx % STEP_PASTEL_STYLES.length]

 return (
 <React.Fragment key={idx}>
 <motion.button
 whileHover={{ scale: 1.04, y: -1 }}
 whileTap={{ scale: 0.96 }}
 transition={{ type: 'spring', stiffness: 450, damping: 25 }}
 type="button"
 onClick={() => handleStepClick(step, idx)}
 className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap border ${
 isCurrent
 ? theme.active
 : isDone
 ? theme.done
 : theme.inactive
 }`}
 >
 {isDone ? (
 <CheckCircle2 className={`h-4 w-4 ${theme.iconDone}`} />
 ) : (
 <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-black ${
 isCurrent
 ? theme.badgeActive
 : 'bg-slate-200/80 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {idx + 1}
 </span>
 )}
 <span>{step.label}</span>
 </motion.button>

 {idx < steps.length - 1 && (
 <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
 )}
 </React.Fragment>
 )
 })}
 </div>
 </div>
 )
}

WorkflowStepBar.propTypes = {
 steps: PropTypes.arrayOf(
 PropTypes.shape({
 label: PropTypes.string.isRequired,
 link: PropTypes.string,
 onClick: PropTypes.func,
 })
 ).isRequired,
 currentStepIndex: PropTypes.number.isRequired,
 onNextStep: PropTypes.func,
 moduleName: PropTypes.string,
}

export default WorkflowStepBar
