import { Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Playlist } from '../data/playlists'
import styles from '../styles/App.module.css'

export const PlaylistCard = ({ playlist }: { playlist: Playlist }) => (
  <Link to={`/playlist/${playlist.id}`} className={styles.card}>
    <div className={styles.cardImageWrap}>
      <img src={playlist.coverUrl} alt="" className={styles.cardImage} />
      <span className={styles.cardPlay}><Play size={18} fill="currentColor" /></span>
    </div>
    <strong>{playlist.name}</strong>
    <span>{playlist.description}</span>
  </Link>
)
