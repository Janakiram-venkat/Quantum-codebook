import { MDXProvider } from '@mdx-js/react'
import * as provider from '@mdx-js/react'
import { evaluate } from '@mdx-js/mdx'
import { startTransition, useEffect, useState } from 'react'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import * as runtime from 'react/jsx-runtime'
import MathText from './MathText'

const compiledContentCache = new Map()

function Formula({ value, label }) {
  return (
    <div className="lesson-formula-card">
      {label && <span className="lesson-formula-label">{label}</span>}
      <MathText value={value} block fallbackClassName="font-mono" />
    </div>
  )
}

function GateSequence({ operations = [] }) {
  if (!Array.isArray(operations) || operations.length === 0) return null

  return (
    <div className="lesson-operation-row">
      {operations.map((operation, index) => {
        const hasControl = operation.control !== undefined
        const label = hasControl
          ? `${operation.gate} q${operation.control} -> q${operation.target}`
          : `${operation.gate} q${operation.target}`

        return (
          <span key={`${label}-${index}`} className="lesson-operation-pill">
            {label}
          </span>
        )
      })}
    </div>
  )
}

function Callout({ title, tone = 'note', children }) {
  return (
    <div className="lesson-callout" data-tone={tone}>
      {title && <p className="lesson-callout-title">{title}</p>}
      <div className="lesson-callout-body">{children}</div>
    </div>
  )
}

function TableWrapper(props) {
  return (
    <div className="lesson-table-wrap">
      <table {...props} />
    </div>
  )
}

const mdxComponents = {
  Formula,
  GateSequence,
  Callout,
  table: TableWrapper,
  MathText,
}

export default function LessonContentRenderer({ source }) {
  const [compiledState, setCompiledState] = useState({
    key: '',
    Content: null,
    error: null,
  })
  const value = String(source ?? '').trim()
  const cachedContent = value ? compiledContentCache.get(value) : null

  useEffect(() => {
    let active = true
    if (!value || cachedContent) {
      return () => {
        active = false
      }
    }

    async function compileSource() {
      try {
        const module = await evaluate(
          {
            path: 'lesson-content.mdx',
            value,
          },
          {
            ...provider,
            ...runtime,
            baseUrl: import.meta.url,
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [rehypeKatex],
          },
        )

        if (!active) return

        compiledContentCache.set(value, module.default)
        startTransition(() => {
          setCompiledState({
            key: value,
            Content: module.default,
            error: null,
          })
        })
      } catch (compileError) {
        if (!active) return

        startTransition(() => {
          setCompiledState({
            key: value,
            Content: null,
            error: compileError instanceof Error ? compileError.message : 'Could not render lesson content.',
          })
        })
      }
    }

    compileSource()

    return () => {
      active = false
    }
  }, [cachedContent, value])

  const activeState =
    compiledState.key === value
      ? compiledState
      : {
          key: value,
          Content: null,
          error: null,
        }

  const Content = cachedContent || activeState.Content
  const error = activeState.error

  if (!value) return null

  if (error) {
    return (
      <div
        className="rounded-2xl px-4 py-3 text-sm"
        style={{
          background: 'var(--danger-soft)',
          border: '1px solid var(--danger-border)',
          color: 'var(--danger)',
        }}
      >
        {error}
      </div>
    )
  }

  if (!Content) {
    return (
      <div className="soft-panel px-4 py-3">
        <p className="text-sm" style={{ color: 'var(--text-muted)', margin: 0 }}>
          Rendering lesson notes...
        </p>
      </div>
    )
  }

  return (
    <div className="lesson-prose">
      <MDXProvider components={mdxComponents}>
        <Content />
      </MDXProvider>
    </div>
  )
}
