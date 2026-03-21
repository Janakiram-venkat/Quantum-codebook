import { normalizeQuantumText } from './quantumText.js'

const SQRT_HALF = Math.SQRT1_2

function complex(real, imag = 0) {
  return { real, imag }
}

function multiplyByReal(value, scale) {
  return {
    real: value.real * scale,
    imag: value.imag * scale,
  }
}

function magnitudeSquared(value) {
  return value.real * value.real + value.imag * value.imag
}

function normalizeState(alpha, beta) {
  const norm = Math.sqrt(magnitudeSquared(alpha) + magnitudeSquared(beta))
  if (!Number.isFinite(norm) || norm <= 1e-10) return null

  return {
    alpha: {
      real: alpha.real / norm,
      imag: alpha.imag / norm,
    },
    beta: {
      real: beta.real / norm,
      imag: beta.imag / norm,
    },
  }
}

function stripOuterParens(value) {
  let text = value

  while (text.startsWith('(') && text.endsWith(')')) {
    let depth = 0
    let valid = true

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index]
      if (char === '(') depth += 1
      if (char === ')') depth -= 1

      if (depth === 0 && index < text.length - 1) {
        valid = false
        break
      }
    }

    if (!valid) break
    text = text.slice(1, -1)
  }

  return text
}

function parseCoefficient(token) {
  const value = token || ''

  if (value === '' || value === '+') return complex(1, 0)
  if (value === '-') return complex(-1, 0)
  if (value === 'i' || value === '+i') return complex(0, 1)
  if (value === '-i') return complex(0, -1)

  const sqrtMatch = value.match(/^([+-]?)(?:√|sqrt(?:\{)?)([0-9]*\.?[0-9]+)\}?$/)
  if (sqrtMatch) {
    const sign = sqrtMatch[1] === '-' ? -1 : 1
    return complex(sign * Math.sqrt(Number(sqrtMatch[2])), 0)
  }

  const numericValue = Number(value)
  if (Number.isFinite(numericValue)) return complex(numericValue, 0)

  return null
}

function parseSingleTerm(text) {
  const match = text.match(/^(.*)\|(0|1)[>⟩]$/u)
  if (!match) return null

  const coefficient = parseCoefficient(match[1])
  if (!coefficient) return null

  return match[2] === '0'
    ? { alpha: coefficient, beta: complex(0, 0) }
    : { alpha: complex(0, 0), beta: coefficient }
}

function parseTwoTermExpression(text) {
  let depth = 0

  for (let index = 1; index < text.length; index += 1) {
    const char = text[index]
    if (char === '(') depth += 1
    if (char === ')') depth -= 1

    if (depth === 0 && (char === '+' || char === '-')) {
      const left = text.slice(0, index)
      const right = text.slice(index + 1)
      const sign = char === '-' ? -1 : 1

      const leftMatch = left.match(/^(.*)\|0[>⟩]$/u)
      const rightMatch = right.match(/^(.*)\|1[>⟩]$/u)
      if (!leftMatch || !rightMatch) continue

      const alpha = parseCoefficient(leftMatch[1])
      const beta = parseCoefficient(`${sign === -1 ? '-' : ''}${rightMatch[1]}`)
      if (!alpha || !beta) return null

      return { alpha, beta }
    }
  }

  return null
}

export function parseSingleQubitStateLabel(value) {
  const normalized = normalizeQuantumText(value).replace(/\s+/g, '')
  if (!normalized) return null

  let text = normalized
  let scale = 1

  const divisionMatch = text.match(/^(.*)\/(?:√2|sqrt2|sqrt\{2\})$/u)
  if (divisionMatch) {
    text = divisionMatch[1]
    scale = SQRT_HALF
  }

  text = stripOuterParens(text)

  const parsed = parseSingleTerm(text) || parseTwoTermExpression(text)
  if (!parsed) return null

  const state = normalizeState(
    multiplyByReal(parsed.alpha, scale),
    multiplyByReal(parsed.beta, scale),
  )

  return state
}

export function extractSingleQubitStateFromAmplitudes(amplitudes) {
  if (!amplitudes || typeof amplitudes !== 'object') return null

  const keys = Object.keys(amplitudes)
  if (keys.length === 0) return null
  if (keys.some(key => key !== '0' && key !== '1')) return null

  const alpha = amplitudes['0'] || complex(0, 0)
  const beta = amplitudes['1'] || complex(0, 0)

  return normalizeState(
    complex(Number(alpha.real || 0), Number(alpha.imag || 0)),
    complex(Number(beta.real || 0), Number(beta.imag || 0)),
  )
}

export function resolveSingleQubitBlochState({ amplitudes, fallbackState }) {
  return (
    extractSingleQubitStateFromAmplitudes(amplitudes) ||
    parseSingleQubitStateLabel(fallbackState)
  )
}

export function getBlochVector(state) {
  if (!state) return null

  const { alpha, beta } = state
  const x = 2 * (alpha.real * beta.real + alpha.imag * beta.imag)
  const y = 2 * (alpha.real * beta.imag - alpha.imag * beta.real)
  const z = magnitudeSquared(alpha) - magnitudeSquared(beta)

  return {
    x,
    y,
    z,
    theta: Math.acos(Math.max(-1, Math.min(1, z))),
    phi: Math.atan2(y, x),
  }
}
