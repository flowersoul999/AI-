export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  avatar: string
}

export interface Skill {
  name: string
  level: number
  category: string
}

export interface Experience {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  highlights: string[]
}

export interface Education {
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
}

export interface Project {
  name: string
  description: string
  technologies: string[]
  url?: string
  image?: string
}

export interface Contact {
  email: string
  github?: string
  linkedin?: string
  twitter?: string
  website?: string
}

export interface Resume {
  personal: PersonalInfo
  summary: string
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  projects: Project[]
  contact: Contact
  resumeImage?: string
}
