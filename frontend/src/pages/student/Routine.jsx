import { useState, useEffect, useCallback } from 'react'
import StudentLayout from '../../layouts/StudentLayout'
import RoutineView from '../../components/RoutineView'
import api from '../../utils/api'
import { isRequestCanceled } from '../../utils/http'
import logger from '../../utils/logger'

const StudentRoutine = () => {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRoutines = useCallback(async (signal) => {
    try {
      setError('')
      const res = await api.get('/routines', { signal })
      setRoutines(res.data.routines)
    } catch (err) {
      if (isRequestCanceled(err)) return
      logger.error('Failed to load student routine', err)
      setError(err.response?.data?.message || 'Unable to load your routine right now.')
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetchRoutines(controller.signal)
    return () => controller.abort()
  }, [fetchRoutines])
  return <RoutineView Layout={StudentLayout} breadcrumbs={['Student', 'Routine']} loading={loading} error={error} routines={routines} />
}

export default StudentRoutine


