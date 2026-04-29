import { useId, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { getBlochVector } from '../lib/blochSphere.js'
import { normalizeQuantumText } from '../lib/quantumText.js'

const DEFAULT_VIEW = {
  yaw: Math.PI / 5,
  pitch: -Math.PI / 7,
}

const VIEWBOX_SIZE = 320
const CENTER = VIEWBOX_SIZE / 2
const RADIUS = 102
const CIRCLE_SEGMENTS = 96
const ROTATION_SPEED = 0.01
const PITCH_LIMIT = Math.PI / 2 - 0.12

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function rotatePoint({ x, y, z }, yaw, pitch) {
  const cosYaw = Math.cos(yaw)
  const sinYaw = Math.sin(yaw)
  const cosPitch = Math.cos(pitch)
  const sinPitch = Math.sin(pitch)

  const rotatedX = x * cosYaw + z * sinYaw
  const rotatedZ = -x * sinYaw + z * cosYaw
  const rotatedY = y * cosPitch - rotatedZ * sinPitch
  const depth = y * sinPitch + rotatedZ * cosPitch

  return {
    x: rotatedX,
    y: rotatedY,
    z: depth,
  }
}

function projectPoint(point) {
  return {
    x: CENTER + point.x * RADIUS,
    y: CENTER - point.y * RADIUS,
    depth: point.z,
  }
}

function getGreatCirclePoint(axis, angle) {
  if (axis === 'x') return { x: 0, y: Math.cos(angle), z: Math.sin(angle) }
  if (axis === 'y') return { x: Math.cos(angle), y: 0, z: Math.sin(angle) }
  return { x: Math.cos(angle), y: Math.sin(angle), z: 0 }
}

function getAxisEndpoint(axis, direction) {
  if (axis === 'x') return { x: direction, y: 0, z: 0 }
  if (axis === 'y') return { x: 0, y: direction, z: 0 }
  return { x: 0, y: 0, z: direction }
}

function buildDepthSplitPath(points) {
  const front = []
  const back = []

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1]
    const end = points[index]
    const commands = (start.depth + end.depth) / 2 >= 0 ? front : back
    commands.push(
      `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    )
  }

  return {
    frontPath: front.join(' '),
    backPath: back.join(' '),
  }
}

function buildGreatCircle(axis, yaw, pitch) {
  const points = []

  for (let step = 0; step <= CIRCLE_SEGMENTS; step += 1) {
    const angle = (step / CIRCLE_SEGMENTS) * Math.PI * 2
    const rotated = rotatePoint(getGreatCirclePoint(axis, angle), yaw, pitch)
    points.push(projectPoint(rotated))
  }

  return buildDepthSplitPath(points)
}

function buildAxis(axis, yaw, pitch) {
  const centerPoint = { x: CENTER, y: CENTER, depth: 0 }
  const negative = projectPoint(rotatePoint(getAxisEndpoint(axis, -1), yaw, pitch))
  const positive = projectPoint(rotatePoint(getAxisEndpoint(axis, 1), yaw, pitch))

  const front = []
  const back = []

  const segments = [
    { start: negative, end: centerPoint, depth: negative.depth / 2 },
    { start: centerPoint, end: positive, depth: positive.depth / 2 },
  ]

  segments.forEach(({ start, end, depth }) => {
    const commands = depth >= 0 ? front : back
    commands.push(`M ${start.x.toFixed(2)} ${start.y.toFixed(2)} L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`)
  })

  return {
    frontPath: front.join(' '),
    backPath: back.join(' '),
    positive,
    negative,
  }
}

function getLabelPlacement(point, text) {
  const dx = point.x - CENTER
  const dy = point.y - CENTER
  const length = Math.hypot(dx, dy) || 1
  const offset = 22
  const x = point.x + (dx / length) * offset
  const y = point.y + (dy / length) * offset

  return {
    text,
    x,
    y,
    depth: point.depth,
    anchor: dx > 8 ? 'start' : dx < -8 ? 'end' : 'middle',
  }
}

function formatNumber(value) {
  const rounded = Math.abs(value) < 1e-9 ? 0 : value
  return rounded.toFixed(3)
}

function formatComplex(value) {
  const real = Number(value?.real || 0)
  const imag = Number(value?.imag || 0)

  if (Math.abs(imag) < 1e-6) return formatNumber(real)
  if (Math.abs(real) < 1e-6) return `${formatNumber(imag)}i`

  return `${formatNumber(real)} ${imag >= 0 ? '+' : '-'} ${formatNumber(Math.abs(imag))}i`
}

function formatDegrees(radians) {
  return `${((radians * 180) / Math.PI).toFixed(1)} deg`
}

function AxisLabel({ label }) {
  return (
    <text
      x={label.x}
      y={label.y}
      textAnchor={label.anchor}
      dominantBaseline="middle"
      fontSize="16"
      fontWeight="700"
      fill="var(--bloch-axis-label)"
      opacity={label.depth >= 0 ? 0.98 : 0.65}
      pointerEvents="none"
    >
      {label.text}
    </text>
  )
}

export default function BlochSphere({ state, sourceLabel, stateLabel, note }) {
  const [view, setView] = useState(DEFAULT_VIEW)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef(null)
  const baseId = useId().replaceAll(':', '')
  const ids = {
    gradient: `${baseId}-gradient`,
    glow: `${baseId}-glow`,
  }
  const vector = getBlochVector(state)
  const isVectorOnly = Boolean(state?.vector) && (!state?.alpha || !state?.beta)

  if (!state || !vector) return null

  const purity = (1 + vector.x * vector.x + vector.y * vector.y + vector.z * vector.z) / 2

  const zCircle = buildGreatCircle('z', view.yaw, view.pitch)
  const xCircle = buildGreatCircle('x', view.yaw, view.pitch)
  const yCircle = buildGreatCircle('y', view.yaw, view.pitch)
  const xAxis = buildAxis('x', view.yaw, view.pitch)
  const yAxis = buildAxis('y', view.yaw, view.pitch)
  const zAxis = buildAxis('z', view.yaw, view.pitch)
  const point = projectPoint(rotatePoint(vector, view.yaw, view.pitch))
  const normalizedStateLabel = normalizeQuantumText(stateLabel)
  const labels = [
    getLabelPlacement(zAxis.positive, '|0>'),
    getLabelPlacement(zAxis.negative, '|1>'),
    getLabelPlacement(xAxis.positive, '|+>'),
    getLabelPlacement(xAxis.negative, '|->'),
    getLabelPlacement(yAxis.positive, '|+i>'),
    getLabelPlacement(yAxis.negative, '|-i>'),
  ]

  function resetView() {
    dragRef.current = null
    setIsDragging(false)
    setView(DEFAULT_VIEW)
  }

  function handlePointerDown(event) {
    event.preventDefault()
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      yaw: view.yaw,
      pitch: view.pitch,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    const dragState = dragRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    const deltaX = event.clientX - dragState.clientX
    const deltaY = event.clientY - dragState.clientY

    setView({
      yaw: dragState.yaw + deltaX * ROTATION_SPEED,
      pitch: clamp(dragState.pitch + deltaY * ROTATION_SPEED, -PITCH_LIMIT, PITCH_LIMIT),
    })
  }

  function handlePointerEnd(event) {
    const dragState = dragRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    dragRef.current = null
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleLostPointerCapture() {
    dragRef.current = null
    setIsDragging(false)
  }

  function handleKeyDown(event) {
    const step = event.shiftKey ? 0.18 : 0.1

    if (event.key === 'Home') {
      event.preventDefault()
      resetView()
      return
    }

    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return

    event.preventDefault()
    setView(current => ({
      yaw:
        event.key === 'ArrowLeft'
          ? current.yaw - step
          : event.key === 'ArrowRight'
            ? current.yaw + step
            : current.yaw,
      pitch:
        event.key === 'ArrowUp'
          ? clamp(current.pitch - step, -PITCH_LIMIT, PITCH_LIMIT)
          : event.key === 'ArrowDown'
            ? clamp(current.pitch + step, -PITCH_LIMIT, PITCH_LIMIT)
            : current.pitch,
    }))
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'var(--bloch-panel-bg)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <span className="value-label" style={{ marginBottom: 6 }}>3D Bloch Sphere</span>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              Drag to rotate, or use the arrow keys while focused.
            </p>
          </div>
          <button
            type="button"
            onClick={resetView}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'rgba(255, 255, 255, 0.55)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <RotateCcw size={14} />
            Reset view
          </button>
        </div>

        <div className="w-full flex justify-center py-6">
          <svg
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            style={{
              maxWidth: '430px',
              margin: '0 auto',
              width: '100%',
              height: 'auto',
              display: 'block',
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
              outline: 'none',
            }}
          tabIndex={0}
          role="img"
          aria-label="Interactive 3D Bloch sphere"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onLostPointerCapture={handleLostPointerCapture}
          onKeyDown={handleKeyDown}
        >
          <defs>
            <radialGradient id={ids.gradient} cx="34%" cy="28%" r="72%">
              <stop offset="0%" stopColor="var(--bloch-sphere-start)" />
              <stop offset="58%" stopColor="var(--bloch-sphere-mid)" />
              <stop offset="100%" stopColor="var(--bloch-sphere-end)" />
            </radialGradient>
            <radialGradient id={ids.glow} cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="var(--bloch-glow)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <circle cx={CENTER} cy={CENTER} r={RADIUS + 15} fill={`url(#${ids.glow})`} opacity="0.78" />

          <path d={zCircle.backPath} fill="none" stroke="var(--bloch-circle-z)" strokeWidth="1.1" opacity="0.45" />
          <path d={xCircle.backPath} fill="none" stroke="var(--bloch-circle-x)" strokeWidth="1.05" strokeDasharray="4 5" opacity="0.4" />
          <path d={yCircle.backPath} fill="none" stroke="var(--bloch-circle-y)" strokeWidth="1.05" strokeDasharray="5 6" opacity="0.4" />
          <path d={xAxis.backPath} fill="none" stroke="var(--bloch-axis-x)" strokeWidth="1.25" opacity="0.45" />
          <path d={yAxis.backPath} fill="none" stroke="var(--bloch-axis-y)" strokeWidth="1.25" opacity="0.45" />
          <path d={zAxis.backPath} fill="none" stroke="var(--bloch-axis-z)" strokeWidth="1.25" opacity="0.45" />

          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill={`url(#${ids.gradient})`}
            fillOpacity="0.94"
            stroke="var(--bloch-ring)"
            strokeWidth="1.5"
          />
          <ellipse
            cx={CENTER - 24}
            cy={CENTER - 34}
            rx="42"
            ry="24"
            fill="rgba(255, 255, 255, 0.22)"
            transform={`rotate(-18 ${CENTER - 24} ${CENTER - 34})`}
            pointerEvents="none"
          />

          <path d={zCircle.frontPath} fill="none" stroke="var(--bloch-circle-z)" strokeWidth="1.25" opacity="0.88" />
          <path d={xCircle.frontPath} fill="none" stroke="var(--bloch-circle-x)" strokeWidth="1.15" strokeDasharray="4 5" opacity="0.84" />
          <path d={yCircle.frontPath} fill="none" stroke="var(--bloch-circle-y)" strokeWidth="1.15" strokeDasharray="5 6" opacity="0.84" />
          <path d={xAxis.frontPath} fill="none" stroke="var(--bloch-axis-x)" strokeWidth="1.35" opacity="0.95" />
          <path d={yAxis.frontPath} fill="none" stroke="var(--bloch-axis-y)" strokeWidth="1.35" opacity="0.95" />
          <path d={zAxis.frontPath} fill="none" stroke="var(--bloch-axis-z)" strokeWidth="1.35" opacity="0.98" />

          <line
            x1={CENTER}
            y1={CENTER}
            x2={point.x}
            y2={point.y}
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={point.depth >= 0 ? 1 : 0.78}
          />
          <circle cx={CENTER} cy={CENTER} r="4.5" fill="var(--text-primary)" opacity="0.82" />
          <circle
            cx={point.x}
            cy={point.y}
            r={point.depth >= 0 ? 8 : 6.5}
            fill="var(--accent)"
            stroke="var(--bloch-point-stroke)"
            strokeWidth="2"
            opacity={point.depth >= 0 ? 1 : 0.82}
          />

          {labels.map(label => (
            <AxisLabel key={label.text} label={label} />
          ))}
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        <div className="value-card">
          <span className="value-label">State View</span>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
            {sourceLabel || 'Single-qubit state'}
          </p>
          {normalizedStateLabel && (
            <p
              className="font-mono text-[16px]"
              style={{ marginTop: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}
            >
              {normalizedStateLabel}
            </p>
          )}
          {note && (
            <p className="text-[17px] mt-3" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {note}
            </p>
          )}
        </div>

        <div className="section-grid" data-columns="2">
          {!isVectorOnly && (
            <div className="value-card">
              <span className="value-label">Alpha</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                {formatComplex(state.alpha)}
              </p>
            </div>
          )}
          {!isVectorOnly && (
            <div className="value-card">
              <span className="value-label">Beta</span>
              <p className="font-mono" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
                {formatComplex(state.beta)}
              </p>
            </div>
          )}
          <div className="value-card">
            <span className="value-label">Bloch Vector</span>
            <p className="font-mono" style={{ margin: 0, fontSize: 17, color: 'var(--text-primary)' }}>
              x {formatNumber(vector.x)}
            </p>
            <p className="font-mono text-[16px]" style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
              y {formatNumber(vector.y)}
            </p>
            <p className="font-mono text-[16px]" style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
              z {formatNumber(vector.z)}
            </p>
          </div>
          <div className="value-card">
            <span className="value-label">{isVectorOnly ? 'Mixed-State Info' : 'Angles'}</span>
            {isVectorOnly ? (
              <>
                <p className="font-mono" style={{ margin: 0, fontSize: 17, color: 'var(--text-primary)' }}>
                  length {formatNumber(vector.length || 0)}
                </p>
                <p className="font-mono text-[16px]" style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
                  purity {formatNumber(purity)}
                </p>
              </>
            ) : (
              <>
                <p className="font-mono" style={{ margin: 0, fontSize: 17, color: 'var(--text-primary)' }}>
                  theta {formatDegrees(vector.theta)}
                </p>
                <p className="font-mono text-[16px]" style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
                  phi {formatDegrees(vector.phi)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
