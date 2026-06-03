import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { songs, type Song } from '../data/songs'
import { createStoredSongs, loadStoredSongs, materializeSong, saveStoredSongs } from '../data/localLibrary'

type RepeatMode = 'off' | 'all' | 'one'

type MusicContextValue = {
  currentSong: Song | null
  isPlaying: boolean
  queue: Song[]
  volume: number
  isMuted: boolean
  repeat: RepeatMode
  shuffle: boolean
  currentTime: number
  duration: number
  error: string | null
  catalog: Song[]
  importLocalFiles: (audioFiles: File[], coverFile?: File) => Promise<number>
  playSong: (song: Song, nextQueue?: Song[]) => void
  playQueue: (nextQueue: Song[], startIndex?: number) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (seconds: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleRepeat: () => void
  toggleShuffle: () => void
}

const MusicContext = createContext<MusicContextValue | null>(null)

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const uploadedUrlsRef = useRef<string[]>([])
  const [catalog, setCatalog] = useState<Song[]>(songs)
  const [currentSong, setCurrentSong] = useState<Song | null>(songs[0] ?? null)
  const [queue, setQueue] = useState<Song[]>(songs)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.72)
  const [isMuted, setIsMuted] = useState(false)
  const [repeat, setRepeat] = useState<RepeatMode>('off')
  const [shuffle, setShuffle] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const materializeUploadedSongs = useCallback((storedSongs: Awaited<ReturnType<typeof loadStoredSongs>>) => {
    const uploadedSongs = storedSongs.map(materializeSong)
    uploadedUrlsRef.current.push(...uploadedSongs.flatMap((song) => [song.audioUrl, song.coverUrl]).filter((url) => url.startsWith('blob:')))
    return uploadedSongs
  }, [])

  useEffect(() => {
    const uploadedUrls = uploadedUrlsRef.current
    void loadStoredSongs()
      .then((storedSongs) => setCatalog([...songs, ...materializeUploadedSongs(storedSongs)]))
      .catch(() => setError('Saved uploads could not be loaded from browser storage.'))
    return () => uploadedUrls.forEach((url) => URL.revokeObjectURL(url))
  }, [materializeUploadedSongs])

  const importLocalFiles = useCallback(async (audioFiles: File[], coverFile?: File) => {
    if (!audioFiles.length) return 0
    try {
      const storedSongs = await createStoredSongs(audioFiles, coverFile)
      await saveStoredSongs(storedSongs)
      const uploadedSongs = materializeUploadedSongs(storedSongs)
      setCatalog((currentCatalog) => [...currentCatalog, ...uploadedSongs])
      setError(null)
      return uploadedSongs.length
    } catch {
      setError('These files could not be saved. Check your browser storage permissions and try again.')
      return 0
    }
  }, [materializeUploadedSongs])

  const playCurrentAudio = useCallback(async () => {
    if (!audioRef.current || !currentSong) return
    try {
      await audioRef.current.play()
      setIsPlaying(true)
      setError(null)
    } catch {
      setIsPlaying(false)
      setError(`Could not play "${currentSong.title}". Check that its local audio file is still available.`)
    }
  }, [currentSong])

  const selectSong = useCallback((song: Song) => {
    setCurrentSong(song)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    setIsPlaying(true)
  }, [])

  const playSong = useCallback((song: Song, nextQueue?: Song[]) => {
    if (nextQueue?.length) setQueue(nextQueue)
    if (currentSong?.id === song.id) {
      void playCurrentAudio()
      return
    }
    selectSong(song)
  }, [currentSong, playCurrentAudio, selectSong])

  const playQueue = useCallback((nextQueue: Song[], startIndex = 0) => {
    if (!nextQueue.length) {
      setError('This playlist is empty. Add songs to the local catalog first.')
      return
    }
    setQueue(nextQueue)
    selectSong(nextQueue[startIndex] ?? nextQueue[0])
  }, [selectSong])

  const next = useCallback(() => {
    if (!currentSong || !queue.length) return
    const currentIndex = queue.findIndex((song) => song.id === currentSong.id)
    if (shuffle && queue.length > 1) {
      const choices = queue.filter((song) => song.id !== currentSong.id)
      selectSong(choices[Math.floor(Math.random() * choices.length)])
      return
    }
    const nextIndex = currentIndex + 1
    if (nextIndex < queue.length) selectSong(queue[nextIndex])
    else if (repeat === 'all') selectSong(queue[0])
    else setIsPlaying(false)
  }, [currentSong, queue, repeat, selectSong, shuffle])

  const previous = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    if (!currentSong || !queue.length) return
    const currentIndex = queue.findIndex((song) => song.id === currentSong.id)
    selectSong(queue[currentIndex > 0 ? currentIndex - 1 : queue.length - 1])
  }, [currentSong, queue, selectSong])

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    audio.src = currentSong.audioUrl
    audio.load()
    if (isPlaying) void playCurrentAudio()
  // The audio source should only reset when the selected song changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.muted = isMuted
  }, [isMuted, volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onError = () => {
      setIsPlaying(false)
      setError(`Could not load "${currentSong?.title ?? 'this track'}". Check that its local audio file exists.`)
    }
    const onEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0
        void audio.play()
      } else next()
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('error', onError)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('ended', onEnded)
    }
  }, [currentSong, next, repeat])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      void playCurrentAudio()
    }
  }, [currentSong, isPlaying, playCurrentAudio])

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = seconds
    setCurrentTime(seconds)
  }, [])

  const setVolume = useCallback((nextVolume: number) => {
    setVolumeState(nextVolume)
    if (nextVolume > 0) setIsMuted(false)
  }, [])

  const toggleRepeat = useCallback(() => {
    setRepeat((mode) => mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off')
  }, [])

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, queue, volume, isMuted, repeat, shuffle, currentTime, duration, error, catalog,
      importLocalFiles,
      playSong, playQueue, togglePlay, next, previous, seek, setVolume,
      toggleMute: () => setIsMuted((muted) => !muted),
      toggleRepeat,
      toggleShuffle: () => setShuffle((enabled) => !enabled),
    }}>
      {children}
    </MusicContext.Provider>
  )
}

// The provider and hook intentionally live together as the public context API.
// eslint-disable-next-line react-refresh/only-export-components
export const useMusic = () => {
  const context = useContext(MusicContext)
  if (!context) throw new Error('useMusic must be used inside MusicProvider')
  return context
}
