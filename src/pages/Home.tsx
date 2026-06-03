import { Play } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import { playlists } from '../data/playlists'
import { PlaylistCard } from '../components/PlaylistCard'
import { SongRow } from '../components/SongRow'
import styles from '../styles/App.module.css'

export const Home = () => {
  const { catalog, playSong } = useMusic()
  const recent = catalog.slice(-6).reverse()
  const recommendations = catalog.slice(2, 8)
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Your private listening space</span>
        <h1>Good evening</h1>
        <p>Everything here stays on your device. Pick up where you left off.</p>
      </section>

      <section>
        <h2>Recently played</h2>
        <div className={styles.quickGrid}>
          {recent.map((song) => (
            <button key={song.id} className={styles.quickCard} onClick={() => playSong(song, recent)}>
              <img src={song.coverUrl} alt="" />
              <strong>{song.title}</strong>
              <span><Play size={15} fill="currentColor" /></span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className={styles.sectionHeading}>
          <div><h2>Popular playlists</h2><p>Built from your local music collection.</p></div>
        </div>
        <div className={styles.cardGrid}>{playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}</div>
      </section>

      <section>
        <div className={styles.sectionHeading}>
          <div><h2>Recommended songs</h2><p>Handpicked from the demo catalog.</p></div>
        </div>
        <div className={styles.songList}>{recommendations.map((song, index) => <SongRow key={song.id} song={song} index={index} queue={recommendations} />)}</div>
      </section>
    </div>
  )
}
