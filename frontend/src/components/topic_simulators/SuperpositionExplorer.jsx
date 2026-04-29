import { useState } from 'react'
import BlochSphere from '../BlochSphere'
import { resolveSingleQubitBlochState } from '../../lib/blochSphere.js'

const STATES = [
  {
    id: 'zero',
    label: '|0⟩',
    alpha: 1,
    beta: 0,
    phase: 1,
    description: 'Ground state — no superposition. Measurement always gives 0.',
    equation: '|ψ⟩ = |0⟩',
    tip: 'This is the starting state for most circuits (before any gates are applied).',
  },
  {
    id: 'plus',
    label: '|+⟩',
    alpha: 1 / Math.sqrt(2),
    beta: 1 / Math.sqrt(2),
    phase: 1,
    description: 'After a Hadamard gate — perfectly equal superposition of |0⟩ and |1⟩.',
    equation: '|ψ⟩ = (|0⟩ + |1⟩) / √2',
    tip: 'Both amplitudes are equal (≈0.707). Measurement gives 0 or 1 with exactly 50% each.',
  },
  {
    id: 'minus',
    label: '|−⟩',
    alpha: 1 / Math.sqrt(2),
    beta: -1 / Math.sqrt(2),
    phase: -1,
    description: 'Hadamard on |1⟩ — equal amplitudes but opposite phase on |1⟩.',
    equation: '|ψ⟩ = (|0⟩ − |1⟩) / √2',
    tip: 'Same measurement probabilities as |+⟩, but the phase difference enables interference.',
  },
  {
    id: 'one',
    label: '|1⟩',
    alpha: 0,
    beta: 1,
    phase: 1,
    description: 'Excited state — no superposition. Measurement always gives 1.',
    equation: '|ψ⟩ = |1⟩',
    tip: 'Apply an X (Pauli-X / NOT) gate to |0⟩ to reach this state.',
  },
]

const GATE_COLORS = {
  H: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.6)', text: 'rgb(167,139,250)' },
  X: { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.6)',  text: 'rgb(252,165,165)' },
}

function AmplitudeBar({ label, amplitude, isTarget, color }) {
  const prob = amplitude * amplitude
  const pct = Math.abs(prob * 100).toFixed(1)
  const ampAbs = Math.abs(amplitude)
  const isNegative = amplitude < 0
  const barHeight = Math.round(ampAbs * 96)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, gap: 8 }}>
      {/* Amplitude value */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
        color: isNegative ? 'rgb(252,165,165)' : isTarget ? 'var(--accent-strong)' : 'var(--text-secondary)',
        letterSpacing: '-0.01em',
      }}>
        {amplitude >= 0 ? '+' : ''}{amplitude.toFixed(3)}
      </div>

      {/* Bar chart area */}
      <div style={{ position: 'relative', width: '100%', height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {/* Zero baseline */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--border)', borderRadius: 1 }} />

        {/* Amplitude bar */}
        <div style={{
          width: '70%',
          marginLeft: '15%',
          height: Math.max(barHeight, 3),
          borderRadius: '6px 6px 2px 2px',
          background: isNegative
            ? 'linear-gradient(180deg, rgba(239,68,68,0.15), rgba(239,68,68,0.4))'
            : isTarget
              ? 'linear-gradient(180deg, rgba(var(--accent-rgb),0.5), rgba(var(--accent-rgb),0.2))'
              : 'linear-gradient(180deg, rgba(148,163,184,0.35), rgba(148,163,184,0.15))',
          border: `1.5px solid ${isNegative ? 'rgba(239,68,68,0.65)' : isTarget ? 'var(--accent)' : 'var(--border)'}`,
          transition: 'height 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.3s, border-color 0.3s',
        }} />
      </div>

      {/* State label */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 800,
        color: isTarget ? 'var(--accent-strong)' : 'var(--text-primary)',
        transition: 'color 0.3s',
      }}>
        {label}
      </div>

      {/* Probability */}
      <div style={{
        fontSize: 12, fontWeight: 600,
        color: isTarget ? 'var(--accent)' : 'var(--text-muted)',
      }}>
        P = {pct}%
      </div>

      {isNegative && (
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'rgb(252,165,165)', padding: '2px 8px', borderRadius: 999,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        }}>
          − phase
        </div>
      )}
    </div>
  )
}

