import LessonContentRenderer from './LessonContentRenderer'
import { buildLessonTheorySource } from '../lib/lessonContent.js'

export default function TheorySection({ lesson, theory, examples }) {
  const lessonData = lesson ?? { theory, examples }
  const source = buildLessonTheorySource(lessonData)

  if (!source) return null

  return <LessonContentRenderer source={source} />
}
