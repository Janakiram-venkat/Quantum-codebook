import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useDeferredValue, useEffect, useState } from 'react'

const BITSTRINGS = ['00', '01', '10', '11']

function buildQaoaOperations(gamma, beta) {
  return [
    { gate: 'H', target: 0 },
    { gate: 'H', target: 1 },
    { gate: 'CNOT', control: 0, target: 1 },
    { gate: 'RZ', target: 1, angle: 2 * gamma },
    { gate: 'CNOT', control: 0, target: 1 },
    { gate: 'RX', target: 0, angle: 2 * beta },
    { gate: 'RX', target: 1, angle: 2 * beta },
  ]
}

function isCut(bitstring) {
  return bitstring[0] !== bitstring[1]
}

function SplitMeter({ leftLabel, rightLabel, leftValue, rightValue }) {
  return (
    <div className="value-card">
      <span className="value-label">Probability Split</span>
      <div
        style={{
          width: '100%',
          height: 14,
          borderRadius: 999,
          overflow: 'hidden',
          background: 'var(--surface-muted)',
          display: 'flex',
        }}
      >
        <div style={{ width: `${leftValue * 100}%`, background: 'var(--success)' }} />
        <div style={{ width: `${rightValue * 100}%`, background: 'var(--surface-soft)' }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 13 }}>
          {leftLabel}: {(leftValue * 100).toFixed(1)}%
        </span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>
          {rightLabel}: {(rightValue * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

export default function QAOAExplorer() {
  const [gamma, setGamma] = useState(0.8)
  const [beta, setBeta] = useState(0.35)
  const [probabilities, setProbabilities] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const deferredGamma = useDeferredValue(gamma)
  const deferredBeta = useDeferredValue(beta)

  useEffect(() => {
    let active = true

    async function loadProbabilities() {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.post('/api/simulate/custom', {
          operations: buildQaoaOperations(deferredGamma, deferredBeta),
          shots: 1000,
        })

        if (!active) return
        setProbabilities(response.data?.result?.probabilities || {})
      } catch (requestError) {
        if (!active) return
        setError(requestError?.response?.data?.detail || 'Could not evaluate the QAOA layer.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProbabilities()

    return () => {
      active = false
    }
  }, [deferredBeta, deferredGamma])

  const cutProbability = (probabilities['01'] || 0) + (probabilities['10'] || 0)
  const uncutProbability = (probabilities['00'] || 0) + (probabilities['11'] || 0)
  const bestState =
    [...BITSTRINGS].sort((left, right) => (probabilities[right] || 0) - (probabilities[left] || 0))[0] || '01'

  return (
    <div className="space-y-5">
      <div className="soft-panel p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div style={{ maxWidth: 720 }}>
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>Concept Lab</p>
            <h3 className="section-title" style={{ fontSize: '1.45rem' }}>
              Max-Cut parameter explorer
            </h3>
            <p className="section-subtitle" style={{ fontSize: 15 }}>
              Tune one QAOA layer and watch probability move toward the good cut states `01` and `10`. The quantum circuit
              handles the distribution; the classical optimizer&apos;s future job is to keep choosing better beta and gamma values.
            </p>
          </div>

          <div className="section-grid" data-columns="3" style={{ width: '100%', maxWidth: 420 }}>
            <div className="value-card">
              <span className="value-label">Best State</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                {bestState}
              </p>
            </div>
            <div className="value-card">
              <span className="value-label">Cut Weight</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                {(cutProbability * 100).toFixed(1)}%
              </p>
            </div>
            <div className="value-card">
              <span className="value-label">Layer Depth</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                p = 1
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-grid" data-columns="2">
        <div className="soft-panel p-4 md:p-5">
          <p className="section-eyebrow" style={{ marginBottom: 8 }}>Parameters</p>
          <div className="space-y-4">
            <label style={{ display: 'block' }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>gamma: cost layer</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  {gamma.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI.toFixed(2)}
                step="0.01"
                value={gamma}
                onChange={event => setGamma(Number(event.target.value))}
                style={{ width: '100%' }}
              />
            </label>

            <label style={{ display: 'block' }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>beta: mixer layer</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  {beta.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={(Math.PI / 2).toFixed(2)}
                step="0.01"
                value={beta}
                onChange={event => setBeta(Number(event.target.value))}
                style={{ width: '100%' }}
              />
            </label>

            <SplitMeter
              leftLabel="Good cut states"
              rightLabel="Uncut states"
              leftValue={cutProbability}
              rightValue={uncutProbability}
            />
          </div>
        </div>

        <div className="soft-panel p-4 md:p-5">
          <p className="section-eyebrow" style={{ marginBottom: 8 }}>Layer Intuition</p>
          <div className="section-grid" data-columns="2">
            <div className="value-card">
              <span className="value-label">Cost Layer</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                gamma = {gamma.toFixed(2)}
              </p>
              <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.75 }}>
                This layer encodes the optimization objective. For Max-Cut, it rewards bitstrings that place connected
                nodes in opposite partitions.
              </p>
            </div>
            <div className="value-card">
              <span className="value-label">Mixer Layer</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                beta = {beta.toFixed(2)}
              </p>
              <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.75 }}>
                This layer keeps amplitude moving through the search space. Too little mixing freezes exploration; too much
                mixing can wash away the cost signal.
              </p>
            </div>
            <div className="value-card">
              <span className="value-label">Winning States</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                01, 10
              </p>
              <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.75 }}>
                These bitstrings cut the single edge, so a good parameter choice should keep pushing probability toward them.
              </p>
            </div>
            <div className="value-card">
              <span className="value-label">Read This As</span>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
                The circuit is not outputting one answer yet. It is learning a probability distribution whose high-weight
                states are hopefully good candidates for the classical problem.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="soft-panel p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>Probability Flow</p>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Which bitstrings QAOA prefers
            </h3>
          </div>
          {loading && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              <Loader2 size={14} className="animate-spin" />
              Evaluating
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              background: 'var(--danger-soft)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {!error && (
          <div className="space-y-3">
            {BITSTRINGS.map(bitstring => {
              const probability = probabilities[bitstring] || 0
              const cutState = isCut(bitstring)

              return (
                <div
                  key={bitstring}
                  style={{
                    width: '100%',
                    borderRadius: 16,
                    border: `1px solid ${cutState ? 'rgba(var(--success-rgb), 0.24)' : 'var(--border)'}`,
                    background: cutState ? 'rgba(var(--success-rgb), 0.06)' : 'var(--surface-soft)',
                    padding: '14px 16px',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                        {bitstring}
                      </span>
                      <span
                        style={{
                          borderRadius: 999,
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          border: '1px solid var(--border)',
                          background: cutState ? 'var(--success-soft)' : 'var(--surface-muted)',
                          color: cutState ? 'var(--success)' : 'var(--text-muted)',
                        }}
                      >
                        {cutState ? 'Good cut' : 'No cut'}
                      </span>
                    </div>
                    <span className="font-mono" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      {(probability * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: 10,
                      borderRadius: 999,
                      background: 'var(--surface-muted)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(probability * 100, probability > 0 ? 4 : 0)}%`,
                        height: '100%',
                        background: cutState ? 'var(--success)' : 'var(--accent)',
                        borderRadius: 999,
                        transition: 'width 0.18s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
