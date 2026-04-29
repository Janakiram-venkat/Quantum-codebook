import { useState } from 'react'
import { Trash2 } from 'lucide-react'

const GATE_META = {
  H:       { name: 'Hadamard', bg: 'rgba(139,92,246,0.18)', border: 'rgba(139,92,246,0.65)', text: 'rgb(167,139,250)' },
  X:       { name: 'Pauli-X',  bg: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.65)',  text: 'rgb(252,165,165)' },
  Y:       { name: 'Pauli-Y',  bg: 'rgba(34,197,94,0.18)',  border: 'rgba(34,197,94,0.65)',  text: 'rgb(74,222,128)'  },
  Z:       { name: 'Pauli-Z',  bg: 'rgba(59,130,246,0.18)', border: 'rgba(59,130,246,0.65)', text: 'rgb(147,197,253)' },
  S:       { name: 'S Gate',   bg: 'rgba(20,184,166,0.18)', border: 'rgba(20,184,166,0.65)', text: 'rgb(94,234,212)'  },
  T:       { name: 'T Gate',   bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.65)', text: 'rgb(252,211,77)'  },
  MEASURE: { name: 'Measure',  bg: 'rgba(99,102,241,0.18)', border: 'rgba(99,102,241,0.65)', text: 'rgb(165,180,252)' },
}

const FALLBACK_META = { name: 'Gate', bg: 'var(--surface-soft)', border: 'var(--border)', text: 'var(--text-primary)' }

function getMeta(gate) {
  return GATE_META[gate] || FALLBACK_META
}

function gateSymbol(gate) {
  return gate === 'MEASURE' ? 'M' : gate
}

function encodeDragPayload(payload) {
  return JSON.stringify(payload)
}

function decodeDragPayload(event) {
  const raw =
    event.dataTransfer.getData('application/quantum-gate') ||
    event.dataTransfer.getData('text/plain')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function normalizeSlots(items, maxGates) {
  const visibleCells = Math.max(maxGates, 1)
  const slots = Array.from({ length: visibleCells }, () => null)
  items.slice(0, visibleCells).forEach((item, index) => {
    slots[index] = item ?? null
  })
  return slots
}

function countPlacedGates(slots) {
  return slots.filter(Boolean).length
}

function firstEmptySlot(slots) {
  return slots.findIndex(slot => !slot)
}

function placeGateInSlot(slots, slotIndex, operation) {
  if (slotIndex < 0 || slotIndex >= slots.length) return slots
  const next = [...slots]
  if (!next[slotIndex]) {
    next[slotIndex] = operation
    return next
  }
  const emptyIndex = next.findIndex((slot, index) => index > slotIndex && !slot)
  if (emptyIndex === -1) return next
  for (let index = emptyIndex; index > slotIndex; index -= 1) {
    next[index] = next[index - 1]
  }
  next[slotIndex] = operation
  return next
}

function moveGateBetweenSlots(slots, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return slots
  if (fromIndex >= slots.length || toIndex >= slots.length) return slots
  const next = [...slots]
  const draggedGate = next[fromIndex]
  if (!draggedGate) return slots
  if (!next[toIndex]) {
    next[fromIndex] = null
    next[toIndex] = draggedGate
    return next
  }
  next[fromIndex] = next[toIndex]
  next[toIndex] = draggedGate
  return next
}

function removeGateFromSlots(slots, slotIndex) {
  if (slotIndex < 0 || slotIndex >= slots.length) return slots
  const next = [...slots]
  next[slotIndex] = null
  return next
}

function getActiveSlotIndex(slots, activeStep) {
  if (activeStep === null || activeStep === undefined) return null
  let placedCount = 0
  for (let index = 0; index < slots.length; index += 1) {
    if (!slots[index]) continue
    if (placedCount === activeStep) return index
    placedCount += 1
  }
  return null
}

// ── Palette gate tile ─────────────────────────────────────────

function PaletteGate({ gate, disabled, onAdd, onDragStateChange }) {
  const meta = getMeta(gate)
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      draggable={!disabled}
      onDragStart={event => {
        const payload = encodeDragPayload({ type: 'palette', gate })
        event.dataTransfer.effectAllowed = 'copy'
        event.dataTransfer.setData('application/quantum-gate', payload)
        event.dataTransfer.setData('text/plain', payload)
        onDragStateChange(true)
      }}
      onDragEnd={() => onDragStateChange(false)}
      onClick={() => { if (!disabled) onAdd(gate) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 66,
        height: 70,
        borderRadius: 12,
        border: `2.5px solid ${hovered && !disabled ? meta.text : meta.border}`,
        background: meta.bg,
        color: meta.text,
        cursor: disabled ? 'not-allowed' : 'grab',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        transition: 'border-color 0.15s, opacity 0.15s',
        flexShrink: 0,
      }}
      title={disabled ? 'Circuit is full' : `Click or drag to add ${meta.name}`}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: 22, lineHeight: 1 }}>
        {gateSymbol(gate)}
      </span>
      <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.75, letterSpacing: '0.02em' }}>
        {meta.name}
      </span>
    </button>
  )
}

