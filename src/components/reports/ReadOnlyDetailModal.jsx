import React from 'react'
import { ShieldCheck, Info } from 'lucide-react'
import AppModal from '../app/AppModal'

export function ReadOnlyDetailModal({ isOpen, onClose, title = 'Rincian Detail Data', data = null }) {
  if (!isOpen || !data) return null

  return (
    <AppModal
      isOpen={Boolean(isOpen && data)}
      onClose={onClose}
      title={title}
      description="Mode Read-Only Pengurus Yayasan"
      icon={ShieldCheck}
      maxWidth="max-w-3xl"
      variant="emerald"
      zIndex={60}
      bodyClassName="space-y-4"
      footer={
        <div className="flex w-full items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Info className="h-3.5 w-3.5 text-emerald-600" />
            <span>Data tidak dapat diubah dari role ini.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black transition-all cursor-pointer active:scale-95"
          >
            Tutup
          </button>
        </div>
      }
    >
      {data && (
        typeof data === 'object' && !Array.isArray(data) ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(data).map(([key, val], idx) => {
              if (key === 'id' || key === 'is_guru') return null

              if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                return (
                  <div key={idx} className="sm:col-span-2 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-slate-50/50 p-4 dark:bg-slate-900/40 space-y-2">
                    <h4 className="font-extrabold text-xs uppercase text-[#059669] dark:text-emerald-400 border-b border-emerald-200/80 pb-1 dark:border-emerald-800/60">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Object.entries(val).map(([subK, subV], sIdx) => (
                        <div key={sIdx}>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">{subK.replace(/_/g, ' ')}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{typeof subV === 'object' ? JSON.stringify(subV) : (subV || '-')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <div key={idx} className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-slate-50/40 p-3 dark:bg-slate-900/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{key.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{typeof val === 'object' ? JSON.stringify(val) : (val || '-')}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <pre className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-slate-50 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-200 font-mono text-xs overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )
      )}
    </AppModal>
  )
}
export default ReadOnlyDetailModal
