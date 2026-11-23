import {
  useEffect
} from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import LoginCard from '../components/auth/LoginCard'
import {
  resolveDefaultPortal
} from '../auth/portalResolver'
import AuthToast from '../components/ui/AuthToast'
import AuthPopup from '../components/ui/AuthPopup'
import PwaInstallBanner from '../components/app/PwaInstallBanner'

export default function LoginPage() {
  const navigate = useNavigate()
  const muatPengaturan = usePengaturanStore((state) => state.muatPengaturan)

  useEffect(() => {
    muatPengaturan()
  }, [muatPengaturan])

  const handleLoginSuccess = (result) => {
    navigate(resolveDefaultPortal(result), { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#059669] via-[#059669] to-[#047857] text-slate-900 flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background Image: Gedung Yayasan Dar El-Iman dengan opacity-25 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 opacity-25 pointer-events-none"
        style={{ backgroundImage: "url('/assets/images/darel_iman_building.jpg')" }}
      />

      {/* Subtle Background Ambient Glows */}

      {/* Main Single Column Container */}
      <div className="w-full max-w-md my-auto relative z-10 py-2 sm:py-6 animate-fade-in">
        <LoginCard onLoginSuccess={handleLoginSuccess} />
      </div>

      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* Global Auth Popup & Toast */}
      <AuthPopup />
      <AuthToast />
    </div>
  )
}
