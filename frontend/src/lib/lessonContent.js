import { escapeMdxText, normalizeQuantumText, quoteMdxProp } from './quantumText.js'

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (value === null || value === undefined || value === '') return []
  return [value]
}

function formatLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, match => match.toUpperCase())
    .replace(/\bVs\b/g, 'vs')
    .trim()
}

function renderParagraph(value) {
  if (value === null || value === undefined || typeof value === 'object') return ''
  const text = escapeMdxText(value)
  return text ? text : ''
}

function renderList(items) {
  const lines = asArray(items).map(item => {
    if (isFormulaCandidate(item)) {
       return `- <MathText value={${quoteMdxProp(item)}} />`
    }
    return `- ${escapeMdxText(item)}`
  })
  return lines.length > 0 ? lines.join('\n') : ''
}

function renderFormula(value, label) {
  const normalized = normalizeQuantumText(value)
  if (!normalized) return ''

  const labelProp = label ? ` label=${quoteMdxProp(label)}` : ''
  return `<Formula value=${quoteMdxProp(normalized)}${labelProp} />`
}

function renderCallout(title, body, tone = 'note') {
  const content = typeof body === 'string' ? body.trim() : ''
  if (!content) return ''

  const titleProp = title ? ` title=${quoteMdxProp(title)}` : ''
  return `<Callout${titleProp} tone=${quoteMdxProp(tone)}>

${content}

</Callout>`
}

function renderComparison(compare) {
  if (!compare || typeof compare !== 'object') return ''

  const classical = asArray(compare.classical).map(item => escapeMdxText(item).replaceAll('|', '\\|'))
  const quantum = asArray(compare.quantum).map(item => escapeMdxText(item).replaceAll('|', '\\|'))
  const rowCount = Math.max(classical.length, quantum.length)
  if (rowCount === 0) return ''

  const rows = Array.from({ length: rowCount }, (_, index) => {
    const left = classical[index] || ''
    const right = quantum[index] || ''
    return `| ${left} | ${right} |`
  })

  return [
    '| Classical bit | Quantum bit |',
    '| --- | --- |',
    ...rows,
  ].join('\n')
}

function isFormulaCandidate(value) {
  const text = normalizeQuantumText(value)
  if (!text) return false

  if (/[.!?]$/.test(text.trim())) return false

  // Prevent full english prose lines from being flagged strictly as formulas
  const words = text.split(/\s+/)
  const proseWords = words.filter(w => /^[a-zA-Z]{2,}[,.:;!?]?$/.test(w))
  if (proseWords.length >= 4) return false

  return (
    /[=αβγδψΦΨθφ√⟨⟩₀₁|^]/u.test(text) ||
    text.includes('→') ||
    text.includes('⊗') ||
    text.includes('[[') ||
    /^\s*O\(.*\)\s*$/.test(text)
  )
}

function renderNamedParagraphs(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''

  return Object.entries(value)
    .map(([key, item]) => {
      const text = renderParagraph(item)
      if (!text) return ''
      return `**${escapeMdxText(formatLabel(key))}:** ${text}`
    })
    .filter(Boolean)
    .join('\n\n')
}

function renderMath(math) {
  if (!math) return ''

  if (typeof math === 'string') {
    return renderFormula(math)
  }

  if (typeof math !== 'object') return ''

  return Object.entries(math)
    .map(([key, value]) => {
      if (!value) return ''

      return [
        `### ${formatLabel(key)}`,
        isFormulaCandidate(value)
          ? renderFormula(value, formatLabel(key))
          : renderParagraph(value),
      ]
        .filter(Boolean)
        .join('\n\n')
    })
    .filter(Boolean)
    .join('\n\n')
}

function renderOperations(operations) {
  if (!Array.isArray(operations) || operations.length === 0) return ''

  return `<GateSequence operations={${JSON.stringify(operations)}} />`
}

function renderOutcome(label, value, { allowFormula = true } = {}) {
  const normalized = normalizeQuantumText(value)
  if (!normalized) return ''

  if (allowFormula && isFormulaCandidate(normalized)) {
    return [`**${label}**`, renderFormula(normalized, label)].join('\n\n')
  }

  return `**${label}:** ${escapeMdxText(normalized)}`
}

