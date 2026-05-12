import { useState, useRef } from 'react'

const COLLAPSE_DELAY_MS = 620

function ProbabilityBar({ label, prob, color, isResult, dimmed }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: '100%', position: 'relative', height: 100,
        background: 'var(--surface-soft)',
        borderRadius: 12, border: `2px solid ${isResult ? color.border : 'var(--border)'}`,
        overflow: 'hidden',
        transition: 'border-color 0.3s',
        opacity: dimmed ? 0.35 : 1,
      }}>
        {/* Fill bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${prob * 100}%`,
          background: `linear-gradient(180deg, ${color.bg}, ${color.dim})`,
          transition: 'height 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          borderRadius: '0 0 10px 10px',
        }} />
        {/* Pct label */}
        <div style={{
          position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 16,
          color: isResult ? color.text : 'var(--text-secondary)',
          transition: 'color 0.3s',
        }}>
          {(prob * 100).toFixed(0)}%
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 800,
        color: isResult ? color.text : 'var(--text-secondary)',
        transition: 'color 0.3s',
      }}>
        {label}
      </div>
    </div>
  )
}

function HistoryDot({ value }) {
  const is0 = value === '0'
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%',
      background: is0 ? 'rgba(59,130,246,0.7)' : 'rgba(239,68,68,0.7)',
      border: `2px solid ${is0 ? 'rgb(147,197,253)' : 'rgb(252,165,165)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 800,
      color: is0 ? 'rgb(147,197,253)' : 'rgb(252,165,165)',
      flexShrink: 0,
    }}>
      {value}
    </div>
  )
}

export default function MeasurementExplorer() {
  const [history, setHistory] = useState([])
  const [collapsed, setCollapsed] = useState(null)   // '0' | '1' | null
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef(null)

  const count0 = history.filter(r => r === '0').length
  const count1 = history.filter(r => r === '1').length
  const total  = history.length

  function measure() {
    if (animating) return
    setAnimating(true)
    setCollapsed(null)
    timerRef.current = setTimeout(() => {
      const result = Math.random() < 0.5 ? '0' : '1'
      setCollapsed(result)
      setHistory(h => [...h.slice(-29), result])
      setAnimating(false)
    }, COLLAPSE_DELAY_MS)
  }

  function reset() {
    clearTimeout(timerRef.current)
    setHistory([])
    setCollapsed(null)
    setAnimating(false)
  }

  const prob0Before = 0.5
  const prob1Before = 0.5

  const BLUE  = { bg: 'rgba(59,130,246,0.35)',  dim: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.65)',  text: 'rgb(147,197,253)' }
  const RED   = { bg: 'rgba(239,68,68,0.35)',   dim: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.65)',   text: 'rgb(252,165,165)' }

  const prob0After = collapsed !== null ? (collapsed === '0' ? 1 : 0) : prob0Before
  const prob1After = collapsed !== null ? (collapsed === '1' ? 1 : 0) : prob1Before

  const statFreq0 = total > 0 ? count0 / total : 0.5
  const statFreq1 = total > 0 ? count1 / total : 0.5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <style>{`
        @keyframes shakeCollapse {
          0%  { transform: scale(1); }
          20% { transform: scale(1.06) rotate(-1.5deg); }
          40% { transform: scale(0.96) rotate(1.5deg);  }
          60% { transform: scale(1.03) rotate(-0.5deg); }
          80% { transform: scale(0.99); }
          100%{ transform: scale(1);   }
        }
        @keyframes pulseIn {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .collapse-anim { animation: shakeCollapse 0.6s ease; }
        .result-anim   { animation: pulseIn 0.35s ease 0.35s both; }
      `}</style>

      {/* ── Header ── */}
      <div className="soft-panel p-4 md:p-5">
        <p className="section-eyebrow" style={{ marginBottom: 6 }}>Collapse Demonstrator</p>
        <h3 className="section-title">Quantum Measurement</h3>
        <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
          Before measurement the qubit is in superposition: (|0⟩ + |1⟩)/√2, equally likely to be 0 or 1.
          Measurement <strong style={{ color: 'var(--text-primary)' }}>collapses</strong> this to one definite classical outcome.
          Try pressing Measure many times and watch the statistics converge to 50%.
        </p>
      </div>

      {/* ── State setup info ── */}
      <div style={{
        padding: '14px 18px', borderRadius: 14,
        background: 'var(--surface-soft)', border: '1px solid var(--border)',
        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 5 }}>
            Circuit before measurement
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)' }}>
            <span style={{
              width: 48, height: 44, borderRadius: 10, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              background: 'rgba(148,163,184,0.12)', border: '1.5px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600,
            }}>
              |0⟩<span style={{ fontSize: 9, opacity: 0.7 }}>start</span>
            </span>
            <span style={{ color: 'var(--border)', fontSize: 18 }}>──</span>
            <span style={{
              width: 48, height: 44, borderRadius: 10, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              background: 'rgba(139,92,246,0.15)', border: '1.5px solid rgba(139,92,246,0.55)',
              color: 'rgb(167,139,250)', fontSize: 20, fontWeight: 900,
            }}>
              H
            </span>
            <span style={{ color: 'var(--border)', fontSize: 18 }}>──</span>
            <span style={{
              width: 48, height: 44, borderRadius: 10, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              background: 'rgba(99,102,241,0.15)', border: '1.5px solid rgba(99,102,241,0.55)',
              color: 'rgb(165,180,252)', fontSize: 20, fontWeight: 900,
            }}>
              M
            </span>
          </div>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 5 }}>
            State after H gate
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            (|0⟩ + |1⟩) / √2
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            50% |0⟩ · 50% |1⟩
          </p>
        </div>
      </div>

      {/* ── Before / After probability bars ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
        {/* Before */}
        <div className="soft-panel p-4">
          <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Before measurement
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <ProbabilityBar label="|0⟩" prob={prob0Before} color={BLUE} isResult={false} dimmed={false} />
            <ProbabilityBar label="|1⟩" prob={prob1Before} color={RED}  isResult={false} dimmed={false} />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Both exist simultaneously
          </p>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            fontSize: 24, color: 'var(--accent)', opacity: animating ? 1 : 0.4,
            transition: 'opacity 0.3s',
          }}>
            ⚡
          </div>
          <div style={{ width: 2, height: 32, background: 'var(--border)', borderRadius: 1 }} />
        </div>

        {/* After */}
        <div className={`soft-panel p-4 ${animating ? 'collapse-anim' : ''}`}>
          <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            After measurement
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <ProbabilityBar label="|0⟩" prob={prob0After} color={BLUE} isResult={collapsed === '0'} dimmed={collapsed === '1'} />
            <ProbabilityBar label="|1⟩" prob={prob1After} color={RED}  isResult={collapsed === '1'} dimmed={collapsed === '0'} />
          </div>
          {collapsed !== null ? (
            <p className="result-anim" style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 700, textAlign: 'center', color: collapsed === '0' ? 'rgb(147,197,253)' : 'rgb(252,165,165)' }}>
              Collapsed to |{collapsed}⟩
            </p>
          ) : (
            <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              {animating ? 'Collapsing…' : 'Press Measure ↓'}
            </p>
          )}
        </div>
      </div>

      {/* ── Measure button ── */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
        <button
          type="button"
          onClick={measure}
          disabled={animating}
          style={{
            padding: '12px 32px', borderRadius: 14, fontWeight: 800, fontSize: 15,
            background: animating ? 'var(--surface-muted)' : 'var(--accent)',
            border: '1px solid var(--accent)',
            color: animating ? 'var(--text-muted)' : 'var(--text-inverse)',
            cursor: animating ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            letterSpacing: '0.02em',
          }}
        >
          {animating ? 'Measuring…' : '⚡ Measure'}
        </button>
        {total > 0 && (
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '12px 20px', borderRadius: 14, fontWeight: 700, fontSize: 14,
              background: 'var(--surface-soft)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* ── History and statistics ── */}
      {total > 0 && (
        <div className="soft-panel p-4 md:p-5" style={{ animation: 'fadeSlideIn 0.3s ease' }}>
          <style>{`@keyframes fadeSlideIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Measurement history ({total} shots)
          </p>

          {/* History dots */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {[...history].reverse().map((v, i) => (
              <HistoryDot key={i} value={v} />
            ))}
          </div>

          {/* Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(147,197,253)', marginBottom: 5 }}>
                |0⟩ outcomes
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'rgb(147,197,253)' }}>
                {count0}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgb(147,197,253)', opacity: 0.8 }}>
                {(statFreq0 * 100).toFixed(1)}%
              </p>
            </div>

            <div style={{
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(252,165,165)', marginBottom: 5 }}>
                |1⟩ outcomes
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'rgb(252,165,165)' }}>
                {count1}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgb(252,165,165)', opacity: 0.8 }}>
                {(statFreq1 * 100).toFixed(1)}%
              </p>
            </div>

            <div style={{
              padding: '12px 14px', borderRadius: 12,
              background: 'var(--surface-soft)', border: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 5 }}>
                Converging to
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                50 / 50
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                theoretical
              </p>
            </div>
          </div>

          {total >= 10 && (
            <div style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.15)',
            }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--accent-strong)' }}>Law of large numbers:</strong>{' '}
                After {total} shots the ratio is {(statFreq0 * 100).toFixed(1)}% / {(statFreq1 * 100).toFixed(1)}%.
                {Math.abs(statFreq0 - 0.5) < 0.05 && total >= 20
                  ? ' Already very close to the theoretical 50/50!'
                  : ' Keep measuring — it will converge to 50/50 with more shots.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Key concept callout ── */}
      <div style={{
        padding: '16px 18px', borderRadius: 14,
        background: 'var(--surface-soft)', border: '1px solid var(--border)',
      }}>
        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          The core idea
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: '🌊', title: 'Before', body: 'The qubit holds both possibilities simultaneously — it is neither 0 nor 1.' },
            { icon: '⚡', title: 'During', body: 'Measurement interacts the qubit with the environment, forcing a choice.' },
            { icon: '◉',  title: 'After',  body: 'The superposition collapses to a single classical bit. The other branch disappears.' },
          ].map(({ icon, title, body }) => (
            <div key={title} style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{icon}</span>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