// ── Empty drop slot ───────────────────────────────────────────

function DropSlot({ isVisible, isActive }) {
  return (
    <div
      style={{
        width: 66,
        minWidth: 66,
        height: 60,
        borderRadius: 12,
        border: `2px dashed ${
          isActive
            ? 'var(--accent)'
            : isVisible
              ? 'rgba(var(--accent-rgb), 0.3)'
              : 'var(--border)'
        }`,
        background: isActive
          ? 'rgba(var(--accent-rgb), 0.1)'
          : isVisible
            ? 'rgba(var(--accent-rgb), 0.04)'
            : 'var(--surface-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.16s ease',
        flexShrink: 0,
      }}
    >
      <span style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 700, opacity: isActive ? 1 : 0.4 }}>
        +
      </span>
    </div>
  )
}

// ── Placed gate in circuit ────────────────────────────────────

function PlacedGate({ gate, index, isActive, onRemove, onDragStateChange }) {
  const meta = getMeta(gate)
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      draggable
      onDragStart={event => {
        const payload = encodeDragPayload({ type: 'existing', gate, index })
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('application/quantum-gate', payload)
        event.dataTransfer.setData('text/plain', payload)
        onDragStateChange(true)
      }}
      onDragEnd={() => onDragStateChange(false)}
      onClick={() => onRemove(index)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 66,
        minWidth: 66,
        height: 60,
        borderRadius: 12,
        border: `2.5px solid ${
          isActive ? meta.text
          : hovered ? 'rgba(239,68,68,0.7)'
          : meta.border
        }`,
        background: isActive
          ? meta.bg
          : hovered
            ? 'rgba(239,68,68,0.1)'
            : meta.bg,
        color: isActive ? meta.text : hovered ? 'rgb(252,165,165)' : meta.text,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        boxShadow: isActive ? `0 0 0 3px ${meta.border}` : 'none',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
      title="Drag to reposition · Click to remove"
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: hovered ? 16 : 22, lineHeight: 1, transition: 'font-size 0.1s' }}>
        {hovered ? '×' : gateSymbol(gate)}
      </span>
      <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.65, letterSpacing: '0.03em' }}>
        {hovered ? 'remove' : meta.name}
      </span>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────

