import type { Resume } from './types'

export function parseResumeText(text: string): Partial<Resume> {
  const cleanedText = cleanResumeText(text)
  const lines = cleanedText.split('\n').map(l => l.trim()).filter(Boolean)

  // Name — try heading first
  const headingName = cleanedText.match(/^#\s+(.+)/m)
  const namedName = cleanedText.match(/^(?:姓名|Name|名字)[：:]\s*(.+)/im)
  const name = headingName?.[1]?.trim() || namedName?.[1]?.trim() || extractNameFromLines(lines) || ''

  // Title — look after name or labeled
  const titleMatch = cleanedText.match(/(?:职位|Title|职称|岗位)[：:]\s*(.+)/im)
    || cleanedText.match(/(?:前端|高级|资深|初级|全栈|后端|架构师|工程师|经理|总监)/im)
  const title = titleMatch?.[1]?.trim() || titleMatch?.[0]?.trim() || ''

  // Email
  const emailMatch = cleanedText.match(/[\w.-]+@[\w.-]+\.\w+/)
  const email = emailMatch?.[0] || ''

  // Phone
  const phoneMatch = cleanedText.match(/(?:\+?86)?[-\s]?(?:1[3-9]\d{1}\s?\d{4}\s?\d{4})/)
  const phone = phoneMatch?.[0]?.replace(/[\s-]/g, '') || ''

  // Location
  const locMatch = cleanedText.match(/(?:地点|Location|城市|所在)[：:]\s*(.+)/im)
  const location = locMatch?.[1]?.trim() || extractLocationFromLines(lines) || ''

  // Summary — after profile heading or first paragraph
  const summaryLines = cleanedText.match(/^#?\s*(?:个人简介|Summary|关于我|个人概述|自我介绍)[：:]?\s*\n([\s\S]*?)(?=\n#|\n##|\n---|\n工作|\n教育|\n项目|\n技能|$)/im)
  const summary = summaryLines?.[1]?.trim().split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean).join('。') || extractSummaryFromLines(lines) || ''

  // Skills — look for bullet points under skills section
  const skillSection = extractSection(cleanedText, ['技能', 'Skills', '技术栈', '专长', '专业技能'])
  const skills = skillSection
    ? skillSection.split('\n')
        .map(l => l.replace(/^[-*•]\s*/, '').trim())
        .filter(Boolean)
        .flatMap(s => {
          const parts = s.split(/[,，、;\s]+/).map(p => p.trim()).filter(Boolean)
          return parts.map(p => ({
            name: p.replace(/\s*\(\d+%?\)\s*$/, '').trim(),
            level: parseInt(p.match(/\((\d+)/)?.[1] || '') || 70,
            category: categorizeSkill(p)
          }))
        })
    : extractSkillsFromLines(lines)

  // Experience
  const expSection = extractSection(cleanedText, ['工作经历', 'Experience', '工作', '从业经历', '工作经验'])
  const experience = expSection ? parseExperienceBlocks(expSection) : parseExperienceFromLines(lines)

  // Education
  const eduSection = extractSection(cleanedText, ['教育经历', 'Education', '教育', '学历'])
  const education = eduSection ? parseEducationBlocks(eduSection) : parseEducationFromLines(lines)

  // Projects
  const projSection = extractSection(cleanedText, ['项目经历', 'Projects', '项目', '项目经验'])
  const projects = projSection ? parseProjectBlocks(projSection) : parseProjectsFromLines(lines)

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
  const lines = text.split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean)
  const entries: Array<{ name: string; description: string; technologies: string[]; url?: string }> = []
  
  let currentProject: any = null

  for (const line of lines) {
    if (line.length < 3) continue
    
    if (line.match(/^(?:项目名称|项目名|Project|项目)\s*[：:]/i)) {
      if (currentProject) entries.push(currentProject)
      const name = line.replace(/^(?:项目名称|项目名|Project|项目)\s*[：:]/i, '').trim()
      currentProject = { name, description: '', technologies: [], url: '' }
    } else if (line.match(/^(?:技术栈|技术|Tech|Tech Stack|Technology)\s*[：:]/i)) {
      if (currentProject) {
        const techs = line.replace(/^(?:技术栈|技术|Tech|Tech Stack|Technology)\s*[：:]/i, '').trim()
        currentProject.technologies = techs.split(/[,，、;\s]+/).map(t => t.trim()).filter(Boolean)
      }
    } else if (line.match(/^(?:描述|简介|Description|Summary)\s*[：:]/i)) {
      if (currentProject) {
        currentProject.description = line.replace(/^(?:描述|简介|Description|Summary)\s*[：:]/i, '').trim()
      }
    } else if (line.match(/^https?:\/\//i)) {
      if (currentProject) {
        currentProject.url = line.trim()
      }
    } else if (currentProject) {
      if (line.length > 10) {
        currentProject.description += (currentProject.description ? '。' : '') + line
      } else {
        currentProject.technologies.push(line)
      }
    } else {
      const techMatch = line.match(/[（(]([^）)]+)[）)]/)
      const name = line.split(/[,，:：]/)[0]?.trim() || line.slice(0, 20)
      entries.push({
        name,
        description: line.slice(name.length).replace(/^[,，:：\s]+/, '').slice(0, 150) || name,
        technologies: techMatch?.[1]?.split(/[,，、;\s]+/).map(t => t.trim()).filter(Boolean) || [],
      })
    }
  }
  
  if (currentProject) entries.push(currentProject)
  return entries.filter(e => e.name)
}

function cleanResumeText(text: string): string {
  let cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\S\n]{2,}/g, ' ')
    .replace(/^\s+|\s+$/gm, '')
    .replace(/([。！？;])\s*\n/g, '$1\n')
    .replace(/(\d{4}[\s./-]\d{1,2})\s*\n\s*(\d{4}[\s./-]\d{1,2}|至今)/g, '$1 $2')
    .replace(/(\d{4}[\s./-]\d{1,2})\s*\n\s*(至|~)/g, '$1 $2')
  return cleaned
}

