'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { fetchResume } from '@/lib/resume-store'
import type { Resume } from '@/lib/types'
import ResumeProjectCard from '@/components/resume/ResumeProjectCard'

export default function ProjectsPage() {
  const [resume, setResume] = useState<Resume | null>(null)

  useEffect(() => {
    fetchResume().then(setResume).catch(() => {})
  }, [])

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-32 pb-12" style={{ minHeight: '60vh' }}>
        <div className="text-secondary">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-6 pt-32 pb-12 max-sm:px-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-bold">项目经历</h1>
        <p className="text-secondary mt-2 text-lg">{resume.personal.name} 的部分开源和业余项目</p>
      </motion.div>

      <div className="grid w-full max-w-[900px] grid-cols-2 gap-6 max-md:grid-cols-1">
        {resume.projects.map((project, i) => (
          <ResumeProjectCard key={project.name} project={project} index={i} />
        ))}
      </div>
    </div>
  )
}
