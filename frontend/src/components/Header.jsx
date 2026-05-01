import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Maximize2, Minimize2, MoonStar, SunMedium } from 'lucide-react'
import { BRAND_NAME, PRODUCT_NAME, brandLogo } from '../lib/branding.js'

const beginnerLessons = [
  { id: 'qubits_states', label: 'Qubits and States' },
  { id: 'single_gates', label: 'Single Gates' },
  { id: 'measurement', label: 'Measurement' },
  { id: 'superposition', label: 'Superposition' },
  { id: 'entanglement', label: 'Entanglement' },
]

const intermediateLessons = [
  { id: 'multi_qubit_system', label: 'Multi Qubit System' },
  { id: 'qft', label: 'Quantum Fourier Transform' },
  { id: 'grovers_algorithm', label: "Grover's Algorithm" },
  { id: 'vqe', label: 'Variational Quantum Eigen Solver' },
  { id: 'noise_model', label: 'Noise Model' },
  { id: 'quantum_error_correction', label: 'Quantum Error Correction' },
]

const advanceLessons = [
  { id: 'shors_algorithm', label: "Shor's Algorithm" },
  { id: 'hamiltonian_simulation', label: 'Hamiltonian Simulation' },
  { id: 'qaoa', label: 'QAOA' },
  { id: 'quantum_walks', label: 'Quantum Walks' },
  { id: 'surface_code', label: 'Surface Codes' },
]

const lessonTitles = Object.fromEntries([
  ...beginnerLessons.map(l => [l.id, l.label]),
  ...intermediateLessons.map(l => [l.id, l.label]),
  ...advanceLessons.map(l => [l.id, l.label]),
])

function resolveHeaderState(pathname) {
  const pathParts = pathname.split('/').filter(Boolean)
  const routeGroup = pathParts[0]
  const routeId = pathParts[1]

  if (pathname === '/') {
    return { eyebrow: 'Home', title: PRODUCT_NAME, nextLabel: 'Beginner Track', nextPath: '/track/beginner' }
  }

  if (routeGroup === 'track') {
    const trackLabel = routeId === 'beginner' ? 'Beginner Track'
      : routeId === 'intermediate' ? 'Intermediate Track'
      : routeId === 'advance' ? 'Advance Track' : 'Learning Track'
    const firstLessonId = routeId === 'beginner' ? 'qubits_states'
      : routeId === 'intermediate' ? 'multi_qubit_system'
      : routeId === 'advance' ? 'shors_algorithm' : 'qubits_states'
    return { eyebrow: 'Track', title: trackLabel, nextLabel: 'Start Learning', nextPath: `/lesson/${firstLessonId}` }
  }

  if (routeGroup === 'lesson') {
    const isAdvance = advanceLessons.some(l => l.id === routeId)
    const isIntermediate = intermediateLessons.some(l => l.id === routeId)
    const lessonArray = isAdvance ? advanceLessons : isIntermediate ? intermediateLessons : beginnerLessons
    const trackPath = isAdvance ? 'advance' : isIntermediate ? 'intermediate' : 'beginner'
    const currentIndex = lessonArray.findIndex(l => l.id === routeId)
    const nextLesson = lessonArray[currentIndex + 1]
    return {
      eyebrow: 'Now Reading',
      title: lessonTitles[routeId] ?? 'Lesson',
      nextLabel: nextLesson ? nextLesson.label : 'Back to Track',
      nextPath: nextLesson ? `/lesson/${nextLesson.id}` : `/track/${trackPath}`,
    }
  }

  return { eyebrow: 'Workspace', title: PRODUCT_NAME, nextLabel: 'Home', nextPath: '/' }
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
      >
        <img src={brandLogo} alt={BRAND_NAME} className="app-topbar-brand-image" />
        <span className="app-topbar-brand-subtitle">{PRODUCT_NAME}</span>
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
            <ArrowRight size={13} />
          </span>
        </button>
      </div>

      <div className="app-topbar-cell">
        <button
          className="app-topbar-cell-button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="app-topbar-cell-label">Theme</span>
          <span className="app-topbar-cell-value">
            {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            {theme === 'dark' ? <MoonStar size={13} /> : <SunMedium size={13} />}
          </span>
        </button>
      </div>

      <div className="app-topbar-cell">
        <button className="app-topbar-cell-button" onClick={onToggleFullscreen}>
          <span className="app-topbar-cell-label">View</span>
          <span className="app-topbar-cell-value">
            {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </span>
        </button>
      </div>
    </header>
  )
}
