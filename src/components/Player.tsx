import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import { formatTime } from '../utils/time'
import styles from '../styles/App.module.css'

export const Player = () => {
  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted, repeat, shuffle, error,
    togglePlay, next, previous, seek, setVolume, toggleMute, toggleRepeat, toggleShuffle,
  } = useMusic()

  return (
    <footer className={styles.player}>
      <div className={styles.nowPlaying}>
        {currentSong && <img src={currentSong.coverUrl} alt="" />}
        <div>
          <strong>{currentSong?.title ?? 'Choose a song'}</strong>
          <span>{currentSong?.artist ?? 'Local files only'}</span>
        </div>
      </div>
      <div className={styles.playerCenter}>
        {error && <div className={styles.playerError} title={error}>{error}</div>}
        <div className={styles.controls}>
          <button className={shuffle ? styles.controlActive : ''} onClick={toggleShuffle} aria-label="Toggle shuffle"><Shuffle size={17} /></button>
          <button onClick={previous} aria-label="Previous"><SkipBack size={19} fill="currentColor" /></button>
          <button className={styles.mainPlay} onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
          </button>
          <button onClick={next} aria-label="Next"><SkipForward size={19} fill="currentColor" /></button>
          <button className={repeat !== 'off' ? styles.controlActive : ''} onClick={toggleRepeat} aria-label={`Repeat ${repeat}`}>
            {repeat === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
          </button>
        </div>
        <div className={styles.timeline}>
          <span>{formatTime(currentTime)}</span>
          <input type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={(event) => seek(Number(event.target.value))} />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className={styles.volume}>
        <button onClick={toggleMute} aria-label="Toggle mute">{isMuted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}</button>
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
      </div>
    </footer>
  )
}
