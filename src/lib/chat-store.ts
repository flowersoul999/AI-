import type { ChatMessage } from './ai-service'

const STORAGE_KEY = 'resume-chat-current'

export function saveCurrentMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch { /* quota exceeded */ }
}

export function loadCurrentMessages(): ChatMessage[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function clearCurrentMessages(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}
