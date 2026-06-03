import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/App.module.css'

export const Header = () => {
  const navigate = useNavigate()
  return (
    <header className={styles.header}>
      <div>
        <button onClick={() => navigate(-1)} aria-label="Go back"><ChevronLeft size={20} /></button>
        <button onClick={() => navigate(1)} aria-label="Go forward"><ChevronRight size={20} /></button>
      </div>
      <span className={styles.profile}><UserRound size={16} /> Local Listener</span>
    </header>
  )
}
