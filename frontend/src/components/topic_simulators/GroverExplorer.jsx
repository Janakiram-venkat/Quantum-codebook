import { useState } from 'react'

const ALL_STATES = ['00', '01', '10', '11']

function computeGroverStages(targetState) {
  const n = 4
  const uniform = 1 / Math.sqrt(n)  // ≈ 0.5

  const superposition = Object.fromEntries(ALL_STATES.map(s => [s, uniform]))

  // Oracle: flip sign of target
  const oracle = Object.fromEntries(
    ALL_STATES.map(s => [s, s === targetState ? -uniform : uniform]),
  )

  // Diffusion: reflect about mean
  const mean = Object.values(oracle).reduce((a, v) => a + v, 0) / n
  const diffusion = Object.fromEntries(
    ALL_STATES.map(s => [s, 2 * mean - oracle[s]]),
  )

  return [
    {
      id: 'start',
      title: 'Initial state',
      subtitle: 'All amplitude is in |00⟩ before any gates run.',
      amplitudes: Object.fromEntries(ALL_STATES.map(s => [s, s === '00' ? 1 : 0])),
      mean: 0.25,
      oracleActive: false,
    },
    {
      id: 'superposition',
      title: 'Equal superposition',
      subtitle: 'Hadamard gates spread amplitude evenly. Each state has amplitude 1/√4 = 0.5.',
      amplitudes: superposition,
      mean: uniform,
      oracleActive: false,
    },
    {
      id: 'oracle',
      title: 'Oracle marks target',
      subtitle: `The oracle flips the sign of |${targetState}⟩'s amplitude — marking it without revealing it.`,
      amplitudes: oracle,
      mean,
      oracleActive: true,
    },
    {
      id: 'diffusion',
      title: 'Diffusion amplifies',
      subtitle: 'Reflection about the mean boosts the marked state and suppresses all others.',
      amplitudes: diffusion,
      mean,
      oracleActive: false,
    },
  ]
}

// ── Signed amplitude bar chart ────────────────────────────────

const CHART_H    = 180   // total chart area height in px
const ZERO_Y     = CHART_H / 2   // y of zero line = 90px from top
const SCALE      = 160   // px per unit amplitude (1.0 → 160px fill, but capped at 80px each side)
const MAX_BAR_H  = 80    // half of CHART_H

