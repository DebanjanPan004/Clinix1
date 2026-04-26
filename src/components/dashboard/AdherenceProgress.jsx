import Card from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'

export default function AdherenceProgress({ reminders }) {
  const totalDoses = reminders.length
  const completedDoses = reminders.filter((item) => item.status === 'completed').length
  const adherence = totalDoses === 0 ? 0 : Math.round((completedDoses / totalDoses) * 100)

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-textPrimary">Medicine Adherence</h3>
        <span className="text-sm font-semibold text-primary">{adherence}%</span>
      </div>
      <ProgressBar value={adherence} />
      <p className="text-sm text-textSecondary">Daily adherence: {completedDoses}/{totalDoses} doses completed</p>
      <p className="text-xs text-textSecondary">Weekly summary updates every Sunday 11:59 PM.</p>
    </Card>
  )
}
