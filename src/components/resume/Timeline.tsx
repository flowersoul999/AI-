'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { Experience, Education } from '@/lib/types'
import { Briefcase, GraduationCap } from 'lucide-react'

interface TimelineProps {
  experience: Experience[]
  education: Education[]
}

export default function Timeline({ experience, education }: TimelineProps) {
  return (
    <div className="space-y-8">
      {/* Work Experience */}
      <div>
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
          <Briefcase className="h-4 w-4 text-brand" />
          工作经历
        </h2>
        <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-white/40">
          {experience.map((exp, idx) => (
            <motion.div
              key={exp.company + exp.startDate}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-brand bg-white shadow-sm" />
              <div className="card relative !rounded-2xl !p-4 !shadow-none">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">{exp.position}</h3>
                    <p className="text-xs text-secondary">{exp.company}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-white/40 px-2 py-0.5 text-xs text-secondary">
                    {exp.startDate} — {exp.endDate}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-secondary">{exp.description}</p>
                {exp.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-secondary">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand/60" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
          <GraduationCap className="h-4 w-4 text-brand" />
          教育经历
        </h2>
        <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-white/40">
          {education.map((edu, idx) => (
            <motion.div
              key={edu.school + edu.startDate}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-brand-secondary bg-white shadow-sm" />
              <div className="card relative !rounded-2xl !p-4 !shadow-none">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">{edu.field}</h3>
                    <p className="text-xs text-secondary">{edu.school} · {edu.degree}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-white/40 px-2 py-0.5 text-xs text-secondary">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

