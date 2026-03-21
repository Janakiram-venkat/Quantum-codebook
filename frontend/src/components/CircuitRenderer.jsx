/**
 * CircuitRenderer - SVG-based quantum circuit visualizer.
 */

const GATE_COLORS = {
  H: { fill: 'var(--gate-h-fill)', shell: 'var(--gate-h-shell)', stroke: 'var(--gate-h-stroke)', label: 'var(--gate-h-label)' },
  X: { fill: 'var(--gate-x-fill)', shell: 'var(--gate-x-shell)', stroke: 'var(--gate-x-stroke)', label: 'var(--gate-x-label)' },
  Y: { fill: 'var(--gate-y-fill)', shell: 'var(--gate-y-shell)', stroke: 'var(--gate-y-stroke)', label: 'var(--gate-y-label)' },
  Z: { fill: 'var(--gate-z-fill)', shell: 'var(--gate-z-shell)', stroke: 'var(--gate-z-stroke)', label: 'var(--gate-z-label)' },
  S: { fill: 'var(--gate-z-fill)', shell: 'var(--gate-z-shell)', stroke: 'var(--gate-z-stroke)', label: 'var(--gate-z-label)' },
  T: { fill: 'var(--gate-z-fill)', shell: 'var(--gate-z-shell)', stroke: 'var(--gate-z-stroke)', label: 'var(--gate-z-label)' },
  CNOT: { fill: 'var(--gate-cnot-fill)', shell: 'var(--gate-cnot-shell)', stroke: 'var(--gate-cnot-stroke)', label: 'var(--gate-cnot-label)' },
  CZ: { fill: 'var(--gate-cnot-fill)', shell: 'var(--gate-cnot-shell)', stroke: 'var(--gate-cnot-stroke)', label: 'var(--gate-cnot-label)' },
  MEASURE: { fill: 'var(--gate-measure-fill)', shell: 'var(--gate-measure-shell)', stroke: 'var(--gate-measure-stroke)', label: 'var(--gate-measure-label)' },
}

const DEFAULT_GATE_COLORS = {
  fill: 'var(--diagram-default-fill)',
  shell: 'var(--diagram-default-shell)',
  stroke: 'var(--diagram-default-stroke)',
  label: 'var(--diagram-default-label)',
}

const CELL_W = 72
const CELL_H = 56
const WIRE_Y_BASE = 28
const QUBIT_GAP = 56
const LEFT_PAD = 56
const RIGHT_PAD = 48

function getNumQubits(ops) {
  let max = 0
  ops.forEach(op => {
    if (op.target !== undefined) max = Math.max(max, op.target)
    if (op.control !== undefined) max = Math.max(max, op.control)
  })
  return max + 1
}

