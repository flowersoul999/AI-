'use client'

import { motion } from 'motion/react'
import { MessageSquare, Trash2, Clock, ArrowRight } from 'lucide-react'
import type { ChatSession } from '@/lib/chat-history-store'

interface HistoryListProps {
  sessions: ChatSession[]
  onRestore: (session: ChatSession) => void
  onDelete: (id: string) => void
}

export default function HistoryList({ sessions, onRestore, onDelete }: HistoryListProps) {
  if (sessions.length === 0) {
    return (
      <div className="card relative flex flex-col items-center py-16 text-center">
        <MessageSquare className="mb-3 h-10 w-10 text-secondary/40" />
        <p className="text-sm text-secondary">暂无聊天记录</p>
        <p className="mt-1 text-xs text-secondary/60">开始一次对话后，记录会自动保存在这里</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session, idx) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="card relative flex items-center justify-between !rounded-2xl !p-4"
        >
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-sm font-medium">{session.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-secondary">
              <Clock className="h-3 w-3" />
              {new Date(session.timestamp).toLocaleDateString('zh-CN', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
              <span className="ml-1">· {session.messages.length} 条消息</span>
            </p>
          </div>
          <div className="ml-3 flex items-center gap-2">
            <button
              onClick={() => onRestore(session)}
              className="flex h-8 w-8 items-center justify-center rounded-full border bg-white/60 text-xs transition-colors hover:bg-white/80"
              title="恢复对话"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(session.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full border bg-white/60 text-xs text-red-400 transition-colors hover:bg-red-50"
              title="删除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