export default function CircuitComposer({
  availableGates = [],
  operations = [],
  initialState = '|0>',
  maxGates = 4,
  activeStep = null,
  onChange,
  onResetResult,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)
  const [isTrashActive, setIsTrashActive] = useState(false)
  const slots = normalizeSlots(operations, maxGates)
  const placedGateCount = countPlacedGates(slots)
  const activeSlotIndex = getActiveSlotIndex(slots, activeStep)
  const visibleCells = slots.length

  function commit(nextOperations) {
    onChange(normalizeSlots(nextOperations, maxGates))
    onResetResult?.()
  }

  function addGate(gate, slotIndex = firstEmptySlot(slots)) {
    if (placedGateCount >= maxGates || slotIndex === -1) return
    commit(placeGateInSlot(slots, slotIndex, { gate, target: 0 }))
  }

  function moveGate(fromIndex, slotIndex) {
    commit(moveGateBetweenSlots(slots, fromIndex, slotIndex))
  }

  function removeGate(index) {
    commit(removeGateFromSlots(slots, index))
  }

  function handleSlotDrop(slotIndex, event) {
    const payload = decodeDragPayload(event)
    setActiveSlot(null)
    if (!payload) return
    if (payload.type === 'palette') {
      addGate(payload.gate, slotIndex)
      return
    }
    if (payload.type === 'existing') {
      moveGate(payload.index, slotIndex)
    }
  }

  function handleTrashDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    setActiveSlot(null)
    setIsTrashActive(false)
    const payload = decodeDragPayload(event)
    if (!payload || payload.type !== 'existing') return
    removeGate(payload.index)
  }

  const isFull = placedGateCount >= maxGates

  return (
    <div className="space-y-4">
      {/* ── Gate palette ── */}
      <div className="soft-panel p-4 md:p-5">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>Gate Palette</p>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Click or drag gates into the circuit
            </h3>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
              Each gate is color-coded by type. Click to append, or drag to a specific slot.
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            borderRadius: 999,
            border: '1px solid var(--border)',
            background: isFull ? 'var(--accent)' : 'var(--surface-muted)',
            color: isFull ? 'var(--text-inverse)' : 'var(--text-muted)',
            padding: '6px 12px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {placedGateCount} / {maxGates} gates
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {availableGates.map(gate => (
            <PaletteGate
              key={gate}
              gate={gate}
              disabled={isFull}
              onAdd={clickedGate => addGate(clickedGate)}
              onDragStateChange={dragging => {
                setIsDragging(dragging)
                if (!dragging) { setActiveSlot(null); setIsTrashActive(false) }
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Circuit wire ── */}
      <div className="soft-panel p-4 md:p-5">
        <div style={{ position: 'relative', overflowX: 'auto', paddingBottom: 10 }}>
          {/* Horizontal wire line */}
          <div style={{
            position: 'absolute',
            top: 78,
            left: 80,
            right: 72,
            height: 2,
            background: 'var(--diagram-wire)',
            borderRadius: 999,
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: `72px repeat(${visibleCells}, 66px) 72px`,
            gap: 8,
            minWidth: 'max-content',
            alignItems: 'center',
          }}>
            {/* Step numbers row */}
            <div />
            {Array.from({ length: visibleCells }).map((_, slotIndex) => (
              <div key={`step-${slotIndex}`} style={{
                textAlign: 'center', color: 'var(--text-muted)',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {slotIndex + 1}
              </div>
            ))}
            <div />

            {/* Initial state pill */}
            <div style={{
              borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--surface-muted)', color: 'var(--text-primary)',
              padding: '10px 8px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>
                {initialState}
              </div>
              <div style={{ marginTop: 3, color: 'var(--text-muted)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                q0
              </div>
            </div>

            {/* Gate slots */}
            {slots.map((operation, slotIndex) => {
              const slotNode = operation ? (
                <PlacedGate
                  gate={operation.gate}
                  index={slotIndex}
                  isActive={activeSlotIndex === slotIndex}
                  onRemove={removeGate}
                  onDragStateChange={dragging => {
                    setIsDragging(dragging)
                    if (!dragging) { setActiveSlot(null); setIsTrashActive(false) }
                  }}
                />
              ) : (
                <DropSlot isVisible={isDragging || !operation} isActive={activeSlot === slotIndex} />
              )

              return (
                <div
                  key={`cell-${slotIndex}`}
                  onDragOver={event => {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = operation ? 'move' : 'copy'
                    setIsDragging(true)
                    setActiveSlot(slotIndex)
                  }}
                  onDragLeave={() => { if (activeSlot === slotIndex) setActiveSlot(null) }}
                  onDrop={event => { handleSlotDrop(slotIndex, event); setIsDragging(false) }}
                >
                  {slotNode}
                </div>
              )
            })}

            {/* Output state pill */}
            <div style={{
              borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              padding: '10px 8px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>
                |ψ⟩
              </div>
              <div style={{ marginTop: 3, color: 'var(--text-muted)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                out
              </div>
            </div>
          </div>
        </div>

        {/* Trash zone */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14 }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
            Drop gates exactly where you want them. Drag a placed gate to reorder, or click it to remove.
          </p>
          <div
            onDragOver={event => { event.preventDefault(); setIsTrashActive(true) }}
            onDragLeave={() => setIsTrashActive(false)}
            onDrop={handleTrashDrop}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              borderRadius: 999,
              border: `1px solid ${isTrashActive ? 'var(--danger)' : 'var(--border)'}`,
              background: isTrashActive ? 'var(--danger-soft)' : 'var(--surface-soft)',
              color: isTrashActive ? 'var(--danger)' : 'var(--text-secondary)',
              padding: '8px 14px', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              minWidth: 140, justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <Trash2 size={13} />
            Drop to Remove
          </div>
        </div>
      </div>
    </div>
  )
}