export default function CircuitRenderer({ operations = [], initialState = '|0>' }) {
  if (!operations || operations.length === 0) {
    return (
      <div
        className="rounded-xl p-5 text-center text-sm"
        style={{ background: 'var(--surface-soft)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
      >
        No gates applied. The qubit stays in {initialState}
      </div>
    )
  }

  const numQubits = getNumQubits(operations)
  const numSteps = operations.length

  const svgW = LEFT_PAD + numSteps * CELL_W + RIGHT_PAD
  const svgH = numQubits * QUBIT_GAP + CELL_H
  const opsByCol = operations.map((op, i) => ({ ...op, col: i }))

  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', minWidth: svgW }}
      >
        <rect width={svgW} height={svgH} rx="12" fill="var(--diagram-canvas-bg)" />

        {Array.from({ length: numQubits }).map((_, qi) => {
          const y = WIRE_Y_BASE + qi * QUBIT_GAP + CELL_H / 2 - 4
          const labelParts = initialState.split(/,\s*/)
          const label = labelParts[qi] || '|0>'
          return (
            <g key={qi}>
              <line
                x1={LEFT_PAD - 8}
                y1={y}
                x2={svgW - RIGHT_PAD + 8}
                y2={y}
                stroke="var(--diagram-wire)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text
                x={LEFT_PAD - 14}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fontFamily="monospace"
                fill="var(--diagram-label)"
                opacity="0.92"
              >
                {label}
              </text>
              <text
                x={LEFT_PAD - 14}
                y={y + 18}
                textAnchor="end"
                fontSize="9"
                fontFamily="monospace"
                fill="var(--diagram-subtle)"
              >
                q{qi}
              </text>
            </g>
          )
        })}

        {opsByCol.map((op, idx) => {
          const cx = LEFT_PAD + op.col * CELL_W + CELL_W / 2
          const targetY = WIRE_Y_BASE + op.target * QUBIT_GAP + CELL_H / 2 - 4
          const c = GATE_COLORS[op.gate] || DEFAULT_GATE_COLORS

          if (op.gate === 'CNOT' && op.control !== undefined) {
            const controlY = WIRE_Y_BASE + op.control * QUBIT_GAP + CELL_H / 2 - 4
            return (
              <g key={idx}>
                <line
                  x1={cx}
                  y1={controlY}
                  x2={cx}
                  y2={targetY}
                  stroke={c.stroke}
                  strokeWidth="2"
                  opacity="0.6"
                />
                <circle cx={cx} cy={controlY} r="7" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
                <circle cx={cx} cy={targetY} r="14" fill="none" stroke={c.stroke} strokeWidth="2" />
                <line x1={cx - 14} y1={targetY} x2={cx + 14} y2={targetY} stroke={c.stroke} strokeWidth="1.5" />
                <line x1={cx} y1={targetY - 14} x2={cx} y2={targetY + 14} stroke={c.stroke} strokeWidth="1.5" />
                <text x={cx} y={targetY + 28} textAnchor="middle" fontSize="9" fill={c.stroke} fontFamily="monospace">
                  CNOT
                </text>
              </g>
            )
          }

          if (op.gate === 'CZ' && op.control !== undefined) {
            const controlY = WIRE_Y_BASE + op.control * QUBIT_GAP + CELL_H / 2 - 4
            return (
              <g key={idx}>
                <line x1={cx} y1={controlY} x2={cx} y2={targetY} stroke={c.stroke} strokeWidth="2" opacity="0.6" />
                <circle cx={cx} cy={controlY} r="7" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
                <circle cx={cx} cy={targetY} r="7" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
                <text x={cx} y={targetY + 22} textAnchor="middle" fontSize="9" fill={c.stroke} fontFamily="monospace">
                  CZ
                </text>
              </g>
            )
          }

          if (op.gate === 'MEASURE') {
            return (
              <g key={idx}>
                <rect
                  x={cx - 20}
                  y={targetY - 18}
                  width={40}
                  height={36}
                  rx="8"
                  fill={c.shell}
                  stroke={c.stroke}
                  strokeWidth="1.5"
                />
                <path
                  d={`M ${cx - 10} ${targetY + 6} A 10 10 0 0 1 ${cx + 10} ${targetY + 6}`}
                  fill="none"
                  stroke={c.stroke}
                  strokeWidth="1.5"
                />
                <line x1={cx} y1={targetY + 6} x2={cx + 8} y2={targetY - 4} stroke={c.stroke} strokeWidth="1.5" />
                <text x={cx} y={targetY + 26} textAnchor="middle" fontSize="9" fill={c.stroke} fontFamily="monospace">
                  M
                </text>
              </g>
            )
          }

          return (
            <g key={idx}>
              <rect
                x={cx - 22}
                y={targetY - 18}
                width={44}
                height={36}
                rx="8"
                fill={c.shell}
                stroke={c.stroke}
                strokeWidth="1.5"
              />
              <text
                x={cx}
                y={targetY + 5}
                textAnchor="middle"
                fontSize="13"
                fontWeight="bold"
                fontFamily="monospace"
                fill={c.label}
              >
                {op.gate}
              </text>
            </g>
          )
        })}

        {Array.from({ length: numQubits }).map((_, qi) => {
          const y = WIRE_Y_BASE + qi * QUBIT_GAP + CELL_H / 2 - 4
          return (
            <line
              key={qi}
              x1={svgW - RIGHT_PAD + 8}
              y1={y - 8}
              x2={svgW - RIGHT_PAD + 8}
              y2={y + 8}
              stroke="var(--diagram-endcap)"
              strokeWidth="2"
            />
          )
        })}
      </svg>
    </div>
  )
}
