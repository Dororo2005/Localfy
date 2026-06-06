import { ChevronLeft, ChevronRight, LogOut, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/App.module.css'

export const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className={styles.header}>
      <div>
        <button onClick={() => navigate(-1)} aria-label="Go back"><ChevronLeft size={20} /></button>
        <button onClick={() => navigate(1)} aria-label="Go forward"><ChevronRight size={20} /></button>
      </div>
      <div className={styles.headerActions}>
        <span className={styles.profile}><UserRound size={16} /> {user?.name ?? 'Local Listener'}</span>
        <button className={styles.logoutButton} onClick={handleLogout} type="button">
          <LogOut size={16} />
          <span>Dang xuat</span>
        </button>
      </div>
    </header>
  )
}
