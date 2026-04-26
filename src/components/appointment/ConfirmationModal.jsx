import { X, CheckCircle } from 'lucide-react'
import Button from '../ui/Button'
import AppointmentSummary from './AppointmentSummary'

export default function ConfirmationModal({
  doctor,
  appointmentDate,
  appointmentTime,
  visitType,
  consultationReason,
  isOpen,
  isLoading,
  onConfirm,
  onClose,
  successMessage = null,
  errorMessage = null,
}) {
  if (!isOpen) return null

  // Show success confirmation
  if (successMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle size={40} className="text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-textPrimary">Appointment Confirmed!</h3>
              <p className="text-sm text-textSecondary mt-1">{successMessage}</p>
            </div>
            <div className="pt-4">
              <Button className="w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-rose-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-textPrimary">Confirm Your Appointment</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg hover:bg-rose-50 p-2 disabled:opacity-50"
          >
            <X size={20} className="text-textSecondary" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Appointment Summary */}
          <AppointmentSummary
            doctor={doctor}
            appointmentDate={appointmentDate}
            appointmentTime={appointmentTime}
            visitType={visitType}
            consultationReason={consultationReason}
            showChecks={false}
          />

          {/* Important Notice */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Note:</span> Please arrive 10 minutes early for{' '}
              {visitType === 'online' ? 'login to the video consultation' : 'your appointment'}. A
              confirmation email will be sent to your registered email address.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-rose-200 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Edit Appointment
            </Button>
            <Button className="flex-1" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Confirming...' : 'Confirm Appointment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
