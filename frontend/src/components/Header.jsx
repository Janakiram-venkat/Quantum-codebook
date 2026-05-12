import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Maximize2, Minimize2, MoonStar, PanelLeftClose, PanelLeftOpen, SunMedium } from 'lucide-react'
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

const researchLessons = [
  { id: 'variational_quantum_algorithms', label: 'Variational Quantum Algorithms' },
  { id: 'quantum_machine_learning', label: 'Quantum Machine Learning' },
  { id: 'topological_quantum_computing', label: 'Topological Quantum Computing' },
  { id: 'quantum_chemistry', label: 'Quantum Chemistry' },
  { id: 'fault_tolerant_quantum_computing', label: 'Fault Tolerant Quantum Computing' },
  { id: 'quantum_networking', label: 'Quantum Networking' },
]

const lessonTitles = Object.fromEntries([
  ...beginnerLessons.map(l => [l.id, l.label]),
  ...intermediateLessons.map(l => [l.id, l.label]),
  ...advanceLessons.map(l => [l.id, l.label]),
  ...researchLessons.map(l => [l.id, l.label]),
])

export function resolveHeaderState(pathname) {
  const pathParts = pathname.split('/').filter(Boolean)
  const routeGroup = pathParts[0]
  const routeId = pathParts[1]

  if (pathname === '/') {
    return { eyebrow: 'Home', title: PRODUCT_NAME, nextLabel: 'Start Learning', nextPath: '/lesson/qubits_states' }
  }

  if (routeGroup === 'lesson') {
    const isResearch = researchLessons.some(l => l.id === routeId)
    const isAdvance = advanceLessons.some(l => l.id === routeId)
    const isIntermediate = intermediateLessons.some(l => l.id === routeId)
    const lessonArray = isResearch
      ? researchLessons
      : isAdvance
        ? advanceLessons
        : isIntermediate
          ? intermediateLessons
          : beginnerLessons
    const currentIndex = lessonArray.findIndex(l => l.id === routeId)
    const nextLesson = lessonArray[currentIndex + 1]
    return {
      eyebrow: 'Now Reading',
      title: lessonTitles[routeId] ?? 'Lesson',
      nextLabel: nextLesson ? nextLesson.label : 'Choose Track',
      nextPath: nextLesson ? `/lesson/${nextLesson.id}` : '/',
    }
  }

  return { eyebrow: 'Workspace', title: PRODUCT_NAME, nextLabel: 'Home', nextPath: '/' }
}

export default function Header({
  isFullscreen,
  onToggleFullscreen,
  theme,
  onToggleTheme,
  isSidebarOpen,
  onToggleSidebar,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const state = resolveHeaderState(location.pathname)

  return (
    <header className={`app-topbar${isSidebarOpen ? '' : ' is-sidebar-collapsed'}`}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <button
          className="app-topbar-brand"
          onClick={() => navigate('/')}
        >
          <img src={brandLogo} alt={BRAND_NAME} className="app-topbar-brand-image" />
          <span className="app-topbar-brand-subtitle">{PRODUCT_NAME}</span>
        </button>

        <button
          className="app-topbar-nav-toggle"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Hide navigation sidebar' : 'Show navigation sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className={`app-topbar-title${state.title || state.eyebrow ? '' : ' is-empty'}`}>
          {state.title || state.eyebrow ? (
            <div className="app-topbar-title-copy">
              {state.eyebrow ? <p className="app-topbar-eyebrow">{state.eyebrow}</p> : null}
              {state.title ? <h1 className="app-topbar-heading">{state.title}</h1> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="app-topbar-icon-button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <MoonStar size={18} /> : <SunMedium size={18} />}
        </button>

        <button
          className="app-topbar-icon-button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </header>
  )
}
