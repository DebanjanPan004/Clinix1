import { Activity } from 'lucide-react'
import Card from '../ui/Card'

export default function RecentActivity({ feed }) {
  return (
    <Card>
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-textPrimary">
        <Activity size={18} className="text-primary" /> Recent Activity
      </h3>
      <div className="space-y-3">
        {feed.length === 0 ? (
          <p className="text-sm text-textSecondary">No recent activity yet.</p>
        ) : (
          feed.map((item) => (
            <div key={item.activity_id} className="rounded-xl bg-rose-50 p-3">
              <p className="text-sm font-semibold capitalize text-textPrimary">{item.activity_type}</p>
              <p className="text-sm text-textSecondary">{item.description}</p>
              <p className="mt-1 text-xs text-primary">{new Date(item.activity_time).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
