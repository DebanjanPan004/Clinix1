import FlowingMenu from './FlowingMenu'
import { useNavigate } from 'react-router-dom'

const menuItems = [
  {
    id: 'dashboard',
    text: 'Dashboard',
    path: '/dashboard',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=60',
  },
  {
    id: 'appointments',
    text: 'Appointments',
    path: '/dashboard/appointments',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=60',
  },
  {
    id: 'history',
    text: 'Medical History',
    path: '/dashboard/history',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=60',
  },
  {
    id: 'reports',
    text: 'Reports',
    path: '/dashboard/reports',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=60',
  },
  {
    id: 'settings',
    text: 'Settings',
    path: '/dashboard/settings',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=60',
  },
  {
    id: 'logout',
    text: 'Logout',
    image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=400&q=60',
  },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('clinix_session_token')
    localStorage.removeItem('clinix_patient_id')
    localStorage.removeItem('clinix_user_name')
    localStorage.removeItem('clinix_user_role')
    window.location.assign('/login')
  }

  const items = menuItems.map((item) => ({
    ...item,
    onClick: item.id === 'logout' ? handleLogout : () => navigate(item.path),
  }))

  return (
    <aside className="glass-strong w-full rounded-2xl p-4 lg:w-72">
      <div
        onClick={() => navigate('/')}
        className="mb-6 cursor-pointer rounded-2xl bg-gradient-to-r from-primary to-rosePink p-4 text-white transition-transform hover:scale-105"
      >
        <h2 className="font-display text-xl">ClinixOne</h2>
        <p className="text-sm text-rose-50">FlowingMenu Navigation</p>
      </div>

      <div className="h-[420px] overflow-hidden rounded-2xl border border-rose-200 lg:h-[calc(100vh-16rem)]">
        <FlowingMenu
          items={items}
          speed={15}
          textColor="#FCE7F1"
          bgColor="#4C0B2C"
          marqueeBgColor="#FFFFFF"
          marqueeTextColor="#4C0B2C"
          borderColor="#9A2C5A"
        />
      </div>
    </aside>
  )
}
