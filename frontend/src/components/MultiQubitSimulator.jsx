/**
 * MultiQubitSimulator
 * Clean drag-and-drop circuit builder for 1–3 qubits.
 * Gates are dragged from the palette or clicked to add, and dropped onto qubit wires.
 */
import { useState, useRef } from 'react'
import axios from 'axios'
import { Play, Loader2, RotateCcw, Trash2, Zap, Info } from 'lucide-react'
import ProbabilityChart from './ProbabilityChart'

// ─── Gate catalog ────────────────────────────────────────────
const GATE_DEFS = {
  H: {
    label: 'H',
    fullName: 'Hadamard',
    color: { bg: 'rgba(139,92,246,0.18)', border: 'rgba(139,92,246,0.55)', text: 'rgb(167,139,250)' },
    tip: 'Superposition: |0⟩ → (|0⟩+|1⟩)/√2',
    type: 'single',
  },
  X: {
    label: 'X',
    fullName: 'Pauli-X (NOT)',
    color: { bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.55)', text: 'rgb(252,165,165)' },
    tip: 'Bit-flip: |0⟩ ↔ |1⟩',
    type: 'single',
  },
  Y: {
    label: 'Y',
    fullName: 'Pauli-Y',
    color: { bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.55)', text: 'rgb(74,222,128)' },
    tip: 'Bit+Phase flip: |0⟩→i|1⟩, |1⟩→−i|0⟩',
    type: 'single',
  },
  Z: {
    label: 'Z',
    fullName: 'Pauli-Z',
    color: { bg: 'rgba(59,130,246,0.18)', border: 'rgba(59,130,246,0.55)', text: 'rgb(147,197,253)' },
    tip: 'Phase-flip: |1⟩ → −|1⟩',
    type: 'single',
  },
  S: {
    label: 'S',
    fullName: 'S Gate',
    color: { bg: 'rgba(20,184,166,0.18)', border: 'rgba(20,184,166,0.55)', text: 'rgb(94,234,212)' },
    tip: '90° phase: |1⟩ → i|1⟩',
    type: 'single',
  },
  T: {
    label: 'T',
    fullName: 'T Gate',
    color: { bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.55)', text: 'rgb(252,211,77)' },
    tip: '45° phase: |1⟩ → e^(iπ/4)|1⟩',
    type: 'single',
  },
  CNOT: {
    label: 'CX',
    fullName: 'CNOT',
    color: { bg: 'rgba(168,85,247,0.18)', border: 'rgba(168,85,247,0.55)', text: 'rgb(196,148,255)' },
    tip: 'Flip target if control=|1⟩. Drop on target wire.',
    type: 'multi',
    needsControl: true,
  },
  CZ: {
    label: 'CZ',
    fullName: 'CZ Gate',
    color: { bg: 'rgba(99,102,241,0.18)', border: 'rgba(99,102,241,0.55)', text: 'rgb(165,180,252)' },
    tip: 'Phase-flip |11⟩. Drop on target wire.',
    type: 'multi',
    needsControl: true,
  },
  SWAP: {
    label: 'SW',
    fullName: 'SWAP',
    color: { bg: 'rgba(236,72,153,0.18)', border: 'rgba(236,72,153,0.55)', text: 'rgb(249,168,212)' },
    tip: 'Exchange two qubits. Drop on first wire.',
    type: 'multi',
    needsSecond: true,
  },
}

const DEFAULT_ALLOWED = ['H', 'X', 'Z', 'CNOT', 'CZ', 'SWAP']

// ─── Circuit layout constants (used for SVG connector overlay) ─
const ROW_H   = 64   // minHeight of each QubitWire
const ROW_GAP = 12   // gap between rows
const LABEL_W = 44   // qubit label column width
const DROP0_W = 24   // initial drop slot (non-dragging)
const GATE_W  = 60   // gate cell width
const SLOT_W  = 24   // subsequent drop slots
const INNER_G = 4    // gap inside the wire flex

// x-center of gate column k (from circuit-rows container left):
function gateColX(k) {
  // layout: [LABEL_W] [DROP0_W + INNER_G] [k * (GATE_W + INNER_G + SLOT_W + INNER_G)]  + GATE_W/2
  return LABEL_W + INNER_G + DROP0_W + INNER_G + k * (GATE_W + INNER_G + SLOT_W + INNER_G) + GATE_W / 2
}

// y-center of qubit row q (from circuit-rows container top):
function qubitRowY(q) {
  return q * (ROW_H + ROW_GAP) + ROW_H / 2
}