function renderTheorySection(section) {
  if (!section) return ''

  const blocks = [`### ${escapeMdxText(section.title || 'Section')}`]
  const contentList = renderList(section.content)
  const exampleItems = asArray(section.examples)

  if (contentList) blocks.push(contentList)

  if (exampleItems.length > 0) {
    const renderedExamples = exampleItems
      .map(example => (isFormulaCandidate(example) ? renderFormula(example) : `- ${escapeMdxText(example)}`))
      .join('\n')

    blocks.push('**Examples**')
    blocks.push(renderedExamples)
  }

  if (section.intuition) {
    blocks.push(`**Intuition:** ${escapeMdxText(section.intuition)}`)
  }

  if (section.important_note) {
    blocks.push(renderCallout('Important Note', renderParagraph(section.important_note), 'warning'))
  }

  return blocks.filter(Boolean).join('\n\n')
}

function renderExample(example) {
  if (!example) return ''

  const blocks = [`### ${escapeMdxText(example.title || 'Example')}`]

  if (example.description) blocks.push(renderParagraph(example.description))
  if (example.explanation) blocks.push(renderParagraph(example.explanation))
  if (example.state) blocks.push(renderOutcome('State', example.state))
  if (example.steps?.length > 0) blocks.push(joinSource(['**Steps**', renderList(example.steps)]))

  const operations = renderOperations(example.circuit)
  if (operations) blocks.push(operations)

  if (example.result) blocks.push(renderOutcome('Result', example.result))
  if (example.note) blocks.push(renderOutcome('Note', example.note, { allowFormula: false }))
  if (example.insight) blocks.push(renderCallout('Insight', renderParagraph(example.insight), 'tip'))

  return blocks.filter(Boolean).join('\n\n')
}

function renderGate(gate) {
  if (!gate) return ''

  const blocks = [`### ${escapeMdxText(gate.name || gate.symbol || 'Gate')}`]

  if (gate.symbol) blocks.push(`**Symbol:** ${escapeMdxText(gate.symbol)}`)
  if (gate.description) blocks.push(renderParagraph(gate.description))
  if (gate.math) blocks.push(renderFormula(gate.math, `${gate.symbol || gate.name || 'Gate'} matrix`))
  if (gate.transformation) blocks.push(renderOutcome('Transformation', gate.transformation))
  if (gate.intuition) blocks.push(`**Intuition:** ${escapeMdxText(gate.intuition)}`)
  if (gate.bloch_effect) blocks.push(`**Bloch sphere effect:** ${escapeMdxText(gate.bloch_effect)}`)
  if (gate.example) blocks.push(renderOutcome('Example', gate.example))
  if (gate.deep_note) blocks.push(renderCallout('Deep Note', renderParagraph(gate.deep_note), 'tip'))

  if (gate.simulation) {
    const simulationBlocks = []

    if (gate.simulation.initial_state) {
      simulationBlocks.push(renderOutcome('Initial state', gate.simulation.initial_state))
    }

    const operations = renderOperations(gate.simulation.operations)
    if (operations) simulationBlocks.push(operations)

    if (gate.simulation.expected_result) {
      simulationBlocks.push(renderOutcome('Expected result', gate.simulation.expected_result))
    }

    if (simulationBlocks.length > 0) {
      blocks.push(joinSource(['**Simulation setup**', simulationBlocks.join('\n\n')]))
    }
  }

  return blocks.filter(Boolean).join('\n\n')
}

function renderLessonComparisons(comparisons) {
  if (!Array.isArray(comparisons) || comparisons.length === 0) return ''

  const header = [
    '| Gate | Effect | Changes probability | Changes phase | Bloch motion |',
    '| --- | --- | --- | --- | --- |',
  ]

  const rows = comparisons.map(item => {
    const gate = escapeMdxText(item.gate || '').replaceAll('|', '\\|')
    const effect = escapeMdxText(item.effect || '').replaceAll('|', '\\|')
    const probability = item.changes_probability ? 'Yes' : 'No'
    const phase = item.changes_phase ? 'Yes' : 'No'
    const blochMotion = escapeMdxText(item.bloch_motion || '').replaceAll('|', '\\|')
    return `| ${gate} | ${effect} | ${probability} | ${phase} | ${blochMotion} |`
  })

  return [...header, ...rows].join('\n')
}

