import type { ChatMessage } from './ai-service'

const HISTORY_KEY = 'resume-chat-history'

export interface ChatSession {
  id: string
  title: string
  timestamp: number
  messages: ChatMessage[]
}

function getHistory(): ChatSession[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function setHistory(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions))
  } catch { /* quota exceeded */ }
}

export function loadAllSessions(): ChatSession[] {
  return getHistory()
}

export function saveSession(session: ChatSession): void {
  const sessions = getHistory()
  const existing = sessions.findIndex(s => s.id === session.id)
  if (existing >= 0) {
    sessions[existing] = session
  } else {
    sessions.unshift(session)
  }
  setHistory(sessions)
}

export function deleteSession(id: string): void {
  const sessions = getHistory().filter(s => s.id !== id)
  setHistory(sessions)
}

export function createSession(messages: ChatMessage[]): ChatSession {
  const firstQuestion = messages.find(m => m.role === 'user')?.content || '新对话'
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: firstQuestion.slice(0, 30),
    timestamp: Date.now(),
    messages
  }
}
