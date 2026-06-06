import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type AuthUser = {
  id: string
  name: string
  email: string
  role: string
}

type LoginInput = {
  email: string
  password: string
}

type AuthContextValue = {
  isLoading: boolean
  isAuthenticated: boolean
  user: AuthUser | null
  login: (input: LoginInput) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const apiFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as unknown) : null

  return { response, data }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadSession = async () => {
      try {
        const { response, data } = await apiFetch('/api/auth/me')
        if (!isActive) {
          return
        }

        if (response.ok && data && typeof data === 'object' && 'user' in data) {
          setUser((data as { user?: AuthUser }).user ?? null)
        } else {
          setUser(null)
        }
      } catch {
        if (isActive) {
          setUser(null)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadSession()

    return () => {
      isActive = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: Boolean(user),
      user,
      login: async ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase()
        const normalizedPassword = password.trim()

        if (!normalizedEmail || !normalizedPassword) {
          return { success: false, message: 'Vui long nhap day du email va mat khau.' }
        }

        try {
          const { response, data } = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: normalizedEmail,
              password: normalizedPassword,
            }),
          })

          if (!response.ok) {
            const message =
              data && typeof data === 'object' && 'message' in data
                ? String((data as { message?: string }).message ?? 'Dang nhap that bai.')
                : 'Dang nhap that bai.'
            return { success: false, message }
          }

          const nextUser =
            data && typeof data === 'object' && 'user' in data
              ? ((data as { user?: AuthUser }).user ?? null)
              : null

          setUser(nextUser)
          return { success: true }
        } catch {
          return { success: false, message: 'Khong the ket noi toi may chu dang nhap.' }
        }
      },
      logout: async () => {
        try {
          await apiFetch('/api/auth/logout', { method: 'POST' })
        } finally {
          setUser(null)
        }
      },
    }),
    [isLoading, user],
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
