import { NextRequest, NextResponse } from 'next/server'
import * as pdfjsLib from 'pdfjs-dist'
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs'

export async function POST(request: NextRequest) {
  try {
    const { file: base64 } = await request.json()
    if (!base64) throw new Error('No file data')
    console.log('[Parse PDF API] Received file, size:', base64.length, 'characters')

    const bytes = Buffer.from(base64, 'base64')
    console.log('[Parse PDF API] Decoded to:', bytes.length, 'bytes')

    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href
    console.log('[Parse PDF API] Worker URL:', workerUrl)
    GlobalWorkerOptions.workerSrc = workerUrl
    
    console.log('[Parse PDF API] pdfjs loaded with worker')
    
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
    console.log('[Parse PDF API] PDF loaded, pages:', pdf.numPages)

    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item: any) => item.str).join(' ') + '\n'
    }
    console.log('[Parse PDF API] Extracted text length:', text.length)

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('[Parse PDF API] Error:', error.message, error.stack)
    return NextResponse.json({ error: error.message || 'PDF parse failed' }, { status: 500 })
  }
}
