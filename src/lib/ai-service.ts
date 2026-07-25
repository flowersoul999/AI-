import type { Resume } from './types'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export interface AIServiceConfig {
  provider: 'mock' | 'openai' | 'custom'
  apiKey?: string
  baseUrl?: string
  model?: string
}

function buildResumeContext(resume: Resume): string {
  const { personal, summary, skills, experience, education, projects } = resume
  return [
    `个人信息：${personal.name}，${personal.title}，位于${personal.location}`,
    `简介：${summary}`,
    `技能：${skills.map(s => `${s.name}(${s.level}%)`).join('、')}`,
    `工作经历：${experience.map(e => `${e.company} - ${e.position}(${e.startDate}~${e.endDate})：${e.description}`).join('；')}`,
    `教育背景：${education.map(e => `${e.school} ${e.degree} ${e.field}(${e.startDate}~${e.endDate})`).join('；')}`,
    `项目：${projects.map(p => `${p.name}：${p.description}（${p.technologies.join(', ')}）`).join('；')}`
  ].join('\n')
}

function buildSystemPrompt(resume: Resume): string {
  return `你是一位专业的 AI 简历助手。你可以根据以下简历信息回答用户的问题。请用中文回答，语气友好专业。\n\n简历信息：\n${buildResumeContext(resume)}`
}

function generateMockResponse(question: string, resume: Resume): string {
  const q = question.toLowerCase()
  const { personal, skills, experience, education } = resume

  const responses: Record<string, string> = {
    default: `我仔细查看了这份简历，以下是我的分析：

**核心优势**
- 拥有丰富的互联网大厂经验，职业路径清晰且持续提升
- 技术栈全面，React 生态深度扎实（95%），同时具备 Node.js 后端能力和工程化建设经验
- 有显著的业务成果数据

**值得关注的亮点**
- 主导过微前端架构和组件库建设，具备架构设计和技术决策能力
- TypeScript 迁移覆盖率达 90%，体现了对代码质量和工程规范的重视
- 参与过 B 端商家平台和 C 端电商等多种业务场景

如果你想了解更具体的方面，可以选择下方的快捷提问。`,
    '介绍自己': `你好！我是 ${personal.name}，目前担任 ${personal.title}，现居 ${personal.location}。

我拥有 ${experience.length > 0 ? experience[0].startDate + ' 开始' : '多年'} 前端开发经验，先后在 ${experience.map(e => e.company).join('、')} 工作，参与过多个大型项目的开发。

我的技术核心领域是 React 生态系统，同时在工程化建设、性能优化和跨平台开发方面有丰富的实践经验。工作之余我喜欢参与开源社区。

如果你对我的技术栈、项目经历或任何其他方面感兴趣，随时问我！`,
    '技术栈': `根据简历数据，${personal.name} 的技术栈概况如下：

**核心技能（高熟练度）**
${skills.filter(s => s.level >= 80).map(s => `- ${s.name} (${s.level}%)`).join('\n')}

**辅助技能**
${skills.filter(s => s.level < 80).map(s => `- ${s.name} (${s.level}%)`).join('\n')}

从技能分布可以看出，这是一位以 React 生态为核心、兼备全栈能力的资深前端工程师。`,
    '项目经历': `以下是 ${personal.name} 的主要工作经历：

${experience.map(e => `**${e.company}（${e.startDate} - ${e.endDate}）** — ${e.position}
${e.highlights.map(h => `- ${h}`).join('\n')}`).join('\n\n')}`,
    '教育背景': `${personal.name} 毕业于：

${education.map(e => `**${e.school}**（${e.startDate} - ${e.endDate}）
${e.degree} · ${e.field}`).join('\n\n')}`
  }

  if (q.includes('介绍') || q.includes('你是谁') || q.includes('关于')) return responses['介绍自己']
  if (q.includes('技术栈') || q.includes('技能') || q.includes('会什么')) return responses['技术栈']
  if (q.includes('项目') || q.includes('经历') || q.includes('工作') || q.includes('经验')) return responses['项目经历']
  if (q.includes('教育') || q.includes('学校') || q.includes('大学') || q.includes('毕业')) return responses['教育背景']
  return responses.default
}

export async function* generateResponse(
  messages: ChatMessage[],
  resume: Resume,
  config?: Partial<AIServiceConfig>
): AsyncGenerator<string> {
  const provider = config?.provider || 'mock'

  switch (provider) {
    case 'openai':
      yield* openAIStream(messages, resume, config)
      break
    case 'mock':
    default:
      yield* mockStream(messages, resume)
      break
  }
}

async function* mockStream(messages: ChatMessage[], resume: Resume): AsyncGenerator<string> {
  const lastQuestion = messages[messages.length - 1]?.content || ''
  const response = generateMockResponse(lastQuestion, resume)

  const chars = response.split('')
  let i = 0
  while (i < chars.length) {
    const chunkSize = Math.floor(Math.random() * 3) + 1
    yield chars.slice(i, i + chunkSize).join('')
    i += chunkSize
    await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 25))
  }
}

async function* openAIStream(
  messages: ChatMessage[],
  resume: Resume,
  config?: Partial<AIServiceConfig>
): AsyncGenerator<string> {
  const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  const baseUrl = config?.baseUrl || process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = config?.model || 'gpt-4o-mini'

  const systemMessage = { role: 'system' as const, content: buildSystemPrompt(resume) }
  const apiMessages = [systemMessage, ...messages.map(m => ({ role: m.role, content: m.content }))]

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      stream: true
    })
  })

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`)

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') return

      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) yield content
      } catch { /* skip parse errors */ }
    }
  }
}