// ─── Utility ─────────────────────────────────────────────────
function formatAmplitude(amp) {
  const r = Number(amp?.real ?? 0)
  const i = Number(amp?.imag ?? 0)
  if (Math.abs(i) < 1e-8) return r.toFixed(4)
  if (Math.abs(r) < 1e-8) return `${i.toFixed(4)}i`
  return `${r.toFixed(4)} ${i >= 0 ? '+' : '−'} ${Math.abs(i).toFixed(4)}i`
}
function ampProb(amp) {
  const r = Number(amp?.real ?? 0); const i = Number(amp?.imag ?? 0)
  return r * r + i * i
}

function writeDraggedGateId(event, gateId) {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/quantum-gate-id', gateId)
  event.dataTransfer.setData('text/plain', gateId)
  event.dataTransfer.setData('gateId', gateId)
}

function readDraggedGateId(event) {
  return (
    event.dataTransfer.getData('application/quantum-gate-id') ||
    event.dataTransfer.getData('text/plain') ||
    event.dataTransfer.getData('gateId')
  )
}

// ─── Sub-components ──────────────────────────────────────────

/** Draggable gate tile in the palette */
function PaletteTile({ gateId, disabled, onDragStart, onClick }) {
  const [hovered, setHovered] = useState(false)
  const def = GATE_DEFS[gateId]
  if (!def) return null

  return (
    <div
      draggable={!disabled}
      onDragStart={e => {
        writeDraggedGateId(e, gateId)
        onDragStart?.(gateId)
      }}
      onClick={() => !disabled && onClick?.(gateId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={disabled ? 'Circuit full' : def.tip}
      style={{
        width: 62,
        height: 64,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        cursor: disabled ? 'not-allowed' : 'grab',
        userSelect: 'none',
        background: def.color.bg,
        border: `2px solid ${hovered && !disabled ? def.color.text : def.color.border}`,
        color: def.color.text,
        fontWeight: 900,
        fontFamily: 'var(--font-mono)',
        fontSize: def.label.length > 2 ? 13 : 20,
        opacity: disabled ? 0.35 : 1,
        transition: 'border-color 0.15s, opacity 0.15s',
        flexShrink: 0,
      }}
    >
      {def.label}
      <span style={{ fontSize: 9, fontFamily: 'sans-serif', fontWeight: 600, opacity: 0.7, letterSpacing: '0.02em' }}>
        {def.fullName.split(' ')[0]}
      </span>
    </div>
  )
}

/** A single qubit wire row with drop zones between steps */
function QubitWire({ qubitIdx, ops, activeStep, onDrop, onRemoveOp, isDragActive }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative', minHeight: ROW_H }}>
      {/* Qubit label */}
      <div style={{
        width: LABEL_W, flexShrink: 0, textAlign: 'right', paddingRight: 10,
        fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)',
      }}>
        q{qubitIdx}
      </div>

      {/* Wire + gate cells */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* Horizontal wire behind everything */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '50%',
          height: 2, background: 'var(--border)', transform: 'translateY(-50%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Gate + drop zone flex row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: INNER_G, zIndex: 1, flexWrap: 'nowrap' }}>
          <DropSlot qubitIdx={qubitIdx} slotIdx={0} onDrop={onDrop} isDragActive={isDragActive} />

          {ops.map((op, colIdx) => {
            const isTarget  = op.target === qubitIdx || op.target1 === qubitIdx || op.target2 === qubitIdx
            const isControl = op.control === qubitIdx
            const involved  = isTarget || isControl
            const def = involved ? GATE_DEFS[op.gate] : null
            const isActive  = colIdx === activeStep

            return (
              <div key={colIdx} style={{ display: 'flex', alignItems: 'center', gap: INNER_G }}>
                {/* Gate cell */}
                <div style={{ width: GATE_W, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {involved && def ? (
                    <GateButton
                      op={op}
                      qubitIdx={qubitIdx}
                      isControl={isControl}
                      isTarget={isTarget}
                      isActive={isActive}
                      def={def}
                      onRemove={() => onRemoveOp(colIdx)}
                    />
                  ) : (
                    <div style={{ width: GATE_W, height: 2, background: 'transparent' }} />
                  )}
                </div>

                <DropSlot qubitIdx={qubitIdx} slotIdx={colIdx + 1} onDrop={onDrop} isDragActive={isDragActive} />
              </div>
            )
          })}
        </div>
      </div>

      {/* End cap */}
      <div style={{ width: 3, height: 28, background: 'var(--border)', borderRadius: 2, flexShrink: 0, marginLeft: 8, opacity: 0.6 }} />
    </div>
  )
}

function GateButton({ op, qubitIdx, isControl, isTarget, isActive, def, onRemove }) {
  const [hovered, setHovered] = useState(false)

  const label = isControl
    ? '●'
    : def.label

  const subLabel = !isControl && isTarget && op.control !== undefined
    ? `ctrl:q${op.control}`
    : op.target1 !== undefined && op.target2 !== undefined
      ? `↔q${qubitIdx === op.target1 ? op.target2 : op.target1}`
      : ''

  return (
    <button
      onClick={onRemove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Click to remove"
      style={{
        width: 52, height: 48, borderRadius: 11,
        background: hovered ? 'rgba(239,68,68,0.15)' : def.color.bg,
        border: `2px solid ${isActive ? def.color.text : hovered ? 'rgba(239,68,68,0.65)' : def.color.border}`,
        color: hovered ? 'rgb(252,165,165)' : def.color.text,
        fontWeight: 900, fontFamily: 'monospace',
        fontSize: isControl ? 20 : (def.label.length > 2 ? 11 : 18),
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        lineHeight: 1.1,
        animation: isActive ? 'pulse-gate 0.5s ease' : 'none',
      }}
    >
      {hovered ? '×' : label}
      {!hovered && subLabel && (
        <span style={{ fontSize: 8, fontFamily: 'sans-serif', opacity: 0.7, marginTop: 1 }}>
          {subLabel}
        </span>
      )}
    </button>
  )
}

function DropSlot({ qubitIdx, slotIdx, onDrop, isDragActive }) {
  const [over, setOver] = useState(false)

  return (
    <div
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault()
        const gateId = readDraggedGateId(e)
        setOver(false)
        if (gateId) onDrop(gateId, qubitIdx, slotIdx)
      }}
      style={{
        width: isDragActive ? 48 : 20,
        height: 44, borderRadius: 9,
        border: `2px dashed ${over ? 'var(--accent)' : isDragActive ? 'rgba(var(--accent-rgb),0.35)' : 'transparent'}`,
        background: over ? 'rgba(var(--accent-rgb),0.12)' : isDragActive ? 'rgba(var(--accent-rgb),0.04)' : 'transparent',
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      {(over || isDragActive) && (
        <span style={{ fontSize: 14, color: 'var(--accent)', pointerEvents: 'none' }}>+</span>
      )}
    </div>
  )
}

/** Config popup for multi-qubit gates */
function MultiGateConfig({ gateId, numQubits, existingQubits, onConfirm, onCancel }) {
  const def = GATE_DEFS[gateId]
  const isSWAP = gateId === 'SWAP'
  const otherQubits = Array.from({ length: numQubits }, (_, i) => i).filter(i => !existingQubits.includes(i))
  const [selectedQ, setSelectedQ] = useState(otherQubits[0] ?? null)

  if (!def) return null

  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: 8,
      padding: '14px 16px', borderRadius: 14, background: 'var(--bg-card)',
      border: `1.5px solid ${def.color.border}`, minWidth: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: def.color.text }}>
        {isSWAP ? 'Pick second qubit to swap' : 'Pick control qubit'}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Array.from({ length: numQubits }, (_, i) => {
          const isDisabled = existingQubits.includes(i)
          return (
            <button key={i} disabled={isDisabled} onClick={() => setSelectedQ(i)} style={{
              width: 38, height: 38, borderRadius: 9, fontWeight: 700, fontSize: 13, fontFamily: 'monospace',
              border: `1.5px solid ${selectedQ === i ? def.color.border : 'var(--border)'}`,
              background: selectedQ === i ? def.color.bg : 'var(--surface-soft)',
              color: selectedQ === i ? def.color.text : 'var(--text-muted)',
              cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.3 : 1,
            }}>
              q{i}
            </button>
          )
        })}
      </div>
      {otherQubits.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--danger)', margin: '8px 0 0' }}>
          Need at least 2 qubits. Increase qubit count.
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          disabled={selectedQ === null || otherQubits.length === 0}
          onClick={() => onConfirm(selectedQ)}
          style={{
            padding: '6px 14px', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer',
            background: def.color.bg, border: `1.5px solid ${def.color.border}`, color: def.color.text,
          }}
        >
          Add ✓
        </button>
        <button onClick={onCancel} style={{
          padding: '6px 12px', borderRadius: 9, fontSize: 12, cursor: 'pointer',
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)',
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

/** SVG overlay that draws connection lines for multi-qubit gates */
function ConnectorOverlay({ ops, numQubits }) {
  const totalH = numQubits * ROW_H + Math.max(numQubits - 1, 0) * ROW_GAP

  const lines = ops.flatMap((op, colIdx) => {
    const def = GATE_DEFS[op.gate]
    if (!def || def.type !== 'multi') return []

    const x = gateColX(colIdx)
    const result = []

    if (op.gate === 'SWAP' && op.target1 !== undefined && op.target2 !== undefined) {
      const y1 = qubitRowY(op.target1)
      const y2 = qubitRowY(op.target2)
      result.push({ key: `${colIdx}-swap`, x, y1: y1 + 24, y2: y2 - 24, color: def.color.border })
    } else if ((op.gate === 'CNOT' || op.gate === 'CZ') && op.control !== undefined && op.target !== undefined) {
      const yC = qubitRowY(op.control)
      const yT = qubitRowY(op.target)
      const top    = Math.min(yC, yT) + 24
      const bottom = Math.max(yC, yT) - 24
      if (bottom > top) {
        result.push({ key: `${colIdx}-ctrl`, x, y1: top, y2: bottom, color: def.color.border })
      }
    }
    return result
  })

  if (lines.length === 0) return null

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: totalH, pointerEvents: 'none', overflow: 'visible', zIndex: 2 }}
    >
      {lines.map(({ key, x, y1, y2, color }) => (
        <line key={key} x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={2.5} strokeDasharray="4 3" />
      ))}
    </svg>
  )
}

