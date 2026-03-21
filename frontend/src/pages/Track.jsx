import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { BookOpen, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

const levelMeta = {
  begainner: {
    label: 'Beginner',
    color: 'var(--accent)',
    bg: 'var(--accent-dim)',
    border: 'var(--accent-border-soft)',
  },
  intermidiate: {
    label: 'Intermediate',
    color: 'var(--accent)',
    bg: 'var(--accent-dim)',
    border: 'var(--accent-border-soft)',
  },
}

function resolveLessonMeta(lesson) {
  if (typeof lesson === 'string') {
    return {
      slug: lesson,
      title: lesson,
    }
  }

  return {
    slug: lesson?.slug || lesson?.id || '',
    title: lesson?.title || lesson?.slug || lesson?.id || 'Lesson',
  }
}

export default function Track() {
  const { level } = useParams()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const meta = levelMeta[level] || {
    label: level,
    color: 'var(--accent)',
    bg: 'var(--accent-dim)',
    border: 'var(--accent-border-soft)',
  }

  const beginnerTopics = [
    { id: 'QubitsAndStates', label: 'Qubits and States' },
    { id: 'singleGates', label: 'Single Gates' },
    { id: 'Mesurement', label: 'Measurement' },
    { id: 'superposition', label: 'Superposition' },
    { id: 'entanglement', label: 'Entanglement' },
  ]

  const intermediateTopics = [
    { id: 'multi_qubit_system', label: 'Multi Qubit System' },
    { id: 'qft', label: 'Quantum Fourier Transform' },
    { id: 'grovers_algorithm', label: "Grover's Algorithm" },
    { id: 'vqe', label: 'Variational Quantum Eigen Solver' },
    { id: 'noise_model', label: 'Noise Model' },
    { id: 'quantum_error_corection', label: 'Quantum Error Correction' },
  ]

  const lessonOrder = level === 'intermidiate' ? intermediateTopics : beginnerTopics

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    axios
      .get(`/api/lessons?level=${encodeURIComponent(level)}`)
      .then(res => {
        const responseLessons = res.data.lessons || []
        // Ensure track order is controlled
        const sorted = lessonOrder
          .map(item => responseLessons.find(l => l.slug === item.id || l.id === item.id))
          .filter(Boolean)
        setLessons(sorted)
      })
      .catch(() => setError('Could not load lessons. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [level])

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      <header className="page-header-card" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
          >
          <BookOpen size={20} color={meta.color} />
        </div>
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 6 }}>Learning Path</p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {meta.label} Track
            </h1>
          </div>
        </div>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Choose a lesson to begin and move through theory, simulator, and quiz in one flow.
        </p>
      </header>

      {loading && (
        <div className="flex items-center gap-3 py-10 justify-center" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={18} className="animate-spin" />
          Loading lessons...
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{
            background: 'var(--danger-soft)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
          }}
        >
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <ul className="space-y-3">
          {lessons.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No lessons found.
            </p>
          )}
          {lessons.map((lesson, i) => {
            const { slug, title } = resolveLessonMeta(lesson)

            return (
              <li key={slug}>
                <Link
                  to={`/lesson/${slug}`}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--card-shadow)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${meta.color}55`
                    e.currentTarget.style.background = meta.bg
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--bg-card)'
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {meta.label} - Interactive Simulation
                    </p>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
