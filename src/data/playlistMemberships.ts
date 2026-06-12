export type PlaylistMemberships = {
  additions: Record<string, number[]>
  removals: Record<string, number[]>
}

const STORAGE_KEY = 'localfy-playlist-memberships'

const emptyMemberships = (): PlaylistMemberships => ({
  additions: {},
  removals: {},
})

export const loadPlaylistMemberships = (): PlaylistMemberships => {
  if (typeof window === 'undefined') return emptyMemberships()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyMemberships()

    const parsed = JSON.parse(raw) as Partial<PlaylistMemberships>
    return {
      additions: parsed.additions ?? {},
      removals: parsed.removals ?? {},
    }
  } catch {
    return emptyMemberships()
  }
}

export const savePlaylistMemberships = (memberships: PlaylistMemberships) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memberships))
}
