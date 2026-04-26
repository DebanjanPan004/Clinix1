import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import useAuth from '../../hooks/useAuth'
import AuthRoleIllustration from './AuthRoleIllustration'

const roles = ['patient', 'doctor', 'admin']

function getHomeRouteByRole(role) {
  if (role === 'doctor') return '/doctor-dashboard'
  if (role === 'admin') return '/admin-dashboard'
  return '/dashboard'
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient',
    rememberMe: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const emailFromQuery = searchParams.get('email')
    const roleFromQuery = searchParams.get('role')
    const pendingEmail = localStorage.getItem('clinix_pending_email')
    const pendingRole = localStorage.getItem('clinix_pending_role')

    const resolvedEmail = emailFromQuery || pendingEmail || ''
    const resolvedRole = roleFromQuery || pendingRole || 'patient'

    if (!resolvedEmail && !resolvedRole) return

    setFormData((prev) => ({
      ...prev,
      email: resolvedEmail || prev.email,
      role: roles.includes(resolvedRole) ? resolvedRole : prev.role,
    }))
  }, [searchParams])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })

      localStorage.removeItem('clinix_pending_email')
      localStorage.removeItem('clinix_pending_role')
      localStorage.setItem('clinix_remember_me', String(formData.rememberMe))
      const resolvedRole = response.user?.user_metadata?.role || formData.role
      if (resolvedRole === 'patient') {
        localStorage.setItem('clinix_patient_id', response.user?.id || 'demo-user-id')
      } else {
        localStorage.removeItem('clinix_patient_id')
      }
      localStorage.setItem('clinix_user_name', response.user?.user_metadata?.full_name || 'User')
      localStorage.setItem('clinix_user_role', resolvedRole)
      toast.success('Login successful.')
      navigate(getHomeRouteByRole(resolvedRole))
    } catch (error) {
      toast.error(error.message || 'Unable to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
      <h2 className="font-display text-2xl text-textPrimary">Welcome Back</h2>
      <p className="text-sm text-textSecondary">Login to continue your healthcare journey.</p>

      <AuthRoleIllustration role={formData.role} mode="login" />

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-textSecondary">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-textSecondary">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-rose-200 px-3 py-2.5 pr-10 focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
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
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-textSecondary">
        <input
          type="checkbox"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
          className="h-4 w-4 accent-primary"
        />
        Remember Me
      </label>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      <p className="text-sm text-textSecondary">
        New here?{' '}
        <Link to="/register" className="font-semibold text-primary hover:text-deepPink">
          Create account
        </Link>
      </p>
    </form>
  )
}
