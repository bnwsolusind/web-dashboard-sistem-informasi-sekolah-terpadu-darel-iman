import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  CheckCircle2,
  Target,
  Award,
  Activity,
  Users,
  Building2,
  BookOpen,
  UserCheck,
  UserX,
  HeartHandshake,
  School,
  DollarSign,
  Layers,
  Sparkles,
  Briefcase,
  ArrowRightLeft,
  Clock,
} from 'lucide-react'
import KpiCard from './app/KpiCard'

function resolveIcon(title) {
  const t = (title || '').toLowerCase()
  if (t.includes('unit')) return Building2
  if (t.includes('tendik') || t.includes('tenaga kependidikan')) return Briefcase
  if (t.includes('guru') || t.includes('pendidik')) return UserCheck
  if (t.includes('pegawai') || t.includes('staf') || t.includes('sdm')) return Users
  if (t.includes('alumni')) return Sparkles
  if (t.includes('lulus')) return Award
  if (t.includes('berhenti')) return UserX
  if (t.includes('mutasi')) return ArrowRightLeft
  if (t.includes('baru')) return Sparkles
  if (t.includes('menunggu')) return Clock
  if (t.includes('siswa') || t.includes('santri')) return GraduationCap
  if (t.includes('wali') || t.includes('orang tua')) return HeartHandshake
  if (t.includes('kelas') || t.includes('rombel')) return School
  if (t.includes('hadir') || t.includes('kehadiran') || t.includes('presensi')) return CheckCircle2
  if (t.includes('tahfizh')) return Target
  if (t.includes('prestasi')) return Award
  if (t.includes('mutabaah')) return Activity
  if (t.includes('kurikulum') || t.includes('mapel')) return BookOpen
  if (t.includes('keuangan')) return DollarSign
  return Target
}

function resolveColorScheme(title) {
  const t = (title || '').toLowerCase()
  if (t.includes('unit')) return 'emerald'
  if (t.includes('tendik') || t.includes('tenaga kependidikan')) return 'teal'
  if (t.includes('guru') || t.includes('pendidik')) return 'blue'
  if (t.includes('pegawai') || t.includes('staf')) return 'violet'
  if (t.includes('mutasi keluar') || t.includes('berhenti')) return 'rose'
  if (t.includes('mutasi masuk') || t.includes('mutasi')) return 'sky'
  if (t.includes('siswa baru')) return 'cyan'
  if (t.includes('siswa') || t.includes('santri')) return 'indigo'
  if (t.includes('wali') || t.includes('orang tua')) return 'rose'
  if (t.includes('alumni') || t.includes('menunggu')) return 'amber'
  if (t.includes('lulus')) return 'emerald'
  if (t.includes('kelas') || t.includes('rombel')) return 'blue'
  if (t.includes('prestasi')) return 'amber'
  if (t.includes('mutabaah')) return 'teal'
  return 'emerald'
}

/**
 * StatCard - adapter kompatibel (DashboardPage superadmin) menuju KpiCard canonical.
 * Semua KPI aplikasi kini memakai KpiCard canonical yang sama.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = 'up',
  trendText = 'dari bulan lalu',
  icon: customIcon,
  colorScheme: customColorScheme,
  tone,
  onClickTo,
  onClick,
}) {
  const navigate = useNavigate()
  const Icon = customIcon || resolveIcon(title)
  const colorScheme = customColorScheme || tone || resolveColorScheme(title)

  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    } else if (onClickTo) {
      navigate(onClickTo)
    }
  }

  return (
    <KpiCard
      title={title}
      value={value}
      icon={Icon}
      trend={trend || undefined}
      trendType={trendType}
      trendText={trendText}
      subtitle={subtitle}
      colorScheme={colorScheme}
      onClick={onClickTo || onClick ? handleClick : undefined}
    />
  )
}
