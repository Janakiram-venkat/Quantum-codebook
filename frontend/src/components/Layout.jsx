import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { brandLogo } from '../lib/branding.js'

const THEME_STORAGE_KEY = 'quantum-codebook-theme'
const SIDEBAR_STORAGE_KEY = 'quantum-codebook-sidebar-open'

function getInitialTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    return 'dark'
  }
  return 'dark'
}

function getInitialSidebarOpen() {
  try {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
  } catch {
    return !window.matchMedia('(max-width: 768px)').matches
  }
  return !window.matchMedia('(max-width: 768px)').matches
}

export default function Layout() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)
  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarOpen)

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      return
    }
    document.exitFullscreen().catch(() => {})
  }

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    const themeColorMeta = document.querySelector("meta[name='theme-color']")
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#050c1a' : '#f0f4ff')
    }
  }, [theme])

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']") || document.createElement('link')
    favicon.setAttribute('rel', 'icon')
    favicon.setAttribute('type', 'image/png')
    favicon.setAttribute('href', brandLogo)
    if (!favicon.parentNode) document.head.appendChild(favicon)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarOpen))
  }, [isSidebarOpen])

  return (
    <div className="app-shell-frame">
      <div className={`app-shell-grid${isSidebarOpen ? '' : ' is-sidebar-collapsed'}`}>
        <Header
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(open => !open)}
        />
        <aside className={`app-shell-sidebar${isSidebarOpen ? '' : ' is-collapsed'}`}>
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
