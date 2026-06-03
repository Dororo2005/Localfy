export type Song = {
  id: number
  title: string
  artist: string
  album: string
  duration: string
  audioUrl: string
  coverUrl: string
  playlist: string
  isUploaded?: boolean
}

// Add matching audio files under public/music. Missing demo files are handled in the player UI.
export const songs: Song[] = [
  { id: 1, title: 'Midnight Drive', artist: 'Local Sessions', album: 'City Lights', duration: '3:42', audioUrl: '/music/demo-midnight-drive.mp3', coverUrl: '/covers/city-lights.svg', playlist: 'Night Drive' },
  { id: 2, title: 'Neon Weather', artist: 'Local Sessions', album: 'City Lights', duration: '4:08', audioUrl: '/music/demo-neon-weather.mp3', coverUrl: '/covers/city-lights.svg', playlist: 'Night Drive' },
  { id: 3, title: 'Still Morning', artist: 'Home Studio', album: 'Quiet Hours', duration: '2:56', audioUrl: '/music/demo-still-morning.mp3', coverUrl: '/covers/quiet-hours.svg', playlist: 'Focus Flow' },
  { id: 4, title: 'Paper Planes', artist: 'Home Studio', album: 'Quiet Hours', duration: '3:18', audioUrl: '/music/demo-paper-planes.mp3', coverUrl: '/covers/quiet-hours.svg', playlist: 'Focus Flow' },
  { id: 5, title: 'Sunday Vinyl', artist: 'Room Tone', album: 'Warm Static', duration: '3:31', audioUrl: '/music/demo-sunday-vinyl.mp3', coverUrl: '/covers/warm-static.svg', playlist: 'Coffee & Vinyl' },
  { id: 6, title: 'Soft Focus', artist: 'Room Tone', album: 'Warm Static', duration: '3:52', audioUrl: '/music/demo-soft-focus.mp3', coverUrl: '/covers/warm-static.svg', playlist: 'Coffee & Vinyl' },
  { id: 7, title: 'Late Checkout', artist: 'Weekend Tape', album: 'Open Windows', duration: '3:05', audioUrl: '/music/demo-late-checkout.mp3', coverUrl: '/covers/open-windows.svg', playlist: 'Weekend Mix' },
  { id: 8, title: 'Golden Hour', artist: 'Weekend Tape', album: 'Open Windows', duration: '4:14', audioUrl: '/music/demo-golden-hour.mp3', coverUrl: '/covers/open-windows.svg', playlist: 'Weekend Mix' },
]
