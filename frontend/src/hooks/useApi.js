import { useEffect, useRef, useState } from 'react'
import { getFriendlyErrorMessage } from '../utils/errors'
import { isRequestCanceled } from '../utils/http'

const useApi = ({ initialData = null, initialLoading = false } = {}) => {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => () => {
    mountedRef.current = false
  }, [])

  const execute = async (request, options = {}) => {
    const {
      fallbackMessage = 'Something went wrong',
      clearError = true,
      onSuccess,
      onError,
      transform
    } = options

    if (mountedRef.current) {
      setLoading(true)
      if (clearError) {
        setError('')
      }
    }

    try {
      const response = await request()
      const nextData = transform ? transform(response) : response?.data
      if (!mountedRef.current) {
        return response
      }

      setData(nextData)

      if (onSuccess) {
        onSuccess(nextData, response)
      }

      return response
    } catch (requestError) {
      if (isRequestCanceled(requestError)) {
        return null
      }

      const message = getFriendlyErrorMessage(requestError, fallbackMessage)
      if (mountedRef.current) {
        setError(message)
      }

      if (onError) {
        onError(requestError, message)
      }

      throw requestError
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  return {
    data,
    setData,
    loading,
    error,
    setError,
    execute
  }
}

export default useApi
