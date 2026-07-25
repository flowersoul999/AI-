'use client'

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { motion } from 'motion/react'
import { Sparkles, Send } from 'lucide-react'
import ChatMessageItem from './ChatMessage'
import { saveCurrentMessages, loadCurrentMessages } from '@/lib/chat-store'
import { saveSession, createSession } from '@/lib/chat-history-store'
import type { ChatMessage } from '@/lib/ai-service'
import type { Resume } from '@/lib/types'

interface ChatInterfaceProps {
  resume: Resume
}

export interface ChatInterfaceHandle {
  sendMessage: (message: string) => void
}

const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>(({ resume }, ref) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadCurrentMessages()
    return saved && saved.length > 0
      ? saved
      : [{ role: 'assistant' as const, content: `你好！我是 AI 简历助手，可以问我关于 ${resume.personal.name} 的任何问题。` }]
  })
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { saveCurrentMessages(messages) }, [messages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, streamingContent, scrollToBottom])

  const handleSend = useCallback(async (question: string) => {
    if (!question.trim() || isStreaming) return

    const userMessage: ChatMessage = { role: 'user', content: question }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })

      if (!response.ok) throw new Error('Chat API error')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue
          const data = trimmed.slice(5).trim()
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              fullContent += parsed.content
              setStreamingContent(fullContent)
            }
          } catch { /* skip */ }
        }
      }

      const finalMessages = [...newMessages, { role: 'assistant' as const, content: fullContent }]
      setMessages(finalMessages)
      setStreamingContent('')

      try {
        const session = createSession(finalMessages)
        saveSession(session)
      } catch { /* history save failed */ }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: '抱歉，我暂时无法回答这个问题。请稍后再试。'
      }])
    } finally {
      setIsStreaming(false)
    }
  }, [messages, isStreaming])

  useImperativeHandle(ref, () => ({ sendMessage: handleSend }), [handleSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="card relative flex h-[calc(100vh-200px)] flex-col"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3 border-b border-white/20 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20">
          <Sparkles className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h3 className="text-base font-semibold">AI 简历助手</h3>
          <p className="text-xs text-secondary">向我提问关于这份简历的任何问题</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-none">
        {messages.map((msg, idx) => (
          <ChatMessageItem key={idx} message={msg} />
        ))}
        {isStreaming && streamingContent && (
          <ChatMessageItem
            message={{ role: 'assistant', content: streamingContent }}
            isStreaming
            displayText={streamingContent}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入问题..."
          disabled={isStreaming}
          className="flex-1 rounded-2xl border bg-white/40 px-4 py-3 text-sm backdrop-blur-sm placeholder:text-secondary/50 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={isStreaming || !input.trim()}
          className="brand-btn flex h-11 w-11 items-center justify-center rounded-full p-0 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
})

ChatInterface.displayName = 'ChatInterface'
export default ChatInterface
