import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthActions } from './AuthActions'
import styles from '../styles/App.module.css'

export const Header = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <header className={styles.header}>
      <div>
        <button onClick={() => navigate(-1)} aria-label="Go back"><ChevronLeft size={20} /></button>
        <button onClick={() => navigate(1)} aria-label="Go forward"><ChevronRight size={20} /></button>
      </div>
      <div className={styles.headerActions}>
        <span className={styles.profile}><UserRound size={16} /> {user?.name ?? 'Local Listener'}</span>
        <AuthActions />
      </div>
    </header>
  )
}
