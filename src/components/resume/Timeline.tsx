'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import type { Experience, Education } from '@/lib/types'
import { Briefcase, GraduationCap, Image, FileText, X, ZoomIn } from 'lucide-react'
import { createPortal } from 'react-dom'

interface TimelineProps {
  experience: Experience[]
  education: Education[]
  resumeImage?: string
}

export default function Timeline({ experience, education, resumeImage }: TimelineProps) {
  const [showImage, setShowImage] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)

  const handleToggle = () => {
    if (resumeImage) {
      setShowImage(!showImage)
    }
  }

  useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showLightbox])

  const renderContent = () => {
    if (showImage && resumeImage) {
      const isPdf = resumeImage.startsWith('data:application/pdf')
      
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between shrink-0 mb-3">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Image className="h-4 w-4 text-brand" />
              简历预览
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLightbox(true)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-secondary hover:bg-white/40 transition-colors"
                title="放大查看"
              >
                <ZoomIn className="h-3 w-3" />
                放大
              </button>
              <button
                onClick={handleToggle}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-secondary hover:bg-white/40 transition-colors"
                title="切换回文本视图"
              >
                <FileText className="h-3 w-3" />
                文本视图
              </button>
            </div>
          </div>
          <div 
            className="relative cursor-pointer overflow-hidden bg-white flex-1" 
            onClick={() => setShowLightbox(true)}
            title="点击放大"
            style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}
          >
            {isPdf ? (
              <embed
                src={`${resumeImage}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`}
                type="application/pdf"
                className="w-full h-full border-0 outline-none"
                title="简历 PDF"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            ) : (
              <img
                src={resumeImage}
                alt="简历图片"
                className="w-full h-full object-contain"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Briefcase className="h-4 w-4 text-brand" />
              工作经历
            </h2>
            {resumeImage && (
              <button
                onClick={handleToggle}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-secondary hover:bg-white/40 transition-colors"
                title="切换到图片视图"
              >
                <Image className="h-3 w-3" />
                图片视图
              </button>
            )}
          </div>
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

  const renderLightbox = () => {
    if (!showLightbox || !resumeImage) return null

    const isPdf = resumeImage.startsWith('data:application/pdf')

    return createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-white"
          onClick={() => setShowLightbox(false)}
        >
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLightbox(false)}
            className="fixed top-4 right-4 z-[10000] p-3 bg-gray-100 hover:bg-gray-200 rounded-full shadow-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-700" />
          </motion.button>
          <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
            {isPdf ? (
              <embed
                src={`${resumeImage}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                className="w-full h-full border-0 outline-none"
                title="简历 PDF"
              />
            ) : (
              <img
                src={resumeImage}
                alt="简历图片"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    )
  }

  return (
    <>
      {renderContent()}
      {renderLightbox()}
    </>
  )
}