function renderStepList(steps) {
  if (!Array.isArray(steps) || steps.length === 0) return ''
  return steps
    .map(step => {
      if (typeof step === 'string') return `- ${escapeMdxText(step)}`
      if (step.step !== undefined && step.description) {
        return `- **Step ${step.step}:** ${escapeMdxText(step.description)}`
      }
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

function renderAlgorithmStructure(structure) {
  if (!structure || typeof structure !== 'object') return ''
  const blocks = []

  if (structure.steps?.length > 0) {
    blocks.push(joinSource(['### Steps', renderStepList(structure.steps)]))
  }

  if (structure.components && typeof structure.components === 'object') {
    const componentBlocks = Object.entries(structure.components).map(([key, value]) => {
      if (!value || typeof value !== 'object') return ''
      const desc = value.description ? renderParagraph(value.description) : ''
      const extra = value.notation ? `\n\n**Notation:** ${escapeMdxText(value.notation)}` : ''
      const example = value.example_gates?.length > 0 ? `\n\n**Example gates:** ${value.example_gates.map(g => `\`${g}\``).join(', ')}` : ''
      const examples = value.examples?.length > 0 ? `\n\n${renderList(value.examples)}` : ''
      return `**${formatLabel(key)}:** ${desc}${extra}${example}${examples}`
    }).filter(Boolean)
    if (componentBlocks.length > 0) {
      blocks.push(joinSource(['### Components', componentBlocks.join('\n\n')]))
    }
  }

  if (structure.workflow?.length > 0) {
    blocks.push(joinSource(['### Workflow', renderStepList(structure.workflow)]))
  }

  if (structure.registers && typeof structure.registers === 'object') {
    blocks.push(joinSource(['### Registers', renderNamedParagraphs(structure.registers)]))
  }

  return blocks.filter(Boolean).join('\n\n')
}

function renderCircuitExamples(examples) {
  if (!Array.isArray(examples) || examples.length === 0) return ''
  return examples.map(ex => {
    if (!ex) return ''
    const blocks = [`### ${escapeMdxText(ex.name || 'Example')}`]
    if (ex.description) blocks.push(renderParagraph(ex.description))

    if (Array.isArray(ex.circuit) && ex.circuit.length > 0) {
      blocks.push(renderOperations(ex.circuit))
    }

    if (Array.isArray(ex.circuit_pattern) && ex.circuit_pattern.length > 0) {
      blocks.push(joinSource(['**Circuit pattern:**', renderList(ex.circuit_pattern)]))
    }

    if (ex.expected_result) blocks.push(`**Expected result:** ${escapeMdxText(ex.expected_result)}`)
    if (ex.unitary) blocks.push(`**Unitary:** ${escapeMdxText(ex.unitary)}`)
    if (ex.expected_output) blocks.push(`**Expected output:** ${escapeMdxText(ex.expected_output)}`)

    if (Array.isArray(ex.workflow_pattern) && ex.workflow_pattern.length > 0) {
      blocks.push(joinSource(['**Workflow pattern:**', renderList(ex.workflow_pattern)]))
    }

    if (Array.isArray(ex.probability_growth) && ex.probability_growth.length > 0) {
      const rows = ex.probability_growth.map(p =>
        `| ${p.iteration} | ${(p.probability_target * 100).toFixed(0)}% |`
      )
      blocks.push(['| Iteration | Target probability |', '| --- | --- |', ...rows].join('\n'))
    }

    if (ex.noise_model) {
      blocks.push(`**Noise type:** ${escapeMdxText(ex.noise_model.type || '')}, error probability: ${ex.noise_model.error_probability ?? ''}`)
    }

    return blocks.filter(Boolean).join('\n\n')
  }).filter(Boolean).join('\n\n')
}

function renderTypesOfNoise(types) {
  if (!types || typeof types !== 'object') return ''
  return Object.entries(types).map(([key, value]) => {
    if (!value || typeof value !== 'object') return ''
    const blocks = [`**${formatLabel(key)}:**`]
    if (value.description) blocks.push(escapeMdxText(value.description))
    if (value.effect) blocks.push(`*Effect:* ${escapeMdxText(value.effect)}`)
    if (value.analogy) blocks.push(`*Analogy:* ${escapeMdxText(value.analogy)}`)
    if (value.importance) blocks.push(`*Importance:* ${escapeMdxText(value.importance)}`)
    return blocks.join(' ')
  }).filter(Boolean).join('\n\n')
}

function renderBasicCodes(codes) {
  if (!codes || typeof codes !== 'object') return ''
  return Object.entries(codes).map(([key, value]) => {
    if (!value || typeof value !== 'object') return ''
    const blocks = [`### ${formatLabel(key)}`]
    if (value.encoding) blocks.push(renderOutcome('Encoding', value.encoding))
    if (value.purpose) blocks.push(`**Purpose:** ${escapeMdxText(value.purpose)}`)
    if (value.description) blocks.push(renderParagraph(value.description))
    if (value.qubits_required !== undefined) blocks.push(`**Qubits required:** ${value.qubits_required}`)
    if (value.importance) blocks.push(renderCallout('Key Point', renderParagraph(value.importance), 'tip'))
    if (Array.isArray(value.steps)) blocks.push(joinSource(['**Steps:**', renderList(value.steps)]))
    return blocks.filter(Boolean).join('\n\n')
  }).filter(Boolean).join('\n\n')
}

function joinSource(blocks) {
  return blocks
    .filter(Boolean)
    .map(block => block.trim())
    .filter(Boolean)
    .join('\n\n')
}

function resolveDirectSource(lesson) {
  const candidates = [
    lesson?.mdx,
    lesson?.content,
    lesson?.markdown,
    lesson?.theory?.mdx,
    lesson?.theory?.content,
    lesson?.theory?.body,
    lesson?.theory?.markdown,
  ]

  const direct = candidates.find(value => typeof value === 'string' && value.trim())
  return direct ? normalizeQuantumText(direct) : ''
}

export function buildLessonTheorySource(lesson) {
  const directSource = resolveDirectSource(lesson)
  if (directSource) return directSource

  const theory = lesson?.theory
  if (!theory) return ''

  const blocks = []

  if (theory.introduction) {
    blocks.push(renderParagraph(theory.introduction))
  }

  if (theory.start_from_zero) {
    blocks.push(joinSource(['## Start From Zero', renderParagraph(theory.start_from_zero)]))
  }

  if (theory.why_it_matters) {
    blocks.push(joinSource(['## Why It Matters', renderParagraph(theory.why_it_matters)]))
  }

  if (theory.core_idea) {
    blocks.push(joinSource(['## Core Idea', renderParagraph(theory.core_idea)]))
  }

  if (theory.classical_vs_quantum) {
    blocks.push(joinSource(['## Classical vs Quantum', renderComparison(theory.classical_vs_quantum)]))
  }

  if (theory.key_points?.length > 0) {
    blocks.push(joinSource(['## Key Ideas', renderList(theory.key_points)]))
  }

  if (theory.step_by_step_understanding?.length > 0) {
    blocks.push(joinSource(['## Step by Step', renderList(theory.step_by_step_understanding)]))
  }

  if (theory.math) {
    blocks.push(joinSource(['## Core Math', renderMath(theory.math)]))
  }

  if (theory.measurement) {
    const measurement = theory.measurement
    blocks.push(
      joinSource([
        '## Measurement',
        typeof measurement === 'string' ? renderParagraph(measurement) : '',
        renderParagraph(measurement.description),
        renderList(measurement.details),
        renderCallout('Important Note', renderParagraph(measurement.important_note), 'warning'),
      ]),
    )
  }

  if (theory.intuition) {
    blocks.push(
      joinSource([
        '## Intuition',
        typeof theory.intuition === 'string'
          ? renderParagraph(theory.intuition)
          : renderNamedParagraphs(theory.intuition),
      ]),
    )
  }

  if (theory.bloch_sphere) {
    const blochSphere = theory.bloch_sphere
    blocks.push(
      joinSource([
        '## Bloch Sphere Picture',
        typeof blochSphere === 'string' ? renderParagraph(blochSphere) : '',
        renderParagraph(blochSphere.description),
        renderList(blochSphere.details),
        renderCallout('Advanced Note', renderParagraph(blochSphere.advanced_note), 'tip'),
      ]),
    )
  }

  if (theory.bloch_sphere_connection) {
    const connection = theory.bloch_sphere_connection
    blocks.push(
      joinSource([
        '## Bloch Sphere Connection',
        renderParagraph(connection.description),
        connection.examples?.length > 0 ? joinSource(['**Examples**', renderList(connection.examples)]) : '',
        renderCallout('Why This Matters', renderParagraph(connection.importance), 'tip'),
      ]),
    )
  }

  if (theory.gates?.length > 0) {
    blocks.push(
      joinSource([
        '## Gate Guide',
        theory.gates.map(gate => renderGate(gate)).filter(Boolean).join('\n\n'),
      ]),
    )
  }

  if (theory.sections?.length > 0) {
    blocks.push(
      joinSource([
        '## Deep Dive',
        theory.sections.map(section => renderTheorySection(section)).filter(Boolean).join('\n\n'),
      ]),
    )
  }

  if (lesson?.comparisons?.length > 0) {
    blocks.push(joinSource(['## Quick Comparison', renderLessonComparisons(lesson.comparisons)]))
  }

  if (lesson?.examples?.length > 0) {
    blocks.push(
      joinSource([
        '## Worked Examples',
        lesson.examples.map(example => renderExample(example)).filter(Boolean).join('\n\n'),
      ]),
    )
  }

  if (lesson?.common_mistakes?.length > 0) {
    blocks.push(joinSource(['## Common Mistakes', renderList(lesson.common_mistakes)]))
  }

  if (theory.real_world_note) {
    blocks.push(renderCallout('Real-World Note', renderParagraph(theory.real_world_note), 'tip'))
  }

  // --- INTERMEDIATE-SPECIFIC FIELDS ---

  if (lesson?.algorithm_structure) {
    blocks.push(joinSource(['## Algorithm Structure', renderAlgorithmStructure(lesson.algorithm_structure)]))
  }

  if (lesson?.circuit_examples?.length > 0) {
    blocks.push(joinSource(['## Circuit Examples', renderCircuitExamples(lesson.circuit_examples)]))
  }

  if (theory?.types_of_noise) {
    blocks.push(joinSource(['## Types of Noise', renderTypesOfNoise(theory.types_of_noise)]))
  }

  if (theory?.mathematical_representation && typeof theory.mathematical_representation === 'object' && !Array.isArray(theory.mathematical_representation)) {
    blocks.push(joinSource(['## Mathematical Representation', renderMath(theory.mathematical_representation)]))
  }

  if (lesson?.basic_codes) {
    blocks.push(joinSource(['## Quantum Error Correction Codes', renderBasicCodes(lesson.basic_codes)]))
  }

  if (lesson?.syndrome_measurement) {
    const sm = lesson.syndrome_measurement
    const smText = typeof sm === 'string' ? sm : `${sm.description || ''}${sm.benefit ? `\n\n**Benefit:** ${sm.benefit}` : ''}`
    blocks.push(joinSource(['## Syndrome Measurement', smText]))
  }

  if (lesson?.logical_vs_physical) {
    blocks.push(joinSource(['## Logical vs Physical Qubits', renderNamedParagraphs(lesson.logical_vs_physical)]))
  }

  if (lesson?.visualization) {
    const viz = lesson.visualization
    if (typeof viz === 'object') {
      const vizText = Object.entries(viz).map(([key, val]) => {
        const v = typeof val === 'object' ? val.description || '' : String(val)
        return v ? `**${formatLabel(key)}:** ${escapeMdxText(v)}` : ''
      }).filter(Boolean).join('\n\n')
      if (vizText) blocks.push(joinSource(['## Visualization Notes', vizText]))
    }
  }

  if (lesson?.applications?.length > 0) {
    blocks.push(joinSource(['## Applications', renderList(lesson.applications)]))
  }

  if (lesson?.advantages?.length > 0) {
    blocks.push(joinSource(['## Advantages', renderList(lesson.advantages)]))
  }

  if (lesson?.limitations?.length > 0) {
    blocks.push(joinSource(['## Limitations', renderList(lesson.limitations)]))
  }

  if (lesson?.related_algorithms?.length > 0) {
    blocks.push(joinSource(['## Related Algorithms', renderList(lesson.related_algorithms)]))
  }

  if (lesson?.summary && typeof lesson.summary === 'string') {
    blocks.push(renderCallout('Lesson Summary', renderParagraph(lesson.summary), 'note'))
  }

  if (lesson?.simulation?.try_this) {
    blocks.push(
      joinSource([
        '## Try This Next',
        Array.isArray(lesson.simulation.try_this)
          ? renderList(lesson.simulation.try_this)
          : renderParagraph(lesson.simulation.try_this),
      ]),
    )
  }

  return joinSource(blocks)
}
