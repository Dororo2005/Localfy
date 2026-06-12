import { useMemo, useState } from 'react'
import { SearchBar } from '../components/SearchBar'
import { SongRow } from '../components/SongRow'
import { useMusic } from '../context/MusicContext'
import styles from '../styles/App.module.css'

export const Search = () => {
  const [query, setQuery] = useState('')
  const { catalog, getSongPlaylistNames } = useMusic()
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return catalog
    return catalog.filter((song) => [song.title, song.artist, song.album, ...getSongPlaylistNames(song)].some((field) => field.toLowerCase().includes(normalized)))
  }, [catalog, getSongPlaylistNames, query])

  return (
    <div className={styles.page}>
      <div className={styles.searchHead}>
        <span className={styles.eyebrow}>Local catalog</span>
        <h1>Search</h1>
        <SearchBar value={query} onChange={setQuery} />
      </div>
      <section>
        <h2>{query ? `Results for "${query}"` : 'Browse your songs'}</h2>
        {results.length
          ? <div className={styles.songList}>{results.map((song, index) => <SongRow key={song.id} song={song} index={index} queue={results} />)}</div>
          : <div className={styles.empty}><h3>No songs found</h3><p>Try searching by song, artist, album, or playlist.</p></div>
        }
      </section>
    </div>
  )
}
