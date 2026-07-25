import { NextRequest, NextResponse } from 'next/server'
import { parseResumeText } from '@/lib/resume-parser'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }
    console.log('[Parse API] Received text length:', text.length)
    const resume = parseResumeText(text)
    console.log('[Parse API] Parsed resume:', {
      hasPersonal: !!resume.personal,
      skillsCount: resume.skills?.length || 0,
      experienceCount: resume.experience?.length || 0
    })
    return NextResponse.json(resume)
  } catch (error: any) {
    console.error('[Parse API] Error:', error.message, error.stack)
    return NextResponse.json({ error: error.message || 'Parse failed' }, { status: 500 })
  }
}
