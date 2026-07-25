import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Upload API] Received resume data:', {
      hasPersonal: !!body.personal,
      hasSkills: !!body.skills && body.skills.length > 0,
      skillsCount: body.skills?.length || 0,
      hasExperience: !!body.experience
    })
    
    const filePath = path.join(process.cwd(), 'public', 'data', 'resume.json')
    console.log('[Upload API] Writing to:', filePath)
    
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8')
    console.log('[Upload API] Write success')
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Upload API] Error:', error.message, error.stack)
    return NextResponse.json({ error: error.message || 'Failed to save resume data' }, { status: 500 })
  }
}
