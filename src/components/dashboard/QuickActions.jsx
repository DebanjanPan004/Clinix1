import { FileUp, History, MessageSquareHeart, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Card from '../ui/Card'
import Button from '../ui/Button'

const actions = [
  { id: 'book', label: 'Book Appointment', icon: Plus },
  { id: 'history', label: 'View Medical History', icon: History },
  { id: 'upload', label: 'Upload Reports', icon: FileUp },
  { id: 'contact', label: 'Contact Doctor', icon: MessageSquareHeart },
]

export default function QuickActions({ onUpload, onAction }) {
  const navigate = useNavigate()

  const handleAction = (actionId) => {
    if (onAction) {
      onAction(actionId)
      return
    }

    if (actionId === 'book') {
      navigate('/dashboard/appointments')
      return
    }

    if (actionId === 'history') {
      navigate('/dashboard/history')
      return
    }

    if (actionId === 'contact') {
      toast('Opening your email app...', { icon: '📩' })
      window.location.href = 'mailto:care@clinixone.com?subject=ClinixOne%20Doctor%20Support'
    }
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !onUpload) return
    await onUpload(file)
    event.target.value = ''
  }

  return (
    <Card>
      <h3 className="mb-4 font-semibold text-textPrimary">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <div key={action.id}>
            {action.id === 'upload' ? (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleUpload}
                />
                <Button type="button" variant="outline" className="flex min-h-[78px] w-full items-center justify-center gap-2">
                  <action.icon size={16} /> {action.label}
                </Button>
              </label>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAction(action.id)}
                className="flex min-h-[78px] w-full items-center justify-center gap-2"
              >
                <action.icon size={16} /> {action.label}
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
