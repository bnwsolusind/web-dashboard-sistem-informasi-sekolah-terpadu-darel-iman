import { useState } from 'react'
import { FiEye, FiEyeOff, FiClock, FiCheckCircle, FiAlertTriangle, FiXCircle, FiHelpCircle, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import AppModal from '../app/AppModal'
import { authService } from '../../services/authService'
import { Button } from '@/components/ui/button'
import { Alert, AlertContent, AlertDescription, AlertIndicator } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'

export default function ChangePasswordCard() {
 const [form, setForm] = useState({
 oldPassword: '',
 newPassword: '',
 confirmPassword: '',
 })
 const [showOld, setShowOld] = useState(false)
 const [showNew, setShowNew] = useState(false)
 const [showConfirm, setShowConfirm] = useState(false)
 const [loading, setLoading] = useState(false)
 const [updated, setUpdated] = useState(false)
 const [alertState, setAlertState] = useState(null)
 const [helpModalOpen, setHelpModalOpen] = useState(false)

 const handleSubmit = async (e) => {
 e.preventDefault()
 setAlertState(null)

 if (form.newPassword !== form.confirmPassword) {
 setAlertState({
 status: 'warning',
 message: 'Konfirmasi password tidak cocok. Password baru dan konfirmasi harus sama.',
 })
 return
 }

 if (form.newPassword.length < 8) {
 setAlertState({
 status: 'warning',
 message: 'Password baru kurang panjang. Minimal harus 8 karakter.',
 })
 return
 }

 setLoading(true)
 try {
 await authService.changePassword({
 current_password: form.oldPassword,
 password: form.newPassword,
 password_confirmation: form.confirmPassword,
 })

 setUpdated(true)
 setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
 setAlertState({
 status: 'success',
 message: 'Password Anda telah berhasil diperbarui di server database.',
 })
 setTimeout(() => {
 setUpdated(false)
 setAlertState(null)
 }, 4000)
 } catch (err) {
 console.error('Gagal ganti password:', err)
 const msg = err.response?.data?.message || 'Gagal mengubah password. Pastikan password lama Anda benar.'
 setAlertState({ status: 'error', message: msg })
 } finally {
 setLoading(false)
 }
 }

 const handleForgotCurrentPassword = () => {
 setHelpModalOpen(true)
 }

 return (
 <Card className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 lg:p-8 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Left Form: Ubah Password */}
 <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xs border border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60">
 <div className="border-b border-emerald-100/80 dark:border-emerald-800/60 pb-4 mb-6">
 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ubah Password</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 Pastikan password baru Anda kuat dan mudah diingat.
 </p>
 </div>

 {alertState && (
 <Alert status={alertState.status} className="mb-5 rounded-xl">
 <AlertIndicator>
 {alertState.status === 'success' ? (
 <FiCheckCircle className="w-4 h-4" />
 ) : alertState.status === 'warning' ? (
 <FiAlertTriangle className="w-4 h-4" />
 ) : (
 <FiXCircle className="w-4 h-4" />
 )}
 </AlertIndicator>
 <AlertContent>
 <AlertDescription>{alertState.message}</AlertDescription>
 </AlertContent>
 </Alert>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Password Lama */}
 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
 Password Saat Ini (Lama)
 </label>
 <button
 type="button"
 onClick={handleForgotCurrentPassword}
 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 hover:underline focus:outline-none"
 >
 Lupa password lama?
 </button>
 </div>
 <div className="relative">
 <input
 type={showOld ? 'text' : 'password'}
 value={form.oldPassword}
 onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
 placeholder="Masukkan password saat ini"
 className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs pr-10"
 required
 />
 <button
 type="button"
 onClick={() => setShowOld(!showOld)}
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
 title={showOld ? 'Sembunyikan password' : 'Tampilkan password'}
 >
 {showOld ? <FiEyeOff className="w-4 h-4 text-emerald-600" /> : <FiEye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 {/* Password Baru */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Password Baru
 </label>
 <div className="relative">
 <input
 type={showNew ? 'text' : 'password'}
 value={form.newPassword}
 onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
 placeholder="Masukkan password baru (minimal 8 karakter)"
 className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs pr-10"
 required
 minLength={8}
 />
 <button
 type="button"
 onClick={() => setShowNew(!showNew)}
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
 title={showNew ? 'Sembunyikan password' : 'Tampilkan password'}
 >
 {showNew ? <FiEyeOff className="w-4 h-4 text-emerald-600" /> : <FiEye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 {/* Konfirmasi Password Baru */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Konfirmasi Password Baru
 </label>
 <div className="relative">
 <input
 type={showConfirm ? 'text' : 'password'}
 value={form.confirmPassword}
 onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
 placeholder="Ulangi password baru Anda"
 className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs pr-10"
 required
 minLength={8}
 />
 <button
 type="button"
 onClick={() => setShowConfirm(!showConfirm)}
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
 title={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
 >
 {showConfirm ? <FiEyeOff className="w-4 h-4 text-emerald-600" /> : <FiEye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 <div className="pt-2 flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 <Button
 type="submit"
 variant="primary"
 size="sm"
 pending={loading}
 disabled={loading}
 >
 {loading ? 'Menyimpan...' : 'Update Password'}
 </Button>
 </div>
 </form>
 </div>

 {/* Right Card: Riwayat Perubahan */}
 <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xs border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-emerald-100/80 dark:border-emerald-800/60 pb-3 mb-4 flex items-center gap-2">
 <FiClock className="text-emerald-700 dark:text-emerald-400" />
 <span>Ketentuan Keamanan Password</span>
 </h3>

 <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
 <div className="flex items-start gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
 <p>Minimal 8 karakter.</p>
 </div>
 <div className="flex items-start gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
 <p>Kombinasi huruf besar, huruf kecil, dan angka.</p>
 </div>
 <div className="flex items-start gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
 <p>Hindari kata sandi yang mudah ditebak.</p>
 </div>
 </div>
 </div>

 <div className="mt-6 pt-4 border-t border-emerald-100/80 dark:border-emerald-800/60 text-xs text-slate-500 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="font-medium text-slate-700 dark:text-slate-300 block">Informasi Keamanan:</span>
 Perubahan password memerlukan autentikasi password lama Anda yang aktif.
 </div>
 </div>
 </div>

 {/* Help Modal */}
      <AppModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="Lupa Password Lama?"
        badge="Bantuan Keamanan"
        description="Informasi reset kata sandi akun pengguna"
        icon={FiHelpCircle}
        maxWidth="max-w-md"
        zIndex={70}
        bodyClassName="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
        footer={
          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={() => setHelpModalOpen(false)}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
            >
              <span>Saya Mengerti</span>
            </button>
          </div>
        }
      >
 <p>
 Demi keamanan sistem, password asli Anda tersimpan dalam bentuk terenkripsi (hash <i>bcrypt</i>) di database server sehingga tidak dapat dibaca kembali dalam bentuk teks biasa.
 </p>
 <p>
 Jika Anda lupa password lama yang sedang aktif, silakan hubungi <strong>Administrator Sistem / Tata Usaha Sekolah</strong> untuk melakukan reset password akun Anda secara resmi.
 </p>
      </AppModal>
 </Card>
 )
}

