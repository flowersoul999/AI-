import { NextRequest } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { generateResponse } from '@/lib/ai-service'
import type { ChatMessage } from '@/lib/ai-service'
import type { Resume } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    const filePath = path.join(process.cwd(), 'public', 'data', 'resume.json')
    const resumeData = JSON.parse(await fs.readFile(filePath, 'utf-8')) as Resume

    const doubaoApiKey = process.env.DOUBAO_API_KEY || ''
    const doubaoBaseUrl = process.env.DOUBAO_BASE_URL || ''
    const doubaoModel = process.env.DOUBAO_MODEL || ''

    const config = {
      provider: doubaoApiKey ? 'openai' as const : 'mock' as const,
      apiKey: doubaoApiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      baseUrl: doubaoBaseUrl || process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: doubaoModel || process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini'
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of generateResponse(messages as ChatMessage[], resumeData, config)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (err: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to process chat' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
