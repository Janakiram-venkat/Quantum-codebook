const TEXT_REPLACEMENTS = [
  ['ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢', "'"],
  ['ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ', '"'],
  ['ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â', '"'],
  ['ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â', '—'],
  ['ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢', '→'],
  ['ÃƒÂ¢Ã‹â€ Ã…Â¡', '√'],
  ['ÃƒÂ¢Ã…Â Ã¢â‚¬â€', '×'],
  ['ÃƒÂ¢Ã…Â¸Ã‚Â¨', '⟨'],
  ['ÃƒÂ¢Ã…Â¸Ã‚Â©', '⟩'],
  ['Ãƒâ€šÃ‚Â²', '²'],
  ['ÃƒÅ½Ã‚Â±', 'α'],
  ['ÃƒÅ½Ã‚Â²', 'β'],
  ['ÃƒÅ½Ã‚Â³', 'γ'],
  ['ÃƒÅ½Ã‚Â´', 'δ'],
  ['ÃƒÂÃ‹â€ ', 'ψ'],
  ['ÃƒÅ½Ã‚Â¦', 'Φ'],
  ['ÃƒÅ½Ã‚Â¨', 'Ψ'],
  ['â€™', '’'],
  ['â€œ', '“'],
  ['â€', '”'],
  ['â€”', '—'],
  ['â€“', '–'],
  ['â†’', '→'],
  ['âˆš', '√'],
  ['âŠ—', '⊗'],
  ['âŸ¨', '⟨'],
  ['âŸ©', '⟩'],
  ['â‚€', '₀'],
  ['â‚', '₁'],
  ['Â²', '²'],
  ['Î±', 'α'],
  ['Î²', 'β'],
  ['Î³', 'γ'],
  ['Î´', 'δ'],
  ['Ïˆ', 'ψ'],
  ['Î¦', 'Φ'],
  ['Î¨', 'Ψ'],
  ['âˆ’', '−'],
  ['Ã—', '×'],
  ['Â·', '·'],
  ['Â', ''],
]

const QUANTUM_SYMBOL_PATTERN = /(?:\|\s*[^|>⟩]+\s*[>⟩]|[=αβγδψΦΨθφ√⟨⟩₀₁⊗→]|\[\[|O\()/u
const FORMULA_START_PATTERN = /(?:\(\s*\|)|(?:\|\s*[^|>⟩]+\s*[>⟩])|[αβγδψΦΨθφ√⟨]|\[\[|O\(/u
const PROSE_WORD_PATTERN = /\b[A-Za-z]{2,}(?:-[A-Za-z0-9]+)?\b/g
const INLINE_FORMULA_PREFIX_PATTERN =
  /\b(?:is|are|in|as|equals|becomes|gives|yields|written as|represented by|described by|starts in|start with)\s*$/i

export function normalizeQuantumText(value) {
  let text = String(value ?? '')

  TEXT_REPLACEMENTS.forEach(([from, to]) => {
    text = text.split(from).join(to)
  })

  return text.trim()
}

export function containsQuantumNotation(value) {
  const text = normalizeQuantumText(value)
  return QUANTUM_SYMBOL_PATTERN.test(text)
}

export function countProseWords(value) {
  const text = normalizeQuantumText(value)
  return text.match(PROSE_WORD_PATTERN)?.length ?? 0
}

export function isQuantumFormulaLike(value) {
  const text = normalizeQuantumText(value)
  if (!text || !containsQuantumNotation(text)) return false
  if (/[.!?]$/.test(text)) return false

  const formulaStartIndex = text.search(FORMULA_START_PATTERN)
  if (formulaStartIndex > 0) {
    const leadingText = text.slice(0, formulaStartIndex).trim()
    if (countProseWords(leadingText) >= 2) return false
  }

  return countProseWords(text) <= 4
}

export function splitLeadingTextFromFormula(value) {
  const text = normalizeQuantumText(value)
  if (!text || !containsQuantumNotation(text)) return null

  const formulaStartIndex = text.search(FORMULA_START_PATTERN)
  if (formulaStartIndex <= 0) return null

  const prefix = text.slice(0, formulaStartIndex).trimEnd()
  const formula = text.slice(formulaStartIndex).trim()

  if (!INLINE_FORMULA_PREFIX_PATTERN.test(prefix)) return null
  if (!isQuantumFormulaLike(formula)) return null

  return { prefix, formula }
}

export function escapeMdxText(value) {
  return normalizeQuantumText(value)
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;')
}

export function quoteMdxProp(value) {
  return JSON.stringify(normalizeQuantumText(value))
}
