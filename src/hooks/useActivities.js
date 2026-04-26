import { useCallback, useEffect, useState } from 'react'
import { createActivity, getRecentActivities } from '../services/activityService'

export default function useActivities(userId) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchActivities = useCallback(async () => {
    if (!userId) {
      setActivities([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getRecentActivities(userId)
      setActivities(data)
    } catch (err) {
      setError(err.message || 'Unable to load activities')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const addActivity = useCallback(async (payload) => {
    const created = await createActivity(payload)
    setActivities((prev) => [created, ...prev])
    return created
  }, [])

  return {
    activities,
    loading,
    error,
    fetchActivities,
    addActivity,
  }
}
