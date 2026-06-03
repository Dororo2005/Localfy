import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Player } from './components/Player'
import { Sidebar } from './components/Sidebar'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { PlaylistDetail } from './pages/PlaylistDetail'
import { Search } from './pages/Search'
import styles from './styles/App.module.css'

export const App = () => (
  <div className={styles.app}>
    <Sidebar />
    <main className={styles.main}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
      </Routes>
    </main>
    <Player />
  </div>
)
