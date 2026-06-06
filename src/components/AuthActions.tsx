import { LogIn, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/App.module.css'

export const AuthActions = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.authActions}>
      <button
        className={`${styles.authChip} ${!isAuthenticated ? styles.authChipActive : ''}`}
        onClick={handleLogin}
        type="button"
        aria-current={!isAuthenticated ? 'page' : undefined}
      >
        <LogIn size={14} />
        <span>Login</span>
      </button>
      <button
        className={`${styles.authChip} ${isAuthenticated ? styles.authChipActive : ''}`}
        onClick={handleLogout}
        type="button"
        disabled={!isAuthenticated}
      >
        <LogOut size={14} />
        <span>Logout</span>
      </button>
    </div>
  )
}