function AmplitudeChart({ stage, targetState }) {
  const mean = stage.mean

  return (
    <div>
      {/* Label row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 40 }}>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          Amplitude
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {/* Y-axis labels */}
        <div style={{ width: 36, display: 'flex', flexDirection: 'column', position: 'relative', height: CHART_H, flexShrink: 0 }}>
          {[1.0, 0.5, 0, -0.5].map(v => (
            <div key={v} style={{
              position: 'absolute',
              top: ZERO_Y - v * MAX_BAR_H - 7,
              right: 4,
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: v === 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}>
              {v.toFixed(1)}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ flex: 1, position: 'relative', height: CHART_H }}>
          {/* Grid lines */}
          {[1.0, 0.5, 0, -0.5].map(v => (
            <div key={v} style={{
              position: 'absolute', left: 0, right: 0,
              top: ZERO_Y - v * MAX_BAR_H,
              height: v === 0 ? 2 : 1,
              background: v === 0 ? 'var(--text-secondary)' : 'var(--border)',
              opacity: v === 0 ? 0.6 : 0.4,
              borderRadius: 1,
            }} />
          ))}

          {/* Mean line (dashed, accent) */}
          {stage.id !== 'start' && (
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: ZERO_Y - mean * MAX_BAR_H,
              height: 1.5,
              borderTop: '1.5px dashed rgba(var(--accent-rgb),0.5)',
              zIndex: 2,
            }}>
              <span style={{
                position: 'absolute', right: 2, top: -11,
                fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700,
                color: 'var(--accent)', background: 'var(--bg-card)',
                padding: '1px 4px', borderRadius: 4,
              }}>
                mean
              </span>
            </div>
          )}

          {/* Bars */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'flex-start', gap: 10,
            paddingTop: 0,
          }}>
            {ALL_STATES.map(state => {
              const amp  = stage.amplitudes[state]
              const isTarget  = state === targetState
              const isNeg     = amp < 0
              const isOracle  = stage.oracleActive && isTarget
              const barH = Math.max(Math.abs(amp) * MAX_BAR_H, 2)
              const barTop = isNeg ? ZERO_Y : ZERO_Y - barH

              let barColor, borderColor
              if (isOracle) {
                barColor   = 'linear-gradient(180deg, rgba(239,68,68,0.55), rgba(239,68,68,0.2))'
                borderColor = 'rgba(239,68,68,0.8)'
              } else if (isNeg) {
                barColor   = 'linear-gradient(180deg, rgba(239,68,68,0.35), rgba(239,68,68,0.1))'
                borderColor = 'rgba(239,68,68,0.6)'
              } else if (isTarget) {
                barColor   = 'linear-gradient(180deg, rgba(var(--accent-rgb),0.6), rgba(var(--accent-rgb),0.2))'
                borderColor = 'var(--accent)'
              } else {
                barColor   = 'linear-gradient(180deg, rgba(148,163,184,0.3), rgba(148,163,184,0.1))'
                borderColor = 'rgba(148,163,184,0.5)'
              }

              return (
                <div key={state} style={{ flex: 1, position: 'relative', height: '100%' }}>
                  {/* Bar */}
                  <div style={{
                    position: 'absolute',
                    left: '10%', right: '10%',
                    top: barTop,
                    height: barH,
                    background: barColor,
                    border: `1.5px solid ${borderColor}`,
                    borderRadius: isNeg ? '2px 2px 8px 8px' : '8px 8px 2px 2px',
                    transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
                    zIndex: 3,
                  }} />

                  {/* Amplitude value label */}
                  <div style={{
                    position: 'absolute',
                    top: isNeg ? barTop + barH + 4 : barTop - 18,
                    left: 0, right: 0,
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                    color: isOracle ? 'rgb(252,165,165)' : isNeg ? 'rgb(252,165,165)' : isTarget ? 'var(--accent-strong)' : 'var(--text-muted)',
                    transition: 'color 0.3s',
                    zIndex: 4,
                  }}>
                    {amp >= 0 ? '+' : ''}{amp.toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* State labels + prob row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingLeft: 44 }}>
        {ALL_STATES.map(state => {
          const amp     = stage.amplitudes[state]
          const isTarget = state === targetState
          const prob    = amp * amp
          const isNeg   = amp < 0
          const isOracle = stage.oracleActive && isTarget

          return (
            <div key={state} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {/* State label */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800,
                color: isTarget ? 'var(--accent-strong)' : 'var(--text-secondary)',
              }}>
                |{state}⟩
              </div>
              {/* Probability */}
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: isNeg || isOracle ? 'rgb(252,165,165)' : isTarget ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                {(prob * 100).toFixed(0)}%
              </div>
              {/* Target badge */}
              {isTarget && (
                <div style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: isOracle ? 'rgb(252,165,165)' : 'var(--accent-strong)',
                  padding: '2px 6px', borderRadius: 999,
                  background: isOracle ? 'rgba(239,68,68,0.12)' : 'rgba(var(--accent-rgb),0.12)',
                  border: `1px solid ${isOracle ? 'rgba(239,68,68,0.35)' : 'rgba(var(--accent-rgb),0.3)'}`,
                }}>
                  {isOracle ? '− marked' : 'target'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Stage chip button ─────────────────────────────────────────

function StageChip({ stage, active, stepNum, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(stage.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 14px', borderRadius: 999, cursor: 'pointer', transition: 'all 0.15s',
        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface-soft)',
        color: active ? 'var(--accent-strong)' : 'var(--text-secondary)',
        fontWeight: 700, fontSize: 13,
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--accent)' : 'var(--surface-muted)',
        color: active ? 'var(--text-inverse)' : 'var(--text-muted)',
        fontSize: 11, fontWeight: 800,
      }}>
        {stepNum}
      </span>
      {stage.title}
    </button>
  )
}

// ── Main export ───────────────────────────────────────────────

export default function GroverExplorer() {
  const [targetState, setTargetState] = useState('11')
  const [activeId, setActiveId] = useState('oracle')

  const stages     = computeGroverStages(targetState)
  const active     = stages.find(s => s.id === activeId) || stages[0]
  const diffusion  = stages.find(s => s.id === 'diffusion')
  const oracleAmp  = stages.find(s => s.id === 'oracle')?.amplitudes[targetState] ?? 0
  const finalProb  = diffusion?.amplitudes[targetState] ?? 0
  const successPct = (finalProb * finalProb * 100).toFixed(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
      `}</style>

      {/* ── Header + stat cards ── */}
      <div className="soft-panel p-4 md:p-5">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: 620 }}>
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>Algorithm Explorer</p>
            <h3 className="section-title" style={{ fontSize: '1.4rem' }}>Grover&apos;s Algorithm — Step by Step</h3>
            <p className="section-subtitle" style={{ fontSize: 14 }}>
              Pick any target state and walk through the four stages. Watch the oracle mark it with a
              sign flip, then diffusion amplify it above all others.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Target', value: `|${targetState}⟩`, mono: true },
              { label: 'Oracle sign', value: oracleAmp.toFixed(2), mono: true },
              { label: 'Success (1 iter)', value: `${successPct}%`, mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label} className="value-card" style={{ minWidth: 90, textAlign: 'center' }}>
                <span className="value-label">{label}</span>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, fontFamily: mono ? 'var(--font-mono)' : 'inherit', color: 'var(--text-primary)' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Target state selector ── */}
      <div className="soft-panel p-4">
        <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          Choose the hidden target state
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {ALL_STATES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { setTargetState(s); setActiveId('superposition') }}
              style={{
                padding: '8px 18px', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 14,
                fontFamily: 'var(--font-mono)',
                border: `2px solid ${targetState === s ? 'var(--accent)' : 'var(--border)'}`,
                background: targetState === s ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface-soft)',
                color: targetState === s ? 'var(--accent-strong)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              |{s}⟩
            </button>
          ))}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          In a real quantum computer, the oracle is a black box — it marks the target without telling you what it is.
          After just one Grover iteration on 4 states the target reaches 100% probability.
        </p>
      </div>

      {/* ── Stage navigation chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {stages.map((stage, i) => (
          <StageChip
            key={stage.id}
            stage={stage}
            active={stage.id === activeId}
            stepNum={i + 1}
            onClick={setActiveId}
          />
        ))}
      </div>

      {/* ── Active stage detail ── */}
      <div className="soft-panel p-4 md:p-5" style={{ animation: 'fadeIn 0.3s ease' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 4 }}>Step {stages.findIndex(s => s.id === activeId) + 1} of {stages.length}</p>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>
              {active.title}
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600 }}>
              {active.subtitle}
            </p>
          </div>
          <span style={{
            padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
            background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent-strong)',
            border: '1px solid rgba(var(--accent-rgb),0.25)',
          }}>
            Target |{targetState}⟩
          </span>
        </div>

        {/* The amplitude bar chart */}
        <AmplitudeChart stage={active} targetState={targetState} />

        {/* Oracle callout */}
        {active.oracleActive && (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 12,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              <strong style={{ color: 'rgb(252,165,165)' }}>Oracle mark:</strong>{' '}
              The amplitude of |{targetState}⟩ flipped from{' '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>+0.50</span> to{' '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'rgb(252,165,165)' }}>−0.50</span>.
              Measurement probabilities are unchanged (0.25 for all), but the sign difference will be
              exploited by the diffusion step.
            </p>
          </div>
        )}

        {/* Diffusion callout */}
        {active.id === 'diffusion' && (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 12,
            background: 'rgba(var(--accent-rgb),0.07)', border: '1px solid rgba(var(--accent-rgb),0.25)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              <strong style={{ color: 'var(--accent-strong)' }}>Diffusion rule:</strong>{' '}
              <span style={{ fontFamily: 'var(--font-mono)' }}>a&apos; = 2·mean − a</span>.{' '}
              The oracle drove |{targetState}⟩ below the mean. Reflecting about the mean sends it far{' '}
              <em>above</em> — amplifying its probability to{' '}
              <strong style={{ color: 'var(--accent-strong)' }}>{successPct}%</strong>.
            </p>
          </div>
        )}
      </div>

      {/* ── Explainer cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {[
          {
            label: 'How the oracle works',
            body: `The oracle flips the amplitude sign for |${targetState}⟩ without measuring it.
                   This is like putting a red dot on a card without looking at which one it is.`,
          },
          {
            label: 'Diffusion rule',
            body: "a' = 2·mean − a. Amplitudes below the mean are reflected upward. The marked state is the lowest, so it gets amplified the most.",
          },
          {
            label: 'Why one iteration works here',
            body: `With 4 states (N=4) the optimal number of iterations is π/4·√N ≈ 1.
                   One iteration sends the target to 100% probability — any more would overshoot.`,
          },
        ].map(({ label, body }) => (
          <div key={label} className="value-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="value-label">{label}</span>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
