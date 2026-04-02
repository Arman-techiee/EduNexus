import { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE_URL, clearAuthState, getAuthState, hasSessionHint, refreshSession, setAuthState, subscribeToAuthState } from '../utils/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getAuthState().user)
  const [token, setToken] = useState(getAuthState().token)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const unsubscribe = subscribeToAuthState((nextState) => {
      if (!isMounted) {
        return
      }

      setToken(nextState.token)
      setUser(nextState.user)
    })

    if (!hasSessionHint()) {
      setLoading(false)
      return () => {
        isMounted = false
        unsubscribe()
      }
    }

    refreshSession()
      .catch(() => {
        clearAuthState()
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const login = (userData, userToken) => {
    setAuthState({ user: userData, token: userToken })
  }

  const logout = () => {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => null).finally(() => {
      clearAuthState()
      window.location.href = '/login'
    })
  }

  const updateUser = (userData) => {
    setAuthState({ user: userData, token })
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
