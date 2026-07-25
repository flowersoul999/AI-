'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import type { Skill } from '@/lib/types'

interface SkillRadarProps {
  skills: Skill[]
}

export default function SkillRadar({ skills }: SkillRadarProps) {
  // Group by category and pick top skill from each category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  const chartData = Object.entries(grouped)
    .map(([_, categorySkills]) => {
      const top = categorySkills.sort((a, b) => b.level - a.level)[0]
      return { name: top.name, level: top.level }
    })
    .sort((a, b) => b.level - a.level)
    .slice(0, 6)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card relative"
    >
      <h2 className="mb-2 flex items-center gap-2 text-base font-semibold">
        <Sparkles className="h-4 w-4 text-brand" />
        技能雷达
      </h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.3)" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: 'var(--color-secondary)', fontSize: 11 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="技能"
              dataKey="level"
              stroke="var(--color-brand)"
              strokeWidth={2}
              fill="var(--color-brand)"
              fillOpacity={0.25}
              animationBegin={300}
              animationDuration={1000}
            />
            <Radar
              name="参考"
              dataKey="level"
              stroke="var(--color-brand-secondary)"
              strokeWidth={1}
              fill="var(--color-brand-secondary)"
              fillOpacity={0.1}
              animationBegin={600}
              animationDuration={800}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
