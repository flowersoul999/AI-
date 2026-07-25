import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const { file: base64 } = await request.json()
    if (!base64) throw new Error('No file data')
    console.log('[Parse PDF API] Received file, size:', base64.length, 'characters')

    const bytes = Buffer.from(base64, 'base64')
    console.log('[Parse PDF API] Decoded to:', bytes.length, 'bytes')
    
    const data = await pdf(bytes)
    console.log('[Parse PDF API] PDF parsed, text length:', data.text.length)

    return NextResponse.json({ text: data.text, pdfBase64: base64 })
  } catch (error: any) {
    console.error('[Parse PDF API] Error:', error.message, error.stack)
    return NextResponse.json({ error: error.message || 'PDF parse failed' }, { status: 500 })
  }
}