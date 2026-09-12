import React, { useMemo, useRef, useEffect } from 'react'
import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Sparkles } from 'lucide-react'
import AppBreadcrumb from '../app/AppBreadcrumb'

export default function AcademicModuleContainer({ title, description, tabs, hideHeader = false, tabsBelowKpi = false, breadcrumbItems = [], children }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab')
  const activeTabRef = useRef(null)

  const tabLinks = useMemo(() => tabs.map((tab) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', tab.key)
    return { ...tab, to: `${location.pathname}?${params.toString()}` }
  }), [location.pathname, searchParams, tabs])

  // Tab menu dibuat stabil (wrap) tanpa pergeseran horizontal kiri-kanan
  const renderNav = (extraActions = null) => (
    <nav
      aria-label={`Tab ${title}`}
      className="rounded-[20px] border border-emerald-500/20 bg-emerald-50/50 p-3 shadow-xs dark:border-emerald-900/40 dark:bg-[#13221f] flex flex-col gap-3 w-full"
    >
      <div className="w-full">
        <div
          role="tablist"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 w-full"
        >
          {tabLinks.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.key
            return (
              <NavLink
                key={tab.key}
                to={tab.to}
                ref={isSelected ? activeTabRef : null}
                role="tab"
                aria-selected={isSelected}
                className={`group relative flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 min-h-[48px] w-full transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-400/40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                    : 'border-slate-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-slate-800 dark:bg-[#111827] dark:hover:bg-slate-800/80'
                }`}
              >
                {Icon && (
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs ${
                    isSelected ? 'bg-white/20 text-white' : (tab.squircleStyle || 'bg-emerald-100 text-emerald-600')
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                )}
                <div className="flex flex-col pr-0.5 min-w-0 flex-1 overflow-hidden">
                  <span className={`text-xs font-extrabold tracking-tight truncate transition-colors ${
                    isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                  }`}>
                    {tab.label}
                  </span>
                  {tab.description && (
                    <span className={`text-[10px] font-medium leading-none mt-0.5 truncate ${
                      isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {tab.description}
                    </span>
                  )}
                </div>
              </NavLink>
            )
          })}
        </div>
      </div>
      {extraActions && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          {extraActions}
        </div>
      )}
    </nav>
  )

  const tabNavElement = renderNav()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  }

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <motion.div variants={itemVariants}>
          <AppBreadcrumb items={breadcrumbItems} />
        </motion.div>
      )}
      {!hideHeader && (
        <motion.header variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <GraduationCap className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Akademik &amp; LMS
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">{description}</p>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {!tabsBelowKpi && <motion.div variants={itemVariants}>{tabNavElement}</motion.div>}

      <motion.div variants={itemVariants} className="academic-module-content">
        {tabsBelowKpi && React.isValidElement(children)
          ? React.cloneElement(children, { tabNav: renderNav })
          : children}
      </motion.div>
    </motion.section>
  )
}
