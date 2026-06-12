import { Play, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useParams } from 'react-router-dom'
import { SongRow } from '../components/SongRow'
import { useMusic } from '../context/MusicContext'
import { playlists } from '../data/playlists'
import styles from '../styles/App.module.css'

const toggleSelection = (
  songId: number,
  checked: boolean,
  setSelected: Dispatch<SetStateAction<number[]>>,
) => {
  setSelected((current) => checked ? [...current, songId] : current.filter((id) => id !== songId))
}

export const PlaylistDetail = () => {
  const { playlistId } = useParams()
  const { catalog, playQueue, getPlaylistSongs, addSongsToPlaylist, removeSongsFromPlaylist } = useMusic()
  const playlist = playlists.find((item) => item.id === playlistId)
  const playlistSongs = useMemo(() => playlist ? getPlaylistSongs(playlist.id) : [], [getPlaylistSongs, playlist])
  const [selectedInPlaylist, setSelectedInPlaylist] = useState<number[]>([])
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([])

  const availableSongs = useMemo(() => {
    if (!playlist) return []
    const currentSongIds = new Set(playlistSongs.map((song) => song.id))
    return catalog.filter((song) => !currentSongIds.has(song.id))
  }, [catalog, playlist, playlistSongs])

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
        <div className={styles.playlistManager}>
          <div className={styles.playlistPanel}>
            <div className={styles.playlistPanelHeader}>
              <div>
                <h3>Remove songs</h3>
                <p>Select multiple songs in this playlist and remove them together.</p>
              </div>
              <button
                className={styles.playlistAction}
                disabled={!selectedInPlaylist.length}
                onClick={() => {
                  removeSongsFromPlaylist(playlist.id, selectedInPlaylist)
                  setSelectedInPlaylist([])
                }}
              >
                <Trash2 size={16} />
                <span>Remove selected</span>
              </button>
            </div>
            {playlistSongs.length
              ? <div className={styles.songList}>{playlistSongs.map((song, index) => <SongRow key={song.id} song={song} index={index} queue={playlistSongs} selectable selected={selectedInPlaylist.includes(song.id)} onSelectChange={(songId, checked) => toggleSelection(songId, checked, setSelectedInPlaylist)} />)}</div>
              : <div className={styles.empty}><h3>This playlist is empty</h3><p>Select songs below to add them here.</p></div>
            }
          </div>
          <div className={styles.playlistPanel}>
            <div className={styles.playlistPanelHeader}>
              <div>
                <h3>Add songs</h3>
                <p>Choose multiple songs from your library and add them in one click.</p>
              </div>
              <button
                className={styles.playlistAction}
                disabled={!selectedToAdd.length}
                onClick={() => {
                  addSongsToPlaylist(playlist.id, selectedToAdd)
                  setSelectedToAdd([])
                }}
              >
                <Plus size={16} />
                <span>Add selected</span>
              </button>
            </div>
            {availableSongs.length
              ? <div className={styles.songList}>{availableSongs.map((song, index) => <SongRow key={song.id} song={song} index={index} queue={availableSongs} selectable selected={selectedToAdd.includes(song.id)} onSelectChange={(songId, checked) => toggleSelection(songId, checked, setSelectedToAdd)} />)}</div>
              : <div className={styles.empty}><h3>All songs already added</h3><p>This playlist already contains every song in your library.</p></div>
            }
          </div>
        </div>
      </section>
    </div>
  )
}
