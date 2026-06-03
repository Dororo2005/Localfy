import { Play } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { SongRow } from '../components/SongRow'
import { useMusic } from '../context/MusicContext'
import { playlists, songsForPlaylist } from '../data/playlists'
import styles from '../styles/App.module.css'

export const PlaylistDetail = () => {
  const { playlistId } = useParams()
  const { catalog, playQueue } = useMusic()
  const playlist = playlists.find((item) => item.id === playlistId)
  const playlistSongs = playlist ? songsForPlaylist(catalog, playlist.name) : []

  if (!playlist) return <div className={styles.empty}><h3>Playlist not found</h3><p>Choose a playlist from your library.</p></div>

  return (
    <div className={styles.playlistPage}>
      <section className={styles.playlistHero} style={{ background: `linear-gradient(145deg, ${playlist.accent}, #16191b 72%)` }}>
        <img src={playlist.coverUrl} alt="" />
        <div>
          <span className={styles.eyebrow}>Playlist</span>
          <h1>{playlist.name}</h1>
          <p>{playlist.description}</p>
          <strong>{playlistSongs.length} songs</strong>
        </div>
      </section>
      <section className={styles.playlistBody}>
        <button className={styles.bigPlay} onClick={() => playQueue(playlistSongs)}><Play size={24} fill="currentColor" /></button>
        {playlistSongs.length
          ? <div className={styles.songList}>{playlistSongs.map((song, index) => <SongRow key={song.id} song={song} index={index} queue={playlistSongs} />)}</div>
          : <div className={styles.empty}><h3>This playlist is empty</h3><p>Add songs with playlist: "{playlist.name}" in the local song catalog.</p></div>
        }
      </section>
    </div>
  )
}
