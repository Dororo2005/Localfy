import type { Song } from './songs'

export type Playlist = {
  id: string
  name: string
  description: string
  coverUrl: string
  accent: string
}

export const playlists: Playlist[] = [
  { id: 'night-drive', name: 'Night Drive', description: 'After-dark tracks for the long way home.', coverUrl: '/covers/night-drive.svg', accent: '#5a3d8a' },
  { id: 'focus-flow', name: 'Focus Flow', description: 'Low-key sounds for deep work.', coverUrl: '/covers/focus-flow.svg', accent: '#1e7060' },
  { id: 'coffee-vinyl', name: 'Coffee & Vinyl', description: 'Soft edges and warm room tone.', coverUrl: '/covers/coffee-vinyl.svg', accent: '#8a573d' },
  { id: 'weekend-mix', name: 'Weekend Mix', description: 'Easygoing picks for a slower pace.', coverUrl: '/covers/weekend-mix.svg', accent: '#a86e21' },
  { id: 'local-uploads', name: 'Local Uploads', description: 'Audio files imported from this device.', coverUrl: '/covers/local-uploads.svg', accent: '#257452' },
]

export const songsForPlaylist = (songs: Song[], playlistName: string) =>
  songs.filter((song) => song.playlist === playlistName)
