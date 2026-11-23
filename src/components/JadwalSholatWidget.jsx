import React, { useState, useEffect } from 'react'
import { Clock, MapPin, Sparkles, RefreshCw, Sun, Moon, Sunrise, Sunset } from 'lucide-react'
import { equranService } from '../services/equranService'

export const JadwalSholatWidget = ({ kabkotaId = '1' }) => {
 const [jadwal, setJadwal] = useState(null)
 const [loading, setLoading] = useState(true)
 const [nextPrayer, setNextPrayer] = useState('')
 const [timeRemaining, setTimeRemaining] = useState('')

 const fetchJadwal = async () => {
 setLoading(true)
 const res = await equranService.getJadwalSholat(kabkotaId)
 if (res?.data) {
 setJadwal(res.data)
 calculateNextPrayer(res.data)
 }
 setLoading(false)
 }

 const calculateNextPrayer = (schedule) => {
 if (!schedule) return
 const now = new Date()
 const currentMinutes = now.getHours() * 60 + now.getMinutes()

 const prayers = [
 { name: 'Subuh', time: schedule.subuh },
 { name: 'Dzuhur', time: schedule.dzuhur },
 { name: 'Ashar', time: schedule.ashar },
 { name: 'Maghrib', time: schedule.maghrib },
 { name: 'Isya', time: schedule.isya },
 ]

 let found = false
 for (const p of prayers) {
 if (!p.time) continue
 const [h, m] = p.time.split(':').map(Number)
 const pMinutes = h * 60 + m
 if (pMinutes > currentMinutes) {
 setNextPrayer(p.name)
 const diff = pMinutes - currentMinutes
 const hrs = Math.floor(diff / 60)
 const mins = diff % 60
 setTimeRemaining(hrs > 0 ? `${hrs} jam ${mins} mnt lagi` : `${mins} mnt lagi`)
 found = true
 break
 }
 }

 if (!found) {
 setNextPrayer('Subuh Besok')
 setTimeRemaining('')
 }
 }

 useEffect(() => {
 fetchJadwal()
 const timer = setInterval(() => {
 if (jadwal) calculateNextPrayer(jadwal)
 }, 60000)
 return () => clearInterval(timer)
 }, [kabkotaId])

 const items = [
 { label: 'Subuh', key: 'subuh', icon: Sunrise, color: 'text-indigo-600 bg-indigo-50 border-emerald-200/80' },
 { label: 'Dzuhur', key: 'dzuhur', icon: Sun, color: 'text-amber-600 bg-amber-50 border-emerald-200/80' },
 { label: 'Ashar', key: 'ashar', icon: Sun, color: 'text-orange-600 bg-orange-50 border-emerald-200/80' },
 { label: 'Maghrib', key: 'maghrib', icon: Sunset, color: 'text-rose-600 bg-rose-50 border-emerald-200/80' },
 { label: 'Isya', key: 'isya', icon: Moon, color: 'text-purple-600 bg-purple-50 border-emerald-200/80' },
 ]

 const todayStr = new Date().toLocaleDateString('id-ID', {
 weekday: 'long',
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 })

 return (
 <div className="bg-white dark:bg-[#1B2433] rounded-xl p-6 shadow-xl relative overflow-hidden mb-6">
 {/* Subtle Background Pattern Decorative Effect */}
 <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
 <div className="absolute left-1/3 -top-12 w-36 h-36 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
 <div>
 <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
 <Sparkles className="w-4 h-4 text-emerald-400" />
 <span>Jadwal Sholat Harian • Data Resmi EQuran.id</span>
 </div>
 <h3 className="text-xl font-extrabold flex items-center gap-2">
 <MapPin className="w-5 h-5 text-emerald-300" />
 <span>{jadwal?.kabkota_name || 'DKI Jakarta & Sekitarnya'}</span>
 </h3>
 <p className="text-xs text-emerald-100/80 mt-0.5">{todayStr}</p>
 </div>

 <div className="flex items-center gap-3">
 {nextPrayer && (
 <div className="bg-emerald-700/60 backdrop-blur-md border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2">
 <Clock className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
 <span>
 Menjelang <strong className="text-emerald-200 font-bold">{nextPrayer}</strong> {timeRemaining && `(${timeRemaining})`}
 </span>
 </div>
 )}

 <button
 onClick={fetchJadwal}
 disabled={loading}
 title="Refresh Jadwal Sholat"
 className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50"
 >
 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
 </button>
 </div>
 </div>

 {/* Grid Prayer Times */}
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
 {items.map((item) => {
 const IconComp = item.icon
 const isNext = nextPrayer === item.label
 const timeVal = jadwal ? jadwal[item.key] : '--:--'

 return (
 <div
 key={item.key}
 className={`rounded-xl p-3.5 transition-all flex flex-col items-center justify-center text-center border backdrop-blur-md ${
 isNext
 ? 'bg-white text-slate-900 border-emerald-200/80 dark:border-emerald-800/60 shadow-lg scale-105 ring-2 ring-emerald-400'
 : 'bg-white/10 border-emerald-200/15 hover:bg-white/15'
 }`}
 >
 <div className={`p-2 rounded-lg mb-1.5 ${isNext ? 'bg-emerald-100 text-emerald-700' : 'bg-white/10 text-emerald-200'}`}>
 <IconComp className="w-4 h-4" />
 </div>
 <span className={`text-xs font-semibold ${isNext ? 'text-slate-700' : 'text-emerald-100/90'}`}>{item.label}</span>
 <span className={`text-base font-extrabold tracking-tight mt-0.5 ${isNext ? 'text-emerald-800' : 'text-white'}`}>
 {timeVal}
 </span>
 </div>
 )
 })}
 </div>
 </div>
 )
}
