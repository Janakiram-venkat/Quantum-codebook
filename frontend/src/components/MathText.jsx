import { BlockMath, InlineMath } from 'react-katex'

import 'katex/dist/katex.min.css'
import { normalizeQuantumText } from '../lib/quantumText.js'

const KATEX_MACROS = {
  '\\ket': '\\left|#1\\right\\rangle',
  '\\bra': '\\left\\langle#1\\right|',
}

const LATEX_REPLACEMENTS = [
  ['→', '\\to'],
  ['â†’', '\\to'],
  ['√', '\\sqrt'],
  ['âˆš', '\\sqrt'],
  ['⊗', '\\otimes'],
  ['âŠ—', '\\otimes'],
  ['⟨', '\\langle'],
  ['âŸ¨', '\\langle'],
  ['⟩', '\\rangle'],
  ['âŸ©', '\\rangle'],
  ['â‚€', '_0'],
  ['â‚', '_1'],
  ['²', '^2'],
  ['Â²', '^2'],
  ['α', '\\alpha'],
  ['Î±', '\\alpha'],
  ['β', '\\beta'],
  ['Î²', '\\beta'],
  ['γ', '\\gamma'],
  ['Î³', '\\gamma'],
  ['δ', '\\delta'],
  ['Î´', '\\delta'],
  ['ψ', '\\psi'],
  ['Ïˆ', '\\psi'],
  ['Φ', '\\Phi'],
  ['Î¦', '\\Phi'],
  ['Ψ', '\\Psi'],
  ['Î¨', '\\Psi'],
  ['π', '\\pi'],
  ['Σ', '\\sum'],
  ['±', '\\pm'],
  ['≠', '\\neq'],
  ['†', '\\dagger'],
  ['−', '-'],
  ['âˆ’', '-'],
  ['×', '\\times'],
  ['Ã—', '\\times'],
  ['·', '\\cdot'],
  ['Â·', '\\cdot'],
]

function normalizeToLatex(value) {
  let text = normalizeQuantumText(value)
  if (!text) return ''

  LATEX_REPLACEMENTS.forEach(([from, to]) => {
    text = text.split(from).join(to)
  })

  // Matrices: convert [[a,b], [c,d]] into \begin{bmatrix} ... \end{bmatrix}
  text = text.replace(/\[\s*\[(.*?)\]\s*\]/g, (match, inner) => {
    const rows = inner.split(/\s*\]\s*,\s*\[\s*/)
    const latexRows = rows.map(row => row.split(/\s*,\s*/).join(' & '))
    return `\\begin{bmatrix} ${latexRows.join(' \\\\ ')} \\end{bmatrix}`
  })

  // Fractions: convert (A + B) / C into \frac{A}{C}
  text = text.replace(/\(([^)]+)\)\s*\/\s*([^\s+=\-]+)/g, '\\frac{$1}{$2}')

  text = text.replace(/\|([^|]+?)\\rangle/g, '\\ket{$1}')
  text = text.replace(/\\langle([^|]+?)\|/g, '\\bra{$1}')
  text = text.replace(/\\Phi([+-])/g, '\\Phi^{$1}')
  text = text.replace(/\\Psi([+-])/g, '\\Psi^{$1}')
  text = text.replace(/\\sqrt2/g, '\\sqrt{2}')
  text = text.replace(/\\sqrt([A-Za-z0-9]+)/g, '\\sqrt{$1}')
  text = text.replace(/\\to\s+([A-Za-z][A-Za-z\s-]*)$/g, (_, label) => `\\to \\text{${label.trim()}}`)
  text = text.replace(/\s+\/\s+/g, ' / ')

  return text
}

export default function MathText({
  value,
  block = false,
  className = '',
  style,
  fallbackClassName = '',
}) {
  const latex = normalizeToLatex(value)
  if (!latex) return null

  const fallback = (
    <span className={fallbackClassName} style={style}>
      {normalizeQuantumText(value)}
    </span>
  )

  if (block) {
    return (
      <div className={className} style={style}>
        <BlockMath math={latex} macros={KATEX_MACROS} renderError={() => fallback} />
      </div>
    )
  }

  return (
    <span className={className} style={style}>
      <InlineMath math={latex} macros={KATEX_MACROS} renderError={() => fallback} />
    </span>
  )
}
