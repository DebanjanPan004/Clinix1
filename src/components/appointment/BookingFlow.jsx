import { useState, useEffect } from 'react'
import { SearchX, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Skeleton from '../ui/Skeleton'
import DoctorCard from './DoctorCard'
import TimeSlotSelector from './TimeSlotSelector'
import AppointmentSummary from './AppointmentSummary'
import ConfirmationModal from './ConfirmationModal'
import {
  searchDoctors,
  getAvailableDoctors,
  checkSlotAvailability,
  createAppointment,
  getAllowedVisitTypes,
} from '../../services/appointmentService'

export default function BookingFlow({ patientId, onBookingComplete, onCancel }) {
  // UI State
  const [step, setStep] = useState('doctor-search') // 'doctor-search' | 'details' | 'confirm'
  const [searchQuery, setSearchQuery] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationSuccess, setConfirmationSuccess] = useState(false)
  const [confirmationError, setConfirmationError] = useState('')

  // Data State
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [visitType, setVisitType] = useState('in-clinic')
  const [consultationReason, setConsultationReason] = useState('')
  const [allowedVisitTypes, setAllowedVisitTypes] = useState(['in-clinic'])

  // Loading States
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [confirmLoading, setConfirmLoading] = useState(false)

  // Load doctors on mount or when search changes
  useEffect(() => {
    const loadDoctors = async () => {
      setDoctorsLoading(true)
      try {
        const data = searchQuery
          ? await searchDoctors(searchQuery)
          : await getAvailableDoctors()
        setDoctors(data)
      } catch {
        toast.error('Unable to load doctors')
        setDoctors([])
      } finally {
        setDoctorsLoading(false)
      }
    }

    const debounceTimer = setTimeout(loadDoctors, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    const nextAllowedVisitTypes = getAllowedVisitTypes(doctor)
    setAllowedVisitTypes(nextAllowedVisitTypes)
    setVisitType(nextAllowedVisitTypes[0] || 'in-clinic')
    setAppointmentDate('')
    setAppointmentTime('')
    setStep('details')
  }

  // Handle confirmation
  const handleConfirmAppointment = async () => {
    try {
      // Validate all fields
      if (!selectedDoctor || !appointmentDate || !appointmentTime) {
        setConfirmationError('Please select a date and time for the appointment')
        return
      }

      // Check slot availability
      setConfirmLoading(true)
      const isAvailable = await checkSlotAvailability(
        selectedDoctor.doctor_id,
        appointmentDate,
        appointmentTime,
        visitType
      )

      if (!isAvailable) {
        setConfirmationError('This time slot is no longer available. Please select another time.')
        setConfirmLoading(false)
        return
      }

      // Create appointment
      const appointment = await createAppointment({
        patient_id: patientId,
        doctor_id: selectedDoctor.doctor_id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        visit_type: visitType,
        consultation_reason: consultationReason.trim() || null,
        consultation_fee: selectedDoctor.consultation_fee,
        status: 'scheduled',
      })

      setConfirmationSuccess(true)
      toast.success('Appointment booked successfully!')
      setTimeout(() => {
        onBookingComplete?.(appointment)
      }, 1500)
    } catch (error) {
      setConfirmationError(error.message || 'Unable to book appointment')
      toast.error(error.message || 'Unable to book appointment')
    } finally {
      setConfirmLoading(false)
    }
  }

  // Step 1: Doctor Selection
  if (step === 'doctor-search') {
    return (
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-textPrimary">Search & Select Doctor</h3>
          <button
            onClick={onCancel}
            className="rounded-lg hover:bg-rose-100 p-2 text-textSecondary"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search doctor by name, specialization, or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-rose-200 px-4 py-3 focus:border-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary"
            >
              <SearchX size={18} />
            </button>
          )}
        </div>

        {/* Doctors Grid */}
        {doctorsLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-56" />
            ))}
          </div>
        )}

        {!doctorsLoading && doctors.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50 py-8">
            <SearchX size={32} className="text-textSecondary mb-2" />
            <p className="text-sm text-textSecondary">No doctors found</p>
          </div>
        )}

        {!doctorsLoading && doctors.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.doctor_id}
                doctor={doctor}
                isSelected={selectedDoctor?.doctor_id === doctor.doctor_id}
                onSelect={() => handleDoctorSelect(doctor)}
              />
            ))}
          </div>
        )}

        <div className="text-xs text-textTertiary">
          Found {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
        </div>
      </Card>
    )
  }

  // Step 2: Appointment Details
  if (step === 'details') {
    const allFieldsFilled =
      selectedDoctor && appointmentDate && appointmentTime

    return (
      <div className="space-y-4">
        {/* Back Button */}
        <button
          onClick={() => {
            setStep('doctor-search')
            setSelectedDoctor(null)
            setAppointmentDate('')
            setAppointmentTime('')
            setConsultationReason('')
          }}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-deepPink"
        >
          <ChevronLeft size={18} />
          Change Doctor
        </button>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Appointment Details Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <h3 className="mb-4 font-semibold text-textPrimary">Appointment Details</h3>

              {/* Date and Time */}
              <TimeSlotSelector
                doctorId={selectedDoctor.doctor_id}
                selectedDate={appointmentDate}
                selectedTime={appointmentTime}
                onDateChange={setAppointmentDate}
                onTimeChange={setAppointmentTime}
              />
            </Card>

            {/* Visit Type Selection */}
            <Card>
              <h3 className="mb-4 font-semibold text-textPrimary">Type of Visit</h3>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${allowedVisitTypes.includes('in-clinic') ? 'cursor-pointer border-rose-200 hover:border-primary/50' : 'cursor-not-allowed border-rose-100 opacity-60'}`}>
                  <input
                    type="radio"
                    name="visitType"
                    value="in-clinic"
                    checked={visitType === 'in-clinic'}
                    onChange={(e) => setVisitType(e.target.value)}
                    disabled={!allowedVisitTypes.includes('in-clinic')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-textPrimary">In-Clinic Visit</span>
                  <span className="text-xs text-textSecondary ml-auto">
                    {allowedVisitTypes.includes('in-clinic') ? `at ${selectedDoctor.hospital}` : 'Not offered'}
                  </span>
                </label>

                <label className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${allowedVisitTypes.includes('online') ? 'cursor-pointer border-rose-200 hover:border-primary/50' : 'cursor-not-allowed border-rose-100 opacity-60'}`}>
                  <input
                    type="radio"
                    name="visitType"
                    value="online"
                    checked={visitType === 'online'}
                    onChange={(e) => setVisitType(e.target.value)}
                    disabled={!allowedVisitTypes.includes('online')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-textPrimary">Online Consultation</span>
                  <span className="text-xs text-textSecondary ml-auto">
                    {allowedVisitTypes.includes('online') ? 'Video call' : 'Not offered'}
                  </span>
                </label>
              </div>

              <p className="mt-2 text-xs text-textTertiary">
                Consultation mode depends on the selected doctor’s availability settings.
              </p>
            </Card>

            {/* Consultation Reason */}
            <Card>
              <h3 className="mb-3 font-semibold text-textPrimary">Reason for Visit</h3>
              <textarea
                placeholder="Describe your symptoms or reason for visiting the doctor..."
                value={consultationReason}
                onChange={(e) => setConsultationReason(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none resize-none"
              />
              <p className="mt-1 text-xs text-textTertiary text-right">
                {consultationReason.length}/500
              </p>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setStep('doctor-search')
                  setSelectedDoctor(null)
                  setAppointmentDate('')
                  setAppointmentTime('')
                  setConsultationReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowConfirmation(true)}
                disabled={!allFieldsFilled}
              >
                Review & Book
              </Button>
            </div>
          </div>

          {/* Sidebar: Summary */}
          <div className="lg:col-span-1">
            <AppointmentSummary
              doctor={selectedDoctor}
              appointmentDate={appointmentDate}
              appointmentTime={appointmentTime}
              visitType={visitType}
              consultationReason={consultationReason}
              showChecks={allFieldsFilled}
            />
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          doctor={selectedDoctor}
          appointmentDate={appointmentDate}
          appointmentTime={appointmentTime}
          visitType={visitType}
          consultationReason={consultationReason}
          isOpen={showConfirmation}
          isLoading={confirmLoading}
          onConfirm={handleConfirmAppointment}
          onClose={() => {
            setShowConfirmation(false)
            setConfirmationError('')
          }}
          successMessage={
            confirmationSuccess
              ? 'Your appointment has been confirmed. You will receive a confirmation email shortly.'
              : null
          }
          errorMessage={confirmationError}
        />
      </div>
    )
  }

  return null
}