// ─── Main component ──────────────────────────────────────────
export default function MultiQubitSimulator({ simulation }) {
  const allowedGates = simulation?.allowed_gates || DEFAULT_ALLOWED
  const MAX_GATES = 12

  const [numQubits, setNumQubits] = useState(2)
  const [ops, setOps] = useState([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [pendingDrop, setPendingDrop] = useState(null)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [ran, setRan] = useState(false)
  const [activeStep, setActiveStep] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const configRef = useRef(null)

  function addSingleGateOp(gateId, qubitIdx, slotIdx) {
    if (ops.length >= MAX_GATES) return
    const op = { gate: gateId, target: qubitIdx }
    insertOpAtSlot(op, slotIdx)
  }

  function addMultiGateOp(gateId, targetQubitIdx, controlOrSecondQ, slotIdx) {
    if (ops.length >= MAX_GATES) return
    let op
    if (gateId === 'SWAP') {
      op = { gate: 'SWAP', target1: Math.min(targetQubitIdx, controlOrSecondQ), target2: Math.max(targetQubitIdx, controlOrSecondQ) }
    } else {
      op = { gate: gateId, control: controlOrSecondQ, target: targetQubitIdx }
    }
    insertOpAtSlot(op, slotIdx)
  }

  function insertOpAtSlot(op, slotIdx) {
    setOps(prev => {
      const next = [...prev]
      if (slotIdx >= next.length) next.push(op)
      else next.splice(slotIdx, 0, op)
      return next
    })
    resetResult()
  }

  function removeOp(colIdx) {
    setOps(prev => prev.filter((_, i) => i !== colIdx))
    resetResult()
  }

  function clearAll() { setOps([]); resetResult() }

  function handleQubitCountChange(n) {
    setNumQubits(n)
    setOps(prev => prev.filter(op => {
      const indices = [op.target, op.control, op.target1, op.target2].filter(v => v !== undefined)
      return indices.every(i => i < n)
    }))
    resetResult()
  }

  function handleWireDrop(gateId, qubitIdx, slotIdx) {
    const def = GATE_DEFS[gateId]
    if (!def) return
    if (def.type === 'single') {
      addSingleGateOp(gateId, qubitIdx, slotIdx)
    } else {
      setPendingDrop({ gateId, qubitIdx, slotIdx })
    }
    setIsDragActive(false)
  }

  function handlePaletteClick(gateId) {
    const def = GATE_DEFS[gateId]
    if (!def || ops.length >= MAX_GATES) return
    if (def.type === 'single') {
      addSingleGateOp(gateId, 0, ops.length)
    } else {
      // For multi-qubit gates via click, target q0, ask for second qubit
      if (numQubits < 2) return
      setPendingDrop({ gateId, qubitIdx: 0, slotIdx: ops.length })
    }
  }

  function resetResult() {
    setResult(null); setRan(false); setError(null)
    setActiveStep(null); setIsAnimating(false)
  }

  async function runSim() {
    if (ops.length === 0 || loading || isAnimating) return
    setLoading(true); setRan(false); setResult(null); setError(null)
    setActiveStep(null); setIsAnimating(false)
    try {
      const res = await axios.post('/api/simulate/custom', { operations: ops, shots: 1000 })
      setLoading(false)
      setIsAnimating(true)
      let step = 0
      setActiveStep(0)
      const timer = setInterval(() => {
        step++
        if (step >= ops.length) {
          clearInterval(timer)
          setActiveStep(null); setIsAnimating(false)
          setResult(res.data); setRan(true)
        } else setActiveStep(step)
      }, 460)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Simulation failed.')
      setLoading(false)
    }
  }

  const simResult      = result?.result
  const amplitudes     = simResult?.amplitudes    || {}
  const probabilities  = simResult?.probabilities || {}
  const counts         = simResult?.counts        || {}
  const isRunDisabled  = loading || isAnimating || ops.length === 0
  const initLabel      = numQubits === 1 ? '|0⟩' : numQubits === 2 ? '|00⟩' : '|000⟩'
  const singleGates    = allowedGates.filter(g => GATE_DEFS[g]?.type === 'single')
  const multiGates     = allowedGates.filter(g => GATE_DEFS[g]?.type === 'multi')
  const circuitRowsH   = numQubits * ROW_H + Math.max(numQubits - 1, 0) * ROW_GAP

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <style>{`
        @keyframes pulse-gate { 0%{transform:scale(1)} 50%{transform:scale(1.12)} 100%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p className="section-eyebrow">Interactive Circuit Builder</p>
          <h3 className="section-title">Multi-Qubit Simulator</h3>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            Click or drag gates onto qubit wires to build your circuit, then run the simulation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {ran && (
            <button onClick={resetResult} style={btnSecondary}>
              <RotateCcw size={13} /> Reset
            </button>
          )}
          <button
            onClick={runSim}
            disabled={isRunDisabled}
            style={{ ...btnPrimary, opacity: isRunDisabled ? 0.6 : 1, cursor: isRunDisabled ? 'not-allowed' : 'pointer' }}
          >
            {loading || isAnimating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {loading ? 'Fetching…' : isAnimating ? 'Simulating…' : ran ? 'Run again' : 'Run simulation'}
          </button>
        </div>
      </div>

      {/* ── Qubit count ── */}
      <div className="soft-panel" style={{ padding: '16px 20px' }}>
        <p style={labelStyle}>Number of qubits</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => handleQubitCountChange(n)}
              style={{
                padding: '8px 20px', borderRadius: 11, fontWeight: 700, fontSize: 14,
                border: `1.5px solid ${numQubits === n ? 'var(--accent)' : 'var(--border)'}`,
                background: numQubits === n ? 'var(--accent)' : 'var(--surface-soft)',
                color: numQubits === n ? 'var(--text-inverse)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {n} qubit{n > 1 ? 's' : ''}
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7, marginLeft: 6 }}>
                ({Math.pow(2, n)} states)
              </span>
            </button>
          ))}
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>
            Start: <strong style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{initLabel}</strong>
          </span>
        </div>
      </div>

      {/* ── Gate palette ── */}
      <div
        className="soft-panel"
        style={{ padding: '16px 20px' }}
        onDragStart={() => setIsDragActive(true)}
        onDragEnd={() => setIsDragActive(false)}
      >
        {singleGates.length > 0 && (
          <>
            <p style={labelStyle}>Single-qubit gates — click to add to q0, or drag onto a wire</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: multiGates.length > 0 ? 14 : 0 }}>
              {singleGates.map(g => (
                <PaletteTile
                  key={g}
                  gateId={g}
                  disabled={ops.length >= MAX_GATES}
                  onDragStart={() => setIsDragActive(true)}
                  onClick={handlePaletteClick}
                />
              ))}
            </div>
          </>
        )}

        {multiGates.length > 0 && numQubits >= 2 && (
          <>
            <p style={labelStyle}>Multi-qubit gates — drag onto target wire, or click to add</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {multiGates.map(g => (
                <PaletteTile
                  key={g}
                  gateId={g}
                  disabled={ops.length >= MAX_GATES || numQubits < 2}
                  onDragStart={() => setIsDragActive(true)}
                  onClick={handlePaletteClick}
                />
              ))}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <Info size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Multi-qubit gates prompt you to pick the second qubit after adding.
            </p>
          </>
        )}

        {multiGates.length > 0 && numQubits < 2 && (
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Enable 2 or 3 qubits to use multi-qubit gates.
          </p>
        )}
      </div>

      {/* ── Circuit wires ── */}
      <div className="soft-panel" style={{ padding: '18px 20px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={labelStyle}>Circuit</p>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>
              <Zap size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Drag gates here · Click a gate to remove it
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
              background: ops.length >= MAX_GATES ? 'var(--accent)' : 'var(--surface-muted)',
              color: ops.length >= MAX_GATES ? 'var(--text-inverse)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
              {ops.length} / {MAX_GATES}
            </span>
            {ops.length > 0 && (
              <button onClick={clearAll} style={{ ...btnSecondary, fontSize: 12, padding: '5px 12px', color: 'rgb(252,165,165)', borderColor: 'rgba(239,68,68,0.3)' }}>
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Wire rows with SVG connector overlay */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: ROW_GAP, minWidth: 320, minHeight: circuitRowsH }}>
          <ConnectorOverlay ops={ops} numQubits={numQubits} />

          {Array.from({ length: numQubits }, (_, qi) => (
            <div key={qi} style={{ position: 'relative' }}>
              <QubitWire
                qubitIdx={qi}
                ops={ops}
                activeStep={activeStep}
                onDrop={handleWireDrop}
                onRemoveOp={removeOp}
                isDragActive={isDragActive}
              />
              {/* Multi-gate config popup */}
              {pendingDrop && pendingDrop.qubitIdx === qi && (
                <div ref={configRef} style={{ position: 'relative', zIndex: 40 }}>
                  <MultiGateConfig
                    gateId={pendingDrop.gateId}
                    numQubits={numQubits}
                    existingQubits={[qi]}
                    onConfirm={(secondQ) => {
                      addMultiGateOp(pendingDrop.gateId, pendingDrop.qubitIdx, secondQ, pendingDrop.slotIdx)
                      setPendingDrop(null)
                    }}
                    onCancel={() => setPendingDrop(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {ops.length === 0 && (
          <div style={{
            marginTop: 20, padding: '22px 0', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: 13,
            borderRadius: 12, border: '2px dashed var(--border)', animation: 'fadeIn 0.3s ease',
          }}>
            ↑ Drag a gate from the palette and drop it onto a qubit wire, or click a gate to add it to q0
          </div>
        )}
      </div>

      {/* ── Try this ── */}
      {simulation?.try_this && ops.length === 0 && (
        <div style={{
          padding: '14px 18px', borderRadius: 16,
          background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.2)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>
            Try these circuits
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {simulation.try_this.map((tip, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 12, fontSize: 13, lineHeight: 1.6, background: 'var(--danger-soft)', border: '1px solid var(--danger-border)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {/* ── Results ── */}
      {ran && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.35s ease' }}>
          {Object.keys(amplitudes).length > 0 && (
            <div className="soft-panel" style={{ padding: '18px 20px' }}>
              <p style={labelStyle}>State vector</p>
              <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Resulting Amplitudes
              </h3>
              <div className="section-grid" data-columns="2">
                {Object.entries(amplitudes)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([state, amp]) => (
                    <div key={state} className="value-card" style={{ padding: '12px 16px' }}>
                      <span className="value-label" style={{ fontSize: 11.5, marginBottom: 6 }}>|{state}⟩</span>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                        {formatAmplitude(amp)}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                        P = {(ampProb(amp) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {Object.keys(probabilities).length > 0 && (
            <div className="soft-panel" style={{ padding: '18px 20px' }}>
              <p style={labelStyle}>Measurement</p>
              <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Probability Distribution
              </h3>
              <ProbabilityChart probabilities={probabilities} counts={counts} shots={1000} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Shared micro-styles ─────────────────────────────────────
const labelStyle = {
  margin: '0 0 10px', fontSize: 10.5, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)',
}

const btnPrimary = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '9px 18px', borderRadius: 11,
  background: 'var(--accent)', border: '1px solid var(--accent)',
  color: 'var(--text-inverse)', fontSize: 13, fontWeight: 700,
  transition: 'all 0.16s', cursor: 'pointer',
}

const btnSecondary = {
  display: 'flex', alignItems: 'center', gap: 5,
  padding: '7px 14px', borderRadius: 10,
  background: 'var(--surface-soft)', border: '1px solid var(--border)',
  color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
  transition: 'all 0.15s',
}
