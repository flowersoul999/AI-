'use client'

import { motion } from 'motion/react'
import { Mail, Globe, MapPin, ExternalLink } from 'lucide-react'
import type { Resume } from '@/lib/types'
import GithubSVG from '@/svgs/github.svg'

interface ContactInfoProps {
  resume: Resume
}

export default function ContactInfo({ resume }: ContactInfoProps) {
  const { personal, contact } = resume

  const links = [
    { icon: <Mail className="h-5 w-5" />, label: '邮箱', value: contact.email, href: `mailto:${contact.email}`, color: 'text-brand' },
    { icon: <GithubSVG className="h-5 w-5" />, label: 'GitHub', value: contact.github?.replace('https://github.com/', ''), href: contact.github, color: '' },
    { icon: <ExternalLink className="h-5 w-5" />, label: 'LinkedIn', value: contact.linkedin?.replace('https://linkedin.com/in/', ''), href: contact.linkedin, color: 'text-blue-500' },
    { icon: <Globe className="h-5 w-5" />, label: '网站', value: contact.website?.replace('https://', ''), href: contact.website, color: 'text-brand-secondary' },
  ].filter(l => l.value)

  return (
    <div className="flex flex-col items-center px-6 pt-32 pb-12 max-sm:px-3">
      <div className="w-full max-w-[600px] space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold">联系方式</h1>
          <p className="text-secondary mt-2 text-lg">与我取得联系</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card relative flex flex-col items-center text-center"
        >
          <div className="h-[80px] w-[80px] overflow-hidden rounded-full" style={{ boxShadow: '0 12px 24px -5px #E2D9CE' }}>
            <img src={personal.avatar} alt={personal.name} className="h-full w-full object-cover" />
          </div>
          <h2 className="font-averia mt-3 text-xl font-medium">{personal.name}</h2>
          <p className="text-secondary text-sm">{personal.title}</p>
          <p className="text-secondary mt-1 flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            {personal.location}
          </p>
        </motion.div>

        {/* Contact Links */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card relative space-y-3"
        >
          {links.map((link, idx) => (
            <motion.a
              key={link.label}
              href={link.href || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              className="flex items-center gap-4 rounded-2xl border bg-white/40 p-4 backdrop-blur-sm transition-colors hover:bg-white/80"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/60 ${link.color}`}>
                {link.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs text-secondary">{link.label}</p>
                <p className="text-sm font-medium">{link.value}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-secondary/50" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
