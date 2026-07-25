'use client'

import { motion } from 'motion/react'
import { ExternalLink, Github } from 'lucide-react'
import type { Project } from '@/lib/types'

interface ResumeProjectCardProps {
  project: Project
  index: number
}

const projectIcons = ['🎨', '⚡', '🤖', '📊', '🛠️', '🎮', '📱', '🔧']

export default function ResumeProjectCard({ project, index }: ResumeProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className="card relative flex flex-col gap-4"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/40 text-2xl backdrop-blur-sm">
          {projectIcons[index % projectIcons.length]}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold">{project.name}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.technologies.map(tech => (
              <span key={tech} className="bg-card rounded-lg px-2 py-0.5 text-xs text-secondary">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-secondary text-sm leading-relaxed">{project.description}</p>

      {project.url && (
        <div className="flex gap-2">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card hover:bg-bg flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            访问
          </a>
          {project.url.includes('github') && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card hover:bg-bg flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              源码
            </a>
          )}
        </div>
      )}
    </motion.div>
  )
}
