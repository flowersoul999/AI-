import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithAI, type AIServiceConfig } from '@/lib/ai-service'
import { parseResumeText } from '@/lib/resume-parser'

export async function POST(request: NextRequest) {
  try {
    const { text, useAI = true, apiKey, baseUrl, model, provider } = await request.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }
    console.log('[Parse API] Received text length:', text.length, 'useAI:', useAI)

    let resume: Partial<import('@/lib/types').Resume>

    if (useAI) {
      try {
        const doubaoApiKey = process.env.DOUBAO_API_KEY
        const doubaoBaseUrl = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
        const doubaoModel = process.env.DOUBAO_MODEL

        const openaiApiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
        const openaiBaseUrl = process.env.OPENAI_BASE_URL || process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'
        const openaiModel = process.env.OPENAI_MODEL || process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini'

        let finalConfig: AIServiceConfig

        if (provider === 'doubao' || (doubaoApiKey && !provider)) {
          finalConfig = {
            provider: 'openai',
            apiKey: apiKey || doubaoApiKey || '',
            baseUrl: baseUrl || doubaoBaseUrl,
            model: model || doubaoModel || 'ep-xxx'
          }
          console.log('[Parse API] Using 豆包 API:', finalConfig.baseUrl, 'model:', finalConfig.model)
        } else if (provider === 'openai' || openaiApiKey) {
          finalConfig = {
            provider: 'openai',
            apiKey: apiKey || openaiApiKey || '',
            baseUrl: baseUrl || openaiBaseUrl,
            model: model || openaiModel
          }
          console.log('[Parse API] Using OpenAI API:', finalConfig.baseUrl, 'model:', finalConfig.model)
        } else {
          finalConfig = { provider: 'mock' }
          console.log('[Parse API] Using mock mode')
        }
        
        resume = await parseResumeWithAI(text, finalConfig)
        console.log('[Parse API] AI parsed resume:', {
          hasPersonal: !!resume.personal,
          skillsCount: resume.skills?.length || 0,
          experienceCount: resume.experience?.length || 0,
          projectsCount: resume.projects?.length || 0
        })
      } catch (aiError) {
        console.warn('[Parse API] AI parse failed, falling back to regular parser:', aiError.message)
        resume = parseResumeText(text)
      }
    } else {
      resume = parseResumeText(text)
    }

    return NextResponse.json(resume)
  } catch (error: any) {
    console.error('[Parse API] Error:', error.message, error.stack)
    return NextResponse.json({ error: error.message || 'Parse failed' }, { status: 500 })
  }
}