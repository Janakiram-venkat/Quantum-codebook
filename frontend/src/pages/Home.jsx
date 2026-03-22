import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { BRAND_NAME, PRODUCT_NAME, brandLogo } from '../lib/branding.js'

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

const tracks = [
  {
    label: 'Beginner',
    focus: 'Foundation',
    description: 'Learn qubits, gates, measurement, superposition, and entanglement with simple simulations.',
    active: true,
  },
  {
    label: 'Intermediate',
    focus: 'Core Skills',
    description: 'Build quantum circuits, understand interference, and explore basic quantum algorithms.',
  },
  {
    label: 'Advanced',
    focus: 'Specialization',
    description: 'Study advanced algorithms, circuit optimization, and quantum error correction.',
  },
  {
    label: 'Research',
    focus: 'Innovation',
    description: 'Explore noise models, surface codes, hardware concepts, and research-level simulations.',
  },
]

export default function Home() {
  return (
    <div className="px-5 py-8 md:px-8 md:py-10" style={{ maxWidth: 980, margin: '0 auto' }}>
      <header className="page-header-card" style={{ marginBottom: 28 }}>
        <img src={brandLogo} alt={BRAND_NAME} className="home-brand-image" />
        <p className="section-eyebrow" style={{ marginBottom: 10 }}>
          Quantum Learning
        </p>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
          Welcome to Quantum Codebook
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 700 }}>
          Structured learning path from fundamentals to research with interactive simulations.
        </p>
      </header>

      <section className="section-shell" style={{ marginBottom: 18 }}>
        <div style={{ marginBottom: 18 }}>
          <p className="section-eyebrow" style={{ marginBottom: 8 }}>Tracks</p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.03em' }}>
            Learn step by step
          </h2>
        </div>

        <div className="section-grid" data-columns="2">
          {tracks.map(track => (
            <div
              key={track.label}
              className="soft-panel"
              style={{
                padding: '18px 18px 16px',
                borderColor: track.active ? 'rgba(var(--accent-rgb), 0.28)' : 'var(--border)',
                background: track.active ? 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.08), var(--surface-soft))' : 'var(--surface-soft)',
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-strong)', marginBottom: 10 }}>
                {track.label} - {track.focus}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                {track.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div
        className="section-shell"
        style={{
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 8 }}>Start Here</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.03em' }}>Beginner lessons</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Begin with the fundamentals, then build toward the more advanced tracks above.</p>
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
          {beginnerTopics.map(({ id, label }, index) => (
            <li key={id} style={{ borderTop: index === 0 ? '1px solid var(--border)' : 'none' }}>
              <Link
                to={`/lesson/${id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 4px',
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={event => (event.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={event => (event.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', minWidth: 18 }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {label}
                </span>
                <ArrowRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/lesson/QubitsAndStates"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            padding: '8px 14px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--surface-soft)',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={event => (event.currentTarget.style.borderColor = 'var(--border-hover)')}
          onMouseLeave={event => (event.currentTarget.style.borderColor = 'var(--border)')}
        >
          Start Learning <ArrowRight size={13} />
        </Link>
      </div>

      <div
        className="section-shell"
        style={{
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 8 }}>Continue Here</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.03em' }}>Intermediate lessons</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Explore multi-qubit systems, quantum algorithms, and error correction techniques.</p>
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
          {intermediateTopics.map(({ id, label }, index) => (
            <li key={id} style={{ borderTop: index === 0 ? '1px solid var(--border)' : 'none' }}>
              <Link
                to={`/lesson/${id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 4px',
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={event => (event.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={event => (event.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', minWidth: 18 }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {label}
                </span>
                <ArrowRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/lesson/multi_qubit_system"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            padding: '8px 14px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--surface-soft)',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={event => (event.currentTarget.style.borderColor = 'var(--border-hover)')}
          onMouseLeave={event => (event.currentTarget.style.borderColor = 'var(--border)')}
        >
          Continue Learning <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
