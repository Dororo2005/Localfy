import { Pause, Play, Volume2, Trash2 } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import type { Song } from '../data/songs'
import styles from '../styles/App.module.css'

type SongRowProps = {
  song: Song
  index: number
  queue?: Song[]
  selectable?: boolean
  selected?: boolean
  onSelectChange?: (songId: number, checked: boolean) => void
}

export const SongRow = ({ song, index, queue, selectable = false, selected = false, onSelectChange }: SongRowProps) => {
  const { currentSong, isPlaying, playSong, togglePlay, removeUploadedSong, getSongPlaylistNames } = useMusic()
  const isCurrent = currentSong?.id === song.id
  const handlePlay = () => isCurrent ? togglePlay() : playSong(song, queue)
  const playlistNames = getSongPlaylistNames(song)

  return (
    <div className={`${styles.songRow} ${isCurrent ? styles.currentRow : ''}`}>
      {selectable && (
        <label className={styles.rowSelect}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelectChange?.(song.id, event.target.checked)}
            aria-label={`Select ${song.title}`}
          />
        </label>
      )}
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
      <span className={styles.rowPlaylist}>{playlistNames.join(', ') || 'No playlist'}</span>
      <span className={styles.rowDuration}>{song.duration}</span>
      {song.isUploaded && (
        <button
          className={styles.rowDelete}
          aria-label={`Delete ${song.title}`}
          onClick={async (e) => {
            e.stopPropagation()
            if (!confirm(`Delete "${song.title}"?`)) return
            await removeUploadedSong(song.id)
          }}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  )
}