function extractNameFromLines(lines: string[]): string {
  for (const line of lines.slice(0, 5)) {
    if (line.length >= 2 && line.length <= 10 && !line.includes('@') && !line.includes('1') && !/^\d/.test(line)) {
      return line
    }
  }
  return ''
}

function extractLocationFromLines(lines: string[]): string {
  const cityNames = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆', '天津', '苏州', '郑州', '长沙', '东莞', '佛山', '宁波', '青岛', '合肥', '无锡']
  for (const line of lines.slice(0, 10)) {
    for (const city of cityNames) {
      if (line.includes(city)) {
        return city
      }
    }
  }
  return ''
}

function extractSummaryFromLines(lines: string[]): string {
  const keywords = ['经验', '负责', '开发', '项目', '能力', '技术', '熟悉', '掌握', '精通']
  const summaryLines: string[] = []
  
  for (let i = 0; i < lines.length && summaryLines.length < 3; i++) {
    const line = lines[i]
    if (line.length > 15 && keywords.some(k => line.includes(k))) {
      summaryLines.push(line)
    }
  }
  
  return summaryLines.join('。') || ''
}

function extractSkillsFromLines(lines: string[]): Array<{ name: string; level: number; category: string }> {
  const skillKeywords = ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'CSS', 'HTML', 'Tailwind', 'Webpack', 'Vite', 'Git', 'Docker', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis']
  const foundSkills: Set<string> = new Set()
  
  for (const line of lines) {
    for (const keyword of skillKeywords) {
      if (line.toLowerCase().includes(keyword.toLowerCase()) && !foundSkills.has(keyword)) {
        foundSkills.add(keyword)
      }
    }
  }
  
  return Array.from(foundSkills).map(name => ({
    name,
    level: 70,
    category: categorizeSkill(name)
  }))
}

