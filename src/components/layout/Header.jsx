import { ChevronDown, UserCircle2 } from 'lucide-react'
import { useState } from 'react'
import PatientNotificationsDropdown from './PatientNotificationsDropdown'

export default function Header() {
  const [openProfile, setOpenProfile] = useState(false)
  const userName = localStorage.getItem('clinix_user_name') || 'Patient'
  const profileImage = localStorage.getItem('clinix_profile_image') || ''

  const handleLogout = () => {
    localStorage.removeItem('clinix_session_token')
    localStorage.removeItem('clinix_user_id')
    localStorage.removeItem('clinix_patient_id')
    localStorage.removeItem('clinix_user_role')
    localStorage.removeItem('clinix_user_name')
    window.location.href = '/login'
  }

  return (
    <header className="relative z-50 glass-strong rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-textSecondary">Good day,</p>
          <h1 className="font-display text-2xl text-textPrimary">{userName}</h1>
        </div>

        <div className="flex items-center gap-3">
          <PatientNotificationsDropdown />

          <div className="relative z-[999]">
            <button
              onClick={() => setOpenProfile((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border-2 border-primary px-3 py-2 text-sm font-semibold text-textPrimary hover:bg-rose-50 transition-colors"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-6 w-6 rounded-full border border-primary object-cover"
                />
              ) : (
                <UserCircle2 size={18} className="text-primary" />
              )}
              Profile
              <ChevronDown size={16} className="text-textSecondary" />
            </button>

            {openProfile && (
              <div className="absolute right-0 top-12 z-[999] w-48 rounded-2xl border-2 border-primary bg-white p-3 shadow-2xl">
                <button className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-textPrimary hover:bg-rose-50 transition-colors font-medium">
                  My Account
                </button>
                <div className="my-2 border-t border-rose-200" />
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
