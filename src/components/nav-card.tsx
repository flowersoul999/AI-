'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { FileText, FolderGit2, Mail, History, Mic } from 'lucide-react'

const navItems = [
  { icon: FileText, label: '简历', href: '/resume' },
  { icon: FolderGit2, label: '项目', href: '/projects' },
  { icon: Mail, label: '联系', href: '/contact' },
  { icon: History, label: '历史', href: '/history' },
  { icon: Mic, label: '面试', href: '/interview' }
]

export default function NavCard() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1.5 rounded-2xl border bg-white/60 px-3 py-2 backdrop-blur-xl shadow-sm">
        {navItems.map(item => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-white/60'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
