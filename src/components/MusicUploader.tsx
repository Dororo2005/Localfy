import { ImagePlus, Music2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useMusic } from '../context/MusicContext'
import styles from '../styles/App.module.css'

export const MusicUploader = () => {
  const { importLocalFiles } = useMusic()
  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [audioFiles, setAudioFiles] = useState<File[]>([])
  const [coverFile, setCoverFile] = useState<File>()
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState('')

  const handleImport = async () => {
    setIsImporting(true)
    const importedCount = await importLocalFiles(audioFiles, coverFile)
    setIsImporting(false)
    if (!importedCount) return
    setMessage(`${importedCount} ${importedCount === 1 ? 'song' : 'songs'} added to Local Uploads.`)
    setAudioFiles([])
    setCoverFile(undefined)
    if (audioInputRef.current) audioInputRef.current.value = ''
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  return (
    <section className={styles.uploader}>
      <div className={styles.uploadIntro}>
        <span className={styles.uploadIcon}><Upload size={20} /></span>
        <div>
          <h2>Import music</h2>
          <p>Select audio from this device. Your files stay in this browser and are restored after refresh.</p>
        </div>
      </div>
      <div className={styles.uploadActions}>
        <label className={styles.filePicker}>
          <Music2 size={17} />
          <span>{audioFiles.length ? `${audioFiles.length} audio ${audioFiles.length === 1 ? 'file' : 'files'} selected` : 'Choose audio files'}</span>
          <input ref={audioInputRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac" multiple onChange={(event) => setAudioFiles(Array.from(event.target.files ?? []))} />
        </label>
        <label className={styles.filePicker}>
          <ImagePlus size={17} />
          <span>{coverFile?.name ?? 'Optional cover image'}</span>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0])} />
        </label>
        <button className={styles.importButton} disabled={!audioFiles.length || isImporting} onClick={() => void handleImport()}>
          {isImporting ? 'Importing...' : 'Add to library'}
        </button>
      </div>
      {message && <p className={styles.uploadMessage}>{message}</p>}
    </section>
  )
}
