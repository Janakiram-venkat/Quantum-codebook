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
  'CONTROLLED-U': { fill: 'var(--gate-cnot-fill)', shell: '#f6f7ff', stroke: '#5468b9', label: '#2d3f89' },
  'CONTROLLED-U^2': { fill: 'var(--gate-cnot-fill)', shell: '#f3f5ff', stroke: '#4158b0', label: '#23367f' },
  'QFT†': { fill: '#eef5ff', shell: '#f8fbff', stroke: '#3166a6', label: '#18487a' },
  IQFT: { fill: '#eef5ff', shell: '#f8fbff', stroke: '#3166a6', label: '#18487a' },
  SHIFT_LEFT: { fill: '#edf9f3', shell: '#f5fcf8', stroke: '#2a8b61', label: '#146147' },
  SHIFT_RIGHT: { fill: '#edf9f3', shell: '#f5fcf8', stroke: '#2a8b61', label: '#146147' },
  MEASURE: { fill: 'var(--gate-measure-fill)', shell: 'var(--gate-measure-shell)', stroke: 'var(--gate-measure-stroke)', label: 'var(--gate-measure-label)' },
}

const GATE_LABELS = {
  'CONTROLLED-U': 'CU',
  'CONTROLLED-U^2': 'CU²',
  'QFT†': 'QFT†',
  IQFT: 'QFT†',
  SHIFT_LEFT: 'SL',
  SHIFT_RIGHT: 'SR',
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
    if (Array.isArray(op.targets) && op.targets.length > 0) max = Math.max(max, ...op.targets)
    if (op.target1 !== undefined) max = Math.max(max, op.target1)
    if (op.target2 !== undefined) max = Math.max(max, op.target2)
  })
  return max + 1
}

function resolveTargetQubits(op) {
  if (Array.isArray(op.targets) && op.targets.length > 0) return [...op.targets].sort((a, b) => a - b)
  if (op.target1 !== undefined && op.target2 !== undefined) return [op.target1, op.target2].sort((a, b) => a - b)
  if (op.target !== undefined) return [op.target]
  return []
}

function resolveGateLabel(gate) {
  return GATE_LABELS[gate] || gate
}

function resolveQubitY(qubitIndex) {
  return WIRE_Y_BASE + qubitIndex * QUBIT_GAP + CELL_H / 2 - 4
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
          const targetQubits = resolveTargetQubits(op)
          const primaryTarget = targetQubits[0] ?? op.target ?? 0
          const targetY = resolveQubitY(primaryTarget)
          const c = GATE_COLORS[op.gate] || DEFAULT_GATE_COLORS
          const displayLabel = resolveGateLabel(op.gate)
          const isActive = op.col === activeStep
          
          const gProps = {
            className: `transition-all duration-300 ${isActive ? 'brightness-105' : 'hover:brightness-105 cursor-pointer'}`,
            style: { transformOrigin: `${cx}px ${targetY}px` },
            onClick: () => onGateClick?.(op, idx)
          }

          if (op.gate === 'CNOT' && op.control !== undefined) {
            const controlY = resolveQubitY(op.control)
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
            const controlY = resolveQubitY(op.control)
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

          if (['CONTROLLED-U', 'CONTROLLED-U^2', 'SHIFT_LEFT', 'SHIFT_RIGHT'].includes(op.gate) && op.control !== undefined) {
            const controlY = resolveQubitY(op.control)
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
                <rect
                  x={cx - 32}
                  y={targetY - 24}
                  width={64}
                  height={48}
                  rx="11"
                  fill={c.shell}
                  stroke={c.stroke}
                  strokeWidth={isActive ? '3' : '2.5'}
                />
                <text
                  x={cx}
                  y={targetY + 6}
                  textAnchor="middle"
                  fontSize={displayLabel.length > 2 ? '14' : '18'}
                  fontWeight="700"
                  fontFamily="monospace"
                  fill={c.label}
                >
                  {displayLabel}
                </text>
              </g>
            )
          }

          if (['QFT†', 'IQFT'].includes(op.gate) && targetQubits.length > 1) {
            const startY = resolveQubitY(targetQubits[0])
            const endY = resolveQubitY(targetQubits[targetQubits.length - 1])
            const top = startY - 28
            const height = endY - startY + 56

            return (
              <g key={idx} {...gProps}>
                <rect
                  x={cx - 34}
                  y={top}
                  width={68}
                  height={height}
                  rx="12"
                  fill={c.shell}
                  stroke={c.stroke}
                  strokeWidth={isActive ? '3' : '2.5'}
                />
                <text
                  x={cx}
                  y={top + height / 2 + 6}
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="700"
                  fontFamily="monospace"
                  fill={c.label}
                >
                  {displayLabel}
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
                {displayLabel}
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

