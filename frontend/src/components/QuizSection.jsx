import { CheckCircle, Circle, RotateCcw, Trophy, XCircle } from 'lucide-react'
import { useState } from 'react'
import {
  isQuantumFormulaLike,
  normalizeQuantumText,
  splitLeadingTextFromFormula,
} from '../lib/quantumText.js'
import MathText from './MathText'

function renderOptionLetter(index) {
  return String.fromCharCode(65 + index)
}

function optionVisualState({ isSelected, isSubmitted, isCorrectOption, isWrongSelection }) {
  if (isCorrectOption && isSubmitted) {
    return {
      background: 'var(--success-soft)',
      border: '2px solid var(--success)',
      color: 'var(--success)',
      badgeBackground: 'rgba(var(--success-rgb), 0.16)',
      badgeBorder: 'var(--success)',
      badgeColor: 'var(--success)',
      label: 'Correct answer',
    }
  }

  if (isWrongSelection) {
    return {
      background: 'var(--danger-soft)',
      border: '2px solid var(--danger)',
      color: 'var(--danger)',
      badgeBackground: 'rgba(var(--danger-rgb), 0.14)',
      badgeBorder: 'var(--danger)',
      badgeColor: 'var(--danger)',
      label: 'Your selection',
    }
  }

  if (isSelected && !isSubmitted) {
    return {
      background: 'rgba(var(--accent-rgb), 0.1)',
      border: '2px solid var(--accent)',
      color: 'var(--accent-strong)',
      badgeBackground: 'rgba(var(--accent-rgb), 0.14)',
      badgeBorder: 'var(--accent)',
      badgeColor: 'var(--accent-strong)',
      label: '',
    }
  }

  return {
    background: 'var(--surface-soft)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    badgeBackground: 'var(--surface-muted)',
    badgeBorder: 'var(--border)',
    badgeColor: 'var(--text-muted)',
    label: '',
  }
}

