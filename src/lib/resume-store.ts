import type { Resume } from './types'

const RESUME_URL = '/data/resume.json'

export async function fetchResume(): Promise<Resume> {
  const response = await fetch(RESUME_URL)
  if (!response.ok) throw new Error('Failed to fetch resume data')
  return response.json()
}

export async function uploadResume(data: Resume): Promise<void> {
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `Upload failed with status ${response.status}`)
  }
}