function parseExperienceFromLines(lines: string[]): Array<{ company: string; position: string; startDate: string; endDate: string; description: string; highlights: string[] }> {
  const entries: Array<{ company: string; position: string; startDate: string; endDate: string; description: string; highlights: string[] }> = []
  let current: any = null
  
  for (const line of lines) {
    const dateMatch = line.match(/(\d{4}[\s./-]\d{1,2}|\d{4}[年])\s*[~至到-]\s*(\d{4}[\s./-]\d{1,2}|至今|现在|今)/)
    if (dateMatch) {
      if (current) entries.push(current)
      const rest = line.replace(dateMatch[0], '').trim()
      const parts = rest.split(/[\s]+/).filter(Boolean)
      current = {
        company: parts.length > 1 ? parts.slice(0, -1).join(' ') : rest,
        position: parts.length > 1 ? parts[parts.length - 1] : '',
        startDate: dateMatch[1].replace(/[年\s./-]/g, '').slice(0, 7),
        endDate: dateMatch[2].replace(/[年\s./-]/g, '').slice(0, 7),
        description: '',
        highlights: []
      }
    } else if (current && line.length > 5) {
      if (/^[-*•]\s*/.test(line)) {
        current.highlights.push(line.replace(/^[-*•]\s*/, '').trim())
      } else {
        current.description += (current.description ? '。' : '') + line
      }
    }
  }
  if (current) entries.push(current)
  return entries.filter(e => e.company || e.position)
}

function parseProjectsFromLines(lines: string[]): Array<{ name: string; description: string; technologies: string[]; url?: string }> {
  const entries: Array<{ name: string; description: string; technologies: string[]; url?: string }> = []
  const projectKeywords = ['项目', 'Project', '系统', '平台', '工具', '网站', 'App', '应用']
  const techKeywords = ['React', 'Vue', 'Node.js', 'Python', 'Java', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'MySQL', 'MongoDB', 'Docker']
  
  let currentProject: any = null
  
  for (const line of lines) {
    const hasProjectKeyword = projectKeywords.some(k => line.includes(k))
    const hasDate = /\d{4}[\s./-]\d{1,2}/.test(line)
    const isShort = line.length < 20
    
    if (hasProjectKeyword && !hasDate && line.length > 5) {
      if (currentProject) entries.push(currentProject)
      const parts = line.split(/[:：]/)
      currentProject = { 
        name: parts[0]?.trim() || line, 
        description: parts.slice(1).join(':').trim() || '', 
        technologies: [], 
        url: '' 
      }
    } else if (currentProject) {
      if (/^https?:\/\//i.test(line)) {
        currentProject.url = line.trim()
      } else if (techKeywords.some(k => line.toLowerCase().includes(k.toLowerCase())) && isShort) {
        currentProject.technologies.push(line.trim())
      } else if (line.length > 10) {
        currentProject.description += (currentProject.description ? '。' : '') + line.trim()
      }
    }
  }
  
  if (currentProject) entries.push(currentProject)
  return entries.filter(e => e.name && e.name.length > 2)
}

function parseEducationFromLines(lines: string[]): Array<{ school: string; degree: string; field: string; startDate: string; endDate: string }> {
  const entries: Array<{ school: string; degree: string; field: string; startDate: string; endDate: string }> = []
  const degreeKeywords = ['本科', '硕士', '博士', '学士', '研究生', '大专', '高中', 'Bachelor', 'Master', 'PhD']
  
  for (const line of lines) {
    const dateMatch = line.match(/(\d{4}[\s./-]\d{0,2}|\d{4}[年])\s*[~至到-]\s*(\d{4}[\s./-]\d{0,2}|至今|现在)/)
    if (dateMatch) {
      const rest = line.replace(dateMatch[0], '').trim()
      let degree = ''
      for (const kw of degreeKeywords) {
        if (rest.includes(kw)) {
          degree = kw
          break
        }
      }
      const school = rest.replace(degree, '').trim()
      entries.push({
        school,
        degree,
        field: '',
        startDate: dateMatch[1].replace(/[年\s./-]/g, '').slice(0, 7),
        endDate: dateMatch[2].replace(/[年\s./-]/g, '').slice(0, 7)
      })
    }
  }
  return entries.filter(e => e.school)
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
