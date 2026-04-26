import { motion } from 'framer-motion'
import { HeartPulse, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const [openProfile, setOpenProfile] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const profileButtonRef = useRef(null)
  const sessionToken = localStorage.getItem('clinix_session_token')
  const role = localStorage.getItem('clinix_user_role') || 'patient'
  const userName = localStorage.getItem('clinix_user_name') || 'User'

  const getDashboardRoute = () => {
    if (role === 'doctor') return '/doctor-dashboard'
    if (role === 'admin') return '/admin-dashboard'
    return '/dashboard'
  }

  const handleScroll = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('clinix_session_token')
    localStorage.removeItem('clinix_patient_id')
    localStorage.removeItem('clinix_user_name')
    localStorage.removeItem('clinix_user_role')
    localStorage.removeItem('clinix_user_id')
    localStorage.removeItem('clinix_profile_image')
    window.location.href = '/login'
  }

  useEffect(() => {
    if (openProfile && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.top - 180,
        right: window.innerWidth - rect.right,
      })
    }
  }, [openProfile])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileButtonRef.current && !profileButtonRef.current.contains(e.target)) {
        setOpenProfile(false)
      }
    }

    if (openProfile) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openProfile])

  return (
    <>
      <nav className="fixed left-0 top-0 z-30 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="group flex items-center gap-2"
          >
            <HeartPulse className="h-7 w-7 text-rosePink transition-colors group-hover:text-primary" />
            <span className="font-display text-4xl tracking-tight md:text-3xl">
              <span className="text-white">Clinix</span>
              <span className="text-primary">One</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => handleScroll('about')}
              className="hidden rounded-lg border-2 border-white bg-transparent px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:border-primary hover:bg-primary hover:text-black md:inline-block"
            >
              About
            </button>
            <button
              onClick={() => handleScroll('specialties-full')}
              className="hidden rounded-lg border-2 border-white bg-transparent px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:border-primary hover:bg-primary hover:text-black md:inline-block"
            >
              Specialties
            </button>
            <button
              onClick={() => handleScroll('contact')}
              className="hidden rounded-lg border-2 border-white bg-transparent px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:border-primary hover:bg-primary hover:text-black md:inline-block"
            >
              Contact
            </button>

            {sessionToken && (
              <button
                ref={profileButtonRef}
                onClick={() => setOpenProfile((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border-2 border-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/20 transition-colors"
              >
                Profile
                <ChevronDown size={16} className={`transition-transform ${openProfile ? 'rotate-180' : ''}`} />
              </button>
            )}
          </motion.div>
        </div>
      </nav>

      {openProfile && sessionToken && createPortal(
        <div
          className="absolute z-50 w-48 rounded-2xl bg-white border-2 border-primary p-3 shadow-2xl"
          style={{
            top: `${dropdownPos.top}px`,
            right: `${dropdownPos.right}px`,
          }}
        >
          <button
            onClick={() => {
              navigate(getDashboardRoute())
              setOpenProfile(false)
            }}
            className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-textPrimary hover:bg-rose-50 transition-colors font-medium"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              navigate(getDashboardRoute() + '/settings')
              setOpenProfile(false)
            }}
            className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-textPrimary hover:bg-rose-50 transition-colors font-medium"
          >
            Profile
          </button>
          <div className="my-2 border-t border-rose-200" />
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
          >
            Sign out
          </button>
        </div>,
        document.body
      )}
    </>
  )
}