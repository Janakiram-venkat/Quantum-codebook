import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Atom, ChevronDown, ChevronRight, Home, Zap, Layers, FlaskConical, Telescope } from 'lucide-react'

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

const trackConfig = [
  {
    key: 'beginner',
    label: 'Beginner',
    icon: Atom,
    topics: beginnerTopics,
    color: 'var(--neon-cyan)',
    linkPrefix: '/lesson/',
  },
  {
    key: 'intermediate',
    label: 'Intermediate',
    icon: Zap,
    topics: intermediateTopics,
    color: 'var(--neon-blue)',
    linkPrefix: '/lesson/',
    ids: ['multi_qubit_system', 'qft', 'grovers_algorithm', 'vqe', 'noise_model', 'quantum_error_correction'],
  },
  {
    key: 'advance',
    label: 'Advanced',
    icon: Layers,
    topics: advanceTopics,
    color: 'var(--neon-purple)',
    linkPrefix: '/lesson/',
    ids: ['shors_algorithm', 'hamiltonian_simulation', 'qaoa', 'quantum_walks', 'surface_code'],
  },
  {
    key: 'research',
    label: 'Research',
    icon: Telescope,
    topics: researchTopics,
    color: '#34d399',
    linkPrefix: '/lesson/',
    suffix: '?level=research',
    ids: ['variational_quantum_algorithms', 'quantum_machine_learning', 'topological_quantum_computing', 'quantum_chemistry', 'fault_tolerant_quantum_computing', 'quantum_networking'],
  },
]

function TrackSection({ track, isOpen, onToggle }) {
  const TrackIcon = track.icon
  return (
    <section className="app-sidebar-section">
      <button
        className="app-sidebar-section-toggle"
        onClick={onToggle}
        style={{ '--track-color': track.color }}
      >
        <span className="app-sidebar-section-toggle-copy">
          <TrackIcon size={14} style={{ color: track.color, flexShrink: 0 }} />
          <span style={{ fontSize: '12.5px' }}>{track.label}</span>
        </span>
        {isOpen
          ? <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          : <ChevronRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        }
      </button>

      {isOpen && (
        <div className="app-sidebar-link-stack">
          {track.topics.map(({ id, label }, index) => (
            <NavLink
              key={id}
              to={`${track.linkPrefix}${id}${track.suffix || ''}`}
              className={({ isActive }) => `app-sidebar-lesson-link${isActive ? ' is-active' : ''}`}
            >
              <span className="app-sidebar-lesson-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '12.5px', lineHeight: 1.35 }}>{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </section>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const [openTracks, setOpenTracks] = useState(() => {
    const path = location.pathname
    const open = { beginner: true, intermediate: false, advance: false, research: false }
    if (path.startsWith('/lesson/')) {
      const id = path.split('/lesson/')[1]
      if (trackConfig[1].ids?.some(x => id.includes(x))) { open.beginner = false; open.intermediate = true }
      else if (trackConfig[2].ids?.some(x => id.includes(x))) { open.beginner = false; open.advance = true }
      else if (trackConfig[3].ids?.some(x => id.includes(x))) { open.beginner = false; open.research = true }
    }
    return open
  })

  const toggle = (key) => setOpenTracks(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="app-sidebar-shell">
      <div className="app-sidebar-scroll">
        {/* Home link */}
        <section className="app-sidebar-section">
          <p className="app-sidebar-section-label">Navigation</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `app-sidebar-link${isActive ? ' is-active' : ''}`}
            >
              <Home size={14} style={{ flexShrink: 0 }} />
              <span>Welcome</span>
            </NavLink>
          </div>
        </section>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--rule)', margin: '4px 0 8px' }} />

        <p className="app-sidebar-section-label">Learning Tracks</p>

        {trackConfig.map(track => (
          <TrackSection
            key={track.key}
            track={track}
            isOpen={openTracks[track.key]}
            onToggle={() => toggle(track.key)}
          />
        ))}
      </div>

      <div className="app-sidebar-footer">
        <p className="app-sidebar-footer-title">Quantum Codebook</p>
        <p className="app-sidebar-footer-copy">Navigation stays fixed while lesson content scrolls independently.</p>
      </div>
    </div>
  )
}
