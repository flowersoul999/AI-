'use client'

import { Sparkles, User } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/ai-service'

interface ChatMessageProps {
  message: ChatMessage
  isStreaming?: boolean
  displayText?: string
}

export default function ChatMessageItem({ message, isStreaming, displayText }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const text = displayText || message.content

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
    >
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isUser ? 'bg-brand/20' : 'bg-brand-secondary/20'
      )}>
        {isUser ? <User className="h-3.5 w-3.5 text-brand" /> : <Sparkles className="h-3.5 w-3.5 text-brand-secondary" />}
      </div>
      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'rounded-br-md bg-brand text-white'
          : 'rounded-bl-md border bg-white/60 backdrop-blur-sm'
      )}>
        {isUser ? text : (
          <span>
            {text}
            {isStreaming && <span className="ml-0.5 inline-block h-3.5 w-2 animate-pulse bg-current" style={{ opacity: 0.4 }} />}
          </span>
        )}
      </div>
    </motion.div>
  )
}
