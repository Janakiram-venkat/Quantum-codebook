import { useEffect, useState } from 'react'
import axios from 'axios'
import { Loader2, Play, RotateCcw } from 'lucide-react'
import BlochSphere from './BlochSphere'
import CircuitComposer from './CircuitComposer'
import CircuitRenderer from './CircuitRenderer'
import MathText from './MathText'
import ProbabilityChart from './ProbabilityChart'
import { resolveSingleQubitBlochState } from '../lib/blochSphere.js'
import { isQuantumFormulaLike, normalizeQuantumText } from '../lib/quantumText.js'

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

function primaryButtonStyle(disabled) {
  return {
    ...actionButtonBase,
    background: disabled ? 'rgba(var(--accent-rgb), 0.72)' : 'var(--accent)',
    border: '1px solid var(--accent)',
    color: 'var(--text-inverse)',
    cursor: disabled ? 'not-allowed' : 'pointer',
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
  return isQuantumFormulaLike(normalizeQuantumText(value))
}

function StatePill({ value }) {
  const normalizedValue = normalizeQuantumText(value)

  return (
    <span
      className="font-mono text-base px-4 py-2 rounded-full"
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

function createComposerSlots(maxGates, operations = []) {
  const visibleCells = Math.max(maxGates || 1, 1)
  const slots = Array.from({ length: visibleCells }, () => null)

  operations.slice(0, visibleCells).forEach((operation, index) => {
    slots[index] = operation ?? null
  })

  return slots
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

export default function StandardCircuitSimulation({ simulation, theory }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ran, setRan] = useState(false)
  const [activeStep, setActiveStep] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const isCustomizable = simulation?.customizable
  const availableGates = simulation?.available_gates || []
  const maxGates = simulation?.max_gates || 2
  const [customSlots, setCustomSlots] = useState(() => createComposerSlots(maxGates, simulation?.operations || []))

  useEffect(() => {
    if (!isCustomizable) return
    setCustomSlots(createComposerSlots(maxGates, simulation?.operations || []))
  }, [isCustomizable, maxGates, simulation])

  const ops = isCustomizable ? customSlots.filter(Boolean) : (simulation?.operations || [])
  const hasOps = ops.length > 0
  const canRun = hasOps && !loading && !isAnimating

  function reset() {
    setResult(null)
    setRan(false)
    setError(null)
    setActiveStep(null)
    setIsAnimating(false)
  }

  async function runSim() {
    if (!hasOps) return

    setLoading(true)
    setRan(false)
    setResult(null)
    setError(null)
    setActiveStep(null)
    setIsAnimating(false)

    try {
      const response = isCustomizable
        ? await axios.post('/api/simulate/custom', { operations: ops, shots: 1000 })
        : await axios.post('/api/simulate/custom', { operations: ops, shots: simulation?.shots || 1000 })

      setLoading(false)

      setIsAnimating(true)
      let currentStep = 0
      setActiveStep(0)

      const timer = setInterval(() => {
        currentStep += 1

        if (currentStep >= ops.length) {
          clearInterval(timer)
          setActiveStep(null)
          setIsAnimating(false)
          setResult(response.data)
          setRan(true)
          return
        }

        setActiveStep(currentStep)
      }, 520)
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || 'Simulation failed. Is the backend running?')
      setLoading(false)
    }
  }

  const shots = simulation?.shots || 1000
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
  const hasMeasureGate = ops.some(op => op.gate === 'MEASURE')

  const blochState = resolveSingleQubitBlochState({
    amplitudes: hasPreMeasurementState ? preMeasurementAmplitudes : (hasAmplitudeData ? amplitudes : {}),
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
  const blochSourceLabel = hasPreMeasurementState
    ? 'State before collapse'
    : hasAmplitudeData
      ? 'Simulated single-qubit state'
      : 'Initial single-qubit state'
  const blochStateLabel = hasAmplitudeData || hasPreMeasurementState
    ? simulation?.expected_result || simulation?.initial_state
    : simulation?.initial_state
  const blochNote = hasPreMeasurementState && hasMeasurementData
    ? 'The Bloch sphere shows the superposition state right before measurement collapses it.'
    : hasMeasureGate && !ran
      ? 'Run the circuit to see how measurement turns a superposition into a concrete classical outcome.'
      : hasOps
        ? 'Before you run the circuit, the sphere shows the lesson starting state. After a run, it updates to the simulated state.'
        : 'No gates are applied yet, so the sphere shows the starting state directly.'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="section-heading">
          <p className="section-eyebrow">
            {hasMeasureGate ? 'Quantum Measurement' : isCustomizable ? 'Interactive Composer' : 'Run This Circuit'}
          </p>
          <h3 className="section-title">
            {hasMeasureGate ? 'Collapse simulator' : isCustomizable ? 'Build and test your own circuit' : 'Simulator controls'}
          </h3>
          <p className="section-subtitle">
            {isCustomizable
              ? 'Place gates in the timeline, then run the circuit to inspect amplitudes, probabilities, and the Bloch sphere.'
              : hasMeasureGate
                ? ran
                  ? 'Measurement collapsed the superposition. The chart below shows the observed outcomes.'
                  : 'Run the circuit to see how the MEASURE gate collapses the state.'
                : hasOps
                  ? 'Run the circuit to inspect the resulting state, amplitudes, measurement probabilities, and Bloch sphere view.'
                  : 'Inspect the lesson starting state before any gates are applied.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {ran && (
            <button
              type="button"
              onClick={reset}
              className="w-full sm:w-auto"
              style={secondaryButtonStyle()}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
          {(hasOps || isCustomizable) && (
            <button
              type="button"
              onClick={runSim}
              disabled={!canRun}
              className="w-full sm:w-auto"
              style={primaryButtonStyle(!canRun)}
            >
              {loading || isAnimating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {!hasOps
                ? 'Build circuit first'
                : loading
                  ? 'Fetching...'
                  : isAnimating
                    ? 'Simulating...'
                    : ran
                      ? 'Run again'
                      : 'Run simulation'}
            </button>
          )}
        </div>
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
            {isCustomizable && ops.length === 0
              ? 'Build your circuit below'
              : hasOps
                ? ops.map(op => op.gate).join(' -> ')
                : 'No gates configured for this lesson yet.'}
          </p>
        </div>
      </div>

      {hasMeasureGate && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            padding: '14px 18px',
            borderRadius: 14,
            background: 'var(--surface-soft)',
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1, color: 'var(--accent)' }}>i</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
              How measurement works
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The gates before measurement prepare the quantum state. The MEASURE gate turns that superposition into a classical
              readout sampled according to the state&apos;s probability distribution.
            </p>
          </div>
        </div>
      )}

      <div className="soft-panel p-4 md:p-5" style={{ overflow: 'visible' }}>
        <header className="mb-4">
          <p className="section-eyebrow" style={{ marginBottom: 4 }}>Circuit View</p>
          <h3 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {isCustomizable ? 'Composer timeline and preview' : hasMeasureGate ? 'Measurement circuit' : 'Gate layout'}
          </h3>
        </header>

        {isCustomizable && (
          <CircuitComposer
            availableGates={availableGates}
            operations={customSlots}
            initialState={simulation?.initial_state || '|0>'}
            maxGates={maxGates}
            activeStep={activeStep}
            onChange={setCustomSlots}
            onResetResult={reset}
          />
        )}

        {!isCustomizable && hasOps && (
          <CircuitRenderer
            operations={ops}
            initialState={simulation?.initial_state || '|0>'}
            activeStep={activeStep}
          />
        )}

        {isCustomizable && ops.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <p className="section-eyebrow" style={{ marginBottom: 10 }}>Circuit Preview</p>
            <CircuitRenderer
              operations={ops}
              initialState={simulation?.initial_state || '|0>'}
              activeStep={activeStep}
            />
          </div>
        )}

        {isCustomizable && ops.length === 0 && simulation?.try_this?.length > 0 && (
          <div style={{ marginTop: 18 }} className="value-card">
            <span className="value-label">Try these experiments</span>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {simulation.try_this.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showBlochSphere && (
        <div className="soft-panel p-4 md:p-5">
          <header className="mb-5">
            <p className="section-eyebrow" style={{ marginBottom: 8 }}>Bloch Sphere</p>
            <h3 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
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
        <div className="soft-panel p-4 md:p-5">
          <p className="text-sm" style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {result.message}
          </p>
        </div>
      )}

      {ran && Object.keys(probabilities).length > 0 && (
        <div className="soft-panel p-4 md:p-5">
          <header className="mb-5">
            <p className="section-eyebrow" style={{ marginBottom: 8 }}>
              {hasMeasurementData ? 'Measurement output' : 'State analysis'}
            </p>
            <h3 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {resultTitle}
            </h3>
          </header>
          <ProbabilityChart probabilities={probabilities} counts={counts} shots={shots} />
        </div>
      )}

      {ran && hasAmplitudeData && (
        <div className="soft-panel p-4 md:p-5">
          <header className="mb-5">
            <p className="section-eyebrow" style={{ marginBottom: 8 }}>Statevector output</p>
            <h3 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Basis amplitudes
            </h3>
          </header>
          <AmplitudeGrid amplitudes={amplitudes} />
        </div>
      )}

      {ran && !hasAmplitudeData && !hasMeasurementData && simulatorResult && (
        <div className="soft-panel p-4 md:p-5">
          <header className="mb-5">
            <p className="section-eyebrow" style={{ marginBottom: 8 }}>Raw result</p>
            <h3 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
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
