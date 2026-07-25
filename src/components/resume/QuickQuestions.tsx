'use client'

interface QuickQuestionsProps {
  onSelect: (question: string) => void
}

const questions = ['介绍自己', '技术栈', '项目经历', '教育背景']

export default function QuickQuestions({ onSelect }: QuickQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map(q => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="rounded-xl border bg-white/60 px-3 py-1.5 text-xs text-secondary backdrop-blur-sm transition-colors hover:bg-white/80 hover:text-primary"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
