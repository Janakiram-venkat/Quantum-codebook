import { useState } from 'react'
import BlochSphere from '../BlochSphere'

const INPUT_STATES = {
  '|0>': {
    label: '|0>',
    description: 'Ground state. Useful for seeing bit flips and amplitude damping clearly.',
    vector: { x: 0, y: 0, z: 1 },
  },
  '|1>': {
    label: '|1>',
    description: 'Excited state. Great for showing relaxation back toward |0>.',
    vector: { x: 0, y: 0, z: -1 },
  },
  '|+>': {
    label: '|+>',
    description: 'Equal superposition. Perfect for exposing phase noise.',
    vector: { x: 1, y: 0, z: 0 },
  },
  '|->': {
    label: '|->',
    description: 'Opposite superposition. Also sensitive to phase noise.',
    vector: { x: -1, y: 0, z: 0 },
  },
  '|+i>': {
    label: '|+i>',
    description: 'Phase-rich state with a non-zero y component.',
    vector: { x: 0, y: 1, z: 0 },
  },
}

const NOISE_TYPES = {
  bit_flip: {
    label: 'Bit flip',
    summary: 'Randomly applies X errors. It swaps |0> and |1> information.',
    transform(vector, strength) {
      return {
        x: vector.x,
        y: (1 - 2 * strength) * vector.y,
        z: (1 - 2 * strength) * vector.z,
      }
    },
  },
  phase_flip: {
    label: 'Phase flip',
    summary: 'Randomly applies Z errors. Z-basis probabilities can look unchanged while coherence decays.',
    transform(vector, strength) {
      return {
        x: (1 - 2 * strength) * vector.x,
        y: (1 - 2 * strength) * vector.y,
        z: vector.z,
      }
    },
  },
  depolarizing: {
    label: 'Depolarizing',
    summary: 'Shrinks the Bloch vector toward the center. The state loses directional information.',
    transform(vector, strength) {
      return {
        x: (1 - strength) * vector.x,
        y: (1 - strength) * vector.y,
        z: (1 - strength) * vector.z,
      }
    },
  },
  amplitude_damping: {
    label: 'Amplitude damping',
    summary: 'Models energy loss. Excited-state population relaxes toward |0>.',
    transform(vector, strength) {
      const shrink = Math.sqrt(1 - strength)
      return {
        x: shrink * vector.x,
        y: shrink * vector.y,
        z: (1 - strength) * vector.z + strength,
      }
    },
  },
}

function clampProbability(value) {
  return Math.max(0, Math.min(1, value))
}

function basisReadout(vector, axis) {
  if (axis === 'x') {
    return {
      positive: clampProbability((1 + vector.x) / 2),
      negative: clampProbability((1 - vector.x) / 2),
    }
  }

  return {
    positive: clampProbability((1 + vector.z) / 2),
    negative: clampProbability((1 - vector.z) / 2),
  }
}

function blochLength(vector) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z)
}

