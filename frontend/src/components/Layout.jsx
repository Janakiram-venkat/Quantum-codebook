import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { brandLogo } from '../lib/branding.js'

const THEME_STORAGE_KEY = 'quantum-codebook-theme'

function getInitialTheme() {
  return 'light'
}

export default function Layout() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      return
    }

    document.exitFullscreen().catch(() => {})
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)

    const themeColorMeta = document.querySelector("meta[name='theme-color']")
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#07111d' : '#ffffff')
    }
  }, [theme])

  useEffect(() => {
    const favicon =
      document.querySelector("link[rel='icon']") || document.createElement('link')

    favicon.setAttribute('rel', 'icon')
    favicon.setAttribute('type', 'image/png')
    favicon.setAttribute('href', brandLogo)

    if (!favicon.parentNode) {
      document.head.appendChild(favicon)
    }
  }, [])

  return (
    <div className="app-shell-frame">
      <div className="app-shell-grid">
        <Header
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          theme={theme}
          onToggleTheme={() => setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'))}
        />

        <aside className="app-shell-sidebar">
          <Sidebar />
        </aside>

        <section className="app-shell-content">
          <main className="app-shell-content-scroll">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  )
}
