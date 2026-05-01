import { Link } from 'react-router-dom'
import { ArrowRight, Atom, Zap, Layers, Telescope, ChevronRight } from 'lucide-react'
import { BRAND_NAME, PRODUCT_NAME, brandLogo } from '../lib/branding.js'

const tracks = [
  {
    key: 'beginner',
    label: 'Beginner',
    tag: 'Foundation',
    description: 'Learn qubits, gates, measurement, superposition, and entanglement.',
    icon: Atom,
    color: 'var(--neon-cyan)',
    colorDim: 'rgba(56, 189, 248, 0.08)',
    colorBorder: 'rgba(56, 189, 248, 0.2)',
    firstLesson: 'qubits_states',
    topics: [
      { id: 'qubits_states', label: 'Qubits and States' },
      { id: 'single_gates', label: 'Single Gates' },
      { id: 'measurement', label: 'Measurement' },
      { id: 'superposition', label: 'Superposition' },
      { id: 'entanglement', label: 'Entanglement' },
    ],
    cta: 'Start Learning',
  },
  {
    key: 'intermediate',
    label: 'Intermediate',
    tag: 'Core Skills',
    description: 'Multi-qubit systems, quantum algorithms, and error correction.',
    icon: Zap,
    color: 'var(--neon-blue)',
    colorDim: 'rgba(96, 165, 250, 0.08)',
    colorBorder: 'rgba(96, 165, 250, 0.2)',
    firstLesson: 'multi_qubit_system',
    topics: [
      { id: 'multi_qubit_system', label: 'Multi Qubit System' },
      { id: 'qft', label: 'Quantum Fourier Transform' },
      { id: 'grovers_algorithm', label: "Grover's Algorithm" },
      { id: 'vqe', label: 'Variational Quantum Eigen Solver' },
      { id: 'noise_model', label: 'Noise Model' },
      { id: 'quantum_error_correction', label: 'Quantum Error Correction' },
    ],
    cta: 'Continue Learning',
  },
  {
    key: 'advance',
    label: 'Advanced',
    tag: 'Specialization',
    description: 'State-of-the-art algorithms: QAOA, Shor\'s, Surface Codes.',
    icon: Layers,
    color: 'var(--neon-purple)',
    colorDim: 'rgba(167, 139, 250, 0.08)',
    colorBorder: 'rgba(167, 139, 250, 0.2)',
    firstLesson: 'shors_algorithm',
    topics: [
      { id: 'shors_algorithm', label: "Shor's Algorithm" },
      { id: 'hamiltonian_simulation', label: 'Hamiltonian Simulation' },
      { id: 'qaoa', label: 'QAOA' },
      { id: 'quantum_walks', label: 'Quantum Walks' },
      { id: 'surface_code', label: 'Surface Codes' },
    ],
    cta: 'Start Advanced',
  },
  {
    key: 'research',
    label: 'Research',
    tag: 'Innovation',
    description: 'Active research frontiers with interactive research-grade simulators.',
    icon: Telescope,
    color: '#34d399',
    colorDim: 'rgba(52, 211, 153, 0.08)',
    colorBorder: 'rgba(52, 211, 153, 0.2)',
    firstLesson: 'variational_quantum_algorithms',
    suffix: '?level=research',
    topics: [
      { id: 'variational_quantum_algorithms', label: 'Variational Quantum Algorithms' },
      { id: 'quantum_machine_learning', label: 'Quantum Machine Learning' },
      { id: 'topological_quantum_computing', label: 'Topological Quantum Computing' },
      { id: 'quantum_chemistry', label: 'Quantum Chemistry' },
      { id: 'fault_tolerant_quantum_computing', label: 'Fault Tolerant Quantum Computing' },
      { id: 'quantum_networking', label: 'Quantum Networking' },
    ],
    cta: 'Explore Research',
  },
]

