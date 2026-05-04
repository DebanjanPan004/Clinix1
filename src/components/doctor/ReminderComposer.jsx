import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { createDoctorReminder } from '../../services/doctorDashboardService'

const initialForm = {
  patient_id: '',
  medicine_name: '',
  dosage: '',
  quantity: '',
  reminder_time: '',
  total_days: '',
  duration: '',
  notes: '',
}

export default function ReminderComposer({ patients = [], onCreated }) {
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!form.patient_id && patients.length > 0) {
      setForm((prev) => ({ ...prev, patient_id: patients[0].patient_id }))
    }
  }, [patients, form.patient_id])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.patient_id || !form.medicine_name.trim() || !form.dosage.trim() || !form.quantity.trim() || !form.reminder_time || !form.total_days.trim() || !form.duration.trim()) {
      toast.error('Fill patient, medicine, dosage, quantity, days, duration, and reminder time')
      return
    }

    setSaving(true)
    try {
      const response = await createDoctorReminder({
        patient_id: form.patient_id,
        medicine_name: form.medicine_name.trim(),
        dosage: form.dosage.trim(),
        quantity: form.quantity.trim(),
        reminder_time: form.reminder_time,
        total_days: Number(form.total_days),
        duration: form.duration.trim(),
        notes: form.notes.trim(),
        status: 'pending',
      })

      toast.success('Medicine reminder created')
      setForm((prev) => ({ ...initialForm, patient_id: prev.patient_id }))
      onCreated?.(response.reminder)
    } catch (error) {
      toast.error(error.message || 'Unable to create medicine reminder')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-semibold text-textPrimary">Create Medicine Reminder</h3>
        <p className="mt-1 text-sm text-textSecondary">Select a patient and send a reminder that will appear in their dashboard.</p>
      </div>

      {patients.length === 0 ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-textSecondary">
          No patients available yet. Reminders appear after you have appointments with patients.
        </p>
      ) : (
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">Patient</label>
            <select
              value={form.patient_id}
              onChange={(e) => updateField('patient_id', e.target.value)}
              className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
            >
              {patients.map((patient) => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.patient_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">Medicine Name</label>
            <input
              value={form.medicine_name}
              onChange={(e) => updateField('medicine_name', e.target.value)}
              className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
              placeholder="e.g. Amoxicillin"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">Dosage</label>
            <input
              value={form.dosage}
              onChange={(e) => updateField('dosage', e.target.value)}
              className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
              placeholder="e.g. 1 tablet after meals"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">Quantity</label>
            <input
              value={form.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
              className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
              placeholder="e.g. 30 tablets"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">Reminder Time</label>
            <input
              type="time"
              value={form.reminder_time}
              onChange={(e) => updateField('reminder_time', e.target.value)}
              className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">How Many Days</label>
            <input
              type="number"
              min="1"
              value={form.total_days}
              onChange={(e) => updateField('total_days', e.target.value)}
              className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
              placeholder="e.g. 7"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-textSecondary">Duration</label>
            <input
              value={form.duration}
              onChange={(e) => updateField('duration', e.target.value)}
              className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
              placeholder="e.g. 1 week"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-textSecondary">Notes / Instructions</label>
            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full rounded-xl border border-rose-200 px-3 py-2.5 focus:border-primary focus:outline-none"
              placeholder="Any other instructions for the patient"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving ? 'Creating Reminder...' : 'Create Reminder'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}