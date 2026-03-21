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

export function normalizeQuantumText(value) {
  let text = String(value ?? '')

  TEXT_REPLACEMENTS.forEach(([from, to]) => {
    text = text.split(from).join(to)
  })

  return text.trim()
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
