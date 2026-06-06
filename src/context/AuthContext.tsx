import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type AuthUser = {
  name: string
  email: string
}

type LoginInput = {
  email: string
  password: string
}

type AuthContextValue = {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (input: LoginInput) => { success: boolean; message?: string }
  logout: () => void
}

const AUTH_STORAGE_KEY = 'localfy-auth-user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const readStoredUser = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      return
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      login: ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase()

        if (!normalizedEmail || !password.trim()) {
          return { success: false, message: 'Vui long nhap day du email va mat khau.' }
        }

        setUser({
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0] || 'Local Listener',
        })

        return { success: true }
      },
      logout: () => {
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
