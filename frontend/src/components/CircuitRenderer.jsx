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

const CELL_W = 104
const CELL_H = 80
const WIRE_Y_BASE = 40
const QUBIT_GAP = 84
const LEFT_PAD = 72
const RIGHT_PAD = 64

function getNumQubits(ops) {
  let max = 0
  ops.forEach(op => {
    if (op.target !== undefined) max = Math.max(max, op.target)
    if (op.control !== undefined) max = Math.max(max, op.control)
  })
  return max + 1
}

export default function CircuitRenderer({ operations = [], initialState = '|0>', activeStep = null, onGateClick }) {
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
    <div style={{ overflowX: 'auto', borderRadius: '12px' }} className="pb-2">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', minWidth: svgW }}
      >
        <rect width={svgW} height={svgH} rx="14" fill="var(--diagram-canvas-bg)" />

        {Array.from({ length: numQubits }).map((_, qi) => {
          const y = WIRE_Y_BASE + qi * QUBIT_GAP + CELL_H / 2 - 4
          const labelParts = initialState.split(/,\s*/)
          const label = labelParts[qi] || '|0>'
          return (
            <g key={qi}>
              <line
                x1={LEFT_PAD - 12}
                y1={y}
                x2={svgW - RIGHT_PAD + 12}
                y2={y}
                stroke="var(--diagram-wire)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text
                x={LEFT_PAD - 18}
                y={y + 4}
                textAnchor="end"
                fontSize="14"
                fontFamily="monospace"
                fontWeight="600"
                fill="var(--diagram-label)"
                opacity="0.92"
              >
                {label}
              </text>
              <text
                x={LEFT_PAD - 18}
                y={y + 20}
                textAnchor="end"
                fontSize="10"
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
          const isActive = op.col === activeStep
          
          const gProps = {
            className: `transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_10px_var(--accent)] brightness-110' : 'drop-shadow-sm hover:drop-shadow-md hover:brightness-105 cursor-pointer'}`,
            style: { transformOrigin: `${cx}px ${targetY}px` },
            onClick: () => onGateClick?.(op, idx)
          }

          if (op.gate === 'CNOT' && op.control !== undefined) {
            const controlY = WIRE_Y_BASE + op.control * QUBIT_GAP + CELL_H / 2 - 4
            return (
              <g key={idx} {...gProps}>
                <line
                  x1={cx}
                  y1={controlY}
                  x2={cx}
                  y2={targetY}
                  stroke={c.stroke}
                  strokeWidth="3"
                  opacity="0.65"
                />
                <circle cx={cx} cy={controlY} r="10" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
                <circle cx={cx} cy={targetY} r="22" fill="none" stroke={c.stroke} strokeWidth="3" />
                <line x1={cx - 22} y1={targetY} x2={cx + 22} y2={targetY} stroke={c.stroke} strokeWidth="2.5" />
                <line x1={cx} y1={targetY - 22} x2={cx} y2={targetY + 22} stroke={c.stroke} strokeWidth="2.5" />
                <text x={cx} y={targetY + 42} textAnchor="middle" fontSize="12" fill={c.stroke} fontFamily="monospace" fontWeight="600">
                  CNOT
                </text>
              </g>
            )
          }

          if (op.gate === 'CZ' && op.control !== undefined) {
            const controlY = WIRE_Y_BASE + op.control * QUBIT_GAP + CELL_H / 2 - 4
            return (
              <g key={idx} {...gProps}>
                <line x1={cx} y1={controlY} x2={cx} y2={targetY} stroke={c.stroke} strokeWidth="3" opacity="0.65" />
                <circle cx={cx} cy={controlY} r="10" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
                <circle cx={cx} cy={targetY} r="10" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
                <text x={cx} y={targetY + 32} textAnchor="middle" fontSize="12" fill={c.stroke} fontFamily="monospace" fontWeight="600">
                  CZ
                </text>
              </g>
            )
          }

          if (op.gate === 'MEASURE') {
            return (
              <g key={idx} {...gProps}>
                <rect
                  x={cx - 32}
                  y={targetY - 26}
                  width={64}
                  height={52}
                  rx="12"
                  fill={c.shell}
                  stroke={c.stroke}
                  strokeWidth={isActive ? "3" : "2.5"}
                />
                <path
                  d={`M ${cx - 16} ${targetY + 10} A 16 16 0 0 1 ${cx + 16} ${targetY + 10}`}
                  fill="none"
                  stroke={c.stroke}
                  strokeWidth="2.5"
                />
                <line x1={cx} y1={targetY + 10} x2={cx + 13} y2={targetY - 6} stroke={c.stroke} strokeWidth="2.5" />
                <text x={cx} y={targetY + 40} textAnchor="middle" fontSize="12" fill={c.stroke} fontFamily="monospace" fontWeight="600">
                  M
                </text>
              </g>
            )
          }

          return (
            <g key={idx} {...gProps}>
              <rect
                x={cx - 34}
                y={targetY - 30}
                width={68}
                height={60}
                rx="12"
                fill={c.shell}
                stroke={c.stroke}
                strokeWidth={isActive ? "3" : "2.5"}
              />
              <text
                x={cx}
                y={targetY + 8}
                textAnchor="middle"
                fontSize="20"
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
              x1={svgW - RIGHT_PAD + 12}
              y1={y - 10}
              x2={svgW - RIGHT_PAD + 12}
              y2={y + 10}
              stroke="var(--diagram-endcap)"
              strokeWidth="2.5"
            />
          )
        })}
      </svg>
    </div>
  )
}

