'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import HistoryList from '@/components/resume/HistoryList'
import { loadAllSessions, deleteSession, saveSession, type ChatSession } from '@/lib/chat-history-store'
import { saveCurrentMessages } from '@/lib/chat-store'
import { useRouter } from 'next/navigation'

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const router = useRouter()

  useEffect(() => {
    setSessions(loadAllSessions())
  }, [])

  const handleRestore = (session: ChatSession) => {
    saveCurrentMessages(session.messages)
    router.push('/resume')
  }

  const handleDelete = (id: string) => {
    deleteSession(id)
    setSessions(loadAllSessions())
  }

  return (
    <div className="flex flex-col items-center px-6 pt-32 pb-12 max-sm:px-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold">聊天历史</h1>
        <p className="text-secondary mt-2 text-lg">查看和恢复之前的对话</p>
      </motion.div>

      <div className="w-full max-w-[700px]">
        <HistoryList
          sessions={sessions}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
