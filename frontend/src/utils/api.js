import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) return ''

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl
  }

  return fileUrl.startsWith('/')
    ? `${API_ORIGIN}${fileUrl}`
    : `${API_ORIGIN}/${fileUrl}`
}

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
