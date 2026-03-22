import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Maximize2, Minimize2, MoonStar, SunMedium } from 'lucide-react'
import { BRAND_NAME, PRODUCT_NAME, brandLogo } from '../lib/branding.js'

const beginnerLessons = [
  { id: 'QubitsAndStates', label: 'Qubits and States' },
  { id: 'singleGates', label: 'Single Gates' },
  { id: 'Mesurement', label: 'Measurement' },
  { id: 'superposition', label: 'Superposition' },
  { id: 'entanglement', label: 'Entanglement' },
]

const intermediateLessons = [
  { id: 'multi_qubit_system', label: 'Multi Qubit System' },
  { id: 'qft', label: 'Quantum Fourier Transform' },
  { id: 'grovers_algorithm', label: "Grover's Algorithm" },
  { id: 'vqe', label: 'Variational Quantum Eigen Solver' },
  { id: 'noise_model', label: 'Noise Model' },
  { id: 'quantum_error_corection', label: 'Quantum Error Correction' },
]

const allLessons = {
  begainner: beginnerLessons,
  intermidiate: intermediateLessons,
}

const lessonTitles = Object.fromEntries([
  ...beginnerLessons.map(lesson => [lesson.id, lesson.label]),
  ...intermediateLessons.map(lesson => [lesson.id, lesson.label]),
])

function resolveHeaderState(pathname) {
  const pathParts = pathname.split('/').filter(Boolean)
  const routeGroup = pathParts[0]
  const routeId = pathParts[1]

  if (pathname === '/') {
    return {
      eyebrow: 'Home',
      title: PRODUCT_NAME,
      nextLabel: 'Beginner Track',
      nextPath: '/track/begainner',
    }
  }

  if (routeGroup === 'track') {
    const trackLabel = routeId === 'begainner' ? 'Beginner Track' : routeId === 'intermidiate' ? 'Intermediate Track' : 'Learning Track'
    const firstLessonId = routeId === 'begainner' ? 'QubitsAndStates' : routeId === 'intermidiate' ? 'multi_qubit_system' : 'QubitsAndStates'
    
    return {
      eyebrow: 'Track',
      title: trackLabel,
      nextLabel: 'Start Learning',
      nextPath: `/lesson/${firstLessonId}`,
    }
  }

  if (routeGroup === 'lesson') {
    // Determine which track the lesson belongs to
    const isIntermediateLesson = intermediateLessons.some(l => l.id === routeId)
    const lessonArray = isIntermediateLesson ? intermediateLessons : beginnerLessons
    const trackPath = isIntermediateLesson ? 'intermidiate' : 'begainner'
    
    const currentIndex = lessonArray.findIndex(lesson => lesson.id === routeId)
    const nextLesson = lessonArray[currentIndex + 1]

    return {
      eyebrow: 'Now Reading',
      title: lessonTitles[routeId] ?? 'Lesson',
      nextLabel: nextLesson ? nextLesson.label : 'Back to Track',
      nextPath: nextLesson ? `/lesson/${nextLesson.id}` : `/track/${trackPath}`,
    }
  }

  return {
    eyebrow: 'Workspace',
    title: PRODUCT_NAME,
    nextLabel: 'Home',
    nextPath: '/',
  }
}

export default function Header({ isFullscreen, onToggleFullscreen, theme, onToggleTheme }) {
  const location = useLocation()
  const navigate = useNavigate()
  const state = resolveHeaderState(location.pathname)

  return (
    <header className="app-topbar">
      <button 
        className="app-topbar-brand" 
        onClick={() => navigate('/')}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', padding: '0 8px' }}
      >
        <img src={brandLogo} alt={BRAND_NAME} className="app-topbar-brand-image" />
        <span className="app-topbar-brand-subtitle" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
          {PRODUCT_NAME}
        </span>
      </button>

      <div className="app-topbar-title">
        <p className="app-topbar-eyebrow">{state.eyebrow}</p>
        <h1 className="app-topbar-heading">{state.title}</h1>
      </div>

      <div className="app-topbar-cell">
        <button className="app-topbar-cell-button" onClick={() => navigate(state.nextPath)}>
          <span className="app-topbar-cell-label">Next</span>
          <span className="app-topbar-cell-value">
            {state.nextLabel}
            <ArrowRight size={14} />
          </span>
        </button>
      </div>

      <div className="app-topbar-cell app-topbar-cell--compact">
        <button
          className="app-topbar-cell-button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="app-topbar-cell-label">Theme</span>
          <span className="app-topbar-cell-value">
            {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            {theme === 'dark' ? <MoonStar size={14} /> : <SunMedium size={14} />}
          </span>
        </button>
      </div>

      <div className="app-topbar-cell app-topbar-cell--compact">
        <button className="app-topbar-cell-button" onClick={onToggleFullscreen}>
          <span className="app-topbar-cell-label">View</span>
          <span className="app-topbar-cell-value">
            {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </span>
        </button>
      </div>
    </header>
  )
}
