'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { fetchResume } from '@/lib/resume-store'
import type { Resume } from '@/lib/types'
import ContactInfo from '@/components/resume/ContactInfo'

export default function ContactPage() {
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

  return <ContactInfo resume={resume} />
}
