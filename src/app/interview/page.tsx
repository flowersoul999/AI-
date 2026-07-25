'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { fetchResume } from '@/lib/resume-store'
import { Send, ChevronRight, CheckCircle, Sparkles } from 'lucide-react'
import type { Resume } from '@/lib/types'

const presetQuestions = [
  {
    category: '技术',
    question: '请解释 React 中 Virtual DOM 的工作原理，以及它为什么能提升性能。',
    evaluation: (answer: string) => {
      const keywords = ['虚拟 DOM', 'diff', '对比', '批量更新', ' reconciliation']
      const found = keywords.filter(k => answer.includes(k)).length
      if (found >= 4) return { score: 4, feedback: '回答非常全面！你清晰地解释了 Virtual DOM 的核心机制，包括 diff 算法和批量更新策略。表述专业、逻辑清晰。', emoji: '🌟' }
      if (found >= 2) return { score: 3, feedback: '回答基本正确，涵盖了 Virtual DOM 的部分核心概念。建议补充 diff 算法的具体细节和批量更新机制。', emoji: '👍' }
      return { score: 2, feedback: '回答较简略。建议从"创建虚拟 DOM 树 → diff 对比 → 最小化更新真实 DOM"这条主线来组织回答。', emoji: '💪' }
    }
  },
  {
    category: '技术',
    question: '在大型前端项目中，你会如何设计组件状态管理方案？可以结合你的实际经验谈谈。',
    evaluation: (answer: string) => {
      const keywords = ['zustand', 'redux', 'context', '状态提升', '原子化']
      const found = keywords.filter(k => answer.includes(k)).length
      if (found >= 3) return { score: 4, feedback: '优秀！你结合实际经验阐述了状态管理方案的选择依据，同时提到了多种解决方案的适用场景，展现了架构思维。', emoji: '🌟' }
      if (found >= 1) return { score: 3, feedback: '回答有一定深度。建议再多谈谈不同规模项目下状态管理方案的取舍依据，以及你的实践中遇到的具体挑战。', emoji: '👍' }
      return { score: 2, feedback: '建议从三个维度来组织：组件内部状态、跨组件共享状态、服务端状态。每种场景有不同的最佳实践。', emoji: '💪' }
    }
  },
  {
    category: '项目',
    question: `你在字节跳动参与过微前端架构设计。能详细介绍一下你们当时选择微前端的背景、具体的实现方案，以及遇到的挑战吗？`,
    evaluation: (answer: string) => {
      const keywords = ['基座', '子应用', '隔离', '通信', 'qiankun', 'module federation']
      const found = keywords.filter(k => answer.includes(k)).length
      if (found >= 3) return { score: 4, feedback: '非常好的回答！你清楚地阐述了微前端的选型背景和实现方案，对沙箱隔离、应用通信等关键问题有自己的见解。', emoji: '🌟' }
      if (found >= 1) return { score: 3, feedback: '回答方向正确。建议再深入聊聊子应用之间的样式隔离、公共依赖加载等具体实现细节。', emoji: '👍' }
      return { score: 2, feedback: '建议从"为什么用→怎么用→遇到了什么问题→如何解决"的逻辑来完整陈述。', emoji: '💪' }
    }
  },
  {
    category: '项目',
    question: '你曾将 LCP 从 3.2s 优化到 1.1s，能具体说说你用了哪些手段，以及如何衡量和定位性能瓶颈的吗？',
    evaluation: (answer: string) => {
      const keywords = ['lighthouse', '分包', '懒加载', 'CDN', '缓存', 'SSR', '图片优化']
      const found = keywords.filter(k => answer.includes(k)).length
      if (found >= 3) return { score: 4, feedback: '非常精彩！你系统地讲述了性能优化的完整流程——从指标监控、瓶颈定位到具体优化手段，体现了扎实的性能工程能力。', emoji: '🌟' }
      if (found >= 1) return { score: 3, feedback: '提到了有效的优化手段。建议补充性能度量的具体方法和优化前后的数据对比。', emoji: '👍' }
      return { score: 2, feedback: '建议从"度量→分析→优化→验证"的闭环来回答，具体到使用了哪些工具和优化后的量化指标。', emoji: '💪' }
    }
  },
  {
    category: '行为',
    question: '请分享一次你在团队中推动技术改进的经历。你是如何说服团队采纳新方案的？',
    evaluation: (answer: string) => {
      const keywords = ['调研', '试点', '收益', '沟通', '文档', '培训']
      const found = keywords.filter(k => answer.includes(k)).length
      if (found >= 3) return { score: 4, feedback: '出色的回答！你展示了优秀的技术推动力和沟通能力，从方案调研到落地推广的完整思路非常清晰。', emoji: '🌟' }
      if (found >= 1) return { score: 3, feedback: '有具体案例支撑。建议再谈谈在推行过程中遇到的阻力以及你是如何化解的。', emoji: '👍' }
      return { score: 2, feedback: '建议用 STAR 原则（情境-任务-行动-结果）来组织这类行为面试的回答。', emoji: '💪' }
    }
  },
  {
    category: '行为',
    question: '在你的职业生涯中，有没有遇到过让你感到非常棘手的线上故障？你是怎么应对和处理的？',
    evaluation: (answer: string) => {
      const keywords = ['排查', '回滚', '监控', '复盘', '预案', '告警']
      const found = keywords.filter(k => answer.includes(k)).length
      if (found >= 3) return { score: 4, feedback: '非常专业！你完整地描述了故障处理的 SOP，从发现、响应、止血到根因分析和复盘改进，体现了成熟的工程师素养。', emoji: '🌟' }
      if (found >= 1) return { score: 3, feedback: '提到了关键的处理步骤。建议补充故障应急的具体时间线和事后改进措施。', emoji: '👍' }
      return { score: 2, feedback: '建议从"发现→定位→止血→修复→复盘"的完整流程来组织回答。', emoji: '💪' }
    }
  }
]

