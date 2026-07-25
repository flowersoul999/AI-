import type { Resume } from './types'

export function parseResumeText(text: string): Partial<Resume> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Name — try heading first
  const headingName = text.match(/^#\s+(.+)/m)
  const namedName = text.match(/^(?:姓名|Name|名字)[：:]\s*(.+)/im)
  const name = headingName?.[1]?.trim() || namedName?.[1]?.trim() || lines[0] || ''

  // Title — look after name or labeled
  const titleMatch = text.match(/(?:职位|Title|职称|岗位)[：:]\s*(.+)/im)
    || text.match(/^(?:前端|高级|资深|初级|全栈|后端|架构师)/im)
  const title = titleMatch?.[1]?.trim() || titleMatch?.[0]?.trim() || ''

  // Email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
  const email = emailMatch?.[0] || ''

  // Phone
  const phoneMatch = text.match(/(?:\+?86)?[-\s]?(?:1[3-9]\d{1}\s?\d{4}\s?\d{4})/)
  const phone = phoneMatch?.[0]?.replace(/[\s-]/g, '') || ''

  // Location
  const locMatch = text.match(/(?:地点|Location|城市|所在)[：:]\s*(.+)/im)
  const location = locMatch?.[1]?.trim() || ''

  // Summary — after profile heading or first paragraph
  const summaryLines = text.match(/^#?\s*(?:个人简介|Summary|关于我|个人概述)[：:]?\s*\n([\s\S]*?)(?=\n#|\n##|\n---|$)/im)
  const summary = summaryLines?.[1]?.trim().split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean).join('。') || ''

  // Skills — look for bullet points under skills section
  const skillSection = extractSection(text, ['技能', 'Skills', '技术栈', '专长'])
  const skills = skillSection
    ? skillSection.split('\n')
        .map(l => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
        .flatMap(s => {
          const parts = s.split(/[,，、]/).map(p => p.trim()).filter(Boolean)
          return parts.map(p => ({
            name: p.replace(/\s*\(\d+%?\)\s*$/, '').trim(),
            level: parseInt(p.match(/\((\d+)/)?.[1] || '') || 70,
            category: categorizeSkill(p)
          }))
        })
    : []

  // Experience
  const expSection = extractSection(text, ['工作经历', 'Experience', '工作', '从业经历'])
  const experience = expSection ? parseExperienceBlocks(expSection) : []

  // Education
  const eduSection = extractSection(text, ['教育经历', 'Education', '教育'])
  const education = eduSection ? parseEducationBlocks(eduSection) : []

  // Projects
  const projSection = extractSection(text, ['项目经历', 'Projects', '项目'])
  const projects = projSection ? parseProjectBlocks(projSection) : []

  return {
    personal: { name, title, email, phone, location, avatar: '' },
    summary: summary || generateSummary(name, title, experience),
    skills: skills.length > 0 ? skills : generateDefaultSkills(),
    experience: experience.length > 0 ? experience : [],
    education: education.length > 0 ? education : [],
    projects: projects.length > 0 ? projects : [],
    contact: { email, github: '', linkedin: '', website: '' }
  }
}

function extractSection(text: string, keywords: string[]): string | null {
  for (const kw of keywords) {
    const regex = new RegExp(`(?:^|\\n)#{1,3}\\s*${kw}[：:]?\\s*\\n([\\s\\S]*?)(?=\\n#{1,3}\\s|\\n---|$)`, 'im')
    const match = text.match(regex)
    if (match) return match[1].trim()
  }
  return null
}

function parseExperienceBlocks(text: string) {
  const blocks = text.split(/\n(?![-*])/).filter(Boolean).join('\n')
  const entries: Array<{ company: string; position: string; startDate: string; endDate: string; description: string; highlights: string[] }> = []
  
  const lines = text.split('\n')
  let current: any = null
  for (const line of lines) {
    const trimmed = line.replace(/^[-*]\s*/, '').trim()
    if (!trimmed) continue
    
    const dateMatch = trimmed.match(/(\d{4}[\s./-]\d{1,2}|\d{4}[年])\s*[~至到]\s*(\d{4}[\s./-]\d{1,2}|至今|现在|今)/)
    if (dateMatch) {
      if (current) entries.push(current)
      const nameParts = trimmed.replace(dateMatch[0], '').replace(/^[-*]\s*/, '').trim().split(/[,，\s]{2,}/)
      current = {
        company: nameParts[0]?.trim().replace(/^[（(]/, '') || '',
        position: nameParts[1]?.trim() || '',
        startDate: dateMatch[1].replace(/[年\s./]/g, '').slice(0, 7),
        endDate: dateMatch[2].replace(/[年\s./]/g, '').slice(0, 7),
        description: '',
        highlights: []
      }
    } else if (current) {
      current.highlights.push(trimmed)
    }
  }
  if (current) entries.push(current)
  return entries
}

function parseEducationBlocks(text: string) {
  const lines = text.split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
  const entries: Array<{ school: string; degree: string; field: string; startDate: string; endDate: string }> = []

  for (const line of lines) {
    const dateMatch = line.match(/(\d{4}[\s./-]\d{0,2}|\d{4}[年])\s*[~至到]\s*(\d{4}[\s./-]\d{0,2}|至今|现在|今)/)
    if (dateMatch) {
      const parts = line.replace(dateMatch[0], '').split(/[,，、\s]{2,}/).filter(Boolean)
      entries.push({
        school: parts[0]?.trim() || '',
        degree: parts[1]?.trim() || '',
        field: parts.slice(2).join('、').trim() || '',
        startDate: dateMatch[1].replace(/[年\s]/g, '').slice(0, 7),
        endDate: dateMatch[2].replace(/[年\s]/g, '').slice(0, 7)
      })
    }
  }
  return entries
}

function parseProjectBlocks(text: string) {
  const lines = text.split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
  const entries: Array<{ name: string; description: string; technologies: string[]; url?: string }> = []

  for (const line of lines) {
    if (line.length < 3) continue
    const techMatch = line.match(/[（(]([^）)]+)[）)]/)
    const name = line.split(/[,，:：]/)[0]?.trim() || line.slice(0, 20)
    entries.push({
      name,
      description: line.slice(name.length).replace(/^[,，:：\s]+/, '').slice(0, 100) || name,
      technologies: techMatch?.[1]?.split(/[,，、]/).map(t => t.trim()).filter(Boolean) || [],
    })
  }
  return entries
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

function generateSummary(name: string, title: string, experience: any[]): string {
  const years = experience.length > 0 ? `${experience.length} 年` : ''
  return `${name}，${title || '软件工程师'}。${years}开发经验，熟悉前端技术栈，有良好的工程化实践。`
}

function generateDefaultSkills() {
  return [
    { name: 'React', level: 80, category: '前端' },
    { name: 'TypeScript', level: 75, category: '前端' },
    { name: 'Node.js', level: 65, category: '后端' },
    { name: 'CSS', level: 70, category: '前端' },
    { name: 'Git', level: 75, category: 'DevOps' },
  ]
}