function ProbabilityPair({ label, positiveLabel, negativeLabel, values, tone = 'accent' }) {
  const color = tone === 'success' ? 'var(--success)' : 'var(--accent)'

  return (
    <div className="value-card">
      <span className="value-label">{label}</span>
      {[
        { key: positiveLabel, value: values.positive },
        { key: negativeLabel, value: values.negative },
      ].map(item => (
        <div key={item.key} style={{ marginBottom: item.key === negativeLabel ? 0 : 12 }}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {item.key}
            </span>
            <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {(item.value * 100).toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 10,
              borderRadius: 999,
              background: 'var(--surface-soft)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.max(item.value * 100, item.value > 0 ? 4 : 0)}%`,
                height: '100%',
                borderRadius: 999,
                background: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NoiseModelExplorer() {
  const [selectedState, setSelectedState] = useState('|+>')
  const [selectedNoise, setSelectedNoise] = useState('phase_flip')
  const [strength, setStrength] = useState(0.25)

  const beforeVector = INPUT_STATES[selectedState].vector
  const noise = NOISE_TYPES[selectedNoise]
  const afterVector = noise.transform(beforeVector, strength)

  const beforeZ = basisReadout(beforeVector, 'z')
  const afterZ = basisReadout(afterVector, 'z')
  const beforeX = basisReadout(beforeVector, 'x')
  const afterX = basisReadout(afterVector, 'x')
  const lengthBefore = blochLength(beforeVector)
  const lengthAfter = blochLength(afterVector)
  const beforeState = { vector: beforeVector }
  const afterState = { vector: afterVector }

  return (
    <div className="space-y-5">
      <div className="soft-panel p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div style={{ maxWidth: 760 }}>
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>Concept Lab</p>
            <h3 className="section-title" style={{ fontSize: '1.45rem' }}>
              Noise channel playground
            </h3>
            <p className="section-subtitle" style={{ fontSize: 15 }}>
              Pick an input state, choose a channel, and increase the error strength. The before-and-after plots show how
              the Bloch vector moves and which measurement basis reveals the damage most clearly.
            </p>
          </div>

          <div className="section-grid" data-columns="3" style={{ width: '100%', maxWidth: 420 }}>
            <div className="value-card">
              <span className="value-label">Input</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                {selectedState}
              </p>
            </div>
            <div className="value-card">
              <span className="value-label">Noise</span>
              <p style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)', fontWeight: 700 }}>
                {noise.label}
              </p>
            </div>
            <div className="value-card">
              <span className="value-label">Strength</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                {(strength * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-grid" data-columns="2">
        <div className="soft-panel p-4 md:p-5">
          <p className="section-eyebrow" style={{ marginBottom: 8 }}>State Picker</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.values(INPUT_STATES).map(state => {
              const active = state.label === selectedState
              return (
                <button
                  key={state.label}
                  type="button"
                  onClick={() => setSelectedState(state.label)}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: active ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--surface-soft)',
                    color: active ? 'var(--accent-strong)' : 'var(--text-secondary)',
                    padding: '9px 13px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {state.label}
                </button>
              )
            })}
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
            {INPUT_STATES[selectedState].description}
          </p>
        </div>

        <div className="soft-panel p-4 md:p-5">
          <p className="section-eyebrow" style={{ marginBottom: 8 }}>Channel Picker</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(NOISE_TYPES).map(([key, config]) => {
              const active = key === selectedNoise
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedNoise(key)}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: active ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--surface-soft)',
                    color: active ? 'var(--accent-strong)' : 'var(--text-secondary)',
                    padding: '9px 13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {config.label}
                </button>
              )
            })}
          </div>
          <label style={{ display: 'block' }}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Error probability</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {strength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={strength}
              onChange={event => setStrength(Number(event.target.value))}
              style={{ width: '100%' }}
            />
          </label>
          <p style={{ margin: '12px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
            {noise.summary}
          </p>
        </div>
      </div>

      <div className="section-grid" data-columns="2">
        <div className="soft-panel p-4 md:p-5">
          <p className="section-eyebrow" style={{ marginBottom: 8 }}>3D Bloch Sphere</p>
          <BlochSphere
            state={beforeState}
            sourceLabel="Before noise"
            stateLabel={selectedState}
            note="The ideal reference state before the noise channel acts."
          />
        </div>

        <div className="soft-panel p-4 md:p-5">
          <p className="section-eyebrow" style={{ marginBottom: 8 }}>Noisy Bloch Sphere</p>
          <BlochSphere
            state={afterState}
            sourceLabel="After noise"
            stateLabel={selectedState}
            note="Shorter vectors indicate lost purity and coherence. Amplitude damping also drifts the point toward |0>."
          />
        </div>
      </div>

      <div className="section-grid" data-columns="2">
        <div className="section-grid" data-columns="2">
          <ProbabilityPair label="Before: Z basis" positiveLabel="|0>" negativeLabel="|1>" values={beforeZ} />
          <ProbabilityPair label="After: Z basis" positiveLabel="|0>" negativeLabel="|1>" values={afterZ} />
          <ProbabilityPair label="Before: X basis" positiveLabel="|+>" negativeLabel="|->" values={beforeX} tone="success" />
          <ProbabilityPair label="After: X basis" positiveLabel="|+>" negativeLabel="|->" values={afterX} tone="success" />
        </div>

        <div className="section-grid" data-columns="3">
          <div className="value-card">
            <span className="value-label">Length Change</span>
            <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
              {lengthBefore.toFixed(2)} {'->'} {lengthAfter.toFixed(2)}
            </p>
            <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              Pure states live on the surface. Noise usually shortens the vector and moves the state into the sphere.
            </p>
          </div>
          <div className="value-card">
            <span className="value-label">Coherence</span>
            <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
              {Math.sqrt(afterVector.x * afterVector.x + afterVector.y * afterVector.y).toFixed(2)}
            </p>
            <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              Large x and y components mean the state still preserves phase information.
            </p>
          </div>
          <div className="value-card">
            <span className="value-label">Takeaway</span>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
              If the Z-basis bars look unchanged but the noisy Bloch vector shrinks sideways, you are seeing phase damage
              rather than a direct classical bit flip.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
