import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import useAuth from '../../hooks/useAuth'
import AuthRoleIllustration from './AuthRoleIllustration'

const defaultForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'patient',
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [retryHint, setRetryHint] = useState('')

  useEffect(() => {
    const storedUntil = Number(localStorage.getItem('clinix_register_cooldown_until') || 0)
    const now = Date.now()
    if (storedUntil > now) {
      setCooldownSeconds(Math.ceil((storedUntil - now) / 1000))
    }
  }, [])

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          localStorage.removeItem('clinix_register_cooldown_until')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const goToLoginWithPrefill = () => {
    const params = new URLSearchParams({
      email: formData.email,
      role: formData.role,
    })
    localStorage.setItem('clinix_pending_email', formData.email)
    localStorage.setItem('clinix_pending_role', formData.role)
    navigate(`/login?${params.toString()}`)
  }

  const validate = () => {
    if (!formData.fullName.trim()) return 'Full name is required'
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Enter a valid email address'
    if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) return 'Enter a valid phone number'
    if (formData.password.length < 8) return 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (cooldownSeconds > 0) {
      toast.error(`Please wait ${cooldownSeconds}s before trying again`)
      return
    }

    const validationError = validate()

    if (validationError) {
      toast.error(validationError)
      return
    }

    setLoading(true)

    try {
      const response = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      })

      if (response.demo) {
        toast.success('Demo mode active. Account saved locally for UI flow only.')
        navigate('/login')
        return
      }

      toast.success('Registration successful. Please login to continue.')
      navigate('/login')
    } catch (error) {
      if (error.code === 'RATE_LIMITED' || /too many signup attempts|rate limit|429/i.test(error.message || '')) {
        const existingUntil = Number(localStorage.getItem('clinix_register_cooldown_until') || 0)
        const remainingFromExisting = Math.max(0, Math.ceil((existingUntil - Date.now()) / 1000))
        const suggested = Number(error.retryAfterSeconds) || 180
        const seconds = Math.max(suggested, Math.min(remainingFromExisting * 2 || suggested, 900))

        localStorage.setItem('clinix_register_cooldown_until', String(Date.now() + seconds * 1000))
        setCooldownSeconds(seconds)
        setRetryHint('Registration is currently rate-limited. Try login first if this email may already be registered.')
      }
      toast.error(error.message || 'Unable to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
      <h2 className="font-display text-2xl text-textPrimary">Create ClinixOne Account</h2>

      <AuthRoleIllustration role={formData.role} mode="signup" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-textSecondary">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-textSecondary">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-textSecondary">Phone</label>
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-textSecondary">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-textSecondary">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-textSecondary">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || cooldownSeconds > 0}>
        {loading ? 'Creating Account...' : cooldownSeconds > 0 ? `Try Again in ${cooldownSeconds}s` : 'Register'}
      </Button>

      {cooldownSeconds > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Too many signup attempts were detected. Wait for the timer, then try once. If your account was already created, use Login instead of registering again.
          {retryHint ? <p className="mt-1 text-xs text-amber-700">{retryHint}</p> : null}
          <div className="mt-3">
            <Button type="button" variant="secondary" className="w-full" onClick={goToLoginWithPrefill}>
              Go To Login With This Email
            </Button>
          </div>
        </div>
      )}

      <p className="text-sm text-textSecondary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-deepPink">
          Login
        </Link>
      </p>
    </form>
  )
}
