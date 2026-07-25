'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { fetchResume } from '@/lib/resume-store'
import type { Resume } from '@/lib/types'
import { Briefcase, MapPin } from 'lucide-react'
import Timeline from '@/components/resume/Timeline'
import SkillRadar from '@/components/resume/SkillRadar'
import FileUpload from '@/components/resume/FileUpload'
import ChatInterface from '@/components/resume/ChatInterface'
import QuickQuestions from '@/components/resume/QuickQuestions'
import type { ChatInterfaceHandle } from '@/components/resume/ChatInterface'

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const chatRef = useRef<ChatInterfaceHandle>(null)

  const loadResume = () => {
    setLoading(true)
    fetchResume()
      .then(data => { setResume(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadResume() }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-32 pb-12" style={{ minHeight: '60vh' }}>
        <div className="text-secondary">加载中...</div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-32 pb-12" style={{ minHeight: '60vh' }}>
        <div className="text-secondary">无法加载简历数据</div>
      </div>
    )
  }

  const { personal, summary, skills, experience, education } = resume

  return (
    <>
      {/* Upload Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-4 right-6 z-10 max-sm:hidden"
      >
        <FileUpload onUploadSuccess={data => setResume(data)} />
      </motion.div>

      <div className="flex flex-col items-center px-6 pt-32 pb-12 max-sm:px-3">
        {/* Three-Column Grid */}
        <div className="grid w-full max-w-[1400px] grid-cols-[1.5fr_3fr_1.5fr] gap-6 max-lg:grid-cols-1">
          
          {/* ===== LEFT COLUMN: Profile + Timeline ===== */}
          <div className="flex flex-col gap-6 max-lg:order-2" style={{ height: "calc(100vh - 200px)" }}>
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="card relative shrink-0"
            >
              <div className="flex items-start gap-4 max-sm:flex-col max-sm:items-center">
                <div className="shrink-0">
                  <div 
                    className="h-[72px] w-[72px] overflow-hidden rounded-full cursor-pointer hover:opacity-80 transition-opacity" 
                    style={{ boxShadow: '0 16px 32px -5px #E2D9CE' }}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    {personal.avatar ? (
                      <img src={personal.avatar} alt={personal.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">上传头像</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const avatarData = event.target?.result as string
                          setResume({ ...resume, personal: { ...personal, avatar: avatarData } })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </div>
                <div className="flex-1 max-sm:text-center">
                  <h1 className="font-averia text-linear text-2xl">{personal.name}</h1>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card relative min-h-0 flex-1 overflow-y-auto scrollbar-none"        >
              <Timeline experience={experience} education={education} resumeImage={resume.resumeImage} />
            </motion.div>
          </div>

          {/* ===== MIDDLE COLUMN: AI Chat (Main Focus) ===== */}
          <div className="max-lg:order-1">
            <ChatInterface ref={chatRef} resume={resume} />
          </div>

          {/* ===== RIGHT COLUMN: Skill Radar + Quick Questions ===== */}
          <div className="space-y-6 max-lg:order-3">
            {/* Skill Radar */}
            <SkillRadar skills={skills} />

            {/* Quick Questions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card relative shrink-0"
            >
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <SparklesIcon />
                快捷提问
              </h3>
              <QuickQuestions onSelect={q => chatRef.current?.sendMessage(q)} />
            </motion.div>
          </div>

        </div>
      </div>
    </>
  )
}

function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
      <path d="M12 3l1.4 4.6 4.6 1.4-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3z" />
      <path d="M18 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z" />
      <path d="M6 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z" />
    </svg>
  )
}


