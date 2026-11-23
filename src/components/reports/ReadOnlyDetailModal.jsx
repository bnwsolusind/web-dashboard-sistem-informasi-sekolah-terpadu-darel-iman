import React from 'react'
import { ShieldCheck, Info } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Backdrop, OverlayWrapper } from '@/components/ui/overlay'
import { Button } from '@/components/ui/button'

export function ReadOnlyDetailModal({ isOpen, onClose, title = 'Rincian Detail Data', data = null }) {
 if (!isOpen || !data) return null

 return (
 <OverlayWrapper isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
 <Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()} />
 <Dialog className="max-w-xl">
 <DialogHeader>
 <div className="flex items-center gap-2">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
 <ShieldCheck className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle>{title}</DialogTitle>
 <DialogDescription>Mode Read-Only Pengurus Yayasan</DialogDescription>
 </div>
 </div>
 <DialogClose onClick={onClose} />
 </DialogHeader>

 <DialogBody className="space-y-4 py-4 max-h-[65vh] overflow-y-auto">
 {typeof data === 'object' && !Array.isArray(data) ? (
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 {Object.entries(data).map(([key, val], idx) => {
 if (key === 'id' || key === 'is_guru') return null

 if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
 return (
 <div key={idx} className="sm:col-span-2 rounded-xl border border-emerald-200/80 bg-slate-50/50 p-4 dark:border-emerald-800/60 dark:bg-slate-900/40 space-y-2">
 <h4 className="font-bold text-xs uppercase text-[#059669] dark:text-emerald-400 border-b border-emerald-200/80 pb-1 dark:border-emerald-800/60">
 {key.replace(/_/g, ' ')}
 </h4>
 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
 {Object.entries(val).map(([subK, subV], sIdx) => (
 <div key={sIdx}>
 <span className="text-[10px] font-semibold text-slate-400 uppercase block">{subK.replace(/_/g, ' ')}</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">{typeof subV === 'object' ? JSON.stringify(subV) : (subV || '-')}</span>
 </div>
 ))}
 </div>
 </div>
 )
 }

 return (
 <div key={idx} className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/40 p-3 dark:border-emerald-800/80 dark:bg-slate-900/20">
 <span className="text-[10px] font-semibold text-slate-400 uppercase block">{key.replace(/_/g, ' ')}</span>
 <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{typeof val === 'object' ? JSON.stringify(val) : (val || '-')}</span>
 </div>
 )
 })}
 </div>
 ) : (
 <pre className="rounded-xl bg-slate-50 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-200 font-mono text-xs overflow-x-auto">
 {JSON.stringify(data, null, 2)}
 </pre>
 )}
 </DialogBody>

 <DialogFooter className="flex items-center justify-between">
 <div className="flex items-center gap-1.5 text-xs text-slate-400">
 <Info className="h-3.5 w-3.5" />
 <span>Data tidak dapat diubah dari role ini.</span>
 </div>

 <Button variant="ghost" onClick={onClose}>
 Tutup
 </Button>
 </DialogFooter>
 </Dialog>
 </OverlayWrapper>
 )
}

