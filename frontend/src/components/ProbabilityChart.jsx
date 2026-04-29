/**
 * ProbabilityChart - animated horizontal bar chart for measurement outcomes.
 */

const STATE_COLORS = ['#2f5eaa', '#4f7cc4', '#6b8fcf', '#1f8f63', '#c1781d', '#8b5cf6']

export default function ProbabilityChart({ probabilities = {}, counts = {}, shots = 100 }) {
  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1])

  if (entries.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        No probability data yet. Run the simulation first.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map(([state, prob], i) => {
        const pct = (prob * 100).toFixed(1)
        const color = STATE_COLORS[i % STATE_COLORS.length]
        const count = counts[state] ?? Math.round(prob * shots)

        return (
          <div key={state}>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="font-mono text-sm font-bold px-2 py-0.5 rounded"
                style={{ background: 'var(--surface-soft)', color, border: '1px solid var(--border)' }}
              >
                {`|${state}>`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {count} shots
                </span>
                <span className="text-sm font-bold" style={{ color }}>
                  {pct}%
                </span>
              </div>
            </div>

            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{ background: 'var(--surface-muted)' }}
            >
              <div
                key={`${state}-${pct}`}
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: color,
                  transformOrigin: 'left',
                  animation: 'probability-grow 0.7s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>
          </div>
        )
      })}

      <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
        Sampled over {shots} shots
      </p>
    </div>
  )
}
