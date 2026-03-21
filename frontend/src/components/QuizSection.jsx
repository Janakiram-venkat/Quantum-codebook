import { useState } from 'react'
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react'
import { normalizeQuantumText } from '../lib/quantumText.js'

function optionStyle({ isSelected, isSubmitted, isCorrectOpt, isWrongOpt }) {
  if (isCorrectOpt && isSubmitted) {
    return {
      background: 'var(--success-soft)',
      border: '1px solid var(--success-border)',
      color: 'var(--success)',
    }
  }

  if (isWrongOpt) {
    return {
      background: 'var(--danger-soft)',
      border: '1px solid var(--danger-border)',
      color: 'var(--danger)',
    }
  }

  if (isSelected && !isSubmitted) {
    return {
      background: 'var(--surface-soft)',
      border: '1px solid var(--border-hover)',
      color: 'var(--text-primary)',
    }
  }

  return {
    background: 'var(--surface-soft)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
  }
}

export default function QuizSection({ quiz }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  if (!quiz || quiz.length === 0) return null

  function pickAnswer(qi, option) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [qi]: option }))
  }

  function submit() {
    const correct = quiz.filter((q, i) => answers[i] === q.answer).length
    setScore(correct)
    setSubmitted(true)
  }

  function reset() {
    setAnswers({})
    setSubmitted(false)
    setScore(null)
  }

  const total = quiz.length
  const allAnswered = Object.keys(answers).length === total
  const perfect = score === total

  function renderQuizText(value) {
    return normalizeQuantumText(value)
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="section-heading">
          <p className="section-eyebrow">Review</p>
          <h3 className="section-title">Answer the quiz</h3>
          <p className="section-subtitle">
            Answer each question and submit when you are ready.
          </p>
        </div>

        {submitted && (
          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm px-3.5 py-2 rounded-xl transition-all"
            style={{
              background: 'var(--surface-soft)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            Retry quiz
          </button>
        )}
      </div>

      {submitted && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{
            background: perfect ? 'var(--success-soft)' : 'var(--warning-soft)',
            border: `1px solid ${perfect ? 'var(--success-border)' : 'var(--warning-border)'}`,
          }}
        >
          {perfect ? <Trophy size={18} color="var(--success)" /> : <XCircle size={18} color="var(--warning)" />}
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {score}/{total} correct{perfect ? ' perfect score' : ''}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {perfect
                ? 'You have a solid understanding of this lesson.'
                : `Review the missed question${total - score > 1 ? 's' : ''} and try again when ready.`}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {quiz.map((q, qi) => {
          const selected = answers[qi]
          const isCorrect = submitted && selected === q.answer
          const isWrong = submitted && selected !== undefined && selected !== q.answer

          return (
            <section
              key={qi}
              className={qi > 0 ? 'pt-6' : ''}
              style={qi > 0 ? { borderTop: '1px solid var(--rule)' } : undefined}
            >
              <div className="mb-4">
                <p
                  className="text-[11px] font-semibold uppercase mb-2"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.16em' }}
                >
                  Question {qi + 1}
                </p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1.75 }}>
                  {renderQuizText(q.question)}
                </p>
                {submitted && (
                  <p className="text-sm mt-2" style={{ color: isCorrect ? 'var(--success)' : isWrong ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {isCorrect && 'Correct answer selected.'}
                    {isWrong && (
                      <>
                        Correct answer:{' '}
                        {renderQuizText(q.answer)}
                      </>
                    )}
                    {!isCorrect && !isWrong && 'Question not answered.'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {q.options.map(opt => {
                  const isSelected = selected === opt
                  const isCorrectOpt = submitted && opt === q.answer
                  const isWrongOpt = submitted && isSelected && !isCorrectOpt

                  return (
                    <button
                      key={opt}
                      onClick={() => pickAnswer(qi, opt)}
                      className="text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 w-full flex items-center gap-2.5"
                      style={{
                        ...optionStyle({ isSelected, isSubmitted: submitted, isCorrectOpt, isWrongOpt }),
                        cursor: submitted ? 'default' : 'pointer',
                        lineHeight: 1.7,
                      }}
                    >
                      {submitted && isCorrectOpt && <CheckCircle size={14} color="var(--success)" className="flex-shrink-0" />}
                      {submitted && isWrongOpt && <XCircle size={14} color="var(--danger)" className="flex-shrink-0" />}
                      <span style={{ flex: 1 }}>
                        {renderQuizText(opt)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {!submitted && (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: allAnswered ? 'var(--accent)' : 'var(--surface-soft)',
            border: `1px solid ${allAnswered ? 'var(--accent)' : 'var(--border)'}`,
            color: allAnswered ? 'var(--text-inverse)' : 'var(--text-muted)',
            cursor: allAnswered ? 'pointer' : 'not-allowed',
          }}
        >
          {allAnswered ? 'Submit answers' : `Answer all ${total} questions to submit`}
        </button>
      )}
    </div>
  )
}
