import type { Song } from './songs'

type StoredSong = Omit<Song, 'audioUrl' | 'coverUrl'> & {
  audioFile: Blob
  coverFile?: Blob
}

const DATABASE_NAME = 'localfy-library'
const STORE_NAME = 'songs'
const DATABASE_VERSION = 1
const FALLBACK_COVER = '/covers/local-uploads.svg'

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

const withStore = async <T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) => {
  const database = await openDatabase()
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = operation(transaction.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => reject(transaction.error)
  })
}

const titleFromFilename = (filename: string) => filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')

const readDuration = (file: Blob) => new Promise<number>((resolve) => {
  const audio = new Audio()
  const url = URL.createObjectURL(file)
  const finish = (duration = 0) => {
    URL.revokeObjectURL(url)
    resolve(duration)
  }
  audio.onloadedmetadata = () => finish(audio.duration)
  audio.onerror = () => finish()
  audio.src = url
})

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

export const createStoredSongs = async (audioFiles: File[], coverFile?: File) =>
  Promise.all(audioFiles.map(async (audioFile, index): Promise<StoredSong> => {
    const seconds = await readDuration(audioFile)
    return {
      id: Date.now() + index,
      title: titleFromFilename(audioFile.name),
      artist: 'Local Upload',
      album: 'Imported from device',
      duration: seconds ? formatDuration(seconds) : '0:00',
      playlist: 'Local Uploads',
      isUploaded: true,
      audioFile,
      coverFile,
    }
  }))

export const saveStoredSongs = (songs: StoredSong[]) =>
  Promise.all(songs.map((song) => withStore('readwrite', (store) => store.put(song))))

export const loadStoredSongs = () => withStore<StoredSong[]>('readonly', (store) => store.getAll())

export const materializeSong = (song: StoredSong) => ({
  ...song,
  audioUrl: URL.createObjectURL(song.audioFile),
  coverUrl: song.coverFile ? URL.createObjectURL(song.coverFile) : FALLBACK_COVER,
})

export const deleteStoredSong = (id: number) =>
  withStore<undefined>('readwrite', (store) => store.delete(id))