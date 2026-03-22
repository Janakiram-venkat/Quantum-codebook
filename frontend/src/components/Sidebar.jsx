import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BookOpen, ChevronDown, ChevronRight, Home, Sparkles } from 'lucide-react'

const beginnerTopics = [
  { id: 'QubitsAndStates', label: 'Qubits and States' },
  { id: 'singleGates', label: 'Single Gates' },
  { id: 'Mesurement', label: 'Measurement' },
  { id: 'superposition', label: 'Superposition' },
  { id: 'entanglement', label: 'Entanglement' },
]

const intermediateTopics = [
  { id: 'multi_qubit_system', label: 'Multi Qubit System' },
  { id: 'qft', label: 'Quantum Fourier Transform' },
  { id: 'grovers_algorithm', label: "Grover's Algorithm" },
  { id: 'vqe', label: 'Variational Quantum Eigen Solver' },
  { id: 'noise_model', label: 'Noise Model' },
  { id: 'quantum_error_corection', label: 'Quantum Error Correction' },
]

const primaryLinks = [
  { to: '/', label: 'Welcome', icon: Home, end: true },
]

export default function Sidebar() {
  const location = useLocation()
  const [beginnerCollapsed, setBeginnerCollapsed] = useState(false)
  const [intermediateCollapsed, setIntermediateCollapsed] = useState(false)
  
  const isLearningRoute = location.pathname.startsWith('/lesson/') || location.pathname.startsWith('/track/')
  const isIntermediateRoute = location.pathname.startsWith('/lesson/') && 
    ['multi_qubit_system', 'qft', 'grovers_algorithm', 'vqe', 'noise_model', 'quantum_error_corection'].some(id => location.pathname.includes(id)) ||
    location.pathname === '/track/intermidiate'
  const isBeginnerRoute = location.pathname.startsWith('/lesson/') || location.pathname === '/track/begainner'
  
  const showBeginnerLessons = !beginnerCollapsed || (isLearningRoute && isBeginnerRoute && !isIntermediateRoute)
  const showIntermediateLessons = !intermediateCollapsed || (isLearningRoute && isIntermediateRoute)

  return (
    <div className="app-sidebar-shell">
      <div className="app-sidebar-scroll">
        <section className="app-sidebar-section">
          <p className="app-sidebar-section-label">Navigation</p>
          <div className="app-sidebar-link-stack">
            {primaryLinks.map(link => {
              const LinkIcon = link.icon

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `app-sidebar-link${isActive ? ' is-active' : ''}`
                  }
                >
                  <LinkIcon size={16} />
                  <span>{link.label}</span>
                </NavLink>
              )
            })}
          </div>
        </section>

        <section className="app-sidebar-section">
          <button
            className="app-sidebar-section-toggle"
            onClick={() => setBeginnerCollapsed(collapsed => !collapsed)}
          >
            <span className="app-sidebar-section-toggle-copy">
              <BookOpen size={16} />
              <span>Beginner Lessons</span>
            </span>
            {showBeginnerLessons ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {showBeginnerLessons && (
            <div className="app-sidebar-link-stack">
              {beginnerTopics.map(({ id, label }, index) => (
                <NavLink
                  key={id}
                  to={`/lesson/${id}`}
                  className={({ isActive }) =>
                    `app-sidebar-lesson-link${isActive ? ' is-active' : ''}`
                  }
                >
                  <span className="app-sidebar-lesson-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </section>

        <section className="app-sidebar-section">
          <button
            className="app-sidebar-section-toggle"
            onClick={() => setIntermediateCollapsed(collapsed => !collapsed)}
          >
            <span className="app-sidebar-section-toggle-copy">
              <BookOpen size={16} />
              <span>Intermediate Lessons</span>
            </span>
            {showIntermediateLessons ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {showIntermediateLessons && (
            <div className="app-sidebar-link-stack">
              {intermediateTopics.map(({ id, label }, index) => (
                <NavLink
                  key={id}
                  to={`/lesson/${id}`}
                  className={({ isActive }) =>
                    `app-sidebar-lesson-link${isActive ? ' is-active' : ''}`
                  }
                >
                  <span className="app-sidebar-lesson-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="app-sidebar-footer">
        <p className="app-sidebar-footer-title">Sidebar</p>
        <p className="app-sidebar-footer-copy">Course navigation stays fixed while lesson content scrolls independently.</p>
      </div>
    </div>
  )
}
