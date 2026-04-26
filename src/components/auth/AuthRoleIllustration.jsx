import {
  Activity,
  ClipboardPlus,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react'

const ROLE_CONFIG = {
  patient: {
    title: 'Patient Care',
    subtitle: 'Track medicines, reports, and appointments in one place.',
    icon: HeartPulse,
    accent: 'from-rose-100 via-pink-50 to-white',
    chip: 'bg-rose-100 text-rose-700',
  },
  doctor: {
    title: 'Doctor Console',
    subtitle: 'Manage clinical activities and review patient timelines.',
    icon: Stethoscope,
    accent: 'from-sky-100 via-cyan-50 to-white',
    chip: 'bg-sky-100 text-sky-700',
  },
  admin: {
    title: 'Admin Operations',
    subtitle: 'Securely control users, reports, and platform settings.',
    icon: ShieldCheck,
    accent: 'from-violet-100 via-purple-50 to-white',
    chip: 'bg-violet-100 text-violet-700',
  },
}

export default function AuthRoleIllustration({ role = 'patient', mode = 'login' }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.patient
  const MainIcon = config.icon
  const modeLabel = mode === 'signup' ? 'Create Account' : 'Welcome Back'

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br ${config.accent} p-4`}>
      <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/60 blur-lg" />
      <div className="absolute -bottom-8 right-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" />

      <div className="relative flex items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-soft">
          <MainIcon className="text-primary animate-pulse" size={28} />
          <div className="absolute -right-2 -top-2 rounded-full bg-white p-1.5 shadow-sm">
            {mode === 'signup' ? (
              <ClipboardPlus size={14} className="text-primary" />
            ) : (
              <UserRound size={14} className="text-primary" />
            )}
          </div>
        </div>

        <div className="min-w-0">
          <p className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.chip}`}>
            {modeLabel}
          </p>
          <p className="mt-2 font-semibold text-textPrimary">{config.title}</p>
          <p className="text-xs text-textSecondary">{config.subtitle}</p>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2 text-xs text-textSecondary">
        <Activity size={14} className="text-primary animate-bounce" />
        <span>Live records, secure access, and real-time updates.</span>
      </div>
    </div>
  )
}