export default function SuperpositionExplorer({ simulation }) {
  const [selectedId, setSelectedId] = useState('plus')
  const active = STATES.find(s => s.id === selectedId)

  const amplitudes = {
    '0': { real: active.alpha, imag: 0 },
    '1': { real: active.beta,  imag: 0 },
  }
  const blochState = resolveSingleQubitBlochState({ amplitudes, fallbackState: active.label })
  const isSuperposed = Math.abs(active.alpha) > 0.01 && Math.abs(active.beta) > 0.01

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="soft-panel p-4 md:p-5">
        <p className="section-eyebrow" style={{ marginBottom: 6 }}>Concept Explorer</p>
        <h3 className="section-title">Superposition Visualizer</h3>
        <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
          In superposition a qubit simultaneously has a probability amplitude for |0⟩ <em>and</em> |1⟩.
          The bars below show those amplitudes. Select a state to explore the difference.
        </p>
      </div>

      {/* ── State selector ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {STATES.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            style={{
              padding: '9px 16px', borderRadius: 12, cursor: 'pointer',
              fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-mono)',
              border: `2px solid ${selectedId === s.id ? 'var(--accent)' : 'var(--border)'}`,
              background: selectedId === s.id ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface-soft)',
              color: selectedId === s.id ? 'var(--accent-strong)' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── State info card ── */}
      <div style={{
        padding: '16px 18px', borderRadius: 16,
        background: isSuperposed ? 'rgba(var(--accent-rgb),0.06)' : 'var(--surface-soft)',
        border: `1px solid ${isSuperposed ? 'rgba(var(--accent-rgb),0.22)' : 'var(--border)'}`,
        transition: 'all 0.3s',
        animation: 'fadeSlideIn 0.3s ease',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
              {active.equation}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {active.description}
            </p>
          </div>
          <span style={{
            padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            background: isSuperposed ? 'rgba(var(--accent-rgb),0.15)' : 'var(--surface-muted)',
            color: isSuperposed ? 'var(--accent-strong)' : 'var(--text-muted)',
            border: `1px solid ${isSuperposed ? 'rgba(var(--accent-rgb),0.3)' : 'var(--border)'}`,
            whiteSpace: 'nowrap',
          }}>
            {isSuperposed ? '⚛ Superposed' : '◉ Definite'}
          </span>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
          {active.tip}
        </p>
      </div>

      {/* ── Amplitude bars ── */}
      <div className="soft-panel p-4 md:p-5">
        <p className="section-eyebrow" style={{ marginBottom: 6 }}>Amplitude Chart</p>
        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
          State vector components
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Bar height = amplitude magnitude. Negative phase shown in red. Probability = amplitude².
        </p>

        <div style={{ display: 'flex', gap: 20, padding: '8px 0', animation: 'fadeSlideIn 0.3s ease' }}>
          <AmplitudeBar label="|0⟩" amplitude={active.alpha} isTarget={false} />
          <AmplitudeBar label="|1⟩" amplitude={active.beta}  isTarget={isSuperposed} />
        </div>

        {isSuperposed && (
          <div style={{
            marginTop: 18, padding: '12px 16px', borderRadius: 12,
            background: 'rgba(var(--accent-rgb),0.06)',
            border: '1px solid rgba(var(--accent-rgb),0.18)',
          }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent-strong)' }}>Key insight:</strong>{' '}
              Both amplitudes are non-zero, meaning the qubit is in <em>both</em> states at once.
              If you measure it right now, you will randomly collapse to either |0⟩ or |1⟩
              with probability equal to each bar&apos;s amplitude squared.
            </p>
          </div>
        )}
      </div>

      {/* ── Bloch sphere ── */}
      {blochState && (
        <div className="soft-panel p-4 md:p-5">
          <p className="section-eyebrow" style={{ marginBottom: 6 }}>Bloch Sphere</p>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            Geometric state view
          </h3>
          <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Superposition states live on the <em>equator</em> of the Bloch sphere.
            |0⟩ is the north pole, |1⟩ is the south pole.
          </p>
          <BlochSphere
            state={blochState}
            sourceLabel={active.label}
            stateLabel={active.label}
            note={
              isSuperposed
                ? 'The state vector points to the equator — equal weight between |0⟩ and |1⟩.'
                : 'The state vector points to a pole — no superposition, definite classical value.'
            }
          />
        </div>
      )}

      {/* ── Interference note ── */}
      <div className="soft-panel p-4">
        <p className="section-eyebrow" style={{ marginBottom: 6 }}>Why phase matters</p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              |+⟩ vs |−⟩
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Both have 50%/50% measurement probabilities. But applying H again to |+⟩ returns |0⟩,
              while H on |−⟩ returns |1⟩. The phase difference causes <em>constructive</em> or
              <em> destructive interference</em> — the heart of quantum speedup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
