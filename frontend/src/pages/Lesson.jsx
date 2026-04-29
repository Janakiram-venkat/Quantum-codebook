import { createElement, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Loader2, AlertCircle, BookOpen, Cpu, HelpCircle } from 'lucide-react'
import TheorySection from '../components/TheorySection'
import SimulationSection from '../components/SimulationSection'
import QuizSection from '../components/QuizSection'

function SectionIntro({ icon, label, title, subtitle }) {
  return (
          <header className="section-header" style={{ marginBottom: 24 }}>
            <div className="section-heading">
              <p className="section-eyebrow">{label}</p>
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                >
                  {createElement(icon, { size: 18, color: 'var(--accent-strong)' })}
                </div>
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>
      </div>
    </header>
  )
}

export default function Lesson() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    setData(null)
    axios
      .get(`/api/lessons/${id}`)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load lesson. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [id])

  const isResearch = data?.level === 'research'
  const hasSimulation = Boolean(data?.simulation) && !isResearch
  const hasQuiz = data?.quiz?.length > 0 && !isResearch
  const hasOpenQuestions = data?.open_questions?.length > 0 && isResearch
  const lessonSummary =
    data?.theory?.introduction ||
    data?.theory?.why_it_matters ||
    data?.summary ||
    'Read the lesson, inspect the circuit, and review the core ideas step by step.'
  const simulationTitle =
    data?.simulation?.section_title ||
    (data?.simulation?.type === 'state_visualization' ? 'State Visualizer' : 'Quantum simulator')
  const simulationSubtitle =
    data?.simulation?.section_subtitle ||
    (data?.simulation?.type === 'state_visualization'
      ? 'Interact with the predefined states to observe their properties and components instantly.'
      : 'Run the interactive circuit to inspect amplitudes or measurement results.')

  return (
    <article className="px-2 py-6 md:px-4 md:py-10">
      {loading && (
        <div className="flex items-center gap-3 py-20 justify-center" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="animate-spin" />
          Loading lesson...
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl mt-8"
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

      {data && (
        <>
          <header className="page-header-card" style={{ marginBottom: 32 }}>
            <h1
              className="text-[30px] md:text-[34px] font-bold mb-4"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.15 }}
            >
              {data.title}
            </h1>
            <p
              className="text-base md:text-lg max-w-3xl"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}
            >
              {lessonSummary}
            </p>
          </header>

          <section className="section-shell" aria-labelledby="theory-heading" style={{ marginBottom: 24 }}>
            <SectionIntro
              icon={BookOpen}
              label="Lesson Content"
              title="Theory and intuition"
            />
            <div id="theory-heading">
              <TheorySection lesson={data} />
            </div>
          </section>

          {hasSimulation && (
            <section className="section-shell" aria-labelledby="simulation-heading" style={{ marginBottom: 24 }}>
              <SectionIntro
                icon={Cpu}
                label="Interactive Lab"
                title={simulationTitle}
                subtitle={simulationSubtitle}
              />
              <div id="simulation-heading">
                <SimulationSection topic={id} simulation={data.simulation} theory={data.theory} />
              </div>
            </section>
          )}

          {hasQuiz && (
            <section className="section-shell" aria-labelledby="quiz-heading">
              <SectionIntro
                icon={HelpCircle}
                label="Knowledge Check"
                title="Quiz and recap"
                subtitle="Answer the questions below to confirm you understand the lesson before moving on."
              />
              <div id="quiz-heading">
                <QuizSection quiz={data.quiz} />
              </div>
            </section>
          )}

          {hasOpenQuestions && (
            <section className="section-shell" aria-labelledby="questions-heading">
              <SectionIntro
                icon={HelpCircle}
                label="Thought Experiment"
                title="Open Questions"
                subtitle="Contemplate these unanswered questions and active research directions."
              />
              <div id="questions-heading" className="soft-panel p-5 mt-4">
                <ul className="space-y-3 pl-4">
                  {data.open_questions.map((question, idx) => (
                    <li key={idx} className="list-disc text-base text-gray-300 leading-relaxed font-medium">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <div className="py-10" />
        </>
      )}
    </article>
  )
}