function TrackCard({ track }) {
  const TrackIcon = track.icon
  const suffix = track.suffix || ''

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${track.colorBorder}`,
      borderRadius: 14,
      padding: '22px 22px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxShadow: 'var(--card-shadow)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = track.color; e.currentTarget.style.boxShadow = `0 0 24px ${track.colorDim}, var(--card-shadow)` }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = track.colorBorder; e.currentTarget.style.boxShadow = 'var(--card-shadow)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: 10,
          background: track.colorDim,
          border: `1px solid ${track.colorBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <TrackIcon size={18} style={{ color: track.color }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>{track.label}</span>
            <span style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: track.color,
              background: track.colorDim,
              border: `1px solid ${track.colorBorder}`,
              padding: '2px 7px', borderRadius: 999,
              fontFamily: 'var(--font-display)',
            }}>{track.tag}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
            {track.description}
          </p>
        </div>
      </div>

      {/* Lesson list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {track.topics.map(({ id, label }, i) => (
          <li key={id}>
            <Link
              to={`/lesson/${id}${suffix}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 6px',
                borderRadius: 7,
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                fontSize: 13,
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--soft-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <span style={{
                fontSize: 10, color: track.color, fontFamily: 'var(--font-mono)',
                fontWeight: 600, minWidth: 20, opacity: 0.8,
              }}>{String(i + 1).padStart(2, '0')}</span>
              <span>{label}</span>
              <ChevronRight size={11} style={{ marginLeft: 'auto', color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0 }} />
            </Link>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        to={`/lesson/${track.firstLesson}${suffix}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 12.5, fontWeight: 700,
          color: track.color,
          textDecoration: 'none',
          padding: '8px 14px',
          border: `1px solid ${track.colorBorder}`,
          borderRadius: 8,
          background: track.colorDim,
          transition: 'background 0.15s, border-color 0.15s',
          alignSelf: 'flex-start',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${track.colorBorder}`; e.currentTarget.style.borderColor = track.color }}
        onMouseLeave={e => { e.currentTarget.style.background = track.colorDim; e.currentTarget.style.borderColor = track.colorBorder }}
      >
        {track.cta} <ArrowRight size={13} />
      </Link>
    </div>
  )
}

export default function Home() {
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(16px, 2vw, 32px) 0 48px' }}>

      {/* Hero */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        padding: 'clamp(24px, 3vw, 40px)',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: '30%',
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <img src={brandLogo} alt={BRAND_NAME} className="home-brand-image" />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          marginBottom: 16,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--accent)',
          fontFamily: 'var(--font-display)',
          padding: '4px 12px',
          background: 'var(--neon-cyan-dim)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: 999,
        }}>
          <Atom size={11} />
          Quantum Learning Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(26px, 4vw, 44px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: 16,
          maxWidth: 640,
        }}>
          Welcome to{' '}
          <span style={{ color: 'var(--accent)' }}>Quantum Codebook</span>
        </h1>

        <p style={{
          fontSize: 'clamp(14px, 1.5vw, 17px)',
          color: 'var(--text-secondary)',
          lineHeight: 1.75,
          maxWidth: 600,
          marginBottom: 24,
        }}>
          Structured learning path from quantum fundamentals to research frontiers — with interactive circuit simulators and hands-on labs.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to="/lesson/qubits_states"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 14, fontWeight: 700,
              color: 'var(--bg-primary)',
              textDecoration: 'none',
              padding: '10px 22px',
              borderRadius: 10,
              background: 'var(--accent)',
              transition: 'opacity 0.15s, box-shadow 0.15s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.boxShadow = 'var(--glow-cyan)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = 'none' }}
          >
            Start Learning <ArrowRight size={15} />
          </Link>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {tracks.reduce((acc, t) => acc + t.topics.length, 0)} lessons across 4 tracks
          </span>
        </div>
      </div>

      {/* Track grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
        gap: 16,
      }}>
        {tracks.map(track => (
          <TrackCard key={track.key} track={track} />
        ))}
      </div>

    </div>
  )
}
