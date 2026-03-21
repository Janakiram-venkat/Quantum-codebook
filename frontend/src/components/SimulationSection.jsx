import { useState } from 'react'
import axios from 'axios'
import { Play, Loader2, RotateCcw } from 'lucide-react'
import BlochSphere from './BlochSphere'
import CircuitRenderer from './CircuitRenderer'
import ProbabilityChart from './ProbabilityChart'
import MathText from './MathText'
import { resolveSingleQubitBlochState } from '../lib/blochSphere.js'
import { normalizeQuantumText } from '../lib/quantumText.js'

const actionButtonBase = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontSize: 14,
  borderRadius: 12,
  padding: '10px 14px',
  transition: 'all 0.18s ease',
}

function primaryButtonStyle(loading) {
  return {
    ...actionButtonBase,
    background: loading ? 'rgba(var(--accent-rgb), 0.72)' : 'var(--accent)',
    border: '1px solid var(--accent)',
    color: 'var(--text-inverse)',
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: 'var(--accent-shadow)',
  }
}

function secondaryButtonStyle() {
  return {
    ...actionButtonBase,
    background: 'var(--surface-soft)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
}

function isFormulaLike(value) {
  const text = normalizeQuantumText(value)
  return /[=αβγδψΦΨθφ√⟨⟩₀₁|^]/u.test(text) || text.includes('→') || text.includes('⊗')
}

function StatePill({ value }) {
  const normalizedValue = normalizeQuantumText(value)

  return (
    <span
      className="font-mono text-sm px-3 py-1.5 rounded-full"
      style={{
        background: 'var(--surface-soft)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
    >
      {isFormulaLike(normalizedValue)
        ? <MathText value={normalizedValue} fallbackClassName="font-mono" />
        : normalizedValue}
    </span>
  )
}

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

function deriveProbabilities(amplitudes) {
  return Object.fromEntries(
    Object.entries(amplitudes).map(([state, amplitude]) => [
      state,
      amplitudeProbability(amplitude),
    ]),
  )
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
            style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            {formatAmplitude(amplitude)}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Probability {(amplitudeProbability(amplitude) * 100).toFixed(1)}%
          </p>
        </div>
      ))}
    </div>
  )
}

