import React from 'react'
import { AlertCircle, Receipt, MessageCircle, RefreshCw } from 'lucide-react'

const GATE_MESSAGES = {
  CHILD_NIS_NOT_FOUND: {
    title: 'Data NIS Belum Terdaftar di SIPDEI',
    body: 'Data NIS anak belum terdaftar atau belum ditemukan di SIPDEI. Silakan hubungi Tata Usaha untuk pemeriksaan dan pendaftaran data.',
    tone: 'rose',
  },
  CHILD_NIS_AMBIGUOUS: {
    title: 'Verifikasi Data NIS Diperlukan',
    body: 'Data NIS memerlukan verifikasi Tata Usaha.',
    tone: 'rose',
  },
  CHILD_PAYMENT_UNPAID: {
    title: 'Tagihan SPP Belum Dibayar',
    body: 'Tagihan SPP periode berjalan belum dibayar. Silakan buka menu Pembayaran untuk menyelesaikan tagihan.',
    tone: 'amber',
  },
  CHILD_PAYMENT_PARTIAL: {
    title: 'Tagihan SPP Baru Dibayar Sebagian',
    body: 'Tagihan SPP periode berjalan belum dibayar. Silakan buka menu Pembayaran untuk menyelesaikan tagihan.',
    tone: 'amber',
  },
  CHILD_STATUS_PENDING_VERIFICATION: {
    title: 'Status Pembayaran Menunggu Verifikasi',
    body: 'Status pembayaran sedang menunggu verifikasi. Silakan coba kembali beberapa saat lagi.',
    tone: 'sky',
  },
}

export default function PortalGateLockBanner({ gate, onOpenBills, onOpenChat, onRefresh }) {
  if (!gate || (gate.allowed !== false && !gate.gate_blocked)) return null

  const code = gate.gate_code || 'CHILD_PAYMENT_UNPAID'
  const info = GATE_MESSAGES[code] || {
    title: 'Akses Fitur Operasional Dibatasi',
    body: gate.reason || gate.message || 'Silakan periksa status pembayaran pada menu Pembayaran.',
    tone: 'amber',
  }

  const toneClass =
    info.tone === 'rose'
      ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/70 dark:bg-rose-950/30'
      : info.tone === 'sky'
        ? 'border-sky-300 dark:border-sky-800/80 bg-sky-50/70 dark:bg-sky-950/30'
        : 'border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30'

  return (
    <div className={`rounded-[22px] border-2 p-6 shadow-sm space-y-4 ${toneClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs">
            <AlertCircle className={`h-6 w-6 ${info.tone === 'rose' ? 'text-rose-600' : info.tone === 'sky' ? 'text-sky-600' : 'text-amber-600'}`} />
          </div>
          <div className="space-y-1.5">
            <span className="inline-flex items-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {code}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {info.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {info.body}
            </p>
            {gate.student && (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Siswa: <strong className="text-slate-800 dark:text-slate-200">{gate.student.full_name}</strong> ({gate.student.nis || '-'}) · {gate.student.unit_name || '-'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {typeof onOpenBills === 'function' && (
          <button
            type="button"
            onClick={onOpenBills}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-extrabold shadow-xs transition cursor-pointer"
          >
            <Receipt className="h-4 w-4" />
            <span>Buka Menu Pembayaran</span>
          </button>
        )}
        {typeof onOpenChat === 'function' && (
          <button
            type="button"
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-extrabold shadow-xs transition cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Hubungi Tata Usaha</span>
          </button>
        )}
        {typeof onRefresh === 'function' && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Periksa Ulang</span>
          </button>
        )}
      </div>
    </div>
  )
}

