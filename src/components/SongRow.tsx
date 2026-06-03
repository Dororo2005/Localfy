import { Pause, Play, Volume2 } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import type { Song } from '../data/songs'
import styles from '../styles/App.module.css'

export const SongRow = ({ song, index, queue }: { song: Song; index: number; queue?: Song[] }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useMusic()
  const isCurrent = currentSong?.id === song.id
  const handlePlay = () => isCurrent ? togglePlay() : playSong(song, queue)

  return (
    <div className={`${styles.songRow} ${isCurrent ? styles.currentRow : ''}`}>
      <button className={styles.rowPlay} onClick={handlePlay} aria-label={`Play ${song.title}`}>
        <span className={styles.rowIndex}>{isCurrent && isPlaying ? <Volume2 size={15} /> : index + 1}</span>
        <span className={styles.rowAction}>{isCurrent && isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</span>
      </button>
      <img src={song.coverUrl} alt="" className={styles.rowCover} />
      <div className={styles.songMain}>
        <strong>{song.title}</strong>
        <span>{song.artist}</span>
      </div>
      <span className={styles.rowAlbum}>{song.album}</span>
      <span className={styles.rowPlaylist}>{song.playlist}</span>
      <span className={styles.rowDuration}>{song.duration}</span>
    </div>
  )
}
