# Localfy

A Spotify-inspired local music player built with React, TypeScript, and Vite. It never
calls a streaming API. Use the in-app library importer to store audio in your browser,
or bundle audio files in `public/music`.

## Import your music

Open **Your Library**, choose one or more local audio files, optionally choose a cover
image, then click **Add to library**. Imported files stay on your device in IndexedDB
and return after a page refresh.

## Bundle demo music

1. Place your MP3 files in `public/music`.
2. Update `src/data/songs.ts` so each `audioUrl` matches a real file.
3. Add cover images under `public/covers` and update `coverUrl` as needed.

The included catalog uses clear demo MP3 filenames. Audio files are intentionally not
included. Missing files produce a visible player error.

## Run

```bash
npm install
npm run dev
```

Use `npm run build` to verify a production build.

## Demo login

Localfy now includes a small Node auth server in `server/index.mjs`. It keeps a
session cookie and validates login against the bundled user store.

- Email: `admin@localfy.app`
- Password: `Localfy123`

## Run auth locally

Start the auth server:

```bash
node server/index.mjs
```

Then start the Vite frontend as usual. The dev server proxies `/api` to
`http://127.0.0.1:8787`.
