import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './components/landing/LandingPage'
import DashboardPage from './pages/DashboardPage'
import DoctorDashboardPage from './pages/DoctorDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function getHomeRouteByRole(role) {
  if (role === 'doctor') return '/doctor-dashboard'
  if (role === 'admin') return '/admin-dashboard'
  return '/dashboard'
}

function ProtectedRoute({ children, allowedRoles }) {
  const sessionToken = localStorage.getItem('clinix_session_token')
  const role = localStorage.getItem('clinix_user_role') || 'patient'

  if (!sessionToken) {
    return <Navigate to="/login" replace />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeRouteByRole(role)} replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#ffffff',
            color: '#333333',
            border: '1px solid #fce1e8',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard/*"
          element={(
            <ProtectedRoute allowedRoles={['patient']}>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/doctor-dashboard"
          element={(
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin-dashboard"
          element={(
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
