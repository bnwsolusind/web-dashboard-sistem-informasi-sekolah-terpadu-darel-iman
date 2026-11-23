import { useRef, useState, useEffect } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { FiCamera, FiCheck, FiAlertTriangle, FiXCircle } from 'react-icons/fi'
import PersonAvatar from '../ui/PersonAvatar'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/authService'
import { educationUnitService } from '../../services/educationUnitService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertContent, AlertDescription, AlertIndicator } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'

export default function UserProfileCard() {
 const { user, setSession, token, loginTime } = useAuthStore()
 const fileInputRef = useRef(null)
 const [unitOptions, setUnitOptions] = useState([])
 const [saving, setSaving] = useState(false)
 const [alertState, setAlertState] = useState(null)
 const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.role || user?.roles].filter(Boolean)
 const ALLOWED_ADMIN_ROLES = [
 'super admin', 'superadmin', 'super_admin',
 'admin',
 'pengurus yayasan', 'yayasan', 'ketua yayasan', 'ketua_yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan',
 'kepala sekolah', 'kepala_sekolah', 'kepsek',
 'divisi pendidikan', 'divisi_pendidikan'
 ]
 const canEditUnitAndRole = userRoles.some((r) => ALLOWED_ADMIN_ROLES.includes(String(typeof r === 'string' ? r : r?.name || r?.slug || '').toLowerCase()))
 const isSuperAdminAdminOrYayasan = userRoles.some((r) => {
 const roleStr = String(typeof r === 'string' ? r : r?.name || r?.slug || '').toLowerCase()
 return (
 roleStr.includes('super admin') ||
 roleStr.includes('superadmin') ||
 roleStr.includes('admin') ||
 roleStr.includes('yayasan')
 )
 })
 const isDivisiPendidikan = userRoles.some((r) => {
 const roleStr = String(typeof r === 'string' ? r : r?.name || r?.slug || '').toLowerCase()
 return roleStr.includes('divisi') || roleStr.includes('pendidikan')
 })
 const shouldHideRoleField = !isSuperAdminAdminOrYayasan && isDivisiPendidikan

 const formattedLoginTime = loginTime
 ? new Date(loginTime).toLocaleString('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 }) + ' WIB'
 : 'Sesi Aktif'

 const [profile, setProfile] = useState({
 fullName: user?.name || user?.fullName || '',
 nip: user?.nip || user?.employee?.niy || user?.employee?.nik || '',
 email: user?.email || '',
 phone: user?.phone || user?.employee?.no_hp || '',
 role: user?.role || user?.roles?.[0] || '',
 unit: user?.unit || user?.employee?.unit?.name || '',
 avatar: user?.avatar || user?.foto || user?.employee?.foto || null,
 })
 const [saved, setSaved] = useState(false)

 useEffect(() => {
 educationUnitService.getDaftar().then((res) => {
 const data = res?.data?.data || res?.data || []
 if (Array.isArray(data)) setUnitOptions(data)
 }).catch(() => {})

 authService.profile().then((res) => {
 const data = res?.data || res
 if (data) {
 setProfile({
 fullName: data.fullName || data.name || data.employee?.nama_lengkap || '',
 nip: data.employee?.niy || data.employee?.nik || data.nip || '',
 email: data.email || '',
 phone: data.phone || data.employee?.no_hp || '',
 role: Array.isArray(data.roles) && data.roles.length > 0 ? data.roles[0] : (data.role || data.employee?.position?.name || ''),
 unit: data.unit || data.employee?.unit?.name || '',
 avatar: data.foto || data.avatar || data.employee?.foto || null,
 })
 if (token) {
 setSession({
 token,
 user: {
 ...user,
 name: data.fullName || data.name || data.employee?.nama_lengkap,
 fullName: data.fullName || data.name || data.employee?.nama_lengkap,
 email: data.email,
 phone: data.phone || data.employee?.no_hp,
 avatar: data.foto || data.avatar || data.employee?.foto,
 unit: data.unit || data.employee?.unit?.name,
 },
 })
 }
 }
 }).catch((err) => {
 console.warn('Gagal memuat profil backend:', err)
 })
 }, [])

 const handlePhotoClick = () => {
 if (fileInputRef.current) {
 fileInputRef.current.click()
 }
 }

 const handleFileChange = async (e) => {
 const file = e.target.files?.[0]
 if (!file) return

 if (file.size > 2 * 1024 * 1024) {
 setAlertState({ status: 'warning', message: 'Ukuran foto terlalu besar. Maksimal adalah 2MB.' })
 e.target.value = ''
 return
 }

 const formData = new FormData()
 formData.append('foto', file)
 formData.append('avatar', file)

 try {
 const response = await authService.uploadAvatar(formData)
 const avatarUrl = response?.data?.foto || response?.data?.avatar || response?.foto || response?.avatar
 setProfile((prev) => ({ ...prev, avatar: avatarUrl }))

 if (token) {
 setSession({
 token,
 user: {
 ...user,
 avatar: avatarUrl,
 foto: avatarUrl,
 },
 })
 }
 setAlertState({
 status: 'success',
 message: 'Foto profil Anda telah disimpan ke server database.',
 })
 setTimeout(() => setAlertState(null), 4000)
 } catch (error) {
 console.error('Gagal upload avatar:', error)
 const msg = error?.response?.data?.message || 'Gagal mengunggah foto profil ke server.'
 setAlertState({ status: 'error', message: msg })
 } finally {
 if (e.target) e.target.value = ''
 }
 }

 const handleReset = () => {
 setProfile({
 fullName: user?.name || user?.fullName || '',
 nip: user?.nip || user?.employee?.niy || user?.employee?.nik || '',
 phone: user?.phone || user?.no_hp || '',
 email: user?.email || '',
 role: user?.role || (Array.isArray(user?.roles) ? user.roles[0] : ''),
 unit: user?.unit || user?.education_unit?.name || '',
 avatar: user?.foto || user?.avatar || '',
 })
 setAlertState(null)
 }

 const handleSubmit = async (e) => {
 e.preventDefault()
 setSaving(true)
 setAlertState(null)

 try {
 let uploadedAvatar = profile.avatar
 if (fileInputRef.current && fileInputRef.current.files[0]) {
 const formData = new FormData()
 formData.append('foto', fileInputRef.current.files[0])
 formData.append('avatar', fileInputRef.current.files[0])
 const uploadRes = await authService.uploadAvatar(formData)
 uploadedAvatar = uploadRes?.data?.foto || uploadRes?.data?.avatar || uploadRes?.foto || uploadRes?.avatar || uploadedAvatar
 }

 const payload = {
 name: profile.fullName,
 email: profile.email,
 phone: profile.phone,
 foto: uploadedAvatar,
 }

 if (canEditUnitAndRole) {
 if (!shouldHideRoleField && profile.role) {
 payload.role = profile.role
 }
 if (profile.unit) {
 payload.unit = profile.unit
 }
 }

 const response = await authService.updateProfile(payload)
 const updatedData = response?.data || response

 const updatedUser = {
 ...user,
 name: updatedData?.name || profile.fullName,
 fullName: updatedData?.fullName || updatedData?.name || profile.fullName,
 email: updatedData?.email || profile.email,
 phone: updatedData?.phone || profile.phone,
 role: profile.role || user?.role,
 unit: updatedData?.unit || profile.unit,
 avatar: updatedData?.foto || updatedData?.avatar || uploadedAvatar || profile.avatar,
 }

 setSession({ token, user: updatedUser })

 setSaved(true)
 setAlertState({
 status: 'success',
 message: 'Data profil dan informasi akun Anda telah disimpan permanen di database.',
 })
 setTimeout(() => {
 setSaved(false)
 setAlertState(null)
 }, 4000)
 } catch (error) {
 console.error('Update profile error:', error)
 const msg = error.response?.data?.message || 'Gagal menyimpan perubahan profil ke server.'
 setAlertState({ status: 'error', message: msg })
 } finally {
 setSaving(false)
 }
 }

 return (
 <Card className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 lg:p-8 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Hidden File Input for Avatar Upload */}
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileChange}
 accept="image/png, image/jpeg, image/jpg"
 className="hidden"
 />

 {/* Breadcrumb */}
 <div className="flex items-center text-xs text-slate-400 mb-6 gap-2 border-b border-emerald-100/80 dark:border-emerald-800/60 pb-3">
 <span>Dashboard</span>
 <span>/</span>
 <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Profil</span>
 </div>

 {alertState && (
 <Alert status={alertState.status} className="mb-6 rounded-xl">
 <AlertIndicator>
 {alertState.status === 'success' ? (
 <FiCheck className="w-4 h-4" />
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

 <form onSubmit={handleSubmit}>
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 {/* Left Avatar Card */}
 <div className="lg:col-span-4 bg-emerald-50/40 dark:bg-slate-800/40 p-6 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 flex flex-col items-center text-center">
 <div className="relative mb-4">
 <PersonAvatar src={profile.avatar} name={profile.fullName} size="profile" className="ring-4 ring-emerald-600/20" />
 <button
 type="button"
 onClick={handlePhotoClick}
 className="absolute bottom-0 right-0 p-2 bg-[#059669] hover:bg-[#094331] text-white rounded-full shadow-md border-2 border-emerald-200/80 transition-colors"
 title="Ganti Foto Profil"
 >
 <FiCamera className="w-3.5 h-3.5" />
 </button>
 </div>

 <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{profile.fullName}</h3>
 <div className="mt-1">
 <Badge color="emerald" size="sm">{profile.role}</Badge>
 </div>

 {/* Session Info Badge */}
 <div className="mt-3 w-full bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs text-xs text-slate-600 dark:text-slate-400 text-left space-y-1 font-mono">
 <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-400 font-semibold border-b border-emerald-100/80 dark:border-emerald-800/60 pb-1">
 <span>Waktu Login:</span>
 <Badge color="cyan" size="sm" className="text-[10px] py-0 font-sans">Browser Sesi</Badge>
 </div>
 <p className="text-slate-800 dark:text-slate-200 font-medium">{formattedLoginTime}</p>
 <p className="text-[10px] text-slate-400 font-sans mt-0.5">Batas inaktivitas: 15 menit</p>
 </div>

 <div className="mt-4 w-full pt-4 border-t border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
 <Button
 type="button"
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={handlePhotoClick}
 className="w-full flex items-center justify-center gap-2"
 >
 <FiCamera className="w-3.5 h-3.5 text-slate-500" />
 <span>Ubah Foto</span>
 </Button>
 <p className="text-[10px] text-slate-400">Maks. 2MB (JPG, PNG)</p>
 </div>
 </div>

 {/* Right Form Fields */}
 <div className="lg:col-span-8 space-y-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Nama Lengkap */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Nama Lengkap
 </label>
 <input
 type="text"
 value={profile.fullName}
 onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
 required
 />
 </div>

 {/* NIP / ID User */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 NIP / ID User
 </label>
 <input
 type="text"
 value={profile.nip}
 onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 cursor-not-allowed"
 disabled
 />
 </div>

 {/* Email */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Email
 </label>
 <input
 type="email"
 value={profile.email}
 onChange={(e) => setProfile({ ...profile, email: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
 required
 />
 </div>

 {/* No Handphone */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 No. Handphone
 </label>
 <input
 type="text"
 value={profile.phone}
 onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
 required
 />
 </div>

 {/* Role / Jabatan */}
 {!shouldHideRoleField && (
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
 <span>Role / Jabatan</span>
 {!canEditUnitAndRole && (
 <Badge color="warning" size="sm" className="py-0 px-2 text-[10px]">
 Terkunci
 </Badge>
 )}
 </label>
 <CustomSelect
 value={profile.role}
 onChange={(e) => setProfile({ ...profile, role: e.target.value })}
 disabled={!canEditUnitAndRole}
 className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs ${
 !canEditUnitAndRole ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
 }`}
 >
 <option value={profile.role}>{profile.role || 'Pilih Role'}</option>
 <option value="Super Admin">Super Admin</option>
 <option value="Admin">Admin</option>
 <option value="Pengurus Yayasan">Pengurus Yayasan</option>
 <option value="Kepala Sekolah">Kepala Sekolah</option>
 <option value="Divisi Pendidikan">Divisi Pendidikan</option>
 <option value="Guru">Guru</option>
 <option value="Tata Usaha">Tata Usaha</option>
 <option value="Operator">Operator</option>
 <option value="Musyrif">Musyrif</option>
 <option value="Siswa">Siswa</option>
 <option value="Orang Tua">Orang Tua</option>
 </CustomSelect>
 {!canEditUnitAndRole && (
 <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
 <span>🔒</span>
 <span>Hanya dapat diubah oleh Administrator / Kepala Sekolah.</span>
 </p>
 )}
 </div>
 )}

 {/* Unit Pendidikan */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
 <span>Unit Pendidikan</span>
 {!canEditUnitAndRole && (
 <Badge color="warning" size="sm" className="py-0 px-2 text-[10px]">
 Terkunci
 </Badge>
 )}
 </label>
 <CustomSelect
 value={profile.unit}
 onChange={(e) => setProfile({ ...profile, unit: e.target.value })}
 disabled={!canEditUnitAndRole}
 className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs ${
 !canEditUnitAndRole ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
 }`}
 >
 <option value={profile.unit}>{profile.unit || 'Pilih Unit'}</option>
 {unitOptions.map((u) => (
 <option key={u.id || u.nama_unit} value={u.nama_unit || u.name}>
 {u.nama_unit || u.name}
 </option>
 ))}
 </CustomSelect>
 {!canEditUnitAndRole && (
 <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
 <span>🔒</span>
 <span>Unit Pendidikan terikat pada penugasan akun Anda.</span>
 </p>
 )}
 </div>
 </div>

 {/* Form Actions */}
 <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap pt-4 border-t border-emerald-100/80 dark:border-emerald-800/60">
 <Button
 type="button"
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={handleReset}
 >
 Batal
 </Button>
 <Button
 type="submit"
 variant="primary"
 size="sm"
 pending={saving}
 disabled={saving}
 >
 {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
 </Button>
 </div>
 </div>
 </div>
 </form>
 </Card>
 )
}
