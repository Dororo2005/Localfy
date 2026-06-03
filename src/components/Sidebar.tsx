import { Home, Library, ListMusic, Plus, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { playlists } from '../data/playlists'
import styles from '../styles/App.module.css'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/library', label: 'Your Library', icon: Library },
]

export const Sidebar = () => (
  <aside className={styles.sidebar}>
    <NavLink to="/" className={styles.brand}>
      <span className={styles.logoMark}><ListMusic size={20} /></span>
      <span>Localfy</span>
    </NavLink>
    <nav className={styles.primaryNav}>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
    <section className={styles.playlistNav}>
      <div className={styles.sidebarHeading}>
        <span>Playlists</span>
        <NavLink to="/library" title="Import local music"><Plus size={17} /></NavLink>
      </div>
      {playlists.map((playlist) => (
        <NavLink key={playlist.id} to={`/playlist/${playlist.id}`} className={({ isActive }) => `${styles.playlistLink} ${isActive ? styles.playlistActive : ''}`}>
          {playlist.name}
        </NavLink>
      ))}
    </section>
    <div className={styles.sidebarFoot}>Your files. Your soundtrack.</div>
  </aside>
)
