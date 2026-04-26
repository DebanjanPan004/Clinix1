import { useCallback, useEffect, useState } from 'react'
import {
  loginUser,
  logout,
  registerUser,
} from '../services/authService'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshSession = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('clinix_session_token')
      const userId = localStorage.getItem('clinix_patient_id')
      const fullName = localStorage.getItem('clinix_user_name')
      const role = localStorage.getItem('clinix_user_role')

      if (!token) {
        setSession(null)
        setUser(null)
      } else {
        setSession({ access_token: token })
        setUser({
          id: userId || '',
          email: '',
          user_metadata: {
            full_name: fullName || '',
            role: role || 'patient',
          },
        })
      }
    } catch (err) {
      setError(err.message || 'Unable to load session')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const register = useCallback(async (payload) => {
    setError('')
    const response = await registerUser(payload)
    return response
  }, [])

  const login = useCallback(async (payload) => {
    setError('')
    const response = await loginUser(payload)
    setUser(response.user)
    return response
  }, [])

  const signOut = useCallback(async () => {
    setError('')
    await logout()
    setUser(null)
    setSession(null)
  }, [])

  return {
    user,
    session,
    loading,
    error,
    register,
    login,
    signOut,
    refreshSession,
  }
}