export default function QuizSection({ quiz }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  if (!quiz || quiz.length === 0) return null

  function pickAnswer(questionIndex, option) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionIndex]: option }))
  }

  function submit() {
    const correct = quiz.filter((question, index) => answers[index] === question.answer).length
    setScore(correct)
    setSubmitted(true)
  }

  function reset() {
    setAnswers({})
    setSubmitted(false)
    setScore(null)
  }

  function renderQuizText(value) {
    const normalizedValue = normalizeQuantumText(value)
    const inlineFormula = splitLeadingTextFromFormula(normalizedValue)

    if (inlineFormula) {
      return (
        <>
          {inlineFormula.prefix}{' '}
          <MathText value={inlineFormula.formula} />
        </>
      )
    }

    if (isQuantumFormulaLike(normalizedValue)) {
      return <MathText value={normalizedValue} />
    }

    return normalizedValue
  }

  const total = quiz.length
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === total
  const perfect = score === total

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="section-heading">
          <p className="section-eyebrow">Review</p>
          <h3 className="section-title">Answer the quiz</h3>
          <p className="section-subtitle">
            Each question uses one clear answer card so the selected choice, correctness, and explanation are easy to scan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="soft-badge">
            {submitted ? `${score}/${total} correct` : `${answeredCount}/${total} answered`}
          </span>
          {submitted && (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 text-base px-4 py-2.5 rounded-xl transition-all"
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
                ? 'You have a strong grasp of this lesson.'
                : `Review the explanations below, then retry when you want another pass.`}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {quiz.map((question, questionIndex) => {
          const selectedAnswer = answers[questionIndex]
          const answered = selectedAnswer !== undefined
          const correct = submitted && selectedAnswer === question.answer
          const incorrect = submitted && answered && selectedAnswer !== question.answer

          return (
            <span
              key={questionIndex}
              style={{
                borderRadius: 999,
                padding: '7px 11px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: submitted
                  ? correct
                    ? 'var(--success-soft)'
                    : incorrect
                      ? 'var(--danger-soft)'
                      : 'var(--surface-muted)'
                  : answered
                    ? 'rgba(var(--accent-rgb), 0.08)'
                    : 'var(--surface-muted)',
                color: submitted
                  ? correct
                    ? 'var(--success)'
                    : incorrect
                      ? 'var(--danger)'
                      : 'var(--text-muted)'
                  : answered
                    ? 'var(--accent-strong)'
                    : 'var(--text-muted)',
                border: `1px solid ${
                  submitted
                    ? correct
                      ? 'var(--success-border)'
                      : incorrect
                        ? 'var(--danger-border)'
                        : 'var(--border)'
                    : answered
                      ? 'rgba(var(--accent-rgb), 0.2)'
                      : 'var(--border)'
                }`,
              }}
            >
              Q{questionIndex + 1}
            </span>
          )
        })}
      </div>

      <div className="space-y-5">
        {quiz.map((question, questionIndex) => {
          const selectedAnswer = answers[questionIndex]
          const answered = selectedAnswer !== undefined
          const isCorrectSelection = submitted && selectedAnswer === question.answer
          const isWrongSelection = submitted && answered && selectedAnswer !== question.answer

          return (
            <section
              key={questionIndex}
              className="soft-panel p-4 md:p-5"
              style={{
                borderColor: answered && !submitted ? 'rgba(var(--accent-rgb), 0.18)' : 'var(--border)',
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div style={{ maxWidth: 760 }}>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      style={{
                        borderRadius: 999,
                        padding: '5px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        background: 'var(--surface-muted)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      Question {questionIndex + 1}
                    </span>
                    <span
                      style={{
                        borderRadius: 999,
                        padding: '5px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        background: submitted
                          ? isCorrectSelection
                            ? 'var(--success-soft)'
                            : isWrongSelection
                              ? 'var(--danger-soft)'
                              : 'var(--surface-muted)'
                          : answered
                            ? 'rgba(var(--accent-rgb), 0.08)'
                            : 'var(--surface-muted)',
                        color: submitted
                          ? isCorrectSelection
                            ? 'var(--success)'
                            : isWrongSelection
                              ? 'var(--danger)'
                              : 'var(--text-muted)'
                          : answered
                            ? 'var(--accent-strong)'
                            : 'var(--text-muted)',
                        border: `1px solid ${
                          submitted
                            ? isCorrectSelection
                              ? 'var(--success-border)'
                              : isWrongSelection
                                ? 'var(--danger-border)'
                                : 'var(--border)'
                            : answered
                              ? 'rgba(var(--accent-rgb), 0.2)'
                              : 'var(--border)'
                        }`,
                      }}
                    >
                      {submitted
                        ? isCorrectSelection
                          ? 'Correct'
                          : isWrongSelection
                            ? 'Incorrect'
                            : 'Skipped'
                        : answered
                          ? 'Answered'
                          : 'Waiting'}
                    </span>
                  </div>

                  <p className="text-[17px] font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
                    {renderQuizText(question.question)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selectedAnswer === option
                  const isCorrectOption = submitted && option === question.answer
                  const isWrongOption = submitted && isSelected && !isCorrectOption
                  const visualState = optionVisualState({
                    isSelected,
                    isSubmitted: submitted,
                    isCorrectOption,
                    isWrongSelection: isWrongOption,
                  })

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => pickAnswer(questionIndex, option)}
                      disabled={submitted}
                      className="w-full text-left transition-all duration-150"
                      style={{
                        borderRadius: 18,
                        padding: '14px 16px',
                        background: visualState.background,
                        border: visualState.border,
                        color: visualState.color,
                        cursor: submitted ? 'default' : 'pointer',
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          style={{
                            width: 34,
                            height: 34,
                            minWidth: 34,
                            borderRadius: 999,
                            border: `1px solid ${visualState.badgeBorder}`,
                            background: visualState.badgeBackground,
                            color: visualState.badgeColor,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 13,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {renderOptionLetter(optionIndex)}
                        </span>

                        <div style={{ flex: 1 }}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
                              {renderQuizText(option)}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                              {submitted && isCorrectOption && <CheckCircle size={16} color="var(--success)" />}
                              {submitted && isWrongOption && <XCircle size={16} color="var(--danger)" />}
                              {!submitted && (
                                isSelected
                                  ? <CheckCircle size={16} color="var(--accent)" />
                                  : <Circle size={16} color="var(--text-muted)" />
                              )}
                            </span>
                          </div>

                          {visualState.label && (
                            <p
                              style={{
                                margin: '8px 0 0',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: visualState.color,
                              }}
                            >
                              {visualState.label}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {submitted && (
                <div
                  style={{
                    marginTop: 16,
                    borderRadius: 16,
                    padding: '14px 16px',
                    background: isCorrectSelection ? 'var(--success-soft)' : 'var(--surface-soft)',
                    border: `1px solid ${isCorrectSelection ? 'var(--success-border)' : 'var(--border)'}`,
                  }}
                >
                  {!answered && (
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                      You skipped this one. The correct answer was <strong>{renderQuizText(question.answer)}</strong>.
                    </p>
                  )}

                  {answered && !isCorrectSelection && (
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                      Correct answer: <strong>{renderQuizText(question.answer)}</strong>
                    </p>
                  )}

                  {question.explanation && (
                    <p style={{ margin: answered ? '10px 0 0' : '10px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.75 }}>
                      {renderQuizText(question.explanation)}
                    </p>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {!submitted && (
        <button
          type="button"
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