export default function SimulationSection({ topic, simulation, theory }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ran, setRan] = useState(false)

  const ops = simulation?.operations || []
  const hasOps = ops.length > 0

  async function runSim() {
    setLoading(true)
    setRan(false)
    setResult(null)
    setError(null)
    try {
      const res = await axios.get(`/api/simulate/${encodeURIComponent(topic)}`)
      setResult(res.data)
      setRan(true)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Simulation failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setRan(false)
    setError(null)
  }

  const shots = 1000
  const simulatorResult = result?.result
  const measuredProbabilities = simulatorResult?.probabilities || {}
  const counts = simulatorResult?.counts || {}
  const amplitudes = simulatorResult?.amplitudes || {}
  const preMeasurementAmplitudes = simulatorResult?.pre_measurement_state?.amplitudes || {}
  const hasMeasurementData = Object.keys(measuredProbabilities).length > 0
  const hasAmplitudeData = Object.keys(amplitudes).length > 0
  const hasPreMeasurementState = Object.keys(preMeasurementAmplitudes).length > 0
  const probabilities = hasMeasurementData ? measuredProbabilities : deriveProbabilities(amplitudes)
  const resultTitle = hasMeasurementData ? 'Measurement probabilities' : 'State probabilities'
  const blochState = resolveSingleQubitBlochState({
    amplitudes: hasAmplitudeData ? amplitudes : preMeasurementAmplitudes,
    fallbackState: simulation?.initial_state || simulation?.expected_result,
  })
  const showBlochSphere =
    Boolean(blochState) &&
    (
      Boolean(theory?.bloch_sphere) ||
      Boolean(theory?.bloch_sphere_connection) ||
      !hasOps ||
      hasAmplitudeData ||
      hasPreMeasurementState
    )
  const blochSourceLabel = hasAmplitudeData
    ? 'Simulated single-qubit state'
    : hasPreMeasurementState
      ? 'State before measurement'
      : 'Initial single-qubit state'
  const blochStateLabel = hasAmplitudeData || hasPreMeasurementState
    ? simulation?.expected_result || simulation?.initial_state
    : simulation?.initial_state
  const blochNote = hasPreMeasurementState && hasMeasurementData
    ? 'Measurement collapses the state, so the sphere shows the qubit right before the measurement step.'
    : hasOps
      ? 'Before you run the circuit, the sphere shows the lesson starting state. After a run, it updates to the simulated state.'
      : 'This lesson does not apply any gates yet, so the sphere shows the starting state directly.'

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div className="section-heading">
          <p className="section-eyebrow">Run This Circuit</p>
          <h3 className="section-title">Simulator controls</h3>
          <p className="section-subtitle">
            {hasOps
              ? 'Run the circuit to inspect the resulting state, amplitudes, measurement probabilities, and Bloch sphere view.'
              : 'Inspect the lesson starting state, circuit layout, and Bloch sphere picture before any gates are applied.'}
          </p>
        </div>

        {hasOps && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {ran && (
              <button
                onClick={reset}
                className="w-full sm:w-auto"
                style={secondaryButtonStyle()}
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
            <button
              onClick={runSim}
              disabled={loading}
              className="w-full sm:w-auto"
              style={primaryButtonStyle(loading)}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {loading ? 'Running...' : ran ? 'Run again' : 'Run simulation'}
            </button>
          </div>
        )}
      </div>

      <div className="section-grid" data-columns="3">
        <div className="value-card">
          <span className="value-label">Initial state</span>
          <StatePill value={simulation?.initial_state || '|0>'} />
        </div>
        <div className="value-card">
          <span className="value-label">Expected result</span>
          <StatePill value={simulation?.expected_result || '?'} />
        </div>
        <div className="value-card">
          <span className="value-label">Operations</span>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            {ops.length} gate{ops.length === 1 ? '' : 's'}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            {hasOps ? ops.map(op => op.gate).join(' -> ') : 'No gates configured for this lesson yet.'}
          </p>
        </div>
      </div>

      <div
        className="soft-panel p-4 md:p-5"
      >
        <header className="mb-4">
          <p className="section-eyebrow" style={{ marginBottom: 6 }}>Circuit View</p>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Gate layout
          </h3>
        </header>
        <CircuitRenderer
          operations={ops}
          initialState={simulation?.initial_state || '|0>'}
        />
      </div>

      {showBlochSphere && (
        <div className="soft-panel p-4 md:p-5">
          <header className="mb-4">
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>Bloch Sphere</p>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Single-qubit state view
            </h3>
          </header>
          <BlochSphere
            state={blochState}
            sourceLabel={blochSourceLabel}
            stateLabel={blochStateLabel}
            note={blochNote}
          />
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-2 p-3 rounded-2xl text-sm"
          style={{
            background: 'var(--danger-soft)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
          }}
        >
          {error}
        </div>
      )}

      {ran && result?.message && !simulatorResult && (
        <div
          className="soft-panel p-4 md:p-5"
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {result.message}
          </p>
        </div>
      )}

      {ran && Object.keys(probabilities).length > 0 && (
        <div
          className="soft-panel p-4 md:p-5"
        >
          <header className="mb-4">
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>
              {hasMeasurementData ? 'Measurement output' : 'State analysis'}
            </p>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {resultTitle}
            </h3>
          </header>
          <ProbabilityChart probabilities={probabilities} counts={counts} shots={shots} />
        </div>
      )}

      {ran && hasAmplitudeData && (
        <div className="soft-panel p-4 md:p-5">
          <header className="mb-4">
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>Statevector output</p>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Basis amplitudes
            </h3>
          </header>
          <AmplitudeGrid amplitudes={amplitudes} />
        </div>
      )}

      {ran && !hasAmplitudeData && !hasMeasurementData && simulatorResult && (
        <div className="soft-panel p-4 md:p-5">
          <header className="mb-3">
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>Raw result</p>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Backend output
            </h3>
          </header>
          <pre
            className="font-mono text-sm"
            style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}
          >
            {typeof simulatorResult === 'object'
              ? JSON.stringify(simulatorResult, null, 2)
              : String(simulatorResult)}
          </pre>
        </div>
      )}
    </div>
  )
}
