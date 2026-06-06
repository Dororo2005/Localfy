import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { AuthProvider } from './context/AuthContext'
import { MusicProvider } from './context/MusicContext'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MusicProvider>
          <App />
        </MusicProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
