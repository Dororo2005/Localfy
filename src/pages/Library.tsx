import { PlaylistCard } from '../components/PlaylistCard'
import { MusicUploader } from '../components/MusicUploader'
import { SongRow } from '../components/SongRow'
import { useMusic } from '../context/MusicContext'
import { playlists } from '../data/playlists'
import styles from '../styles/App.module.css'

export const Library = () => {
  const { catalog } = useMusic()
  const uploadedSongs = catalog.filter((song) => song.isUploaded)
  return <div className={styles.page}>
    <div className={styles.pageTitle}>
      <span className={styles.eyebrow}>Saved locally</span>
      <h1>Your Library</h1>
      <p>Import audio directly from your device or browse the playlists already in your collection.</p>
    </div>
    <MusicUploader />
    <section>
      <h2>Playlists</h2>
      {playlists.length
        ? <div className={styles.cardGrid}>{playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}</div>
        : <div className={styles.empty}><h3>Your library is empty</h3><p>Add a playlist in the local data file to get started.</p></div>
      }
    </section>
    {uploadedSongs.length > 0 && <section>
      <h2>Recently imported</h2>
      <div className={styles.songList}>{uploadedSongs.map((song, index) => <SongRow key={song.id} song={song} index={index} queue={uploadedSongs} />)}</div>
    </section>}
  </div>
}