interface InterviewState {
  currentIndex: number
  answers: string[]
  evaluations: { score: number; feedback: string; emoji: string }[]
  isEvaluating: boolean
  showResult: boolean
  isComplete: boolean
}

export default function InterviewPage() {
  const [resume, setResume] = useState<Resume | null>(null)
  const [state, setState] = useState<InterviewState>({
    currentIndex: 0,
    answers: [],
    evaluations: [],
    isEvaluating: false,
    showResult: false,
    isComplete: false
  })
  const [answer, setAnswer] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchResume().then(setResume).catch(() => {})
    textareaRef.current?.focus()
  }, [])

  const currentQ = presetQuestions[state.currentIndex]
  const progress = ((state.currentIndex + 1) / presetQuestions.length) * 100

  const handleSubmit = () => {
    if (!answer.trim() || state.isEvaluating) return

    setState(prev => ({ ...prev, isEvaluating: true }))

    setTimeout(() => {
      const evaluation = currentQ.evaluation(answer)
      setState(prev => ({
        ...prev,
        isEvaluating: false,
        showResult: true,
        answers: [...prev.answers, answer],
        evaluations: [...prev.evaluations, evaluation]
      }))
    }, 1000)
  }

  const handleNext = () => {
    const nextIndex = state.currentIndex + 1
    if (nextIndex >= presetQuestions.length) {
      setState(prev => ({ ...prev, isComplete: true }))
      return
    }
    setState(prev => ({
      ...prev,
      currentIndex: nextIndex,
      showResult: false
    }))
    setAnswer('')
    textareaRef.current?.focus()
  }

  const handleRestart = () => {
    setState({
      currentIndex: 0,
      answers: [],
      evaluations: [],
      isEvaluating: false,
      showResult: false,
      isComplete: false
    })
    setAnswer('')
  }

  const currentEval = state.evaluations[state.currentIndex]
  const totalScore = state.evaluations.reduce((sum, e) => sum + e.score, 0)
  const maxScore = state.evaluations.length * 4

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-32 pb-12" style={{ minHeight: '60vh' }}>
        <div className="text-secondary">加载中...</div>
      </div>
    )
  }

  // Summary view
  if (state.isComplete) {
    return (
      <div className="flex flex-col items-center px-6 pt-32 pb-12 max-sm:px-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card relative w-full max-w-[700px] text-center"
        >
          <div className="py-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
            <h2 className="font-averia mt-4 text-2xl">面试完成！</h2>
            <p className="text-secondary mt-2">共回答 {state.evaluations.length} 道题目</p>

            <div className="mt-6">
              <div className="text-5xl font-bold text-brand">
                {totalScore}/{maxScore}
              </div>
              <p className="text-secondary mt-1 text-sm">
                {totalScore >= 20 ? '面试表现优异！' : totalScore >= 15 ? '面试表现良好，略有提升空间。' : '建议多练习，重点关注深度回答。'}
              </p>
            </div>

            <div className="mt-8 space-y-4 text-left">
              {state.evaluations.map((e, i) => (
                <div key={i} className="rounded-2xl border bg-white/40 p-4 backdrop-blur-sm">
                  <p className="text-xs text-secondary">
                    Q{i + 1}. {presetQuestions[i].category}
                  </p>
                  <p className="mt-1 text-sm font-medium">{presetQuestions[i].question.slice(0, 40)}...</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg">{e.emoji}</span>
                    <span className="text-sm">{e.feedback.slice(0, 50)}...</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRestart}
              className="brand-btn mt-8 inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              重新开始
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-6 pt-32 pb-12 max-sm:px-3">
      <div className="w-full max-w-[800px] space-y-6">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card relative"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">
              第 {state.currentIndex + 1} / {presetQuestions.length} 题
            </span>
            <span className="text-brand text-xs font-medium">{currentQ.category}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/40">
            <motion.div
              className="h-full rounded-full bg-brand"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={state.currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="card relative"
        >
          <div className="inline-block rounded-lg bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            {currentQ.category}面试题
          </div>
          <h2 className="mt-4 text-lg font-semibold leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Answer Area */}
          <div className="mt-6">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={state.showResult}
              placeholder="输入你的回答..."
              rows={4}
              className="w-full resize-none rounded-2xl border bg-white/40 px-4 py-3 text-sm backdrop-blur-sm placeholder:text-secondary/50 focus:outline-none disabled:opacity-50"
            />
            {!state.showResult && (
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || state.isEvaluating}
                className="brand-btn mt-3 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {state.isEvaluating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    评估中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    提交回答
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Feedback */}
        {state.showResult && currentEval && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card relative"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{currentEval.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">面试反馈</h3>
                  <span className="rounded-lg bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                    评分 {currentEval.score}/4
                  </span>
                </div>
                <p className="text-secondary mt-2 text-sm leading-relaxed">{currentEval.feedback}</p>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-2 w-8 rounded-full ${i <= currentEval.score ? 'bg-brand' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="brand-btn inline-flex items-center gap-2"
              >
                {state.currentIndex < presetQuestions.length - 1 ? (
                  <>下一题 <ChevronRight className="h-4 w-4" /></>
                ) : (
                  <>查看结果 <Sparkles className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
