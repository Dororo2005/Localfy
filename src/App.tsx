import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Player } from './components/Player'
import { Sidebar } from './components/Sidebar'
import { useAuth } from './context/AuthContext'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { Login } from './pages/Login'
import { PlaylistDetail } from './pages/PlaylistDetail'
import { Search } from './pages/Search'
import styles from './styles/App.module.css'

export const App = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.main}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Player />
    </div>
  )
}
