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

async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  config?: Partial<AIServiceConfig>
): Promise<string> {
  const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  const baseUrl = config?.baseUrl || process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = config?.model || 'gpt-4o-mini'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }

  let endpoint = '/chat/completions'
  let body: Record<string, any> = {
    model,
    messages,
    stream: false
  }

  if (baseUrl.includes('volces.com')) {
    endpoint = '/chat/completions'
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error: ${response.status} - ${errorText}`)
  }
  const data = await response.json()

  if (baseUrl.includes('volces.com')) {
    return data.response || data.choices?.[0]?.message?.content || ''
  }
  return data.choices?.[0]?.message?.content || ''
}

function buildParsePrompt(resumeText: string): string {
  return `严格按照以下 JSON 格式提取简历信息，只返回JSON，不要任何解释文字！

${resumeText}

{
  "personal": {
    "name": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "avatar": ""
  },
  "summary": "",
  "skills": [{"name":"","level":80,"category":"前端"}],
  "experience": [{"company":"","position":"","startDate":"","endDate":"","description":"","highlights":[]}],
  "education": [{"school":"","degree":"","field":"","startDate":"","endDate":""}],
  "projects": [{"name":"","description":"","technologies":[],"url":""}],
  "contact": {"email":"","github":"","linkedin":"","twitter":"","website":""}
}`
}

function generateMockResume(text: string): Partial<Resume> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  const nameMatch = text.match(/(?:姓名|Name|名字)[：:]\s*(.+)/im) || 
                    text.match(/^([\u4e00-\u9fa5]{2,4})\s*$/m)
  const name = nameMatch?.[1]?.trim() || '求职者'
  
  const titleMatch = text.match(/(?:职位|Title|职称)[：:]\s*(.+)/im) ||
                     text.match(/(?:前端|高级|资深|初级|全栈|后端|架构师|工程师|经理)/im)
  const title = titleMatch?.[1]?.trim() || titleMatch?.[0]?.trim() || '软件工程师'
  
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
  const email = emailMatch?.[0] || ''
  
  const phoneMatch = text.match(/(?:\+?86)?[-\s]?(?:1[3-9]\d{1}\s?\d{4}\s?\d{4})/)
  const phone = phoneMatch?.[0]?.replace(/[\s-]/g, '') || ''
  
  const cityNames = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆']
  let location = ''
  for (const city of cityNames) {
    if (text.includes(city)) {
      location = city
      break
    }
  }
  
  const projectEntries: Array<{ name: string; description: string; technologies: string[]; url?: string }> = []
  const techKeywords = ['React', 'Vue', 'Node.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Python', 'Java', 'Go', 'Docker', 'MySQL', 'MongoDB']
  
  for (const line of lines) {
    if (line.length > 5 && !line.match(/^\d{4}/)) {
      const techs: string[] = []
      for (const kw of techKeywords) {
        if (line.toLowerCase().includes(kw.toLowerCase())) {
          techs.push(kw)
        }
      }
      
      const parts = line.split(/[:：]/)
      const projName = parts[0]?.trim() || line.slice(0, 20)
      if (projName.length > 2) {
        projectEntries.push({
          name: projName,
          description: parts.slice(1).join(':').trim() || '项目描述',
          technologies: techs.length > 0 ? techs : ['待定']
        })
      }
    }
  }
  
  const foundSkills: Set<string> = new Set()
  for (const line of lines) {
    for (const kw of techKeywords) {
      if (line.toLowerCase().includes(kw.toLowerCase())) {
        foundSkills.add(kw)
      }
    }
  }
  
  const skills = Array.from(foundSkills).map(name => ({
    name,
    level: Math.floor(Math.random() * 30) + 60,
    category: categorizeSkill(name)
  }))
  
  const expEntries: Array<{ company: string; position: string; startDate: string; endDate: string; description: string; highlights: string[] }> = []
  for (const line of lines) {
    const dateMatch = line.match(/(\d{4}[\s./-]\d{1,2}|\d{4}[年])\s*[~至到-]\s*(\d{4}[\s./-]\d{1,2}|至今|现在)/)
    if (dateMatch) {
      const rest = line.replace(dateMatch[0], '').trim()
      const parts = rest.split(/[\s,，]+/).filter(Boolean)
      expEntries.push({
        company: parts[0] || '公司',
        position: parts[1] || title,
        startDate: dateMatch[1].replace(/[年\s./-]/g, '').slice(0, 7),
        endDate: dateMatch[2].replace(/[年\s./-]/g, '').slice(0, 7),
        description: '',
        highlights: []
      })
    }
  }
  
  return {
    personal: { name, title, email, phone, location, avatar: '' },
    summary: `${name}，${title}。具备丰富的开发经验。`,
    skills: skills.length > 0 ? skills : [{ name: '编程', level: 70, category: '其他' }],
    experience: expEntries,
    education: [],
    projects: projectEntries.slice(0, 5),
    contact: { email, github: '', linkedin: '', twitter: '', website: '' }
  }
}

function categorizeSkill(name: string): string {
  const fe = ['react', 'vue', 'angular', 'next', 'nuxt', 'css', 'html', 'tailwind', 'typescript', 'javascript', 'webpack', 'vite']
  const be = ['node', 'python', 'java', 'go', 'rust', 'sql', 'postgresql', 'mongodb', 'redis', 'graphql']
  const devops = ['docker', 'kubernetes', 'ci/cd', 'aws', 'gcp', 'azure', 'linux']
  const design = ['figma', 'sketch', 'photoshop', 'ui', 'ux']
  const mobile = ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios']

  const lower = name.toLowerCase()
  if (fe.some(k => lower.includes(k))) return '前端'
  if (be.some(k => lower.includes(k))) return '后端'
  if (devops.some(k => lower.includes(k))) return 'DevOps'
  if (design.some(k => lower.includes(k))) return '设计'
  if (mobile.some(k => lower.includes(k))) return '移动端'
  return '其他'
}

export async function parseResumeWithAI(
  resumeText: string,
  config?: Partial<AIServiceConfig>
): Promise<Partial<Resume>> {
  const provider = config?.provider || 'mock'

  switch (provider) {
    case 'openai':
      return parseResumeWithOpenAI(resumeText, config)
    case 'mock':
    default:
      return parseResumeWithMock(resumeText)
  }
}

async function parseResumeWithOpenAI(
  resumeText: string,
  config?: Partial<AIServiceConfig>
): Promise<Partial<Resume>> {
  const prompt = buildParsePrompt(resumeText)
  
  const messages = [
    { role: 'system', content: '你是一个严格的信息提取工具。你必须只提取用户提供的文本中的信息，绝对不能虚构任何内容。如果找不到信息，就保持为空字符串或空数组。请严格按照指定的JSON格式返回，不要包含任何解释文字、代码块标记或其他额外内容。' },
    { role: 'user', content: prompt }
  ]
  
  const response = await callOpenAI(messages, config)
  
  try {
    let jsonStr = response.trim()
    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '')
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]) as Partial<Resume>
      
      if (!result.personal?.name || result.personal.name.length < 2) {
        const nameMatch = resumeText.match(/(?:姓名|Name|名字|Name:|Name\s+)[：:\s]*([^\n]{2,8})/i)
        if (nameMatch) {
          result.personal = result.personal || {}
          result.personal.name = nameMatch[1].trim()
        } else {
          const chineseNameMatch = resumeText.match(/^([\u4e00-\u9fa5]{2,4})\s*$/m)
          if (chineseNameMatch) {
            result.personal = result.personal || {}
            result.personal.name = chineseNameMatch[1].trim()
          }
        }
      }
      
      if (!result.personal?.title || result.personal.title.length < 2) {
        const titleMatch = resumeText.match(/(?:职位|Title|职称|应聘岗位|Position|Title:)[：:\s]*([^\n]+)/i)
        if (titleMatch) {
          result.personal = result.personal || {}
          result.personal.title = titleMatch[1].trim()
        }
      }
      
      if (!result.personal?.location || result.personal.location.length < 2) {
        const locationMatch = resumeText.match(/(?:地址|Location|住址|现居地)[：:\s]*([^\n]+)/i)
        if (locationMatch) {
          result.personal = result.personal || {}
          result.personal.location = locationMatch[1].trim()
        } else {
          const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆', '苏州', '郑州', '长沙', '天津']
          for (const city of cities) {
            if (resumeText.includes(city)) {
              result.personal = result.personal || {}
              result.personal.location = city
              break
            }
          }
        }
      }
      
      if (result.experience && result.experience.length > 0) {
        for (const exp of result.experience) {
          if (!exp.company || exp.company.length < 2) {
            const companyMatch = resumeText.match(/(?:在|任职于|就职于|公司|Company)[：:\s]*([^\n]+)/i)
            if (companyMatch) {
              exp.company = companyMatch[1].trim()
            }
          }
          if (!exp.position || exp.position.length < 2) {
            const positionMatch = resumeText.match(/(?:担任|职位|岗位|Position)[：:\s]*([^\n]+)/i)
            if (positionMatch) {
              exp.position = positionMatch[1].trim()
            }
          }
        }
      }
      
      if (result.education && result.education.length > 0) {
        for (const edu of result.education) {
          if (!edu.school || edu.school.length < 2) {
            const schoolMatch = resumeText.match(/(?:学校|毕业院校|School|大学)[：:\s]*([^\n]+)/i)
            if (schoolMatch) {
              edu.school = schoolMatch[1].trim()
            }
          }
          if (!edu.degree || edu.degree.length < 1) {
            const degreeMatch = resumeText.match(/(?:学历|学位|Degree|本科|硕士|博士|大专)[：:\s]*([^\n]+)/i)
            if (degreeMatch) {
              edu.degree = degreeMatch[1].trim()
            } else if (resumeText.includes('本科')) {
              edu.degree = '本科'
            } else if (resumeText.includes('硕士')) {
              edu.degree = '硕士'
            }
          }
        }
      }
      
      if (result.projects && result.projects.length > 0) {
        for (const proj of result.projects) {
          if (!proj.name || proj.name.length < 2) {
            const nameMatch = resumeText.match(/(?:项目名称|项目名|Project)[：:\s]*([^\n]+)/i)
            if (nameMatch) {
              proj.name = nameMatch[1].trim()
            }
          }
        }
      }
      
      return result
    }
    return JSON.parse(jsonStr) as Partial<Resume>
  } catch (e) {
    console.warn('[AI Parse] Failed to parse JSON, falling back to mock:', e)
    return parseResumeWithMock(resumeText)
  }
}

function parseResumeWithMock(resumeText: string): Partial<Resume> {
  return generateMockResume(resumeText)
}
