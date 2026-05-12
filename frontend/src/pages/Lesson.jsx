import { createElement, useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Loader2, AlertCircle, BookOpen, Cpu, HelpCircle, Atom, ArrowRight } from 'lucide-react'
import TheorySection from '../components/TheorySection'
import SimulationSection from '../components/SimulationSection'
import QuizSection from '../components/QuizSection'
import { resolveHeaderState } from '../components/Header'

function SectionIntro({ icon, label, title, subtitle, accentColor }) {
  const color = accentColor || 'var(--accent)'
  return (
    <header style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: 10,
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {createElement(icon, { size: 18, color })}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 5px',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color,
            fontFamily: 'var(--font-display)',
          }}>{label}</p>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(1.2rem, 2.2vw, 1.6rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}>{title}</h2>
          {subtitle && (
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div style={{ height: 1, background: 'var(--rule)', marginTop: 16 }} />
    </header>
  )
}

export default function Lesson() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const headerState = resolveHeaderState(location.pathname)

  useEffect(() => {
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
  const simulationTitle = data?.simulation?.section_title ||
    (data?.simulation?.type === 'state_visualization' ? 'State Visualizer' : 'Quantum Simulator')
  const simulationSubtitle = data?.simulation?.section_subtitle ||
    (data?.simulation?.type === 'state_visualization'
      ? 'Interact with predefined states to observe their properties and components.'
      : 'Run the interactive circuit to inspect amplitudes or measurement results.')

  return (
    <article style={{ padding: 'clamp(16px, 2vw, 28px) 0 clamp(32px, 4vw, 56px)' }}>

      {loading && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, padding: '80px 20px',
          color: 'var(--text-muted)',
        }}>
          <Loader2 size={20} style={{ animation: 'quantum-spin 1s linear infinite' }} />
          <span style={{ fontSize: 14, letterSpacing: '0.05em', fontFamily: 'var(--font-display)' }}>
            Loading lesson...
          </span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: 16, borderRadius: 12, marginTop: 32,
          background: 'var(--danger-soft)',
          border: '1px solid var(--danger-border)',
          color: 'var(--danger)',
        }}>
          <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      {data && (
        <>
          {/* Page header */}
          <div className="page-header-card" style={{ marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              marginBottom: 14,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'var(--accent)',
              fontFamily: 'var(--font-display)',
              padding: '3px 10px',
              background: 'var(--neon-cyan-dim)',
              border: '1px solid rgba(56,189,248,0.18)',
              borderRadius: 999,
            }}>
              <Atom size={10} />
              {isResearch ? 'Research Track' : 'Quantum Lesson'}
            </div>
            <h1 style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: 14,
            }}>
              {data.title}
            </h1>
            <p style={{
              fontSize: 'clamp(14px, 1.4vw, 16px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              maxWidth: '72ch',
              margin: 0,
            }}>
              {lessonSummary}
            </p>
          </div>

          {/* Theory */}
          <section className="section-shell" style={{ marginBottom: 20 }}>
            <SectionIntro
              icon={BookOpen}
              label="Lesson Content"
              title="Theory and Intuition"
              accentColor="var(--neon-cyan)"
            />
            <TheorySection lesson={data} />
          </section>

          {/* Simulation */}
          {hasSimulation && (
            <section className="section-shell" style={{ marginBottom: 20 }}>
              <SectionIntro
                icon={Cpu}
                label="Interactive Lab"
                title={simulationTitle}
                subtitle={simulationSubtitle}
                accentColor="var(--neon-blue)"
              />
              <SimulationSection topic={id} simulation={data.simulation} theory={data.theory} />
            </section>
          )}

          {/* Quiz */}
          {hasQuiz && (
            <section className="section-shell" style={{ marginBottom: 20 }}>
              <SectionIntro
                icon={HelpCircle}
                label="Knowledge Check"
                title="Quiz and Recap"
                subtitle="Answer the questions below to confirm you understand the lesson before moving on."
                accentColor="var(--neon-purple)"
              />
              <QuizSection quiz={data.quiz} />
            </section>
          )}

          {/* Open questions (research) */}
          {hasOpenQuestions && (
            <section className="section-shell" style={{ marginBottom: 20 }}>
              <SectionIntro
                icon={HelpCircle}
                label="Thought Experiment"
                title="Open Questions"
                subtitle="Contemplate these unanswered questions and active research directions."
                accentColor="#34d399"
              />
              <div style={{
                background: 'var(--surface-soft)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '16px 20px',
                marginTop: 4,
              }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.open_questions.map((questionItem, idx) => (
                    <li key={idx} style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7,
                    }}>
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-mono)',
                        color: '#34d399', fontWeight: 600, marginTop: 5, flexShrink: 0,
                      }}>{String(idx + 1).padStart(2, '0')}</span>
                      <div>
                        {typeof questionItem === 'string' ? questionItem : (
                          <>
                            <strong>{questionItem.question}</strong>
                            {questionItem.importance && <div style={{ fontSize: 13, opacity: 0.8 }}>{questionItem.importance}</div>}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Next Lesson Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 40,
            paddingTop: 24,
            borderTop: '1px solid var(--rule)'
          }}>
            <button 
              onClick={() => navigate(headerState.nextPath)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                fontSize: 16, fontWeight: 700,
                color: 'var(--bg-primary)',
                background: 'var(--accent)',
                border: 'none',
                padding: '14px 28px',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--glow-cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.9 }}>Next</span>
                <span>{headerState.nextLabel}</span>
              </div>
              <ArrowRight size={20} />
            </button>
          </div>

          <div style={{ paddingBottom: 48 }} />
        </>
      )}
    </article>
  )
}
