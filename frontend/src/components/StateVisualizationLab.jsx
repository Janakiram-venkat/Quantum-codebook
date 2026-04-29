import { useState } from 'react'
import BlochSphere from './BlochSphere'
import MathText from './MathText'
import ProbabilityChart from './ProbabilityChart'
import { resolveSingleQubitBlochState } from '../lib/blochSphere.js'
import { isQuantumFormulaLike, normalizeQuantumText } from '../lib/quantumText.js'

function amplitudeProbability(amplitude) {
  const real = Number(amplitude?.real || 0)
  const imag = Number(amplitude?.imag || 0)
  return real * real + imag * imag
}

function formatAmplitude(amplitude) {
  const real = Number(amplitude?.real || 0)
  const imag = Number(amplitude?.imag || 0)

  if (Math.abs(imag) < 1e-8) return real.toFixed(6)
  if (Math.abs(real) < 1e-8) return `${imag.toFixed(6)}i`

  return `${real.toFixed(6)} ${imag >= 0 ? '+' : '-'} ${Math.abs(imag).toFixed(6)}i`
}

function isFormulaLike(value) {
  return isQuantumFormulaLike(normalizeQuantumText(value))
}

function AmplitudeGrid({ amplitudes }) {
  const entries = Object.entries(amplitudes).sort(
    ([stateA], [stateB]) => stateA.localeCompare(stateB),
  )

  if (entries.length === 0) return null

  return (
    <div className="section-grid" data-columns="2">
      {entries.map(([state, amplitude]) => (
        <div key={state} className="value-card">
          <span className="value-label">{`|${state}> amplitude`}</span>
          <p
            className="font-mono"
            style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            {formatAmplitude(amplitude)}
          </p>
          <p className="text-base mt-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Probability {(amplitudeProbability(amplitude) * 100).toFixed(1)}%
          </p>
        </div>
      ))}
    </div>
  )
}

export default function StateVisualizationLab({ simulation }) {
  const [activeExperimentIdx, setActiveExperimentIdx] = useState(0)

  const experiments = simulation?.experiments || []
  const activeExperiment = experiments[activeExperimentIdx] || {}
  const alphaReal = Number(activeExperiment.alpha ?? 1)
  const betaReal = Number(activeExperiment.beta ?? 0)

  const customAmplitudes = {
    '0': { real: alphaReal, imag: 0 },
    '1': { real: betaReal, imag: 0 },
  }
  const customProbabilities = {
    '0': alphaReal * alphaReal,
    '1': betaReal * betaReal,
  }
  const customBlochState = resolveSingleQubitBlochState({
    amplitudes: customAmplitudes,
    fallbackState: simulation?.initial_state?.label || '|0>',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="section-heading">
          <p className="section-eyebrow">Interactive Visualizer</p>
          <h3 className="section-title">State Explorer</h3>
          <p className="section-subtitle text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            Select an experiment below to instantly see how the qubit amplitudes, probabilities, and Bloch sphere state change.
          </p>
        </div>
      </div>

      {experiments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {experiments.map((experiment, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveExperimentIdx(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 14,
                borderRadius: 12,
                padding: '10px 14px',
                transition: 'all 0.18s ease',
                background: idx === activeExperimentIdx ? 'var(--accent)' : 'var(--surface-soft)',
                color: idx === activeExperimentIdx ? 'var(--text-inverse)' : 'var(--text-primary)',
                border: `1px solid ${idx === activeExperimentIdx ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}
            >
              {experiment.description || experiment.name}
            </button>
          ))}
        </div>
      )}

      {simulation?.show_bloch_sphere && customBlochState && (
        <div className="soft-panel p-4 md:p-5">
          <header className="mb-5">
            <p className="section-eyebrow" style={{ marginBottom: 8 }}>Bloch Sphere</p>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              State Vector View
            </h3>
          </header>
          <BlochSphere
            state={customBlochState}
            sourceLabel={activeExperiment.description || activeExperiment.name || 'Selected State'}
            stateLabel={simulation?.initial_state?.label || '|psi>'}
            note="Displays the single-qubit state geometrically."
          />
        </div>
      )}

      <div className="section-grid" data-columns="2">
        {simulation?.show_probabilities && (
          <div className="soft-panel p-4 md:p-5 h-full">
            <header className="mb-5">
              <p className="section-eyebrow" style={{ marginBottom: 8 }}>Measurements</p>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Probability Distribution
              </h3>
            </header>
            <ProbabilityChart probabilities={customProbabilities} counts={{}} shots={100} />
          </div>
        )}

        {simulation?.show_state_vector && (
          <div className="soft-panel p-4 md:p-5 h-full">
            <header className="mb-5">
              <p className="section-eyebrow" style={{ marginBottom: 8 }}>Theory</p>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Vector Amplitudes
              </h3>
            </header>
            <AmplitudeGrid amplitudes={customAmplitudes} />
          </div>
        )}
      </div>

      {activeExperiment.formula && (
        <div className="soft-panel p-4 md:p-5">
          <p className="section-eyebrow" style={{ marginBottom: 8 }}>Formula</p>
          {isFormulaLike(activeExperiment.formula) ? (
            <MathText value={normalizeQuantumText(activeExperiment.formula)} block fallbackClassName="font-mono" />
          ) : (
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {normalizeQuantumText(activeExperiment.formula)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
