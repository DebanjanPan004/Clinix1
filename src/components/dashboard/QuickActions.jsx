import { FileUp, History, MessageSquareHeart, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import toast from 'react-hot-toast'
import Card from '../ui/Card'
import Button from '../ui/Button'

const actions = [
  { id: 'book', label: 'Book Appointment', icon: Plus },
  { id: 'history', label: 'View Medical History', icon: History },
  { id: 'upload', label: 'Upload Reports', icon: FileUp },
  { id: 'contact', label: 'Contact Doctor', icon: MessageSquareHeart },
]

export default function QuickActions({ onUpload, onAction, doctorContacts = [], uploading = false }) {
  const navigate = useNavigate()
  const uploadInputRef = useRef(null)

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
      if (!Array.isArray(doctorContacts) || doctorContacts.length === 0) {
        toast.error('No doctor contact found. Book an appointment first.')
        return
      }

      const preferredContact = doctorContacts.find((item) => item.email) || doctorContacts[0]
      if (preferredContact.email) {
        const subject = encodeURIComponent(`Consultation follow-up with ${preferredContact.name || 'Doctor'}`)
        toast('Opening your email app...', { icon: '📩' })
        window.location.href = `mailto:${preferredContact.email}?subject=${subject}`
        return
      }

      if (preferredContact.phone) {
        toast('Opening dialer...', { icon: '📞' })
        window.location.href = `tel:${preferredContact.phone}`
        return
      }

      toast.error('No valid doctor email or phone found.')
    }
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (uploading) {
      event.target.value = ''
      return
    }

    if (!onUpload) {
      toast.error('Upload is not available right now.')
      event.target.value = ''
      return
    }

    const mimeType = String(file.type || '').toLowerCase()
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(mimeType)) {
      toast.error('Please upload a PDF, JPG, or PNG file')
      event.target.value = ''
      return
    }

    try {
      await onUpload(file)
    } finally {
      event.target.value = ''
    }
  }

  return (
    <Card>
      <h3 className="mb-4 font-semibold text-textPrimary">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <div key={action.id}>
            {action.id === 'upload' ? (
              <>
                <input
                  ref={uploadInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={uploading}
                  onChange={handleUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!uploading) uploadInputRef.current?.click()
                  }}
                  disabled={uploading}
                  className="flex min-h-[78px] w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <action.icon size={16} /> {uploading ? 'Uploading...' : action.label}
                </Button>
              </>
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
