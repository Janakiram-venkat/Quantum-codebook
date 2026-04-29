import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BookOpen, ChevronDown, ChevronRight, Home, Sparkles } from 'lucide-react'

const beginnerTopics = [
  { id: 'qubits_states', label: 'Qubits and States' },
  { id: 'single_gates', label: 'Single Gates' },
  { id: 'measurement', label: 'Measurement' },
  { id: 'superposition', label: 'Superposition' },
  { id: 'entanglement', label: 'Entanglement' },
]

const intermediateTopics = [
  { id: 'multi_qubit_system', label: 'Multi Qubit System' },
  { id: 'qft', label: 'Quantum Fourier Transform' },
  { id: 'grovers_algorithm', label: "Grover's Algorithm" },
  { id: 'vqe', label: 'Variational Quantum Eigen Solver' },
  { id: 'noise_model', label: 'Noise Model' },
  { id: 'quantum_error_correction', label: 'Quantum Error Correction' },
]

const advanceTopics = [
  { id: 'shors_algorithm', label: "Shor's Algorithm" },
  { id: 'hamiltonian_simulation', label: 'Hamiltonian Simulation' },
  { id: 'qaoa', label: 'QAOA' },
  { id: 'quantum_walks', label: 'Quantum Walks' },
  { id: 'surface_code', label: 'Surface Codes' },
]

const researchTopics = [
  { id: 'variational_quantum_algorithms', label: 'Variational Quantum Algorithms' },
  { id: 'quantum_machine_learning', label: 'Quantum Machine Learning' },
  { id: 'topological_quantum_computing', label: 'Topological Quantum Computing' },
  { id: 'quantum_chemistry', label: 'Quantum Chemistry' },
  { id: 'fault_tolerant_quantum_computing', label: 'Fault Tolerant Quantum Computing' },
  { id: 'quantum_networking', label: 'Quantum Networking' },
]

const primaryLinks = [
  { to: '/', label: 'Welcome', icon: Home, end: true },
]

export default function Sidebar() {
  const location = useLocation()
  const [beginnerCollapsed, setBeginnerCollapsed] = useState(false)
  const [intermediateCollapsed, setIntermediateCollapsed] = useState(false)
  const [advanceCollapsed, setAdvanceCollapsed] = useState(false)
  const [researchCollapsed, setResearchCollapsed] = useState(false)
  
  const isLearningRoute = location.pathname.startsWith('/lesson/') || location.pathname.startsWith('/track/')
  const isIntermediateRoute = location.pathname.startsWith('/lesson/') && 
    ['multi_qubit_system', 'qft', 'grovers_algorithm', 'vqe', 'noise_model', 'quantum_error_correction'].some(id => location.pathname.includes(id)) ||
    location.pathname === '/track/intermediate'
  const isAdvanceRoute = location.pathname.startsWith('/lesson/') && 
    ['shors_algorithm', 'hamiltonian_simulation', 'qaoa', 'quantum_walks', 'surface_code'].some(id => location.pathname.includes(id)) ||
    location.pathname === '/track/advance'
  const isResearchRoute = location.pathname.startsWith('/lesson/') && 
    ['variational_quantum_algorithms', 'quantum_machine_learning', 'topological_quantum_computing', 'quantum_chemistry', 'fault_tolerant_quantum_computing', 'quantum_networking'].some(id => location.pathname.includes(id)) ||
    location.pathname === '/track/research' || location.search.includes('level=research')
  const isBeginnerRoute = location.pathname.startsWith('/lesson/') && !isIntermediateRoute && !isAdvanceRoute && !isResearchRoute || location.pathname === '/track/beginner'
  
  const showBeginnerLessons = !beginnerCollapsed || (isLearningRoute && isBeginnerRoute)
  const showIntermediateLessons = !intermediateCollapsed || (isLearningRoute && isIntermediateRoute)
  const showAdvanceLessons = !advanceCollapsed || (isLearningRoute && isAdvanceRoute)
  const showResearchLessons = !researchCollapsed || (isLearningRoute && isResearchRoute)

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

        <section className="app-sidebar-section">
          <button
            className="app-sidebar-section-toggle"
            onClick={() => setAdvanceCollapsed(collapsed => !collapsed)}
          >
            <span className="app-sidebar-section-toggle-copy">
              <BookOpen size={16} />
              <span>Advance Lessons</span>
            </span>
            {showAdvanceLessons ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {showAdvanceLessons && (
            <div className="app-sidebar-link-stack">
              {advanceTopics.map(({ id, label }, index) => (
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
            onClick={() => setResearchCollapsed(collapsed => !collapsed)}
          >
            <span className="app-sidebar-section-toggle-copy">
              <BookOpen size={16} />
              <span>Research Lessons</span>
            </span>
            {showResearchLessons ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {showResearchLessons && (
            <div className="app-sidebar-link-stack">
              {researchTopics.map(({ id, label }, index) => (
                <NavLink
                  key={id}
                  to={`/lesson/${id}?level=research`}
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
